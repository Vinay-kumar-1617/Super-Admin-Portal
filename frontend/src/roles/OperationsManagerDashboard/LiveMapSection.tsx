import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import { cityMarkers, type Vehicle } from './operationsData'
import FilterBar, { filterBarStyles } from './FilterBar'
import { emptyDateRange, type DateRange } from './dateRange'

type LiveMapSectionProps = {
  vehicles: Vehicle[]
}

const VEHICLE_STATUSES = ['On Hire', 'Available', 'Maintenance', 'Inspection'] as const

export default function LiveMapSection({ vehicles: rows }: LiveMapSectionProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>(emptyDateRange)

  const visibleVehicles = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((vehicle) => {
      if (selectedCity && vehicle.city !== selectedCity) return false
      if (statusFilter !== 'all' && vehicle.status !== statusFilter) return false
      if (dateRange.from && vehicle.lastPingOn < dateRange.from) return false
      if (dateRange.to && vehicle.lastPingOn > dateRange.to) return false
      if (!term) return true
      return [vehicle.model, vehicle.regNo, vehicle.driver, vehicle.zone, vehicle.city]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [rows, selectedCity, statusFilter, dateRange, search])

  const demandTone = (demand: number) => (demand >= 50 ? 'red' : demand >= 10 ? 'amber' : 'blue')

  return (
    <div className="ops-map-layout">
      <section className="sa-panel">
        <style>{filterBarStyles}</style>
        <div className="sa-panel-header">
          <h3>Live map · Telangana</h3>
          <span className="sa-panel-sub">Vehicles & drivers by city · click a city to filter</span>
        </div>
        <div className="ops-map-canvas">
          {cityMarkers.map((marker) => (
            <button
              key={marker.city}
              type="button"
              className={`ops-city ${selectedCity === marker.city ? 'selected' : ''}`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={() => setSelectedCity(selectedCity === marker.city ? null : marker.city)}
              aria-label={`${marker.city}: ${marker.vehicles} vehicles, demand ${marker.demand}`}
            >
              <span className={`ops-city-dot ${demandTone(marker.demand)}`} />
              <span className="ops-city-label">{marker.city}</span>
              <span className="ops-city-meta">
                {marker.vehicles} vehicles · demand {marker.demand}
              </span>
            </button>
          ))}
          {rows.map((vehicle) => (
            <span
              key={vehicle.id}
              className={`ops-vehicle-dot ${vehicle.status === 'On Hire' ? 'blue' : vehicle.status === 'Available' ? 'green' : 'slate'}`}
              style={{ left: `${vehicle.map.x}%`, top: `${vehicle.map.y}%` }}
              title={`${vehicle.model} · ${vehicle.driver} · ${vehicle.city}`}
            />
          ))}
        </div>
        <div className="ops-legend">
          <span>
            <i className="blue" /> On hire / in transit
          </span>
          <span>
            <i className="green" /> Available
          </span>
          <span>
            <i className="slate" /> Idle / workshop
          </span>
          <span>
            <i className="amber" /> Demand ≥ 10 jobs
          </span>
          <span>
            <i className="red" /> Demand ≥ 50 jobs
          </span>
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>{selectedCity ?? 'All cities'}</h3>
          <button type="button" className="sa-view-link" onClick={() => setSelectedCity(null)}>
            {selectedCity ? 'Clear filter' : `${visibleVehicles.length} vehicles tracked`}
          </button>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchLabel="Search vehicles"
          searchPlaceholder="Search model, registration, driver or city..."
          selects={[
            {
              id: 'status',
              label: 'Filter vehicles by status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'All statuses' },
                ...VEHICLE_STATUSES.map((status) => ({ value: status, label: status })),
              ],
            },
          ]}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateLabel="Filter vehicles by last ping date"
          resultLabel={`${visibleVehicles.length} of ${rows.length} vehicles`}
        />
        <div className="sa-feed">
          {visibleVehicles.map((vehicle) => (
            <div key={vehicle.id} className="sa-feed-item">
              <strong>
                {vehicle.model} <em>{vehicle.driver}</em>
              </strong>
              <span className="sa-approval-tags">
                <StatusPill status={vehicle.status} />
                <span className="sa-approval-meta">
                  {vehicle.zone} · {vehicle.city} · {vehicle.ping}
                </span>
              </span>
            </div>
          ))}
          {visibleVehicles.length === 0 && (
            <div className="sa-empty">
              <p>No vehicles tracked in {selectedCity} right now.</p>
              <button type="button" className="sa-btn-ghost" onClick={() => setSelectedCity(null)}>
                Show all cities
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
