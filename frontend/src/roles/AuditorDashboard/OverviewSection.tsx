import { ResultPill } from './shared'
import {
  auditorProfile,
  overviewHighlights,
  overviewStats,
  trendByCity,
  trendByRole,
  trendByState,
  type AuditEvent,
  type SectionId,
} from './auditorData'

type OverviewSectionProps = {
  events: AuditEvent[]
  period: string
  onNavigate: (id: SectionId) => void
}

const maxAllowed = (rows: Array<{ allowed: number }>) => Math.max(...rows.map((row) => row.allowed), 1)

function TrendTable({
  title,
  sub,
  rows,
  onNavigate,
}: {
  title: string
  sub: string
  rows: Array<{ label: string; allowed: number; denied: number; flagged: number }>
  onNavigate: (id: SectionId) => void
}) {
  const max = maxAllowed(rows)
  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>{title}</h3>
        <button type="button" className="sa-view-link" onClick={() => onNavigate('audit-log')}>
          Open log
        </button>
      </div>
      <div className="sa-table-wrap">
        <table className="sa-table">
          <thead>
            <tr>
              <th>{sub}</th>
              <th>Allowed</th>
              <th>Denied</th>
              <th>Flagged</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="sa-cell-strong">{row.label}</td>
                <td className="sa-num">{row.allowed.toLocaleString('en-IN')}</td>
                <td className="sa-num">{row.denied}</td>
                <td className="sa-num">{row.flagged}</td>
                <td>
                  <span className="sa-progress-cell">
                    <span className="sa-progress">
                      <span style={{ width: `${(row.allowed / max) * 100}%` }} />
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function OverviewSection({ events, period, onNavigate }: OverviewSectionProps) {
  const flagged = events.filter((event) => event.flagged)
  const denied = events.filter((event) => event.result === 'Denied')

  const kpis = [
    { label: 'Activity volume', value: overviewStats.activityVolume.toLocaleString('en-IN'), change: overviewStats.activityChange, tone: 'green', target: 'audit-log' as SectionId },
    { label: 'Denied actions', value: String(overviewStats.deniedActions), change: overviewStats.deniedChange, tone: 'purple', target: 'audit-log' as SectionId },
    { label: 'Alerts triggered', value: String(overviewStats.alertsTriggered), change: overviewStats.alertsChange, tone: 'orange', target: 'controls' as SectionId },
    { label: 'Sensitive actions', value: String(overviewStats.sensitiveActions), change: overviewStats.sensitiveChange, tone: 'blue', target: 'audit-log' as SectionId },
  ]

  return (
    <>
      <div className="sa-kpi-grid">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            className={`sa-kpi-card ${kpi.tone}`}
            onClick={() => onNavigate(kpi.target)}
          >
            <div className="sa-kpi-top">
              <span className="sa-kpi-label">{kpi.label}</span>
              <span className="sa-kpi-change">{kpi.change}</span>
            </div>
            <strong className="sa-kpi-value">{kpi.value}</strong>
            <span className="sa-kpi-desc">
              {auditorProfile.name} · {period}
            </span>
            <span className="sa-kpi-open">Open {kpi.target.replace('-', ' ')} →</span>
          </button>
        ))}
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Highlights</h3>
            <span className="sa-panel-sub">Role grants, overrides, large payouts, super admin activity</span>
          </div>
          <div className="sa-feed">
            {overviewHighlights.map((item) => (
              <button
                key={item.id}
                type="button"
                className="sa-feed-item"
                onClick={() => onNavigate(item.target)}
              >
                <strong>
                  {item.kind} <em>{item.actor}</em>
                </strong>
                <span>
                  {item.detail} · {item.time}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Needs review</h3>
            <span className="sa-panel-sub">{flagEventsCount(flagged, denied)} items raised from the log</span>
          </div>
          <div className="sa-feed">
            {flagged.slice(0, 6).map((event) => (
              <button key={event.id} type="button" className="sa-feed-item" onClick={() => onNavigate('audit-log')}>
                <strong>
                  {event.action} <em>{event.actor}</em>
                </strong>
                <span>
                  {event.target} · <ResultPill result={event.result} />
                </span>
              </button>
            ))}
            {denied.slice(0, 2).map((event) => (
              <button key={event.id} type="button" className="sa-feed-item" onClick={() => onNavigate('audit-log')}>
                <strong>
                  Denied: {event.action} <em>{event.actor}</em>
                </strong>
                <span>{event.target}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <TrendTable title="Trend by state" sub="State" rows={trendByState} onNavigate={onNavigate} />
      <TrendTable title="Trend by city" sub="City" rows={trendByCity} onNavigate={onNavigate} />
      <TrendTable title="Trend by role" sub="Role" rows={trendByRole} onNavigate={onNavigate} />

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Read-only scope</h3>
          <span className="sa-panel-sub">The auditor can view but never change business records</span>
        </div>
        <div className="sa-feed">
          <div className="sa-feed-item">
            <strong>
              Accounts, roles, scopes and approval limits <em>view only</em>
            </strong>
            <span>Access review uses the same records, without edit rights</span>
          </div>
          <div className="sa-feed-item">
            <strong>
              Rule, pricing and commission history <em>who changed what</em>
            </strong>
            <span>Global, state and city levels</span>
          </div>
          <div className="sa-feed-item">
            <strong>
              Settlements, payouts, refunds and reconciliation <em>view only</em>
            </strong>
            <span>Personal data masked until explicitly revealed</span>
          </div>
          <div className="sa-feed-item">
            <strong>
              Bookings, disputes, vehicles, drivers and compliance <em>view only</em>
            </strong>
            <span>Evidence for control and pattern checks</span>
          </div>
        </div>
      </section>
    </>
  )
}

function flagEventsCount(flagged: AuditEvent[], denied: AuditEvent[]) {
  return flagged.length + Math.min(denied.length, 2)
}
