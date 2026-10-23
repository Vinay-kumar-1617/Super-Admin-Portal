// Compliance-scoped seed data for the Telangana Compliance Admin dashboard.
import { emailForRole } from '../../auth/roleAccounts'

export type SectionId =
  | 'overview'
  | 'notifications'
  | 'vehicles'
  | 'drivers'
  | 'violations'
  | 'actions'
  | 'audits'
  | 'documents'
  | 'permits'
  | 'inspections'
  | 'suspensions'
  | 'expiries'
  | 'escalations'
  | 'reports'
  | 'rules'

export type DocSubjectType = 'Driver' | 'Vehicle' | 'Owner' | 'Fleet Partner'
export type DocStatus = 'Pending' | 'Renewed' | 'Verified' | 'Rejected'

export type ComplianceDocument = {
  id: string
  subjectType: DocSubjectType
  holder: string
  kind: string
  city: string
  submitted: string
  expiry: string
  status: DocStatus
  rejections: number
  rejectReason?: string
}

export type PermitStatus = 'Valid' | 'Pending verification' | 'Expiring' | 'Expired' | 'Missing'

export type PermitRow = {
  id: string
  vehicle: string
  model: string
  kind: 'State permit' | 'National permit' | 'Urban permit'
  driver: string
  city: string
  validTill: string
  daysLeft: number
  status: PermitStatus
}

export type InspectionStatus = 'Scheduled' | 'Overdue' | 'Pass' | 'Fail' | 'Pass with conditions'

export type InspectionRow = {
  id: string
  vehicle: string
  model: string
  kind: string
  dueOn: string
  assignedTo: string
  status: InspectionStatus
  note?: string
  followUp?: string
  history: Array<{ date: string; kind: string; result: string }>
}

export type InspectionSchedule = {
  id: string
  requirement: string
  frequency: string
  scope: string
  coverage: string
  nextWindow: string
}

export type SuspensionRow = {
  id: string
  subjectType: 'Vehicle' | 'Driver'
  subject: string
  city: string
  reason: string
  evidence: string
  since: string
  status: 'Suspended' | 'Reinstated'
  reinstatedOn?: string
}

export type ExpiryOwner = 'Driver' | 'Owner' | 'Partner'

export type ExpiryRow = {
  id: string
  subject: string
  ownerType: ExpiryOwner
  kind: 'Document' | 'Permit'
  item: string
  city: string
  expiresOn: string
  daysLeft: number
  reminded: boolean
}

export type EscalationDirection = 'Outgoing' | 'Incoming'
export type EscalationRisk = 'High' | 'Medium' | 'Unclear'
export type EscalationStatus = 'Open' | 'Acknowledged' | 'Resolved'

export type EscalationRow = {
  id: string
  direction: EscalationDirection
  subject: string
  risk: EscalationRisk
  party: string
  opened: string
  detail: string
  status: EscalationStatus
}

export type AuditEntry = {
  id: string
  time: string
  actor: string
  action: string
  detail: string
}

export const complianceProfile = {
  name: 'Telangana',
  adminName: 'Nandita Verma',
  adminEmail: emailForRole('compliance-admin'),
  adminInitials: 'NV',
}

export const permissions = [
  { group: 'Verify', items: ['document.verify', 'document.reject'] },
  { group: 'Manage', items: ['inspection.manage'] },
  { group: 'Suspend', items: ['vehicle.suspend[compliance]', 'driver.suspend[compliance]'] },
  { group: 'Escalate', items: ['State admin', 'Super admin'] },
]

