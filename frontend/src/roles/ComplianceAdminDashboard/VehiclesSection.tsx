import { GatedAction, StatusPill } from './shared'
import { SectionKpiGrid, type SectionKpiItem } from './SectionKpiGrid'
import type { FleetVehicle } from './complianceFleetData'
import type { ComplianceCheck } from './compliancePermissions'

export type VehicleStatusFilter = 'All' | 'Compliant' | 'Expiring' | 'Non-compliant'

const filterOptions: VehicleStatusFilter[] = ['All', 'Compliant', 'Expiring', 'Non-compliant']

type VehiclesSectionProps = {
  rows: FleetVehicle[]
  all: FleetVehicle[]
  filter: VehicleStatusFilter
  onFilterChange: (value: VehicleStatusFilter) => void
  onClearHold: (id: string) => void
  onOpenSuspensions: () => void
  check: ComplianceCheck
}

export default function VehiclesSection({
  rows,
  all,
  filter,
  onFilterChange,
  onClearHold,
  onOpenSuspensions,
  check,
}: VehiclesSectionProps) {
  const total = all.length
  const compliant = all.filter((row) => row.status === 'Compliant').length
  const expiring = all.filter((row) => row.status === 'Expiring').length
  const blocked = all.filter((row) => row.status === 'Non-compliant').length
  const averageScore = total
    ? Math.round(all.reduce((sum, row) => sum + row.score, 0) / total)
    : 0
  const share = (count: number) => (total ? Math.round((count / total) * 100) : 0)

  // Same KPI card pattern the other role dashboards use, wired to the register filter.
  const kpis: SectionKpiItem[] = [
    {
      key: 'All',
      label: 'Vehicles in scope',
      value: String(total).padStart(2, '0'),
      badge: 'Tracked',
      desc: `Average compliance score ${averageScore}% across the fleet`,
      openLabel: 'Show the whole fleet →',
      active: filter === 'All',
    },
    {
      key: 'Compliant',
      label: 'Fully compliant',
      value: String(compliant).padStart(2, '0'),
      badge: `${share(compliant)}% of fleet`,
      badgeTone: 'green',
      desc: 'Permit, insurance, fitness and inspection all current',
      tone: 'green',
      openLabel: 'Show compliant vehicles →',
      active: filter === 'Compliant',
    },
    {
      key: 'Expiring',
      label: 'Expiring soon',
      value: String(expiring).padStart(2, '0'),
      badge: 'Next 30 days',
      badgeTone: 'blue',
      desc: 'Renewals closing inside the next month',
      tone: 'blue',
      openLabel: 'Show expiring vehicles →',
      active: filter === 'Expiring',
    },
    {
      key: 'Non-compliant',
      label: 'Blocked from dispatch',
      value: String(blocked).padStart(2, '0'),
      badge: 'Holds active',
      badgeTone: 'red',
      desc: 'Held until the blocking issue clears',
      tone: 'red',
      openLabel: 'Show blocked vehicles →',
      active: filter === 'Non-compliant',
    },
  ]

  return (
    <>
      <SectionKpiGrid items={kpis} onSelect={(key) => onFilterChange(key as VehicleStatusFilter)} />

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Fleet compliance register</h3>
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
            Non-compliant vehicles are auto-held from dispatch until the blocking issue clears.
          </span>
          <button type="button" className="sa-btn-ghost" onClick={onOpenSuspensions}>
            Open suspensions
          </button>
          <span className="sa-toolbar-meta">
            {rows.length} of {total} vehicles
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No vehicles match this filter.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
              Show all
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Owner</th>
                  <th>Open issues</th>
                  <th>Score</th>
                  <th>Last audit</th>
                  <th>Next audit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="sa-cell-strong">
                      {vehicle.model}
                      <span className="sa-cell-sub">{vehicle.plate}</span>
                    </td>
                    <td>{vehicle.category}</td>
                    <td>{vehicle.city}</td>
                    <td>{vehicle.owner}</td>
                    <td className="sa-num">{vehicle.openIssues}</td>
                    <td className={vehicle.score < 60 ? 'sa-num cf-warn-num' : 'sa-num'}>{vehicle.score}%</td>
                    <td>{vehicle.lastAudit}</td>
                    <td>{vehicle.nextAudit}</td>
                    <td>
                      <StatusPill status={vehicle.status} />
                      {vehicle.blocking !== '—' && <span className="cf-flag">{vehicle.blocking}</span>}
                    </td>
                    <td>
                      {vehicle.status === 'Non-compliant' ? (
                        <GatedAction
                          check={check}
                          permission="vehicle.hold-clear"
                          context={{ openViolations: vehicle.openIssues }}
                          className="sa-btn-ghost"
                          onClick={() => onClearHold(vehicle.id)}
                        >
                          Clear hold
                        </GatedAction>
                      ) : (
                        <span className="sa-approval-meta">—</span>
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
