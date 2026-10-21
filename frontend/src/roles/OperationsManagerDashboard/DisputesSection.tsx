import { Fragment, useMemo, useState } from 'react'
import { StatCards, type StatCard } from '../CityAdminDashboard/shared'
import { type Dispute, type DisputePriority, type DisputeStatus } from './operationsData'
import { StatusPill } from './shared'

type DisputesSectionProps = {
  rows: Dispute[]
  reviewRequests?: Record<string, { at: string; request: string }>
  onRequestReview?: (id: string, request: string) => void
}

type SortKey = 'priority' | 'age' | 'value'

const disputesStyles = `
  .ops-dispute-notice {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 12px;
    padding: 12px 16px;
    border-radius: 14px;
    border: 1px solid var(--sa-line);
    background: #f4f6f8;
    color: var(--sa-muted);
    font-size: 0.8rem;
    line-height: 1.6;
  }
  .ops-dispute-notice strong {
    display: block;
    color: var(--sa-text);
    font-size: 0.84rem;
    margin-bottom: 2px;
  }
  .ops-dispute-notice svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .ops-dispute-attention {
    margin-top: 16px;
    border: 1px solid rgba(220, 38, 38, 0.25);
    border-radius: 16px;
    background: #fffafa;
    overflow: hidden;
  }
  .ops-dispute-attention-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 13px 18px;
    border-bottom: 1px solid rgba(220, 38, 38, 0.16);
    background: rgba(220, 38, 38, 0.05);
  }
  .ops-dispute-attention-head h4 {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 800;
    color: #b91c1c;
  }
  .ops-dispute-attention-head p {
    margin: 3px 0 0;
    font-size: 0.76rem;
    color: #7f1d1d;
  }
  .ops-dispute-attention-item {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding: 11px 18px;
    border-bottom: 1px solid rgba(220, 38, 38, 0.12);
    font-size: 0.82rem;
    color: var(--sa-text);
  }
  .ops-dispute-attention-item:last-child { border-bottom: 0; }
  .ops-dispute-attention-item strong { font-weight: 800; }
  .ops-dispute-attention-item span {
    color: #7f1d1d;
    font-size: 0.76rem;
  }
  .ops-dispute-attention-item em {
    margin-left: auto;
    font-style: normal;
    font-size: 0.74rem;
    font-weight: 800;
    color: #b91c1c;
  }
  .ops-dispute-filters {
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
  .ops-dispute-filters input,
  .ops-dispute-filters select {
    padding: 8px 11px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font: inherit;
    font-size: 0.8rem;
    color: var(--sa-text);
  }
  .ops-dispute-filters input { flex: 1 1 220px; }
  .ops-dispute-table-wrap {
    margin-top: 14px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    overflow-x: auto;
  }
  .ops-dispute-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1040px;
    font-size: 0.82rem;
  }
  .ops-dispute-table th {
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
  .ops-dispute-table td {
    padding: 12px 16px;
    vertical-align: top;
    color: var(--sa-text);
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  }
  .ops-dispute-table tr:last-child td { border-bottom: 0; }
  .ops-dispute-table tbody tr:hover td { background: #f8fafc; }
  .ops-dispute-table tr.breach td { background: #fffafa; }
  .ops-dispute-table tr.breach:hover td { background: #fff5f5; }
  .ops-dispute-case {
    display: grid;
    gap: 3px;
  }
  .ops-dispute-case strong { font-weight: 800; }
  .ops-dispute-case span {
    font-size: 0.73rem;
    color: var(--sa-muted);
  }
  .ops-dispute-aging {
    display: grid;
    gap: 5px;
    min-width: 118px;
  }
  .ops-dispute-aging-bar {
    position: relative;
    height: 6px;
    border-radius: 999px;
    background: #eef2f5;
    overflow: hidden;
  }
  .ops-dispute-aging-bar i {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 999px;
    background: var(--sa-green);
  }
  .ops-dispute-aging-bar i.warn { background: #f59e0b; }
  .ops-dispute-aging-bar i.over { background: #dc2626; }
  .ops-dispute-aging span {
    font-size: 0.72rem;
    color: var(--sa-muted);
  }
  .ops-dispute-detail {
    display: grid;
    gap: 12px;
    padding: 14px 16px;
    background: #fbfcfd;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  }
  .ops-dispute-detail p {
    margin: 0;
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.6;
  }
  .ops-dispute-facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px 16px;
  }
  .ops-dispute-fact {
    display: grid;
    gap: 2px;
  }
  .ops-dispute-fact span {
    font-size: 0.66rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sa-muted);
  }
  .ops-dispute-fact strong {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--sa-text);
  }
  .ops-dispute-timeline {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .ops-dispute-timeline li {
    display: flex;
    gap: 10px;
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.5;
  }
  .ops-dispute-timeline li::before {
    content: '•';
    color: var(--sa-brand);
    font-weight: 800;
  }
  .ops-dispute-timeline time {
    min-width: 118px;
    font-weight: 700;
    color: var(--sa-muted);
  }
  .ops-dispute-next {
    display: grid;
    gap: 4px;
    padding: 11px 13px;
    border-radius: 12px;
    border: 1px solid var(--sa-line);
    background: #fff;
  }
  .ops-dispute-next span {
    font-size: 0.66rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sa-muted);
  }
  .ops-dispute-next strong {
    font-size: 0.8rem;
    color: var(--sa-text);
    line-height: 1.5;
  }
  .ops-dispute-review {
    display: grid;
    gap: 8px;
    padding: 11px 13px;
    border-radius: 12px;
    border: 1px solid rgba(255, 107, 44, 0.3);
    background: rgba(255, 107, 44, 0.06);
  }
  .ops-dispute-review strong {
    font-size: 0.78rem;
    color: var(--sa-brand-deep);
  }
  .ops-dispute-review p {
    margin: 0;
    font-size: 0.76rem;
    color: #475569;
    line-height: 1.5;
  }
  .ops-dispute-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
    white-space: nowrap;
  }
  .ops-dispute-review input {
    width: 100%;
    padding: 8px 11px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font: inherit;
    font-size: 0.8rem;
  }
  .ops-dispute-empty {
    padding: 34px 18px;
    text-align: center;
    color: var(--sa-muted);
    font-size: 0.84rem;
  }
`

