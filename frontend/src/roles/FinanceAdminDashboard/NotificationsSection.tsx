import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import type { FinanceNotification, SectionId } from './financeAdminData'

type NotificationsSectionProps = {
  notifications: FinanceNotification[]
  setNotifications: Dispatch<SetStateAction<FinanceNotification[]>>
  onNavigate: (target: SectionId) => void
}

type Filter = 'All' | 'Unread'

const toneLabels: Record<FinanceNotification['tone'], string> = {
  red: 'Urgent',
  amber: 'Needs attention',
  blue: 'Finance update',
  green: 'Completed',
}

export default function NotificationsSection({
  notifications,
  setNotifications,
  onNavigate,
}: NotificationsSectionProps) {
  const [filter, setFilter] = useState<Filter>('All')
  const unreadCount = notifications.filter((item) => !item.read).length

  const visibleNotifications = useMemo(
    () =>
      notifications
        .filter((item) => filter === 'All' || !item.read)
        .slice()
        .sort((a, b) => Number(a.read) - Number(b.read)),
    [notifications, filter],
  )

  const markRead = (id: string, read: boolean) => {
    setNotifications((previous) => previous.map((item) => (item.id === id ? { ...item, read } : item)))
  }

  const markAllRead = () => {
    setNotifications((previous) => previous.map((item) => ({ ...item, read: true })))
  }

  const openNotification = (item: FinanceNotification) => {
    markRead(item.id, true)
    onNavigate(item.target)
  }

  return (
    <section className="sa-panel finance-panel">
      <style>{`
        .finance-notifications { display: grid; gap: 14px; min-width: 0; }
        .finance-notifications-summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .finance-notifications-stat { display: grid; gap: 4px; padding: 14px 16px; border: 1px solid var(--sa-line); border-radius: 13px; background: #f8fafb; }
        .finance-notifications-stat span { color: #64748b; font-size: 0.72rem; font-weight: 700; }
        .finance-notifications-stat strong { color: var(--sa-text); font-size: 1.25rem; }
        .finance-notifications-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .finance-notifications-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .finance-notifications-list { display: grid; gap: 10px; }
        .finance-notification { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 14px 16px; border: 1px solid var(--sa-line); border-radius: 13px; background: #fff; }
        .finance-notification.unread { border-color: rgba(37,99,235,0.24); background: #f8faff; }
        .finance-notification-dot { width: 10px; height: 10px; margin-top: 5px; border-radius: 50%; background: #3b82f6; }
        .finance-notification-dot.red { background: #ef4444; }
        .finance-notification-dot.amber { background: #f59e0b; }
        .finance-notification-dot.green { background: #08a66c; }
        .finance-notification-content { display: grid; gap: 5px; min-width: 0; }
        .finance-notification-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .finance-notification-title strong { color: var(--sa-text); font-size: 0.85rem; }
        .finance-notification-tag { padding: 3px 8px; border-radius: 999px; background: #f1f5f9; color: #475569; font-size: 0.64rem; font-weight: 800; }
        .finance-notification-detail { margin: 0; color: #64748b; font-size: 0.78rem; line-height: 1.5; }
        .finance-notification-time { color: #94a3b8; font-size: 0.7rem; }
        .finance-notification-actions { display: flex; align-items: center; gap: 6px; }
        .finance-notifications-empty { margin: 0; padding: 28px 16px; border: 1px dashed var(--sa-line); border-radius: 13px; color: #64748b; font-size: 0.82rem; text-align: center; }
        @media (max-width: 680px) {
          .finance-notifications-summary { grid-template-columns: 1fr; }
          .finance-notification { grid-template-columns: auto minmax(0, 1fr); }
          .finance-notification-actions { grid-column: 2; flex-wrap: wrap; }
        }
      `}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Notifications</h3>
          <span className="sa-panel-sub">Finance updates, approvals and reconciliation alerts</span>
        </div>
        <button type="button" className="sa-btn-ghost" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all read
        </button>
      </div>

      <div className="finance-notifications">
        <div className="finance-notifications-summary">
          <div className="finance-notifications-stat">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
          <div className="finance-notifications-stat">
            <span>Total notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="finance-notifications-toolbar">
          <div className="finance-notifications-filters" aria-label="Filter notifications">
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
          <span className="sa-toolbar-meta">
            Showing {visibleNotifications.length} notification{visibleNotifications.length === 1 ? '' : 's'}
          </span>
        </div>

        {visibleNotifications.length === 0 ? (
          <p className="finance-notifications-empty">You’re all caught up. There are no unread notifications.</p>
        ) : (
          <div className="finance-notifications-list">
            {visibleNotifications.map((item) => (
              <article key={item.id} className={`finance-notification ${item.read ? 'read' : 'unread'}`}>
                <span className={`finance-notification-dot ${item.tone}`} aria-hidden="true" />
                <div className="finance-notification-content">
                  <div className="finance-notification-title">
                    <strong>{item.title}</strong>
                    <span className="finance-notification-tag">{toneLabels[item.tone]}</span>
                    {!item.read && <span className="sa-pill blue">Unread</span>}
                  </div>
                  <p className="finance-notification-detail">{item.detail}</p>
                  <span className="finance-notification-time">{item.time}</span>
                </div>
                <div className="finance-notification-actions">
                  <button type="button" className="sa-btn" onClick={() => openNotification(item)}>Open</button>
                  <button type="button" className="sa-btn-ghost" onClick={() => markRead(item.id, !item.read)}>
                    {item.read ? 'Mark unread' : 'Mark read'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
