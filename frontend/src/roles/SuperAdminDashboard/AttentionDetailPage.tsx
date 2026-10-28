import { useState } from 'react'
import { statesPageStyles } from './pageStyles'
import {
  attentionKpis,
  formatRupees,
  operatorAssignees,
  type AttentionAction,
  type AttentionSlug,
  type KycReview,
  type PayoutRequest,
  type SecurityAlert,
  type UnassignedJob,
} from './attentionData'

type AttentionDetailPageProps = {
  slug: AttentionSlug
  payouts: PayoutRequest[]
  alerts: SecurityAlert[]
  jobs: UnassignedJob[]
  kycs: KycReview[]
  onAct: (action: AttentionAction) => void
  onBack: () => void
}

type StatCard = {
  key: string
  label: string
  value: string
  badge: string
  tone: 'orange' | 'green' | 'blue' | 'slate'
}

const attentionPageStyles = `
  .attn-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 16px;
    align-items: start;
  }

  .attn-activity {
    background: #fff;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(15,23,42,0.03);
    padding: 18px;
    display: grid;
    gap: 12px;
    align-content: start;
  }

  .attn-activity h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #0f172a;
  }

  .attn-activity-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  .attn-activity-list li {
    padding: 10px 12px;
    background: #f8fafc;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 10px;
    font-size: 0.78rem;
    color: #334155;
    line-height: 1.45;
  }

  .attn-activity-empty {
    color: #94a3b8;
    font-size: 0.8rem;
    line-height: 1.5;
  }

  .attn-act {
    border: 0;
    border-radius: 9px;
    padding: 7px 12px;
    font-family: inherit;
    font-size: 0.76rem;
    font-weight: 800;
    cursor: pointer;
    transition: background 0.15s ease, opacity 0.15s ease;
    white-space: nowrap;
  }

  .attn-act.approve {
    background: rgba(8,166,108,0.12);
    color: #078653;
  }

  .attn-act.approve:hover {
    background: rgba(8,166,108,0.22);
  }

  .attn-act.reject {
    background: rgba(239,68,68,0.12);
    color: #b91c1c;
  }

  .attn-act.reject:hover {
    background: rgba(239,68,68,0.22);
  }

  .attn-act.neutral {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid rgba(15,23,42,0.1);
  }

  .attn-act.neutral:hover {
    background: #e2e8f0;
  }

  .attn-act:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .attn-assign-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 260px;
  }

  .attn-assign-cell .bookings-filter-select {
    min-width: 170px;
    min-height: 34px;
    padding: 6px 10px;
    font-size: 0.78rem;
  }

  .attn-cell-muted {
    color: #64748b;
    font-size: 0.78rem;
  }

  .attn-empty-card {
    background: #fff;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(15,23,42,0.03);
  }
`

