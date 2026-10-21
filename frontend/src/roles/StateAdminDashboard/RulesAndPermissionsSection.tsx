import { stateApprovalLimits, stateProfile, formatRupees } from './stateAdminData'

type RuleCard = {
  id: string
  title: string
  icon: string
  body: string[]
  tone: 'brand' | 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'slate'
}

const ruleCards: RuleCard[] = [
  {
    id: 'state-access',
    title: 'State-level access',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
      </svg>
    `,
    body: [
      'You oversee Telangana — all eight cities and fifteen zones registered in the state.',
      'City and zone data, operators, bookings, fleet and finance inside your state are visible and actionable.',
      'Data from other states is hidden; cross-state access is blocked by the backend and logged.',
    ],
    tone: 'blue',
  },
  {
    id: 'city-zone',
    title: 'City and zone management',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
      </svg>
    `,
    body: [
      'Activate, deactivate and manage cities within Telangana; review zone-level configuration.',
      'Approve city & zone admin requests and zone boundary changes within your state.',
      'Creating a brand-new city or moving a zone between states requires Super Admin approval.',
    ],
    tone: 'brand',
  },
  {
    id: 'user-perms',
    title: 'User permissions',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="8.5" cy="7" r="4"/>
        <path d="M20 21v-2a4 4 0 0 0-4-4h-3.5"/>
      </svg>
    `,
    body: [
      'Create, verify, suspend and manage City Admin, Zone Admin and operator accounts inside Telangana.',
      'You cannot create, edit or delete Super Admin accounts or accounts belonging to other states.',
      'Cross-state user transfers and global role changes require Super Admin approval.',
    ],
    tone: 'green',
  },
  {
    id: 'vehicle-rental',
    title: 'Vehicle and rental management',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2" y="17" width="20" height="5" rx="2" ry="2"/>
        <circle cx="7" cy="22" r="2"/>
        <circle cx="17" cy="22" r="2"/>
        <path d="M7 22V12a5 5 0 0 1 10 0v10"/>
      </svg>
    `,
    body: [
      'View and manage bookings, rentals, fleet machines and dispatch across every city in Telangana.',
      'Flag machines for maintenance, schedule state-level service and update machine availability.',
      'You cannot add or remove fleet from other states, or change global platform rates without Super Admin sign-off.',
    ],
    tone: 'purple',
  },
  {
    id: 'finance',
    title: 'Financial approval limits',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    `,
    body: [
      `Refunds / Adjustments: up to ${formatRupees(stateApprovalLimits['Refund / Adjustment'].amount ?? 0)} per request.`,
      `Operational Requests: up to ${formatRupees(200000)} per request.`,
      'Applications, Property Verifications, Account Activations and Escalations: State Admin authority.',
      'Requests above your configured limit are escalated to the Super Admin.',
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
      'Create cities in other states, or manage Super Admin accounts.',
      'Change global platform settings, city-wide base rates and state-level payouts without approval.',
      'Access or export data belonging to other states.',
      'Override cross-state restrictions from the State Admin dashboard.',
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
      'Customer contact details are visible only for bookings and rentals inside your state.',
      'State reports and city data stay inside EquipHub — external sharing needs Super Admin approval.',
      'Cross-state customer and payment records are not exportable outside your state scope.',
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
      'Every approval, rejection, escalation and user action is logged with actor, time, city and state.',
      'Access denials — cross-state or Super Admin account attempts — are recorded in the audit trail.',
      'The Super Admin and Auditor can review Telangana state logs at any time.',
    ],
    tone: 'brand',
  },
  {
    id: 'sla',
    title: 'SLA oversight',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="12 2 12 22"/>
        <polyline points="5 12 12 15 19 12"/>
      </svg>
    `,
    body: [
      'Own dispatch and incident response SLAs across all cities and zones in Telangana.',
      'City Admins report to you; you own state-level escalation SLAs and SLA breach notifications.',
      'SLA breaches above the state threshold are escalated to the Super Admin within 24 hours.',
    ],
    tone: 'orange',
  },
  {
    id: 'escalation',
    title: 'Escalation rules',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2V22M2 12h20"/>
      </svg>
    `,
    body: [
      'Decisions above your configured limit, or affecting other states, go to the Super Admin.',
      'Escalations include the reason, state context and a link to the source record.',
      'Super Admin decisions are returned to you with the outcome and audit trail entry.',
    ],
    tone: 'brand',
  },
]

type PermissionBadge = {
  label: string
  tone: 'allowed' | 'restricted' | 'delegated' | 'own-state' | 'super-admin' | 'no'
}

const badgeTone: Record<string, string> = {
  allowed: 'green',
  restricted: 'red',
  delegated: 'orange',
  'own-state': 'blue',
  'super-admin': 'red',
  no: 'slate',
}

type PermissionRow = {
  module: string
  view: PermissionBadge
  create: PermissionBadge
  edit: PermissionBadge
  approve: PermissionBadge
  export: PermissionBadge
  restricted: string
}

const permissionRows: PermissionRow[] = [
  {
    module: 'State cities',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'Super Admin', tone: 'super-admin' },
    edit: { label: 'Own state', tone: 'own-state' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: "Other states' cities",
  },
  {
    module: 'City & zone admin',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'Super Admin', tone: 'super-admin' },
    edit: { label: 'Own state', tone: 'own-state' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Own state', tone: 'own-state' },
    restricted: 'Super Admin accounts',
  },
  {
    module: 'Users & operators',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'Own state', tone: 'own-state' },
    edit: { label: 'Own state', tone: 'own-state' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Own state', tone: 'own-state' },
    restricted: 'Cross-state user transfers',
  },
  {
    module: 'Bookings & rentals',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'Own state', tone: 'own-state' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: "Other states' bookings",
  },
  {
    module: 'Fleet & machines',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'Own state', tone: 'own-state' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: 'Cross-state fleet transfers',
  },
  {
    module: 'Approvals & requests',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'No', tone: 'no' },
    approve: { label: 'Configured limit', tone: 'delegated' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: 'Above state approval limit',
  },
  {
    module: 'Payments & finance',
    view: { label: 'Own state', tone: 'own-state' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'No', tone: 'no' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Own state', tone: 'own-state' },
    restricted: 'Super-level payouts',
  },
  {
    module: 'Reports & analytics',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'No', tone: 'no' },
    approve: { label: 'No', tone: 'no' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: 'Cross-state reports',
  },
  {
    module: 'Audit & compliance',
    view: { label: 'Own state', tone: 'own-state' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'No', tone: 'no' },
    approve: { label: 'No', tone: 'no' },
    export: { label: 'No', tone: 'no' },
    restricted: "Other states' audit logs",
  },
]

const superAdminActions = [
  {
    title: 'New city creation',
    detail: 'Creating a new city or changing a city\'s state requires Super Admin approval.',
  },
  {
    title: 'City & zone admin accounts',
    detail: 'New City Admin and Zone Admin appointments require Super Admin authority.',
  },
  {
    title: 'Large refunds',
    detail: `Refunds / Adjustments above ${formatRupees(stateApprovalLimits['Refund / Adjustment'].amount ?? 0)} per request.`,
  },
  {
    title: 'Large operational requests',
    detail: `Operational Requests above ₹2,00,000 per request require Super Admin approval.`,
  },
  {
    title: 'Super Admin accounts',
    detail: 'Create, edit or delete Super Admin accounts and cross-state user moves.',
  },
  {
    title: 'Global platform settings',
    detail: 'Global base rates, platform fees and state-level payouts or settlements.',
  },
]

const cardTone: Record<string, string> = {
  brand: 'var(--sa-brand-soft)',
  green: 'var(--sa-green-soft)',
  blue: 'var(--sa-blue-soft)',
  orange: 'var(--sa-orange-soft)',
  purple: 'var(--sa-purple-soft)',
  red: 'var(--sa-red-soft)',
  slate: '#eef2f5',
}

const rulesStyles = `
  .st-rules-intro {
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-brand);
    border-radius: 16px;
    padding: 16px 20px;
    background: #fffaf3;
    display: grid;
    gap: 8px;
  }
  .st-rules-intro strong {
    font-size: 0.9rem;
    color: var(--sa-brand-deep);
  }
  .st-rules-intro p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .st-rules-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 2px;
  }
  .st-rule-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 12px;
  }
  .st-rule-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .st-rule-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #f3f6f7;
    flex-shrink: 0;
  }
  .st-rule-icon svg {
    width: 18px;
    height: 18px;
  }
  .st-rule-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
  }
  .st-rule-body {
    margin: 0;
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    display: grid;
    gap: 7px;
  }
  .st-rule-body p {
    margin: 0;
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    padding-left: 16px;
    position: relative;
  }
  .st-rule-body p::before {
    content: '–';
    position: absolute;
    left: 0;
    top: 1px;
    color: var(--sa-muted);
    font-weight: 800;
  }

  .st-limits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 20px;
  }
  .st-limit-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 8px;
  }
  .st-limit-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .st-limit-title {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .st-limit-tag {
    width: fit-content;
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .st-limit-tag.delegated { background: var(--sa-orange-soft); color: #b45309; }
  .st-limit-tag.super-admin { background: var(--sa-red-soft); color: #b91c1c; }
  .st-limit-value {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--sa-text);
  }
  .st-limit-desc {
    margin: 0;
    font-size: 0.76rem;
    color: var(--sa-muted);
    line-height: 1.5;
  }

  .st-permissions {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    margin-top: 20px;
  }
  .st-permissions table {
    width: 100%;
    border-collapse: collapse;
    min-width: 980px;
    font-size: 0.82rem;
  }
  .st-permissions th {
    text-align: left;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sa-muted);
    padding: 12px 16px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: #fbfcfd;
    white-space: nowrap;
  }
  .st-permissions td {
    padding: 12px 16px;
    vertical-align: middle;
    color: var(--sa-text);
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  }
  .st-permissions tr:last-child td { border-bottom: 0; }
  .st-permissions tr:hover td { background: #f8fafc; }
  .st-permissions .sa-cell-strong { font-weight: 800; color: var(--sa-text); }

  .st-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 0.7rem;
    font-weight: 800;
  }
  .st-badge.allowed { background: var(--sa-green-soft); color: var(--sa-green); }
  .st-badge.restricted { background: var(--sa-red-soft); color: #b91c1c; }
  .st-badge.delegated { background: var(--sa-orange-soft); color: #b45309; }
  .st-badge.own-state { background: var(--sa-blue-soft); color: #1d4ed8; }
  .st-badge.super-admin { background: var(--sa-red-soft); color: #b91c1c; }
  .st-badge.no { background: #eef2f5; color: #64748b; }

  .st-super-admin {
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-red);
    border-radius: 16px;
    padding: 18px 22px;
    background: #fffaf3;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    margin-top: 20px;
    display: grid;
    gap: 14px;
  }
  .st-super-admin-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .st-super-admin-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: var(--sa-red-soft);
    color: #b91c1c;
    flex-shrink: 0;
  }
  .st-super-admin-icon svg { width: 18px; height: 18px; }
  .st-super-admin h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .st-super-admin p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .st-super-admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
    margin-top: 10px;
  }
  .st-super-admin-item {
    border: 1px solid var(--sa-line);
    border-radius: 12px;
    padding: 14px 16px;
    background: #fff;
    display: grid;
    gap: 6px;
  }
  .st-super-admin-item strong {
    font-size: 0.9rem;
    color: var(--sa-text);
  }
  .st-super-admin-item span {
    font-size: 0.8rem;
    color: #64748b;
  }

  .st-boundary {
    margin-top: 20px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 18px 22px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 14px;
  }
  .st-boundary-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .st-boundary-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: var(--sa-red-soft);
    color: #b91c1c;
    flex-shrink: 0;
  }
  .st-boundary-icon svg { width: 18px; height: 18px; }
  .st-boundary h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .st-boundary p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .st-boundary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 8px;
  }
  .st-boundary-item {
    border: 1px solid var(--sa-line);
    border-radius: 12px;
    padding: 14px 16px;
    background: #fbfcfd;
    display: grid;
    gap: 6px;
  }
  .st-boundary-item strong {
    font-size: 0.9rem;
    color: var(--sa-text);
  }
  .st-boundary-item span {
    font-size: 0.8rem;
    color: #64748b;
  }

  @media (max-width: 720px) {
    .st-rules-grid { grid-template-columns: 1fr; }
    .st-permissions { font-size: 0.78rem; }
    .st-permissions td, .st-permissions th { padding: 10px 14px; }
    .st-limits { grid-template-columns: 1fr; }
  }
`

export default function RulesAndPermissionsSection() {
  return (
    <section className="sa-panel">
      <style>{rulesStyles}</style>

      <div className="sa-panel-header">
        <div className="st-rule-head" style={{ alignItems: 'center', borderBottom: 'none', paddingBottom: 0 }}>
          <div className="st-rule-icon" style={{ background: 'var(--sa-brand-soft)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Rules & permissions</h3>
            <span className="sa-panel-sub">What the {stateProfile.name} State Admin can do — and what requires Super Admin</span>
          </div>
        </div>
      </div>

      <div className="st-rules-intro">
        <strong>Your authority is state-scoped.</strong>
        <p>As the {stateProfile.name} State Admin, you oversee authorized cities and zones within your assigned state, manage permitted subordinate roles, and approve requests only within configured limits. You cannot access other states or change Super Admin privileges or global platform settings — every violation is blocked and logged.</p>
      </div>

      <div className="st-rules-grid">
        {ruleCards.map((card) => (
          <div key={card.id} className="st-rule-card">
            <div className="st-rule-head">
              <div className="st-rule-icon" style={{ background: cardTone[card.tone] }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: card.icon }} />
              </div>
              <h4 className="st-rule-title">{card.title}</h4>
            </div>
            <div className="st-rule-body">
              {card.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="st-limits">
        {[
          {
            label: 'Refunds / Adjustments',
            value: formatRupees(stateApprovalLimits['Refund / Adjustment'].amount ?? 0),
            tone: 'delegated' as const,
            desc: 'Above ₹5,00,000, escalate to Super Admin.',
          },
          {
            label: 'Operational Requests',
            value: '₹2,00,000',
            tone: 'delegated' as const,
            desc: 'Above ₹2,00,000, escalate to Super Admin.',
          },
          {
            label: 'City & Zone Admin',
            value: 'Super Admin',
            tone: 'super-admin' as const,
            desc: 'You can review; creation requires Super Admin.',
          },
          {
            label: 'Global platform settings',
            value: 'Super Admin',
            tone: 'super-admin' as const,
            desc: 'Not changeable from State Admin.',
          },
        ].map((card) => (
          <div key={card.label} className="st-limit-card">
            <div className="st-limit-head">
              <span className="st-limit-title">{card.label}</span>
              <span className={`st-limit-tag ${card.tone}`}>{card.tone}</span>
            </div>
            <strong className="st-limit-value">{card.value}</strong>
            <p className="st-limit-desc">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="st-permissions">
        <div style={{ padding: '16px 18px 10px', borderBottom: '1px solid rgba(15, 23, 42, 0.06)', background: '#fbfcfd' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#182230' }}>Permissions by module</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#8a96a6' }}>View, create, edit, approve and export rights per module, plus restricted actions.</p>
        </div>
        <table className="sa-table st-permissions-table" role="grid" aria-label="State Admin permissions by module">
          <thead>
            <tr>
              <th>Module</th>
              <th style={{ textAlign: 'center' }}>View</th>
              <th style={{ textAlign: 'center' }}>Create</th>
              <th style={{ textAlign: 'center' }}>Edit</th>
              <th style={{ textAlign: 'center' }}>Approve</th>
              <th style={{ textAlign: 'center' }}>Export</th>
              <th>Restricted actions</th>
            </tr>
          </thead>
          <tbody>
            {permissionRows.map((row) => (
              <tr key={row.module}>
                <td className="sa-cell-strong">{row.module}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`st-badge ${badgeTone[row.view.tone]}`}>{row.view.label}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`st-badge ${badgeTone[row.create.tone]}`}>{row.create.label}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`st-badge ${badgeTone[row.edit.tone]}`}>{row.edit.label}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`st-badge ${badgeTone[row.approve.tone]}`}>{row.approve.label}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`st-badge ${badgeTone[row.export.tone]}`}>{row.export.label}</span>
                </td>
                <td style={{ fontSize: '0.78rem', color: '#475569' }}>{row.restricted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="st-super-admin">
        <div className="st-super-admin-head">
          <div className="st-super-admin-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c16.5 0-30-13.5-30-30V12c0-16.5 13.5-30 30-30"/>
            </svg>
          </div>
          <div>
            <h4>Requires Super Admin approval</h4>
            <p>These actions cannot be performed from the State Admin dashboard and are escalated to the Super Admin.</p>
          </div>
        </div>
        <div className="st-super-admin-grid">
          {superAdminActions.map((item) => (
            <div key={item.title} className="st-super-admin-item">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="st-boundary">
        <div className="st-boundary-head">
          <div className="st-boundary-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c16.5 0-30-13.5-30-30V12c0-16.5 13.5-30 30-30"/>
            </svg>
          </div>
          <div>
            <h4>Hard boundaries for your account</h4>
            <p>These limits apply to every session and cannot be overridden from the State Admin dashboard.</p>
          </div>
        </div>
        <div className="st-boundary-grid">
          <div className="st-boundary-item">
            <strong>Assigned state only</strong>
            <span>{stateProfile.name} · code {stateProfile.code}. No data from other states is visible or editable.</span>
          </div>
          <div className="st-boundary-item">
            <strong>No Super Admin accounts</strong>
            <span>Super Admin accounts and global platform settings are unreachable from your session.</span>
          </div>
          <div className="st-boundary-item">
            <strong>Configured limits</strong>
            <span>Refunds up to ₹5,00,000 · operational requests up to ₹2,00,000 per request.</span>
          </div>
          <div className="st-boundary-item">
            <strong>Escalation target</strong>
            <span>Super Admin · decisions returned with outcome and audit trail entry.</span>
          </div>
          <div className="st-boundary-item">
            <strong>All violations logged</strong>
            <span>Cross-state or Super Admin account attempts are recorded in the audit trail and reported to the Super Admin.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
