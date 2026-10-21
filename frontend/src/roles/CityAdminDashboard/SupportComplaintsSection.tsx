import { useEffect, useMemo, useState } from 'react'
import { ProgressCell, StatCards, type StatCard } from './shared'
import { cityProfile } from './cityAdminData'
import {
  hasSupportPermission,
  supportTabs,
  supportTeams,
  supportTickets,
  type SupportCategory,
  type SupportPriority,
  type SupportTab,
  type SupportTicket,
  type SupportTicketStatus,
} from './citySupportData'

const statusTones: Record<SupportTicketStatus, string> = {
  Open: 'red',
  Pending: 'amber',
  Resolved: 'green',
  Closed: 'slate',
}

const priorityTones: Record<SupportPriority, string> = {
  Critical: 'red',
  High: 'amber',
  Normal: 'blue',
  Low: 'slate',
}

const statusFilters: Array<'All' | SupportTicketStatus> = ['All', 'Open', 'Pending', 'Resolved', 'Closed']
const priorities: SupportPriority[] = ['Critical', 'High', 'Normal', 'Low']
const categories: SupportCategory[] = ['Billing', 'Machine fault', 'Booking', 'Refund', 'Staff conduct', 'Application', 'Property']
const REOPEN_LIMIT = 3

const tone = (value: number, good: number, warn: number) => (value <= good ? 'green' : value <= warn ? 'amber' : 'red')

type SupportComplaintsSectionProps = {
  onToast?: (message: string) => void
  zoneScope?: string
}

