// Delegated approval requests for the Operations Manager.
//
// Each request is one item the Operations Manager is allowed to decide inside
// their zone, together with the amount they may approve before it has to go
// up to the City Admin. The limits mirror the rules published on the
// Operations Manager rules page.

export type OpsRequestType =
  | 'Operational request'
  | 'Vehicle replacement'
  | 'Maintenance approval'
  | 'Overtime approval'
  | 'Dispatch override'
  | 'Vehicle release'

export type OpsRequestStatus = 'Pending' | 'Approved' | 'Returned' | 'Rejected' | 'Escalated'
export type OpsRequestPriority = 'Critical' | 'High' | 'Normal'

export type OpsRequestComment = {
  id: string
  author: string
  role: string
  time: string
  text: string
}

export type OpsRequestHistoryEntry = {
  id: string
  action: 'Submitted' | OpsRequestStatus | 'Commented'
  actor: string
  role: string
  time: string
  comment?: string
}

export type OpsRequest = {
  id: string
  type: OpsRequestType
  requester: string
  requesterRole: string
  zone: string
  detail: string
  amount?: number
  submitted: string
  status: OpsRequestStatus
  priority: OpsRequestPriority
  assignee: string
  vehicle?: string
  site?: string
  dueBy: string
  comments: OpsRequestComment[]
  history: OpsRequestHistoryEntry[]
}

/** Who a request goes to when it is above the Operations Manager's limit. */
export const approvalEscalationTarget = 'City admin · Hyderabad · Praveen Kumar'

export const opsApprovalLimits: Record<OpsRequestType, number> = {
  'Operational request': 50000,
  'Vehicle replacement': 100000,
  'Maintenance approval': 50000,
  'Overtime approval': 15000,
  'Dispatch override': 75000,
  'Vehicle release': 100000,
}

export const opsRequestTypes: OpsRequestType[] = [
  'Operational request',
  'Vehicle replacement',
  'Maintenance approval',
  'Overtime approval',
  'Dispatch override',
  'Vehicle release',
]

export const exceedsOpsLimit = (request: OpsRequest) =>
  request.amount !== undefined && request.amount > opsApprovalLimits[request.type]

export const formatRupees = (value: number) => `₹${value.toLocaleString('en-IN')}`

