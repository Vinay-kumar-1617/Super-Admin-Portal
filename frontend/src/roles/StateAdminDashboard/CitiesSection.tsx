import { ProgressCell, StatCards, StatusPill, type StatCard } from './shared'
import { cityRows, stateProfile } from './stateAdminData'

type CitiesSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | 'Active' | 'Inactive'
  onStatusChange: (value: 'All' | 'Active' | 'Inactive') => void
  rows: typeof cityRows
  onReset: () => void
}

const cityTones: Record<'All' | 'Active' | 'Inactive', StatCard['tone']> = {
  All: 'brand',
  Active: 'green',
  Inactive: 'slate',
}

export default function CitiesSection({ query, onQueryChange, status, onStatusChange, rows, onReset }: CitiesSectionProps) {
  const statuses: Array<'All' | 'Active' | 'Inactive'> = ['All', 'Active', 'Inactive']
  const totalBookings = cityRows.reduce((total, city) => total + city.bookings, 0)
  const cards: StatCard[] = [
    ...statuses.map((option) => ({
      key: option,
      label: option === 'All' ? 'Total cities' : option,
      value: option === 'All' ? cityRows.length : cityRows.filter((city) => city.status === option).length,
      tone: cityTones[option],
      sub: `of ${cityRows.length} total`,
    })),
    {
      key: 'bookings',
      label: 'Total bookings',
      value: totalBookings.toLocaleString('en-IN'),
      tone: 'purple',
      sub: 'Across cities',
      static: true,
      compact: true,
    },
  ]

  return (
    <>
      <StatCards cards={cards} activeKey={status} onSelect={(key) => onStatusChange(status === key ? 'All' : (key as 'All' | 'Active' | 'Inactive'))} />

      <section className="sa-panel">
        <div className="sa-panel-header">
        <h3>Cities</h3>
        <span className="sa-panel-sub">All districts operating in {stateProfile.name}</span>
      </div>
      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search cities"
          placeholder="Search city or code..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          className="sa-select"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'All' | 'Active' | 'Inactive')}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button type="button" className="sa-btn-ghost" onClick={onReset}>
          Reset
        </button>
        <span className="sa-toolbar-meta">
          {rows.length} of {cityRows.length} cities
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No cities match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Zones</th>
                <th>Machines</th>
                <th>Operators</th>
                <th>Bookings</th>
                <th>Utilization</th>
                <th>Revenue</th>
                <th>Trend</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((city) => (
                <tr key={city.id}>
                  <td className="sa-cell-strong">
                    {city.name}
                    <span className="sa-cell-sub">{city.code}</span>
                  </td>
                  <td className="sa-num">{city.zones}</td>
                  <td className="sa-num">{city.machines}</td>
                  <td className="sa-num">{city.operators}</td>
                  <td className="sa-num">{city.bookings}</td>
                  <td>
                    <ProgressCell value={city.utilization} />
                  </td>
                  <td className="sa-num">{city.revenue}</td>
                  <td className={city.trend.startsWith('+') ? 'sa-trend-up' : 'sa-trend-flat'}>{city.trend}</td>
                  <td>
                    <StatusPill status={city.status} />
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
