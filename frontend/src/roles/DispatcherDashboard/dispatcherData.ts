// City-scoped seed data for the Hyderabad Dispatcher dashboard.
// Sits under the Operations Manager: dispatchers read every job in their
// city and drive live assignment. Permissions: dispatch.read, dispatch.assign,
// dispatch.reassign (reason + audit required) and driver.contact.
import { emailForRole } from '../../auth/roleAccounts'

export type SectionId =
  | 'overview'
  | 'dispatch'
  | 'map'
  | 'reassign'
  | 'contact'
  | 'shift'
  | 'escalations'

export type KpiTone = 'green' | 'blue' | 'purple' | 'orange'

export type DispatcherKpi = {
  label: string
  value: string
  change: string
  tone: KpiTone
  description: string
  target: SectionId
}

export type DispatcherAlert = {
  id: string
  title: string
  detail: string
  time: string
  severity: 'Critical' | 'Warning' | 'Info'
  target: SectionId
}

export type DispatcherNotification = {
  id: string
  title: string
  detail: string
  time: string
  tone: 'green' | 'amber' | 'red' | 'blue'
  read: boolean
  target: string
}

export type JobStatus = 'Unassigned' | 'Assigned' | 'In Progress' | 'Stuck' | 'At Risk'

export type DispatchJob = {
  id: string
  bookingId: string
  customer: string
  owner: string
  city: string
  zone: string
  machine: string
  requiredType: VehicleType
  priority: 'Urgent' | 'Normal'
  status: JobStatus
  requested: string
  waiting: number
  sla: number
  operator?: string
  operatorId?: string
  ownerAssigned: boolean
  operatorAccepted: boolean
  map: { x: number; y: number }
}

export type VehicleType =
  | 'Excavator'
  | 'Crane'
  | 'Backhoe Loader'
  | 'Concrete Mixer'
  | 'Tipper'
  | 'Concrete Pump'
  | 'Motor Grader'
  | 'Compactor'

export type OperatorStatus = 'Available' | 'Assigned' | 'On the way' | 'At site' | 'Returning' | 'Offline'

export type DispatcherOperator = {
  id: string
  name: string
  phone: string
  zone: string
  city: string
  vehicle: string
  vehicleType: VehicleType
  status: OperatorStatus
  rating: number
  jobsToday: number
  distanceKm: number
  availableIn: string
  since: string
  map: { x: number; y: number }
}

export type Suitability = 'Match' | 'Partial' | 'Not suitable'

export type ZoneBoundary = {
  id: string
  name: string
  city: string
  x: number
  y: number
  w: number
  h: number
}

export type Reassignment = {
  id: string
  jobId: string
  from: string
  to: string
  reason: string
  time: string
  notifyCustomer: boolean
  notifyOwner: boolean
}

export type ContactChannel = 'Call' | 'Message'

export type ContactEntry = {
  id: string
  jobId: string
  operatorId: string
  operator: string
  channel: ContactChannel
  message: string
  note: string
  time: string
  by: string
}

export type HandoverNote = {
  id: string
  time: string
  author: string
  shift: 'Morning' | 'Evening' | 'Night'
  text: string
}

export type EscalationKind = 'Stuck job' | 'Shortage' | 'Operator problem' | 'Complaint' | 'Incident'

export type EscalationStatus = 'Open' | 'Acknowledged' | 'Escalated'

export type Escalation = {
  id: string
  kind: EscalationKind
  reference: string
  subject: string
  detail: string
  received: string
  severity: 'Critical' | 'Warning' | 'Info'
  status: EscalationStatus
  escalatedTo?: string
}

export type AuditEntry = {
  id: string
  time: string
  actor: string
  action: string
  target: string
  reason: string
}

export const dispatcherProfile = {
  state: 'Telangana',
  city: 'Hyderabad',
  code: 'HYD',
  name: 'Ayesha Khan',
  email: emailForRole('dispatcher'),
  initials: 'AK',
  shift: 'Morning',
  shiftWindow: '06:00 – 14:00',
  dispatchTarget: 30,
}

export const permissions: Array<{ scope: string; detail: string }> = [
  { scope: 'dispatch.read', detail: 'View every job in Hyderabad and its live dispatch status' },
  { scope: 'dispatch.assign', detail: 'Assign an operator manually when nobody has accepted' },
  { scope: 'dispatch.reassign', detail: 'Move a job to another operator (reason + audit required)' },
  { scope: 'driver.contact', detail: 'Call or message operators and keep a contact log per job' },
]

