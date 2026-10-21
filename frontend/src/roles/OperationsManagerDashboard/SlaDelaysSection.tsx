import { useEffect, useMemo, useState } from 'react'
import { StatCards, type StatCard } from '../CityAdminDashboard/shared'
import { slaDailyRows, slaTargets } from './opsReportsData'
import {
  formatCountdown,
  opsDeadlineKinds,
  opsDeadlines,
  slaEscalationTarget,
  warningState,
  type OpsDeadline,
  type OpsDeadlineKind,
} from './opsSlaData'
import { opsProfile } from './operationsData'

type SlaDelaysSectionProps = {
  escalated: Record<string, string>
  onEscalate: (id: string, reason: string) => void
  onToast?: (message: string) => void
}

type SortKey = 'soonest' | 'longest'

const slaStyles = `
  .ops-sla-board {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
    margin-top: 16px;
  }
  .ops-sla-card {
    border: 1px solid var(--sa-line);
    border-top: 3px solid var(--sa-green);
    border-radius: 16px;
    padding: 15px 17px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 10px;
  }
  .ops-sla-card.warning { border-top-color: #f59e0b; }
  .ops-sla-card.breached { border-top-color: #dc2626; }
  .ops-sla-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .ops-sla-card-title {
    display: grid;
    gap: 4px;
  }
  .ops-sla-card-title strong {
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
    line-height: 1.35;
  }
  .ops-sla-card-title span {
    font-size: 0.72rem;
    color: var(--sa-muted);
  }
  .ops-sla-countdown {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 12px;
    background: #f4f6f8;
  }
  .ops-sla-countdown.warning { background: rgba(245, 158, 11, 0.14); }
  .ops-sla-countdown.breached { background: rgba(220, 38, 38, 0.12); }
  .ops-sla-countdown strong {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--sa-text);
    font-variant-numeric: tabular-nums;
  }
  .ops-sla-countdown.warning strong { color: #b45309; }
  .ops-sla-countdown.breached strong { color: #b91c1c; }
  .ops-sla-countdown span {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sa-muted);
  }
  .ops-sla-card p {
    margin: 0;
    font-size: 0.79rem;
    color: #475569;
    line-height: 1.55;
  }
  .ops-sla-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 6px 12px;
  }
  .ops-sla-meta div {
    display: grid;
    gap: 2px;
  }
  .ops-sla-meta span {
    font-size: 0.64rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sa-muted);
  }
  .ops-sla-meta strong {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--sa-text);
  }
  .ops-sla-escalated {
    display: grid;
    gap: 3px;
    padding: 9px 11px;
    border-radius: 12px;
    border: 1px solid rgba(220, 38, 38, 0.25);
    background: rgba(220, 38, 38, 0.06);
  }
  .ops-sla-escalated strong { font-size: 0.76rem; color: #b91c1c; }
  .ops-sla-escalated span { font-size: 0.72rem; color: #475569; }
  .ops-sla-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ops-sla-actions input {
    flex: 1 1 200px;
    padding: 8px 11px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font: inherit;
    font-size: 0.78rem;
  }
  .ops-sla-filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
    padding: 12px 14px;
    border: 1px solid var(--sa-line);
    border-radius: 14px;
    background: #fbfcfd;
  }
  .ops-sla-filters input,
  .ops-sla-filters select {
    padding: 8px 11px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font: inherit;
    font-size: 0.8rem;
    color: var(--sa-text);
  }
  .ops-sla-filters input { flex: 1 1 220px; }
  .ops-sla-table-wrap {
    margin-top: 14px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    overflow-x: auto;
  }
  .ops-sla-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 940px;
    font-size: 0.82rem;
  }
  .ops-sla-table th {
    text-align: left;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sa-muted);
    padding: 12px 16px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: #fbfcfd;
    white-space: nowrap;
  }
  .ops-sla-table td {
    padding: 12px 16px;
    vertical-align: top;
    color: var(--sa-text);
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  }
  .ops-sla-table tr:last-child td { border-bottom: 0; }
  .ops-sla-table tbody tr:hover td { background: #f8fafc; }
  .ops-sla-table tr.breached td { background: #fffafa; }
  .ops-sla-table tr.breached:hover td { background: #fff5f5; }
  .ops-sla-table tr.warning td { background: #fffdf5; }
  .ops-sla-ref {
    display: grid;
    gap: 2px;
  }
  .ops-sla-ref strong { font-weight: 800; }
  .ops-sla-ref span {
    font-size: 0.72rem;
    color: var(--sa-muted);
  }
  .ops-sla-block {
    margin-top: 18px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }
  .ops-sla-block-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 15px 18px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    background: #fbfcfd;
  }
  .ops-sla-block-head h4 {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
  }
  .ops-sla-block-head p {
    margin: 3px 0 0;
    font-size: 0.76rem;
    color: var(--sa-muted);
  }
  .ops-sla-compliance {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
  }
  .ops-sla-compliance-bar {
    position: relative;
    flex: 1;
    height: 6px;
    border-radius: 999px;
    background: #eef2f5;
    overflow: hidden;
  }
  .ops-sla-compliance-bar i {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 999px;
    background: var(--sa-green);
  }
  .ops-sla-compliance-bar i.warn { background: #f59e0b; }
  .ops-sla-compliance-bar i.over { background: #dc2626; }
`

