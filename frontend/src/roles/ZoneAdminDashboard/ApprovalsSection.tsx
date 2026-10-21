import { useEffect, useState } from 'react'
import { StatusPill } from '../CityAdminDashboard/shared'
import {
  approvalRequests as cityApprovalRequests,
  approvalTypeMeta,
  cityApprovalLimits,
  formatRupees,
  type ApprovalDecision,
  type ApprovalItem,
  type ApprovalType,
} from '../CityAdminDashboard/cityAdminData'
import { zoneProfile } from './zoneAdminData'

// Delegated approval limits for the Zone Admin (lower than City Admin).
const zoneApprovalLimits: Record<ApprovalType, { amount: number | null; authority: string }> = {
  Application: { amount: null, authority: 'City Admin' },
  'Property Verification': { amount: null, authority: 'City Admin' },
  'Operational Request': { amount: 30000, authority: 'City Admin' },
  'Refund / Adjustment': { amount: 15000, authority: 'City Admin' },
}

const exceedsZoneApprovalLimit = (item: ApprovalItem): boolean => {
  const limit = zoneApprovalLimits[item.type].amount
  return limit !== null && item.amount !== undefined && item.amount > limit
}

const filterOptions: Array<'All' | ApprovalType> = ['All', ...(Object.keys(approvalTypeMeta) as ApprovalType[])]

const decisionMeta: Record<ApprovalDecision, { title: string; confirm: string; hint: string; className: string }> = {
  Approved: { title: 'Approve request', confirm: 'Approve', hint: 'The requester is notified immediately.', className: 'approve' },
  Returned: { title: 'Return for changes', confirm: 'Return', hint: 'Send it back with comments so the requester can fix and resubmit.', className: 'return' },
  Rejected: { title: 'Reject request', confirm: 'Reject', hint: 'A reason is required so the requester can correct the issue.', className: 'reject' },
  Escalated: { title: 'Escalate to City Admin', confirm: 'Escalate', hint: 'This exceeds your approval limit, so it goes to the City Admin for a higher-authority decision.', className: 'return' },
}

type Props = { onToast?: (message: string) => void }

