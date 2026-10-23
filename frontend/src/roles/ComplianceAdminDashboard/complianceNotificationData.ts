// Notification model for the Compliance Admin console.
//
// Notifications are derived from the live compliance registers instead of a
// static feed, so a notification disappears as soon as its underlying record is
// resolved. Read state and delivery preferences live alongside the derived items
// and are shared by the header popover and the full notifications page.
import type {
  ComplianceAudit,
  ComplianceViolation,
  CorrectiveAction,
  DriverCredential,
} from './complianceFleetData'
import type { ExpiryRow, InspectionRow, SectionId } from './complianceAdminData'

export type NotificationCategory =
  | 'Document expiry'
  | 'Credential expiry'
  | 'Failed inspection'
  | 'New violation'
  | 'Upcoming audit'
  | 'Overdue action'

export type NotificationPriority = 'Critical' | 'High' | 'Medium' | 'Low'

export type NotificationTone = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate'

export type ComplianceNotification = {
  id: string
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  detail: string
  time: string
  tone: NotificationTone
  /** Compliance page that owns the record. */
  target: SectionId
  /** Identifier used to focus the linked record in its register. */
  recordId: string
  /** Human readable record summary shown next to the id. */
  recordLabel: string
  /** Sorting signal: lower means more urgent for this category. */
  dueInDays: number
  /** Status of the source record, used to seed the destination filter. */
  recordStatus?: string
}

export type ComplianceNotificationView = ComplianceNotification & {
  read: boolean
}

export const notificationCategories: NotificationCategory[] = [
  'Document expiry',
  'Credential expiry',
  'Failed inspection',
  'New violation',
  'Upcoming audit',
  'Overdue action',
]

export const notificationPriorityOrder: Record<NotificationPriority, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
}

export const notificationPriorityTone: Record<NotificationPriority, NotificationTone> = {
  Critical: 'red',
  High: 'amber',
  Medium: 'blue',
  Low: 'slate',
}

export type NotificationCategoryMeta = {
  label: string
  shortLabel: string
  description: string
  target: SectionId
  openLabel: string
  tone: NotificationTone
}

export const notificationCategoryMeta: Record<NotificationCategory, NotificationCategoryMeta> = {
  'Document expiry': {
    label: 'Expiring documents',
    shortLabel: 'Documents',
    description: 'Licences, insurance and fitness papers inside the 30-day renewal window',
    target: 'expiries',
    openLabel: 'Open expiry record',
    tone: 'amber',
  },
  'Credential expiry': {
    label: 'Expired credentials',
    shortLabel: 'Credentials',
    description: 'Driver credentials that have expired or have no valid record',
    target: 'drivers',
    openLabel: 'Open credential',
    tone: 'red',
  },
  'Failed inspection': {
    label: 'Failed inspections',
    shortLabel: 'Inspections',
    description: 'Safety inspections that failed and need a follow-up decision',
    target: 'inspections',
    openLabel: 'Open inspection',
    tone: 'red',
  },
  'New violation': {
    label: 'New violations',
    shortLabel: 'Violations',
    description: 'Open and under-review notices from the regulator or site authority',
    target: 'violations',
    openLabel: 'Open violation',
    tone: 'purple',
  },
  'Upcoming audit': {
    label: 'Upcoming audits',
    shortLabel: 'Audits',
    description: 'Scheduled and in-preparation audits due inside the next 30 days',
    target: 'audits',
    openLabel: 'Open audit',
    tone: 'blue',
  },
  'Overdue action': {
    label: 'Overdue corrective actions',
    shortLabel: 'Actions',
    description: 'Owner evidence that missed the committed corrective-action deadline',
    target: 'actions',
    openLabel: 'Open corrective action',
    tone: 'amber',
  },
}

export type NotificationChannel = 'email' | 'sms'

export type NotificationDigest = 'Instant' | 'Daily digest' | 'Weekly digest'

export type NotificationPreferences = {
  categories: Record<NotificationCategory, boolean>
  minimumPriority: NotificationPriority | 'All'
  channels: Record<NotificationChannel, boolean>
  digest: NotificationDigest
}

export const notificationPriorityOptions: Array<'All' | NotificationPriority> = [
  'All',
  'Critical',
  'High',
  'Medium',
  'Low',
]

export const notificationDigestOptions: NotificationDigest[] = [
  'Instant',
  'Daily digest',
  'Weekly digest',
]

export const notificationChannels: Array<{
  key: NotificationChannel
  label: string
  description: string
}> = [
  { key: 'email', label: 'Email', description: 'Send a copy to the compliance desk inbox.' },
  { key: 'sms', label: 'SMS', description: 'Text critical and high-priority alerts to the duty officer.' },
]

const allCategoriesEnabled = notificationCategories.reduce(
  (acc, category) => {
    acc[category] = true
    return acc
  },
  {} as Record<NotificationCategory, boolean>,
)

