import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import RoleHeaderMenus from '../RoleHeaderMenus'
import {
  approvalRequests,
  bookingRows,
  cityAlerts,
  cityNotifications,
  cityProfile,
  dashboardPeriods,
  fleetRows,
  operatorRows,
  zoneRows,
  approvalTypeMeta,
  type ApprovalDecision,
  type ApprovalItem,
  type ApprovalType,
  type BookingStatus,
  type CityNotification,
  type MachineStatus,
  type OperatorStatus,
  type SectionId,
} from './cityAdminData'
import OverviewSection from './OverviewSection'
import ZonesSection from './ZonesSection'
import OperatorsSection from './OperatorsSection'
import BookingsSection from './BookingsSection'
import FleetSection from './FleetSection'
import DispatchOperationsSection from './DispatchOperationsSection'
import ApprovalsSection from './ApprovalsSection'
import FinancePaymentsSection from './FinancePaymentsSection'
import SupportComplaintsSection from './SupportComplaintsSection'
import ReportsAnalyticsSection from './ReportsAnalyticsSection'
import NotificationsSection from './NotificationsSection'
import UserManagementSection from './UserManagementSection'
import RulesAndPermissionsSection from './RulesAndPermissionsSection'
import AuditLogsSection from '../AuditLogs/AuditLogsSection'

type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

const sections: SectionMeta[] = [
  { id: 'overview', label: 'Overview', title: 'City overview', crumb: 'Overview' },
  { id: 'zones', label: 'Zones', title: 'Zones & dispatch', crumb: 'Zones' },
  { id: 'operators', label: 'Operators', title: 'Operators & badges', crumb: 'Operators' },
  { id: 'bookings', label: 'Bookings', title: 'Booking ledger', crumb: 'Bookings' },
  { id: 'fleet', label: 'Fleet', title: 'Fleet & machines', crumb: 'Fleet' },
  { id: 'dispatch', label: 'Dispatch', title: 'Dispatch & operations', crumb: 'Dispatch' },
  { id: 'approvals', label: 'Approvals', title: 'Approvals & requests', crumb: 'Approvals' },
  { id: 'finance', label: 'Finance', title: 'Finance & payments', crumb: 'Finance' },
  { id: 'support', label: 'Support', title: 'Support & complaints', crumb: 'Support' },
  { id: 'reports', label: 'Reports', title: 'Reports & analytics', crumb: 'Reports' },
  { id: 'users', label: 'Users', title: 'User management', crumb: 'Users' },
  { id: 'audit', label: 'Audit Logs', title: `Audit logs · ${cityProfile.name}`, crumb: 'Audit Logs' },
  { id: 'notifications', label: 'Notifications', title: 'Notifications', crumb: 'Notifications' },
  { id: 'rules', label: 'Rules & permissions', title: 'Rules & permissions', crumb: 'Rules & Permissions' },
]

const sectionIds: SectionId[] = sections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#city-admin/${id}`)) ?? 'overview'
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
  query?: string
}

type CityAdminDashboardProps = {
  onSignOut?: () => void
}

