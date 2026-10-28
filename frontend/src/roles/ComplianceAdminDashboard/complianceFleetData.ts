// Fleet compliance domain data for the Compliance Admin dashboard.
// Vehicles, driver credentials, violations, corrective actions and audits are
// tracked separately from the document queue so the overview can report a
// single fleet-wide compliance percentage.
import type { ExpiryRow, SectionId } from './complianceAdminData'

export type VehicleComplianceStatus = 'Compliant' | 'Expiring' | 'Non-compliant'

export type FleetVehicle = {
  id: string
  plate: string
  model: string
  category: string
  city: string
  owner: string
  status: VehicleComplianceStatus
  score: number
  openIssues: number
  lastAudit: string
  nextAudit: string
  blocking: string
}

export type DriverCredentialKind =
  | 'Driving licence'
  | 'Operator badge'
  | 'Medical fitness'
  | 'Police verification'
  | 'Training certificate'

export type DriverCredentialStatus = 'Valid' | 'Expiring' | 'Expired' | 'Missing' | 'Suspended'

export type DriverCredential = {
  id: string
  driver: string
  phone: string
  city: string
  kind: DriverCredentialKind
  reference: string
  expiresOn: string
  daysLeft: number
  status: DriverCredentialStatus
  issue: string
}

export type ViolationSeverity = 'Critical' | 'Major' | 'Minor'
export type ViolationStatus = 'Open' | 'Under review' | 'Closed'

export type ComplianceViolation = {
  id: string
  vehicle: string
  model: string
  driver: string
  city: string
  type: string
  authority: string
  severity: ViolationSeverity
  issuedOn: string
  respondBy: string
  daysLeft: number
  penalty: number
  status: ViolationStatus
}

export type CorrectiveActionStatus = 'Overdue' | 'In progress' | 'Completed'

export type CorrectiveAction = {
  id: string
  violation: string
  vehicle: string
  action: string
  owner: string
  dueOn: string
  daysOverdue: number
  status: CorrectiveActionStatus
  evidence: string
}

export type AuditStatus = 'Scheduled' | 'In preparation' | 'Completed'

export type ComplianceAudit = {
  id: string
  title: string
  scope: string
  auditor: string
  scheduledOn: string
  daysUntil: number
  vehicles: number
  city: string
  status: AuditStatus
  checklist: string[]
}

export type ActivityTone = 'green' | 'amber' | 'red' | 'blue'

export type ComplianceActivity = {
  id: string
  time: string
  actor: string
  action: string
  detail: string
  tone: ActivityTone
}

export type AlertCategory =
  | 'Violation'
  | 'Corrective action'
  | 'Driver credential'
  | 'Vehicle'
  | 'Expiry'
  | 'Audit'
  | 'Document'

export type UrgentAlert = {
  id: string
  severity: 'Critical' | 'Warning'
  category: AlertCategory
  title: string
  detail: string
  owner: string
  due: string
}

