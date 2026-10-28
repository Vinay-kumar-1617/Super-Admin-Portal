import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import RoleHeaderMenus from '../RoleHeaderMenus'
import {
  approvalRequests,
  approvalTypeMeta,
  bookingRows,
  cityRows,
  dashboardPeriods,
  fleetRows,
  stateAlerts,
  stateNotifications,
  stateProfile,
  zoneRows,
  type ApprovalDecision,
  type ApprovalItem,
  type ApprovalType,
  type BookingStatus,
  type SectionId,
  type StateNotification,
} from './stateAdminData'
import OverviewSection from './OverviewSection'
import CitiesSection from './CitiesSection'
import ZonesSection from './ZonesSection'
import BookingsSection from './BookingsSection'
import StateVehicleManagementSection from './StateVehicleManagementSection'
import ApprovalsSection from './ApprovalsSection'
import FinancePaymentsSection from './FinancePaymentsSection'
import DispatchOperationsSection from './DispatchOperationsSection'
import SupportComplaintsSection from './SupportComplaintsSection'
import ReportsAnalyticsSection from './ReportsAnalyticsSection'
import LocationManagementSection from './LocationManagementSection'
import UsersSection from './UsersSection'
import NotificationsSection from './NotificationsSection'
import RulesAndPermissionsSection from './RulesAndPermissionsSection'
import { DEMO_MANAGED_USERS, isForbiddenRole, roleLabel } from './userManagementData'
import AuditLogsSection from '../AuditLogs/AuditLogsSection'

type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

const sections: SectionMeta[] = [
  { id: 'overview', label: 'Overview', title: 'State overview', crumb: 'Overview' },
  { id: 'cities', label: 'Cities', title: `Cities in ${stateProfile.name}`, crumb: 'Cities' },
  { id: 'zones', label: 'Zones', title: 'Zones & dispatch', crumb: 'Zones' },
  { id: 'bookings', label: 'Bookings', title: 'Booking ledger', crumb: 'Bookings' },
  { id: 'fleet', label: 'Fleet', title: 'Fleet & machines', crumb: 'Fleet' },
  { id: 'dispatch', label: 'Dispatch', title: 'Dispatch & operations', crumb: 'Dispatch' },
  { id: 'approvals', label: 'Approvals', title: 'Approvals & requests', crumb: 'Approvals' },
  { id: 'finance', label: 'Finance', title: 'Finance & payments', crumb: 'Finance' },
  { id: 'support', label: 'Support', title: 'Support & complaints', crumb: 'Support' },
  { id: 'reports', label: 'Reports', title: 'Reports & analytics', crumb: 'Reports' },
  { id: 'locations', label: 'Locations', title: 'Location management', crumb: 'Locations' },
  { id: 'users', label: 'Users', title: 'User management', crumb: 'Users' },
  { id: 'audit', label: 'Audit Logs', title: 'State audit logs', crumb: 'Audit Logs' },
  { id: 'notifications', label: 'Notifications', title: 'Notifications', crumb: 'Notifications' },
  { id: 'rules', label: 'Rules & permissions', title: 'Rules & permissions', crumb: 'Rules & Permissions' },
]

const sectionIds: SectionId[] = sections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#state-admin/${id}`)) ?? 'overview'
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
  query?: string
}

type StateAdminDashboardProps = {
  onSignOut?: () => void
}

