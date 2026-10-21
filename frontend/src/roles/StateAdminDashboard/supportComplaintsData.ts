// State-scoped support ticket & complaint seed data for the Telangana State Admin dashboard.
import { stateProfile } from './stateAdminData'

export type SupportTab = 'tickets' | 'sla' | 'teams'

export const supportTabs: Array<{ id: SupportTab; label: string; hint: string }> = [
  { id: 'tickets', label: 'Tickets & complaints', hint: 'All support tickets and complaints across the state' },
  { id: 'sla', label: 'Response & resolution', hint: 'Response and resolution time monitoring' },
  { id: 'teams', label: 'Authorized teams', hint: 'Teams authorized to receive or escalate cases' },
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
  city: string
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
    id: 'T-401', name: 'Billing & refunds desk', scope: 'State-wide', lead: 'Sr. Manager · Kavitha Rao',
    openCases: 14, capacity: 20, avgFirstResponseMins: 22, avgResolutionHrs: 9.5, reopenRate: 4,
    authorized: ['Billing', 'Refund'],
  },
  {
    id: 'T-402', name: 'Machine & field support', scope: 'State-wide', lead: 'Sr. Engineer · Harish Varma',
    openCases: 19, capacity: 24, avgFirstResponseMins: 17, avgResolutionHrs: 6.2, reopenRate: 7,
    authorized: ['Machine fault', 'Property'],
  },
  {
    id: 'T-403', name: 'Booking operations', scope: 'State-wide', lead: 'Sr. Manager · Divya Sharma',
    openCases: 11, capacity: 18, avgFirstResponseMins: 25, avgResolutionHrs: 5.4, reopenRate: 3,
    authorized: ['Booking', 'Application'],
  },
  {
    id: 'T-404', name: 'Customer grievance cell', scope: 'State-wide', lead: 'Lead Ops · Ramesh Naidu',
    openCases: 8, capacity: 15, avgFirstResponseMins: 31, avgResolutionHrs: 12.8, reopenRate: 9,
    authorized: ['Staff conduct', 'Property'],
  },
  {
    id: 'T-405', name: 'Compliance & conduct', scope: 'State-wide', lead: 'Compliance Officer · Sana Fatima',
    openCases: 5, capacity: 12, avgFirstResponseMins: 42, avgResolutionHrs: 20.5, reopenRate: 6,
    authorized: ['Staff conduct'],
  },
  {
    id: 'T-406', name: 'State escalation desk', scope: 'State-wide', lead: 'State Admin · ' + stateProfile.adminName,
    openCases: 6, capacity: 10, avgFirstResponseMins: 12, avgResolutionHrs: 4.1, reopenRate: 5,
    authorized: ['Billing', 'Machine fault', 'Booking', 'Refund', 'Staff conduct', 'Application', 'Property'],
  },
]

