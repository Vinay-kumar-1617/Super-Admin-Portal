export type FeedTone = 'green' | 'amber' | 'red' | 'blue'

export type NotificationCategory = 'Approvals' | 'Tasks' | 'Payments' | 'Escalations' | 'Security' | 'Announcements'

export type NotificationPriority = 'Critical' | 'High' | 'Normal' | 'Low'

export type DashboardNotification = {
  id: string
  title: string
  detail: string
  time: string
  tone: FeedTone
  read: boolean
  target?: string
  category: NotificationCategory
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

export type AlertSeverity = 'Critical' | 'Warning' | 'Info'

export type DashboardAlert = {
  id: string
  title: string
  detail: string
  time: string
  severity: AlertSeverity
  target?: string
}

export const initialNotifications: DashboardNotification[] = [
  {
    id: 'ntf-1',
    title: 'KYC review pending',
    detail: 'KY-101 Sunil Verma submitted identity documents for verification.',
    time: '5 min ago',
    tone: 'amber',
    read: false,
    target: 'attention:kyc-reviews',
    category: 'Approvals',
    priority: 'High',
  },
  {
    id: 'ntf-2',
    title: 'Payout awaiting approval',
    detail: 'PO-2042 Sunrise Rentals requested ₹1,26,000 via bank transfer.',
    time: '12 min ago',
    tone: 'blue',
    read: false,
    target: 'attention:payouts-awaiting-approval',
    category: 'Payments',
    priority: 'High',
  },
  {
    id: 'ntf-3',
    title: 'Job needs an operator',
    detail: 'JOB-301 Arjun Steel Traders booked an Excavator in Hyderabad.',
    time: '40 min ago',
    tone: 'amber',
    read: false,
    target: 'attention:unassigned-jobs',
    category: 'Tasks',
    priority: 'Normal',
  },
  {
    id: 'ntf-4',
    title: 'New city onboarded',
    detail: 'Coimbatore went live across Tamil Nadu with 4 active zones.',
    time: '3 hours ago',
    tone: 'green',
    read: true,
    target: 'page:Cities',
    category: 'Announcements',
    priority: 'Low',
  },
  {
    id: 'ntf-5',
    title: 'Feature flag updated',
    detail: 'Dynamic Pricing enabled for pilot cities ahead of the next release.',
    time: '5 hours ago',
    tone: 'blue',
    read: true,
    target: 'page:Feature Flags',
    category: 'Announcements',
    priority: 'Low',
  },
  {
    id: 'ntf-6',
    title: 'Rule published',
    detail: 'Weekend surge pricing moved to Active for the Pricing section.',
    time: '1 day ago',
    tone: 'green',
    read: true,
    target: 'page:Pricing',
    category: 'Announcements',
    priority: 'Low',
  },
  {
    id: 'ntf-7',
    title: 'Refund dispute escalated',
    detail: 'RF-771 Anvitha Hirez disputed a ₹64,000 deduction and requested review.',
    time: '9 min ago',
    tone: 'red',
    read: false,
    target: 'page:Refund Management',
    category: 'Escalations',
    priority: 'Critical',
  },
  {
    id: 'ntf-8',
    title: 'Failed admin login attempts',
    detail: 'Repeated failed logins from an unrecognised device in Hyderabad.',
    time: '25 min ago',
    tone: 'red',
    read: false,
    target: 'attention:security-alerts',
    category: 'Security',
    priority: 'Critical',
  },
  {
    id: 'ntf-9',
    title: 'Support SLA breached',
    detail: 'ST-4481 has waited 6 hours for a first response across two states.',
    time: '1 hour ago',
    tone: 'red',
    read: false,
    target: 'page:Support Tickets',
    category: 'Escalations',
    priority: 'High',
  },
  {
    id: 'ntf-10',
    title: 'Payout transfer rejected',
    detail: 'PO-6120 · ₹94,500 to Skyline Rentals bounced at the beneficiary bank.',
    time: '2 hours ago',
    tone: 'red',
    read: false,
    target: 'attention:payouts-awaiting-approval',
    category: 'Payments',
    priority: 'Critical',
  },
  {
    id: 'ntf-11',
    title: 'Service area request waiting',
    detail: 'Pune requested two new delivery service areas for next month.',
    time: '4 hours ago',
    tone: 'amber',
    read: false,
    target: 'page:Service Areas',
    category: 'Approvals',
    priority: 'Normal',
  },
  {
    id: 'ntf-12',
    title: 'Bank details changed before payout',
    detail: 'A partner updated bank minutes before a scheduled payout release.',
    time: '5 hours ago',
    tone: 'red',
    read: false,
    target: 'attention:security-alerts',
    category: 'Security',
    priority: 'High',
  },
  {
    id: 'ntf-13',
    title: 'KYC queue ageing',
    detail: 'Nine KYC reviews are older than 48 hours across Tamil Nadu.',
    time: '6 hours ago',
    tone: 'amber',
    read: true,
    target: 'attention:kyc-reviews',
    category: 'Approvals',
    priority: 'Normal',
  },
  {
    id: 'ntf-14',
    title: 'Inspection overdue for two machines',
    detail: 'EXC-118 and EXC-121 in Pune are blocked from booking.',
    time: '1 day ago',
    tone: 'amber',
    read: true,
    target: 'attention:unassigned-jobs',
    category: 'Tasks',
    priority: 'Normal',
  },
]

export const initialDashboardAlerts: DashboardAlert[] = [
  {
    id: 'alt-1',
    title: 'Failed admin login attempts',
    detail: 'Repeated failed logins from an unrecognised device in Hyderabad.',
    time: '25 min ago',
    severity: 'Critical',
    target: 'attention:security-alerts',
  },
  {
    id: 'alt-2',
    title: 'Payout account change flagged',
    detail: 'A partner changed bank details minutes before a payout release.',
    time: '2 hours ago',
    severity: 'Critical',
    target: 'attention:security-alerts',
  },
  {
    id: 'alt-3',
    title: 'SMS provider degraded',
    detail: 'OTP delivery latency above 20 seconds on the primary route.',
    time: '4 hours ago',
    severity: 'Warning',
    target: 'page:Feature Flags',
  },
  {
    id: 'alt-4',
    title: 'Machines failed inspection',
    detail: 'Two excavators in Pune are blocked from booking until re-inspection.',
    time: '6 hours ago',
    severity: 'Warning',
    target: 'attention:unassigned-jobs',
  },
  {
    id: 'alt-5',
    title: 'Weekly settlement completed',
    detail: '₹18.4L of partner payouts settled without failures.',
    time: '1 day ago',
    severity: 'Info',
    target: 'attention:payouts-awaiting-approval',
  },
]

export const dashboardPeriods = ['This Month', 'Last Month', 'Last 90 Days', 'This Year', 'All Time']