export const fleetVehicles: FleetVehicle[] = [
  { id: 'VEH-01', plate: 'TS-07-HB-4412', model: 'CAT 320 GC', category: 'Excavator', city: 'Hyderabad', owner: 'Deccan Heavy Machinery', status: 'Compliant', score: 96, openIssues: 0, lastAudit: '04 Jul 2026', nextAudit: '04 Jan 2027', blocking: '—' },
  { id: 'VEH-02', plate: 'TS-13-TT-5590', model: 'Tipper 10W', category: 'Tipper', city: 'Khammam', owner: 'Sri Krishna Equipment Rentals', status: 'Compliant', score: 94, openIssues: 0, lastAudit: '11 Aug 2026', nextAudit: '11 Feb 2027', blocking: '—' },
  { id: 'VEH-03', plate: 'TS-07-TC-8853', model: 'Tower Crane TC-6', category: 'Tower crane', city: 'Hyderabad', owner: 'Charminar Plant Hire', status: 'Compliant', score: 92, openIssues: 0, lastAudit: '20 Sep 2026', nextAudit: '20 Mar 2027', blocking: '—' },
  { id: 'VEH-04', plate: 'TS-09-MX-7745', model: 'Schwing Stetter S4', category: 'Concrete pump', city: 'Hyderabad', owner: 'Deccan Heavy Machinery', status: 'Compliant', score: 90, openIssues: 0, lastAudit: '30 Aug 2026', nextAudit: '28 Feb 2027', blocking: '—' },
  { id: 'VEH-05', plate: 'TS-14-BD-3390', model: 'BharatBenz 1617R', category: 'Tipper', city: 'Hyderabad', owner: 'Charminar Plant Hire', status: 'Compliant', score: 90, openIssues: 0, lastAudit: '14 Aug 2026', nextAudit: '14 Feb 2027', blocking: '—' },
  { id: 'VEH-06', plate: 'TS-16-GR-4478', model: 'MG-180 Motor Grader', category: 'Motor grader', city: 'Warangal', owner: 'Warangal Earthmovers', status: 'Compliant', score: 88, openIssues: 0, lastAudit: '22 Sep 2026', nextAudit: '22 Mar 2027', blocking: '—' },
  { id: 'VEH-07', plate: 'TS-32-SG-1120', model: 'Sunward SC130', category: 'Excavator', city: 'Nizamabad', owner: 'Sri Krishna Equipment Rentals', status: 'Compliant', score: 87, openIssues: 0, lastAudit: '05 Sep 2026', nextAudit: '05 Mar 2027', blocking: '—' },
  { id: 'VEH-08', plate: 'TS-27-RM-2214', model: 'Compactor RM-800', category: 'Compactor', city: 'Suryapet', owner: 'Deccan Heavy Machinery', status: 'Compliant', score: 85, openIssues: 0, lastAudit: '28 Sep 2026', nextAudit: '28 Mar 2027', blocking: '—' },
  { id: 'VEH-09', plate: 'TS-08-PC-4401', model: 'Komatsu PC210', category: 'Excavator', city: 'Khammam', owner: 'Warangal Earthmovers', status: 'Compliant', score: 84, openIssues: 0, lastAudit: '18 Sep 2026', nextAudit: '18 Mar 2027', blocking: '—' },
  { id: 'VEH-10', plate: 'TS-21-BL-6640', model: 'JCB 3DX', category: 'Backhoe loader', city: 'Nalgonda', owner: 'Charminar Plant Hire', status: 'Compliant', score: 83, openIssues: 0, lastAudit: '16 Sep 2026', nextAudit: '16 Mar 2027', blocking: '—' },
  { id: 'VEH-11', plate: 'TS-09-MM-2287', model: 'JCB 3CX', category: 'Backhoe loader', city: 'Hyderabad', owner: 'Deccan Heavy Machinery', status: 'Expiring', score: 78, openIssues: 1, lastAudit: '15 Jul 2026', nextAudit: '15 Jan 2027', blocking: 'State permit PMT-811 expires in 10 days' },
  { id: 'VEH-12', plate: 'TS-16-EX-5521', model: 'Tata Hitachi EX200', category: 'Excavator', city: 'Warangal', owner: 'Warangal Earthmovers', status: 'Expiring', score: 71, openIssues: 1, lastAudit: '24 Sep 2026', nextAudit: '24 Mar 2027', blocking: 'State permit PMT-810 expires in 3 days' },
  { id: 'VEH-13', plate: 'TS-07-CW-9014', model: 'ACE AG-15', category: 'Compactor', city: 'Hyderabad', owner: 'Charminar Plant Hire', status: 'Expiring', score: 69, openIssues: 1, lastAudit: '21 Oct 2025', nextAudit: '21 Oct 2026', blocking: 'Urban permit PMT-808 expires in 6 days' },
  { id: 'VEH-14', plate: 'TS-26-HC-7726', model: 'Hydraulic Crane 25T', category: 'Crane', city: 'Ramagundam', owner: 'Sri Krishna Equipment Rentals', status: 'Expiring', score: 74, openIssues: 1, lastAudit: '27 Dec 2025', nextAudit: '27 Dec 2026', blocking: 'National permit PMT-801 renewal pending verification' },
  { id: 'VEH-15', plate: 'TS-12-LR-6621', model: 'Liebherr R 936', category: 'Excavator', city: 'Nizamabad', owner: 'Charminar Plant Hire', status: 'Expiring', score: 76, openIssues: 1, lastAudit: '12 Sep 2026', nextAudit: '12 Mar 2027', blocking: 'Fitness certificate expires in 11 days' },
  { id: 'VEH-16', plate: 'TS-15-PC-3390', model: 'Komatsu PC200', category: 'Excavator', city: 'Karimnagar', owner: 'Warangal Earthmovers', status: 'Non-compliant', score: 42, openIssues: 3, lastAudit: '02 Jul 2026', nextAudit: '02 Oct 2026', blocking: 'Permit PMT-809 expired · insurance scan rejected twice' },
  { id: 'VEH-17', plate: 'TS-11-JB-6602', model: 'JCB 3DX', category: 'Backhoe loader', city: 'Nizamabad', owner: 'Deccan Heavy Machinery', status: 'Non-compliant', score: 35, openIssues: 2, lastAudit: '14 Apr 2026', nextAudit: '14 Oct 2026', blocking: 'No permit on record · fitness certificate expires 03 Feb 2027' },
  { id: 'VEH-18', plate: 'TS-23-SS-3341', model: 'Skid Steer S650', category: 'Skid steer', city: 'Nalgonda', owner: 'Charminar Plant Hire', status: 'Non-compliant', score: 28, openIssues: 3, lastAudit: '29 Sep 2026', nextAudit: '29 Dec 2026', blocking: 'Urban permit PMT-805 expired · vehicle suspended' },
  { id: 'VEH-19', plate: 'TS-07-TK-1178', model: 'Volvo FMX 440', category: 'Tipper', city: 'Hyderabad', owner: 'Deccan Heavy Machinery', status: 'Non-compliant', score: 31, openIssues: 4, lastAudit: '01 Oct 2026', nextAudit: '01 Dec 2026', blocking: 'Insurance lapsed · failed post-accident inspection' },
  { id: 'VEH-20', plate: 'TS-19-LT-7788', model: 'Tata Prima 3118', category: 'Tipper', city: 'Warangal', owner: 'Sri Krishna Equipment Rentals', status: 'Non-compliant', score: 48, openIssues: 2, lastAudit: '06 May 2026', nextAudit: '06 Nov 2026', blocking: 'Brake failure incident · corrective action overdue' },
  { id: 'VEH-21', plate: 'TS-22-BD-5514', model: 'BharatBenz 1617R', category: 'Tipper', city: 'Warangal', owner: 'Warangal Earthmovers', status: 'Compliant', score: 93, openIssues: 0, lastAudit: '09 Sep 2026', nextAudit: '09 Mar 2027', blocking: '—' },
  { id: 'VEH-22', plate: 'TS-05-PC-2209', model: 'Komatsu PC210', category: 'Excavator', city: 'Hyderabad', owner: 'Deccan Heavy Machinery', status: 'Compliant', score: 91, openIssues: 0, lastAudit: '07 Sep 2026', nextAudit: '07 Mar 2027', blocking: '—' },
  { id: 'VEH-23', plate: 'TS-18-BE-4402', model: 'ACE AG-15', category: 'Compactor', city: 'Khammam', owner: 'Sri Krishna Equipment Rentals', status: 'Compliant', score: 89, openIssues: 0, lastAudit: '02 Sep 2026', nextAudit: '02 Mar 2027', blocking: '—' },
  { id: 'VEH-24', plate: 'TS-25-SK-9013', model: 'Skid Steer S650', category: 'Skid steer', city: 'Karimnagar', owner: 'Charminar Plant Hire', status: 'Compliant', score: 86, openIssues: 0, lastAudit: '29 Aug 2026', nextAudit: '29 Feb 2027', blocking: '—' },
  { id: 'VEH-25', plate: 'TS-03-JC-1188', model: 'JCB 3CX', category: 'Backhoe loader', city: 'Nizamabad', owner: 'Deccan Heavy Machinery', status: 'Compliant', score: 86, openIssues: 0, lastAudit: '26 Aug 2026', nextAudit: '26 Feb 2027', blocking: '—' },
]

