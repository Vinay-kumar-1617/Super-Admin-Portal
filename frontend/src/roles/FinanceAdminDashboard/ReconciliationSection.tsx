import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import type { ReconItem, ReconPeriod, ReconStatus } from './financeAdminData'

type ReconciliationSectionProps = {
  items: ReconItem[]
  periods: ReconPeriod[]
  onInvestigate: (id: string, note: string) => void
  onResolve: (id: string) => void
  onClosePeriod: (id: string) => void
}

const statusFilters: Array<'All' | ReconStatus> = ['All', 'Matched', 'Mismatch', 'Investigating', 'Written off']

export default function ReconciliationSection({
  items,
  periods,
  onInvestigate,
  onResolve,
  onClosePeriod,
}: ReconciliationSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | ReconStatus>('All')
  const [query, setQuery] = useState('')
  const [note, setNote] = useState('')

  const rows = useMemo(
    () =>
      items.filter(
        (item) =>
          (statusFilter === 'All' || item.status === statusFilter) &&
          (query.trim() === '' ||
            item.reference.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.type.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [items, statusFilter, query],
  )

  const matched = items.filter((item) => item.status === 'Matched').length
  const mismatches = items.filter((item) => item.status === 'Mismatch' || item.status === 'Investigating').length
  const openPeriods = periods.filter((item) => item.status === 'Open').length

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Reconciliation ledger</h3>
          <div className="sa-chip-row">
            {statusFilters.map((option) => (
              <button
                key={option}
                type="button"
                className={`sa-chip ${statusFilter === option ? 'active orange' : ''}`}
                onClick={() => setStatusFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="sa-stat-strip">
          <div className="sa-stat">
            <span>Matched</span>
            <strong>{matched}</strong>
          </div>
          <div className="sa-stat">
            <span>Open mismatches</span>
            <strong>{mismatches}</strong>
          </div>
          <div className="sa-stat">
            <span>Open periods</span>
            <strong>{openPeriods}</strong>
          </div>
          <div className="sa-stat">
            <span>Sources</span>
            <strong>Gateway + bank</strong>
          </div>
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search reconciliation"
            placeholder="Search reference or type..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <input
            className="sa-input"
            aria-label="Investigation note"
            placeholder="Investigation note (used for flag)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <span className="sa-toolbar-meta">
            {rows.length} of {items.length} entries
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No reconciliation entries match the current filters.</p>
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                setStatusFilter('All')
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
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Gateway</th>
                  <th>Bank</th>
                  <th>Expected</th>
                  <th>Actual</th>
                  <th>Variance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="sa-cell-strong">
                      {item.reference}
                      <span className="sa-cell-sub">{item.id}</span>
                    </td>
                    <td className="sa-num">{item.type}</td>
                    <td className="sa-num">{item.gateway}</td>
                    <td className="sa-num">{item.bank}</td>
                    <td className="sa-num">{item.expected}</td>
                    <td className="sa-num">{item.actual}</td>
                    <td className="sa-num">{item.variance}</td>
                    <td>
                      <StatusPill status={item.status} />
                    </td>
                    <td>
                      <span className="sa-inline-edit">
                        {(item.status === 'Mismatch' || item.status === 'Investigating') && (
                          <>
                            <button type="button" className="sa-btn-ghost" onClick={() => onResolve(item.id)}>
                              Resolve
                            </button>
                            <button type="button" className="sa-btn-ghost" onClick={() => onInvestigate(item.id, note)}>
                              Flag
                            </button>
                          </>
                        )}
                        {item.status === 'Matched' && <span className="sa-cell-sub">{item.note || 'Reconciled'}</span>}
                        {item.status === 'Written off' && <span className="sa-cell-sub">{item.note}</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Period close</h3>
          <span className="sa-panel-sub">Close a period once gateway and bank reconcile to ₹0 variance</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Matched</th>
                <th>Mismatches</th>
                <th>Variance</th>
                <th>Status</th>
                <th>Closed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id}>
                  <td className="sa-cell-strong">
                    {period.period}
                    <span className="sa-cell-sub">{period.id}</span>
                  </td>
                  <td className="sa-num">{period.matched.toLocaleString('en-IN')}</td>
                  <td className="sa-num">{period.mismatches}</td>
                  <td className="sa-num">{period.variance}</td>
                  <td>
                    <StatusPill status={period.status} />
                  </td>
                  <td className="sa-num">{period.closedAt}</td>
                  <td>
                    {period.status === 'Closed' ? (
                      <span className="sa-cell-sub">Balanced</span>
                    ) : (
                      <button type="button" className="sa-btn approve" onClick={() => onClosePeriod(period.id)}>
                        Close period
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
