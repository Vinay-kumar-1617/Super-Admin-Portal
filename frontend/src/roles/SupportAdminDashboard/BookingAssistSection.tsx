import { useMemo, useState } from 'react'
import { StatusPill, Timeline } from './shared'
import { quickProblems, type SupportBooking, type Ticket } from './supportAdminData'

type BookingAssistSectionProps = {
  bookings: SupportBooking[]
  tickets: Ticket[]
  onCreateTicket: (bookingId: string, requester: string, problem: string) => string
  onLinkTicket: (ticketId: string, bookingId: string) => void
}

export default function BookingAssistSection({ bookings, tickets, onCreateTicket, onLinkTicket }: BookingAssistSectionProps) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(bookings[0]?.id ?? '')
  const [linkTicketId, setLinkTicketId] = useState('')

  const rows = useMemo(
    () =>
      bookings.filter(
        (item) =>
          query.trim() === '' ||
          item.id.toLowerCase().includes(query.trim().toLowerCase()) ||
          item.customer.toLowerCase().includes(query.trim().toLowerCase()) ||
          item.zone.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [bookings, query],
  )

  const selected = bookings.find((item) => item.id === selectedId) ?? rows[0] ?? bookings[0]
  const linkedTickets = selected ? tickets.filter((ticket) => ticket.booking === selected.id) : []
  const linkableTickets = tickets.filter((ticket) => ticket.booking !== selected?.id)

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Booking lookup</h3>
          <span className="sa-panel-sub">Any booking in Hyderabad · contact details are masked</span>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search bookings"
            placeholder="Search booking id, customer or zone..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="sa-toolbar-meta">
            {rows.length} of {bookings.length} bookings
          </span>
        </div>
        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No bookings match the search.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => setQuery('')}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Zone</th>
                  <th>Window</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((booking) => (
                  <tr key={booking.id}>
                    <td className="sa-cell-strong">
                      {booking.id}
                      <span className="sa-cell-sub">{booking.customer}</span>
                    </td>
                    <td>{booking.zone}</td>
                    <td className="sa-num">{booking.window}</td>
                    <td className="sa-num">{booking.amount}</td>
                    <td>
                      <StatusPill status={booking.status} />
                    </td>
                    <td>
                      <button type="button" className="sa-btn-ghost" onClick={() => setSelectedId(booking.id)}>
                        {booking.id === selected?.id ? 'Viewing' : 'View'}
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
              {selected.id} · {selected.machine}
            </h3>
            <StatusPill status={selected.status} />
          </div>

          <div className="sp-person-grid">
            <div className="sp-person">
              <span>Customer</span>
              <strong>{selected.customer}</strong>
              <span>{selected.customerMasked}</span>
            </div>
            <div className="sp-person">
              <span>Owner</span>
              <strong>{selected.owner}</strong>
              <span>{selected.ownerMasked}</span>
            </div>
            <div className="sp-person">
              <span>Operator</span>
              <strong>{selected.operator}</strong>
              <span>{selected.operatorMasked}</span>
            </div>
            <div className="sp-person">
              <span>Zone & window</span>
              <strong>{selected.zone}</strong>
              <span>{selected.window}</span>
            </div>
            <div className="sp-person">
              <span>Linked tickets</span>
              <strong>{linkedTickets.length}</strong>
              <span>{linkedTickets.map((ticket) => ticket.id).join(', ') || 'None'}</span>
            </div>
          </div>

          <div className="sa-panel-header">
            <h3>Status history</h3>
            <span className="sa-panel-sub">Full booking timeline</span>
          </div>
          <Timeline events={selected.history} />

          <div className="sa-panel-header">
            <h3>Help with a common problem</h3>
            <span className="sa-panel-sub">Creates a ticket linked to this booking</span>
          </div>
          <div className="sa-form-actions" style={{ paddingTop: 16 }}>
            {quickProblems.map((problem) => (
              <button
                key={problem}
                type="button"
                className="sa-btn-ghost"
                onClick={() => onCreateTicket(selected.id, selected.customer, problem)}
              >
                {problem}
              </button>
            ))}
          </div>

          <div className="sa-panel-header">
            <h3>Link a ticket</h3>
            <span className="sa-panel-sub">Attach an existing ticket to this booking</span>
          </div>
          <div className="sa-form-actions" style={{ paddingTop: 16 }}>
            <select className="sa-select" value={linkTicketId} onChange={(event) => setLinkTicketId(event.target.value)}>
              <option value="">Choose a ticket…</option>
              {linkableTickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.id} · {ticket.subject}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="sa-btn approve"
              onClick={() => {
                if (linkTicketId && selected) {
                  onLinkTicket(linkTicketId, selected.id)
                  setLinkTicketId('')
                }
              }}
            >
              Link ticket
            </button>
          </div>
        </section>
      )}
    </>
  )
}
