// Issues and incident reports for the Operations Manager.
//
// A case file records what happened, how serious it is, who is handling it,
// what evidence was attached, where it stands in the resolution flow, and
// whether it has been escalated to the Zone Admin.

export type IssueCategory = 'Breakdown' | 'Accident' | 'Vehicle damage' | 'Missed handover' | 'Customer issue'
export type IssueSeverity = 'Critical' | 'Major' | 'Minor'
export type IssueStatus = 'Reported' | 'Investigating' | 'Action taken' | 'Resolved' | 'Escalated' | 'Closed'

export type IssueAttachment = {
  id: string
  name: string
  kind: 'Photo' | 'Video' | 'Document' | 'Inspection report'
  size: string
  uploadedBy: string
  uploadedAt: string
}

export type OpsIssue = {
  id: string
  category: IssueCategory
  severity: IssueSeverity
  title: string
  detail: string
  vehicle: string
  registration: string
  jobId: string | null
  bookingId: string | null
  site: string
  reportedBy: string
  reportedAt: string
  assignedTo: string | null
  status: IssueStatus
  attachments: IssueAttachment[]
  escalatedTo: string | null
  escalatedAt: string | null
  escalationReason: string | null
  resolutionNote: string | null
  resolvedAt: string | null
  injuries: number
  downtimeDays: number
}

export const issueCategories: IssueCategory[] = [
  'Breakdown',
  'Accident',
  'Vehicle damage',
  'Missed handover',
  'Customer issue',
]

export const issueSeverities: IssueSeverity[] = ['Critical', 'Major', 'Minor']

export const issueStatuses: IssueStatus[] = [
  'Reported',
  'Investigating',
  'Action taken',
  'Resolved',
  'Escalated',
  'Closed',
]

export const issueCategoryDescriptions: Record<IssueCategory, string> = {
  Breakdown: 'Machine stopped working on site or on the road.',
  Accident: 'Collision, tip-over or a site safety incident involving a machine.',
  'Vehicle damage': 'Damage to the machine, accessories or hired equipment.',
  'Missed handover': 'Delivery or return slot missed, or equipment not handed over.',
  'Customer issue': 'Billing, service quality or site access complaint raised by a customer.',
}

/** The Zone Admin every escalated case is routed to. */
export const zoneAdminTarget = 'Sridhar Nair · Madhapur Zone Admin'

export const issueAssignees: string[] = [
  'Kiran Vardhan',
  'Sunita Devi',
  'Ravi Teja',
  'Fatima Zahra',
  'Bharat Reddy',
  'Ayesha Siddiqui',
  'Rakesh Naidu',
  'Imran Ali',
  'Ayesha Khan',
  'Workshop Team',
]

const attachment = (
  issueId: string,
  index: number,
  name: string,
  kind: IssueAttachment['kind'],
  size: string,
  uploadedBy: string,
  uploadedAt: string,
): IssueAttachment => ({ id: `${issueId}-ATT-${index}`, name, kind, size, uploadedBy, uploadedAt })