export const quickMessages: string[] = [
  'Are you on the way to the site?',
  'Site access has changed — new gate coordinator is on shift.',
  'Customer reports the machine is needed earlier than scheduled.',
  'Please confirm fuel and safety checks before leaving.',
  'Running late — share your current ETA.',
  'Job is cancelled — stand down and return to yard.',
]

export const dispatcherKpis: DispatcherKpi[] = [
  {
    label: 'Open jobs',
    value: '24',
    change: '+3',
    tone: 'blue',
    description: 'All live jobs across Hyderabad in scope for dispatch.',
    target: 'dispatch',
  },
  {
    label: 'Unassigned jobs',
    value: '6',
    change: '+2',
    tone: 'orange',
    description: 'Waiting for an operator — 2 are past the 30-minute target.',
    target: 'dispatch',
  },
  {
    label: 'In progress',
    value: '13',
    change: '+1',
    tone: 'green',
    description: 'Machines handed over and working on site.',
    target: 'map',
  },
  {
    label: 'Available operators',
    value: '9',
    change: '-2',
    tone: 'purple',
    description: 'Free and reachable now across the city zones.',
    target: 'map',
  },
]

export const dispatcherAlerts: DispatcherAlert[] = [
  {
    id: 'da-1',
    title: '2 jobs unassigned past target',
    detail: 'JOB-7801 (Madhapur) and JOB-7803 (Chowrasta) have waited over 30 minutes.',
    time: '6 min ago',
    severity: 'Critical',
    target: 'dispatch',
  },
  {
    id: 'da-2',
    title: 'Operator went offline mid-job',
    detail: 'Imran Ali (MC-3019) stopped reporting on JOB-7790 at Uppal — site access blocked.',
    time: '18 min ago',
    severity: 'Critical',
    target: 'reassign',
  },
  {
    id: 'da-3',
    title: 'Shortage in Karimnagar',
    detail: 'Demand is 8 jobs against 6 ready machines for the evening shift.',
    time: '40 min ago',
    severity: 'Warning',
    target: 'escalations',
  },
  {
    id: 'da-4',
    title: 'Crane queue building in Madhapur',
    detail: 'Three tower-crane requests opened in the last hour with one crane available.',
    time: '1 hour ago',
    severity: 'Warning',
    target: 'map',
  },
]

