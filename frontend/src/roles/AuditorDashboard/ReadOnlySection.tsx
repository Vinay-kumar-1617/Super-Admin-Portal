import { useState } from 'react'
import { StatusPill } from './shared'
import {
  maskEmail,
  maskPhone,
  type AccountRow,
  type CommissionHistoryRow,
  type FinanceRecord,
  type OperationsRecord,
  type PriceHistoryRow,
  type RoleScopeRow,
  type RuleHistoryRow,
} from './auditorData'

type ReadOnlyTab = 'accounts' | 'rules' | 'pricing' | 'finance' | 'operations'

const tabs: Array<{ id: ReadOnlyTab; label: string }> = [
  { id: 'accounts', label: 'Accounts & roles' },
  { id: 'rules', label: 'Rule history' },
  { id: 'pricing', label: 'Pricing & commission' },
  { id: 'finance', label: 'Settlements & payouts' },
  { id: 'operations', label: 'Operations' },
]

type ReadOnlySectionProps = {
  accounts: AccountRow[]
  roleScopes: RoleScopeRow[]
  ruleHistory: RuleHistoryRow[]
  priceHistory: PriceHistoryRow[]
  commissionHistory: CommissionHistoryRow[]
  financeRecords: FinanceRecord[]
  operationsRecords: OperationsRecord[]
  personalRevealed: boolean
  onSetPersonalRevealed: (value: boolean) => void
}

export default function ReadOnlySection({
  accounts,
  roleScopes,
  ruleHistory,
  priceHistory,
  commissionHistory,
  financeRecords,
  operationsRecords,
  personalRevealed,
  onSetPersonalRevealed,
}: ReadOnlySectionProps) {
  const [tab, setTab] = useState<ReadOnlyTab>('accounts')

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Read-only access</h3>
          <div className="sa-chip-row">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sa-chip ${tab === item.id ? 'active orange' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="sa-toolbar">
          <span className="sa-panel-sub">
            {personalRevealed
              ? 'Personal data is revealed. This reveal is written to the audit log.'
              : 'Personal data is masked by default. Revealing it is written to the audit log.'}
          </span>
          <button
            type="button"
            className="sa-btn-ghost"
            onClick={() => onSetPersonalRevealed(!personalRevealed)}
          >
            {personalRevealed ? 'Mask personal data' : 'Reveal personal data'}
          </button>
        </div>
      </section>

      {tab === 'accounts' && (
        <>
          <section className="sa-panel">
            <div className="sa-panel-header">
              <h3>Accounts, roles and scopes</h3>
              <span className="sa-panel-sub">View only · {accounts.length} accounts</span>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Role</th>
                    <th>Scope</th>
                    <th>Area</th>
                    <th>Approval limit</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th>Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">
                        {row.person}
                        <span className="sa-cell-sub">
                          {personalRevealed ? row.email : maskEmail(row.email)} · {personalRevealed ? row.phone : maskPhone(row.phone)}
                        </span>
                      </td>
                      <td>{row.role}</td>
                      <td>{row.scope}</td>
                      <td>{row.area}</td>
                      <td className="sa-num">{row.approvalLimit}</td>
                      <td>
                        <span className={`sa-pill ${row.accessLevel === 'Above role need' ? 'amber' : 'slate'}`}>{row.accessLevel}</span>
                      </td>
                      <td><StatusPill status={row.status} /></td>
                      <td>{row.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sa-panel">
            <div className="sa-panel-header">
              <h3>Role scopes and limits</h3>
              <span className="sa-panel-sub">What each role can do and its financial ceiling</span>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Scope</th>
                    <th>Members</th>
                    <th>Approval limit</th>
                    <th>Key permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {roleScopes.map((row) => (
                    <tr key={row.role}>
                      <td className="sa-cell-strong">{row.role}</td>
                      <td>{row.scope}</td>
                      <td className="sa-num">{row.members}</td>
                      <td className="sa-num">{row.approvalLimit}</td>
                      <td>{row.keyPermissions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === 'rules' && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Rule history</h3>
            <span className="sa-panel-sub">Global, state and city changes · who changed what</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Level</th>
                  <th>Area</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Changed by</th>
                  <th>Approved by</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {ruleHistory.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">
                      {row.rule}
                      <span className="sa-cell-sub">{row.id}</span>
                    </td>
                    <td><span className="sa-pill slate">{row.level}</span></td>
                    <td>{row.area}</td>
                    <td>{row.before}</td>
                    <td>{row.after}</td>
                    <td>{row.changedBy}</td>
                    <td>{row.approvedBy}</td>
                    <td>{row.changedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'pricing' && (
        <>
          <section className="sa-panel">
            <div className="sa-panel-header">
              <h3>Pricing history</h3>
              <span className="sa-panel-sub">Base rate changes by city</span>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>City</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Changed by</th>
                    <th>When</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.item}</td>
                      <td>{row.city}</td>
                      <td>{row.before}</td>
                      <td>{row.after}</td>
                      <td>{row.changedBy}</td>
                      <td>{row.changedOn}</td>
                      <td>{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sa-panel">
            <div className="sa-panel-header">
              <h3>Commission history</h3>
              <span className="sa-panel-sub">Partner commission rate changes</span>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>City</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Changed by</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionHistory.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.partner}</td>
                      <td>{row.city}</td>
                      <td>{row.before}</td>
                      <td>{row.after}</td>
                      <td>{row.changedBy}</td>
                      <td>{row.changedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === 'finance' && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Settlements, payouts, refunds & reconciliation</h3>
            <span className="sa-panel-sub">View only · who prepared and who approved each record</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Kind</th>
                  <th>Subject</th>
                  <th>Amount</th>
                  <th>Prepared by</th>
                  <th>Approved by</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {financeRecords.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">
                      {row.id}
                      <span className="sa-cell-sub">{row.city}, {row.state}</span>
                    </td>
                    <td>{row.kind}</td>
                    <td>{row.subject}</td>
                    <td className="sa-num">{row.amount}</td>
                    <td>
                      {row.preparedBy}
                      {row.preparedBy === row.approvedBy && <span className="aud-sensitive" title="Prepared and approved by same person">same person</span>}
                    </td>
                    <td>{row.approvedBy}</td>
                    <td><StatusPill status={row.status} /></td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'operations' && (
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Bookings, disputes, vehicles, drivers & compliance</h3>
            <span className="sa-panel-sub">View only · operational records behind the control checks</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Kind</th>
                  <th>Subject</th>
                  <th>Location</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {operationsRecords.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">{row.id}</td>
                    <td>{row.kind}</td>
                    <td>{row.subject}</td>
                    <td>{row.city}, {row.state}</td>
                    <td>{row.owner}</td>
                    <td><StatusPill status={row.status} /></td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
