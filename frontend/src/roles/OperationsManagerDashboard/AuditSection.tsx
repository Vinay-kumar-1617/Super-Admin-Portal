import { useMemo, useState } from 'react'
import type { AuditOutcome, RoleKey } from '@fieldwork/shared'
import {
  auditLogsToCsv,
  canExportAuditLogs,
  filterAuditLogsByScope,
  matchAuditLog,
  paginate,
  resolveAuditScope,
  type AuditLogFilters,
  type AuditScope,
} from '../../lib/auditAccess'
import { StatCards, type StatCard } from '../CityAdminDashboard/shared'
import { opsProfile, type AuditEntry } from './operationsData'
import {
  OPS_AUDIT_ACTIONS,
  OPS_AUDIT_ACTION_LABELS,
  OPS_AUDIT_OUTCOME_LABELS,
  opsAuditLogs,
  sessionAuditToRecords,
  type OpsAuditAction,
  type OpsAuditRecord,
} from './opsAuditData'

const PAGE_SIZE = 12

const auditStyles = `
  .ops-audit-readonly {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 9px 14px;
    border-radius: 12px;
    background: #f4f6f8;
    color: var(--sa-muted);
    font-size: 0.78rem;
  }
  .ops-audit-actor {
    display: grid;
    gap: 2px;
  }
  .ops-audit-actor span {
    font-size: 0.72rem;
    color: var(--sa-muted);
  }
  .ops-audit-action {
    display: grid;
    gap: 4px;
    justify-items: start;
  }
  .ops-audit-record {
    display: grid;
    gap: 2px;
  }
  .ops-audit-record span {
    font-size: 0.72rem;
    color: var(--sa-muted);
  }
  .ops-audit-detail td {
    background: #fbfcfd;
    white-space: normal;
  }
  .ops-audit-detail dl {
    margin: 0;
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr);
    gap: 6px 14px;
    font-size: 0.78rem;
  }
  .ops-audit-detail dt {
    font-weight: 800;
    color: var(--sa-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.68rem;
    align-self: start;
    padding-top: 2px;
  }
  .ops-audit-detail dd {
    margin: 0;
    color: var(--sa-text);
    line-height: 1.55;
  }
  .ops-audit-detail pre {
    margin: 0;
    padding: 8px;
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 8px;
    font-size: 0.72rem;
    overflow: auto;
    max-height: 160px;
  }
  .ops-audit-pager {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 4px 2px;
    font-size: 0.78rem;
    color: var(--sa-muted);
  }
  .ops-audit-pager-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

const formatStamp = (iso: string) => {
  const date = new Date(iso)
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return `${days} d ago`
}

const outcomeTone: Record<string, string> = {
  success: 'green',
  warning: 'amber',
  denied: 'red',
  failure: 'red',
}

const formatJson = (value: unknown) => (value ? JSON.stringify(value, null, 2) : '—')

type AuditSectionProps = {
  sessionAudit: AuditEntry[]
  onToast?: (message: string) => void
}

export default function AuditSection({ sessionAudit, onToast }: AuditSectionProps) {
  const [search, setSearch] = useState('')
  const [opsAction, setOpsAction] = useState<OpsAuditAction | 'all'>('all')
  const [actorRole, setActorRole] = useState<RoleKey | 'all'>('all')
  const [outcome, setOutcome] = useState<AuditOutcome | 'all'>('all')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const scope: AuditScope = useMemo(
    () => resolveAuditScope({ roleKey: 'operations-manager', scopeType: 'zone', scopeId: opsProfile.zone }),
    [],
  )

  const allRecords = useMemo<OpsAuditRecord[]>(
    () => [...sessionAuditToRecords(sessionAudit), ...opsAuditLogs],
    [sessionAudit],
  )

  const filters: AuditLogFilters = useMemo(
    () => ({ search, action: 'all', actorRole, outcome, date, page, pageSize: PAGE_SIZE }),
    [search, actorRole, outcome, date, page],
  )

  const baseRows = useMemo(() => {
    const scoped = filterAuditLogsByScope(allRecords, scope)
    const matched = scoped.filter((log) => matchAuditLog(log, filters))
    return matched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [allRecords, scope, filters])

  const rows = useMemo(
    () => (opsAction === 'all' ? baseRows : baseRows.filter((log) => log.opsAction === opsAction)),
    [baseRows, opsAction],
  )

  const paged = useMemo(() => paginate(rows, page, PAGE_SIZE), [rows, page])

  const actorRoles = useMemo(() => {
    const roles = new Set<RoleKey>()
    allRecords.forEach((log) => {
      if (log.actorRole) roles.add(String(log.actorRole) as RoleKey)
    })
    return Array.from(roles).sort()
  }, [allRecords])

  const scopedCount = useMemo(
    () => filterAuditLogsByScope(allRecords, scope).length,
    [allRecords, scope],
  )

  const cards: StatCard[] = useMemo(() => {
    const countOf = (action: OpsAuditAction) => baseRows.filter((log) => log.opsAction === action).length
    return [
      { key: 'vehicle_allocation', label: 'Vehicle allocations', value: countOf('vehicle_allocation'), tone: 'blue', sub: `${scopedCount} in scope` },
      { key: 'booking_update', label: 'Booking updates', value: countOf('booking_update'), tone: 'purple' },
      { key: 'task_assignment', label: 'Task assignments', value: countOf('task_assignment'), tone: 'brand' },
      { key: 'status_change', label: 'Status changes', value: countOf('status_change'), tone: 'amber' },
      { key: 'approval', label: 'Approvals', value: countOf('approval'), tone: 'green' },
      { key: 'escalation', label: 'Escalations', value: countOf('escalation'), tone: 'red' },
    ]
  }, [baseRows, scopedCount])

  const exportDisabled = !canExportAuditLogs('operations-manager') || rows.length === 0

  const handleExport = () => {
    const csv = auditLogsToCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${opsProfile.zone.toLowerCase()}_zone_audit_logs_${date || 'all'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    onToast?.(`Audit log exported · ${rows.length} entries (${opsProfile.zone} zone)`)
  }

  const resetFilters = () => {
    setSearch('')
    setOpsAction('all')
    setActorRole('all')
    setOutcome('all')
    setDate('')
    setPage(1)
  }

  const selectAction = (key: string) => {
    const next = key as OpsAuditAction
    setOpsAction((current) => (current === next ? 'all' : next))
    setPage(1)
  }

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section className="sa-panel">
      <style>{auditStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Audit logs</h3>
          <span className="sa-panel-sub">
            Authorized operational actions · {opsProfile.zone} zone scope only · {rows.length} of {scopedCount} entries shown
          </span>
        </div>
        <div className="finance-header-controls">
          <span className="sa-pill slate">Read-only</span>
          <button type="button" className="sa-btn-ghost" onClick={handleExport} disabled={exportDisabled}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="ops-audit-readonly">
        <span className="sa-pill slate">Read-only</span>
        Entries cannot be edited or deleted. Corrections are appended as new records so the trail stays immutable.
      </div>

      <StatCards cards={cards} activeKey={opsAction} onSelect={selectAction} />

      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search audit logs"
          placeholder="Search actor, record, action or reason..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <select
          className="sa-select"
          aria-label="Filter by action type"
          value={opsAction}
          onChange={(event) => {
            setOpsAction(event.target.value as OpsAuditAction | 'all')
            setPage(1)
          }}
        >
          <option value="all">All actions</option>
          {OPS_AUDIT_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {OPS_AUDIT_ACTION_LABELS[action]}
            </option>
          ))}
        </select>
        <select
          className="sa-select"
          aria-label="Filter by actor role"
          value={actorRole}
          onChange={(event) => {
            setActorRole(event.target.value as RoleKey | 'all')
            setPage(1)
          }}
        >
          <option value="all">All roles</option>
          {actorRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          className="sa-select"
          aria-label="Filter by outcome"
          value={outcome}
          onChange={(event) => {
            setOutcome(event.target.value as AuditOutcome | 'all')
            setPage(1)
          }}
        >
          <option value="all">All outcomes</option>
          {Object.entries(OPS_AUDIT_OUTCOME_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <input
          className="sa-date"
          type="date"
          aria-label="Filter by date"
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(event) => {
            setDate(event.target.value)
            setPage(1)
          }}
        />
        <button type="button" className="sa-btn-ghost" onClick={resetFilters}>
          Reset
        </button>
        <span className="sa-toolbar-meta">{rows.length} entries</span>
      </div>

      {paged.items.length === 0 ? (
        <div className="sa-empty">
          <p>No audit entries match the current filters.</p>
          <button type="button" className="sa-btn-ghost" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Affected record</th>
                <th>Outcome</th>
                <th aria-label="Details" />
              </tr>
            </thead>
            <tbody>
              {paged.items.map((log) => (
                <AuditRow
                  key={log.id}
                  log={log}
                  expanded={Boolean(expanded[log.id])}
                  onToggle={() => toggle(log.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="ops-audit-pager">
        <span>
          Showing {paged.items.length === 0 ? 0 : (paged.page - 1) * PAGE_SIZE + 1}–
          {(paged.page - 1) * PAGE_SIZE + paged.items.length} of {rows.length} entries
        </span>
        <div className="ops-audit-pager-actions">
          <button
            type="button"
            className="sa-btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={paged.page <= 1}
          >
            Previous
          </button>
          <span>
            Page {paged.page} of {paged.pageCount}
          </span>
          <button
            type="button"
            className="sa-btn-ghost"
            onClick={() => setPage((p) => Math.min(paged.pageCount, p + 1))}
            disabled={paged.page >= paged.pageCount}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

type AuditRowProps = {
  log: OpsAuditRecord
  expanded: boolean
  onToggle: () => void
}

function AuditRow({ log, expanded, onToggle }: AuditRowProps) {
  return (
    <>
      <tr>
        <td>
          <div className="ops-audit-record">
            <span className="sa-cell-strong">{formatStamp(log.createdAt)}</span>
            <span>{formatRelative(log.createdAt)}</span>
          </div>
        </td>
        <td>
          <div className="ops-audit-actor">
            <span className="sa-cell-strong">{log.actorName ?? 'System'}</span>
            <span>{log.actorRole ?? 'unknown role'}</span>
          </div>
        </td>
        <td>
          <div className="ops-audit-action">
            <span className="sa-cell-strong">{log.actionLabel}</span>
            <span className="sa-pill slate">{OPS_AUDIT_ACTION_LABELS[log.opsAction]}</span>
          </div>
        </td>
        <td>
          <div className="ops-audit-record">
            <span className="sa-cell-strong">{log.entityId ?? '—'}</span>
            <span>{log.entityLabel ?? log.entityType ?? '—'}</span>
          </div>
        </td>
        <td>
          <span className={`sa-pill ${outcomeTone[log.outcome] ?? 'slate'}`}>
            {OPS_AUDIT_OUTCOME_LABELS[log.outcome] ?? log.outcome}
          </span>
        </td>
        <td>
          <button type="button" className="sa-table-act" onClick={onToggle} aria-expanded={expanded}>
            {expanded ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="ops-audit-detail">
          <td colSpan={6}>
            <dl>
              <dt>Reason</dt>
              <dd>{log.reason}</dd>
              <dt>Record type</dt>
              <dd>{log.entityType ?? '—'}</dd>
              <dt>Record id</dt>
              <dd>{log.entityId ?? '—'}</dd>
              <dt>Scope</dt>
              <dd>
                {log.stateName ?? '—'} · {log.cityName ?? '—'} · {log.zoneName ?? '—'}
              </dd>
              <dt>Actor</dt>
              <dd>
                {log.actorName ?? 'System'} ({log.actorRole ?? 'unknown role'})
                {log.actorEmail ? ` · ${log.actorEmail}` : ''}
              </dd>
              <dt>Outcome</dt>
              <dd>{OPS_AUDIT_OUTCOME_LABELS[log.outcome] ?? log.outcome}</dd>
              <dt>IP address</dt>
              <dd>{log.ipAddress ?? '—'}</dd>
              <dt>User agent</dt>
              <dd>{log.userAgent ?? '—'}</dd>
              <dt>Previous values</dt>
              <dd>
                <pre className="audit-pre">{formatJson(log.previousValues)}</pre>
              </dd>
              <dt>New values</dt>
              <dd>
                <pre className="audit-pre">{formatJson(log.newValues)}</pre>
              </dd>
            </dl>
          </td>
        </tr>
      )}
    </>
  )
}
