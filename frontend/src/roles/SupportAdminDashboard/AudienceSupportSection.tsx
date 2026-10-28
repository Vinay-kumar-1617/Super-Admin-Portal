import { useState } from 'react'
import TicketsSection from './TicketsSection'
import type { QueueKpiFilter, TicketsSectionProps } from './TicketsSection'
import type { RequesterType } from './supportAdminData'

type AudienceConfig = {
  requesterType: RequesterType
  title: string
  description: string
  issueTypes: string[]
}

const audienceConfigs: Record<'customer-support' | 'owner-support' | 'operator-support', AudienceConfig> = {
  'customer-support': {
    requesterType: 'Customer',
    title: 'Customer Support',
    description: 'Resolve customer booking, payment, cancellation, refund, account, and service complaints.',
    issueTypes: ['Booking issues', 'Payment failures', 'Cancellations', 'Refunds', 'Account problems', 'Complaints'],
  },
  'owner-support': {
    requesterType: 'Owner',
    title: 'Owner Support',
    description: 'Help equipment owners with listings, earnings, settlements, booking disputes, verification, and availability.',
    issueTypes: ['Equipment listings', 'Rental earnings', 'Settlement delays', 'Booking disputes', 'Document verification', 'Availability'],
  },
  'operator-support': {
    requesterType: 'Operator',
    title: 'Operator Support',
    description: 'Handle operator assignments, attendance, working hours, payments, equipment problems, and customer complaints.',
    issueTypes: ['Job assignments', 'Attendance', 'Working hours', 'Payment issues', 'Equipment problems', 'Customer complaints'],
  },
}

type AudienceSupportSectionProps = Omit<TicketsSectionProps, 'requesterType' | 'queueTitle'> & {
  section: keyof typeof audienceConfigs
}

export default function AudienceSupportSection({ section, tickets, ...ticketProps }: AudienceSupportSectionProps) {
  const [queueFilter, setQueueFilter] = useState<QueueKpiFilter | null>(null)
  const config = audienceConfigs[section]
  const audienceTickets = tickets.filter((ticket) => ticket.requesterType === config.requesterType)
  const activeTickets = audienceTickets.filter((ticket) => ticket.status === 'New' || ticket.status === 'Open' || ticket.status === 'Pending')
  const openCount = activeTickets.length
  const urgentCount = activeTickets.filter((ticket) => ticket.priority === 'Urgent').length
  const unassignedCount = activeTickets.filter((ticket) => ticket.assignee === 'Unassigned').length
  const overdueCount = activeTickets.filter((ticket) => ticket.overdue).length
  const kpis: Array<{ label: string; value: number; description: string; tone: string; badge: string; filter: QueueKpiFilter }> = [
    { label: 'Open cases', value: openCount, description: 'Cases awaiting resolution', tone: 'orange', badge: 'Active', filter: 'active' },
    { label: 'Urgent', value: urgentCount, description: 'Open cases needing priority attention', tone: 'red', badge: 'Priority', filter: 'urgent' },
    { label: 'Unassigned', value: unassignedCount, description: 'Cases without an assigned agent', tone: 'blue', badge: 'Queue', filter: 'unassigned' },
    { label: 'Overdue', value: overdueCount, description: 'Active cases past the response target', tone: 'purple', badge: 'SLA', filter: 'overdue' },
  ]

  return (
    <>
      <style>{`
        .support-audience-overview { display: grid; gap: 18px; }
        .support-audience-kpi { cursor: pointer; }
        .support-audience-kpi.red { border-color: rgba(220, 38, 38, .2); }
        .support-audience-kpi.red .sa-kpi-change { background: rgba(220, 38, 38, .08); color: #b91c1c; }
        .support-audience-kpi[aria-pressed="true"] { border-color: var(--sa-brand); box-shadow: 0 0 0 2px rgba(255, 107, 44, .18), var(--sa-shadow); }
        .support-audience-kpi:focus-visible { outline: 3px solid rgba(255, 107, 44, .45); outline-offset: 3px; }
        .support-audience-issues { display: grid; gap: 9px; }
        .support-audience-issues-label { color: var(--sa-muted); font-size: .72rem; font-weight: 700; letter-spacing: .045em; text-transform: uppercase; }
      `}</style>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>{config.title}</h3>
            <span className="sa-panel-sub">{config.description}</span>
          </div>
        </div>
        <div className="support-audience-overview">
          <div className="sa-kpi-grid" aria-label={`${config.title} key performance indicators`}>
            {kpis.map((kpi) => (
              <button
                key={kpi.filter}
                type="button"
                className={`sa-kpi-card ${kpi.tone} support-audience-kpi`}
                aria-pressed={queueFilter === kpi.filter}
                aria-label={`Show ${kpi.value} ${kpi.label.toLowerCase()} tickets`}
                onClick={() => setQueueFilter((current) => current === kpi.filter ? null : kpi.filter)}
              >
                <span className="sa-kpi-top">
                  <span className="sa-kpi-label">{kpi.label}</span>
                  <span className="sa-kpi-change">{kpi.badge}</span>
                </span>
                <strong className="sa-kpi-value">{kpi.value}</strong>
                <span className="sa-kpi-desc">{kpi.description}</span>
              </button>
            ))}
          </div>
          <div className="support-audience-issues">
            <span className="support-audience-issues-label">Issues we handle</span>
            <div className="sa-chip-row" aria-label="Supported issue types">
              {config.issueTypes.map((issue) => <span className="sa-chip" key={issue}>{issue}</span>)}
            </div>
          </div>
        </div>
      </section>
      <TicketsSection
        {...ticketProps}
        tickets={tickets}
        requesterType={config.requesterType}
        queueTitle={`${config.title} queue${queueFilter ? ` · ${kpis.find((item) => item.filter === queueFilter)?.label}` : ''}`}
        queueFilter={queueFilter}
        onClearQueueFilter={() => setQueueFilter(null)}
      />
    </>
  )
}
