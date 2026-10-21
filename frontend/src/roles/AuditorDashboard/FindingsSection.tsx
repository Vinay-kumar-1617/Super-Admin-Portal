import { useState } from 'react'
import { SeverityPill, StatusPill } from './shared'
import {
  areaOptions,
  type AuditArea,
  type Finding,
  type FindingDraft,
  type FindingSeverity,
  type FindingStatus,
} from './auditorData'

const assigneeOptions = [
  'Unassigned',
  'Rohit Malhotra',
  'Vikram Desai',
  'Meera Iyer',
  'Ankit Rao',
  'Neha Sethi',
  'Kabir Shah',
]

const severityOptions: FindingSeverity[] = ['High', 'Medium', 'Low']
const statusFilters: Array<'All' | FindingStatus> = ['All', 'Open', 'Assigned', 'In review', 'Fixed', 'Verified', 'Reopened']

export type NewFinding = {
  title: string
  detail: string
  area: AuditArea
  severity: FindingSeverity
  evidence: string[]
  assignee: string
}

type FindingsSectionProps = {
  findings: Finding[]
  draft: FindingDraft | null
  onClearDraft: () => void
  onCreate: (payload: NewFinding) => void
  onAssign: (id: string, assignee: string) => void
  onComment: (id: string, body: string) => void
  onRecheck: (id: string) => void
  onVerify: (id: string) => void
  onReopen: (id: string) => void
}

