import { StatusPill } from './shared'
import { bookingRows, zoneProfile, type BookingStatus } from './zoneAdminData'

const filterOptions: Array<'All' | BookingStatus> = ['All', 'Confirmed', 'Active', 'Completed', 'Cancelled']

type BookingsSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  filter: 'All' | BookingStatus
  onFilterChange: (value: 'All' | BookingStatus) => void
  rows: typeof bookingRows
  onReset: () => void
}

export default function BookingsSection({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  rows,
  onReset,
}: BookingsSectionProps) {
  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Bookings</h3>
        <div className="sa-chip-row">
          {filterOptions.map((option) => (
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
          placeholder="Search booking id, customer or machine..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button type="button" className="sa-btn-ghost" onClick={onReset}>
          Reset
        </button>
        <span className="sa-toolbar-meta">
          {rows.length} of {bookingRows.length} bookings · {zoneProfile.name}
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
                <th>Locality</th>
                <th>Machine</th>
                <th>Window</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((booking) => (
                <tr key={booking.id}>
                  <td className="sa-cell-strong">{booking.id}</td>
                  <td>{booking.customer}</td>
                  <td>{booking.locality}</td>
                  <td>{booking.machine}</td>
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
  )
}
