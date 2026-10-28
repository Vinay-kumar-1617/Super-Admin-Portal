import type { StateBooking, StateItem } from './statesData'
import type { CityItem } from './citiesData'
import type { ZoneItem } from './zonesData'

export type StateMetricView =
  | 'bookings'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'users'
  | 'districts'

type StateMetricPageProps = {
  state: StateItem
  view: StateMetricView
  cities: CityItem[]
  zones: ZoneItem[]
  onChangeView: (view: StateMetricView) => void
  onBack: () => void
  onExitState: () => void
  onViewBooking: (booking: StateBooking) => void
}

const viewMeta: Record<StateMetricView, { title: string; description: string }> = {
  bookings: { title: 'Bookings', description: 'Every booking recorded across this jurisdiction' },
  pending: { title: 'Pending Bookings', description: 'Bookings waiting for confirmation from the assigned provider' },
  confirmed: { title: 'Confirmed Bookings', description: 'Bookings confirmed and scheduled for fulfilment' },
  completed: { title: 'Completed Bookings', description: 'Bookings delivered and closed successfully' },
  cancelled: { title: 'Cancelled Bookings', description: 'Bookings cancelled before or during fulfilment' },
  users: { title: 'Users', description: 'User distribution across cities and operational roles' },
  districts: { title: 'Districts', description: 'District coverage and booking activity for this state' },
}

const statusForView = (view: StateMetricView): StateBooking['status'] | null => {
  if (view === 'pending') return 'Pending'
  if (view === 'confirmed') return 'Confirmed'
  if (view === 'completed') return 'Completed'
  if (view === 'cancelled') return 'Cancelled'
  return null
}

type StatTileProps = {
  value: number | string
  label: string
  tone?: 'primary' | 'amber' | 'blue' | 'green' | 'red'
  selected?: boolean
  onClick?: () => void
}

function StatTile({ value, label, tone, selected = false, onClick }: StatTileProps) {
  const className = `state-kpi-tile${tone ? ` ${tone}` : ''}${onClick ? ' interactive' : ''}${selected ? ' selected' : ''}`
  const content = (
    <>
      <span className="state-kpi-tile-value">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</span>
      <span className="state-kpi-tile-label">{label}</span>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} aria-pressed={selected}>
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}

