import { cityApprovalLimits, cityProfile, formatRupees } from './cityAdminData'

type RuleCard = {
  id: string
  title: string
  icon: string
  body: string[]
  tone: 'brand' | 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'slate'
}

const ruleCards: RuleCard[] = [
  {
    id: 'city-access',
    title: 'City-level access',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
      </svg>
    `,
    body: [
      'You manage the Hyderabad city scope — all six zones: Madhapur, Gachibowli, Kukatpally, Uppal, Begumpet and LB Nagar.',
      'Zone-level data, operators, bookings and fleet inside your city are visible and actionable.',
      'Data from other cities is hidden; cross-city access is blocked by the backend and logged.',
    ],
    tone: 'blue',
  },
  {
    id: 'user-mgmt',
    title: 'User management permissions',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="8.5" cy="7" r="4"/>
      </svg>
    `,
    body: [
      'Create, verify, suspend and manage operator badges and zone staff accounts inside Hyderabad.',
      'You cannot create, edit or delete State Admin accounts or accounts belonging to other cities.',
      'Zone Admin accounts within your city fall under your authority; cross-city user moves need State Admin approval.',
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
      'View and manage bookings, rentals, fleet machines and dispatch across all Hyderabad zones.',
      'Flag machines for maintenance, schedule zone-level service and update machine availability.',
      'You cannot add or remove fleet from other cities, or change city-wide base rates without State Admin sign-off.',
    ],
    tone: 'brand',
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
      `Operational Requests: up to ${formatRupees(cityApprovalLimits['Operational Request'].amount ?? 0)} per request.`,
      `Refunds / Adjustments: up to ${formatRupees(cityApprovalLimits['Refund / Adjustment'].amount ?? 0)} per request.`,
      'Applications and Property Verifications require State Admin authority — you can review but not approve.',
      'Requests above your delegated limit are escalated to the State Admin.',
    ],
    tone: 'orange',
  },
  {
    id: 'finance',
    title: 'Financial restrictions',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    `,
    body: [
      'View zone and city-level payments, payouts and settlements inside Hyderabad.',
      'Approve refunds and adjustments within your delegated financial limit.',
      'State-level payouts, city-wide rate changes and cross-city settlements require State Admin approval.',
    ],
    tone: 'purple',
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
      'Customer contact details are visible only for bookings and rentals inside your city.',
      'Zone reports and city data stay inside EquipHub — external sharing needs State Admin approval.',
      'City-wide customer and payment records are not exportable outside your city scope.',
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
      'Every approval, rejection, escalation and user action is logged with actor, time, zone and city.',
      'Access denials — cross-city or State Admin account attempts — are recorded in the audit trail.',
      'The State Admin and Auditor can review Hyderabad city logs at any time.',
    ],
    tone: 'brand',
  },
  {
    id: 'sla',
    title: 'SLA responsibilities',
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="12 2 12 22"/>
        <polyline points="5 12 12 15 19 12"/>
      </svg>
    `,
    body: [
      'Own dispatch and incident response SLAs across all Hyderabad zones.',
      'Zone Admins report to you; you own escalation SLAs and SLA breach notifications.',
      'SLA breaches above city threshold are escalated to the State Admin within 24 hours.',
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
      'Create or delete zones in other cities, or manage State Admin accounts.',
      'Approve Applications or Property Verifications — State Admin authority only.',
      'Change city-wide base rates, cross-city fleet transfers and state-level payouts.',
      'Access or export data belonging to other cities.',
    ],
    tone: 'red',
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
      'Decisions above your limit, or affecting other cities, go to the State Admin.',
      'Escalations include the reason, city context and a link to the source record.',
      'State Admin decisions are returned to you with the outcome and audit trail entry.',
    ],
    tone: 'brand',
  },
]

type PermissionBadge = {
  label: string
  tone: 'allowed' | 'restricted' | 'delegated' | 'own-city' | 'state-admin' | 'no'
}

