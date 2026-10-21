import { zonePermissionLimits, zoneProfile } from './zoneAdminData'

type RuleCard = {
  id: string
  title: string
  icon: string
  body: string[]
  tone: 'brand' | 'green' | 'blue' | 'orange' | 'red' | 'slate'
}

const ruleCards: RuleCard[] = [
  {
    id: 'access',
    title: 'Access permissions',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
      </svg>
    `,
    body: [
      'You see only Madhapur zone data — localities, bookings, fleet, and operators assigned to this zone.',
      'Records from Hyderabad’s other zones and city/state-wide data are hidden from your view.',
      'Opening another zone’s record is blocked by the backend and logged in the audit trail.',
    ],
    tone: 'blue',
  },
  {
    id: 'update',
    title: 'Update permissions',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/>
      </svg>
    `,
    body: [
      'You may update only authorized fields: zone booking status, maintenance flags, operator badge status, and locality details.',
      'You cannot change city-wide rates, zone pricing structures, or records belonging to another zone.',
      'Field-level blocks are enforced by the backend, not just the UI.',
    ],
    tone: 'green',
  },
  {
    id: 'approvals',
    title: 'Approval limits',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="7"/>
        <path d="M8.21 13.82 7 23l-5-3 4-2 6 6 2-3Z"/>
      </svg>
    `,
    body: [
      `Maintenance approvals: up to ${zonePermissionLimits.maintenanceApproval}.`,
      `Refund approvals: up to ${zonePermissionLimits.refundApproval}.`,
      `Change requests: ${zonePermissionLimits.changeRequests}.`,
      'Requests above your limit are escalated to the City Admin — you cannot approve them yourself.',
    ],
    tone: 'orange',
  },
  {
    id: 'restricted',
    title: 'Restricted actions',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    `,
    body: [
      'Create or delete localities, add or remove fleet machines, and change city-wide rates.',
      'Approve maintenance or refunds above your delegated limit.',
      'Access or modify City Admin and State Admin accounts.',
      'View or edit data belonging to other zones.',
    ],
    tone: 'red',
  },
  {
    id: 'privacy',
    title: 'Data privacy',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    `,
    body: [
      'Zone data stays inside Madhapur — no export of city-wide customer or payment records.',
      'Customer contact details are visible only for zone bookings you handle.',
      'Sharing zone reports outside EquipHub requires City Admin approval.',
    ],
    tone: 'slate',
  },
  {
    id: 'audit',
    title: 'Audit requirements',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z"/>
      </svg>
    `,
    body: [
      'Every approval, rejection, and escalation is logged with actor, time, and zone.',
      'Access denials — cross-zone or admin-account attempts — are recorded in the audit trail.',
      'The Auditor and City Admin can review your zone’s log at any time.',
    ],
    tone: 'brand',
  },
  {
    id: 'security',
    title: 'Account security',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    `,
    body: [
      'Your account is scoped to the Madhapur zone only.',
      'You cannot log in as, impersonate, or reset passwords for City or State admin accounts.',
      'Session timeouts and MFA apply; report suspicious activity immediately.',
    ],
    tone: 'green',
  },
  {
    id: 'escalation',
    title: 'Escalation rules',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="12 2 12 22"/>
        <polyline points="5 12 12 15 19 12"/>
      </svg>
    `,
    body: [
      'Decisions above your limit, or affecting other zones, go to the City Admin (Praveen Kumar, Hyderabad).',
      'Escalations include the reason, zone context, and a link to the source record.',
      `${zonePermissionLimits.escalationSLA}. You are notified of the outcome.`,
    ],
    tone: 'brand',
  },
]

type PermissionRow = {
  module: string
  allowed: string
  restricted: string
  escalation: 'Yes' | 'No'
  escalationNote: string
}