export const supportTickets: SupportTicket[] = [
  {
    id: 'SC-9001', subject: 'Excavator breakdown unattended for 3 hours', customer: 'L&T Metro Rail', channel: 'Call', category: 'Machine fault', priority: 'Critical', status: 'Open', city: 'Hyderabad', zone: 'Madhapur', application: 'APP-2291', property: 'Metro Depot, Madhapur', machineId: 'MC-3041', teamId: 'T-402', team: 'Machine & field support', owner: 'Harish Varma', openedAt: '35 min ago', lastUpdate: '10 min ago', firstResponseMins: 12, resolutionHrs: null, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'L&T Metro Rail', time: '35 min ago', body: 'CAT 320 GC stopped mid-shift at the depot and no technician has arrived.' },
      { id: 'm2', kind: 'System', author: 'System', time: '34 min ago', body: 'Ticket auto-created from call log; routed to Machine & field support.' },
      { id: 'm3', kind: 'Support', author: 'Harish Varma', time: '10 min ago', body: 'Dispatcher DJ-7712 assigned to Gopal Rao; technician ETA 40 minutes.' },
    ],
  },
  {
    id: 'SC-8998', subject: 'Overcharged for 2 extra machine hours', customer: 'My Home Builders', channel: 'Email', category: 'Billing', priority: 'High', status: 'Pending', city: 'Hyderabad', zone: 'Kukatpally', application: 'APP-2277', property: 'My Home Avatar site', machineId: 'MC-3019', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '3 hours ago', lastUpdate: '1 hour ago', firstResponseMins: 24, resolutionHrs: null, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'My Home Builders', time: '3 hours ago', body: 'Invoice INV-5521 bills 8 hours but logs show 6 hours of usage.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '1 hour ago', body: 'Requested meter log from the zone desk for reconciliation.' },
    ],
  },
  {
    id: 'SC-8994', subject: 'Refund not credited after cancellation', customer: 'Vascon Engineers', channel: 'App', category: 'Refund', priority: 'High', status: 'Open', city: 'Warangal', zone: 'Hanamkonda', application: 'APP-2265', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '5 hours ago', lastUpdate: '2 hours ago', firstResponseMins: 19, resolutionHrs: null, slaFirstResponse: true, slaResolution: false, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Vascon Engineers', time: '5 hours ago', body: 'Cancelled booking 4 days ago and the ₹18,400 refund is still not credited.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '3 hours ago', body: 'Payment gateway shows the refund stuck in processing.' },
      { id: 'm3', kind: 'Internal', author: 'Kavitha Rao', time: '2 hours ago', body: 'Waiting on bank reference; escalate to state desk if not cleared by EOD.' },
    ],
  },
  {
    id: 'SC-8990', subject: 'Dispatcher allegedly misbehaved on site', customer: 'Deccan Roadlines', channel: 'Call', category: 'Staff conduct', priority: 'Critical', status: 'Open', city: 'Hyderabad', zone: 'Begumpet', teamId: 'T-405', team: 'Compliance & conduct', owner: 'Sana Fatima', openedAt: '6 hours ago', lastUpdate: '45 min ago', firstResponseMins: 38, resolutionHrs: null, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: true,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Deccan Roadlines', time: '6 hours ago', body: 'Site supervisor reports the dispatcher refused to complete the repair.' },
      { id: 'm2', kind: 'Support', author: 'Sana Fatima', time: '45 min ago', body: 'Compliance review opened; dispatcher statement requested within 24 hours.' },
    ],
  },
  {
    id: 'SC-8986', subject: 'Duplicate charge on card for same booking', customer: 'Ramky Infrastructure', channel: 'Email', category: 'Billing', priority: 'Normal', status: 'Resolved', city: 'Hyderabad', zone: 'Uppal', application: 'APP-2240', machineId: 'MC-3031', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '1 day ago', lastUpdate: '4 hours ago', firstResponseMins: 21, resolutionHrs: 7.5, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Ramky Infrastructure', time: '1 day ago', body: 'Card was charged twice for booking BK-44812.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '20 hours ago', body: 'Duplicate payment confirmed; reversal initiated.' },
      { id: 'm3', kind: 'System', author: 'System', time: '4 hours ago', body: 'Reversal ₹9,200 completed; ticket marked Resolved.' },
    ],
  },
  {
    id: 'SC-8981', subject: 'Machine delivered to wrong site', customer: 'Nalgonda Cement Co', channel: 'Call', category: 'Booking', priority: 'High', status: 'Resolved', city: 'Nalgonda', zone: 'Miryalaguda Road', application: 'APP-2233', machineId: 'MC-2998', teamId: 'T-403', team: 'Booking operations', owner: 'Divya Sharma', openedAt: '2 days ago', lastUpdate: '1 day ago', firstResponseMins: 16, resolutionHrs: 5.1, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Nalgonda Cement Co', time: '2 days ago', body: 'Skid steer was dropped at the wrong block.' },
      { id: 'm2', kind: 'Support', author: 'Divya Sharma', time: '1 day ago', body: 'Machine redirected and site coordinates corrected in the booking.' },
    ],
  },
  {
    id: 'SC-8977', subject: 'Application shows approved but no activation', customer: 'Kakatiya Developers', channel: 'App', category: 'Application', priority: 'Normal', status: 'Pending', city: 'Warangal', zone: 'Kazipet', application: 'APP-2216', teamId: 'T-403', team: 'Booking operations', owner: 'Divya Sharma', openedAt: '1 day ago', lastUpdate: '6 hours ago', firstResponseMins: 27, resolutionHrs: null, slaFirstResponse: true, slaResolution: false, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Kakatiya Developers', time: '1 day ago', body: 'Onboarding application shows Approved but the account is still inactive.' },
      { id: 'm2', kind: 'Internal', author: 'Divya Sharma', time: '6 hours ago', body: 'Provisioning queue stuck; raised with platform team.' },
    ],
  },
  {
    id: 'SC-8970', subject: 'Repeated hydraulic leak at rented crane', customer: 'Singareni Collieries', channel: 'Call', category: 'Machine fault', priority: 'Critical', status: 'Closed', city: 'Ramagundam', zone: 'Godavarikhani', machineId: 'MC-2994', teamId: 'T-402', team: 'Machine & field support', owner: 'Harish Varma', openedAt: '3 days ago', lastUpdate: '1 day ago', firstResponseMins: 14, resolutionHrs: 11.3, slaFirstResponse: true, slaResolution: false, reopened: true, reopenCount: 1, escalated: true,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Singareni Collieries', time: '3 days ago', body: 'Crane leaks hydraulic fluid again after last repair.' },
      { id: 'm2', kind: 'System', author: 'System', time: '2 days ago', body: 'Ticket reopened by customer after 24 hours.' },
      { id: 'm3', kind: 'Support', author: 'Harish Varma', time: '1 day ago', body: 'Seal kit replaced and pressure tested; closed with 30-day warranty.' },
    ],
  },
  {
    id: 'SC-8965', subject: 'Property damage during machine pickup', customer: 'Greenko Energies', channel: 'Email', category: 'Property', priority: 'High', status: 'Open', city: 'Khammam', zone: 'Wyra Road', application: 'APP-2201', property: 'Wyra Wind Farm access road', machineId: 'MC-3005', teamId: 'T-404', team: 'Customer grievance cell', owner: 'Ramesh Naidu', openedAt: '2 days ago', lastUpdate: '5 hours ago', firstResponseMins: 33, resolutionHrs: null, slaFirstResponse: true, slaResolution: false, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Greenko Energies', time: '2 days ago', body: 'Pickup vehicle damaged the access road barricade.' },
      { id: 'm2', kind: 'Internal', author: 'Ramesh Naidu', time: '5 hours ago', body: 'Awaiting site photos and estimate from the transport vendor.' },
    ],
  },
  {
    id: 'SC-8959', subject: 'Refund request after rain-affected booking', customer: 'Nizamabad Builders', channel: 'App', category: 'Refund', priority: 'Low', status: 'Closed', city: 'Nizamabad', zone: 'Bodhan Road', application: 'APP-2194', machineId: 'MC-3016', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '4 days ago', lastUpdate: '2 days ago', firstResponseMins: 29, resolutionHrs: 14.2, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Nizamabad Builders', time: '4 days ago', body: 'Requesting partial refund for a rain-washed-out day.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '2 days ago', body: 'Partial refund approved and credited; ticket closed.' },
    ],
  },
  {
    id: 'SC-8954', subject: 'Booking confirmation email never received', customer: 'Suryapet Infra LLP', channel: 'Email', category: 'Booking', priority: 'Low', status: 'Resolved', city: 'Suryapet', zone: 'Alair Road', application: 'APP-2188', teamId: 'T-403', team: 'Booking operations', owner: 'Divya Sharma', openedAt: '3 days ago', lastUpdate: '2 days ago', firstResponseMins: 41, resolutionHrs: 3.6, slaFirstResponse: false, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Suryapet Infra LLP', time: '3 days ago', body: 'Did not receive the booking confirmation email.' },
      { id: 'm2', kind: 'Support', author: 'Divya Sharma', time: '2 days ago', body: 'Email resent to the verified address; customer confirmed receipt.' },
    ],
  },
  {
    id: 'SC-8948', subject: 'Operator arrived without safety gear', customer: 'TSIIC', channel: 'Call', category: 'Staff conduct', priority: 'Normal', status: 'Pending', city: 'Hyderabad', zone: 'Begumpet', machineId: 'MC-3058', teamId: 'T-405', team: 'Compliance & conduct', owner: 'Sana Fatima', openedAt: '1 day ago', lastUpdate: '8 hours ago', firstResponseMins: 36, resolutionHrs: null, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'TSIIC', time: '1 day ago', body: 'Operator arrived without helmet or vest at the site.' },
      { id: 'm2', kind: 'Support', author: 'Sana Fatima', time: '8 hours ago', body: 'Safety advisory issued to the operator agency; awaiting acknowledgement.' },
    ],
  },
  {
    id: 'SC-8941', subject: 'Incorrect GST details on invoice', customer: 'Nagarjuna Constructions', channel: 'Email', category: 'Billing', priority: 'Normal', status: 'Resolved', city: 'Karimnagar', zone: 'Chowrasta', application: 'APP-2172', machineId: 'MC-3024', teamId: 'T-401', team: 'Billing & refunds desk', owner: 'Kavitha Rao', openedAt: '5 days ago', lastUpdate: '4 days ago', firstResponseMins: 18, resolutionHrs: 6.8, slaFirstResponse: true, slaResolution: true, reopened: false, reopenCount: 0, escalated: false,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Nagarjuna Constructions', time: '5 days ago', body: 'GST number on invoice INV-5410 is incorrect.' },
      { id: 'm2', kind: 'Support', author: 'Kavitha Rao', time: '4 days ago', body: 'Invoice corrected and reissued with the right GSTIN.' },
    ],
  },
  {
    id: 'SC-8933', subject: 'Escalation: unresolved billing dispute', customer: 'Sanghi Industries', channel: 'App', category: 'Billing', priority: 'High', status: 'Open', city: 'Hyderabad', zone: 'Uppal', application: 'APP-2160', machineId: 'MC-3047', teamId: 'T-406', team: 'State escalation desk', owner: stateProfile.adminName, openedAt: '6 days ago', lastUpdate: '1 hour ago', firstResponseMins: 11, resolutionHrs: null, slaFirstResponse: true, slaResolution: false, reopened: true, reopenCount: 2, escalated: true,
    messages: [
      { id: 'm1', kind: 'Customer', author: 'Sanghi Industries', time: '6 days ago', body: 'Billing dispute raised twice and still unresolved.' },
      { id: 'm2', kind: 'System', author: 'System', time: '2 days ago', body: 'Reopened automatically after 48 hours of inactivity.' },
      { id: 'm3', kind: 'Internal', author: stateProfile.adminName, time: '1 hour ago', body: 'Escalated to state desk; finance lead to review ledger entries.' },
    ],
  },
]
