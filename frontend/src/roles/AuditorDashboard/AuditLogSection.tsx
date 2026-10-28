import { useMemo, useState } from 'react'
import { ResultPill } from './shared'
import {
  areaOptions,
  dateOptions,
  resultOptions,
  roleOptions,
  type AuditEvent,
  type AuditFilters,
  type SavedFilter,
} from './auditorData'

type AuditLogSectionProps = {
  rows: AuditEvent[]
  total: number
  filters: AuditFilters
  onFilterChange: (patch: Partial<AuditFilters>) => void
  onReset: () => void
  savedFilters: SavedFilter[]
  onApplySavedFilter: (filter: SavedFilter) => void
  onDeleteSavedFilter: (id: string) => void
  onSaveCurrentFilter: (name: string) => void
  expandedId: string | null
  bookmarkedIds: string[]
  onToggleExpand: (id: string) => void
  onToggleFlag: (id: string) => void
  onToggleBookmark: (id: string) => void
  onExport: () => void
  onRaiseFinding: (event: AuditEvent) => void
}

export default function AuditLogSection({
  rows,
  total,
  filters,
  onFilterChange,
  onReset,
  savedFilters,
  onApplySavedFilter,
  onDeleteSavedFilter,
  onSaveCurrentFilter,
  expandedId,
  bookmarkedIds,
  onToggleExpand,
  onToggleFlag,
  onToggleBookmark,
  onExport,
  onRaiseFinding,
}: AuditLogSectionProps) {
  const [filterName, setFilterName] = useState('')
  const [auditorNotes, setAuditorNotes] = useState<Record<string, string>>({})
  const [investigationStatus, setInvestigationStatus] = useState<Record<string, string>>({})

  const summary = useMemo(() => {
    const allEvents = rows.length >= 0 ? rows : []
    const totalActivities = total || allEvents.length
    const highRisk = allEvents.filter((e) => e.riskLevel === 'High' || e.sensitive || e.flagged).length
    const failedActions = allEvents.filter((e) => e.result === 'Failed' || e.result === 'Denied').length
    const unreviewed = allEvents.filter((e) => e.status === 'Unreviewed' || !e.status).length
    return { totalActivities, highRisk, failedActions, unreviewed }
  }, [rows, total])

  const saveFilter = () => {
    const name = filterName.trim()
    if (name.length < 3) return
    onSaveCurrentFilter(name)
    setFilterName('')
  }

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Record ID', 'Risk Level', 'Status', 'Result']
    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.timestamp || r.time,
          `"${r.user || r.actor}"`,
          `"${r.role}"`,
          `"${r.action}"`,
          `"${r.module || r.area}"`,
          `"${r.recordId || r.target}"`,
          r.riskLevel || (r.sensitive ? 'High' : r.flagged ? 'Medium' : 'Low'),
          r.status || 'Unreviewed',
          r.result,
        ].join(','),
      ),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPDF = () => {
    window.print()
  }

  return (
    <>
      <style>{`
        .al-summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 16px; }
        .al-summary-card {
          background: var(--sa-card-bg, #fff);
          border: 1px solid var(--sa-line, rgba(15,23,42,0.08));
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 12px 28px rgba(15,23,42,0.05);
          display: grid;
          gap: 6px;
        }
        .al-summary-label { font-size: 0.76rem; color: var(--sa-muted, #8a96a6); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .al-summary-value { font-size: 2rem; font-weight: 800; letter-spacing: -0.05em; }
        .al-summary-sub { font-size: 0.74rem; color: var(--sa-muted, #8a96a6); }
        .al-risk-high { border-color: rgba(239,68,68,0.3); }
        .al-risk-failed { border-color: rgba(245,158,11,0.3); }
        .al-risk-unrev { border-color: rgba(37,99,235,0.3); }
        .al-badge {
          display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 8px;
          font-size: 0.7rem; font-weight: 800;
        }
        .al-badge.high { background: rgba(239,68,68,0.12); color: #b91c1c; }
        .al-badge.medium { background: rgba(245,158,11,0.12); color: #b45309; }
        .al-badge.low { background: rgba(8,166,108,0.12); color: #047857; }
        .al-badge.reviewed { background: rgba(8,166,108,0.12); color: #047857; }
        .al-badge.unreviewed { background: rgba(37,99,235,0.12); color: #1d4ed8; }
        .al-detail-grid { display: grid; gap: 12px; }
        .al-detail-section { border: 1px solid var(--sa-line, rgba(15,23,42,0.08)); border-radius: 12px; overflow: hidden; }
        .al-detail-header { background: #f8fafc; padding: 10px 14px; font-size: 0.8rem; font-weight: 800; }
        .al-detail-body { padding: 12px 14px; display: grid; gap: 8px; }
        .al-kv { display: grid; grid-template-columns: 140px 1fr; gap: 10px; font-size: 0.84rem; }
        .al-kv-label { color: var(--sa-muted, #8a96a6); font-weight: 600; }
        .al-textarea { width: 100%; min-height: 70px; border: 1px solid rgba(15,23,42,0.12); border-radius: 10px; padding: 8px 10px; font: inherit; font-size: 0.84rem; }
        @media print {
          .sa-sidebar, .dashboard-header, .sa-toolbar, .al-summary-grid button, .sa-btn-ghost, .sa-btn, .aud-flag, .aud-star { display: none !important; }
          .sa-main { margin: 0; padding: 0; }
          .sa-content { padding: 0; }
        }
      `}</style>

      <div className="al-summary-grid">
        <div className="al-summary-card">
          <span className="al-summary-label">Total Activities</span>
          <span className="al-summary-value">{summary.totalActivities.toLocaleString('en-IN')}</span>
          <span className="al-summary-sub">Immutable audit trail</span>
        </div>
        <div className="al-summary-card al-risk-high">
          <span className="al-summary-label">High-Risk Activities</span>
          <span className="al-summary-value">{summary.highRisk}</span>
          <span className="al-summary-sub">Sensitive / flagged events</span>
        </div>
        <div className="al-summary-card al-risk-failed">
          <span className="al-summary-label">Failed Actions</span>
          <span className="al-summary-value">{summary.failedActions}</span>
          <span className="al-summary-sub">Denied / failed results</span>
        </div>
        <div className="al-summary-card al-risk-unrev">
          <span className="al-summary-label">Unreviewed Logs</span>
          <span className="al-summary-value">{summary.unreviewed}</span>
          <span className="al-summary-sub">Pending auditor review</span>
        </div>
      </div>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Audit Log</h3>
          <span className="sa-panel-sub">Enterprise audit trail · Read-only · Role-based access · {total} events</span>
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search audit log"
            placeholder="Search by User, Action, Record ID..."
            value={filters.query}
            onChange={(event) => onFilterChange({ query: event.target.value })}
          />
          <select className="sa-select" aria-label="Filter by module" value={filters.area} onChange={(event) => onFilterChange({ area: event.target.value as AuditFilters['area'] })}>
            {areaOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All Modules' : option}</option>
            ))}
          </select>
          <select className="sa-select" aria-label="Filter by risk level">
            <option value="All">All Risk Levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select className="sa-select" aria-label="Filter by status">
            <option value="All">All Status</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Unreviewed">Unreviewed</option>
          </select>
          <select className="sa-select" aria-label="Filter by result" value={filters.result} onChange={(event) => onFilterChange({ result: event.target.value as AuditFilters['result'] })}>
            {resultOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All Results' : option}</option>
            ))}
          </select>
          <select className="sa-select" aria-label="Filter by role" value={filters.role} onChange={(event) => onFilterChange({ role: event.target.value })}>
            {roleOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All Roles' : option}</option>
            ))}
          </select>
          <select className="sa-select" aria-label="Filter by date" value={filters.date} onChange={(event) => onFilterChange({ date: event.target.value })}>
            {dateOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All Dates' : option}</option>
            ))}
          </select>
          <button
            type="button"
            className={`sa-chip ${filters.flaggedOnly ? 'active orange' : ''}`}
            onClick={() => onFilterChange({ flaggedOnly: !filters.flaggedOnly })}
          >
            Flagged only
          </button>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="sa-btn" onClick={exportCSV}>
            Export CSV
          </button>
          <button type="button" className="sa-btn approve" onClick={exportPDF}>
            Export PDF
          </button>
          <span className="sa-toolbar-meta">
            {rows.length} of {total}
          </span>
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Filter by person"
            placeholder="User contains..."
            value={filters.actor}
            onChange={(event) => onFilterChange({ actor: event.target.value })}
          />
          <input
            className="sa-input"
            aria-label="Filter by target"
            placeholder="Record ID / Target..."
            value={filters.target}
            onChange={(event) => onFilterChange({ target: event.target.value })}
          />
          <input
            className="sa-input"
            aria-label="Name this saved filter"
            placeholder="Save current filters as..."
            value={filterName}
            onChange={(event) => setFilterName(event.target.value)}
          />
          <button type="button" className="sa-btn-ghost" onClick={saveFilter} disabled={filterName.trim().length < 3}>
            Save filter
          </button>
        </div>

        {savedFilters.length > 0 && (
          <div className="aud-saved">
            <span className="aud-saved-label">Saved reviews</span>
            {savedFilters.map((filter) => (
              <span key={filter.id} className="aud-saved-item">
                <button type="button" className="sa-chip" onClick={() => onApplySavedFilter(filter)}>
                  {filter.name}
                </button>
                <button type="button" className="aud-saved-remove" aria-label={`Remove ${filter.name}`} onClick={() => onDeleteSavedFilter(filter.id)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No audit events match the current filters.</p>
            <button type="button" className="sa-btn-ghost" onClick={onReset}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Record ID</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((event) => {
                  const risk = event.riskLevel || (event.sensitive ? 'High' : event.flagged ? 'Medium' : 'Low')
                  const status = event.status || 'Unreviewed'
                  return (
                    <tr key={event.id} className={expandedId === event.id ? 'sa-row-selected' : ''}>
                      <td>{event.timestamp || event.time}</td>
                      <td className="sa-cell-strong">
                        {event.user || event.actor}
                        <span className="sa-cell-sub">{event.actor !== (event.user || event.actor) ? event.actor : event.id}</span>
                      </td>
                      <td>{event.role}</td>
                      <td>
                        {event.action}
                        {event.sensitive && <span className="aud-sensitive" title="Sensitive action">sensitive</span>}
                      </td>
                      <td>{event.module || event.area}</td>
                      <td className="sa-cell-strong">{event.recordId || event.target}</td>
                      <td>
                        <span className={`al-badge ${risk.toLowerCase()}`}>{risk}</span>
                      </td>
                      <td>
                        <span className={`al-badge ${status.toLowerCase()}`}>{status}</span>
                      </td>
                      <td>
                        <ResultPill result={event.result} />
                      </td>
                      <td>
                        <button type="button" className="sa-btn-ghost" onClick={() => onToggleExpand(event.id)}>
                          {expandedId === event.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {expandedId && rows.find((r) => r.id === expandedId) && (
        <section className="sa-panel" style={{ marginTop: '16px' }}>
          <div className="sa-panel-header">
            <h3>Activity Details</h3>
            <span className="sa-panel-sub">Immutable log entry · Read-only access to business records</span>
          </div>
          {(() => {
            const event = rows.find((r) => r.id === expandedId)!
            const risk = event.riskLevel || (event.sensitive ? 'High' : event.flagged ? 'Medium' : 'Low')
            const status = event.status || 'Unreviewed'
            return (
              <div style={{ padding: '18px', display: 'grid', gap: '16px' }}>
                <div className="al-detail-grid">
                  <div className="al-detail-section">
                    <div className="al-detail-header">Event Information</div>
                    <div className="al-detail-body">
                      <div className="al-kv"><span className="al-kv-label">Event ID</span><span>{event.id}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Timestamp</span><span>{event.timestamp || event.time}</span></div>
                      <div className="al-kv"><span className="al-kv-label">User</span><span>{event.user || event.actor}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Role</span><span>{event.role}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Action</span><span>{event.action}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Module</span><span>{event.module || event.area}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Record ID</span><span>{event.recordId || event.target}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Location</span><span>{event.city === '—' ? event.state : `${event.city}, ${event.state}`}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Risk Level</span><span className={`al-badge ${risk.toLowerCase()}`}>{risk}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Status</span><span className={`al-badge ${status.toLowerCase()}`}>{status}</span></div>
                      <div className="al-kv"><span className="al-kv-label">Result</span><span>{event.result}</span></div>
                    </div>
                  </div>

                  <div className="al-detail-section">
                    <div className="al-detail-header">Previous / New Values</div>
                    <div className="al-detail-body">
                      {event.changes && event.changes.length > 0 ? (
                        <div className="sa-table-wrap">
                          <table className="sa-table">
                            <thead><tr><th>Field</th><th>Previous Value</th><th>New Value</th></tr></thead>
                            <tbody>
                              {event.changes.map((c, idx) => (
                                <tr key={idx}><td className="sa-cell-strong">{c.field}</td><td>{c.before}</td><td>{c.after}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.84rem', color: 'var(--sa-muted)' }}>No value changes recorded</span>
                      )}
                    </div>
                  </div>

                  <div className="al-detail-section">
                    <div className="al-detail-header">Risk Alerts</div>
                    <div className="al-detail-body">
                      {event.riskAlerts && event.riskAlerts.length > 0 ? (
                        event.riskAlerts.map((alert, idx) => (
                          <div key={idx} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', color: '#b91c1c', fontWeight: 700, fontSize: '0.84rem' }}>
                            ⚠ {alert}
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.84rem', color: 'var(--sa-muted)' }}>No risk alerts</span>
                      )}
                      {event.note && <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.84rem' }}>{event.note}</div>}
                    </div>
                  </div>

                  <div className="al-detail-section">
                    <div className="al-detail-header">Auditor Notes</div>
                    <div className="al-detail-body">
                      <textarea
                        className="al-textarea"
                        placeholder="Add auditor notes..."
                        value={auditorNotes[event.id] || event.auditorNotes || ''}
                        onChange={(e) => setAuditorNotes({ ...auditorNotes, [event.id]: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="al-detail-section">
                    <div className="al-detail-header">Investigation Status</div>
                    <div className="al-detail-body">
                      <select
                        className="sa-select"
                        style={{ maxWidth: '240px' }}
                        value={investigationStatus[event.id] || event.investigationStatus || 'Open'}
                        onChange={(e) => setInvestigationStatus({ ...investigationStatus, [event.id]: e.target.value })}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="cf-review-actions">
                  <button type="button" className={`sa-btn ${event.flagged ? 'reject' : ''}`} onClick={() => onToggleFlag(event.id)}>
                    {event.flagged ? 'Remove flag' : 'Flag for follow-up'}
                  </button>
                  <button type="button" className="sa-btn-ghost" onClick={() => onToggleBookmark(event.id)}>
                    {bookmarkedIds.includes(event.id) ? 'Remove bookmark' : 'Bookmark event'}
                  </button>
                  <button type="button" className="sa-btn approve" onClick={() => onRaiseFinding(event)}>
                    Raise finding from event
                  </button>
                  <button type="button" className="sa-btn" onClick={() => onExport()}>
                    Export this entry
                  </button>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--sa-muted)', fontStyle: 'italic' }}>
                  * Logs are immutable. This view is read-only with role-based access. Business records are accessible in read-only mode only.
                </div>
              </div>
            )
          })()}
        </section>
      )}
    </>
  )
}