export const documents: ComplianceDocument[] = [
  { id: 'DOC-4101', subjectType: 'Driver', holder: 'Ravi Teja', kind: 'Driving licence', city: 'Hyderabad', submitted: '2 hours ago', expiry: '14 Mar 2027', status: 'Pending', rejections: 0 },
  { id: 'DOC-4102', subjectType: 'Driver', holder: 'Mahesh Kumar', kind: 'Operator badge', city: 'Warangal', submitted: '4 hours ago', expiry: '02 Aug 2027', status: 'Pending', rejections: 0 },
  { id: 'DOC-4103', subjectType: 'Vehicle', holder: 'TS-07-HB-4412 · CAT 320 GC', kind: 'Registration certificate', city: 'Hyderabad', submitted: '5 hours ago', expiry: '21 Jan 2027', status: 'Pending', rejections: 0 },
  { id: 'DOC-4104', subjectType: 'Vehicle', holder: 'TS-09-MM-2287 · JCB 3CX', kind: 'Insurance', city: 'Hyderabad', submitted: '6 hours ago', expiry: '30 Nov 2026', status: 'Renewed', rejections: 1 },
  { id: 'DOC-4105', subjectType: 'Fleet Partner', holder: 'Sri Krishna Equipment Rentals', kind: 'Partner GST', city: 'Hyderabad', submitted: '1 day ago', expiry: '12 Apr 2027', status: 'Pending', rejections: 0 },
  { id: 'DOC-4106', subjectType: 'Driver', holder: 'Fatima Begum', kind: 'Driving licence', city: 'Karimnagar', submitted: '1 day ago', expiry: '09 Jun 2028', status: 'Verified', rejections: 0 },
  { id: 'DOC-4107', subjectType: 'Vehicle', holder: 'TS-16-EX-5521 · Tata Hitachi EX200', kind: 'Fitness certificate', city: 'Warangal', submitted: '1 day ago', expiry: '18 Dec 2026', status: 'Rejected', rejections: 1, rejectReason: 'Fitness copy older than 90 days — upload the latest workshop certificate.' },
  { id: 'DOC-4108', subjectType: 'Fleet Partner', holder: 'Warangal Earthmovers', kind: 'Partner GST', city: 'Warangal', submitted: '2 days ago', expiry: '25 Feb 2027', status: 'Pending', rejections: 0 },
  { id: 'DOC-4109', subjectType: 'Driver', holder: 'Srinivas Reddy', kind: 'Aadhaar ID', city: 'Hyderabad', submitted: '2 days ago', expiry: 'No expiry', status: 'Verified', rejections: 0 },
  { id: 'DOC-4110', subjectType: 'Vehicle', holder: 'TS-15-PC-3390 · Komatsu PC200', kind: 'Insurance', city: 'Karimnagar', submitted: '2 days ago', expiry: '05 Oct 2026', status: 'Rejected', rejections: 2, rejectReason: 'Policy number unreadable on the scan — resubmit a clear photo of the policy page.' },
  { id: 'DOC-4111', subjectType: 'Driver', holder: 'Ravi Teja', kind: 'Operator badge', city: 'Hyderabad', submitted: '3 days ago', expiry: '19 Sep 2027', status: 'Rejected', rejections: 2, rejectReason: 'Badge photo does not match the licence holder — re-capture with the badge number visible.' },
  { id: 'DOC-4112', subjectType: 'Vehicle', holder: 'TS-27-RM-2214 · Compactor RM-800', kind: 'Registration certificate', city: 'Suryapet', submitted: '3 days ago', expiry: '11 Jul 2027', status: 'Pending', rejections: 0 },
  { id: 'DOC-4113', subjectType: 'Owner', holder: 'Deccan Heavy Machinery', kind: 'Partner GST', city: 'Hyderabad', submitted: '3 days ago', expiry: '30 Sep 2028', status: 'Verified', rejections: 0 },
  { id: 'DOC-4114', subjectType: 'Driver', holder: 'Kavya Sree', kind: 'Driving licence', city: 'Nizamabad', submitted: '4 days ago', expiry: '22 Nov 2029', status: 'Renewed', rejections: 0 },
  { id: 'DOC-4115', subjectType: 'Vehicle', holder: 'TS-11-JB-6602 · JCB 3DX', kind: 'Fitness certificate', city: 'Nizamabad', submitted: '4 days ago', expiry: '03 Feb 2027', status: 'Pending', rejections: 0 },
  { id: 'DOC-4116', subjectType: 'Driver', holder: 'Imran Sheikh', kind: 'Aadhaar ID', city: 'Khammam', submitted: '5 days ago', expiry: 'No expiry', status: 'Pending', rejections: 0 },
  { id: 'DOC-4117', subjectType: 'Vehicle', holder: 'TS-07-TC-8853 · Tower Crane TC-6', kind: 'Insurance', city: 'Hyderabad', submitted: '5 days ago', expiry: '28 Oct 2026', status: 'Verified', rejections: 0 },
  { id: 'DOC-4118', subjectType: 'Fleet Partner', holder: 'Charminar Plant Hire', kind: 'Partner GST', city: 'Hyderabad', submitted: '6 days ago', expiry: '16 Jan 2027', status: 'Pending', rejections: 0 },
]

