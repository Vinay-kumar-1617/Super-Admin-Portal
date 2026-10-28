import { useState, type FormEvent } from 'react'
import { initialStaff, type StaffAccount } from './staffData'

const permissionCategories = [
  'Bookings',
  'Fleet',
  'Finance',
  'Operations',
  'Support',
  'Geography',
  'Users',
  'Reports',
  'Security',
  'Settings',
]

const permissionList = [
  { id: 'bookings.read', label: 'View Bookings', category: 'Bookings', description: 'Read booking records' },
  { id: 'bookings.manage', label: 'Manage Bookings', category: 'Bookings', description: 'Create, update and cancel bookings' },
  { id: 'fleet.read', label: 'View Fleet', category: 'Fleet', description: 'View equipment inventory' },
  { id: 'fleet.manage', label: 'Manage Fleet', category: 'Fleet', description: 'Update and assign fleet assets' },
  { id: 'finance.read', label: 'View Finance', category: 'Finance', description: 'Access financial records and reports' },
  { id: 'payout.review', label: 'Review Payouts', category: 'Finance', description: 'Review pending payout requests' },
  { id: 'payout.approve', label: 'Approve Payouts', category: 'Finance', description: 'Approve or reject payouts' },
  { id: 'operations.manage', label: 'Manage Operations', category: 'Operations', description: 'Manage daily operations and workflows' },
  { id: 'support.manage', label: 'Manage Support', category: 'Support', description: 'Handle support tickets and requests' },
  { id: 'geography.manage', label: 'Manage Geography', category: 'Geography', description: 'Manage zones, cities and service areas' },
  { id: 'users.manage', label: 'Manage Users', category: 'Users', description: 'Manage user accounts and profiles' },
  { id: 'role.grant', label: 'Grant Roles', category: 'Security', description: 'Assign and revoke user roles' },
  { id: 'reports.read', label: 'View Reports', category: 'Reports', description: 'Access operational and business reports' },
  { id: 'reports.export', label: 'Export Reports', category: 'Reports', description: 'Download report data' },
  { id: 'audit.read', label: 'View Audit Log', category: 'Security', description: 'Access system audit trails' },
  { id: 'settings.manage', label: 'Manage Settings', category: 'Settings', description: 'Configure platform settings' },
]

type RolePermissionMatrix = Record<string, string[]>

const defaultMatrix: RolePermissionMatrix = {
  'Super Admin': permissionList.map((permission) => permission.id),
  'State Admin': ['bookings.read', 'bookings.manage', 'fleet.read', 'finance.read', 'geography.manage', 'users.manage', 'reports.read'],
  'City Admin': ['bookings.read', 'bookings.manage', 'fleet.read', 'operations.manage', 'geography.manage', 'users.manage', 'reports.read'],
  'Zone Admin': ['bookings.read', 'bookings.manage', 'operations.manage', 'fleet.read', 'reports.read'],
  'Finance Admin': ['finance.read', 'payout.review', 'payout.approve', 'reports.read', 'reports.export'],
  'Support Admin': ['bookings.read', 'support.manage', 'reports.read'],
  Operator: ['fleet.read', 'operations.manage'],
  Auditor: ['audit.read', 'reports.read', 'finance.read'],
}

const roleScopes: Record<string, string> = {
  'Super Admin': 'Platform-wide',
  'State Admin': 'Assigned state',
  'City Admin': 'Assigned city',
  'Zone Admin': 'Assigned zone',
  'Finance Admin': 'Finance operations',
  'Support Admin': 'Support operations',
  Operator: 'Assigned operations',
  Auditor: 'Read-only review',
}

type RolesPermissionsPageProps = {
  onBack?: () => void
  embedded?: boolean
  staff?: StaffAccount[]
}

