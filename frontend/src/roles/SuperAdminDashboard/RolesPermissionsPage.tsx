import { useState, type FormEvent } from 'react'
import { roleOptions } from './staffData'

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
  { id: 'bookings.read', label: 'View Bookings', category: 'Bookings', description: 'Read-only access to booking records' },
  { id: 'bookings.manage', label: 'Manage Bookings', category: 'Bookings', description: 'Create, update, and cancel bookings' },
  { id: 'fleet.read', label: 'View Fleet', category: 'Fleet', description: 'View vehicles and equipment inventory' },
  { id: 'fleet.manage', label: 'Manage Fleet', category: 'Fleet', description: 'Add, update, and assign fleet assets' },
  { id: 'finance.read', label: 'View Finance', category: 'Finance', description: 'Access financial records and reports' },
  { id: 'payout.review', label: 'Review Payouts', category: 'Finance', description: 'Review pending payout requests' },
  { id: 'payout.approve', label: 'Approve Payouts', category: 'Finance', description: 'Approve or reject payouts' },
  { id: 'operations.manage', label: 'Manage Operations', category: 'Operations', description: 'Oversee daily operations and workflows' },
  { id: 'support.manage', label: 'Manage Support', category: 'Support', description: 'Handle support tickets and requests' },
  { id: 'geography.manage', label: 'Manage Geography', category: 'Geography', description: 'Manage zones, cities, and service areas' },
  { id: 'users.manage', label: 'Manage Users', category: 'Users', description: 'Manage user accounts and profiles' },
  { id: 'role.grant', label: 'Grant Roles', category: 'Security', description: 'Assign and revoke user roles' },
  { id: 'reports.read', label: 'View Reports', category: 'Reports', description: 'Access operational and business reports' },
  { id: 'reports.export', label: 'Export Reports', category: 'Reports', description: 'Download and export report data' },
  { id: 'audit.read', label: 'View Audit Log', category: 'Security', description: 'Access system audit trails' },
  { id: 'settings.manage', label: 'Manage Settings', category: 'Settings', description: 'Configure system and platform settings' },
]

type RolePermissionMatrix = Record<string, string[]>

const defaultMatrix: RolePermissionMatrix = {
  'Super Admin': permissionList.map((p) => p.id),
  'State Admin': ['bookings.read', 'bookings.manage', 'fleet.read', 'finance.read', 'geography.manage', 'users.manage', 'reports.read'],
  'City Admin': ['bookings.read', 'bookings.manage', 'fleet.read', 'operations.manage', 'geography.manage', 'users.manage', 'reports.read'],
  'Zone Admin': ['bookings.read', 'bookings.manage', 'operations.manage', 'fleet.read', 'reports.read'],
  'Finance Admin': ['finance.read', 'payout.review', 'payout.approve', 'reports.read', 'reports.export'],
  'Support Admin': ['bookings.read', 'support.manage', 'reports.read'],
  'Operator': ['fleet.read', 'operations.manage'],
  'Auditor': ['audit.read', 'reports.read', 'finance.read'],
}

const defaultLimits: Record<string, number> = {
  'Super Admin': 1000000,
  'State Admin': 500000,
  'City Admin': 200000,
  'Zone Admin': 75000,
  'Finance Admin': 200000,
  'Support Admin': 0,
  'Operator': 0,
  'Auditor': 0,
}

type RolesPermissionsPageProps = {
  onBack?: () => void
}

