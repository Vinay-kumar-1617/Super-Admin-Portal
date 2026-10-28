import { useCallback, useState } from 'react'
import {
  auditLog as seedAudit,
  commissionHistory,
  commissionRates,
  invoices as seedInvoices,
  payouts as seedPayouts,
  reconItems as seedReconItems,
  reconPeriods as seedReconPeriods,
  refunds as seedRefunds,
  settlementRuns,
  type AuditEntry,
  type CommissionChange,
  type CommissionRate,
  type CommissionScope,
  type Invoice,
  type Payout,
  type ReconItem,
  type ReconPeriod,
  type Refund,
  type Settlement,
  type SettlementCadence,
  type SettlementStatus,
  type SectionId,
} from './financeAdminData'
import {
  approvalLimits,
  approveFinanceRequest,
  financeApprovalRequests,
  formatApprovalAmount,
  rejectFinanceRequest,
  type ApprovalCategory,
  type ApprovalStatus,
  type FinanceApprovalRequest,
} from './financeApprovalData'
import {
  approveOwnerSettlement,
  canApproveOwnerSettlement,
  markOwnerSettlementPaid,
  ownerSettlementSeeds,
  rejectOwnerSettlement,
  type OwnerPayoutMethod,
  type OwnerSettlement,
} from './ownerSettlementData'
import {
  approveOperatorPayment,
  markOperatorPaymentPaid,
  operatorPaymentSeeds,
  rejectOperatorPayment,
  updateOperatorPaymentMethod,
  type OperatorPayment,
  type OperatorPaymentMethod,
} from './operatorPaymentData'
import {
  customerPaymentSeeds,
  recordCustomerPayment,
  recordCustomerReminder,
  type CustomerPaymentMethod,
  type CustomerPaymentProfile,
} from './customerPaymentData'
import {
  collectFinanceInvoicePayment,
  createFinanceInvoice,
  editFinanceInvoice,
  financeInvoiceSeeds,
  issueFinanceInvoice,
  type FinanceInvoice,
  type FinanceInvoiceDraft,
} from './financeInvoiceData'

const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ')
const makeId = (prefix: string) => `${prefix}-${Date.now()}`

const payoutStatusFromApproval = (status: ApprovalStatus): Payout['status'] | null => {
  switch (status) {
    case 'Pending':
    case 'Awaiting second approval':
    case 'Approved':
    case 'Paid':
    case 'Failed':
    case 'Rejected':
      return status
    case 'On hold':
      return 'Held'
    case 'Processed':
      return null
  }
}

const refundStatusFromApproval = (status: ApprovalStatus): Refund['status'] | null => {
  switch (status) {
    case 'Pending':
    case 'Approved':
    case 'Processed':
    case 'Rejected':
      return status
    default:
      return null
  }
}

