import type { FeedTone } from './stateAdminData'

export type NotificationCategory = 'Approvals' | 'Tasks' | 'Payments' | 'Escalations' | 'Security' | 'Announcements'

export type NotificationPriority = 'Critical' | 'High' | 'Normal' | 'Low'

export type StateNotificationFeedItem = {
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

export const stateNotificationFeed: StateNotificationFeedItem[] = [
  {
    id: 'snf-1',
    category: 'Approvals',
    title: 'Application awaiting review',
    detail: 'Srinivas Reddy submitted partner documents for Hyderabad onboarding.',
    time: '2 hours ago',
    tone: 'amber',
    read: false,
    target: 'approvals',
    priority: 'Normal',
  },
  {
    id: 'snf-2',
    category: 'Approvals',
    title: 'Refund / adjustment pending',
    detail: 'Deccan Heavy Machinery requested a ₹3,84,000 settlement adjustment.',
    time: '5 hours ago',
    tone: 'blue',
    read: false,
    target: 'approvals',
    priority: 'High',
  },
  {
    id: 'snf-3',
    category: 'Approvals',
    title: 'City admin request filed',
    detail: 'Siddipet went live; a City Admin account is ready for approval.',
    time: '1 day ago',
    tone: 'amber',
    read: true,
    target: 'approvals',
    priority: 'Normal',
  },
  {
    id: 'snf-4',
    category: 'Tasks',
    title: 'Zone moved to review',
    detail: 'Miryalaguda Road in Nalgonda slipped below 70% operator coverage.',
    time: '8 hours ago',
    tone: 'red',
    read: false,
    target: 'zones',
    priority: 'High',
  },
  {
    id: 'snf-5',
    category: 'Tasks',
    title: 'Dispatch jobs past their window',
    detail: 'Nine jobs across Warangal and Karimnagar remain unassigned past ETA.',
    time: '3 hours ago',
    tone: 'red',
    read: false,
    target: 'dispatch',
    priority: 'Critical',
  },
  {
    id: 'snf-6',
    category: 'Tasks',
    title: 'Machines due for inspection',
    detail: 'Four excavators crossed their inspection window in Khammam.',
    time: '1 day ago',
    tone: 'amber',
    read: true,
    target: 'fleet',
    priority: 'Normal',
  },
  {
    id: 'snf-7',
    category: 'Payments',
    title: 'Payout release failed',
    detail: 'PO-5512 · ₹2,14,000 to Sunrise Rentals was rejected by the bank.',
    time: '4 hours ago',
    tone: 'red',
    read: false,
    target: 'finance',
    priority: 'Critical',
  },
  {
    id: 'snf-8',
    category: 'Payments',
    title: 'Collection below target in Nizamabad',
    detail: 'Zone collection for the month is 61% against a 78% target.',
    time: '6 hours ago',
    tone: 'amber',
    read: false,
    target: 'finance',
    priority: 'High',
  },
  {
    id: 'snf-9',
    category: 'Escalations',
    title: 'Complaint escalated to State Admin',
    detail: 'SC-1892 · repeated machine fault in Gachibowli crossed 48 hours.',
    time: '7 hours ago',
    tone: 'red',
    read: false,
    target: 'support',
    priority: 'Critical',
  },
  {
    id: 'snf-10',
    category: 'Escalations',
    title: 'SLA breach on the support desk',
    detail: 'First response averaged 41 minutes across the state this week.',
    time: '1 day ago',
    tone: 'amber',
    read: true,
    target: 'support',
    priority: 'Normal',
  },
  {
    id: 'snf-11',
    category: 'Security',
    title: 'Failed admin logins from a new device',
    detail: 'Repeated failed logins from an unrecognised device in Hyderabad.',
    time: '25 min ago',
    tone: 'red',
    read: false,
    target: 'audit',
    priority: 'Critical',
  },
  {
    id: 'snf-12',
    category: 'Security',
    title: 'Role change recorded',
    detail: 'Zone Admin · Madhapur was promoted from Dispatcher by the City Admin.',
    time: '1 day ago',
    tone: 'blue',
    read: true,
    target: 'audit',
    priority: 'High',
  },
  {
    id: 'snf-13',
    category: 'Announcements',
    title: 'Updated refund policy',
    detail: 'City-level refund limits above ₹10,000 now require state approval.',
    time: '2 days ago',
    tone: 'green',
    read: true,
    target: 'reports',
    priority: 'Low',
  },
  {
    id: 'snf-14',
    category: 'Announcements',
    title: 'Scheduled platform maintenance',
    detail: 'EquipHub will be read-only on Sunday 02:00–04:00 IST.',
    time: '3 days ago',
    tone: 'blue',
    read: true,
    target: 'overview',
    priority: 'Low',
  },
]
