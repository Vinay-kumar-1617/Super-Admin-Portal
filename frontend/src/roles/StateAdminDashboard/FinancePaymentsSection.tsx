import { useMemo, useState } from 'react'
import { ProgressCell, StatCards, StatusPill, type StatCard } from './shared'
import {
  collectionRows,
  financeAuditEntries,
  financePeriods,
  financeReports,
  financeTabs,
  invoiceRecords,
  outstandingRows,
  refundAdjustments,
  rentalPayments,
  type FinanceTab,
  type PaymentStatus,
} from './financePaymentsData'

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`

const paymentStatuses: Array<'All' | PaymentStatus> = ['All', 'Successful', 'Pending', 'Failed', 'Refunded']

const paymentTones: Record<'All' | PaymentStatus, StatCard['tone']> = {
  All: 'brand',
  Successful: 'green',
  Pending: 'amber',
  Failed: 'red',
  Refunded: 'blue',
}

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
  onOpenAudit?: () => void
}

export default function FinancePaymentsSection({ onOpenAudit }: FinancePaymentsSectionProps) {
  const [tab, setTab] = useState<FinanceTab>('payments')
  const [period, setPeriod] = useState<string>(financePeriods[0])
  const [paymentFilter, setPaymentFilter] = useState<'All' | PaymentStatus>('All')
  const [paymentQuery, setPaymentQuery] = useState('')
  const [collectionCity, setCollectionCity] = useState('All')
  const [outstandingFilter, setOutstandingFilter] = useState<'All' | 'Current' | 'Overdue' | 'Critical'>('All')
  const [refundFilter, setRefundFilter] = useState<'All' | 'Pending' | 'Approved' | 'Processed' | 'Rejected'>('All')
  const [invoiceFilter, setInvoiceFilter] = useState<'All' | 'Invoice' | 'Receipt' | 'Credit note'>('All')

  const totals = useMemo(() => {
    const sum = (status: PaymentStatus) =>
      rentalPayments.filter((payment) => payment.status === status).reduce((total, payment) => total + payment.amount, 0)
    return {
      collected: sum('Successful'),
      successful: sum('Successful'),
      pending: sum('Pending'),
      failed: sum('Failed'),
      refunded: sum('Refunded'),
      outstanding: outstandingRows.reduce((total, row) => total + row.amount, 0),
      overdueCount: outstandingRows.filter((row) => row.status !== 'Current').length,
    }
  }, [])

  const paymentCards: StatCard[] = paymentStatuses.map((status) => ({
    key: status,
    label: status === 'All' ? 'All payments' : status,
    value: status === 'All' ? String(rentalPayments.length) : String(rentalPayments.filter((payment) => payment.status === status).length),
    tone: paymentTones[status],
    sub:
      status === 'All'
        ? inr(totals.collected + totals.pending + totals.failed + totals.refunded)
        : inr(
            rentalPayments
              .filter((payment) => payment.status === status)
              .reduce((total, payment) => total + payment.amount, 0),
          ),
  }))

  const filteredPayments = rentalPayments.filter((payment) => {
    const matchesStatus = paymentFilter === 'All' || payment.status === paymentFilter
    const query = paymentQuery.trim().toLowerCase()
    const matchesQuery =
      query === '' ||
      [payment.id, payment.reference, payment.bookingId, payment.customer, payment.city, payment.zone, payment.invoiceId, payment.receiptId]
        .join(' ')
        .toLowerCase()
        .includes(query)
    return matchesStatus && matchesQuery
  })

  const collectionCities = ['All', ...Array.from(new Set(collectionRows.map((row) => row.city)))]
  const scopedCollections = collectionRows.filter((row) => collectionCity === 'All' || row.city === collectionCity)

  const outstandingCards: StatCard[] = [
    { key: 'total', label: 'Outstanding rent', value: inr(totals.outstanding), tone: 'amber', sub: `${outstandingRows.length} open invoices`, static: true, compact: true },
    { key: 'Overdue', label: 'Overdue accounts', value: String(outstandingRows.filter((row) => row.status === 'Overdue').length), tone: 'red', sub: 'Past due date' },
    { key: 'Critical', label: 'Critical (30d+)', value: String(outstandingRows.filter((row) => row.status === 'Critical').length), tone: 'red', sub: 'Escalate to collections' },
    { key: 'Current', label: 'Current', value: String(outstandingRows.filter((row) => row.status === 'Current').length), tone: 'green', sub: 'Within terms' },
  ]

  const filteredOutstanding = outstandingRows.filter((row) => outstandingFilter === 'All' || row.status === outstandingFilter)
  const filteredRefunds = refundAdjustments.filter((row) => refundFilter === 'All' || row.status === refundFilter)
  const filteredInvoices = invoiceRecords.filter((row) => invoiceFilter === 'All' || row.kind === invoiceFilter)

  const exportPayments = () =>
    downloadCsv(`state_payments_${period.replace(/\s+/g, '_').toLowerCase()}.csv`, [
      ['Payment', 'Reference', 'Booking', 'Customer', 'City', 'Zone', 'Amount', 'Method', 'Status', 'Date', 'Invoice', 'Receipt'],
      ...filteredPayments.map((p) => [p.id, p.reference, p.bookingId, p.customer, p.city, p.zone, p.amount, p.method, p.status, p.date, p.invoiceId, p.receiptId]),
    ])

  const exportCollections = () =>
    downloadCsv(`state_collections_${period.replace(/\s+/g, '_').toLowerCase()}.csv`, [
      ['City', 'Zone', 'Collected', 'Target', 'Achievement %', 'Outstanding'],
      ...scopedCollections.map((row) => [row.city, row.zone, row.collected, row.target, Math.round((row.collected / row.target) * 100), row.outstanding]),
    ])

  const exportOutstanding = () =>
    downloadCsv('state_outstanding_rent.csv', [
      ['Reference', 'Invoice', 'Customer', 'City', 'Zone', 'Amount', 'Due date', 'Days overdue', 'Status'],
      ...filteredOutstanding.map((row) => [row.id, row.invoiceId, row.customer, row.city, row.zone, row.amount, row.dueDate, row.daysOverdue, row.status]),
    ])

  const exportRefunds = () =>
    downloadCsv('state_refunds_adjustments.csv', [
      ['Refund', 'Booking', 'Customer', 'City', 'Amount', 'Reason', 'Status', 'Requested', 'Authorized by', 'Authorized on'],
      ...filteredRefunds.map((row) => [row.id, row.bookingId, row.customer, row.city, row.amount, row.reason, row.status, row.requested, row.authorizedBy ?? '—', row.authorizedOn ?? '—']),
    ])

  const exportInvoices = () =>
    downloadCsv('state_invoices_receipts.csv', [
      ['Document', 'Kind', 'Booking', 'Customer', 'City', 'Amount', 'Payment reference', 'Issued', 'Status'],
      ...filteredInvoices.map((row) => [row.id, row.kind, row.bookingId, row.customer, row.city, row.amount, row.reference, row.issued, row.status]),
    ])

  const exportAudit = () =>
    downloadCsv('state_finance_audit.csv', [
      ['Time', 'Actor', 'Action', 'Target', 'Amount', 'Outcome'],
      ...financeAuditEntries.map((row) => [row.time, row.actor, row.action, row.target, row.amount ?? '', row.outcome]),
    ])

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Finance &amp; payments</h3>
          <span className="sa-panel-sub">Rental payments, collections, refunds and financial reports for the state</span>
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

      {tab === 'payments' && (
        <>
          <StatCards
            cards={paymentCards}
            activeKey={paymentFilter}
            onSelect={(key) => setPaymentFilter(paymentFilter === key ? 'All' : (key as 'All' | PaymentStatus))}
          />
          <div className="sa-toolbar">
            <input
              className="sa-input"
              aria-label="Search payments"
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
              {filteredPayments.length} of {rentalPayments.length} transactions
            </span>
          </div>
          {filteredPayments.length === 0 ? (
            <div className="sa-empty">
              <p>No payments match the current filters.</p>
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
                    <th>City</th>
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
                      <td>{payment.city}</td>
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

      {tab === 'collections' && (
        <>
          <div className="sa-toolbar">
            <select
              className="sa-select"
              aria-label="Filter collections by city"
              value={collectionCity}
              onChange={(event) => setCollectionCity(event.target.value)}
            >
              {collectionCities.map((city) => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All cities' : city}
                </option>
              ))}
            </select>
            <button type="button" className="sa-btn primary" onClick={exportCollections}>
              Export CSV
            </button>
            <span className="sa-toolbar-meta">
              {scopedCollections.length} zones · {inr(scopedCollections.reduce((total, row) => total + row.collected, 0))} collected
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Zone</th>
                  <th>Collected</th>
                  <th>Target</th>
                  <th>Achievement</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {scopedCollections.map((row) => (
                  <tr key={row.id}>
                    <td>{row.city}</td>
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

      {tab === 'outstanding' && (
        <>
          <StatCards
            cards={outstandingCards}
            activeKey={outstandingFilter}
            onSelect={(key) => setOutstandingFilter(outstandingFilter === key ? 'All' : (key as 'All' | 'Current' | 'Overdue' | 'Critical'))}
          />
          <div className="sa-toolbar">
            <button type="button" className="sa-btn-ghost" onClick={() => setOutstandingFilter('All')}>
              All accounts
            </button>
            <button type="button" className="sa-btn primary" onClick={exportOutstanding}>
              Export CSV
            </button>
            <span className="sa-toolbar-meta">
              {filteredOutstanding.length} of {outstandingRows.length} outstanding invoices
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>City</th>
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
                    <td>{row.city}</td>
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
          <div className="sa-toolbar">
            <select
              className="sa-select"
              aria-label="Filter refunds by status"
              value={refundFilter}
              onChange={(event) => setRefundFilter(event.target.value as 'All' | 'Pending' | 'Approved' | 'Processed' | 'Rejected')}
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
              {filteredRefunds.length} of {refundAdjustments.length} refunds &amp; adjustments
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Refund</th>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>City</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Requested</th>
                  <th>Authorized by</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">{row.id}</td>
                    <td>{row.bookingId}</td>
                    <td>{row.customer}</td>
                    <td>{row.city}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'invoices' && (
        <>
          <div className="sa-toolbar">
            <select
              className="sa-select"
              aria-label="Filter documents by kind"
              value={invoiceFilter}
              onChange={(event) => setInvoiceFilter(event.target.value as 'All' | 'Invoice' | 'Receipt' | 'Credit note')}
            >
              {(['All', 'Invoice', 'Receipt', 'Credit note'] as const).map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All documents' : option}
                </option>
              ))}
            </select>
            <button type="button" className="sa-btn primary" onClick={exportInvoices}>
              Export CSV
            </button>
            <span className="sa-toolbar-meta">
              {filteredInvoices.length} of {invoiceRecords.length} documents
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Kind</th>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>City</th>
                  <th>Amount</th>
                  <th>Payment reference</th>
                  <th>Issued</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">{row.id}</td>
                    <td>
                      <span className="sa-pill slate">{row.kind}</span>
                    </td>
                    <td>{row.bookingId}</td>
                    <td>{row.customer}</td>
                    <td>{row.city}</td>
                    <td className="sa-num">{inr(row.amount)}</td>
                    <td className="sa-cell-strong">{row.reference}</td>
                    <td>{row.issued}</td>
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

      {tab === 'reports' && (
        <>
          <div className="sa-toolbar">
            <span className="sa-panel-sub">Generate financial summaries and export permitted reports for {period.toLowerCase()}.</span>
            <button
              type="button"
              className="sa-btn primary"
              onClick={() =>
                downloadCsv('state_financial_summary.csv', [
                  ['Metric', 'Value'],
                  ['Rent collected', totals.collected],
                  ['Pending', totals.pending],
                  ['Failed', totals.failed],
                  ['Refunded', totals.refunded],
                  ['Outstanding rent', totals.outstanding],
                  ['Overdue accounts', totals.overdueCount],
                ])
              }
            >
              Export summary CSV
            </button>
          </div>
          <div className="sa-report-grid">
            {financeReports.map((report) => (
              <div key={report.id} className="sa-report-card">
                <h4>{report.title}</h4>
                <p>{report.detail}</p>
                <div className="sa-chip-row">
                  <span className="sa-pill slate">{report.period}</span>
                  <span className={`sa-pill ${report.permitted ? 'green' : 'amber'}`}>
                    {report.permitted ? 'Export permitted' : 'Not permitted'}
                  </span>
                </div>
                <button
                  type="button"
                  className="sa-btn-ghost"
                  disabled={!report.permitted}
                  onClick={() =>
                    downloadCsv(`${report.id}_${period.replace(/\s+/g, '_').toLowerCase()}.csv`, [
                      ['Report', report.title],
                      ['Period', report.period],
                      ['Generated by', 'State Admin'],
                      [],
                      ['Metric', 'Value'],
                      ['Rent collected', totals.collected],
                      ['Pending', totals.pending],
                      ['Failed', totals.failed],
                      ['Refunded', totals.refunded],
                      ['Outstanding rent', totals.outstanding],
                      ['Overdue accounts', totals.overdueCount],
                    ])
                  }
                >
                  {report.permitted ? 'Generate & export' : 'Access restricted'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'audit' && (
        <>
          <div className="sa-toolbar">
            <span className="sa-panel-sub">Finance-related audit trail · read-only</span>
            <button type="button" className="sa-btn primary" onClick={exportAudit}>
              Export CSV
            </button>
            {onOpenAudit && (
              <button type="button" className="sa-btn-ghost" onClick={onOpenAudit}>
                Open full audit logs →
              </button>
            )}
          </div>
          <div className="sa-approval-list">
            {financeAuditEntries.map((entry) => (
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
