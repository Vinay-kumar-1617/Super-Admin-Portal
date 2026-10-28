import { useState } from 'react'
import { StatusPill } from './shared'
import type { NewEscalationInput } from './useSupportAdmin'
import {
  categoryTargetMap,
  escalationCategories,
  escalationTargets,
  type EscalationCategory,
  type EscalationStatus,
  type SupportEscalation,
  type TicketPriority,
} from './supportAdminData'

type SupportEscalationsSectionProps = {
  escalations: SupportEscalation[]
  onCreate: (input: NewEscalationInput) => string
  onAcknowledge: (id: string) => void
  onResolve: (id: string) => void
  onUpdate: (id: string, patch: Partial<Pick<SupportEscalation, 'priority' | 'target' | 'level' | 'slaDeadline' | 'progress' | 'resolutionNote'>>) => void
}

const statusFilters: Array<'All' | EscalationStatus> = ['All', 'Open', 'Acknowledged', 'Resolved']

export default function EscalationsSection({ escalations, onCreate, onAcknowledge, onResolve, onUpdate }: SupportEscalationsSectionProps) {
  const [category, setCategory] = useState<EscalationCategory>('Dispute / damage')
  const [subject, setSubject] = useState('')
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | EscalationStatus>('All')

  const rows = escalations.filter((item) => statusFilter === 'All' || item.status === statusFilter)
  const openCount = escalations.filter((item) => item.status === 'Open').length
  const levels: SupportEscalation['level'][] = ['Level 1', 'Level 2', 'Level 3']
  const priorities: TicketPriority[] = ['Urgent', 'High', 'Normal', 'Low']

  const submit = () => {
    if (subject.trim().length < 4) {
      setFormError('Enter a subject (min 4 characters).')
      return
    }
    if (reason.trim().length < 4) {
      setFormError('Enter why this needs escalation (min 4 characters).')
      return
    }
    onCreate({ subject: subject.trim(), category, reason: reason.trim(), ticket: ticket.trim() })
    setSubject('')
    setTicket('')
    setReason('')
    setFormError('')
  }

  return (
    <>
      <style>{`
        .support-escalation-details { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
        .support-escalation-field { display: grid; gap: 5px; min-width: 0; }
        .support-escalation-field > span { color: #586579; font-size: .68rem; font-weight: 750; letter-spacing: .04em; text-transform: uppercase; }
        .support-escalation-progress { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px; }
        .support-escalation-progress input { width: 100%; accent-color: var(--sa-brand); }
        .support-escalation-note { width: 100%; min-height: 44px; resize: vertical; }
        .support-escalation-note-wrap { grid-column: 1 / -1; }
        @media (max-width: 950px) { .support-escalation-details { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .support-escalation-details { grid-template-columns: minmax(0, 1fr); } .support-escalation-note-wrap { grid-column: auto; } }
      `}</style>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Raise an escalation</h3>
          <span className="sa-panel-sub">Routed automatically by category</span>
        </div>
        <div className="sa-form-grid">
          <label className="sa-field">
            <span>Category</span>
            <select className="sa-select" value={category} onChange={(event) => setCategory(event.target.value as EscalationCategory)}>
              {escalationCategories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="sa-field">
            <span>Escalates to</span>
            <input className="sa-input" value={categoryTargetMap[category]} readOnly />
          </label>
          <label className="sa-field">
            <span>Ticket (optional)</span>
            <input className="sa-input" placeholder="e.g. TK-4772" value={ticket} onChange={(event) => setTicket(event.target.value)} />
          </label>
          <label className="sa-field" style={{ gridColumn: '1 / -1' }}>
            <span>Subject</span>
            <input
              className="sa-input"
              placeholder="e.g. Damage claim dispute on BK-88310"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </label>
          <label className="sa-field" style={{ gridColumn: '1 / -1' }}>
            <span>Why it needs escalation</span>
            <input
              className="sa-input"
              placeholder="Reason (min 4 characters)…"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
        </div>
        {formError && <p className="sa-form-error">{formError}</p>}
        <div className="sa-form-actions">
          <button type="button" className="sa-btn reject" onClick={submit}>
            Escalate to {categoryTargetMap[category]}
          </button>
          <span className="sa-panel-sub">
            Disputes & damage → city admin · payments → finance · compliance → compliance admin · operations → ops manager
          </span>
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Escalation desk</h3>
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
        <div className="sa-toolbar">
          <span className="sa-panel-sub">{openCount} open escalations</span>
          <span className="sa-toolbar-meta">
            {rows.length} of {escalations.length} cases
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No escalations match this filter.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => setStatusFilter('All')}>
              Show all
            </button>
          </div>
        ) : (
          <div className="sa-approval-list">
            {rows.map((item) => (
              <article key={item.id} className="sa-approval-item">
                <div className="sa-approval-copy">
                  <div className="sa-approval-tags">
                    <span className="sa-approval-id">{item.id}</span>
                    <span className="sa-pill blue">{item.target}</span>
                    <span className="sa-pill slate">{item.category}</span>
                    <StatusPill status={item.status} />
                  </div>
                  <strong>{item.subject}</strong>
                  <p>{item.reason}</p>
                  <span className="sa-approval-meta">
                    Opened {item.opened}
                    {item.ticket !== '—' ? ` · ticket ${item.ticket}` : ''}
                  </span>
                  <div className="support-escalation-details">
                    <label className="support-escalation-field">
                      <span>Priority</span>
                      <select className="sa-select" value={item.priority} onChange={(event) => onUpdate(item.id, { priority: event.target.value as TicketPriority })}>
                        {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                      </select>
                    </label>
                    <label className="support-escalation-field">
                      <span>Assigned team</span>
                      <select className="sa-select" value={item.target} onChange={(event) => onUpdate(item.id, { target: event.target.value as SupportEscalation['target'] })}>
                        {escalationTargets.map((target) => <option key={target} value={target}>{target}</option>)}
                      </select>
                    </label>
                    <label className="support-escalation-field">
                      <span>Escalation level</span>
                      <select className="sa-select" value={item.level} onChange={(event) => onUpdate(item.id, { level: event.target.value as SupportEscalation['level'] })}>
                        {levels.map((level) => <option key={level} value={level}>{level}</option>)}
                      </select>
                    </label>
                    <label className="support-escalation-field">
                      <span>SLA deadline</span>
                      <input
                        className="sa-input"
                        aria-label={`SLA deadline for ${item.id}`}
                        type="text"
                        defaultValue={item.slaDeadline}
                        onBlur={(event) => {
                          if (event.currentTarget.value !== item.slaDeadline) onUpdate(item.id, { slaDeadline: event.currentTarget.value })
                        }}
                      />
                    </label>
                    <label className="support-escalation-field support-escalation-note-wrap">
                      <span>Resolution progress · {item.progress}%</span>
                      <div className="support-escalation-progress">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          aria-label={`Resolution progress for ${item.id}`}
                          defaultValue={item.progress}
                          onMouseUp={(event) => {
                            const progress = Number(event.currentTarget.value)
                            if (progress !== item.progress) onUpdate(item.id, { progress })
                          }}
                          onKeyUp={(event) => {
                            const progress = Number(event.currentTarget.value)
                            if (progress !== item.progress) onUpdate(item.id, { progress })
                          }}
                        />
                        <strong>{item.progress}%</strong>
                      </div>
                    </label>
                    <label className="support-escalation-field support-escalation-note-wrap">
                      <span>Resolution note</span>
                      <textarea
                        className="sa-input support-escalation-note"
                        aria-label={`Resolution note for ${item.id}`}
                        defaultValue={item.resolutionNote}
                        placeholder="Add progress or resolution details..."
                        onBlur={(event) => {
                          if (event.currentTarget.value !== item.resolutionNote) onUpdate(item.id, { resolutionNote: event.currentTarget.value })
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="sa-approval-actions">
                  {item.status === 'Open' && (
                    <button type="button" className="sa-btn" onClick={() => onAcknowledge(item.id)}>
                      Acknowledge
                    </button>
                  )}
                  {item.status !== 'Resolved' ? (
                    <button type="button" className="sa-btn approve" onClick={() => onResolve(item.id)}>
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