export const permitRows: PermitRow[] = [
  { id: 'PMT-812', vehicle: 'TS-07-HB-4412', model: 'CAT 320 GC', kind: 'National permit', driver: 'Ravi Teja', city: 'Hyderabad', validTill: '12 Dec 2026', daysLeft: 65, status: 'Valid' },
  { id: 'PMT-811', vehicle: 'TS-09-MM-2287', model: 'JCB 3CX', kind: 'State permit', driver: 'Suresh Babu', city: 'Hyderabad', validTill: '18 Oct 2026', daysLeft: 10, status: 'Valid' },
  { id: 'PMT-810', vehicle: 'TS-16-EX-5521', model: 'Tata Hitachi EX200', kind: 'State permit', driver: 'Kiran Vardhan', city: 'Warangal', validTill: '11 Oct 2026', daysLeft: 3, status: 'Expiring' },
  { id: 'PMT-809', vehicle: 'TS-15-PC-3390', model: 'Komatsu PC200', kind: 'National permit', driver: 'Ashok Yadav', city: 'Karimnagar', validTill: '05 Oct 2026', daysLeft: -3, status: 'Expired' },
  { id: 'PMT-808', vehicle: 'TS-07-CW-9014', model: 'ACE AG-15', kind: 'Urban permit', driver: 'Gopal Rao', city: 'Hyderabad', validTill: '14 Oct 2026', daysLeft: 6, status: 'Expiring' },
  { id: 'PMT-807', vehicle: 'TS-13-TT-5590', model: 'Tipper 10W', kind: 'State permit', driver: 'Naresh Kumar', city: 'Khammam', validTill: '22 Jan 2027', daysLeft: 105, status: 'Valid' },
  { id: 'PMT-806', vehicle: 'TS-11-JB-6602', model: 'JCB 3DX', kind: 'State permit', driver: 'Imran Sheikh', city: 'Nizamabad', validTill: 'No record', daysLeft: 0, status: 'Missing' },
  { id: 'PMT-805', vehicle: 'TS-23-SS-3341', model: 'Skid Steer S650', kind: 'Urban permit', driver: 'Suresh Babu', city: 'Nalgonda', validTill: '29 Sep 2026', daysLeft: -9, status: 'Expired' },
  { id: 'PMT-804', vehicle: 'TS-07-TC-8853', model: 'Tower Crane TC-6', kind: 'National permit', driver: 'Gopal Rao', city: 'Hyderabad', validTill: '18 Jun 2027', daysLeft: 253, status: 'Valid' },
  { id: 'PMT-803', vehicle: 'TS-16-GR-4478', model: 'MG-180 Motor Grader', kind: 'State permit', driver: 'Venkat Rao', city: 'Warangal', validTill: '03 Feb 2027', daysLeft: 118, status: 'Valid' },
  { id: 'PMT-802', vehicle: 'TS-09-MX-7745', model: 'Schwing Stetter S4', kind: 'State permit', driver: 'Gopal Rao', city: 'Hyderabad', validTill: '30 Nov 2026', daysLeft: 53, status: 'Pending verification' },
  { id: 'PMT-801', vehicle: 'TS-26-HC-7726', model: 'Hydraulic Crane 25T', kind: 'National permit', driver: 'Naresh Kumar', city: 'Ramagundam', validTill: '27 Dec 2026', daysLeft: 80, status: 'Pending verification' },
]