export function useFinanceAdmin() {
  const [rates, setRates] = useState<CommissionRate[]>(commissionRates)
  const [changes, setChanges] = useState<CommissionChange[]>(commissionHistory)
  const [settlements, setSettlements] = useState<Settlement[]>(settlementRuns)
  const [payoutList, setPayoutList] = useState<Payout[]>(seedPayouts)
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(seedInvoices)
  const [financeInvoiceList, setFinanceInvoiceList] = useState<FinanceInvoice[]>(financeInvoiceSeeds)
  const [refundList, setRefundList] = useState<Refund[]>(seedRefunds)
  const [reconList, setReconList] = useState<ReconItem[]>(seedReconItems)
  const [periodList, setPeriodList] = useState<ReconPeriod[]>(seedReconPeriods)
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit)
  const [approvalRequests, setApprovalRequests] = useState<FinanceApprovalRequest[]>(financeApprovalRequests)
  const [ownerSettlements, setOwnerSettlements] = useState<OwnerSettlement[]>(ownerSettlementSeeds)
  const [operatorPayments, setOperatorPayments] = useState<OperatorPayment[]>(operatorPaymentSeeds)
  const [customerPayments, setCustomerPayments] = useState<CustomerPaymentProfile[]>(customerPaymentSeeds)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2600)
  }, [])

  const log = useCallback((action: string, area: SectionId, detail: string, actor = 'Rohit Menon') => {
    setAudit((prev) => [{ id: makeId('au'), time: stamp(), actor, action, area, detail }, ...prev])
  }, [])

  // ---- Commission -----------------------------------------------------------
  const updateRate = useCallback(
    (id: string, rate: number) => {
      const target = rates.find((item) => item.id === id)
      if (!target) return
      const nextRate = Math.min(rate, target.cap)
      const clamped = nextRate !== rate
      setRates((prev) =>
        prev.map((item) => (item.id === id ? { ...item, rate: nextRate, updatedAt: stamp(), effectiveFrom: stamp().slice(0, 10) } : item)),
      )
      setChanges((prev) => [
        {
          id: makeId('ch'),
          scope: target.scope,
          name: target.name,
          oldRate: target.rate,
          newRate: nextRate,
          effectiveDate: stamp().slice(0, 10),
          changedBy: 'Rohit Menon',
          changedAt: stamp(),
          note: 'Updated from dashboard',
        },
        ...prev,
      ])
      log('Commission updated', 'commission', `${target.name} · ${target.rate}% → ${nextRate}%`)
      showToast(clamped ? `${target.name} capped at ${target.cap}%` : `${target.name} commission set to ${nextRate}%`)
    },
    [rates, log, showToast],
  )

  const scheduleRate = useCallback(
    (scope: CommissionScope, name: string, rate: number, effectiveFrom: string) => {
      const cap = scope === 'Vehicle Type' ? 18 : 15
      const nextRate = Math.min(rate, cap)
      setRates((prev) => [
        {
          id: makeId('cm'),
          scope,
          name,
          rate: nextRate,
          cap,
          effectiveFrom,
          status: 'Scheduled',
          updatedBy: 'Rohit Menon',
          updatedAt: stamp(),
        },
        ...prev,
      ])
      setChanges((prev) => [
        {
          id: makeId('ch'),
          scope,
          name,
          oldRate: nextRate,
          newRate: nextRate,
          effectiveDate: effectiveFrom,
          changedBy: 'Rohit Menon',
          changedAt: stamp(),
          note: 'Scheduled change',
        },
        ...prev,
      ])
      log('Commission scheduled', 'commission', `${name} · ${nextRate}% effective ${effectiveFrom}`)
      showToast(`${name} commission scheduled for ${effectiveFrom}`)
    },
    [log, showToast],
  )

  // ---- Settlements ----------------------------------------------------------
  const setSettlementStatus = useCallback(
    (id: string, status: SettlementStatus, message: string, action: string) => {
      setSettlements((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
      log(action, 'settlements', `${id} · ${message}`)
      showToast(`${id} ${message}`)
    },
    [log, showToast],
  )

  const runSettlement = useCallback(
    (cadence: SettlementCadence, period: string) => {
      const id = `ST-${cadence === 'Daily' ? 'D' : cadence === 'Weekly' ? 'W' : 'M'}${Date.now().toString().slice(-4)}`
      const fresh: Settlement = {
        id,
        period,
        cadence,
        status: 'Draft',
        bookings: 0,
        gross: '₹0',
        commission: '₹0',
        adjustments: '₹0',
        net: '₹0',
        payout: '₹0',
        runAt: stamp(),
        runBy: 'Rohit Menon',
        lines: [],
      }
      setSettlements((prev) => [fresh, ...prev])
      log('Settlement run', 'settlements', `${id} · ${cadence} · ${period}`)
      showToast(`${id} draft created for ${period}`)
    },
    [log, showToast],
  )

  const finalizeSettlement = useCallback((id: string) => setSettlementStatus(id, 'Finalized', 'finalized', 'Settlement finalised'), [setSettlementStatus])
  const correctSettlement = useCallback((id: string) => setSettlementStatus(id, 'Corrected', 'corrected', 'Settlement corrected'), [setSettlementStatus])
  const rerunSettlement = useCallback((id: string) => setSettlementStatus(id, 'Review', 're-run queued', 'Settlement re-run'), [setSettlementStatus])

  const updateSettlementAdjustment = useCallback(
    (settlementId: string, lineId: string, adjustment: string, note: string) => {
      setSettlements((prev) =>
        prev.map((item) =>
          item.id === settlementId
            ? { ...item, lines: item.lines.map((line) => (line.id === lineId ? { ...line, adjustment, note } : line)) }
            : item,
        ),
      )
      log('Adjustment recorded', 'settlements', `${settlementId} · ${lineId} · ${adjustment}`)
      showToast(`Adjustment saved for ${lineId}`)
    },
    [log, showToast],
  )

  // ---- Payouts --------------------------------------------------------------
  const updatePayout = useCallback(
    (id: string, patch: Partial<Payout>, message: string, action: string) => {
      setPayoutList((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
      if (patch.status) {
        const status: ApprovalStatus = patch.status === 'Held' ? 'On hold' : patch.status
        setApprovalRequests((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  rejectionReason: patch.status === 'Rejected' ? patch.reason : item.rejectionReason,
                }
              : item,
          ),
        )
      }
      log(action, 'payouts', `${id} · ${message}`)
      showToast(`${id} ${message}`)
    },
    [log, showToast],
  )

  const approvePayout = useCallback(
    (id: string) => {
      const target = payoutList.find((item) => item.id === id)
      if (!target) return
      if (target.aboveLimit) {
        updatePayout(id, { status: 'Awaiting second approval', reason: 'Sent for second approval (four-eyes)' }, 'sent for second approval', 'Payout escalated')
      } else {
        updatePayout(id, { status: 'Approved', reason: '' }, 'approved', 'Payout approved')
      }
    },
    [payoutList, updatePayout],
  )

  const secondApproval = useCallback(
    (id: string) => updatePayout(id, { status: 'Approved', reason: 'Second approval captured' }, 'approved (second approval)', 'Payout approved'),
    [updatePayout],
  )
  const holdPayout = useCallback(
    (id: string, reason: string) => updatePayout(id, { status: 'Held', reason: reason || 'No reason provided' }, 'held', 'Payout held'),
    [updatePayout],
  )
  const releasePayout = useCallback(
    (id: string) => updatePayout(id, { status: 'Pending', reason: 'Returned to approval queue' }, 'returned to approval queue', 'Payout released'),
    [updatePayout],
  )
  const rejectPayout = useCallback(
    (id: string, reason: string) => updatePayout(id, { status: 'Rejected', reason: reason || 'No reason provided' }, 'rejected', 'Payout rejected'),
    [updatePayout],
  )
  const retryPayout = useCallback(
    (id: string) => updatePayout(id, { status: 'Pending', reason: 'Retry queued' }, 'retry queued', 'Payout retried'),
    [updatePayout],
  )

  // ---- Invoices -------------------------------------------------------------
  const resendInvoice = useCallback(
    (id: string) => {
      setInvoiceList((prev) => prev.map((item) => (item.id === id && item.status === 'Draft' ? { ...item, status: 'Sent' } : item)))
      log('Statement resent', 'invoices', id)
      showToast(`${id} resent to the party`)
    },
    [log, showToast],
  )

  const downloadInvoice = useCallback(
    (id: string) => {
      log('Document downloaded', 'invoices', id)
      showToast(`Download started for ${id}`)
    },
    [log, showToast],
  )

  const createInvoiceDraft = useCallback(
    (draft: FinanceInvoiceDraft): string | null => {
      const id = `INV-${Date.now().toString().slice(-8)}`
      const at = stamp()
      const invoice = createFinanceInvoice(draft, id, at)
      if (!invoice) {
        showToast('Enter a customer, booking, valid dates, non-negative charges, and a positive invoice total')
        return null
      }
      setFinanceInvoiceList((prev) => [invoice, ...prev])
      log('Invoice draft created', 'invoices', `${id} · ${invoice.customer} · ₹${(invoice.rentalCharges + invoice.fuel + invoice.transportation + invoice.overtime + invoice.tax - invoice.discount + invoice.penalties + invoice.deposits).toLocaleString('en-IN')}`)
      showToast(`${id} draft saved`)
      return id
    },
    [log, showToast],
  )

  const editInvoiceDraft = useCallback(
    (id: string, draft: FinanceInvoiceDraft): boolean => {
      const target = financeInvoiceList.find((invoice) => invoice.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return false
      }
      const updated = editFinanceInvoice(target, draft, stamp())
      if (!updated) {
        showToast('Only draft invoices can be edited; check the invoice details and total')
        return false
      }
      setFinanceInvoiceList((prev) => prev.map((invoice) => invoice.id === id ? updated : invoice))
      log('Invoice draft updated', 'invoices', `${id} · ${updated.customer}`)
      showToast(`${id} draft updated`)
      return true
    },
    [financeInvoiceList, log, showToast],
  )

  const issueInvoice = useCallback(
    (id: string) => {
      const target = financeInvoiceList.find((invoice) => invoice.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return
      }
      const updated = issueFinanceInvoice(target, stamp())
      if (!updated) {
        showToast(`${id} cannot be issued; save a valid invoice draft first`)
        return
      }
      setFinanceInvoiceList((prev) => prev.map((invoice) => invoice.id === id ? updated : invoice))
      setInvoiceList((prev) => [
        { id, kind: 'Customer invoice', party: updated.customer, related: updated.bookingId, amount: `₹${(updated.rentalCharges + updated.fuel + updated.transportation + updated.overtime + updated.tax - updated.discount + updated.penalties + updated.deposits).toLocaleString('en-IN')}`, issued: updated.issuedAt, due: updated.dueAt, status: 'Sent' },
        ...prev.filter((invoice) => invoice.id !== id),
      ])
      log('Invoice issued', 'invoices', `${id} · ${updated.customer} · due ${updated.dueAt}`)
      showToast(`${id} issued`)
    },
    [financeInvoiceList, log, showToast],
  )

  const collectInvoicePayment = useCallback(
    (id: string, amount: number, reference: string): boolean => {
      const target = financeInvoiceList.find((invoice) => invoice.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return false
      }
      const updated = collectFinanceInvoicePayment(target, amount, reference, stamp())
      if (!updated) {
        showToast('Enter a valid collection amount within the invoice balance and a transaction reference')
        return false
      }
      setFinanceInvoiceList((prev) => prev.map((invoice) => invoice.id === id ? updated : invoice))
      setInvoiceList((prev) => prev.map((invoice) => invoice.id === id ? { ...invoice, status: updated.status === 'Paid' ? 'Paid' : updated.status === 'Overdue' ? 'Overdue' : 'Sent' } : invoice))
      log('Invoice payment recorded', 'invoices', `${id} · ₹${amount.toLocaleString('en-IN')} · ${reference}`)
      showToast(`${id} payment recorded`)
      return true
    },
    [financeInvoiceList, log, showToast],
  )

  // ---- Refunds --------------------------------------------------------------
  const updateRefund = useCallback(
    (id: string, status: Refund['status'], message: string, action: string) => {
      setRefundList((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
      log(action, 'refunds', `${id} · ${message}`)
      showToast(`${id} ${message}`)
    },
    [log, showToast],
  )

  const approveRefund = useCallback((id: string) => updateRefund(id, 'Approved', 'approved', 'Refund approved'), [updateRefund])
  const rejectRefund = useCallback((id: string) => updateRefund(id, 'Rejected', 'rejected', 'Refund rejected'), [updateRefund])
  const processRefund = useCallback(
    (id: string) => {
      updateRefund(id, 'Processed', 'processed to customer', 'Refund processed')
      setApprovalRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Processed' } : item)))
      log('Refund processed', 'approvals', `${id} · customer refund completed`)
    },
    [log, updateRefund],
  )

  // ---- Approval center ------------------------------------------------------
  const syncLegacyApprovalStatus = useCallback((request: FinanceApprovalRequest) => {
    if (request.legacyType === 'payout') {
      const status = payoutStatusFromApproval(request.status)
      if (status) {
        const reason =
          request.status === 'Awaiting second approval'
            ? `First approval by ${request.firstApprover ?? 'finance reviewer'} · awaiting second approval`
            : request.status === 'Rejected'
              ? request.rejectionReason ?? 'Rejected in approval center'
              : request.status === 'Approved'
                ? ''
                : undefined
        setPayoutList((prev) =>
          prev.map((item) => (item.id === request.id ? { ...item, status, ...(reason === undefined ? {} : { reason }) } : item)),
        )
      }
    }
    if (request.legacyType === 'refund') {
      const status = refundStatusFromApproval(request.status)
      if (status) {
        setRefundList((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status,
                  ...(request.status === 'Rejected' && request.rejectionReason
                    ? { decision: `Rejected: ${request.rejectionReason} · ${item.decision}` }
                    : {}),
                }
              : item,
          ),
        )
      }
    }
  }, [])

  const approveFinanceRequestAction = useCallback(
    (id: string, approver: string) => {
      const request = approvalRequests.find((item) => item.id === id)
      if (!request) {
        showToast(`${id} is no longer available for approval`)
        return
      }
      const timestamp = stamp()
      const updated = approveFinanceRequest(request, approver, timestamp)
      if (!updated) {
        showToast(`Approval not allowed for ${id}; check maker-checker requirements`)
        return
      }
      setApprovalRequests((prev) => prev.map((item) => (item.id === id ? updated : item)))
      syncLegacyApprovalStatus(updated)
      const firstStage = updated.status === 'Awaiting second approval'
      const action = firstStage ? 'First approval recorded' : 'Request approved'
      log(action, 'approvals', `${id} · ${request.category} · ${request.amount}${firstStage ? ' · second approval required' : ''}`, approver)
      showToast(firstStage ? `${id} awaits a second approver` : `${id} approved`)
    },
    [approvalRequests, log, showToast, syncLegacyApprovalStatus],
  )

  const rejectFinanceRequestAction = useCallback(
    (id: string, approver: string, reason: string) => {
      const request = approvalRequests.find((item) => item.id === id)
      if (!request) {
        showToast(`${id} is no longer available for rejection`)
        return
      }
      const timestamp = stamp()
      const updated = rejectFinanceRequest(request, approver, reason, timestamp)
      if (!updated) {
        showToast(`Rejection for ${id} needs a reason and a different approver`)
        return
      }
      setApprovalRequests((prev) => prev.map((item) => (item.id === id ? updated : item)))
      syncLegacyApprovalStatus(updated)
      log('Request rejected', 'approvals', `${id} · ${request.category} · ${request.amount} · ${updated.rejectionReason}`, approver)
      showToast(`${id} rejected`)
    },
    [approvalRequests, log, showToast, syncLegacyApprovalStatus],
  )

  const createFinanceApprovalRequest = useCallback(
    (category: ApprovalCategory, subject: string, amount: number, description: string, requestedBy: string) => {
      const cleanSubject = subject.trim()
      const cleanDescription = description.trim()
      if (!cleanSubject || !cleanDescription || !Number.isFinite(amount) || amount <= 0 || !requestedBy.trim()) {
        showToast('Enter a requester, description, and a valid amount')
        return
      }
      const id = makeId(category === 'Expense claim' ? 'EXP' : category === 'Manual adjustment' ? 'ADJ' : category === 'Discount' ? 'DSC' : 'REQ')
      const timestamp = stamp()
      const request: FinanceApprovalRequest = {
        id,
        category,
        subject: cleanSubject,
        requestedBy: requestedBy.trim(),
        requestedAt: timestamp,
        amount: formatApprovalAmount(amount),
        numericAmount: amount,
        approvalLimit: approvalLimits[category],
        description: cleanDescription,
        status: 'Pending',
      }
      setApprovalRequests((prev) => [request, ...prev])
      log('Approval request created', 'approvals', `${id} · ${category} · ${request.amount} · maker ${request.requestedBy}`, requestedBy.trim())
      showToast(`${id} submitted for approval`)
    },
    [log, showToast],
  )

  // ---- Reconciliation -------------------------------------------------------
  const investigateRecon = useCallback(
    (id: string, note: string) => {
      setReconList((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Investigating', note: note || 'Under investigation' } : item)))
      log('Mismatch flagged', 'reconciliation', `${id} · ${note || 'under investigation'}`)
      showToast(`${id} marked for investigation`)
    },
    [log, showToast],
  )

  const resolveRecon = useCallback(
    (id: string) => {
      setReconList((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Matched', variance: '₹0', note: 'Resolved and matched' } : item)))
      log('Mismatch resolved', 'reconciliation', id)
      showToast(`${id} resolved`)
    },
    [log, showToast],
  )

  const closePeriod = useCallback(
    (id: string) => {
      setPeriodList((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Closed', closedAt: stamp().slice(0, 10) } : item)))
      log('Period closed', 'reconciliation', id)
      showToast(`${id} closed and balanced`)
    },
    [log, showToast],
  )

  // ---- Owner settlements ----------------------------------------------------
  const approveOwnerSettlementAction = useCallback(
    (id: string, approver: string) => {
      const target = ownerSettlements.find((item) => item.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return
      }
      const error = canApproveOwnerSettlement(target, approver)
      if (error) {
        showToast(error)
        return
      }
      const at = stamp()
      const updated = approveOwnerSettlement(target, approver, at)
      if (!updated) {
        showToast(`Could not approve ${id}`)
        return
      }
      setOwnerSettlements((prev) => prev.map((item) => item.id === id ? updated : item))
      log('Owner settlement approved', 'owner-settlements', `${id} · ${updated.owner} · ₹${updated.netPayable.toLocaleString('en-IN')}`, approver)
      showToast(`${id} approved`)
    },
    [ownerSettlements, log, showToast],
  )

  const rejectOwnerSettlementAction = useCallback(
    (id: string, approver: string, reason: string) => {
      const target = ownerSettlements.find((item) => item.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return
      }
      const at = stamp()
      const updated = rejectOwnerSettlement(target, approver, reason, at)
      if (!updated) {
        showToast(`A rejection reason and an independent approver are required for ${id}`)
        return
      }
      setOwnerSettlements((prev) => prev.map((item) => item.id === id ? updated : item))
      log('Owner settlement rejected', 'owner-settlements', `${id} · ${updated.owner} · ${updated.rejectionReason}`, approver)
      showToast(`${id} rejected`)
    },
    [ownerSettlements, log, showToast],
  )

  const payOwnerSettlement = useCallback(
    (id: string, reference: string) => {
      const target = ownerSettlements.find((item) => item.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return
      }
      const at = stamp()
      const updated = markOwnerSettlementPaid(target, 'Payment Operations', reference, at)
      if (!updated) {
        showToast(`An approved settlement and payment reference are required for ${id}`)
        return
      }
      setOwnerSettlements((prev) => prev.map((item) => item.id === id ? updated : item))
      log('Owner payout completed', 'owner-settlements', `${id} · ${updated.payoutMethod} · ${updated.paymentReference}`, 'Payment Operations')
      showToast(`${id} marked paid`)
    },
    [ownerSettlements, log, showToast],
  )

  const updateOwnerPayoutMethod = useCallback(
    (id: string, method: OwnerPayoutMethod) => {
      const target = ownerSettlements.find((item) => item.id === id)
      if (!target || target.status === 'Paid') {
        showToast(`Payout method for ${id} cannot be changed`)
        return
      }
      const at = stamp()
      const updated = {
        ...target,
        payoutMethod: method,
        history: [...target.history, { at, actor: 'Rohit Menon', action: 'Payout method updated', detail: `Payout method changed to ${method}.` }],
      }
      setOwnerSettlements((prev) => prev.map((item) => item.id === id ? updated : item))
      log('Owner payout method updated', 'owner-settlements', `${id} · ${target.payoutMethod} → ${method}`)
      showToast(`${id} payout method set to ${method}`)
    },
    [ownerSettlements, log, showToast],
  )

  // ---- Operator payments ----------------------------------------------------
  const approveOperatorPaymentAction = useCallback(
    (id: string, approver: string) => {
      const target = operatorPayments.find((item) => item.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return
      }
      const updated = approveOperatorPayment(target, approver, stamp())
      if (!updated) {
        showToast(`An independent approver is required for ${id}`)
        return
      }
      setOperatorPayments((prev) => prev.map((item) => item.id === id ? updated : item))
      log('Operator payment approved', 'operator-payments', `${id} · ${updated.operator} · ₹${updated.netWages.toLocaleString('en-IN')}`, approver)
      showToast(`${id} approved for payout`)
    },
    [operatorPayments, log, showToast],
  )

  const rejectOperatorPaymentAction = useCallback(
    (id: string, approver: string, reason: string) => {
      const target = operatorPayments.find((item) => item.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return
      }
      const updated = rejectOperatorPayment(target, approver, reason, stamp())
      if (!updated) {
        showToast(`A rejection reason and an independent approver are required for ${id}`)
        return
      }
      setOperatorPayments((prev) => prev.map((item) => item.id === id ? updated : item))
      log('Operator payment rejected', 'operator-payments', `${id} · ${updated.operator} · ${updated.rejectionReason}`, approver)
      showToast(`${id} rejected`)
    },
    [operatorPayments, log, showToast],
  )

  const payOperatorPayment = useCallback(
    (id: string, reference: string) => {
      const target = operatorPayments.find((item) => item.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return
      }
      const updated = markOperatorPaymentPaid(target, reference, stamp())
      if (!updated) {
        showToast(`An approved payment and transaction reference are required for ${id}`)
        return
      }
      setOperatorPayments((prev) => prev.map((item) => item.id === id ? updated : item))
      log('Operator payment completed', 'operator-payments', `${id} · ${updated.payoutMethod} · ${updated.paymentReference}`, 'Payment Operations')
      showToast(`${id} marked paid`)
    },
    [operatorPayments, log, showToast],
  )

  const changeOperatorPaymentMethod = useCallback(
    (id: string, method: OperatorPaymentMethod) => {
      const target = operatorPayments.find((item) => item.id === id)
      if (!target) {
        showToast(`${id} is no longer available`)
        return
      }
      const updated = updateOperatorPaymentMethod(target, method, stamp())
      if (!updated) {
        showToast(`Payment method for ${id} cannot be changed`)
        return
      }
      setOperatorPayments((prev) => prev.map((item) => item.id === id ? updated : item))
      log('Operator payment method updated', 'operator-payments', `${id} · ${method}`)
      showToast(`${id} payout method set to ${method}`)
    },
    [operatorPayments, log, showToast],
  )

  // ---- Customer payments ----------------------------------------------------
  const collectCustomerPayment = useCallback(
    (customerId: string, invoiceId: string, amount: number, method: CustomerPaymentMethod, reference: string) => {
      const target = customerPayments.find((customer) => customer.id === customerId)
      if (!target) {
        showToast(`${customerId} is no longer available`)
        return
      }
      const at = stamp()
      const updated = recordCustomerPayment(target, invoiceId, amount, method, reference, at)
      if (!updated) {
        showToast('Enter a valid amount up to the invoice balance and a transaction reference')
        return
      }
      setCustomerPayments((prev) => prev.map((customer) => customer.id === customerId ? updated : customer))
      log('Customer payment collected', 'customer-payments', `${customerId} · ${invoiceId} · ₹${amount.toLocaleString('en-IN')} · ${method} · ${reference}`, 'Rohit Menon')
      showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${updated.customer}`)
    },
    [customerPayments, log, showToast],
  )

  const sendCustomerPaymentReminder = useCallback(
    (customerId: string, invoiceId: string) => {
      const target = customerPayments.find((customer) => customer.id === customerId)
      if (!target) {
        showToast(`${customerId} is no longer available`)
        return
      }
      const updated = recordCustomerReminder(target, invoiceId, stamp())
      if (!updated) {
        showToast(`No outstanding invoice found for ${customerId}`)
        return
      }
      setCustomerPayments((prev) => prev.map((customer) => customer.id === customerId ? updated : customer))
      log('Customer payment reminder sent', 'customer-payments', `${invoiceId} · ${updated.customer}`, 'Rohit Menon')
      showToast(`Payment reminder recorded for ${updated.customer}`)
    },
    [customerPayments, log, showToast],
  )

  return {
    rates,
    changes,
    settlements,
    payouts: payoutList,
    invoices: invoiceList,
    financeInvoices: financeInvoiceList,
    refunds: refundList,
    reconItems: reconList,
    reconPeriods: periodList,
    audit,
    approvalRequests,
    ownerSettlements,
    operatorPayments,
    customerPayments,
    toast,
    showToast,
    updateRate,
    scheduleRate,
    runSettlement,
    finalizeSettlement,
    correctSettlement,
    rerunSettlement,
    updateSettlementAdjustment,
    approvePayout,
    secondApproval,
    holdPayout,
    releasePayout,
    rejectPayout,
    retryPayout,
    resendInvoice,
    downloadInvoice,
    createInvoiceDraft,
    editInvoiceDraft,
    issueInvoice,
    collectInvoicePayment,
    approveRefund,
    rejectRefund,
    processRefund,
    approveFinanceRequest: approveFinanceRequestAction,
    rejectFinanceRequest: rejectFinanceRequestAction,
    createFinanceApprovalRequest,
    approveOwnerSettlement: approveOwnerSettlementAction,
    rejectOwnerSettlement: rejectOwnerSettlementAction,
    payOwnerSettlement,
    updateOwnerPayoutMethod,
    approveOperatorPayment: approveOperatorPaymentAction,
    rejectOperatorPayment: rejectOperatorPaymentAction,
    payOperatorPayment,
    changeOperatorPaymentMethod,
    collectCustomerPayment,
    sendCustomerPaymentReminder,
    investigateRecon,
    resolveRecon,
    closePeriod,
  }
}

export type FinanceAdminStore = ReturnType<typeof useFinanceAdmin>
