import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildComplianceNotifications,
  defaultNotificationPreferences,
  normalizeNotificationPreferences,
  notificationCategories,
  notificationCategoryMeta,
  notificationMatchesPreferences,
  notificationPriorityOrder,
  type ComplianceNotificationInput,
} from '../src/roles/ComplianceAdminDashboard/complianceNotificationData.ts'

// Local fixtures keep this suite independent of the dashboard module graph.
const input: ComplianceNotificationInput = {
  expiries: [
    { id: 'EX-1', subject: 'TS-01-HB-1000', ownerType: 'Partner', kind: 'Document', item: 'Insurance', city: 'Hyderabad', expiresOn: '20 Oct 2026', daysLeft: -2, reminded: false },
    { id: 'EX-2', subject: 'Ravi Teja', ownerType: 'Driver', kind: 'Document', item: 'Operator badge', city: 'Hyderabad', expiresOn: '27 Oct 2026', daysLeft: 5, reminded: false },
    { id: 'EX-3', subject: 'TS-02-PC-2000', ownerType: 'Partner', kind: 'Permit', item: 'State permit', city: 'Warangal', expiresOn: '25 Oct 2026', daysLeft: 3, reminded: false },
    { id: 'EX-4', subject: 'TS-03-PC-3000', ownerType: 'Partner', kind: 'Document', item: 'Fitness certificate', city: 'Nalgonda', expiresOn: '30 Nov 2026', daysLeft: 45, reminded: false },
  ],
  credentials: [
    { id: 'DRV-1', driver: 'Ashok Yadav', phone: '+91 90000 00001', city: 'Karimnagar', kind: 'Driving licence', reference: 'DL-1', expiresOn: '30 Sep 2026', daysLeft: -8, status: 'Expired', issue: 'Licence expired' },
    { id: 'DRV-2', driver: 'Ravi Teja', phone: '+91 90000 00002', city: 'Hyderabad', kind: 'Driving licence', reference: 'DL-2', expiresOn: '14 Mar 2027', daysLeft: 190, status: 'Valid', issue: '' },
  ],
  inspections: [
    { id: 'INSP-1', vehicle: 'TS-07-TK-1178', model: 'Volvo FMX 440', kind: 'Post-accident inspection', dueOn: '01 Oct 2026', assignedTo: 'Inspector F. Khan', status: 'Fail', note: 'Brake line leak', history: [] },
    { id: 'INSP-2', vehicle: 'TS-16-EX-5521', model: 'Tata Hitachi EX200', kind: 'Annual fitness', dueOn: '24 Sep 2026', assignedTo: 'Inspector R. Devi', status: 'Pass', history: [] },
  ],
  violations: [
    { id: 'VIO-1', vehicle: 'TS-15-PC-3390', model: 'Komatsu PC200', driver: 'Ashok Yadav', city: 'Karimnagar', type: 'Operation without a valid permit', authority: 'RTO Karimnagar', severity: 'Critical', issuedOn: '01 Oct 2026', respondBy: '08 Oct 2026', daysLeft: -2, penalty: 15000, status: 'Open' },
    { id: 'VIO-2', vehicle: 'TS-07-CW-9014', model: 'ACE AG-15', driver: 'Gopal Rao', city: 'Hyderabad', type: 'Restricted zone entry', authority: 'Site contractor', severity: 'Minor', issuedOn: '08 Oct 2026', respondBy: '30 Oct 2026', daysLeft: 20, penalty: 3500, status: 'Closed' },
  ],
  correctiveActions: [
    { id: 'CA-1', violation: 'VIO-1', vehicle: 'TS-15-PC-3390', action: 'Replace expired permit', owner: 'Warangal Earthmovers', dueOn: '28 Sep 2026', daysOverdue: 12, status: 'Overdue', evidence: 'Not submitted' },
    { id: 'CA-2', violation: 'VIO-2', vehicle: 'TS-07-CW-9014', action: 'Renew pollution certificate', owner: 'Charminar Plant Hire', dueOn: '02 Oct 2026', daysOverdue: 0, status: 'Completed', evidence: 'Uploaded' },
  ],
  audits: [
    { id: 'AUD-1', title: 'Night inspection sample', scope: 'Skid steer cluster', auditor: 'Inspector R. Devi', scheduledOn: '25 Oct 2026', daysUntil: 4, vehicles: 64, city: 'Nalgonda', status: 'Scheduled', checklist: [] },
    { id: 'AUD-2', title: 'Q2 statutory audit', scope: 'All records', auditor: 'Statutory Audit Cell', scheduledOn: '30 Sep 2026', daysUntil: -6, vehicles: 1204, city: 'State-wide', status: 'Completed', checklist: [] },
  ],
}

