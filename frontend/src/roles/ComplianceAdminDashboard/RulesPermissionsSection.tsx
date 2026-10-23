import {
  COMPLIANCE_APPROVAL_LIMITS,
  COMPLIANCE_ESCALATION_PROCEDURES,
  COMPLIANCE_MODULE_MATRIX,
  COMPLIANCE_PERMISSIONS,
  COMPLIANCE_PERMISSION_KEYS,
  COMPLIANCE_RESTRICTED_OPERATIONS,
  COMPLIANCE_SCOPE,
  type CompliancePermissionTier,
} from './compliancePermissions'
import { complianceProfile } from './complianceAdminData'

const tierMeta: Record<CompliancePermissionTier, { label: string; className: string }> = {
  granted: { label: 'Granted', className: 'cf-rules-badge granted' },
  approval: { label: 'Needs approval', className: 'cf-rules-badge approval' },
  restricted: { label: 'Restricted', className: 'cf-rules-badge restricted' },
}

const moduleOrder = [
  'Overview',
  'Documents',
  'Permits',
  'Inspections',
  'Suspensions',
  'Vehicles',
  'Drivers',
  'Violations',
  'Corrective actions',
  'Audits',
  'Escalations',
  'Expiry tracking',
  'Rules',
  'Privileges',
]

const groupedPermissions = moduleOrder
  .map((module) => ({
    module,
    items: COMPLIANCE_PERMISSION_KEYS.map((key) => COMPLIANCE_PERMISSIONS[key]).filter(
      (definition) => definition.module === module,
    ),
  }))
  .filter((group) => group.items.length > 0)

const matrixBadge: Record<string, string> = {
  Allowed: 'granted',
  'Own scope': 'scope',
  Approval: 'approval',
  Delegated: 'approval',
  Restricted: 'restricted',
  No: 'none',
}