export const inspectionRows: InspectionRow[] = [
  {
    id: 'INSP-2201',
    vehicle: 'TS-07-HB-4412',
    model: 'CAT 320 GC',
    kind: 'Quarterly safety inspection',
    dueOn: '08 Oct 2026',
    assignedTo: 'Inspector K. Prasad',
    status: 'Overdue',
    history: [
      { date: '12 Jul 2026', kind: 'Quarterly safety', result: 'Pass' },
      { date: '10 Apr 2026', kind: 'Monthly tyre & brake', result: 'Pass' },
    ],
  },
  {
    id: 'INSP-2202',
    vehicle: 'TS-15-PC-3390',
    model: 'Komatsu PC200',
    kind: 'Quarterly safety inspection',
    dueOn: '05 Oct 2026',
    assignedTo: 'Inspector F. Khan',
    status: 'Overdue',
    history: [
      { date: '02 Jul 2026', kind: 'Quarterly safety', result: 'Pass with conditions' },
      { date: '04 Jun 2026', kind: 'Monthly tyre & brake', result: 'Pass' },
    ],
  },
  {
    id: 'INSP-2203',
    vehicle: 'TS-09-MM-2287',
    model: 'JCB 3CX',
    kind: 'Monthly tyre & brake check',
    dueOn: '15 Oct 2026',
    assignedTo: 'Inspector K. Prasad',
    status: 'Scheduled',
    history: [{ date: '14 Sep 2026', kind: 'Monthly tyre & brake', result: 'Pass' }],
  },
  {
    id: 'INSP-2204',
    vehicle: 'TS-07-CW-9014',
    model: 'ACE AG-15',
    kind: 'Annual fitness inspection',
    dueOn: '21 Oct 2026',
    assignedTo: 'Inspector R. Devi',
    status: 'Scheduled',
    history: [{ date: '19 Oct 2025', kind: 'Annual fitness', result: 'Pass' }],
  },
  {
    id: 'INSP-2205',
    vehicle: 'TS-13-TT-5590',
    model: 'Tipper 10W',
    kind: 'Monthly tyre & brake check',
    dueOn: '18 Oct 2026',
    assignedTo: 'Inspector F. Khan',
    status: 'Scheduled',
    history: [{ date: '16 Sep 2026', kind: 'Monthly tyre & brake', result: 'Pass' }],
  },
  {
    id: 'INSP-2206',
    vehicle: 'TS-23-SS-3341',
    model: 'Skid Steer S650',
    kind: 'Post-accident inspection',
    dueOn: '12 Oct 2026',
    assignedTo: 'Inspector R. Devi',
    status: 'Scheduled',
    history: [{ date: '11 Aug 2026', kind: 'Quarterly safety', result: 'Pass' }],
  },
  {
    id: 'INSP-2199',
    vehicle: 'TS-07-TK-1178',
    model: 'Volvo FMX 440',
    kind: 'Post-accident inspection',
    dueOn: '01 Oct 2026',
    assignedTo: 'Inspector F. Khan',
    status: 'Fail',
    note: 'Brake line leak found after site incident.',
    followUp: 'Workshop re-check assigned: brake line replacement before reinstatement.',
    history: [
      { date: '01 Oct 2026', kind: 'Post-accident', result: 'Fail' },
      { date: '12 Jul 2026', kind: 'Quarterly safety', result: 'Pass' },
    ],
  },
  {
    id: 'INSP-2198',
    vehicle: 'TS-27-RM-2214',
    model: 'Compactor RM-800',
    kind: 'Quarterly safety inspection',
    dueOn: '28 Sep 2026',
    assignedTo: 'Inspector K. Prasad',
    status: 'Pass with conditions',
    note: 'Rear-view mirror damaged; replace within 15 days.',
    history: [
      { date: '28 Sep 2026', kind: 'Quarterly safety', result: 'Pass with conditions' },
      { date: '26 Jun 2026', kind: 'Quarterly safety', result: 'Pass' },
    ],
  },
  {
    id: 'INSP-2197',
    vehicle: 'TS-16-EX-5521',
    model: 'Tata Hitachi EX200',
    kind: 'Annual fitness inspection',
    dueOn: '24 Sep 2026',
    assignedTo: 'Inspector R. Devi',
    status: 'Pass',
    history: [
      { date: '24 Sep 2026', kind: 'Annual fitness', result: 'Pass' },
      { date: '22 Sep 2025', kind: 'Annual fitness', result: 'Pass' },
    ],
  },
  {
    id: 'INSP-2196',
    vehicle: 'TS-07-TC-8853',
    model: 'Tower Crane TC-6',
    kind: 'Monthly cable & brake check',
    dueOn: '20 Sep 2026',
    assignedTo: 'Inspector F. Khan',
    status: 'Pass with conditions',
    note: 'Wire rope wear flagged; 30-day re-check booked.',
    history: [
      { date: '20 Sep 2026', kind: 'Monthly cable & brake', result: 'Pass with conditions' },
      { date: '20 Aug 2026', kind: 'Monthly cable & brake', result: 'Pass' },
    ],
  },
]

