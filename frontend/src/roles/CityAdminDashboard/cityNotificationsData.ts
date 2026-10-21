import type { FeedTone } from './cityAdminData'

export type NotificationCategory = 'Approvals' | 'Tasks' | 'Payments' | 'Escalations' | 'Security' | 'Announcements'

export type NotificationPriority = 'Critical' | 'High' | 'Normal' | 'Low'

export type CityNotificationItem = {
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

export const notificationCategories: NotificationCategory[] = [
  'Approvals',
  'Tasks',
  'Payments',
  'Escalations',
  'Security',
  'Announcements',
]

export const cityNotificationFeed: CityNotificationItem[] = [
  {
    id: 'nf-1',
    category: 'Approvals',
    title: 'Operator badge awaiting review',
    detail: 'Praveen Rathod submitted a tower crane licence for Kukatpally.',
    time: '1 hour ago',
    tone: 'amber',
    read: false,
    target: 'approvals',
    priority: 'Normal',
  },
  {
    id: 'nf-2',
    category: 'Approvals',
    title: 'Maintenance quote pending',
    detail: 'Volvo FMX tipper engine overhaul quoted at ₹48,000 in Uppal.',
    time: '5 hours ago',
    tone: 'blue',
    read: false,
    target: 'approvals',
    priority: 'High',
  },
  {
    id: 'nf-3',
    category: 'Approvals',
    title: 'Refund awaiting your decision',
    detail: 'RF-033 · Kences Builders · ₹7,200 raised in Kukatpally.',
    time: '7 hours ago',
    tone: 'amber',
    read: false,
    target: 'approvals',
    priority: 'High',
  },
  {
    id: 'nf-4',
    category: 'Tasks',
    title: '3 dispatch jobs have passed their window',
    detail: 'Open jobs in Begumpet and LB Nagar remain unassigned past ETA.',
    time: '2 hours ago',
    tone: 'red',
    read: false,
    target: 'dispatch',
    priority: 'Critical',
  },
  {
    id: 'nf-5',
    category: 'Tasks',
    title: 'Two machines overdue for inspection',
    detail: 'MC-3031 and MC-3055 crossed their inspection window in Begumpet.',
    time: '4 hours ago',
    tone: 'amber',
    read: false,
    target: 'fleet',
    priority: 'High',
  },
  {
    id: 'nf-6',
    category: 'Payments',
    title: 'Payout to operator failed',
    detail: 'PO-409 · ₹86,000 to Rakesh Naidu was rejected by the bank.',
    time: '3 hours ago',
    tone: 'red',
    read: false,
    target: 'finance',
    priority: 'Critical',
  },
  {
    id: 'nf-7',
    category: 'Payments',
    title: 'Customer payment declined',
    detail: 'Invoice INV-7742 · MEIL · ₹2,86,000 mandate failed.',
    time: '9 hours ago',
    tone: 'amber',
    read: false,
    target: 'finance',
    priority: 'High',
  },
  {
    id: 'nf-8',
    category: 'Escalations',
    title: 'Complaint escalated to State Admin',
    detail: 'SC-2281 · repeated machine fault in Gachibowli crossed 48 hours.',
    time: '6 hours ago',
    tone: 'red',
    read: false,
    target: 'support',
    priority: 'Critical',
  },
  {
    id: 'nf-9',
    category: 'Escalations',
    title: 'SLA breach on refund desk',
    detail: 'Refund resolution averaged 31 hours across Kukatpally this week.',
    time: '1 day ago',
    tone: 'amber',
    read: true,
    target: 'support',
    priority: 'Normal',
  },
  {
    id: 'nf-10',
    category: 'Security',
    title: 'New device signed in',
    detail: 'A new Chrome device signed in from 192.168.1.56 for your account.',
    time: '2 hours ago',
    tone: 'blue',
    read: false,
    target: 'audit',
    priority: 'High',
  },
  {
    id: 'nf-11',
    category: 'Security',
    title: 'Multiple failed login attempts',
    detail: 'Four failed attempts for the Kukatpally zone account in ten minutes.',
    time: '5 hours ago',
    tone: 'red',
    read: false,
    target: 'audit',
    priority: 'Critical',
  },
  {
    id: 'nf-12',
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
    id: 'nf-13',
    category: 'Announcements',
    title: 'Updated refund policy',
    detail: 'City-level refund limits above ₹10,000 now require state approval.',
    time: '2 days ago',
    tone: 'green',
    read: true,
    target: 'support',
    priority: 'Low',
  },
]