export const driverCredentials: DriverCredential[] = [
  { id: 'DRV-118', driver: 'Ravi Teja', phone: '+91 98480 11221', city: 'Hyderabad', kind: 'Driving licence', reference: 'DL-TS-2019-44821', expiresOn: '14 Mar 2027', daysLeft: 190, status: 'Valid', issue: '' },
  { id: 'DRV-119', driver: 'Mahesh Kumar', phone: '+91 90000 55612', city: 'Warangal', kind: 'Operator badge', reference: 'OB-88214', expiresOn: '02 Aug 2027', daysLeft: 609, status: 'Valid', issue: '' },
  { id: 'DRV-120', driver: 'Suresh Babu', phone: '+91 99800 77341', city: 'Warangal', kind: 'Medical fitness', reference: 'MF-55120', expiresOn: '18 Oct 2026', daysLeft: 6, status: 'Expiring', issue: 'Medical fitness expires in 6 days' },
  { id: 'DRV-121', driver: 'Ashok Yadav', phone: '+91 93900 22810', city: 'Karimnagar', kind: 'Driving licence', reference: 'DL-TS-2016-90123', expiresOn: '30 Sep 2026', daysLeft: -8, status: 'Expired', issue: 'Driving licence expired on 30 Sep 2026' },
  { id: 'DRV-122', driver: 'Kiran Vardhan', phone: '+91 91000 44182', city: 'Warangal', kind: 'Police verification', reference: 'PV-3390', expiresOn: '11 Oct 2026', daysLeft: 1, status: 'Expiring', issue: 'Police verification expires tomorrow' },
  { id: 'DRV-123', driver: 'Gopal Rao', phone: '+91 98490 66370', city: 'Hyderabad', kind: 'Training certificate', reference: 'TC-7742', expiresOn: '22 Jan 2027', daysLeft: 105, status: 'Valid', issue: '' },
  { id: 'DRV-124', driver: 'Imran Sheikh', phone: '+91 88900 30551', city: 'Khammam', kind: 'Driving licence', reference: 'No record', expiresOn: 'No record', daysLeft: 0, status: 'Missing', issue: 'No licence record linked to the operator' },
  { id: 'DRV-125', driver: 'Naresh Kumar', phone: '+91 90007 12045', city: 'Khammam', kind: 'Operator badge', reference: 'OB-90118', expiresOn: '05 Oct 2026', daysLeft: -3, status: 'Expired', issue: 'Operator badge expired on 05 Oct 2026' },
  { id: 'DRV-126', driver: 'Fatima Begum', phone: '+91 94410 88002', city: 'Karimnagar', kind: 'Medical fitness', reference: 'MF-66310', expiresOn: '09 Jun 2028', daysLeft: 609, status: 'Valid', issue: '' },
  { id: 'DRV-127', driver: 'Venkat Rao', phone: '+91 99860 51204', city: 'Warangal', kind: 'Driving licence', reference: 'DL-TS-2020-71204', expiresOn: '21 Jan 2027', daysLeft: 105, status: 'Valid', issue: '' },
  { id: 'DRV-128', driver: 'Kavya Sree', phone: '+91 90300 77418', city: 'Nizamabad', kind: 'Police verification', reference: 'PV-4412', expiresOn: '12 Oct 2026', daysLeft: 2, status: 'Expiring', issue: 'Police verification expires in 2 days' },
  { id: 'DRV-129', driver: 'Srinivas Reddy', phone: '+91 91030 66127', city: 'Hyderabad', kind: 'Training certificate', reference: 'TC-8081', expiresOn: '13 Oct 2026', daysLeft: 3, status: 'Expiring', issue: 'Safety training certificate expires in 3 days' },
  { id: 'DRV-130', driver: 'Suresh Babu', phone: '+91 99800 77341', city: 'Warangal', kind: 'Operator badge', reference: 'OB-90233', expiresOn: '08 Nov 2026', daysLeft: 29, status: 'Suspended', issue: 'Badge suspended pending post-accident clearance' },
]

