import type { BookingHistoryEvent, TicketMessage } from './supportAdminData'

const statusPillClass: Record<string, string> = {
  New: 'blue',
  Open: 'amber',
  Pending: 'amber',
  Resolved: 'green',
  Closed: 'green',
  Confirmed: 'blue',
  'In progress': 'blue',
  Completed: 'green',
  Cancelled: 'red',
  Active: 'green',
  Suspended: 'red',
  Draft: 'slate',
  Escalated: 'red',
  Approved: 'green',
  Processed: 'green',
  Rejected: 'red',
  Acknowledged: 'blue',
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`sa-pill ${statusPillClass[status] ?? 'slate'}`}>{status}</span>
}

const priorityPillClass: Record<string, string> = {
  Urgent: 'red',
  High: 'amber',
  Normal: 'blue',
  Low: 'slate',
}

export function PriorityPill({ priority }: { priority: string }) {
  return <span className={`sa-pill ${priorityPillClass[priority] ?? 'slate'}`}>{priority}</span>
}

const channelPillClass: Record<string, string> = {
  App: 'blue',
  Phone: 'green',
  Email: 'amber',
  Chat: 'slate',
}

export function ChannelPill({ channel }: { channel: string }) {
  return <span className={`sa-pill ${channelPillClass[channel] ?? 'slate'}`}>{channel}</span>
}

export function Thread({ messages }: { messages: TicketMessage[] }) {
  return (
    <div className="sp-thread">
      {messages.map((message) => (
        <article key={message.id} className={`sp-msg ${message.internal ? 'internal' : ''}`}>
          <div className="sp-msg-head">
            <strong>{message.author}</strong>
            <span className="sp-msg-role">{message.role}</span>
            {message.internal && <span className="sa-pill slate">internal note</span>}
            <span className="sp-msg-time">{message.time}</span>
          </div>
          <p className="sp-msg-body">{message.body}</p>
        </article>
      ))}
    </div>
  )
}

export function Timeline({ events }: { events: BookingHistoryEvent[] }) {
  return (
    <div className="sp-timeline">
      {events.map((event) => (
        <div key={event.id} className="sp-timeline-item">
          <span className="sp-timeline-dot" />
          <div className="sp-timeline-body">
            <strong>{event.label}</strong>
            <span className="sa-cell-sub">
              {event.actor} · {event.time}
            </span>
            <p>{event.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