export const inspectionSchedules: InspectionSchedule[] = [
  { id: 'SCH-1', requirement: 'Monthly tyre & brake check', frequency: 'Every month', scope: 'Tippers & cranes', coverage: '142 machines', nextWindow: '15 Oct 2026' },
  { id: 'SCH-2', requirement: 'Quarterly safety inspection', frequency: 'Every 3 months', scope: 'All earthmoving fleet', coverage: '318 machines', nextWindow: '15 Oct 2026' },
  { id: 'SCH-3', requirement: 'Annual fitness inspection', frequency: 'Every 12 months', scope: 'All registered machines', coverage: '486 machines', nextWindow: '02 Nov 2026' },
  { id: 'SCH-4', requirement: 'Post-accident inspection', frequency: 'Within 72 hours of an incident', scope: 'Any machine involved in an incident', coverage: 'On demand', nextWindow: 'On demand' },
]

export const suspensionRows: SuspensionRow[] = [
  { id: 'SUS-55', subjectType: 'Vehicle', subject: 'TS-07-TK-1178 · Volvo FMX 440', city: 'Hyderabad', reason: 'Insurance lapsed on 30 Sep 2026', evidence: 'DOC-4096 · Insurance', since: '2 days ago', status: 'Suspended' },
  { id: 'SUS-54', subjectType: 'Driver', subject: 'Suresh Babu', city: 'Warangal', reason: 'Failed post-accident inspection', evidence: 'INSP-2199 · Fail', since: '4 days ago', status: 'Suspended' },
  { id: 'SUS-53', subjectType: 'Vehicle', subject: 'TS-23-SS-3341 · Skid Steer S650', city: 'Nalgonda', reason: 'Permit expired and not renewed', evidence: 'PMT-805 · Permit', since: '6 days ago', status: 'Suspended' },
  { id: 'SUS-52', subjectType: 'Driver', subject: 'Ashok Yadav', city: 'Karimnagar', reason: 'Driving licence expired', evidence: 'DOC-4088 · Driving licence', since: '1 week ago', status: 'Suspended' },
  { id: 'SUS-51', subjectType: 'Vehicle', subject: 'TS-15-PC-3390 · Komatsu PC200', city: 'Karimnagar', reason: 'Insurance scan rejected twice', evidence: 'DOC-4071 · Insurance', since: '2 weeks ago', status: 'Reinstated', reinstatedOn: '04 Oct 2026' },
  { id: 'SUS-50', subjectType: 'Driver', subject: 'Naresh Kumar', city: 'Khammam', reason: 'Operator badge lapsed', evidence: 'DOC-4065 · Operator badge', since: '3 weeks ago', status: 'Reinstated', reinstatedOn: '28 Sep 2026' },
]