const isoDay = (offset: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - offset)
  return date.toISOString().slice(0, 10)
}

type EscalateControlProps = {
  deadline: OpsDeadline
  escalatingId: string | null
  escalationReason: string
  onStart: (id: string) => void
  onChange: (value: string) => void
  onSend: (deadline: OpsDeadline) => void
  onCancel: () => void
  align?: 'start' | 'center'
}

function EscalateControl({
  deadline,
  escalatingId,
  escalationReason,
  onStart,
  onChange,
  onSend,
  onCancel,
  align = 'start',
}: EscalateControlProps) {
  if (deadline.escalated) {
    return <span className="sa-pill purple">Escalated</span>
  }
  if (escalatingId !== deadline.id) {
    return (
      <button type="button" className="sa-btn-ghost" onClick={() => onStart(deadline.id)}>
        Escalate
      </button>
    )
  }
  return (
    <div className="ops-sla-actions" style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
      <input
        aria-label={`Escalation reason for ${deadline.id}`}
        value={escalationReason}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Why does this need the City Admin?"
      />
      <button
        type="button"
        className="sa-btn approve"
        disabled={escalationReason.trim().length < 6}
        onClick={() => onSend(deadline)}
      >
        Send
      </button>
      <button type="button" className="sa-btn-ghost" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}

export default function SlaDelaysSection({ escalated, onEscalate, onToast }: SlaDelaysSectionProps) {  const [now, setNow] = useState(() => Date.now())
  const [kindFilter, setKindFilter] = useState<'all' | OpsDeadlineKind>('all')
  const [sortKey, setSortKey] = useState<SortKey>('soonest')
  const [periodId, setPeriodId] = useState('30')
  const [from, setFrom] = useState(isoDay(29))
  const [to, setTo] = useState(isoDay(0))
  const [escalatingId, setEscalatingId] = useState<string | null>(null)
  const [escalationReason, setEscalationReason] = useState('')

  // The countdowns tick once a second.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const rows = useMemo<OpsDeadline[]>(
    () =>
      opsDeadlines.map((deadline) => ({
        ...deadline,
        escalated: deadline.escalated || Boolean(escalated[deadline.id]),
        escalatedAt: escalated[deadline.id] ?? deadline.escalatedAt,
      })),
    [escalated],
  )

  const counts = useMemo(() => {
    const breached = rows.filter((row) => warningState(row.deadline, row.targetMins, now) === 'breached')
    const warning = rows.filter((row) => warningState(row.deadline, row.targetMins, now) === 'warning')
    const byKind = (kind: OpsDeadlineKind) => rows.filter((row) => row.kind === kind).length
    return {
      breached: breached.length,
      warning: warning.length,
      open: rows.filter((row) => warningState(row.deadline, row.targetMins, now) !== 'ok').length,
      escalated: rows.filter((row) => row.escalated).length,
      byKind,
    }
  }, [rows, now])

  const slaPerformance = useMemo(() => {
    const daily = slaDailyRows.filter((row) => row.date >= from && row.date <= to)
    return slaTargets.map((target) => {
      const samples = daily.filter((row) => row.sla === target.id)
      const met = samples.reduce((sum, row) => sum + row.met, 0)
      const breached = samples.reduce((sum, row) => sum + row.breached, 0)
      const total = met + breached
      return {
        ...target,
        met,
        breached,
        compliancePct: total ? Math.round((met / total) * 1000) / 10 : 0,
        avgResponseMins: samples.length
          ? Math.round(samples.reduce((sum, row) => sum + row.responseMins, 0) / samples.length)
          : 0,
        avgResolutionHrs: samples.length
          ? Math.round((samples.reduce((sum, row) => sum + row.resolutionHrs, 0) / samples.length) * 10) / 10
          : 0,
      }
    })
  }, [from, to])

  const totalMet = slaPerformance.reduce((sum, row) => sum + row.met, 0)
  const totalBreached = slaPerformance.reduce((sum, row) => sum + row.breached, 0)
  const overallCompliance = totalMet + totalBreached ? Math.round((totalMet / (totalMet + totalBreached)) * 1000) / 10 : 0

  const dailyCompliance = useMemo(() => {
    const daily = slaDailyRows.filter((row) => row.date >= from && row.date <= to)
    const dates = Array.from(new Set(daily.map((row) => row.date))).sort()
    return dates.map((date) => {
      const samples = daily.filter((row) => row.date === date)
      const met = samples.reduce((sum, row) => sum + row.met, 0)
      const breached = samples.reduce((sum, row) => sum + row.breached, 0)
      const total = met + breached
      return { date, met, breached, compliancePct: total ? Math.round((met / total) * 1000) / 10 : 0 }
    })
  }, [from, to])

  const cards: StatCard[] = useMemo(
    () => [
      { key: 'open', label: 'At risk or breached', value: counts.open, tone: 'blue', sub: `${rows.length} deadlines tracked` },
      { key: 'breached', label: 'Breached', value: counts.breached, tone: 'red', sub: 'Past the promised time' },
      { key: 'warning', label: 'Due soon', value: counts.warning, tone: 'amber', sub: 'Inside the last 25%' },
      { key: 'escalated', label: 'Escalated', value: counts.escalated, tone: 'purple', sub: 'With the City Admin' },
      { key: 'compliance', label: 'SLA compliance', value: `${overallCompliance}%`, tone: 'green', sub: 'Across every target' },
      { key: 'response', label: 'Avg response', value: `${slaPerformance.length ? Math.round(slaPerformance.reduce((sum, row) => sum + row.avgResponseMins, 0) / slaPerformance.length) : 0} min`, tone: 'slate', sub: 'First action' },
    ],
    [counts, rows.length, overallCompliance, slaPerformance],
  )

  const board = useMemo(
    () =>
      rows
        .slice()
        .sort((a, b) => {
          const diff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          return sortKey === 'soonest' ? diff : -diff
        })
        .slice(0, 6),
    [rows, sortKey],
  )

  const queue = useMemo(() => {
    const filtered = kindFilter === 'all' ? rows : rows.filter((row) => row.kind === kindFilter)
    return filtered.slice().sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }, [rows, kindFilter])

  const applyPeriod = (id: string) => {
    setPeriodId(id)
    const days = id === 'today' ? 1 : id === '7' ? 7 : id === '30' ? 30 : 90
    setFrom(isoDay(days - 1))
    setTo(isoDay(0))
  }

  const submitEscalation = (deadline: OpsDeadline) => {
    if (escalationReason.trim().length < 6) return
    onEscalate(deadline.id, escalationReason.trim())
    onToast?.(`${deadline.id} escalated to the City Admin`)
    setEscalatingId(null)
    setEscalationReason('')
  }

  return (
    <section className="sa-panel">
      <style>{slaStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>SLA &amp; delays</h3>
          <span className="sa-panel-sub">
            Live deadlines for {opsProfile.zone} zone · {counts.breached} breached · {counts.warning} due soon · escalations to{' '}
            {slaEscalationTarget}
          </span>
        </div>
        <div className="finance-header-controls">
          <span className={`sa-pill ${counts.breached > 0 ? 'red' : 'green'}`}>
            {counts.breached > 0 ? `${counts.breached} breached` : 'All targets met'}
          </span>
        </div>
      </div>

      <StatCards cards={cards} />

      <div className="ops-sla-filters" style={{ marginTop: 16 }}>
        <span className="om-filter-label">Countdown board</span>
        <select aria-label="Sort countdowns" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
          <option value="soonest">Soonest deadline first</option>
          <option value="longest">Longest running first</option>
        </select>
        <span className="sa-toolbar-meta">Showing the 6 most urgent of {rows.length}</span>
      </div>

      <div className="ops-sla-board">
        {board.map((deadline) => {
          const state = warningState(deadline.deadline, deadline.targetMins, now)
          const countdown = formatCountdown(deadline.deadline, now)
          return (
            <article key={deadline.id} className={`ops-sla-card ${state}`}>
              <div className="ops-sla-card-head">
                <div className="ops-sla-card-title">
                  <strong>{deadline.title}</strong>
                  <span>
                    {deadline.id} · {deadline.kind} · {deadline.reference}
                  </span>
                </div>
                <span className={`sa-pill ${state === 'breached' ? 'red' : state === 'warning' ? 'amber' : 'green'}`}>
                  {state === 'breached' ? 'Breached' : state === 'warning' ? 'Due soon' : 'On track'}
                </span>
              </div>

              <div className={`ops-sla-countdown ${state}`}>
                <strong>{countdown.label}</strong>
                <span>{countdown.overdue ? 'overdue' : 'remaining'}</span>
              </div>

              <p>{deadline.detail}</p>

              <div className="ops-sla-meta">
                <div>
                  <span>Owner</span>
                  <strong>{deadline.owner}</strong>
                </div>
                <div>
                  <span>Target</span>
                  <strong>{deadline.targetMins >= 60 ? `${Math.round(deadline.targetMins / 60)} h` : `${deadline.targetMins} min`}</strong>
                </div>
                <div>
                  <span>Site</span>
                  <strong>{deadline.site}</strong>
                </div>
              </div>

              {deadline.escalated && (
                <div className="ops-sla-escalated">
                  <strong>Escalated to {slaEscalationTarget}</strong>
                  <span>{deadline.escalatedAt ?? 'Escalated'}</span>
                </div>
              )}

              <div className="ops-sla-actions">
                {deadline.escalated ? (
                  <span className="sa-approval-meta">With the City Admin</span>
                ) : (
                  <EscalateControl
                    deadline={deadline}
                    escalatingId={escalatingId}
                    escalationReason={escalationReason}
                    onStart={(id) => {
                      setEscalatingId(id)
                      setEscalationReason('')
                    }}
                    onChange={setEscalationReason}
                    onSend={submitEscalation}
                    onCancel={() => setEscalatingId(null)}
                  />
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="ops-sla-filters">
        <span className="om-filter-label">Queue</span>
        <select
          aria-label="Filter deadlines by type"
          value={kindFilter}
          onChange={(event) => setKindFilter(event.target.value as 'all' | OpsDeadlineKind)}
        >
          <option value="all">All deadlines</option>
          {opsDeadlineKinds.map((kind) => (
            <option key={kind} value={kind}>
              {kind} ({counts.byKind(kind)})
            </option>
          ))}
        </select>
        <span className="sa-toolbar-meta">
          {queue.length} of {rows.length} deadlines
        </span>
      </div>

      <div className="ops-sla-table-wrap">
        <table className="ops-sla-table ops-sla-queue" role="grid" aria-label="SLA deadlines and delays">
          <thead>
            <tr>
              <th>Deadline</th>
              <th>Type</th>
              <th>Owner</th>
              <th style={{ textAlign: 'center' }}>Countdown</th>
              <th style={{ textAlign: 'center' }}>State</th>
              <th style={{ textAlign: 'center' }}>Escalation</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((deadline) => {
              const state = warningState(deadline.deadline, deadline.targetMins, now)
              const countdown = formatCountdown(deadline.deadline, now)
              return (
                <tr key={deadline.id} className={state === 'breached' ? 'breached' : state === 'warning' ? 'warning' : undefined}>
                  <td>
                    <div className="ops-sla-ref">
                      <strong>{deadline.title}</strong>
                      <span>
                        {deadline.id} · {deadline.reference} · {deadline.site}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="sa-pill blue">{deadline.kind}</span>
                  </td>
                  <td>
                    <div className="ops-sla-ref">
                      <strong>{deadline.owner}</strong>
                      <span>Target {deadline.targetMins >= 60 ? `${Math.round(deadline.targetMins / 60)} h` : `${deadline.targetMins} min`}</span>
                    </div>
                  </td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>
                    {countdown.label}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`sa-pill ${state === 'breached' ? 'red' : state === 'warning' ? 'amber' : 'green'}`}>
                      {state === 'breached' ? 'Breached' : state === 'warning' ? 'Due soon' : 'On track'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <EscalateControl
                      deadline={deadline}
                      escalatingId={escalatingId}
                      escalationReason={escalationReason}
                      onStart={(id) => {
                        setEscalatingId(id)
                        setEscalationReason('')
                      }}
                      onChange={setEscalationReason}
                      onSend={submitEscalation}
                      onCancel={() => setEscalatingId(null)}
                      align="center"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="ops-sla-block">
        <div className="ops-sla-block-head">
          <div>
            <h4>SLA performance report</h4>
            <p>
              Service targets across {from} to {to} · {totalMet} met · {totalBreached} breached · {overallCompliance}% overall
              compliance
            </p>
          </div>
          <div className="ops-sla-filters" style={{ marginTop: 0, padding: 0, border: 0, background: 'none' }}>
            <span className="om-filter-label">Period</span>
            {[
              { id: 'today', label: 'Today' },
              { id: '7', label: 'Last 7 days' },
              { id: '30', label: 'Last 30 days' },
              { id: '90', label: 'Last 90 days' },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`sa-chip ${periodId === preset.id ? 'active orange' : ''}`}
                onClick={() => applyPeriod(preset.id)}
              >
                {preset.label}
              </button>
            ))}
            <input
              className="sa-date"
              type="date"
              aria-label="SLA report from date"
              value={from}
              max={to}
              onChange={(event) => {
                setFrom(event.target.value)
                setPeriodId('custom')
              }}
            />
            <span className="om-filter-label">to</span>
            <input
              className="sa-date"
              type="date"
              aria-label="SLA report to date"
              value={to}
              min={from}
              onChange={(event) => {
                setTo(event.target.value)
                setPeriodId('custom')
              }}
            />
          </div>
        </div>

        <div className="ops-sla-table-wrap" style={{ margin: 0, border: 0, borderRadius: 0, boxShadow: 'none' }}>
          <table className="ops-sla-table" role="grid" aria-label="SLA performance by service level">
            <thead>
              <tr>
                <th>Service level</th>
                <th style={{ textAlign: 'center' }}>Target</th>
                <th style={{ textAlign: 'center' }}>Met</th>
                <th style={{ textAlign: 'center' }}>Breached</th>
                <th style={{ textAlign: 'center' }}>Compliance</th>
                <th style={{ textAlign: 'center' }}>Avg response</th>
                <th style={{ textAlign: 'center' }}>Avg resolution</th>
                <th style={{ textAlign: 'center' }}>State</th>
              </tr>
            </thead>
            <tbody>
              {slaPerformance.map((row) => {
                const state = row.compliancePct < 80 ? 'breached' : row.compliancePct < 90 ? 'warning' : 'ok'
                return (
                  <tr key={row.id} className={state === 'breached' ? 'breached' : state === 'warning' ? 'warning' : undefined}>
                    <td className="sa-cell-strong">{row.name}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>
                      {row.targetMins} min
                    </td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>
                      {row.met}
                    </td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>
                      {row.breached}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="ops-sla-compliance">
                        <div className="ops-sla-compliance-bar">
                          <i className={state === 'breached' ? 'over' : state === 'warning' ? 'warn' : undefined} style={{ width: `${row.compliancePct}%` }} />
                        </div>
                        <strong style={{ fontSize: '0.8rem' }}>{row.compliancePct}%</strong>
                      </div>
                    </td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>
                      {row.avgResponseMins} min
                    </td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>
                      {row.avgResolutionHrs} hrs
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`sa-pill ${state === 'breached' ? 'red' : state === 'warning' ? 'amber' : 'green'}`}>
                        {state === 'breached' ? 'Breached' : state === 'warning' ? 'At risk' : 'On track'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="ops-sla-table-wrap" style={{ margin: 0, border: 0, borderTop: '1px solid var(--sa-line)', borderRadius: 0, boxShadow: 'none' }}>
          <table className="ops-sla-table" role="grid" aria-label="Daily SLA compliance">
            <thead>
              <tr>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Met</th>
                <th style={{ textAlign: 'center' }}>Breached</th>
                <th style={{ textAlign: 'center' }}>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {dailyCompliance.map((row) => (
                <tr key={row.date}>
                  <td className="sa-cell-strong">{row.date}</td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>
                    {row.met}
                  </td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>
                    {row.breached}
                  </td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>
                    {row.compliancePct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="sa-toolbar-meta" style={{ display: 'block', marginTop: 14 }}>
        Escalating a deadline hands it to {slaEscalationTarget} with your reason attached. Every escalation is written to the
        audit trail with your name and the time.
      </p>
    </section>
  )
}