export const dispatchJobs: DispatchJob[] = [
  { id: 'JOB-7801', bookingId: 'BK-5190', customer: 'HCC Constructions', owner: 'Charminar Plant Hire', city: 'Hyderabad', zone: 'Madhapur', machine: 'Tower Crane 6T', requiredType: 'Crane', priority: 'Urgent', status: 'Unassigned', requested: '10:05', waiting: 42, sla: 30, ownerAssigned: false, operatorAccepted: false, map: { x: 47, y: 52 } },
  { id: 'JOB-7803', bookingId: 'BK-5195', customer: 'Aurobindo Realty', owner: 'Deccan Heavy Machinery', city: 'Hyderabad', zone: 'Chowrasta', machine: 'Concrete Mixer', requiredType: 'Concrete Mixer', priority: 'Urgent', status: 'Unassigned', requested: '10:18', waiting: 34, sla: 30, ownerAssigned: false, operatorAccepted: false, map: { x: 62, y: 30 } },
  { id: 'JOB-7805', bookingId: 'BK-5191', customer: 'Vascon Engineers', owner: 'Charminar Plant Hire', city: 'Hyderabad', zone: 'Hanamkonda', machine: 'Backhoe Loader', requiredType: 'Backhoe Loader', priority: 'Urgent', status: 'Unassigned', requested: '10:26', waiting: 28, sla: 30, ownerAssigned: true, operatorAccepted: false, map: { x: 24, y: 40 } },
  { id: 'JOB-7809', bookingId: 'BK-5193', customer: 'Deccan Roadlines', owner: 'Deccan Heavy Machinery', city: 'Hyderabad', zone: 'Bodhan Road', machine: 'Tipper 10 Wheeler', requiredType: 'Tipper', priority: 'Normal', status: 'Unassigned', requested: '10:41', waiting: 19, sla: 45, ownerAssigned: false, operatorAccepted: false, map: { x: 15, y: 24 } },
  { id: 'JOB-7811', bookingId: 'BK-5196', customer: 'My Home Builders', owner: 'Twin Cities Liftways', city: 'Hyderabad', zone: 'Kukatpally', machine: 'Motor Grader MG-180', requiredType: 'Motor Grader', priority: 'Normal', status: 'Unassigned', requested: '10:52', waiting: 12, sla: 45, ownerAssigned: true, operatorAccepted: false, map: { x: 40, y: 28 } },
  { id: 'JOB-7812', bookingId: 'BK-5197', customer: 'Ramky Infrastructure', owner: 'Charminar Plant Hire', city: 'Hyderabad', zone: 'Uppal', machine: 'Concrete Pump', requiredType: 'Concrete Pump', priority: 'Normal', status: 'Unassigned', requested: '11:02', waiting: 7, sla: 45, ownerAssigned: false, operatorAccepted: false, map: { x: 78, y: 60 } },
  { id: 'JOB-7802', bookingId: 'BK-5189', customer: 'MEIL', owner: 'Deccan Heavy Machinery', city: 'Hyderabad', zone: 'Gachibowli', machine: 'Excavator CAT 320', requiredType: 'Excavator', priority: 'Normal', status: 'Assigned', requested: '09:52', waiting: 55, sla: 30, operator: 'Sandeep Yadav', operatorId: 'OP-102', ownerAssigned: false, operatorAccepted: true, map: { x: 30, y: 58 } },
  { id: 'JOB-7793', bookingId: 'BK-5171', customer: 'Sobha Realty', owner: 'Twin Cities Liftways', city: 'Hyderabad', zone: 'Gachibowli', machine: 'Tower Crane 6T', requiredType: 'Crane', priority: 'Normal', status: 'At Risk', requested: '09:31', waiting: 76, sla: 30, operator: 'Ayesha Siddiqui', operatorId: 'OP-107', ownerAssigned: true, operatorAccepted: true, map: { x: 26, y: 64 } },
  { id: 'JOB-7795', bookingId: 'BK-5182', customer: 'L&T Metro Rail', owner: 'Charminar Plant Hire', city: 'Hyderabad', zone: 'Madhapur', machine: 'CAT 320 Excavator', requiredType: 'Excavator', priority: 'Normal', status: 'In Progress', requested: '09:12', waiting: 105, sla: 30, operator: 'Kiran Vardhan', operatorId: 'OP-110', ownerAssigned: true, operatorAccepted: true, map: { x: 50, y: 50 } },
  { id: 'JOB-7798', bookingId: 'BK-5176', customer: 'My Home Builders', owner: 'Twin Cities Liftways', city: 'Hyderabad', zone: 'Kukatpally', machine: 'Schwing Stetter Mixer', requiredType: 'Concrete Mixer', priority: 'Normal', status: 'In Progress', requested: '09:44', waiting: 73, sla: 45, operator: 'Rakesh Naidu', operatorId: 'OP-103', ownerAssigned: true, operatorAccepted: true, map: { x: 42, y: 24 } },
  { id: 'JOB-7788', bookingId: 'BK-5168', customer: 'TSIIC', owner: 'Deccan Heavy Machinery', city: 'Hyderabad', zone: 'Begumpet', machine: 'Motor Grader MG-180', requiredType: 'Motor Grader', priority: 'Normal', status: 'In Progress', requested: '08:58', waiting: 119, sla: 45, operator: 'Venkat Rao', operatorId: 'OP-106', ownerAssigned: true, operatorAccepted: true, map: { x: 58, y: 46 } },
  { id: 'JOB-7790', bookingId: 'BK-5173', customer: 'Ramky Infrastructure', owner: 'Charminar Plant Hire', city: 'Hyderabad', zone: 'Uppal', machine: 'Volvo FMX Tipper', requiredType: 'Tipper', priority: 'Urgent', status: 'Stuck', requested: '09:05', waiting: 112, sla: 30, operator: 'Imran Ali', operatorId: 'OP-105', ownerAssigned: true, operatorAccepted: true, map: { x: 72, y: 62 } },
]