export const defaultNotificationPreferences: NotificationPreferences = {
  categories: allCategoriesEnabled,
  minimumPriority: 'All',
  channels: { email: true, sms: false },
  digest: 'Instant',
}

// A couple of feed rows start read so the unread state is visible from the
// first render without requiring the user to open anything.
export const seedReadNotificationIds = ['notif-doc-expiry-EX-83', 'notif-audit-AUD-121']

export const notificationPreferencesStorageKey = 'fieldwork.compliance.notification-preferences'

const isPriority = (value: unknown): value is NotificationPriority | 'All' =>
  typeof value === 'string' && (value === 'All' || value in notificationPriorityOrder)

const isDigest = (value: unknown): value is NotificationDigest =>
  typeof value === 'string' && notificationDigestOptions.includes(value as NotificationDigest)

/** Make a stored or partial preference object safe to use in the UI. */
export const normalizeNotificationPreferences = (value: unknown): NotificationPreferences => {
  const source = value && typeof value === 'object' ? (value as Partial<NotificationPreferences>) : {}
  const categories: Partial<Record<NotificationCategory, boolean>> = source.categories ?? {}
  const channels: Partial<Record<NotificationChannel, boolean>> = source.channels ?? {}

  return {
    categories: notificationCategories.reduce(
      (acc, category) => {
        acc[category] = categories[category] !== false
        return acc
      },
      {} as Record<NotificationCategory, boolean>,
    ),
    minimumPriority: isPriority(source.minimumPriority)
      ? source.minimumPriority
      : defaultNotificationPreferences.minimumPriority,
    channels: {
      email: channels.email !== false,
      sms: channels.sms === true,
    },
    digest: isDigest(source.digest) ? source.digest : defaultNotificationPreferences.digest,
  }
}

export const loadNotificationPreferences = (): NotificationPreferences => {
  if (typeof window === 'undefined') return defaultNotificationPreferences
  try {
    const raw = window.localStorage.getItem(notificationPreferencesStorageKey)
    if (!raw) return defaultNotificationPreferences
    return normalizeNotificationPreferences(JSON.parse(raw))
  } catch {
    return defaultNotificationPreferences
  }
}

export const saveNotificationPreferences = (preferences: NotificationPreferences) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(notificationPreferencesStorageKey, JSON.stringify(preferences))
  } catch {
    // Private browsing or a full storage quota should not break the page.
  }
}

export const notificationMatchesPreferences = (
  notification: ComplianceNotification,
  preferences: NotificationPreferences,
): boolean => {
  if (!preferences.categories[notification.category]) return false
  if (
    preferences.minimumPriority !== 'All' &&
    notificationPriorityOrder[notification.priority] <
      notificationPriorityOrder[preferences.minimumPriority]
  ) {
    return false
  }
  return true
}

export type ComplianceNotificationInput = {
  expiries: ExpiryRow[]
  credentials: DriverCredential[]
  inspections: InspectionRow[]
  violations: ComplianceViolation[]
  correctiveActions: CorrectiveAction[]
  audits: ComplianceAudit[]
}