const badgeTone: Record<string, string> = {
  allowed: 'green',
  restricted: 'red',
  delegated: 'orange',
  'own-city': 'blue',
  'state-admin': 'red',
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
    module: 'City zones',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'Restricted', tone: 'restricted' },
    edit: { label: 'Own zones', tone: 'own-city' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: 'Creating zones in other cities',
  },
  {
    module: 'Users & operators',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'Own city', tone: 'own-city' },
    edit: { label: 'Own city', tone: 'own-city' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Own city', tone: 'own-city' },
    restricted: 'State Admin and cross-city accounts',
  },
  {
    module: 'Bookings & rentals',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'Own zones', tone: 'own-city' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: "Other cities' bookings",
  },
  {
    module: 'Fleet & machines',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'Own zones', tone: 'own-city' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: 'Cross-city fleet transfers',
  },
  {
    module: 'Approvals & requests',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'No', tone: 'no' },
    approve: { label: 'Delegated limit', tone: 'delegated' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: 'Above city approval limit',
  },
  {
    module: 'Payments & finance',
    view: { label: 'Own city', tone: 'own-city' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'No', tone: 'no' },
    approve: { label: 'Delegated', tone: 'delegated' },
    export: { label: 'Own city', tone: 'own-city' },
    restricted: 'State-level payouts',
  },
  {
    module: 'Reports & analytics',
    view: { label: 'Allowed', tone: 'allowed' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'No', tone: 'no' },
    approve: { label: 'No', tone: 'no' },
    export: { label: 'Allowed', tone: 'allowed' },
    restricted: 'State-wide reports',
  },
  {
    module: 'Audit & compliance',
    view: { label: 'Own city', tone: 'own-city' },
    create: { label: 'No', tone: 'no' },
    edit: { label: 'No', tone: 'no' },
    approve: { label: 'No', tone: 'no' },
    export: { label: 'No', tone: 'no' },
    restricted: "Other cities' audit logs",
  },
]

