import { StatusPill } from './shared'
import {
  reportCards,
  type ExportRecord,
  type Finding,
  type OwnActivityEntry,
  type ScheduledReport,
} from './auditorData'

type ReportsSectionProps = {
  findings: Finding[]
  ownActivity: OwnActivityEntry[]
  exports: ExportRecord[]
  scheduledReports: ScheduledReport[]
  onExport: (name: string, kind: string) => void
  onToggleSchedule: (id: string) => void
}

export default function ReportsSection({
  findings,
  ownActivity,
  exports,
  scheduledReports,
  onExport,
  onToggleSchedule,
}: ReportsSectionProps) {
  const openFindings = findings.filter((finding) => finding.status !== 'Verified').length
  const highFindings = findings.filter((finding) => finding.severity === 'High').length
  const verifiedFindings = findings.filter((finding) => finding.status === 'Verified').length
  const fixesPending = findings.filter((finding) => finding.status === 'Assigned' || finding.status === 'In review').length

  return (
    <>
      <div className="sa-kpi-grid">
        <div className="sa-kpi-card">
          <div className="sa-kpi-top">
            <span className="sa-kpi-label">Open findings</span>
            <span className="sa-kpi-change">{highFindings} high</span>
          </div>
          <strong className="sa-kpi-value">{openFindings}</strong>
          <span className="sa-kpi-desc">Across this audit period</span>
        </div>
        <div className="sa-kpi-card green">
          <div className="sa-kpi-top">
            <span className="sa-kpi-label">Verified closed</span>
            <span className="sa-kpi-change">Re-checked</span>
          </div>
          <strong className="sa-kpi-value">{verifiedFindings}</strong>
          <span className="sa-kpi-desc">Fixes independently verified</span>
        </div>
        <div className="sa-kpi-card orange">
          <div className="sa-kpi-top">
            <span className="sa-kpi-label">Awaiting fix</span>
            <span className="sa-kpi-change">Assigned</span>
          </div>
          <strong className="sa-kpi-value">{fixesPending}</strong>
          <span className="sa-kpi-desc">With the responsible admin</span>
        </div>
        <div className="sa-kpi-card blue">
          <div className="sa-kpi-top">
            <span className="sa-kpi-label">Exports logged</span>
            <span className="sa-kpi-change">This session</span>
          </div>
          <strong className="sa-kpi-value">{exports.length}</strong>
          <span className="sa-kpi-desc">Every export is itself logged</span>
        </div>
      </div>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Audit reports</h3>
          <span className="sa-panel-sub">Summary of reviews, findings and open issues</span>
        </div>
        <div className="sa-report-grid">
          {reportCards.map((report) => (
            <article key={report.id} className="sa-report-card">
              <div className="sa-approval-tags">
                <span className="sa-pill slate">{report.kind}</span>
              </div>
              <h4>{report.name}</h4>
              <p>{report.detail}</p>
              <p>Updated {report.updated}</p>
              <div className="sa-chip-row">
                <button type="button" className="sa-btn approve" onClick={() => onExport(report.name, report.kind)}>
                  Export report
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Access review report</h3>
          <span className="sa-panel-sub">Dormant, over-privileged and former-staff accounts</span>
        </div>
        <div className="sa-toolbar">
          <span className="sa-panel-sub">
            Access review is compiled from the read-only account records. None of the accounts can be changed from the
            auditor dashboard — findings drive the changes.
          </span>
          <button type="button" className="sa-btn approve" onClick={() => onExport('Access review report', 'Access')}>
            Export access review
          </button>
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Scheduled reports</h3>
          <span className="sa-panel-sub">Recurring audit deliveries</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Cadence</th>
                <th>Recipients</th>
                <th>Last run</th>
                <th>Next run</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {scheduledReports.map((report) => (
                <tr key={report.id}>
                  <td className="sa-cell-strong">{report.name}</td>
                  <td>{report.cadence}</td>
                  <td>{report.recipients}</td>
                  <td>{report.lastRun}</td>
                  <td>{report.nextRun}</td>
                  <td><StatusPill status={report.status === 'Active' ? 'Active' : 'Held'} /></td>
                  <td>
                    <button type="button" className="sa-btn-ghost" onClick={() => onToggleSchedule(report.id)}>
                      {report.status === 'Active' ? 'Pause' : 'Resume'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Export log</h3>
            <span className="sa-panel-sub">Every export the auditor makes is written to the audit log</span>
          </div>
          <div className="sa-feed">
            {exports.length === 0 ? (
              <div className="sa-empty">
                <p>No exports yet this session.</p>
              </div>
            ) : (
              exports.map((record) => (
                <div key={record.id} className="sa-feed-item">
                  <strong>
                    {record.name} <em>{record.rows} rows</em>
                  </strong>
                  <span>{record.kind} · {record.time}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>My activity</h3>
            <span className="sa-panel-sub">Every auditor action is logged like anyone else&apos;s</span>
          </div>
          <div className="sa-feed">
            {ownActivity.length === 0 ? (
              <div className="sa-empty">
                <p>No activity recorded yet.</p>
              </div>
            ) : (
              ownActivity.map((entry) => (
                <div key={entry.id} className="sa-feed-item">
                  <strong>
                    {entry.action} <em>{entry.detail}</em>
                  </strong>
                  <span>{entry.time}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}