export const dispatcherOperators: DispatcherOperator[] = [
  { id: 'OP-102', name: 'Sandeep Yadav', phone: '+91 98490 11021', zone: 'Gachibowli', city: 'Hyderabad', vehicle: 'JCB 3CX', vehicleType: 'Backhoe Loader', status: 'Assigned', rating: 4.7, jobsToday: 2, distanceKm: 3.2, availableIn: '—', since: '08:10', map: { x: 31, y: 60 } },
  { id: 'OP-103', name: 'Rakesh Naidu', phone: '+91 98490 11031', zone: 'Kukatpally', city: 'Hyderabad', vehicle: 'ACE AG-15', vehicleType: 'Crane', status: 'Assigned', rating: 4.5, jobsToday: 3, distanceKm: 5.1, availableIn: '—', since: '07:50', map: { x: 44, y: 25 } },
  { id: 'OP-105', name: 'Imran Ali', phone: '+91 98490 11051', zone: 'Uppal', city: 'Hyderabad', vehicle: 'Volvo FMX 440', vehicleType: 'Tipper', status: 'Offline', rating: 4.2, jobsToday: 1, distanceKm: 1.4, availableIn: 'Offline', since: '09:05', map: { x: 74, y: 64 } },
  { id: 'OP-106', name: 'Venkat Rao', phone: '+91 98490 11061', zone: 'Begumpet', city: 'Hyderabad', vehicle: 'Komatsu PC210', vehicleType: 'Excavator', status: 'At site', rating: 4.6, jobsToday: 2, distanceKm: 2.6, availableIn: '—', since: '07:35', map: { x: 60, y: 48 } },
  { id: 'OP-107', name: 'Ayesha Siddiqui', phone: '+91 98490 11071', zone: 'Gachibowli', city: 'Hyderabad', vehicle: 'Tower Crane TC-6', vehicleType: 'Crane', status: 'On the way', rating: 4.8, jobsToday: 2, distanceKm: 4.0, availableIn: '—', since: '08:20', map: { x: 27, y: 66 } },
  { id: 'OP-108', name: 'Mahesh Goud', phone: '+91 98490 11081', zone: 'LB Nagar', city: 'Hyderabad', vehicle: 'Tata Signa Tipper', vehicleType: 'Tipper', status: 'Available', rating: 4.4, jobsToday: 2, distanceKm: 6.8, availableIn: 'Now', since: '06:30', map: { x: 52, y: 82 } },
  { id: 'OP-110', name: 'Kiran Vardhan', phone: '+91 98490 11101', zone: 'Madhapur', city: 'Hyderabad', vehicle: 'CAT 320 Excavator', vehicleType: 'Excavator', status: 'At site', rating: 4.9, jobsToday: 3, distanceKm: 2.1, availableIn: '—', since: '06:15', map: { x: 51, y: 52 } },
  { id: 'OP-111', name: 'Lakshmi Prasad', phone: '+91 98490 11111', zone: 'Begumpet', city: 'Hyderabad', vehicle: 'Putzmeister Pump', vehicleType: 'Concrete Pump', status: 'Available', rating: 4.5, jobsToday: 1, distanceKm: 7.3, availableIn: 'Now', since: '06:45', map: { x: 63, y: 42 } },
  { id: 'OP-112', name: 'Bharat Reddy', phone: '+91 98490 11121', zone: 'Uppal', city: 'Hyderabad', vehicle: 'Bomag BW211', vehicleType: 'Compactor', status: 'Available', rating: 4.3, jobsToday: 0, distanceKm: 8.9, availableIn: 'Now', since: '06:20', map: { x: 70, y: 56 } },
  { id: 'OP-113', name: 'Srinivas Goud', phone: '+91 98490 11131', zone: 'Madhapur', city: 'Hyderabad', vehicle: 'XCMG Excavator 215', vehicleType: 'Excavator', status: 'Available', rating: 4.6, jobsToday: 1, distanceKm: 4.4, availableIn: 'Now', since: '07:05', map: { x: 45, y: 47 } },
  { id: 'OP-114', name: 'Padma Rani', phone: '+91 98490 11141', zone: 'Kukatpally', city: 'Hyderabad', vehicle: 'Sany Crane SCC500', vehicleType: 'Crane', status: 'On the way', rating: 4.7, jobsToday: 2, distanceKm: 3.6, availableIn: '—', since: '07:15', map: { x: 37, y: 22 } },
  { id: 'OP-115', name: 'Ravi Teja', phone: '+91 98490 11151', zone: 'LB Nagar', city: 'Hyderabad', vehicle: 'Sany Crane SCC500', vehicleType: 'Crane', status: 'Available', rating: 4.8, jobsToday: 1, distanceKm: 5.7, availableIn: 'Now', since: '06:50', map: { x: 56, y: 78 } },
  { id: 'OP-116', name: 'Naveen Kumar', phone: '+91 98490 11161', zone: 'Gachibowli', city: 'Hyderabad', vehicle: 'Schwing Stetter S4', vehicleType: 'Concrete Mixer', status: 'Available', rating: 4.4, jobsToday: 0, distanceKm: 6.1, availableIn: 'Now', since: '06:40', map: { x: 22, y: 56 } },
  { id: 'OP-117', name: 'Farhan Ahmed', phone: '+91 98490 11171', zone: 'Gachibowli', city: 'Hyderabad', vehicle: 'JCB 3CX', vehicleType: 'Backhoe Loader', status: 'Available', rating: 4.5, jobsToday: 1, distanceKm: 4.9, availableIn: 'Now', since: '06:25', map: { x: 34, y: 62 } },
]

