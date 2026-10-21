import { ProgressCell, StatusPill } from './shared'
import { localityRows, zoneProfile, type LocalityRow } from './zoneAdminData'

type LocalitiesSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | 'Active' | 'Review'
  onStatusChange: (value: 'All' | 'Active' | 'Review') => void
  rows: LocalityRow[]
  onReset: () => void
}

export default function LocalitiesSection({
  query,
  onQueryChange,
  status,
  onStatusChange,
  rows,
  onReset,
}: LocalitiesSectionProps) {
  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Localities</h3>
        <span className="sa-panel-sub">Dispatch coverage across {zoneProfile.name}</span>
      </div>
      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search localities"
          placeholder="Search locality..."
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
          {rows.length} of {localityRows.length} localities
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No localities match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Locality</th>
                <th>Machines</th>
                <th>Operators</th>
                <th>Open jobs</th>
                <th>Utilization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((locality) => (
                <tr key={locality.id}>
                  <td className="sa-cell-strong">{locality.name}</td>
                  <td className="sa-num">{locality.machines}</td>
                  <td className="sa-num">{locality.operators}</td>
                  <td className="sa-num">{locality.openJobs}</td>
                  <td>
                    <ProgressCell value={locality.utilization} />
                  </td>
                  <td>
                    <StatusPill status={locality.status} />
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
