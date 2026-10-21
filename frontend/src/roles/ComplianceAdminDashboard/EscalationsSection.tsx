import { StatusPill } from './shared'
import {
  escalationRisks,
  escalationRows as allEscalations,
  escalationTargets,
  type EscalationRow,
} from './complianceAdminData'

type EscalationFilter = 'All' | 'Outgoing' | 'Incoming'
const filterOptions: EscalationFilter[] = ['All', 'Outgoing', 'Incoming']

type EscalationsSectionProps = {
  rows: EscalationRow[]
  filter: EscalationFilter
  onFilterChange: (value: EscalationFilter) => void
  subject: string
  onSubjectChange: (value: string) => void
  target: string
  onTargetChange: (value: string) => void
  risk: string
  onRiskChange: (value: string) => void
  reason: string
  onReasonChange: (value: string) => void
  onEscalate: () => void
  onAcknowledge: (id: string) => void
  onResolve: (id: string) => void
}

export default function EscalationsSection({
  rows,
  filter,
  onFilterChange,
  subject,
  onSubjectChange,
  target,
  onTargetChange,
  risk,
  onRiskChange,
  reason,
  onReasonChange,
  onEscalate,
  onAcknowledge,
  onResolve,
}: EscalationsSectionProps) {
  const openCount = allEscalations.filter((row) => row.status === 'Open').length
  const canEscalate = subject.trim().length > 0 && reason.trim().length >= 4

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Escalate a case</h3>
          <span className="sa-panel-sub">Unclear or high-risk cases go to the state admin or super admin</span>
        </div>
        <div className="cf-form">
          <label className="cf-field cf-field-grow">
            <span>Case</span>
            <input
              className="sa-input"
              placeholder="e.g. DOC-4110 · insurance name mismatch..."
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
            />
          </label>
          <label className="cf-field">
            <span>Escalate to</span>
            <select className="sa-select" value={target} onChange={(event) => onTargetChange(event.target.value)}>
              {escalationTargets.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="cf-field">
            <span>Risk</span>
            <select className="sa-select" value={risk} onChange={(event) => onRiskChange(event.target.value)}>
              {escalationRisks.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="cf-field cf-field-grow">
            <span>Why it needs escalation</span>
            <input
              className="sa-input"
              placeholder="Reason (min 4 characters)..."
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
            />
          </label>
          <button type="button" className="sa-btn reject" onClick={onEscalate} disabled={!canEscalate}>
            Escalate
          </button>
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Escalation desk</h3>
          <div className="sa-chip-row">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`sa-chip ${filter === option ? 'active orange' : ''}`}
                onClick={() => onFilterChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="sa-toolbar">
          <span className="sa-panel-sub">
            {openCount} open · incoming requests from city admin and support admin are answered here
          </span>
          <span className="sa-toolbar-meta">
            {rows.length} of {allEscalations.length} cases
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No escalations match this filter.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
              Show all
            </button>
          </div>
        ) : (
          <div className="sa-approval-list">
            {rows.map((row) => (
              <article key={row.id} className="sa-approval-item">
                <div className="sa-approval-copy">
                  <div className="sa-approval-tags">
                    <span className="sa-approval-id">{row.id}</span>
                    <span className="sa-pill blue">{row.direction}</span>
                    <span className={`sa-pill ${row.risk === 'High' ? 'red' : row.risk === 'Unclear' ? 'amber' : 'slate'}`}>
                      {row.risk} risk
                    </span>
                    <StatusPill status={row.status} />
                  </div>
                  <strong>{row.subject}</strong>
                  <p>{row.detail}</p>
                  <span className="sa-approval-meta">
                    {row.direction === 'Outgoing' ? `To ${row.party}` : `From ${row.party}`} · opened {row.opened}
                  </span>
                </div>
                <div className="sa-approval-actions">
                  {row.status === 'Open' && (
                    <button type="button" className="sa-btn" onClick={() => onAcknowledge(row.id)}>
                      Acknowledge
                    </button>
                  )}
                  {row.status !== 'Resolved' ? (
                    <button type="button" className="sa-btn approve" onClick={() => onResolve(row.id)}>
                      Resolve
                    </button>
                  ) : (
                    <span className="sa-approval-meta">Closed</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
