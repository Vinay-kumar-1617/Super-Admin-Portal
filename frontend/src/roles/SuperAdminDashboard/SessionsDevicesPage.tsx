import { useState } from 'react'
import { type StaffAccount } from './staffData'

type SessionsDevicesPageProps = {
  staff: StaffAccount[]
  setStaff: React.Dispatch<React.SetStateAction<StaffAccount[]>>
  onBack?: () => void
  embedded?: boolean
}

export default function SessionsDevicesPage({ staff, setStaff, onBack, embedded = false }: SessionsDevicesPageProps) {
  const [notice, setNotice] = useState<string | null>(null)

  const updateAccount = (id: string, updates: Partial<StaffAccount>) => {
    setStaff((accounts) => accounts.map((account) => (account.id === id ? { ...account, ...updates } : account)))
  }

  const signOutAll = () => {
    const count = staff.filter((account) => account.active && account.sessionActive).length
    setStaff((accounts) => accounts.map((account) => (account.active && account.sessionActive ? { ...account, sessionActive: false, lastSeen: 'Just now' } : account)))
    setNotice(count > 0 ? `Signed out ${count} active ${count === 1 ? 'session' : 'sessions'} across all accounts.` : 'There are no active sessions to sign out.')
  }

  const signOut = (account: StaffAccount) => {
    updateAccount(account.id, { sessionActive: false, lastSeen: 'Just now' })
    setNotice(`Signed out ${account.name}.`)
  }

  const startSession = (account: StaffAccount) => {
    updateAccount(account.id, { sessionActive: true, lastSeen: 'Just now', sessionStartedAt: 'Just now' })
    setNotice(`Started a new session for ${account.name}.`)
  }

  const toggleMfa = (account: StaffAccount) => {
    updateAccount(account.id, { mfaRequired: !account.mfaRequired })
    setNotice(`MFA is now ${account.mfaRequired ? 'disabled' : 'required'} for ${account.name}.`)
  }

  const approveMfaReset = (account: StaffAccount) => {
    updateAccount(account.id, { mfaRequired: true, mfaResetRequested: false })
    setNotice(`Approved the MFA reset request for ${account.name} — a fresh enrolment is required.`)
  }

  const enforceMfaAll = () => {
    const count = staff.filter((account) => account.active && !account.mfaRequired).length
    setStaff((accounts) => accounts.map((account) => (account.active ? { ...account, mfaRequired: true } : account)))
    setNotice(count > 0 ? `MFA is now required for ${count} ${count === 1 ? 'account' : 'accounts'}.` : 'MFA is already required for every active account.')
  }

  const clearResetRequests = () => {
    const count = staff.filter((account) => account.mfaResetRequested).length
    setStaff((accounts) => accounts.map((account) => (account.mfaResetRequested ? { ...account, mfaResetRequested: false } : account)))
    setNotice(count > 0 ? `Dismissed ${count} pending MFA reset ${count === 1 ? 'request' : 'requests'}.` : 'There are no pending MFA reset requests.')
  }

  const activeSessions = staff.filter((account) => account.sessionActive).length
  const mfaEnforced = staff.filter((account) => account.mfaRequired).length
  const resetRequests = staff.filter((account) => account.mfaResetRequested).length
  const inactiveAccounts = staff.filter((account) => !account.active).length

  return (
    <section className="access-admin-page" aria-label="Sessions and devices">
      <style>{`
        .access-admin-page { display: grid; gap: 18px; min-width: 0; }
        .access-admin-header, .access-admin-panel, .access-admin-metric { background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 14px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .access-admin-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px 22px; border-left: 4px solid var(--brand-orange); }
        .access-admin-header h2 { margin: 4px 0 7px; font-size: 1.45rem; }
        .access-admin-header p { margin: 0; color: var(--muted); line-height: 1.5; max-width: 62ch; }
        .access-admin-kicker { display: inline-flex; align-items: center; gap: 6px; color: var(--brand-orange); font-size: 0.68rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
        .access-admin-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .access-admin-metric { display: grid; gap: 4px; padding: 14px 16px; }
        .access-admin-metric span { color: #64748b; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
        .access-admin-metric strong { color: #182230; font-size: 1.35rem; }
        .access-admin-panel { min-width: 0; overflow: hidden; }
        .access-admin-panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 16px 18px; border-bottom: 1px solid rgba(15,23,42,0.07); }
        .access-admin-panel-header h3 { margin: 0 0 5px; font-size: 1rem; }
        .access-admin-panel-header p { margin: 0; color: var(--muted); font-size: 0.78rem; }
        .access-admin-badge { display: inline-flex; padding: 4px 10px; border-radius: 999px; background: rgba(234,88,12,0.1); color: #c2410c; font-size: 0.68rem; font-weight: 800; }
        .access-admin-notice { margin: 0 18px 16px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(234,88,12,0.25); background: rgba(234,88,12,0.07); color: #9a3412; font-size: 0.76rem; font-weight: 700; }
        .access-admin-actions { display: flex; flex-wrap: wrap; gap: 10px; padding: 16px 18px; }
        .access-admin-button { min-height: 37px; border: 1px solid rgba(15,23,42,0.12); border-radius: 8px; padding: 8px 11px; background: #fff; color: #182230; font: inherit; font-size: 0.75rem; font-weight: 800; cursor: pointer; white-space: nowrap; }
        .access-admin-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .access-admin-button.primary { border-color: var(--brand-orange); background: var(--brand-orange); color: #fff; }
        .access-admin-button.danger { border-color: rgba(220,38,38,0.35); color: #b91c1c; }
        .access-admin-button.ghost:hover, .access-admin-button:not(:disabled):hover { border-color: rgba(15,23,42,0.28); }
        .access-admin-table-wrap { overflow-x: auto; padding: 0 16px 16px; }
        .access-admin-table { width: 100%; min-width: 980px; border-collapse: collapse; text-align: left; font-size: 0.76rem; }
        .access-admin-table th, .access-admin-table td { padding: 10px 9px; border-bottom: 1px solid rgba(15,23,42,0.07); vertical-align: middle; }
        .access-admin-table th { color: #64748b; font-size: 0.66rem; letter-spacing: 0.04em; text-transform: uppercase; }
        .access-admin-person { display: grid; gap: 3px; }
        .access-admin-person strong { color: #182230; }
        .access-admin-person span { color: var(--muted); font-size: 0.7rem; }
        .access-admin-pill { display: inline-flex; padding: 3px 9px; border-radius: 999px; background: rgba(15,23,42,0.06); color: #475569; font-size: 0.68rem; font-weight: 800; }
        .access-admin-state { display: inline-flex; align-items: center; gap: 6px; padding: 4px 9px; border-radius: 999px; background: rgba(8,166,108,0.1); color: #078653; font-size: 0.68rem; font-weight: 800; }
        .access-admin-state::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .access-admin-state.off { background: rgba(239,68,68,0.1); color: #b91c1c; }
        .access-admin-session { display: grid; gap: 3px; }
        .access-admin-session strong { color: #182230; font-size: 0.74rem; }
        .access-admin-session span { color: var(--muted); font-size: 0.68rem; }
        .access-admin-mfa { display: inline-flex; padding: 3px 9px; border-radius: 999px; background: rgba(8,166,108,0.1); color: #078653; font-size: 0.68rem; font-weight: 800; }
        .access-admin-mfa.off { background: rgba(15,23,42,0.06); color: #64748b; }
        .access-admin-mfa.request { background: rgba(234,88,12,0.12); color: #c2410c; }
        .access-admin-row-actions { display: inline-flex; flex-wrap: wrap; gap: 6px; }
        .access-admin-mini { border: 1px solid rgba(15,23,42,0.12); border-radius: 7px; padding: 6px 9px; background: #fff; color: #182230; font: inherit; font-size: 0.7rem; font-weight: 800; cursor: pointer; white-space: nowrap; }
        .access-admin-mini:hover { border-color: rgba(15,23,42,0.28); }
        .access-admin-mini.danger { border-color: rgba(220,38,38,0.3); color: #b91c1c; }
        .header-action { border: 1px solid rgba(15,23,42,0.12); border-radius: 10px; padding: 8px 10px; background: #fff; color: #182230; font: inherit; font-size: 0.75rem; font-weight: 800; cursor: pointer; }
      `}</style>

      {!embedded && (
        <header className="access-admin-header">
          <div>
            <span className="access-admin-kicker">Security</span>
            <h2>Sessions &amp; devices</h2>
          </div>
          {onBack ? (
            <button type="button" className="header-action" onClick={onBack}>
              Back to dashboard
            </button>
          ) : null}
        </header>
      )}

      <div className="access-admin-summary">
        <div className="access-admin-metric">
          <span>Active sessions</span>
          <strong>{activeSessions}</strong>
        </div>
        <div className="access-admin-metric">
          <span>MFA enforced</span>
          <strong>{mfaEnforced}</strong>
        </div>
        <div className="access-admin-metric">
          <span>Reset requests</span>
          <strong>{resetRequests}</strong>
        </div>
        <div className="access-admin-metric">
          <span>Accounts</span>
          <strong>{staff.length - inactiveAccounts}</strong>
        </div>
      </div>

      <section className="access-admin-panel" aria-label="Bulk session actions">
        <div className="access-admin-panel-header">
          <div>
            <h3>Bulk actions</h3>
            <p>Apply security controls across every account at once.</p>
          </div>
          {resetRequests > 0 ? <span className="access-admin-badge">{resetRequests} MFA {resetRequests === 1 ? 'request' : 'requests'}</span> : null}
        </div>
        <div className="access-admin-actions">
          <button type="button" className="access-admin-button danger" onClick={signOutAll} disabled={activeSessions === 0}>
            Sign out all sessions
          </button>
          <button type="button" className="access-admin-button" onClick={enforceMfaAll} disabled={mfaEnforced === staff.length - inactiveAccounts}>
            Enforce MFA everywhere
          </button>
          <button type="button" className="access-admin-button ghost" onClick={clearResetRequests} disabled={resetRequests === 0}>
            Dismiss reset requests
          </button>
        </div>
        {notice ? <p className="access-admin-notice" role="status">{notice}</p> : null}
      </section>

      <section className="access-admin-panel" aria-label="Per-account sessions and devices">
        <div className="access-admin-panel-header">
          <div>
            <h3>Per-account sessions</h3>
            <p>Sign an individual device out, start a fresh session or adjust MFA.</p>
          </div>
          <span className="access-admin-badge">{activeSessions} online</span>
        </div>
        <div className="access-admin-table-wrap">
          <table className="access-admin-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Session</th>
                <th>Device</th>
                <th>MFA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((account) => {
                const mfaTone = account.mfaResetRequested ? 'request' : account.mfaRequired ? '' : 'off'
                const mfaLabel = account.mfaResetRequested ? 'Reset requested' : account.mfaRequired ? 'Required' : 'Off'
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
                    <td>
                      <div className="access-admin-session">
                        <span className={`access-admin-state ${account.sessionActive ? '' : 'off'}`}>
                          {account.sessionActive ? 'Online' : 'Offline'}
                        </span>
                        <strong>{account.scope}</strong>
                        <span>
                          {account.sessionActive
                            ? `Started ${account.sessionStartedAt ?? 'recently'}`
                            : `Last seen ${account.lastSeen ?? 'a while ago'}`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="access-admin-session">
                        <strong>{account.device ?? 'No device on record'}</strong>
                        <span>{account.ipAddress ?? 'IP unavailable'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`access-admin-mfa ${mfaTone}`}>{mfaLabel}</span>
                    </td>
                    <td>
                      <div className="access-admin-row-actions">
                        {account.sessionActive ? (
                          <button type="button" className="access-admin-mini danger" onClick={() => signOut(account)}>
                            Sign out
                          </button>
                        ) : (
                          <button type="button" className="access-admin-mini" onClick={() => startSession(account)} disabled={!account.active}>
                            Start session
                          </button>
                        )}
                        {account.mfaResetRequested ? (
                          <button type="button" className="access-admin-mini" onClick={() => approveMfaReset(account)}>
                            Approve reset
                          </button>
                        ) : (
                          <button type="button" className="access-admin-mini" onClick={() => toggleMfa(account)}>
                            {account.mfaRequired ? 'Disable MFA' : 'Require MFA'}
                          </button>
                        )}
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
