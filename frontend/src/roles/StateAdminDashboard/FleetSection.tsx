import { ProgressCell, StatCards, StatusPill, type StatCard } from './shared'
import { fleetRows, type MachineStatus } from './stateAdminData'

const fleetStatusOptions: Array<'All' | MachineStatus> = ['All', 'Available', 'Rented', 'Maintenance', 'Inspection']

const fleetTones: Record<'All' | MachineStatus, StatCard['tone']> = {
  All: 'brand',
  Rented: 'blue',
  Available: 'green',
  Maintenance: 'red',
  Inspection: 'amber',
}

type FleetSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | MachineStatus
  onStatusChange: (value: 'All' | MachineStatus) => void
  city: string
  onCityChange: (value: string) => void
  zone: string
  onZoneChange: (value: string) => void
  rows: typeof fleetRows
  onReset: () => void
}

export default function FleetSection({ query, onQueryChange, status, onStatusChange, city, onCityChange, zone, onZoneChange, rows, onReset }: FleetSectionProps) {
  const cityOptions = [...new Set(fleetRows.map((machine) => machine.city))].sort()
  const zoneOptions = [...new Set(fleetRows.filter((m) => city === 'All' || m.city === city).map((m) => m.zoneName || m.zoneId).filter(Boolean))] as string[]
  const scopedFleet = fleetRows.filter((machine) => (city === 'All' || machine.city === city) && (zone === 'All' || (machine.zoneName === zone || machine.zoneId === zone)))
  const cards: StatCard[] = [
    ...fleetStatusOptions.map((option) => ({
      key: option,
      label: option === 'All' ? 'Total machines' : option,
      value: option === 'All' ? scopedFleet.length : scopedFleet.filter((machine) => machine.status === option).length,
      tone: fleetTones[option],
      sub: `of ${scopedFleet.length} total`,
    })),
  ]

  return (
    <>
      <StatCards cards={cards} activeKey={status} onSelect={(key) => onStatusChange(status === key ? 'All' : (key as 'All' | MachineStatus))} />

      <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Fleet</h3>
        <span className="sa-panel-sub">Machines registered with state partners</span>
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
          {fleetStatusOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All statuses' : option}
            </option>
          ))}
        </select>
        <select
          className="sa-select"
          aria-label="Filter by city"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
        >
          <option value="All">All cities</option>
          {cityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          className="sa-select"
          aria-label="Filter by zone"
          value={zone}
          onChange={(event) => onZoneChange(event.target.value)}
        >
          <option value="All">All zones</option>
          {zoneOptions.map((option) => (
            <option key={option} value={option}>
              {option}
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
            <th>City</th>
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
                <td>{machine.city}</td>
                <td>{machine.zoneName || machine.zoneId || '—'}</td>
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
    </>
  )
}