export const zoneBoundaries: ZoneBoundary[] = [
  { id: 'zn-hyd-1', name: 'Madhapur', city: 'Hyderabad', x: 38, y: 42, w: 22, h: 22 },
  { id: 'zn-hyd-2', name: 'Gachibowli', city: 'Hyderabad', x: 18, y: 48, w: 22, h: 24 },
  { id: 'zn-hyd-3', name: 'Kukatpally', city: 'Hyderabad', x: 32, y: 18, w: 24, h: 20 },
  { id: 'zn-hyd-4', name: 'Begumpet', city: 'Hyderabad', x: 52, y: 38, w: 20, h: 18 },
  { id: 'zn-hyd-5', name: 'Uppal', city: 'Hyderabad', x: 66, y: 50, w: 22, h: 22 },
  { id: 'zn-hyd-6', name: 'LB Nagar', city: 'Hyderabad', x: 44, y: 72, w: 26, h: 18 },
]

export const reassignments: Reassignment[] = [
  { id: 'RA-31', jobId: 'JOB-7798', from: 'Prakash Rao', to: 'Rakesh Naidu', reason: 'Original operator reported a vehicle breakdown before handover.', time: '08:47', notifyCustomer: true, notifyOwner: true },
  { id: 'RA-30', jobId: 'JOB-7788', from: 'Mahesh Goud', to: 'Venkat Rao', reason: 'Operator reassigned to a nearer urgent crane job.', time: '08:02', notifyCustomer: false, notifyOwner: true },
  { id: 'RA-29', jobId: 'JOB-7793', from: 'Unassigned', to: 'Ayesha Siddiqui', reason: 'Owner did not assign within target — dispatcher placed the job.', time: '07:20', notifyCustomer: true, notifyOwner: true },
]

export const contactLog: ContactEntry[] = [
  { id: 'CL-58', jobId: 'JOB-7790', operatorId: 'OP-105', operator: 'Imran Ali', channel: 'Call', message: 'Site access check', note: 'Gate coordinator denied entry; waiting on customer clearance.', time: '10:12', by: 'Ayesha Khan' },
  { id: 'CL-57', jobId: 'JOB-7801', operatorId: 'OP-110', operator: 'Kiran Vardhan', channel: 'Message', message: 'Are you on the way to the site?', note: 'Asked if he can cover the urgent crane request after finishing.', time: '10:08', by: 'Ayesha Khan' },
  { id: 'CL-56', jobId: 'JOB-7793', operatorId: 'OP-107', operator: 'Ayesha Siddiqui', channel: 'Call', message: 'Running late — share your current ETA.', note: 'ETA 12 minutes due to traffic near HITEC City.', time: '09:55', by: 'Ayesha Khan' },
  { id: 'CL-55', jobId: 'JOB-7802', operatorId: 'OP-102', operator: 'Sandeep Yadav', channel: 'Message', message: 'Please confirm fuel and safety checks before leaving.', note: 'Confirmed checks complete, departing yard.', time: '09:48', by: 'Ayesha Khan' },
]

