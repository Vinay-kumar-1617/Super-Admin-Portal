// City-scoped dispatch & operations seed data for the Hyderabad City Admin dashboard.
import { cityProfile } from './cityAdminData'

export type DispatchTab = 'jobs' | 'schedule' | 'dispatchers' | 'exceptions' | 'history'

export const dispatchTabs: Array<{ id: DispatchTab; label: string; hint: string }> = [
  { id: 'jobs', label: 'Dispatch jobs', hint: 'Pending, assigned and in-flight jobs in the city' },
  { id: 'schedule', label: 'Deadlines', hint: 'Schedules, operational deadlines and SLA status' },
  { id: 'dispatchers', label: 'Dispatcher workloads', hint: 'Workload and performance by dispatcher' },
  { id: 'exceptions', label: 'Exceptions', hint: 'Delayed, failed and escalated jobs' },
  { id: 'history', label: 'Job history', hint: 'Job history and assignment changes' },
]

export type DispatchJobStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed'
export type DispatchPriority = 'High' | 'Normal' | 'Low'
export type DispatchSla = 'On track' | 'Due soon' | 'Overdue'

export type DispatchHistoryEntry = {
  id: string
  action: string
  actor: string
  role: string
  time: string
  note?: string
}

export type DispatchJob = {
  id: string
  type: string
  customer: string
  zone: string
  machineId: string
  machine: string
  dispatcherId: string | null
  dispatcher: string | null
  status: DispatchJobStatus
  priority: DispatchPriority
  scheduled: string
  deadline: string
  sla: DispatchSla
  createdAt: string
  history: DispatchHistoryEntry[]
}

export type Dispatcher = {
  id: string
  name: string
  zone: string
  status: 'Available' | 'On break' | 'Offline'
  activeJobs: number
  capacity: number
  completedToday: number
  completedWeek: number
  avgResponseMins: number
  onTimeRate: number
  rating: number
}

export const cityDispatchers: Dispatcher[] = [
  { id: 'D-201', name: 'Gopal Rao', zone: 'Madhapur', status: 'Available', activeJobs: 4, capacity: 6, completedToday: 5, completedWeek: 28, avgResponseMins: 18, onTimeRate: 96, rating: 4.8 },
  { id: 'D-202', name: 'Ravi Teja', zone: 'Gachibowli', status: 'Available', activeJobs: 3, capacity: 6, completedToday: 4, completedWeek: 24, avgResponseMins: 21, onTimeRate: 94, rating: 4.7 },
  { id: 'D-203', name: 'Suresh Babu', zone: 'Kukatpally', status: 'On break', activeJobs: 5, capacity: 6, completedToday: 3, completedWeek: 22, avgResponseMins: 27, onTimeRate: 89, rating: 4.5 },
  { id: 'D-204', name: 'Mahesh Kumar', zone: 'Uppal', status: 'Available', activeJobs: 2, capacity: 5, completedToday: 4, completedWeek: 19, avgResponseMins: 24, onTimeRate: 91, rating: 4.6 },
  { id: 'D-209', name: 'Kiran Kumar', zone: 'Madhapur', status: 'Available', activeJobs: 2, capacity: 5, completedToday: 3, completedWeek: 16, avgResponseMins: 23, onTimeRate: 92, rating: 4.6 },
  { id: 'D-210', name: 'Naresh Kumar', zone: 'Kukatpally', status: 'Available', activeJobs: 3, capacity: 5, completedToday: 2, completedWeek: 15, avgResponseMins: 26, onTimeRate: 90, rating: 4.5 },
  { id: 'D-211', name: 'Farhana Begum', zone: 'Begumpet', status: 'Offline', activeJobs: 0, capacity: 4, completedToday: 0, completedWeek: 9, avgResponseMins: 31, onTimeRate: 87, rating: 4.3 },
  { id: 'D-212', name: 'Ramesh Yadav', zone: 'LB Nagar', status: 'Available', activeJobs: 1, capacity: 4, completedToday: 3, completedWeek: 14, avgResponseMins: 25, onTimeRate: 93, rating: 4.7 },
]

