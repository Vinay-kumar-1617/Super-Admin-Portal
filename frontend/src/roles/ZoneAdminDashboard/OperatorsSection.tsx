import { StatusPill } from './shared'
import { operatorRows, zoneProfile, type OperatorRow, type OperatorStatus } from './zoneAdminData'

type OperatorsSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | OperatorStatus
  onStatusChange: (value: 'All' | OperatorStatus) => void
  rows: OperatorRow[]
  onReset: () => void
}

export default function OperatorsSection({
  query,
  onQueryChange,
  status,
  onStatusChange,
  rows,
  onReset,
}: OperatorsSectionProps) {
  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Operators</h3>
        <span className="sa-panel-sub">Badge-cleared crews in {zoneProfile.name}</span>
      </div>
      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search operators"
          placeholder="Search name, locality or licence..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          className="sa-select"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'All' | OperatorStatus)}
        >
          <option value="All">All statuses</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
        <button type="button" className="sa-btn-ghost" onClick={onReset}>
          Reset
        </button>
        <span className="sa-toolbar-meta">
          {rows.length} of {operatorRows.length} operators
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No operators match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>Locality</th>
                <th>Licence</th>
                <th>Rating</th>
                <th>Jobs done</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((operator) => (
                <tr key={operator.id}>
                  <td className="sa-cell-strong">
                    {operator.name}
                    <span className="sa-cell-sub">{operator.id}</span>
                  </td>
                  <td>{operator.locality}</td>
                  <td>{operator.licence}</td>
                  <td className="sa-num">{operator.rating.toFixed(1)}</td>
                  <td className="sa-num">{operator.jobs}</td>
                  <td>{operator.joined}</td>
                  <td>
                    <StatusPill status={operator.status} />
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
