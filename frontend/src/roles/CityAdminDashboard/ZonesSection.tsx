import { ProgressCell, StatusPill } from './shared'
import { cityProfile, zoneRows, type ZoneRow } from './cityAdminData'

type ZonesSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | 'Active' | 'Review'
  onStatusChange: (value: 'All' | 'Active' | 'Review') => void
  rows: ZoneRow[]
  onReset: () => void
}

export default function ZonesSection({ query, onQueryChange, status, onStatusChange, rows, onReset }: ZonesSectionProps) {
  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Zones</h3>
        <span className="sa-panel-sub">Dispatch coverage inside {cityProfile.name}</span>
      </div>
      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search zones"
          placeholder="Search zone or area..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          className="sa-select"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'All' | 'Active' | 'Review')}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Review">Review</option>
        </select>
        <button type="button" className="sa-btn-ghost" onClick={onReset}>
          Reset
        </button>
        <span className="sa-toolbar-meta">
          {rows.length} of {zoneRows.length} zones
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No zones match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Machines</th>
                <th>Operators</th>
                <th>Open jobs</th>
                <th>Utilization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((zone) => (
                <tr key={zone.id}>
                  <td className="sa-cell-strong">
                    {zone.name}
                    <span className="sa-cell-sub">{zone.area}</span>
                  </td>
                  <td className="sa-num">{zone.machines}</td>
                  <td className="sa-num">{zone.operators}</td>
                  <td className="sa-num">{zone.openJobs}</td>
                  <td>
                    <ProgressCell value={zone.utilization} />
                  </td>
                  <td>
                    <StatusPill status={zone.status} />
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