export const opsApprovalRequests: OpsRequest[] = [
  {
    id: 'APR-318',
    type: 'Vehicle replacement',
    requester: 'Ayesha Khan',
    requesterRole: 'Dispatcher',
    zone: 'Madhapur',
    detail:
      'The 14T crane on JOB-7801 failed its inspection with a bent jib section. The customer lift cannot slip, so a replacement unit is needed on site within 24 hours.',
    amount: 185000,
    submitted: 'Today · 13:05',
    status: 'Pending',
    priority: 'Critical',
    assignee: 'Operations Manager',
    vehicle: 'ACE Hydra Crane 14T',
    site: 'Metro rail site, HITEC City',
    dueBy: 'Today · 18:00',
    comments: [
      {
        id: 'APR-318-c1',
        author: 'Ayesha Khan',
        role: 'Dispatcher',
        time: 'Today · 13:06',
        text: 'Unit VH-041 is free at the Gachibowli yard and can be moved tonight if the swap is approved.',
      },
      {
        id: 'APR-318-c2',
        author: 'Ravi Teja',
        role: 'Zone Operator',
        time: 'Today · 13:20',
        text: 'Load test on VH-041 was signed off this morning, so it is fit to swap straight across.',
      },
    ],
    history: [
      {
        id: 'APR-318-h1',
        action: 'Submitted',
        actor: 'Ayesha Khan',
        role: 'Dispatcher',
        time: 'Today · 13:05',
        comment: 'Replacement unit required — inspection failure on the 14T crane.',
      },
    ],
  },
  {
    id: 'APR-317',
    type: 'Maintenance approval',
    requester: 'Workshop Team',
    requesterRole: 'Maintenance',
    zone: 'Madhapur',
    detail:
      'The mixer lost hydraulics twice on the same shift. A full hose and manifold replacement is needed before it goes back on a rental.',
    amount: 42000,
    submitted: 'Today · 10:20',
    status: 'Pending',
    priority: 'High',
    assignee: 'Operations Manager',
    vehicle: 'Schwing Stetter Mixer',
    site: 'Kondapur service bay',
    dueBy: 'Tomorrow',
    comments: [
      {
        id: 'APR-317-c1',
        author: 'Workshop Team',
        role: 'Maintenance',
        time: 'Today · 10:22',
        text: 'Parts are already in the yard, so the machine can be back on hire within a day of approval.',
      },
    ],
    history: [
      {
        id: 'APR-317-h1',
        action: 'Submitted',
        actor: 'Workshop Team',
        role: 'Maintenance',
        time: 'Today · 10:20',
        comment: 'Hose and manifold replacement quoted at ₹42,000.',
      },
    ],
  },
  {
    id: 'APR-316',
    type: 'Operational request',
    requester: 'Neha Pillai',
    requesterRole: 'Shift Supervisor',
    zone: 'Madhapur',
    detail:
      'Two operators are needed on the evening shift to cover the metro rail handovers while a crew is on leave. The overtime is already agreed by the customer.',
    amount: 28000,
    submitted: 'Today · 08:45',
    status: 'Pending',
    priority: 'High',
    assignee: 'Operations Manager',
    site: 'Metro rail site, HITEC City',
    dueBy: 'Today · 16:00',
    comments: [],
    history: [
      {
        id: 'APR-316-h1',
        action: 'Submitted',
        actor: 'Neha Pillai',
        role: 'Shift Supervisor',
        time: 'Today · 08:45',
        comment: 'Evening shift cover for two operators.',
      },
    ],
  },
  {
    id: 'APR-315',
    type: 'Dispatch override',
    requester: 'Ayesha Khan',
    requesterRole: 'Dispatcher',
    zone: 'Madhapur',
    detail:
      'JOB-7801 is unassigned for 40 minutes against a 30 minute SLA. Overriding the allocation to pull the excavator crew forward from the Kukatpally booking is requested.',
    amount: 96000,
    submitted: 'Yesterday · 17:20',
    status: 'Pending',
    priority: 'Critical',
    assignee: 'Operations Manager',
    vehicle: 'CAT 320 Excavator',
    site: 'HITEC City',
    dueBy: 'Overdue by 12 min',
    comments: [
      {
        id: 'APR-315-c1',
        author: 'Ayesha Khan',
        role: 'Dispatcher',
        time: 'Yesterday · 17:24',
        text: 'The Kukatpally customer has agreed to a one-day delay, so pulling the crew forward is safe.',
      },
    ],
    history: [
      {
        id: 'APR-315-h1',
        action: 'Submitted',
        actor: 'Ayesha Khan',
        role: 'Dispatcher',
        time: 'Yesterday · 17:20',
        comment: 'Dispatch override to clear an SLA breach.',
      },
    ],
  },
  {
    id: 'APR-314',
    type: 'Vehicle release',
    requester: 'Sridhar Nair',
    requesterRole: 'Zone Admin',
    zone: 'Madhapur',
    detail:
      'VH-028 is reserved for another zone but has been idle in the Madhapur yard for six days. Requesting release so it can be redeployed to the metro rail queue.',
    amount: 140000,
    submitted: 'Yesterday · 11:02',
    status: 'Escalated',
    priority: 'High',
    assignee: approvalEscalationTarget,
    vehicle: 'Volvo FMX Tipper',
    site: 'Gachibowli yard',
    dueBy: 'Yesterday',
    comments: [
      {
        id: 'APR-314-c1',
        author: 'Vikram Shah',
        role: 'Operations Manager',
        time: 'Yesterday · 11:40',
        text: 'This is above my release limit, so it goes to the City Admin with the idle-day record.',
      },
    ],
    history: [
      {
        id: 'APR-314-h1',
        action: 'Submitted',
        actor: 'Sridhar Nair',
        role: 'Zone Admin',
        time: 'Yesterday · 11:02',
        comment: 'Release requested for a vehicle held in another zone.',
      },
      {
        id: 'APR-314-h2',
        action: 'Escalated',
        actor: 'Vikram Shah',
        role: 'Operations Manager',
        time: 'Yesterday · 11:40',
        comment: 'Above the delegated release limit of ₹1,00,000 — escalated to the City Admin.',
      },
    ],
  },
  {
    id: 'APR-313',
    type: 'Overtime approval',
    requester: 'Neha Pillai',
    requesterRole: 'Shift Supervisor',
    zone: 'Madhapur',
    detail:
      'The night crew worked 3.5 hours over the roster to clear the Raipedi backlog. Overtime for four operators needs approval.',
    amount: 12500,
    submitted: 'Yesterday · 06:10',
    status: 'Approved',
    priority: 'Normal',
    assignee: 'Vikram Shah',
    site: 'Raipedi',
    dueBy: 'Yesterday',
    comments: [
      {
        id: 'APR-313-c1',
        author: 'Neha Pillai',
        role: 'Shift Supervisor',
        time: 'Yesterday · 06:12',
        text: 'Shift log confirms four operators signed out after 22:30.',
      },
    ],
    history: [
      {
        id: 'APR-313-h1',
        action: 'Submitted',
        actor: 'Neha Pillai',
        role: 'Shift Supervisor',
        time: 'Yesterday · 06:10',
        comment: 'Four operators, 3.5 hours over the roster.',
      },
      {
        id: 'APR-313-h2',
        action: 'Approved',
        actor: 'Vikram Shah',
        role: 'Operations Manager',
        time: 'Yesterday · 07:05',
        comment: 'Within the ₹15,000 overtime limit and the shift log matches.',
      },
    ],
  },
  {
    id: 'APR-312',
    type: 'Maintenance approval',
    requester: 'Workshop Team',
    requesterRole: 'Maintenance',
    zone: 'Madhapur',
    detail:
      'A 500-hour service on the tower crane is due and the jib inspection report is attached. The unit is scheduled out of the pool for one shift.',
    amount: 68500,
    submitted: '2 days ago · 14:30',
    status: 'Pending',
    priority: 'Normal',
    assignee: 'Operations Manager',
    vehicle: 'Tower Crane 6T',
    site: 'HITEC City yard',
    dueBy: '3 days left',
    comments: [
      {
        id: 'APR-312-c1',
        author: 'Sridhar Nair',
        role: 'Zone Admin',
        time: '2 days ago · 16:05',
        text: 'Flagged for the City Admin review as it is over the zone maintenance ceiling.',
      },
    ],
    history: [
      {
        id: 'APR-312-h1',
        action: 'Submitted',
        actor: 'Workshop Team',
        role: 'Maintenance',
        time: '2 days ago · 14:30',
        comment: '500-hour service and jib inspection scheduled.',
      },
    ],
  },
  {
    id: 'APR-311',
    type: 'Operational request',
    requester: 'Bharat Reddy',
    requesterRole: 'Zone Operator',
    zone: 'Madhapur',
    detail:
      'The crew was refused entry at the Uppal gate for a second time in the week. A written entry arrangement with the customer site is needed so jobs stop being re-timed.',
    amount: 15000,
    submitted: '2 days ago · 09:50',
    status: 'Returned',
    priority: 'High',
    assignee: 'Ayesha Khan',
    site: 'Uppal site entry',
    dueBy: '2 days ago',
    comments: [
      {
        id: 'APR-311-c1',
        author: 'Bharat Reddy',
        role: 'Zone Operator',
        time: '2 days ago · 09:52',
        text: 'Both denials were at the same gate, so the arrangement is the real fix.',
      },
    ],
    history: [
      {
        id: 'APR-311-h1',
        action: 'Submitted',
        actor: 'Bharat Reddy',
        role: 'Zone Operator',
        time: '2 days ago · 09:50',
        comment: 'Requesting a written entry arrangement with the customer.',
      },
      {
        id: 'APR-311-h2',
        action: 'Returned',
        actor: 'Vikram Shah',
        role: 'Operations Manager',
        time: '2 days ago · 12:15',
        comment: 'Please attach both gate denials and the customer contact so the request can be raised as a case.',
      },
    ],
  },
  {
    id: 'APR-310',
    type: 'Dispatch override',
    requester: 'Ayesha Khan',
    requesterRole: 'Dispatcher',
    zone: 'Madhapur',
    detail:
      'The tipper was held on site for a customer sign-off that never arrived, and the next booking could not start. A re-timed dispatch slot is requested to recover the day.',
    amount: 36000,
    submitted: '3 days ago · 16:20',
    status: 'Rejected',
    priority: 'Normal',
    assignee: 'Vikram Shah',
    site: 'Gachibowli yard',
    dueBy: '3 days ago',
    comments: [
      {
        id: 'APR-310-c1',
        author: 'Ayesha Khan',
        role: 'Dispatcher',
        time: '3 days ago · 16:24',
        text: 'The yard log shows the machine left the site at 18:40, so the slot was not used.',
      },
    ],
    history: [
      {
        id: 'APR-310-h1',
        action: 'Submitted',
        actor: 'Ayesha Khan',
        role: 'Dispatcher',
        time: '3 days ago · 16:20',
        comment: 'Re-timed dispatch slot requested.',
      },
      {
        id: 'APR-310-h2',
        action: 'Rejected',
        actor: 'Vikram Shah',
        role: 'Operations Manager',
        time: '3 days ago · 17:05',
        comment: 'The yard log shows the machine was released in time, so there is no loss to recover. Raised as a missed handover instead.',
      },
    ],
  },
  {
    id: 'APR-309',
    type: 'Vehicle replacement',
    requester: 'Imran Ali',
    requesterRole: 'Zone Operator',
    zone: 'Madhapur',
    detail:
      'A tyre burst on the tipper wrote off the tyre and damaged the rim. A replacement unit is needed for the Uppal booking tomorrow morning.',
    amount: 64000,
    submitted: '4 days ago · 07:40',
    status: 'Approved',
    priority: 'High',
    assignee: 'Vikram Shah',
    vehicle: 'Volvo FMX Tipper',
    site: 'Uppal',
    dueBy: '4 days ago',
    comments: [],
    history: [
      {
        id: 'APR-309-h1',
        action: 'Submitted',
        actor: 'Imran Ali',
        role: 'Zone Operator',
        time: '4 days ago · 07:40',
        comment: 'Replacement unit needed for tomorrow morning.',
      },
      {
        id: 'APR-309-h2',
        action: 'Approved',
        actor: 'Vikram Shah',
        role: 'Operations Manager',
        time: '4 days ago · 09:10',
        comment: 'Within the ₹1,00,000 replacement limit. VH-022 allocated from the Madhapur pool.',
      },
    ],
  },
  {
    id: 'APR-308',
    type: 'Overtime approval',
    requester: 'Neha Pillai',
    requesterRole: 'Shift Supervisor',
    zone: 'Madhapur',
    detail:
      'Six operators stayed on for the weekend handover cover. The overtime comes to ₹22,400, which is above the delegated overtime limit.',
    amount: 22400,
    submitted: '5 days ago · 19:00',
    status: 'Escalated',
    priority: 'Normal',
    assignee: approvalEscalationTarget,
    site: 'HITEC City',
    dueBy: '4 days ago',
    comments: [
      {
        id: 'APR-308-c1',
        author: 'Vikram Shah',
        role: 'Operations Manager',
        time: '4 days ago · 08:30',
        text: 'Escalated with the signed shift log — it is above my ₹15,000 overtime ceiling.',
      },
    ],
    history: [
      {
        id: 'APR-308-h1',
        action: 'Submitted',
        actor: 'Neha Pillai',
        role: 'Shift Supervisor',
        time: '5 days ago · 19:00',
        comment: 'Weekend handover cover for six operators.',
      },
      {
        id: 'APR-308-h2',
        action: 'Escalated',
        actor: 'Vikram Shah',
        role: 'Operations Manager',
        time: '4 days ago · 08:30',
        comment: 'Above the delegated overtime limit of ₹15,000 — escalated to the City Admin.',
      },
    ],
  },
]
