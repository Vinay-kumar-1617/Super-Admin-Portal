import { stateApprovalLimits, stateProfile, formatRupees } from './stateAdminData'

const rulesStyles = `
  .st-rules-summary {
    display: grid;
    gap: 6px;
    padding: 16px 18px;
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-brand);
    border-radius: 14px;
    background: #fffaf3;
  }

  .st-rules-summary strong {
    color: var(--sa-text);
    font-size: 0.92rem;
  }

  .st-rules-summary p {
    margin: 0;
    color: #475569;
    font-size: 0.84rem;
    line-height: 1.55;
  }

  .st-rules-columns,
  .st-rules-limits {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .st-rules-card {
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--sa-line);
    border-radius: 14px;
    background: #fff;
  }

  .st-rules-card h4 {
    margin: 0 0 12px;
    color: var(--sa-text);
    font-size: 0.95rem;
    font-weight: 750;
  }

  .st-rules-list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .st-rules-list li {
    position: relative;
    padding-left: 18px;
    color: #475569;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .st-rules-list li::before {
    position: absolute;
    left: 0;
    color: var(--sa-green);
    content: '✓';
    font-weight: 800;
  }

  .st-rules-card-restricted .st-rules-list li::before {
    color: #b45309;
    content: '→';
  }

  .st-rules-limits-heading {
    margin: 0;
    color: var(--sa-text);
    font-size: 0.95rem;
    font-weight: 750;
  }

  .st-rules-limit {
    display: grid;
    align-content: start;
    gap: 6px;
    padding: 16px 18px;
    border: 1px solid var(--sa-line);
    border-radius: 14px;
    background: #fff;
  }

  .st-rules-limit span {
    color: #64748b;
    font-size: 0.78rem;
  }

  .st-rules-limit strong {
    color: var(--sa-text);
    font-size: 1.3rem;
    letter-spacing: -0.03em;
  }

  .st-rules-limit small {
    color: #64748b;
    font-size: 0.75rem;
    line-height: 1.45;
  }

  .st-rules-note {
    margin: 0;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f1f5f9;
    color: #475569;
    font-size: 0.78rem;
    line-height: 1.5;
  }

  @media (max-width: 720px) {
    .st-rules-columns,
    .st-rules-limits {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`

export default function RulesAndPermissionsSection() {
  const refundLimit = stateApprovalLimits['Refund / Adjustment'].amount ?? 0
  const operationalLimit = 200000

  return (
    <section className="sa-panel">
      <style>{rulesStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Rules &amp; permissions</h3>
          <span className="sa-panel-sub">A quick guide to your access and approval limits</span>
        </div>
      </div>

      <div className="st-rules-summary">
        <strong>Your access is limited to {stateProfile.name}</strong>
        <p>
          You can manage day-to-day work in your assigned state. Other states and platform-wide settings are managed by
          Super Admin. Restricted attempts are blocked and recorded.
        </p>
      </div>

      <div className="st-rules-columns">
        <section className="st-rules-card" aria-labelledby="state-admin-can-manage">
          <h4 id="state-admin-can-manage">You can manage</h4>
          <ul className="st-rules-list">
            <li>Cities, zones, users and operators within {stateProfile.name}.</li>
            <li>Bookings, rentals, fleet, dispatch, support and state reports.</li>
            <li>State-level approvals within the limits below.</li>
            <li>View and export data for your assigned state where available.</li>
          </ul>
        </section>

        <section className="st-rules-card st-rules-card-restricted" aria-labelledby="state-admin-needs-approval">
          <h4 id="state-admin-needs-approval">Needs Super Admin</h4>
          <ul className="st-rules-list">
            <li>Creating a new city or moving a zone between states.</li>
            <li>Creating or changing City Admin and Zone Admin appointments.</li>
            <li>Refunds or operational requests above your approval limits.</li>
            <li>Managing Super Admin accounts, global rates or platform settings.</li>
            <li>Accessing data or making changes outside {stateProfile.name}.</li>
          </ul>
        </section>
      </div>

      <h4 className="st-rules-limits-heading">Your approval limits</h4>
      <div className="st-rules-limits">
        <div className="st-rules-limit">
          <span>Refunds &amp; adjustments · per request</span>
          <strong>{formatRupees(refundLimit)}</strong>
          <small>Requests above this amount go to Super Admin.</small>
        </div>
        <div className="st-rules-limit">
          <span>Operational requests · per request</span>
          <strong>{formatRupees(operationalLimit)}</strong>
          <small>Requests above this amount go to Super Admin.</small>
        </div>
      </div>

      <p className="st-rules-note">
        Approvals, changes and blocked access attempts are recorded in the audit log.
      </p>
    </section>
  )
}
