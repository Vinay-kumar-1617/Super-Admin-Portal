import { useEffect, useMemo, useState } from 'react'
import { cityProfile, zoneRows } from './cityAdminData'
import {
  allPermissions,
  cityUsers,
  cityUserRoles,
  historyActionTypes,
  lockedPermissions,
  permissionGroups,
  rolePermissions,
  roleScope,
  userTabs,
  type CityUser,
  type CityUserRole,
  type CityUserStatus,
  type UserTab,
} from './userManagementData'

const statusTone: Record<CityUserStatus, string> = {
  Active: 'green',
  Inactive: 'slate',
  Suspended: 'red',
  Invited: 'amber',
}

const statusFilters: Array<'All' | CityUserStatus> = ['All', 'Active', 'Inactive', 'Suspended', 'Invited']

type UserDraft = {
  id: string | null
  name: string
  email: string
  phone: string
  role: CityUserRole
  zone: string
  status: CityUserStatus
  permissions: string[]
}

const emptyUserDraft = (): UserDraft => ({
  id: null,
  name: '',
  email: '',
  phone: '',
  role: 'Dispatcher',
  zone: zoneRows[0]?.name ?? '',
  status: 'Invited',
  permissions: [...rolePermissions.Dispatcher],
})

type UserManagementSectionProps = {
  onToast?: (message: string) => void
}

