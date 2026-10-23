import { GatedAction, StatusPill } from './shared'
import { useFocusRow } from './useRecordFocus'
import { SectionKpiGrid, type SectionKpiItem } from './SectionKpiGrid'
import type { ComplianceViolation } from './complianceFleetData'
import type { ComplianceCheck } from './compliancePermissions'

export type ViolationFilter = 'All' | 'Open' | 'Under review' | 'Closed'

const filterOptions: ViolationFilter[] = ['All', 'Open', 'Under review', 'Closed']

type ViolationsSectionProps = {
  rows: ComplianceViolation[]
  all: ComplianceViolation[]
  filter: ViolationFilter
  onFilterChange: (value: ViolationFilter) => void
  onResolve: (id: string) => void
  onRaiseAction: (id: string) => void
  focusId?: string
  check: ComplianceCheck
}

export default function ViolationsSection({
  rows,
  all,
  filter,
  onFilterChange,
  onResolve,
  onRaiseAction,
  focusId,
  check,
}: ViolationsSectionProps) {
  const focusedRowRef = useFocusRow(focusId)
  const total = all.length
  const open = all.filter((row) => row.status === 'Open').length
  const review = all.filter((row) => row.status === 'Under review').length
  const closed = all.filter((row) => row.status === 'Closed').length
  const critical = all.filter((row) => row.status !== 'Closed' && row.severity === 'Critical').length
  const exposure = all
    .filter((row) => row.status !== 'Closed')
    .reduce((sum, row) => sum + row.penalty, 0)
  const overdue = all.filter((row) => row.status !== 'Closed' && row.daysLeft < 0).length

  const kpis: SectionKpiItem[] = [
    {
      key: 'All',
      label: 'Violations logged',
      value: String(total).padStart(2, '0'),
      badge: `₹${exposure.toLocaleString('en-IN')} open`,
      desc: `${critical} critical · ${overdue} past the response date`,
      openLabel: 'Show every violation →',
      active: filter === 'All',
    },
    {
      key: 'Open',
      label: 'Open',
      value: String(open).padStart(2, '0'),
      badge: `${critical} critical`,
      badgeTone: 'red',
      desc: 'Not yet with the regulator, needs a response plan',
      tone: 'red',
      openLabel: 'Show open violations →',
      active: filter === 'Open',
    },
    {
      key: 'Under review',
      label: 'Under review',
      value: String(review).padStart(2, '0'),
      badge: 'With the desk',
      badgeTone: 'blue',
      desc: 'Evidence submitted, waiting on compliance sign-off',
      tone: 'blue',
      openLabel: 'Show violations under review →',
      active: filter === 'Under review',
    },
    {
      key: 'Closed',
      label: 'Closed',
      value: String(closed).padStart(2, '0'),
      badge: 'Resolved',
      badgeTone: 'green',
      desc: 'Response filed and the case closed with the authority',
      tone: 'green',
      openLabel: 'Show closed violations →',
      active: filter === 'Closed',
    },
  ]

  return (
    <>
      <SectionKpiGrid items={kpis} onSelect={(key) => onFilterChange(key as ViolationFilter)} />

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Violations & notices</h3>
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
            Every violation must carry a corrective action before the vehicle returns to dispatch.
          </span>
          <span className="sa-toolbar-meta">
            {rows.length} of {total} violations
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No violations match this filter.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
              Show all
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Violation</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Type</th>
                  <th>Authority</th>
                  <th>Issued</th>
                  <th>Respond by</th>
                  <th>Penalty</th>
                  <th>Severity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((violation) => (
                  <tr
                    key={violation.id}
                    ref={violation.id === focusId ? focusedRowRef : undefined}
                    className={violation.id === focusId ? 'sa-row-selected' : undefined}
                  >
                    <td className="sa-cell-strong">
                      {violation.id}
                      <span className="sa-cell-sub">{violation.status}</span>
                    </td>
                    <td>
                      {violation.model}
                      <span className="sa-cell-sub">
                        {violation.vehicle} · {violation.city}
                      </span>
                    </td>
                    <td>{violation.driver}</td>
                    <td>{violation.type}</td>
                    <td>{violation.authority}</td>
                    <td>{violation.issuedOn}</td>
                    <td>
                      {violation.respondBy}
                      {violation.daysLeft < 0 && violation.status !== 'Closed' && (
                        <span className="cf-flag">Response overdue</span>
                      )}
                    </td>
                    <td className="sa-num">₹{violation.penalty.toLocaleString('en-IN')}</td>
                    <td>
                      <StatusPill status={violation.severity} />
                    </td>
                    <td>
                      {violation.status === 'Closed' ? (
                        <span className="sa-approval-meta">Closed</span>
                      ) : (
                        <div className="cf-row-actions">
                          <GatedAction
                            check={check}
                            permission="action.raise"
                            className="sa-btn-ghost"
                            onClick={() => onRaiseAction(violation.id)}
                          >
                            Raise action
                          </GatedAction>
                          <GatedAction
                            check={check}
                            permission="violation.resolve"
                            className="sa-btn-ghost"
                            onClick={() => onResolve(violation.id)}
                          >
                            Resolve
                          </GatedAction>
                        </div>
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
