import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  auditLogsToCsv,
  canExportAuditLogs,
  canViewAuditLogs,
  canViewAllStates,
  escapeCsvCell,
  filterAuditLogsByScope,
  isAuditLogMutable,
  matchAuditLog,
  paginate,
  resolveAuditScope,
  type AuditLogRecord,
  type AuditProfileScope,
} from '../src/lib/auditAccess.ts'

test('canViewAuditLogs', () => {
  assert.equal(canViewAuditLogs('super-admin'), true)
  assert.equal(canViewAuditLogs('state-admin'), true)
  assert.equal(canViewAuditLogs('city-admin'), true)
  assert.equal(canViewAuditLogs('zone-admin'), true)
  assert.equal(canViewAuditLogs('operations-manager'), true)
  assert.equal(canViewAuditLogs('auditor'), true)
  assert.equal(canViewAuditLogs('compliance-admin'), true)
  assert.equal(canViewAuditLogs('operator'), false)
  assert.equal(canViewAuditLogs('customer'), false)
})

test('canExportAuditLogs', () => {
  assert.equal(canExportAuditLogs('super-admin'), true)
  assert.equal(canExportAuditLogs('state-admin'), true)
  assert.equal(canExportAuditLogs('city-admin'), true)
  assert.equal(canExportAuditLogs('zone-admin'), true)
  assert.equal(canExportAuditLogs('operations-manager'), true)
  assert.equal(canExportAuditLogs('auditor'), true)
  assert.equal(canExportAuditLogs('compliance-admin'), true)
  assert.equal(canExportAuditLogs('operator'), false)
})

test('canViewAllStates', () => {
  assert.equal(canViewAllStates('super-admin'), true)
  assert.equal(canViewAllStates('auditor'), true)
  assert.equal(canViewAllStates('state-admin'), false)
})

test('resolveAuditScope', () => {
  assert.deepEqual(resolveAuditScope({ roleKey: 'super-admin', scopeType: 'national', scopeId: null }), {
    allStates: true,
    stateId: null,
    cityName: null,
    zoneName: null,
  })
  assert.deepEqual(resolveAuditScope({ roleKey: 'auditor', scopeType: 'national', scopeId: null }), {
    allStates: true,
    stateId: null,
    cityName: null,
    zoneName: null,
  })
  assert.deepEqual(resolveAuditScope({ roleKey: 'state-admin', scopeType: 'state', scopeId: 'TS' }), {
    allStates: false,
    stateId: 'TS',
    cityName: null,
    zoneName: null,
  })
  assert.deepEqual(resolveAuditScope({ roleKey: 'city-admin', scopeType: 'city', scopeId: 'hyd' }), {
    allStates: false,
    stateId: null,
    cityName: 'hyd',
    zoneName: null,
  })
  assert.deepEqual(resolveAuditScope({ roleKey: 'zone-admin', scopeType: 'zone', scopeId: 'Madhapur' }), {
    allStates: false,
    stateId: null,
    cityName: null,
    zoneName: 'Madhapur',
  })
  assert.deepEqual(resolveAuditScope({ roleKey: 'operations-manager', scopeType: 'zone', scopeId: 'Madhapur' }), {
    allStates: false,
    stateId: null,
    cityName: null,
    zoneName: 'Madhapur',
  })
  assert.deepEqual(resolveAuditScope({ roleKey: 'operations-manager', scopeType: 'city', scopeId: 'hyd' }), {
    allStates: false,
    stateId: null,
    cityName: 'hyd',
    zoneName: null,
  })
  const saNoScope: AuditProfileScope = { roleKey: 'state-admin', scopeType: 'state', scopeId: null }
  assert.deepEqual(resolveAuditScope(saNoScope), {
    allStates: false,
    stateId: null,
    cityName: null,
    zoneName: null,
  })
  const unauth: AuditProfileScope = { roleKey: 'operator', scopeType: 'zone', scopeId: 'Madhapur' } as unknown as AuditProfileScope
  assert.deepEqual(resolveAuditScope(unauth), {
    allStates: false,
    stateId: null,
    cityName: null,
    zoneName: null,
  })
})