export default function FindingsSection({
  findings,
  draft,
  onClearDraft,
  onCreate,
  onAssign,
  onComment,
  onRecheck,
  onVerify,
  onReopen,
}: FindingsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | FindingStatus>('All')

  const visible = findings.filter((finding) => statusFilter === 'All' || finding.status === statusFilter)
  const openCount = findings.filter((finding) => finding.status !== 'Verified').length

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Raise a finding</h3>
          <span className="sa-panel-sub">
            Attach evidence, set severity and assign the responsible admin · the auditor cannot fix anything itself
          </span>
        </div>
        <FindingForm
          key={draft ? `${draft.title}|${draft.area}` : 'blank'}
          draft={draft}
          onCreate={(payload) => {
            onCreate(payload)
            onClearDraft()
          }}
        />
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Findings</h3>
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
          <span className="sa-panel-sub">{openCount} open · track to closure, then re-check before closing</span>
          <span className="sa-toolbar-meta">{visible.length} of {findings.length}</span>
        </div>

        {visible.length === 0 ? (
          <div className="sa-empty">
            <p>No findings match this filter.</p>
          </div>
        ) : (
          <div className="sa-approval-list">
            {visible.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                onAssign={onAssign}
                onComment={onComment}
                onRecheck={onRecheck}
                onVerify={onVerify}
                onReopen={onReopen}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function FindingForm({ draft, onCreate }: { draft: FindingDraft | null; onCreate: (payload: NewFinding) => void }) {
  const [title, setTitle] = useState(draft?.title ?? '')
  const [detail, setDetail] = useState(draft?.detail ?? '')
  const [area, setArea] = useState<AuditArea>(draft?.area ?? 'Finance')
  const [severity, setSeverity] = useState<FindingSeverity>(draft?.severity ?? 'High')
  const [evidence, setEvidence] = useState(draft ? draft.evidence.join(', ') : '')
  const [assignee, setAssignee] = useState(assigneeOptions[0])

  const canCreate = title.trim().length >= 4 && detail.trim().length >= 8

  const create = () => {
    if (!canCreate) return
    onCreate({
      title: title.trim(),
      detail: detail.trim(),
      area,
      severity,
      evidence: evidence
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      assignee,
    })
    setTitle('')
    setDetail('')
    setEvidence('')
    setAssignee(assigneeOptions[0])
  }

  return (
    <div className="cf-form">
      <label className="cf-field cf-field-grow">
        <span>Title</span>
        <input className="sa-input" placeholder="Short finding title..." value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="cf-field">
        <span>Area</span>
        <select className="sa-select" value={area} onChange={(event) => setArea(event.target.value as AuditArea)}>
          {areaOptions.filter((option) => option !== 'All').map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="cf-field">
        <span>Severity</span>
        <select className="sa-select" value={severity} onChange={(event) => setSeverity(event.target.value as FindingSeverity)}>
          {severityOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="cf-field">
        <span>Assign to</span>
        <select className="sa-select" value={assignee} onChange={(event) => setAssignee(event.target.value)}>
          {assigneeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="cf-field cf-field-grow">
        <span>Evidence</span>
        <input className="sa-input" placeholder="Comma separated, e.g. AUD-9020, SET-7741" value={evidence} onChange={(event) => setEvidence(event.target.value)} />
      </label>
      <label className="cf-field cf-field-grow">
        <span>Detail</span>
        <input className="sa-input" placeholder="What is wrong and why it matters..." value={detail} onChange={(event) => setDetail(event.target.value)} />
      </label>
      <button type="button" className="sa-btn approve" onClick={create} disabled={!canCreate}>
        Raise finding
      </button>
      {draft && <span className="cf-review-note">Draft loaded from a control review — review before raising.</span>}
    </div>
  )
}

function FindingCard({
  finding,
  onAssign,
  onComment,
  onRecheck,
  onVerify,
  onReopen,
}: {
  finding: Finding
  onAssign: (id: string, assignee: string) => void
  onComment: (id: string, body: string) => void
  onRecheck: (id: string) => void
  onVerify: (id: string) => void
  onReopen: (id: string) => void
}) {
  const [comment, setComment] = useState('')

  return (
    <article className="aud-finding">
      <div className="aud-finding-head">
        <div className="sa-approval-tags">
          <span className="sa-approval-id">{finding.id}</span>
          <span className="sa-pill slate">{finding.area}</span>
          <SeverityPill severity={finding.severity} />
          <StatusPill status={finding.status} />
        </div>
        <span className="sa-approval-meta">Opened {finding.opened} · {finding.rechecks} re-checks</span>
      </div>

      <div className="aud-finding-body">
        <strong>{finding.title}</strong>
        <p>{finding.detail}</p>
        <div className="aud-evidence">
          <span className="aud-evidence-label">Evidence</span>
          {finding.evidence.map((item) => (
            <span key={item} className="aud-evidence-tag">{item}</span>
          ))}
        </div>
      </div>

      <div className="aud-finding-assign">
        <label className="cf-field">
          <span>Assigned to</span>
          <select className="sa-select" value={finding.assignee} onChange={(event) => onAssign(finding.id, event.target.value)}>
            {assigneeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <div className="sa-approval-actions">
          {finding.status === 'Fixed' && (
            <button type="button" className="sa-btn-ghost" onClick={() => onRecheck(finding.id)}>
              Re-check
            </button>
          )}
          {(finding.status === 'Fixed' || finding.status === 'Reopened') && (
            <button type="button" className="sa-btn approve" onClick={() => onVerify(finding.id)}>
              Mark verified
            </button>
          )}
          {(finding.status === 'Verified' || finding.status === 'In review') && (
            <button type="button" className="sa-btn reject" onClick={() => onReopen(finding.id)}>
              Reopen
            </button>
          )}
        </div>
      </div>

      <div className="aud-comments">
        {finding.comments.map((entry) => (
          <div key={entry.id} className="sp-msg">
            <div className="sp-msg-head">
              <strong>{entry.author}</strong>
              <span className="sp-msg-role">{entry.role}</span>
              <span className="sp-msg-time">{entry.time}</span>
            </div>
            <p className="sp-msg-body">{entry.body}</p>
          </div>
        ))}
        <div className="cf-review-actions">
          <input
            className="sa-input"
            placeholder="Add a comment..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <button
            type="button"
            className="sa-btn-ghost"
            disabled={comment.trim().length < 2}
            onClick={() => {
              onComment(finding.id, comment.trim())
              setComment('')
            }}
          >
            Comment
          </button>
        </div>
      </div>
    </article>
  )
}
