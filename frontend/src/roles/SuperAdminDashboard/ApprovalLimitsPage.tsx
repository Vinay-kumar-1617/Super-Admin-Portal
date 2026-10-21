import { useState, type FormEvent } from 'react'
import { roleOptions, scopeOptions, type StaffAccount } from './staffData'

type ApprovalLimitsPageProps = {
  staff: StaffAccount[]
  setStaff: React.Dispatch<React.SetStateAction<StaffAccount[]>>
  onBack?: () => void
}

const defaultLimitForRole: Record<string, number> = {
  'Super Admin': 1000000,
  'State Admin': 250000,
  'City Admin': 100000,
  'Zone Admin': 50000,
  'Finance Admin': 500000,
  'Support Admin': 25000,
  Operator: 25000,
  Auditor: 0,
}

const formatLimit = (value: number) => `₹${Math.max(0, Math.round(value || 0)).toLocaleString('en-IN')}`

export default function ApprovalLimitsPage({ staff, setStaff, onBack }: ApprovalLimitsPageProps) {
  const [newLimit, setNewLimit] = useState(50000)
  const [targetRole, setTargetRole] = useState<string>(roleOptions[3])
  const [targetScope, setTargetScope] = useState<string>(scopeOptions[0])
  const [notice, setNotice] = useState<string | null>(null)

  const updateAccount = (id: string, updates: Partial<StaffAccount>) => {
    setStaff((accounts) => accounts.map((account) => (account.id === id ? { ...account, ...updates } : account)))
  }

  const bulkMatches = staff.filter(
    (account) => account.role === targetRole && account.scope === targetScope && account.active,
  ).length

  const applyBulk = (e: FormEvent) => {
    e.preventDefault()
    setStaff((accounts) =>
      accounts.map((account) => {
        if (account.role === targetRole && account.scope === targetScope && account.active) {
          return { ...account, approvalLimit: newLimit }
        }
        return account
      }),
    )
    setNotice(
      bulkMatches > 0
        ? `Updated the approval limit to ${formatLimit(newLimit)} for ${bulkMatches} matching ${bulkMatches === 1 ? 'account' : 'accounts'}.`
        : 'No active accounts match that role and scope — nothing was changed.',
    )
  }

  const resetAllToDefaults = () => {
    setStaff((accounts) =>
      accounts.map((account) => ({ ...account, approvalLimit: defaultLimitForRole[account.role] ?? account.approvalLimit })),
    )
    setNotice('Reset every account to its role default approval limit.')
  }

  const activeAccounts = staff.filter((account) => account.active).length
  const limitedAccounts = staff.filter((account) => account.approvalLimit > 0).length
  const totalLimit = staff.reduce((sum, account) => sum + account.approvalLimit, 0)
  const highestLimit = staff.reduce((max, account) => Math.max(max, account.approvalLimit), 0)

  return (
    <section className="access-admin-page" aria-label="Approval limits">
      <style>{`
        .access-admin-page { display: grid; gap: 18px; min-width: 0; }
        .access-admin-header, .access-admin-panel { background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 14px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .access-admin-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px 22px; border-left: 4px solid var(--brand-orange); }
        .access-admin-header h2 { margin: 4px 0 7px; font-size: 1.45rem; }
        .access-admin-header p { margin: 0; color: var(--muted); line-height: 1.5; max-width: 62ch; }
        .access-admin-kicker { display: inline-flex; align-items: center; gap: 6px; color: var(--brand-orange); font-size: 0.68rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
        .access-admin-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .access-admin-metric { display: grid; gap: 4px; padding: 14px 16px; background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 12px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .access-admin-metric span { color: #64748b; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
        .access-admin-metric strong { color: #182230; font-size: 1.35rem; }
        .access-admin-panel { min-width: 0; overflow: hidden; }
        .access-admin-panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 16px 18px; border-bottom: 1px solid rgba(15,23,42,0.07); }
        .access-admin-panel-header h3 { margin: 0 0 5px; font-size: 1rem; }
        .access-admin-panel-header p { margin: 0; color: var(--muted); font-size: 0.78rem; }
        .access-admin-panel-actions { display: inline-flex; align-items: center; gap: 8px; }
        .access-admin-badge { display: inline-flex; padding: 4px 10px; border-radius: 999px; background: rgba(234,88,12,0.1); color: #c2410c; font-size: 0.68rem; font-weight: 800; }
        .access-admin-notice { margin: 0 18px 16px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(234,88,12,0.25); background: rgba(234,88,12,0.07); color: #9a3412; font-size: 0.76rem; font-weight: 700; }
        .access-admin-form { display: grid; grid-template-columns: 1fr 1fr 1fr auto; align-items: end; gap: 10px; padding: 16px 18px; }
        .access-admin-field { display: grid; gap: 6px; min-width: 0; }
        .access-admin-field label { color: #64748b; font-size: 0.7rem; font-weight: 800; }
        .access-admin-field input, .access-admin-field select, .access-admin-table input { width: 100%; min-width: 100px; min-height: 37px; padding: 7px 9px; border: 1px solid rgba(15,23,42,0.14); border-radius: 8px; background: #fff; color: #182230; font: inherit; font-size: 0.78rem; }
        .access-admin-field input:focus, .access-admin-field select:focus, .access-admin-table input:focus { outline: 2px solid rgba(234,88,12,0.35); outline-offset: 1px; border-color: var(--brand-orange); }
        .access-admin-button { min-height: 37px; border: 1px solid rgba(15,23,42,0.12); border-radius: 8px; padding: 8px 11px; background: #fff; color: #182230; font: inherit; font-size: 0.75rem; font-weight: 800; cursor: pointer; white-space: nowrap; }
        .access-admin-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .access-admin-button.primary { border-color: var(--brand-orange); background: var(--brand-orange); color: #fff; }
        .access-admin-button.ghost:hover { border-color: rgba(15,23,42,0.28); }
        .access-admin-table-wrap { overflow-x: auto; padding: 0 16px 16px; }
        .access-admin-table { width: 100%; min-width: 900px; border-collapse: collapse; text-align: left; font-size: 0.76rem; }
        .access-admin-table th, .access-admin-table td { padding: 10px 9px; border-bottom: 1px solid rgba(15,23,42,0.07); vertical-align: middle; }
        .access-admin-table th { color: #64748b; font-size: 0.66rem; letter-spacing: 0.04em; text-transform: uppercase; }
        .access-admin-person { display: grid; gap: 3px; }
        .access-admin-person strong { color: #182230; }
        .access-admin-person span { color: var(--muted); font-size: 0.7rem; }
        .access-admin-pill { display: inline-flex; padding: 3px 9px; border-radius: 999px; background: rgba(15,23,42,0.06); color: #475569; font-size: 0.68rem; font-weight: 800; }
        .access-admin-state { display: inline-flex; padding: 4px 8px; border-radius: 999px; background: rgba(8,166,108,0.1); color: #078653; font-size: 0.68rem; font-weight: 800; }
        .access-admin-state.off { background: rgba(239,68,68,0.1); color: #b91c1c; }
        .access-admin-limit { display: grid; gap: 4px; min-width: 150px; }
        .access-admin-limit .access-admin-limit-meta { color: #64748b; font-size: 0.66rem; font-weight: 700; }
        .access-admin-limit .access-admin-limit-meta.default { color: #078653; }
        .access-admin-limit .access-admin-limit-meta.over { color: #b45309; }
        .access-admin-row-actions { display: inline-flex; gap: 6px; }
        .access-admin-mini { border: 1px solid rgba(15,23,42,0.12); border-radius: 7px; padding: 6px 9px; background: #fff; color: #182230; font: inherit; font-size: 0.7rem; font-weight: 800; cursor: pointer; }
        .access-admin-mini:hover { border-color: rgba(15,23,42,0.28); }
        .header-action { border: 1px solid rgba(15,23,42,0.12); border-radius: 10px; padding: 8px 10px; background: #fff; color: #182230; font: inherit; font-size: 0.75rem; font-weight: 800; cursor: pointer; }
      `}</style>

      <header className="access-admin-header">
        <div>
          <span className="access-admin-kicker">Governance</span>
          <h2>Approval limits</h2>
          <p>
            Set the maximum booking or payout value each account can approve without a second signature. Bulk changes apply
            instantly to active accounts; per-account overrides take effect immediately.
          </p>
        </div>
        {onBack ? (
          <button type="button" className="header-action" onClick={onBack}>
            Back to dashboard
          </button>
        ) : null}
      </header>

      <div className="access-admin-summary">
        <div className="access-admin-metric">
          <span>Active accounts</span>
          <strong>{activeAccounts}</strong>
        </div>
        <div className="access-admin-metric">
          <span>With a limit</span>
          <strong>{limitedAccounts}</strong>
        </div>
        <div className="access-admin-metric">
          <span>Highest limit</span>
          <strong>{formatLimit(highestLimit)}</strong>
        </div>
        <div className="access-admin-metric">
          <span>Total authority</span>
          <strong>{formatLimit(totalLimit)}</strong>
        </div>
      </div>

      <section className="access-admin-panel" aria-label="Bulk approval limit update">
        <div className="access-admin-panel-header">
          <div>
            <h3>Bulk update</h3>
            <p>Apply a new ceiling to every active account that matches a role and scope.</p>
          </div>
          <span className="access-admin-badge">
            {bulkMatches} {bulkMatches === 1 ? 'match' : 'matches'}
          </span>
        </div>
        <form className="access-admin-form" onSubmit={applyBulk}>
          <div className="access-admin-field">
            <label htmlFor="approval-role">Role</label>
            <select id="approval-role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="access-admin-field">
            <label htmlFor="approval-scope">Scope</label>
            <select id="approval-scope" value={targetScope} onChange={(e) => setTargetScope(e.target.value)}>
              {scopeOptions.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          </div>
          <div className="access-admin-field">
            <label htmlFor="approval-limit">New limit (₹)</label>
            <input
              id="approval-limit"
              type="number"
              min={0}
              step={1000}
              value={newLimit}
              onChange={(e) => setNewLimit(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
          <button type="submit" className="access-admin-button primary" disabled={bulkMatches === 0}>
            Apply to {bulkMatches}
          </button>
        </form>
        {notice ? <p className="access-admin-notice" role="status">{notice}</p> : null}
      </section>

      <section className="access-admin-panel" aria-label="Per-account approval limits">
        <div className="access-admin-panel-header">
          <div>
            <h3>Per-account limits</h3>
            <p>Fine-tune individual ceilings or reset everyone to their role default.</p>
          </div>
          <div className="access-admin-panel-actions">
            <button type="button" className="access-admin-button ghost" onClick={resetAllToDefaults}>
              Reset all to defaults
            </button>
          </div>
        </div>
        <div className="access-admin-table-wrap">
          <table className="access-admin-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Approval limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((account) => {
                const fallback = defaultLimitForRole[account.role] ?? account.approvalLimit
                const delta = account.approvalLimit - fallback
                const metaTone = delta === 0 ? 'default' : delta > 0 ? 'over' : ''
                return (
                  <tr key={account.id}>
                    <td>
                      <div className="access-admin-person">
                        <strong>{account.name}</strong>
                        <span>
                          {account.email} · {account.id}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="access-admin-pill">{account.role}</span>
                    </td>
                    <td>{account.scope}</td>
                    <td>
                      <span className={`access-admin-state ${account.active ? '' : 'off'}`}>
                        {account.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="access-admin-limit">
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          aria-label={`Approval limit for ${account.name}`}
                          value={account.approvalLimit}
                          onChange={(e) => updateAccount(account.id, { approvalLimit: Math.max(0, Number(e.target.value) || 0) })}
                        />
                        <span className={`access-admin-limit-meta ${metaTone}`}>
                          {delta === 0
                            ? `Role default · ${formatLimit(fallback)}`
                            : delta > 0
                              ? `${formatLimit(delta)} above default`
                              : `${formatLimit(Math.abs(delta))} below default`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="access-admin-row-actions">
                        <button
                          type="button"
                          className="access-admin-mini"
                          onClick={() => updateAccount(account.id, { approvalLimit: Math.round(account.approvalLimit * 1.5) })}
                        >
                          +50%
                        </button>
                        <button
                          type="button"
                          className="access-admin-mini"
                          onClick={() => updateAccount(account.id, { approvalLimit: fallback })}
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