const daysFromTodayLabel = (days: number): string => {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`
  if (days === 0) return 'Due today'
  return `Due in ${days} day${days === 1 ? '' : 's'}`
}

const expiryPriority = (daysLeft: number): NotificationPriority => {
  if (daysLeft < 0) return 'Critical'
  if (daysLeft <= 3) return 'High'
  if (daysLeft <= 7) return 'Medium'
  return 'Low'
}

/**
 * Build the ranked notification feed from the compliance registers.
 *
 * Each source contributes only the records that need an operator decision, so
 * the feed cannot drift from the work shown on the owning pages.
 */
export const buildComplianceNotifications = ({
  expiries,
  credentials,
  inspections,
  violations,
  correctiveActions,
  audits,
}: ComplianceNotificationInput): ComplianceNotification[] => {
  const entries: Array<{ item: ComplianceNotification; urgency: number }> = []

  const push = (item: ComplianceNotification, urgency: number) => {
    entries.push({ item, urgency })
  }

  expiries
    .filter((row) => row.kind === 'Document' && row.daysLeft <= 30)
    .forEach((row) => {
      const priority = expiryPriority(row.daysLeft)
      push(
        {
          id: `notif-doc-expiry-${row.id}`,
          category: 'Document expiry',
          priority,
          title:
            row.daysLeft < 0
              ? `${row.item} has expired`
              : `${row.item} expires in ${row.daysLeft} day${row.daysLeft === 1 ? '' : 's'}`,
          detail: `${row.subject} · ${row.city} · ${row.ownerType.toLowerCase()} document expires ${row.expiresOn}`,
          time: daysFromTodayLabel(row.daysLeft),
          tone: notificationPriorityTone[priority],
          target: 'expiries',
          recordId: row.id,
          recordLabel: `${row.subject} · ${row.city}`,
          dueInDays: row.daysLeft,
          recordStatus: row.daysLeft < 0 ? 'Lapsed' : 'Due soon',
        },
        row.daysLeft,
      )
    })

  credentials
    .filter((row) => row.status === 'Expired' || row.status === 'Missing')
    .forEach((row) => {
      const priority: NotificationPriority = 'Critical'
      push(
        {
          id: `notif-credential-${row.id}`,
          category: 'Credential expiry',
          priority,
          title: `${row.kind} ${row.status.toLowerCase()}`,
          detail: `${row.driver} · ${row.city} · ${row.issue}`,
          time: row.status === 'Missing' ? 'No credential on record' : daysFromTodayLabel(row.daysLeft),
          tone: notificationPriorityTone[priority],
          target: 'drivers',
          recordId: row.id,
          recordLabel: `${row.driver} · ${row.reference}`,
          dueInDays: row.daysLeft,
          recordStatus: row.status,
        },
        row.daysLeft,
      )
    })

  inspections
    .filter((row) => row.status === 'Fail')
    .forEach((row) => {
      const priority: NotificationPriority = 'Critical'
      push(
        {
          id: `notif-inspection-${row.id}`,
          category: 'Failed inspection',
          priority,
          title: `${row.kind} failed`,
          detail: `${row.vehicle} · ${row.model} · ${row.note ?? 'Failed inspection requires a follow-up decision.'}`,
          time: `Result recorded ${row.dueOn}`,
          tone: notificationPriorityTone[priority],
          target: 'inspections',
          recordId: row.id,
          recordLabel: `${row.vehicle} · ${row.model}`,
          dueInDays: 0,
          recordStatus: row.status,
        },
        0,
      )
    })

  violations
    .filter((row) => row.status !== 'Closed')
    .forEach((row) => {
      const priority: NotificationPriority =
        row.severity === 'Critical' ? 'Critical' : row.severity === 'Major' ? 'High' : 'Medium'
      push(
        {
          id: `notif-violation-${row.id}`,
          category: 'New violation',
          priority,
          title: `${row.severity} violation · ${row.type}`,
          detail: `${row.vehicle} · ${row.driver} · respond by ${row.respondBy} · ₹${row.penalty.toLocaleString('en-IN')} penalty`,
          time: `Issued ${row.issuedOn}`,
          tone: notificationPriorityTone[priority],
          target: 'violations',
          recordId: row.id,
          recordLabel: `${row.vehicle} · ${row.city}`,
          dueInDays: row.daysLeft,
          recordStatus: row.status,
        },
        row.daysLeft,
      )
    })

  audits
    .filter((row) => row.status !== 'Completed' && row.daysUntil <= 30)
    .forEach((row) => {
      const priority: NotificationPriority =
        row.daysUntil <= 3 ? 'High' : row.daysUntil <= 7 ? 'Medium' : 'Low'
      push(
        {
          id: `notif-audit-${row.id}`,
          category: 'Upcoming audit',
          priority,
          title: `${row.title} in ${row.daysUntil} day${row.daysUntil === 1 ? '' : 's'}`,
          detail: `${row.scope} · ${row.vehicles} machines · led by ${row.auditor}`,
          time: `Scheduled ${row.scheduledOn}`,
          tone: notificationPriorityTone[priority],
          target: 'audits',
          recordId: row.id,
          recordLabel: `${row.city} · ${row.auditor}`,
          dueInDays: row.daysUntil,
          recordStatus: row.status,
        },
        row.daysUntil,
      )
    })

  correctiveActions
    .filter((row) => row.status === 'Overdue')
    .forEach((row) => {
      const priority: NotificationPriority =
        row.daysOverdue >= 7 ? 'Critical' : row.daysOverdue >= 3 ? 'High' : 'Medium'
      push(
        {
          id: `notif-action-${row.id}`,
          category: 'Overdue action',
          priority,
          title: `Corrective action overdue by ${row.daysOverdue} day${row.daysOverdue === 1 ? '' : 's'}`,
          detail: `${row.action} · ${row.vehicle} · ${row.violation}`,
          time: `Due ${row.dueOn}`,
          tone: notificationPriorityTone[priority],
          target: 'actions',
          recordId: row.id,
          recordLabel: `${row.owner} · ${row.evidence}`,
          dueInDays: -row.daysOverdue,
          recordStatus: row.status,
        },
        -row.daysOverdue,
      )
    })

  return entries
    .sort(
      (a, b) =>
        notificationPriorityOrder[b.item.priority] - notificationPriorityOrder[a.item.priority] ||
        a.urgency - b.urgency,
    )
    .map(({ item }) => item)
}
