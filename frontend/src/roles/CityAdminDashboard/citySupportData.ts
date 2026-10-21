// City-scoped support ticket & complaint seed data for the Hyderabad City Admin dashboard.
import { cityProfile } from './cityAdminData'

export type SupportTab = 'tickets' | 'sla' | 'teams'

export const supportTabs: Array<{ id: SupportTab; label: string; hint: string }> = [
  { id: 'tickets', label: 'Tickets & complaints', hint: 'All support tickets and complaints in the city' },
  { id: 'sla', label: 'Response & resolution', hint: 'Response and resolution time monitoring' },
  { id: 'teams', label: 'Support teams', hint: 'Teams that receive or escalate cases' },
]

export type SupportTicketStatus = 'Open' | 'Pending' | 'Resolved' | 'Closed'
export type SupportPriority = 'Critical' | 'High' | 'Normal' | 'Low'
export type SupportCategory =
  | 'Billing'
  | 'Machine fault'
  | 'Booking'
  | 'Refund'
  | 'Staff conduct'
  | 'Application'
  | 'Property'
export type SupportChannel = 'Call' | 'Email' | 'App' | 'Walk-in'
export type SupportMessageKind = 'Customer' | 'Support' | 'Internal' | 'System'

export type SupportMessage = {
  id: string
  kind: SupportMessageKind
  author: string
  time: string
  body: string
}

export type SupportTicket = {
  id: string
  subject: string
  customer: string
  channel: SupportChannel
  category: SupportCategory
  priority: SupportPriority
  status: SupportTicketStatus
  zone: string
  application?: string
  property?: string
  machineId?: string
  teamId: string | null
  team: string | null
  owner: string
  openedAt: string
  lastUpdate: string
  firstResponseMins: number | null
  resolutionHrs: number | null
  slaFirstResponse: boolean
  slaResolution: boolean
  reopened: boolean
  reopenCount: number
  escalated: boolean
  messages: SupportMessage[]
}

export type SupportTeam = {
  id: string
  name: string
  scope: string
  lead: string
  openCases: number
  capacity: number
  avgFirstResponseMins: number
  avgResolutionHrs: number
  reopenRate: number
  authorized: string[]
}

export const supportTeams: SupportTeam[] = [
  {
    id: 'T-401', name: 'Billing & refunds desk', scope: 'City-wide', lead: 'Sr. Manager · Kavitha Rao',
    openCases: 9, capacity: 16, avgFirstResponseMins: 22, avgResolutionHrs: 9.5, reopenRate: 4,
    authorized: ['Billing', 'Refund'],
  },
  {
    id: 'T-402', name: 'Machine & field support', scope: 'City-wide', lead: 'Sr. Engineer · Harish Varma',
    openCases: 13, capacity: 20, avgFirstResponseMins: 17, avgResolutionHrs: 6.2, reopenRate: 7,
    authorized: ['Machine fault', 'Property'],
  },
  {
    id: 'T-403', name: 'Booking operations', scope: 'City-wide', lead: 'Sr. Manager · Divya Sharma',
    openCases: 7, capacity: 14, avgFirstResponseMins: 25, avgResolutionHrs: 5.4, reopenRate: 3,
    authorized: ['Booking', 'Application'],
  },
  {
    id: 'T-404', name: 'Customer grievance cell', scope: 'City-wide', lead: 'Lead Ops · Ramesh Naidu',
    openCases: 6, capacity: 12, avgFirstResponseMins: 31, avgResolutionHrs: 12.8, reopenRate: 9,
    authorized: ['Staff conduct', 'Property'],
  },
  {
    id: 'T-405', name: 'Compliance & conduct', scope: 'City-wide', lead: 'Compliance Officer · Sana Fatima',
    openCases: 4, capacity: 10, avgFirstResponseMins: 42, avgResolutionHrs: 20.5, reopenRate: 6,
    authorized: ['Staff conduct'],
  },
  {
    id: 'T-406', name: 'City escalation desk', scope: 'City-wide', lead: 'City Admin · ' + cityProfile.adminName,
    openCases: 5, capacity: 8, avgFirstResponseMins: 12, avgResolutionHrs: 4.1, reopenRate: 5,
    authorized: ['Billing', 'Machine fault', 'Booking', 'Refund', 'Staff conduct', 'Application', 'Property'],
  },
]

