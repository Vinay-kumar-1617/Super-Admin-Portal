import { useEffect, useMemo, useState } from 'react'
import {
  approvalEscalationTarget,
  exceedsOpsLimit,
  formatRupees,
  opsApprovalLimits,
  opsRequestTypes,
  type OpsRequest,
  type OpsRequestStatus,
  type OpsRequestType,
} from './opsApprovalsData'
import { opsProfile } from './operationsData'

type Decision = 'Approved' | 'Returned' | 'Rejected' | 'Escalated'

export type ApprovalDecisionPayload = {
  id: string
  decision: Decision
  comment: string
}

type ApprovalsSectionProps = {
  requests: OpsRequest[]
  onDecide: (payload: ApprovalDecisionPayload) => void
  onComment: (id: string, comment: string) => void
  onToast?: (message: string) => void
}

const decisionMeta: Record<Decision, { title: string; confirm: string; hint: string; className: string }> = {
  Approved: {
    title: 'Approve request',
    confirm: 'Approve',
    hint: 'The requester is notified immediately and the amount is committed against the zone budget.',
    className: 'approve',
  },
  Returned: {
    title: 'Return for changes',
    confirm: 'Return',
    hint: 'Send it back with comments so the requester can fix it and resubmit.',
    className: 'return',
  },
  Rejected: {
    title: 'Reject request',
    confirm: 'Reject',
    hint: 'A reason is required so the requester can correct the issue.',
    className: 'reject',
  },
  Escalated: {
    title: `Escalate to ${approvalEscalationTarget}`,
    confirm: 'Escalate',
    hint: 'This is above your delegated limit, so it needs a higher-authority decision.',
    className: 'return',
  },
}

const statusTone: Record<OpsRequestStatus, string> = {
  Pending: 'amber',
  Approved: 'green',
  Returned: 'blue',
  Rejected: 'red',
  Escalated: 'purple',
}

const priorityTone: Record<string, string> = { Critical: 'red', High: 'amber', Normal: 'slate' }

