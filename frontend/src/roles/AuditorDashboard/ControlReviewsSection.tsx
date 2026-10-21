import { ResultPill, SeverityPill, StatusPill } from './shared'
import {
  accessReviewRows,
  limitChecks,
  overrideRows,
  patternChecks,
  sodChecks,
  type AccessReviewRow,
  type AuditEvent,
  type FindingDraft,
  type PatternCheck,
  type SodCheck,
} from './auditorData'

type ControlReviewsSectionProps = {
  superAdminEvents: AuditEvent[]
  raisedControls: string[]
  reviewedOverrides: string[]
  onRaise: (key: string, draft: FindingDraft) => void
  onReviewOverride: (id: string) => void
}

const severityForSod = (row: SodCheck): FindingDraft => ({
  title: `Separation-of-duties: ${row.process}`,
  detail: `${row.person} carried out both steps. ${row.preparedOn} → ${row.approvedOn}${row.amount !== '—' ? ` · ${row.amount}` : ''}.`,
  area: 'Finance',
  severity: row.severity,
  evidence: [row.id, row.preparedOn.split(' · ')[0]],
})

const severityForPattern = (row: PatternCheck): FindingDraft => ({
  title: `Pattern: ${row.pattern}`,
  detail: `${row.detail} Signal count: ${row.signalCount}.`,
  area: row.area,
  severity: row.severity,
  evidence: [row.id],
})

const severityForAccess = (row: AccessReviewRow): FindingDraft => ({
  title: `Access review: ${row.person} — ${row.issue}`,
  detail: `${row.detail} Role ${row.role}, scope ${row.scope}, last active ${row.lastActive}.`,
  area: 'Access',
  severity: row.issue === 'Former staff still active' ? 'High' : 'Medium',
  evidence: [row.id],
})

