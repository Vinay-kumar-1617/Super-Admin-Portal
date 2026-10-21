import { StatCards, StatusPill, type StatCard } from './shared'
import { bookingRows, type BookingStatus } from './stateAdminData'

const bookingFilterOptions: Array<'All' | BookingStatus> = ['All', 'Confirmed', 'Active', 'Completed', 'Cancelled']

const bookingTones: Record<'All' | BookingStatus, StatCard['tone']> = {
  All: 'brand',
  Confirmed: 'purple',
  Active: 'blue',
  Completed: 'green',
  Cancelled: 'red',
}

type BookingsSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  filter: 'All' | BookingStatus
  onFilterChange: (value: 'All' | BookingStatus) => void
  city: string
  onCityChange: (value: string) => void
  zone: string
  onZoneChange: (value: string) => void
  rows: typeof bookingRows
  onReset: () => void
}

export default function BookingsSection({ query, onQueryChange, filter, onFilterChange, city, onCityChange, zone, onZoneChange, rows, onReset }: BookingsSectionProps) {
  const cityOptions = [...new Set(bookingRows.map((booking) => booking.city))].sort()
  const zoneOptions = [...new Set(bookingRows.filter((booking) => city === 'All' || booking.city === city).map((booking) => booking.zone))].sort()
  const scopedRows = (city === 'All' ? bookingRows : bookingRows.filter((booking) => booking.city === city)).filter(
    (booking) => zone === 'All' || booking.zone === zone,
  )
  const statuses: Array<'All' | BookingStatus> = ['All', 'Confirmed', 'Active', 'Completed', 'Cancelled']
  const cards: StatCard[] = [
    ...statuses.map((status) => ({
      key: status,
      label: status === 'All' ? 'Total bookings' : `${status} bookings`,
      value: status === 'All' ? scopedRows.length : scopedRows.filter((booking) => booking.status === status).length,
      tone: bookingTones[status],
      sub: `of ${scopedRows.length} total`,
    })),
    {
      key: 'value',
      label: 'Booking value',
      value: `₹${scopedRows.reduce((total, booking) => total + Number(booking.amount.replace(/[^0-9]/g, '')), 0).toLocaleString('en-IN')}`,
      tone: 'purple',
      sub: city === 'All' ? 'All cities' : city,
      static: true,
      compact: true,
    },
  ]

  return (
    <>
      <StatCards cards={cards} activeKey={filter} onSelect={(key) => onFilterChange(filter === key ? 'All' : (key as 'All' | BookingStatus))} />

      <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Bookings</h3>
        <div className="sa-chip-row">
          {bookingFilterOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`sa-chip ${filter === option ? 'active orange' : ''}`}
              onClick={() => onFilterChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search bookings"
          placeholder="Search booking id, customer, machine, operator or owner..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          className="sa-select"
          aria-label="Filter bookings by city"
          value={city}
          onChange={(event) => {
            onCityChange(event.target.value)
            onZoneChange('All')
          }}
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
          aria-label="Filter bookings by zone"
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
          {rows.length} of {bookingRows.length} bookings
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No bookings match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Customer</th>
                <th>City</th>
                <th>Zone</th>
                <th>Machine</th>
                <th>Operator</th>
                <th>Owner</th>
                <th>Window</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => (
                <tr key={booking.id}>
                  <td className="sa-cell-strong">{booking.id}</td>
                  <td className="sa-cell-strong">
                    {booking.customer}
                    <span className="sa-cell-sub">{booking.customerId}</span>
                  </td>
                  <td>{booking.city}</td>
                  <td>{booking.zone}</td>
                  <td>{booking.machine}</td>
                  <td className="sa-cell-strong">
                    {booking.operatorName}
                    <span className="sa-cell-sub">{booking.operatorId}</span>
                  </td>
                  <td className="sa-cell-strong">
                    {booking.ownerName}
                    <span className="sa-cell-sub">{booking.ownerId}</span>
                  </td>
                  <td>{booking.window}</td>
                  <td className="sa-num">{booking.amount}</td>
                  <td>
                    <StatusPill status={booking.status} />
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
