import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import {
  bookingRows,
  dashboardPeriods,
  fleetRows,
  localityRows,
  operatorRows,
  requestItems,
  zoneAlerts,
  zoneNotifications,
  zoneProfile,
  type BookingStatus,
  type OperatorStatus,
  type RequestItem,
  type RequestType,
  type SectionId,
} from './zoneAdminData'
import OverviewSection from './OverviewSection'
import LocalitiesSection from './LocalitiesSection'
import OperatorsSection from './OperatorsSection'
import BookingsSection from './BookingsSection'
import VehicleManagementSection from './VehicleManagementSection'
import RequestsSection from './RequestsSection'
import UserManagementSection from './UserManagementSection'
import ApprovalsSection from './ApprovalsSection'
import PaymentsSection from './PaymentsSection'
import RulesAndPermissionsSection from './RulesAndPermissionsSection'
import ReportsSection from './ReportsSection'
import NotificationsSection from './NotificationsSection'
import DispatchOperationsSection from '../CityAdminDashboard/DispatchOperationsSection'
import SupportComplaintsSection from '../CityAdminDashboard/SupportComplaintsSection'
import AuditLogsSection from '../AuditLogs/AuditLogsSection'

// Zone-specific extras layered on top of the shared command-center styles.
const zoneStyles = `
.za-hierarchy {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.za-hier-card {
  border: 1px solid var(--sa-line, #e4e7ec);
  border-radius: 14px;
  padding: 14px 16px;
  background: var(--sa-wash, rgba(15, 23, 42, 0.03));
}
.za-hier-level {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
}
.za-hier-name {
  display: block;
  font-size: 17px;
  margin: 6px 0 10px;
}
.za-hier-metric {
  display: block;
  font-size: 12.5px;
  line-height: 1.7;
  opacity: 0.8;
}
.za-hier-role {
  display: block;
  margin-top: 10px;
  font-size: 11.5px;
  opacity: 0.55;
}
`

type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

const sections: SectionMeta[] = [
  { id: 'overview', label: 'Overview', title: 'Zone overview', crumb: 'Overview' },
  { id: 'localities', label: 'Localities', title: 'Localities & dispatch', crumb: 'Localities' },
  { id: 'operators', label: 'Operators', title: 'Operators & badges', crumb: 'Operators' },
  { id: 'bookings', label: 'Bookings', title: 'Booking ledger', crumb: 'Bookings' },
  { id: 'fleet', label: 'Fleet', title: 'Fleet & machines', crumb: 'Fleet' },
  { id: 'dispatch', label: 'Dispatch', title: 'Dispatch & operations', crumb: 'Dispatch' },
  { id: 'approvals', label: 'Approvals', title: 'Approvals & requests', crumb: 'Approvals' },
  { id: 'payments', label: 'Finance', title: 'Payments & transactions', crumb: 'Finance' },
  { id: 'support', label: 'Support', title: 'Support & complaints', crumb: 'Support' },
  { id: 'reports', label: 'Reports', title: 'Reports & analytics', crumb: 'Reports' },
  { id: 'users', label: 'Users', title: 'User management', crumb: 'Users' },
  { id: 'audit', label: 'Audit Logs', title: `Audit logs · ${zoneProfile.name}`, crumb: 'Audit Logs' },
  { id: 'notifications', label: 'Notifications', title: 'Notifications', crumb: 'Notifications' },
  { id: 'requests', label: 'Requests', title: 'Requests & tasks', crumb: 'Requests' },
  { id: 'rules', label: 'Rules & permissions', title: 'Rules & permissions', crumb: 'Rules & Permissions' },
]

const sectionIds: SectionId[] = sections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#zone-admin/${id}`)) ?? 'overview'
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
  query?: string
}

type ZoneAdminDashboardProps = {
  onSignOut?: () => void
}