export const expiryRows: ExpiryRow[] = [
  { id: 'EX-91', subject: 'TS-15-PC-3390 · Komatsu PC200', ownerType: 'Partner', kind: 'Permit', item: 'National permit PMT-809', city: 'Karimnagar', expiresOn: '05 Oct 2026', daysLeft: -3, reminded: true },
  { id: 'EX-90', subject: 'Ashok Yadav', ownerType: 'Driver', kind: 'Document', item: 'Driving licence', city: 'Karimnagar', expiresOn: '30 Sep 2026', daysLeft: -8, reminded: true },
  { id: 'EX-89', subject: 'TS-23-SS-3341 · Skid Steer S650', ownerType: 'Partner', kind: 'Permit', item: 'Urban permit PMT-805', city: 'Nalgonda', expiresOn: '29 Sep 2026', daysLeft: -9, reminded: false },
  { id: 'EX-88', subject: 'Deccan Heavy Machinery', ownerType: 'Owner', kind: 'Document', item: 'Liability insurance', city: 'Hyderabad', expiresOn: '01 Oct 2026', daysLeft: -7, reminded: true },
  { id: 'EX-87', subject: 'TS-07-CW-9014 · ACE AG-15', ownerType: 'Partner', kind: 'Permit', item: 'Urban permit PMT-808', city: 'Hyderabad', expiresOn: '14 Oct 2026', daysLeft: 6, reminded: false },
  { id: 'EX-86', subject: 'TS-16-EX-5521 · Tata Hitachi EX200', ownerType: 'Partner', kind: 'Permit', item: 'State permit PMT-810', city: 'Warangal', expiresOn: '11 Oct 2026', daysLeft: 3, reminded: false },
  { id: 'EX-85', subject: 'TS-15-PC-3390 · Komatsu PC200', ownerType: 'Partner', kind: 'Document', item: 'Fitness certificate', city: 'Karimnagar', expiresOn: '12 Oct 2026', daysLeft: 4, reminded: true },
  { id: 'EX-84', subject: 'Ravi Teja', ownerType: 'Driver', kind: 'Document', item: 'Operator badge', city: 'Hyderabad', expiresOn: '13 Oct 2026', daysLeft: 5, reminded: false },
  { id: 'EX-83', subject: 'Warangal Earthmovers', ownerType: 'Partner', kind: 'Document', item: 'Liability insurance', city: 'Warangal', expiresOn: '15 Oct 2026', daysLeft: 7, reminded: false },
  { id: 'EX-82', subject: 'TS-09-MM-2287 · JCB 3CX', ownerType: 'Partner', kind: 'Document', item: 'Insurance', city: 'Hyderabad', expiresOn: '30 Nov 2026', daysLeft: 53, reminded: false },
  { id: 'EX-81', subject: 'TS-07-HB-4412 · CAT 320 GC', ownerType: 'Partner', kind: 'Permit', item: 'National permit PMT-812', city: 'Hyderabad', expiresOn: '12 Dec 2026', daysLeft: 65, reminded: false },
  { id: 'EX-80', subject: 'Fatima Begum', ownerType: 'Driver', kind: 'Document', item: 'Driving licence', city: 'Karimnagar', expiresOn: '09 Jun 2028', daysLeft: 609, reminded: false },
  { id: 'EX-79', subject: 'Sri Krishna Equipment Rentals', ownerType: 'Owner', kind: 'Document', item: 'Partner GST', city: 'Hyderabad', expiresOn: '12 Apr 2027', daysLeft: 186, reminded: false },
  { id: 'EX-78', subject: 'TS-11-JB-6602 · JCB 3DX', ownerType: 'Partner', kind: 'Document', item: 'Fitness certificate', city: 'Nizamabad', expiresOn: '03 Feb 2027', daysLeft: 118, reminded: true },
]

export const expiryStatus = (row: ExpiryRow): 'Lapsed' | 'Due soon' | 'Healthy' =>
  row.daysLeft < 0 ? 'Lapsed' : row.daysLeft <= 7 ? 'Due soon' : 'Healthy'

