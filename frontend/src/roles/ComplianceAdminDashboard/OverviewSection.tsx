import { GatedAction, StatusPill } from './shared'
import {
  cityQueue,
  complianceProfile,
  permissions,
  type ComplianceDocument,
  type InspectionRow,
  type PermitRow,
  type SectionId,
} from './complianceAdminData'
import {
  cityCompliance,
  type ComplianceActivity,
  type ComplianceAudit,
  type ComplianceKpiKey,
  type ComplianceMetrics,
  type FleetVehicle,
  type UrgentAlert,
} from './complianceFleetData'
import type { ComplianceCheck } from './compliancePermissions'

type OverviewSectionProps = {
  documents: ComplianceDocument[]
  permits: PermitRow[]
  inspections: InspectionRow[]
  vehicles: FleetVehicle[]
  audits: ComplianceAudit[]
  activity: ComplianceActivity[]
  metrics: ComplianceMetrics
  alerts: UrgentAlert[]
  acknowledgedAlerts: string[]
  onNavigate: (id: SectionId) => void
  onOpenDocuments: (status: 'Pending' | 'Renewed' | 'Verified' | 'Rejected') => void
  onOpenKpi: (key: ComplianceKpiKey) => void
  onOpenAlert: (alert: UrgentAlert) => void
  onAcknowledgeAlert: (id: string) => void
  check: ComplianceCheck
}

