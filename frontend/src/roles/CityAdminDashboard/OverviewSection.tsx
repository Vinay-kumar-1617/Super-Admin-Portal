import { ProgressCell, StatusPill } from './shared'
import {
  activityFeed,
  approvalTypeMeta,
  cityKpis,
  cityProfile,
  monthlySeries,
  zoneRows,
  type ApprovalType,
  type SectionId,
} from './cityAdminData'

type OverviewSectionProps = {
  approvalCounts: Record<ApprovalType, number>
  onOpenApprovals: (type: 'All' | ApprovalType) => void
  onNavigate: (id: SectionId) => void
}

export default function OverviewSection({ approvalCounts, onOpenApprovals, onNavigate }: OverviewSectionProps) {
  const attentionCards = (Object.keys(approvalTypeMeta) as ApprovalType[]).map((type) => ({
    type,
    label: approvalTypeMeta[type].attention,
  }))

  const maxRevenue = Math.max(...monthlySeries.map((point) => point.revenue)) * 1.12
  const maxBookings = Math.max(...monthlySeries.map((point) => point.bookings)) * 1.12

  return (
    <>
      <div className="sa-kpi-grid">
        {cityKpis.map((kpi) => (
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
            <h3>Zone utilization</h3>
            <span className="sa-panel-sub">All six zones · this month</span>
          </div>
          <div className="sa-util-list">
            {[...zoneRows]
              .sort((a, b) => b.utilization - a.utilization)
              .map((zone) => (
                <div key={zone.id} className="sa-util-row">
                  <div className="sa-util-top">
                    <span>{zone.name}</span>
                    <span>{zone.utilization}%</span>
                  </div>
                  <span className="sa-progress">
                    <span style={{ width: `${zone.utilization}%` }} />
                  </span>
                </div>
              ))}
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Zone performance</h3>
            <button type="button" className="sa-view-link" onClick={() => onNavigate('zones')}>
              View all zones
            </button>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Machines</th>
                  <th>Operators</th>
                  <th>Open jobs</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {zoneRows.slice(0, 5).map((zone) => (
                  <tr key={zone.id}>
                    <td className="sa-cell-strong">
                      {zone.name}
                      <span className="sa-cell-sub">{zone.area}</span>
                    </td>
                    <td className="sa-num">{zone.machines}</td>
                    <td className="sa-num">{zone.operators}</td>
                    <td className="sa-num">{zone.openJobs}</td>
                    <td>
                      <ProgressCell value={zone.utilization} />
                    </td>
                    <td>
                      <StatusPill status={zone.status} />
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
            <span className="sa-panel-sub">{cityProfile.name} only</span>
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