export default function AttentionDetailPage({
  slug,
  payouts,
  alerts,
  jobs,
  kycs,
  onAct,
  onBack,
}: AttentionDetailPageProps) {
  const meta = attentionKpis.find((item) => item.slug === slug) ?? attentionKpis[0]
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activity, setActivity] = useState<string[]>([])
  const [assignSelections, setAssignSelections] = useState<Record<string, string>>({})
  const [selectedStatBySlug, setSelectedStatBySlug] = useState<Partial<Record<AttentionSlug, string>>>({})
  const selectedStat = selectedStatBySlug[slug] ?? 'all'
  const selectStat = (key: string) => setSelectedStatBySlug((current) => ({ ...current, [slug]: key }))

  const notify = (message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(null), 4000)
  }

  const run = (action: AttentionAction, message: string) => {
    onAct(action)
    setActivity((prev) => [message, ...prev])
    notify(message)
  }

  const pendingPayoutValue = payouts.reduce((total, item) => total + item.amount, 0)
  const bankPayouts = payouts.filter((item) => item.method === 'Bank transfer').length
  const criticalAlerts = alerts.filter((item) => item.severity === 'Critical').length
  const highAlerts = alerts.filter((item) => item.severity === 'High').length
  const jobCities = new Set(jobs.map((item) => item.city)).size
  const dueTodayJobs = jobs.filter((item) => item.requestedFor.startsWith('Today')).length
  const kycOwners = kycs.filter((item) => item.type === 'Owner').length
  const kycOperators = kycs.filter((item) => item.type === 'Operator').length
  const kycFleet = kycs.filter((item) => item.type === 'Fleet Partner').length

  const stats: StatCard[] =
    slug === 'payouts-awaiting-approval'
      ? [
          { key: 'all', label: 'Pending approvals', value: String(payouts.length), badge: 'Finance', tone: 'orange' },
          { key: 'value', label: 'Total value', value: formatRupees(pendingPayoutValue), badge: 'Sort by amount', tone: 'slate' },
          { key: 'bank', label: 'Bank transfers', value: String(bankPayouts), badge: 'NEFT / IMPS', tone: 'blue' },
          { key: 'upi', label: 'UPI requests', value: String(payouts.length - bankPayouts), badge: 'Instant', tone: 'green' },
        ]
      : slug === 'security-alerts'
        ? [
            { key: 'all', label: 'Open alerts', value: String(alerts.length), badge: 'Unresolved', tone: 'orange' },
            { key: 'Critical', label: 'Critical', value: String(criticalAlerts), badge: 'Escalate', tone: 'slate' },
            { key: 'High', label: 'High', value: String(highAlerts), badge: 'Investigate', tone: 'blue' },
            { key: 'Medium', label: 'Medium', value: String(alerts.length - criticalAlerts - highAlerts), badge: 'Monitor', tone: 'green' },
          ]
        : slug === 'unassigned-jobs'
          ? [
              { key: 'all', label: 'Waiting for operator', value: String(jobs.length), badge: 'Dispatch', tone: 'orange' },
              { key: 'today', label: 'Due today', value: String(dueTodayJobs), badge: 'Urgent', tone: 'slate' },
              { key: 'city', label: 'Cities affected', value: String(jobCities), badge: 'Group by city', tone: 'blue' },
              { key: 'equipment', label: 'Equipment types', value: String(new Set(jobs.map((item) => item.equipment)).size), badge: 'Group by equipment', tone: 'green' },
            ]
          : [
              { key: 'all', label: 'Pending reviews', value: String(kycs.length), badge: 'Verification', tone: 'orange' },
              { key: 'Owner', label: 'Owners', value: String(kycOwners), badge: 'Hosts', tone: 'slate' },
              { key: 'Operator', label: 'Operators', value: String(kycOperators), badge: 'Drivers', tone: 'blue' },
              { key: 'Fleet Partner', label: 'Fleet partners', value: String(kycFleet), badge: 'Business', tone: 'green' },
            ]

  const visiblePayouts = [...payouts]
    .filter((item) => selectedStat === 'all' || selectedStat === 'value' || (selectedStat === 'bank' ? item.method === 'Bank transfer' : item.method === 'UPI'))
    .sort((a, b) => selectedStat === 'value' ? b.amount - a.amount : 0)
  const visibleAlerts = alerts.filter((item) => selectedStat === 'all' || item.severity === selectedStat)
  const visibleJobs = [...jobs]
    .filter((item) => selectedStat !== 'today' || item.requestedFor.startsWith('Today'))
    .sort((a, b) => selectedStat === 'city'
      ? a.city.localeCompare(b.city)
      : selectedStat === 'equipment'
        ? a.equipment.localeCompare(b.equipment)
        : 0)
  const visibleKycs = kycs.filter((item) => selectedStat === 'all' || item.type === selectedStat)

  const isEmpty =
    (slug === 'payouts-awaiting-approval' && payouts.length === 0) ||
    (slug === 'security-alerts' && alerts.length === 0) ||
    (slug === 'unassigned-jobs' && jobs.length === 0) ||
    (slug === 'kyc-reviews' && kycs.length === 0)

  return (
    <div className="states-page">
      <style>{statesPageStyles}</style>
      <style>{attentionPageStyles}</style>

      <header className="states-header">
        <div className="states-header-copy">
          <div className="states-breadcrumb">
            <button type="button" onClick={onBack}>Dashboard</button>
          </div>
          <h2>{meta.title}</h2>
          {meta.description && <p>{meta.description}</p>}
        </div>
        <div className="states-header-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            ← Back to Overview
          </button>
        </div>
      </header>

      <section className="states-stats-grid" aria-label={`${meta.title} summary statistics`}>
        {stats.map((stat) => (
          <button
            type="button"
            className={`states-stat-card interactive${selectedStat === stat.key ? ' selected' : ''}`}
            key={stat.label}
            aria-pressed={selectedStat === stat.key}
            onClick={() => selectStat(stat.key)}
          >
            <div className="states-stat-info">
              <span className="states-stat-label">{stat.label}</span>
              <span className="states-stat-value">{stat.value}</span>
            </div>
            <span className={`states-stat-badge ${stat.tone}`}>{stat.badge}</span>
          </button>
        ))}
      </section>

      <div className="attn-layout">
        <div>
          {isEmpty ? (
            <div className="attn-empty-card">
              <div className="empty-states-panel">
                <h4>Queue cleared</h4>
                <p>
                  Nothing is waiting in {meta.title.toLowerCase()}. New items appear here as soon as they are raised
                  across the platform.
                </p>
                <button type="button" className="btn-secondary" onClick={onBack}>
                  Back to dashboard
                </button>
              </div>
            </div>
          ) : slug === 'payouts-awaiting-approval' ? (
            <section className="states-table-card" aria-label="Payout requests awaiting approval">
              <div className="states-table-wrap">
                <table className="states-table">
                  <thead>
                    <tr>
                      <th>Payout ID</th>
                      <th>Partner</th>
                      <th>City</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePayouts.length === 0 ? (
                      <tr><td colSpan={7} className="attn-cell-muted">No payout requests match this selection.</td></tr>
                    ) : visiblePayouts.map((payout) => (
                      <tr key={payout.id}>
                        <td>
                          <span className="state-code-badge">{payout.id}</span>
                        </td>
                        <td>
                          <div className="state-name-info">
                            <strong>{payout.partner}</strong>
                            <span>{payout.role}</span>
                          </div>
                        </td>
                        <td>{payout.city}</td>
                        <td>
                          <strong>{formatRupees(payout.amount)}</strong>
                        </td>
                        <td>{payout.method}</td>
                        <td className="attn-cell-muted">{payout.requestedOn}</td>
                        <td className="table-actions-cell">
                          <button
                            type="button"
                            className="attn-act approve"
                            onClick={() =>
                              run(
                                { type: 'approve-payout', id: payout.id },
                                `Payout ${payout.id} approved — ${formatRupees(payout.amount)} released to ${payout.partner}`,
                              )
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="attn-act reject"
                            onClick={() =>
                              run(
                                { type: 'reject-payout', id: payout.id },
                                `Payout ${payout.id} rejected — ${formatRupees(payout.amount)} removed from the approval queue`,
                              )
                            }
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : slug === 'security-alerts' ? (
            <section className="states-table-card" aria-label="Open security alerts">
              <div className="states-table-wrap">
                <table className="states-table">
                  <thead>
                    <tr>
                      <th>Alert ID</th>
                      <th>Severity</th>
                      <th>Category</th>
                      <th>Summary</th>
                      <th>Raised by</th>
                      <th>Detected</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAlerts.length === 0 ? (
                      <tr><td colSpan={7} className="attn-cell-muted">No alerts match this severity.</td></tr>
                    ) : visibleAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <span className="state-code-badge">{alert.id}</span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              alert.severity === 'Critical'
                                ? 'cancelled'
                                : alert.severity === 'High'
                                  ? 'pending'
                                  : 'confirmed'
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </td>
                        <td>{alert.category}</td>
                        <td>
                          <div className="state-name-info">
                            <strong>{alert.summary}</strong>
                            <span>{alert.source}</span>
                          </div>
                        </td>
                        <td>{alert.source}</td>
                        <td className="attn-cell-muted">{alert.detectedAt}</td>
                        <td className="table-actions-cell">
                          <button
                            type="button"
                            className="attn-act approve"
                            onClick={() =>
                              run({ type: 'resolve-alert', id: alert.id }, `Alert ${alert.id} marked resolved after investigation`)
                            }
                          >
                            Resolve
                          </button>
                          <button
                            type="button"
                            className="attn-act neutral"
                            onClick={() => run({ type: 'dismiss-alert', id: alert.id }, `Alert ${alert.id} dismissed as a false positive`)}
                          >
                            Dismiss
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : slug === 'unassigned-jobs' ? (
            <section className="states-table-card" aria-label="Jobs waiting for operator assignment">
              <div className="states-table-wrap">
                <table className="states-table">
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Customer</th>
                      <th>Equipment</th>
                      <th>City</th>
                      <th>Requested for</th>
                      <th>Duration</th>
                      <th>Assign operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleJobs.length === 0 ? (
                      <tr><td colSpan={7} className="attn-cell-muted">No jobs match this selection.</td></tr>
                    ) : visibleJobs.map((job) => {
                      const selectedOperator = assignSelections[job.id] ?? ''
                      return (
                        <tr key={job.id}>
                          <td>
                            <span className="state-code-badge">{job.id}</span>
                          </td>
                          <td>
                            <div className="state-name-info">
                              <strong>{job.customer}</strong>
                              <span>Confirmed booking</span>
                            </div>
                          </td>
                          <td>{job.equipment}</td>
                          <td>{job.city}</td>
                          <td className="attn-cell-muted">{job.requestedFor}</td>
                          <td>{job.duration}</td>
                          <td className="table-actions-cell attn-assign-cell">
                            <select
                              className="bookings-filter-select"
                              aria-label={`Operator for ${job.id}`}
                              value={selectedOperator}
                              onChange={(event) =>
                                setAssignSelections((prev) => ({ ...prev, [job.id]: event.target.value }))
                              }
                            >
                              <option value="">Select operator</option>
                              {operatorAssignees.map((operator) => (
                                <option key={operator} value={operator}>
                                  {operator}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="attn-act approve"
                              disabled={!selectedOperator}
                              onClick={() =>
                                run(
                                  { type: 'assign-job', id: job.id, operator: selectedOperator },
                                  `${job.id} assigned to ${selectedOperator} — moved into dispatch`,
                                )
                              }
                            >
                              Assign
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section className="states-table-card" aria-label="KYC reviews pending verification">
              <div className="states-table-wrap">
                <table className="states-table">
                  <thead>
                    <tr>
                      <th>Review ID</th>
                      <th>Applicant</th>
                      <th>Type</th>
                      <th>City</th>
                      <th>Documents</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleKycs.length === 0 ? (
                      <tr><td colSpan={7} className="attn-cell-muted">No reviews match this applicant type.</td></tr>
                    ) : visibleKycs.map((kyc) => (
                      <tr key={kyc.id}>
                        <td>
                          <span className="state-code-badge">{kyc.id}</span>
                        </td>
                        <td>
                          <div className="state-name-info">
                            <strong>{kyc.applicant}</strong>
                            <span>{kyc.city}</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-pill confirmed">{kyc.type}</span>
                        </td>
                        <td>{kyc.city}</td>
                        <td className="attn-cell-muted">{kyc.documents}</td>
                        <td className="attn-cell-muted">{kyc.submittedOn}</td>
                        <td className="table-actions-cell">
                          <button
                            type="button"
                            className="attn-act approve"
                            onClick={() => run({ type: 'approve-kyc', id: kyc.id }, `KYC ${kyc.id} approved — ${kyc.applicant} is verified`)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="attn-act reject"
                            onClick={() => run({ type: 'reject-kyc', id: kyc.id }, `KYC ${kyc.id} rejected — ${kyc.applicant} notified`)}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="attn-act neutral"
                            onClick={() =>
                              run({ type: 'docs-kyc', id: kyc.id }, `Document request sent to ${kyc.applicant} for ${kyc.id}`)
                            }
                          >
                            Request docs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        <aside className="attn-activity" aria-label="Session activity">
          <h3>Session activity</h3>
          {activity.length === 0 ? (
            <p className="attn-activity-empty">
              Actions you take on this page are recorded here for the current session and reflected on the dashboard
              counters immediately.
            </p>
          ) : (
            <ul className="attn-activity-list">
              {activity.map((entry, index) => (
                <li key={`${entry}-${index}`}>{entry}</li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {toastMessage && (
        <div className="states-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
