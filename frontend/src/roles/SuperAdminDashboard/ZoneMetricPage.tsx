import type { StateBooking } from './statesData'
import type { ZoneItem } from './zonesData'

export type ZoneMetricView =
  | 'bookings'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'users'
  | 'districts'
  | 'city'

type ZoneMetricPageProps = {
  zone: ZoneItem
  view: ZoneMetricView
  onChangeView: (view: ZoneMetricView) => void
  onBack: () => void
  onExitZone: () => void
  onViewBooking: (booking: StateBooking) => void
}

const viewMeta: Record<ZoneMetricView, { title: string; description: string }> = {
  bookings: { title: 'Bookings', description: 'Every booking recorded across this zone jurisdiction' },
  pending: { title: 'Pending Bookings', description: 'Bookings waiting for confirmation from the assigned provider' },
  confirmed: { title: 'Confirmed Bookings', description: 'Bookings confirmed and scheduled for fulfilment' },
  completed: { title: 'Completed Bookings', description: 'Bookings delivered and closed successfully' },
  cancelled: { title: 'Cancelled Bookings', description: 'Bookings cancelled before or during fulfilment' },
  users: { title: 'Users & Staff', description: 'Operational user and field officer distribution for this zone' },
  districts: { title: 'Districts', description: 'District coverage and booking activity for this zone' },
  city: { title: 'City Jurisdiction', description: 'Parent city and municipal links for this zone' },
}

const statusForView = (view: ZoneMetricView): StateBooking['status'] | null => {
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

export default function ZoneMetricPage({
  zone,
  view,
  onChangeView,
  onBack,
  onExitZone,
  onViewBooking,
}: ZoneMetricPageProps) {
  const meta = viewMeta[view]
  const bookings = zone.bookings ?? []
  const summary = zone.bookingSummary ?? {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  }
  const activeStatus = statusForView(view)
  const visibleBookings = activeStatus ? bookings.filter((booking) => booking.status === activeStatus) : bookings
  const totalUsers = zone.totalUsers || 0

  const districtNames = Array.from(
    new Set([
      ...(zone.keyDistricts ?? []),
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
    }
  })

  const isBookingsView = view === 'bookings' || activeStatus !== null

  return (
    <section style={{ display: 'grid', gap: 16 }} aria-labelledby="zone-metric-page-title">
      <header className="states-header">
        <div className="states-header-copy">
          <div className="states-breadcrumb">
            <button type="button" onClick={onExitZone}>Zones</button>
            <span>›</span>
            <button type="button" onClick={onBack}>{zone.name}</button>
            <span>›</span>
            <span>{meta.title}</span>
          </div>
          <h2 id="zone-metric-page-title">{zone.name} — {meta.title}</h2>
          <div className="states-header-meta">
            <span className="state-code-badge">{zone.code}</span>
            <span className="state-code-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              {zone.cityName}, {zone.stateName}
            </span>
            <span className={`status-pill ${zone.status.toLowerCase()}`}>
              <span className="status-dot" />
              {zone.status}
            </span>
            <span className="states-meta-description">{meta.description}</span>
          </div>
        </div>
        <div className="states-header-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            ← Back to zone overview
          </button>
        </div>
      </header>

      {isBookingsView && (
        <>
          <div className="view-section" style={{ background: '#fff' }}>
            <h4 className="view-section-title">
              <span>Booking summary</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Zonal booking register</span>
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
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                        <div style={{ display: 'grid', gap: 6, placeItems: 'center' }}>
                          <span>📋</span>
                          <strong>No {activeStatus ? activeStatus.toLowerCase() : ''} bookings found for {zone.name}</strong>
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
              <span>Users & Staff</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{totalUsers.toLocaleString('en-IN')} staff and operators in {zone.name}</span>
            </h4>
            <div className="state-bookings-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <StatTile value={totalUsers} label="Total Users" tone="primary" />
              <StatTile value={zone.admin ? 1 : 0} label="Zone Admin" tone="blue" />
              <StatTile value={Math.max(1, Math.round(totalUsers * 0.15))} label="Field Officers" tone="amber" />
              <StatTile value={Math.max(0, totalUsers - Math.round(totalUsers * 0.15) - (zone.admin ? 1 : 0))} label="Operators" tone="green" />
            </div>
          </div>

          <div className="view-section">
            <h4 className="view-section-title">
              <span>Zone Personnel</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Assigned administration and staff</span>
            </h4>
            <div className="bookings-table-wrap">
              <table className="bookings-table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Designation</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Zone Administrator</strong></td>
                    <td>{zone.admin?.name ?? 'Not Assigned'}</td>
                    <td>{zone.admin?.email ?? 'N/A'} {zone.admin?.phone ? `· ${zone.admin.phone}` : ''}</td>
                    <td><span className="status-pill active"><span className="status-dot" />Active</span></td>
                  </tr>
                  <tr>
                    <td><strong>Field Support</strong></td>
                    <td>Zonal Field Support Unit</td>
                    <td>support@{zone.name.toLowerCase().replace(/\s+/g, '')}.fieldwork.in</td>
                    <td><span className="status-pill active"><span className="status-dot" />On Duty</span></td>
                  </tr>
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
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{zone.totalDistricts} districts covered</span>
            </h4>
            <div className="state-bookings-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <StatTile value={zone.totalDistricts} label="Total districts" tone="primary" />
              <StatTile value={districtRows.length} label="Districts active" tone="blue" />
              <StatTile value={bookings.length} label="Bookings recorded" tone="green" />
            </div>
          </div>

          <div className="view-section">
            <h4 className="view-section-title">
              <span>Districts covered in {zone.name}</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Booking activity by district</span>
            </h4>
            <div className="bookings-table-wrap">
              <table className="bookings-table" style={{ minWidth: 680 }}>
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Bookings</th>
                    <th>Pending</th>
                    <th>Confirmed</th>
                    <th>Completed</th>
                    <th>Cancelled</th>
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
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '28px 16px', color: '#64748b' }}>
                        No district records available for {zone.name}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'city' && (
        <div className="view-section" style={{ background: '#fff' }}>
          <h4 className="view-section-title">
            <span>Parent Jurisdiction</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Administrative links</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 12 }}>
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(15,23,42,0.08)', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>City Headquarters</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4, color: '#0f172a' }}>{zone.cityName}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(15,23,42,0.08)', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>State Jurisdiction</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4, color: '#0f172a' }}>{zone.stateName}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(15,23,42,0.08)', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Zone Classification</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4, color: '#0f172a' }}>{zone.region ?? 'Standard Operational'}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

