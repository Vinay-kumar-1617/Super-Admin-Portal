import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import { shiftLog, shiftRoster, type HandoverNote } from './operationsData'
import FilterBar, { filterBarStyles } from './FilterBar'
import { emptyDateRange, type DateRange } from './dateRange'

type ShiftSectionProps = {
  notes: HandoverNote[]
  onAddNote: (text: string) => void
}

const SHIFT_LOG_TYPES = ['Incident', 'Action', 'Note'] as const

export default function ShiftSection({ notes, onAddNote }: ShiftSectionProps) {
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [logType, setLogType] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>(emptyDateRange)

  const submitNote = () => {
    const text = draft.trim()
    if (text.length < 4) return
    onAddNote(text)
    setDraft('')
  }

  const onDuty = shiftRoster.filter((member) => member.status !== 'Ending soon').length

  const visibleNotes = useMemo(() => {
    const term = search.trim().toLowerCase()
    return notes.filter((note) => {
      if (dateRange.from && note.date < dateRange.from) return false
      if (dateRange.to && note.date > dateRange.to) return false
      if (!term) return true
      return [note.author, note.text, note.id].join(' ').toLowerCase().includes(term)
    })
  }, [notes, search, dateRange])

  const visibleLog = useMemo(() => {
    const term = search.trim().toLowerCase()
    return shiftLog.filter((entry) => {
      if (logType !== 'all' && entry.type !== logType) return false
      if (dateRange.from && entry.date < dateRange.from) return false
      if (dateRange.to && entry.date > dateRange.to) return false
      if (!term) return true
      return [entry.text, entry.author, entry.id].join(' ').toLowerCase().includes(term)
    })
  }, [search, logType, dateRange])

  return (
    <>
      <section className="sa-panel">
        <style>{filterBarStyles}</style>
        <div className="sa-panel-header">
          <h3>On shift now</h3>
          <span className="sa-panel-sub">
            {onDuty} of {shiftRoster.length} dispatchers & support staff on duty
          </span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Covers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shiftRoster.map((member) => (
                <tr key={member.id}>
                  <td className="sa-cell-strong">
                    {member.name}
                    <span className="sa-cell-sub">{member.id}</span>
                  </td>
                  <td>{member.role}</td>
                  <td>{member.shift}</td>
                  <td>{member.area}</td>
                  <td>
                    <StatusPill status={member.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Handover notes</h3>
            <span className="sa-panel-sub">Carry context across shift changes</span>
          </div>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchLabel="Search handover notes and shift log"
            searchPlaceholder="Search notes, log entries or authors..."
            selects={[
              {
                id: 'logType',
                label: 'Filter shift log by type',
                value: logType,
                onChange: setLogType,
                options: [
                  { value: 'all', label: 'All log types' },
                  ...SHIFT_LOG_TYPES.map((type) => ({ value: type, label: type })),
                ],
              },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            dateLabel="Filter notes and log by date"
            resultLabel={`${visibleNotes.length} notes · ${visibleLog.length} log entries`}
          />
          <div className="sa-toolbar">
            <input
              className="sa-input"
              aria-label="New handover note"
              placeholder="Write a handover note for the next shift…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitNote()
              }}
            />
            <button type="button" className="sa-btn approve" disabled={draft.trim().length < 4} onClick={submitNote}>
              Add note
            </button>
          </div>
          <div className="sa-feed">
            {visibleNotes.map((note) => (
              <div key={note.id} className="sa-feed-item">
                <strong>
                  {note.author} <em>· {note.time} · {note.date}</em>
                </strong>
                <p>{note.text}</p>
              </div>
            ))}
            {visibleNotes.length === 0 && (
              <div className="sa-empty">
                <p>No handover notes match the current filters.</p>
              </div>
            )}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Shift log</h3>
            <span className="sa-panel-sub">Incidents and actions from this shift</span>
          </div>
          <div className="sa-feed">
            {visibleLog.map((entry) => (
              <div key={entry.id} className="sa-feed-item">
                <strong>
                  <StatusPill status={entry.type} /> {entry.text}
                </strong>
                <span>
                  {entry.author} · {entry.time} · {entry.date}
                </span>
              </div>
            ))}
            {visibleLog.length === 0 && (
              <div className="sa-empty">
                <p>No shift log entries match the current filters.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
