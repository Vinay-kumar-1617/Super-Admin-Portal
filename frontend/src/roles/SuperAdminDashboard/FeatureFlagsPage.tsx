import { useState, type Dispatch, type SetStateAction } from 'react'
import { statesPageStyles } from './pageStyles'
import { flagScopeOptions, formatFlagDate, type FeatureFlag } from './featureFlagsData'

type FeatureFlagsPageProps = {
  flags: FeatureFlag[]
  setFlags: Dispatch<SetStateAction<FeatureFlag[]>>
  onBack: () => void
}

type FlagDraft = {
  enabled: boolean
  scope: string
  effectiveDate: string
}

const todayIso = new Date().toISOString().slice(0, 10)

const featureFlagsPageStyles = `
  .ff-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .ff-toolbar .states-search-box {
    flex: 1;
    min-width: 240px;
    max-width: 440px;
  }

  .ff-save-all:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .ff-status-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ff-switch {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 26px;
    flex-shrink: 0;
  }

  .ff-switch input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  .ff-switch-track {
    position: absolute;
    inset: 0;
    background: #cbd5e1;
    border-radius: 999px;
    transition: background 0.2s ease;
    pointer-events: none;
  }

  .ff-switch-track::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(15,23,42,0.3);
    transition: transform 0.2s ease;
  }

  .ff-switch input:checked + .ff-switch-track {
    background: #08a66c;
  }

  .ff-switch input:checked + .ff-switch-track::after {
    transform: translateX(20px);
  }

  .ff-switch input:focus-visible + .ff-switch-track {
    outline: 3px solid rgba(255,107,44,0.45);
    outline-offset: 2px;
  }

  .ff-status-text {
    font-size: 0.74rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    min-width: 30px;
  }

  .ff-status-text.on {
    color: #078653;
  }

  .ff-status-text.off {
    color: #64748b;
  }

  .ff-scope-select {
    min-width: 150px;
    min-height: 36px;
    padding: 7px 10px;
    font-size: 0.8rem;
  }

  .ff-date-input {
    border: 1px solid rgba(15,23,42,0.14);
    border-radius: 10px;
    background: #f8fafc;
    color: #182230;
    font: inherit;
    font-size: 0.8rem;
    padding: 7px 10px;
    min-height: 36px;
    width: 160px;
  }

  .ff-date-input:focus {
    outline: none;
    border-color: #ff6b2c;
    background: #fff;
  }

  .ff-date-label {
    margin-top: 4px;
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 700;
  }

  .ff-save-btn {
    border: 0;
    border-radius: 9px;
    padding: 8px 15px;
    font-family: inherit;
    font-size: 0.76rem;
    font-weight: 800;
    cursor: pointer;
    background: linear-gradient(135deg, #ff6b2c, #ef4a12);
    color: #fff;
    box-shadow: 0 6px 14px rgba(239,74,18,0.22);
    transition: transform 0.15s ease, opacity 0.15s ease;
    white-space: nowrap;
  }

  .ff-save-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .ff-save-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }

  .ff-flag-desc {
    display: block;
    font-size: 0.72rem;
    color: #64748b;
    line-height: 1.4;
    max-width: 360px;
  }

  .ff-flag-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ff-flag-name strong {
    font-size: 0.92rem;
    color: #0f172a;
  }
`

