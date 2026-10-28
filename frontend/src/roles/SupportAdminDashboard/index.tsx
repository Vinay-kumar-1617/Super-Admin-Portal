import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import RoleHeaderMenus from '../RoleHeaderMenus'
import {
  bookings,
  reportCards,
  supportAlerts,
  supportNotifications,
  supportPeriods,
  supportProfile,
  supportSections,
  userAccounts,
  type SectionId,
  type SupportNotification,
} from './supportAdminData'
import { useSupportAdmin } from './useSupportAdmin'
import OverviewSection from './OverviewSection'
import TicketsSection from './TicketsSection'
import BookingAssistSection from './BookingAssistSection'
import UsersSection from './UsersSection'
import RefundsSection from './RefundsSection'
import EscalationsSection from './EscalationsSection'
import ReportsSection from './ReportsSection'
import NotificationsSection from './NotificationsSection'
import AudienceSupportSection from './AudienceSupportSection'
import PaymentSupportSection from './PaymentSupportSection'
import LiveChatSection from './LiveChatSection'

const sectionIds: SectionId[] = supportSections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#support-admin/${id}`)) ?? 'overview'
}

const ticketFromHash = (): string | null => {
  if (typeof window === 'undefined') return null
  const match = window.location.hash.match(/^#support-admin\/(?:tickets\/|(?:customer-support|owner-support|operator-support)\/ticket\/)([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

const userFromHash = (): string | null => {
  if (typeof window === 'undefined') return null
  const match = window.location.hash.match(/^#support-admin\/users\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

const bookingFromHash = (): string | null => {
  if (typeof window === 'undefined') return null
  const match = window.location.hash.match(/^#support-admin\/bookings\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
}

type SupportAdminDashboardProps = {
  onSignOut?: () => void
}

export default function SupportAdminDashboard({ onSignOut }: SupportAdminDashboardProps) {
  const store = useSupportAdmin()
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [openedTicketId, setOpenedTicketId] = useState<string | null>(ticketFromHash)
  const [openedUserId, setOpenedUserId] = useState<string | null>(userFromHash)
  const [openedBookingId, setOpenedBookingId] = useState<string | null>(bookingFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState('This Month')
  const [notifications, setNotifications] = useState<SupportNotification[]>(supportNotifications)

  useEffect(() => {
    const syncFromHash = () => {
      setActiveSection(sectionFromHash())
      setOpenedTicketId(ticketFromHash())
      setOpenedUserId(userFromHash())
      setOpenedBookingId(bookingFromHash())
    }
    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('popstate', syncFromHash)
    }
  }, [])

  const navigateSection = (id: SectionId) => {
    window.history.pushState(null, '', `#support-admin/${id}`)
    setActiveSection(id)
    setOpenedTicketId(null)
    setOpenedUserId(null)
    setOpenedBookingId(null)
    setHeaderPanel(null)
  }

  const openUser = (id: string) => {
    window.history.pushState(null, '', `#support-admin/users/${encodeURIComponent(id)}`)
    setActiveSection('users')
    setOpenedUserId(id)
    setOpenedTicketId(null)
    setOpenedBookingId(null)
    setHeaderPanel(null)
  }

  const openBooking = (id: string) => {
    window.history.pushState(null, '', `#support-admin/bookings/${encodeURIComponent(id)}`)
    setActiveSection('bookings')
    setOpenedBookingId(id)
    setOpenedTicketId(null)
    setOpenedUserId(null)
    setHeaderPanel(null)
  }

  const openTicket = (id: string, sourceSection: SectionId = 'tickets') => {
    const ticketPath = sourceSection === 'tickets' ? `tickets/${encodeURIComponent(id)}` : `${sourceSection}/ticket/${encodeURIComponent(id)}`
    window.history.pushState(null, '', `#support-admin/${ticketPath}`)
    setActiveSection(sourceSection)
    setOpenedTicketId(id)
    setOpenedUserId(null)
    setOpenedBookingId(null)
    setHeaderPanel(null)
  }

  const returnToTicketQueue = (sourceSection: SectionId = 'tickets') => {
    window.history.pushState(null, '', `#support-admin/${sourceSection}`)
    setActiveSection(sourceSection)
    setOpenedTicketId(null)
    setOpenedUserId(null)
    setOpenedBookingId(null)
  }

  const unreadNotifications = notifications.filter((item) => !item.read).length
  const sectionMeta = supportSections.find((section) => section.id === activeSection) ?? supportSections[0]

  const queueCount = store.tickets.filter((item) => item.assignee === 'Unassigned' || item.overdue).length
  const refundQueue = store.refunds.filter((item) => item.status === 'Draft' || item.status === 'Escalated').length
  const openEscalations = store.escalations.filter((item) => item.status === 'Open').length

  const navBadges: Partial<Record<SectionId, number>> = {
    tickets: queueCount,
    'live-chat': store.conversations.reduce((total, item) => total + item.unread, 0),
    'payment-support': store.paymentIssues.filter((item) => item.status === 'Open' || item.status === 'Investigating').length,
    refunds: refundQueue,
    escalations: openEscalations,
    notifications: unreadNotifications,
  }

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = headerQuery.trim().toLowerCase()
    if (!query) return []

    const results: SearchResult[] = []
    const push = (result: SearchResult, limit: number) => {
      if (results.filter((item) => item.group === result.group).length < limit) results.push(result)
    }

    supportSections
      .filter((section) => section.label.toLowerCase().includes(query) || section.title.toLowerCase().includes(query))
      .forEach((section) =>
        push({ id: `sec-${section.id}`, group: 'Sections', label: section.label, sub: 'Open section', section: section.id }, 4),
      )

    store.tickets
      .filter(
        (item) =>
          item.id.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query) || item.requester.toLowerCase().includes(query),
      )
      .forEach((item) =>
        push({ id: `tk-${item.id}`, group: 'Tickets', label: item.id, sub: `${item.subject}`, section: 'tickets' }, 4),
      )

    bookings
      .filter((item) => item.id.toLowerCase().includes(query) || item.customer.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `bk-${item.id}`, group: 'Bookings', label: item.id, sub: `${item.customer} · ${item.zone}`, section: 'bookings' }, 3),
      )

    userAccounts
      .filter((item) => item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `us-${item.id}`, group: 'Users', label: item.name, sub: `${item.type} · ${item.maskedPhone}`, section: 'users' }, 3),
      )

    store.refunds
      .filter((item) => item.id.toLowerCase().includes(query) || item.customer.toLowerCase().includes(query) || item.booking.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `rf-${item.id}`, group: 'Refunds', label: item.id, sub: `${item.customer} · ${item.amount}`, section: 'refunds' }, 3),
      )

    store.escalations
      .filter((item) => item.id.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `esc-${item.id}`, group: 'Escalations', label: item.id, sub: `${item.target} · ${item.category}`, section: 'escalations' }, 3),
      )

    reportCards
      .filter((report) => report.title.toLowerCase().includes(query))
      .forEach((report) =>
        push({ id: `rp-${report.id}`, group: 'Reports', label: report.title, sub: `Export ${report.formats.join(' / ')}`, section: 'reports' }, 3),
      )

    return results
  }, [headerQuery, store.tickets, store.refunds, store.escalations])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')
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

  const handleExport = (title: string, format: string) => {
    store.showToast(`${title} exported as ${format}`)
  }

  const renderAudienceSupport = (section: 'customer-support' | 'owner-support' | 'operator-support') => (
    <AudienceSupportSection
      section={section}
      tickets={store.tickets}
      savedReplies={store.savedReplies}
      openedTicketId={openedTicketId}
      onOpenTicket={(id) => openTicket(id, section)}
      onBackToQueue={() => returnToTicketQueue(section)}
      onAssign={store.assignTicket}
      onPriority={store.setPriority}
      onCategory={store.setCategory}
      onReply={store.replyTicket}
      onSavedReply={store.applySavedReply}
      onClose={store.closeTicket}
      onReopen={store.reopenTicket}
      onLinkBooking={store.linkTicketBooking}
    />
  )

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">Support Admin · {supportProfile.city}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">Support operations</div>
          <ul className="sa-nav">
            {supportSections.map((section) => {
              const badge = navBadges[section.id]
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    className={`sa-nav-item ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => navigateSection(section.id)}
                  >
                    <span>{section.label}</span>
                    {badge ? <span className="sa-nav-badge">{badge}</span> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>{supportProfile.city} scope</strong>
          <span>
            {supportProfile.state} · response target {supportProfile.responseTarget} · resolution target {supportProfile.resolutionTarget} · refund cap{' '}
            {supportProfile.refundCap}.
          </span>
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{supportProfile.initials}</div>
          <div className="sa-account-copy">
            <strong>{supportProfile.name}</strong>
            <span>{supportProfile.email}</span>
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
              <div className="header-breadcrumb">{supportProfile.state} · {supportProfile.city}</div>
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
                  aria-label="Search the support dashboard"
                  placeholder="Search tickets, bookings, users..."
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
                        No matches for “{headerQuery.trim()}”. Try a ticket, booking, user or refund.
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
                    <div className="header-popover-head">
                      <button
                        type="button"
                        className="header-popover-action"
                        onClick={() => navigateSection('notifications')}
                      >
                        View all notifications
                      </button>
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
                  Alerts {supportAlerts.length > 0 && <span className="header-badge header-badge-amber">{supportAlerts.length}</span>}
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{supportAlerts.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {supportAlerts.map((item) => (
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
                      <button type="button" className="header-action" onClick={() => openFeedTarget('tickets')}>
                        Open ticket desk
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
                    {supportPeriods.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`period-menu-item ${period === option ? 'selected' : ''}`}
                        onClick={() => {
                          setPeriod(option)
                          setHeaderPanel(null)
                          store.showToast(`Period set to ${option}`)
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
                <div className="header-avatar">{supportProfile.initials}</div>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
              <RoleHeaderMenus
                notifications={notifications}
                alerts={supportAlerts}
                initials={supportProfile.initials}
                onNotificationClick={(item) => { markNotificationRead(item.id); openFeedTarget(item.target) }}
                onAlertClick={(item) => openFeedTarget(item.target)}
                onMarkAllRead={markAllNotificationsRead}
                onSignOut={onSignOut}
                onAlertsFooter={() => openFeedTarget('tickets')}
                alertsFooterLabel="Open ticket desk"
              />
            </div>
          </div>
        </header>

        {store.toast && (
          <div className="sa-toast" role="status">
            {store.toast}
          </div>
        )}

        <div className="sa-content">
          {activeSection === 'overview' && <OverviewSection tickets={store.tickets} onNavigate={navigateSection} />}

          {activeSection === 'tickets' && (
            <TicketsSection
              tickets={store.tickets}
              savedReplies={store.savedReplies}
              openedTicketId={openedTicketId}
              onOpenTicket={openTicket}
              onBackToQueue={returnToTicketQueue}
              onAssign={store.assignTicket}
              onPriority={store.setPriority}
              onCategory={store.setCategory}
              onReply={store.replyTicket}
              onSavedReply={store.applySavedReply}
              onClose={store.closeTicket}
              onReopen={store.reopenTicket}
              onLinkBooking={store.linkTicketBooking}
            />
          )}

          {activeSection === 'customer-support' && renderAudienceSupport('customer-support')}
          {activeSection === 'owner-support' && renderAudienceSupport('owner-support')}
          {activeSection === 'operator-support' && renderAudienceSupport('operator-support')}
          {activeSection === 'live-chat' && (
            <LiveChatSection
              conversations={store.conversations}
              onAssign={store.assignConversation}
              onStatusChange={store.setConversationStatus}
              onMarkRead={store.markConversationRead}
              onSend={store.sendChatMessage}
            />
          )}

          {activeSection === 'bookings' && (
            <BookingAssistSection
              bookings={bookings}
              tickets={store.tickets}
              selectedBookingId={openedBookingId}
              onOpenBooking={openBooking}
              onBackToBookings={() => navigateSection('bookings')}
              onCreateTicket={store.createTicketFromBooking}
              onLinkTicket={store.linkTicketBooking}
            />
          )}

          {activeSection === 'users' && (
            <UsersSection
              users={userAccounts}
              tickets={store.tickets}
              selectedUserId={openedUserId}
              onOpenUser={openUser}
              onBackToUsers={() => navigateSection('users')}
            />
          )}

          {activeSection === 'payment-support' && (
            <PaymentSupportSection
              issues={store.paymentIssues}
              onStatusChange={store.updatePaymentIssueStatus}
            />
          )}

          {activeSection === 'refunds' && (
            <RefundsSection
              refunds={store.refunds}
              cap={supportProfile.refundCap}
              capValue={supportProfile.refundCapValue}
              onCreate={store.createRefund}
              onEscalate={store.escalateRefund}
              onProcess={store.processRefund}
              onReject={store.rejectRefund}
            />
          )}

          {activeSection === 'escalations' && (
            <EscalationsSection
              escalations={store.escalations}
              onCreate={store.createEscalation}
              onAcknowledge={store.acknowledgeEscalation}
              onResolve={store.resolveEscalation}
              onUpdate={store.updateEscalationDetails}
            />
          )}

          {activeSection === 'reports' && <ReportsSection audit={store.audit} onExport={handleExport} onNavigate={navigateSection} />}

          {activeSection === 'notifications' && (
            <NotificationsSection
              notifications={notifications}
              setNotifications={setNotifications}
              onNavigate={navigateSection}
            />
          )}
        </div>
      </div>
    </section>
  )
}