export default function ControlReviewsSection({
  superAdminEvents,
  raisedControls,
  reviewedOverrides,
  onRaise,
  onReviewOverride,
}: ControlReviewsSectionProps) {
  const raise = (key: string, draft: FindingDraft) => {
    if (raisedControls.includes(key)) return
    onRaise(key, draft)
  }

  return (
    <>
      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Separation-of-duties checks</h3>
            <span className="sa-panel-sub">Same person preparing and approving, or deciding and paying</span>
          </div>
          <div className="sa-approval-list">
            {sodChecks.map((row) => {
              const key = `sod-${row.id}`
              return (
                <article key={row.id} className="sa-approval-item">
                  <div className="sa-approval-copy">
                    <div className="sa-approval-tags">
                      <span className="sa-approval-id">{row.id}</span>
                      <SeverityPill severity={row.severity} />
                      <StatusPill status={row.status} />
                    </div>
                    <strong>{row.process}</strong>
                    <p>
                      {row.person} · prepared {row.preparedOn} · approved {row.approvedOn}
                      {row.amount !== '—' ? ` · ${row.amount}` : ''}
                    </p>
                  </div>
                  <div className="sa-approval-actions">
                    <button
                      type="button"
                      className="sa-btn approve"
                      disabled={raisedControls.includes(key)}
                      onClick={() => raise(key, severityForSod(row))}
                    >
                      {raisedControls.includes(key) ? 'Finding raised' : 'Raise finding'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Approval-limit checks</h3>
            <span className="sa-panel-sub">Payouts, refunds and claims near or above their limits</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Amount</th>
                  <th>Limit</th>
                  <th>Utilisation</th>
                  <th>Approved by</th>
                </tr>
              </thead>
              <tbody>
                {limitChecks.map((row) => (
                  <tr key={row.id}>
                    <td className="sa-cell-strong">
                      {row.subject}
                      <span className="sa-cell-sub">{row.kind} · {row.date}</span>
                    </td>
                    <td className="sa-num">{row.amount}</td>
                    <td className="sa-num">{row.limit}</td>
                    <td>
                      <span className="sa-progress-cell">
                        <span className={`sa-progress ${row.utilisation >= 95 ? 'aud-progress-hot' : ''}`}>
                          <span style={{ width: `${Math.min(row.utilisation, 100)}%` }} />
                        </span>
                        <span>{row.utilisation}%</span>
                      </span>
                    </td>
                    <td>{row.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Pattern checks</h3>
          <span className="sa-panel-sub">Refunds under the cap, repeated overrides, manual-assignment concentration</span>
        </div>
        <div className="sa-approval-list">
          {patternChecks.map((row) => {
            const key = `pat-${row.id}`
            return (
              <article key={row.id} className="sa-approval-item">
                <div className="sa-approval-copy">
                  <div className="sa-approval-tags">
                    <span className="sa-approval-id">{row.id}</span>
                    <span className="sa-pill slate">{row.area}</span>
                    <SeverityPill severity={row.severity} />
                    <span className="sa-pill blue">{row.signalCount} signals</span>
                  </div>
                  <strong>{row.pattern}</strong>
                  <p>{row.detail}</p>
                </div>
                <div className="sa-approval-actions">
                  <button
                    type="button"
                    className="sa-btn approve"
                    disabled={raisedControls.includes(key)}
                    onClick={() => raise(key, severityForPattern(row))}
                  >
                    {raisedControls.includes(key) ? 'Finding raised' : 'Raise finding'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Super admin activity review</h3>
          <span className="sa-panel-sub">{superAdminEvents.length} privileged actions in the period</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Super admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {superAdminEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.time}</td>
                  <td className="sa-cell-strong">{event.actor}</td>
                  <td>{event.action}</td>
                  <td>
                    {event.target}
                    {event.amount && <span className="sa-cell-sub">{event.amount}</span>}
                  </td>
                  <td><ResultPill result={event.result} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Access reviews</h3>
            <span className="sa-panel-sub">Dormant accounts, excess access, former staff still active</span>
          </div>
          <div className="sa-approval-list">
            {accessReviewRows.map((row) => {
              const key = `ar-${row.id}`
              return (
                <article key={row.id} className="sa-approval-item">
                  <div className="sa-approval-copy">
                    <div className="sa-approval-tags">
                      <span className="sa-approval-id">{row.id}</span>
                      <span className="sa-pill amber">{row.issue}</span>
                    </div>
                    <strong>{row.person} · {row.role} · {row.scope}</strong>
                    <p>{row.detail}</p>
                    <span className="sa-approval-meta">Last active {row.lastActive}</span>
                  </div>
                  <div className="sa-approval-actions">
                    <button
                      type="button"
                      className="sa-btn approve"
                      disabled={raisedControls.includes(key)}
                      onClick={() => raise(key, severityForAccess(row))}
                    >
                      {raisedControls.includes(key) ? 'Finding raised' : 'Raise finding'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Override review</h3>
            <span className="sa-panel-sub">Compliance and other overrides and who authorised them</span>
          </div>
          <div className="sa-approval-list">
            {overrideRows.map((row) => {
              const reviewed = row.reviewed || reviewedOverrides.includes(row.id)
              return (
                <article key={row.id} className="sa-approval-item">
                  <div className="sa-approval-copy">
                    <div className="sa-approval-tags">
                      <span className="sa-approval-id">{row.id}</span>
                      <span className="sa-pill blue">{row.kind}</span>
                      <span className={`sa-pill ${reviewed ? 'green' : 'amber'}`}>{reviewed ? 'Reviewed' : 'Not reviewed'}</span>
                    </div>
                    <strong>{row.subject}</strong>
                    <p>{row.reason}</p>
                    <span className="sa-approval-meta">Authorised by {row.authorisedBy} · {row.date}</span>
                  </div>
                  <div className="sa-approval-actions">
                    <button
                      type="button"
                      className="sa-btn-ghost"
                      disabled={reviewed}
                      onClick={() => onReviewOverride(row.id)}
                    >
                      {reviewed ? 'Reviewed' : 'Mark reviewed'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