export default function FeatureFlagsPage({ flags, setFlags, onBack }: FeatureFlagsPageProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'on' | 'off'>('all')
  const [drafts, setDrafts] = useState<Record<string, FlagDraft>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const notify = (message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(null), 4000)
  }

  const draftFor = (flag: FeatureFlag): FlagDraft =>
    drafts[flag.id] ?? { enabled: flag.enabled, scope: flag.scope, effectiveDate: flag.effectiveDate }

  const isDirty = (flag: FeatureFlag) => {
    const draft = drafts[flag.id]
    if (!draft) return false
    return draft.enabled !== flag.enabled || draft.scope !== flag.scope || draft.effectiveDate !== flag.effectiveDate
  }

  const updateDraft = (flag: FeatureFlag, patch: Partial<FlagDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [flag.id]: {
        ...(prev[flag.id] ?? { enabled: flag.enabled, scope: flag.scope, effectiveDate: flag.effectiveDate }),
        ...patch,
      },
    }))
  }

  const saveFlag = (flag: FeatureFlag) => {
    const draft = drafts[flag.id]
    if (!draft) return
    setFlags((prev) => prev.map((item) => (item.id === flag.id ? { ...item, ...draft } : item)))
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[flag.id]
      return next
    })
    notify(
      `${flag.name} saved — ${draft.enabled ? 'ON' : 'OFF'} · ${draft.scope} · effective ${formatFlagDate(draft.effectiveDate)}`,
    )
  }

  const dirtyFlags = flags.filter(isDirty)

  const saveAllFlags = () => {
    if (dirtyFlags.length === 0) return
    setFlags((prev) => prev.map((item) => (drafts[item.id] ? { ...item, ...drafts[item.id] } : item)))
    setDrafts({})
    notify(`${dirtyFlags.length} flag${dirtyFlags.length === 1 ? '' : 's'} saved successfully`)
  }

  const enabledCount = flags.filter((flag) => draftFor(flag).enabled).length
  const scheduledCount = flags.filter((flag) => draftFor(flag).effectiveDate > todayIso).length

  const normalizedQuery = query.trim().toLowerCase()
  const filteredFlags = flags.filter((flag) => {
    const draft = draftFor(flag)
    const matchesQuery =
      normalizedQuery.length === 0 ||
      flag.name.toLowerCase().includes(normalizedQuery) ||
      flag.description.toLowerCase().includes(normalizedQuery)
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'on' ? draft.enabled : !draft.enabled)
    return matchesQuery && matchesStatus
  })

  const stats = [
    { label: 'Total flags', value: String(flags.length), badge: 'Catalogue', tone: 'slate' as const },
    { label: 'Enabled now', value: String(enabledCount), badge: 'ON', tone: 'green' as const },
    { label: 'Disabled', value: String(flags.length - enabledCount), badge: 'OFF', tone: 'orange' as const },
    { label: 'Scheduled', value: String(scheduledCount), badge: 'Future', tone: 'blue' as const },
  ]

  return (
    <div className="states-page">
      <style>{statesPageStyles}</style>
      <style>{featureFlagsPageStyles}</style>

      <header className="states-header">
        <div className="states-header-copy">
          <div className="states-breadcrumb">
            <button type="button" onClick={onBack}>Dashboard</button>
            <span>/</span>
            <span>Platform</span>
            <span>/</span>
            <strong>Feature Flags</strong>
          </div>
          <h2>Global Feature Flags</h2>
          <p>
            Turn platform capabilities on or off across the Heavy Machinery Rental App. Each flag carries its own
            scope and effective date, and changes only reach production when you save them.
          </p>
        </div>
        <div className="states-header-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            ← Back to Overview
          </button>
          <button
            type="button"
            className="btn-primary ff-save-all"
            disabled={dirtyFlags.length === 0}
            onClick={saveAllFlags}
          >
            Save changes{dirtyFlags.length > 0 ? ` (${dirtyFlags.length})` : ''}
          </button>
        </div>
      </header>

      <section className="states-stats-grid" aria-label="Feature flag summary statistics">
        {stats.map((stat) => (
          <div className="states-stat-card" key={stat.label}>
            <div className="states-stat-info">
              <span className="states-stat-label">{stat.label}</span>
              <span className="states-stat-value">{stat.value}</span>
            </div>
            <span className={`states-stat-badge ${stat.tone}`}>{stat.badge}</span>
          </div>
        ))}
      </section>

      <div className="ff-toolbar">
        <div className="states-search-box">
          <input
            aria-label="Search feature flags"
            placeholder="Search by name or description..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="bookings-filter-select"
          aria-label="Filter flags by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | 'on' | 'off')}
        >
          <option value="all">All statuses</option>
          <option value="on">ON only</option>
          <option value="off">OFF only</option>
        </select>
        {dirtyFlags.length > 0 && (
          <span className="status-pill pending">{dirtyFlags.length} unsaved</span>
        )}
      </div>

      {filteredFlags.length === 0 ? (
        <div className="states-table-card">
          <div className="empty-states-panel">
            <h4>No flags match your filters</h4>
            <p>Adjust the search text or status filter to see feature flags again.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setQuery('')
                setStatusFilter('all')
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <section className="states-table-card" aria-label="Global feature flags list">
          <div className="states-table-wrap">
            <table className="states-table">
              <thead>
                <tr>
                  <th>Flag</th>
                  <th>Status</th>
                  <th>Scope</th>
                  <th>Effective date</th>
                  <th>Changes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlags.map((flag) => {
                  const draft = draftFor(flag)
                  const dirty = isDirty(flag)
                  return (
                    <tr key={flag.id}>
                      <td>
                        <div className="ff-flag-name">
                          <strong>{flag.name}</strong>
                        </div>
                        <span className="ff-flag-desc">{flag.description}</span>
                      </td>
                      <td>
                        <div className="ff-status-cell">
                          <label className="ff-switch">
                            <input
                              type="checkbox"
                              checked={draft.enabled}
                              aria-label={`${flag.name} ${draft.enabled ? 'ON' : 'OFF'}`}
                              onChange={(event) => updateDraft(flag, { enabled: event.target.checked })}
                            />
                            <span className="ff-switch-track" />
                          </label>
                          <span className={`ff-status-text ${draft.enabled ? 'on' : 'off'}`}>
                            {draft.enabled ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <select
                          className="bookings-filter-select ff-scope-select"
                          aria-label={`Scope for ${flag.name}`}
                          value={draft.scope}
                          onChange={(event) => updateDraft(flag, { scope: event.target.value })}
                        >
                          {flagScopeOptions.map((scope) => (
                            <option key={scope} value={scope}>
                              {scope}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="date"
                          className="ff-date-input"
                          aria-label={`Effective date for ${flag.name}`}
                          value={draft.effectiveDate}
                          onChange={(event) => updateDraft(flag, { effectiveDate: event.target.value })}
                        />
                        <div className="ff-date-label">{formatFlagDate(draft.effectiveDate)}</div>
                      </td>
                      <td>
                        <span className={`status-pill ${dirty ? 'pending' : 'active'}`}>
                          {dirty ? 'Unsaved' : 'Saved'}
                        </span>
                      </td>
                      <td className="table-actions-cell">
                        <button
                          type="button"
                          className="ff-save-btn"
                          disabled={!dirty}
                          onClick={() => saveFlag(flag)}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {toastMessage && (
        <div className="states-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
