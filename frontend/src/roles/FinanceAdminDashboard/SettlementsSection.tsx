import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import type { Settlement, SettlementCadence, SettlementStatus } from './financeAdminData'

type SettlementsSectionProps = {
  settlements: Settlement[]
  onRun: (cadence: SettlementCadence, period: string) => void
  onFinalize: (id: string) => void
  onRerun: (id: string) => void
  onCorrect: (id: string) => void
  onAdjust: (settlementId: string, lineId: string, adjustment: string, note: string) => void
}

const statusFilters: Array<'All' | SettlementStatus> = ['All', 'Draft', 'Review', 'Finalized', 'Corrected']
const cadences: SettlementCadence[] = ['Daily', 'Weekly', 'Monthly']

export default function SettlementsSection({
  settlements,
  onRun,
  onFinalize,
  onRerun,
  onCorrect,
  onAdjust,
}: SettlementsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | SettlementStatus>('All')
  const [selectedId, setSelectedId] = useState(settlements[0]?.id ?? '')
  const [cadence, setCadence] = useState<SettlementCadence>('Monthly')
  const [period, setPeriod] = useState('Apr 2026')
  const [editingLine, setEditingLine] = useState<string | null>(null)
  const [adjValue, setAdjValue] = useState('')
  const [noteValue, setNoteValue] = useState('')

  const rows = useMemo(
    () => settlements.filter((item) => statusFilter === 'All' || item.status === statusFilter),
    [settlements, statusFilter],
  )

  const selected = settlements.find((item) => item.id === selectedId) ?? rows[0] ?? settlements[0]

  const startAdjust = (lineId: string, adjustment: string, note: string) => {
    setEditingLine(lineId)
    setAdjValue(adjustment)
    setNoteValue(note === '—' ? '' : note)
  }

  const commitAdjust = () => {
    if (!selected || !editingLine) return
    onAdjust(selected.id, editingLine, adjValue || '₹0', noteValue.trim() || '—')
    setEditingLine(null)
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Settlement runs</h3>
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
        <div className="sa-toolbar">
          <select
            className="sa-select"
            aria-label="Settlement cadence"
            value={cadence}
            onChange={(event) => setCadence(event.target.value as SettlementCadence)}
          >
            {cadences.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className="sa-input"
            aria-label="Settlement period"
            placeholder="Period label e.g. Apr 2026"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          />
          <button type="button" className="sa-btn approve" onClick={() => onRun(cadence, period.trim() || 'Current period')}>
            Run settlement
          </button>
          <span className="sa-toolbar-meta">
            {rows.length} of {settlements.length} runs
          </span>
        </div>
        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No settlement runs with this status.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => setStatusFilter('All')}>
              Show all runs
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Cadence</th>
                  <th>Bookings</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((run) => (
                  <tr key={run.id}>
                    <td className="sa-cell-strong">
                      {run.id}
                      <span className="sa-cell-sub">{run.period}</span>
                    </td>
                    <td className="sa-num">{run.cadence}</td>
                    <td className="sa-num">{run.bookings.toLocaleString('en-IN')}</td>
                    <td className="sa-num">{run.gross}</td>
                    <td className="sa-num">{run.net}</td>
                    <td>
                      <StatusPill status={run.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sa-btn-ghost"
                        onClick={() => {
                          setSelectedId(run.id)
                          setEditingLine(null)
                        }}
                      >
                        {run.id === selected?.id ? 'Reviewing' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>
              Review {selected.id} <span className="sa-panel-sub">{selected.period}</span>
            </h3>
            <StatusPill status={selected.status} />
          </div>

          <div className="sa-stat-strip">
            <div className="sa-stat">
              <span>Bookings</span>
              <strong>{selected.bookings.toLocaleString('en-IN')}</strong>
            </div>
            <div className="sa-stat">
              <span>Gross</span>
              <strong>{selected.gross}</strong>
            </div>
            <div className="sa-stat">
              <span>Commission</span>
              <strong>{selected.commission}</strong>
            </div>
            <div className="sa-stat">
              <span>Adjustments</span>
              <strong>{selected.adjustments}</strong>
            </div>
            <div className="sa-stat">
              <span>Net payout</span>
              <strong>{selected.payout}</strong>
            </div>
            <div className="sa-stat">
              <span>Run by</span>
              <strong>{selected.runBy}</strong>
            </div>
          </div>

          {selected.lines.length === 0 ? (
            <div className="sa-empty">
              <p>This run has no booking lines yet. Re-run to include the latest bookings.</p>
            </div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Owner</th>
                    <th>Gross</th>
                    <th>Commission</th>
                    <th>Adjustment</th>
                    <th>Net</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lines.map((line) => {
                    const editing = editingLine === line.id
                    return (
                      <tr key={line.id}>
                        <td className="sa-cell-strong">{line.booking}</td>
                        <td>{line.customer}</td>
                        <td className="sa-cell-sub">{line.owner}</td>
                        <td className="sa-num">{line.gross}</td>
                        <td className="sa-num">{line.commission}</td>
                        <td className="sa-num">
                          {editing ? (
                            <input
                              className="sa-input sa-input-sm"
                              value={adjValue}
                              onChange={(event) => setAdjValue(event.target.value)}
                            />
                          ) : (
                            line.adjustment
                          )}
                        </td>
                        <td className="sa-num">{line.net}</td>
                        <td className="sa-cell-sub">
                          {editing ? (
                            <input
                              className="sa-input"
                              placeholder="Cancellation, dispute or damage deduction"
                              value={noteValue}
                              onChange={(event) => setNoteValue(event.target.value)}
                            />
                          ) : (
                            line.note
                          )}
                        </td>
                        <td>
                          {editing ? (
                            <span className="sa-inline-edit">
                              <button type="button" className="sa-btn approve" onClick={commitAdjust}>
                                Save
                              </button>
                              <button type="button" className="sa-btn-ghost" onClick={() => setEditingLine(null)}>
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="sa-btn-ghost"
                              onClick={() => startAdjust(line.id, line.adjustment, line.note)}
                            >
                              Adjust
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="sa-form-actions">
            <button type="button" className="sa-btn approve" onClick={() => onFinalize(selected.id)}>
              Finalize settlement
            </button>
            <button type="button" className="sa-btn-ghost" onClick={() => onRerun(selected.id)}>
              Re-run
            </button>
            <button type="button" className="sa-btn-ghost" onClick={() => onCorrect(selected.id)}>
              Mark corrected
            </button>
            <span className="sa-panel-sub">Review bookings, amounts, commission and adjustments before finalizing.</span>
          </div>
        </section>
      )}
    </>
  )
}
