import { useState } from 'react'
import { StatusPill } from './shared'
import type { NewEscalationInput } from './useSupportAdmin'
import {
  categoryTargetMap,
  escalationCategories,
  type EscalationCategory,
  type EscalationStatus,
  type SupportEscalation,
} from './supportAdminData'

type SupportEscalationsSectionProps = {
  escalations: SupportEscalation[]
  onCreate: (input: NewEscalationInput) => string
  onAcknowledge: (id: string) => void
  onResolve: (id: string) => void
}

const statusFilters: Array<'All' | EscalationStatus> = ['All', 'Open', 'Acknowledged', 'Resolved']

export default function EscalationsSection({ escalations, onCreate, onAcknowledge, onResolve }: SupportEscalationsSectionProps) {
  const [category, setCategory] = useState<EscalationCategory>('Dispute / damage')
  const [subject, setSubject] = useState('')
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | EscalationStatus>('All')

  const rows = escalations.filter((item) => statusFilter === 'All' || item.status === statusFilter)
  const openCount = escalations.filter((item) => item.status === 'Open').length

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
