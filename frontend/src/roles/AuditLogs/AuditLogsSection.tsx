import { useEffect, useMemo, useState } from 'react'
import {
  AUDIT_ACTION_LABELS,
  auditLogsToCsv,
  canExportAuditLogs,
  filterAuditLogsByScope,
  matchAuditLog,
  paginate,
  resolveAuditScope,
  type AuditLogFilters,
  type AuditLogRecord,
  type AuditProfileScope,
  type AuditScope,
} from '../../lib/auditAccess'
import { DEMO_AUDIT_LOGS } from '../../lib/auditLog'

const ACTION_OPTIONS = [
  'all',
  'auth',
  'create',
  'update',
  'delete',
  'status_change',
  'approval',
  'financial',
  'user_management',
  'permission_change',
  'export',
] as const

const OUTCOME_OPTIONS = ['all', 'success', 'failure', 'denied', 'warning'] as const

type Props = {
  profile: AuditProfileScope
  mode?: 'state' | 'all' | 'city' | 'zone'
  onBack?: () => void
}

export default function AuditLogsSection({ profile, mode = 'state', onBack }: Props) {
  const scope: AuditScope = useMemo(() => resolveAuditScope(profile), [profile])
  const [filters, setFilters] = useState<AuditLogFilters>({
    action: 'all',
    actorRole: 'all',
    outcome: 'all',
    page: 1,
    pageSize: 10,
    search: '',
    date: '',
  })
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }))
  }, [filters.action, filters.actorRole, filters.outcome, filters.search, filters.date])

  const rows = useMemo(() => {
    let list: AuditLogRecord[] = DEMO_AUDIT_LOGS.map((l) => l as AuditLogRecord)
    list = filterAuditLogsByScope(list, scope)
    list = list.filter((log) => matchAuditLog(log, filters))
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return list
  }, [scope, filters])

  const paged = useMemo(() => paginate(rows, filters.page, filters.pageSize), [rows, filters.page, filters.pageSize])

  const actorRoles = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((r) => {
      if (r.actorRole) set.add(String(r.actorRole))
    })
    return Array.from(set).sort()
  }, [rows])

  const exportDisabled = !canExportAuditLogs(profile.roleKey) || rows.length === 0

  const downloadCsv = () => {
    const csv = auditLogsToCsv(rows as AuditLogRecord[])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const formatJson = (v: unknown) => (v ? JSON.stringify(v, null, 2) : '')

  return (
    <section className="audit-section" aria-live="polite">
      <style>{`
        .audit-section { display: grid; gap: 16px; }
        .audit-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; background: #fff; border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; padding: 18px 20px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .audit-kicker { margin: 0; color: #667085; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }
        .audit-title { margin: 6px 0 8px; font-size: 1.42rem; }
        .audit-sub { margin: 0; color: #667085; }
        .audit-readonly { margin-top: 8px; color: #475569; font-size: 0.78rem; }
        .audit-filters { display: grid; grid-template-columns: 1.2fr repeat(5, 1fr) auto; gap: 10px; align-items: center; background: #fff; border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; padding: 12px 14px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .audit-input { padding: 9px 11px; border-radius: 10px; border: 1px solid rgba(15,23,42,0.12); font: inherit; }
        .audit-select { padding: 9px 11px; border-radius: 10px; border: 1px solid rgba(15,23,42,0.12); font: inherit; }
        .audit-btn { padding: 9px 12px; border-radius: 10px; border: 1px solid rgba(15,23,42,0.12); background: #fff; font-weight: 700; cursor: pointer; }
        .audit-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
        .audit-table-wrap { background: #fff; border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .audit-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .audit-table th, .audit-table td { padding: 10px 12px; border-bottom: 1px solid rgba(15,23,42,0.06); text-align: left; vertical-align: top; }
        .audit-table th { background: #f8fafb; color: #475569; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.08em; }
        .audit-pill { display: inline-flex; padding: 4px 8px; border-radius: 999px; font-weight: 800; text-transform: uppercase; font-size: 0.68rem; letter-spacing: 0.04em; }
        .audit-pill.success { background: rgba(8,166,108,0.12); color: #08a66c; }
        .audit-pill.failure { background: rgba(239,68,68,0.12); color: #ef4444; }
        .audit-pill.denied { background: rgba(239,68,68,0.12); color: #b45309; }
        .audit-pill.warning { background: rgba(245,158,11,0.14); color: #b45309; }
        .audit-pre { margin: 6px 0 0; padding: 8px; background: #0f172a; color: #e2e8f0; border-radius: 8px; font-size: 0.72rem; overflow: auto; max-height: 200px; }
        .audit-meta { color: #667085; font-size: 0.78rem; }
        .audit-pager { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; padding: 10px 14px; }
      `}</style>
      <div className="audit-header">
        <div>
          <p className="audit-kicker">
            {mode === 'all'
              ? 'Platform security'
              : mode === 'city'
                ? 'City security'
                : mode === 'zone'
                  ? 'Zone security'
                  : 'State security'}
          </p>
          <h2 className="audit-title">Audit Logs</h2>
          <p className="audit-sub">
            {mode === 'all'
              ? 'All states · Read-only audit trail'
              : mode === 'city'
                ? `${profile.scopeId ?? 'Assigned city'}-scoped · Login history, application changes, approvals and financial actions`
                : mode === 'zone'
                  ? `${profile.scopeId ?? 'Assigned zone'}-scoped · Login history, application changes, approvals and financial actions`
                  : 'State-scoped · Activities by City/Zone/Finance/Dispatch/Support'}
          </p>
          <div className="audit-readonly">Read-only. Edits, deletions, and modifications are blocked.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {onBack && (
            <button type="button" className="audit-btn" onClick={onBack}>← Back</button>
          )}
          <button type="button" className="audit-btn" disabled={exportDisabled} onClick={downloadCsv}>Export CSV</button>
        </div>
      </div>
      <div className="audit-filters">
        <input
          className="audit-input"
          placeholder="Search user, entity, action, ID, details"
          value={filters.search}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
        />
        <select
          className="audit-select"
          value={filters.action}
          onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value as any }))}
        >
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>{a === 'all' ? 'All actions' : (AUDIT_ACTION_LABELS[a as keyof typeof AUDIT_ACTION_LABELS] ?? a)}</option>
          ))}
        </select>
        <select
          className="audit-select"
          value={filters.actorRole}
          onChange={(e) => setFilters((p) => ({ ...p, actorRole: e.target.value as any }))}
        >
          <option value="all">All roles</option>
          {actorRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          className="audit-select"
          value={filters.outcome}
          onChange={(e) => setFilters((p) => ({ ...p, outcome: e.target.value as any }))}
        >
          {OUTCOME_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === 'all' ? 'All outcomes' : o}</option>
          ))}
        </select>
        <input
          className="audit-input"
          type="date"
          aria-label="Filter by date"
          value={filters.date || ''}
          onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))}
        />
        <button
          type="button"
          className="audit-btn"
          onClick={() => setFilters({ action: 'all', actorRole: 'all', outcome: 'all', page: 1, pageSize: 10, search: '', date: '' })}
        >
          Reset
        </button>
        <span className="audit-meta">{rows.length} total</span>
      </div>
      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Scope</th>
              <th>Outcome</th>
              <th>IP</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#667085' }}>No audit logs match filters</td>
              </tr>
            ) : (
              paged.items.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div>{new Date(log.createdAt).toLocaleString()}</div>
                    <div className="audit-meta">{log.id}</div>
                  </td>
                  <td>
                    <div>{log.actorEmail || log.actorId}</div>
                    <div className="audit-meta">{log.actorRole}</div>
                  </td>
                  <td>
                    <div>{log.actionLabel}</div>
                    <div className="audit-meta">{log.action}</div>
                  </td>
                  <td>
                    <div>{log.entityLabel || log.entityId}</div>
                    <div className="audit-meta">{log.entityType}</div>
                  </td>
                  <td>
                    <div>{log.stateName || log.stateId || '—'}</div>
                    <div className="audit-meta">{[log.cityName, log.zoneName].filter(Boolean).join(' · ') || '—'}</div>
                  </td>
                  <td><span className={`audit-pill ${log.outcome}`}>{log.outcome}</span></td>
                  <td className="audit-meta">{log.ipAddress || '—'}</td>
                  <td>
                    <button type="button" className="audit-btn" onClick={() => toggle(log.id)}>
                      {expanded[log.id] ? 'Hide' : 'View'}
                    </button>
                    {expanded[log.id] && (
                      <div style={{ marginTop: 8 }}>
                        {log.previousValues && (
                          <>
                            <div className="audit-meta">Previous</div>
                            <pre className="audit-pre">{formatJson(log.previousValues)}</pre>
                          </>
                        )}
                        {log.newValues && (
                          <>
                            <div className="audit-meta" style={{ marginTop: 8 }}>New</div>
                            <pre className="audit-pre">{formatJson(log.newValues)}</pre>
                          </>
                        )}
                        {!log.previousValues && !log.newValues && <div className="audit-meta">No diff</div>}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="audit-pager">
        <span className="audit-meta">
          Page {paged.page} of {paged.pageCount} • {paged.total} rows
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="audit-btn"
            disabled={paged.page <= 1}
            onClick={() => setFilters((p) => ({ ...p, page: paged.page - 1 }))}
          >
            Prev
          </button>
          <button
            type="button"
            className="audit-btn"
            disabled={paged.page >= paged.pageCount}
            onClick={() => setFilters((p) => ({ ...p, page: paged.page + 1 }))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