export const supportTickets: SupportTicket[] = [
  {
    id: 'SC-9001', subject: 'Excavator breakdown unattended for 3 hours', customer: 'L&T Metro Rail', channel: 'Call', category: 'Machine fault', priority: 'Critical', status: 'Open', zone: 'Madhapur', application: 'APP-2291', property: 'Metro Depot, Madhapur', machineId: 'MC-3041', teamId: 'T-402', team: 'Machine & field support', owner: 'Harish Varma', openedAt: '35 min ago', lastUpdate: '10 min ago', firstResponseMins: 12, resolutionHrs: null, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'L&T Metro Rail', time: '35 min ago', body: 'CAT 320 GC stopped mid-shift at the depot and no technician has arrived.' },
      { id: 'm2', kind: 'System', author: 'System', time: '34 min ago', body: 'Ticket auto-created from call log; routed to Machine & field support.' },
      { id: 'm3', kind: 'Support', author: 'Harish Varma', time: '10 min ago', body: 'Dispatcher DJ-7712 assigned to Gopal Rao; technician ETA 40 minutes.' },
    ],
  },
  {
    id: 'SC-8998', subject: 'Overcharged for 2 extra machine hours', customer: 'My Home Builders', channel: 'Email', category: 'Billing', priority: 'High', status: 'Pending', zone: 'Kukatpally', application: 'APP-2277', property: 'My Home Avatar site', machineId: 'MC-3019', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '3 hours ago', lastUpdate: '1 hour ago', firstResponseMins: 24, resolutionHrs: null, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'My Home Builders', time: '3 hours ago', body: 'Invoice INV-5521 bills 8 hours but logs show 6 hours of usage.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '1 hour ago', body: 'Requested meter log from the zone desk for reconciliation.' },
    ],
  },
  {
    id: 'SC-8994', subject: 'Refund not credited after cancellation', customer: 'Sobha Realty', channel: 'App', category: 'Refund', priority: 'High', status: 'Open', zone: 'Gachibowli', application: 'APP-2265', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '5 hours ago', lastUpdate: '2 hours ago', firstResponseMins: 19, resolutionHrs: null, slaFirstResponse: true, slaResolution: false, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Sobha Realty', time: '5 hours ago', body: 'Cancelled booking 4 days ago and the ₹18,400 refund is still not credited.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '3 hours ago', body: 'Payment gateway shows the refund stuck in processing.' },
      { id: 'm3', kind: 'Internal', author: 'Kavitha Rao', time: '2 hours ago', body: 'Waiting on bank reference; escalate to city desk if not cleared by EOD.' },
    ],
  },
  {
    id: 'SC-8990', subject: 'Dispatcher allegedly misbehaved on site', customer: 'Deccan Roadlines', channel: 'Call', category: 'Staff conduct', priority: 'Critical', status: 'Open', zone: 'Begumpet', teamId: 'T-405', team: 'Compliance & conduct', owner: 'Sana Fatima', openedAt: '6 hours ago', lastUpdate: '45 min ago', firstResponseMins: 38, resolutionHrs: null, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: true,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Deccan Roadlines', time: '6 hours ago', body: 'Site supervisor reports the dispatcher refused to complete the repair.' },
      { id: 'm2', kind: 'Support', author: 'Sana Fatima', time: '45 min ago', body: 'Compliance review opened; dispatcher statement requested within 24 hours.' },
    ],
  },
  {
    id: 'SC-8986', subject: 'Duplicate charge on card for same booking', customer: 'Ramky Infrastructure', channel: 'Email', category: 'Billing', priority: 'Normal', status: 'Resolved', zone: 'Uppal', application: 'APP-2240', machineId: 'MC-3031', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '1 day ago', lastUpdate: '4 hours ago', firstResponseMins: 21, resolutionHrs: 7.5, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Ramky Infrastructure', time: '1 day ago', body: 'Card was charged twice for booking BK-44812.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '20 hours ago', body: 'Duplicate payment confirmed; reversal initiated.' },
      { id: 'm3', kind: 'System', author: 'System', time: '4 hours ago', body: 'Reversal ₹9,200 completed; ticket marked Resolved.' },
    ],
  },
  {
    id: 'SC-8981', subject: 'Machine delivered to wrong site', customer: 'Emaar India', channel: 'Call', category: 'Booking', priority: 'High', status: 'Resolved', zone: 'Gachibowli', application: 'APP-2233', machineId: 'MC-3034', teamId: 'T-403', team: 'Booking operations', owner: 'Divya Sharma', openedAt: '2 days ago', lastUpdate: '1 day ago', firstResponseMins: 16, resolutionHrs: 5.1, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Emaar India', time: '2 days ago', body: 'Machine was dropped at the wrong block.' },
      { id: 'm2', kind: 'Support', author: 'Divya Sharma', time: '1 day ago', body: 'Machine redirected and site coordinates corrected in the booking.' },
    ],
  },
  {
    id: 'SC-8977', subject: 'Application shows approved but no activation', customer: 'Vascon Engineers', channel: 'App', category: 'Application', priority: 'Normal', status: 'Pending', zone: 'Madhapur', application: 'APP-2216', teamId: 'T-403', team: 'Booking operations', owner: 'Divya Sharma', openedAt: '1 day ago', lastUpdate: '6 hours ago', firstResponseMins: 27, resolutionHrs: null, slaFirstResponse: true, slaResolution: false, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Vascon Engineers', time: '1 day ago', body: 'Onboarding application shows Approved but the account is still inactive.' },
      { id: 'm2', kind: 'Internal', author: 'Divya Sharma', time: '6 hours ago', body: 'Provisioning queue stuck; raised with platform team.' },
    ],
  },
  {
    id: 'SC-8970', subject: 'Repeated hydraulic leak at rented crane', customer: 'TSIIC', channel: 'Call', category: 'Machine fault', priority: 'Critical', status: 'Closed', zone: 'Begumpet', machineId: 'MC-3058', teamId: 'T-402', team: 'Machine & field support', owner: 'Harish Varma', openedAt: '3 days ago', lastUpdate: '1 day ago', firstResponseMins: 14, resolutionHrs: 11.3, slaFirstResponse: true, slaResolution: false, reopened: true, reopenCount: 1, escalated: true,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'TSIIC', time: '3 days ago', body: 'Crane leaks hydraulic fluid again after last repair.' },
      { id: 'm2', kind: 'System', author: 'System', time: '2 days ago', body: 'Ticket reopened by customer after 24 hours.' },
      { id: 'm3', kind: 'Support', author: 'Harish Varma', time: '1 day ago', body: 'Seal kit replaced and pressure tested; closed with 30-day warranty.' },
    ],
  },
  {
    id: 'SC-8965', subject: 'Property damage during machine pickup', customer: 'Greenko Energies', channel: 'Email', category: 'Property', priority: 'High', status: 'Open', zone: 'LB Nagar', application: 'APP-2201', property: 'Access road, LB Nagar', machineId: 'MC-3005', teamId: 'T-404', team: 'Customer grievance cell', owner: 'Ramesh Naidu', openedAt: '2 days ago', lastUpdate: '5 hours ago', firstResponseMins: 33, resolutionHrs: null, slaFirstResponse: true, slaResolution: false, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Greenko Energies', time: '2 days ago', body: 'Pickup vehicle damaged the access road barricade.' },
      { id: 'm2', kind: 'Internal', author: 'Ramesh Naidu', time: '5 hours ago', body: 'Awaiting site photos and estimate from the transport vendor.' },
    ],
  },
  {
    id: 'SC-8959', subject: 'Refund request after rain-affected booking', customer: 'Kences Builders', channel: 'App', category: 'Refund', priority: 'Low', status: 'Closed', zone: 'Kukatpally', application: 'APP-2194', machineId: 'MC-3025', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '4 days ago', lastUpdate: '2 days ago', firstResponseMins: 29, resolutionHrs: 14.2, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Kences Builders', time: '4 days ago', body: 'Requesting partial refund for a rain-washed-out day.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '2 days ago', body: 'Partial refund approved and credited; ticket closed.' },
    ],
  },
  {
    id: 'SC-8954', subject: 'Booking confirmation email never received', customer: 'Auroville Structures', channel: 'Email', category: 'Booking', priority: 'Low', status: 'Resolved', zone: 'LB Nagar', application: 'APP-2188', teamId: 'T-403', team: 'Booking operations', owner: 'Divya Sharma', openedAt: '3 days ago', lastUpdate: '2 days ago', firstResponseMins: 41, resolutionHrs: 3.6, slaFirstResponse: false, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Auroville Structures', time: '3 days ago', body: 'Did not receive the booking confirmation email.' },
      { id: 'm2', kind: 'Support', author: 'Divya Sharma', time: '2 days ago', body: 'Email resent to the verified address; customer confirmed receipt.' },
    ],
  },
  {
    id: 'SC-8948', subject: 'Operator arrived without safety gear', customer: 'TSIIC', channel: 'Call', category: 'Staff conduct', priority: 'Normal', status: 'Pending', zone: 'Begumpet', machineId: 'MC-3058', teamId: 'T-405', team: 'Compliance & conduct', owner: 'Sana Fatima', openedAt: '1 day ago', lastUpdate: '8 hours ago', firstResponseMins: 36, resolutionHrs: null, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'TSIIC', time: '1 day ago', body: 'Operator arrived without helmet or vest at the site.' },
      { id: 'm2', kind: 'Support', author: 'Sana Fatima', time: '8 hours ago', body: 'Safety advisory issued to the operator agency; awaiting acknowledgement.' },
    ],
  },
  {
    id: 'SC-8941', subject: 'Incorrect GST details on invoice', customer: 'Smartworks Infra', channel: 'Email', category: 'Billing', priority: 'Normal', status: 'Resolved', zone: 'Begumpet', application: 'APP-2172', machineId: 'MC-3045', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '5 days ago', lastUpdate: '4 days ago', firstResponseMins: 18, resolutionHrs: 6.8, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Smartworks Infra', time: '5 days ago', body: 'GST number on invoice INV-5410 is incorrect.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '4 days ago', body: 'Invoice corrected and reissued with the right GSTIN.' },
    ],
  },
  {
    id: 'SC-8933', subject: 'Escalation: unresolved billing dispute', customer: 'Sanghi Industries', channel: 'App', category: 'Billing', priority: 'High', status: 'Open', zone: 'Uppal', application: 'APP-2160', machineId: 'MC-3047', teamId: 'T-406', team: 'City escalation desk', owner: cityProfile.adminName, openedAt: '6 days ago', lastUpdate: '1 hour ago', firstResponseMins: 11, resolutionHrs: null, slaFirstResponse: true, slaResolution: false, reopened: true, reopenCount: 2, escalated: true,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Sanghi Industries', time: '6 days ago', body: 'Billing dispute raised twice and still unresolved.' },
      { id: 'm2', kind: 'System', author: 'System', time: '2 days ago', body: 'Reopened automatically after 48 hours of inactivity.' },
      { id: 'm3', kind: 'Internal', author: cityProfile.adminName, time: '1 hour ago', body: 'Escalated to city desk; finance lead to review ledger entries.' },
    ],
  },
]

export type SupportPermission = {
  key: string
  label: string
  description: string
  granted: boolean
  locked?: boolean
}

export const citySupportPermissions: SupportPermission[] = [
  { key: 'support.view', label: 'View complaints', description: 'See all support tickets and complaints in the city.', granted: true },
  { key: 'support.assign', label: 'Assign tickets', description: 'Assign or reassign tickets to support teams.', granted: true },
  { key: 'support.escalate', label: 'Escalate issues', description: 'Escalate unresolved issues to the city escalation desk.', granted: true },
  { key: 'support.resolve', label: 'Resolve & close', description: 'Mark tickets resolved, close and reopen cases.', granted: true },
  { key: 'support.settings', label: 'Change SLA settings', description: 'Edit response and resolution SLA targets — State Admin only.', granted: false, locked: true },
]

export const hasSupportPermission = (key: string): boolean =>
  citySupportPermissions.some((permission) => permission.key === key && permission.granted)
