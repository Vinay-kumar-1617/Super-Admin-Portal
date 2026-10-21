import { StatusPill } from './shared'
import {
  opsAlerts,
  opsKpis,
  shiftSnapshot,
  supplyRows,
  type SectionId,
} from './operationsData'

type OverviewSectionProps = {
  onNavigate: (id: SectionId) => void
}

export default function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const maxDemand = Math.max(...supplyRows.map((row) => row.demand))

  return (
    <>
      <div className="sa-kpi-grid">
        {opsKpis.map((kpi) => (
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
        <button type="button" className="sa-attention-card" onClick={() => onNavigate('shift')}>
          <span className="sa-attention-label">Open jobs</span>
          <span className="sa-attention-value">{shiftSnapshot.open}</span>
        </button>
        <button type="button" className="sa-attention-card" onClick={() => onNavigate('dispatch')}>
          <span className="sa-attention-label">In progress</span>
          <span className="sa-attention-value">{shiftSnapshot.inProgress}</span>
        </button>
        <button type="button" className="sa-attention-card" onClick={() => onNavigate('dispatch')}>
          <span className="sa-attention-label">At risk</span>
          <span className="sa-attention-value">{shiftSnapshot.atRisk}</span>
        </button>
      </div>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Alerts</h3>
          <span className="sa-panel-sub">Unassigned jobs · delays · shortages · cancellations</span>
        </div>
        <div className="sa-approval-list">
          {opsAlerts.map((alert) => (
            <button key={alert.id} type="button" className="sa-approval-item ops-alert-btn" onClick={() => onNavigate(alert.target)}>
              <div className="sa-approval-copy">
                <div className="sa-approval-tags">
                  <StatusPill status={alert.severity} />
                  <span className="sa-approval-meta">{alert.time}</span>
                </div>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
              </div>
              <div className="sa-approval-actions">
                <span className="sa-approval-meta">Open →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Supply & demand by zone</h3>
          <span className="sa-panel-sub">Machines ready now vs open jobs · all {supplyRows.length} zones</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>City / zone</th>
                <th>Supply</th>
                <th>Demand</th>
                <th>Operators on shift</th>
                <th>Response</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {supplyRows.map((row) => (
                <tr key={row.id}>
                  <td className="sa-cell-strong">
                    {row.zone}
                    <span className="sa-cell-sub">{row.city}</span>
                  </td>
                  <td className="sa-num">{row.supply}</td>
                  <td className="sa-num">
                    <span className="sa-progress-cell">
                      <span className="sa-progress">
                        <span style={{ width: `${(row.demand / maxDemand) * 100}%` }} />
                      </span>
                      <span>{row.demand}</span>
                    </span>
                  </td>
                  <td className="sa-num">{row.operatorsOnShift}</td>
                  <td className="sa-num">{row.response} min</td>
                  <td>
                    <StatusPill status={row.balance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
