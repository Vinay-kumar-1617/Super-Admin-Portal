import { StatusPill } from './shared'
import { permitRows as allPermits, type PermitRow, type PermitStatus } from './complianceAdminData'

const statusFilterOptions: Array<'All' | PermitStatus> = ['All', 'Valid', 'Pending verification', 'Expiring', 'Expired', 'Missing']

type PermitsSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'All' | PermitStatus
  onStatusChange: (value: 'All' | PermitStatus) => void
  rows: PermitRow[]
  expandedId: string | null
  onToggle: (id: string) => void
  onVerify: (id: string) => void
  onReset: () => void
}

export default function PermitsSection({
  query,
  onQueryChange,
  status,
  onStatusChange,
  rows,
  expandedId,
  onToggle,
  onVerify,
  onReset,
}: PermitsSectionProps) {
  const flagged = allPermits.filter((permit) => permit.status === 'Expired' || permit.status === 'Missing').length

  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Permits</h3>
        <span className="sa-panel-sub">
          {flagged} vehicle{flagged === 1 ? '' : 's'} with an expired or missing permit · verify new permits and renewals
        </span>
      </div>

      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search permits"
          placeholder="Search permit, vehicle or driver..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <select
          className="sa-select"
          aria-label="Filter by permit status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as 'All' | PermitStatus)}
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
          {rows.length} of {allPermits.length} permits
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No permits match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Permit</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>City</th>
                <th>Valid till</th>
                <th>Days left</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((permit) => {
                const expanded = expandedId === permit.id
                const canVerify = permit.status !== 'Valid'
                return (
                  <PermitRowView
                    key={permit.id}
                    permit={permit}
                    expanded={expanded}
                    canVerify={canVerify}
                    onToggle={() => onToggle(permit.id)}
                    onVerify={() => onVerify(permit.id)}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function PermitRowView({
  permit,
  expanded,
  canVerify,
  onToggle,
  onVerify,
}: {
  permit: PermitRow
  expanded: boolean
  canVerify: boolean
  onToggle: () => void
  onVerify: () => void
}) {
  return (
    <>
      <tr className={expanded ? 'sa-row-selected' : ''}>
        <td className="sa-cell-strong">
          {permit.id}
          <span className="sa-cell-sub">{permit.kind}</span>
        </td>
        <td className="sa-cell-strong">
          {permit.vehicle}
          <span className="sa-cell-sub">{permit.model}</span>
        </td>
        <td>{permit.driver}</td>
        <td>{permit.city}</td>
        <td>{permit.validTill}</td>
        <td className={permit.daysLeft <= 7 ? 'sa-trend-flat cf-warn-num' : 'sa-num'}>{permit.daysLeft}</td>
        <td>
          <StatusPill status={permit.status} />
        </td>
        <td>
          <button type="button" className="sa-btn-ghost" onClick={onToggle}>
            {expanded ? 'Close' : 'View'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="sa-expand-row">
          <td colSpan={8}>
            <div className="cf-review">
              <div className="cf-review-copy">
                <strong>
                  {permit.id} · {permit.kind} for {permit.vehicle}
                </strong>
                <p>
                  {permit.model} · driver {permit.driver} · {permit.city} · valid till {permit.validTill}
                </p>
                {permit.status === 'Missing' && (
                  <p className="cf-review-reason">No permit on record — vehicle flagged until a permit is uploaded and verified.</p>
                )}
                {permit.status === 'Expired' && (
                  <p className="cf-review-reason">Permit expired {Math.abs(permit.daysLeft)} days ago — vehicle flagged until renewal is verified.</p>
                )}
                {permit.status === 'Expiring' && <p className="cf-review-note">Expires in {permit.daysLeft} days — reminder eligible.</p>}
                {permit.status === 'Pending verification' && <p className="cf-review-note">Renewal receipt uploaded — awaiting verification.</p>}
                {permit.status === 'Valid' && <p className="cf-review-note">Valid — no action needed.</p>}
              </div>
              <div className="cf-review-actions">
                {canVerify ? (
                  <button type="button" className="sa-btn approve" onClick={onVerify}>
                    Verify permit
                  </button>
                ) : (
                  <span className="sa-approval-meta">Verified as valid.</span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
