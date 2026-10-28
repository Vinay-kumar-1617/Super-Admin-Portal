import { Fragment, useMemo, useState } from 'react'
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

  const updateFilters = (patch: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }))
  }

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
    <section className={`audit-section audit-section-${mode}`} aria-live="polite">
      <style>{`
        .audit-section { display: grid; gap: 16px; min-width: 0; width: 100%; container-type: inline-size; }
        .audit-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; min-width: 0; background: #fff; border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; padding: 18px 20px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .audit-header > div:first-child { min-width: 0; }
        .audit-header-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 10px; }
        .audit-kicker { margin: 0; color: #667085; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }
        .audit-title { margin: 6px 0 0; font-size: clamp(1.2rem, 2vw, 1.42rem); }
        .audit-filters { display: grid; grid-template-columns: minmax(220px, 1.6fr) repeat(3, minmax(135px, 1fr)) minmax(150px, 1.1fr) auto auto; gap: 10px; align-items: center; min-width: 0; background: #fff; border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; padding: 12px 14px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .audit-input, .audit-select { box-sizing: border-box; width: 100%; min-width: 0; min-height: 40px; padding: 9px 11px; border-radius: 10px; border: 1px solid rgba(15,23,42,0.12); font: inherit; color: #182230; }
        .audit-search { grid-column: span 1; }
        .audit-reset { white-space: nowrap; }
        .audit-filter-count { justify-self: end; white-space: nowrap; }
        .audit-btn { padding: 9px 12px; border-radius: 10px; border: 1px solid rgba(15,23,42,0.12); background: #fff; font-weight: 700; cursor: pointer; }
        .audit-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
        .audit-table-wrap { max-width: 100%; background: #fff; border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; overflow-x: auto; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .audit-table { width: 100%; min-width: 1080px; table-layout: fixed; border-collapse: collapse; font-size: 0.82rem; }
        .audit-table th, .audit-table td { padding: 10px 12px; border-bottom: 1px solid rgba(15,23,42,0.06); text-align: left; vertical-align: top; }
        .audit-table th { background: #f8fafb; color: #475569; text-transform: uppercase; font-size: 0.68rem; letter-spacing: 0.06em; }
        .audit-table th:nth-child(1) { width: 18%; }
        .audit-table th:nth-child(2) { width: 16%; }
        .audit-table th:nth-child(3) { width: 13%; }
        .audit-table th:nth-child(4) { width: 13%; }
        .audit-table th:nth-child(5) { width: 14%; }
        .audit-table th:nth-child(6) { width: 10%; }
        .audit-table th:nth-child(7) { width: 9%; }
        .audit-table th:nth-child(8) { width: 7%; }
        .audit-section-all .audit-table th:nth-child(1) { width: 15%; }
        .audit-section-all .audit-table th:nth-child(2) { width: 19%; }
        .audit-table td { overflow-wrap: anywhere; }
        .audit-section-state .audit-table { min-width: 1040px; }
        .audit-section-state .audit-table th:nth-child(1) { width: 22%; }
        .audit-section-state .audit-table th:nth-child(2) { width: 14%; }
        .audit-section-state .audit-table th:nth-child(3) { width: 13%; }
        .audit-section-state .audit-table th:nth-child(4) { width: 12%; }
        .audit-section-state .audit-table th:nth-child(5) { width: 12%; }
        .audit-section-state .audit-table th:nth-child(6) { width: 8%; }
        .audit-section-state .audit-table th:nth-child(7) { width: 8%; }
        .audit-section-state .audit-table th:nth-child(8) { width: 11%; }
        .audit-section-state .audit-table th,
        .audit-section-state .audit-table td { padding: 10px; }
        .audit-section-state .audit-table td { vertical-align: middle; }
        .audit-section-state .audit-table th:nth-child(6),
        .audit-section-state .audit-table td:nth-child(6),
        .audit-section-state .audit-table th:nth-child(8),
        .audit-section-state .audit-table td:nth-child(8) { text-align: center; }
        .audit-section-state .audit-table td:nth-child(8) .audit-btn { min-width: 54px; }
        .audit-section-state .audit-user-email { color: #182230; font-size: 0.78rem; font-weight: 700; line-height: 1.4; overflow-wrap: anywhere; }
        .audit-section-state .audit-user-role { display: inline-block; margin-top: 4px; color: #667085; font-size: 0.68rem; text-transform: capitalize; }
        .audit-diff-row td { padding: 14px 18px !important; background: #f8fafc; text-align: left !important; }
        .audit-diff-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .audit-diff-block { min-width: 0; }
        .audit-diff-block .audit-meta { font-weight: 700; }
        .audit-diff-block .audit-pre { white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; }
        @container (max-width: 680px) {
          .audit-diff-details { grid-template-columns: minmax(0, 1fr); }
        }
        .audit-pill { display: inline-flex; padding: 4px 8px; border-radius: 999px; font-weight: 800; text-transform: uppercase; font-size: 0.68rem; letter-spacing: 0.04em; }
        .audit-pill.success { background: rgba(8,166,108,0.12); color: #08a66c; }
        .audit-pill.failure { background: rgba(239,68,68,0.12); color: #ef4444; }
        .audit-pill.denied { background: rgba(239,68,68,0.12); color: #b45309; }
        .audit-pill.warning { background: rgba(245,158,11,0.14); color: #b45309; }
        .audit-pre { max-width: 100%; margin: 6px 0 0; padding: 8px; background: #0f172a; color: #e2e8f0; border-radius: 8px; font-size: 0.72rem; overflow: auto; max-height: 200px; }
        .audit-meta { color: #667085; font-size: 0.78rem; }
        .audit-pager { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; min-width: 0; background: #fff; border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; padding: 10px 14px; }
        @container (max-width: 1120px) {
          .audit-filters { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .audit-search { grid-column: span 2; }
          .audit-filter-count { grid-column: 3; }
        }
        @container (max-width: 680px) {
          .audit-header { align-items: flex-start; flex-direction: column; }
          .audit-header-actions { justify-content: flex-start; width: 100%; }
          .audit-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .audit-search { grid-column: 1 / -1; }
          .audit-reset { justify-self: start; }
          .audit-filter-count { grid-column: auto; justify-self: end; }
        }
        @container (max-width: 420px) {
          .audit-filters { grid-template-columns: minmax(0, 1fr); }
          .audit-search, .audit-filter-count { grid-column: auto; }
          .audit-filter-count { justify-self: start; }
          .audit-pager { align-items: flex-start; flex-direction: column; }
        }
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
        </div>
        <div className="audit-header-actions">
          {onBack && (
            <button type="button" className="audit-btn" onClick={onBack}>← Back</button>
          )}
          <button type="button" className="audit-btn" disabled={exportDisabled} onClick={downloadCsv}>Export CSV</button>
        </div>
      </div>
      <div className="audit-filters">
        <input
          className="audit-input audit-search"
          placeholder="Search user, entity, action, ID, details"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
        <select
          className="audit-select"
          value={filters.action}
          onChange={(e) => updateFilters({ action: e.target.value as AuditLogFilters['action'] })}
        >
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>{a === 'all' ? 'All actions' : (AUDIT_ACTION_LABELS[a as keyof typeof AUDIT_ACTION_LABELS] ?? a)}</option>
          ))}
        </select>
        <select
          className="audit-select"
          value={filters.actorRole}
          onChange={(e) => updateFilters({ actorRole: e.target.value as AuditLogFilters['actorRole'] })}
        >
          <option value="all">All roles</option>
          {actorRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          className="audit-select"
          value={filters.outcome}
          onChange={(e) => updateFilters({ outcome: e.target.value as AuditLogFilters['outcome'] })}
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
          onChange={(e) => updateFilters({ date: e.target.value })}
        />
        <button
          type="button"
          className="audit-btn audit-reset"
          onClick={() => setFilters({ action: 'all', actorRole: 'all', outcome: 'all', page: 1, pageSize: 10, search: '', date: '' })}
        >
          Reset
        </button>
        <span className="audit-meta audit-filter-count">{rows.length} total</span>
      </div>
      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              {mode === 'state' ? <th>User</th> : <th>Timestamp</th>}
              {mode === 'state' ? <th>Timestamp</th> : <th>User</th>}
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
                <Fragment key={log.id}>
                  <tr>
                    {mode === 'state' ? (
                      <td>
                        <div className="audit-user-email">{log.actorEmail || log.actorName || log.actorId || '—'}</div>
                        <div className="audit-user-role">{String(log.actorRole || 'Unknown').replace(/-/g, ' ')}</div>
                      </td>
                    ) : (
                      <td>
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                        <div className="audit-meta">{log.id}</div>
                      </td>
                    )}
                    {mode === 'state' ? (
                      <td>
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                        <div className="audit-meta">{log.id}</div>
                      </td>
                    ) : (
                      <td>
                        <div>{log.actorEmail || log.actorId}</div>
                        <div className="audit-meta">{log.actorRole}</div>
                      </td>
                    )}
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
                    </td>
                  </tr>
                  {expanded[log.id] && (
                    <tr className="audit-diff-row">
                      <td colSpan={8}>
                        {log.previousValues || log.newValues ? (
                          <div className="audit-diff-details">
                            {log.previousValues && (
                              <div className="audit-diff-block">
                                <div className="audit-meta">Previous</div>
                                <pre className="audit-pre">{formatJson(log.previousValues)}</pre>
                              </div>
                            )}
                            {log.newValues && (
                              <div className="audit-diff-block">
                                <div className="audit-meta">New</div>
                                <pre className="audit-pre">{formatJson(log.newValues)}</pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="audit-meta">No diff available for this log.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
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