const priorityWeight: Record<DisputePriority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }

const amountValue = (amount?: string) => {
  if (!amount) return 0
  const digits = amount.replace(/[^0-9.]/g, '')
  const value = Number(digits)
  return Number.isFinite(value) ? value : 0
}

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`

export default function DisputesSection({ rows, reviewRequests = {}, onRequestReview }: DisputesSectionProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DisputeStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | DisputePriority>('all')
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [requestText, setRequestText] = useState('')

  const categories = useMemo(() => Array.from(new Set(rows.map((row) => row.category))).sort(), [rows])

  const totals = useMemo(() => {
    const open = rows.filter((row) => row.status !== 'Resolved')
    const breach = open.filter((row) => row.daysOpen > row.targetDays)
    const valueAtRisk = open.reduce((sum, row) => sum + amountValue(row.amount), 0)
    const resolved = rows.filter((row) => row.status === 'Resolved')
    const avgDays = resolved.length
      ? Math.round(resolved.reduce((sum, row) => sum + row.daysOpen, 0) / resolved.length)
      : 0
    return {
      open: open.length,
      breach: breach.length,
      valueAtRisk,
      resolved: resolved.length,
      avgDays,
      oldest: open.reduce((max, row) => Math.max(max, row.daysOpen), 0),
    }
  }, [rows])

  const cards: StatCard[] = useMemo(
    () => [
      { key: 'open', label: 'Open cases', value: totals.open, tone: 'blue', sub: `${rows.length} in scope` },
      { key: 'breach', label: 'Past target', value: totals.breach, tone: 'red', sub: 'Over the SLA window' },
      { key: 'value', label: 'Value at risk', value: inr(totals.valueAtRisk), tone: 'amber', sub: 'Claimed on open cases' },
      { key: 'oldest', label: 'Oldest open', value: `${totals.oldest} d`, tone: 'amber', sub: 'Days since raised' },
      { key: 'resolved', label: 'Resolved', value: totals.resolved, tone: 'green', sub: 'Closed in the period' },
      { key: 'avg', label: 'Avg resolution', value: `${totals.avgDays} d`, tone: 'purple', sub: 'Across closed cases' },
    ],
    [rows, totals],
  )

  const breaching = useMemo(
    () =>
      rows
        .filter((row) => row.status !== 'Resolved' && row.daysOpen > row.targetDays)
        .sort((a, b) => b.daysOpen - b.targetDays - (a.daysOpen - a.targetDays)),
    [rows],
  )

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filtered = rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (categoryFilter !== 'all' && row.category !== categoryFilter) return false
      if (priorityFilter !== 'all' && row.priority !== priorityFilter) return false
      if (!term) return true
      const haystack = [
        row.id,
        row.bookingId,
        row.raisedBy,
        row.against,
        row.category,
        row.machine,
        row.locality,
        row.owner,
        row.summary,
        row.nextStep,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })

    return filtered.sort((a, b) => {
      if (sortKey === 'age') return b.daysOpen - a.daysOpen
      if (sortKey === 'value') return amountValue(b.amount) - amountValue(a.amount)
      const aResolved = a.status === 'Resolved' ? 1 : 0
      const bResolved = b.status === 'Resolved' ? 1 : 0
      if (aResolved !== bResolved) return aResolved - bResolved
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[a.priority] - priorityWeight[b.priority]
      }
      return b.daysOpen - a.daysOpen
    })
  }, [rows, search, statusFilter, categoryFilter, priorityFilter, sortKey])

  const submitRequest = (row: Dispute) => {
    if (requestText.trim().length < 6) return
    onRequestReview?.(row.id, requestText.trim())
    setRequestingId(null)
    setRequestText('')
  }

  return (
    <section className="sa-panel">
      <style>{disputesStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Disputes &amp; tickets</h3>
          <span className="sa-panel-sub">
            {totals.open} open · {totals.breach} past target · {inr(totals.valueAtRisk)} claimed on open cases
          </span>
        </div>
        <div className="finance-header-controls">
          <span className="sa-pill slate">Read-only</span>
        </div>
      </div>

      <div className="ops-dispute-notice">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div>
          <strong>Read-only — you can review case files and chase the owner, but outcomes stay with the city and state admins.</strong>
          Every case shows who holds the decision, how long it has been running against its target, and what the next step is. Use
          &ldquo;Request a decision&rdquo; to put your context in front of the owner; the request is recorded in the audit trail.
        </div>
      </div>

      <StatCards cards={cards} />

      {breaching.length > 0 && (
        <div className="ops-dispute-attention">
          <div className="ops-dispute-attention-head">
            <div>
              <h4>Needs attention — {breaching.length} past target</h4>
              <p>These cases have been open longer than the window allowed for their category.</p>
            </div>
          </div>
          {breaching.map((row) => (
            <div key={row.id} className="ops-dispute-attention-item">
              <strong>{row.id}</strong>
              <span>{row.category}</span>
              <span>· {row.raisedBy}</span>
              <span>· {row.owner}</span>
              <em>
                {row.daysOpen} d open / {row.targetDays} d target
              </em>
            </div>
          ))}
        </div>
      )}

      <div className="ops-dispute-filters">
        <input
          aria-label="Search disputes"
          placeholder="Search case id, customer, machine, locality or owner..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | DisputeStatus)}
        >
          <option value="all">All statuses</option>
          <option value="Open">Open</option>
          <option value="Under Review">Under review</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by priority"
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value as 'all' | DisputePriority)}
        >
          <option value="all">All priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select aria-label="Sort disputes" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
          <option value="priority">Sort: priority</option>
          <option value="age">Sort: oldest first</option>
          <option value="value">Sort: value at risk</option>
        </select>
        <span className="sa-toolbar-meta">
          {visible.length} of {rows.length} cases
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="ops-dispute-empty">No cases match the current filters.</p>
      ) : (
        <div className="ops-dispute-table-wrap">
          <table className="ops-dispute-table" role="grid" aria-label="Operations Manager disputes and tickets">
            <thead>
              <tr>
                <th>Case</th>
                <th>Customer</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Age vs target</th>
                <th>Owner</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th aria-label="Details" />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const over = row.daysOpen > row.targetDays
                const ratio = Math.min(100, Math.round((row.daysOpen / Math.max(1, row.targetDays)) * 100))
                const request = reviewRequests[row.id]
                return (
                  <Fragment key={row.id}>
                    <tr className={over ? 'breach' : undefined}>
                      <td>
                        <div className="ops-dispute-case">
                          <strong>{row.id}</strong>
                          <span>
                            {row.kind} · {row.priority} · {row.opened}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="ops-dispute-case">
                          <strong>{row.raisedBy}</strong>
                          <span>
                            {row.bookingId} · {row.machine}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="ops-dispute-case">
                          <strong>{row.category}</strong>
                          <span>{row.locality}</span>
                        </div>
                      </td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>
                        {row.amount ?? '—'}
                      </td>
                      <td>
                        <div className="ops-dispute-aging">
                          <div className="ops-dispute-aging-bar">
                            <i className={over ? 'over' : ratio > 80 ? 'warn' : undefined} style={{ width: `${ratio}%` }} />
                          </div>
                          <span>
                            {row.daysOpen} d open / {row.targetDays} d target
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="ops-dispute-case">
                          <strong>{row.owner}</strong>
                          <span>Updated {row.lastUpdate}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <StatusPill status={row.status} />
                      </td>
                      <td>
                        <div className="ops-dispute-actions">
                          <button
                            type="button"
                            className="sa-btn-ghost"
                            onClick={() => setExpanded((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
                            aria-expanded={Boolean(expanded[row.id])}
                          >
                            {expanded[row.id] ? 'Hide' : 'Details'}
                          </button>
                          {row.status !== 'Resolved' && (
                            <button
                              type="button"
                              className="sa-btn-ghost"
                              onClick={() => {
                                setRequestingId(row.id)
                                setRequestText('')
                                setExpanded((prev) => ({ ...prev, [row.id]: true }))
                              }}
                            >
                              Request a decision
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded[row.id] && (
                      <tr>
                        <td colSpan={8} style={{ padding: 0 }}>
                          <div className="ops-dispute-detail">
                            <p>{row.summary}</p>
                            <div className="ops-dispute-facts">
                              <div className="ops-dispute-fact">
                                <span>Against</span>
                                <strong>{row.against}</strong>
                              </div>
                              <div className="ops-dispute-fact">
                                <span>Machine</span>
                                <strong>{row.machine}</strong>
                              </div>
                              <div className="ops-dispute-fact">
                                <span>Locality</span>
                                <strong>{row.locality}</strong>
                              </div>
                              <div className="ops-dispute-fact">
                                <span>Booking</span>
                                <strong>{row.bookingId}</strong>
                              </div>
                              <div className="ops-dispute-fact">
                                <span>Evidence on file</span>
                                <strong>{row.evidenceCount} item(s)</strong>
                              </div>
                              <div className="ops-dispute-fact">
                                <span>Claimed amount</span>
                                <strong>{row.amount ?? '—'}</strong>
                              </div>
                            </div>
                            <div className="ops-dispute-next">
                              <span>Next step</span>
                              <strong>{row.nextStep}</strong>
                            </div>
                            <ul className="ops-dispute-timeline">
                              {row.timeline.map((entry) => (
                                <li key={`${row.id}-${entry.time}`}>
                                  <time>{entry.time}</time>
                                  {entry.event}
                                </li>
                              ))}
                            </ul>
                            {request && (
                              <div className="ops-dispute-review">
                                <strong>Decision requested · {request.at}</strong>
                                <p>{request.request}</p>
                              </div>
                            )}
                            {requestingId === row.id && (
                              <div className="ops-dispute-review">
                                <strong>Request a decision from {row.owner}</strong>
                                <input
                                  aria-label={`Decision request for ${row.id}`}
                                  value={requestText}
                                  onChange={(event) => setRequestText(event.target.value)}
                                  placeholder="What do you need decided, and what have you attached?"
                                />
                                <div className="ops-dispute-actions">
                                  <button
                                    type="button"
                                    className="sa-btn approve"
                                    disabled={requestText.trim().length < 6}
                                    onClick={() => submitRequest(row)}
                                  >
                                    Send request
                                  </button>
                                  <button type="button" className="sa-btn-ghost" onClick={() => setRequestingId(null)}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="ops-dispute-empty" style={{ textAlign: 'left' }}>
        Requests you send are recorded in the audit trail with your name, the case and the context you gave. You cannot change
        a case outcome — that stays with {rows.find((row) => row.status !== 'Resolved')?.owner ?? 'the city admin'}.
      </p>
    </section>
  )
}
