import { useMemo, useState } from 'react'
import { reportCards, type AuditEntry, type SectionId } from './financeAdminData'

type ReportsSectionProps = {
  audit: AuditEntry[]
  onExport: (title: string, format: string) => void
  onNavigate: (id: SectionId) => void
}

const areaFilters: Array<'All' | SectionId> = [
  'All',
  'commission',
  'settlements',
  'payouts',
  'invoices',
  'refunds',
  'reconciliation',
]

export default function ReportsSection({ audit, onExport, onNavigate }: ReportsSectionProps) {
  const [areaFilter, setAreaFilter] = useState<'All' | SectionId>('All')
  const [query, setQuery] = useState('')

  const rows = useMemo(
    () =>
      audit.filter(
        (entry) =>
          (areaFilter === 'All' || entry.area === areaFilter) &&
          (query.trim() === '' ||
            entry.action.toLowerCase().includes(query.trim().toLowerCase()) ||
            entry.detail.toLowerCase().includes(query.trim().toLowerCase()) ||
            entry.actor.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [audit, areaFilter, query],
  )

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Finance reports</h3>
          <span className="sa-panel-sub">Revenue, commission, payout and reconciliation</span>
        </div>
        <div className="sa-report-grid">
          {reportCards.map((report) => (
            <article key={report.id} className="sa-report-card">
              <h4>{report.title}</h4>
              <p>{report.description}</p>
              <div className="sa-chip-row">
                {report.formats.map((format) => (
                  <button
                    key={format}
                    type="button"
                    className="sa-chip"
                    onClick={() => onExport(report.title, format)}
                  >
                    Export {format}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Audit log</h3>
          <div className="sa-chip-row">
            {areaFilters.map((option) => (
              <button
                key={option}
                type="button"
                className={`sa-chip ${areaFilter === option ? 'active orange' : ''}`}
                onClick={() => setAreaFilter(option)}
              >
                {option === 'All' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search audit log"
            placeholder="Search action, actor or detail..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="sa-toolbar-meta">
            {rows.length} of {audit.length} entries · your own action history
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No audit entries match the current filters.</p>
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                setAreaFilter('All')
                setQuery('')
              }}
            >
              Reset filters
            </button>
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
                    <td className="sa-num">{entry.area}</td>
                    <td className="sa-cell-sub">{entry.detail}</td>
                    <td>
                      <button type="button" className="sa-btn-ghost" onClick={() => onNavigate(entry.area)}>
                        Go to {entry.area}
                      </button>
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
