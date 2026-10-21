import { useMemo, useState } from 'react'
import { ScopePill, StatusPill } from './shared'
import type { Payout, PayoutStatus } from './financeAdminData'

type PayoutsSectionProps = {
  payouts: Payout[]
  approvalLimit: string
  onApprove: (id: string) => void
  onSecondApproval: (id: string) => void
  onHold: (id: string, reason: string) => void
  onRelease: (id: string) => void
  onReject: (id: string, reason: string) => void
  onRetry: (id: string) => void
}

const statusFilters: Array<'All' | PayoutStatus> = [
  'All',
  'Pending',
  'Awaiting second approval',
  'Approved',
  'Paid',
  'Failed',
  'Held',
  'Rejected',
]

export default function PayoutsSection({
  payouts,
  approvalLimit,
  onApprove,
  onSecondApproval,
  onHold,
  onRelease,
  onReject,
  onRetry,
}: PayoutsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | PayoutStatus>('All')
  const [query, setQuery] = useState('')
  const [reason, setReason] = useState('')

  const rows = useMemo(
    () =>
      payouts.filter(
        (item) =>
          (statusFilter === 'All' || item.status === statusFilter) &&
          (query.trim() === '' ||
            item.id.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.payee.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [payouts, statusFilter, query],
  )

  const openItems = payouts.filter((item) => item.status === 'Pending' || item.status === 'Awaiting second approval')
  const aboveLimit = payouts.filter((item) => item.aboveLimit && item.status !== 'Paid' && item.status !== 'Rejected')
  const failed = payouts.filter((item) => item.status === 'Failed')

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Payout approvals</h3>
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
            <span>Open payouts</span>
            <strong>{openItems.length}</strong>
          </div>
          <div className="sa-stat">
            <span>Above limit</span>
            <strong>{aboveLimit.length}</strong>
          </div>
          <div className="sa-stat">
            <span>Failed</span>
            <strong>{failed.length}</strong>
          </div>
          <div className="sa-stat">
            <span>Approval limit</span>
            <strong>{approvalLimit}</strong>
          </div>
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search payouts"
            placeholder="Search payout id or payee..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <input
            className="sa-input"
            aria-label="Reason for hold or reject"
            placeholder="Reason (used for hold / reject)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <span className="sa-toolbar-meta">
            {rows.length} of {payouts.length} payouts
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No payouts match the current filters.</p>
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
                  <th>Payout</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Settlement</th>
                  <th>Limit</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="sa-cell-strong">
                      {item.payee}
                      <span className="sa-cell-sub">
                        {item.id} · <ScopePill value={item.payeeType} />
                      </span>
                    </td>
                    <td className="sa-num">{item.amount}</td>
                    <td className="sa-num">{item.method}</td>
                    <td className="sa-num">{item.settlement}</td>
                    <td>
                      <span className={`sa-pill ${item.aboveLimit ? 'red' : 'slate'}`}>
                        {item.aboveLimit ? 'Above limit' : 'Within limit'}
                      </span>
                    </td>
                    <td>
                      <StatusPill status={item.status} />
                    </td>
                    <td className="sa-cell-sub">{item.reason || '—'}</td>
                    <td>
                      <span className="sa-inline-edit">
                        {item.status === 'Pending' && (
                          <button type="button" className="sa-btn approve" onClick={() => onApprove(item.id)}>
                            {item.aboveLimit ? 'Approve & escalate' : 'Approve'}
                          </button>
                        )}
                        {item.status === 'Awaiting second approval' && (
                          <button type="button" className="sa-btn approve" onClick={() => onSecondApproval(item.id)}>
                            Second approval
                          </button>
                        )}
                        {(item.status === 'Pending' || item.status === 'Awaiting second approval') && (
                          <button type="button" className="sa-btn-ghost" onClick={() => onHold(item.id, reason)}>
                            Hold
                          </button>
                        )}
                        {item.status === 'Held' && (
                          <button type="button" className="sa-btn-ghost" onClick={() => onRelease(item.id)}>
                            Release
                          </button>
                        )}
                        {item.status === 'Failed' && (
                          <button type="button" className="sa-btn approve" onClick={() => onRetry(item.id)}>
                            Retry
                          </button>
                        )}
                        {item.status !== 'Paid' && item.status !== 'Rejected' && (
                          <button type="button" className="sa-btn reject" onClick={() => onReject(item.id, reason)}>
                            Reject
                          </button>
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
    </>
  )
}
