import { ProgressCell, StatusPill } from './shared'
import {
  activityFeed,
  approvalTypeMeta,
  cityRows,
  monthlySeries,
  stateKpis,
  type ApprovalType,
  type SectionId,
} from './stateAdminData'

type OverviewSectionProps = {
  approvalCounts: Record<ApprovalType, number>
  onOpenApprovals: (type: 'All' | ApprovalType) => void
  onNavigate: (id: SectionId) => void
}

export default function OverviewSection({ approvalCounts, onOpenApprovals, onNavigate }: OverviewSectionProps) {
  const attentionCards: Array<{ type: ApprovalType; label: string }> = (
    Object.keys(approvalTypeMeta) as ApprovalType[]
  ).map((type) => ({ type, label: approvalTypeMeta[type].attention }))

  const maxRevenue = Math.max(...monthlySeries.map((point) => point.revenue)) * 1.12
  const maxBookings = Math.max(...monthlySeries.map((point) => point.bookings)) * 1.12

  return (
    <>
      <div className="sa-kpi-grid">
        {stateKpis.map((kpi) => (
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

      <div className="sa-attention">
        {attentionCards.map((card) => (
          <button key={card.type} type="button" className="sa-attention-card" onClick={() => onOpenApprovals(card.type)}>
            <span className="sa-attention-label">{card.label}</span>
            <span className="sa-attention-value">{String(approvalCounts[card.type]).padStart(2, '0')}</span>
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
            <h3>Fleet utilization</h3>
            <span className="sa-panel-sub">Top cities · this month</span>
          </div>
          <div className="sa-util-list">
            {cityRows
              .filter((city) => city.status === 'Active')
              .sort((a, b) => b.utilization - a.utilization)
              .slice(0, 6)
              .map((city) => (
                <div key={city.id} className="sa-util-row">
                  <div className="sa-util-top">
                    <span>{city.name}</span>
                    <span>{city.utilization}%</span>
                  </div>
                  <span className="sa-progress">
                    <span style={{ width: `${city.utilization}%` }} />
                  </span>
                </div>
              ))}
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>City performance</h3>
            <button type="button" className="sa-view-link" onClick={() => onNavigate('cities')}>
              View all cities
            </button>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Machines</th>
                  <th>Bookings</th>
                  <th>Utilization</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cityRows
                  .filter((city) => city.status === 'Active')
                  .slice(0, 5)
                  .map((city) => (
                    <tr key={city.id}>
                      <td className="sa-cell-strong">
                        {city.name}
                        <span className="sa-cell-sub">{city.code}</span>
                      </td>
                      <td className="sa-num">{city.machines}</td>
                      <td className="sa-num">{city.bookings}</td>
                      <td>
                        <ProgressCell value={city.utilization} />
                      </td>
                      <td className="sa-num">{city.revenue}</td>
                      <td>
                        <StatusPill status={city.status} />
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
            <span className="sa-panel-sub">Across the state</span>
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
