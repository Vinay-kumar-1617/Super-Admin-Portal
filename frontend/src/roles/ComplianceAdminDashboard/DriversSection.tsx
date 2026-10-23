import { GatedAction, StatusPill } from './shared'
import { useFocusRow } from './useRecordFocus'
import { SectionKpiGrid, type SectionKpiItem } from './SectionKpiGrid'
import type { DriverCredential } from './complianceFleetData'
import type { ComplianceCheck } from './compliancePermissions'

export type DriverFilter = 'All' | 'Issue' | 'Valid' | 'Expiring' | 'Expired' | 'Missing' | 'Suspended'

const filterOptions: DriverFilter[] = ['All', 'Issue', 'Valid', 'Expiring', 'Expired', 'Missing', 'Suspended']

type DriversSectionProps = {
  rows: DriverCredential[]
  all: DriverCredential[]
  filter: DriverFilter
  onFilterChange: (value: DriverFilter) => void
  onClearHold: (id: string) => void
  focusId?: string
  check: ComplianceCheck
}

export default function DriversSection({
  rows,
  all,
  filter,
  onFilterChange,
  onClearHold,
  focusId,
  check,
}: DriversSectionProps) {
  const focusedRowRef = useFocusRow(focusId)
  const total = all.length
  const valid = all.filter((row) => row.status === 'Valid').length
  const expiring = all.filter((row) => row.status === 'Expiring').length
  const expired = all.filter((row) => row.status === 'Expired').length
  const missing = all.filter((row) => row.status === 'Missing').length
  const held = all.filter((row) => row.status === 'Suspended').length
  const issues = all.filter((row) => row.status !== 'Valid').length
  const share = (count: number) => (total ? Math.round((count / total) * 100) : 0)

  const kpis: SectionKpiItem[] = [
    {
      key: 'All',
      label: 'Credentials tracked',
      value: String(total).padStart(2, '0'),
      badge: 'On file',
      desc: 'Licence, badge, medical and police verification files',
      openLabel: 'Show every credential →',
      active: filter === 'All',
    },
    {
      key: 'Valid',
      label: 'Valid',
      value: String(valid).padStart(2, '0'),
      badge: `${share(valid)}% of drivers`,
      badgeTone: 'green',
      desc: 'Cleared for dispatch with no open credential issue',
      tone: 'green',
      openLabel: 'Show valid credentials →',
      active: filter === 'Valid',
    },
    {
      key: 'Expiring',
      label: 'Expiring in 7 days',
      value: String(expiring).padStart(2, '0'),
      badge: 'Renewal due',
      badgeTone: 'blue',
      desc: 'Still valid but closing inside the next week',
      tone: 'blue',
      openLabel: 'Show expiring credentials →',
      active: filter === 'Expiring',
    },
    {
      key: 'Issue',
      label: 'Issues open',
      value: String(issues).padStart(2, '0'),
      badge: `${expired} expired · ${missing} missing`,
      badgeTone: 'red',
      desc: `${held} suspended · ${expiring} expiring inside 7 days`,
      tone: 'red',
      openLabel: 'Show credential issues →',
      active: filter === 'Issue',
    },
  ]

  return (
    <>
      <SectionKpiGrid items={kpis} onSelect={(key) => onFilterChange(key as DriverFilter)} />

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Driver credential register</h3>
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
            Expired or missing credentials hold the operator until a valid document is uploaded.
          </span>
          <span className="sa-toolbar-meta">
            {rows.length} of {total} records
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No driver credentials match this filter.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
              Show all
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>City</th>
                  <th>Credential</th>
                  <th>Reference</th>
                  <th>Expires on</th>
                  <th>Days left</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    ref={row.id === focusId ? focusedRowRef : undefined}
                    className={row.id === focusId ? 'sa-row-selected' : undefined}
                  >
                    <td className="sa-cell-strong">
                      {row.driver}
                      <span className="sa-cell-sub">{row.phone}</span>
                    </td>
                    <td>{row.city}</td>
                    <td>{row.kind}</td>
                    <td>{row.reference}</td>
                    <td>{row.expiresOn}</td>
                    <td className={row.daysLeft <= 7 ? 'sa-num cf-warn-num' : 'sa-num'}>{row.daysLeft}</td>
                    <td>
                      <StatusPill status={row.status} />
                      {row.issue && <span className="cf-flag">{row.issue}</span>}
                    </td>
                    <td>
                      {row.status === 'Valid' || row.status === 'Expiring' ? (
                        <span className="sa-approval-meta">—</span>
                      ) : (
                        <GatedAction
                          check={check}
                          permission="driver.credential-clear"
                          className="sa-btn-ghost"
                          onClick={() => onClearHold(row.id)}
                        >
                          Clear hold
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
