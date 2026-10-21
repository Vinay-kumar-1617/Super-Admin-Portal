import { PriorityPill, StatusPill } from './shared'
import {
  activityFeed,
  monthlyVolume,
  repeatUsers,
  supportAlerts,
  supportKpis,
  supportProfile,
  ticketsByType,
  type SectionId,
  type Ticket,
} from './supportAdminData'

type AlertKey = 'unassigned' | 'overdue' | 'breachingSoon' | 'repeat'

type OverviewSectionProps = {
  tickets: Ticket[]
  onNavigate: (id: SectionId) => void
}

export default function OverviewSection({ tickets, onNavigate }: OverviewSectionProps) {
  const unassigned = tickets.filter((item) => item.assignee === 'Unassigned').length
  const overdue = tickets.filter((item) => item.overdue).length
  const breachingSoon = tickets.filter((item) => item.breachingSoon).length

  const attention: Array<{ key: AlertKey; label: string; value: number; target: SectionId }> = [
    { key: 'unassigned', label: 'Unassigned tickets', value: unassigned, target: 'tickets' },
    { key: 'overdue', label: 'Overdue tickets', value: overdue, target: 'tickets' },
    { key: 'breachingSoon', label: 'About to breach', value: breachingSoon, target: 'tickets' },
    { key: 'repeat', label: 'Repeat complainers', value: repeatUsers.length, target: 'users' },
  ]

  const queue = tickets.filter((item) => item.assignee === 'Unassigned' || item.overdue)

  const maxCreated = Math.max(...monthlyVolume.map((point) => point.created)) * 1.12
  const maxResolved = Math.max(...monthlyVolume.map((point) => point.resolved)) * 1.12
  const maxType = Math.max(...ticketsByType.map((slice) => slice.count)) * 1.1

  return (
    <>
      <div className="sa-kpi-grid">
        {supportKpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            className={`sa-kpi-card ${kpi.tone}`}
            aria-label={`Open ${kpi.label.toLowerCase()}`}
            onClick={() => onNavigate(kpi.target)}
          >
            <div className="sa-kpi-top">
              <span className="sa-kpi-label">{kpi.label}</span>
              <span className="sa-kpi-change">{kpi.change}</span>
            </div>
            <strong className="sa-kpi-value">{kpi.value}</strong>
            <span className="sa-kpi-desc">{kpi.description}</span>
            <span className="sa-kpi-open">View {kpi.target} →</span>
          </button>
        ))}
      </div>

      <div className="sa-attention">
        {attention.map((card) => (
          <button key={card.key} type="button" className="sa-attention-card" onClick={() => onNavigate(card.target)}>
            <span className="sa-attention-label">{card.label}</span>
            <span className="sa-attention-value">{String(card.value).padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      <div className="sa-analytics-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Ticket volume</h3>
            <span className="sa-panel-sub">Last 6 months · created vs resolved</span>
          </div>
          <div className="sa-legend">
            <span>
              <i className="rev" /> Created
            </span>
            <span>
              <i className="bkg" /> Resolved
            </span>
          </div>
          <div className="sa-bars">
            {monthlyVolume.map((point) => (
              <div key={point.month} className="sa-bar-group">
                <span className="sa-bar revenue" title={`${point.created} created`} style={{ height: `${(point.created / maxCreated) * 100}%` }} />
                <span className="sa-bar bookings" title={`${point.resolved} resolved`} style={{ height: `${(point.resolved / maxResolved) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="sa-bar-labels">
            {monthlyVolume.map((point) => (
              <span key={point.month}>{point.month}</span>
            ))}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Tickets by type</h3>
            <span className="sa-panel-sub">This quarter · {supportProfile.city}</span>
          </div>
          <div className="sa-util-list">
            {ticketsByType.map((slice) => (
              <div key={slice.type} className="sa-util-row">
                <div className="sa-util-top">
                  <span>{slice.type}</span>
                  <span>{slice.count}</span>
                </div>
                <span className="sa-progress">
                  <span style={{ width: `${(slice.count / maxType) * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Unassigned & overdue queue</h3>
            <button type="button" className="sa-view-link" onClick={() => onNavigate('tickets')}>
              Open ticket desk
            </button>
          </div>
          {queue.length === 0 ? (
            <div className="sa-empty">
              <p>No unassigned or overdue tickets. The queue is clear.</p>
            </div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Requester</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Response</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="sa-cell-strong">
                        {ticket.id}
                        <span className="sa-cell-sub">{ticket.subject}</span>
                      </td>
                      <td>{ticket.requester}</td>
                      <td>
                        <PriorityPill priority={ticket.priority} />
                      </td>
                      <td className="sa-cell-sub">{ticket.assignee}</td>
                      <td className="sa-cell-sub">{ticket.responseTarget}</td>
                      <td>
                        <StatusPill status={ticket.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Support alerts</h3>
            <span className="sa-panel-sub">{supportAlerts.length} open</span>
          </div>
          <div className="sa-feed">
            {supportAlerts.map((item) => (
              <button key={item.id} type="button" className="sa-feed-item" onClick={() => onNavigate(item.target)}>
                <strong>
                  {item.title} <em>{item.severity}</em>
                </strong>
                <span>{item.detail}</span>
                <span>{item.time}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Repeated complaints</h3>
            <span className="sa-panel-sub">Same user, multiple tickets</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact (masked)</th>
                  <th>Tickets</th>
                  <th>Last issue</th>
                </tr>
              </thead>
              <tbody>
                {repeatUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="sa-cell-strong">{user.name}</td>
                    <td className="sa-num">{user.maskedPhone}</td>
                    <td className="sa-num">{user.tickets}</td>
                    <td className="sa-cell-sub">{user.lastIssue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Recent support activity</h3>
            <span className="sa-panel-sub">{supportProfile.city} only</span>
          </div>
          <div className="sa-feed">
            {activityFeed.map((item) => (
              <div key={item.id} className="sa-feed-item">
                <strong>
                  {item.actor} <em>{item.action}</em> {item.target}
                </strong>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