export const complianceViolations: ComplianceViolation[] = [
  { id: 'VIO-3401', vehicle: 'TS-15-PC-3390', model: 'Komatsu PC200', driver: 'Ashok Yadav', city: 'Karimnagar', type: 'Operation without a valid permit', authority: 'RTO Karimnagar', severity: 'Critical', issuedOn: '01 Oct 2026', respondBy: '08 Oct 2026', daysLeft: -2, penalty: 15000, status: 'Open' },
  { id: 'VIO-3402', vehicle: 'TS-07-TK-1178', model: 'Volvo FMX 440', driver: 'Suresh Babu', city: 'Hyderabad', type: 'Operated after insurance expiry', authority: 'Transport Dept.', severity: 'Critical', issuedOn: '02 Oct 2026', respondBy: '09 Oct 2026', daysLeft: -1, penalty: 25000, status: 'Open' },
  { id: 'VIO-3403', vehicle: 'TS-19-LT-7788', model: 'Tata Prima 3118', driver: 'Kiran Vardhan', city: 'Warangal', type: 'Brake failure incident at site', authority: 'District Safety Cell', severity: 'Critical', issuedOn: '05 Oct 2026', respondBy: '12 Oct 2026', daysLeft: 2, penalty: 18000, status: 'Open' },
  { id: 'VIO-3404', vehicle: 'TS-23-SS-3341', model: 'Skid Steer S650', driver: 'Gopal Rao', city: 'Nalgonda', type: 'Pollution control certificate expired', authority: 'State Pollution Board', severity: 'Major', issuedOn: '29 Sep 2026', respondBy: '20 Oct 2026', daysLeft: 10, penalty: 7500, status: 'Open' },
  { id: 'VIO-3405', vehicle: 'TS-11-JB-6602', model: 'JCB 3DX', driver: 'Imran Sheikh', city: 'Nizamabad', type: 'Fitness certificate not displayed', authority: 'RTO Nizamabad', severity: 'Major', issuedOn: '01 Oct 2026', respondBy: '22 Oct 2026', daysLeft: 12, penalty: 5000, status: 'Open' },
  { id: 'VIO-3406', vehicle: 'TS-09-MM-2287', model: 'JCB 3CX', driver: 'Mahesh Kumar', city: 'Hyderabad', type: 'Operator working without verified badge', authority: 'District Safety Cell', severity: 'Major', issuedOn: '06 Oct 2026', respondBy: '24 Oct 2026', daysLeft: 14, penalty: 9000, status: 'Open' },
  { id: 'VIO-3407', vehicle: 'TS-13-TT-5590', model: 'Tipper 10W', driver: 'Naresh Kumar', city: 'Khammam', type: 'Overloading beyond permitted load', authority: 'Weighbridge Checkpost', severity: 'Minor', issuedOn: '07 Oct 2026', respondBy: '27 Oct 2026', daysLeft: 17, penalty: 3000, status: 'Under review' },
  { id: 'VIO-3408', vehicle: 'TS-26-HC-7726', model: 'Hydraulic Crane 25T', driver: 'Venkat Rao', city: 'Ramagundam', type: 'Crane operated outside declared route', authority: 'Municipal Corporation', severity: 'Minor', issuedOn: '04 Oct 2026', respondBy: '28 Oct 2026', daysLeft: 18, penalty: 4500, status: 'Under review' },
  { id: 'VIO-3409', vehicle: 'TS-07-CW-9014', model: 'ACE AG-15', driver: 'Gopal Rao', city: 'Hyderabad', type: 'Unauthorised entry into restricted zone', authority: 'Project Site Contractor', severity: 'Minor', issuedOn: '08 Oct 2026', respondBy: '30 Oct 2026', daysLeft: 20, penalty: 3500, status: 'Closed' },
]

