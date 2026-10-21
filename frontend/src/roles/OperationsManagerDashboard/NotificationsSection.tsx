import { useMemo, useState } from 'react'
import { StatCards, type StatCard } from '../CityAdminDashboard/shared'
import {
  notificationPreferences,
  opsNotifications,
  opsProfile,
  type OpsNotification,
  type OpsNotificationCategory,
  type OpsNotificationPriority,
} from './operationsData'

const priorityTone: Record<OpsNotificationPriority, string> = {
  Critical: 'red',
  High: 'amber',
  Normal: 'blue',
  Low: 'slate',
}

type Filter = 'All' | 'Unread' | OpsNotificationCategory

type NotificationsSectionProps = {
  onToast?: (message: string) => void
  onNavigate?: (target: string) => void
}

export default function NotificationsSection({ onToast, onNavigate }: NotificationsSectionProps) {
  const [items, setItems] = useState<OpsNotification[]>(opsNotifications)
  const [filter, setFilter] = useState<Filter>('All')

  const unread = items.filter((item) => !item.read).length

  const countBy = (category: OpsNotificationCategory) => items.filter((item) => item.category === category).length

  const cards: StatCard[] = [
    { key: 'Unread', label: 'Unread', value: unread, tone: 'brand', sub: `${items.length} total` },
    { key: 'Booking', label: 'Bookings', value: countBy('Booking'), tone: 'blue' },
    { key: 'Vehicle', label: 'Vehicles', value: countBy('Vehicle'), tone: 'purple' },
    { key: 'Maintenance', label: 'Maintenance', value: countBy('Maintenance'), tone: 'amber' },
    { key: 'Escalation', label: 'Escalations', value: countBy('Escalation'), tone: 'red' },
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

  const openItem = (item: OpsNotification) => {
    setRead(item.id, true)
    onNavigate?.(item.target)
  }

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Notifications</h3>
          <span className="sa-panel-sub">
            Alerts for bookings, vehicles, pickups, returns, deliveries, maintenance, incidents, deadlines, escalations and shift handovers · {opsProfile.zone} zone scope only
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
        {notificationPreferences.map((pref) => (
          <button
            key={pref.category}
            type="button"
            className={`sa-chip ${filter === pref.category ? 'active orange' : ''}`}
            onClick={() => setFilter(pref.category)}
          >
            {pref.category} · {countBy(pref.category)}
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
                  <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>
                    {item.zone} · {item.city}
                  </span>
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

      <p className="notif-empty" style={{ marginTop: 10, opacity: 0.6 }}>
        Data restricted to your assigned zone ({opsProfile.zone} · {opsProfile.city}). Cross-zone or unauthorized user data is not visible.
      </p>
    </section>
  )
}
