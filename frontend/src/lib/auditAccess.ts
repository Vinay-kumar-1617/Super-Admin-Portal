import type {
  AuditActionCategory,
  AuditOutcome,
  RoleKey,
  ScopeType,
} from '@fieldwork/shared'

export const AUDIT_ACTION_LABELS: Record<AuditActionCategory, string> = {
  auth: 'Auth',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  status_change: 'Status change',
  approval: 'Approval',
  financial: 'Financial',
  user_management: 'User management',
  permission_change: 'Permission change',
  export: 'Export',
}

export type AuditScope = {
  allStates: boolean
  stateId: string | null
  cityName: string | null
  zoneName: string | null
}

export type AuditProfileScope = {
  roleKey: RoleKey
  scopeType: ScopeType
  scopeId: string | null
}

export type AuditLogRecord = {
  id: string
  createdAt: string
  actorId: string | null
  actorEmail: string | null
  actorName: string | null
  actorRole: RoleKey | string | null
  action: AuditActionCategory
  actionLabel: string
  entityType: string | null
  entityId: string | null
  entityLabel: string | null
  stateId: string | null
  cityId: string | null
  zoneId: string | null
  stateName: string | null
  cityName: string | null
  zoneName: string | null
  previousValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  outcome: AuditOutcome
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown> | null
}

export type AuditLogFilters = {
  search?: string
  action?: AuditActionCategory | 'all'
  actorRole?: RoleKey | 'all'
  outcome?: AuditOutcome | 'all'
  date?: string
  page?: number
  pageSize?: number
}

export function canViewAuditLogs(roleKey: RoleKey): boolean {
  return (
    roleKey === 'super-admin' ||
    roleKey === 'state-admin' ||
    roleKey === 'city-admin' ||
    roleKey === 'zone-admin' ||
    roleKey === 'operations-manager' ||
    roleKey === 'auditor' ||
    roleKey === 'compliance-admin'
  )
}

export function canExportAuditLogs(roleKey: RoleKey): boolean {
  return (
    roleKey === 'super-admin' ||
    roleKey === 'state-admin' ||
    roleKey === 'city-admin' ||
    roleKey === 'zone-admin' ||
    roleKey === 'operations-manager' ||
    roleKey === 'auditor' ||
    roleKey === 'compliance-admin'
  )
}

export function canViewAllStates(roleKey: RoleKey): boolean {
  return roleKey === 'super-admin' || roleKey === 'auditor'
}

export function resolveAuditScope(profile: AuditProfileScope): AuditScope {
  if (canViewAllStates(profile.roleKey)) {
    return { allStates: true, stateId: null, cityName: null, zoneName: null }
  }
  if (profile.roleKey === 'city-admin' && profile.scopeType === 'city' && profile.scopeId) {
    return { allStates: false, stateId: null, cityName: profile.scopeId, zoneName: null }
  }
  if (profile.roleKey === 'state-admin' && profile.scopeType === 'state' && profile.scopeId) {
    return { allStates: false, stateId: profile.scopeId, cityName: null, zoneName: null }
  }
  if (profile.roleKey === 'zone-admin' && profile.scopeType === 'zone' && profile.scopeId) {
    return { allStates: false, stateId: null, cityName: null, zoneName: profile.scopeId }
  }
  if (profile.roleKey === 'operations-manager' && profile.scopeType === 'zone' && profile.scopeId) {
    return { allStates: false, stateId: null, cityName: null, zoneName: profile.scopeId }
  }
  if (profile.roleKey === 'operations-manager' && profile.scopeType === 'city' && profile.scopeId) {
    return { allStates: false, stateId: null, cityName: profile.scopeId, zoneName: null }
  }
  if (!canViewAuditLogs(profile.roleKey)) {
    return { allStates: false, stateId: null, cityName: null, zoneName: null }
  }
  if (profile.scopeType === 'state' && profile.scopeId) {
    return { allStates: false, stateId: profile.scopeId, cityName: null, zoneName: null }
  }
  return { allStates: false, stateId: null, cityName: null, zoneName: null }
}

export function filterAuditLogsByScope<T extends { stateId: string | null; cityName?: string | null; zoneName?: string | null }>(
  logs: T[],
  scope: AuditScope,
): T[] {
  if (scope.allStates) return logs
  if (scope.zoneName) return logs.filter((log) => log.zoneName === scope.zoneName)
  if (scope.cityName) return logs.filter((log) => log.cityName === scope.cityName)
  if (!scope.stateId) return []
  return logs.filter((log) => log.stateId === scope.stateId)
}

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let s = String(value)
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    s = '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function auditLogsToCsv(rows: AuditLogRecord[]): string {
  const headers = [
    'id',
    'createdAt',
    'actorEmail',
    'actorRole',
    'action',
    'actionLabel',
    'entityType',
    'entityId',
    'entityLabel',
    'stateName',
    'cityName',
    'zoneName',
    'outcome',
    'ipAddress',
    'previousValues',
    'newValues',
    'userAgent',
  ]
  const lines = rows.map((row) => [
    row.id,
    row.createdAt,
    row.actorEmail,
    row.actorRole,
    row.action,
    row.actionLabel,
    row.entityType,
    row.entityId,
    row.entityLabel,
    row.stateName,
    row.cityName,
    row.zoneName,
    row.outcome,
    row.ipAddress,
    row.previousValues ? JSON.stringify(row.previousValues) : '',
    row.newValues ? JSON.stringify(row.newValues) : '',
    row.userAgent,
  ].map(escapeCsvCell).join(','))
  return [headers.map(escapeCsvCell).join(','), ...lines].join('\n')
}

export function matchAuditLog(log: AuditLogRecord, filters: AuditLogFilters): boolean {
  if (filters.action && filters.action !== 'all' && log.action !== filters.action) {
    return false
  }
  if (filters.actorRole && filters.actorRole !== 'all' && log.actorRole !== filters.actorRole) {
    return false
  }
  if (filters.outcome && filters.outcome !== 'all' && log.outcome !== filters.outcome) {
    return false
  }
  if (filters.date) {
    const day = new Date(filters.date)
    if (!isNaN(day.getTime())) {
      const start = new Date(day)
      start.setHours(0, 0, 0, 0)
      const end = new Date(day)
      end.setHours(23, 59, 59, 999)
      const at = new Date(log.createdAt).getTime()
      if (at < start.getTime() || at > end.getTime()) {
        return false
      }
    }
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    const hay = [
      log.actionLabel,
      log.entityType,
      log.entityLabel,
      log.entityId,
      log.actorEmail,
      log.actorRole,
      log.stateName,
      log.cityName,
      log.zoneName,
      log.id,
      log.previousValues ? JSON.stringify(log.previousValues) : '',
      log.newValues ? JSON.stringify(log.newValues) : '',
      log.metadata ? JSON.stringify(log.metadata) : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

export function paginate<T>(items: T[], page = 1, pageSize = 10): {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
} {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const p = Math.min(Math.max(1, page), pageCount)
  const start = (p - 1) * pageSize
  const end = start + pageSize
  return { items: items.slice(start, end), total, page: p, pageSize, pageCount }
}

export function isAuditLogMutable(): boolean {
  return false
}