export const seedHandoverNotes: HandoverNote[] = [
  { id: 'HN-6', time: '09:45', author: 'Gopal Verma', shift: 'Night', text: 'Night shift handed over. Watch JOB-7801 — metro outage means the crane is needed before noon. Two cranes idle in Kukatpally if needed.' },
  { id: 'HN-5', time: '08:30', author: 'Gopal Verma', shift: 'Night', text: 'Karimnagar crew shortage already flagged to the operations manager. No critical incidents overnight.' },
  { id: 'HN-4', time: '07:00', author: 'Ayesha Khan', shift: 'Night', text: 'Three open escalations left from the night desk — two shortage, one complaint.' },
]

export const escalations: Escalation[] = [
  { id: 'ESC-21', kind: 'Stuck job', reference: 'JOB-7790', subject: 'Site access denied at Uppal', detail: 'Machine has been idle for over 90 minutes and the operator went offline. Needs site clearance or a reassignment.', received: '18 min ago', severity: 'Critical', status: 'Open' },
  { id: 'ESC-20', kind: 'Shortage', reference: 'Karimnagar', subject: 'Evening crew shortage', detail: 'Chowrasta demand is 8 jobs against 6 ready machines — need relief crews for the evening shift.', received: '40 min ago', severity: 'Warning', status: 'Acknowledged' },
  { id: 'ESC-19', kind: 'Operator problem', reference: 'OP-105', subject: 'Operator offline mid-job', detail: 'Imran Ali stopped reporting location and is not reachable on the registered number.', received: '18 min ago', severity: 'Critical', status: 'Open' },
  { id: 'ESC-18', kind: 'Complaint', reference: 'BK-5173', subject: 'Customer complaint on delay', detail: 'Ramky Infrastructure called to complain about repeated delays on the tipper job.', received: '1 hour ago', severity: 'Warning', status: 'Open' },
  { id: 'ESC-17', kind: 'Incident', reference: 'MC-3019', subject: 'Vehicle fault on route', detail: 'Volvo FMX tipper reported a hydraulic fault; operator parked safely off the carriageway.', received: '2 hours ago', severity: 'Info', status: 'Escalated', escalatedTo: 'Operations manager · Vikram Shah' },
]

export const escalationTargets = [
  'Operations manager · Vikram Shah',
  'Support admin · Anita Shah',
  'City admin · Hyderabad · Praveen Kumar',
]

export const dispatcherAudit: AuditEntry[] = [
  { id: 'AU-210', time: '10:08', actor: 'Ayesha Khan', action: 'Contacted operator', target: 'JOB-7801 → Kiran Vardhan', reason: 'Asked about covering the urgent Madhapur crane request.' },
  { id: 'AU-209', time: '09:55', actor: 'Ayesha Khan', action: 'Contacted operator', target: 'JOB-7793 → Ayesha Siddiqui', reason: 'Confirmed ETA after at-risk flag.' },
  { id: 'AU-208', time: '08:47', actor: 'Ayesha Khan', action: 'Reassigned job', target: 'JOB-7798 → Rakesh Naidu', reason: 'Original operator vehicle breakdown before handover.' },
  { id: 'AU-207', time: '07:20', actor: 'Ayesha Khan', action: 'Manual dispatch override', target: 'JOB-7793 → Ayesha Siddiqui', reason: 'Owner did not assign within target.' },
]

export const dispatcherNotifications: DispatcherNotification[] = [
  { id: 'dn-1', title: 'Unassigned queue past target', detail: 'JOB-7801 and JOB-7803 have waited over 30 minutes.', time: '6 min ago', tone: 'red', read: false, target: 'dispatch' },
  { id: 'dn-2', title: 'Operator offline mid-job', detail: 'Imran Ali (OP-105) on JOB-7790 at Uppal.', time: '18 min ago', tone: 'red', read: false, target: 'reassign' },
  { id: 'dn-3', title: 'Reassignment recorded', detail: 'JOB-7798 moved to Rakesh Naidu (RA-31).', time: '1 hour ago', tone: 'amber', read: true, target: 'reassign' },
  { id: 'dn-4', title: 'Handover note added', detail: 'Gopal Verma flagged the Madhapur crane queue.', time: '2 hours ago', tone: 'blue', read: true, target: 'shift' },
]

export const dashboardPeriods = ['Today', 'This Shift', 'This Week', 'This Month']
