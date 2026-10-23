import { GatedAction, StatusPill } from './shared'
import { useFocusRow } from './useRecordFocus'
import { SectionKpiGrid, type SectionKpiItem } from './SectionKpiGrid'
import type { CorrectiveAction } from './complianceFleetData'
import type { ComplianceCheck } from './compliancePermissions'

export type ActionFilter = 'All' | 'Overdue' | 'In progress' | 'Completed'

const filterOptions: ActionFilter[] = ['All', 'Overdue', 'In progress', 'Completed']

type ActionsSectionProps = {
  rows: CorrectiveAction[]
  all: CorrectiveAction[]
  filter: ActionFilter
  onFilterChange: (value: ActionFilter) => void
  onComplete: (id: string) => void
  focusId?: string
  check: ComplianceCheck
}

export default function ActionsSection({
  rows,
  all,
  filter,
  onFilterChange,
  onComplete,
  focusId,
  check,
}: ActionsSectionProps) {
  const focusedRowRef = useFocusRow(focusId)
  const total = all.length
  const overdue = all.filter((row) => row.status === 'Overdue').length
  const progress = all.filter((row) => row.status === 'In progress').length
  const completed = all.filter((row) => row.status === 'Completed').length
  const oldestOverdue = all
    .filter((row) => row.status === 'Overdue')
    .reduce((max, row) => Math.max(max, row.daysOverdue), 0)
  const closure = total ? Math.round((completed / total) * 100) : 0

  const kpis: SectionKpiItem[] = [
    {
      key: 'All',
      label: 'Corrective actions',
      value: String(total).padStart(2, '0'),
      badge: `${closure}% closed`,
      desc: 'Raised from violations and audit findings',
      openLabel: 'Show every action →',
      active: filter === 'All',
    },
    {
      key: 'Overdue',
      label: 'Overdue',
      value: String(overdue).padStart(2, '0'),
      badge: `${oldestOverdue} days oldest`,
      badgeTone: 'red',
      desc: 'Owner evidence not submitted within the committed window',
      tone: 'red',
      openLabel: 'Show overdue actions →',
      active: filter === 'Overdue',
    },
    {
      key: 'In progress',
      label: 'In progress',
      value: String(progress).padStart(2, '0'),
      badge: 'With the owner',
      badgeTone: 'blue',
      desc: 'Evidence requested and the fix under way',
      tone: 'blue',
      openLabel: 'Show actions in progress →',
      active: filter === 'In progress',
    },
    {
      key: 'Completed',
      label: 'Completed',
      value: String(completed).padStart(2, '0'),
      badge: 'Closed out',
      badgeTone: 'green',
      desc: 'Evidence attached, reviewed and signed off',
      tone: 'green',
      openLabel: 'Show completed actions →',
      active: filter === 'Completed',
    },
  ]

  return (
    <>
      <SectionKpiGrid items={kpis} onSelect={(key) => onFilterChange(key as ActionFilter)} />

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Corrective actions</h3>
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
            An action closes only when the owner evidence is attached and reviewed.
          </span>
          <span className="sa-toolbar-meta">
            {rows.length} of {total} actions
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No corrective actions match this filter.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
              Show all
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Violation</th>
                  <th>Vehicle</th>
                  <th>Owner</th>
                  <th>Due on</th>
                  <th>Overdue by</th>
                  <th>Evidence</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((action) => (
                  <tr
                    key={action.id}
                    ref={action.id === focusId ? focusedRowRef : undefined}
                    className={action.id === focusId ? 'sa-row-selected' : undefined}
                  >
                    <td className="sa-cell-strong">
                      {action.action}
                      <span className="sa-cell-sub">{action.id}</span>
                    </td>
                    <td>{action.violation}</td>
                    <td>{action.vehicle}</td>
                    <td>{action.owner}</td>
                    <td>{action.dueOn}</td>
                    <td className={action.daysOverdue > 0 ? 'sa-num cf-warn-num' : 'sa-num'}>
                      {action.daysOverdue > 0 ? `${action.daysOverdue} days` : '—'}
                    </td>
                    <td>{action.evidence}</td>
                    <td>
                      <StatusPill status={action.status} />
                    </td>
                    <td>
                      {action.status === 'Completed' ? (
                        <span className="sa-approval-meta">Closed</span>
                      ) : (
                        <GatedAction
                          check={check}
                          permission="action.complete"
                          context={{ daysOverdue: action.daysOverdue }}
                          className="sa-btn-ghost"
                          onClick={() => onComplete(action.id)}
                        >
                          Mark complete
                        </GatedAction>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
