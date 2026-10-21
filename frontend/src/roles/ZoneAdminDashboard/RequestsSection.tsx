import { StatusPill } from './shared'
import { requestItems, requestTypeMeta, type RequestItem, type RequestType } from './zoneAdminData'

const filterOptions: Array<'All' | RequestType> = ['All', 'Maintenance', 'Incident', 'Refund', 'Change Request']

type RequestsSectionProps = {
  filter: 'All' | RequestType
  onFilterChange: (value: 'All' | RequestType) => void
  rows: RequestItem[]
  pendingCount: number
  onResolve: (id: string, status: 'Approved' | 'Rejected') => void
}

export default function RequestsSection({
  filter,
  onFilterChange,
  rows,
  pendingCount,
  onResolve,
}: RequestsSectionProps) {
  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Requests</h3>
        <div className="sa-chip-row">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`sa-chip ${filter === option ? 'active orange' : ''}`}
              onClick={() => onFilterChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="sa-toolbar">
        <span className="sa-panel-sub">
          {pendingCount} pending across all types · actions update the sidebar badge instantly
        </span>
        <span className="sa-toolbar-meta">
          {rows.length} of {requestItems.length} requests
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No requests of this type right now.</p>
          <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
            Show all requests
          </button>
        </div>
      ) : (
        <div className="sa-approval-list">
          {rows.map((item) => (
            <article key={item.id} className="sa-approval-item">
              <div className="sa-approval-copy">
                <div className="sa-approval-tags">
                  <span className="sa-approval-id">{item.id}</span>
                  <span className="sa-pill blue">{requestTypeMeta[item.type].label}</span>
                  <StatusPill status={item.status} />
                  {item.value && <span className="sa-approval-id">{item.value}</span>}
                </div>
                <strong>
                  {item.requester} · {item.locality}
                </strong>
                <p>{item.detail}</p>
                <span className="sa-approval-meta">Submitted {item.submitted}</span>
              </div>
              <div className="sa-approval-actions">
                {item.status === 'Pending' ? (
                  <>
                    <button type="button" className="sa-btn approve" onClick={() => onResolve(item.id, 'Approved')}>
                      Approve
                    </button>
                    <button type="button" className="sa-btn reject" onClick={() => onResolve(item.id, 'Rejected')}>
                      Reject
                    </button>
                  </>
                ) : (
                  <span className="sa-approval-meta">Resolved as {item.status}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