export default function SupportComplaintsSection({ onToast, zoneScope }: SupportComplaintsSectionProps) {
  const [tab, setTab] = useState<SupportTab>('tickets')
  const [tickets, setTickets] = useState<SupportTicket[]>(
    zoneScope ? supportTickets.filter((ticket) => ticket.zone === zoneScope) : supportTickets,
  )
  const [statusFilter, setStatusFilter] = useState<'All' | SupportTicketStatus>('All')
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'All' | SupportPriority>('All')
  const [categoryFilter, setCategoryFilter] = useState<'All' | SupportCategory>('All')
  const [zoneFilter, setZoneFilter] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const canAssign = hasSupportPermission('support.assign')
  const canEscalate = hasSupportPermission('support.escalate')
  const canResolve = hasSupportPermission('support.resolve')

  useEffect(() => {
    if (!selectedId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null

  const zones = ['All', ...Array.from(new Set(tickets.map((ticket) => ticket.zone)))]

  const totals = useMemo(() => {
    const byStatus = (status: SupportTicketStatus) => tickets.filter((ticket) => ticket.status === status).length
    return {
      open: byStatus('Open'),
      pending: byStatus('Pending'),
      resolved: byStatus('Resolved'),
      closed: byStatus('Closed'),
      escalated: tickets.filter((ticket) => ticket.escalated).length,
      breached: tickets.filter((ticket) => !ticket.slaResolution || (!ticket.slaFirstResponse && ticket.firstResponseMins !== null)).length,
    }
  }, [tickets])

  const statusCards: StatCard[] = statusFilters.map((status) => ({
    key: status,
    label: status === 'All' ? 'All tickets' : status,
    value: status === 'All' ? String(tickets.length) : String(tickets.filter((ticket) => ticket.status === status).length),
    tone: status === 'All' ? 'brand' : (statusTones[status as SupportTicketStatus] as StatCard['tone']),
    sub: status === 'All' ? cityProfile.name : `of ${tickets.length} total`,
  }))

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === 'All' || ticket.category === categoryFilter
    const matchesZone = zoneFilter === 'All' || ticket.zone === zoneFilter
    const term = query.trim().toLowerCase()
    const matchesQuery =
      term === '' ||
      [
        ticket.id,
        ticket.subject,
        ticket.customer,
        ticket.application ?? '',
        ticket.property ?? '',
        ticket.machineId ?? '',
        ticket.zone,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    return matchesStatus && matchesPriority && matchesCategory && matchesZone && matchesQuery
  })

  const resetFilters = () => {
    setStatusFilter('All')
    setPriorityFilter('All')
    setCategoryFilter('All')
    setZoneFilter('All')
    setQuery('')
  }

  const patchTicket = (id: string, updater: (ticket: SupportTicket) => SupportTicket) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? updater(ticket) : ticket)))
  }

  const withMessage = (ticket: SupportTicket, message: Omit<SupportTicket['messages'][number], 'id'>): SupportTicket => ({
    ...ticket,
    lastUpdate: 'just now',
    messages: [...ticket.messages, { ...message, id: `m${ticket.messages.length + 1}` }],
  })

  const addNote = (id: string, body: string) => {
    const trimmed = body.trim()
    if (trimmed === '') return
    patchTicket(id, (ticket) =>
      withMessage(ticket, { kind: 'Internal', author: cityProfile.adminName, time: 'just now', body: trimmed }),
    )
    setNoteDraft('')
    onToast?.(`Internal note added to ${id}`)
  }

  const assignTeam = (id: string, teamId: string) => {
    if (teamId === '') return
    if (!canAssign) {
      onToast?.('Assigning tickets requires the “Assign tickets” permission.')
      return
    }
    const team = supportTeams.find((item) => item.id === teamId)
    if (!team) return
    patchTicket(id, (ticket) =>
      withMessage(
        { ...ticket, teamId: team.id, team: team.name, owner: team.lead, status: ticket.status === 'Closed' ? 'Open' : ticket.status },
        { kind: 'System', author: 'System', time: 'just now', body: `Assigned to ${team.name} (${team.id}).` },
      ),
    )
    onToast?.(`${id} assigned to ${team.name}`)
  }

  const escalate = (id: string) => {
    if (!canEscalate) {
      onToast?.('Escalating issues requires the “Escalate issues” permission.')
      return
    }
    const team = supportTeams.find((item) => item.id === 'T-406')
    if (!team) return
    patchTicket(id, (ticket) =>
      withMessage(
        {
          ...ticket,
          teamId: team.id,
          team: team.name,
          owner: team.lead,
          escalated: true,
          priority: ticket.priority === 'Low' || ticket.priority === 'Normal' ? 'High' : ticket.priority,
          status: ticket.status === 'Closed' ? 'Open' : ticket.status,
        },
        { kind: 'System', author: 'System', time: 'just now', body: `Escalated to the ${team.name} by ${cityProfile.adminName}.` },
      ),
    )
    onToast?.(`${id} escalated to city desk`)
  }

  const setStatus = (id: string, status: SupportTicketStatus) => {
    if (!canResolve) {
      onToast?.('Resolving tickets requires the “Resolve & close” permission.')
      return
    }
    patchTicket(id, (ticket) =>
      withMessage(
        {
          ...ticket,
          status,
          resolutionHrs: status === 'Resolved' ? ticket.resolutionHrs ?? 8 : ticket.resolutionHrs,
          reopened: status === 'Open' ? true : ticket.reopened,
          reopenCount: status === 'Open' && ticket.status !== 'Open' ? ticket.reopenCount + 1 : ticket.reopenCount,
        },
        { kind: 'System', author: cityProfile.adminName, time: 'just now', body: status === 'Open' ? 'Ticket reopened for follow-up.' : `Ticket marked ${status}.` },
      ),
    )
    onToast?.(`${id} marked ${status}`)
  }

  const canReopen = (ticket: SupportTicket) =>
    (ticket.status === 'Resolved' || ticket.status === 'Closed') && ticket.reopenCount < REOPEN_LIMIT

  const sla = useMemo(() => {
    const withResponse = tickets.filter((ticket) => ticket.firstResponseMins !== null)
    const withResolution = tickets.filter((ticket) => ticket.resolutionHrs !== null)
    const avg = (values: number[]) => (values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length))
    const pct = (met: number, total: number) => (total === 0 ? 0 : Math.round((met / total) * 100))
    return {
      avgFirstResponse: avg(withResponse.map((ticket) => ticket.firstResponseMins ?? 0)),
      avgResolution: avg(withResolution.map((ticket) => Math.round(ticket.resolutionHrs ?? 0))),
      firstResponseSla: pct(tickets.filter((ticket) => ticket.slaFirstResponse).length, tickets.length),
      resolutionSla: pct(tickets.filter((ticket) => ticket.slaResolution).length, tickets.length),
      reopenRate: pct(tickets.filter((ticket) => ticket.reopened).length, tickets.length),
    }
  }, [tickets])

  const slaCards: StatCard[] = [
    { key: 'fr', label: 'Avg first response', value: `${sla.avgFirstResponse} min`, tone: tone(sla.avgFirstResponse, 20, 35) as StatCard['tone'], sub: 'Target ≤ 20 min', static: true },
    { key: 'res', label: 'Avg resolution', value: `${sla.avgResolution} hrs`, tone: tone(sla.avgResolution, 8, 14) as StatCard['tone'], sub: 'Target ≤ 8 hrs', static: true },
    { key: 'frsla', label: 'First-response SLA', value: `${sla.firstResponseSla}%`, tone: tone(100 - sla.firstResponseSla, 10, 25) as StatCard['tone'], sub: `${tickets.filter((ticket) => ticket.slaFirstResponse).length} of ${tickets.length} met`, static: true },
    { key: 'ressla', label: 'Resolution SLA', value: `${sla.resolutionSla}%`, tone: tone(100 - sla.resolutionSla, 15, 35) as StatCard['tone'], sub: `${tickets.filter((ticket) => ticket.slaResolution).length} of ${tickets.length} met`, static: true },
    { key: 'reopen', label: 'Reopen rate', value: `${sla.reopenRate}%`, tone: tone(sla.reopenRate, 5, 12) as StatCard['tone'], sub: `${tickets.filter((ticket) => ticket.reopened).length} reopened`, static: true },
  ]

  const authorizedTeams = selected
    ? supportTeams.filter((team) => team.authorized.includes(selected.category))
    : []

  const history = selected?.messages.filter((message) => message.kind !== 'Internal') ?? []
  const internalNotes = selected?.messages.filter((message) => message.kind === 'Internal') ?? []

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Support &amp; complaints</h3>
          <span className="sa-panel-sub">
            Support tickets, complaints, response times and case escalations across {zoneScope ?? cityProfile.name}
          </span>
        </div>
      </div>

      <div className="sa-chip-row finance-tabs">
        {supportTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sa-chip ${tab === item.id ? 'active orange' : ''}`}
            onClick={() => setTab(item.id)}
            title={item.hint}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="reports-note">
        <span className="sa-pill purple">Permission-controlled</span>
        <p>
          Assign, escalate and resolve actions are limited to the permissions granted to the City Admin; changing SLA settings is
          reserved for State Admin.
        </p>
      </div>

      {tab === 'tickets' && (
        <>
          <StatCards
            cards={statusCards}
            activeKey={statusFilter}
            onSelect={(key) => setStatusFilter(statusFilter === key ? 'All' : (key as 'All' | SupportTicketStatus))}
          />
          <div className="sa-toolbar">
            <input
              className="sa-input"
              aria-label="Search support tickets"
              placeholder="Search ticket ID, customer, application, property or machine..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select className="sa-select" aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'All' | SupportPriority)}>
              <option value="All">All priorities</option>
              {priorities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select className="sa-select" aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'All' | SupportCategory)}>
              <option value="All">All categories</option>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select className="sa-select" aria-label="Filter by zone" value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)}>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone === 'All' ? 'All zones' : zone}
                </option>
              ))}
            </select>
            <button type="button" className="sa-btn-ghost" onClick={resetFilters}>
              Reset
            </button>
            <span className="sa-toolbar-meta">
              {filteredTickets.length} of {tickets.length} tickets · {totals.open} open · {totals.escalated} escalated
            </span>
          </div>
          {filteredTickets.length === 0 ? (
            <div className="sa-empty">
              <p>No tickets match the current filters.</p>
              <button type="button" className="sa-btn-ghost" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Subject</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Zone</th>
                    <th>Team</th>
                    <th>First response</th>
                    <th>Resolution</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="sa-cell-strong">
                        {ticket.id}
                        <span className="sa-cell-sub">{ticket.channel}</span>
                      </td>
                      <td className="sa-cell-strong">
                        {ticket.subject}
                        {ticket.application && <span className="sa-cell-sub">{ticket.application}</span>}
                      </td>
                      <td>{ticket.customer}</td>
                      <td>
                        <span className="sa-pill blue">{ticket.category}</span>
                      </td>
                      <td>
                        <span className={`sa-pill ${priorityTones[ticket.priority]}`}>{ticket.priority}</span>
                      </td>
                      <td className="sa-cell-strong">{ticket.zone}</td>
                      <td>{ticket.team ?? 'Unassigned'}</td>
                      <td className="sa-num">
                        {ticket.firstResponseMins !== null ? `${ticket.firstResponseMins} min` : '—'}
                      </td>
                      <td className="sa-num">
                        {ticket.resolutionHrs !== null ? `${ticket.resolutionHrs} h` : '—'}
                      </td>
                      <td>
                        <span className={`sa-pill ${statusTones[ticket.status]}`}>{ticket.status}</span>
                        {ticket.escalated && <span className="sa-cell-sub">Escalated</span>}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="sa-table-act"
                          onClick={() => {
                            setNoteDraft('')
                            setSelectedId(ticket.id)
                          }}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'sla' && (
        <>
          <StatCards cards={slaCards} />
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>First response</th>
                  <th>Resolution</th>
                  <th>First-response SLA</th>
                  <th>Resolution SLA</th>
                  <th>Reopens</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="sa-cell-strong">{ticket.id}</td>
                    <td>{ticket.customer}</td>
                    <td>{ticket.category}</td>
                    <td>
                      <span className={`sa-pill ${priorityTones[ticket.priority]}`}>{ticket.priority}</span>
                    </td>
                    <td className="sa-num">{ticket.firstResponseMins !== null ? `${ticket.firstResponseMins} min` : '—'}</td>
                    <td className="sa-num">{ticket.resolutionHrs !== null ? `${ticket.resolutionHrs} h` : '—'}</td>
                    <td>
                      <span className={`sa-pill ${ticket.slaFirstResponse ? 'green' : 'red'}`}>
                        {ticket.slaFirstResponse ? 'Met' : 'Breached'}
                      </span>
                    </td>
                    <td>
                      <span className={`sa-pill ${ticket.slaResolution ? 'green' : 'red'}`}>
                        {ticket.slaResolution ? 'Met' : 'Breached'}
                      </span>
                    </td>
                    <td className="sa-num">{ticket.reopenCount}</td>
                    <td>
                      <span className={`sa-pill ${statusTones[ticket.status]}`}>{ticket.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'teams' && (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Scope</th>
                <th>Lead</th>
                <th>Caseload</th>
                <th>Avg first response</th>
                <th>Avg resolution</th>
                <th>Reopen rate</th>
                <th>Authorized categories</th>
              </tr>
            </thead>
            <tbody>
              {supportTeams.map((team) => (
                <tr key={team.id}>
                  <td className="sa-cell-strong">
                    {team.name}
                    <span className="sa-cell-sub">{team.id}</span>
                  </td>
                  <td>{team.scope}</td>
                  <td>{team.lead}</td>
                  <td>
                    <ProgressCell value={Math.round((team.openCases / team.capacity) * 100)} />
                    <span className="sa-cell-sub">
                      {team.openCases} of {team.capacity} open
                    </span>
                  </td>
                  <td className="sa-num">{team.avgFirstResponseMins} min</td>
                  <td className="sa-num">{team.avgResolutionHrs} h</td>
                  <td className="sa-num">{team.reopenRate}%</td>
                  <td>
                    <span className="sa-cell-sub">{team.authorized.join(' · ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="sa-modal-overlay" role="presentation" onClick={() => setSelectedId(null)}>
          <div
            className="sa-modal wide"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.id} details`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sa-modal-header">
              <div>
                <h4>{selected.subject}</h4>
                <span className="sa-approval-meta">
                  {selected.id} · {selected.customer} · opened {selected.openedAt}
                </span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={() => setSelectedId(null)}>
                ×
              </button>
            </div>

            <div className="sa-modal-body support-body">
              <div className="sa-approval-tags">
                <span className={`sa-pill ${statusTones[selected.status]}`}>{selected.status}</span>
                <span className={`sa-pill ${priorityTones[selected.priority]}`}>{selected.priority}</span>
                <span className="sa-pill blue">{selected.category}</span>
                <span className="sa-pill slate">{selected.channel}</span>
                {selected.escalated && <span className="sa-pill red">Escalated</span>}
                {selected.reopened && <span className="sa-pill amber">Reopened ×{selected.reopenCount}</span>}
              </div>

              <div className="support-meta-grid">
                <div className="support-meta-item">
                  <span>Application</span>
                  <strong>{selected.application ?? '—'}</strong>
                </div>
                <div className="support-meta-item">
                  <span>Property</span>
                  <strong>{selected.property ?? '—'}</strong>
                </div>
                <div className="support-meta-item">
                  <span>Zone</span>
                  <strong>{selected.zone}</strong>
                </div>
                <div className="support-meta-item">
                  <span>Machine</span>
                  <strong>{selected.machineId ?? '—'}</strong>
                </div>
                <div className="support-meta-item">
                  <span>Assigned team</span>
                  <strong>{selected.team ?? 'Unassigned'}</strong>
                </div>
                <div className="support-meta-item">
                  <span>Case owner</span>
                  <strong>{selected.owner}</strong>
                </div>
                <div className="support-meta-item">
                  <span>First response</span>
                  <strong>{selected.firstResponseMins !== null ? `${selected.firstResponseMins} min` : 'Pending'} {!selected.slaFirstResponse && '(SLA breached)'}</strong>
                </div>
                <div className="support-meta-item">
                  <span>Resolution time</span>
                  <strong>{selected.resolutionHrs !== null ? `${selected.resolutionHrs} h` : 'Open'}</strong>
                </div>
              </div>

              <div className="support-section-title">
                <span>Assignment &amp; escalation</span>
                <span className="sa-approval-meta">Assigned by {cityProfile.adminName}</span>
              </div>
              <div className="sa-toolbar">
                <select
                  className="sa-select"
                  aria-label="Assign or escalate case"
                  value={selected.teamId ?? ''}
                  onChange={(event) => assignTeam(selected.id, event.target.value)}
                >
                  <option value="">Select authorized team…</option>
                  {authorizedTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} · {team.openCases}/{team.capacity} open
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="sa-btn return"
                  disabled={selected.teamId === 'T-406'}
                  onClick={() => escalate(selected.id)}
                >
                  Escalate to city desk
                </button>
              </div>

              {selected.status !== 'Closed' && (
                <div className="support-compose-row">
                  {selected.status !== 'Resolved' && (
                    <button type="button" className="sa-btn approve" onClick={() => setStatus(selected.id, 'Resolved')}>
                      Mark resolved
                    </button>
                  )}
                  <button type="button" className="sa-btn ghost" onClick={() => setStatus(selected.id, 'Closed')}>
                    Close ticket
                  </button>
                </div>
              )}

              {(selected.status === 'Resolved' || selected.status === 'Closed') && (
                <div className="support-compose-row">
                  <button
                    type="button"
                    className="sa-btn primary"
                    disabled={!canReopen(selected)}
                    title={canReopen(selected) ? 'Reopen this case' : `Reopen limit (${REOPEN_LIMIT}) reached`}
                    onClick={() => setStatus(selected.id, 'Open')}
                  >
                    Reopen case
                  </button>
                </div>
              )}
              {!canReopen(selected) && (selected.status === 'Resolved' || selected.status === 'Closed') && (
                <p className="support-empty">Reopening is not permitted: reopen limit of {REOPEN_LIMIT} reached for this case.</p>
              )}

              <div className="support-section-title">
                <span>Communication history</span>
                <span className="sa-approval-meta">{history.length} entries</span>
              </div>
              <div className="support-thread">
                {history.map((message) => (
                  <div key={message.id} className={`support-msg${message.kind === 'System' ? ' system' : ''}`}>
                    <div className="support-msg-head">
                      <strong>
                        {message.author} <span className="sa-cell-sub">{message.kind}</span>
                      </strong>
                      <span className="support-msg-meta">{message.time}</span>
                    </div>
                    <p className="support-msg-body">{message.body}</p>
                  </div>
                ))}
              </div>

              <div className="support-section-title">
                <span>Internal notes</span>
                <span className="sa-approval-meta">Visible to staff only</span>
              </div>
              <div className="support-notes">
                {internalNotes.length === 0 ? (
                  <p className="support-empty">No internal notes yet.</p>
                ) : (
                  internalNotes.map((message) => (
                    <div key={message.id} className="support-msg internal">
                      <div className="support-msg-head">
                        <strong>{message.author}</strong>
                        <span className="support-msg-meta">{message.time}</span>
                      </div>
                      <p className="support-msg-body">{message.body}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="support-compose">
                <label className="sa-comment-label" htmlFor="support-note">
                  Add internal note
                </label>
                <textarea
                  id="support-note"
                  className="sa-comment-input"
                  rows={3}
                  placeholder="Record internal findings, follow-ups or vendor coordination..."
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                />
                <div className="support-compose-row">
                  <button type="button" className="sa-btn primary" disabled={noteDraft.trim() === ''} onClick={() => addNote(selected.id, noteDraft)}>
                    Add internal note
                  </button>
                </div>
              </div>
            </div>

            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={() => setSelectedId(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
