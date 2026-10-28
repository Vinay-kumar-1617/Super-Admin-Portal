import { useMemo, useState } from 'react'
import { StatusPill, Timeline } from './shared'
import { quickProblems, type SupportBooking, type Ticket } from './supportAdminData'

type BookingAssistSectionProps = {
  bookings: SupportBooking[]
  tickets: Ticket[]
  selectedBookingId: string | null
  onOpenBooking: (id: string) => void
  onBackToBookings: () => void
  onCreateTicket: (bookingId: string, requester: string, problem: string) => string
  onLinkTicket: (ticketId: string, bookingId: string) => void
}

export default function BookingAssistSection({
  bookings,
  tickets,
  selectedBookingId,
  onOpenBooking,
  onBackToBookings,
  onCreateTicket,
  onLinkTicket,
}: BookingAssistSectionProps) {
  const [query, setQuery] = useState('')
  const [linkTicketId, setLinkTicketId] = useState('')

  const rows = useMemo(
    () =>
      bookings.filter(
        (item) =>
          query.trim() === '' ||
          item.id.toLowerCase().includes(query.trim().toLowerCase()) ||
          item.customer.toLowerCase().includes(query.trim().toLowerCase()) ||
          item.owner.toLowerCase().includes(query.trim().toLowerCase()) ||
          item.operator.toLowerCase().includes(query.trim().toLowerCase()) ||
          item.machine.toLowerCase().includes(query.trim().toLowerCase()) ||
          item.zone.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [bookings, query],
  )

  const selected = selectedBookingId ? bookings.find((item) => item.id === selectedBookingId) : undefined
  const linkedTickets = selected ? tickets.filter((ticket) => ticket.booking === selected.id) : []
  const linkableTickets = tickets.filter((ticket) => ticket.booking !== selected?.id)

  return (
    <div className="support-booking-support">
      <style>{`
        .support-booking-detail { display: grid; gap: 18px; }
        .support-booking-support .sa-panel-sub,
        .support-booking-support .sa-cell-sub,
        .support-booking-support .sa-toolbar-meta,
        .support-booking-support .sp-person > span,
        .support-booking-info span,
        .support-booking-issue p,
        .support-booking-dispute span { color: #586579; }
        .support-booking-section { display: grid; gap: 12px; }
        .support-booking-section .sa-panel-header { margin-bottom: 0; }
        .support-booking-equipment { display: grid; grid-template-columns: minmax(0, 1.5fr) repeat(3, minmax(0, 1fr)); gap: 10px; }
        .support-booking-info { display: grid; align-content: start; gap: 6px; min-width: 0; padding: 13px 14px; border: 1px solid var(--sa-line); border-radius: 13px; background: #f8fafb; }
        .support-booking-info span { font-size: .7rem; font-weight: 750; letter-spacing: .04em; text-transform: uppercase; }
        .support-booking-info strong { color: var(--sa-text); font-size: .87rem; line-height: 1.45; overflow-wrap: anywhere; }
        .support-booking-issues { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .support-booking-issue { min-width: 0; padding: 14px; border: 1px solid var(--sa-line); border-radius: 13px; background: #fff; }
        .support-booking-issue h4 { margin: 0 0 8px; color: var(--sa-text); font-size: .88rem; }
        .support-booking-issue p { margin: 0; font-size: .8rem; line-height: 1.55; }
        .support-booking-disputes { display: grid; gap: 10px; }
        .support-booking-dispute { display: grid; gap: 5px; padding: 11px 12px; border-radius: 10px; background: #fff8ed; }
        .support-booking-dispute strong { color: var(--sa-text); font-size: .8rem; }
        .support-booking-dispute span { font-size: .72rem; }
        @media (max-width: 900px) { .support-booking-equipment { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px) { .support-booking-equipment, .support-booking-issues { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
      {!selectedBookingId && <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Booking support</h3>
            <span className="sa-panel-sub">Investigate rental issues, cancellations, and disputes · contact details are masked</span>
          </div>
          <span className="sa-pill slate">{bookings.length} bookings</span>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search bookings"
            placeholder="Search booking, equipment, customer, owner or zone..."
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
                      <button type="button" className="sa-btn-ghost" onClick={() => onOpenBooking(booking.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>}

      {selected && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <div>
              <button type="button" className="sa-view-link" onClick={onBackToBookings}>← Back to bookings</button>
              <h3>{selected.id} · Booking details</h3>
              <span className="sa-panel-sub">{selected.zone} · {selected.window}</span>
            </div>
            <div className="sa-chip-row">
              <span className="sa-pill slate">{selected.amount}</span>
              <StatusPill status={selected.status} />
            </div>
          </div>

          <div className="support-booking-detail">
            <div className="support-booking-section">
              <div className="sa-panel-header">
                <h3>Equipment & rental</h3>
                <span className="sa-panel-sub">Booked equipment and scheduled rental dates</span>
              </div>
              <div className="support-booking-equipment">
                <div className="support-booking-info">
                  <span>Equipment</span>
                  <strong>{selected.machine}</strong>
                </div>
                <div className="support-booking-info">
                  <span>Equipment type</span>
                  <strong>{selected.equipmentType}</strong>
                </div>
                <div className="support-booking-info">
                  <span>Rental starts</span>
                  <strong>{selected.rentalStart}</strong>
                </div>
                <div className="support-booking-info">
                  <span>Rental ends</span>
                  <strong>{selected.rentalEnd}</strong>
                </div>
              </div>
            </div>

            <div className="support-booking-section">
              <div className="sa-panel-header">
                <h3>Customer & owner</h3>
                <span className="sa-panel-sub">Personal contact details remain masked</span>
              </div>
              <div className="sp-person-grid">
                <div className="sp-person">
                  <span>Customer</span>
                  <strong>{selected.customer}</strong>
                  <span>{selected.customerMasked}</span>
                </div>
                <div className="sp-person">
                  <span>Equipment owner</span>
                  <strong>{selected.owner}</strong>
                  <span>{selected.ownerMasked}</span>
                </div>
                <div className="sp-person">
                  <span>Assigned operator</span>
                  <strong>{selected.operator}</strong>
                  <span>{selected.operatorMasked}</span>
                </div>
                <div className="sp-person">
                  <span>Linked tickets</span>
                  <strong>{linkedTickets.length}</strong>
                  <span>{linkedTickets.map((ticket) => ticket.id).join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="support-booking-issues">
              <div className="support-booking-issue">
                <h4>Cancellation reason</h4>
                <p>{selected.cancellationReason ?? 'No cancellation recorded for this booking.'}</p>
              </div>
              <div className="support-booking-issue">
                <h4>Dispute history</h4>
                {selected.disputeHistory.length === 0 ? (
                  <p>No disputes recorded for this booking.</p>
                ) : (
                  <div className="support-booking-disputes">
                    {selected.disputeHistory.map((dispute) => (
                      <div className="support-booking-dispute" key={dispute.id}>
                        <strong>{dispute.label}</strong>
                        <span>{dispute.actor} · {dispute.time}</span>
                        <p>{dispute.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="support-booking-section">
              <div className="sa-panel-header">
                <h3>Booking history</h3>
                <span className="sa-panel-sub">Status changes and support activity</span>
              </div>
              <Timeline events={selected.history} />
            </div>

            <div className="support-booking-section">
              <div className="sa-panel-header">
                <h3>Raise a support ticket</h3>
                <span className="sa-panel-sub">Creates a ticket linked to this booking</span>
              </div>
              <div className="sa-form-actions" style={{ paddingTop: 4 }}>
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
            </div>

            <div className="support-booking-section">
              <div className="sa-panel-header">
                <h3>Link an existing ticket</h3>
                <span className="sa-panel-sub">Attach another ticket to this booking</span>
              </div>
              <div className="sa-form-actions" style={{ paddingTop: 4 }}>
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
                  disabled={!linkTicketId}
                >
                  Link ticket
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {selectedBookingId && !selected && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <div>
              <h3>Booking not found</h3>
              <span className="sa-panel-sub">This booking may no longer be available, or the link may be incorrect.</span>
            </div>
            <button type="button" className="sa-btn-ghost" onClick={onBackToBookings}>Back to bookings</button>
          </div>
        </section>
      )}
    </div>
  )
}
