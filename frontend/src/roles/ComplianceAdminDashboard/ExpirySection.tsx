import { GatedAction, StatusPill } from './shared'
import { useFocusRow } from './useRecordFocus'
import { expiryRows as allExpiries, expiryStatus, type ExpiryRow } from './complianceAdminData'
import type { ComplianceCheck } from './compliancePermissions'

type ExpiryFilter = 'All' | 'Due soon' | 'Next 30 days' | 'Lapsed' | 'Reminded'
const filterOptions: ExpiryFilter[] = ['All', 'Due soon', 'Next 30 days', 'Lapsed', 'Reminded']

type ExpirySectionProps = {
  rows: ExpiryRow[]
  filter: ExpiryFilter
  onFilterChange: (value: ExpiryFilter) => void
  onRemind: (id: string) => void
  onRemindAll: () => void
  focusId?: string
  check: ComplianceCheck
}

export default function ExpirySection({
  rows,
  filter,
  onFilterChange,
  onRemind,
  onRemindAll,
  focusId,
  check,
}: ExpirySectionProps) {
  const focusedRowRef = useFocusRow(focusId)
  const lapsed = allExpiries.filter((row) => row.daysLeft < 0).length
  const dueSoon = allExpiries.filter((row) => row.daysLeft >= 0 && row.daysLeft <= 7).length
  const unreminded = allExpiries.filter((row) => row.daysLeft <= 7 && !row.reminded).length

  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Expiry tracking</h3>
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
          {lapsed} lapsed · {dueSoon} due within 7 days · lapsed records auto-flag the account until cleared
        </span>
        <GatedAction
          check={check}
          permission="expiry.remind"
          className="sa-btn-ghost"
          onClick={onRemindAll}
          disabled={unreminded === 0}
        >
          Remind all pending ({unreminded})
        </GatedAction>
        <span className="sa-toolbar-meta">
          {rows.length} of {allExpiries.length} records
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No expiry records match this filter.</p>
          <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
            Show all
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Owner</th>
                <th>Expires</th>
                <th>City</th>
                <th>Expiry date</th>
                <th>Days left</th>
                <th>Status</th>
                <th>Reminder</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const status = expiryStatus(row)
                return (
                  <tr
                    key={row.id}
                    ref={row.id === focusId ? focusedRowRef : undefined}
                    className={row.id === focusId ? 'sa-row-selected' : undefined}
                  >
                    <td className="sa-cell-strong">
                      {row.subject}
                      <span className="sa-cell-sub">
                        {row.kind} · {row.item}
                      </span>
                    </td>
                    <td>{row.ownerType}</td>
                    <td>{row.item}</td>
                    <td>{row.city}</td>
                    <td>{row.expiresOn}</td>
                    <td className={row.daysLeft <= 7 ? 'sa-trend-flat cf-warn-num' : 'sa-num'}>{row.daysLeft}</td>
                    <td>
                      <StatusPill status={status} />
                      {status === 'Lapsed' && <span className="cf-flag">Account flagged</span>}
                    </td>
                    <td>
                      {row.reminded ? (
                        <span className="sa-approval-meta">Reminded</span>
                      ) : (
                        <GatedAction
                          check={check}
                          permission="expiry.remind"
                          className="sa-btn-ghost"
                          onClick={() => onRemind(row.id)}
                          disabled={row.daysLeft > 7}
                          title={row.daysLeft > 7 ? 'Reminders start 7 days before expiry' : 'Send reminder'}
                        >
                          Send reminder
                        </GatedAction>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
