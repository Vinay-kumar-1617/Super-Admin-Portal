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

  return (
    <>
      <div className="sa-kpi-grid">
        {dispatcherKpis.map((kpi) => (
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
        <button type="button" className="sa-attention-card" onClick={() => onNavigate('dispatch')}>
          <span className="sa-attention-label">Open jobs</span>
          <span className="sa-attention-value">{jobs.length}</span>
        </button>
        <button type="button" className="sa-attention-card" onClick={() => onNavigate('dispatch')}>
          <span className="sa-attention-label">Unassigned</span>
          <span className="sa-attention-value">{unassigned.length}</span>
        </button>
        <button type="button" className="sa-attention-card" onClick={() => onNavigate('map')}>
          <span className="sa-attention-label">In progress</span>
          <span className="sa-attention-value">{inProgress}</span>
        </button>
        <button type="button" className="sa-attention-card" onClick={() => onNavigate('map')}>
          <span className="sa-attention-label">Operators free</span>
          <span className="sa-attention-value">{available}</span>
        </button>
      </div>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Alerts</h3>
          <span className="sa-panel-sub">Unassigned past target · operators offline · area shortages</span>
        </div>
        <div className="sa-approval-list">
          {dispatcherAlerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              className="sa-approval-item ops-alert-btn"
              onClick={() => onNavigate(alert.target)}
            >
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
          <h3>Waiting queue</h3>
          <span className="sa-panel-sub">
            {unassigned.length} unassigned · {overTarget} past the {jobs[0]?.sla ?? 30}-minute target · sorted by urgency and
            wait
          </span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Zone</th>
                <th>Machine</th>
                <th>Requested</th>
                <th>Waiting</th>
                <th>Priority</th>
                <th>SLA</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {queue.map((job) => (
                <tr key={job.id}>
                  <td className="sa-cell-strong">
                    {job.id}
                    <span className="sa-cell-sub">
                      {job.bookingId} · {job.customer}
                    </span>
                  </td>
                  <td>{job.zone}</td>
                  <td>{job.machine}</td>
                  <td className="sa-num">{job.requested}</td>
                  <td className="sa-num">
                    <span style={{ color: job.waiting > job.sla ? '#b91c1c' : undefined, fontWeight: 700 }}>
                      {job.waiting} min
                    </span>
                  </td>
                  <td>
                    <PriorityPill value={job.priority} />
                  </td>
                  <td>
                    <StatusPill status={job.waiting > job.sla ? 'Critical' : 'Normal'} />
                  </td>
                  <td>
                    <button type="button" className="sa-btn-ghost" onClick={() => onNavigate('dispatch')}>
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="sa-empty">
                      <p>No jobs waiting — the queue is clear.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
