import { ProgressCell, StatusPill } from './shared'
import { cityProfile, fleetRows, type MachineStatus } from './cityAdminData'

const statusOptions: Array<'All' | MachineStatus> = ['All', 'Available', 'Rented', 'Maintenance', 'Inspection']

type FleetSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | MachineStatus
  onStatusChange: (value: 'All' | MachineStatus) => void
  rows: typeof fleetRows
  onReset: () => void
}

export default function FleetSection({ query, onQueryChange, status, onStatusChange, rows, onReset }: FleetSectionProps) {
  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Fleet</h3>
        <span className="sa-panel-sub">Machines operating in {cityProfile.name}</span>
      </div>
      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search fleet"
          placeholder="Search model, registration or partner..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          className="sa-select"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'All' | MachineStatus)}
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All statuses' : option}
            </option>
          ))}
        </select>
        <button type="button" className="sa-btn-ghost" onClick={onReset}>
          Reset
        </button>
        <span className="sa-toolbar-meta">
          {rows.length} of {fleetRows.length} machines
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No machines match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Type</th>
                <th>Zone</th>
                <th>Partner</th>
                <th>Utilization</th>
                <th>Daily rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((machine) => (
                <tr key={machine.id}>
                  <td className="sa-cell-strong">
                    {machine.model}
                    <span className="sa-cell-sub">{machine.regNo}</span>
                  </td>
                  <td>{machine.type}</td>
                  <td>{machine.zone}</td>
                  <td>{machine.partner}</td>
                  <td>
                    <ProgressCell value={machine.utilization} />
                  </td>
                  <td className="sa-num">{machine.dailyRate}</td>
                  <td>
                    <StatusPill status={machine.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
