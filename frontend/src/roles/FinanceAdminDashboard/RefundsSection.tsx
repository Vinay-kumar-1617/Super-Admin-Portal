import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import type { Refund, RefundStatus } from './financeAdminData'

type RefundsSectionProps = {
  refunds: Refund[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onProcess: (id: string) => void
}

const statusFilters: Array<'All' | RefundStatus> = ['All', 'Pending', 'Approved', 'Processed', 'Rejected']

export default function RefundsSection({ refunds, onApprove, onReject, onProcess }: RefundsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | RefundStatus>('All')
  const [query, setQuery] = useState('')

  const rows = useMemo(
    () =>
      refunds.filter(
        (item) =>
          (statusFilter === 'All' || item.status === statusFilter) &&
          (query.trim() === '' ||
            item.id.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.booking.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.customer.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [refunds, statusFilter, query],
  )

  const pending = refunds.filter((item) => item.status === 'Pending')
  const aboveCap = refunds.filter((item) => item.numericAmount > item.supportCap && item.status !== 'Rejected')
  const flagged = refunds.filter((item) => item.flagged)

  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Refund approvals</h3>
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
          <span>Pending</span>
          <strong>{pending.length}</strong>
        </div>
        <div className="sa-stat">
          <span>Above support cap</span>
          <strong>{aboveCap.length}</strong>
        </div>
        <div className="sa-stat">
          <span>Flagged unusual</span>
          <strong>{flagged.length}</strong>
        </div>
      </div>

      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search refunds"
          placeholder="Search refund id, booking or customer..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="sa-toolbar-meta">
          {rows.length} of {refunds.length} refunds · amounts above the support cap need finance approval
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
                <th>Booking / dispute</th>
                <th>Amount</th>
                <th>Support cap</th>
                <th>Decision</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td className="sa-cell-strong">
                    {item.customer}
                    <span className="sa-cell-sub">
                      {item.id}
                      {item.flagged && <span className="sa-pill red"> flagged</span>}
                    </span>
                  </td>
                  <td className="sa-cell-sub">
                    {item.booking}
                    <span className="sa-cell-sub">{item.dispute}</span>
                  </td>
                  <td className="sa-num">{item.amount}</td>
                  <td className="sa-num">₹{item.supportCap.toLocaleString('en-IN')}</td>
                  <td className="sa-cell-sub">{item.decision}</td>
                  <td>
                    <StatusPill status={item.status} />
                  </td>
                  <td>
                    <span className="sa-inline-edit">
                      {item.status === 'Pending' && (
                        <>
                          <button type="button" className="sa-btn approve" onClick={() => onApprove(item.id)}>
                            Approve
                          </button>
                          <button type="button" className="sa-btn reject" onClick={() => onReject(item.id)}>
                            Reject
                          </button>
                        </>
                      )}
                      {item.status === 'Approved' && (
                        <button type="button" className="sa-btn approve" onClick={() => onProcess(item.id)}>
                          Process refund
                        </button>
                      )}
                      {(item.status === 'Processed' || item.status === 'Rejected') && (
                        <span className="sa-cell-sub">Linked to {item.booking}</span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
