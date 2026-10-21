import { useEffect, useState } from 'react'
import { StatusPill } from './shared'
import {
  approvalRequests,
  approvalTypeMeta,
  cityApprovalLimits,
  exceedsApprovalLimit,
  formatRupees,
  type ApprovalDecision,
  type ApprovalItem,
  type ApprovalType,
} from './cityAdminData'

const filterOptions: Array<'All' | ApprovalType> = ['All', ...(Object.keys(approvalTypeMeta) as ApprovalType[])]

const decisionMeta: Record<ApprovalDecision, { title: string; confirm: string; hint: string; className: string }> = {
  Approved: { title: 'Approve request', confirm: 'Approve', hint: 'The requester is notified immediately.', className: 'approve' },
  Returned: { title: 'Return for changes', confirm: 'Return', hint: 'Send it back with comments so the requester can fix and resubmit.', className: 'return' },
  Rejected: { title: 'Reject request', confirm: 'Reject', hint: 'A reason is required so the requester can correct the issue.', className: 'reject' },
  Escalated: { title: 'Escalate to State Admin', confirm: 'Escalate', hint: 'This exceeds your approval limit, so it goes to the State Admin for a higher-authority decision.', className: 'return' },
}

type ApprovalsSectionProps = {
  filter: 'All' | ApprovalType
  onFilterChange: (value: 'All' | ApprovalType) => void
  rows: ApprovalItem[]
  pendingCount: number
  approverName: string
  onResolve: (id: string, decision: ApprovalDecision, comment: string) => void
}