export const correctiveActions: CorrectiveAction[] = [
  { id: 'CA-2201', violation: 'VIO-3401', vehicle: 'TS-15-PC-3390', action: 'Replace expired permit and re-register the machine', owner: 'Warangal Earthmovers', dueOn: '28 Sep 2026', daysOverdue: 12, status: 'Overdue', evidence: 'Not submitted' },
  { id: 'CA-2202', violation: 'VIO-3402', vehicle: 'TS-07-TK-1178', action: 'Submit renewed insurance copy and re-inspect the vehicle', owner: 'Deccan Heavy Machinery', dueOn: '05 Oct 2026', daysOverdue: 5, status: 'Overdue', evidence: 'Awaiting workshop' },
  { id: 'CA-2203', violation: 'VIO-3403', vehicle: 'TS-19-LT-7788', action: 'Complete brake line replacement and clear re-test', owner: 'Sri Krishna Equipment Rentals', dueOn: '08 Oct 2026', daysOverdue: 2, status: 'Overdue', evidence: 'Parts ordered' },
  { id: 'CA-2204', violation: 'VIO-3406', vehicle: 'TS-09-MM-2287', action: 'Driver counselling and GPS re-calibration', owner: 'Deccan Heavy Machinery', dueOn: '14 Oct 2026', daysOverdue: -4, status: 'In progress', evidence: 'Session booked' },
  { id: 'CA-2205', violation: 'VIO-3405', vehicle: 'TS-11-JB-6602', action: 'Mount and display fitness certificate on windscreen', owner: 'Deccan Heavy Machinery', dueOn: '19 Oct 2026', daysOverdue: -9, status: 'In progress', evidence: 'Installer assigned' },
  { id: 'CA-2206', violation: 'VIO-3404', vehicle: 'TS-23-SS-3341', action: 'Renew pollution control certificate', owner: 'Charminar Plant Hire', dueOn: '02 Oct 2026', daysOverdue: 0, status: 'Completed', evidence: 'Certificate uploaded' },
  { id: 'CA-2207', violation: 'VIO-3407', vehicle: 'TS-13-TT-5590', action: 'Issue load permit and attach weighbridge log', owner: 'Sri Krishna Equipment Rentals', dueOn: '01 Oct 2026', daysOverdue: 0, status: 'Completed', evidence: 'Weighbridge slip received' },
]

