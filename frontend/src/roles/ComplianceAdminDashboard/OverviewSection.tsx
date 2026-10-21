import { StatusPill } from './shared'
import {
  buildComplianceAlerts,
  cityQueue,
  complianceProfile,
  type ComplianceDocument,
  type ExpiryRow,
  type InspectionRow,
  type PermitRow,
  type SectionId,
} from './complianceAdminData'

type OverviewSectionProps = {
  documents: ComplianceDocument[]
  permits: PermitRow[]
  inspections: InspectionRow[]
  expiryRows: ExpiryRow[]
  onNavigate: (id: SectionId) => void
  onOpenDocuments: (status: 'Pending' | 'Renewed' | 'Verified' | 'Rejected') => void
}

export default function OverviewSection({
  documents,
  permits,
  inspections,
  expiryRows,
  onNavigate,
  onOpenDocuments,
}: OverviewSectionProps) {
  const docsPending = documents.filter((doc) => doc.status === 'Pending' || doc.status === 'Renewed').length
  const docsVerified = documents.filter((doc) => doc.status === 'Verified').length
  const docsRejected = documents.filter((doc) => doc.status === 'Rejected').length
  const permitsExpiring = permits.filter((permit) => permit.status === 'Expiring').length
  const inspectionsDue = inspections.filter((row) => row.status === 'Scheduled' || row.status === 'Overdue').length

  const kpis = [
    { label: 'Documents pending', value: String(docsPending).padStart(2, '0'), change: 'Awaiting review', tone: 'orange', target: 'documents' as SectionId, open: () => onOpenDocuments('Pending') },
    { label: 'Documents verified', value: String(docsVerified).padStart(2, '0'), change: 'Approved', tone: 'green', target: 'documents' as SectionId, open: () => onOpenDocuments('Verified') },
    { label: 'Documents rejected', value: String(docsRejected).padStart(2, '0'), change: 'Resubmission due', tone: 'purple', target: 'documents' as SectionId, open: () => onOpenDocuments('Rejected') },
    { label: 'Permits expiring', value: String(permitsExpiring).padStart(2, '0'), change: 'Inside 7 days', tone: 'blue', target: 'permits' as SectionId, open: () => onNavigate('permits') },
    { label: 'Inspections due', value: String(inspectionsDue).padStart(2, '0'), change: 'Scheduled + overdue', tone: 'green', target: 'inspections' as SectionId, open: () => onNavigate('inspections') },
  ]

  const alerts = buildComplianceAlerts(documents, inspections, expiryRows)

  return (
    <>
      <div className="sa-kpi-grid">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            className={`sa-kpi-card ${kpi.tone}`}
            aria-label={`Open ${kpi.label.toLowerCase()}`}
            onClick={kpi.open}
          >
            <div className="sa-kpi-top">
              <span className="sa-kpi-label">{kpi.label}</span>
              <span className="sa-kpi-change">{kpi.change}</span>
            </div>
            <strong className="sa-kpi-value">{kpi.value}</strong>
            <span className="sa-kpi-desc">{complianceProfile.name} state · this month</span>
            <span className="sa-kpi-open">Open {kpi.target} →</span>
          </button>
        ))}
      </div>

      <div className="sa-analytics-grid">
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
            <h3>Compliance alerts</h3>
            <span className="sa-panel-sub">{alerts.length} open</span>
          </div>
          <div className="cf-alert-list">
            {alerts.map((alert) => (
              <div key={alert.id} className="cf-alert">
                <div className="cf-alert-top">
                  <strong>{alert.title}</strong>
                  <span className={`sa-pill ${alert.severity === 'Critical' ? 'red' : 'amber'}`}>{alert.severity}</span>
                </div>
                <span>{alert.detail}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Queue backlog</h3>
            <button type="button" className="sa-view-link" onClick={() => onOpenDocuments('Pending')}>
              Open document queue
            </button>
          </div>
          <div className="sa-feed">
            {cityQueue
              .filter((row) => row.status !== 'Clear')
              .map((row) => (
                <div key={row.city} className="sa-feed-item">
                  <strong>
                    {row.city} <em>{row.pending} documents pending</em> · {row.avgHours} hr turnaround
                  </strong>
                  <span>{row.status === 'Backlog' ? 'Escalate capacity' : 'Monitor'}</span>
                </div>
              ))}
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
        </section>
      </div>
    </>
  )
}
