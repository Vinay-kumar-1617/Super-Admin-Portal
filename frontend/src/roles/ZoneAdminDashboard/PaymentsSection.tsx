import { useMemo, useState } from 'react'
import { StatusPill } from '../CityAdminDashboard/shared'
import {
  cityOutstandingRows,
  cityPayments,
  cityRefundAdjustments,
  hasFinancePermission,
  type CityPayment,
} from '../CityAdminDashboard/cityFinanceData'
import { zoneProfile } from './zoneAdminData'

type FinanceTab = 'transactions' | 'outstanding' | 'refunds'
const financeTabs: Array<{ id: FinanceTab; label: string; hint: string }> = [
  { id: 'transactions', label: 'Transactions', hint: 'Successful, pending, failed and refunded payments' },
  { id: 'outstanding', label: 'Outstanding & overdue', hint: 'Unsettled invoices and overdue rent' },
  { id: 'refunds', label: 'Refunds & adjustments', hint: 'Refund requests and city-authorized adjustments' },
]
const financePeriods = ['This Month', 'Last Month', 'This Quarter', 'This Year'] as const

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`

const paymentStatuses: Array<'All' | CityPayment['status']> = ['All', 'Successful', 'Pending', 'Failed', 'Refunded']

type RefundRequest = {
  id: string
  bookingId: string
  customer: string
  amount: number
  reason: string
  status: 'Submitted to City Admin' | 'Under review' | 'Rejected'
  requested: string
}

export default function PaymentsSection({ onToast }: { onToast?: (message: string) => void }) {
  const zone = zoneProfile.name
  const [tab, setTab] = useState<FinanceTab>('transactions')
  const [period, setPeriod] = useState<string>(financePeriods[0])
  const [paymentFilter, setPaymentFilter] = useState<'All' | CityPayment['status']>('All')
  const [paymentQuery, setPaymentQuery] = useState('')
  const [outstandingFilter, setOutstandingFilter] = useState<'All' | 'Current' | 'Overdue' | 'Critical'>('All')
  const [refundForm, setRefundForm] = useState({ bookingId: '', customer: '', amount: '', reason: '' })

  const payments = useMemo(() => cityPayments.filter((payment) => payment.zone === zone), [zone])
  const outstanding = useMemo(() => cityOutstandingRows.filter((row) => row.zone === zone), [zone])
  const zoneRefunds = useMemo(() => cityRefundAdjustments.filter((row) => row.zone === zone), [zone])

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(
    zoneRefunds.map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      customer: row.customer,
      amount: row.amount,
      reason: row.reason,
      status: row.status === 'Rejected' ? 'Rejected' : 'Under review',
      requested: row.requested,
    })),
  )

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = paymentFilter === 'All' || payment.status === paymentFilter
    const query = paymentQuery.trim().toLowerCase()
    const matchesQuery =
      query === '' ||
      [payment.id, payment.reference, payment.bookingId, payment.customer, payment.invoiceId, payment.receiptId]
        .join(' ')
        .toLowerCase()
        .includes(query)
    return matchesStatus && matchesQuery
  })

  const filteredOutstanding = outstanding.filter((row) => outstandingFilter === 'All' || row.status === outstandingFilter)
  const canExport = hasFinancePermission('finance.export') || hasFinancePermission('reports.view')

  const totals = useMemo(() => ({
    successful: payments.filter((payment) => payment.status === 'Successful').reduce((sum, payment) => sum + payment.amount, 0),
    pending: payments.filter((payment) => payment.status === 'Pending').reduce((sum, payment) => sum + payment.amount, 0),
    failed: payments.filter((payment) => payment.status === 'Failed').reduce((sum, payment) => sum + payment.amount, 0),
    refunded: payments.filter((payment) => payment.status === 'Refunded').reduce((sum, payment) => sum + payment.amount, 0),
    outstanding: outstanding.reduce((sum, row) => sum + row.amount, 0),
    overdueCount: outstanding.filter((row) => row.status !== 'Current').length,
  }), [payments, outstanding])

  const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportPayments = () => {
    if (!canExport) {
      onToast?.('Exporting financial data requires City Admin permission.')
      return
    }
    downloadCsv(`${zone.toLowerCase()}_payments_${period.replace(/\s+/g, '_').toLowerCase()}.csv`, [
      ['Payment', 'Reference', 'Booking', 'Customer', 'Amount', 'Method', 'Status', 'Date', 'Invoice', 'Receipt'],
      ...filteredPayments.map((payment) => [payment.id, payment.reference, payment.bookingId, payment.customer, payment.amount, payment.method, payment.status, payment.date, payment.invoiceId, payment.receiptId]),
    ])
    onToast?.(`Exported ${filteredPayments.length} zone transactions.`)
  }

  const exportOutstanding = () => {
    if (!canExport) {
      onToast?.('Exporting financial data requires City Admin permission.')
      return
    }
    downloadCsv(`${zone.toLowerCase()}_outstanding_rent.csv`, [
      ['Reference', 'Invoice', 'Customer', 'Amount', 'Due date', 'Days overdue', 'Status'],
      ...filteredOutstanding.map((row) => [row.id, row.invoiceId, row.customer, row.amount, row.dueDate, row.daysOverdue, row.status]),
    ])
    onToast?.(`Exported ${filteredOutstanding.length} overdue accounts.`)
  }

  const submitRefundRequest = () => {
    if (!refundForm.bookingId.trim() || !refundForm.customer.trim() || !refundForm.amount.trim() || !refundForm.reason.trim()) {
      onToast?.('Please complete all refund request fields.')
      return
    }
    const amount = Number(refundForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      onToast?.('Enter a valid refund amount.')
      return
    }
    const request: RefundRequest = {
      id: `RR-${Date.now().toString().slice(-5)}`,
      bookingId: refundForm.bookingId.trim(),
      customer: refundForm.customer.trim(),
      amount,
      reason: refundForm.reason.trim(),
      status: 'Submitted to City Admin',
      requested: 'Just now',
    }
    setRefundRequests((prev) => [request, ...prev])
    setRefundForm({ bookingId: '', customer: '', amount: '', reason: '' })
    onToast?.(`Refund request ${request.id} submitted to City Admin.`)
  }

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Finance &amp; payments</h3>
          <span className="sa-panel-sub">Rental payments, transactions, refunds and reports for {zone}</span>
        </div>
        <div className="finance-header-controls">
          <select className="sa-select" aria-label="Finance period" value={period} onChange={(event) => setPeriod(event.target.value)}>
            {financePeriods.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="sa-chip-row finance-tabs">
        {financeTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sa-chip ${tab === item.id ? 'active orange' : ''}`}
            onClick={() => setTab(item.id)}
            title={item.hint}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="finance-summary">
        <div className="finance-summary-item"><span className="sa-approval-meta">Rent collected</span><strong>{inr(totals.successful)}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Pending</span><strong>{inr(totals.pending)}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Failed</span><strong>{inr(totals.failed)}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Refunded</span><strong>{inr(totals.refunded)}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Outstanding</span><strong>{inr(totals.outstanding)}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Overdue accounts</span><strong>{totals.overdueCount}</strong></div>
      </div>

      {tab === 'transactions' && (
        <>
          <div className="sa-chip-row">
            {paymentStatuses.map((status) => (
              <button
                key={status}
                type="button"
                className={`sa-chip ${paymentFilter === status ? 'active orange' : ''}`}
                onClick={() => setPaymentFilter(status)}
              >
                {status === 'All' ? 'All payments' : status} · {status === 'All' ? payments.length : payments.filter((payment) => payment.status === status).length}
              </button>
            ))}
          </div>
          <div className="sa-toolbar">
            <input className="sa-input" aria-label="Search transactions" placeholder="Search payment, reference, booking, customer, invoice or receipt..." value={paymentQuery} onChange={(event) => setPaymentQuery(event.target.value)} />
            <button type="button" className="sa-btn-ghost" onClick={() => { setPaymentQuery(''); setPaymentFilter('All') }}>Reset</button>
            <button type="button" className="sa-btn primary" onClick={exportPayments}>Export CSV</button>
            <span className="sa-toolbar-meta">{filteredPayments.length} of {payments.length} transactions</span>
          </div>
          {filteredPayments.length === 0 ? (
            <div className="sa-empty"><p>No zone transactions match the current filters.</p></div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Invoice / receipt</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="sa-cell-strong">{payment.id}<span className="sa-cell-sub">{payment.reference}</span></td>
                      <td>{payment.bookingId}</td>
                      <td>{payment.customer}</td>
                      <td>{payment.method}</td>
                      <td className="sa-num">{inr(payment.amount)}</td>
                      <td className="sa-cell-strong">{payment.invoiceId}<span className="sa-cell-sub">{payment.receiptId}</span></td>
                      <td>{payment.date}</td>
                      <td><StatusPill status={payment.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'outstanding' && (
        <>
          <div className="sa-chip-row">
            {(['All', 'Current', 'Overdue', 'Critical'] as const).map((status) => (
              <button key={status} type="button" className={`sa-chip ${outstandingFilter === status ? 'active orange' : ''}`} onClick={() => setOutstandingFilter(status)}>
                {status === 'All' ? 'All accounts' : status} · {status === 'All' ? outstanding.length : outstanding.filter((row) => row.status === status).length}
              </button>
            ))}
          </div>
          <div className="sa-toolbar">
            <button type="button" className="sa-btn primary" onClick={exportOutstanding}>Export CSV</button>
            <span className="sa-toolbar-meta">{filteredOutstanding.length} of {outstanding.length} open invoices · {inr(totals.outstanding)} outstanding</span>
          </div>
          {filteredOutstanding.length === 0 ? (
            <div className="sa-empty"><p>No outstanding invoices for this zone.</p></div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Due date</th>
                    <th>Days overdue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOutstanding.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.id}</td>
                      <td>{row.invoiceId}</td>
                      <td>{row.customer}</td>
                      <td className="sa-num">{inr(row.amount)}</td>
                      <td>{row.dueDate}</td>
                      <td className="sa-num">{row.daysOverdue === 0 ? '—' : row.daysOverdue}</td>
                      <td><StatusPill status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'refunds' && (
        <>
          <div className="reports-note">
            <span className="sa-pill amber">{refundRequests.filter((row) => row.status === 'Submitted to City Admin' || row.status === 'Under review').length} awaiting City Admin authorization</span>
            <span>Zone Admin can submit refund requests. Only City Admin can authorize or process them.</span>
          </div>
          <div className="sa-toolbar" style={{ gap: 8 }}>
            <input className="sa-input" placeholder="Booking ID" value={refundForm.bookingId} onChange={(e) => setRefundForm({ ...refundForm, bookingId: e.target.value })} />
            <input className="sa-input" placeholder="Customer" value={refundForm.customer} onChange={(e) => setRefundForm({ ...refundForm, customer: e.target.value })} />
            <input className="sa-input" placeholder="Amount (₹)" value={refundForm.amount} onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })} />
            <textarea className="sa-input" placeholder="Reason for refund..." value={refundForm.reason} onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })} style={{ minHeight: 48 }} />
            <button type="button" className="sa-btn primary" onClick={submitRefundRequest}>Submit refund request</button>
          </div>
          {refundRequests.length === 0 ? (
            <div className="sa-empty"><p>No refund requests recorded for this zone.</p></div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {refundRequests.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.id}</td>
                      <td>{row.bookingId}</td>
                      <td>{row.customer}</td>
                      <td className="sa-num">{inr(row.amount)}</td>
                      <td><span className={`sa-pill ${row.status === 'Rejected' ? 'red' : row.status === 'Under review' ? 'green' : 'amber'}`}>{row.status}</span></td>
                      <td>{row.requested}</td>
                      <td>{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}