const rulesStyles = `
.cf-rules-intro {
  border: 1px solid var(--sa-line);
  border-left: 4px solid var(--sa-brand);
  border-radius: 16px;
  padding: 16px 20px;
  background: #fffaf3;
  display: grid;
  gap: 8px;
}
.cf-rules-intro strong {
  font-size: 0.9rem;
  color: var(--sa-brand-deep);
}
.cf-rules-intro p {
  margin: 0;
  font-size: 0.84rem;
  color: #475569;
  line-height: 1.6;
}
.cf-rules-enforce {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.cf-rules-enforce-item {
  border: 1px solid var(--sa-line);
  border-radius: 12px;
  padding: 12px 14px;
  background: #fbfcfd;
  display: grid;
  gap: 4px;
}
.cf-rules-enforce-item strong {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--sa-text);
  display: flex;
  align-items: center;
  gap: 7px;
}
.cf-rules-enforce-item span {
  font-size: 0.76rem;
  color: #64748b;
  line-height: 1.55;
}
.cf-rules-enforce-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--sa-green);
  flex-shrink: 0;
}
.cf-rules-section {
  margin-top: 20px;
}
.cf-rules-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.cf-rules-section-head h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--sa-text);
}
.cf-rules-section-head p {
  margin: 3px 0 0;
  font-size: 0.78rem;
  color: var(--sa-muted);
}
.cf-rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}
.cf-rules-card {
  border: 1px solid var(--sa-line);
  border-radius: 16px;
  padding: 15px 17px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 8px;
  align-content: start;
}
.cf-rules-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.cf-rules-card-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--sa-text);
}
.cf-rules-card-key {
  margin: 0;
  font-size: 0.7rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--sa-muted);
  word-break: break-all;
}
.cf-rules-card p {
  margin: 0;
  font-size: 0.79rem;
  color: #475569;
  line-height: 1.6;
}
.cf-rules-card-limit {
  font-size: 0.74rem;
  color: #b45309;
  background: var(--sa-orange-soft);
  border-radius: 10px;
  padding: 7px 10px;
  line-height: 1.5;
}
.cf-rules-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  white-space: nowrap;
  flex-shrink: 0;
}
.cf-rules-badge.granted { background: var(--sa-green-soft); color: var(--sa-green); }
.cf-rules-badge.approval { background: var(--sa-orange-soft); color: #b45309; }
.cf-rules-badge.restricted { background: var(--sa-red-soft); color: #b91c1c; }
.cf-rules-badge.scope { background: var(--sa-blue-soft); color: #1d4ed8; }
.cf-rules-badge.none { background: #eef2f5; color: #64748b; }

.cf-rules-limit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 14px;
}
.cf-rules-limit {
  border: 1px solid var(--sa-line);
  border-radius: 16px;
  padding: 15px 17px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 8px;
}
.cf-rules-limit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.cf-rules-limit-row strong {
  font-size: 0.88rem;
  color: var(--sa-text);
}
.cf-rules-limit-line {
  font-size: 0.78rem;
  line-height: 1.6;
  color: #475569;
}
.cf-rules-limit-line b {
  color: var(--sa-text);
}
.cf-rules-limit-line.above b {
  color: #b91c1c;
}
.cf-rules-limit-sla {
  font-size: 0.72rem;
  color: var(--sa-muted);
}

.cf-rules-table-wrap {
  border: 1px solid var(--sa-line);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}
.cf-rules-table-wrap table {
  width: 100%;
  border-collapse: collapse;
  min-width: 880px;
  font-size: 0.82rem;
}
.cf-rules-table-wrap th {
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
.cf-rules-table-wrap td {
  padding: 11px 16px;
  vertical-align: middle;
  color: var(--sa-text);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}
.cf-rules-table-wrap tr:last-child td { border-bottom: 0; }
.cf-rules-table-wrap tr:hover td { background: #f8fafc; }

.cf-rules-restricted {
  border: 1px solid var(--sa-line);
  border-left: 4px solid var(--sa-red);
  border-radius: 16px;
  padding: 18px 22px;
  background: #fffaf3;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 14px;
}
.cf-rules-restricted h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--sa-text);
}
.cf-rules-restricted > p {
  margin: 0;
  font-size: 0.84rem;
  color: #475569;
  line-height: 1.6;
}
.cf-rules-restricted-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}
.cf-rules-restricted-item {
  border: 1px solid var(--sa-line);
  border-radius: 12px;
  padding: 13px 15px;
  background: #fff;
  display: grid;
  gap: 5px;
}
.cf-rules-restricted-item strong {
  font-size: 0.85rem;
  color: var(--sa-text);
}
.cf-rules-restricted-item span {
  font-size: 0.76rem;
  color: #64748b;
  line-height: 1.55;
}
.cf-rules-restricted-item em {
  font-style: normal;
  font-size: 0.72rem;
  font-weight: 800;
  color: #b91c1c;
}
.cf-rules-restricted-item i {
  font-style: normal;
  font-size: 0.72rem;
  color: var(--sa-muted);
}

.cf-rules-escalation {
  border: 1px solid var(--sa-line);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}
.cf-rules-escalation + .cf-rules-escalation {
  margin-top: 14px;
}
.cf-rules-escalation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 15px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  background: #fbfcfd;
}
.cf-rules-escalation-head strong {
  font-size: 0.92rem;
  color: var(--sa-text);
}
.cf-rules-escalation-head span {
  font-size: 0.74rem;
  color: var(--sa-muted);
}
.cf-rules-steps {
  display: grid;
  gap: 0;
  padding: 4px 0;
}
.cf-rules-step {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 12px 18px;
}
.cf-rules-step + .cf-rules-step {
  border-top: 1px solid rgba(15, 23, 42, 0.05);
}
.cf-rules-step-index {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.74rem;
  font-weight: 800;
  background: var(--sa-brand-soft, #fff1e6);
  color: var(--sa-brand-deep);
}
.cf-rules-step-copy {
  display: grid;
  gap: 3px;
}
.cf-rules-step-copy strong {
  font-size: 0.86rem;
  color: var(--sa-text);
}
.cf-rules-step-copy span {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.55;
}
.cf-rules-step-meta {
  text-align: right;
  display: grid;
  gap: 3px;
  justify-items: end;
}
.cf-rules-step-meta b {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--sa-text);
  white-space: nowrap;
}
.cf-rules-step-meta i {
  font-style: normal;
  font-size: 0.7rem;
  color: var(--sa-muted);
  white-space: nowrap;
}

.cf-rules-privilege {
  border: 1px solid var(--sa-line);
  border-left: 4px solid var(--sa-brand);
  border-radius: 16px;
  padding: 18px 22px;
  background: #fffaf3;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 14px;
}
.cf-rules-privilege h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--sa-text);
}
.cf-rules-privilege > p {
  margin: 0;
  font-size: 0.84rem;
  color: #475569;
  line-height: 1.6;
}
.cf-rules-privilege-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.cf-rules-privilege-item {
  border: 1px solid var(--sa-line);
  border-radius: 12px;
  padding: 13px 15px;
  background: #fff;
  display: grid;
  gap: 5px;
}
.cf-rules-privilege-item strong {
  font-size: 0.85rem;
  color: var(--sa-text);
}
.cf-rules-privilege-item span {
  font-size: 0.76rem;
  color: #64748b;
  line-height: 1.55;
}
.cf-rules-scope-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
}
.cf-rules-scope-card {
  border: 1px solid var(--sa-line);
  border-radius: 14px;
  padding: 14px 16px;
  background: #fff;
  display: grid;
  gap: 6px;
}
.cf-rules-scope-card > strong {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--sa-muted);
}
.cf-rules-scope-card ul {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 4px;
}
.cf-rules-scope-card li {
  font-size: 0.8rem;
  color: var(--sa-text);
  line-height: 1.5;
}
.cf-rules-scope-card li.blocked {
  color: #b91c1c;
}
`