export default function RolesPermissionsPage({ onBack }: RolesPermissionsPageProps) {
  const [roleMatrix, setRoleMatrix] = useState<RolePermissionMatrix>(defaultMatrix)
  const [limits, setLimits] = useState<Record<string, number>>(defaultLimits)
  const [selectedRole, setSelectedRole] = useState('Super Admin')
  const [customRoleName, setCustomRoleName] = useState('')
  const [notice, setNotice] = useState('')

  const togglePermission = (permId: string) => {
    setRoleMatrix((prev) => {
      const current = prev[selectedRole] || []
      const hasPerm = current.includes(permId)
      const updated = hasPerm ? current.filter((p) => p !== permId) : [...current, permId]
      return { ...prev, [selectedRole]: updated }
    })
  }

  const selectAllForCategory = (category: string) => {
    const permsInCat = permissionList.filter((p) => p.category === category).map((p) => p.id)
    if (permsInCat.length === 0) return
    setRoleMatrix((prev) => {
      const current = prev[selectedRole] || []
      const allSelected = permsInCat.every((id) => current.includes(id))
      const updated = allSelected ? current.filter((id) => !permsInCat.includes(id)) : [...new Set([...current, ...permsInCat])]
      return { ...prev, [selectedRole]: updated }
    })
  }

  const addCustomRole = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = customRoleName.trim()
    if (!name) return
    if (roleOptions.includes(name as any) || (roleMatrix as any)[name]) {
      setNotice('Role already exists')
      return
    }
    setRoleMatrix((prev) => ({ ...prev, [name]: [] }))
    setLimits((prev) => ({ ...prev, [name]: 0 }))
    setSelectedRole(name)
    setCustomRoleName('')
    setNotice(`Custom role "${name}" created`)
  }

  const hasPermission = (permId: string) => (roleMatrix[selectedRole] || []).includes(permId)
  const currentPermissions = roleMatrix[selectedRole] || []
  const totalPermissions = permissionList.length
  const grantedCount = currentPermissions.length

  return (
    <section className="access-admin-page" aria-label="Roles and permissions">
      <style>{`
        .access-admin-page { display: grid; gap: 20px; min-width: 0; }
        .access-admin-header, .access-admin-panel { background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 16px; box-shadow: 0 10px 30px rgba(15,23,42,0.05); }
        .access-admin-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 24px 26px; border-left: 4px solid var(--brand-orange); }
        .header-kicker { margin: 0 0 6px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 800; }
        .access-admin-header h2 { margin: 4px 0 8px; font-size: 1.55rem; }
        .access-admin-header p { margin: 0; color: var(--muted); line-height: 1.6; font-size: 0.88rem; }
        .access-admin-panel { min-width: 0; overflow: hidden; }
        .access-admin-panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 22px; border-bottom: 1px solid rgba(15,23,42,0.07); }
        .access-admin-panel-header h3 { margin: 0 0 4px; font-size: 1.02rem; }
        .access-admin-panel-header p { margin: 0; color: var(--muted); font-size: 0.78rem; }
        .access-admin-form { display: grid; grid-template-columns: 2fr 1fr auto; align-items: end; gap: 12px; padding: 18px 22px; }
        .access-admin-field { display: grid; gap: 6px; min-width: 0; }
        .access-admin-field label { color: #475569; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
        .access-admin-field input, .access-admin-field select { width: 100%; min-width: 100px; min-height: 38px; padding: 8px 10px; border: 1px solid rgba(15,23,42,0.14); border-radius: 10px; background: #fff; color: #182230; font: inherit; font-size: 0.8rem; }
        .access-admin-field input:focus, .access-admin-field select:focus { outline: 2px solid rgba(255,107,44,0.35); outline-offset: 1px; border-color: var(--brand-orange); }
        .access-admin-button { min-height: 38px; border: 1px solid rgba(15,23,42,0.12); border-radius: 10px; padding: 9px 14px; background: #fff; color: #182230; font: inherit; font-size: 0.78rem; font-weight: 800; cursor: pointer; white-space: nowrap; }
        .access-admin-button.primary { border-color: var(--brand-orange); background: var(--brand-orange); color: #fff; box-shadow: 0 4px 12px rgba(255,107,44,0.2); }
        .access-admin-notice { margin: 0; padding: 12px 18px; border-radius: 10px; background: rgba(37,99,235,0.08); color: #1d4ed8; font-size: 0.82rem; border: 1px solid rgba(37,99,235,0.18); }
        .access-admin-roles-grid { display: grid; grid-template-columns: 290px 1fr; gap: 0; min-height: 560px; }
        .access-admin-role-list { border-right: 1px solid rgba(15,23,42,0.07); max-height: 640px; overflow-y: auto; }
        .role-list-section-title { padding: 12px 18px 6px; font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
        .access-admin-role-item { width: 100%; padding: 13px 18px; border: 0; border-bottom: 1px solid rgba(15,23,42,0.07); background: #fff; text-align: left; font: inherit; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .access-admin-role-item.active { background: linear-gradient(90deg, rgba(255,107,44,0.1) 0%, #fff 100%); font-weight: 800; color: var(--brand-orange-deep); box-shadow: inset 3px 0 0 var(--brand-orange); }
        .role-item-count { color: #64748b; font-size: 0.74rem; font-weight: 600; }
        .access-admin-perms { padding: 20px 24px; max-height: 640px; overflow-y: auto; }
        .access-admin-cat { margin-bottom: 24px; }
        .access-admin-cat-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .access-admin-cat h4 { margin: 0; font-size: 0.85rem; color: #334155; }
        .cat-badge { font-size: 0.72rem; color: #64748b; background: rgba(100,116,139,0.1); padding: 3px 8px; border-radius: 6px; font-weight: 700; }
        .bulk-toggle { border: 1px solid rgba(15,23,42,0.12); border-radius: 8px; padding: 5px 9px; background: #fff; font-size: 0.72rem; font-weight: 700; cursor: pointer; color: #475569; }
        .access-admin-perm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .access-admin-perm-item { display: flex; align-items: flex-start; gap: 10px; padding: 11px 13px; border: 1px solid rgba(15,23,42,0.08); border-radius: 11px; font-size: 0.8rem; transition: all 0.15s ease; }
        .access-admin-perm-item:hover { border-color: rgba(255,107,44,0.4); box-shadow: 0 4px 14px rgba(255,107,44,0.08); }
        .access-admin-perm-item input { margin-top: 2px; width: 16px; height: 16px; accent-color: var(--brand-orange); }
        .perm-info { display: grid; gap: 2px; }
        .perm-label { font-weight: 700; color: #1e293b; }
        .perm-desc { color: #64748b; font-size: 0.74rem; line-height: 1.4; }
        .access-admin-limits { padding: 16px 22px 20px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; border-top: 1px solid rgba(15,23,42,0.07); }
        .limit-text { color: var(--muted); font-size: 0.8rem; }
        .header-action { border: 1px solid rgba(15,23,42,0.12); border-radius: 10px; padding: 8px 12px; background: #fff; color: #182230; font: inherit; font-size: 0.76rem; font-weight: 800; cursor: pointer; }
        .summary-bar { display: flex; align-items: center; gap: 12px; padding: 12px 22px; border-top: 1px solid rgba(15,23,42,0.07); background: linear-gradient(90deg, rgba(100,116,139,0.04) 0%, #fff 100%); font-size: 0.8rem; color: #475569; }
        .summary-pill { background: rgba(37,99,235,0.1); color: #1d4ed8; padding: 4px 9px; border-radius: 999px; font-weight: 800; font-size: 0.75rem; }
      `}</style>

      <header className="access-admin-header">
        <div>
          <p className="header-kicker">Organization & Access</p>
          <h2>Roles & Permissions</h2>
          <p>Manage role-based permissions and approval limits with live preview per role.</p>
        </div>
        {onBack && <button type="button" className="header-action" onClick={onBack}>← Back to dashboard</button>}
      </header>

      {notice && <p className="access-admin-notice">{notice}</p>}

      <section className="access-admin-panel">
        <div className="access-admin-panel-header">
          <div>
            <h3>Create Custom Role</h3>
            <p>Add a new role and set its default approval limit</p>
          </div>
        </div>
        <form className="access-admin-form" onSubmit={addCustomRole}>
          <div className="access-admin-field">
            <label>Role Name</label>
            <input value={customRoleName} onChange={(e) => setCustomRoleName(e.target.value)} placeholder="e.g. Compliance Officer" />
          </div>
          <div className="access-admin-field">
            <label>Approval Limit (₹)</label>
            <input type="number" min={0} step={1000} value={limits[customRoleName.trim() || selectedRole] ?? 0} onChange={(e) => setLimits((p) => ({ ...p, [customRoleName.trim() || selectedRole]: Number(e.target.value) || 0 }))} disabled={!customRoleName.trim()} placeholder="e.g. 100000" />
          </div>
          <button type="submit" className="access-admin-button primary">Create Role</button>
        </form>
      </section>

      <section className="access-admin-panel">
        <div className="access-admin-panel-header">
          <div>
            <h3>Role Permissions Matrix</h3>
            <p>Configure granular permissions and approval limits for each role</p>
          </div>
          <div className="access-admin-field" style={{ minWidth: 220 }}>
            <label>Select Role</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              {Object.keys(roleMatrix).sort().map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="access-admin-roles-grid">
          <div className="access-admin-role-list">
            <div className="role-list-section-title">Roles ({Object.keys(roleMatrix).length})</div>
            {Object.keys(roleMatrix).sort().map((role) => {
              const rolePerms = roleMatrix[role] || []
              return (
                <button key={role} type="button" className={`access-admin-role-item ${selectedRole === role ? 'active' : ''}`} onClick={() => setSelectedRole(role)}>
                  <span>{role}</span>
                  <span className="role-item-count">{rolePerms.length}/{totalPermissions}</span>
                </button>
              )
            })}
          </div>
          <div>
            <div className="access-admin-perms">
              {permissionCategories.map((cat) => {
                const permsInCat = permissionList.filter((p) => p.category === cat)
                const selectedInCat = permsInCat.filter((p) => hasPermission(p.id)).length
                const allSelected = permsInCat.length > 0 && selectedInCat === permsInCat.length
                return (
                  <div key={cat} className="access-admin-cat">
                    <div className="access-admin-cat-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4>{cat}</h4>
                        <span className="cat-badge">{selectedInCat}/{permsInCat.length} selected</span>
                      </div>
                      <button type="button" className="bulk-toggle" onClick={() => selectAllForCategory(cat)}>
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="access-admin-perm-grid">
                      {permsInCat.map((perm) => (
                        <label key={perm.id} className="access-admin-perm-item">
                          <input type="checkbox" checked={hasPermission(perm.id)} onChange={() => togglePermission(perm.id)} />
                          <div className="perm-info">
                            <span className="perm-label">{perm.label}</span>
                            {perm.description && <span className="perm-desc">{perm.description}</span>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="summary-bar">
              <span>Selected permissions for <strong>{selectedRole}</strong>:</span>
              <span className="summary-pill">{grantedCount}/{totalPermissions} granted</span>
            </div>
          </div>
        </div>
        <div className="access-admin-limits">
          <div className="access-admin-field">
            <label>Approval Limit (₹) for {selectedRole}</label>
            <input type="number" min={0} step={1000} value={limits[selectedRole] ?? 0} onChange={(e) => setLimits((p) => ({ ...p, [selectedRole]: Number(e.target.value) || 0 }))} />
          </div>
          <span className="limit-text">Maximum approval amount authorized for this role</span>
        </div>
      </section>
    </section>
  )
}