export default function ZoneAdminDashboard({ onSignOut }: ZoneAdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState('This Month')
  const [notifications, setNotifications] = useState(zoneNotifications)
  const [requests, setRequests] = useState<RequestItem[]>(Array.from(new Map(requestItems.map((item) => [item.id, item])).values()))
  const [requestFilter, setRequestFilter] = useState<'All' | RequestType>('All')
  const [bookingFilter, setBookingFilter] = useState<'All' | BookingStatus>('All')
  const [bookingQuery, setBookingQuery] = useState('')
  const [localityQuery, setLocalityQuery] = useState('')
  const [localityStatus, setLocalityStatus] = useState<'All' | 'Active' | 'Review'>('All')
  const [operatorQuery, setOperatorQuery] = useState('')
  const [operatorStatus, setOperatorStatus] = useState<'All' | OperatorStatus>('All')
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
    window.history.pushState(null, '', `#zone-admin/${id}`)
    setActiveSection(id)
    setHeaderPanel(null)
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2600)
  }

  const pendingRequests = requests.filter((item) => item.status === 'Pending')
  const requestCounts = {
    Maintenance: pendingRequests.filter((item) => item.type === 'Maintenance').length,
    Incident: pendingRequests.filter((item) => item.type === 'Incident').length,
    Refund: pendingRequests.filter((item) => item.type === 'Refund').length,
    'Change Request': pendingRequests.filter((item) => item.type === 'Change Request').length,
  } satisfies Record<RequestType, number>

  const unreadNotifications = notifications.filter((item) => !item.read).length
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

    localityRows
      .filter((locality) => locality.name.toLowerCase().includes(query))
      .forEach((locality) =>
        push(
          {
            id: `lc-${locality.id}`,
            group: 'Localities',
            label: locality.name,
            sub: `Locality · ${locality.machines} machines`,
            section: 'localities',
            query: locality.name,
          },
          4,
        ),
      )

    operatorRows
      .filter((operator) => operator.name.toLowerCase().includes(query) || operator.id.toLowerCase().includes(query))
      .forEach((operator) =>
        push(
          {
            id: `op-${operator.id}`,
            group: 'Operators',
            label: operator.name,
            sub: `${operator.licence} · ${operator.locality}`,
            section: 'operators',
            query: operator.name,
          },
          4,
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
          {
            id: `bk-${booking.id}`,
            group: 'Bookings',
            label: booking.id,
            sub: `${booking.customer} · ${booking.machine}`,
            section: 'bookings',
            query: booking.id,
          },
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
          {
            id: `mc-${machine.id}`,
            group: 'Fleet',
            label: machine.model,
            sub: `${machine.regNo} · ${machine.locality}`,
            section: 'fleet',
            query: machine.regNo,
          },
          4,
        ),
      )

    return results
  }, [headerQuery])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')

    if (result.section === 'localities') {
      setLocalityQuery(result.query ?? '')
      setLocalityStatus('All')
    } else if (result.section === 'operators') {
      setOperatorQuery(result.query ?? '')
      setOperatorStatus('All')
    } else if (result.section === 'bookings') {
      setBookingQuery(result.query ?? '')
      setBookingFilter('All')
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

  const resolveRequest = (id: string, status: 'Approved' | 'Rejected') => {
    setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
    showToast(status === 'Approved' ? `${id} approved` : `${id} rejected`)
  }

  const openRequests = (type: 'All' | RequestType) => {
    setRequestFilter(type)
    navigateSection('requests')
  }

  const resetLocalityFilters = () => {
    setLocalityQuery('')
    setLocalityStatus('All')
  }

  const resetOperatorFilters = () => {
    setOperatorQuery('')
    setOperatorStatus('All')
  }

  const resetBookingFilters = () => {
    setBookingQuery('')
    setBookingFilter('All')
  }

  const filteredLocalities = localityRows.filter(
    (locality) =>
      (localityStatus === 'All' || locality.status === localityStatus) &&
      (localityQuery.trim() === '' || locality.name.toLowerCase().includes(localityQuery.trim().toLowerCase())),
  )

  const filteredOperators = operatorRows.filter(
    (operator) =>
      (operatorStatus === 'All' || operator.status === operatorStatus) &&
      (operatorQuery.trim() === '' ||
        operator.name.toLowerCase().includes(operatorQuery.trim().toLowerCase()) ||
        operator.locality.toLowerCase().includes(operatorQuery.trim().toLowerCase()) ||
        operator.licence.toLowerCase().includes(operatorQuery.trim().toLowerCase())),
  )

  const filteredBookings = bookingRows.filter(
    (booking) =>
      (bookingFilter === 'All' || booking.status === bookingFilter) &&
      (bookingQuery.trim() === '' ||
        booking.id.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.customer.toLowerCase().includes(bookingQuery.trim().toLowerCase()) ||
        booking.machine.toLowerCase().includes(bookingQuery.trim().toLowerCase())),
  )

  const filteredRequests = requests.filter((item) => requestFilter === 'All' || item.type === requestFilter)

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>
      <style>{zoneStyles}</style>
      <style>{`
        .stateadmin-role-dashboard {
          --sa-card-bg: rgba(255, 255, 255, 0.97);
          --sa-text: #0f172a;
          --sa-muted: #64748b;
          --sa-shadow: 0 24px 60px -24px rgba(15, 23, 42, 0.3);
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

        .stateadmin-role-dashboard .sa-nav-badge {
          min-width: 32px;
          height: auto;
          padding: 3px 7px;
          background: rgba(255, 255, 255, 0.08);
          color: #d9e4f2;
          font-size: 0.64rem;
          font-weight: 700;
        }

        .stateadmin-role-dashboard .dashboard-header {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
          border-color: rgba(15, 23, 42, 0.06);
          box-shadow: 0 24px 60px -28px rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
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

        .stateadmin-role-dashboard .sa-stat-card.tone-brand { border-top-color: var(--sa-brand); }
        .stateadmin-role-dashboard .sa-stat-card.tone-purple { border-top-color: var(--sa-purple); }
        .stateadmin-role-dashboard .sa-stat-card.tone-blue { border-top-color: var(--sa-blue); }
        .stateadmin-role-dashboard .sa-stat-card.tone-green { border-top-color: var(--sa-green); }
        .stateadmin-role-dashboard .sa-stat-card.tone-red { border-top-color: var(--sa-red); }
        .stateadmin-role-dashboard .sa-stat-card.tone-amber { border-top-color: var(--sa-orange); }
        .stateadmin-role-dashboard .sa-stat-card.tone-slate { border-top-color: var(--sa-muted); }

        .stateadmin-role-dashboard .sa-stat-card.compact .sa-stat-value {
          font-size: clamp(1.2rem, 1.5vw, 1.5rem);
        }

        .stateadmin-role-dashboard .sa-stat-card.static { cursor: default; }
        .stateadmin-role-dashboard .sa-stat-card.static:hover { transform: none; box-shadow: var(--sa-shadow); }
        .stateadmin-role-dashboard .sa-stat-card.active {
          box-shadow: 0 0 0 2px rgba(255, 107, 44, 0.4), var(--sa-shadow);
        }
      `}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">Zone Admin · {zoneProfile.name}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">Zone operations</div>
          <ul className="sa-nav">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`sa-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => navigateSection(section.id)}
                >
                  <span>{section.label}</span>
                  {section.id === 'requests' && pendingRequests.length > 0 && (
                    <span className="sa-nav-badge">{pendingRequests.length}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>{zoneProfile.name} scope</strong>
          <span>
            {localityRows.length} localities · {operatorRows.length} tracked operators · {fleetRows.length} machines ·
            inside {zoneProfile.city}, {zoneProfile.state} only.
          </span>
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{zoneProfile.adminInitials}</div>
          <div className="sa-account-copy">
            <strong>{zoneProfile.adminName}</strong>
            <span>{zoneProfile.adminEmail}</span>
          </div>
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Logout
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="dashboard-header">
          <div className="header-copy">
            <p className="header-kicker">
              {zoneProfile.state} · {zoneProfile.name} command
            </p>
            <h1 className="header-title">{sectionMeta.title}</h1>
            <div className="header-breadcrumb">
              Overview / {zoneProfile.state} / {zoneProfile.name} / {sectionMeta.crumb}
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
                  aria-label="Search the zone dashboard"
                  placeholder="Search localities, operators, bookings..."
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
                        No matches for “{headerQuery.trim()}”. Try a locality, operator, booking id or machine.
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

              <div className="header-popover-wrap">
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

              <div className="header-popover-wrap">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'alerts' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'alerts' ? null : 'alerts')}
                >
                  Alerts {zoneAlerts.length > 0 && <span className="header-badge header-badge-amber">{zoneAlerts.length}</span>}
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{zoneAlerts.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {zoneAlerts.map((item) => (
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
                      <button type="button" className="header-action" onClick={() => openFeedTarget('requests')}>
                        Open requests
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap">
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <div className="header-avatar">{zoneProfile.adminInitials}</div>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
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
            <OverviewSection requestCounts={requestCounts} onOpenRequests={openRequests} onNavigate={navigateSection} />
          )}

          {activeSection === 'localities' && (
            <LocalitiesSection
              query={localityQuery}
              onQueryChange={setLocalityQuery}
              status={localityStatus}
              onStatusChange={setLocalityStatus}
              rows={filteredLocalities}
              onReset={resetLocalityFilters}
            />
          )}

          {activeSection === 'operators' && (
            <OperatorsSection
              query={operatorQuery}
              onQueryChange={setOperatorQuery}
              status={operatorStatus}
              onStatusChange={setOperatorStatus}
              rows={filteredOperators}
              onReset={resetOperatorFilters}
            />
          )}

          {activeSection === 'bookings' && (
            <BookingsSection
              query={bookingQuery}
              onQueryChange={setBookingQuery}
              filter={bookingFilter}
              onFilterChange={setBookingFilter}
              rows={filteredBookings}
              onReset={resetBookingFilters}
            />
          )}

          {activeSection === 'fleet' && <VehicleManagementSection onToast={showToast} />}

          {activeSection === 'requests' && (
            <RequestsSection
              filter={requestFilter}
              onFilterChange={setRequestFilter}
              rows={filteredRequests}
              pendingCount={pendingRequests.length}
              onResolve={resolveRequest}
            />
          )}

          {activeSection === 'dispatch' && <DispatchOperationsSection onToast={showToast} zoneScope="Madhapur" />}

          {activeSection === 'approvals' && <ApprovalsSection onToast={showToast} />}

          {activeSection === 'payments' && <PaymentsSection onToast={showToast} />}

          {activeSection === 'support' && <SupportComplaintsSection onToast={showToast} zoneScope="Madhapur" />}

          {activeSection === 'reports' && <ReportsSection onToast={showToast} />}

          {activeSection === 'users' && <UserManagementSection onToast={showToast} />}

          {activeSection === 'audit' && (
            <AuditLogsSection
              profile={{ roleKey: 'zone-admin', scopeType: 'zone', scopeId: zoneProfile.name }}
              mode="zone"
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