export default function StateMetricPage({
  state,
  view,
  cities,
  zones,
  onChangeView,
  onBack,
  onExitState,
  onViewBooking,
}: StateMetricPageProps) {
  const meta = viewMeta[view]
  const bookings = state.bookings ?? []
  const summary = state.bookingSummary ?? {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  }
  const activeStatus = statusForView(view)
  const visibleBookings = activeStatus ? bookings.filter((booking) => booking.status === activeStatus) : bookings
  const citiesInState = cities.filter((city) => city.stateName === state.name)
  const zonesInState = zones.filter((zone) => zone.stateName === state.name)
  const breakdown = state.userBreakdown ?? { cityAdmins: 0, zoneAdmins: 0, fieldOfficers: 0, operators: 0 }
  const breakdownTotal = breakdown.cityAdmins + breakdown.zoneAdmins + breakdown.fieldOfficers + breakdown.operators
  const totalUsers = state.totalUsers || breakdownTotal
  const share = (count: number) => (totalUsers === 0 ? '0%' : `${Math.round((count / totalUsers) * 100)}%`)

  const districtNames = Array.from(
    new Set([
      ...(state.keyDistricts ?? []),
      ...bookings.map((booking) => booking.district).filter(Boolean),
    ]),
  ).sort((a, b) => a.localeCompare(b))

  const districtRows = districtNames.map((district) => {
    const districtBookings = bookings.filter((booking) => booking.district === district)
    return {
      district,
      bookings: districtBookings.length,
      pending: districtBookings.filter((booking) => booking.status === 'Pending').length,
      confirmed: districtBookings.filter((booking) => booking.status === 'Confirmed').length,
      completed: districtBookings.filter((booking) => booking.status === 'Completed').length,
      cancelled: districtBookings.filter((booking) => booking.status === 'Cancelled').length,
      zones: new Set(districtBookings.map((booking) => booking.zone)).size,
    }
  })

  const isBookingsView = view === 'bookings' || activeStatus !== null

  return (
    <section style={{ display: 'grid', gap: 16 }} aria-labelledby="state-metric-page-title">
      <header className="states-header">
        <div className="states-header-copy">
          <div className="states-breadcrumb">
            <button type="button" onClick={onExitState}>States</button>
            <span>›</span>
            <button type="button" onClick={onBack}>{state.name}</button>
            <span>›</span>
            <span>{meta.title}</span>
          </div>
          <h2 id="state-metric-page-title">{state.name} — {meta.title}</h2>
          <div className="states-header-meta">
            <span className="state-code-badge">{state.code}</span>
            <span className={`status-pill ${state.status.toLowerCase()}`}>
              <span className="status-dot" />
              {state.status}
            </span>
            <span className="states-meta-description">{meta.description}</span>
          </div>
        </div>
        <div className="states-header-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            ← Back to state overview
          </button>
        </div>
      </header>

      {isBookingsView && (
        <>
          <div className="view-section" style={{ background: '#fff' }}>
            <h4 className="view-section-title">
              <span>Booking summary</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>National booking register</span>
            </h4>
            <div className="state-bookings-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              <StatTile value={summary.total} label="Total bookings" tone="primary" selected={view === 'bookings'} onClick={() => onChangeView('bookings')} />
              <StatTile value={summary.pending} label="Pending" tone="amber" selected={view === 'pending'} onClick={() => onChangeView('pending')} />
              <StatTile value={summary.confirmed} label="Confirmed" tone="blue" selected={view === 'confirmed'} onClick={() => onChangeView('confirmed')} />
              <StatTile value={summary.completed} label="Completed" tone="green" selected={view === 'completed'} onClick={() => onChangeView('completed')} />
              <StatTile value={summary.cancelled} label="Cancelled" tone="red" selected={view === 'cancelled'} onClick={() => onChangeView('cancelled')} />
            </div>
          </div>

          <div className="view-section">
            <h4 className="view-section-title">
              <span>{meta.title}</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Showing {visibleBookings.length} of {summary.total.toLocaleString('en-IN')} recorded bookings
              </span>
            </h4>
            <div className="bookings-table-wrap">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Booking type</th>
                    <th>Zone</th>
                    <th>District</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.length > 0 ? (
                    visibleBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><span className="booking-id-tag">{booking.id}</span></td>
                        <td>
                          <div style={{ display: 'grid', gap: 2 }}>
                            <strong style={{ color: '#0f172a' }}>{booking.customer}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{booking.customerPhone}</span>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: 600 }}>{booking.bookingType}</span></td>
                        <td><span style={{ fontWeight: 600, color: '#334155' }}>{booking.zone}</span></td>
                        <td><span className="district-tag" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>📍 {booking.district}</span></td>
                        <td style={{ whiteSpace: 'nowrap', color: '#475569' }}>{booking.date}</td>
                        <td style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{booking.amount}</td>
                        <td>
                          <span className={`status-pill ${booking.status.toLowerCase()}`}>
                            <span className="status-dot" />
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="action-btn view icon-action"
                            onClick={() => onViewBooking(booking)}
                            aria-label={`View booking ${booking.id}`}
                            title="View booking details"
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                        <div style={{ display: 'grid', gap: 6, placeItems: 'center' }}>
                          <span>📋</span>
                          <strong>No {activeStatus ? activeStatus.toLowerCase() : ''} bookings found for {state.name}</strong>
                          <span style={{ fontSize: '0.76rem' }}>Choose another booking status to see its records.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'users' && (
        <>
          <div className="view-section" style={{ background: '#fff' }}>
            <h4 className="view-section-title">
              <span>User distribution</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{totalUsers.toLocaleString('en-IN')} users in {state.name}</span>
            </h4>
            <div className="state-bookings-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <StatTile value={totalUsers} label="Total users" tone="primary" />
              <StatTile value={breakdown.cityAdmins} label="City admins" tone="blue" />
              <StatTile value={breakdown.zoneAdmins} label="Zone admins" tone="blue" />
              <StatTile value={breakdown.fieldOfficers} label="Field officers" tone="amber" />
              <StatTile value={breakdown.operators} label="Operators" tone="green" />
            </div>
          </div>

          <div className="view-section">
            <h4 className="view-section-title">
              <span>Role distribution</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Share of state user base</span>
            </h4>
            <div className="bookings-table-wrap">
              <table className="bookings-table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Users</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>City admins</td><td>{breakdown.cityAdmins.toLocaleString('en-IN')}</td><td>{share(breakdown.cityAdmins)}</td></tr>
                  <tr><td>Zone admins</td><td>{breakdown.zoneAdmins.toLocaleString('en-IN')}</td><td>{share(breakdown.zoneAdmins)}</td></tr>
                  <tr><td>Field officers</td><td>{breakdown.fieldOfficers.toLocaleString('en-IN')}</td><td>{share(breakdown.fieldOfficers)}</td></tr>
                  <tr><td>Operators</td><td>{breakdown.operators.toLocaleString('en-IN')}</td><td>{share(breakdown.operators)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="view-section">
            <h4 className="view-section-title">
              <span>Users by city</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{citiesInState.length} cities · {zonesInState.length} zones</span>
            </h4>
            <div className="bookings-table-wrap">
              <table className="bookings-table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>City</th>
                    <th>Code</th>
                    <th>City admin</th>
                    <th>Zones</th>
                    <th>Users</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {citiesInState.length > 0 ? citiesInState.map((city) => (
                    <tr key={city.id}>
                      <td><strong>{city.name}</strong></td>
                      <td><span className="state-code-badge">{city.code}</span></td>
                      <td>{city.admin?.name ?? 'Not assigned'}</td>
                      <td>{city.totalZones}</td>
                      <td>{city.totalUsers.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status-pill ${city.status.toLowerCase()}`}>
                          <span className="status-dot" />
                          {city.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '28px 16px', color: '#64748b' }}>
                        No city records available for {state.name}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'districts' && (
        <>
          <div className="view-section" style={{ background: '#fff' }}>
            <h4 className="view-section-title">
              <span>District coverage</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{state.totalDistricts} districts monitored</span>
            </h4>
            <div className="state-bookings-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <StatTile value={state.totalDistricts} label="Total districts" tone="primary" />
              <StatTile value={districtRows.length} label="Districts listed" tone="blue" />
              <StatTile value={bookings.length} label="Bookings recorded" tone="green" />
              <StatTile value={zonesInState.filter((zone) => zone.status === 'Active').length} label="Active zones" tone="amber" />
            </div>
          </div>

          <div className="view-section">
            <h4 className="view-section-title">
              <span>Districts</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Booking activity by district</span>
            </h4>
            <div className="bookings-table-wrap">
              <table className="bookings-table" style={{ minWidth: 780 }}>
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Bookings</th>
                    <th>Pending</th>
                    <th>Confirmed</th>
                    <th>Completed</th>
                    <th>Cancelled</th>
                    <th>Zones</th>
                  </tr>
                </thead>
                <tbody>
                  {districtRows.length > 0 ? districtRows.map((row) => (
                    <tr key={row.district}>
                      <td><strong>{row.district}</strong></td>
                      <td>{row.bookings}</td>
                      <td>{row.pending}</td>
                      <td>{row.confirmed}</td>
                      <td>{row.completed}</td>
                      <td>{row.cancelled}</td>
                      <td>{row.zones}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '28px 16px', color: '#64748b' }}>
                        No district records available for {state.name}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