const stateAdminActions = [
  {
    title: 'Zone lifecycle',
    detail: 'Create or delete zones, and move zones between cities.',
  },
  {
    title: 'Applications & property verification',
    detail: 'Operator applications and property verifications require State Admin authority.',
  },
  {
    title: 'Large operational requests',
    detail: `Operational Requests above ${formatRupees(cityApprovalLimits['Operational Request'].amount ?? 0)} per request.`,
  },
  {
    title: 'Large refunds',
    detail: `Refunds / Adjustments above ${formatRupees(cityApprovalLimits['Refund / Adjustment'].amount ?? 0)} per request.`,
  },
  {
    title: 'State Admin accounts',
    detail: 'Create, edit or delete State Admin accounts and cross-city user moves.',
  },
  {
    title: 'City-wide rates',
    detail: 'Change city-wide base rates and state-level payouts or settlements.',
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
  .ca-rules-intro {
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-brand);
    border-radius: 16px;
    padding: 16px 20px;
    background: #fffaf3;
    display: grid;
    gap: 8px;
  }
  .ca-rules-intro strong {
    font-size: 0.9rem;
    color: var(--sa-brand-deep);
  }
  .ca-rules-intro p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .ca-rules-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 2px;
  }
  .ca-rule-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 12px;
  }
  .ca-rule-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ca-rule-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #f3f6f7;
    flex-shrink: 0;
  }
  .ca-rule-icon svg {
    width: 18px;
    height: 18px;
  }
  .ca-rule-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
  }
  .ca-rule-body {
    margin: 0;
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    display: grid;
    gap: 7px;
  }
  .ca-rule-body p {
    margin: 0;
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.65;
    padding-left: 16px;
    position: relative;
  }
  .ca-rule-body p::before {
    content: '–';
    position: absolute;
    left: 0;
    top: 1px;
    color: var(--sa-muted);
    font-weight: 800;
  }

  .ca-limits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 20px;
  }
  .ca-limit-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 8px;
  }
  .ca-limit-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .ca-limit-title {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .ca-limit-tag {
    width: fit-content;
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .ca-limit-tag.delegated { background: var(--sa-orange-soft); color: #b45309; }
  .ca-limit-tag.state-admin { background: var(--sa-red-soft); color: #b91c1c; }
  .ca-limit-value {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--sa-text);
  }
  .ca-limit-desc {
    margin: 0;
    font-size: 0.76rem;
    color: var(--sa-muted);
    line-height: 1.5;
  }

  .ca-permissions {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    margin-top: 20px;
  }
  .ca-permissions table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
    font-size: 0.82rem;
  }
  .ca-permissions th {
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
  .ca-permissions td {
    padding: 12px 16px;
    vertical-align: middle;
    color: var(--sa-text);
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  }
  .ca-permissions tr:last-child td { border-bottom: 0; }
  .ca-permissions tr:hover td { background: #f8fafc; }
  .ca-permissions .sa-cell-strong { font-weight: 800; color: var(--sa-text); }

  .ca-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 0.7rem;
    font-weight: 800;
  }
  .ca-badge.allowed { background: var(--sa-green-soft); color: var(--sa-green); }
  .ca-badge.restricted { background: var(--sa-red-soft); color: #b91c1c; }
  .ca-badge.delegated { background: var(--sa-orange-soft); color: #b45309; }
  .ca-badge.own-city { background: var(--sa-blue-soft); color: #1d4ed8; }
  .ca-badge.state-admin { background: var(--sa-red-soft); color: #b91c1c; }
  .ca-badge.no { background: #eef2f5; color: #64748b; }

  .ca-state-admin {
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
  .ca-state-admin-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ca-state-admin-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: var(--sa-red-soft);
    color: #b91c1c;
    flex-shrink: 0;
  }
  .ca-state-admin-icon svg { width: 18px; height: 18px; }
  .ca-state-admin h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .ca-state-admin p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .ca-state-admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
    margin-top: 10px;
  }
  .ca-state-admin-item {
    border: 1px solid var(--sa-line);
    border-radius: 12px;
    padding: 14px 16px;
    background: #fff;
    display: grid;
    gap: 6px;
  }
  .ca-state-admin-item strong {
    font-size: 0.9rem;
    color: var(--sa-text);
  }
  .ca-state-admin-item span {
    font-size: 0.8rem;
    color: #64748b;
  }

  .ca-boundary {
    margin-top: 20px;
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 18px 22px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 14px;
  }
  .ca-boundary-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ca-boundary-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: var(--sa-red-soft);
    color: #b91c1c;
    flex-shrink: 0;
  }
  .ca-boundary-icon svg { width: 18px; height: 18px; }
  .ca-boundary h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .ca-boundary p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .ca-boundary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 8px;
  }
  .ca-boundary-item {
    border: 1px solid var(--sa-line);
    border-radius: 12px;
    padding: 14px 16px;
    background: #fbfcfd;
    display: grid;
    gap: 6px;
  }
  .ca-boundary-item strong {
    font-size: 0.9rem;
    color: var(--sa-text);
  }
  .ca-boundary-item span {
    font-size: 0.8rem;
    color: #64748b;
  }

  @media (max-width: 720px) {
    .ca-rules-grid { grid-template-columns: 1fr; }
    .ca-permissions { font-size: 0.78rem; }
    .ca-permissions td, .ca-permissions th { padding: 10px 14px; }
    .ca-limits { grid-template-columns: 1fr; }
  }
`

export default function RulesAndPermissionsSection() {
  return (
    <section className="sa-panel">
      <style>{rulesStyles}</style>

      <div className="sa-panel-header">
        <div className="ca-rule-head" style={{ alignItems: 'center', borderBottom: 'none', paddingBottom: 0 }}>
          <div className="ca-rule-icon" style={{ background: 'var(--sa-brand-soft)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Rules & permissions</h3>
            <span className="sa-panel-sub">What the {cityProfile.name} City Admin can do — and what requires State Admin</span>
          </div>
        </div>
      </div>

      <div className="ca-rules-intro">
        <strong>Your authority is city-scoped.</strong>
        <p>As the {cityProfile.name} City Admin, you manage authorized zones and users within your assigned city, approve requests within your delegated limits, and escalate higher-level decisions to the State Admin. You cannot access other cities or higher-level admin privileges — every violation is blocked and logged.</p>
      </div>

      <div className="ca-rules-grid">
        {ruleCards.map((card) => (
          <div key={card.id} className="ca-rule-card">
            <div className="ca-rule-head">
              <div className="ca-rule-icon" style={{ background: cardTone[card.tone] }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: card.icon }} />
              </div>
              <h4 className="ca-rule-title">{card.title}</h4>
            </div>
            <div className="ca-rule-body">
              {card.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="ca-limits">
        {[
          {
            label: 'Operational Requests',
            value: formatRupees(cityApprovalLimits['Operational Request'].amount ?? 0),
            tone: 'delegated' as const,
            desc: 'Above this, escalate to State Admin.',
          },
          {
            label: 'Refunds / Adjustments',
            value: formatRupees(cityApprovalLimits['Refund / Adjustment'].amount ?? 0),
            tone: 'delegated' as const,
            desc: 'Above this, escalate to State Admin.',
          },
          {
            label: 'Applications',
            value: 'State Admin',
            tone: 'state-admin' as const,
            desc: 'You can review; approval requires State Admin.',
          },
          {
            label: 'Property Verification',
            value: 'State Admin',
            tone: 'state-admin' as const,
            desc: 'You can review; approval requires State Admin.',
          },
        ].map((card) => (
          <div key={card.label} className="ca-limit-card">
            <div className="ca-limit-head">
              <span className="ca-limit-title">{card.label}</span>
              <span className={`ca-limit-tag ${card.tone}`}>{card.tone}</span>
            </div>
            <strong className="ca-limit-value">{card.value}</strong>
            <p className="ca-limit-desc">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="ca-permissions">
        <div style={{ padding: '16px 18px 10px', borderBottom: '1px solid rgba(15, 23, 42, 0.06)', background: '#fbfcfd' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#182230' }}>Permissions by module</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#8a96a6' }}>View, create, edit, approve and export rights per module, plus restricted actions.</p>
        </div>
        <table className="sa-table ca-permissions-table" role="grid" aria-label="City Admin permissions by module">
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
                  <span className={`ca-badge ${badgeTone[row.view.tone]}`}>{row.view.label}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`ca-badge ${badgeTone[row.create.tone]}`}>{row.create.label}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`ca-badge ${badgeTone[row.edit.tone]}`}>{row.edit.label}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`ca-badge ${badgeTone[row.approve.tone]}`}>{row.approve.label}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`ca-badge ${badgeTone[row.export.tone]}`}>{row.export.label}</span>
                </td>
                <td style={{ fontSize: '0.78rem', color: '#475569' }}>{row.restricted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ca-state-admin">
        <div className="ca-state-admin-head">
          <div className="ca-state-admin-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c16.5 0-30-13.5-30-30V12c0-16.5 13.5-30 30-30"/>
            </svg>
          </div>
          <div>
            <h4>Requires State Admin approval</h4>
            <p>These actions cannot be performed from the City Admin dashboard and are escalated to the State Admin.</p>
          </div>
        </div>
        <div className="ca-state-admin-grid">
          {stateAdminActions.map((item) => (
            <div key={item.title} className="ca-state-admin-item">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ca-boundary">
        <div className="ca-boundary-head">
          <div className="ca-boundary-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c16.5 0-30-13.5-30-30V12c0-16.5 13.5-30 30-30"/>
            </svg>
          </div>
          <div>
            <h4>Hard boundaries for your account</h4>
            <p>These limits apply to every session and cannot be overridden from the City Admin dashboard.</p>
          </div>
        </div>
        <div className="ca-boundary-grid">
          <div className="ca-boundary-item">
            <strong>Assigned city only</strong>
            <span>{cityProfile.name} · {cityProfile.state}. No data from other cities is visible or editable.</span>
          </div>
          <div className="ca-boundary-item">
            <strong>No higher-level accounts</strong>
            <span>State Admin accounts are unreachable from your session.</span>
          </div>
          <div className="ca-boundary-item">
            <strong>Delegated limits</strong>
            <span>Operational Requests up to {formatRupees(cityApprovalLimits['Operational Request'].amount ?? 0)} · refunds up to {formatRupees(cityApprovalLimits['Refund / Adjustment'].amount ?? 0)} per request.</span>
          </div>
          <div className="ca-boundary-item">
            <strong>Escalation target</strong>
            <span>State Admin · decisions returned with outcome and audit trail entry.</span>
          </div>
          <div className="ca-boundary-item">
            <strong>All violations logged</strong>
            <span>Cross-city or State Admin account attempts are recorded in the audit trail and reported to the State Admin.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
