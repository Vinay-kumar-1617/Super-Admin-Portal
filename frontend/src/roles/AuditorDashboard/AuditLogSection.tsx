import { useState } from 'react'
import { ResultPill } from './shared'
import {
  actionOptions,
  areaOptions,
  dateOptions,
  resultOptions,
  roleOptions,
  stateOptions,
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

  const saveFilter = () => {
    const name = filterName.trim()
    if (name.length < 3) return
    onSaveCurrentFilter(name)
    setFilterName('')
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Audit log</h3>
          <span className="sa-panel-sub">Every event across the platform · {total} events · results and before/after values preserved</span>
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search audit log"
            placeholder="Search id, person, action or target..."
            value={filters.query}
            onChange={(event) => onFilterChange({ query: event.target.value })}
          />
          <select className="sa-select" aria-label="Filter by area" value={filters.area} onChange={(event) => onFilterChange({ area: event.target.value as AuditFilters['area'] })}>
            {areaOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All areas' : option}</option>
            ))}
          </select>
          <select className="sa-select" aria-label="Filter by result" value={filters.result} onChange={(event) => onFilterChange({ result: event.target.value as AuditFilters['result'] })}>
            {resultOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All results' : option}</option>
            ))}
          </select>
          <select className="sa-select" aria-label="Filter by role" value={filters.role} onChange={(event) => onFilterChange({ role: event.target.value })}>
            {roleOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All roles' : option}</option>
            ))}
          </select>
          <select className="sa-select" aria-label="Filter by action" value={filters.action} onChange={(event) => onFilterChange({ action: event.target.value })}>
            {actionOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All actions' : option}</option>
            ))}
          </select>
          <select className="sa-select" aria-label="Filter by state" value={filters.state} onChange={(event) => onFilterChange({ state: event.target.value })}>
            {stateOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All states' : option}</option>
            ))}
          </select>
          <select className="sa-select" aria-label="Filter by date" value={filters.date} onChange={(event) => onFilterChange({ date: event.target.value })}>
            {dateOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All dates' : option}</option>
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
          <button type="button" className="sa-btn approve" onClick={onExport}>
            Export log
          </button>
          <span className="sa-toolbar-meta">
            {rows.length} of {total}
          </span>
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Filter by person"
            placeholder="Person contains..."
            value={filters.actor}
            onChange={(event) => onFilterChange({ actor: event.target.value })}
          />
          <input
            className="sa-input"
            aria-label="Filter by target"
            placeholder="Target contains..."
            value={filters.target}
            onChange={(event) => onFilterChange({ target: event.target.value })}
          />
          <input
            className="sa-input"
            aria-label="Filter by city"
            placeholder="City contains..."
            value={filters.city}
            onChange={(event) => onFilterChange({ city: event.target.value })}
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
                  <th>Time</th>
                  <th>Person</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Area</th>
                  <th>Location</th>
                  <th>Result</th>
                  <th>Flag</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((event) => (
                  <AuditRow
                    key={event.id}
                    event={event}
                    expanded={expandedId === event.id}
                    bookmarked={bookmarkedIds.includes(event.id)}
                    onToggleExpand={() => onToggleExpand(event.id)}
                    onToggleFlag={() => onToggleFlag(event.id)}
                    onToggleBookmark={() => onToggleBookmark(event.id)}
                    onRaiseFinding={() => onRaiseFinding(event)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function AuditRow({
  event,
  expanded,
  bookmarked,
  onToggleExpand,
  onToggleFlag,
  onToggleBookmark,
  onRaiseFinding,
}: {
  event: AuditEvent
  expanded: boolean
  bookmarked: boolean
  onToggleExpand: () => void
  onToggleFlag: () => void
  onToggleBookmark: () => void
  onRaiseFinding: () => void
}) {
  return (
    <>
      <tr className={expanded ? 'sa-row-selected' : ''}>
        <td>{event.time}</td>
        <td className="sa-cell-strong">
          {event.actor}
          <span className="sa-cell-sub">{event.role}</span>
        </td>
        <td>
          {event.action}
          {event.sensitive && <span className="aud-sensitive" title="Sensitive action">sensitive</span>}
        </td>
        <td>
          {event.target}
          {event.amount && <span className="sa-cell-sub">{event.amount}</span>}
        </td>
        <td>{event.area}</td>
        <td>
          {event.city === '—' ? event.state : `${event.city}, ${event.state}`}
        </td>
        <td>
          <ResultPill result={event.result} />
        </td>
        <td>
          <span className="aud-marks">
            <button type="button" className={`aud-flag ${event.flagged ? 'on' : ''}`} onClick={onToggleFlag} aria-pressed={event.flagged}>
              {event.flagged ? 'Flagged' : 'Flag'}
            </button>
            <button
              type="button"
              className={`aud-star ${bookmarked ? 'on' : ''}`}
              onClick={onToggleBookmark}
              aria-pressed={bookmarked}
              title="Bookmark for follow-up"
            >
              {bookmarked ? '★' : '☆'}
            </button>
          </span>
        </td>
        <td>
          <button type="button" className="sa-btn-ghost" onClick={onToggleExpand}>
            {expanded ? 'Close' : 'Open'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="sa-expand-row">
          <td colSpan={9}>
            <div className="cf-review">
              <div className="cf-review-copy">
                <strong>
                  {event.id} · {event.action} · {event.target}
                </strong>
                <p>
                  {event.actor} ({event.role}) · {event.time} · {event.area} · {event.state}
                  {event.amount ? ` · ${event.amount}` : ''}
                </p>
                {event.note && <p className="cf-review-reason">{event.note}</p>}
              </div>

              <div className="sa-table-wrap">
                <table className="sa-table aud-diff">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Before</th>
                      <th>After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.changes.map((change) => (
                      <tr key={change.field}>
                        <td className="sa-cell-strong">{change.field}</td>
                        <td>{change.before}</td>
                        <td>{change.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="cf-review-actions">
                <button type="button" className={`sa-btn ${event.flagged ? 'reject' : ''}`} onClick={onToggleFlag}>
                  {event.flagged ? 'Remove flag' : 'Flag for follow-up'}
                </button>
                <button type="button" className="sa-btn-ghost" onClick={onToggleBookmark}>
                  {bookmarked ? 'Remove bookmark' : 'Bookmark event'}
                </button>
                <button type="button" className="sa-btn approve" onClick={onRaiseFinding}>
                  Raise finding from event
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
