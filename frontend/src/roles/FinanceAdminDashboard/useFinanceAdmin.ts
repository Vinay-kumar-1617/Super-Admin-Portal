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

const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ')
const makeId = (prefix: string) => `${prefix}-${Date.now()}`

export function useFinanceAdmin() {
  const [rates, setRates] = useState<CommissionRate[]>(commissionRates)
  const [changes, setChanges] = useState<CommissionChange[]>(commissionHistory)
  const [settlements, setSettlements] = useState<Settlement[]>(settlementRuns)
  const [payoutList, setPayoutList] = useState<Payout[]>(seedPayouts)
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(seedInvoices)
  const [refundList, setRefundList] = useState<Refund[]>(seedRefunds)
  const [reconList, setReconList] = useState<ReconItem[]>(seedReconItems)
  const [periodList, setPeriodList] = useState<ReconPeriod[]>(seedReconPeriods)
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2600)
  }, [])

  const log = useCallback((action: string, area: SectionId, detail: string) => {
    setAudit((prev) => [{ id: makeId('au'), time: stamp(), actor: 'Rohit Menon', action, area, detail }, ...prev])
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
    (id: string) => updatePayout(id, { status: 'Approved', reason: 'Hold released' }, 'released', 'Payout released'),
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
  const processRefund = useCallback((id: string) => updateRefund(id, 'Processed', 'processed to customer', 'Refund processed'), [updateRefund])

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

  return {
    rates,
    changes,
    settlements,
    payouts: payoutList,
    invoices: invoiceList,
    refunds: refundList,
    reconItems: reconList,
    reconPeriods: periodList,
    audit,
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
    approveRefund,
    rejectRefund,
    processRefund,
    investigateRecon,
    resolveRecon,
    closePeriod,
  }
}

export type FinanceAdminStore = ReturnType<typeof useFinanceAdmin>
