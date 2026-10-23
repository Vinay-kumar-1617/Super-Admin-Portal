import { GatedAction } from './shared'
import {
  rejectionReasons,
  verificationTurnaround,
  type AuditEntry,
  type ExpiryRow,
  type SuspensionRow,
} from './complianceAdminData'
import {
  type ComplianceAudit,
  type ComplianceMetrics,
  type ComplianceViolation,
  type CorrectiveAction,
  type FleetVehicle,
} from './complianceFleetData'
import type { ComplianceCheck } from './compliancePermissions'

type ReportsSectionProps = {
  suspensions: SuspensionRow[]
  expiryRows: ExpiryRow[]
  auditLog: AuditEntry[]
  metrics: ComplianceMetrics
  vehicles: FleetVehicle[]
  violations: ComplianceViolation[]
  correctiveActions: CorrectiveAction[]
  audits: ComplianceAudit[]
  onExport: () => void
  onExportFleet: () => void
  check: ComplianceCheck
}

export default function ReportsSection({
  suspensions,
  expiryRows,
  auditLog,
  metrics,
  vehicles,
  violations,
  correctiveActions,
  audits,
  onExport,
  onExportFleet,
  check,
}: ReportsSectionProps) {
  const activeVehicleSuspensions = suspensions.filter((row) => row.subjectType === 'Vehicle' && row.status === 'Suspended').length
  const activeDriverSuspensions = suspensions.filter((row) => row.subjectType === 'Driver' && row.status === 'Suspended').length
  const reinstated = suspensions.filter((row) => row.status === 'Reinstated').length
  const lapsed = expiryRows.filter((row) => row.daysLeft < 0).length
  const dueSoon = expiryRows.filter((row) => row.daysLeft >= 0 && row.daysLeft <= 7).length
  const remindersSent = expiryRows.filter((row) => row.reminded).length
  const maxReason = Math.max(...rejectionReasons.map((reason) => reason.count))
  const penaltyExposure = violations
    .filter((violation) => violation.status !== 'Closed')
    .reduce((sum, violation) => sum + violation.penalty, 0)

  return (
    <>
      <div className="cf-report-grid">
        <section className="sa-panel cf-report-block">
          <div className="sa-panel-header">
            <h3>Verification turnaround</h3>
            <span className="sa-panel-sub">This month</span>
          </div>
          <div className="cf-stat">
            <strong>{verificationTurnaround.medianHours} hrs</strong>
            <span>Median time to verify</span>
          </div>
          <div className="cf-stat">
            <strong>{verificationTurnaround.within24h}%</strong>
            <span>Cleared within 24 hours</span>
          </div>
          <div className="cf-stat">
            <strong>{verificationTurnaround.reviewedThisMonth}</strong>
            <span>Documents reviewed</span>
          </div>
        </section>

        <section className="sa-panel cf-report-block">
          <div className="sa-panel-header">
            <h3>Rejection reasons</h3>
            <span className="sa-panel-sub">Why documents come back</span>
          </div>
          <div className="cf-reason-bars">
            {rejectionReasons.map((reason) => (
              <div key={reason.reason} className="cf-reason-row">
                <span>{reason.reason}</span>
                <span className="sa-progress">
                  <span style={{ width: `${(reason.count / maxReason) * 100}%` }} />
                </span>
                <strong>{reason.count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="sa-panel cf-report-block">
          <div className="sa-panel-header">
            <h3>Suspensions</h3>
            <span className="sa-panel-sub">Compliance reasons only</span>
          </div>
          <div className="cf-stat">
            <strong>{activeVehicleSuspensions}</strong>
            <span>Vehicles currently suspended</span>
          </div>
          <div className="cf-stat">
            <strong>{activeDriverSuspensions}</strong>
            <span>Drivers currently suspended</span>
          </div>
          <div className="cf-stat">
            <strong>{reinstated}</strong>
            <span>Reinstated after clearance</span>
          </div>
        </section>

        <section className="sa-panel cf-report-block">
          <div className="sa-panel-header">
            <h3>Expiries</h3>
            <span className="sa-panel-sub">Documents and permits</span>
          </div>
          <div className="cf-stat">
            <strong>{lapsed}</strong>
            <span>Lapsed · accounts auto-flagged</span>
          </div>
          <div className="cf-stat">
            <strong>{dueSoon}</strong>
            <span>Due within 7 days</span>
          </div>
          <div className="cf-stat">
            <strong>{remindersSent}</strong>
            <span>Reminders sent</span>
          </div>
        </section>

        <section className="sa-panel cf-report-block">
          <div className="sa-panel-header">
            <h3>Fleet compliance</h3>
            <span className="sa-panel-sub">{metrics.fleetSize} tracked vehicles</span>
          </div>
          <div className="cf-stat">
            <strong>{metrics.compliancePercentage}%</strong>
            <span>Compliance score</span>
          </div>
          <div className="cf-stat">
            <strong>{metrics.compliantVehicles}</strong>
            <span>Fully compliant vehicles</span>
          </div>
          <div className="cf-stat">
            <strong>{metrics.nonCompliantVehicles}</strong>
            <span>Vehicles blocked from dispatch</span>
          </div>
          <div className="cf-stat">
            <strong>
              {vehicles.filter((vehicle) => vehicle.status === 'Compliant').length} / {vehicles.length}
            </strong>
            <span>Vehicles with no open issue</span>
          </div>
        </section>

        <section className="sa-panel cf-report-block">
          <div className="sa-panel-header">
            <h3>Violations & actions</h3>
            <span className="sa-panel-sub">Raised this quarter</span>
          </div>
          <div className="cf-stat">
            <strong>{metrics.openViolations}</strong>
            <span>Open violations · {metrics.criticalViolations} critical</span>
          </div>
          <div className="cf-stat">
            <strong>₹{penaltyExposure.toLocaleString('en-IN')}</strong>
            <span>Open penalty exposure</span>
          </div>
          <div className="cf-stat">
            <strong>{metrics.overdueCorrectiveActions}</strong>
            <span>Overdue corrective actions</span>
          </div>
        </section>

        <section className="sa-panel cf-report-block">
          <div className="sa-panel-header">
            <h3>Audit plan</h3>
            <span className="sa-panel-sub">Scheduled coverage</span>
          </div>
          <div className="cf-stat">
            <strong>{metrics.upcomingAudits}</strong>
            <span>Audits in the planning window</span>
          </div>
          <div className="cf-stat">
            <strong>{audits.filter((audit) => audit.status !== 'Completed').reduce((sum, audit) => sum + audit.vehicles, 0)}</strong>
            <span>Machines in audit scope</span>
          </div>
          <div className="cf-stat">
            <strong>{correctiveActions.filter((action) => action.status === 'Completed').length}</strong>
            <span>Corrective actions closed</span>
          </div>
        </section>
      </div>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Export</h3>
          <span className="sa-panel-sub">Compliance report for October 2026 — queue, permits, inspections, suspensions and expiries as CSV</span>
        </div>
        <div className="sa-toolbar">
          <GatedAction check={check} permission="report.export" className="sa-btn approve" onClick={onExport}>
            Export compliance report (CSV)
          </GatedAction>
          <GatedAction check={check} permission="fleet.export" className="sa-btn-ghost" onClick={onExportFleet}>
            Export fleet compliance report (CSV)
          </GatedAction>
          <span className="sa-toolbar-meta">Downloads a CSV of the current compliance state</span>
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Action history</h3>
          <span className="sa-panel-sub">Audit log of this account · {auditLog.length} entries</span>
        </div>
        <div className="sa-feed">
          {auditLog.map((entry) => (
            <div key={entry.id} className="sa-feed-item">
              <strong>
                {entry.actor} <em>{entry.action}</em> {entry.detail}
              </strong>
              <span>{entry.time}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
