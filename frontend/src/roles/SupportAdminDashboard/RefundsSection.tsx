import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import type { NewRefundInput } from './useSupportAdmin'
import type { SupportRefund, SupportRefundStatus } from './supportAdminData'

type SupportRefundsSectionProps = {
  refunds: SupportRefund[]
  cap: string
  capValue: number
  onCreate: (input: NewRefundInput) => string
  onEscalate: (id: string) => void
  onProcess: (id: string) => void
  onReject: (id: string) => void
}

const statusFilters: Array<'All' | SupportRefundStatus> = ['All', 'Draft', 'Escalated', 'Approved', 'Processed', 'Rejected']

export default function RefundsSection({ refunds, cap, capValue, onCreate, onEscalate, onProcess, onReject }: SupportRefundsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | SupportRefundStatus>('All')
  const [query, setQuery] = useState('')
  const [booking, setBooking] = useState('')
  const [ticket, setTicket] = useState('')
  const [customer, setCustomer] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState('')

  const rows = useMemo(
    () =>
      refunds.filter(
        (item) =>
          (statusFilter === 'All' || item.status === statusFilter) &&
          (query.trim() === '' ||
            item.id.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.customer.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.booking.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [refunds, statusFilter, query],
  )

  const amountValue = Number(amount)
  const aboveCap = Number.isFinite(amountValue) && amountValue > capValue
  const escalated = refunds.filter((item) => item.status === 'Escalated').length

  const submit = () => {
    if (!booking.trim()) {
      setFormError('Enter the booking id this refund relates to.')
      return
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError('Enter a refund amount greater than zero.')
      return
    }
    if (reason.trim().length < 4) {
      setFormError('Enter a reason (min 4 characters).')
      return
    }
    onCreate({ booking: booking.trim(), ticket: ticket.trim() || '—', customer: customer.trim() || 'Customer', amount: amountValue, reason: reason.trim(), cap: capValue })
    setBooking('')
    setTicket('')
    setCustomer('')
    setAmount('')
    setReason('')
    setFormError('')
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Create a refund</h3>
          <span className="sa-panel-sub">Up to {cap} · above the cap is escalated to the finance admin</span>
        </div>
        <div className="sa-form-grid">
          <label className="sa-field">
            <span>Booking</span>
            <input className="sa-input" placeholder="e.g. BK-88310" value={booking} onChange={(event) => setBooking(event.target.value)} />
          </label>
          <label className="sa-field">
            <span>Ticket</span>
            <input className="sa-input" placeholder="e.g. TK-4772" value={ticket} onChange={(event) => setTicket(event.target.value)} />
          </label>
          <label className="sa-field">
            <span>Customer</span>
            <input className="sa-input" placeholder="Customer name" value={customer} onChange={(event) => setCustomer(event.target.value)} />
          </label>
          <label className="sa-field">
            <span>Amount (₹)</span>
            <input className="sa-input" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label className="sa-field" style={{ gridColumn: '1 / -1' }}>
            <span>Reason</span>
            <input
              className="sa-input"
              placeholder="Cancellation, dispute, damage deduction…"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
        </div>
        {formError && <p className="sa-form-error">{formError}</p>}
        <div className="sa-form-actions">
          <button type="button" className={`sa-btn ${aboveCap ? 'reject' : 'approve'}`} onClick={submit}>
            {aboveCap ? 'Escalate to finance admin' : 'Create refund'}
          </button>
          <span className="sa-panel-sub">
            {aboveCap ? `₹${amountValue.toLocaleString('en-IN')} is above the ${cap} support cap.` : `Within the ${cap} support cap.`}
          </span>
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Refund tracking</h3>
          <div className="sa-chip-row">
            {statusFilters.map((option) => (
              <button
                key={option}
                type="button"
                className={`sa-chip ${statusFilter === option ? 'active orange' : ''}`}
                onClick={() => setStatusFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="sa-stat-strip">
          <div className="sa-stat">
            <span>Total refunds</span>
            <strong>{refunds.length}</strong>
          </div>
          <div className="sa-stat">
            <span>Escalated</span>
            <strong>{escalated}</strong>
          </div>
          <div className="sa-stat">
            <span>Support cap</span>
            <strong>{cap}</strong>
          </div>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search refunds"
            placeholder="Search refund id, customer or booking..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="sa-toolbar-meta">
            {rows.length} of {refunds.length} refunds
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No refunds match the current filters.</p>
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                setStatusFilter('All')
                setQuery('')
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Refund</th>
                  <th>Booking / ticket</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="sa-cell-strong">
                      {item.customer}
                      <span className="sa-cell-sub">{item.id} · {item.createdAt}</span>
                    </td>
                    <td className="sa-cell-sub">
                      {item.booking}
                      <span className="sa-cell-sub">{item.ticket}</span>
                    </td>
                    <td className="sa-num">{item.amount}</td>
                    <td className="sa-cell-sub">{item.reason}</td>
                    <td>
                      <StatusPill status={item.status} />
                    </td>
                    <td className="sa-cell-sub">{item.note}</td>
                    <td>
                      <span className="sa-inline-edit">
                        {item.status === 'Draft' && (
                          <button type="button" className="sa-btn approve" onClick={() => onEscalate(item.id)}>
                            Escalate
                          </button>
                        )}
                        {item.status === 'Approved' && (
                          <button type="button" className="sa-btn approve" onClick={() => onProcess(item.id)}>
                            Process
                          </button>
                        )}
                        {item.status !== 'Processed' && item.status !== 'Rejected' && (
                          <button type="button" className="sa-btn reject" onClick={() => onReject(item.id)}>
                            Reject
                          </button>
                        )}
                        {(item.status === 'Processed' || item.status === 'Rejected') && <span className="sa-cell-sub">Closed</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