export default function ApprovalsSection({ onToast }: Props) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(cityApprovalRequests.filter((item) => item.zone === 'Madhapur'))
  const [approvalFilter, setApprovalFilter] = useState<'All' | ApprovalType>('All')
  const [active, setActive] = useState<{ item: ApprovalItem; decision: ApprovalDecision } | null>(null)
  const [comment, setComment] = useState('')
  const [openHistory, setOpenHistory] = useState<string | null>(null)

  const showToast = (message: string) => onToast?.(message)

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const filteredApprovals = approvals.filter((item) => approvalFilter === 'All' || item.type === approvalFilter)

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
    const decision = active.decision
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === active.item.id
          ? {
              ...item,
              status: decision === 'Escalated' ? 'Escalated' : decision,
              assignee: decision === 'Escalated' ? 'City Admin' : zoneProfile.adminName,
              history: [
                ...item.history,
                { id: `${item.id}-h${item.history.length + 1}`, action: decision, actor: zoneProfile.adminName, role: 'Zone Admin', time: 'just now', comment: comment.trim() || undefined },
              ],
            }
          : item,
      ),
    )
    showToast(`${active.item.id} ${decision === 'Approved' ? 'approved' : decision === 'Rejected' ? 'rejected' : decision === 'Returned' ? 'returned' : 'escalated to City Admin'}`)
    closeModal()
  }

  const commentRequired = active ? active.decision !== 'Approved' : false
  const canConfirm = !commentRequired || comment.trim() !== ''

  const pendingCount = approvals.filter((item) => item.status === 'Pending').length
  const overLimitCount = filteredApprovals.filter((item) => item.status === 'Pending' && exceedsZoneApprovalLimit(item)).length
  const escalatedCount = approvals.filter((item) => item.status === 'Escalated').length
  const resolvedCount = approvals.filter((item) => item.status === 'Approved' || item.status === 'Rejected' || item.status === 'Returned').length

  return (
    <section className="sa-panel">
      <style>{`
        .za-approval-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      `}</style>
      <div className="sa-panel-header">
        <h3>Approvals &amp; requests</h3>
        <div className="sa-chip-row finance-tabs">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`sa-chip ${approvalFilter === option ? 'active orange' : ''}`}
              onClick={() => setApprovalFilter(option)}
            >
              {option === 'All' ? 'All' : approvalTypeMeta[option].label}
            </button>
          ))}
        </div>
      </div>

      <div className="reports-note">
        <span className="sa-pill amber">Approval limits</span>
        <span>
          Zone delegated limits — operational requests capped at {formatRupees(zoneApprovalLimits['Operational Request'].amount ?? 0)}, refunds &amp; adjustments at {formatRupees(zoneApprovalLimits['Refund / Adjustment'].amount ?? 0)}. Anything above escalates to {cityApprovalLimits['Operational Request'].authority}.
        </span>
      </div>

      <div className="finance-summary">
        <div className="finance-summary-item"><span className="sa-approval-meta">Pending</span><strong>{pendingCount}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Above your limit</span><strong>{overLimitCount}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Escalated</span><strong>{escalatedCount}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Resolved</span><strong>{resolvedCount}</strong></div>
      </div>

      {filteredApprovals.length === 0 ? (
        <div className="sa-empty"><p>No requests of this type right now.</p></div>
      ) : (
        <div className="sa-approval-list">
          {filteredApprovals.map((item) => {
            const over = exceedsZoneApprovalLimit(item)
            const limit = zoneApprovalLimits[item.type].amount
            const historyOpen = openHistory === item.id
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
                  <strong>{item.requester} · {item.zone}</strong>
                  <p>{item.detail}</p>
                  <span className="sa-approval-meta">Submitted {item.submitted} · Approver {item.assignee}</span>
                  <div className="sa-approval-history">
                    <button type="button" className="sa-view-link" onClick={() => setOpenHistory(historyOpen ? null : item.id)}>
                      {historyOpen ? 'Hide' : 'View'} approval history ({item.history.length})
                    </button>
                    {historyOpen && (
                      <ol className="sa-history-list">
                        {item.history.map((entry) => (
                          <li key={entry.id} className="sa-history-item">
                            <div className="sa-history-head">
                              <span className={`sa-pill ${entry.action === 'Approved' ? 'green' : entry.action === 'Rejected' ? 'red' : entry.action === 'Escalated' ? 'purple' : entry.action === 'Returned' ? 'blue' : 'slate'}`}>{entry.action}</span>
                              <strong>{entry.actor} · {entry.role}</strong>
                              <span className="sa-approval-meta">{entry.time}</span>
                            </div>
                            {entry.comment && <p className="sa-history-comment">“{entry.comment}”</p>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
                <div className="za-approval-actions">
                  {item.status === 'Pending' ? (
                    over ? (
                      <>
                        <span className="sa-approval-meta">Above your authority</span>
                        <button type="button" className="sa-btn return" onClick={() => openModal(item, 'Escalated')}>Escalate</button>
                        <button type="button" className="sa-btn reject" onClick={() => openModal(item, 'Rejected')}>Reject</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="sa-btn approve" onClick={() => openModal(item, 'Approved')}>Approve</button>
                        <button type="button" className="sa-btn return" onClick={() => openModal(item, 'Returned')}>Return</button>
                        <button type="button" className="sa-btn reject" onClick={() => openModal(item, 'Rejected')}>Reject</button>
                      </>
                    )
                  ) : (
                    <span className="sa-approval-meta">{item.status === 'Escalated' ? 'Escalated to City Admin' : `Resolved as ${item.status}`}</span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {active && (
        <div className="sa-modal-overlay" role="presentation" onClick={closeModal}>
          <div className="sa-modal" role="dialog" aria-modal="true" aria-label={`${decisionMeta[active.decision].title} ${active.item.id}`} onClick={(event) => event.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h4>{decisionMeta[active.decision].title}</h4>
                <span className="sa-approval-meta">{active.item.id} · {approvalTypeMeta[active.item.type].label} · {active.item.requester}</span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={closeModal}>×</button>
            </div>
            <div className="sa-modal-body">
              <p className="sa-modal-detail">{active.item.detail}</p>
              {zoneApprovalLimits[active.item.type].amount !== null && active.item.amount !== undefined && (
                <p className="sa-modal-detail">
                  Request value {formatRupees(active.item.amount)} · Your limit {formatRupees(zoneApprovalLimits[active.item.type].amount ?? 0)}
                  {exceedsZoneApprovalLimit(active.item) ? ' · above your authority' : ' · within your authority'}
                </p>
              )}
              <p className="sa-modal-hint">{decisionMeta[active.decision].hint}</p>
              <label className="sa-comment-label" htmlFor="za-approval-comment">Comments {commentRequired ? '(required)' : '(optional)'}</label>
              <textarea
                id="za-approval-comment"
                className="sa-comment-input"
                rows={4}
                value={comment}
                placeholder={active.decision === 'Returned' ? 'Tell the requester exactly what to fix before resubmitting.' : active.decision === 'Rejected' ? 'Explain why this request is being rejected.' : active.decision === 'Escalated' ? 'Add context for the City Admin reviewer.' : 'Add any notes for the audit trail.'}
                onChange={(event) => setComment(event.target.value)}
              />
              <span className="sa-approval-meta">Resolving as {zoneProfile.adminName} · the decision is recorded in the approval history.</span>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={closeModal}>Cancel</button>
              <button type="button" className={`sa-btn ${decisionMeta[active.decision].className}`} disabled={!canConfirm} onClick={confirmDecision}>
                {decisionMeta[active.decision].confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}