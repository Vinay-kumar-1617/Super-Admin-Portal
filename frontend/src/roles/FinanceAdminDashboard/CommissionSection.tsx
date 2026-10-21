import { useMemo, useState } from 'react'
import { RateCell, ScopePill, StatusPill } from './shared'
import {
  financeProfile,
  type CommissionChange,
  type CommissionRate,
  type CommissionScope,
} from './financeAdminData'

type CommissionSectionProps = {
  rates: CommissionRate[]
  history: CommissionChange[]
  onUpdateRate: (id: string, rate: number) => void
  onSchedule: (scope: CommissionScope, name: string, rate: number, effectiveFrom: string) => void
}

const scopeFilters: Array<'All' | CommissionScope> = ['All', 'State', 'City', 'Vehicle Type']
const scopeOptions: CommissionScope[] = ['State', 'City', 'Vehicle Type']

export default function CommissionSection({ rates, history, onUpdateRate, onSchedule }: CommissionSectionProps) {
  const [filter, setFilter] = useState<'All' | CommissionScope>('All')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState('')
  const [scheduleScope, setScheduleScope] = useState<CommissionScope>('City')
  const [scheduleName, setScheduleName] = useState('')
  const [scheduleRate, setScheduleRate] = useState('')
  const [scheduleDate, setScheduleDate] = useState('2026-05-01')
  const [formError, setFormError] = useState('')

  const rows = useMemo(
    () =>
      rates.filter(
        (rate) =>
          (filter === 'All' || rate.scope === filter) &&
          (query.trim() === '' ||
            rate.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            rate.scope.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [rates, filter, query],
  )

  const startEdit = (rate: CommissionRate) => {
    setEditingId(rate.id)
    setEditRate(String(rate.rate))
  }

  const commitEdit = (rate: CommissionRate) => {
    const value = Number(editRate)
    if (!Number.isFinite(value) || value <= 0) return
    onUpdateRate(rate.id, value)
    setEditingId(null)
  }

  const submitSchedule = () => {
    const value = Number(scheduleRate)
    if (!scheduleName.trim()) {
      setFormError('Enter the state, city or vehicle type name.')
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      setFormError('Enter a commission rate greater than zero.')
      return
    }
    onSchedule(scheduleScope, scheduleName.trim(), value, scheduleDate)
    setScheduleName('')
    setScheduleRate('')
    setFormError('')
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Commission rates</h3>
          <div className="sa-chip-row">
            {scopeFilters.map((option) => (
              <button
                key={option}
                type="button"
                className={`sa-chip ${filter === option ? 'active orange' : ''}`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search commission scopes"
            placeholder="Search state, city or vehicle type..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="sa-toolbar-meta">
            {rows.length} of {rates.length} rates · edit is clamped to the cap set by the super admin
          </span>
        </div>
        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No commission rates match the current filters.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => {
              setFilter('All')
              setQuery('')
            }}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Rate / cap</th>
                  <th>Effective from</th>
                  <th>Status</th>
                  <th>Updated by</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((rate) => (
                  <tr key={rate.id}>
                    <td className="sa-cell-strong">
                      {rate.name}
                      <span className="sa-cell-sub">
                        <ScopePill value={rate.scope} /> {rate.id}
                      </span>
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <span className="sa-inline-edit">
                          <input
                            className="sa-input sa-input-sm"
                            type="number"
                            step="0.5"
                            min="0"
                            max={rate.cap}
                            value={editRate}
                            onChange={(event) => setEditRate(event.target.value)}
                          />
                          <span className="sa-cell-sub">cap {rate.cap}%</span>
                          <button type="button" className="sa-btn approve" onClick={() => commitEdit(rate)}>
                            Save
                          </button>
                          <button type="button" className="sa-btn-ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <RateCell rate={rate.rate} cap={rate.cap} />
                      )}
                    </td>
                    <td className="sa-num">{rate.effectiveFrom}</td>
                    <td>
                      <StatusPill status={rate.status} />
                    </td>
                    <td className="sa-cell-sub">
                      {rate.updatedBy}
                      <span className="sa-cell-sub">{rate.updatedAt}</span>
                    </td>
                    <td>
                      <button type="button" className="sa-btn-ghost" onClick={() => startEdit(rate)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Schedule a commission change</h3>
            <span className="sa-panel-sub">Takes effect on a future date</span>
          </div>
          <div className="sa-form-grid">
            <label className="sa-field">
              <span>Scope</span>
              <select
                className="sa-select"
                value={scheduleScope}
                onChange={(event) => setScheduleScope(event.target.value as CommissionScope)}
              >
                {scopeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="sa-field">
              <span>Name</span>
              <input
                className="sa-input"
                placeholder="e.g. Bengaluru or Crane"
                value={scheduleName}
                onChange={(event) => setScheduleName(event.target.value)}
              />
            </label>
            <label className="sa-field">
              <span>Rate %</span>
              <input
                className="sa-input"
                type="number"
                step="0.5"
                min="0"
                value={scheduleRate}
                onChange={(event) => setScheduleRate(event.target.value)}
              />
            </label>
            <label className="sa-field">
              <span>Effective date</span>
              <input
                className="sa-input"
                type="date"
                value={scheduleDate}
                onChange={(event) => setScheduleDate(event.target.value)}
              />
            </label>
          </div>
          {formError && <p className="sa-form-error">{formError}</p>}
          <div className="sa-form-actions">
            <button type="button" className="sa-btn approve" onClick={submitSchedule}>
              Schedule change
            </button>
            <span className="sa-panel-sub">Changes are logged and appear in the history below.</span>
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Commission change history</h3>
            <span className="sa-panel-sub">{history.length} changes</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Scope</th>
                  <th>Change</th>
                  <th>Effective</th>
                  <th>By</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="sa-cell-strong">
                      {entry.name}
                      <span className="sa-cell-sub">{entry.scope}</span>
                    </td>
                    <td className="sa-num">
                      {entry.oldRate}% → <strong>{entry.newRate}%</strong>
                    </td>
                    <td className="sa-num">{entry.effectiveDate}</td>
                    <td className="sa-cell-sub">
                      {entry.changedBy}
                      <span className="sa-cell-sub">{entry.changedAt}</span>
                    </td>
                    <td className="sa-cell-sub">{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="sa-panel-sub">
        Commission authority: {financeProfile.name} · capped by the super admin and city limits.
      </p>
    </>
  )
}