export const complianceAudits: ComplianceAudit[] = [
  {
    id: 'AUD-118',
    title: 'Annual fleet compliance audit',
    scope: 'All registered machines in Hyderabad',
    auditor: 'Statutory Audit Cell',
    scheduledOn: '16 Oct 2026',
    daysUntil: 6,
    vehicles: 486,
    city: 'Hyderabad',
    status: 'Scheduled',
    checklist: ['Permit validity register', 'Insurance copies', 'Fitness certificates', 'Driver credential file'],
  },
  {
    id: 'AUD-119',
    title: 'Night inspection',
    scope: 'Skid steer and compactor cluster in Nalgonda',
    auditor: 'Inspector R. Devi',
    scheduledOn: '13 Oct 2026',
    daysUntil: 3,
    vehicles: 64,
    city: 'Nalgonda',
    status: 'Scheduled',
    checklist: ['Site safety logs', 'Light / horn checks', 'Night permit holder list'],
  },
  {
    id: 'AUD-120',
    title: 'Document audit — earthmoving cluster',
    scope: 'Warangal registered earthmoving fleet',
    auditor: 'District Compliance Desk',
    scheduledOn: '23 Oct 2026',
    daysUntil: 13,
    vehicles: 212,
    city: 'Warangal',
    status: 'Scheduled',
    checklist: ['Registration certificates', 'Pollution certificates', 'Insurance claims history'],
  },
  {
    id: 'AUD-121',
    title: 'Driver credential re-verification drive',
    scope: 'State-wide operator and driver review',
    auditor: 'Compliance Admin Desk',
    scheduledOn: '31 Oct 2026',
    daysUntil: 21,
    vehicles: 318,
    city: 'State-wide',
    status: 'In preparation',
    checklist: ['Driving licence spot check', 'Badge to licence mapping', 'Medical fitness records'],
  },
  {
    id: 'AUD-122',
    title: 'Corrective action closure review',
    scope: 'Overdue corrective actions raised this quarter',
    auditor: 'Super Admin Review Board',
    scheduledOn: '06 Nov 2026',
    daysUntil: 27,
    vehicles: 41,
    city: 'State-wide',
    status: 'In preparation',
    checklist: ['Evidence pack per action', 'Owner sign-off', 'Recurrence check'],
  },
  {
    id: 'AUD-117',
    title: 'Q2 statutory compliance audit',
    scope: 'All Telangana compliance records',
    auditor: 'Statutory Audit Cell',
    scheduledOn: '30 Sep 2026',
    daysUntil: -6,
    vehicles: 1204,
    city: 'State-wide',
    status: 'Completed',
    checklist: ['Full fleet document sweep', 'Violation ledger reconciliation', 'Findings published'],
  },
]

