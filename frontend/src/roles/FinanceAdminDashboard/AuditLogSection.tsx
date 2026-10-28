import { useMemo, useState } from 'react'
import type { AuditEntry, SectionId } from './financeAdminData'

type AuditLogSectionProps = {
  audit: AuditEntry[]
  onNavigate: (id: SectionId) => void
}

const areaFilters: Array<'All' | AuditEntry['area']> = [
  'All',
  'commission',
  'settlements',
  'owner-settlements',
  'operator-payments',
  'customer-payments',
  'payouts',
  'invoices',
  'refunds',
  'reconciliation',
  'approvals',
]

const areaLabels: Partial<Record<AuditEntry['area'], string>> = {
  'owner-settlements': 'Owner settlements',
  'operator-payments': 'Operator payments',
  'customer-payments': 'Customer payments',
}

const formatArea = (area: AuditEntry['area']) =>
  areaLabels[area] ?? area.charAt(0).toUpperCase() + area.slice(1)

export default function AuditLogSection({ audit, onNavigate }: AuditLogSectionProps) {
  const [areaFilter, setAreaFilter] = useState<'All' | AuditEntry['area']>('All')
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return audit.filter((entry) => {
      const matchesArea = areaFilter === 'All' || entry.area === areaFilter
      const matchesSearch =
        !search ||
        entry.action.toLowerCase().includes(search) ||
        entry.detail.toLowerCase().includes(search) ||
        entry.actor.toLowerCase().includes(search)
      return matchesArea && matchesSearch
    })
  }, [audit, areaFilter, query])

  const resetFilters = () => {
    setAreaFilter('All')
    setQuery('')
  }

  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Finance audit log</h3>
          <span className="sa-panel-sub">Search and review finance actions across the platform</span>
        </div>
      </div>

      <div className="sa-chip-row" aria-label="Filter audit log by area">
        {areaFilters.map((area) => (
          <button
            key={area}
            type="button"
            className={`sa-chip ${areaFilter === area ? 'active orange' : ''}`}
            aria-pressed={areaFilter === area}
            onClick={() => setAreaFilter(area)}
          >
            {area === 'All' ? 'All areas' : formatArea(area)}
          </button>
        ))}
      </div>

      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search finance audit log"
          placeholder="Search action, actor or detail..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="sa-toolbar-meta">{rows.length} of {audit.length} entries</span>
      </div>

      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No audit entries match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={resetFilters}>Reset filters</button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Area</th>
                <th>Detail</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id}>
                  <td className="sa-num">{entry.time}</td>
                  <td className="sa-cell-strong">{entry.actor}</td>
                  <td>{entry.action}</td>
                  <td>{formatArea(entry.area)}</td>
                  <td>{entry.detail}</td>
                  <td>
                    <button type="button" className="sa-btn-ghost" onClick={() => onNavigate(entry.area)}>
                      Go to {formatArea(entry.area)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
