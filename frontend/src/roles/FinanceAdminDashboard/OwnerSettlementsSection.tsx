import { useMemo, useState, type FormEvent } from 'react'
import { financeApprovers } from './financeApprovalData'
import { StatusPill } from './shared'
import {
  ownerPayoutMethods,
  type OwnerPayoutMethod,
  type OwnerSettlement,
  type OwnerSettlementStatus,
} from './ownerSettlementData'

type OwnerSettlementsSectionProps = {
  settlements: OwnerSettlement[]
  onApprove: (id: string, approver: string) => void
  onReject: (id: string, approver: string, reason: string) => void
  onPay: (id: string, reference: string) => void
  onPayoutMethodChange: (id: string, method: OwnerPayoutMethod) => void
}

const statusFilters: Array<'All' | OwnerSettlementStatus> = [
  'All',
  'Pending',
  'Approved',
  'Paid',
  'Rejected',
]

const formatCurrency = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`
const csvCell = (value: string | number) => {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const downloadStatement = (settlement: OwnerSettlement) => {
  const rows: Array<[string, string | number]> = [
    ['Owner settlement statement', settlement.id],
    ['Owner', settlement.owner],
    ['Period', settlement.period],
    ['Cadence', settlement.cadence],
    ['Status', settlement.status],
    ['Payout method', settlement.payoutMethod],
    ['Gross rental earnings', settlement.grossRentalEarnings],
    ['Platform commission', -settlement.platformCommission],
    ['Approved expenses', -settlement.approvedExpenses],
    ['Deductions', -settlement.deductions],
    ['Taxable amount', settlement.taxableAmount],
    ['Tax withheld', -settlement.taxAmount],
    ['Net payable amount', settlement.netPayable],
    ['Requested by', settlement.requestedBy],
    ['Requested at', settlement.requestedAt],
    ['Approver', settlement.approvedBy ?? '—'],
    ['Approved at', settlement.approvedAt ?? '—'],
    ['Rejected by', settlement.rejectedBy ?? '—'],
    ['Rejected at', settlement.rejectedAt ?? '—'],
    ['Rejection reason', settlement.rejectionReason ?? '—'],
    ['Payment reference', settlement.paymentReference ?? '—'],
    ['Paid at', settlement.paidAt ?? '—'],
  ]
  const content = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${settlement.id}-statement.csv`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function OwnerSettlementsSection({
  settlements,
  onApprove,
  onReject,
  onPay,
  onPayoutMethodChange,
}: OwnerSettlementsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | OwnerSettlementStatus>('All')
  const [periodFilter, setPeriodFilter] = useState('All')
  const [ownerFilter, setOwnerFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(settlements[0]?.id ?? '')
  const [approver, setApprover] = useState(financeApprovers[0].name)
  const [rejectionReason, setRejectionReason] = useState('')
  const [paymentReference, setPaymentReference] = useState('')

  const periods = useMemo(() => [...new Set(settlements.map((item) => item.period))], [settlements])
  const owners = useMemo(() => [...new Set(settlements.map((item) => item.owner))].sort(), [settlements])
  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return settlements.filter((item) =>
      (statusFilter === 'All' || item.status === statusFilter) &&
      (periodFilter === 'All' || item.period === periodFilter) &&
      (ownerFilter === 'All' || item.owner === ownerFilter) &&
      (search === '' || [item.id, item.owner, item.period, item.payoutMethod, item.paymentReference ?? '']
        .some((value) => value.toLowerCase().includes(search))),
    )
  }, [settlements, statusFilter, periodFilter, ownerFilter, query])

  const selected = rows.find((item) => item.id === selectedId) ?? rows[0]
  const pendingCount = settlements.filter((item) => item.status === 'Pending').length
  const paidTotal = settlements.filter((item) => item.status === 'Paid').reduce((sum, item) => sum + item.netPayable, 0)
  const payableTotal = settlements.filter((item) => item.status !== 'Paid' && item.status !== 'Rejected').reduce((sum, item) => sum + item.netPayable, 0)

  const submitRejection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected || !rejectionReason.trim()) return
    onReject(selected.id, approver, rejectionReason)
    setRejectionReason('')
  }

  const submitPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected || !paymentReference.trim()) return
    onPay(selected.id, paymentReference)
    setPaymentReference('')
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Owner settlement center</h3>
            <span className="sa-panel-sub">One independent finance approval is required for each settlement. No second approval is required for high-value settlements.</span>
          </div>
          <label className="sa-inline-edit">
            <span className="sa-cell-sub">Acting approver</span>
            <select className="sa-input" aria-label="Owner settlement approver" value={approver} onChange={(event) => setApprover(event.target.value)}>
              {financeApprovers.map((item) => <option key={item.name} value={item.name}>{item.name} · {item.role}</option>)}
            </select>
          </label>
        </div>

        <div className="sa-stat-strip">
          <div className="sa-stat"><span>Open settlements</span><strong>{pendingCount}</strong></div>
          <div className="sa-stat"><span>Approval rule</span><strong>One approver</strong></div>
          <div className="sa-stat"><span>Outstanding net payable</span><strong>{formatCurrency(payableTotal)}</strong></div>
          <div className="sa-stat"><span>Paid in history</span><strong>{formatCurrency(paidTotal)}</strong></div>
        </div>

        <div className="sa-toolbar">
          <select className="sa-input" aria-label="Select owner" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option value="All">All owners</option>
            {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
          <input className="sa-input" aria-label="Search owner settlements" placeholder="Search owner, settlement ID or payment reference..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="sa-input" aria-label="Filter owner settlement period" value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}>
            <option value="All">All settlement periods</option>
            {periods.map((period) => <option key={period} value={period}>{period}</option>)}
          </select>
          <span className="sa-toolbar-meta">{rows.length} of {settlements.length} settlements</span>
        </div>
        <div className="sa-chip-row">
          {statusFilters.map((status) => (
            <button key={status} type="button" className={`sa-chip ${statusFilter === status ? 'active orange' : ''}`} onClick={() => setStatusFilter(status)}>{status}</button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty"><p>No owner settlements match these filters.</p></div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Owner / period</th><th>Gross rental</th><th>Commission</th><th>Costs & tax</th><th>Net payable</th><th>Method</th><th>Status</th><th>Statement</th></tr></thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className={selected?.id === item.id ? 'sa-row-selected' : undefined}>
                    <td className="sa-cell-strong">
                      {item.owner}
                      <span className="sa-cell-sub">{item.id} · {item.period} · {item.cadence}</span>
                      <button
                        type="button"
                        className="sa-view-link"
                        onClick={() => {
                          setOwnerFilter(item.owner)
                          setSelectedId(item.id)
                        }}
                      >
                        View this owner
                      </button>
                    </td>
                    <td className="sa-num">{formatCurrency(item.grossRentalEarnings)}</td>
                    <td className="sa-num">−{formatCurrency(item.platformCommission)}</td>
                    <td className="sa-num">−{formatCurrency(item.approvedExpenses + item.deductions + item.taxAmount)}</td>
                    <td className="sa-num sa-cell-strong">{formatCurrency(item.netPayable)}</td>
                    <td>
                      <select
                        className="sa-input"
                        aria-label={`Payout method for ${item.owner}`}
                        value={item.payoutMethod}
                        disabled={item.status === 'Paid'}
                        onChange={(event) => onPayoutMethodChange(item.id, event.target.value as OwnerPayoutMethod)}
                      >
                        {ownerPayoutMethods.map((method) => <option key={method} value={method}>{method}</option>)}
                      </select>
                    </td>
                    <td><StatusPill status={item.status} /></td>
                    <td>
                      <button type="button" className="sa-btn-ghost" onClick={() => { setSelectedId(item.id); downloadStatement(item) }}>Download</button>
                      <button
                        type="button"
                        className="sa-btn-ghost"
                        onClick={() => {
                          setOwnerFilter(item.owner)
                          setSelectedId(item.id)
                        }}
                      >
                        {selected?.id === item.id && ownerFilter === item.owner ? 'Selected' : 'View details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="sa-toolbar-meta">Net payable = gross rental earnings − platform commission − approved expenses − deductions − tax withheld.</p>
      </section>

      {selected && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <div>
              <h3>{selected.owner} · settlement details</h3>
              <span className="sa-panel-sub">{selected.id} · {selected.period} · {selected.cadence} · method {selected.payoutMethod}</span>
            </div>
            <StatusPill status={selected.status} />
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <tbody>
                <tr><td>Gross rental earnings</td><td className="sa-num">{formatCurrency(selected.grossRentalEarnings)}</td></tr>
                <tr><td>Platform commission</td><td className="sa-num">−{formatCurrency(selected.platformCommission)}</td></tr>
                <tr><td>Approved expenses</td><td className="sa-num">−{formatCurrency(selected.approvedExpenses)}</td></tr>
                <tr><td>Deductions</td><td className="sa-num">−{formatCurrency(selected.deductions)}</td></tr>
                <tr><td>Taxable amount</td><td className="sa-num">{formatCurrency(selected.taxableAmount)}</td></tr>
                <tr><td>Tax withheld</td><td className="sa-num">−{formatCurrency(selected.taxAmount)}</td></tr>
                <tr><td className="sa-cell-strong">Net payable</td><td className="sa-num sa-cell-strong">{formatCurrency(selected.netPayable)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="sa-stat-strip">
            <div className="sa-stat"><span>Requested by</span><strong>{selected.requestedBy}</strong></div>
            <div className="sa-stat"><span>Requested at</span><strong>{selected.requestedAt}</strong></div>
            <div className="sa-stat"><span>Approved by</span><strong>{selected.approvedBy ?? '—'}</strong></div>
            <div className="sa-stat"><span>Approved at</span><strong>{selected.approvedAt ?? '—'}</strong></div>
            <div className="sa-stat"><span>Rejected by</span><strong>{selected.rejectedBy ?? '—'}</strong></div>
            <div className="sa-stat"><span>Payment reference</span><strong>{selected.paymentReference ?? '—'}</strong></div>
          </div>
          {selected.rejectionReason && <p className="cf-review-reason">Rejected by {selected.rejectedBy ?? '—'} at {selected.rejectedAt ?? '—'}. Reason: {selected.rejectionReason}</p>}

          {selected.status === 'Pending' && (
            <div className="sa-form-actions">
              <button type="button" className="sa-btn approve" onClick={() => onApprove(selected.id, approver)}>Approve settlement</button>
              <form className="sa-inline-edit" onSubmit={submitRejection}>
                <input className="sa-input" aria-label="Settlement rejection reason" placeholder="Required rejection reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} required />
                <button type="submit" className="sa-btn reject">Reject</button>
              </form>
            </div>
          )}
          {selected.status === 'Approved' && (
            <form className="sa-form-actions" onSubmit={submitPayment}>
              <input className="sa-input" aria-label="Payout reference" placeholder="Enter bank / gateway payment reference" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} required />
              <button type="submit" className="sa-btn approve">Record payout</button>
            </form>
          )}

          <div className="sa-panel-header"><h3>Approval & payment history</h3></div>
          {selected.history.length === 0 ? (
            <div className="sa-empty"><p>No activity has been recorded for this settlement yet.</p></div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead><tr><th>Timestamp</th><th>Actor</th><th>Event</th><th>Details</th></tr></thead>
                <tbody>
                  {[...selected.history].reverse().map((event, index) => (
                    <tr key={`${event.at}-${event.action}-${index}`}>
                      <td className="sa-num">{event.at}</td><td className="sa-cell-strong">{event.actor}</td><td>{event.action}</td><td className="sa-cell-sub">{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  )
}