export default function RolesPermissionsPage({
  onBack,
  embedded = false,
  staff = initialStaff,
}: RolesPermissionsPageProps) {
  const [roleMatrix, setRoleMatrix] = useState<RolePermissionMatrix>(defaultMatrix)
  const [selectedRole, setSelectedRole] = useState('Super Admin')
  const [customRoleName, setCustomRoleName] = useState('')
  const [notice, setNotice] = useState('')

  const roles = Object.keys(roleMatrix).sort()
  const currentPermissions = roleMatrix[selectedRole] || []
  const totalPermissions = permissionList.length
  const grantedCount = currentPermissions.length
  const usersWithRole = staff.filter((account) => account.role === selectedRole).length

  const togglePermission = (permissionId: string) => {
    setRoleMatrix((previous) => {
      const current = previous[selectedRole] || []
      const updated = current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
      return { ...previous, [selectedRole]: updated }
    })
  }

  const selectAllForCategory = (category: string) => {
    const categoryIds = permissionList
      .filter((permission) => permission.category === category)
      .map((permission) => permission.id)
    if (categoryIds.length === 0) return

    setRoleMatrix((previous) => {
      const current = previous[selectedRole] || []
      const allSelected = categoryIds.every((id) => current.includes(id))
      const updated = allSelected
        ? current.filter((id) => !categoryIds.includes(id))
        : [...new Set([...current, ...categoryIds])]
      return { ...previous, [selectedRole]: updated }
    })
  }

  const addCustomRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = customRoleName.trim()
    if (!name) return
    if (Object.hasOwn(roleMatrix, name)) {
      setNotice('Role already exists')
      return
    }
    setRoleMatrix((previous) => ({ ...previous, [name]: [] }))
    setSelectedRole(name)
    setCustomRoleName('')
    setNotice(`Custom role "${name}" created`)
  }

  const hasPermission = (permissionId: string) => currentPermissions.includes(permissionId)

  return (
    <section className="access-admin-page" aria-label="Roles and permissions">
      <style>{`
        .access-admin-page { display: grid; gap: 14px; min-width: 0; }
        .access-admin-header, .access-admin-panel { min-width: 0; background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 16px; box-shadow: 0 10px 30px rgba(15,23,42,0.04); }
        .access-admin-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; border-left: 4px solid var(--brand-orange); }
        .header-kicker { margin: 0 0 5px; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 800; }
        .access-admin-header h2 { margin: 0; font-size: 1.3rem; }
        .access-admin-header p { margin: 5px 0 0; color: var(--muted); font-size: 0.82rem; }
        .access-admin-panel { overflow: hidden; }
        .access-admin-panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 18px; border-bottom: 1px solid rgba(15,23,42,0.07); }
        .access-admin-panel-heading h3 { margin: 0; font-size: 0.95rem; }
        .access-admin-panel-heading p { margin: 4px 0 0; color: var(--muted); font-size: 0.74rem; }
        .access-admin-create-form { display: grid; grid-template-columns: minmax(180px, 1fr) auto; align-items: end; gap: 10px; padding: 14px 18px; }
        .access-admin-field { display: grid; gap: 5px; min-width: 0; }
        .access-admin-field label { color: #64748b; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
        .access-admin-field input { width: 100%; min-width: 0; min-height: 36px; padding: 8px 10px; border: 1px solid rgba(15,23,42,0.14); border-radius: 9px; background: #fff; color: #182230; font: inherit; font-size: 0.8rem; }
        .access-admin-field input:focus { outline: 2px solid rgba(255,107,44,0.35); outline-offset: 1px; border-color: var(--brand-orange); }
        .access-admin-button { min-height: 36px; border: 1px solid rgba(15,23,42,0.12); border-radius: 9px; padding: 8px 12px; background: #fff; color: #182230; font: inherit; font-size: 0.76rem; font-weight: 800; cursor: pointer; white-space: nowrap; }
        .access-admin-button.primary { border-color: transparent; background: #fff0e9; color: #d74313; }
        .access-admin-notice { margin: 0; padding: 10px 14px; border-radius: 10px; background: rgba(37,99,235,0.08); color: #1d4ed8; font-size: 0.8rem; }
        .access-admin-roles { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 18px; }
        .access-admin-role-chip { min-height: 34px; padding: 7px 13px; border: 1px solid transparent; border-radius: 999px; background: #f1f4f6; color: #64748b; font: inherit; font-size: 0.76rem; font-weight: 750; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
        .access-admin-role-chip:hover { background: #e8edf0; color: #334155; }
        .access-admin-role-chip.active { background: #fff0e9; color: #dd4518; }
        .access-admin-guidance { display: flex; align-items: center; gap: 8px; padding: 0 18px 12px; color: #8a96a6; font-size: 0.74rem; }
        .access-admin-guidance strong { padding: 4px 9px; border-radius: 999px; background: #fff3e7; color: #b45309; font-size: 0.68rem; }
        .access-admin-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .access-admin-summary-card { min-width: 0; padding: 13px 15px; border: 1px solid rgba(15,23,42,0.08); border-radius: 13px; background: #f8fafb; }
        .access-admin-summary-card span { display: block; color: #8a96a6; font-size: 0.68rem; font-weight: 700; }
        .access-admin-summary-card strong { display: block; margin-top: 5px; color: #182230; font-size: 1.02rem; font-weight: 800; }
        .access-admin-permissions { display: grid; gap: 0; }
        .access-admin-category { padding: 12px 0; border-bottom: 1px solid rgba(15,23,42,0.06); }
        .access-admin-category:last-child { border-bottom: 0; }
        .access-admin-category-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .access-admin-category-heading h4 { margin: 0; color: #64748b; font-size: 0.68rem; font-weight: 800; }
        .access-admin-category-tools { display: flex; align-items: center; gap: 8px; }
        .access-admin-category-count { color: #94a3b8; font-size: 0.67rem; font-weight: 700; }
        .access-admin-bulk-toggle { padding: 4px 8px; border: 0; border-radius: 7px; background: transparent; color: #64748b; font: inherit; font-size: 0.68rem; font-weight: 700; cursor: pointer; }
        .access-admin-bulk-toggle:hover { background: #f1f5f9; color: #334155; }
        .access-admin-perm-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .access-admin-perm-item { display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 6px 10px; border: 1px solid transparent; border-radius: 999px; background: #f1f4f6; color: #64748b; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
        .access-admin-perm-item:hover { background: #e9eef1; color: #334155; }
        .access-admin-perm-item.enabled { background: #fff0e9; color: #dd4518; }
        .access-admin-perm-item input { width: 14px; height: 14px; margin: 0; accent-color: #ef4a12; }
        .access-admin-perm-item span { font-size: 0.72rem; font-weight: 700; }
        .access-admin-perm-item small { display: none; }
        .access-admin-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-top: 1px solid rgba(15,23,42,0.06); background: #fbfcfd; }
        .access-admin-footer p { margin: 0; color: #8a96a6; font-size: 0.72rem; font-weight: 650; }
        .access-admin-reset { border-color: rgba(15,23,42,0.1); }
        @media (max-width: 680px) {
          .access-admin-header, .access-admin-panel-heading { align-items: flex-start; flex-direction: column; }
          .access-admin-summary { grid-template-columns: 1fr; }
          .access-admin-create-form { grid-template-columns: minmax(0, 1fr); }
          .access-admin-create-form .access-admin-button { justify-self: start; }
          .access-admin-guidance { align-items: flex-start; flex-direction: column; }
          .access-admin-footer { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      {!embedded && (
        <header className="access-admin-header">
          <div>
            <p className="header-kicker">Organization &amp; Access</p>
            <h2>Roles &amp; Permissions</h2>
            <p>Choose a role to review and update its access.</p>
          </div>
          {onBack && <button type="button" className="access-admin-button" onClick={onBack}>← Back to dashboard</button>}
        </header>
      )}

      {notice && <p className="access-admin-notice" role="status">{notice}</p>}

      <section className="access-admin-panel" aria-label="Role permissions">
        <div className="access-admin-panel-heading">
          <div>
            <h3>Role permissions</h3>
            <p>Permissions are configured by role; assigned scope is enforced separately.</p>
          </div>
        </div>

        <form className="access-admin-create-form" onSubmit={addCustomRole}>
          <div className="access-admin-field">
            <label htmlFor="custom-role-name">Create a custom role</label>
            <input
              id="custom-role-name"
              value={customRoleName}
              onChange={(event) => setCustomRoleName(event.target.value)}
              placeholder="Enter role name"
            />
          </div>
          <button type="submit" className="access-admin-button primary">Create role</button>
        </form>

        <div className="access-admin-guidance">
          <strong>Role access</strong>
          <span>Select a role, then switch its permissions on or off.</span>
        </div>

        <nav className="access-admin-roles" aria-label="Select a role">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              className={`access-admin-role-chip ${selectedRole === role ? 'active' : ''}`}
              aria-pressed={selectedRole === role}
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </nav>

        <div className="access-admin-panel-heading">
          <h3>{selectedRole}</h3>
        </div>

        <div className="access-admin-permissions">
          <div className="access-admin-summary">
            <div className="access-admin-summary-card">
              <span>Scope</span>
              <strong>{roleScopes[selectedRole] ?? 'Custom scope'}</strong>
            </div>
            <div className="access-admin-summary-card">
              <span>Permissions</span>
              <strong>{grantedCount} of {totalPermissions}</strong>
            </div>
            <div className="access-admin-summary-card">
              <span>Users with this role</span>
              <strong>{usersWithRole}</strong>
            </div>
          </div>

          <div>
            {permissionCategories.map((category) => {
              const categoryPermissions = permissionList.filter((permission) => permission.category === category)
              if (categoryPermissions.length === 0) return null
              const selectedCount = categoryPermissions.filter((permission) => hasPermission(permission.id)).length
              const allSelected = selectedCount === categoryPermissions.length

              return (
                <section key={category} className="access-admin-category" aria-label={`${category} permissions`}>
                  <div className="access-admin-category-heading">
                    <h4>{category}</h4>
                    <div className="access-admin-category-tools">
                      <span className="access-admin-category-count">{selectedCount} of {categoryPermissions.length}</span>
                      <button
                        type="button"
                        className="access-admin-bulk-toggle"
                        onClick={() => selectAllForCategory(category)}
                      >
                        {allSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                  </div>
                  <div className="access-admin-perm-grid">
                    {categoryPermissions.map((permission) => (
                      <label
                        key={permission.id}
                        className={`access-admin-perm-item ${hasPermission(permission.id) ? 'enabled' : ''}`}
                        title={permission.description}
                      >
                        <input
                          type="checkbox"
                          checked={hasPermission(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <span>{permission.label}</span>
                        <small>{permission.description}</small>
                      </label>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>

        <footer className="access-admin-footer">
          <p>{selectedRole} · {roleScopes[selectedRole] ?? 'Custom scope'}</p>
          <button
            type="button"
            className="access-admin-button access-admin-reset"
            onClick={() => setRoleMatrix((previous) => ({
              ...previous,
              [selectedRole]: defaultMatrix[selectedRole] ?? [],
            }))}
          >
            Reset to default
          </button>
        </footer>
      </section>
    </section>
  )
}