test('filterAuditLogsByScope', () => {
  const logs = [{ stateId: 'TS' }, { stateId: 'KA' }, { stateId: null }] as Array<{ stateId: string | null }>
  assert.equal(filterAuditLogsByScope(logs, { allStates: true, stateId: null, cityName: null, zoneName: null }).length, 3)
  assert.equal(filterAuditLogsByScope(logs, { allStates: false, stateId: 'TS', cityName: null, zoneName: null }).length, 1)
  assert.equal(filterAuditLogsByScope(logs, { allStates: false, stateId: null, cityName: null, zoneName: null }).length, 0)

  const zoned = [
    { stateId: 'TS', cityName: 'hyd', zoneName: 'Madhapur' },
    { stateId: 'TS', cityName: 'hyd', zoneName: 'Gachibowli' },
    { stateId: 'TS', cityName: 'hyd', zoneName: 'Madhapur' },
  ]
  const zoneScope = { allStates: false, stateId: null, cityName: null, zoneName: 'Madhapur' }
  assert.equal(filterAuditLogsByScope(zoned, zoneScope).length, 2)

  const cityScope = { allStates: false, stateId: null, cityName: 'hyd', zoneName: null }
  assert.equal(filterAuditLogsByScope(zoned, cityScope).length, 3)
})

test('escapeCsvCell', () => {
  assert.equal(escapeCsvCell('foo'), 'foo')
  assert.equal(escapeCsvCell('foo,bar'), '"foo,bar"')
  assert.equal(escapeCsvCell('foo "bar"'), '"foo ""bar"""')
  assert.equal(escapeCsvCell(null), '')
  assert.equal(escapeCsvCell(undefined), '')
})

test('auditLogsToCsv', () => {
  const row: AuditLogRecord = {
    id: 'AUD-1',
    createdAt: '2025-10-12T10:23:45.000Z',
    actorId: 'u1',
    actorEmail: 's@e.com',
    actorName: 's',
    actorRole: 'state-admin',
    action: 'update',
    actionLabel: 'Updated',
    entityType: 'booking',
    entityId: 'BK-1',
    entityLabel: 'BK-1',
    stateId: 'TS',
    cityId: null,
    zoneId: null,
    stateName: 'Telangana',
    cityName: null,
    zoneName: null,
    previousValues: { a: 1 },
    newValues: { a: 2 },
    outcome: 'success',
    ipAddress: '1.1.1.1',
    userAgent: 'ua',
    metadata: null,
  }
  const csv = auditLogsToCsv([row])
  assert.ok(csv.startsWith('id,createdAt,actorEmail'))
  assert.ok(csv.includes('s@e.com'))
  assert.ok(csv.includes('"{""a"":1}"') || csv.includes('{"a":1}'))
})

test('matchAuditLog', () => {
  const log: AuditLogRecord = {
    id: 'AUD-5',
    createdAt: '2025-10-12T09:12:08.000Z',
    actorId: 'c1',
    actorEmail: 'c@e.com',
    actorName: 'c',
    actorRole: 'city-admin',
    action: 'create',
    actionLabel: 'Zone created',
    entityType: 'zone',
    entityId: 'z1',
    entityLabel: 'North-West',
    stateId: 'TS',
    cityId: null,
    zoneId: null,
    stateName: 'Telangana',
    cityName: 'Hyderabad',
    zoneName: 'North-West',
    previousValues: null,
    newValues: { city: 'Hyderabad' },
    outcome: 'success',
    ipAddress: '192.168.1.56',
    userAgent: 'ua',
    metadata: null,
  }
  assert.equal(matchAuditLog(log, { search: 'hyderabad' }), true)
  assert.equal(matchAuditLog(log, { search: 'north-west' }), true)
  assert.equal(matchAuditLog(log, { search: 'bangalore' }), false)
  assert.equal(matchAuditLog(log, { action: 'create' }), true)
  assert.equal(matchAuditLog(log, { action: 'delete' }), false)
  assert.equal(matchAuditLog(log, { outcome: 'success' }), true)
  assert.equal(matchAuditLog(log, { outcome: 'failure' }), false)
  assert.equal(matchAuditLog(log, { actorRole: 'city-admin' }), true)
  assert.equal(matchAuditLog(log, { actorRole: 'state-admin' }), false)
  assert.equal(matchAuditLog(log, { date: '2025-10-12' }), true)
  assert.equal(matchAuditLog(log, { date: '2025-10-11' }), false)
  // Metadata (for example the recorded reason) is searchable too.
  const withReason = { ...log, metadata: { reason: 'Site access denied at the Uppal gate' } }
  assert.equal(matchAuditLog(withReason, { search: 'uppal gate' }), true)
  assert.equal(matchAuditLog(withReason, { search: 'gachibowli' }), false)
})

test('paginate', () => {
  const items = [1, 2, 3, 4, 5]
  const p1 = paginate(items, 1, 2)
  assert.equal(p1.items.length, 2)
  assert.equal(p1.page, 1)
  assert.equal(p1.pageCount, 3)
  const p3 = paginate(items, 3, 2)
  assert.equal(p3.items.length, 1)
  assert.equal(p3.page, 3)
})

test('isAuditLogMutable', () => {
  assert.equal(isAuditLogMutable(), false)
})