const build = () => buildComplianceNotifications(input)

test('derives all six notification categories from live registers', () => {
  const notifications = build()
  const categories = new Set(notifications.map((item) => item.category))

  assert.equal(categories.size, notificationCategories.length)
  notificationCategories.forEach((category) => assert.ok(categories.has(category), category))
})

test('ranks critical notifications before lower priorities', () => {
  const priorities = build().map((item) => notificationPriorityOrder[item.priority])
  assert.deepEqual(priorities, [...priorities].sort((a, b) => b - a))
})

test('ignores resolved, non-document and out-of-window records', () => {
  const ids = new Set(build().map((item) => item.id))

  assert.ok(ids.has('notif-doc-expiry-EX-1'))
  assert.ok(ids.has('notif-doc-expiry-EX-2'))
  assert.ok(!ids.has('notif-doc-expiry-EX-3'))
  assert.ok(!ids.has('notif-doc-expiry-EX-4'))

  assert.ok(ids.has('notif-credential-DRV-1'))
  assert.ok(!ids.has('notif-credential-DRV-2'))

  assert.ok(ids.has('notif-inspection-INSP-1'))
  assert.ok(!ids.has('notif-inspection-INSP-2'))

  assert.ok(ids.has('notif-violation-VIO-1'))
  assert.ok(!ids.has('notif-violation-VIO-2'))

  assert.ok(ids.has('notif-action-CA-1'))
  assert.ok(!ids.has('notif-action-CA-2'))

  assert.ok(ids.has('notif-audit-AUD-1'))
  assert.ok(!ids.has('notif-audit-AUD-2'))
})

test('maps every notification category to its owning register', () => {
  build().forEach((item) => assert.equal(item.target, notificationCategoryMeta[item.category].target))

  assert.equal(notificationCategoryMeta['Document expiry'].target, 'expiries')
  assert.equal(notificationCategoryMeta['Credential expiry'].target, 'drivers')
  assert.equal(notificationCategoryMeta['Failed inspection'].target, 'inspections')
  assert.equal(notificationCategoryMeta['New violation'].target, 'violations')
  assert.equal(notificationCategoryMeta['Upcoming audit'].target, 'audits')
  assert.equal(notificationCategoryMeta['Overdue action'].target, 'actions')
})

test('each notification carries a focusable record id and label', () => {
  build().forEach((item) => {
    assert.ok(item.recordId.length > 0)
    assert.ok(item.recordLabel.length > 0)
    assert.ok(item.title.length > 0 && item.detail.length > 0)
  })
})

test('preferences hide disabled categories', () => {
  const notifications = build()
  const violation = notifications.find((item) => item.category === 'New violation')
  assert.ok(violation)

  const preferences = {
    ...defaultNotificationPreferences,
    categories: { ...defaultNotificationPreferences.categories, 'New violation': false },
  }

  assert.equal(notificationMatchesPreferences(violation, preferences), false)
  assert.equal(
    notificationMatchesPreferences(
      notifications.find((item) => item.category === 'Document expiry')!,
      preferences,
    ),
    true,
  )
})

test('preferences apply the minimum priority floor', () => {
  const notifications = build()
  const preferences = { ...defaultNotificationPreferences, minimumPriority: 'Critical' as const }

  notifications.forEach((item) => {
    assert.equal(
      notificationMatchesPreferences(item, preferences),
      notificationPriorityOrder[item.priority] >= notificationPriorityOrder.Critical,
    )
  })
})

test('stored preferences are normalised to safe defaults', () => {
  const preferences = normalizeNotificationPreferences({
    categories: { 'New violation': false },
    minimumPriority: 'Urgent',
    channels: { sms: true },
    digest: 'Hourly',
  })

  assert.equal(preferences.categories['New violation'], false)
  assert.equal(preferences.categories['Failed inspection'], true)
  assert.equal(preferences.minimumPriority, 'All')
  assert.equal(preferences.channels.email, true)
  assert.equal(preferences.channels.sms, true)
  assert.equal(preferences.digest, 'Instant')
})