export const complianceActivity: ComplianceActivity[] = [
  { id: 'ACT-92', time: '25 minutes ago', actor: 'Nandita Verma', action: 'Raised violation', detail: 'VIO-3403 · Brake failure incident on TS-19-LT-7788', tone: 'red' },
  { id: 'ACT-91', time: '1 hour ago', actor: 'Nandita Verma', action: 'Acknowledged alert', detail: 'TS-11-JB-6602 · Fitness certificate not displayed', tone: 'amber' },
  { id: 'ACT-90', time: '2 hours ago', actor: 'System', action: 'Auto-suspended vehicle', detail: 'TS-23-SS-3341 · urban permit expired (PMT-805)', tone: 'red' },
  { id: 'ACT-89', time: '3 hours ago', actor: 'Nandita Verma', action: 'Verified document', detail: 'DOC-4106 · Driving licence (Fatima Begum)', tone: 'green' },
  { id: 'ACT-88', time: '4 hours ago', actor: 'Nandita Verma', action: 'Rejected document', detail: 'DOC-4110 · Insurance — policy number unreadable', tone: 'amber' },
  { id: 'ACT-87', time: 'Yesterday', actor: 'Nandita Verma', action: 'Recorded inspection', detail: 'INSP-2199 · Fail — brake line replacement assigned', tone: 'red' },
  { id: 'ACT-86', time: 'Yesterday', actor: 'System', action: 'Sent expiry reminder', detail: 'EX-90 · Ashok Yadav driving licence', tone: 'amber' },
  { id: 'ACT-85', time: '2 days ago', actor: 'Nandita Verma', action: 'Scheduled audit', detail: 'AUD-118 · Annual fleet compliance audit', tone: 'blue' },
  { id: 'ACT-84', time: '2 days ago', actor: 'Nandita Verma', action: 'Closed corrective action', detail: 'CA-2207 · Load permit issued for TS-13-TT-5590', tone: 'green' },
  { id: 'ACT-83', time: '3 days ago', actor: 'Nandita Verma', action: 'Escalated case', detail: 'ESC-71 · Insurance mismatch on TS-15-PC-3390 → State admin', tone: 'blue' },
]

// Which compliance card the overview drill-down table is following.
export type OverviewFocus =
  | 'overview'
  | 'compliant'
  | 'expiring'
  | 'non-compliant'
  | 'credentials'
  | 'violations'
  | 'actions'
  | 'audits'

// The KPI cards on the compliance overview each open their own page.
export type ComplianceKpiKey =
  | 'compliant'
  | 'expiring'
  | 'non-compliant'
  | 'credentials'
  | 'violations'
  | 'actions'
  | 'audits'
  | 'score'

export type ComplianceMetrics = {
  fleetSize: number
  compliantVehicles: number
  expiringDocuments: number
  nonCompliantVehicles: number
  driverCredentialIssues: number
  openViolations: number
  criticalViolations: number
  overdueCorrectiveActions: number
  upcomingAudits: number
  compliancePercentage: number
  penaltyExposure: number
}

export type ComplianceMetricsInput = {
  vehicles: FleetVehicle[]
  expiries: ExpiryRow[]
  credentials: DriverCredential[]
  violations: ComplianceViolation[]
  correctiveActions: CorrectiveAction[]
  audits: ComplianceAudit[]
}

// A vehicle counts fully compliant when it carries no open issue. Vehicles that
// are inside the expiry window are still dispatchable but only half compliant,
// and a non-compliant vehicle contributes nothing to the state score.
const EXPIRY_WINDOW_DAYS = 30

export const computeComplianceMetrics = (input: ComplianceMetricsInput): ComplianceMetrics => {
  const { vehicles, expiries, credentials, violations, correctiveActions, audits } = input

  const compliantVehicles = vehicles.filter((vehicle) => vehicle.status === 'Compliant').length
  const nonCompliantVehicles = vehicles.filter((vehicle) => vehicle.status === 'Non-compliant').length
  const expiringVehicles = vehicles.filter((vehicle) => vehicle.status === 'Expiring').length

  const weightedScore = compliantVehicles + expiringVehicles * 0.5
  const compliancePercentage = vehicles.length === 0 ? 0 : Math.round((weightedScore / vehicles.length) * 100)

  const openViolations = violations.filter((violation) => violation.status !== 'Closed')

  return {
    fleetSize: vehicles.length,
    compliantVehicles,
    expiringDocuments: expiries.filter((row) => row.daysLeft >= 0 && row.daysLeft <= EXPIRY_WINDOW_DAYS).length,
    nonCompliantVehicles,
    driverCredentialIssues: credentials.filter((row) => row.status !== 'Valid').length,
    openViolations: openViolations.length,
    criticalViolations: openViolations.filter((violation) => violation.severity === 'Critical').length,
    overdueCorrectiveActions: correctiveActions.filter((row) => row.status === 'Overdue').length,
    upcomingAudits: audits.filter((row) => row.status !== 'Completed').length,
    compliancePercentage,
    penaltyExposure: openViolations.reduce((sum, violation) => sum + violation.penalty, 0),
  }
}

export type UrgentAlertInput = {
  vehicles: FleetVehicle[]
  credentials: DriverCredential[]
  violations: ComplianceViolation[]
  correctiveActions: CorrectiveAction[]
  audits: ComplianceAudit[]
}

