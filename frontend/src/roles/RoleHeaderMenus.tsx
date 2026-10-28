import { useState } from 'react'

export type HeaderNotificationItem = {
  id: string
  title: string
  detail: string
  time: string
  tone: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate'
  read: boolean
  target: string
}

export type HeaderAlertItem = {
  id: string
  title: string
  detail: string
  time: string
  severity: 'Critical' | 'High' | 'Warning' | 'Medium' | 'Info'
  target: string
}

type RoleHeaderMenusProps = {
  notifications: HeaderNotificationItem[]
  alerts: HeaderAlertItem[]
  initials: string
  onNotificationClick: (item: HeaderNotificationItem) => void
  onAlertClick: (item: HeaderAlertItem) => void
  onMarkAllRead: () => void
  onSignOut?: () => void
  onAlertsFooter?: () => void
  alertsFooterLabel?: string
}

const severityClass = (severity: HeaderAlertItem['severity']) => {
  if (severity === 'Critical' || severity === 'High') return 'red'
  if (severity === 'Warning' || severity === 'Medium') return 'amber'
  return 'blue'
}

export default function RoleHeaderMenus({
  notifications,
  alerts,
  initials,
  onNotificationClick,
  onAlertClick,
  onMarkAllRead,
  onSignOut,
  onAlertsFooter,
  alertsFooterLabel,
}: RoleHeaderMenusProps) {
  const [openMenu, setOpenMenu] = useState<'alerts' | 'profile' | null>(null)
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    const savedTheme = window.localStorage.getItem('equiprent-theme')
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'system'
  })
  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <>
      <button
        type="button"
        className="theme-switcher"
        aria-label="Change color theme"
        title={`Current theme: ${theme}`}
        onClick={() => {
          const nextTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
          if (nextTheme === 'system') document.documentElement.removeAttribute('data-theme')
          else document.documentElement.dataset.theme = nextTheme
          window.localStorage.setItem('equiprent-theme', nextTheme)
          setTheme(nextTheme)
        }}
      >
        ◐ {theme[0].toUpperCase() + theme.slice(1)}
      </button>
      <div className="header-popover-wrap role-alert-menu">
        <button
          type="button"
          className={`header-action ${openMenu === 'alerts' ? 'is-open' : ''}`}
          aria-label="View alerts and notifications"
          aria-expanded={openMenu === 'alerts'}
          aria-haspopup="dialog"
          onClick={() => setOpenMenu(openMenu === 'alerts' ? null : 'alerts')}
        >
          ⚠ Alerts {(unreadCount + alerts.length) > 0 && (
            <span className="header-badge header-badge-amber">{unreadCount + alerts.length}</span>
          )}
        </button>
        {openMenu === 'alerts' && (
          <div className="header-popover" role="dialog" aria-label="Alerts">
            <div className="header-popover-head">
              <h4>Alerts</h4>
              <div className="role-alert-meta">
                <span className="header-popover-meta">{alerts.length} alerts · {unreadCount} unread</span>
                {unreadCount > 0 && (
                  <button type="button" className="header-popover-action" onClick={onMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            <div className="header-feed-list">
              {notifications.map((item) => (
                <button
                  key={`notification-${item.id}`}
                  type="button"
                  className="header-feed-item"
                  onClick={() => {
                    setOpenMenu(null)
                    onNotificationClick(item)
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
              {alerts.map((item) => (
                <button
                  key={`alert-${item.id}`}
                  type="button"
                  className="header-feed-item"
                  onClick={() => {
                    setOpenMenu(null)
                    onAlertClick(item)
                  }}
                >
                  <span className={`header-feed-dot ${severityClass(item.severity)}`} />
                  <span className="header-feed-body">
                    <span className="header-alert-top">
                      <strong>{item.title}</strong>
                      <span className={`header-sev ${severityClass(item.severity)}`}>{item.severity}</span>
                    </span>
                    <span>{item.detail}</span>
                    <span className="header-feed-time">{item.time}</span>
                  </span>
                </button>
              ))}
              {notifications.length === 0 && alerts.length === 0 && (
                <div className="header-feed-empty">You’re all caught up.</div>
              )}
            </div>
            {onAlertsFooter && alertsFooterLabel && (
              <div className="header-popover-foot">
                <button
                  type="button"
                  className="header-action"
                  onClick={() => {
                    setOpenMenu(null)
                    onAlertsFooter()
                  }}
                >
                  {alertsFooterLabel}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header-popover-wrap">
        <button
          type="button"
          className="header-avatar"
          aria-label="User profile"
          aria-expanded={openMenu === 'profile'}
          aria-haspopup="dialog"
          onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}
        >
          {initials}
        </button>
        {openMenu === 'profile' && (
          <div className="header-popover role-profile-popover" role="dialog" aria-label="Account menu">
            <button
              type="button"
              className="role-profile-logout"
              onClick={() => {
                setOpenMenu(null)
                onSignOut?.()
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </>
  )
}