const permissionRows: PermissionRow[] = [
  {
    module: 'Zone bookings',
    allowed: 'View, approve, and reject bookings inside Madhapur',
    restricted: 'Bookings in other zones; city-wide bulk actions',
    escalation: 'Yes',
    escalationNote: 'Overrides above your approval limit',
  },
  {
    module: 'Fleet & machines',
    allowed: 'View zone fleet, flag maintenance, schedule zone service',
    restricted: 'Add or remove machines; change city-wide rates',
    escalation: 'Yes',
    escalationNote: 'New fleet acquisition',
  },
  {
    module: 'Operators',
    allowed: 'Verify or suspend zone operators; review badges',
    restricted: 'Create operator accounts; cross-zone transfers',
    escalation: 'Yes',
    escalationNote: 'Cross-zone operator moves',
  },
  {
    module: 'Maintenance requests',
    allowed: `Approve maintenance up to ${zonePermissionLimits.maintenanceApproval}`,
    restricted: 'Approvals above your limit; vendor contracts',
    escalation: 'Yes',
    escalationNote: 'Above ₹50,000 per request',
  },
  {
    module: 'Refunds',
    allowed: `Process refunds up to ${zonePermissionLimits.refundApproval}`,
    restricted: 'Refunds above your limit; surcharge reversals',
    escalation: 'Yes',
    escalationNote: 'Above ₹25,000 per request',
  },
  {
    module: 'User management',
    allowed: 'Manage zone staff accounts',
    restricted: "Other zones' users; City and State admin accounts",
    escalation: 'No',
    escalationNote: 'Hard boundary — never permitted',
  },
  {
    module: 'Localities',
    allowed: 'Update zone locality details',
    restricted: 'Create or delete localities',
    escalation: 'Yes',
    escalationNote: 'New locality creation',
  },
  {
    module: 'Payments',
    allowed: 'View zone transactions',
    restricted: 'Payouts and settlements',
    escalation: 'Yes',
    escalationNote: 'Payouts go to City Admin',
  },
]

const rulesStyles = `
  .za-rules-intro {
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-brand);
    border-radius: 16px;
    padding: 16px 20px;
    background: #fffaf3;
    display: grid;
    gap: 8px;
  }
  .za-rules-intro strong {
    font-size: 0.9rem;
    color: var(--sa-brand-deep);
  }
  .za-rules-intro p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .za-rules-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 2px;
  }
  .za-rule-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 12px;
  }
  .za-rule-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .za-rule-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #f3f6f7;
    flex-shrink: 0;
  }
  .za-rule-icon svg {
    width: 18px;
    height: 18px;
  }
  .za-rule-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
  }
  .za-rule-body {
    margin: 0;
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    display: grid;
    gap: 7px;
  }
  .za-rule-body p {
    margin: 0;
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    padding-left: 16px;
    position: relative;
  }
  .za-rule-body p::before {
    content: '–';
    position: absolute;
    left: 0;
    top: 1px;
    color: var(--sa-muted);
    font-weight: 800;
  }
  .za-rule-tag {
    width: fit-content;
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border-radius: 999px;
    align-self: start;
  }
  .za-rule-tag.brand { background: rgba(255, 107, 44, 0.12); color: var(--sa-brand-deep); }
  .za-rule-tag.green { background: var(--sa-green-soft); color: var(--sa-green); }
  .za-rule-tag.blue { background: var(--sa-blue-soft); color: #1d4ed8; }
  .za-rule-tag.orange { background: var(--sa-orange-soft); color: #b45309; }
  .za-rule-tag.red { background: var(--sa-red-soft); color: #b91c1c; }
  .za-rule-tag.slate { background: #eef2f5; color: #64748b; }

  .za-permissions {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    margin-top: 20px;
  }
  .za-permissions table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
    font-size: 0.84rem;
  }
  .za-permissions th {
    text-align: left;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sa-muted);
    padding: 14px 18px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: #fbfcfd;
    white-space: nowrap;
  }
  .za-permissions td {
    padding: 13px 18px;
    vertical-align: middle;
    color: var(--sa-text);
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  }
  .za-permissions tr:last-child td { border-bottom: 0; }
  .za-permissions tr:hover td { background: #f8fafc; }
  .za-permissions .sa-cell-strong { font-weight: 800; color: var(--sa-text); }

  .za-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 0.7rem;
    font-weight: 800;
  }
  .za-badge.allowed { background: var(--sa-green-soft); color: var(--sa-green); }
  .za-badge.restricted { background: var(--sa-red-soft); color: #b91c1c; }
  .za-badge.yes { background: var(--sa-orange-soft); color: #b45309; }
  .za-badge.no { background: #eef2f5; color: #64748b; }

  .za-boundary {
    margin-top: 20px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 18px 22px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 14px;
  }
  .za-boundary-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .za-boundary-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: var(--sa-red-soft);
    color: #b91c1c;
    flex-shrink: 0;
  }
  .za-boundary-icon svg { width: 18px; height: 18px; }
  .za-boundary h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .za-boundary p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .za-boundary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 8px;
  }
  .za-boundary-item {
    border: 1px solid var(--sa-line);
    border-radius: 12px;
    padding: 14px 16px;
    background: #fbfcfd;
    display: grid;
    gap: 6px;
  }
  .za-boundary-item strong {
    font-size: 0.9rem;
    color: var(--sa-text);
  }
  .za-boundary-item span {
    font-size: 0.8rem;
    color: #64748b;
  }

  @media (max-width: 720px) {
    .za-rules-grid { grid-template-columns: 1fr; }
    .za-permissions { font-size: 0.8rem; }
    .za-permissions td, .za-permissions th { padding: 10px 14px; }
  }
`

