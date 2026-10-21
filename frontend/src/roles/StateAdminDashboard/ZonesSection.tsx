import { StatCards, StatusPill, type StatCard } from './shared'
import { zoneRows } from './stateAdminData'

type ZonesSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | 'Active' | 'Review'
  onStatusChange: (value: 'All' | 'Active' | 'Review') => void
  city: string
  onCityChange: (value: string) => void
  rows: typeof zoneRows
  onReset: () => void
}

const zoneStatusOptions: Array<'All' | 'Active' | 'Review'> = ['All', 'Active', 'Review']

const zoneTones: Record<'All' | 'Active' | 'Review', StatCard['tone']> = {
  All: 'brand',
  Active: 'green',
  Review: 'amber',
}

export default function ZonesSection({ query, onQueryChange, status, onStatusChange, city, onCityChange, rows, onReset }: ZonesSectionProps) {
  const cityOptions = [...new Set(zoneRows.map((zone) => zone.city))].sort()
  const scopedZones = zoneRows.filter((zone) => city === 'All' || zone.city === city)
  const totalOpenJobs = scopedZones.reduce((total, zone) => total + zone.openJobs, 0)
  const cards: StatCard[] = [
    ...zoneStatusOptions.map((option) => ({
      key: option,
      label: option === 'All' ? 'Total zones' : option,
      value: option === 'All' ? scopedZones.length : scopedZones.filter((zone) => zone.status === option).length,
      tone: zoneTones[option],
      sub: `of ${scopedZones.length} total`,
    })),
    {
      key: 'openJobs',
      label: 'Open jobs',
      value: totalOpenJobs.toLocaleString('en-IN'),
      tone: 'purple',
      sub: 'Across zones',
      static: true,
      compact: true,
    },
  ]

  return (
    <>
      <StatCards cards={cards} activeKey={status} onSelect={(key) => onStatusChange(status === key ? 'All' : (key as 'All' | 'Active' | 'Review'))} />

      <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Zones</h3>
        <span className="sa-panel-sub">Dispatch coverage across active cities</span>
      </div>
      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search zones"
          placeholder="Search zone or city..."
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
                <th>City</th>
                <th>Machines</th>
                <th>Operators</th>
                <th>Open jobs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((zone) => (
                <tr key={zone.id}>
                  <td className="sa-cell-strong">{zone.name}</td>
                  <td>{zone.city}</td>
                  <td className="sa-num">{zone.machines}</td>
                  <td className="sa-num">{zone.operators}</td>
                  <td className="sa-num">{zone.openJobs}</td>
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
    </>
  )
}