export default function UserManagementSection({ onToast }: UserManagementSectionProps) {
  const [tab, setTab] = useState<UserTab>('users')
  const [users, setUsers] = useState<CityUser[]>(cityUsers)
  const [rolePerms, setRolePerms] = useState<Record<CityUserRole, string[]>>(rolePermissions)
  const [roleTab, setRoleTab] = useState<CityUserRole>('Zone Admin')
  const [statusFilter, setStatusFilter] = useState<'All' | CityUserStatus>('All')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | CityUserRole>('All')
  const [historyUser, setHistoryUser] = useState('All')
  const [historyAction, setHistoryAction] = useState('All')
  const [draft, setDraft] = useState<UserDraft | null>(null)

  useEffect(() => {
    if (!draft) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDraft(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [draft])

  const zoneNames = zoneRows.map((zone) => zone.name)

  const totals = useMemo(
    () => ({
      active: users.filter((user) => user.status === 'Active').length,
      inactive: users.filter((user) => user.status === 'Inactive').length,
      suspended: users.filter((user) => user.status === 'Suspended').length,
      invited: users.filter((user) => user.status === 'Invited').length,
      zoneAdmins: users.filter((user) => user.role === 'Zone Admin' && user.status === 'Active').length,
    }),
    [users],
  )

  const filteredUsers = users.filter((user) => {
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter
    const matchesRole = roleFilter === 'All' || user.role === roleFilter
    const term = query.trim().toLowerCase()
    const matchesQuery =
      term === '' || [user.name, user.email, user.zone, user.role, user.id].join(' ').toLowerCase().includes(term)
    return matchesStatus && matchesRole && matchesQuery
  })

  const historyEntries = useMemo(
    () =>
      users.flatMap((user) =>
        user.history.map((entry) => ({ ...entry, userId: user.id, userName: user.name, userRole: user.role })),
      ),
    [users],
  )

  const filteredHistory = historyEntries
    .filter((entry) => historyUser === 'All' || entry.userId === historyUser)
    .filter((entry) => historyAction === 'All' || entry.action === historyAction)

  const openCreate = () => setDraft(emptyUserDraft())
  const openEdit = (user: CityUser) =>
    setDraft({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, zone: user.zone, status: user.status, permissions: [...user.permissions] })

  const setDraftRole = (role: CityUserRole) => {
    if (!draft) return
    const scoped = roleScope[role] === 'Zone'
    setDraft({ ...draft, role, permissions: [...rolePerms[role]], zone: scoped ? (draft.zone === 'City-wide' ? zoneNames[0] ?? '' : draft.zone) : 'City-wide' })
  }

  const toggleDraftPermission = (key: string) => {
    if (!draft || lockedPermissions.includes(key)) return
    setDraft({ ...draft, permissions: draft.permissions.includes(key) ? draft.permissions.filter((item) => item !== key) : [...draft.permissions, key] })
  }

  const saveUser = () => {
    if (!draft || draft.name.trim() === '' || draft.email.trim() === '') return
    if (draft.id) {
      const original = users.find((user) => user.id === draft.id)
      const changes: Array<{ action: string; note: string }> = []
      if (original && original.role !== draft.role) changes.push({ action: 'Role changed', note: `${original.role} → ${draft.role}.` })
      if (original && original.zone !== draft.zone) changes.push({ action: 'Zone changed', note: `${original.zone} → ${draft.zone}.` })
      if (original && original.status !== draft.status)
        changes.push({ action: draft.status === 'Active' ? 'Activated' : 'Deactivated', note: `Status set to ${draft.status}.` })
      if (original && original.permissions.slice().sort().join() !== draft.permissions.slice().sort().join())
        changes.push({ action: 'Permissions updated', note: `${draft.permissions.length} permissions granted.` })
      setUsers((prev) =>
        prev.map((user) =>
          user.id === draft.id
            ? {
                ...user,
                name: draft.name.trim(),
                email: draft.email.trim(),
                phone: draft.phone.trim(),
                role: draft.role,
                zone: draft.zone,
                status: draft.status,
                permissions: [...draft.permissions],
                history: [
                  ...user.history,
                  ...changes.map((change, index) => ({
                    id: `${user.id}-h${user.history.length + index + 1}`,
                    action: change.action,
                    actor: cityProfile.adminName,
                    role: 'City Admin',
                    time: 'just now',
                    note: change.note,
                  })),
                ],
              }
            : user,
        ),
      )
      onToast?.(`${draft.name} updated`)
    } else {
      const id = `USR-${4070 + users.length}`
      setUsers((prev) => [
        ...prev,
        {
          id,
          name: draft.name.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim(),
          role: draft.role,
          zone: draft.zone,
          status: draft.status,
          permissions: [...draft.permissions],
          lastLogin: '—',
          lastLoginIp: '—',
          mfa: false,
          createdAt: 'just now',
          history: [{ id: `${id}-h1`, action: draft.status === 'Invited' ? 'Invited' : 'Created', actor: cityProfile.adminName, role: 'City Admin', time: 'just now' }],
        },
      ])
      onToast?.(`${draft.name} created as ${draft.role}`)
    }
    setDraft(null)
  }

  const toggleStatus = (user: CityUser) => {
    const next: CityUserStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: next,
              history: [
                ...item.history,
                { id: `${item.id}-h${item.history.length + 1}`, action: next === 'Active' ? 'Activated' : 'Deactivated', actor: cityProfile.adminName, role: 'City Admin', time: 'just now' },
              ],
            }
          : item,
      ),
    )
    onToast?.(`${user.name} ${next === 'Active' ? 'activated' : 'deactivated'}`)
  }

  const toggleRolePermission = (role: CityUserRole, key: string) => {
    if (lockedPermissions.includes(key)) return
    setRolePerms((prev) => ({
      ...prev,
      [role]: prev[role].includes(key) ? prev[role].filter((item) => item !== key) : [...prev[role], key],
    }))
  }

  const assignZoneAdmin = (zoneName: string, userId: string) => {
    if (userId === '') return
    const officer = users.find((user) => user.id === userId)
    if (!officer) return
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              zone: zoneName,
              status: user.status === 'Invited' ? 'Active' : user.status,
              history: [...user.history, { id: `${user.id}-h${user.history.length + 1}`, action: 'Zone changed', actor: cityProfile.adminName, role: 'City Admin', time: 'just now', note: `Assigned as Zone Admin for ${zoneName}.` }],
            }
          : user,
      ),
    )
    onToast?.(`${officer.name} assigned as Zone Admin for ${zoneName}`)
  }

  const reassignStaffZone = (userId: string, zoneName: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, zone: zoneName, history: [...user.history, { id: `${user.id}-h${user.history.length + 1}`, action: 'Zone changed', actor: cityProfile.adminName, role: 'City Admin', time: 'just now', note: `Reassigned to ${zoneName}.` }] }
          : user,
      ),
    )
    onToast?.('Staff reassigned')
  }

  const zoneAdmins = users.filter((user) => user.role === 'Zone Admin')
  const operationalStaff = users.filter((user) => user.role !== 'Zone Admin')

  const draftScope = draft ? roleScope[draft.role] : 'Zone'

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>User management</h3>
          <span className="sa-panel-sub">Authorized users, roles and assignments inside {cityProfile.name}, {cityProfile.state}</span>
        </div>
        <div className="finance-header-controls">
          <span className="sa-pill green">Within City Admin authority</span>
        </div>
      </div>

      <div className="sa-chip-row finance-tabs">
        {userTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sa-chip ${tab === item.id ? 'active orange' : ''}`}
            onClick={() => setTab(item.id)}
            title={item.hint}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="finance-summary">
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Total users</span>
          <strong>{users.length}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Active</span>
          <strong>{totals.active}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Inactive</span>
          <strong>{totals.inactive}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Suspended</span>
          <strong>{totals.suspended}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Invited</span>
          <strong>{totals.invited}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Zone Admins</span>
          <strong>{totals.zoneAdmins}</strong>
        </div>
      </div>

      {tab === 'users' && (
        <>
          <div className="sa-toolbar">
            {statusFilters.map((option) => (
              <button
                key={option}
                type="button"
                className={`sa-chip ${statusFilter === option ? 'active orange' : ''}`}
                onClick={() => setStatusFilter(option)}
              >
                {option === 'All' ? 'All' : option}
              </button>
            ))}
            <input className="sa-input" aria-label="Search users" placeholder="Search name, email, zone or id..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <select className="sa-select" aria-label="Filter by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'All' | CityUserRole)}>
              <option value="All">All roles</option>
              {cityUserRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button type="button" className="sa-btn-ghost" onClick={() => { setQuery(''); setRoleFilter('All'); setStatusFilter('All') }}>
              Reset
            </button>
            <button type="button" className="sa-btn primary" onClick={openCreate}>
              Create user
            </button>
            <span className="sa-toolbar-meta">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="sa-empty">
              <p>No users match the current filters.</p>
              <button type="button" className="sa-btn-ghost" onClick={() => { setQuery(''); setRoleFilter('All'); setStatusFilter('All') }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Assigned zone</th>
                    <th>Permissions</th>
                    <th>Last login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="sa-cell-strong">
                        {user.name}
                        <span className="sa-cell-sub">{user.email}</span>
                      </td>
                      <td>
                        <span className="sa-pill blue">{user.role}</span>
                        <span className="sa-cell-sub">{user.id}</span>
                      </td>
                      <td>{user.zone}</td>
                      <td className="sa-num">{user.permissions.length}</td>
                      <td className="sa-cell-strong">
                        {user.lastLogin}
                        <span className="sa-cell-sub">{user.lastLoginIp}</span>
                      </td>
                      <td>
                        <span className={`sa-pill ${statusTone[user.status]}`}>{user.status}</span>
                        {user.mfa && <span className="sa-cell-sub">MFA on</span>}
                      </td>
                      <td>
                        <div className="sa-table-actions">
                          <button type="button" className="sa-table-act" onClick={() => openEdit(user)}>
                            Edit
                          </button>
                          {user.status === 'Active' ? (
                            <button type="button" className="sa-table-act danger" onClick={() => toggleStatus(user)}>
                              Deactivate
                            </button>
                          ) : (
                            <button type="button" className="sa-table-act" onClick={() => toggleStatus(user)}>
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'roles' && (
        <>
          <div className="reports-note">
            <span className="sa-pill amber">Authority limit</span>
            <span>Select a role, then switch its permissions on or off. Permissions marked with a lock stay with State Admin.</span>
          </div>

          <div className="sa-chip-row finance-tabs">
            {cityUserRoles.map((role) => (
              <button
                key={role}
                type="button"
                className={`sa-chip ${roleTab === role ? 'active orange' : ''}`}
                onClick={() => setRoleTab(role)}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="finance-summary">
            <div className="finance-summary-item">
              <span className="sa-approval-meta">Scope</span>
              <strong>{roleScope[roleTab] === 'Zone' ? 'One zone' : 'Whole city'}</strong>
            </div>
            <div className="finance-summary-item">
              <span className="sa-approval-meta">Permissions</span>
              <strong>
                {rolePerms[roleTab].length} of {allPermissions.length}
              </strong>
            </div>
            <div className="finance-summary-item">
              <span className="sa-approval-meta">Users with this role</span>
              <strong>{users.filter((user) => user.role === roleTab).length}</strong>
            </div>
          </div>

          {permissionGroups.map((group) => (
            <div key={group.group}>
              <span className="sa-approval-meta">{group.group}</span>
              <div className="sa-chip-row">
                {group.permissions.map((permission) => {
                  const locked = Boolean(permission.locked)
                  const granted = rolePerms[roleTab].includes(permission.key)
                  return (
                    <button
                      key={permission.key}
                      type="button"
                      className={`sa-chip ${granted ? 'active orange' : ''}`}
                      disabled={locked}
                      title={locked ? 'Requires State Admin authority' : granted ? `Remove "${permission.label}"` : `Add "${permission.label}"`}
                      style={{ opacity: locked ? 0.5 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}
                      onClick={() => toggleRolePermission(roleTab, permission.key)}
                    >
                      {locked ? '🔒 ' : granted ? '✓ ' : ''}
                      {permission.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="sa-toolbar">
            <span className="sa-toolbar-meta">
              {roleTab} · {roleScope[roleTab] === 'Zone' ? 'assigned to a single zone' : 'applies across all zones'}
            </span>
            <button type="button" className="sa-btn-ghost" onClick={() => setRolePerms({ ...rolePerms, [roleTab]: [...rolePermissions[roleTab]] })}>
              Reset to default
            </button>
          </div>
        </>
      )}

      {tab === 'assignments' && (
        <>
          <div className="support-section-title">
            <span>Zone Admins</span>
            <span className="sa-approval-meta">{zoneNames.length} zones · {totals.zoneAdmins} admins active</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Area</th>
                  <th>Assigned Zone Admin</th>
                  <th>Operational staff</th>
                </tr>
              </thead>
              <tbody>
                {zoneRows.map((zone) => {
                  const assigned = users.find((user) => user.role === 'Zone Admin' && user.zone === zone.name)
                  const staff = users.filter((user) => user.role !== 'Zone Admin' && user.zone === zone.name).length
                  return (
                    <tr key={zone.id}>
                      <td className="sa-cell-strong">{zone.name}</td>
                      <td>{zone.area}</td>
                      <td>
                        <select className="sa-select" aria-label={`Assign Zone Admin for ${zone.name}`} value={assigned?.id ?? ''} onChange={(event) => assignZoneAdmin(zone.name, event.target.value)}>
                          <option value="">Unassigned</option>
                          {zoneAdmins.map((admin) => (
                            <option key={admin.id} value={admin.id}>
                              {admin.name} {admin.zone !== 'City-wide' ? `· ${admin.zone}` : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="sa-num">{staff}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="support-section-title">
            <span>Operational staff</span>
            <span className="sa-approval-meta">{operationalStaff.length} permitted staff</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Role</th>
                  <th>Assigned zone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {operationalStaff.map((user) => (
                  <tr key={user.id}>
                    <td className="sa-cell-strong">
                      {user.name}
                      <span className="sa-cell-sub">{user.id}</span>
                    </td>
                    <td>
                      <span className="sa-pill blue">{user.role}</span>
                    </td>
                    <td>
                      <select className="sa-select" aria-label={`Assign zone for ${user.name}`} value={zoneNames.includes(user.zone) ? user.zone : ''} onChange={(event) => reassignStaffZone(user.id, event.target.value)}>
                        <option value="">City-wide</option>
                        {zoneNames.map((zoneName) => (
                          <option key={zoneName} value={zoneName}>
                            {zoneName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`sa-pill ${statusTone[user.status]}`}>{user.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'activity' && (
        <>
          <div className="sa-toolbar">
            <select className="sa-select" aria-label="Filter history by user" value={historyUser} onChange={(event) => setHistoryUser(event.target.value)}>
              <option value="All">All users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} · {user.id}
                </option>
              ))}
            </select>
            <select className="sa-select" aria-label="Filter history by action" value={historyAction} onChange={(event) => setHistoryAction(event.target.value)}>
              <option value="All">All actions</option>
              {historyActionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <button type="button" className="sa-btn-ghost" onClick={() => { setHistoryUser('All'); setHistoryAction('All') }}>
              Reset
            </button>
            <span className="sa-toolbar-meta">{filteredHistory.length} history entries</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Time</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((entry) => (
                  <tr key={`${entry.userId}-${entry.id}`}>
                    <td className="sa-cell-strong">
                      {entry.userName}
                      <span className="sa-cell-sub">{entry.userId}</span>
                    </td>
                    <td>{entry.userRole}</td>
                    <td>
                      <span
                        className={`sa-pill ${
                          entry.action === 'Role changed' || entry.action === 'Permissions updated'
                            ? 'purple'
                            : entry.action === 'Deactivated'
                              ? 'red'
                              : entry.action === 'Activated' || entry.action === 'Created' || entry.action === 'Invited'
                                ? 'green'
                                : 'slate'
                        }`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td>
                      {entry.actor}
                      <span className="sa-cell-sub">{entry.role}</span>
                    </td>
                    <td>{entry.time}</td>
                    <td>{entry.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {draft && (
        <div className="sa-modal-overlay" role="presentation" onClick={() => setDraft(null)}>
          <div className="sa-modal wide" role="dialog" aria-modal="true" aria-label={draft.id ? 'Edit user' : 'Create user'} onClick={(event) => event.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h4>{draft.id ? 'Edit user' : 'Create user'}</h4>
                <span className="sa-approval-meta">{cityProfile.name} · {cityProfile.state} only</span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={() => setDraft(null)}>
                ×
              </button>
            </div>
            <div className="sa-modal-body support-body">
              <label className="sa-comment-label" htmlFor="user-name">Full name</label>
              <input id="user-name" className="sa-input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Ramesh Naidu" />
              <label className="sa-comment-label" htmlFor="user-email">Email</label>
              <input id="user-email" className="sa-input" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="name@equiphub.in" />
              <label className="sa-comment-label" htmlFor="user-phone">Phone</label>
              <input id="user-phone" className="sa-input" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="+91 ..." />
              <label className="sa-comment-label" htmlFor="user-role">Role</label>
              <select id="user-role" className="sa-select" value={draft.role} onChange={(event) => setDraftRole(event.target.value as CityUserRole)}>
                {cityUserRoles.map((role) => (
                  <option key={role} value={role}>
                    {role} · {roleScope[role]} scope
                  </option>
                ))}
              </select>
              <label className="sa-comment-label" htmlFor="user-zone">Assigned zone</label>
              {draftScope === 'Zone' ? (
                <select id="user-zone" className="sa-select" value={draft.zone} onChange={(event) => setDraft({ ...draft, zone: event.target.value })}>
                  {zoneNames.map((zoneName) => (
                    <option key={zoneName} value={zoneName}>
                      {zoneName}
                    </option>
                  ))}
                </select>
              ) : (
                <input id="user-zone" className="sa-input" value="City-wide" readOnly />
              )}
              <label className="sa-comment-label" htmlFor="user-status">Account status</label>
              <select id="user-status" className="sa-select" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as CityUserStatus })}>
                {(['Active', 'Inactive', 'Suspended', 'Invited'] as CityUserStatus[]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <div className="support-section-title">
                <span>Permissions</span>
                <span className="sa-approval-meta">{draft.permissions.length} granted · role default applied</span>
              </div>
              {permissionGroups.map((group) => (
                <div key={group.group}>
                  <span className="sa-approval-meta">{group.group}</span>
                  <div className="sa-chip-row">
                    {group.permissions.map((permission) => {
                      const locked = Boolean(permission.locked)
                      const granted = draft.permissions.includes(permission.key)
                      return (
                        <button
                          key={permission.key}
                          type="button"
                          className={`sa-chip ${granted ? 'active orange' : ''}`}
                          disabled={locked}
                          title={locked ? 'Requires State Admin authority' : permission.label}
                          style={{ opacity: locked ? 0.5 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}
                          onClick={() => toggleDraftPermission(permission.key)}
                        >
                          {locked ? '🔒 ' : ''}
                          {permission.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {draft.id && (
                <>
                  <div className="support-section-title">
                    <span>Role-change &amp; activity history</span>
                  </div>
                  <div className="support-notes">
                    {(users.find((user) => user.id === draft.id)?.history ?? []).slice().reverse().map((entry) => (
                      <div key={entry.id} className="support-msg">
                        <div className="support-msg-head">
                          <strong>{entry.action}</strong>
                          <span className="support-msg-meta">{entry.time}</span>
                        </div>
                        <p className="support-msg-body">
                          {entry.actor} · {entry.role}
                          {entry.note ? ` — ${entry.note}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button type="button" className="sa-btn primary" disabled={draft.name.trim() === '' || draft.email.trim() === ''} onClick={saveUser}>
                {draft.id ? 'Save changes' : 'Create user'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