export const cityDispatchJobs: DispatchJob[] = [
  {
    id: 'DJ-7712', type: 'Machine delivery', customer: 'L&T Metro Rail', zone: 'Madhapur', machineId: 'MC-3041', machine: 'CAT 320 GC', dispatcherId: 'D-201', dispatcher: 'Gopal Rao', status: 'In Progress', priority: 'High', scheduled: 'Today · 09:00', deadline: 'Today · 13:00', sla: 'Due soon', createdAt: '2 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Madhapur', role: 'Zone desk', time: '2 hours ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '1 hour ago', note: 'Assigned to Gopal Rao (nearest available).' },
      { id: 'h3', action: 'Started', actor: 'Gopal Rao', role: 'Dispatcher', time: '40 min ago' },
    ],
  },
  {
    id: 'DJ-7710', type: 'On-site service', customer: 'MEIL', zone: 'Gachibowli', machineId: 'MC-3034', machine: 'ACE AG-15', dispatcherId: 'D-202', dispatcher: 'Ravi Teja', status: 'Assigned', priority: 'Normal', scheduled: 'Today · 11:00', deadline: 'Today · 17:00', sla: 'On track', createdAt: '3 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Gachibowli', role: 'Zone desk', time: '3 hours ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '2 hours ago' },
    ],
  },
  {
    id: 'DJ-7708', type: 'Machine pickup', customer: 'My Home Builders', zone: 'Kukatpally', machineId: 'MC-3019', machine: 'Volvo FMX 440', dispatcherId: null, dispatcher: null, status: 'Pending', priority: 'High', scheduled: 'Today · 14:00', deadline: 'Today · 18:00', sla: 'Due soon', createdAt: '50 min ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Kukatpally', role: 'Zone desk', time: '50 min ago' },
      { id: 'h2', action: 'Escalated', actor: 'Zone Kukatpally', role: 'Zone desk', time: '30 min ago', note: 'No dispatcher accepted within 30 minutes.' },
    ],
  },
  {
    id: 'DJ-7705', type: 'On-site service', customer: 'Ramky Infrastructure', zone: 'Uppal', machineId: 'MC-3031', machine: 'Schwing Stetter S4', dispatcherId: 'D-204', dispatcher: 'Mahesh Kumar', status: 'Completed', priority: 'Normal', scheduled: 'Today · 08:00', deadline: 'Today · 11:00', sla: 'On track', createdAt: '5 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Uppal', role: 'Zone desk', time: '5 hours ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '4 hours ago' },
      { id: 'h3', action: 'Started', actor: 'Mahesh Kumar', role: 'Dispatcher', time: '3 hours ago' },
      { id: 'h4', action: 'Completed', actor: 'Mahesh Kumar', role: 'Dispatcher', time: '2 hours ago', note: 'Hydraulic pressure restored; machine returned to Available.' },
    ],
  },
  {
    id: 'DJ-7702', type: 'Machine delivery', customer: 'Sobha Realty', zone: 'Gachibowli', machineId: 'MC-3049', machine: 'Tata Hitachi ZX210', dispatcherId: 'D-202', dispatcher: 'Ravi Teja', status: 'In Progress', priority: 'High', scheduled: 'Today · 10:30', deadline: 'Today · 15:00', sla: 'On track', createdAt: '4 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Gachibowli', role: 'Zone desk', time: '4 hours ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '3 hours ago' },
      { id: 'h3', action: 'Started', actor: 'Ravi Teja', role: 'Dispatcher', time: '1 hour ago' },
    ],
  },
  {
    id: 'DJ-7698', type: 'Emergency repair', customer: 'TSIIC', zone: 'Begumpet', machineId: 'MC-3058', machine: 'Putzmeister Pump', dispatcherId: null, dispatcher: null, status: 'Pending', priority: 'High', scheduled: 'Today · 12:00', deadline: 'Today · 16:00', sla: 'Due soon', createdAt: '90 min ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Begumpet', role: 'Zone desk', time: '90 min ago' },
      { id: 'h2', action: 'Failed', actor: 'System', role: 'Scheduler', time: '60 min ago', note: 'Assigned dispatcher D-211 went offline before accepting.' },
      { id: 'h3', action: 'Escalated', actor: 'Zone Begumpet', role: 'Zone desk', time: '45 min ago', note: 'Awaiting City Admin reassignment.' },
    ],
  },
  {
    id: 'DJ-7694', type: 'Machine pickup', customer: 'Kences Builders', zone: 'Kukatpally', machineId: 'MC-3025', machine: 'Skid Steer S650', dispatcherId: null, dispatcher: null, status: 'Pending', priority: 'Low', scheduled: 'Tomorrow · 09:00', deadline: 'Tomorrow · 13:00', sla: 'On track', createdAt: '6 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Kukatpally', role: 'Zone desk', time: '6 hours ago' },
    ],
  },
  {
    id: 'DJ-7690', type: 'On-site service', customer: 'Greenko Structures', zone: 'LB Nagar', machineId: 'MC-3005', machine: 'Tower Crane TC-6', dispatcherId: 'D-212', dispatcher: 'Ramesh Yadav', status: 'In Progress', priority: 'Normal', scheduled: 'Today · 07:30', deadline: 'Today · 10:30', sla: 'Overdue', createdAt: '6 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone LB Nagar', role: 'Zone desk', time: '6 hours ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '5 hours ago' },
      { id: 'h3', action: 'Delayed', actor: 'Ramesh Yadav', role: 'Dispatcher', time: '3 hours ago', note: 'Site access blocked; delayed by 2 hours.' },
    ],
  },
  {
    id: 'DJ-7686', type: 'Machine delivery', customer: 'Vascon Engineers', zone: 'Madhapur', machineId: 'MC-3012', machine: 'MG-180 Motor Grader', dispatcherId: 'D-209', dispatcher: 'Kiran Kumar', status: 'Assigned', priority: 'Normal', scheduled: 'Tomorrow · 11:00', deadline: 'Tomorrow · 15:00', sla: 'On track', createdAt: '7 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Madhapur', role: 'Zone desk', time: '7 hours ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '6 hours ago' },
      { id: 'h3', action: 'Reassigned', actor: cityProfile.adminName, role: 'City Admin', time: '5 hours ago', note: 'Balanced load away from D-203 (on break).' },
    ],
  },
  {
    id: 'DJ-7682', type: 'Emergency repair', customer: 'Deccan Roadlines', zone: 'Begumpet', machineId: 'MC-3038', machine: 'JCB 3CX', dispatcherId: 'D-211', dispatcher: 'Farhana Begum', status: 'Assigned', priority: 'High', scheduled: 'Today · 07:30', deadline: 'Today · 10:30', sla: 'Overdue', createdAt: '6 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Begumpet', role: 'Zone desk', time: '6 hours ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '5 hours ago' },
      { id: 'h3', action: 'Delayed', actor: 'Farhana Begum', role: 'Dispatcher', time: '3 hours ago', note: 'Spare part pickup held at depot.' },
    ],
  },
  {
    id: 'DJ-7678', type: 'Machine pickup', customer: 'Sanghi Industries', zone: 'Uppal', machineId: 'MC-3016', machine: 'JCB 3DX', dispatcherId: 'D-204', dispatcher: 'Mahesh Kumar', status: 'Completed', priority: 'Normal', scheduled: 'Today · 06:00', deadline: 'Today · 09:00', sla: 'On track', createdAt: '8 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Uppal', role: 'Zone desk', time: '8 hours ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '7 hours ago' },
      { id: 'h3', action: 'Completed', actor: 'Mahesh Kumar', role: 'Dispatcher', time: '5 hours ago' },
    ],
  },
  {
    id: 'DJ-7674', type: 'On-site service', customer: 'Twin Cities Builders', zone: 'LB Nagar', machineId: 'MC-3009', machine: 'Compactor RM-800', dispatcherId: null, dispatcher: null, status: 'Pending', priority: 'Normal', scheduled: 'Tomorrow · 13:00', deadline: 'Tomorrow · 17:00', sla: 'On track', createdAt: '9 hours ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone LB Nagar', role: 'Zone desk', time: '9 hours ago' },
    ],
  },
  {
    id: 'DJ-7670', type: 'Machine delivery', customer: 'My Home Builders', zone: 'Madhapur', machineId: 'MC-3024', machine: 'Komatsu PC200', dispatcherId: 'D-201', dispatcher: 'Gopal Rao', status: 'Completed', priority: 'Normal', scheduled: 'Yesterday · 15:00', deadline: 'Yesterday · 18:00', sla: 'On track', createdAt: '1 day ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Madhapur', role: 'Zone desk', time: '1 day ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '1 day ago' },
      { id: 'h3', action: 'Completed', actor: 'Gopal Rao', role: 'Dispatcher', time: '22 hours ago' },
    ],
  },
  {
    id: 'DJ-7666', type: 'Emergency repair', customer: 'Emaar India', zone: 'Gachibowli', machineId: 'MC-3045', machine: 'Hydraulic Crane 25T', dispatcherId: 'D-210', dispatcher: 'Naresh Kumar', status: 'Completed', priority: 'High', scheduled: 'Yesterday · 18:00', deadline: 'Yesterday · 22:00', sla: 'On track', createdAt: '1 day ago',
    history: [
      { id: 'h1', action: 'Created', actor: 'Zone Gachibowli', role: 'Zone desk', time: '1 day ago' },
      { id: 'h2', action: 'Assigned', actor: cityProfile.adminName, role: 'City Admin', time: '1 day ago' },
      { id: 'h3', action: 'Completed', actor: 'Naresh Kumar', role: 'Dispatcher', time: '23 hours ago' },
    ],
  },
]