export const escalationRows: EscalationRow[] = [
  { id: 'ESC-71', direction: 'Outgoing', subject: 'DOC-4110 · Insurance mismatch on TS-15-PC-3390', risk: 'High', party: 'State admin', opened: '3 hours ago', detail: 'Policy holder name differs from the RC book; state guidance needed before the rejection becomes final.', status: 'Open' },
  { id: 'ESC-70', direction: 'Incoming', subject: 'Check request: KYC pack for Srinivas Reddy', risk: 'Medium', party: 'Hyderabad City Admin', opened: '5 hours ago', detail: 'City admin asked for a second look at the GST mismatch flagged during the first review.', status: 'Open' },
  { id: 'ESC-69', direction: 'Outgoing', subject: 'Repeated rejection pattern for driver Ravi Teja', risk: 'Unclear', party: 'Super admin', opened: '1 day ago', detail: 'Two badge rejections in a row — unclear if documents are fraudulent or the upload flow is corrupting files.', status: 'Acknowledged' },
  { id: 'ESC-68', direction: 'Incoming', subject: 'Support escalation: partner claims permit renewed', risk: 'Medium', party: 'Support admin', opened: '1 day ago', detail: 'Partner says the renewal receipt was uploaded but the permit still shows expired.', status: 'Acknowledged' },
  { id: 'ESC-67', direction: 'Outgoing', subject: 'Crane fitness waiver request for Tower Crane TC-6', risk: 'High', party: 'Super admin', opened: '2 days ago', detail: 'Operator requests a 15-day fitness waiver for a live project; safety risk needs super admin sign-off.', status: 'Open' },
  { id: 'ESC-66', direction: 'Incoming', subject: 'Document scan quality review for Warangal batch', risk: 'Medium', party: 'Warangal City Admin', opened: '3 days ago', detail: 'Batch of four uploads arrived blank; city admin re-uploaded and confirmed the files.', status: 'Resolved' },
]

export const cityQueue = [
  { city: 'Hyderabad', pending: 5, rejected: 1, avgHours: 9, status: 'Backlog' },
  { city: 'Warangal', pending: 2, rejected: 1, avgHours: 14, status: 'Backlog' },
  { city: 'Nizamabad', pending: 2, rejected: 0, avgHours: 7, status: 'Balanced' },
  { city: 'Khammam', pending: 1, rejected: 0, avgHours: 5, status: 'Clear' },
  { city: 'Suryapet', pending: 1, rejected: 0, avgHours: 6, status: 'Clear' },
  { city: 'Karimnagar', pending: 0, rejected: 1, avgHours: 5, status: 'Clear' },
  { city: 'Nalgonda', pending: 0, rejected: 0, avgHours: 4, status: 'Clear' },
  { city: 'Ramagundam', pending: 0, rejected: 0, avgHours: 6, status: 'Clear' },
  { city: 'Siddipet', pending: 0, rejected: 0, avgHours: 3, status: 'Clear' },
]

export const rejectionReasons = [
  { reason: 'Blurred or cut-off scan', count: 9 },
  { reason: 'Expired document uploaded', count: 7 },
  { reason: 'Name mismatch with RC / licence', count: 5 },
  { reason: 'Wrong document type attached', count: 3 },
  { reason: 'Photo does not match holder', count: 2 },
]

export const verificationTurnaround = { medianHours: 7, within24h: 86, reviewedThisMonth: 142 }

export const auditTrail: AuditEntry[] = [
  { id: 'AL-12', time: '2 hours ago', actor: 'Nandita Verma', action: 'Verified document', detail: 'DOC-4106 · Driving licence (Fatima Begum)' },
  { id: 'AL-11', time: '4 hours ago', actor: 'Nandita Verma', action: 'Rejected document', detail: 'DOC-4110 · Insurance — policy number unreadable' },
  { id: 'AL-10', time: 'Yesterday', actor: 'Nandita Verma', action: 'Suspended vehicle', detail: 'TS-07-TK-1178 · insurance lapsed (DOC-4096)' },
  { id: 'AL-9', time: 'Yesterday', actor: 'Nandita Verma', action: 'Recorded inspection', detail: 'INSP-2199 · Fail — brake line replacement assigned' },
  { id: 'AL-8', time: '2 days ago', actor: 'Nandita Verma', action: 'Sent expiry reminder', detail: 'EX-90 · Ashok Yadav driving licence' },
]

