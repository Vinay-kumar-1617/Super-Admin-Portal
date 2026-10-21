import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import { escalationTargets, type Escalation } from './operationsData'
import FilterBar, { filterBarStyles } from './FilterBar'
import { emptyDateRange, type DateRange } from './dateRange'

type EscalationsSectionProps = {
  rows: Escalation[]
  onAcknowledge: (id: string) => void
  onEscalate: (id: string, target: string, reason: string) => void
}

const ESCALATION_STATUSES = ['New', 'Acknowledged', 'Escalated'] as const
const ESCALATION_SEVERITIES = ['Critical', 'Warning', 'Info'] as const

export default function EscalationsSection({ rows, onAcknowledge, onEscalate }: EscalationsSectionProps) {
  const [escalatingId, setEscalatingId] = useState<string | null>(null)
  const [target, setTarget] = useState(escalationTargets[2])
  const [reason, setReason] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>(emptyDateRange)

  const cities = useMemo(() => Array.from(new Set(rows.map((row) => row.city))).sort(), [rows])

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (severityFilter !== 'all' && row.severity !== severityFilter) return false
      if (cityFilter !== 'all' && row.city !== cityFilter) return false
      if (dateRange.from && row.receivedOn < dateRange.from) return false
      if (dateRange.to && row.receivedOn > dateRange.to) return false
      if (!term) return true
      return [row.id, row.subject, row.detail, row.from, row.role, row.city]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [rows, search, statusFilter, severityFilter, cityFilter, dateRange])

  const closeForm = () => {
    setEscalatingId(null)
    setReason('')
    setTarget(escalationTargets[2])
  }

  const submitEscalation = () => {
    if (!escalatingId || reason.trim().length < 4) return
    onEscalate(escalatingId, target, reason.trim())
    closeForm()
  }

  const newCount = rows.filter((row) => row.status === 'New').length

  return (
    <section className="sa-panel">
      <style>{filterBarStyles}</style>
      <div className="sa-panel-header">
        <h3>Escalations</h3>
        <span className="sa-panel-sub">
          {newCount} new from dispatchers & zone managers · escalate up to a city admin or the state admin
        </span>
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search escalations"
        searchPlaceholder="Search subject, detail, raised by or city..."
        selects={[
          {
            id: 'status',
            label: 'Filter by escalation status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All statuses' },
              ...ESCALATION_STATUSES.map((status) => ({ value: status, label: status })),
            ],
          },
          {
            id: 'severity',
            label: 'Filter by severity',
            value: severityFilter,
            onChange: setSeverityFilter,
            options: [
              { value: 'all', label: 'All severities' },
              ...ESCALATION_SEVERITIES.map((severity) => ({ value: severity, label: severity })),
            ],
          },
          {
            id: 'city',
            label: 'Filter by city',
            value: cityFilter,
            onChange: setCityFilter,
            options: [
              { value: 'all', label: 'All cities' },
              ...cities.map((city) => ({ value: city, label: city })),
            ],
          },
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateLabel="Filter escalations by received date"
        resultLabel={`${visibleRows.length} of ${rows.length} escalations`}
      />
      <div className="sa-approval-list">
        {visibleRows.map((item) => (
          <article key={item.id} className="sa-approval-item">
            <div className="sa-approval-copy">
              <div className="sa-approval-tags">
                <span className="sa-approval-id">{item.id}</span>
                <StatusPill status={item.severity} />
                <StatusPill status={item.status} />
                {item.escalatedTo && <span className="sa-approval-id">→ {item.escalatedTo}</span>}
              </div>
              <strong>
                {item.subject} · {item.from} ({item.role}, {item.city})
              </strong>
              <p>{item.detail}</p>
              <span className="sa-approval-meta">Received {item.received}</span>
            </div>
            <div className="sa-approval-actions">
              {item.status !== 'Escalated' && (
                <button
                  type="button"
                  className="sa-btn-ghost"
                  disabled={item.status === 'Acknowledged'}
                  onClick={() => onAcknowledge(item.id)}
                >
                  {item.status === 'Acknowledged' ? 'Acknowledged' : 'Acknowledge'}
                </button>
              )}
              {item.status !== 'Escalated' && (
                <button
                  type="button"
                  className="sa-btn approve"
                  onClick={() => {
                    setEscalatingId(item.id)
                    setReason('')
                    setTarget(escalationTargets[2])
                  }}
                >
                  Escalate up
                </button>
              )}
            </div>
          </article>
        ))}
        {visibleRows.length === 0 && (
          <div className="sa-empty">
            <p>No escalations match the current filters.</p>
          </div>
        )}
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
              placeholder="What approval or policy decision is needed?"
            />
          </label>
          <div className="ops-field-actions">
            <button type="button" className="sa-btn approve" disabled={reason.trim().length < 4} onClick={submitEscalation}>
              Send escalation
            </button>
            <button type="button" className="sa-btn-ghost" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
