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

      <section className="ca-action-section">
        <style>{`
          .ca-action-section { display: grid; gap: 10px; }
          .ca-action-header { display: flex; align-items: baseline; justify-content: space-between; }
          .ca-action-title { margin: 0; font-size: 1rem; font-weight: 800; letter-spacing: -0.02em; }
          .ca-action-sub { font-size: 0.76rem; color: var(--sa-muted, #8a96a6); }
          .ca-action-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
          .ca-action-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            border: 1px solid var(--sa-line, rgba(15,23,42,0.08));
            background: var(--sa-card-bg, #fff);
            border-radius: 14px;
            padding: 14px 16px;
            box-shadow: 0 10px 24px rgba(15,23,42,0.04);
            text-align: left;
            font: inherit;
            cursor: pointer;
            transition: all 0.18s ease;
          }
          .ca-action-card:hover {
            border-color: rgba(255,107,44,0.4);
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(15,23,42,0.06);
          }
          .ca-action-left { display: grid; gap: 2px; }
          .ca-action-label { font-size: 0.9rem; font-weight: 700; }
          .ca-action-meta { font-size: 0.74rem; color: var(--sa-muted, #8a96a6); }
          .ca-action-count {
            min-width: 36px;
            height: 36px;
            border-radius: 999px;
            display: grid;
            place-items: center;
            background: rgba(255,107,44,0.12);
            color: var(--sa-brand-deep, #ef4a12);
            font-weight: 800;
            font-size: 0.9rem;
          }
          @media (max-width: 1100px) { .ca-action-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        `}</style>
        <div className="ca-action-header">
          <h2 className="ca-action-title">Action required</h2>
          <span className="ca-action-sub">Pending approvals in {cityProfile.name}</span>
        </div>
        <div className="ca-action-grid">
          {attentionCards.map((card) => {
            const count = approvalCounts[card.type]
            return (
              <button key={card.type} type="button" className="ca-action-card" onClick={() => onOpenApprovals(card.type)}>
                <div className="ca-action-left">
                  <span className="ca-action-label">{card.label}</span>
                  <span className="ca-action-meta">Review and take action</span>
                </div>
                <span className="ca-action-count">{count}</span>
              </button>
            )
          })}
        </div>
      </section>

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