export type DispatchExceptionKind = 'Delayed' | 'Failed' | 'Escalation'
export type DispatchExceptionSeverity = 'Critical' | 'Warning' | 'Info'
export type DispatchExceptionStatus = 'Open' | 'Acknowledged' | 'Resolved'

export type DispatchException = {
  id: string
  jobId: string
  kind: DispatchExceptionKind
  severity: DispatchExceptionSeverity
  detail: string
  raisedBy: string
  time: string
  status: DispatchExceptionStatus
  owner: string
}

export const cityDispatchExceptions: DispatchException[] = [
  { id: 'EX-318', jobId: 'DJ-7690', kind: 'Delayed', severity: 'Critical', detail: 'Tower crane service at LB Nagar is running past SLA; site access blocked.', raisedBy: 'Ramesh Yadav', time: '3 hours ago', status: 'Open', owner: 'Hyderabad dispatch desk' },
  { id: 'EX-317', jobId: 'DJ-7708', kind: 'Escalation', severity: 'Critical', detail: 'High-priority pickup unassigned for over 30 minutes; no dispatcher accepted.', raisedBy: 'Zone Kukatpally', time: '30 min ago', status: 'Open', owner: 'Hyderabad dispatch desk' },
  { id: 'EX-316', jobId: 'DJ-7682', kind: 'Delayed', severity: 'Critical', detail: 'Emergency repair at Begumpet past deadline; spare part pickup held at depot.', raisedBy: 'Farhana Begum', time: '3 hours ago', status: 'Open', owner: 'Hyderabad dispatch desk' },
  { id: 'EX-315', jobId: 'DJ-7698', kind: 'Failed', severity: 'Warning', detail: 'Auto-assignment failed because dispatcher D-211 went offline before accepting.', raisedBy: 'System', time: '60 min ago', status: 'Acknowledged', owner: 'Hyderabad dispatch desk' },
  { id: 'EX-312', jobId: 'DJ-7686', kind: 'Escalation', severity: 'Info', detail: 'Load balanced away from an on-break dispatcher; job reassigned to D-209.', raisedBy: cityProfile.adminName, time: '5 hours ago', status: 'Resolved', owner: 'Hyderabad dispatch desk' },
  { id: 'EX-309', jobId: 'DJ-7666', kind: 'Escalation', severity: 'Info', detail: 'Customer escalated a missed ETA; resolved after dispatcher confirmation.', raisedBy: 'Emaar India', time: '23 hours ago', status: 'Resolved', owner: 'Hyderabad dispatch desk' },
]

export type DispatchPermission = {
  key: string
  label: string
  description: string
  granted: boolean
  locked?: boolean
}

export const cityDispatchPermissions: DispatchPermission[] = [
  { key: 'dispatch.view', label: 'View dispatch board', description: 'See jobs, deadlines and dispatcher workloads for the city.', granted: true },
  { key: 'dispatch.assign', label: 'Assign & reassign jobs', description: 'Assign pending jobs and reassign in-flight jobs to a dispatcher.', granted: true },
  { key: 'dispatch.exceptions', label: 'Handle exceptions', description: 'Acknowledge and resolve delayed, failed and escalated jobs.', granted: true },
  { key: 'dispatch.override', label: 'Override dispatcher capacity', description: 'Assign jobs beyond a dispatcher’s capacity — State Admin only.', granted: false, locked: true },
  { key: 'dispatch.settings', label: 'Change dispatch settings', description: 'Edit SLA windows and auto-assignment rules — State Admin only.', granted: false, locked: true },
]

export const hasDispatchPermission = (key: string): boolean =>
  cityDispatchPermissions.some((permission) => permission.key === key && permission.granted)
