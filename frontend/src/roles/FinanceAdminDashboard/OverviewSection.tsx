import { ScopePill } from './shared'
import {
  activityFeed,
  financeAlerts,
  financeKpis,
  financeProfile,
  monthlySeries,
  scopeBreakdown,
  type SectionId,
} from './financeAdminData'

type AttentionKey = 'failedPayouts' | 'awaitingApproval' | 'mismatches' | 'flaggedRefunds'

type OverviewSectionProps = {
  onNavigate: (id: SectionId) => void
  attention: Record<AttentionKey, number>
}

const attentionCards: Array<{ key: AttentionKey; label: string; target: SectionId }> = [
  { key: 'failedPayouts', label: 'Failed payouts', target: 'payouts' },
  { key: 'awaitingApproval', label: 'Payouts awaiting approval', target: 'payouts' },
  { key: 'mismatches', label: 'Settlement mismatches', target: 'reconciliation' },
  { key: 'flaggedRefunds', label: 'Unusual refund volume', target: 'refunds' },
]

export default function OverviewSection({ onNavigate, attention }: OverviewSectionProps) {
  const maxRevenue = Math.max(...monthlySeries.map((point) => point.revenue)) * 1.12
  const maxCommission = Math.max(...monthlySeries.map((point) => point.commission)) * 1.12

  return (
    <>
      <div className="sa-kpi-grid">
        {financeKpis.map((kpi) => (
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
        {attentionCards.map((card) => (
          <button key={card.key} type="button" className="sa-attention-card" onClick={() => onNavigate(card.target)}>
            <span className="sa-attention-label">{card.label}</span>
            <span className="sa-attention-value">{String(attention[card.key]).padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      <div className="sa-analytics-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Revenue & commission</h3>
            <span className="sa-panel-sub">Last 6 months · ₹ lakhs</span>
          </div>
          <div className="sa-legend">
            <span>
              <i className="rev" /> Revenue
            </span>
            <span>
              <i className="bkg" /> Commission
            </span>
          </div>
          <div className="sa-bars">
            {monthlySeries.map((point) => (
              <div key={point.month} className="sa-bar-group">
                <span
                  className="sa-bar revenue"
                  title={`₹${point.revenue}L revenue`}
                  style={{ height: `${(point.revenue / maxRevenue) * 100}%` }}
                />
                <span
                  className="sa-bar bookings"
                  title={`₹${point.commission}L commission`}
                  style={{ height: `${(point.commission / maxCommission) * 100}%` }}
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
            <h3>Revenue share by scope</h3>
            <span className="sa-panel-sub">State, city and zone split</span>
          </div>
          <div className="sa-util-list">
            {scopeBreakdown.map((row) => (
              <div key={row.id} className="sa-util-row">
                <div className="sa-util-top">
                  <span>
                    {row.name} <span className="sa-cell-sub">{row.level}</span>
                  </span>
                  <span>{row.share}%</span>
                </div>
                <span className="sa-progress">
                  <span style={{ width: `${row.share}%` }} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Breakdown by state, city & zone</h3>
            <button type="button" className="sa-view-link" onClick={() => onNavigate('reports')}>
              Open reports
            </button>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Revenue</th>
                  <th>Commission</th>
                  <th>Payouts</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {scopeBreakdown.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">
                      {row.name}
                      <span className="sa-cell-sub">
                        <ScopePill value={row.level} /> {row.region}
                      </span>
                    </td>
                    <td className="sa-num">{row.revenue}</td>
                    <td className="sa-num">{row.commission}</td>
                    <td className="sa-num">{row.payouts}</td>
                    <td className="sa-num">{row.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Finance alerts</h3>
            <span className="sa-panel-sub">{financeAlerts.length} open</span>
          </div>
          <div className="sa-feed">
            {financeAlerts.map((item) => (
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
            <h3>Recent finance activity</h3>
            <span className="sa-panel-sub">{financeProfile.scopeLabel}</span>
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

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Control limits</h3>
            <span className="sa-panel-sub">Applied to this account</span>
          </div>
          <div className="sa-feed">
            <div className="sa-feed-item">
              <strong>Single-approver payout limit</strong>
              <span>{financeProfile.approvalLimit} · above this needs a second approver</span>
            </div>
            <div className="sa-feed-item">
              <strong>Commission caps</strong>
              <span>Set by the super admin and cities; edits are clamped to the cap.</span>
            </div>
            <div className="sa-feed-item">
              <strong>Refund authority</strong>
              <span>Finance approves refunds above the support admin cap.</span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
