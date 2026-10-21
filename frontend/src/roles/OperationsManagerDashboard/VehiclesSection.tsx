import { StatusPill } from './shared'
import { vehicles as allVehicles, type Vehicle, type VehicleStatus } from './operationsData'
import DateRangePicker from './DateRangePicker'
import { type DateRange } from './dateRange'
import { filterBarStyles } from './FilterBar'

const statusOptions: Array<'All' | VehicleStatus> = ['All', 'On Hire', 'Available', 'Maintenance', 'Inspection']

type VehiclesSectionProps = {
  vehicles: Vehicle[]
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | VehicleStatus
  onStatusChange: (value: 'All' | VehicleStatus) => void
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onReset: () => void
}

export default function VehiclesSection({
  vehicles,
  query,
  onQueryChange,
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onReset,
}: VehiclesSectionProps) {
  return (
    <section className="sa-panel">
      <style>{filterBarStyles}</style>
      <div className="sa-panel-header">
        <h3>Vehicles & drivers</h3>
        <span className="sa-panel-sub">Read-only across Telangana · last location ping shown</span>
      </div>
      <div className="ops-filter-bar">
        <input
          className="ops-filter-search"
          aria-label="Search vehicles"
          placeholder="Search model, registration, driver or city..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          className="ops-filter-select"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'All' | VehicleStatus)}
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All statuses' : option}
            </option>
          ))}
        </select>
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} label="Filter vehicles by last ping date" />
        <button type="button" className="ops-filter-clear" onClick={onReset}>
          Reset
        </button>
        <span className="ops-filter-meta">
          {vehicles.length} of {allVehicles.length} vehicles · read only
        </span>
      </div>
      {vehicles.length === 0 ? (
        <div className="sa-empty">
          <p>No vehicles match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>City / zone</th>
                <th>Driver</th>
                <th>Last ping</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="sa-cell-strong">
                    {vehicle.model}
                    <span className="sa-cell-sub">{vehicle.regNo}</span>
                  </td>
                  <td>{vehicle.type}</td>
                  <td>
                    {vehicle.zone}
                    <span className="sa-cell-sub">{vehicle.city}</span>
                  </td>
                  <td>{vehicle.driver}</td>
                  <td>
                    {vehicle.ping}
                    <span className="sa-cell-sub">{vehicle.lastPingOn}</span>
                  </td>
                  <td>
                    <StatusPill status={vehicle.status} />
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
