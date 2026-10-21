import { useMemo, useState } from 'react'
import { StatCards, type StatCard } from '../CityAdminDashboard/shared'
import { opsProfile } from './operationsData'
import {
  opsEscalationProcedures,
  opsPermissions,
  opsRestrictions,
  opsZoneScope,
  type PermissionEffect,
  type RolePermission,
} from './opsRulesData'

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`

const scopeTone: Record<string, string> = {
  read: 'blue',
  write: 'brand',
  approve: 'green',
  escalate: 'orange',
}

const scopeLabel: Record<string, string> = {
  read: 'Read',
  write: 'Write',
  approve: 'Approve',
  escalate: 'Escalate',
}

const rulesStyles = `
  .ops-rules-lock {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 12px;
    padding: 12px 16px;
    border-radius: 14px;
    border: 1px solid var(--sa-line);
    background: #f4f6f8;
    color: var(--sa-muted);
    font-size: 0.8rem;
    line-height: 1.6;
  }
  .ops-rules-lock.editable {
    border-color: rgba(8, 166, 108, 0.35);
    background: var(--sa-green-soft);
    color: var(--sa-green);
  }
  .ops-rules-lock strong {
    display: block;
    color: var(--sa-text);
    font-size: 0.84rem;
    margin-bottom: 2px;
  }
  .ops-rules-lock.editable strong {
    color: var(--sa-green);
  }
  .ops-rules-lock svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .ops-rules-lock code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.74rem;
    background: #eef2f5;
    color: #334155;
    padding: 1px 6px;
    border-radius: 6px;
  }

  .ops-rules-scope {
    margin-top: 18px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }
  .ops-rules-scope-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    background: #fbfcfd;
  }
  .ops-rules-scope-head h4 {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
  }
  .ops-rules-scope-head p {
    margin: 4px 0 0;
    font-size: 0.76rem;
    color: var(--sa-muted);
  }
  .ops-rules-scope-path {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .ops-rules-scope-path span {
    padding: 4px 10px;
    border-radius: 999px;
    background: #f3f6f7;
    color: var(--sa-muted);
  }
  .ops-rules-scope-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ops-rules-scope-col {
    padding: 16px 18px;
    display: grid;
    gap: 10px;
    align-content: start;
  }
  .ops-rules-scope-col + .ops-rules-scope-col {
    border-left: 1px solid rgba(15, 23, 42, 0.06);
  }
  .ops-rules-scope-col h5 {
    margin: 0;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--sa-muted);
  }
  .ops-rules-scope-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
  }
  .ops-rules-scope-list li {
    display: flex;
    gap: 8px;
    font-size: 0.8rem;
    line-height: 1.55;
    color: #475569;
  }
  .ops-rules-scope-list li::before {
    content: '✓';
    color: var(--sa-green);
    font-weight: 800;
    flex-shrink: 0;
  }
  .ops-rules-scope-list.blocked li::before {
    content: '✕';
    color: #b91c1c;
  }

  .ops-rules-table-wrap {
    margin-top: 18px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }
  .ops-rules-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 880px;
    font-size: 0.82rem;
  }
  .ops-rules-table th {
    text-align: left;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sa-muted);
    padding: 12px 18px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: #fbfcfd;
    white-space: nowrap;
  }
  .ops-rules-table td {
    padding: 13px 18px;
    vertical-align: top;
    color: var(--sa-text);
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  }
  .ops-rules-table tr:last-child td { border-bottom: 0; }
  .ops-rules-table tr:hover td { background: #f8fafc; }
  .ops-rules-table tr.denied td { background: #fffafa; }
  .ops-rules-table tr.denied:hover td { background: #fff5f5; }
  .ops-rules-perm {
    display: grid;
    gap: 3px;
  }
  .ops-rules-perm strong { font-weight: 800; }
  .ops-rules-perm span {
    font-size: 0.74rem;
    color: var(--sa-muted);
  }
  .ops-rules-note {
    font-size: 0.78rem;
    color: #475569;
    line-height: 1.55;
    white-space: normal;
  }
  .ops-rules-limits {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    margin-top: 18px;
  }
  .ops-rules-limit {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 6px;
  }
  .ops-rules-limit-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--sa-muted);
  }
  .ops-rules-limit-value {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--sa-text);
  }
  .ops-rules-limit span {
    font-size: 0.78rem;
    color: #64748b;
    line-height: 1.55;
  }
  .ops-rules-restrictions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
    margin-top: 18px;
  }
  .ops-rules-restriction {
    border: 1px solid var(--sa-line);
    border-left: 3px solid var(--sa-red);
    border-radius: 14px;
    padding: 14px 16px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 6px;
  }
  .ops-rules-restriction strong {
    font-size: 0.88rem;
    color: var(--sa-text);
  }
  .ops-rules-restriction p {
    margin: 0;
    font-size: 0.8rem;
    color: #475569;
    line-height: 1.6;
  }
  .ops-rules-restriction span {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #b91c1c;
  }
  .ops-rules-edit {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .ops-rules-edit select,
  .ops-rules-edit input {
    padding: 7px 10px;
    border-radius: 9px;
    border: 1px solid var(--sa-line);
    background: #fff;
    font: inherit;
    font-size: 0.78rem;
  }
  .ops-rules-edit input { width: 120px; }
  .ops-rules-enforcement {
    margin-top: 18px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 20px;
    background: #fbfcfd;
    display: grid;
    gap: 8px;
  }
  .ops-rules-enforcement h4 {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .ops-rules-enforcement p {
    margin: 0;
    font-size: 0.8rem;
    color: #475569;
    line-height: 1.6;
  }
  .ops-rules-enforcement code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.74rem;
    background: #eef2f5;
    color: #334155;
    padding: 1px 6px;
    border-radius: 6px;
  }

  @media (max-width: 860px) {
    .ops-rules-scope-grid { grid-template-columns: 1fr; }
    .ops-rules-scope-col + .ops-rules-scope-col {
      border-left: 0;
      border-top: 1px solid rgba(15, 23, 42, 0.06);
    }
  }
`

type RulesAndPermissionsSectionProps = {
  /**
   * Editing is locked unless an authorised administrator has granted the
   * `permission.manage` permission to this account.
   */
  canEdit?: boolean
  onToast?: (message: string) => void
}

type EditState = {
  effect: PermissionEffect
  approvalLimit: string
}

export default function RulesAndPermissionsSection({ canEdit = false, onToast }: RulesAndPermissionsSectionProps) {
  const [permissions, setPermissions] = useState<RolePermission[]>(opsPermissions)
  const [draft, setDraft] = useState<Record<string, EditState>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const cards: StatCard[] = useMemo(() => {
    const granted = permissions.filter((permission) => permission.effect === 'allow').length
    const denied = permissions.filter((permission) => permission.effect === 'deny').length
    const limits = permissions.filter((permission) => permission.approvalLimit !== null).length
    return [
      { key: 'granted', label: 'Permissions granted', value: granted, tone: 'green', sub: `${denied} denied by default` },
      { key: 'writes', label: 'Write actions', value: permissions.filter((p) => p.scope === 'write').length, tone: 'blue' },
      { key: 'limits', label: 'Approval limits', value: limits, tone: 'amber', sub: 'Amount ceilings' },
      { key: 'escalations', label: 'Escalation paths', value: opsEscalationProcedures.length, tone: 'red', sub: 'With SLAs' },
    ]
  }, [permissions])

  const limited = useMemo(
    () => permissions.filter((permission) => permission.approvalLimit !== null),
    [permissions],
  )

  const startEdit = (permission: RolePermission) => {
    setDraft((prev) => ({
      ...prev,
      [permission.key]: {
        effect: permission.effect,
        approvalLimit: permission.approvalLimit === null ? '' : String(permission.approvalLimit),
      },
    }))
  }

  const save = (permission: RolePermission) => {
    const edit = draft[permission.key]
    if (!edit) return
    const limit = edit.approvalLimit.trim() === '' ? null : Number(edit.approvalLimit)
    setSavingKey(permission.key)
    setPermissions((prev) =>
      prev.map((item) =>
        item.key === permission.key ? { ...item, effect: edit.effect, approvalLimit: limit } : item,
      ),
    )
    setDraft((prev) => {
      const next = { ...prev }
      delete next[permission.key]
      return next
    })
    setSavingKey(null)
    onToast?.(`Permission updated · ${permission.label} — recorded in the audit trail`)
  }

  return (
    <section className="sa-panel">
      <style>{rulesStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Rules &amp; permissions</h3>
          <span className="sa-panel-sub">
            Your assigned permissions, scope, restrictions, approval limits and escalation paths for the {opsProfile.zone} zone
          </span>
        </div>
        <div className="finance-header-controls">
          <span className={`sa-pill ${canEdit ? 'green' : 'slate'}`}>{canEdit ? 'Editing unlocked' : 'Read-only'}</span>
        </div>
      </div>

      <div className={`ops-rules-lock ${canEdit ? 'editable' : ''}`}>
        {canEdit ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            </svg>
            <div>
              <strong>Editing unlocked by an administrator.</strong>
              Your account was granted the <code>permission.manage</code> permission. Every change is written to the audit
              trail with your name, the previous value and your reason.
            </div>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div>
              <strong>Read-only. These permissions cannot be changed from this screen.</strong>
              The rules below are enforced on every request. Editing is unlocked only when a Super Admin grants your account
              the <code>permission.manage</code> permission.
            </div>
          </>
        )}
      </div>

      <StatCards cards={cards} />

      <div className="ops-rules-scope">
        <div className="ops-rules-scope-head">
          <div>
            <h4>Zone scope</h4>
            <p>The data this account can reach, and the data the server keeps out of reach.</p>
          </div>
          <div className="ops-rules-scope-path">
            <span>{opsZoneScope.state}</span> / <span>{opsZoneScope.city}</span> / <span>{opsZoneScope.zone}</span>
          </div>
        </div>
        <div className="ops-rules-scope-grid">
          <div className="ops-rules-scope-col">
            <h5>Visible to you</h5>
            <ul className="ops-rules-scope-list">
              {opsZoneScope.visible.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="ops-rules-scope-col">
            <h5>Blocked by the server</h5>
            <ul className="ops-rules-scope-list blocked">
              {opsZoneScope.hidden.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="ops-rules-table-wrap">
        <table className="ops-rules-table" role="grid" aria-label="Operations Manager permissions by module">
          <thead>
            <tr>
              <th>Permission</th>
              <th>Module</th>
              <th>Scope</th>
              <th style={{ textAlign: 'center' }}>Approval limit</th>
              <th>Rules</th>
              <th>Restricted</th>
              {canEdit && <th aria-label="Edit" />}
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.key} className={permission.effect === 'deny' ? 'denied' : undefined}>
                <td>
                  <div className="ops-rules-perm">
                    <strong>{permission.label}</strong>
                    <span>{permission.key}</span>
                  </div>
                </td>
                <td className="sa-cell-strong">{permission.module}</td>
                <td>
                  <span className={`sa-pill ${scopeTone[permission.scope] ?? 'slate'}`}>
                    {scopeLabel[permission.scope] ?? permission.scope}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {permission.approvalLimit === null ? (
                    <span className="sa-pill slate">None</span>
                  ) : (
                    <span className="sa-pill amber">{inr(permission.approvalLimit)}</span>
                  )}
                </td>
                <td className="ops-rules-note">
                  {permission.description}
                  <br />
                  {permission.requiresReason && <span className="sa-pill blue">Reason required</span>}{' '}
                  {permission.requiresAudit && <span className="sa-pill slate">Audited</span>}
                </td>
                <td className="ops-rules-note">
                  {permission.effect === 'deny' ? (
                    <span className="sa-pill red">Denied</span>
                  ) : (
                    <span className="sa-pill green">Allowed</span>
                  )}
                  <br />
                  {permission.restrictedNote}
                  {permission.escalationTarget && (
                    <>
                      <br />
                      <span style={{ fontSize: '0.74rem', color: 'var(--sa-muted)' }}>
                        Escalate to {permission.escalationTarget}
                      </span>
                    </>
                  )}
                </td>
                {canEdit && (
                  <td>
                    <div className="ops-rules-edit">
                      <select
                        aria-label={`Effect for ${permission.label}`}
                        value={draft[permission.key]?.effect ?? permission.effect}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            [permission.key]: {
                              effect: event.target.value as PermissionEffect,
                              approvalLimit:
                                prev[permission.key]?.approvalLimit ??
                                (permission.approvalLimit === null ? '' : String(permission.approvalLimit)),
                            },
                          }))
                        }
                      >
                        <option value="allow">Allow</option>
                        <option value="deny">Deny</option>
                      </select>
                      <input
                        aria-label={`Approval limit for ${permission.label}`}
                        placeholder="Limit"
                        value={
                          draft[permission.key]?.approvalLimit ??
                          (permission.approvalLimit === null ? '' : String(permission.approvalLimit))
                        }
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            [permission.key]: {
                              effect: prev[permission.key]?.effect ?? permission.effect,
                              approvalLimit: event.target.value,
                            },
                          }))
                        }
                      />
                      <button
                        type="button"
                        className="sa-btn-ghost"
                        onClick={() => (draft[permission.key] ? save(permission) : startEdit(permission))}
                        disabled={savingKey === permission.key}
                      >
                        {savingKey === permission.key ? 'Saving…' : draft[permission.key] ? 'Save' : 'Edit'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {limited.length > 0 && (
        <div className="ops-rules-limits">
          {limited.map((permission) => (
            <div key={permission.key} className="ops-rules-limit">
              <span className="ops-rules-limit-label">{permission.module}</span>
              <span className="ops-rules-limit-value">{inr(permission.approvalLimit ?? 0)}</span>
              <span>
                {permission.label} — above this the request is refused and must be escalated to{' '}
                {permission.escalationTarget || 'the City Admin'}.
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="ops-rules-restrictions">
        {opsRestrictions.map((restriction) => (
          <div key={restriction.id} className="ops-rules-restriction">
            <span>{restriction.owner}</span>
            <strong>{restriction.title}</strong>
            <p>{restriction.detail}</p>
          </div>
        ))}
      </div>

      <div className="ops-rules-table-wrap">
        <table className="ops-rules-table" role="grid" aria-label="Escalation procedures">
          <thead>
            <tr>
              <th>Trigger</th>
              <th>Escalate to</th>
              <th style={{ textAlign: 'center' }}>Response SLA</th>
              <th>Required information</th>
            </tr>
          </thead>
          <tbody>
            {opsEscalationProcedures.map((procedure) => (
              <tr key={procedure.id}>
                <td className="sa-cell-strong">{procedure.trigger}</td>
                <td>
                  <span className="sa-pill orange">{procedure.target}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="sa-pill slate">{procedure.sla}</span>
                </td>
                <td className="ops-rules-note">{procedure.requires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ops-rules-enforcement">
        <h4>Where these rules are enforced</h4>
        <p>
          This screen is a read-only view of the policy. The rules themselves are enforced on the server for every
          request: a permission check decides whether an action is allowed, the approval limits decide the ceiling, and
          anything outside them is refused and escalated. Permission rows can only be changed by a Super Admin, and every
          change — including a denied attempt — is written to the append-only audit trail.
        </p>
      </div>
    </section>
  )
}
