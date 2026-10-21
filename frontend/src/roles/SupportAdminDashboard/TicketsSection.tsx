import { useMemo, useState } from 'react'
import { ChannelPill, PriorityPill, StatusPill, Thread } from './shared'
import {
  supportAgents,
  type SavedReply,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from './supportAdminData'

type TicketsSectionProps = {
  tickets: Ticket[]
  savedReplies: SavedReply[]
  onAssign: (id: string, agent: string) => void
  onPriority: (id: string, priority: TicketPriority) => void
  onCategory: (id: string, category: TicketCategory) => void
  onReply: (id: string, body: string, internal: boolean) => void
  onSavedReply: (id: string, reply: SavedReply) => void
  onClose: (id: string) => void
  onReopen: (id: string) => void
  onLinkBooking: (id: string, booking: string) => void
}

const statusFilters: Array<'All' | TicketStatus> = ['All', 'New', 'Open', 'Pending', 'Resolved', 'Closed']
const priorities: TicketPriority[] = ['Urgent', 'High', 'Normal', 'Low']
const categories: TicketCategory[] = ['Booking', 'Payment', 'Operator', 'Equipment', 'Account', 'Refund']

export default function TicketsSection({
  tickets,
  savedReplies,
  onAssign,
  onPriority,
  onCategory,
  onReply,
  onSavedReply,
  onClose,
  onReopen,
  onLinkBooking,
}: TicketsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All')
  const [categoryFilter, setCategoryFilter] = useState<'All' | TicketCategory>('All')
  const [assigneeFilter, setAssigneeFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(tickets[0]?.id ?? '')
  const [replyBody, setReplyBody] = useState('')
  const [internal, setInternal] = useState(false)
  const [bookingInput, setBookingInput] = useState('')

  const rows = useMemo(
    () =>
      tickets.filter(
        (item) =>
          (statusFilter === 'All' || item.status === statusFilter) &&
          (categoryFilter === 'All' || item.category === categoryFilter) &&
          (assigneeFilter === 'All' || item.assignee === assigneeFilter) &&
          (query.trim() === '' ||
            item.id.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.subject.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.requester.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [tickets, statusFilter, categoryFilter, assigneeFilter, query],
  )

  const selected = tickets.find((item) => item.id === selectedId) ?? rows[0] ?? tickets[0]

  const submitReply = () => {
    if (!selected || !replyBody.trim()) return
    onReply(selected.id, replyBody, internal)
    setReplyBody('')
    setInternal(false)
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Ticket queue</h3>
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
          <input
            className="sa-input"
            aria-label="Search tickets"
            placeholder="Search id, subject or requester..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="sa-select"
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as 'All' | TicketCategory)}
          >
            <option value="All">All categories</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="sa-select"
            aria-label="Filter by assignee"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
          >
            <option value="All">All assignees</option>
            {supportAgents.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
          <span className="sa-toolbar-meta">
            {rows.length} of {tickets.length} tickets
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No tickets match the current filters.</p>
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                setStatusFilter('All')
                setCategoryFilter('All')
                setAssigneeFilter('All')
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
                  <th>Ticket</th>
                  <th>Requester</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Updated</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="sa-cell-strong">
                      {ticket.id}
                      <span className="sa-cell-sub">{ticket.subject}</span>
                    </td>
                    <td>
                      {ticket.requester}
                      <span className="sa-cell-sub">{ticket.requesterType}</span>
                    </td>
                    <td className="sa-cell-sub">{ticket.category}</td>
                    <td>
                      <PriorityPill priority={ticket.priority} />
                    </td>
                    <td className="sa-cell-sub">{ticket.assignee}</td>
                    <td className="sa-num">{ticket.updated}</td>
                    <td>
                      <StatusPill status={ticket.status} />
                    </td>
                    <td>
                      <button type="button" className="sa-btn-ghost" onClick={() => setSelectedId(ticket.id)}>
                        {ticket.id === selected?.id ? 'Open' : 'View'}
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
              {selected.id} · {selected.subject}
            </h3>
            <div className="sa-chip-row">
              <ChannelPill channel={selected.channel} />
              <PriorityPill priority={selected.priority} />
              <StatusPill status={selected.status} />
            </div>
          </div>

          <div className="sp-person-grid">
            <div className="sp-person">
              <span>Requester</span>
              <strong>{selected.requester}</strong>
              <span>{selected.requesterType}</span>
            </div>
            <div className="sp-person">
              <span>Assignee</span>
              <select className="sa-select" value={selected.assignee} onChange={(event) => onAssign(selected.id, event.target.value)}>
                {supportAgents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>
            <div className="sp-person">
              <span>Priority</span>
              <select
                className="sa-select"
                value={selected.priority}
                onChange={(event) => onPriority(selected.id, event.target.value as TicketPriority)}
              >
                {priorities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="sp-person">
              <span>Category</span>
              <select
                className="sa-select"
                value={selected.category}
                onChange={(event) => onCategory(selected.id, event.target.value as TicketCategory)}
              >
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="sp-person">
              <span>Booking</span>
              <strong>{selected.booking}</strong>
              <span>{selected.overdue ? 'overdue' : selected.breachingSoon ? 'breaching soon' : selected.responseTarget}</span>
            </div>
            <div className="sp-person">
              <span>Opened</span>
              <strong>{selected.created}</strong>
              <span>reopened {selected.reopened}×</span>
            </div>
          </div>

          <div className="sa-form-actions" style={{ paddingTop: 16 }}>
            <input
              className="sa-input"
              aria-label="Link a booking"
              placeholder="Link booking e.g. BK-88213"
              value={bookingInput}
              onChange={(event) => setBookingInput(event.target.value)}
            />
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                if (bookingInput.trim()) {
                  onLinkBooking(selected.id, bookingInput.trim())
                  setBookingInput('')
                }
              }}
            >
              Link booking
            </button>
            {selected.status !== 'Closed' ? (
              <button type="button" className="sa-btn reject" onClick={() => onClose(selected.id)}>
                Close ticket
              </button>
            ) : (
              <button type="button" className="sa-btn approve" onClick={() => onReopen(selected.id)}>
                Reopen ticket
              </button>
            )}
          </div>

          <div className="sa-panel-header">
            <h3>Conversation</h3>
            <span className="sa-panel-sub">Internal notes are not visible to the user</span>
          </div>
          <Thread messages={selected.messages} />

          <div className="sa-panel-header">
            <h3>Reply</h3>
            <span className="sa-panel-sub">Use a saved reply or write your own</span>
          </div>
          <div className="sa-form-grid">
            <label className="sa-field">
              <span>Saved reply</span>
              <select
                className="sa-select"
                value=""
                onChange={(event) => {
                  const reply = savedReplies.find((item) => item.id === event.target.value)
                  if (reply) onSavedReply(selected.id, reply)
                }}
              >
                <option value="">Choose a saved reply…</option>
                {savedReplies.map((reply) => (
                  <option key={reply.id} value={reply.id}>
                    {reply.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="sa-field">
              <span>Visibility</span>
              <select className="sa-select" value={internal ? 'internal' : 'public'} onChange={(event) => setInternal(event.target.value === 'internal')}>
                <option value="public">Public reply to user</option>
                <option value="internal">Internal note (hidden)</option>
              </select>
            </label>
            <label className="sa-field" style={{ gridColumn: '1 / -1' }}>
              <span>{internal ? 'Internal note' : 'Reply'}</span>
              <textarea
                className="sa-input"
                rows={3}
                placeholder={internal ? 'Add a note for the support team…' : 'Write a reply to the requester…'}
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
              />
            </label>
          </div>
          <div className="sa-form-actions">
            <button type="button" className="sa-btn approve" onClick={submitReply} disabled={!replyBody.trim()}>
              {internal ? 'Add internal note' : 'Send reply'}
            </button>
          </div>
        </section>
      )}
    </>
  )
}
