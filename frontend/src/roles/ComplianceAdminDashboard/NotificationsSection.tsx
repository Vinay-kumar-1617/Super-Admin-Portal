import { useMemo, useState } from 'react'
import { SectionKpiGrid, type SectionKpiItem } from './SectionKpiGrid'
import {
  defaultNotificationPreferences,
  notificationCategories,
  notificationCategoryMeta,
  notificationChannels,
  notificationDigestOptions,
  notificationPriorityOptions,
  notificationPriorityOrder,
  notificationPriorityTone,
  type ComplianceNotificationView,
  type NotificationCategory,
  type NotificationPreferences,
} from './complianceNotificationData'

type NotificationFilter = 'All' | 'Unread' | NotificationCategory

type NotificationsSectionProps = {
  notifications: ComplianceNotificationView[]
  preferences: NotificationPreferences
  onPreferencesChange: (next: NotificationPreferences) => void
  onOpen: (notification: ComplianceNotificationView) => void
  onToggleRead: (id: string, read: boolean) => void
  onMarkAllRead: () => void
}

export default function NotificationsSection({
  notifications,
  preferences,
  onPreferencesChange,
  onOpen,
  onToggleRead,
  onMarkAllRead,
}: NotificationsSectionProps) {
  const [filter, setFilter] = useState<NotificationFilter>('All')
  const [query, setQuery] = useState('')
  const [showPreferences, setShowPreferences] = useState(false)

  const unread = notifications.filter((item) => !item.read).length
  const critical = notifications.filter((item) => item.priority === 'Critical').length
  const dueSoon = notifications.filter((item) => item.dueInDays >= 0 && item.dueInDays <= 3).length

  const countBy = (category: NotificationCategory) =>
    notifications.filter((item) => item.category === category).length

  const kpis: SectionKpiItem[] = notificationCategories.map((category) => {
    const meta = notificationCategoryMeta[category]
    const count = countBy(category)
    const categoryUnread = notifications.filter((item) => item.category === category && !item.read).length
    return {
      key: category,
      label: meta.label,
      value: String(count).padStart(2, '0'),
      badge: categoryUnread > 0 ? `${categoryUnread} unread` : 'All read',
      badgeTone: categoryUnread > 0 ? 'red' : 'green',
      desc: meta.description,
      openLabel: `Show ${meta.shortLabel.toLowerCase()} →`,
      active: filter === category,
    }
  })

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return notifications
      .filter((item) => {
        if (filter === 'Unread' && item.read) return false
        if (filter !== 'All' && filter !== 'Unread' && item.category !== filter) return false
        if (!normalizedQuery) return true
        return [item.title, item.detail, item.category, item.recordId, item.recordLabel].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        )
      })
      .slice()
      .sort(
        (a, b) =>
          Number(a.read) - Number(b.read) ||
          notificationPriorityOrder[b.priority] - notificationPriorityOrder[a.priority] ||
          a.dueInDays - b.dueInDays,
      )
  }, [notifications, filter, query])

  const toggleCategory = (category: NotificationCategory) => {
    onPreferencesChange({
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: !preferences.categories[category],
      },
    })
  }

  const toggleChannel = (channel: keyof NotificationPreferences['channels']) => {
    onPreferencesChange({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel],
      },
    })
  }

  return (
    <>
      <SectionKpiGrid
        items={kpis}
        onSelect={(key) =>
          setFilter((current) => (current === key ? 'All' : (key as NotificationFilter)))
        }
      />

      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Notifications</h3>
            <span className="sa-panel-sub">
              {critical} critical · {dueSoon} due within three days · {unread} unread across six live compliance
              categories
            </span>
          </div>
          <div className="cf-notif-controls">
            <button
              type="button"
              className="sa-btn-ghost"
              aria-expanded={showPreferences}
              onClick={() => setShowPreferences((current) => !current)}
            >
              {showPreferences ? 'Hide preferences' : 'Notification preferences'}
            </button>
            <button type="button" className="sa-btn-ghost" onClick={onMarkAllRead} disabled={unread === 0}>
              Mark all read
            </button>
          </div>
        </div>

        <div className="notif-toolbar cf-notif-toolbar">
          <input
            className="sa-input"
            aria-label="Search notifications"
            placeholder="Search category, record, vehicle or driver..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="sa-chip-row">
            <button
              type="button"
              className={`sa-chip ${filter === 'All' ? 'active orange' : ''}`}
              onClick={() => setFilter('All')}
            >
              All · {notifications.length}
            </button>
            <button
              type="button"
              className={`sa-chip ${filter === 'Unread' ? 'active orange' : ''}`}
              onClick={() => setFilter('Unread')}
            >
              Unread · {unread}
            </button>
            {notificationCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`sa-chip ${filter === category ? 'active orange' : ''}`}
                onClick={() => setFilter(category)}
              >
                {notificationCategoryMeta[category].shortLabel} · {countBy(category)}
              </button>
            ))}
          </div>
          <span className="notif-toolbar-meta">
            {visible.length} notification{visible.length === 1 ? '' : 's'}
            {filter === 'All' ? '' : ` in ${filter}`} · {unread} unread
          </span>
        </div>

        {showPreferences && (
          <div className="cf-notif-prefs">
            <div className="cf-notif-pref-grid">
              <div className="cf-notif-pref-group">
                <strong>Categories</strong>
                {notificationCategories.map((category) => (
                  <label key={category} className="cf-notif-check">
                    <input
                      type="checkbox"
                      checked={preferences.categories[category]}
                      onChange={() => toggleCategory(category)}
                    />
                    <span className="cf-notif-check-copy">
                      <strong>{notificationCategoryMeta[category].label}</strong>
                      <em>{notificationCategoryMeta[category].description}</em>
                    </span>
                  </label>
                ))}
              </div>

              <div className="cf-notif-pref-group">
                <strong>Priority &amp; delivery</strong>
                <label className="cf-notif-pref-field">
                  <span>Only notify me at or above</span>
                  <select
                    className="sa-select"
                    value={preferences.minimumPriority}
                    onChange={(event) =>
                      onPreferencesChange({
                        ...preferences,
                        minimumPriority: event.target.value as NotificationPreferences['minimumPriority'],
                      })
                    }
                  >
                    {notificationPriorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'All' ? 'Every priority' : option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="cf-notif-pref-field">
                  <span>Digest</span>
                  <select
                    className="sa-select"
                    value={preferences.digest}
                    onChange={(event) =>
                      onPreferencesChange({
                        ...preferences,
                        digest: event.target.value as NotificationPreferences['digest'],
                      })
                    }
                  >
                    {notificationDigestOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="cf-notif-pref-note">
                  Categories below the priority floor are hidden from this feed and the header popover. Read state
                  stays on this device.
                </p>
              </div>

              <div className="cf-notif-pref-group">
                <strong>Channels</strong>
                {notificationChannels.map((channel) => (
                  <label key={channel.key} className="cf-notif-check">
                    <input
                      type="checkbox"
                      checked={preferences.channels[channel.key]}
                      onChange={() => toggleChannel(channel.key)}
                    />
                    <span className="cf-notif-check-copy">
                      <strong>{channel.label}</strong>
                      <em>{channel.description}</em>
                    </span>
                  </label>
                ))}
                <button
                  type="button"
                  className="sa-btn-ghost"
                  onClick={() => onPreferencesChange(defaultNotificationPreferences)}
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {visible.length === 0 ? (
          <p className="notif-empty">
            {notifications.length === 0
              ? 'Nothing needs attention. Expiring records, failed inspections, violations, audits and overdue actions will appear here.'
              : 'No notifications match this filter. Try another category or clear the search.'}
          </p>
        ) : (
          <div className="notif-list">
            {visible.map((item) => {
              const meta = notificationCategoryMeta[item.category]
              return (
                <article key={item.id} className={`notif-card ${item.read ? 'read' : 'unread'}`}>
                  <span className={`notif-dot ${item.tone}`} aria-hidden="true" />
                  <div className="notif-body">
                    <div className="notif-title">
                      <strong>{item.title}</strong>
                      <span className="sa-pill slate">{item.category}</span>
                      <span className={`sa-pill ${notificationPriorityTone[item.priority]}`}>{item.priority}</span>
                      {!item.read && <span className="sa-pill blue">Unread</span>}
                    </div>
                    <p className="notif-detail">{item.detail}</p>
                    <div className="notif-meta">
                      <span>{item.time}</span>
                      <span>{meta.openLabel}</span>
                      <button type="button" className="cf-notif-record-link" onClick={() => onOpen(item)}>
                        {item.recordId} · {item.recordLabel}
                      </button>
                    </div>
                  </div>
                  <div className="notif-actions">
                    <button type="button" className="sa-btn" onClick={() => onOpen(item)}>
                      Open {meta.shortLabel}
                    </button>
                    <button
                      type="button"
                      className="sa-btn-ghost"
                      onClick={() => onToggleRead(item.id, !item.read)}
                    >
                      {item.read ? 'Mark unread' : 'Mark read'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
