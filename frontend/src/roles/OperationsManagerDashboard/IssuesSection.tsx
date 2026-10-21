import { useMemo, useState } from 'react'
import { StatCards, type StatCard } from '../CityAdminDashboard/shared'
import {
  issueAssignees,
  issueCategories,
  issueCategoryDescriptions,
  issueSeverities,
  issueStatuses,
  zoneAdminTarget,
  type IssueAttachment,
  type IssueCategory,
  type IssueSeverity,
  type IssueStatus,
  type OpsIssue,
} from './opsIssuesData'
import { opsProfile } from './operationsData'
import { StatusPill } from './shared'

export type IssueDraft = {
  category: IssueCategory
  severity: IssueSeverity
  title: string
  detail: string
  vehicle: string
  registration: string
  jobId: string
  site: string
  assignedTo: string
  attachments: IssueAttachment[]
  escalateToZoneAdmin: boolean
  escalationReason: string
}

type IssuesSectionProps = {
  issues: OpsIssue[]
  onRecord: (draft: IssueDraft) => void
  onAssign: (id: string, assignee: string) => void
  onStatus: (id: string, status: IssueStatus, note: string) => void
  onEscalate: (id: string, reason: string) => void
}

const issuesStyles = `
  .ops-issue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(430px, 1fr));
    gap: 14px;
    margin-top: 16px;
  }
  .ops-issue-card {
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 12px;
  }
  .ops-issue-card.sev-Critical { border-left-color: #dc2626; }
  .ops-issue-card.sev-Major { border-left-color: #f59e0b; }
  .ops-issue-card.sev-Minor { border-left-color: #94a3b8; }
  .ops-issue-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .ops-issue-head-left {
    display: grid;
    gap: 6px;
  }
  .ops-issue-id {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--sa-muted);
  }
  .ops-issue-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
    line-height: 1.35;
  }
  .ops-issue-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .ops-issue-detail {
    margin: 0;
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.6;
  }
  .ops-issue-facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px 14px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #fbfcfd;
    border: 1px solid var(--sa-line);
  }
  .ops-issue-fact {
    display: grid;
    gap: 2px;
  }
  .ops-issue-fact span {
    font-size: 0.66rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sa-muted);
  }
  .ops-issue-fact strong {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--sa-text);
  }
  .ops-issue-attachments {
    display: grid;
    gap: 6px;
  }
  .ops-issue-attachments-label {
    font-size: 0.66rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sa-muted);
  }
  .ops-issue-attachment {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font-size: 0.76rem;
    color: var(--sa-text);
  }
  .ops-issue-attachment span {
    color: var(--sa-muted);
    font-size: 0.72rem;
    margin-left: auto;
    white-space: nowrap;
  }
  .ops-issue-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ops-issue-actions select {
    padding: 7px 10px;
    border-radius: 9px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font: inherit;
    font-size: 0.78rem;
  }
  .ops-issue-escalated {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(220, 38, 38, 0.25);
    background: rgba(220, 38, 38, 0.06);
  }
  .ops-issue-escalated strong {
    font-size: 0.78rem;
    color: #b91c1c;
  }
  .ops-issue-escalated p {
    margin: 0;
    font-size: 0.76rem;
    color: #475569;
    line-height: 1.55;
  }
  .ops-issue-resolution {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(8, 166, 108, 0.25);
    background: var(--sa-green-soft);
  }
  .ops-issue-resolution strong {
    font-size: 0.78rem;
    color: var(--sa-green);
  }
  .ops-issue-resolution p {
    margin: 0;
    font-size: 0.76rem;
    color: #475569;
    line-height: 1.55;
  }
  .ops-issue-form {
    margin-top: 16px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }
  .ops-issue-form-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    background: #fbfcfd;
  }
  .ops-issue-form-head h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .ops-issue-form-head p {
    margin: 3px 0 0;
    font-size: 0.76rem;
    color: var(--sa-muted);
  }
  .ops-issue-form-body {
    padding: 16px 18px;
    display: grid;
    gap: 14px;
  }
  .ops-issue-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px;
  }
  .ops-issue-field {
    display: grid;
    gap: 5px;
  }
  .ops-issue-field label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sa-muted);
  }
  .ops-issue-field input,
  .ops-issue-field select,
  .ops-issue-field textarea {
    padding: 9px 11px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font: inherit;
    font-size: 0.82rem;
    color: var(--sa-text);
    width: 100%;
  }
  .ops-issue-field textarea {
    min-height: 84px;
    resize: vertical;
  }
  .ops-issue-field.wide {
    grid-column: 1 / -1;
  }
  .ops-issue-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ops-issue-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid var(--sa-line);
    background: #fbfcfd;
    font-size: 0.76rem;
    color: var(--sa-text);
  }
  .ops-issue-chip button {
    border: 0;
    background: none;
    cursor: pointer;
    font: inherit;
    color: var(--sa-muted);
    line-height: 1;
    padding: 0;
  }
  .ops-issue-error {
    font-size: 0.78rem;
    color: #b91c1c;
  }
  .ops-issue-filter-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
    padding: 12px 14px;
    border: 1px solid var(--sa-line);
    border-radius: 14px;
    background: #fbfcfd;
  }
  .ops-issue-filter-bar input,
  .ops-issue-filter-bar select {
    padding: 8px 11px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font: inherit;
    font-size: 0.8rem;
    color: var(--sa-text);
  }
  .ops-issue-filter-bar input {
    flex: 1 1 220px;
  }
  .ops-issue-empty {
    padding: 32px 18px;
    text-align: center;
    color: var(--sa-muted);
    font-size: 0.84rem;
  }
`

