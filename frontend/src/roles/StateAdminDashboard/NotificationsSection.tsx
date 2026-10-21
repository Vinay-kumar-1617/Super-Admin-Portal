import { useMemo, useState } from 'react'
import { StatCards, type StatCard } from './shared'
import {
  stateNotificationFeed,
  notificationCategories,
  type StateNotificationFeedItem,
  type NotificationCategory,
  type NotificationPriority,
} from './stateNotificationsData'

const priorityTone: Record<NotificationPriority, string> = {
  Critical: 'red',
  High: 'amber',
  Normal: 'blue',
  Low: 'slate',
}

type Filter = 'All' | 'Unread' | NotificationCategory

type NotificationsSectionProps = {
  onToast?: (message: string) => void
  onNavigate?: (target: string) => void
}

export default function NotificationsSection({ onToast, onNavigate }: NotificationsSectionProps) {
  const [items, setItems] = useState<StateNotificationFeedItem[]>(stateNotificationFeed)
  const [filter, setFilter] = useState<Filter>('All')

  const unread = items.filter((item) => !item.read).length

  const countBy = (category: NotificationCategory) => items.filter((item) => item.category === category).length

  const cards: StatCard[] = [
    { key: 'Unread', label: 'Unread', value: unread, tone: 'brand', sub: `${items.length} total` },
    { key: 'Approvals', label: 'Pending approvals', value: countBy('Approvals'), tone: 'amber' },
    { key: 'Tasks', label: 'Overdue tasks', value: countBy('Tasks'), tone: 'red' },
    { key: 'Payments', label: 'Payment alerts', value: countBy('Payments'), tone: 'blue' },
    { key: 'Security', label: 'Security alerts', value: countBy('Security'), tone: 'purple' },
  ]

  const visible = useMemo(
    () =>
      items
        .filter((item) =>
          filter === 'All' ? true : filter === 'Unread' ? !item.read : item.category === filter,
        )
        .slice()
        .sort((a, b) => Number(a.read) - Number(b.read)),
    [items, filter],
  )

  const setRead = (id: string, read: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read } : item)))
  }

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })))
    onToast?.('All notifications marked as read')
  }

  const openItem = (item: StateNotificationFeedItem) => {
    setRead(item.id, true)
    onNavigate?.(item.target)
  }

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Notifications</h3>
          <span className="sa-panel-sub">
            Pending approvals, overdue tasks, failed payments, escalations, security alerts and system announcements
          </span>
        </div>
        <div className="finance-header-controls">
          <button type="button" className="sa-btn-ghost" onClick={markAllRead} disabled={unread === 0}>
            Mark all read
          </button>
        </div>
      </div>

      <StatCards
        cards={cards}
        activeKey={filter === 'All' ? undefined : filter}
        onSelect={(key) => setFilter((prev) => (prev === key ? 'All' : (key as Filter)))}
      />

      <div className="sa-chip-row finance-tabs">
        <button
          type="button"
          className={`sa-chip ${filter === 'All' ? 'active orange' : ''}`}
          onClick={() => setFilter('All')}
        >
          All
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
            {category} · {countBy(category)}
          </button>
        ))}
      </div>

      <div className="notif-toolbar">
        <span className="notif-toolbar-meta">
          {visible.length} notification{visible.length === 1 ? '' : 's'}
          {filter === 'All' ? '' : ` in ${filter}`} · {unread} unread
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="notif-empty">Nothing here. You are all caught up.</p>
      ) : (
        <div className="notif-list">
          {visible.map((item) => (
            <article key={item.id} className={`notif-card ${item.read ? 'read' : 'unread'}`}>
              <span className={`notif-dot ${item.tone}`} aria-hidden="true" />
              <div className="notif-body">
                <div className="notif-title">
                  <strong>{item.title}</strong>
                  <span className="sa-pill slate">{item.category}</span>
                  <span className={`sa-pill ${priorityTone[item.priority]}`}>{item.priority}</span>
                </div>
                <p className="notif-detail">{item.detail}</p>
                <div className="notif-meta">
                  <span>{item.time}</span>
                  {!item.read && <span className="sa-pill blue">Unread</span>}
                </div>
              </div>
              <div className="notif-actions">
                <button type="button" className="sa-btn" onClick={() => openItem(item)}>
                  Open
                </button>
                <button
                  type="button"
                  className="sa-btn-ghost"
                  onClick={() => setRead(item.id, !item.read)}
                >
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
