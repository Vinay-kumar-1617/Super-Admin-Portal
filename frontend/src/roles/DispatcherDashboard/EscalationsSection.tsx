import { useState } from 'react'
import { StatusPill } from './shared'
import { escalationTargets, type Escalation, type EscalationKind } from './dispatcherData'

export type CreateEscalation = {
  kind: EscalationKind
  reference: string
  subject: string
  detail: string
  severity: 'Critical' | 'Warning' | 'Info'
  target: string
}

type EscalationsSectionProps = {
  rows: Escalation[]
  onCreate: (input: CreateEscalation) => void
  onAcknowledge: (id: string) => void
  onEscalate: (id: string, target: string, reason: string) => void
}

const kinds: EscalationKind[] = ['Stuck job', 'Shortage', 'Operator problem', 'Complaint', 'Incident']

const targetForKind = (kind: EscalationKind): string => {
  if (kind === 'Complaint') return escalationTargets[1]
  if (kind === 'Incident') return escalationTargets[2]
  return escalationTargets[0]
}

export default function EscalationsSection({ rows, onCreate, onAcknowledge, onEscalate }: EscalationsSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [kind, setKind] = useState<EscalationKind>('Stuck job')
  const [reference, setReference] = useState('')
  const [subject, setSubject] = useState('')
  const [detail, setDetail] = useState('')
  const [severity, setSeverity] = useState<'Critical' | 'Warning' | 'Info'>('Warning')

  const [escalatingId, setEscalatingId] = useState<string | null>(null)
  const [target, setTarget] = useState(escalationTargets[0])
  const [reason, setReason] = useState('')

  const openCount = rows.filter((row) => row.status !== 'Escalated').length
  const canCreate = subject.trim().length >= 4 && detail.trim().length >= 4

  const startEscalate = (row: Escalation) => {
    setEscalatingId(row.id)
    setReason('')
    setTarget(targetForKind(row.kind))
  }

  const submitCreate = () => {
    if (!canCreate) return
    onCreate({
      kind,
      reference: reference.trim() || '—',
      subject: subject.trim(),
      detail: detail.trim(),
      severity,
      target: targetForKind(kind),
    })
    setShowForm(false)
    setKind('Stuck job')
    setReference('')
    setSubject('')
    setDetail('')
    setSeverity('Warning')
  }

  const submitEscalate = () => {
    if (!escalatingId || reason.trim().length < 4) return
    onEscalate(escalatingId, target, reason.trim())
    setEscalatingId(null)
    setReason('')
  }

  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Escalations</h3>
        <span className="sa-panel-sub">
          {openCount} open · stuck jobs & shortages → operations manager · complaints & incidents → support / city admin
        </span>
      </div>

      <div className="sa-toolbar">
        <button type="button" className="sa-btn approve" onClick={() => setShowForm((value) => !value)}>
          {showForm ? 'Close form' : 'New escalation'}
        </button>
        <span className="sa-toolbar-meta">{rows.length} total</span>
      </div>

      {showForm && (
        <div className="ds-escalation-form">
          <div className="ds-form-row">
            <label className="ops-field">
              Kind
              <select className="sa-select" value={kind} onChange={(event) => setKind(event.target.value as EscalationKind)}>
                {kinds.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="ops-field">
              Reference
              <input
                className="sa-input"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Job / zone / operator id"
              />
            </label>
            <label className="ops-field">
              Severity
              <select
                className="sa-select"
                value={severity}
                onChange={(event) => setSeverity(event.target.value as 'Critical' | 'Warning' | 'Info')}
              >
                <option value="Critical">Critical</option>
                <option value="Warning">Warning</option>
                <option value="Info">Info</option>
              </select>
            </label>
          </div>
          <label className="ops-field">
            Subject
            <input
              className="sa-input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="One-line summary"
            />
          </label>
          <label className="ops-field">
            Detail
            <textarea
              className="sa-input ds-textarea"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="What is stuck, short or going wrong, and what decision is needed?"
            />
          </label>
          <div className="ops-field-actions">
            <button type="button" className="sa-btn approve" disabled={!canCreate} onClick={submitCreate}>
              Raise to {targetForKind(kind)}
            </button>
          </div>
        </div>
      )}

      <div className="sa-approval-list">
        {rows.map((row) => (
          <article key={row.id} className="sa-approval-item">
            <div className="sa-approval-copy">
              <div className="sa-approval-tags">
                <span className="sa-approval-id">{row.id}</span>
                <StatusPill status={row.severity} />
                <StatusPill status={row.status} />
                <span className="sa-approval-meta">{row.kind}</span>
                {row.escalatedTo && <span className="sa-approval-id">→ {row.escalatedTo}</span>}
              </div>
              <strong>
                {row.subject} · {row.reference}
              </strong>
              <p>{row.detail}</p>
              <span className="sa-approval-meta">Received {row.received}</span>
            </div>
            <div className="sa-approval-actions">
              {row.status !== 'Escalated' && (
                <button
                  type="button"
                  className="sa-btn-ghost"
                  disabled={row.status === 'Acknowledged'}
                  onClick={() => onAcknowledge(row.id)}
                >
                  {row.status === 'Acknowledged' ? 'Acknowledged' : 'Acknowledge'}
                </button>
              )}
              {row.status !== 'Escalated' && (
                <button type="button" className="sa-btn approve" onClick={() => startEscalate(row)}>
                  Escalate up
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {escalatingId && (
        <div className="sa-toolbar ops-action-form">
          <label className="ops-field">
            Escalate {escalatingId} to
            <select className="sa-select" value={target} onChange={(event) => setTarget(event.target.value)}>
              {escalationTargets.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="ops-field ops-field-grow">
            Reason (required)
            <input
              className="sa-input"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="What action or decision is needed?"
            />
          </label>
          <div className="ops-field-actions">
            <button type="button" className="sa-btn approve" disabled={reason.trim().length < 4} onClick={submitEscalate}>
              Send escalation
            </button>
            <button type="button" className="sa-btn-ghost" onClick={() => setEscalatingId(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
