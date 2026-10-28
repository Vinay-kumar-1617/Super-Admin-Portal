import { useMemo, useState } from 'react'
import { PriorityPill, StatusPill } from './shared'
import type { Ticket, UserAccount, UserType } from './supportAdminData'

type UsersSectionProps = {
  users: UserAccount[]
  tickets: Ticket[]
  selectedUserId: string | null
  onOpenUser: (id: string) => void
  onBackToUsers: () => void
}

const typeFilters: Array<'All' | UserType> = ['All', 'Customer', 'Owner', 'Operator']

export default function UsersSection({ users, tickets, selectedUserId, onOpenUser, onBackToUsers }: UsersSectionProps) {
  const [typeFilter, setTypeFilter] = useState<'All' | UserType>('All')
  const [query, setQuery] = useState('')

  const rows = useMemo(
    () =>
      users.filter(
        (item) =>
          (typeFilter === 'All' || item.type === typeFilter) &&
          (query.trim() === '' ||
            item.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.id.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [users, typeFilter, query],
  )

  const selected = selectedUserId ? users.find((item) => item.id === selectedUserId) : undefined
  const pastTickets = selected ? tickets.filter((ticket) => ticket.requester === selected.name) : []

  return (
    <>
      {!selectedUserId && (
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>User lookup</h3>
          <div className="sa-chip-row">
            {typeFilters.map((option) => (
              <button
                key={option}
                type="button"
                className={`sa-chip ${typeFilter === option ? 'active orange' : ''}`}
                onClick={() => setTypeFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search users"
            placeholder="Search name or account id..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="sa-toolbar-meta">
            {rows.length} of {users.length} accounts · personal data is masked
          </span>
        </div>
        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No accounts match the current filters.</p>
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                setTypeFilter('All')
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
                  <th>Account</th>
                  <th>Type</th>
                  <th>Phone (masked)</th>
                  <th>Email (masked)</th>
                  <th>ID (masked)</th>
                  <th>Bookings</th>
                  <th>Tickets</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((user) => (
                  <tr key={user.id}>
                    <td className="sa-cell-strong">
                      {user.name}
                      <span className="sa-cell-sub">{user.id}</span>
                    </td>
                    <td className="sa-cell-sub">{user.type}</td>
                    <td className="sa-num">{user.maskedPhone}</td>
                    <td className="sa-num">{user.maskedEmail}</td>
                    <td className="sa-num">{user.maskedId}</td>
                    <td className="sa-num">{user.bookings}</td>
                    <td className="sa-num">{user.tickets}</td>
                    <td>
                      <StatusPill status={user.status} />
                    </td>
                    <td>
                      <button type="button" className="sa-btn-ghost" onClick={() => onOpenUser(user.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {selected && (
        <div className="sa-lower-grid">
          <section className="sa-panel">
            <div className="sa-panel-header">
              <div>
                <button type="button" className="sa-view-link" onClick={onBackToUsers}>← Back to user lookup</button>
                <h3 style={{ marginTop: 8 }}>{selected.name}</h3>
              </div>
              <StatusPill status={selected.status} />
            </div>
            <div className="sp-person-grid">
              <div className="sp-person">
                <span>Account</span>
                <strong>{selected.id}</strong>
                <span>{selected.type} · {selected.city}</span>
              </div>
              <div className="sp-person">
                <span>Phone (masked)</span>
                <strong>{selected.maskedPhone}</strong>
                <span>no unmasked access</span>
              </div>
              <div className="sp-person">
                <span>Email (masked)</span>
                <strong>{selected.maskedEmail}</strong>
                <span>no unmasked access</span>
              </div>
              <div className="sp-person">
                <span>ID / GST (masked)</span>
                <strong>{selected.maskedId}</strong>
                <span>joined {selected.joined}</span>
              </div>
            </div>
            <div className="sa-form-actions" style={{ paddingTop: 16 }}>
              <span className="sa-pill slate">Personal data masked</span>
              <span className="sa-panel-sub">Support cannot view unmasked phone, email or ID numbers.</span>
            </div>
          </section>

          <section className="sa-panel">
            <div className="sa-panel-header">
              <h3>Past tickets</h3>
              <span className="sa-panel-sub">{pastTickets.length} tickets</span>
            </div>
            {pastTickets.length === 0 ? (
              <div className="sa-empty">
                <p>No tickets recorded for this account.</p>
              </div>
            ) : (
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="sa-cell-strong">
                          {ticket.id}
                          <span className="sa-cell-sub">{ticket.subject}</span>
                        </td>
                        <td className="sa-cell-sub">{ticket.category}</td>
                        <td>
                          <PriorityPill priority={ticket.priority} />
                        </td>
                        <td>
                          <StatusPill status={ticket.status} />
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
              <h3>Account activity</h3>
              <span className="sa-panel-sub">{selected.city}</span>
            </div>
            <div className="sa-feed">
              {selected.activity.map((item) => (
                <div key={item} className="sa-feed-item">
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {selectedUserId && !selected && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <div>
              <h3>User not found</h3>
              <span className="sa-panel-sub">This account may no longer be available, or the link may be incorrect.</span>
            </div>
            <button type="button" className="sa-btn-ghost" onClick={onBackToUsers}>Back to user lookup</button>
          </div>
        </section>
      )}
    </>
  )
}
