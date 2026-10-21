import { StatusPill } from './shared'
import {
  evidenceOptions,
  suspendDriverOptions,
  suspendVehicleOptions,
  type SuspensionRow,
} from './complianceAdminData'

type SuspensionsSectionProps = {
  rows: SuspensionRow[]
  subjectType: 'Vehicle' | 'Driver'
  onSubjectTypeChange: (value: 'Vehicle' | 'Driver') => void
  subject: string
  onSubjectChange: (value: string) => void
  reason: string
  onReasonChange: (value: string) => void
  evidence: string
  onEvidenceChange: (value: string) => void
  onSuspend: () => void
  onReinstate: (id: string) => void
}

export default function SuspensionsSection({
  rows,
  subjectType,
  onSubjectTypeChange,
  subject,
  onSubjectChange,
  reason,
  onReasonChange,
  evidence,
  onEvidenceChange,
  onSuspend,
  onReinstate,
}: SuspensionsSectionProps) {
  const subjectOptions = subjectType === 'Vehicle' ? suspendVehicleOptions : suspendDriverOptions
  const active = rows.filter((row) => row.status === 'Suspended').length
  const canSubmit = subject !== '' && reason.trim().length >= 4 && evidence !== ''

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>New suspension</h3>
          <span className="sa-panel-sub">Compliance reasons only · the document or inspection behind the suspension is recorded</span>
        </div>
        <div className="cf-form">
          <label className="cf-field">
            <span>Subject type</span>
            <select
              className="sa-select"
              value={subjectType}
              onChange={(event) => onSubjectTypeChange(event.target.value as 'Vehicle' | 'Driver')}
            >
              <option value="Vehicle">Vehicle</option>
              <option value="Driver">Driver</option>
            </select>
          </label>

          <label className="cf-field">
            <span>{subjectType}</span>
            <select className="sa-select" value={subject} onChange={(event) => onSubjectChange(event.target.value)}>
              {subjectOptions.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="cf-field cf-field-grow">
            <span>Compliance reason</span>
            <input
              className="sa-input"
              placeholder="e.g. Insurance lapsed, failed inspection, expired permit..."
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
            />
          </label>

          <label className="cf-field">
            <span>Backing record</span>
            <select className="sa-select" value={evidence} onChange={(event) => onEvidenceChange(event.target.value)}>
              {evidenceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="sa-btn reject"
            onClick={onSuspend}
            disabled={!canSubmit}
            title="Reason (min 4 characters) and a backing record are required"
          >
            Suspend {subjectType.toLowerCase()}
          </button>
        </div>
        {!canSubmit && (
          <div className="sa-toolbar">
            <span className="sa-panel-sub">A reason of at least 4 characters and a backing document or inspection are required.</span>
          </div>
        )}
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Suspensions</h3>
          <span className="sa-panel-sub">
            {active} active · reinstate once the issue is cleared
          </span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Record</th>
                <th>Subject</th>
                <th>City</th>
                <th>Reason</th>
                <th>Backing record</th>
                <th>Since</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="sa-cell-strong">{row.id}</td>
                  <td className="sa-cell-strong">
                    {row.subject}
                    <span className="sa-cell-sub">{row.subjectType}</span>
                  </td>
                  <td>{row.city}</td>
                  <td>{row.reason}</td>
                  <td>
                    <span className="sa-approval-id">{row.evidence}</span>
                  </td>
                  <td>{row.since}</td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                  <td>
                    {row.status === 'Suspended' ? (
                      <button type="button" className="sa-btn approve" onClick={() => onReinstate(row.id)}>
                        Reinstate
                      </button>
                    ) : (
                      <span className="sa-approval-meta">Reinstated {row.reinstatedOn}</span>
                    )}
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
