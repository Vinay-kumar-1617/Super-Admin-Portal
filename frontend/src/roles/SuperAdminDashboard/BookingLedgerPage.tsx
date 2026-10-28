import { useState } from 'react'
import { completedRevenueBookings, revenueBookings, revenueByCity, type BookingStatusFilter } from './kpiData'

const ledgerMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const ledgerDateRank = (value: string) => {
  const [day, month, year] = value.split('-')
  const monthIndex = ledgerMonths.indexOf(month) + 1
  const fullYear = year && year.length === 2 ? Number(`20${year}`) : Number(year)
  return fullYear * 10000 + monthIndex * 100 + Number(day)
}

const ledgerDateToIso = (value: string) => {
  const [day, month, year] = value.split('-')
  const monthIndex = ledgerMonths.indexOf(month) + 1
  if (!day || !monthIndex) return ''
  const fullYear = year && year.length === 2 ? `20${year}` : year
  return `${fullYear}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

type BookingLedgerPageProps = {
  onBack: () => void
  initialFilter: BookingStatusFilter
  onFilterChange: (filter: BookingStatusFilter) => void
}

export default function BookingLedgerPage({ onBack, initialFilter, onFilterChange }: BookingLedgerPageProps) {
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>(initialFilter)
  const [stateFilter, setStateFilter] = useState('All')
  const [cityFilter, setCityFilter] = useState('All')
  const [zoneFilter, setZoneFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const totalGross = completedRevenueBookings.reduce((total, booking) => total + booking.bookingValue, 0)
  const totalCommission = completedRevenueBookings.reduce((total, booking) => total + booking.bookingValue * booking.commissionRate, 0)
  const totalNet = totalGross - totalCommission
  const cancelledBookings = revenueBookings.length - completedRevenueBookings.length
  const stateOptions = [...new Set(revenueBookings.map((booking) => booking.state))].sort()
  const cityOptions = [...new Set(revenueBookings
    .filter((booking) => stateFilter === 'All' || booking.state === stateFilter)
    .map((booking) => booking.city))].sort()
  const zoneOptions = [...new Set(revenueBookings
    .filter((booking) => stateFilter === 'All' || booking.state === stateFilter)
    .filter((booking) => cityFilter === 'All' || booking.city === cityFilter)
    .map((booking) => booking.zone))].sort()
  const dateOptions = [...new Set(revenueBookings.map((booking) => booking.date))].sort((a, b) => ledgerDateRank(a) - ledgerDateRank(b))
  const dateMin = dateOptions.length ? ledgerDateToIso(dateOptions[0]) : undefined
  const dateMax = dateOptions.length ? ledgerDateToIso(dateOptions[dateOptions.length - 1]) : undefined
  const filteredBookings = revenueBookings.filter((booking) => {
    const searchTerm = searchQuery.trim().toLowerCase()
    const matchesSearch = searchTerm === '' ||
      booking.id.toLowerCase().includes(searchTerm) ||
      booking.customerId.toLowerCase().includes(searchTerm) ||
      booking.ownerId.toLowerCase().includes(searchTerm) ||
      booking.operatorId.toLowerCase().includes(searchTerm)
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter
    const matchesState = stateFilter === 'All' || booking.state === stateFilter
    const matchesCity = cityFilter === 'All' || booking.city === cityFilter
    const matchesZone = zoneFilter === 'All' || booking.zone === zoneFilter
    const matchesDate = dateFilter === '' || ledgerDateToIso(booking.date) === dateFilter
    return matchesSearch && matchesStatus && matchesState && matchesCity && matchesZone && matchesDate
  })
  const hasActiveFilters = statusFilter !== 'All' || stateFilter !== 'All' || cityFilter !== 'All' || zoneFilter !== 'All' || dateFilter !== '' || searchQuery.trim() !== ''

  const selectStatusFilter = (filter: BookingStatusFilter) => {
    setStatusFilter(filter)
    onFilterChange(filter)
  }

  const selectState = (value: string) => {
    setStateFilter(value)
    setCityFilter('All')
    setZoneFilter('All')
  }

  const selectCity = (value: string) => {
    setCityFilter(value)
    setZoneFilter('All')
  }

  const clearFilters = () => {
    selectStatusFilter('All')
    setStateFilter('All')
    setCityFilter('All')
    setZoneFilter('All')
    setDateFilter('')
    setSearchQuery('')
  }

  return (
    <main className="booking-ledger-page">
      <style>{`
        .booking-ledger-page {
          display: grid;
          gap: 20px;
          min-width: 0;
          color: #182230;
        }

        .booking-ledger-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 24px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(15,23,42,0.05);
        }

        .booking-ledger-header h1 {
          margin: 4px 0 6px;
          font-size: 1.8rem;
        }

        .booking-ledger-header p {
          margin: 0;
          color: #64748b;
        }

        .booking-ledger-back {
          display: inline-flex;
          margin-bottom: 12px;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--brand-orange);
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .booking-ledger-back:focus-visible {
          outline: 3px solid rgba(255,107,44,0.45);
          outline-offset: 4px;
        }

        .booking-ledger-badge {
          flex: 0 0 auto;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(255,107,44,0.12);
          color: #c94310;
          font-size: 0.74rem;
          font-weight: 800;
        }

        .booking-ledger-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .booking-ledger-stat {
          display: grid;
          gap: 7px;
          padding: 17px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 14px;
          background: #fff;
        }

        button.booking-ledger-stat {
          width: 100%;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
        }

        button.booking-ledger-stat:hover {
          border-color: rgba(255,107,44,0.5);
          transform: translateY(-2px);
        }

        button.booking-ledger-stat.selected {
          border-color: rgba(255,107,44,0.6);
          background: rgba(255,107,44,0.07);
          box-shadow: inset 0 0 0 1px rgba(255,107,44,0.14);
        }

        button.booking-ledger-stat:focus-visible {
          outline: 3px solid rgba(255,107,44,0.45);
          outline-offset: 3px;
        }

        .booking-ledger-stat span {
          color: #8a96a6;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .booking-ledger-stat strong {
          font-size: 1.35rem;
        }

        .booking-ledger-stat small {
          color: #8a96a6;
        }

        .booking-ledger-panel {
          min-width: 0;
          overflow: hidden;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(15,23,42,0.05);
        }

        .booking-ledger-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(15,23,42,0.07);
        }

        .booking-ledger-panel-header h2 {
          margin: 0 0 5px;
          font-size: 1rem;
        }

        .booking-ledger-panel-header p {
          margin: 0;
          color: #8a96a6;
          font-size: 0.78rem;
        }

        .booking-ledger-scroll {
          overflow-x: auto;
          padding: 0 18px 18px;
        }

        .booking-ledger-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.82rem;
        }

        .booking-ledger-table th,
        .booking-ledger-table td {
          padding: 12px 10px;
          border-bottom: 1px solid rgba(15,23,42,0.07);
          white-space: nowrap;
        }

        .booking-ledger-table th {
          color: #64748b;
          font-size: 0.68rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .booking-ledger-table tfoot td {
          border-top: 2px solid rgba(15,23,42,0.1);
          border-bottom: 0;
          background: #f8fafb;
        }

        .booking-ledger-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(8,166,108,0.1);
          color: #078653;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .booking-ledger-status.cancelled {
          background: rgba(239,68,68,0.1);
          color: #dc2626;
        }

        .booking-ledger-entity {
          display: grid;
          gap: 2px;
        }

        .booking-ledger-entity small {
          color: #8a96a6;
        }

        .booking-ledger-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 14px;
          padding: 16px 20px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(15,23,42,0.05);
        }

        .booking-ledger-filter {
          display: grid;
          gap: 6px;
        }

        .booking-ledger-filter span {
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .booking-ledger-filter select,
        .booking-ledger-filter input {
          min-width: 170px;
          padding: 9px 12px;
          border: 1px solid rgba(15,23,42,0.14);
          border-radius: 10px;
          background: #fff;
          color: inherit;
          font: inherit;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .booking-ledger-filter input.booking-ledger-search {
          min-width: 260px;
          cursor: text;
        }

        .booking-ledger-filter select:focus-visible,
        .booking-ledger-filter input:focus-visible {
          outline: 3px solid rgba(255,107,44,0.45);
          outline-offset: 2px;
        }

        .booking-ledger-clear {
          margin-left: auto;
          padding: 10px 14px;
          border: 1px solid rgba(255,107,44,0.5);
          border-radius: 10px;
          background: rgba(255,107,44,0.08);
          color: #c94310;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .booking-ledger-clear:focus-visible {
          outline: 3px solid rgba(255,107,44,0.45);
          outline-offset: 2px;
        }

        .booking-ledger-note {
          margin: 0;
          padding: 0 20px 18px;
          color: #64748b;
          font-size: 0.78rem;
          line-height: 1.5;
        }
      `}</style>

      <header className="booking-ledger-header">
        <div>
          <button type="button" className="booking-ledger-back" onClick={onBack}>← Back to Total Revenue</button>
          <p>Super Admin / Finance / October</p>
          <h1>Booking Ledger</h1>
          <p>Booking-level revenue and commission · 01–04 Oct 2026</p>
        </div>
      </header>

      <section className="booking-ledger-summary" aria-label="Booking totals">
        <button
          type="button"
          className={`booking-ledger-stat ${statusFilter === 'All' ? 'selected' : ''}`}
          aria-pressed={statusFilter === 'All'}
          onClick={() => selectStatusFilter('All')}
        >
          <span>All booking records</span>
          <strong>{revenueBookings.length}</strong>
          <small>{completedRevenueBookings.length} completed · {cancelledBookings} cancelled</small>
        </button>
        <button
          type="button"
          className={`booking-ledger-stat ${statusFilter === 'Completed' ? 'selected' : ''}`}
          aria-pressed={statusFilter === 'Completed'}
          onClick={() => selectStatusFilter('Completed')}
        >
          <span>Completed</span>
          <strong>{completedRevenueBookings.length}</strong>
          <small>Included in revenue totals</small>
        </button>
        <button
          type="button"
          className={`booking-ledger-stat ${statusFilter === 'Cancelled' ? 'selected' : ''}`}
          aria-pressed={statusFilter === 'Cancelled'}
          onClick={() => selectStatusFilter('Cancelled')}
        >
          <span>Cancelled</span>
          <strong>{cancelledBookings}</strong>
          <small>Excluded from revenue totals</small>
        </button>
        <article className="booking-ledger-stat">
          <span>Gross revenue</span>
          <strong>₹{totalGross.toLocaleString('en-IN')}</strong>
          <small>Completed bookings only</small>
        </article>
        <article className="booking-ledger-stat">
          <span>Commission</span>
          <strong>₹{totalCommission.toLocaleString('en-IN')}</strong>
          <small>15% of completed booking value</small>
        </article>
        <article className="booking-ledger-stat">
          <span>Net revenue</span>
          <strong>₹{totalNet.toLocaleString('en-IN')}</strong>
          <small>Gross less commission</small>
        </article>
      </section>

      <section className="booking-ledger-filters" aria-label="Ledger filters">
        <label className="booking-ledger-filter">
          <span>Search</span>
          <input
            type="text"
            className="booking-ledger-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Booking, customer, owner or operator ID"
            aria-label="Search bookings by ID"
          />
        </label>
        <label className="booking-ledger-filter">
          <span>State</span>
          <select value={stateFilter} onChange={(event) => selectState(event.target.value)} aria-label="Filter by state">
            <option value="All">All states</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </label>
        <label className="booking-ledger-filter">
          <span>City</span>
          <select value={cityFilter} onChange={(event) => selectCity(event.target.value)} aria-label="Filter by city">
            <option value="All">All cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </label>
        <label className="booking-ledger-filter">
          <span>Zone</span>
          <select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)} aria-label="Filter by zone">
            <option value="All">All zones</option>
            {zoneOptions.map((zone) => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </label>
        <label className="booking-ledger-filter">
          <span>Date</span>
          <input
            type="date"
            className="booking-ledger-date"
            value={dateFilter}
            min={dateMin}
            max={dateMax}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Filter by date"
          />
        </label>
        {hasActiveFilters && (
          <button type="button" className="booking-ledger-clear" onClick={clearFilters}>Clear filters</button>
        )}
      </section>

      <section className="booking-ledger-panel" aria-labelledby="booking-ledger-title">
        <div className="booking-ledger-panel-header">
          <div>
            <h2 id="booking-ledger-title">Booking ledger</h2>
            <p>Showing {filteredBookings.length} of {revenueBookings.length} booking records · cancelled bookings are excluded from city totals.</p>
          </div>
        </div>
        <div className="booking-ledger-scroll">
          <table className="booking-ledger-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Owner</th>
                <th>Operator</th>
                <th>State</th>
                <th>City</th>
                <th>Zone</th>
                <th>Booking value</th>
                <th>Commission rate</th>
                <th>Commission</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td><strong>{booking.id}</strong></td>
                  <td>{booking.date}</td>
                  <td>
                    <span className="booking-ledger-entity">
                      <span>{booking.customerName}</span>
                      <small>{booking.customerId}</small>
                    </span>
                  </td>
                  <td>
                    <span className="booking-ledger-entity">
                      <span>{booking.ownerName}</span>
                      <small>{booking.ownerId}</small>
                    </span>
                  </td>
                  <td>
                    <span className="booking-ledger-entity">
                      <span>{booking.operatorName}</span>
                      <small>{booking.operatorId}</small>
                    </span>
                  </td>
                  <td>{booking.state}</td>
                  <td>{booking.city}</td>
                  <td>{booking.zone}</td>
                  <td>₹{booking.bookingValue.toLocaleString('en-IN')}</td>
                  <td>{(booking.commissionRate * 100).toFixed(0)}%</td>
                  <td>₹{(booking.bookingValue * booking.commissionRate).toLocaleString('en-IN')}</td>
                  <td><span className={`booking-ledger-status ${booking.status === 'Cancelled' ? 'cancelled' : ''}`}>{booking.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="booking-ledger-panel" aria-labelledby="booking-city-comparison-title">
        <div className="booking-ledger-panel-header">
          <div>
            <h2 id="booking-city-comparison-title">City comparison</h2>
            <p>Completed bookings only · revenue share is based on gross revenue.</p>
          </div>
        </div>
        <div className="booking-ledger-scroll">
          <table className="booking-ledger-table">
            <thead>
              <tr>
                <th>State</th>
                <th>City</th>
                <th>Bookings</th>
                <th>Gross revenue</th>
                <th>Commission</th>
                <th>Net revenue</th>
                <th>Revenue share</th>
              </tr>
            </thead>
            <tbody>
              {revenueByCity.map((row) => (
                <tr key={`${row.state}-${row.city}`}>
                  <td>{row.state}</td>
                  <td><strong>{row.city}</strong></td>
                  <td>{row.bookings.toLocaleString('en-IN')}</td>
                  <td>₹{row.grossRevenue.toLocaleString('en-IN')}</td>
                  <td>₹{row.commission.toLocaleString('en-IN')}</td>
                  <td>₹{(row.grossRevenue - row.commission).toLocaleString('en-IN')}</td>
                  <td>{((row.grossRevenue / totalGross) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}><strong>Total</strong></td>
                <td><strong>{completedRevenueBookings.length}</strong></td>
                <td><strong>₹{totalGross.toLocaleString('en-IN')}</strong></td>
                <td><strong>₹{totalCommission.toLocaleString('en-IN')}</strong></td>
                <td><strong>₹{totalNet.toLocaleString('en-IN')}</strong></td>
                <td><strong>100%</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      <p className="booking-ledger-note">The supplied booking rows total ₹37,000 in completed gross revenue, not ₹39,000. The cancelled ₹3,000 booking is excluded; commission is ₹5,550 and net revenue is ₹31,450.</p>
    </main>
  )
}
