import { useMemo, useState, type FormEvent } from 'react'
import { financeApprovers } from './financeApprovalData'
import { StatusPill } from './shared'
import {
  operatorPaymentMethods,
  type OperatorPayment,
  type OperatorPaymentCycle,
  type OperatorPaymentMethod,
  type OperatorPaymentStatus,
} from './operatorPaymentData'

type OperatorPaymentsSectionProps = {
  payments: OperatorPayment[]
  onApprove: (id: string, approver: string) => void
  onReject: (id: string, approver: string, reason: string) => void
  onPay: (id: string, reference: string) => void
  onMethodChange: (id: string, method: OperatorPaymentMethod) => void
}

const statuses: Array<'All' | OperatorPaymentStatus> = ['All', 'Pending', 'Approved', 'Paid', 'Rejected']
const cycles: Array<'All' | OperatorPaymentCycle> = ['All', 'Weekly', 'Fortnightly', 'Monthly']
const currency = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`
const csvCell = (value: string | number) => {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const downloadReceipt = (payment: OperatorPayment) => {
  const rows: Array<[string, string | number]> = [
    ['Operator payment receipt', payment.id],
    ['Operator', payment.operator],
    ['Operator code', payment.operatorCode],
    ['Phone', payment.phone],
    ['Payment period', payment.period],
    ['Cycle', payment.cycle],
    ['Status', payment.status],
    ['Payment method', payment.payoutMethod],
    ['Rental jobs', payment.jobs.length],
    ['Regular hours', payment.jobs.reduce((sum, job) => sum + job.regularHours, 0)],
    ['Overtime hours', payment.jobs.reduce((sum, job) => sum + job.overtimeHours, 0)],
    ['Base wages', payment.jobs.reduce((sum, job) => sum + job.basePay, 0)],
    ['Overtime pay', payment.jobs.reduce((sum, job) => sum + job.overtimePay, 0)],
    ['Allowances', payment.allowances],
    ['Bonuses', payment.bonuses],
    ['Gross wages', payment.grossWages],
    ['Deductions', -payment.deductions],
    ['Tax withheld', -payment.taxWithheld],
    ['Net wages', payment.netWages],
    ['Requested by', payment.requestedBy],
    ['Requested at', payment.requestedAt],
    ['Approved by', payment.approvedBy ?? '—'],
    ['Approved at', payment.approvedAt ?? '—'],
    ['Payment reference', payment.paymentReference ?? '—'],
    ['Paid at', payment.paidAt ?? '—'],
    ['Rejection reason', payment.rejectionReason ?? '—'],
  ]
  const receiptRows = payment.jobs.flatMap((job) => [
    [`Job ${job.id}`, `${job.equipment} · ${job.location} · ${job.workDate}`],
    [`Job ${job.id} hours`, `Regular ${job.regularHours} · Overtime ${job.overtimeHours}`],
    [`Job ${job.id} pay`, `Base ${job.basePay} · Overtime ${job.overtimePay}`],
  ])
  const content = [...rows, ...receiptRows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${payment.id}-receipt.csv`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function OperatorPaymentsSection({
  payments,
  onApprove,
  onReject,
  onPay,
  onMethodChange,
}: OperatorPaymentsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | OperatorPaymentStatus>('All')
  const [cycleFilter, setCycleFilter] = useState<'All' | OperatorPaymentCycle>('All')
  const [operatorFilter, setOperatorFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(payments[0]?.id ?? '')
  const [approver, setApprover] = useState(financeApprovers[0].name)
  const [reason, setReason] = useState('')
  const [paymentReference, setPaymentReference] = useState('')

  const operators = useMemo(() => [...new Set(payments.map((payment) => payment.operator))].sort(), [payments])
  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return payments.filter((payment) =>
      (statusFilter === 'All' || payment.status === statusFilter) &&
      (cycleFilter === 'All' || payment.cycle === cycleFilter) &&
      (operatorFilter === 'All' || payment.operator === operatorFilter) &&
      (search === '' || [payment.id, payment.operator, payment.operatorCode, payment.period, payment.paymentReference ?? '']
        .some((value) => value.toLowerCase().includes(search))),
    )
  }, [payments, statusFilter, cycleFilter, operatorFilter, query])

  const selected = rows.find((payment) => payment.id === selectedId) ?? rows[0]
  const pending = payments.filter((payment) => payment.status === 'Pending')
  const approved = payments.filter((payment) => payment.status === 'Approved')
  const pendingTotal = pending.reduce((sum, payment) => sum + payment.netWages, 0)
  const paidTotal = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.netWages, 0)

  const submitReject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected || !reason.trim()) return
    onReject(selected.id, approver, reason)
    setReason('')
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
            <h3>Operator payment center</h3>
            <span className="sa-panel-sub">Rental jobs, hours, overtime, allowances, deductions and payment receipts</span>
          </div>
          <label className="sa-inline-edit">
            <span className="sa-cell-sub">Acting approver</span>
            <select className="sa-input" aria-label="Operator payment approver" value={approver} onChange={(event) => setApprover(event.target.value)}>
              {financeApprovers.map((item) => <option key={item.name} value={item.name}>{item.name} · {item.role}</option>)}
            </select>
          </label>
        </div>
        <div className="sa-stat-strip">
          <div className="sa-stat"><span>Pending approvals</span><strong>{pending.length}</strong></div>
          <div className="sa-stat"><span>Pending net wages</span><strong>{currency(pendingTotal)}</strong></div>
          <div className="sa-stat"><span>Approved for payout</span><strong>{approved.length}</strong></div>
          <div className="sa-stat"><span>Paid this period</span><strong>{currency(paidTotal)}</strong></div>
        </div>
        <div className="sa-toolbar">
          <input className="sa-input" aria-label="Search operator payments" placeholder="Search operator, payment ID, code or UTR..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="sa-input" aria-label="Filter operator" value={operatorFilter} onChange={(event) => setOperatorFilter(event.target.value)}>
            <option value="All">All operators</option>
            {operators.map((operator) => <option key={operator} value={operator}>{operator}</option>)}
          </select>
          <select className="sa-input" aria-label="Filter payment cycle" value={cycleFilter} onChange={(event) => setCycleFilter(event.target.value as 'All' | OperatorPaymentCycle)}>
            {cycles.map((cycle) => <option key={cycle} value={cycle}>{cycle === 'All' ? 'All payment cycles' : cycle}</option>)}
          </select>
          <span className="sa-toolbar-meta">{rows.length} of {payments.length} payment records</span>
        </div>
        <div className="sa-chip-row">
          {statuses.map((status) => <button key={status} type="button" className={`sa-chip ${statusFilter === status ? 'active orange' : ''}`} onClick={() => setStatusFilter(status)}>{status}</button>)}
        </div>
        {rows.length === 0 ? (
          <div className="sa-empty"><p>No operator payments match the selected filters.</p></div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Operator / cycle</th><th>Jobs / hours</th><th>Gross wages</th><th>Deductions & tax</th><th>Net wages</th><th>Method</th><th>Status</th><th>Receipt</th></tr></thead>
              <tbody>
                {rows.map((payment) => (
                  <tr key={payment.id} className={selected?.id === payment.id ? 'sa-row-selected' : undefined}>
                    <td className="sa-cell-strong">{payment.operator}<span className="sa-cell-sub">{payment.id} · {payment.operatorCode} · {payment.period} · {payment.cycle}</span><span className="sa-cell-sub">{payment.phone}</span></td>
                    <td className="sa-num">{payment.jobs.length} jobs<span className="sa-cell-sub">{payment.jobs.reduce((sum, job) => sum + job.regularHours, 0)} regular h · {payment.jobs.reduce((sum, job) => sum + job.overtimeHours, 0)} overtime h</span></td>
                    <td className="sa-num">{currency(payment.grossWages)}</td>
                    <td className="sa-num">−{currency(payment.deductions + payment.taxWithheld)}</td>
                    <td className="sa-num sa-cell-strong">{currency(payment.netWages)}</td>
                    <td>
                      <select className="sa-input" aria-label={`Payment method for ${payment.operator}`} value={payment.payoutMethod} disabled={payment.status === 'Paid'} onChange={(event) => onMethodChange(payment.id, event.target.value as OperatorPaymentMethod)}>
                        {operatorPaymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
                      </select>
                    </td>
                    <td><StatusPill status={payment.status} /></td>
                    <td>
                      <button type="button" className="sa-btn-ghost" onClick={() => downloadReceipt(payment)}>Receipt</button>
                      <button type="button" className="sa-btn-ghost" onClick={() => setSelectedId(payment.id)}>{selected?.id === payment.id ? 'Selected' : 'Details'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <div>
              <h3>{selected.operator} · wage breakdown</h3>
              <span className="sa-panel-sub">{selected.id} · {selected.operatorCode} · {selected.period} · {selected.cycle}</span>
            </div>
            <StatusPill status={selected.status} />
          </div>
          <div className="sa-stat-strip">
            <div className="sa-stat"><span>Regular working hours</span><strong>{selected.jobs.reduce((sum, job) => sum + job.regularHours, 0)}</strong></div>
            <div className="sa-stat"><span>Overtime hours</span><strong>{selected.jobs.reduce((sum, job) => sum + job.overtimeHours, 0)}</strong></div>
            <div className="sa-stat"><span>Base pay</span><strong>{currency(selected.jobs.reduce((sum, job) => sum + job.basePay, 0))}</strong></div>
            <div className="sa-stat"><span>Overtime pay</span><strong>{currency(selected.jobs.reduce((sum, job) => sum + job.overtimePay, 0))}</strong></div>
            <div className="sa-stat"><span>Allowances</span><strong>{currency(selected.allowances)}</strong></div>
            <div className="sa-stat"><span>Bonuses</span><strong>{currency(selected.bonuses)}</strong></div>
            <div className="sa-stat"><span>Deductions</span><strong>−{currency(selected.deductions)}</strong></div>
            <div className="sa-stat"><span>Tax withheld</span><strong>−{currency(selected.taxWithheld)}</strong></div>
            <div className="sa-stat"><span>Net wages</span><strong>{currency(selected.netWages)}</strong></div>
          </div>
          <div className="sa-toolbar-meta">Net wages = job base pay + overtime + allowances + bonuses − deductions − tax withheld.</div>

          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Rental job</th><th>Equipment / location</th><th>Work date</th><th>Regular hours</th><th>Overtime</th><th>Base pay</th><th>Overtime pay</th></tr></thead>
              <tbody>
                {selected.jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="sa-cell-strong">{job.id}</td><td>{job.equipment}<span className="sa-cell-sub">{job.location}</span></td><td className="sa-num">{job.workDate}</td><td className="sa-num">{job.regularHours}</td><td className="sa-num">{job.overtimeHours}</td><td className="sa-num">{currency(job.basePay)}</td><td className="sa-num">{currency(job.overtimePay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sa-stat-strip">
            <div className="sa-stat"><span>Requested by</span><strong>{selected.requestedBy}</strong></div>
            <div className="sa-stat"><span>Requested at</span><strong>{selected.requestedAt}</strong></div>
            <div className="sa-stat"><span>Approved by</span><strong>{selected.approvedBy ?? '—'}</strong></div>
            <div className="sa-stat"><span>Approved at</span><strong>{selected.approvedAt ?? '—'}</strong></div>
            <div className="sa-stat"><span>Payment reference</span><strong>{selected.paymentReference ?? '—'}</strong></div>
            <div className="sa-stat"><span>Paid at</span><strong>{selected.paidAt ?? '—'}</strong></div>
          </div>
          {selected.rejectionReason && <p className="cf-review-reason">Rejected by {selected.rejectedBy} at {selected.rejectedAt}: {selected.rejectionReason}</p>}
          {selected.status === 'Pending' && (
            <div className="sa-form-actions">
              <button type="button" className="sa-btn approve" onClick={() => onApprove(selected.id, approver)}>Approve payment</button>
              <form className="sa-inline-edit" onSubmit={submitReject}>
                <input className="sa-input" aria-label="Operator payment rejection reason" placeholder="Required rejection reason" value={reason} onChange={(event) => setReason(event.target.value)} required />
                <button type="submit" className="sa-btn reject">Reject</button>
              </form>
            </div>
          )}
          {selected.status === 'Approved' && (
            <form className="sa-form-actions" onSubmit={submitPayment}>
              <input className="sa-input" aria-label="Operator payment reference" placeholder="Enter bank / gateway transaction reference" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} required />
              <button type="submit" className="sa-btn approve">Record payout</button>
            </form>
          )}
          <div className="sa-panel-header"><h3>Payout history</h3></div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Timestamp</th><th>Actor</th><th>Event</th><th>Details</th></tr></thead>
              <tbody>
                {[...selected.history].reverse().map((event, index) => (
                  <tr key={`${event.at}-${event.action}-${index}`}><td className="sa-num">{event.at}</td><td className="sa-cell-strong">{event.actor}</td><td>{event.action}</td><td className="sa-cell-sub">{event.detail}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="sa-btn-ghost" onClick={() => downloadReceipt(selected)}>Download payment receipt</button>
        </section>
      )}
    </>
  )
}
