import { ProgressCell, StatusPill } from './shared'
import {
  activityFeed,
  hierarchy,
  localityRows,
  monthlySeries,
  requestTypeMeta,
  zoneKpis,
  zoneProfile,
  type RequestType,
  type SectionId,
} from './zoneAdminData'

type OverviewSectionProps = {
  requestCounts: Record<RequestType, number>
  onOpenRequests: (type: 'All' | RequestType) => void
  onNavigate: (id: SectionId) => void
}

export default function OverviewSection({ requestCounts, onOpenRequests, onNavigate }: OverviewSectionProps) {
  const attentionCards = (Object.keys(requestTypeMeta) as RequestType[]).map((type) => ({
    type,
    label: requestTypeMeta[type].attention,
  }))

  const maxRevenue = Math.max(...monthlySeries.map((point) => point.revenue)) * 1.12
  const maxBookings = Math.max(...monthlySeries.map((point) => point.bookings)) * 1.12

  return (
    <>
      <div className="sa-kpi-grid">
        {zoneKpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            className={`sa-kpi-card ${kpi.tone}`}
            aria-label={`Open ${kpi.label.toLowerCase()} report`}
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

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>State → city → zone</h3>
          <span className="sa-panel-sub">Where {zoneProfile.name} sits inside {zoneProfile.city}, {zoneProfile.state}</span>
        </div>
        <div className="za-hierarchy">
          {hierarchy.map((level) => (
            <div key={level.level} className="za-hier-card">
              <span className="za-hier-level">{level.level}</span>
              <strong className="za-hier-name">{level.name}</strong>
              {level.metrics.map((metric) => (
                <span key={metric} className="za-hier-metric">
                  {metric}
                </span>
              ))}
              <span className="za-hier-role">{level.role}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="sa-attention">
        {attentionCards.map((card) => (
          <button key={card.type} type="button" className="sa-attention-card" onClick={() => onOpenRequests(card.type)}>
            <span className="sa-attention-label">{card.label}</span>
            <span className="sa-attention-value">{String(requestCounts[card.type]).padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      <div className="sa-analytics-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Revenue & bookings</h3>
            <span className="sa-panel-sub">Last 6 months · ₹ lakhs</span>
          </div>
          <div className="sa-legend">
            <span>
              <i className="rev" /> Revenue
            </span>
            <span>
              <i className="bkg" /> Bookings
            </span>
          </div>
          <div className="sa-bars">
            {monthlySeries.map((point) => (
              <div key={point.month} className="sa-bar-group">
                <span
                  className="sa-bar revenue"
                  title={`₹${point.revenue}L`}
                  style={{ height: `${(point.revenue / maxRevenue) * 100}%` }}
                />
                <span
                  className="sa-bar bookings"
                  title={`${point.bookings} bookings`}
                  style={{ height: `${(point.bookings / maxBookings) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="sa-bar-labels">
            {monthlySeries.map((point) => (
              <span key={point.month}>{point.month}</span>
            ))}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Locality utilization</h3>
            <span className="sa-panel-sub">All six localities · this month</span>
          </div>
          <div className="sa-util-list">
            {[...localityRows]
              .sort((a, b) => b.utilization - a.utilization)
              .map((locality) => (
                <div key={locality.id} className="sa-util-row">
                  <div className="sa-util-top">
                    <span>{locality.name}</span>
                    <span>{locality.utilization}%</span>
                  </div>
                  <span className="sa-progress">
                    <span style={{ width: `${locality.utilization}%` }} />
                  </span>
                </div>
              ))}
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Locality performance</h3>
            <button type="button" className="sa-view-link" onClick={() => onNavigate('localities')}>
              View all localities
            </button>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Locality</th>
                  <th>Machines</th>
                  <th>Operators</th>
                  <th>Open jobs</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {localityRows.slice(0, 5).map((locality) => (
                  <tr key={locality.id}>
                    <td className="sa-cell-strong">{locality.name}</td>
                    <td className="sa-num">{locality.machines}</td>
                    <td className="sa-num">{locality.operators}</td>
                    <td className="sa-num">{locality.openJobs}</td>
                    <td>
                      <ProgressCell value={locality.utilization} />
                    </td>
                    <td>
                      <StatusPill status={locality.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Recent activity</h3>
            <span className="sa-panel-sub">{zoneProfile.name} and city desk</span>
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