export default function RulesPermissionsSection() {
  return (
    <section className="sa-panel">
      <style>{rulesStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Rules &amp; permissions</h3>
          <span className="sa-panel-sub">
            What the {complianceProfile.name} Compliance Admin can do — and what requires a higher authority
          </span>
        </div>
      </div>

      <div className="cf-rules-intro">
        <strong>Your authority is state-scoped and enforced by the API.</strong>
        <p>
          As the {complianceProfile.name} Compliance Admin you verify documents and permits, record inspections,
          place and lift compliance holds, resolve violations and raise corrective actions inside the{' '}
          {COMPLIANCE_SCOPE.cities.join(' and ')} scope. Anything above a delegated limit is routed to the owning
          authority as an escalation, and privileged operations — role assignment, scope widening, audit sign-off —
          are refused by the backend before they can change anything.
        </p>
      </div>

      <div className="cf-rules-enforce">
        {COMPLIANCE_SCOPE.enforcement.map((item) => (
          <div key={item} className="cf-rules-enforce-item">
            <strong>
              <i className="cf-rules-enforce-dot" />
              Enforced
            </strong>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="cf-rules-section">
        <div className="cf-rules-section-head">
          <div>
            <h4>Authorized scope</h4>
            <p>The records this account can reach, and the areas that stay outside it.</p>
          </div>
        </div>
        <div className="cf-rules-scope-grid">
          <div className="cf-rules-scope-card">
            <strong>Territory</strong>
            <ul>
              <li>{COMPLIANCE_SCOPE.state}</li>
              {COMPLIANCE_SCOPE.cities.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>
          <div className="cf-rules-scope-card">
            <strong>Record types in scope</strong>
            <ul>
              {COMPLIANCE_SCOPE.recordTypes.map((record) => (
                <li key={record}>{record}</li>
              ))}
            </ul>
          </div>
          <div className="cf-rules-scope-card">
            <strong>Outside your scope</strong>
            <ul>
              {COMPLIANCE_SCOPE.outsideScope.map((item) => (
                <li key={item} className="blocked">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="cf-rules-section">
        <div className="cf-rules-section-head">
          <div>
            <h4>Available actions</h4>
            <p>Every operation the compliance console exposes, with the authority that owns it.</p>
          </div>
        </div>
        <div className="cf-rules-grid">
          {groupedPermissions.flatMap((group) =>
            group.items.map((definition) => (
              <div key={definition.key} className="cf-rules-card">
                <div className="cf-rules-card-head">
                  <div>
                    <h5 className="cf-rules-card-title">{definition.label}</h5>
                    <p className="cf-rules-card-key">
                      {definition.key} · {definition.module}
                    </p>
                  </div>
                  <span className={tierMeta[definition.tier].className}>{tierMeta[definition.tier].label}</span>
                </div>
                <p>{definition.summary}</p>
                {definition.limit ? (
                  <span className="cf-rules-card-limit">
                    Delegated limit — {definition.limit.description} Above that it needs {definition.authority}.
                  </span>
                ) : null}
              </div>
            )),
          )}
        </div>
      </div>

      <div className="cf-rules-section">
        <div className="cf-rules-section-head">
          <div>
            <h4>Approval limits</h4>
            <p>What you can decide yourself, and what has to be signed off by a higher authority.</p>
          </div>
        </div>
        <div className="cf-rules-limit-grid">
          {COMPLIANCE_APPROVAL_LIMITS.map((limit) => (
            <div key={limit.id} className="cf-rules-limit">
              <div className="cf-rules-limit-row">
                <strong>{limit.label}</strong>
                <span className="cf-rules-badge approval">{limit.authority}</span>
              </div>
              <span className="cf-rules-limit-line">
                <b>You decide:</b> {limit.delegated}
              </span>
              <span className="cf-rules-limit-line above">
                <b>Escalate:</b> {limit.above}
              </span>
              <span className="cf-rules-limit-sla">{limit.sla}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cf-rules-section">
        <div className="cf-rules-section-head">
          <div>
            <h4>Permissions by module</h4>
            <p>View, create, edit, approve and export rights per module, plus the restricted operation on each one.</p>
          </div>
        </div>
        <div className="cf-rules-table-wrap">
          <table className="sa-table" role="grid" aria-label="Compliance Admin permissions by module">
            <thead>
              <tr>
                <th>Module</th>
                <th style={{ textAlign: 'center' }}>View</th>
                <th style={{ textAlign: 'center' }}>Create</th>
                <th style={{ textAlign: 'center' }}>Edit</th>
                <th style={{ textAlign: 'center' }}>Approve</th>
                <th style={{ textAlign: 'center' }}>Export</th>
                <th>Restricted operation</th>
              </tr>
            </thead>
            <tbody>
              {COMPLIANCE_MODULE_MATRIX.map((row) => (
                <tr key={row.module}>
                  <td className="sa-cell-strong">{row.module}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`cf-rules-badge ${matrixBadge[row.view]}`}>{row.view}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`cf-rules-badge ${matrixBadge[row.create]}`}>{row.create}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`cf-rules-badge ${matrixBadge[row.edit]}`}>{row.edit}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`cf-rules-badge ${matrixBadge[row.approve]}`}>{row.approve}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`cf-rules-badge ${matrixBadge[row.export]}`}>{row.export}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#475569' }}>{row.restricted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cf-rules-section">
        <div className="cf-rules-restricted">
          <div>
            <h4>Restricted operations</h4>
            <p>
              These operations are never available from the compliance console. The API refuses them with a 403 before
              any state changes, and every attempt is written to the decision log for the Auditor.
            </p>
          </div>
          <div className="cf-rules-restricted-grid">
            {COMPLIANCE_RESTRICTED_OPERATIONS.map((operation) => (
              <div key={operation.id} className="cf-rules-restricted-item">
                <strong>{operation.operation}</strong>
                <em>Owned by {operation.owner}</em>
                <span>{operation.reason}</span>
                <i>{operation.effect}</i>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cf-rules-section">
        <div className="cf-rules-section-head">
          <div>
            <h4>Escalation procedures</h4>
            <p>How a case leaves your hands, who decides it, and the service level attached to each step.</p>
          </div>
        </div>
        {COMPLIANCE_ESCALATION_PROCEDURES.map((procedure) => (
          <div key={procedure.id} className="cf-rules-escalation">
            <div className="cf-rules-escalation-head">
              <strong>{procedure.trigger}</strong>
              <span>
                {procedure.authority} · {procedure.sla}
              </span>
            </div>
            <div className="cf-rules-steps">
              {procedure.steps.map((step, index) => (
                <div key={step.id} className="cf-rules-step">
                  <span className="cf-rules-step-index">{index + 1}</span>
                  <div className="cf-rules-step-copy">
                    <strong>{step.step}</strong>
                    <span>{step.detail}</span>
                  </div>
                  <div className="cf-rules-step-meta">
                    <b>{step.owner}</b>
                    <i>{step.sla}</i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="cf-rules-section">
        <div className="cf-rules-privilege">
          <div>
            <h4>Privilege changes are blocked for this account</h4>
            <p>
              Your role, scope and permissions are fixed when the account is provisioned. The compliance API refuses
              every attempt to grant, revoke or widen a privilege, including on your own account, and each refusal is
              recorded as a denied permission-change event.
            </p>
          </div>
          <div className="cf-rules-privilege-grid">
            {COMPLIANCE_PERMISSION_KEYS.filter((key) => COMPLIANCE_PERMISSIONS[key].module === 'Privileges').map(
              (key) => (
                <div key={key} className="cf-rules-privilege-item">
                  <strong>{COMPLIANCE_PERMISSIONS[key].label}</strong>
                  <span>{COMPLIANCE_PERMISSIONS[key].detail}</span>
                </div>
              ),
            )}
            <div className="cf-rules-privilege-item">
              <strong>Your account today</strong>
              <span>
                {complianceProfile.adminName} · {COMPLIANCE_SCOPE.role} · {COMPLIANCE_SCOPE.state} ·{' '}
                {complianceProfile.adminEmail}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