const emptyDraft: IssueDraft = {
  category: 'Breakdown',
  severity: 'Major',
  title: '',
  detail: '',
  vehicle: '',
  registration: '',
  jobId: '',
  site: '',
  assignedTo: '',
  attachments: [],
  escalateToZoneAdmin: false,
  escalationReason: '',
}

export default function IssuesSection({
  issues,
  onRecord,
  onAssign,
  onStatus,
  onEscalate,
}: IssuesSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<IssueDraft>(emptyDraft)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [escalatingId, setEscalatingId] = useState<string | null>(null)
  const [escalationReason, setEscalationReason] = useState('')
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')

  const cards: StatCard[] = useMemo(() => {
    const open = issues.filter((issue) => issue.status !== 'Closed' && issue.status !== 'Resolved').length
    const critical = issues.filter((issue) => issue.severity === 'Critical' && issue.status !== 'Closed').length
    const unassigned = issues.filter((issue) => !issue.assignedTo && issue.status !== 'Closed').length
    const escalated = issues.filter((issue) => issue.status === 'Escalated').length
    const attachments = issues.reduce((total, issue) => total + issue.attachments.length, 0)
    return [
      { key: 'open', label: 'Open issues', value: open, tone: 'blue', sub: `${issues.length} recorded` },
      { key: 'critical', label: 'Critical', value: critical, tone: 'red', sub: 'Still open' },
      { key: 'unassigned', label: 'Unassigned', value: unassigned, tone: 'amber', sub: 'Need an owner' },
      { key: 'escalated', label: 'Escalated', value: escalated, tone: 'purple', sub: 'With the Zone Admin' },
      { key: 'attachments', label: 'Attachments', value: attachments, tone: 'amber', sub: 'Evidence on file' },
      { key: 'resolved', label: 'Resolved', value: issues.filter((issue) => issue.status === 'Resolved' || issue.status === 'Closed').length, tone: 'green', sub: 'Closed out' },
    ]
  }, [issues])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return issues.filter((issue) => {
      if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false
      if (severityFilter !== 'all' && issue.severity !== severityFilter) return false
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false
      if (!term) return true
      const haystack = [
        issue.id,
        issue.title,
        issue.detail,
        issue.vehicle,
        issue.registration,
        issue.site,
        issue.reportedBy,
        issue.assignedTo ?? '',
        issue.jobId ?? '',
        issue.escalationReason ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [issues, search, categoryFilter, severityFilter, statusFilter])

  const update = (patch: Partial<IssueDraft>) => setDraft((prev) => ({ ...prev, ...patch }))

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const added: IssueAttachment[] = Array.from(files).map((file, index) => ({
      id: `ATT-${Date.now()}-${index}`,
      name: file.name,
      kind: file.type.startsWith('image/')
        ? 'Photo'
        : file.type.startsWith('video/')
          ? 'Video'
          : 'Document',
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      uploadedBy: opsProfile.adminName,
      uploadedAt: 'Just now',
    }))
    update({ attachments: [...draft.attachments, ...added] })
  }

  const submit = () => {
    if (draft.title.trim().length < 4) {
      setError('Give the issue a short title (at least 4 characters).')
      return
    }
    if (draft.detail.trim().length < 10) {
      setError('Describe what happened in at least 10 characters.')
      return
    }
    if (draft.escalateToZoneAdmin && draft.escalationReason.trim().length < 6) {
      setError('Give a reason for escalating to the Zone Admin.')
      return
    }
    onRecord({ ...draft, title: draft.title.trim(), detail: draft.detail.trim() })
    setDraft(emptyDraft)
    setError('')
    setShowForm(false)
  }

  const submitEscalation = (issue: OpsIssue) => {
    if (escalationReason.trim().length < 6) return
    onEscalate(issue.id, escalationReason.trim())
    setEscalatingId(null)
    setEscalationReason('')
  }

  const submitResolution = (issue: OpsIssue) => {
    if (resolutionNote.trim().length < 6) return
    onStatus(issue.id, 'Resolved', resolutionNote.trim())
    setResolvingId(null)
    setResolutionNote('')
  }

  return (
    <section className="sa-panel">
      <style>{issuesStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Issues &amp; incident reports</h3>
          <span className="sa-panel-sub">
            Breakdowns, accidents, vehicle damage, missed handovers and customer issues · {opsProfile.zone} zone only
          </span>
        </div>
        <div className="finance-header-controls">
          <button
            type="button"
            className="sa-btn primary"
            onClick={() => {
              setShowForm((prev) => !prev)
              setError('')
            }}
          >
            {showForm ? 'Close form' : 'Record an issue'}
          </button>
        </div>
      </div>

      <StatCards cards={cards} />

      {showForm && (
        <div className="ops-issue-form">
          <div className="ops-issue-form-head">
            <div>
              <h4>Record an issue</h4>
              <p>Every case is logged with your name, the time and the evidence you attach.</p>
            </div>
          </div>
          <div className="ops-issue-form-body">
            <div className="ops-issue-form-grid">
              <div className="ops-issue-field">
                <label htmlFor="issue-category">Issue type</label>
                <select
                  id="issue-category"
                  value={draft.category}
                  onChange={(event) => update({ category: event.target.value as IssueCategory })}
                >
                  {issueCategories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ops-issue-field">
                <label htmlFor="issue-severity">Severity</label>
                <select
                  id="issue-severity"
                  value={draft.severity}
                  onChange={(event) => update({ severity: event.target.value as IssueSeverity })}
                >
                  {issueSeverities.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ops-issue-field">
                <label htmlFor="issue-vehicle">Vehicle</label>
                <input
                  id="issue-vehicle"
                  value={draft.vehicle}
                  onChange={(event) => update({ vehicle: event.target.value })}
                  placeholder="CAT 320 Excavator"
                />
              </div>
              <div className="ops-issue-field">
                <label htmlFor="issue-registration">Registration</label>
                <input
                  id="issue-registration"
                  value={draft.registration}
                  onChange={(event) => update({ registration: event.target.value })}
                  placeholder="TS 05 EF 9087"
                />
              </div>
              <div className="ops-issue-field">
                <label htmlFor="issue-job">Job / booking</label>
                <input
                  id="issue-job"
                  value={draft.jobId}
                  onChange={(event) => update({ jobId: event.target.value })}
                  placeholder="JOB-7801"
                />
              </div>
              <div className="ops-issue-field">
                <label htmlFor="issue-site">Site</label>
                <input
                  id="issue-site"
                  value={draft.site}
                  onChange={(event) => update({ site: event.target.value })}
                  placeholder="Metro rail site, HITEC City"
                />
              </div>
              <div className="ops-issue-field">
                <label htmlFor="issue-assignee">Assign to</label>
                <select
                  id="issue-assignee"
                  value={draft.assignedTo}
                  onChange={(event) => update({ assignedTo: event.target.value })}
                >
                  <option value="">Unassigned</option>
                  {issueAssignees.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ops-issue-field">
                <label htmlFor="issue-escalate">Escalate to Zone Admin</label>
                <select
                  id="issue-escalate"
                  value={draft.escalateToZoneAdmin ? 'yes' : 'no'}
                  onChange={(event) => update({ escalateToZoneAdmin: event.target.value === 'yes' })}
                >
                  <option value="no">No — handle in the zone</option>
                  <option value="yes">Yes — escalate to {zoneAdminTarget}</option>
                </select>
              </div>
              <div className="ops-issue-field wide">
                <label htmlFor="issue-title">Title</label>
                <input
                  id="issue-title"
                  value={draft.title}
                  onChange={(event) => update({ title: event.target.value })}
                  placeholder="Short summary of the issue"
                />
              </div>
              <div className="ops-issue-field wide">
                <label htmlFor="issue-detail">What happened</label>
                <textarea
                  id="issue-detail"
                  value={draft.detail}
                  onChange={(event) => update({ detail: event.target.value })}
                  placeholder="Describe the incident, the site and the immediate action taken"
                />
              </div>
              {draft.escalateToZoneAdmin && (
                <div className="ops-issue-field wide">
                  <label htmlFor="issue-escalation-reason">Reason for escalation</label>
                  <input
                    id="issue-escalation-reason"
                    value={draft.escalationReason}
                    onChange={(event) => update({ escalationReason: event.target.value })}
                    placeholder="Why the Zone Admin needs to take this on"
                  />
                </div>
              )}
              <div className="ops-issue-field wide">
                <label htmlFor="issue-attachments">Attachments</label>
                <input
                  id="issue-attachments"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={(event) => addFiles(event.target.files)}
                />
                {draft.attachments.length > 0 && (
                  <div className="ops-issue-chips">
                    {draft.attachments.map((attachment) => (
                      <span key={attachment.id} className="ops-issue-chip">
                        {attachment.name} · {attachment.size}
                        <button
                          type="button"
                          aria-label={`Remove ${attachment.name}`}
                          onClick={() =>
                            update({ attachments: draft.attachments.filter((item) => item.id !== attachment.id) })
                          }
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {error && <p className="ops-issue-error">{error}</p>}
            <div className="ops-issue-actions">
              <button type="button" className="sa-btn approve" onClick={submit}>
                Record issue
              </button>
              <button
                type="button"
                className="sa-btn-ghost"
                onClick={() => {
                  setDraft(emptyDraft)
                  setError('')
                  setShowForm(false)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ops-issue-filter-bar">
        <input
          aria-label="Search issues"
          placeholder="Search title, vehicle, site, staff or case id..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Filter by issue type" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="all">All issue types</option>
          {issueCategories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select aria-label="Filter by severity" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
          <option value="all">All severities</option>
          {issueSeverities.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {issueStatuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="sa-toolbar-meta">{visible.length} of {issues.length} cases</span>
      </div>

      {visible.length === 0 ? (
        <p className="ops-issue-empty">No issues match the current filters.</p>
      ) : (
        <div className="ops-issue-grid">
          {visible.map((issue) => (
            <article key={issue.id} className={`ops-issue-card sev-${issue.severity}`}>
              <div className="ops-issue-head">
                <div className="ops-issue-head-left">
                  <span className="ops-issue-id">
                    {issue.id} · {issue.category}
                  </span>
                  <h4 className="ops-issue-title">{issue.title}</h4>
                  <div className="ops-issue-tags">
                    <StatusPill status={issue.severity} />
                    <StatusPill status={issue.status} />
                    {issue.injuries > 0 && <span className="sa-pill red">{issue.injuries} injured</span>}
                    {issue.downtimeDays > 0 && <span className="sa-pill amber">{issue.downtimeDays} d downtime</span>}
                  </div>
                </div>
                <button
                  type="button"
                  className="sa-btn-ghost"
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [issue.id]: !prev[issue.id] }))
                  }
                  aria-expanded={Boolean(expanded[issue.id])}
                >
                  {expanded[issue.id] ? 'Hide' : 'Details'}
                </button>
              </div>

              <p className="ops-issue-detail">{issue.detail}</p>

              <div className="ops-issue-facts">
                <div className="ops-issue-fact">
                  <span>Vehicle</span>
                  <strong>
                    {issue.vehicle || '—'}
                    {issue.registration ? ` · ${issue.registration}` : ''}
                  </strong>
                </div>
                <div className="ops-issue-fact">
                  <span>Site</span>
                  <strong>{issue.site || '—'}</strong>
                </div>
                <div className="ops-issue-fact">
                  <span>Assigned to</span>
                  <strong>{issue.assignedTo ?? 'Unassigned'}</strong>
                </div>
                <div className="ops-issue-fact">
                  <span>Reported</span>
                  <strong>
                    {issue.reportedBy} · {issue.reportedAt}
                  </strong>
                </div>
              </div>

              {issue.escalatedTo && (
                <div className="ops-issue-escalated">
                  <strong>Escalated to {issue.escalatedTo}</strong>
                  <p>
                    {issue.escalationReason} {issue.escalatedAt ? `· ${issue.escalatedAt}` : ''}
                  </p>
                </div>
              )}

              {issue.resolutionNote && (
                <div className="ops-issue-resolution">
                  <strong>Resolution{issue.resolvedAt ? ` · ${issue.resolvedAt}` : ''}</strong>
                  <p>{issue.resolutionNote}</p>
                </div>
              )}

              {expanded[issue.id] && (
                <div className="ops-issue-attachments">
                  <span className="ops-issue-attachments-label">
                    Attachments ({issue.attachments.length})
                  </span>
                  {issue.attachments.length === 0 ? (
                    <p className="ops-issue-detail">No evidence attached to this case.</p>
                  ) : (
                    issue.attachments.map((attachment) => (
                      <div key={attachment.id} className="ops-issue-attachment">
                        <strong>{attachment.kind}</strong>
                        {attachment.name}
                        <span>
                          {attachment.size} · {attachment.uploadedBy} · {attachment.uploadedAt}
                        </span>
                      </div>
                    ))
                  )}
                  <div className="ops-issue-facts">
                    <div className="ops-issue-fact">
                      <span>Job / booking</span>
                      <strong>{issue.jobId ?? issue.bookingId ?? '—'}</strong>
                    </div>
                    <div className="ops-issue-fact">
                      <span>Issue type</span>
                      <strong>{issueCategoryDescriptions[issue.category]}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="ops-issue-actions">
                <select
                  aria-label={`Assign ${issue.id}`}
                  value={issue.assignedTo ?? ''}
                  onChange={(event) => onAssign(issue.id, event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {issueAssignees.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={`Status for ${issue.id}`}
                  value={issue.status}
                  onChange={(event) => onStatus(issue.id, event.target.value as IssueStatus, 'Status updated from the case file.')}
                >
                  {issueStatuses.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {issue.status !== 'Escalated' && issue.status !== 'Closed' && (
                  <button
                    type="button"
                    className="sa-btn-ghost"
                    onClick={() => {
                      setEscalatingId(issue.id)
                      setEscalationReason('')
                    }}
                  >
                    Escalate to Zone Admin
                  </button>
                )}
                {issue.status !== 'Resolved' && issue.status !== 'Closed' && (
                  <button
                    type="button"
                    className="sa-btn-ghost"
                    onClick={() => {
                      setResolvingId(issue.id)
                      setResolutionNote('')
                    }}
                  >
                    Record resolution
                  </button>
                )}
              </div>

              {escalatingId === issue.id && (
                <div className="ops-issue-form-body" style={{ padding: 0 }}>
                  <div className="ops-issue-field">
                    <label htmlFor={`escalate-${issue.id}`}>Reason for escalation to {zoneAdminTarget}</label>
                    <input
                      id={`escalate-${issue.id}`}
                      value={escalationReason}
                      onChange={(event) => setEscalationReason(event.target.value)}
                      placeholder="What decision or resource do you need?"
                    />
                  </div>
                  <div className="ops-issue-actions">
                    <button
                      type="button"
                      className="sa-btn approve"
                      disabled={escalationReason.trim().length < 6}
                      onClick={() => submitEscalation(issue)}
                    >
                      Send escalation
                    </button>
                    <button type="button" className="sa-btn-ghost" onClick={() => setEscalatingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {resolvingId === issue.id && (
                <div className="ops-issue-form-body" style={{ padding: 0 }}>
                  <div className="ops-issue-field">
                    <label htmlFor={`resolve-${issue.id}`}>Resolution note</label>
                    <input
                      id={`resolve-${issue.id}`}
                      value={resolutionNote}
                      onChange={(event) => setResolutionNote(event.target.value)}
                      placeholder="What was done to close this out?"
                    />
                  </div>
                  <div className="ops-issue-actions">
                    <button
                      type="button"
                      className="sa-btn approve"
                      disabled={resolutionNote.trim().length < 6}
                      onClick={() => submitResolution(issue)}
                    >
                      Mark resolved
                    </button>
                    <button type="button" className="sa-btn-ghost" onClick={() => setResolvingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <p className="ops-issue-empty" style={{ textAlign: 'left' }}>
        Every action on a case — recording, assignment, status change, resolution and escalation — is written to the audit
        trail with your name and the time.
      </p>
    </section>
  )
}