export default function OverviewSection({
  documents,
  permits,
  inspections,
  vehicles,
  audits,
  activity,
  metrics,
  alerts,
  acknowledgedAlerts,
  onNavigate,
  onOpenDocuments,
  onOpenKpi,
  onOpenAlert,
  onAcknowledgeAlert,
  check,
}: OverviewSectionProps) {
  const docsPending = documents.filter((doc) => doc.status === 'Pending' || doc.status === 'Renewed').length
  const docsVerified = documents.filter((doc) => doc.status === 'Verified').length
  const docsRejected = documents.filter((doc) => doc.status === 'Rejected').length
  const permitsExpiring = permits.filter((permit) => permit.status === 'Expiring').length
  const inspectionsDue = inspections.filter((row) => row.status === 'Scheduled' || row.status === 'Overdue').length

  const expiringVehicles = vehicles.filter((vehicle) => vehicle.status === 'Expiring').length
  const openAlerts = alerts.filter((alert) => !acknowledgedAlerts.includes(alert.id))
  const criticalAlerts = openAlerts.filter((alert) => alert.severity === 'Critical').length
  const nextAudit = audits
    .filter((audit) => audit.status !== 'Completed')
    .slice()
    .sort((a, b) => a.daysUntil - b.daysUntil)[0]
  const complianceByCity = cityCompliance(vehicles)

  const fleetMix = [
    { label: 'Compliant', count: metrics.compliantVehicles, color: 'var(--sa-green)' },
    { label: 'Expiring', count: expiringVehicles, color: 'var(--sa-orange)' },
    { label: 'Non-compliant', count: metrics.nonCompliantVehicles, color: 'var(--sa-red)' },
  ]
  const fleetTotal = Math.max(metrics.fleetSize, 1)
  let sweep = 0
  const ringStops = fleetMix.map((slice) => {
    const start = sweep
    sweep += (slice.count / fleetTotal) * 360
    return `${slice.color} ${start}deg ${sweep}deg`
  })

  // Every card opens the page that owns the number it shows.
  const kpis: Array<{
    key: ComplianceKpiKey
    label: string
    value: string
    change: string
    tone: string
    badge: string
    desc: string
    target: string
  }> = [
    {
      key: 'compliant',
      label: 'Compliant vehicles',
      value: String(metrics.compliantVehicles).padStart(2, '0'),
      change: `of ${metrics.fleetSize} tracked`,
      tone: 'green',
      badge: 'green',
      desc: 'Permit, insurance, fitness and inspection all current',
      target: 'Fleet compliance',
    },
    {
      key: 'expiring',
      label: 'Expiring documents',
      value: String(metrics.expiringDocuments).padStart(2, '0'),
      change: 'within 30 days',
      tone: 'blue',
      badge: 'blue',
      desc: 'Documents and permits closing their renewal window',
      target: 'Expiry tracking',
    },
    {
      key: 'non-compliant',
      label: 'Non-compliant vehicles',
      value: String(metrics.nonCompliantVehicles).padStart(2, '0'),
      change: 'dispatch blocked',
      tone: 'red',
      badge: 'red',
      desc: 'Held from dispatch until the blocking issue clears',
      target: 'Fleet compliance',
    },
    {
      key: 'credentials',
      label: 'Driver credential issues',
      value: String(metrics.driverCredentialIssues).padStart(2, '0'),
      change: 'expired · missing · held',
      tone: 'orange',
      badge: 'amber',
      desc: 'Licence, badge, medical and police verification files',
      target: 'Driver credentials',
    },
    {
      key: 'violations',
      label: 'Open violations',
      value: String(metrics.openViolations).padStart(2, '0'),
      change: `${metrics.criticalViolations} critical`,
      tone: 'orange',
      badge: 'amber',
      desc: `₹${metrics.penaltyExposure.toLocaleString('en-IN')} penalty exposure pending`,
      target: 'Violations & notices',
    },
    {
      key: 'actions',
      label: 'Overdue corrective actions',
      value: String(metrics.overdueCorrectiveActions).padStart(2, '0'),
      change: 'past due date',
      tone: 'red',
      badge: 'red',
      desc: 'Owner evidence not submitted within the committed window',
      target: 'Corrective actions',
    },
    {
      key: 'audits',
      label: 'Upcoming audits',
      value: String(metrics.upcomingAudits).padStart(2, '0'),
      change: nextAudit ? `next in ${nextAudit.daysUntil} days` : 'none scheduled',
      tone: 'blue',
      badge: 'blue',
      desc: nextAudit ? `${nextAudit.title} · ${nextAudit.scheduledOn}` : 'No audit in the planning window',
      target: 'Audit schedule',
    },
  ]

  return (
    <>
      <div className="sa-kpi-grid">
        {kpis.map((kpi) => (
          <button
            key={kpi.key}
            type="button"
            className={`sa-kpi-card ${kpi.tone}`}
            aria-label={`Open ${kpi.target.toLowerCase()}`}
            onClick={() => onOpenKpi(kpi.key)}
          >
            <div className="sa-kpi-top">
              <span className="sa-kpi-label">{kpi.label}</span>
              <span className={`sa-kpi-change ${kpi.badge}`}>{kpi.change}</span>
            </div>
            <strong className="sa-kpi-value">{kpi.value}</strong>
            <span className="sa-kpi-desc">{kpi.desc}</span>
            <span className="sa-kpi-open">Open {kpi.target} →</span>
          </button>
        ))}

        <button
          type="button"
          className="sa-kpi-card cf-score-card"
          aria-label="Open fleet compliance report"
          onClick={() => onOpenKpi('score')}
        >
          <div
            className="cf-ring"
            style={{ background: `conic-gradient(${ringStops.join(', ')})` }}
            role="img"
            aria-label={`Compliance ${metrics.compliancePercentage} percent`}
          >
            <span className="cf-ring-core">{metrics.compliancePercentage}%</span>
          </div>
          <div className="cf-score-copy">
            <div className="sa-kpi-top">
              <span className="sa-kpi-label">Compliance percentage</span>
            </div>
            <strong className="sa-kpi-value">{metrics.compliancePercentage}%</strong>
            <div className="cf-score-legend">
              {fleetMix.map((slice) => (
                <span key={slice.label}>
                  <i style={{ background: slice.color }} />
                  {slice.label} {slice.count}
                </span>
              ))}
            </div>
            <span className="sa-kpi-desc">Expiring vehicles count as half-compliant</span>
            <span className="sa-kpi-open">Open reports →</span>
          </div>
        </button>
      </div>

      <div className="sa-analytics-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Urgent alerts</h3>
            <span className="sa-panel-sub">
              {openAlerts.length} open · {criticalAlerts} critical
            </span>
          </div>
          <div className="cf-alert-list cf-alert-scroll">
            {alerts.length === 0 ? (
              <div className="sa-empty">
                <p>No compliance alerts are open.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const acknowledged = acknowledgedAlerts.includes(alert.id)
                return (
                  <div
                    key={alert.id}
                    className={`cf-alert ${alert.severity === 'Critical' ? 'cf-alert-critical' : 'cf-alert-warning'} ${
                      acknowledged ? 'is-acknowledged' : ''
                    }`}
                  >
                    <div className="cf-alert-top">
                      <button type="button" className="cf-alert-title" onClick={() => onOpenAlert(alert)}>
                        {alert.title}
                      </button>
                      <span className={`sa-pill ${alert.severity === 'Critical' ? 'red' : 'amber'}`}>{alert.severity}</span>
                    </div>
                    <span>{alert.detail}</span>
                    <div className="cf-alert-foot">
                      <span className="cf-alert-meta">
                        {alert.category} · {alert.owner} · {alert.due}
                      </span>
                      <div className="cf-row-actions">
                        <button type="button" className="sa-btn-ghost" onClick={() => onOpenAlert(alert)}>
                          Open
                        </button>
                        <GatedAction
                          check={check}
                          permission="alert.acknowledge"
                          className="sa-btn-ghost"
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          disabled={acknowledged}
                        >
                          {acknowledged ? 'Acknowledged' : 'Acknowledge'}
                        </GatedAction>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Recent activity</h3>
            <span className="sa-panel-sub">{activity.length} events · {complianceProfile.name}</span>
          </div>
          <div className="sa-feed cf-activity-feed">
            {activity.slice(0, 12).map((item) => (
              <div key={item.id} className="sa-feed-item cf-activity-item">
                <strong>
                  <span className={`cf-activity-dot ${item.tone}`} />
                  {item.actor} <em>{item.action}</em> {item.detail}
                </strong>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Upcoming audits</h3>
            <button type="button" className="sa-view-link" onClick={() => onNavigate('audits')}>
              View audit schedule
            </button>
          </div>
          <div className="sa-feed">
            {audits
              .filter((audit) => audit.status !== 'Completed')
              .slice()
              .sort((a, b) => a.daysUntil - b.daysUntil)
              .map((audit) => (
                <button
                  key={audit.id}
                  type="button"
                  className="sa-feed-item cf-feed-link"
                  onClick={() => onNavigate('audits')}
                >
                  <strong>
                    {audit.title} <em>{audit.vehicles} machines</em> · {audit.scope}
                  </strong>
                  <span>
                    {audit.scheduledOn} · {audit.auditor}
                  </span>
                </button>
              ))}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Compliance by city</h3>
            <span className="sa-panel-sub">Lowest score first</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Fleet</th>
                  <th>Compliant</th>
                  <th>Expiring</th>
                  <th>Blocked</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {complianceByCity.map((row) => (
                  <tr key={row.city}>
                    <td className="sa-cell-strong">{row.city}</td>
                    <td className="sa-num">{row.fleet}</td>
                    <td className="sa-num">{row.compliant}</td>
                    <td className="sa-num">{row.expiring}</td>
                    <td className="sa-num">{row.nonCompliant}</td>
                    <td className={row.score < 70 ? 'sa-num cf-warn-num' : 'sa-num'}>{row.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Verification queue by city</h3>
            <span className="sa-panel-sub">Where checks are backed up</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Pending</th>
                  <th>Rejected</th>
                  <th>Avg turnaround</th>
                  <th>Queue status</th>
                </tr>
              </thead>
              <tbody>
                {cityQueue.map((row) => (
                  <tr key={row.city}>
                    <td className="sa-cell-strong">{row.city}</td>
                    <td className="sa-num">{row.pending}</td>
                    <td className="sa-num">{row.rejected}</td>
                    <td className="sa-num">{row.avgHours} hrs</td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Scope</h3>
            <span className="sa-panel-sub">{complianceProfile.name} state compliance</span>
          </div>
          <div className="sa-feed">
            <div className="sa-feed-item">
              <strong>
                Documents <em>verify · reject · re-verify</em>
              </strong>
              <span>Drivers, vehicles, owners</span>
            </div>
            <div className="sa-feed-item">
              <strong>
                Inspections <em>schedule · record results</em>
              </strong>
              <span>Pass / fail / conditions</span>
            </div>
            <div className="sa-feed-item">
              <strong>
                Suspensions <em>compliance reasons only</em>
              </strong>
              <span>Vehicles and drivers</span>
            </div>
            <div className="sa-feed-item">
              <strong>
                Expiry reminders <em>auto-flag lapsed accounts</em>
              </strong>
              <span>Drivers, owners, partners</span>
            </div>
          </div>
          <div className="cf-scope-list">
            {permissions.map((group) => (
              <div key={group.group}>
                <strong>{group.group}</strong>
                <span>{group.items.join(' · ')}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Document queue snapshot</h3>
          <button type="button" className="sa-view-link" onClick={() => onOpenDocuments('Pending')}>
            Open document queue
          </button>
        </div>
        <div className="cf-stat-strip">
          <div className="cf-stat">
            <strong>{docsPending}</strong>
            <span>Documents pending review</span>
          </div>
          <div className="cf-stat">
            <strong>{docsVerified}</strong>
            <span>Documents verified</span>
          </div>
          <div className="cf-stat">
            <strong>{docsRejected}</strong>
            <span>Documents rejected</span>
          </div>
          <div className="cf-stat">
            <strong>{permitsExpiring}</strong>
            <span>Permits expiring</span>
          </div>
          <div className="cf-stat">
            <strong>{inspectionsDue}</strong>
            <span>Inspections due</span>
          </div>
        </div>
      </section>
    </>
  )
}