export default function RulesAndPermissionsSection() {
  return (
    <section className="sa-panel">
      <style>{rulesStyles}</style>

      <div className="sa-panel-header">
        <div className="za-rule-head" style={{ alignItems: 'center', borderBottom: 'none', paddingBottom: 0 }}>
          <div className="za-rule-icon" style={{ background: 'var(--sa-brand-soft)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Rules & permissions</h3>
            <span className="sa-panel-sub">What you can do in the {zoneProfile.name} zone — and what is blocked</span>
          </div>
        </div>
      </div>

      <div className="za-rules-intro">
        <strong>Your authority is zone-scoped.</strong>
        <p>As the {zoneProfile.name} Zone Admin, you can access only your assigned-zone data, update only authorized fields, and approve requests within your delegated limits. Higher-level decisions are escalated to the City Admin. You cannot access other zones or higher-level admin accounts — every attempt is blocked and logged.</p>
      </div>

      <div className="za-rules-grid">
        {ruleCards.map((card) => (
          <div key={card.id} className="za-rule-card">
            <div className="za-rule-head">
              <div className="za-rule-icon" style={{ background: card.tone === 'brand' ? 'var(--sa-brand-soft)' : card.tone === 'green' ? 'var(--sa-green-soft)' : card.tone === 'blue' ? 'var(--sa-blue-soft)' : card.tone === 'orange' ? 'var(--sa-orange-soft)' : card.tone === 'red' ? 'var(--sa-red-soft)' : '#eef2f5' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: card.icon }} />
              </div>
              <h4 className="za-rule-title">{card.title}</h4>
              <span className={`za-rule-tag ${card.tone}`}>{card.id}</span>
            </div>
            <div className="za-rule-body">
              {card.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="za-permissions">
        <div style={{ padding: '16px 18px 10px', borderBottom: '1px solid rgba(15, 23, 42, 0.06)', background: '#fbfcfd' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#182230' }}>Permissions by module</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#8a96a6' }}>Modules you can work in, what is allowed, what is restricted, and what needs City Admin escalation.</p>
        </div>
        <table className="sa-table za-permissions-table" role="grid" aria-label="Zone Admin permissions by module">
          <thead>
            <tr>
              <th>Module</th>
              <th>Allowed actions</th>
              <th>Restricted actions</th>
              <th style={{ textAlign: 'center' }}>Escalation required</th>
            </tr>
          </thead>
          <tbody>
            {permissionRows.map((row) => (
              <tr key={row.module}>
                <td className="sa-cell-strong">{row.module}</td>
                <td>
                  <span className="za-badge allowed" aria-label="Allowed">Allowed</span>
                  <br />
                  <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginTop: '6px' }}>{row.allowed}</span>
                </td>
                <td>
                  <span className="za-badge restricted" aria-label="Restricted">Restricted</span>
                  <br />
                  <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginTop: '6px' }}>{row.restricted}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`za-badge ${row.escalation === 'Yes' ? 'yes' : 'no'}`}>{row.escalation}</span>
                  <br />
                  <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block', marginTop: '5px' }}>{row.escalationNote}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="za-boundary">
        <div className="za-boundary-head">
          <div className="za-boundary-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c16.5 0-30-13.5-30-30V12c0-16.5 13.5-30 30-30"/>
            </svg>
          </div>
          <div>
            <h4>Hard boundaries for your account</h4>
            <p>These limits apply to every session and cannot be overridden from the Zone Admin dashboard.</p>
          </div>
        </div>
        <div className="za-boundary-grid">
          <div className="za-boundary-item">
            <strong>Assigned zone only</strong>
            <span>Madhapur · Hyderabad · Telangana. No data from other zones is visible or editable.</span>
          </div>
          <div className="za-boundary-item">
            <strong>No higher-level accounts</strong>
            <span>City Admin and State Admin accounts are unreachable from your session.</span>
          </div>
          <div className="za-boundary-item">
            <strong>Delegated limits</strong>
            <span>Maintenance up to {zonePermissionLimits.maintenanceApproval} · refunds up to {zonePermissionLimits.refundApproval}.</span>
          </div>
          <div className="za-boundary-item">
            <strong>Escalation target</strong>
            <span>City Admin (Praveen Kumar, Hyderabad) · decision within {zonePermissionLimits.escalationSLA.toLowerCase()}.</span>
          </div>
          <div className="za-boundary-item">
            <strong>All violations logged</strong>
            <span>Cross-zone or admin-account attempts are recorded in the audit trail and reported to the City Admin.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