export default function CityAdminDashboard({ onSignOut }: CityAdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState('This Month')
  const [notifications, setNotifications] = useState<CityNotification[]>(cityNotifications)
  const [approvals, setApprovals] = useState<ApprovalItem[]>(approvalRequests)
  const [approvalFilter, setApprovalFilter] = useState<'All' | ApprovalType>('All')
  const [bookingFilter, setBookingFilter] = useState<'All' | BookingStatus>('All')
  const [bookingQuery, setBookingQuery] = useState('')
  const [zoneQuery, setZoneQuery] = useState('')
  const [zoneStatus, setZoneStatus] = useState<'All' | 'Active' | 'Review'>('All')
  const [operatorQuery, setOperatorQuery] = useState('')
  const [operatorStatus, setOperatorStatus] = useState<'All' | OperatorStatus>('All')
  const [fleetQuery, setFleetQuery] = useState('')
  const [fleetStatus, setFleetStatus] = useState<'All' | MachineStatus>('All')
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
    window.history.pushState(null, '', `#city-admin/${id}`)
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
        push({ id: `sec-${section.id}`, group: 'Sections', label: section.label, sub: 'Open section', section: section.id }, 4),
      )

    zoneRows
      .filter((zone) => zone.name.toLowerCase().includes(query) || zone.area.toLowerCase().includes(query))
      .forEach((zone) =>
        push({ id: `zone-${zone.id}`, group: 'Zones', label: zone.name, sub: `Zone · ${zone.area}`, section: 'zones', query: zone.name }, 3),
      )

    operatorRows
      .filter((operator) => operator.name.toLowerCase().includes(query) || operator.id.toLowerCase().includes(query))
      .forEach((operator) =>
        push({ id: `op-${operator.id}`, group: 'Operators', label: operator.name, sub: `${operator.licence} · ${operator.zone}`, section: 'operators', query: operator.name }, 4),
      )

    bookingRows
      .filter(
        (booking) =>
          booking.id.toLowerCase().includes(query) ||
          booking.customer.toLowerCase().includes(query) ||
          booking.machine.toLowerCase().includes(query),
      )
      .forEach((booking) =>
        push({ id: `bk-${booking.id}`, group: 'Bookings', label: booking.id, sub: `${booking.customer} · ${booking.machine}`, section: 'bookings', query: booking.id }, 4),
      )

    fleetRows
      .filter(
        (machine) =>
          machine.model.toLowerCase().includes(query) ||
          machine.regNo.toLowerCase().includes(query) ||
          machine.partner.toLowerCase().includes(query),
      )
      .forEach((machine) =>
        push({ id: `mc-${machine.id}`, group: 'Fleet', label: machine.model, sub: `${machine.regNo} · ${machine.zone}`, section: 'fleet', query: machine.regNo }, 4),
      )

    return results
  }, [headerQuery])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')

    if (result.section === 'zones') {
      setZoneQuery(result.query ?? '')
      setZoneStatus('All')
    } else if (result.section === 'operators') {
      setOperatorQuery(result.query ?? '')
      setOperatorStatus('All')
    } else if (result.section === 'bookings') {
      setBookingQuery(result.query ?? '')
      setBookingFilter('All')
    } else if (result.section === 'fleet') {
      setFleetQuery(result.query ?? '')
      setFleetStatus('All')
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
              assignee: decision === 'Escalated' ? 'State Admin' : item.assignee,
              history: [
                ...item.history,
                {
                  id: `${item.id}-h${item.history.length + 1}`,
                  action: decision,
                  actor: cityProfile.adminName,
                  role: 'City Admin',
                  time: 'just now',
                  comment: comment || undefined,
                },
              ],
            }
          : item,
      ),
    )
    const verb =
      decision === 'Approved'
        ? 'approved'
        : decision === 'Rejected'
          ? 'rejected'
          : decision === 'Returned'
            ? 'returned'
            : 'escalated to State Admin'
    showToast(`${id} ${verb}`)
  }

  const openApprovals = (type: 'All' | ApprovalType) => {
    setApprovalFilter(type)
    navigateSection('approvals')
  }

  const resetZoneFilters = () => {
    setZoneQuery('')
    setZoneStatus('All')
  }

  const resetOperatorFilters = () => {
    setOperatorQuery('')
    setOperatorStatus('All')
  }

  const resetBookingFilters = () => {
    setBookingQuery('')
    setBookingFilter('All')
  }

  const resetFleetFilters = () => {
    setFleetQuery('')
    setFleetStatus('All')
  }

  const filteredZones = zoneRows.filter(
    (zone) =>
      (zoneStatus === 'All' || zone.status === zoneStatus) &&
      (zoneQuery.trim() === '' ||
        zone.name.toLowerCase().includes(zoneQuery.trim().toLowerCase()) ||
        zone.area.toLowerCase().includes(zoneQuery.trim().toLowerCase())),
  )

  const filteredOperators = operatorRows.filter(
    (operator) =>
      (operatorStatus === 'All' || operator.status === operatorStatus) &&
      (operatorQuery.trim() === '' ||
        operator.name.toLowerCase().includes(operatorQuery.trim().toLowerCase()) ||
        operator.zone.toLowerCase().includes(operatorQuery.trim().toLowerCase()) ||
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

  const filteredFleet = fleetRows.filter(
    (machine) =>
      (fleetStatus === 'All' || machine.status === fleetStatus) &&
      (fleetQuery.trim() === '' ||
        machine.model.toLowerCase().includes(fleetQuery.trim().toLowerCase()) ||
        machine.regNo.toLowerCase().includes(fleetQuery.trim().toLowerCase()) ||
        machine.partner.toLowerCase().includes(fleetQuery.trim().toLowerCase())),
  )

  const filteredApprovals = approvals.filter((item) => approvalFilter === 'All' || item.type === approvalFilter)

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">City Admin · {cityProfile.name}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">City operations</div>
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
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>{cityProfile.name} scope</strong>
          <span>
            {zoneRows.length} zones · {operatorRows.length} tracked operators · {fleetRows.length} machines · inside{' '}
            {cityProfile.state} only.
          </span>
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{cityProfile.adminInitials}</div>
          <div className="sa-account-copy">
            <strong>{cityProfile.adminName}</strong>
            <span>{cityProfile.adminEmail}</span>
          </div>
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Logout
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
              <div className="header-breadcrumb">{cityProfile.state} · {cityProfile.name}</div>
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
                  aria-label="Search the city dashboard"
                  placeholder="Search zones, operators, bookings..."
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
                        No matches for “{headerQuery.trim()}”. Try a zone, operator, booking id or machine.
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
                  Alerts {cityAlerts.length > 0 && <span className="header-badge header-badge-amber">{cityAlerts.length}</span>}
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{cityAlerts.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {cityAlerts.map((item) => (
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
                <div className="header-avatar">{cityProfile.adminInitials}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  City Admin
                </span>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
              <RoleHeaderMenus
                notifications={notifications}
                alerts={cityAlerts}
                initials={cityProfile.adminInitials}
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
            <OverviewSection approvalCounts={approvalCounts} onOpenApprovals={openApprovals} onNavigate={navigateSection} />
          )}

          {activeSection === 'zones' && (
            <ZonesSection
              query={zoneQuery}
              onQueryChange={setZoneQuery}
              status={zoneStatus}
              onStatusChange={setZoneStatus}
              rows={filteredZones}
              onReset={resetZoneFilters}
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

          {activeSection === 'fleet' && (
            <FleetSection
              query={fleetQuery}
              onQueryChange={setFleetQuery}
              status={fleetStatus}
              onStatusChange={setFleetStatus}
              rows={filteredFleet}
              onReset={resetFleetFilters}
            />
          )}

          {activeSection === 'dispatch' && <DispatchOperationsSection onToast={showToast} />}

          {activeSection === 'approvals' && (
            <ApprovalsSection
              filter={approvalFilter}
              onFilterChange={setApprovalFilter}
              rows={filteredApprovals}
              pendingCount={pendingApprovals.length}
              approverName={cityProfile.adminName}
              onResolve={resolveApproval}
            />
          )}

          {activeSection === 'finance' && <FinancePaymentsSection onToast={showToast} />}

          {activeSection === 'support' && <SupportComplaintsSection onToast={showToast} />}

          {activeSection === 'reports' && <ReportsAnalyticsSection onToast={showToast} />}

          {activeSection === 'users' && <UserManagementSection onToast={showToast} />}

          {activeSection === 'audit' && (
            <AuditLogsSection
              profile={{ roleKey: 'city-admin', scopeType: 'city', scopeId: cityProfile.name }}
              mode="city"
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
