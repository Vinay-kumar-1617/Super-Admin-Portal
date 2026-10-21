import { useMemo, useState } from 'react'
import { ProgressCell, StatusPill } from './shared'
import { cityProfile } from './cityAdminData'
import {
  cityCollectionRows,
  cityFinanceAudit,
  cityFinancePermissions,
  cityFinanceReports,
  cityOutstandingRows,
  cityPayments,
  cityRefundAdjustments,
  financePeriods,
  financeTabs,
  hasFinancePermission,
  type FinanceTab,
  type PaymentStatus,
  type RefundAdjustment,
  type RefundStatus,
} from './cityFinanceData'

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`

const paymentStatuses: Array<'All' | PaymentStatus> = ['All', 'Successful', 'Pending', 'Failed', 'Refunded']

const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
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

type FinancePaymentsSectionProps = {
  onToast?: (message: string) => void
}

export default function FinancePaymentsSection({ onToast }: FinancePaymentsSectionProps) {
  const [tab, setTab] = useState<FinanceTab>('collections')
  const [period, setPeriod] = useState<string>(financePeriods[0])
  const [paymentFilter, setPaymentFilter] = useState<'All' | PaymentStatus>('All')
  const [paymentQuery, setPaymentQuery] = useState('')
  const [outstandingFilter, setOutstandingFilter] = useState<'All' | 'Current' | 'Overdue' | 'Critical'>('All')
  const [refundFilter, setRefundFilter] = useState<'All' | RefundStatus>('All')
  const [refunds, setRefunds] = useState<RefundAdjustment[]>(cityRefundAdjustments)

  const canExport = hasFinancePermission('finance.export')
  const canApproveRefunds = hasFinancePermission('bookings.refund')

  const guard = (allowed: boolean, message: string): boolean => {
    if (allowed) return true
    onToast?.(message)
    return false
  }

  const totals = useMemo(() => {
    const sum = (status: PaymentStatus) =>
      cityPayments.filter((payment) => payment.status === status).reduce((total, payment) => total + payment.amount, 0)
    return {
      collected: cityCollectionRows.reduce((total, row) => total + row.collected, 0),
      target: cityCollectionRows.reduce((total, row) => total + row.target, 0),
      successful: sum('Successful'),
      pending: sum('Pending'),
      failed: sum('Failed'),
      refunded: sum('Refunded'),
      outstanding: cityOutstandingRows.reduce((total, row) => total + row.amount, 0),
      overdueCount: cityOutstandingRows.filter((row) => row.status !== 'Current').length,
      pendingRefunds: refunds.filter((row) => row.status === 'Pending').length,
    }
  }, [refunds])

  const filteredPayments = cityPayments.filter((payment) => {
    const matchesStatus = paymentFilter === 'All' || payment.status === paymentFilter
    const query = paymentQuery.trim().toLowerCase()
    const matchesQuery =
      query === '' ||
      [payment.id, payment.reference, payment.bookingId, payment.customer, payment.zone, payment.invoiceId, payment.receiptId]
        .join(' ')
        .toLowerCase()
        .includes(query)
    return matchesStatus && matchesQuery
  })

  const filteredOutstanding = cityOutstandingRows.filter((row) => outstandingFilter === 'All' || row.status === outstandingFilter)
  const filteredRefunds = refunds.filter((row) => refundFilter === 'All' || row.status === refundFilter)

  const exportPayments = () => {
    if (!guard(canExport, 'Exporting financial data requires the “Export financial data” permission.')) return
    downloadCsv(`hyderabad_payments_${period.replace(/\s+/g, '_').toLowerCase()}.csv`, [
      ['Payment', 'Reference', 'Booking', 'Customer', 'Zone', 'Amount', 'Method', 'Status', 'Date', 'Invoice', 'Receipt'],
      ...filteredPayments.map((p) => [p.id, p.reference, p.bookingId, p.customer, p.zone, p.amount, p.method, p.status, p.date, p.invoiceId, p.receiptId]),
    ])
  }

  const exportCollections = () => {
    if (!guard(canExport, 'Exporting financial data requires the “Export financial data” permission.')) return
    downloadCsv(`hyderabad_collections_${period.replace(/\s+/g, '_').toLowerCase()}.csv`, [
      ['Zone', 'Collected', 'Target', 'Achievement %', 'Outstanding'],
      ...cityCollectionRows.map((row) => [row.zone, row.collected, row.target, Math.round((row.collected / row.target) * 100), row.outstanding]),
    ])
  }

  const exportOutstanding = () => {
    if (!guard(canExport, 'Exporting financial data requires the “Export financial data” permission.')) return
    downloadCsv('hyderabad_outstanding_rent.csv', [
      ['Reference', 'Invoice', 'Customer', 'Zone', 'Amount', 'Due date', 'Days overdue', 'Status'],
      ...filteredOutstanding.map((row) => [row.id, row.invoiceId, row.customer, row.zone, row.amount, row.dueDate, row.daysOverdue, row.status]),
    ])
  }

  const exportRefunds = () => {
    if (!guard(canExport, 'Exporting financial data requires the “Export financial data” permission.')) return
    downloadCsv('hyderabad_refunds_adjustments.csv', [
      ['Refund', 'Booking', 'Customer', 'Zone', 'Amount', 'Reason', 'Status', 'Requested', 'Authorized by', 'Authorized on'],
      ...filteredRefunds.map((row) => [row.id, row.bookingId, row.customer, row.zone, row.amount, row.reason, row.status, row.requested, row.authorizedBy ?? '—', row.authorizedOn ?? '—']),
    ])
  }

  const decideRefund = (id: string, decision: 'Approved' | 'Rejected') => {
    if (!guard(canApproveRefunds, 'Approving refunds requires the “Approve refunds & adjustments” permission.')) return
    setRefunds((current) =>
      current.map((row) =>
        row.id === id ? { ...row, status: decision, authorizedBy: cityProfile.adminName, authorizedOn: 'Just now' } : row,
      ),
    )
    onToast?.(`Refund ${id} ${decision.toLowerCase()}.`)
  }

  const processRefund = (id: string) => {
    if (!guard(canApproveRefunds, 'Processing refunds requires the “Approve refunds & adjustments” permission.')) return
    setRefunds((current) => current.map((row) => (row.id === id ? { ...row, status: 'Processed' } : row)))
    onToast?.(`Refund ${id} marked as processed.`)
  }

  const exportAudit = () => {
    if (!guard(canExport, 'Exporting financial data requires the “Export financial data” permission.')) return
    downloadCsv('hyderabad_finance_audit.csv', [
      ['Time', 'Actor', 'Action', 'Target', 'Amount', 'Outcome'],
      ...cityFinanceAudit.map((row) => [row.time, row.actor, row.action, row.target, row.amount ?? '', row.outcome]),
    ])
  }

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Finance &amp; payments</h3>
          <span className="sa-panel-sub">Rental collections, transactions, refunds and reports for {cityProfile.name}</span>
        </div>
        <div className="finance-header-controls">
          <select className="sa-select" aria-label="Finance period" value={period} onChange={(event) => setPeriod(event.target.value)}>
            {financePeriods.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
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
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Rent collected</span>
          <strong>{inr(totals.collected)}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Pending</span>
          <strong>{inr(totals.pending)}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Failed</span>
          <strong>{inr(totals.failed)}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Refunded</span>
          <strong>{inr(totals.refunded)}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Outstanding</span>
          <strong>{inr(totals.outstanding)}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Overdue accounts</span>
          <strong>{totals.overdueCount}</strong>
        </div>
      </div>

      {tab === 'collections' && (
        <>
          <div className="reports-note">
            <span className="sa-pill green">City collections</span>
            <p>
              {cityProfile.name} has collected <strong>{inr(totals.collected)}</strong> against a target of {inr(totals.target)} (
              {Math.round((totals.collected / totals.target) * 100)}% achievement) with {inr(totals.outstanding)} still outstanding.
            </p>
          </div>
          <div className="sa-toolbar">
            <button type="button" className="sa-btn primary" onClick={exportCollections}>
              Export CSV
            </button>
            <span className="sa-toolbar-meta">{cityCollectionRows.length} zones · period {period.toLowerCase()}</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Collected</th>
                  <th>Target</th>
                  <th>Achievement</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {cityCollectionRows.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">{row.zone}</td>
                    <td className="sa-num">{inr(row.collected)}</td>
                    <td className="sa-num">{inr(row.target)}</td>
                    <td>
                      <ProgressCell value={Math.round((row.collected / row.target) * 100)} />
                    </td>
                    <td className="sa-num">{inr(row.outstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'transactions' && (
        <>
          <div className="sa-chip-row">
            {paymentStatuses.map((status) => {
              const count = status === 'All' ? cityPayments.length : cityPayments.filter((payment) => payment.status === status).length
              return (
                <button
                  key={status}
                  type="button"
                  className={`sa-chip ${paymentFilter === status ? 'active orange' : ''}`}
                  onClick={() => setPaymentFilter(status)}
                >
                  {status === 'All' ? 'All payments' : status} · {count}
                </button>
              )
            })}
          </div>
          <div className="sa-toolbar">
            <input
              className="sa-input"
              aria-label="Search transactions"
              placeholder="Search payment, reference, booking, customer, invoice or receipt..."
              value={paymentQuery}
              onChange={(event) => setPaymentQuery(event.target.value)}
            />
            <button type="button" className="sa-btn-ghost" onClick={() => { setPaymentQuery(''); setPaymentFilter('All') }}>
              Reset
            </button>
            <button type="button" className="sa-btn primary" onClick={exportPayments}>
              Export CSV
            </button>
            <span className="sa-toolbar-meta">
              {filteredPayments.length} of {cityPayments.length} transactions
            </span>
          </div>
          {filteredPayments.length === 0 ? (
            <div className="sa-empty">
              <p>No transactions match the current filters.</p>
              <button type="button" className="sa-btn-ghost" onClick={() => { setPaymentQuery(''); setPaymentFilter('All') }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Zone</th>
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
                      <td className="sa-cell-strong">
                        {payment.id}
                        <span className="sa-cell-sub">{payment.reference}</span>
                      </td>
                      <td>{payment.bookingId}</td>
                      <td>{payment.customer}</td>
                      <td>{payment.zone}</td>
                      <td>{payment.method}</td>
                      <td className="sa-num">{inr(payment.amount)}</td>
                      <td className="sa-cell-strong">
                        {payment.invoiceId}
                        <span className="sa-cell-sub">{payment.receiptId}</span>
                      </td>
                      <td>{payment.date}</td>
                      <td>
                        <StatusPill status={payment.status} />
                      </td>
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
            {(['All', 'Current', 'Overdue', 'Critical'] as const).map((status) => {
              const count =
                status === 'All'
                  ? cityOutstandingRows.length
                  : cityOutstandingRows.filter((row) => row.status === status).length
              return (
                <button
                  key={status}
                  type="button"
                  className={`sa-chip ${outstandingFilter === status ? 'active orange' : ''}`}
                  onClick={() => setOutstandingFilter(status)}
                >
                  {status === 'All' ? 'All accounts' : status} · {count}
                </button>
              )
            })}
          </div>
          <div className="sa-toolbar">
            <button type="button" className="sa-btn primary" onClick={exportOutstanding}>
              Export CSV
            </button>
            <span className="sa-toolbar-meta">
              {filteredOutstanding.length} of {cityOutstandingRows.length} open invoices · {inr(totals.outstanding)} outstanding
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Zone</th>
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
                    <td>{row.zone}</td>
                    <td className="sa-num">{inr(row.amount)}</td>
                    <td>{row.dueDate}</td>
                    <td className="sa-num">{row.daysOverdue === 0 ? '—' : row.daysOverdue}</td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'refunds' && (
        <>
          <div className="reports-note">
            <span className="sa-pill amber">{totals.pendingRefunds} awaiting authorization</span>
            <p>Refunds and adjustments within the city limit can be authorized here. Larger or city-wide adjustments escalate to State Admin.</p>
          </div>
          <div className="sa-toolbar">
            <select
              className="sa-select"
              aria-label="Filter refunds by status"
              value={refundFilter}
              onChange={(event) => setRefundFilter(event.target.value as 'All' | RefundStatus)}
            >
              {(['All', 'Pending', 'Approved', 'Processed', 'Rejected'] as const).map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All statuses' : option}
                </option>
              ))}
            </select>
            <button type="button" className="sa-btn primary" onClick={exportRefunds}>
              Export CSV
            </button>
            <span className="sa-toolbar-meta">
              {filteredRefunds.length} of {refunds.length} refunds &amp; adjustments
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Refund</th>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Zone</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Requested</th>
                  <th>Authorized by</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">{row.id}</td>
                    <td>{row.bookingId}</td>
                    <td>{row.customer}</td>
                    <td>{row.zone}</td>
                    <td className="sa-num">{inr(row.amount)}</td>
                    <td>{row.reason}</td>
                    <td>{row.requested}</td>
                    <td className="sa-cell-strong">
                      {row.authorizedBy ?? 'Awaiting authorization'}
                      {row.authorizedOn && <span className="sa-cell-sub">{row.authorizedOn}</span>}
                    </td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                    <td>
                      <div className="sa-table-actions">
                        {row.status === 'Pending' && (
                          <>
                            <button type="button" className="sa-table-act" onClick={() => decideRefund(row.id, 'Approved')}>
                              Approve
                            </button>
                            <button type="button" className="sa-table-act danger" onClick={() => decideRefund(row.id, 'Rejected')}>
                              Reject
                            </button>
                          </>
                        )}
                        {row.status === 'Approved' && (
                          <button type="button" className="sa-table-act" onClick={() => processRefund(row.id)}>
                            Mark processed
                          </button>
                        )}
                        {(row.status === 'Processed' || row.status === 'Rejected') && <span className="sa-cell-sub">Settled</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'reports' && (
        <>
          <div className="sa-toolbar">
            <span className="sa-panel-sub">Generate city-level financial summaries and export permitted reports for {period.toLowerCase()}.</span>
            <button
              type="button"
              className="sa-btn primary"
              onClick={() => {
                if (!guard(canExport, 'Exporting financial data requires the “Export financial data” permission.')) return
                downloadCsv('hyderabad_financial_summary.csv', [
                  ['Metric', 'Value'],
                  ['Rent collected', totals.collected],
                  ['Target', totals.target],
                  ['Pending', totals.pending],
                  ['Failed', totals.failed],
                  ['Refunded', totals.refunded],
                  ['Outstanding rent', totals.outstanding],
                  ['Overdue accounts', totals.overdueCount],
                ])
              }}
            >
              Export summary CSV
            </button>
          </div>
          <div className="sa-report-grid">
            {cityFinanceReports.map((report) => {
              const permitted = hasFinancePermission(report.permission)
              return (
                <div key={report.id} className="sa-report-card">
                  <h4>{report.title}</h4>
                  <p>{report.detail}</p>
                  <div className="sa-chip-row">
                    <span className="sa-pill slate">{report.period}</span>
                    <span className={`sa-pill ${permitted ? 'green' : 'amber'}`}>
                      {permitted ? 'Export permitted' : 'Not permitted'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="sa-btn-ghost"
                    disabled={!permitted}
                    title={permitted ? undefined : 'Requires the “Tax / GST statements” permission held by State Admin'}
                    onClick={() => {
                      if (!guard(permitted, 'This report requires a permission held by State Admin.')) return
                      downloadCsv(`hyderabad_${report.id}_${period.replace(/\s+/g, '_').toLowerCase()}.csv`, [
                        ['Report', report.title],
                        ['City', cityProfile.name],
                        ['Period', report.period],
                        ['Generated by', cityProfile.adminName],
                        [],
                        ['Metric', 'Value'],
                        ['Rent collected', totals.collected],
                        ['Target', totals.target],
                        ['Pending', totals.pending],
                        ['Failed', totals.failed],
                        ['Refunded', totals.refunded],
                        ['Outstanding rent', totals.outstanding],
                        ['Overdue accounts', totals.overdueCount],
                      ])
                    }}
                  >
                    {permitted ? 'Generate & export' : 'Access restricted'}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'permissions' && (
        <>
          <div className="reports-note">
            <span className="sa-pill purple">Permission-controlled</span>
            <p>
              Sensitive financial actions are limited to the permissions granted to the City Admin. Locked permissions can only be
              exercised by State Admin.
            </p>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cityFinancePermissions.map((permission) => (
                  <tr key={permission.key}>
                    <td className="sa-cell-strong">
                      {permission.label}
                      <span className="sa-cell-sub">{permission.key}</span>
                    </td>
                    <td>{permission.description}</td>
                    <td>
                      <span className={`sa-pill ${permission.granted ? 'green' : permission.locked ? 'slate' : 'amber'}`}>
                        {permission.granted ? 'Granted' : permission.locked ? '🔒 State Admin only' : 'Not granted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sa-toolbar">
            <span className="sa-panel-sub">Finance-related audit trail · read-only</span>
            <button type="button" className="sa-btn primary" onClick={exportAudit}>
              Export CSV
            </button>
          </div>
          <div className="sa-approval-list">
            {cityFinanceAudit.map((entry) => (
              <article key={entry.id} className="sa-approval-item">
                <div className="sa-approval-copy">
                  <div className="sa-approval-tags">
                    <span className="sa-approval-id">{entry.id}</span>
                    <span className="sa-pill blue">{entry.action}</span>
                    <span className={`sa-pill ${entry.outcome === 'Success' ? 'green' : entry.outcome === 'Warning' ? 'amber' : 'red'}`}>
                      {entry.outcome}
                    </span>
                    {entry.amount !== undefined && <span className="sa-approval-id">{inr(entry.amount)}</span>}
                  </div>
                  <strong>{entry.target}</strong>
                  <span className="sa-approval-meta">
                    {entry.actor} · {entry.time}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
