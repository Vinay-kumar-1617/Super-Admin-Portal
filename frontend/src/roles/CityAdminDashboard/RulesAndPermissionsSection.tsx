import { cityApprovalLimits, cityProfile, formatRupees } from './cityAdminData'

const rulesStyles = `
  .ca-rules-summary {
    display: grid;
    gap: 6px;
    padding: 16px 18px;
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-brand);
    border-radius: 14px;
    background: #fffaf3;
  }

  .ca-rules-summary strong {
    color: var(--sa-text);
    font-size: 0.92rem;
  }

  .ca-rules-summary p {
    margin: 0;
    color: #475569;
    font-size: 0.84rem;
    line-height: 1.55;
  }

  .ca-rules-columns,
  .ca-rules-limits {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .ca-rules-card {
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--sa-line);
    border-radius: 14px;
    background: #fff;
  }

  .ca-rules-card h4 {
    margin: 0 0 12px;
    color: var(--sa-text);
    font-size: 0.95rem;
    font-weight: 750;
  }

  .ca-rules-list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ca-rules-list li {
    position: relative;
    padding-left: 18px;
    color: #475569;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .ca-rules-list li::before {
    position: absolute;
    left: 0;
    color: var(--sa-green);
    content: '✓';
    font-weight: 800;
  }

  .ca-rules-card-restricted .ca-rules-list li::before {
    color: #b45309;
    content: '→';
  }

  .ca-rules-limits-heading {
    margin: 0;
    color: var(--sa-text);
    font-size: 0.95rem;
    font-weight: 750;
  }

  .ca-rules-limit {
    display: grid;
    align-content: start;
    gap: 6px;
    padding: 16px 18px;
    border: 1px solid var(--sa-line);
    border-radius: 14px;
    background: #fff;
  }

  .ca-rules-limit span {
    color: #64748b;
    font-size: 0.78rem;
  }

  .ca-rules-limit strong {
    color: var(--sa-text);
    font-size: 1.3rem;
    letter-spacing: -0.03em;
  }

  .ca-rules-limit small {
    color: #64748b;
    font-size: 0.75rem;
    line-height: 1.45;
  }

  .ca-rules-note {
    margin: 0;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f1f5f9;
    color: #475569;
    font-size: 0.78rem;
    line-height: 1.5;
  }

  @media (max-width: 720px) {
    .ca-rules-columns,
    .ca-rules-limits {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`

export default function RulesAndPermissionsSection() {
  const operationalLimit = cityApprovalLimits['Operational Request'].amount ?? 0
  const refundLimit = cityApprovalLimits['Refund / Adjustment'].amount ?? 0

  return (
    <section className="sa-panel">
      <style>{rulesStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Rules &amp; permissions</h3>
          <span className="sa-panel-sub">A quick guide to your access and approval limits</span>
        </div>
      </div>

      <div className="ca-rules-summary">
        <strong>Your access is limited to {cityProfile.name}</strong>
        <p>
          You can manage day-to-day work in your assigned city. Other cities and state-wide settings are managed by
          State Admin. Restricted attempts are blocked and recorded.
        </p>
      </div>

      <div className="ca-rules-columns">
        <section className="ca-rules-card" aria-labelledby="city-admin-can-manage">
          <h4 id="city-admin-can-manage">You can manage</h4>
          <ul className="ca-rules-list">
            <li>Zone operations, users and operators within {cityProfile.name}.</li>
            <li>Bookings, rentals, fleet, dispatch and support across your city.</li>
            <li>City-level approvals within the limits below.</li>
            <li>View and export data for your assigned city where available.</li>
          </ul>
        </section>

        <section className="ca-rules-card ca-rules-card-restricted" aria-labelledby="city-admin-needs-approval">
          <h4 id="city-admin-needs-approval">Needs State Admin</h4>
          <ul className="ca-rules-list">
            <li>Creating or deleting zones, or moving zones between cities.</li>
            <li>Operator applications and property verifications.</li>
            <li>Refunds or operational requests above your approval limits.</li>
            <li>State Admin accounts, city-wide rates and state-level payouts.</li>
            <li>Accessing data or making changes outside {cityProfile.name}.</li>
          </ul>
        </section>
      </div>

      <h4 className="ca-rules-limits-heading">Your approval limits</h4>
      <div className="ca-rules-limits">
        <div className="ca-rules-limit">
          <span>Operational requests · per request</span>
          <strong>{formatRupees(operationalLimit)}</strong>
          <small>Requests above this amount go to State Admin.</small>
        </div>
        <div className="ca-rules-limit">
          <span>Refunds &amp; adjustments · per request</span>
          <strong>{formatRupees(refundLimit)}</strong>
          <small>Requests above this amount go to State Admin.</small>
        </div>
      </div>

      <p className="ca-rules-note">
        Approvals, changes and blocked access attempts are recorded in the audit log.
      </p>
    </section>
  )
}
