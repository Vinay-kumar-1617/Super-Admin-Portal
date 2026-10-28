// @ts-expect-error Node.js type definitions are not configured for this project.
import { test } from 'node:test'
// @ts-expect-error Node.js type definitions are not configured for this project.
import assert from 'node:assert/strict'
import {
  alertTargetSection,
  buildUrgentAlerts,
  cityCompliance,
  complianceAudits,
  complianceViolations,
  computeComplianceMetrics,
  correctiveActions,
  driverCredentials,
  fleetVehicles,
} from '../src/roles/ComplianceAdminDashboard/complianceFleetData.ts'

// Local expiry fixtures keep this suite independent of the module graph the
// dashboard pulls in at runtime.
const seedExpiries = [
  { id: 'EX-91', subject: 'TS-15-PC-3390', ownerType: 'Partner', kind: 'Permit', item: 'National permit PMT-809', city: 'Karimnagar', expiresOn: '05 Oct 2026', daysLeft: -3, reminded: true },
  { id: 'EX-90', subject: 'Ashok Yadav', ownerType: 'Driver', kind: 'Document', item: 'Driving licence', city: 'Karimnagar', expiresOn: '30 Sep 2026', daysLeft: -8, reminded: true },
  { id: 'EX-87', subject: 'TS-07-CW-9014', ownerType: 'Partner', kind: 'Permit', item: 'Urban permit PMT-808', city: 'Hyderabad', expiresOn: '14 Oct 2026', daysLeft: 6, reminded: false },
  { id: 'EX-86', subject: 'TS-16-EX-5521', ownerType: 'Partner', kind: 'Permit', item: 'State permit PMT-810', city: 'Warangal', expiresOn: '11 Oct 2026', daysLeft: 3, reminded: false },
  { id: 'EX-84', subject: 'Ravi Teja', ownerType: 'Driver', kind: 'Document', item: 'Operator badge', city: 'Hyderabad', expiresOn: '13 Oct 2026', daysLeft: 5, reminded: false },
  { id: 'EX-83', subject: 'Warangal Earthmovers', ownerType: 'Partner', kind: 'Document', item: 'Liability insurance', city: 'Warangal', expiresOn: '15 Oct 2026', daysLeft: 7, reminded: false },
  { id: 'EX-82', subject: 'TS-09-MM-2287', ownerType: 'Partner', kind: 'Document', item: 'Insurance', city: 'Hyderabad', expiresOn: '30 Nov 2026', daysLeft: 53, reminded: false },
] satisfies Parameters<typeof computeComplianceMetrics>[0]['expiries']

const metrics = computeComplianceMetrics({
  vehicles: fleetVehicles,
  expiries: seedExpiries,
  credentials: driverCredentials,
  violations: complianceViolations,
  correctiveActions,
  audits: complianceAudits,
})

test('compliance metrics count the fleet bands', () => {
  const compliant = fleetVehicles.filter((vehicle) => vehicle.status === 'Compliant').length
  const expiring = fleetVehicles.filter((vehicle) => vehicle.status === 'Expiring').length
  const blocked = fleetVehicles.filter((vehicle) => vehicle.status === 'Non-compliant').length

  assert.equal(metrics.fleetSize, fleetVehicles.length)
  assert.equal(metrics.compliantVehicles, compliant)
  assert.equal(metrics.nonCompliantVehicles, blocked)
  assert.equal(compliant + expiring + blocked, metrics.fleetSize)
})

test('compliance percentage weights expiring vehicles at half', () => {
  const expiring = fleetVehicles.filter((vehicle) => vehicle.status === 'Expiring').length
  const expected = Math.round(
    ((metrics.compliantVehicles + expiring * 0.5) / metrics.fleetSize) * 100,
  )
  assert.equal(metrics.compliancePercentage, expected)
  assert.ok(metrics.compliancePercentage > 0 && metrics.compliancePercentage <= 100)
})

test('compliance metrics only count documents that are still valid and expiring', () => {
  const expected = seedExpiries.filter((row) => row.daysLeft >= 0 && row.daysLeft <= 30).length
  assert.equal(metrics.expiringDocuments, expected)
  assert.ok(expected > 0)
})

test('compliance metrics track credential issues, violations, actions and audits', () => {
  assert.equal(
    metrics.driverCredentialIssues,
    driverCredentials.filter((row) => row.status !== 'Valid').length,
  )
  assert.equal(
    metrics.openViolations,
    complianceViolations.filter((row) => row.status !== 'Closed').length,
  )
  assert.equal(
    metrics.criticalViolations,
    complianceViolations.filter((row) => row.status !== 'Closed' && row.severity === 'Critical').length,
  )
  assert.equal(
    metrics.overdueCorrectiveActions,
    correctiveActions.filter((row) => row.status === 'Overdue').length,
  )
  assert.equal(
    metrics.upcomingAudits,
    complianceAudits.filter((row) => row.status !== 'Completed').length,
  )
})

test('penalty exposure ignores closed violations', () => {
  const expected = complianceViolations
    .filter((row) => row.status !== 'Closed')
    .reduce((sum, row) => sum + row.penalty, 0)
  assert.equal(metrics.penaltyExposure, expected)
})

test('urgent alerts rank critical before warning', () => {
  const alerts = buildUrgentAlerts({
    vehicles: fleetVehicles,
    credentials: driverCredentials,
    violations: complianceViolations,
    correctiveActions,
    audits: complianceAudits,
  })

  assert.ok(alerts.length > 0)
  const firstWarning = alerts.findIndex((alert) => alert.severity === 'Warning')
  const lastCritical = alerts.map((alert) => alert.severity).lastIndexOf('Critical')
  assert.ok(lastCritical < firstWarning || firstWarning === -1)
  assert.ok(alerts.every((alert) => alert.title.length > 0 && alert.detail.length > 0))
})

test('urgent alerts cover each open compliance category', () => {
  const alerts = buildUrgentAlerts({
    vehicles: fleetVehicles,
    credentials: driverCredentials,
    violations: complianceViolations,
    correctiveActions,
    audits: complianceAudits,
  })
  const categories = new Set(alerts.map((alert) => alert.category))

  assert.ok(categories.has('Violation'))
  assert.ok(categories.has('Corrective action'))
  assert.ok(categories.has('Driver credential'))
  assert.ok(categories.has('Vehicle'))
  assert.ok(categories.has('Audit'))
})

test('every alert category resolves to a dashboard page', () => {
  assert.equal(alertTargetSection('Violation'), 'violations')
  assert.equal(alertTargetSection('Corrective action'), 'actions')
  assert.equal(alertTargetSection('Driver credential'), 'drivers')
  assert.equal(alertTargetSection('Vehicle'), 'vehicles')
  assert.equal(alertTargetSection('Expiry'), 'expiries')
  assert.equal(alertTargetSection('Audit'), 'audits')
  assert.equal(alertTargetSection('Document'), 'documents')
})

test('city compliance keeps every vehicle accounted for', () => {
  const rows = cityCompliance(fleetVehicles)
  const total = rows.reduce((sum, row) => sum + row.fleet, 0)

  assert.equal(total, fleetVehicles.length)
  assert.equal(
    rows.reduce((sum, row) => sum + row.compliant + row.expiring + row.nonCompliant, 0),
    fleetVehicles.length,
  )
  assert.ok(rows.every((row) => row.score >= 0 && row.score <= 100))
})

test('city compliance lists the weakest city first', () => {
  const rows = cityCompliance(fleetVehicles)
  const scores = rows.map((row) => row.score)
  assert.deepEqual(scores, [...scores].sort((a, b) => a - b))
})