export default function ApprovalsSection({ requests, onDecide, onComment, onToast }: ApprovalsSectionProps) {
  const [typeFilter, setTypeFilter] = useState<'All' | OpsRequestType>('All')
  const [active, setActive] = useState<{ request: OpsRequest; decision: Decision } | null>(null)
  const [comment, setComment] = useState('')
  const [openHistory, setOpenHistory] = useState<string | null>(null)
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const filtered = useMemo(
    () => requests.filter((request) => typeFilter === 'All' || request.type === typeFilter),
    [requests, typeFilter],
  )

  const counts = useMemo(() => {
    const pending = requests.filter((request) => request.status === 'Pending')
    return {
      pending: pending.length,
      overLimit: pending.filter(exceedsOpsLimit).length,
      escalated: requests.filter((request) => request.status === 'Escalated').length,
      resolved: requests.filter(
        (request) => request.status === 'Approved' || request.status === 'Rejected' || request.status === 'Returned',
      ).length,
      value: pending.reduce((sum, request) => sum + (request.amount ?? 0), 0),
    }
  }, [requests])

  const openModal = (request: OpsRequest, decision: Decision) => {
    setComment('')
    setActive({ request, decision })
  }

  const closeModal = () => {
    setActive(null)
    setComment('')
  }

  const confirmDecision = () => {
    if (!active) return
    const decision = active.decision
    if (decision !== 'Approved' && comment.trim() === '') return
    onDecide({ id: active.request.id, decision, comment: comment.trim() })
    onToast?.(
      `${active.request.id} ${
        decision === 'Approved'
          ? 'approved'
          : decision === 'Rejected'
            ? 'rejected'
            : decision === 'Returned'
              ? 'returned'
              : 'escalated to the City Admin'
      }`,
    )
    closeModal()
  }

  const addComment = (request: OpsRequest) => {
    const text = (noteDraft[request.id] ?? '').trim()
    if (text.length < 4) return
    onComment(request.id, text)
    setNoteDraft((prev) => ({ ...prev, [request.id]: '' }))
    onToast?.(`Comment added to ${request.id}`)
  }

  const commentRequired = active ? active.decision !== 'Approved' : false
  const canConfirm = !commentRequired || comment.trim() !== ''

  return (
    <section className="sa-panel">
      <style>{`
        .ops-approval-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .ops-approval-comments { display: grid; gap: 8px; margin-top: 8px; justify-items: start; }
        .ops-approval-comments > * { width: 100%; }
        .ops-approval-comment {
          display: grid;
          gap: 3px;
          padding: 9px 12px;
          border-radius: 12px;
          border: 1px solid var(--sa-line);
          background: #fbfcfd;
        }
        .ops-approval-comment strong { font-size: 0.78rem; }
        .ops-approval-comment span { font-size: 0.7rem; color: var(--sa-muted); }
        .ops-approval-comment p { margin: 0; font-size: 0.8rem; color: #475569; line-height: 1.55; }
        .ops-approval-note {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .ops-approval-note input {
          flex: 1 1 240px;
          padding: 8px 11px;
          border-radius: 10px;
          border: 1px solid var(--sa-line);
          background: #fff;
          font: inherit;
          font-size: 0.8rem;
        }
        .ops-approval-limit-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 12px;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid var(--sa-line);
          background: #fbfcfd;
          font-size: 0.8rem;
          color: #475569;
          line-height: 1.6;
        }
        .ops-approval-limit-note strong { color: var(--sa-text); }
        .ops-approval-limits { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
      `}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Approvals &amp; requests</h3>
          <span className="sa-panel-sub">
            {counts.pending} pending · {counts.overLimit} above your authority · escalated to {approvalEscalationTarget}
          </span>
        </div>
        <div className="sa-chip-row finance-tabs">
          {(['All', ...opsRequestTypes] as Array<'All' | OpsRequestType>).map((option) => (
            <button
              key={option}
              type="button"
              className={`sa-chip ${typeFilter === option ? 'active orange' : ''}`}
              onClick={() => setTypeFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="ops-approval-limit-note">
        <span className="sa-pill amber">Delegated limits</span>
        <div>
          <strong>You decide inside these ceilings. Anything above goes up.</strong>
          <div className="ops-approval-limits">
            {opsRequestTypes.map((type) => (
              <span key={type} className="sa-pill slate">
                {type} · {formatRupees(opsApprovalLimits[type])}
              </span>
            ))}
          </div>
          <span style={{ display: 'block', marginTop: 8 }}>
            Requests above a limit cannot be approved from this screen — they are escalated to {approvalEscalationTarget} with
            your comments attached.
          </span>
        </div>
      </div>

      <div className="finance-summary">
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Pending</span>
          <strong>{counts.pending}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Above your limit</span>
          <strong>{counts.overLimit}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Escalated</span>
          <strong>{counts.escalated}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Resolved</span>
          <strong>{counts.resolved}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Pending value</span>
          <strong>{formatRupees(counts.value)}</strong>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="sa-empty">
          <p>No requests of this type right now.</p>
        </div>
      ) : (
        <div className="sa-approval-list">
          {filtered.map((request) => {
            const over = exceedsOpsLimit(request)
            const limit = opsApprovalLimits[request.type]
            const historyOpen = openHistory === request.id
            const commentsOpen = openComments === request.id
            return (
              <article key={request.id} className="sa-approval-item">
                <div className="sa-approval-copy">
                  <div className="sa-approval-tags">
                    <span className="sa-approval-id">{request.id}</span>
                    <span className="sa-pill blue">{request.type}</span>
                    <span className={`sa-pill ${statusTone[request.status]}`}>{request.status}</span>
                    {request.priority !== 'Normal' && (
                      <span className={`sa-pill ${priorityTone[request.priority]}`}>{request.priority} priority</span>
                    )}
                    {request.amount !== undefined && (
                      <span className="sa-approval-id">{formatRupees(request.amount)}</span>
                    )}
                    {request.amount !== undefined && (
                      <span className={`sa-pill ${over ? 'red' : 'slate'}`}>
                        {over ? `Exceeds your ${formatRupees(limit)} limit` : `Within your ${formatRupees(limit)} limit`}
                      </span>
                    )}
                  </div>
                  <strong>
                    {request.requester} · {request.requesterRole} · {request.zone}
                  </strong>
                  <p>{request.detail}</p>
                  <span className="sa-approval-meta">
                    Submitted {request.submitted} · Approver {request.assignee} · Due {request.dueBy}
                    {request.vehicle ? ` · ${request.vehicle}` : ''}
                    {request.site ? ` · ${request.site}` : ''}
                  </span>

                  <div className="ops-approval-comments">
                    <button
                      type="button"
                      className="sa-view-link"
                      onClick={() => setOpenComments(commentsOpen ? null : request.id)}
                    >
                      {commentsOpen ? 'Hide' : 'View'} comments ({request.comments.length})
                    </button>
                    {commentsOpen && (
                      <>
                        {request.comments.map((entry) => (
                          <div key={entry.id} className="ops-approval-comment">
                            <strong>
                              {entry.author} · {entry.role}
                            </strong>
                            <span>{entry.time}</span>
                            <p>{entry.text}</p>
                          </div>
                        ))}
                        <div className="ops-approval-note">
                          <input
                            aria-label={`Add a comment to ${request.id}`}
                            value={noteDraft[request.id] ?? ''}
                            onChange={(event) => setNoteDraft((prev) => ({ ...prev, [request.id]: event.target.value }))}
                            placeholder="Add a comment for the requester and the approver..."
                          />
                          <button
                            type="button"
                            className="sa-btn-ghost"
                            disabled={(noteDraft[request.id] ?? '').trim().length < 4}
                            onClick={() => addComment(request)}
                          >
                            Comment
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="sa-approval-history">
                    <button type="button" className="sa-view-link" onClick={() => setOpenHistory(historyOpen ? null : request.id)}>
                      {historyOpen ? 'Hide' : 'View'} approval history ({request.history.length})
                    </button>
                    {historyOpen && (
                      <ol className="sa-history-list">
                        {request.history.map((entry) => (
                          <li key={entry.id} className="sa-history-item">
                            <div className="sa-history-head">
                              <span
                                className={`sa-pill ${
                                  entry.action === 'Approved'
                                    ? 'green'
                                    : entry.action === 'Rejected'
                                      ? 'red'
                                      : entry.action === 'Escalated'
                                        ? 'purple'
                                        : entry.action === 'Returned'
                                          ? 'blue'
                                          : 'slate'
                                }`}
                              >
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

                <div className="ops-approval-actions">
                  {request.status === 'Pending' ? (
                    over ? (
                      <>
                        <span className="sa-approval-meta">Above your authority</span>
                        <button type="button" className="sa-btn return" onClick={() => openModal(request, 'Escalated')}>
                          Escalate
                        </button>
                        <button type="button" className="sa-btn reject" onClick={() => openModal(request, 'Rejected')}>
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="sa-btn approve" onClick={() => openModal(request, 'Approved')}>
                          Approve
                        </button>
                        <button type="button" className="sa-btn return" onClick={() => openModal(request, 'Returned')}>
                          Return
                        </button>
                        <button type="button" className="sa-btn reject" onClick={() => openModal(request, 'Rejected')}>
                          Reject
                        </button>
                      </>
                    )
                  ) : (
                    <span className="sa-approval-meta">
                      {request.status === 'Escalated'
                        ? `Escalated to ${request.assignee}`
                        : request.status === 'Approved'
                          ? `Approved by ${request.assignee}`
                          : `Resolved as ${request.status}`}
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
            aria-label={`${decisionMeta[active.decision].title} ${active.request.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sa-modal-header">
              <div>
                <h4>{decisionMeta[active.decision].title}</h4>
                <span className="sa-approval-meta">
                  {active.request.id} · {active.request.type} · {active.request.requester}
                </span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="sa-modal-body">
              <p className="sa-modal-detail">{active.request.detail}</p>
              {active.request.amount !== undefined && (
                <p className="sa-modal-detail">
                  Request value {formatRupees(active.request.amount)} · Your limit{' '}
                  {formatRupees(opsApprovalLimits[active.request.type])}
                  {exceedsOpsLimit(active.request) ? ' · above your authority' : ' · within your authority'}
                </p>
              )}
              <p className="sa-modal-hint">{decisionMeta[active.decision].hint}</p>
              <label className="sa-comment-label" htmlFor="ops-approval-comment">
                Comments {commentRequired ? '(required)' : '(optional)'}
              </label>
              <textarea
                id="ops-approval-comment"
                className="sa-comment-input"
                rows={4}
                value={comment}
                placeholder={
                  active.decision === 'Returned'
                    ? 'Tell the requester exactly what to fix before resubmitting.'
                    : active.decision === 'Rejected'
                      ? 'Explain why this request is being rejected.'
                      : active.decision === 'Escalated'
                        ? 'Add context for the City Admin reviewer.'
                        : 'Add any notes for the audit trail.'
                }
                onChange={(event) => setComment(event.target.value)}
              />
              <span className="sa-approval-meta">
                Resolving as {opsProfile.adminName} (Operations Manager) · the decision is recorded in the approval history and
                the audit trail.
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
