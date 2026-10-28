import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import type { SectionId, SupportNotification } from './supportAdminData'

type NotificationsSectionProps = {
  notifications: SupportNotification[]
  setNotifications: Dispatch<SetStateAction<SupportNotification[]>>
  onNavigate: (target: SectionId) => void
}

type Filter = 'All' | 'Unread'

const toneLabels: Record<SupportNotification['tone'], string> = {
  red: 'Urgent',
  amber: 'Needs attention',
  blue: 'Support update',
  green: 'Completed',
}

export default function NotificationsSection({
  notifications,
  setNotifications,
  onNavigate,
}: NotificationsSectionProps) {
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const unreadCount = notifications.filter((item) => !item.read).length

  const visibleNotifications = useMemo(() => {
    const search = query.trim().toLowerCase()
    return notifications
      .filter((item) => filter === 'All' || !item.read)
      .filter((item) => !search || `${item.title} ${item.detail} ${item.time}`.toLowerCase().includes(search))
      .slice()
      .sort((a, b) => Number(a.read) - Number(b.read))
  }, [notifications, filter, query])

  const markRead = (id: string, read: boolean) => {
    setNotifications((previous) => previous.map((item) => (item.id === id ? { ...item, read } : item)))
  }

  const markAllRead = () => {
    setNotifications((previous) => previous.map((item) => ({ ...item, read: true })))
  }

  const openNotification = (item: SupportNotification) => {
    markRead(item.id, true)
    onNavigate(item.target)
  }

  return (
    <section className="sa-panel support-notifications">
      <style>{`
        .support-notifications { display: grid; gap: 14px; min-width: 0; }
        .support-notifications-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .support-notifications-stat { display: grid; gap: 4px; padding: 14px 16px; border: 1px solid var(--sa-line); border-radius: 13px; background: #f8fafb; }
        .support-notifications-stat span { color: #64748b; font-size: 0.72rem; font-weight: 700; }
        .support-notifications-stat strong { color: var(--sa-text); font-size: 1.25rem; }
        .support-notifications-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .support-notifications-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .support-notifications-search { flex: 1 1 240px; max-width: 400px; }
        .support-notifications-list { display: grid; gap: 10px; }
        .support-notification { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 14px 16px; border: 1px solid var(--sa-line); border-radius: 13px; background: #fff; }
        .support-notification.unread { border-color: rgba(37,99,235,0.24); background: #f8faff; }
        .support-notification-dot { width: 10px; height: 10px; margin-top: 5px; border-radius: 50%; background: #3b82f6; }
        .support-notification-dot.red { background: #ef4444; }
        .support-notification-dot.amber { background: #f59e0b; }
        .support-notification-dot.green { background: #08a66c; }
        .support-notification-content { display: grid; gap: 5px; min-width: 0; }
        .support-notification-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .support-notification-title strong { color: var(--sa-text); font-size: 0.85rem; }
        .support-notification-tag { padding: 3px 8px; border-radius: 999px; background: #f1f5f9; color: #475569; font-size: 0.64rem; font-weight: 800; }
        .support-notification-detail { margin: 0; color: #64748b; font-size: 0.78rem; line-height: 1.5; }
        .support-notification-time { color: #94a3b8; font-size: 0.7rem; }
        .support-notification-actions { display: flex; align-items: center; gap: 6px; }
        .support-notifications-empty { margin: 0; padding: 28px 16px; border: 1px dashed var(--sa-line); border-radius: 13px; color: #64748b; font-size: 0.82rem; text-align: center; }
        @media (max-width: 680px) {
          .support-notifications-summary { grid-template-columns: 1fr; }
          .support-notification { grid-template-columns: auto minmax(0, 1fr); }
          .support-notification-actions { grid-column: 2; flex-wrap: wrap; }
          .support-notifications-search { flex-basis: 100%; max-width: none; }
        }
      `}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Notifications</h3>
          <span className="sa-panel-sub">Ticket updates, refunds and support escalations</span>
        </div>
        <button type="button" className="sa-btn-ghost" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all read
        </button>
      </div>

      <div className="support-notifications-summary">
        <div className="support-notifications-stat">
          <span>Unread</span>
          <strong>{unreadCount}</strong>
        </div>
        <div className="support-notifications-stat">
          <span>Total notifications</span>
          <strong>{notifications.length}</strong>
        </div>
      </div>

      <div className="support-notifications-controls">
        <div className="support-notifications-filters" aria-label="Filter notifications">
          {(['All', 'Unread'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`sa-chip ${filter === option ? 'active orange' : ''}`}
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
            >
              {option}{option === 'Unread' ? ` · ${unreadCount}` : ` · ${notifications.length}`}
            </button>
          ))}
        </div>
        <input
          className="sa-input support-notifications-search"
          aria-label="Search notifications"
          placeholder="Search notifications..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <span className="sa-toolbar-meta">
        Showing {visibleNotifications.length} notification{visibleNotifications.length === 1 ? '' : 's'}
      </span>

      {visibleNotifications.length === 0 ? (
        <p className="support-notifications-empty">
          {filter === 'Unread' && unreadCount === 0
            ? 'You’re all caught up. There are no unread notifications.'
            : 'No notifications match your search. Try another term or filter.'}
        </p>
      ) : (
        <div className="support-notifications-list">
          {visibleNotifications.map((item) => (
            <article key={item.id} className={`support-notification ${item.read ? 'read' : 'unread'}`}>
              <span className={`support-notification-dot ${item.tone}`} aria-hidden="true" />
              <div className="support-notification-content">
                <div className="support-notification-title">
                  <strong>{item.title}</strong>
                  <span className="support-notification-tag">{toneLabels[item.tone]}</span>
                  {!item.read && <span className="sa-pill blue">Unread</span>}
                </div>
                <p className="support-notification-detail">{item.detail}</p>
                <span className="support-notification-time">{item.time}</span>
              </div>
              <div className="support-notification-actions">
                <button type="button" className="sa-btn" onClick={() => openNotification(item)}>Open</button>
                <button type="button" className="sa-btn-ghost" onClick={() => markRead(item.id, !item.read)}>
                  {item.read ? 'Mark unread' : 'Mark read'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
