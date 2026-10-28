import { PriorityPill, StatusPill } from './shared'
import { sortJobsByUrgency } from './dispatcherUtils'
import {
  dispatcherAlerts,
  dispatcherKpis,
  type DispatcherOperator,
  type DispatchJob,
  type SectionId,
} from './dispatcherData'

type OverviewSectionProps = {
  jobs: DispatchJob[]
  operators: DispatcherOperator[]
  onNavigate: (id: SectionId) => void
}

export default function OverviewSection({ jobs, operators, onNavigate }: OverviewSectionProps) {
  const unassigned = jobs.filter((job) => job.status === 'Unassigned')
  const inProgress = jobs.filter((job) => job.status === 'In Progress').length
  const available = operators.filter((operator) => operator.status === 'Available').length
  const queue = sortJobsByUrgency(unassigned).slice(0, 5)
  const overTarget = unassigned.filter((job) => job.waiting > job.sla).length
  const slaTarget = jobs[0]?.sla ?? 30

  return (
    <>
      <style>{`
        .disp-overview { display: grid; gap: 16px; min-width: 0; }
        .disp-section-heading { margin: 0; color: var(--sa-text, #182230); font-size: 1rem; font-weight: 800; letter-spacing: -0.025em; }
        .disp-kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        .disp-kpi-card {
          background: var(--sa-card-bg, #ffffff);
          border: 1px solid var(--sa-line, rgba(15, 23, 42, 0.08));
          border-radius: 18px;
          padding: 18px 20px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
          display: grid;
          gap: 10px;
          width: 100%;
          font: inherit;
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .disp-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
          border-color: rgba(255, 107, 44, 0.45);
        }
        .disp-kpi-card:focus-visible {
          outline: 3px solid rgba(255, 107, 44, 0.45);
          outline-offset: 3px;
        }
        .disp-kpi-card.green { border-color: rgba(8, 166, 108, 0.18); }
        .disp-kpi-card.blue { border-color: rgba(37, 99, 235, 0.18); }
        .disp-kpi-card.purple { border-color: rgba(124, 58, 237, 0.18); }
        .disp-kpi-card.orange { border-color: rgba(245, 158, 11, 0.18); }
        .disp-kpi-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .disp-kpi-label { color: var(--sa-muted, #8a96a6); font-size: 0.8rem; font-weight: 600; }
        .disp-kpi-change {
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 0.7rem;
          font-weight: 800;
          background: rgba(8, 166, 108, 0.12);
          color: #08a66c;
        }
        .disp-kpi-value { font-size: clamp(1.8rem, 2.4vw, 2.4rem); letter-spacing: -0.06em; font-weight: 800; }
        .disp-kpi-desc { font-size: 0.74rem; color: var(--sa-muted, #8a96a6); line-height: 1.5; }
        .disp-kpi-open { font-size: 0.72rem; font-weight: 800; color: var(--sa-brand-deep, #ef4a12); }
        .disp-kpi-card:hover .disp-kpi-open { text-decoration: underline; }
        .disp-attention { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .disp-attention-card {
          border: 1px solid var(--sa-line, rgba(15, 23, 42, 0.08));
          background: var(--sa-card-bg, #ffffff);
          border-radius: 18px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font: inherit;
          color: inherit;
          text-align: left;
          cursor: pointer;
          min-width: 0;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .disp-attention-card:hover {
          border-color: rgba(255, 107, 44, 0.45);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
        }
        .disp-attention-label {
          color: var(--sa-muted, #8a96a6);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .disp-attention-value { font-size: 2.1rem; letter-spacing: -0.06em; font-weight: 800; line-height: 1; }
        .disp-panel {
          background: var(--sa-card-bg, #ffffff);
          border: 1px solid var(--sa-line, rgba(15, 23, 42, 0.08));
          border-radius: 22px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
          overflow: hidden;
          min-width: 0;
        }
        .disp-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }
        .disp-panel-header h3 { margin: 0; font-size: 1.08rem; letter-spacing: -0.04em; font-weight: 800; }
        .disp-panel-sub { font-size: 0.76rem; color: var(--sa-muted, #8a96a6); font-weight: 600; }
        .disp-panel-actions { display: flex; align-items: center; gap: 10px; }
        .disp-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.72rem;
          font-weight: 800;
          background: rgba(15, 23, 42, 0.04);
          color: var(--sa-muted, #8a96a6);
        }
        .disp-alert-list { display: grid; }
        .disp-alert-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          width: 100%;
          padding: 16px 24px;
          border: 0;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          background: transparent;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 0.18s ease;
        }
        .disp-alert-item:hover { background: rgba(248, 250, 252, 0.9); }
        .disp-alert-item:last-child { border-bottom: 0; }
        .disp-alert-main { display: grid; gap: 6px; }
        .disp-alert-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .disp-alert-title { font-size: 0.98rem; font-weight: 700; letter-spacing: -0.02em; }
        .disp-alert-detail { font-size: 0.84rem; color: var(--sa-muted, #475569); line-height: 1.6; }
        .disp-alert-meta { font-size: 0.74rem; color: var(--sa-muted, #8a96a6); font-weight: 600; }
        .disp-alert-cta { font-size: 0.8rem; font-weight: 800; color: var(--sa-brand-deep, #ef4a12); }
        .disp-table-wrap { overflow-x: auto; }
        .disp-table { width: 100%; border-collapse: collapse; min-width: 880px; }
        .disp-table thead th {
          text-align: left;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--sa-muted, #8a96a6);
          font-weight: 800;
          padding: 12px 24px;
          background: linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0) 100%);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }
        .disp-table tbody td {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.05);
          font-size: 0.9rem;
          vertical-align: middle;
        }
        .disp-table tbody tr:hover { background: rgba(248, 250, 252, 0.7); }
        .disp-table tbody tr:last-child td { border-bottom: 0; }
        .disp-cell-strong { font-weight: 700; letter-spacing: -0.01em; }
        .disp-cell-sub { display: block; margin-top: 2px; font-size: 0.76rem; color: var(--sa-muted, #8a96a6); font-weight: 600; }
        .disp-num { text-align: right; font-variant-numeric: tabular-nums; }
        .disp-table thead th.disp-num { text-align: right; }
        .disp-wait { font-variant-numeric: tabular-nums; font-weight: 700; }
        .disp-wait.over { color: #b91c1c; }
        .disp-assign {
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: transparent;
          border-radius: 999px;
          padding: 8px 14px;
          font: inherit;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--sa-text, #182230);
          cursor: pointer;
          transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
        }
        .disp-assign:hover {
          border-color: rgba(255, 107, 44, 0.6);
          color: var(--sa-brand-deep, #ef4a12);
          background: rgba(255, 107, 44, 0.06);
        }
        .disp-empty {
          padding: 28px 24px;
          text-align: center;
          display: grid;
          gap: 6px;
        }
        .disp-empty strong { font-size: 0.98rem; }
        .disp-empty span { font-size: 0.84rem; color: var(--sa-muted, #8a96a6); }
        @media (max-width: 1280px) {
          .disp-kpi-grid,
          .disp-attention { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>

      <div className="disp-overview">
        <section aria-labelledby="disp-overview-metrics">
          <h2 className="disp-section-heading" id="disp-overview-metrics">Dispatch metrics</h2>
          <div className="disp-kpi-grid" style={{ marginTop: '12px' }}>
            {dispatcherKpis.map((kpi) => (
              <button
                key={kpi.label}
                type="button"
                className={`disp-kpi-card ${kpi.tone}`}
                aria-label={`Open ${kpi.label.toLowerCase()}`}
                onClick={() => onNavigate(kpi.target)}
              >
                <div className="disp-kpi-top">
                  <span className="disp-kpi-label">{kpi.label}</span>
                  <span className="disp-kpi-change">{kpi.change}</span>
                </div>
                <strong className="disp-kpi-value">{kpi.value}</strong>
                <span className="disp-kpi-desc">{kpi.description}</span>
                <span className="disp-kpi-open">View {kpi.target} →</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="disp-overview-focus">
          <h2 className="disp-section-heading" id="disp-overview-focus">Focus now</h2>
          <div className="disp-attention" style={{ marginTop: '12px' }}>
            <button type="button" className="disp-attention-card" onClick={() => onNavigate('dispatch')}>
              <span className="disp-attention-label">Open jobs</span>
              <span className="disp-attention-value">{jobs.length}</span>
            </button>
            <button type="button" className="disp-attention-card" onClick={() => onNavigate('dispatch')}>
              <span className="disp-attention-label">Unassigned</span>
              <span className="disp-attention-value">{unassigned.length}</span>
            </button>
            <button type="button" className="disp-attention-card" onClick={() => onNavigate('map')}>
              <span className="disp-attention-label">In progress</span>
              <span className="disp-attention-value">{inProgress}</span>
            </button>
            <button type="button" className="disp-attention-card" onClick={() => onNavigate('map')}>
              <span className="disp-attention-label">Operators free</span>
              <span className="disp-attention-value">{available}</span>
            </button>
          </div>
        </section>

        <section className="disp-panel" aria-labelledby="disp-overview-alerts">
          <div className="disp-panel-header">
            <div>
              <h3 id="disp-overview-alerts">Alerts</h3>
              <span className="disp-panel-sub">Unassigned past target · operators offline · area shortages</span>
            </div>
            <div className="disp-panel-actions">
              <span className="disp-pill">{dispatcherAlerts.length} active</span>
            </div>
          </div>
          <div className="disp-alert-list">
            {dispatcherAlerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                className="disp-alert-item"
                onClick={() => onNavigate(alert.target)}
              >
                <div className="disp-alert-main">
                  <div className="disp-alert-top">
                    <StatusPill status={alert.severity} />
                    <span className="disp-alert-meta">{alert.time}</span>
                  </div>
                  <span className="disp-alert-title">{alert.title}</span>
                  <p className="disp-alert-detail">{alert.detail}</p>
                </div>
                <span className="disp-alert-cta">Open →</span>
              </button>
            ))}
          </div>
        </section>

        <section className="disp-panel" aria-labelledby="disp-overview-queue">
          <div className="disp-panel-header">
            <div>
              <h3 id="disp-overview-queue">Waiting queue</h3>
              <span className="disp-panel-sub">
                {unassigned.length} unassigned · {overTarget} past the {slaTarget}-minute target · sorted by urgency and wait
              </span>
            </div>
            <div className="disp-panel-actions">
              <button type="button" className="disp-assign" onClick={() => onNavigate('dispatch')}>
                Open dispatch
              </button>
            </div>
          </div>
          <div className="disp-table-wrap">
            <table className="disp-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Zone</th>
                  <th>Machine</th>
                  <th className="disp-num">Requested</th>
                  <th className="disp-num">Waiting</th>
                  <th>Priority</th>
                  <th>SLA</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {queue.map((job) => (
                  <tr key={job.id}>
                    <td className="disp-cell-strong">
                      {job.id}
                      <span className="disp-cell-sub">
                        {job.bookingId} · {job.customer}
                      </span>
                    </td>
                    <td>{job.zone}</td>
                    <td>{job.machine}</td>
                    <td className="disp-num">{job.requested}</td>
                    <td className="disp-num">
                      <span className={`disp-wait ${job.waiting > job.sla ? 'over' : ''}`}>{job.waiting} min</span>
                    </td>
                    <td>
                      <PriorityPill value={job.priority} />
                    </td>
                    <td>
                      <StatusPill status={job.waiting > job.sla ? 'Critical' : 'Normal'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="disp-assign" onClick={() => onNavigate('dispatch')}>
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="disp-empty">
                        <strong>No jobs waiting</strong>
                        <span>The queue is clear right now.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
