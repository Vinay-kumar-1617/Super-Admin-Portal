import { GatedAction, StatusPill } from './shared'
import { useFocusRow } from './useRecordFocus'
import {
  inspectionRows as allInspections,
  inspectionSchedules,
  type InspectionRow,
  type InspectionStatus,
} from './complianceAdminData'
import type { ComplianceCheck } from './compliancePermissions'

const statusFilterOptions: Array<'All' | InspectionStatus> = [
  'All',
  'Scheduled',
  'Overdue',
  'Pass',
  'Fail',
  'Pass with conditions',
]

type InspectionsSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | InspectionStatus
  onStatusChange: (value: 'All' | InspectionStatus) => void
  rows: InspectionRow[]
  expandedId: string | null
  note: string
  onNoteChange: (value: string) => void
  onToggle: (id: string) => void
  onRecord: (id: string, result: 'Pass' | 'Fail' | 'Pass with conditions') => void
  onReset: () => void
  focusId?: string
  check: ComplianceCheck
}

export default function InspectionsSection({
  query,
  onQueryChange,
  status,
  onStatusChange,
  rows,
  expandedId,
  note,
  onNoteChange,
  onToggle,
  onRecord,
  onReset,
  focusId,
  check,
}: InspectionsSectionProps) {
  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Inspection schedules</h3>
          <span className="sa-panel-sub">Requirements configured for {inspectionSchedules.length} inspection types</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Frequency</th>
                <th>Scope</th>
                <th>Coverage</th>
                <th>Next window</th>
              </tr>
            </thead>
            <tbody>
              {inspectionSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="sa-cell-strong">{schedule.requirement}</td>
                  <td>{schedule.frequency}</td>
                  <td>{schedule.scope}</td>
                  <td>{schedule.coverage}</td>
                  <td>{schedule.nextWindow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Inspections</h3>
          <span className="sa-panel-sub">Record pass, fail or pass with conditions · failures get follow-up · history kept per vehicle</span>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search inspections"
            placeholder="Search vehicle, model or inspection..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <select
            className="sa-select"
            aria-label="Filter by inspection status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as 'All' | InspectionStatus)}
          >
            {statusFilterOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'All' ? 'All statuses' : option}
              </option>
            ))}
          </select>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset
          </button>
          <span className="sa-toolbar-meta">
            {rows.length} of {allInspections.length} inspections
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No inspections match the current filters.</p>
            <button type="button" className="sa-btn-ghost" onClick={onReset}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Inspection</th>
                  <th>Vehicle</th>
                  <th>Due</th>
                  <th>Assigned</th>
                  <th>Result</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const expanded = expandedId === row.id
                  const canRecord = row.status === 'Scheduled' || row.status === 'Overdue'
                  return (
                    <InspectionRowView
                      key={row.id}
                      row={row}
                      expanded={expanded}
                      focused={row.id === focusId}
                      canRecord={canRecord}
                      note={note}
                      onNoteChange={onNoteChange}
                      onToggle={() => onToggle(row.id)}
                      onRecord={onRecord}
                      check={check}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function InspectionRowView({
  row,
  expanded,
  focused,
  canRecord,
  note,
  onNoteChange,
  onToggle,
  onRecord,
  check,
}: {
  row: InspectionRow
  expanded: boolean
  focused: boolean
  canRecord: boolean
  note: string
  onNoteChange: (value: string) => void
  onToggle: () => void
  onRecord: (id: string, result: 'Pass' | 'Fail' | 'Pass with conditions') => void
  check: ComplianceCheck
}) {
  const noteRequired = note.trim().length < 4
  const focusedRowRef = useFocusRow(focused)

  return (
    <>
      <tr
        ref={focused ? focusedRowRef : undefined}
        className={expanded || focused ? 'sa-row-selected' : undefined}
      >
        <td className="sa-cell-strong">
          {row.id}
          <span className="sa-cell-sub">{row.kind}</span>
        </td>
        <td className="sa-cell-strong">
          {row.vehicle}
          <span className="sa-cell-sub">{row.model}</span>
        </td>
        <td>{row.dueOn}</td>
        <td>{row.assignedTo}</td>
        <td>
          <StatusPill status={row.status} />
        </td>
        <td>
          <button type="button" className="sa-btn-ghost" onClick={onToggle}>
            {expanded ? 'Close' : canRecord ? 'Record' : 'History'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="sa-expand-row">
          <td colSpan={6}>
            <div className="cf-review">
              <div className="cf-review-copy">
                <strong>
                  {row.id} · {row.kind} · {row.model}
                </strong>
                <p>
                  Due {row.dueOn} · assigned to {row.assignedTo}
                </p>
                {row.note && <p className="cf-review-note">Result note: {row.note}</p>}
                {row.followUp && <p className="cf-review-reason">Follow-up: {row.followUp}</p>}
                <ul className="cf-history">
                  {row.history.map((entry) => (
                    <li key={`${row.id}-${entry.date}-${entry.kind}`}>
                      {entry.date} · {entry.kind} · {entry.result}
                    </li>
                  ))}
                </ul>
              </div>

              {canRecord && (
                <div className="cf-review-actions cf-record">
                  <input
                    className="sa-input"
                    aria-label="Result note"
                    placeholder="Note required for fail or conditions..."
                    value={note}
                    onChange={(event) => onNoteChange(event.target.value)}
                  />
                  <GatedAction
                    check={check}
                    permission="inspection.record"
                    className="sa-btn approve"
                    onClick={() => onRecord(row.id, 'Pass')}
                  >
                    Pass
                  </GatedAction>
                  <GatedAction
                    check={check}
                    permission="inspection.record"
                    className="sa-btn reject"
                    onClick={() => onRecord(row.id, 'Fail')}
                    disabled={noteRequired}
                    title="A follow-up note is required for a failed inspection"
                  >
                    Fail + follow-up
                  </GatedAction>
                  <GatedAction
                    check={check}
                    permission="inspection.record"
                    className="sa-btn"
                    onClick={() => onRecord(row.id, 'Pass with conditions')}
                    disabled={noteRequired}
                    title="A note describing the conditions is required"
                  >
                    Pass with conditions
                  </GatedAction>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
