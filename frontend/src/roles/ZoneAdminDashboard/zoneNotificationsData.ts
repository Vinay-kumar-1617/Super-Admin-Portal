import { type FeedTone } from './zoneAdminData'

export type NotificationCategory = 'Approvals' | 'Tasks' | 'Payments' | 'Escalations' | 'Security' | 'Announcements'

export type NotificationPriority = 'Critical' | 'High' | 'Normal' | 'Low'

export type ZoneNotificationItem = {
  id: string
  category: NotificationCategory
  title: string
  detail: string
  time: string
  tone: FeedTone
  read: boolean
  target: string
  priority: NotificationPriority
}

export const zoneNotificationCategories: NotificationCategory[] = [
  'Approvals',
  'Tasks',
  'Payments',
  'Escalations',
  'Security',
  'Announcements',
]

// Zone-scoped notification feed for Madhapur. Items reference zone entities
// (localities, machines, bookings) and escalate to the City Admin when needed.
export const zoneNotificationFeed: ZoneNotificationItem[] = [
  {
    id: 'znf-1',
    category: 'Approvals',
    title: 'Operator badge awaiting review',
    detail: 'Arjun Deshmukh submitted a compactor licence renewal for Kondapur.',
    time: '1 hour ago',
    tone: 'amber',
    read: false,
    target: 'approvals',
    priority: 'Normal',
  },
  {
    id: 'znf-2',
    category: 'Approvals',
    title: 'Maintenance quote pending',
    detail: 'MT-091 excavator hose replacement quoted at ₹12,800 in HITEC City.',
    time: '3 hours ago',
    tone: 'blue',
    read: false,
    target: 'approvals',
    priority: 'High',
  },
  {
    id: 'znf-3',
    category: 'Approvals',
    title: 'Refund awaiting your decision',
    detail: 'RF-39 · Vascon Engineers · ₹14,200 raised in Raidurg.',
    time: '5 hours ago',
    tone: 'amber',
    read: false,
    target: 'approvals',
    priority: 'High',
  },
  {
    id: 'znf-4',
    category: 'Tasks',
    title: '2 dispatch jobs past their window',
    detail: 'Open jobs in HITEC City and Manikonda remain unassigned past ETA.',
    time: '2 hours ago',
    tone: 'red',
    read: false,
    target: 'requests',
    priority: 'Critical',
  },
  {
    id: 'znf-5',
    category: 'Tasks',
    title: 'Machine overdue for service',
    detail: 'MC-3048 Volvo FMX missed its 250-hour service window in Kondapur.',
    time: '4 hours ago',
    tone: 'amber',
    read: false,
    target: 'fleet',
    priority: 'High',
  },
  {
    id: 'znf-6',
    category: 'Payments',
    title: 'Payout to operator failed',
    detail: 'PO-409 · ₹86,000 to Rakesh Naidu was rejected by the bank.',
    time: '3 hours ago',
    tone: 'red',
    read: false,
    target: 'payments',
    priority: 'Critical',
  },
  {
    id: 'znf-7',
    category: 'Payments',
    title: 'Customer payment declined',
    detail: 'Invoice BK-5166 · Amara Infrastructure · ₹86,000 mandate failed.',
    time: '9 hours ago',
    tone: 'amber',
    read: false,
    target: 'payments',
    priority: 'High',
  },
  {
    id: 'znf-8',
    category: 'Escalations',
    title: 'Maintenance request above your limit',
    detail: 'MT-084 Charminar 500-hour service ₹36,000 was escalated to the City Admin.',
    time: '6 hours ago',
    tone: 'red',
    read: false,
    target: 'requests',
    priority: 'Critical',
  },
  {
    id: 'znf-9',
    category: 'Escalations',
    title: 'SLA breach on incident desk',
    detail: 'IN-26 near Nanakramguda has been pending past 24 hours.',
    time: '1 day ago',
    tone: 'amber',
    read: true,
    target: 'support',
    priority: 'Normal',
  },
  {
    id: 'znf-10',
    category: 'Security',
    title: 'New device signed in',
    detail: 'A new Chrome device signed in from 192.168.1.56 for your Madhapur zone account.',
    time: '2 hours ago',
    tone: 'blue',
    read: false,
    target: 'overview',
    priority: 'High',
  },
  {
    id: 'znf-11',
    category: 'Security',
    title: 'Multiple failed login attempts',
    detail: 'Four failed attempts for the Madhapur zone account in ten minutes.',
    time: '5 hours ago',
    tone: 'red',
    read: false,
    target: 'overview',
    priority: 'Critical',
  },
  {
    id: 'znf-12',
    category: 'Announcements',
    title: 'Scheduled platform maintenance',
    detail: 'EquipHub will be read-only on Sunday 02:00–04:00 IST.',
    time: '1 day ago',
    tone: 'blue',
    read: true,
    target: 'overview',
    priority: 'Low',
  },
  {
    id: 'znf-13',
    category: 'Announcements',
    title: 'Zone approval limits updated',
    detail: 'Maintenance approvals up to ₹50,000 and refunds up to ₹25,000 per request.',
    time: '2 days ago',
    tone: 'green',
    read: true,
    target: 'rules',
    priority: 'Low',
  },
]
