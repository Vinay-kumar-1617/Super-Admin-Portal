import { StatusPill } from './shared'
import { documents as allDocuments, type ComplianceDocument, type DocStatus, type DocSubjectType } from './complianceAdminData'

const statusFilterOptions: Array<'All' | DocStatus> = ['All', 'Pending', 'Renewed', 'Verified', 'Rejected']
const typeFilterOptions: Array<'All' | DocSubjectType> = ['All', 'Driver', 'Vehicle', 'Owner', 'Fleet Partner']

type DocumentsSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | DocStatus
  onStatusChange: (value: 'All' | DocStatus) => void
  subjectType: 'All' | DocSubjectType
  onSubjectTypeChange: (value: 'All' | DocSubjectType) => void
  rows: ComplianceDocument[]
  expandedId: string | null
  onToggle: (id: string) => void
  reason: string
  onReasonChange: (value: string) => void
  onVerify: (id: string) => void
  onReject: (id: string) => void
  onReset: () => void
}

export default function DocumentsSection({
  query,
  onQueryChange,
  status,
  onStatusChange,
  subjectType,
  onSubjectTypeChange,
  rows,
  expandedId,
  onToggle,
  reason,
  onReasonChange,
  onVerify,
  onReject,
  onReset,
}: DocumentsSectionProps) {
  const awaiting = allDocuments.filter((doc) => doc.status === 'Pending' || doc.status === 'Renewed').length

  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Document verification</h3>
        <span className="sa-panel-sub">
          {awaiting} awaiting review · licence, ID and badge for drivers · registration, insurance and fitness for vehicles ·
          GST for owners and partners
        </span>
      </div>

      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search documents"
          placeholder="Search document id, holder or type..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          className="sa-select"
          aria-label="Filter by subject"
          value={subjectType}
          onChange={(event) => onSubjectTypeChange(event.target.value as 'All' | DocSubjectType)}
        >
          {typeFilterOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All subjects' : option}
            </option>
          ))}
        </select>
        <select
          className="sa-select"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'All' | DocStatus)}
        >
          {statusFilterOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All statuses' : option}
            </option>
          ))}
        </select>
        <button type="button" className="sa-btn-ghost" onClick={onReset}>
          Reset
        </button>
        <span className="sa-toolbar-meta">
          {rows.length} of {allDocuments.length} documents
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No documents match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Subject</th>
                <th>Holder</th>
                <th>City</th>
                <th>Submitted</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  expanded={expandedId === doc.id}
                  reason={reason}
                  onReasonChange={onReasonChange}
                  onToggle={() => onToggle(doc.id)}
                  onVerify={() => onVerify(doc.id)}
                  onReject={() => onReject(doc.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function DocumentRow({
  doc,
  expanded,
  reason,
  onReasonChange,
  onToggle,
  onVerify,
  onReject,
}: {
  doc: ComplianceDocument
  expanded: boolean
  reason: string
  onReasonChange: (value: string) => void
  onToggle: () => void
  onVerify: () => void
  onReject: () => void
}) {
  const awaitingAction = doc.status === 'Pending' || doc.status === 'Renewed'

  return (
    <>
      <tr className={expanded ? 'sa-row-selected' : ''}>
        <td className="sa-cell-strong">
          {doc.id}
          <span className="sa-cell-sub">{doc.kind}</span>
        </td>
        <td>
          <StatusPill status={doc.subjectType} />
        </td>
        <td>{doc.holder}</td>
        <td>{doc.city}</td>
        <td>{doc.submitted}</td>
        <td>{doc.expiry}</td>
        <td>
          <StatusPill status={doc.status} />
        </td>
        <td>
          <button type="button" className="sa-btn-ghost" onClick={onToggle}>
            {expanded ? 'Close' : 'Review'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="sa-expand-row">
          <td colSpan={8}>
            <div className="cf-review">
              <div className="cf-review-copy">
                <strong>
                  {doc.id} · {doc.kind} · {doc.holder}
                </strong>
                <p>
                  Submitted {doc.submitted} · expires {doc.expiry} · {doc.city}
                </p>
                {doc.rejectReason && (
                  <p className="cf-review-reason">
                    Rejection reason: {doc.rejectReason} · rejected {doc.rejections} time{doc.rejections === 1 ? '' : 's'}
                  </p>
                )}
                {doc.status === 'Renewed' && <p className="cf-review-note">Renewed or changed — re-verification required.</p>}
                {doc.status === 'Verified' && <p className="cf-review-note">Verified — no action needed.</p>}
              </div>

              {awaitingAction ? (
                <div className="cf-review-actions">
                  <input
                    className="sa-input"
                    aria-label="Rejection reason"
                    placeholder="Rejection reason (required to reject)..."
                    value={reason}
                    onChange={(event) => onReasonChange(event.target.value)}
                  />
                  <button type="button" className="sa-btn approve" onClick={onVerify}>
                    Verify
                  </button>
                  <button
                    type="button"
                    className="sa-btn reject"
                    onClick={onReject}
                    disabled={reason.trim().length < 4}
                    title="A reason is required so the person can resubmit"
                  >
                    Reject with reason
                  </button>
                </div>
              ) : (
                <div className="cf-review-actions">
                  <span className="sa-approval-meta">Resolved as {doc.status}.</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