export const suspendVehicleOptions = [
  { name: 'TS-07-HB-4412 · CAT 320 GC', city: 'Hyderabad' },
  { name: 'TS-09-MM-2287 · JCB 3CX', city: 'Hyderabad' },
  { name: 'TS-07-CW-9014 · ACE AG-15', city: 'Hyderabad' },
  { name: 'TS-16-EX-5521 · Tata Hitachi EX200', city: 'Warangal' },
  { name: 'TS-13-TT-5590 · Tipper 10W', city: 'Khammam' },
  { name: 'TS-07-TC-8853 · Tower Crane TC-6', city: 'Hyderabad' },
]

export const suspendDriverOptions = [
  { name: 'Ravi Teja', city: 'Hyderabad' },
  { name: 'Mahesh Kumar', city: 'Warangal' },
  { name: 'Fatima Begum', city: 'Karimnagar' },
  { name: 'Kavya Sree', city: 'Nizamabad' },
  { name: 'Imran Sheikh', city: 'Khammam' },
  { name: 'Gopal Rao', city: 'Hyderabad' },
]

export const buildComplianceAlerts = (
  docs: ComplianceDocument[],
  inspectionsDue: InspectionRow[],
  expiries: ExpiryRow[],
): Array<{
  id: string
  severity: 'Critical' | 'Warning'
  category: 'Expiry' | 'Vehicle' | 'Document'
  title: string
  detail: string
}> => [
  ...expiries
    .filter((row) => row.daysLeft <= 7)
    .map((row) => ({
      id: `alert-${row.id}`,
      severity: (row.daysLeft < 0 ? 'Critical' : 'Warning') as 'Critical' | 'Warning',
      category: 'Expiry' as const,
      title:
        row.daysLeft < 0
          ? `Lapsed ${row.kind.toLowerCase()}: ${row.item}`
          : `Expiring in ${row.daysLeft} day${row.daysLeft === 1 ? '' : 's'}: ${row.item}`,
      detail: `${row.subject} · ${row.city} · expires ${row.expiresOn}`,
    })),
  ...inspectionsDue
    .filter((row) => row.status === 'Overdue')
    .map((row) => ({
      id: `alert-${row.id}`,
      severity: 'Critical' as const,
      category: 'Vehicle' as const,
      title: `Overdue inspection: ${row.kind}`,
      detail: `${row.model} (${row.vehicle}) · was due ${row.dueOn} · ${row.assignedTo}`,
    })),
  ...docs
    .filter((doc) => doc.status === 'Rejected' && doc.rejections >= 2)
    .map((doc) => ({
      id: `alert-${doc.id}`,
      severity: 'Warning' as const,
      category: 'Document' as const,
      title: `Repeated rejections: ${doc.id}`,
      detail: `${doc.holder} · ${doc.kind} · rejected ${doc.rejections} times`,
    })),
].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'Critical' ? -1 : 1))

export const evidenceOptions = [
  'DOC-4110 · Insurance',
  'DOC-4111 · Operator badge',
  'DOC-4107 · Fitness certificate',
  'INSP-2199 · Fail',
  'INSP-2198 · Pass with conditions',
  'PMT-809 · Permit',
  'PMT-805 · Permit',
]

export const escalationTargets = ['State admin', 'Super admin']
export const escalationRisks: Array<'High' | 'Medium' | 'Unclear'> = ['High', 'Medium', 'Unclear']

export const dashboardPeriods = ['This Month', 'Last Month', 'Last 90 Days', 'This Year', 'All Time']