export default function ApprovalsSection({
  filter,
  onFilterChange,
  rows,
  pendingCount,
  approverName,
  onResolve,
}: ApprovalsSectionProps) {
  const [active, setActive] = useState<{ item: ApprovalItem; decision: ApprovalDecision } | null>(null)
  const [comment, setComment] = useState('')
  const [openHistory, setOpenHistory] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const openModal = (item: ApprovalItem, decision: ApprovalDecision) => {
    setComment('')
    setActive({ item, decision })
  }

  const closeModal = () => {
    setActive(null)
    setComment('')
  }

  const confirmDecision = () => {
    if (!active) return
    if (active.decision !== 'Approved' && comment.trim() === '') return
    onResolve(active.item.id, active.decision, comment.trim())
    closeModal()
  }

  const commentRequired = active ? active.decision !== 'Approved' : false
  const canConfirm = !commentRequired || comment.trim() !== ''

  const overLimitCount = rows.filter((item) => item.status === 'Pending' && exceedsApprovalLimit(item)).length
  const escalatedCount = rows.filter((item) => item.status === 'Escalated').length
  const resolvedCount = rows.filter((item) => item.status === 'Approved' || item.status === 'Rejected' || item.status === 'Returned').length
  const operationalLimit = cityApprovalLimits['Operational Request'].amount
  const refundLimit = cityApprovalLimits['Refund / Adjustment'].amount

  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Approvals &amp; requests</h3>
        <div className="sa-chip-row">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`sa-chip ${filter === option ? 'active orange' : ''}`}
              onClick={() => onFilterChange(option)}
            >
              {option === 'All' ? 'All' : approvalTypeMeta[option].label}
            </button>
          ))}
        </div>
      </div>

      <div className="reports-note">
        <span className="sa-pill amber">Approval limits</span>
        <span>
          Set by higher authorities — operational requests are capped at {operationalLimit !== null ? formatRupees(operationalLimit) : '—'} and
          refunds &amp; adjustments at {refundLimit !== null ? formatRupees(refundLimit) : '—'}. Anything above your limit must be escalated to
          State Admin.
        </span>
      </div>

      <div className="finance-summary">
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Above your limit</span>
          <strong>{overLimitCount}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Escalated</span>
          <strong>{escalatedCount}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Resolved</span>
          <strong>{resolvedCount}</strong>
        </div>
      </div>

      <div className="sa-toolbar">
        <span className="sa-panel-sub">
          {pendingCount} pending · approve, return, reject or escalate with comments
        </span>
        <span className="sa-toolbar-meta">
          {rows.length} of {approvalRequests.length} requests
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No requests of this type right now.</p>
          <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
            Show all requests
          </button>
        </div>
      ) : (
        <div className="sa-approval-list">
          {rows.map((item) => {
            const historyOpen = openHistory === item.id
            const over = exceedsApprovalLimit(item)
            const limit = cityApprovalLimits[item.type].amount
            return (
              <article key={item.id} className="sa-approval-item">
                <div className="sa-approval-copy">
                  <div className="sa-approval-tags">
                    <span className="sa-approval-id">{item.id}</span>
                    <span className="sa-pill blue">{approvalTypeMeta[item.type].label}</span>
                    <StatusPill status={item.status} />
                    {item.priority === 'High' && <span className="sa-pill red">High priority</span>}
                    {item.value && <span className="sa-approval-id">{item.value}</span>}
                    {limit !== null && item.amount !== undefined && (
                      <span className={`sa-pill ${over ? 'red' : 'slate'}`}>
                        {over ? `Exceeds your ${formatRupees(limit)} limit` : `Within your ${formatRupees(limit)} limit`}
                      </span>
                    )}
                  </div>
                  <strong>
                    {item.requester} · {item.zone}
                  </strong>
                  <p>{item.detail}</p>
                  <span className="sa-approval-meta">
                    Submitted {item.submitted} · Approver {item.assignee}
                  </span>
                  <div className="sa-approval-history">
                    <button
                      type="button"
                      className="sa-view-link"
                      onClick={() => setOpenHistory(historyOpen ? null : item.id)}
                    >
                      {historyOpen ? 'Hide' : 'View'} approval history ({item.history.length})
                    </button>
                    {historyOpen && (
                      <ol className="sa-history-list">
                        {item.history.map((entry) => (
                          <li key={entry.id} className="sa-history-item">
                            <div className="sa-history-head">
                              <span className={`sa-pill ${entry.action === 'Approved' ? 'green' : entry.action === 'Rejected' ? 'red' : entry.action === 'Escalated' ? 'purple' : entry.action === 'Returned' ? 'blue' : 'slate'}`}>
                                {entry.action}
                              </span>
                              <strong>
                                {entry.actor} · {entry.role}
                              </strong>
                              <span className="sa-approval-meta">{entry.time}</span>
                            </div>
                            {entry.comment && <p className="sa-history-comment">“{entry.comment}”</p>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
                <div className="sa-approval-actions">
                  {item.status === 'Pending' ? (
                    over ? (
                      <>
                        <span className="sa-approval-meta">Above your authority</span>
                        <button type="button" className="sa-btn return" onClick={() => openModal(item, 'Escalated')}>
                          Escalate
                        </button>
                        <button type="button" className="sa-btn reject" onClick={() => openModal(item, 'Rejected')}>
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="sa-btn approve" onClick={() => openModal(item, 'Approved')}>
                          Approve
                        </button>
                        <button type="button" className="sa-btn return" onClick={() => openModal(item, 'Returned')}>
                          Return
                        </button>
                        <button type="button" className="sa-btn reject" onClick={() => openModal(item, 'Rejected')}>
                          Reject
                        </button>
                      </>
                    )
                  ) : (
                    <span className="sa-approval-meta">
                      {item.status === 'Escalated' ? 'Escalated to State Admin' : `Resolved as ${item.status}`}
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {active && (
        <div className="sa-modal-overlay" role="presentation" onClick={closeModal}>
          <div
            className="sa-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${decisionMeta[active.decision].title} ${active.item.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sa-modal-header">
              <div>
                <h4>{decisionMeta[active.decision].title}</h4>
                <span className="sa-approval-meta">
                  {active.item.id} · {approvalTypeMeta[active.item.type].label} · {active.item.requester}
                </span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="sa-modal-body">
              <p className="sa-modal-detail">{active.item.detail}</p>
              {cityApprovalLimits[active.item.type].amount !== null && active.item.amount !== undefined && (
                <p className="sa-modal-detail">
                  Request value {formatRupees(active.item.amount)} · Your limit {formatRupees(cityApprovalLimits[active.item.type].amount ?? 0)}
                  {exceedsApprovalLimit(active.item) ? ' · above your authority' : ' · within your authority'}
                </p>
              )}
              <p className="sa-modal-hint">{decisionMeta[active.decision].hint}</p>
              <label className="sa-comment-label" htmlFor="approval-comment">
                Comments {commentRequired ? '(required)' : '(optional)'}
              </label>
              <textarea
                id="approval-comment"
                className="sa-comment-input"
                rows={4}
                value={comment}
                placeholder={
                  active.decision === 'Returned'
                    ? 'Tell the requester exactly what to fix before resubmitting.'
                    : active.decision === 'Rejected'
                      ? 'Explain why this request is being rejected.'
                      : active.decision === 'Escalated'
                        ? 'Add context for the State Admin reviewer.'
                        : 'Add any notes for the audit trail.'
                }
                onChange={(event) => setComment(event.target.value)}
              />
              <span className="sa-approval-meta">
                Resolving as {approverName} · the decision is recorded in the approval history.
              </span>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className={`sa-btn ${decisionMeta[active.decision].className}`}
                disabled={!canConfirm}
                onClick={confirmDecision}
              >
                {decisionMeta[active.decision].confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