export default function StateAdminDashboard({ onSignOut }: StateAdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState('This Month')
  const [notifications, setNotifications] = useState<StateNotification[]>(stateNotifications)
  const [approvals, setApprovals] = useState<ApprovalItem[]>(approvalRequests)
  const [approvalFilter, setApprovalFilter] = useState<'All' | ApprovalType>('All')
  const [bookingFilter, setBookingFilter] = useState<'All' | BookingStatus>('All')
  const [bookingCity, setBookingCity] = useState('All')
  const [bookingZone, setBookingZone] = useState('All')
  const [bookingQuery, setBookingQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [cityStatus, setCityStatus] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [zoneQuery, setZoneQuery] = useState('')
  const [zoneStatus, setZoneStatus] = useState<'All' | 'Active' | 'Review'>('All')
  const [zoneCity, setZoneCity] = useState('All')
  // fleet filters removed; StateVehicleManagementSection handles filtering internally.
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const syncFromHash = () => setActiveSection(sectionFromHash())
    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('popstate', syncFromHash)
    }
  }, [])

  const navigateSection = (id: SectionId) => {
    window.history.pushState(null, '', `#state-admin/${id}`)
    setActiveSection(id)
    setHeaderPanel(null)
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2600)
  }

  const pendingApprovals = approvals.filter((item) => item.status === 'Pending')
  const approvalCounts = (Object.keys(approvalTypeMeta) as ApprovalType[]).reduce(
    (counts, type) => {
      counts[type] = pendingApprovals.filter((item) => item.type === type).length
      return counts
    },
    {} as Record<ApprovalType, number>,
  )

  const unreadNotifications = notifications.filter((item) => !item.read).length
  const managedUserCount = DEMO_MANAGED_USERS.filter((user) => !isForbiddenRole(user.role)).length
  const sectionMeta = sections.find((section) => section.id === activeSection) ?? sections[0]

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = headerQuery.trim().toLowerCase()
    if (!query) return []

    const results: SearchResult[] = []
    const push = (result: SearchResult, limit: number) => {
      if (results.filter((item) => item.group === result.group).length < limit) results.push(result)
    }

    sections
      .filter((section) => section.label.toLowerCase().includes(query) || section.title.toLowerCase().includes(query))
      .forEach((section) =>
        push(
          { id: `sec-${section.id}`, group: 'Sections', label: section.label, sub: 'Open section', section: section.id },
          4,
        ),
      )

    cityRows
      .filter((city) => city.name.toLowerCase().includes(query) || city.code.toLowerCase().includes(query))
      .forEach((city) =>
        push(
          { id: `city-${city.id}`, group: 'Cities', label: city.name, sub: `City · ${city.code}`, section: 'cities', query: city.name },
          3,
        ),
      )

    zoneRows
      .filter((zone) => zone.name.toLowerCase().includes(query))
      .forEach((zone) =>
        push(
          { id: `zone-${zone.id}`, group: 'Zones', label: zone.name, sub: `Zone · ${zone.city}`, section: 'zones', query: zone.name },
          3,
        ),
      )

    bookingRows
      .filter(
        (booking) =>
          booking.id.toLowerCase().includes(query) ||
          booking.customer.toLowerCase().includes(query) ||
          booking.machine.toLowerCase().includes(query),
      )
      .forEach((booking) =>
        push(
          { id: `bk-${booking.id}`, group: 'Bookings', label: booking.id, sub: `${booking.customer} · ${booking.machine}`, section: 'bookings', query: booking.id },
          4,
        ),
      )

    fleetRows
      .filter(
        (machine) =>
          machine.model.toLowerCase().includes(query) ||
          machine.regNo.toLowerCase().includes(query) ||
          machine.partner.toLowerCase().includes(query),
      )
      .forEach((machine) =>
        push(
          { id: `mc-${machine.id}`, group: 'Fleet', label: machine.model, sub: `${machine.regNo} · ${machine.city}`, section: 'fleet', query: machine.regNo },
          4,
        ),
      )

    DEMO_MANAGED_USERS
      .filter(
        (user) =>
          !isForbiddenRole(user.role) &&
          (user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)),
      )
      .forEach((user) =>
        push(
          { id: `usr-${user.id}`, group: 'Users', label: user.fullName, sub: `${roleLabel(user.role)} · ${user.email}`, section: 'users', query: user.email },
          4,
        ),
      )

    return results
  }, [headerQuery])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')

    if (result.section === 'cities') {
      setCityQuery(result.query ?? '')
      setCityStatus('All')
    } else if (result.section === 'zones') {
      setZoneQuery(result.query ?? '')
      setZoneStatus('All')
      setZoneCity('All')
    } else if (result.section === 'bookings') {
      setBookingQuery(result.query ?? '')
      setBookingFilter('All')
      setBookingCity('All')
      setBookingZone('All')
    }

    navigateSection(result.section)
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const openFeedTarget = (target: string) => {
    setHeaderPanel(null)
    if (sectionIds.some((id) => id === target)) navigateSection(target as SectionId)
  }

  const resolveApproval = (id: string, decision: ApprovalDecision, comment: string) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: decision,
              history: [
                ...item.history,
                {
                  id: `${item.id}-h${item.history.length + 1}`,
                  action: decision,
                  actor: stateProfile.adminName,
                  role: 'State Admin',
                  time: 'just now',
                  comment: comment || undefined,
                },
              ],
            }
          : item,
      ),
    )
    const verb = decision === 'Approved' ? 'approved' : decision === 'Rejected' ? 'rejected' : 'returned'
    showToast(`${id} ${verb}`)
  }

  const openApprovals = (type: 'All' | ApprovalType) => {
    setApprovalFilter(type)
    navigateSection('approvals')
  }

  const resetCityFilters = () => {
    setCityQuery('')
    setCityStatus('All')
  }

  const resetZoneFilters = () => {
    setZoneQuery('')
    setZoneStatus('All')
    setZoneCity('All')
  }

  const resetBookingFilters = () => {
    setBookingQuery('')
    setBookingFilter('All')
    setBookingCity('All')
    setBookingZone('All')
  }

  const filteredCities = cityRows.filter(
    (city) =>
      (cityStatus === 'All' || city.status === cityStatus) &&
      (cityQuery.trim() === '' ||
        city.name.toLowerCase().includes(cityQuery.trim().toLowerCase()) ||
        city.code.toLowerCase().includes(cityQuery.trim().toLowerCase())),
  )

  const filteredZones = zoneRows.filter(
    (zone) =>
      (zoneStatus === 'All' || zone.status === zoneStatus) &&
      (zoneCity === 'All' || zone.city === zoneCity) &&
      (zoneQuery.trim() === '' ||
        zone.name.toLowerCase().includes(zoneQuery.trim().toLowerCase()) ||
        zone.city.toLowerCase().includes(zoneQuery.trim().toLowerCase())),
  )

  const filteredBookings = bookingRows.filter(
    (booking) =>
      (bookingFilter === 'All' || booking.status === bookingFilter) &&
      (bookingCity === 'All' || booking.city === bookingCity) &&
      (bookingZone === 'All' || booking.zone === bookingZone) &&
      (bookingQuery.trim() === '' ||
        booking.id.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.customerId.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.customer.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.machine.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.operatorId.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.operatorName.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.ownerId.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.ownerName.toLowerCase().includes(bookingQuery.trim().toLowerCase())),
  )

  const filteredApprovals = approvals.filter((item) => approvalFilter === 'All' || item.type === approvalFilter)

  const activeCities = cityRows.filter((city) => city.status === 'Active')

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>
      <style>{`
        .stateadmin-role-dashboard {
          --sa-card-bg: rgba(255, 255, 255, 0.98);
          --sa-text: #0f172a;
          --sa-muted: #667085;
          --sa-shadow: 0 24px 60px -24px rgba(15, 23, 42, 0.35);
        }

        .stateadmin-role-dashboard .sa-sidebar {
          background: radial-gradient(120% 120% at 0% 0%, #0f172a 0%, #0a1324 70%, #070c18 100%);
          padding: 18px 14px 12px;
          gap: 22px;
          box-shadow: 0 28px 80px -30px rgba(2, 6, 23, 0.9);
          backdrop-filter: blur(6px);
        }

        .stateadmin-role-dashboard .sa-brand {
          padding: 8px 10px 20px;
        }

        .stateadmin-role-dashboard .sa-brand-text {
          font-size: 1.08rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .stateadmin-role-dashboard .sa-brand-meta {
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .stateadmin-role-dashboard .sa-sidebar-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.68rem;
          letter-spacing: 0.12em;
        }

        .stateadmin-role-dashboard .sa-nav-item {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.92rem;
        }

        .stateadmin-role-dashboard .sa-nav-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
        }

        .stateadmin-role-dashboard .sa-nav-item.active {
          background: linear-gradient(90deg, rgba(255, 107, 44, 0.24), rgba(239, 74, 18, 0.08));
          box-shadow: inset 3px 0 0 var(--sa-brand), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .stateadmin-role-dashboard .sa-account {
          display: grid;
          gap: 10px;
          padding: 14px 4px 0;
        }

        .stateadmin-role-dashboard .sa-account-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 0 6px;
        }

        .stateadmin-role-dashboard .sa-account-role {
          color: rgba(255, 255, 255, 0.68);
        }

        .stateadmin-role-dashboard .sa-account-copy span.sa-account-email {
          color: rgba(255, 255, 255, 0.42);
          font-size: 0.64rem;
        }

        .stateadmin-role-dashboard .sa-signout {
          width: 100%;
          min-height: 38px;
          margin: 0;
          padding: 9px 12px;
          border: 0;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.82rem;
          text-align: left;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .stateadmin-role-dashboard .sa-signout:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .stateadmin-role-dashboard .sa-nav-badge {
          min-width: 32px;
          height: auto;
          padding: 3px 7px;
          background: rgba(255, 255, 255, 0.08);
          color: #d9e4f2;
          font-size: 0.64rem;
          font-weight: 700;
        }

        .stateadmin-role-dashboard .sa-kpi-card {
          padding: 16px 16px 14px;
          gap: 12px;
        }

        .stateadmin-role-dashboard .sa-kpi-label {
          font-size: 0.82rem;
        }

        .stateadmin-role-dashboard .sa-kpi-value {
          font-size: clamp(1.4rem, 1.8vw, 1.9rem);
        }

        .stateadmin-role-dashboard .sa-kpi-change {
          background: transparent;
          padding: 0;
          border-radius: 0;
          font-size: 0.8rem;
          color: var(--sa-green);
        }

        .stateadmin-role-dashboard .sa-panel-header h3 {
          font-size: 1.08rem;
        }

        .stateadmin-role-dashboard .org-button {
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #fff;
          border-radius: 10px;
          padding: 7px 10px;
          color: var(--sa-text);
          font: inherit;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
        }

        .stateadmin-role-dashboard .org-button:hover {
          border-color: rgba(255, 107, 44, 0.45);
        }

        .stateadmin-role-dashboard .sa-cell-sub {
          font-weight: 400;
        }

        .stateadmin-role-dashboard .sa-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .stateadmin-role-dashboard .sa-stat-card {
          display: grid;
          gap: 6px;
          text-align: left;
          font: inherit;
          color: inherit;
          cursor: pointer;
          background: var(--sa-card-bg);
          border: 1px solid var(--sa-line);
          border-top: 3px solid var(--sa-line);
          border-radius: 18px;
          box-shadow: var(--sa-shadow);
          padding: 16px 18px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .stateadmin-role-dashboard .sa-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
        }

        .stateadmin-role-dashboard .sa-stat-card:focus-visible {
          outline: 3px solid rgba(255, 107, 44, 0.45);
          outline-offset: 3px;
        }

        .stateadmin-role-dashboard .sa-stat-label {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sa-muted);
        }

        .stateadmin-role-dashboard .sa-stat-value {
          font-size: clamp(1.6rem, 2.2vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .stateadmin-role-dashboard .sa-stat-sub {
          font-size: 0.74rem;
          color: var(--sa-muted);
        }

        .stateadmin-role-dashboard .sa-stat-card.tone-brand {
          border-top-color: var(--sa-brand);
        }

        .stateadmin-role-dashboard .sa-stat-card.tone-purple {
          border-top-color: var(--sa-purple);
        }

        .stateadmin-role-dashboard .sa-stat-card.tone-blue {
          border-top-color: var(--sa-blue);
        }

        .stateadmin-role-dashboard .sa-stat-card.tone-green {
          border-top-color: var(--sa-green);
        }

        .stateadmin-role-dashboard .sa-stat-card.tone-red {
          border-top-color: var(--sa-red);
        }

        .stateadmin-role-dashboard .sa-stat-card.tone-amber {
          border-top-color: var(--sa-orange);
        }

        .stateadmin-role-dashboard .sa-stat-card.tone-slate {
          border-top-color: var(--sa-muted);
        }

        .stateadmin-role-dashboard .sa-stat-card.compact .sa-stat-value {
          font-size: clamp(1.2rem, 1.5vw, 1.5rem);
        }

        .stateadmin-role-dashboard .sa-stat-card.static {
          cursor: default;
        }

        .stateadmin-role-dashboard .sa-stat-card.static:hover {
          transform: none;
          box-shadow: var(--sa-shadow);
        }

        .stateadmin-role-dashboard .sa-stat-card.active {
          box-shadow: 0 0 0 2px rgba(255, 107, 44, 0.4), var(--sa-shadow);
        }
      `}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">State Admin · {stateProfile.name}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">State operations</div>
          <ul className="sa-nav">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`sa-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => navigateSection(section.id)}
                >
                  <span>{section.label}</span>
                  {section.id === 'approvals' && pendingApprovals.length > 0 && (
                    <span className="sa-nav-badge">{pendingApprovals.length}</span>
                  )}
                  {section.id === 'users' && <span className="sa-nav-badge">{managedUserCount}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>{stateProfile.name} scope</strong>
          <span>
            {activeCities.length} active cities · {zoneRows.length} zones · {fleetRows.length} tracked machines · one
            state boundary.
          </span>
        </div>

        <div className="sa-account">
          <div className="sa-account-profile">
            <div className="sa-account-avatar" aria-hidden="true">{stateProfile.adminInitials}</div>
            <div className="sa-account-copy">
              <strong>{stateProfile.adminName}</strong>
              <span className="sa-account-role">State Admin · {stateProfile.name}</span>
              <span className="sa-account-email">{stateProfile.adminEmail}</span>
            </div>
          </div>
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="dashboard-header">
          <div className="role-header-leading">
            <div className="role-header-brand" aria-label="EquipHub">
              <span className="role-header-brand-mark" aria-hidden="true">E</span>
              <span>EquipHub</span>
            </div>
            <div className="header-copy">
              <h1 className="header-title">{sectionMeta.title}</h1>
              <div className="header-breadcrumb">Statewide · {stateProfile.name}</div>
            </div>
          </div>

          <div className="header-actions">
            <div className="header-toolbar">
              {headerPanel && (
                <div className="header-panel-backdrop" aria-hidden="true" onClick={() => setHeaderPanel(null)} />
              )}

              <div className="header-search-wrap">
                <input
                  className="header-search"
                  aria-label="Search the state dashboard"
                  placeholder="Search cities, zones, bookings..."
                  value={headerQuery}
                  onChange={(event) => {
                    const value = event.target.value
                    setHeaderQuery(value)
                    setHeaderPanel(value.trim() ? 'search' : null)
                  }}
                  onFocus={() => setHeaderPanel(headerQuery.trim() ? 'search' : null)}
                />
                {headerPanel === 'search' && (
                  <div className="header-popover search-popover" role="listbox" aria-label="Search results">
                    <div className="header-popover-head">
                      <h4>Search results</h4>
                      <span className="header-popover-meta">{searchResults.length} found</span>
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="header-feed-empty">
                        No matches for “{headerQuery.trim()}”. Try a city, zone, booking id or machine.
                      </div>
                    ) : (
                      searchResults.map((result, index) => {
                        const showGroup = index === 0 || searchResults[index - 1].group !== result.group
                        return (
                          <Fragment key={result.id}>
                            {showGroup && <div className="search-result-group">{result.group}</div>}
                            <button type="button" className="search-result-item" onClick={() => runSearchResult(result)}>
                              <strong>{result.label}</strong>
                              <span className="search-result-sub">{result.sub}</span>
                            </button>
                          </Fragment>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'notifications' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'notifications' ? null : 'notifications')}
                >
                  Notifications {unreadNotifications > 0 && <span className="header-badge">{unreadNotifications}</span>}
                </button>
                {headerPanel === 'notifications' && (
                  <div className="header-popover" role="dialog" aria-label="Notifications">
                    <div className="header-popover-head">
                      <h4>Notifications</h4>
                      {unreadNotifications > 0 && (
                        <button type="button" className="header-popover-action" onClick={markAllNotificationsRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="header-feed-list">
                      {notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="header-feed-item"
                          onClick={() => {
                            markNotificationRead(item.id)
                            openFeedTarget(item.target)
                          }}
                        >
                          <span className={`header-feed-dot ${item.tone}`} />
                          <span className="header-feed-body">
                            <strong>
                              {item.title}
                              {!item.read && <span className="header-feed-unread" />}
                            </strong>
                            <span>{item.detail}</span>
                            <span className="header-feed-time">{item.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'alerts' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'alerts' ? null : 'alerts')}
                >
                  Alerts {stateAlerts.length > 0 && <span className="header-badge header-badge-amber">{stateAlerts.length}</span>}
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{stateAlerts.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {stateAlerts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="header-feed-item"
                          onClick={() => openFeedTarget(item.target)}
                        >
                          <span
                            className={`header-feed-dot ${item.severity === 'Critical' ? 'red' : item.severity === 'Warning' ? 'amber' : 'blue'}`}
                          />
                          <span className="header-feed-body">
                            <span className="header-alert-top">
                              <strong>{item.title}</strong>
                              <span className={`header-sev ${item.severity.toLowerCase()}`}>{item.severity}</span>
                            </span>
                            <span>{item.detail}</span>
                            <span className="header-feed-time">{item.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="header-popover-foot">
                      <button type="button" className="header-action" onClick={() => openFeedTarget('approvals')}>
                        Open approvals
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'period' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'period' ? null : 'period')}
                >
                  {period} ▾
                </button>
                {headerPanel === 'period' && (
                  <div className="header-popover" role="dialog" aria-label="Dashboard period">
                    <div className="header-popover-head">
                      <h4>Dashboard period</h4>
                    </div>
                    {dashboardPeriods.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`period-menu-item ${period === option ? 'selected' : ''}`}
                        onClick={() => {
                          setPeriod(option)
                          setHeaderPanel(null)
                          showToast(`Period set to ${option}`)
                        }}
                      >
                        <span>{option}</span>
                        {period === option && <span className="period-current">Current</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="legacy-profile-control" style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <button
                  type="button"
                  className="header-avatar"
                  aria-label="User profile"
                  onClick={() => navigateSection('overview')}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {stateProfile.adminInitials}
                </button>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  State Admin
                </span>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
              <RoleHeaderMenus
                notifications={notifications}
                alerts={stateAlerts}
                initials={stateProfile.adminInitials}
                onNotificationClick={(item) => { markNotificationRead(item.id); openFeedTarget(item.target) }}
                onAlertClick={(item) => openFeedTarget(item.target)}
                onMarkAllRead={markAllNotificationsRead}
                onSignOut={onSignOut}
                onAlertsFooter={() => openFeedTarget('approvals')}
                alertsFooterLabel="Open approvals"
              />
            </div>
          </div>
        </header>

        {toast && (
          <div className="sa-toast" role="status">
            {toast}
          </div>
        )}

        <div className="sa-content">
          {activeSection === 'overview' && (
            <OverviewSection
              approvalCounts={approvalCounts}
              onOpenApprovals={openApprovals}
              onNavigate={navigateSection}
            />
          )}

          {activeSection === 'cities' && (
            <CitiesSection
              query={cityQuery}
              onQueryChange={setCityQuery}
              status={cityStatus}
              onStatusChange={setCityStatus}
              rows={filteredCities}
              onReset={resetCityFilters}
            />
          )}

          {activeSection === 'zones' && (
            <ZonesSection
              query={zoneQuery}
              onQueryChange={setZoneQuery}
              status={zoneStatus}
              onStatusChange={setZoneStatus}
              city={zoneCity}
              onCityChange={setZoneCity}
              rows={filteredZones}
              onReset={resetZoneFilters}
            />
          )}

          {activeSection === 'bookings' && (
            <BookingsSection
              query={bookingQuery}
              onQueryChange={setBookingQuery}
              filter={bookingFilter}
              onFilterChange={setBookingFilter}
              city={bookingCity}
              onCityChange={setBookingCity}
              zone={bookingZone}
              onZoneChange={setBookingZone}
              rows={filteredBookings}
              onReset={resetBookingFilters}
            />
          )}

          {activeSection === 'fleet' && <StateVehicleManagementSection onToast={showToast} />}

          {activeSection === 'approvals' && (
            <ApprovalsSection
              filter={approvalFilter}
              onFilterChange={setApprovalFilter}
              rows={filteredApprovals}
              pendingCount={pendingApprovals.length}
              approverName={stateProfile.adminName}
              onResolve={resolveApproval}
            />
          )}

          {activeSection === 'finance' && (
            <FinancePaymentsSection onOpenAudit={() => navigateSection('audit')} />
          )}

          {activeSection === 'dispatch' && (
            <DispatchOperationsSection onToast={showToast} />
          )}

          {activeSection === 'support' && (
            <SupportComplaintsSection onToast={showToast} />
          )}

          {activeSection === 'reports' && (
            <ReportsAnalyticsSection onToast={showToast} />
          )}

          {activeSection === 'locations' && (
            <LocationManagementSection onToast={showToast} />
          )}

          {activeSection === 'users' && <UsersSection />}

          {activeSection === 'audit' && (
            <AuditLogsSection
              profile={{ roleKey: 'state-admin', scopeType: 'state', scopeId: 'TS' }}
              mode="state"
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationsSection onToast={showToast} onNavigate={openFeedTarget} />
          )}

          {activeSection === 'rules' && <RulesAndPermissionsSection />}
        </div>
      </div>
    </section>
  )
}