export const opsIssues: OpsIssue[] = [
  {
    id: 'IS-1042',
    category: 'Breakdown',
    severity: 'Critical',
    title: 'Tower Crane 6T boom failure at the metro rail site',
    detail:
      'Hydraulic pressure dropped mid-lift and the boom locked out. The crane was stopped with a suspended load of 2.4 t and a site safety exclusion was put in place.',
    vehicle: 'Tower Crane 6T',
    registration: 'TS 07 AB 1234',
    jobId: 'JOB-7801',
    bookingId: 'BK-5190',
    site: 'Metro rail site, HITEC City',
    reportedBy: 'Ravi Teja',
    reportedAt: 'Today · 11:42',
    assignedTo: 'Workshop Team',
    status: 'Escalated',
    attachments: [
      attachment('IS-1042', 1, 'boom-hydraulic-leak.jpg', 'Photo', '2.4 MB', 'Ravi Teja', 'Today · 11:44'),
      attachment('IS-1042', 2, 'load-handover-note.pdf', 'Document', '310 KB', 'Ravi Teja', 'Today · 11:47'),
      attachment('IS-1042', 3, 'crane-inspection-report.pdf', 'Inspection report', '1.1 MB', 'Workshop Team', 'Today · 13:05'),
    ],
    escalatedTo: zoneAdminTarget,
    escalatedAt: 'Today · 13:20',
    escalationReason: 'Boom failure on a live metro site with a customer-critical lift. Needs a replacement unit and a vendor decision.',
    resolutionNote: null,
    resolvedAt: null,
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1041',
    category: 'Accident',
    severity: 'Critical',
    title: 'Tip-over on the Kondapur ramp',
    detail:
      'The mixer reversed on a sloped ramp while loading and tipped over onto the barrier. The operator was taken to the site clinic as a precaution; no serious injury was confirmed.',
    vehicle: 'Schwing Stetter Mixer',
    registration: 'TS 09 CD 4412',
    jobId: 'JOB-7788',
    bookingId: 'BK-5168',
    site: 'Kondapur ramp, TSIIC plot',
    reportedBy: 'Ayesha Siddiqui',
    reportedAt: 'Today · 09:15',
    assignedTo: 'Workshop Team',
    status: 'Investigating',
    attachments: [
      attachment('IS-1041', 1, 'ramp-scene-01.jpg', 'Photo', '1.8 MB', 'Ayesha Siddiqui', 'Today · 09:20'),
      attachment('IS-1041', 2, 'ramp-scene-02.jpg', 'Photo', '1.6 MB', 'Ayesha Siddiqui', 'Today · 09:21'),
      attachment('IS-1041', 3, 'operator-statement.pdf', 'Document', '220 KB', 'Ayesha Khan', 'Today · 10:02'),
    ],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: null,
    resolvedAt: null,
    injuries: 1,
    downtimeDays: 0,
  },
  {
    id: 'IS-1040',
    category: 'Vehicle damage',
    severity: 'Major',
    title: 'Bucket teeth damaged on the excavator',
    detail:
      'Three bucket teeth were sheared while digging through a rock shelf. The teeth were replaced from the yard stock and the machine returned to service the same shift.',
    vehicle: 'CAT 320 Excavator',
    registration: 'TS 05 EF 9087',
    jobId: 'JOB-7795',
    bookingId: 'BK-5182',
    site: 'HITEC City yard',
    reportedBy: 'Kiran Vardhan',
    reportedAt: 'Yesterday · 18:32',
    assignedTo: 'Workshop Team',
    status: 'Action taken',
    attachments: [
      attachment('IS-1040', 1, 'damaged-teeth.jpg', 'Photo', '940 KB', 'Kiran Vardhan', 'Yesterday · 18:40'),
      attachment('IS-1040', 2, 'parts-replacement-note.pdf', 'Document', '180 KB', 'Workshop Team', 'Yesterday · 20:15'),
    ],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: 'Teeth replaced from yard stock. Cost of ₹18,400 charged to the damage account.',
    resolvedAt: null,
    injuries: 0,
    downtimeDays: 1,
  },
  {
    id: 'IS-1039',
    category: 'Missed handover',
    severity: 'Major',
    title: 'Return slot missed at the Gachibowli yard',
    detail:
      'The tipper was held on site because the customer sign-off was not available. The machine arrived back six hours after the agreed slot, which put the next booking at risk.',
    vehicle: 'Volvo FMX Tipper',
    registration: 'TS 03 GH 7756',
    jobId: 'JOB-7790',
    bookingId: 'BK-5173',
    site: 'Gachibowli yard',
    reportedBy: 'Imran Ali',
    reportedAt: 'Yesterday · 16:05',
    assignedTo: 'Ayesha Khan',
    status: 'Escalated',
    attachments: [
      attachment('IS-1039', 1, 'yard-gate-log.pdf', 'Document', '140 KB', 'Imran Ali', 'Yesterday · 16:20'),
    ],
    escalatedTo: zoneAdminTarget,
    escalatedAt: 'Yesterday · 17:30',
    escalationReason: 'Third missed handover in the zone this month — needs a Zone Admin decision on slot discipline.',
    resolutionNote: null,
    resolvedAt: null,
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1038',
    category: 'Customer issue',
    severity: 'Major',
    title: 'Shortfall on the invoice raised to MEIL',
    detail:
      'The customer was billed for 12 hours of crane use where the site log shows 9. The difference is being disputed and the amount is on hold.',
    vehicle: 'Tower Crane 6T',
    registration: 'TS 07 AB 1234',
    jobId: null,
    bookingId: 'BK-5171',
    site: 'Sobha Realty, Gachibowli',
    reportedBy: 'Ayesha Khan',
    reportedAt: 'Yesterday · 14:22',
    assignedTo: 'Ayesha Khan',
    status: 'Investigating',
    attachments: [
      attachment('IS-1038', 1, 'customer-invoice.pdf', 'Document', '260 KB', 'Ayesha Khan', 'Yesterday · 14:30'),
      attachment('IS-1038', 2, 'site-hour-log.pdf', 'Document', '310 KB', 'Ayesha Khan', 'Yesterday · 14:31'),
    ],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: null,
    resolvedAt: null,
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1037',
    category: 'Breakdown',
    severity: 'Minor',
    title: 'Hydraulic hose weeping on the backhoe',
    detail:
      'Slow drip found during the pre-shift check. The hose was replaced in the yard and the machine was released for the morning shift.',
    vehicle: 'JCB 3CX Backhoe',
    registration: 'TS 11 JK 3320',
    jobId: 'JOB-7788',
    bookingId: 'BK-5168',
    site: 'Kondapur service bay',
    reportedBy: 'Rakesh Naidu',
    reportedAt: '2 days ago · 07:40',
    assignedTo: 'Workshop Team',
    status: 'Resolved',
    attachments: [
      attachment('IS-1037', 1, 'hose-drip.jpg', 'Photo', '780 KB', 'Rakesh Naidu', '2 days ago · 07:45'),
    ],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: 'Hose replaced and the circuit pressure tested. Machine released at 09:10.',
    resolvedAt: '2 days ago · 09:10',
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1036',
    category: 'Vehicle damage',
    severity: 'Minor',
    title: 'Scratched handrail on the mixer',
    detail:
      'A handrail was scraped while repositioning the machine inside the yard. Cosmetic only — no safety impact and no service interruption.',
    vehicle: 'Schwing Stetter Mixer',
    registration: 'TS 09 CD 4412',
    jobId: null,
    bookingId: 'BK-5176',
    site: 'Raidurg yard',
    reportedBy: 'Sunita Devi',
    reportedAt: '3 days ago · 15:12',
    assignedTo: 'Workshop Team',
    status: 'Closed',
    attachments: [],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: 'Handrail refinished and the machine returned to the pool.',
    resolvedAt: '3 days ago · 17:40',
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1035',
    category: 'Accident',
    severity: 'Minor',
    title: 'Barrier strike on the highway depot',
    detail:
      'A delivery vehicle clipped a temporary barrier while reversing into the depot. The barrier was replaced the same day and no vehicle damage was found.',
    vehicle: 'Tower Crane 6T',
    registration: 'TS 07 AB 1234',
    jobId: null,
    bookingId: 'BK-5190',
    site: 'Highway depot, Madhapur',
    reportedBy: 'Ayesha Siddiqui',
    reportedAt: '4 days ago · 11:20',
    assignedTo: 'Workshop Team',
    status: 'Closed',
    attachments: [
      attachment('IS-1035', 1, 'depot-barrier.jpg', 'Photo', '690 KB', 'Ayesha Siddiqui', '4 days ago · 11:30'),
    ],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: 'Barrier replaced. Driver briefed on the reversing route.',
    resolvedAt: '4 days ago · 15:00',
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1034',
    category: 'Missed handover',
    severity: 'Minor',
    title: 'Handover delayed by the site gate',
    detail:
      'The site gate did not open for the morning slot and the machine waited 50 minutes before the handover could be completed.',
    vehicle: 'ACE Hydra Crane 14T',
    registration: 'TS 04 IJ 2288',
    jobId: 'JOB-7793',
    bookingId: 'BK-5171',
    site: 'Sobha Realty, Gachibowli',
    reportedBy: 'Bharat Reddy',
    reportedAt: '5 days ago · 08:05',
    assignedTo: 'Ayesha Khan',
    status: 'Resolved',
    attachments: [],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: 'Gate timings agreed with the site office for future slots.',
    resolvedAt: '4 days ago · 12:00',
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1033',
    category: 'Customer issue',
    severity: 'Minor',
    title: 'Operator did not carry the updated site induction',
    detail:
      'A customer rejected the handover because the operator had not completed the updated site induction form.',
    vehicle: 'CAT 320 Excavator',
    registration: 'TS 05 EF 9087',
    jobId: null,
    bookingId: 'BK-5182',
    site: 'L&T Metro Rail, HITEC City',
    reportedBy: 'Kiran Vardhan',
    reportedAt: '6 days ago · 16:48',
    assignedTo: 'Kiran Vardhan',
    status: 'Closed',
    attachments: [
      attachment('IS-1033', 1, 'site-induction-form.pdf', 'Document', '120 KB', 'Kiran Vardhan', '6 days ago · 16:55'),
    ],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: 'Operator re-inducted and the form filed before the next shift.',
    resolvedAt: '5 days ago · 09:30',
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1032',
    category: 'Customer issue',
    severity: 'Major',
    title: 'Access denied at the Uppal gate for a second time',
    detail:
      'The crew was turned away from the Uppal site entry despite a confirmed booking. The job was re-timed, which pushed the customer delivery by a day.',
    vehicle: 'Volvo FMX Tipper',
    registration: 'TS 03 GH 7756',
    jobId: 'JOB-7790',
    bookingId: 'BK-5173',
    site: 'Uppal site entry',
    reportedBy: 'Imran Ali',
    reportedAt: '7 days ago · 07:35',
    assignedTo: 'Ayesha Khan',
    status: 'Escalated',
    attachments: [
      attachment('IS-1032', 1, 'gate-refusal.jpg', 'Photo', '1.1 MB', 'Imran Ali', '7 days ago · 07:40'),
      attachment('IS-1032', 2, 'customer-email.pdf', 'Document', '190 KB', 'Ayesha Khan', '7 days ago · 09:10'),
    ],
    escalatedTo: zoneAdminTarget,
    escalatedAt: '7 days ago · 10:00',
    escalationReason: 'Repeat access denial on the same site — needs the Zone Admin to confirm the entry arrangement with the customer.',
    resolutionNote: null,
    resolvedAt: null,
    injuries: 0,
    downtimeDays: 1,
  },
  {
    id: 'IS-1031',
    category: 'Breakdown',
    severity: 'Minor',
    title: 'Electrical fault on the crane control panel',
    detail:
      'The control panel threw a fault code twice on the same shift. It was reset and the wiring loom was inspected.',
    vehicle: 'Tower Crane 6T',
    registration: 'TS 07 AB 1234',
    jobId: null,
    bookingId: 'BK-5190',
    site: 'HITEC City yard',
    reportedBy: 'Fatima Zahra',
    reportedAt: '8 days ago · 13:12',
    assignedTo: 'Workshop Team',
    status: 'Resolved',
    attachments: [
      attachment('IS-1031', 1, 'control-panel-fault.jpg', 'Photo', '820 KB', 'Fatima Zahra', '8 days ago · 13:20'),
    ],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: 'Loom connector replaced under the 500-hour service.',
    resolvedAt: '7 days ago · 11:00',
    injuries: 0,
    downtimeDays: 1,
  },
  {
    id: 'IS-1030',
    category: 'Accident',
    severity: 'Major',
    title: 'Near miss with a reversing JCB on the Raidurg plot',
    detail:
      'A reversing JCB came within a metre of a pedestrian at the site gate. The spotter was not in place at the time. No injury occurred.',
    vehicle: 'JCB 3CX Backhoe',
    registration: 'TS 11 JK 3320',
    jobId: null,
    bookingId: 'BK-5176',
    site: 'Raidurg plot',
    reportedBy: 'Sunita Devi',
    reportedAt: '9 days ago · 17:45',
    assignedTo: 'Ayesha Khan',
    status: 'Action taken',
    attachments: [
      attachment('IS-1030', 1, 'near-miss-site.jpg', 'Photo', '1.3 MB', 'Sunita Devi', '9 days ago · 17:52'),
      attachment('IS-1030', 2, 'spotter-briefing.pdf', 'Document', '150 KB', 'Ayesha Khan', '8 days ago · 08:30'),
    ],
    escalatedTo: null,
    escalatedAt: null,
    escalationReason: null,
    resolutionNote: 'Spotter made mandatory for reversing on this site. Toolbox brief issued to all operators.',
    resolvedAt: null,
    injuries: 0,
    downtimeDays: 0,
  },
  {
    id: 'IS-1029',
    category: 'Vehicle damage',
    severity: 'Major',
    title: 'Crane outrigger damage on soft ground',
    detail:
      'One outrigger pad sank on soft ground during setup and the outrigger leg was bent. The unit was withdrawn from service pending a structural inspection.',
    vehicle: 'ACE Hydra Crane 14T',
    registration: 'TS 04 IJ 2288',
    jobId: 'JOB-7793',
    bookingId: 'BK-5171',
    site: 'Manikonda layout',
    reportedBy: 'Bharat Reddy',
    reportedAt: '11 days ago · 10:22',
    assignedTo: 'Workshop Team',
    status: 'Action taken',
    attachments: [
      attachment('IS-1029', 1, 'outrigger-damage.jpg', 'Photo', '1.5 MB', 'Bharat Reddy', '11 days ago · 10:30'),
      attachment('IS-1029', 2, 'structural-inspection.pdf', 'Inspection report', '2.2 MB', 'Workshop Team', '9 days ago · 14:00'),
    ],
    escalatedTo: zoneAdminTarget,
    escalatedAt: '10 days ago · 09:00',
    escalationReason: 'Structural damage on a lifting unit — engineering decision sits with the Zone Admin.',
    resolutionNote: null,
    resolvedAt: null,
    injuries: 0,
    downtimeDays: 8,
  },
  {
    id: 'IS-1028',
    category: 'Missed handover',
    severity: 'Critical',
    title: 'Crane not released for the night shift',
    detail:
      'The crane was not handed back at the end of the evening slot, leaving the next shift without a lifting unit and a customer lift at risk.',
    vehicle: 'Tower Crane 6T',
    registration: 'TS 07 AB 1234',
    jobId: 'JOB-7801',
    bookingId: 'BK-5190',
    site: 'Metro rail site, HITEC City',
    reportedBy: 'Ayesha Khan',
    reportedAt: '12 days ago · 21:40',
    assignedTo: 'Ayesha Khan',
    status: 'Closed',
    attachments: [
      attachment('IS-1028', 1, 'shift-handover-log.pdf', 'Document', '170 KB', 'Ayesha Khan', '12 days ago · 21:50'),
    ],
    escalatedTo: zoneAdminTarget,
    escalatedAt: '12 days ago · 22:10',
    escalationReason: 'A customer-critical lift was put at risk with no replacement unit available.',
    resolutionNote: 'Handback policy re-issued to the shift team. Replacement unit arranged for the following night.',
    resolvedAt: '11 days ago · 07:30',
    injuries: 0,
    downtimeDays: 0,
  },
]
