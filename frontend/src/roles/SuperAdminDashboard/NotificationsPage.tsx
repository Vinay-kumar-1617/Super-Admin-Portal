import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import {
  notificationCategories,
  type DashboardNotification,
  type NotificationCategory,
  type NotificationPriority,
} from './headerFeedData'

type NotificationsPageProps = {
  notifications: DashboardNotification[]
  setNotifications: Dispatch<SetStateAction<DashboardNotification[]>>
  onNavigate?: (target?: string) => void
  onBack: () => void
}

type Filter = 'All' | 'Unread' | NotificationCategory

const priorityClass: Record<NotificationPriority, string> = {
  Critical: 'red',
  High: 'amber',
  Normal: 'blue',
  Low: 'slate',
}

const categoryClass: Record<NotificationCategory, string> = {
  Approvals: 'amber',
  Tasks: 'purple',
  Payments: 'blue',
  Escalations: 'red',
  Security: 'red',
  Announcements: 'green',
}

export default function NotificationsPage({ notifications, setNotifications, onNavigate, onBack }: NotificationsPageProps) {
  const [filter, setFilter] = useState<Filter>('All')

  const unread = notifications.filter((item) => !item.read).length

  const countBy = (category: NotificationCategory) => notifications.filter((item) => item.category === category).length

  const visible = useMemo(
    () =>
      notifications
        .filter((item) => (filter === 'All' ? true : filter === 'Unread' ? !item.read : item.category === filter))
        .slice()
        .sort((a, b) => Number(a.read) - Number(b.read)),
    [notifications, filter],
  )

  const setRead = (id: string, read: boolean) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read } : item)))
  }

  const markAllRead = () => setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))

  const openItem = (item: DashboardNotification) => {
    setRead(item.id, true)
    onNavigate?.(item.target)
  }

  const cards = [
    { key: 'Unread', label: 'Unread', value: unread, sub: `${notifications.length} total`, accent: 'accent-blue' },
    { key: 'Approvals', label: 'Pending approvals', value: countBy('Approvals'), sub: 'KYC, payouts, areas', accent: 'accent-amber' },
    { key: 'Payments', label: 'Payment alerts', value: countBy('Payments'), sub: 'Payouts & failures', accent: 'accent-purple' },
    { key: 'Security', label: 'Security alerts', value: countBy('Security'), sub: 'Logins & changes', accent: 'accent-red' },
  ]

  return (
    <section className="notifpage">
      <style>{`
        .notifpage { display: grid; gap: 18px; }

        .kpi-detail-back {
          border: none;
          background: none;
          padding: 0;
          margin-bottom: 4px;
          color: var(--brand-orange);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
        }

        .kpi-detail-back:hover { color: #c94310; text-decoration: underline; }

        .notifpage-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .notifpage-summary-card {
          display: grid;
          gap: 3px;
          text-align: left;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 18px;
          background: linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
          padding: 14px 16px;
          cursor: pointer;
          font: inherit;
          color: inherit;
          transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }

        .notifpage-summary-card:hover { transform: translateY(-1px); box-shadow: 0 14px 30px -20px rgba(15, 23, 42, 0.5); }
        .notifpage-summary-card.is-active { border-color: rgba(37, 99, 235, 0.5); background: rgba(37, 99, 235, 0.05); }

        .notifpage-summary-card .label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #667085; }
        .notifpage-summary-card .value { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.04em; color: #0f172a; }
        .notifpage-summary-card .sub { font-size: 0.72rem; color: #667085; }
        .notifpage-summary-card.accent-blue .value { color: #2563eb; }
        .notifpage-summary-card.accent-amber .value { color: #d97706; }
        .notifpage-summary-card.accent-purple .value { color: #7c3aed; }
        .notifpage-summary-card.accent-red .value { color: #dc2626; }

        .notifpage-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px; border-bottom: 1px solid rgba(15, 23, 42, 0.06); flex-wrap: wrap; }
        .notifpage-toolbar-meta { font-size: 0.76rem; color: #667085; }

        .notifpage-list { display: grid; gap: 10px; padding: 14px 18px 18px; }

        .notifpage-card {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: start;
          gap: 12px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 16px;
          padding: 14px 16px;
          background: #ffffff;
        }

        .notifpage-card.unread { background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%); border-color: rgba(37, 99, 235, 0.28); }
        .notifpage-card.read { background: #fbfcfd; }

        .notifpage-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 7px; background: #94a3b8; flex: none; }
        .notifpage-dot.red { background: #ef4444; }
        .notifpage-dot.amber { background: #f59e0b; }
        .notifpage-dot.green { background: #10b981; }
        .notifpage-dot.blue { background: #3b82f6; }

        .notifpage-body { display: grid; gap: 6px; min-width: 0; }

        .notifpage-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .notifpage-title strong { font-size: 0.88rem; letter-spacing: -0.02em; }

        .notifpage-pill { border-radius: 999px; padding: 3px 9px; font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
        .notifpage-pill.amber { background: rgba(217, 119, 6, 0.12); color: #b45309; }
        .notifpage-pill.red { background: rgba(220, 38, 38, 0.12); color: #b91c1c; }
        .notifpage-pill.blue { background: rgba(37, 99, 235, 0.12); color: #1d4ed8; }
        .notifpage-pill.green { background: rgba(8, 166, 108, 0.14); color: #067a54; }
        .notifpage-pill.purple { background: rgba(124, 58, 237, 0.12); color: #6d28d9; }
        .notifpage-pill.slate { background: rgba(100, 116, 139, 0.14); color: #475569; }

        .notifpage-detail { margin: 0; font-size: 0.79rem; line-height: 1.5; color: #475569; }

        .notifpage-meta { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: #667085; flex-wrap: wrap; }

        .notifpage-actions { display: flex; flex-direction: column; gap: 6px; align-items: stretch; }

        .notifpage-btn {
          border: 1px solid rgba(15, 23, 42, 0.14);
          border-radius: 10px;
          background: #ffffff;
          padding: 7px 14px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          color: #0f172a;
          white-space: nowrap;
        }

        .notifpage-btn:hover { border-color: rgba(37, 99, 235, 0.5); color: #1d4ed8; }
        .notifpage-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .notifpage-btn.ghost { border-color: transparent; color: #667085; }
        .notifpage-btn.ghost:hover { border-color: rgba(15, 23, 42, 0.14); color: #0f172a; }

        .notifpage-empty { margin: 0; padding: 18px; text-align: center; font-size: 0.8rem; color: #667085; }

        @media (max-width: 980px) {
          .notifpage-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .notifpage-card { grid-template-columns: auto minmax(0, 1fr); }
          .notifpage-actions { grid-column: 2; flex-direction: row; }
        }
      `}</style>

      <header className="dashboard-header">
        <div>
          <button type="button" className="kpi-detail-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Dashboard overview
          </button>
          
          <h1 className="header-title">Notifications</h1>
          
        </div>
        <span className="chip active">{unread} unread · {notifications.length} total</span>
      </header>

      <section className="notifpage-summary" aria-label="Notification summary">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            className={`notifpage-summary-card ${card.accent} ${filter === card.key ? 'is-active' : ''}`}
            onClick={() => setFilter((prev) => (prev === card.key ? 'All' : (card.key as Filter)))}
          >
            <span className="label">{card.label}</span>
            <span className="value">{card.value}</span>
            <span className="sub">{card.sub}</span>
          </button>
        ))}
      </section>

      <section className="panel" aria-labelledby="notifpage-title">
        <div className="panel-header">
          <div>
            <h3 id="notifpage-title">Notification feed</h3>
            
          </div>
          <button type="button" className="notifpage-btn" onClick={markAllRead} disabled={unread === 0}>
            Mark all read
          </button>
        </div>

        <div className="notifpage-toolbar">
          <div className="chip-row">
            <button
              type="button"
              className={`chip ${filter === 'All' ? 'active' : ''}`}
              onClick={() => setFilter('All')}
            >
              All · {notifications.length}
            </button>
            <button
              type="button"
              className={`chip ${filter === 'Unread' ? 'active' : ''}`}
              onClick={() => setFilter('Unread')}
            >
              Unread · {unread}
            </button>
            {notificationCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`chip ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {category} · {countBy(category)}
              </button>
            ))}
          </div>
          <span className="notifpage-toolbar-meta">
            {visible.length} shown{filter === 'All' ? '' : ` in ${filter}`}
          </span>
        </div>

        {visible.length === 0 ? (
          <p className="notifpage-empty">Nothing here. You are all caught up.</p>
        ) : (
          <div className="notifpage-list">
            {visible.map((item) => (
              <article key={item.id} className={`notifpage-card ${item.read ? 'read' : 'unread'}`}>
                <span className={`notifpage-dot ${item.tone}`} aria-hidden="true" />
                <div className="notifpage-body">
                  <div className="notifpage-title">
                    <strong>{item.title}</strong>
                    <span className={`notifpage-pill ${categoryClass[item.category]}`}>{item.category}</span>
                    <span className={`notifpage-pill ${priorityClass[item.priority]}`}>{item.priority}</span>
                  </div>
                  <p className="notifpage-detail">{item.detail}</p>
                  <div className="notifpage-meta">
                    <span>{item.time}</span>
                    {!item.read && <span className="notifpage-pill blue">Unread</span>}
                  </div>
                </div>
                <div className="notifpage-actions">
                  <button type="button" className="notifpage-btn" onClick={() => openItem(item)}>
                    Open
                  </button>
                  <button
                    type="button"
                    className="notifpage-btn ghost"
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
    </section>
  )
}