export const buildUrgentAlerts = (input: UrgentAlertInput): UrgentAlert[] => {
  const { vehicles, credentials, violations, correctiveActions, audits } = input

  const alerts: UrgentAlert[] = [
    ...violations
      .filter((violation) => violation.status !== 'Closed')
      .map((violation) => ({
        id: `alert-${violation.id}`,
        severity: (violation.severity === 'Critical' ? 'Critical' : 'Warning') as 'Critical' | 'Warning',
        category: 'Violation' as const,
        title: `${violation.severity} violation · ${violation.type}`,
        detail: `${violation.model} (${violation.vehicle}) · ${violation.city} · respond by ${violation.respondBy}`,
        owner: violation.authority,
        due: violation.daysLeft < 0 ? `${Math.abs(violation.daysLeft)} day(s) overdue` : `${violation.daysLeft} days left`,
      })),
    ...correctiveActions
      .filter((action) => action.status === 'Overdue')
      .map((action) => ({
        id: `alert-${action.id}`,
        severity: (action.daysOverdue >= 7 ? 'Critical' : 'Warning') as 'Critical' | 'Warning',
        category: 'Corrective action' as const,
        title: `Corrective action overdue by ${action.daysOverdue} days`,
        detail: `${action.action} · ${action.vehicle} · ${action.violation}`,
        owner: action.owner,
        due: `Due ${action.dueOn}`,
      })),
    ...credentials
      .filter((row) => row.status === 'Expired' || row.status === 'Missing' || row.status === 'Suspended')
      .map((row) => ({
        id: `alert-${row.id}`,
        severity: (row.status === 'Expired' || row.status === 'Missing' ? 'Critical' : 'Warning') as 'Critical' | 'Warning',
        category: 'Driver credential' as const,
        title: `${row.kind} ${row.status.toLowerCase()}`,
        detail: `${row.driver} · ${row.city} · ${row.issue}`,
        owner: row.driver,
        due: row.expiresOn,
      })),
    ...vehicles
      .filter((vehicle) => vehicle.status === 'Non-compliant')
      .map((vehicle) => ({
        id: `alert-${vehicle.id}`,
        severity: 'Warning' as const,
        category: 'Vehicle' as const,
        title: `${vehicle.model} blocked from dispatch`,
        detail: `${vehicle.plate} · ${vehicle.city} · ${vehicle.blocking}`,
        owner: vehicle.owner,
        due: `Score ${vehicle.score}%`,
      })),
    ...audits
      .filter((audit) => audit.status !== 'Completed' && audit.daysUntil <= 7)
      .map((audit) => ({
        id: `alert-${audit.id}`,
        severity: 'Warning' as const,
        category: 'Audit' as const,
        title: `Audit due in ${audit.daysUntil} days`,
        detail: `${audit.title} · ${audit.scope} · ${audit.vehicles} machines`,
        owner: audit.auditor,
        due: audit.scheduledOn,
      })),
  ]

  const rank = { Critical: 0, Warning: 1 }
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity])
}

export const cityCompliance = (vehicles: FleetVehicle[]) => {
  const cities = Array.from(new Set(vehicles.map((vehicle) => vehicle.city)))
  return cities
    .map((city) => {
      const rows = vehicles.filter((vehicle) => vehicle.city === city)
      const compliant = rows.filter((vehicle) => vehicle.status === 'Compliant').length
      const nonCompliant = rows.filter((vehicle) => vehicle.status === 'Non-compliant').length
      const expiring = rows.filter((vehicle) => vehicle.status === 'Expiring').length
      const score = Math.round(
        (rows.reduce((sum, vehicle) => sum + vehicle.score, 0) / rows.length) * 0.6 +
          (compliant / rows.length) * 100 * 0.4,
      )
      return { city, fleet: rows.length, compliant, expiring, nonCompliant, score: Math.min(score, 100) }
    })
    .sort((a, b) => a.score - b.score)
}

// Each alert category belongs to exactly one page of the compliance console.
export const alertTargetSection = (category: AlertCategory): SectionId => {
  switch (category) {
    case 'Violation':
      return 'violations'
    case 'Corrective action':
      return 'actions'
    case 'Driver credential':
      return 'drivers'
    case 'Vehicle':
      return 'vehicles'
    case 'Expiry':
      return 'expiries'
    case 'Audit':
      return 'audits'
    case 'Document':
      return 'documents'
  }
}
