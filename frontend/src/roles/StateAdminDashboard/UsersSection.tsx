import { useMemo, useState, type FormEvent } from 'react'
import { StatCards, StatusPill, type StatCard } from './shared'
import { cityRows, stateProfile, zoneRows } from './stateAdminData'
import {
  AUDIT_TABS,
  type DetailTab,
  DEMO_MANAGED_USERS,
  MANAGED_ROLES,
  PERMISSION_CATALOG,
  ROLE_DEFAULT_PERMISSIONS,
  auditTrailFor,
  formatDateTime,
  formatRelative,
  isForbiddenRole,
  loginHistoryFor,
  roleLabel,
  roleMeta,
  sessionsFor,
  userStatusPillClass,
  usersToCsv,
  type ManagedRoleKey,
  type ManagedUser,
  type ManagedUserStatus,
} from './userManagementData'

const PAGE_SIZE = 7

type UsersSectionProps = {
  onBack?: () => void
}

type AddUserForm = {
  fullName: string
  email: string
  phone: string
  role: ManagedRoleKey
  city: string
  zone: string
  permissions: string[]
  sendInvite: boolean
  requireMfa: boolean
}

type ConfirmState = {
  title: string
  message: string
  confirmLabel: string
  tone: 'brand' | 'red'
  onConfirm: () => void
} | null

const emptyAddForm = (): AddUserForm => ({
  fullName: '',
  email: '',
  phone: '',
  role: 'city-admin',
  city: cityRows.find((city) => city.status === 'Active')?.name ?? '',
  zone: '',
  permissions: [...ROLE_DEFAULT_PERMISSIONS['city-admin']],
  sendInvite: true,
  requireMfa: false,
})

function PermissionsEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
}) {
  const groups = useMemo(() => {
    const map = new Map<string, typeof PERMISSION_CATALOG>()
    PERMISSION_CATALOG.forEach((perm) => {
      const list = map.get(perm.group) ?? []
      list.push(perm)
      map.set(perm.group, list)
    })
    return Array.from(map.entries())
  }, [])

  const toggle = (key: string) => {
    if (disabled) return
    onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key])
  }

  return (
    <div className="um-perm-grid">
      {groups.map(([group, perms]) => (
        <div className="um-perm-group" key={group}>
          <span className="um-perm-group-title">{group}</span>
          {perms.map((perm) => (
            <label key={perm.key} className={`um-perm-item${disabled ? ' disabled' : ''}`}>
              <input
                type="checkbox"
                checked={value.includes(perm.key)}
                onChange={() => toggle(perm.key)}
                disabled={disabled}
              />
              <span>{perm.label}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function UsersSection({ onBack }: UsersSectionProps) {
  const [users, setUsers] = useState<ManagedUser[]>(() => DEMO_MANAGED_USERS.filter((user) => !isForbiddenRole(user.role)))
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | ManagedUserStatus>('All')
  const [roleFilter, setRoleFilter] = useState<'All' | ManagedRoleKey>('All')
  const [cityFilter, setCityFilter] = useState('All')
  const [zoneFilter, setZoneFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [detailUser, setDetailUser] = useState<ManagedUser | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<AddUserForm>(emptyAddForm)
  const [editUser, setEditUser] = useState<ManagedUser | null>(null)
  const [editForm, setEditForm] = useState<AddUserForm>(emptyAddForm)
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [toast, setToast] = useState<string | null>(null)

  const canManage = true

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast((prev) => (prev === message ? null : prev)), 2800)
  }

  const updateUser = (id: string, patch: Partial<ManagedUser>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...patch } : user)))
    setDetailUser((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev))
  }

  const roleOptions = MANAGED_ROLES
  const cityOptions = useMemo(() => cityRows.filter((city) => city.zones > 0).map((city) => city.name), [])
  const zoneOptions = useMemo(() => {
    const scoped = zoneRows.filter((zone) => !cityFilter || cityFilter === 'All' || zone.city === cityFilter)
    return scoped.map((zone) => zone.name)
  }, [cityFilter])

  const scopedUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((user) => {
      if (roleFilter !== 'All' && user.role !== roleFilter) return false
      if (cityFilter !== 'All' && user.city !== cityFilter) return false
      if (zoneFilter !== 'All' && user.zone !== zoneFilter) return false
      if (!q) return true
      return (
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q) ||
        roleLabel(user.role).toLowerCase().includes(q) ||
        (user.city ?? '').toLowerCase().includes(q) ||
        (user.zone ?? '').toLowerCase().includes(q)
      )
    })
  }, [users, query, roleFilter, cityFilter, zoneFilter])

  const filteredUsers = useMemo(
    () => scopedUsers.filter((user) => statusFilter === 'All' || user.status === statusFilter),
    [scopedUsers, statusFilter],
  )

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const counts = useMemo(
    () => ({
      total: scopedUsers.length,
      active: scopedUsers.filter((user) => user.status === 'Active').length,
      inactive: scopedUsers.filter((user) => user.status === 'Inactive').length,
      pending: scopedUsers.filter((user) => user.status === 'Pending').length,
    }),
    [scopedUsers],
  )

  const cards: StatCard[] = [
    { key: 'All', label: 'Total users', value: counts.total, tone: 'brand', sub: `${stateProfile.name} scope` },
    { key: 'Active', label: 'Active', value: counts.active, tone: 'green', sub: `of ${counts.total} total` },
    { key: 'Inactive', label: 'Inactive', value: counts.inactive, tone: 'slate', sub: `of ${counts.total} total` },
    { key: 'Pending', label: 'Pending invites', value: counts.pending, tone: 'amber', sub: `of ${counts.total} total` },
  ]

  const resetPage = () => setPage(1)
  const resetFilters = () => {
    setQuery('')
    setStatusFilter('All')
    setRoleFilter('All')
    setCityFilter('All')
    setZoneFilter('All')
    resetPage()
  }

  const openAdd = () => {
    setAddForm(emptyAddForm())
    setShowAdd(true)
  }

  const openEdit = (user: ManagedUser) => {
    setEditUser(user)
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      city: user.city ?? '',
      zone: user.zone ?? '',
      permissions: [...user.permissions],
      sendInvite: false,
      requireMfa: user.mfaEnabled,
    })
    setDetailUser(null)
  }

  const openDetails = (user: ManagedUser) => {
    setDetailUser(user)
    setDetailTab('overview')
  }

  const handleAddSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!addForm.fullName.trim() || !addForm.email.trim()) {
      showToast('Full name and work email are required.')
      return
    }
    if (isForbiddenRole(addForm.role)) {
      showToast('Super Admin accounts cannot be created from this console.')
      return
    }
    if (users.some((user) => user.email.toLowerCase() === addForm.email.trim().toLowerCase())) {
      showToast('A user with that email already exists in this state.')
      return
    }
    const meta = roleMeta(addForm.role)
    const now = new Date().toISOString()
    const newUser: ManagedUser = {
      id: `usr-${Date.now()}`,
      fullName: addForm.fullName.trim(),
      email: addForm.email.trim().toLowerCase(),
      phone: addForm.phone.trim() || '—',
      role: addForm.role,
      status: addForm.sendInvite ? 'Pending' : 'Active',
      scopeType: meta.scope,
      city: meta.scope === 'state' ? null : addForm.city || null,
      zone: meta.scope === 'zone' ? addForm.zone || null : null,
      state: stateProfile.name,
      lastLogin: null,
      createdAt: now,
      invitedAt: addForm.sendInvite ? now : null,
      emailVerified: !addForm.sendInvite,
      mfaEnabled: addForm.requireMfa,
      permissions: addForm.permissions,
    }
    setUsers((prev) => [newUser, ...prev])
    setShowAdd(false)
    resetPage()
    showToast(addForm.sendInvite ? `Invitation sent to ${newUser.email}.` : `${newUser.fullName} activated.`)
  }

  const handleEditSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!editUser || !canManage) return
    if (isForbiddenRole(editForm.role)) {
      showToast('Super Admin privileges cannot be assigned.')
      return
    }
    const meta = roleMeta(editForm.role)
    updateUser(editUser.id, {
      fullName: editForm.fullName.trim(),
      phone: editForm.phone.trim() || '—',
      role: editForm.role,
      scopeType: meta.scope,
      city: meta.scope === 'state' ? null : editForm.city || null,
      zone: meta.scope === 'zone' ? editForm.zone || null : null,
      permissions: editForm.permissions,
      mfaEnabled: editForm.requireMfa,
    })
    setEditUser(null)
    showToast(`${editForm.fullName.trim()} updated.`)
  }

  const activateUser = (user: ManagedUser) => {
    updateUser(user.id, { status: 'Active', emailVerified: true })
    showToast(`${user.fullName} activated.`)
  }

  const deactivateUser = (user: ManagedUser) => {
    setConfirm({
      title: 'Deactivate user',
      message: `Deactivate ${user.fullName}? They will lose access immediately and all active sessions will be revoked.`,
      confirmLabel: 'Deactivate',
      tone: 'red',
      onConfirm: () => {
        updateUser(user.id, { status: 'Inactive' })
        setConfirm(null)
        showToast(`${user.fullName} deactivated.`)
      },
    })
  }

  const resendInvite = (user: ManagedUser) => {
    updateUser(user.id, { invitedAt: new Date().toISOString() })
    showToast(`Invitation re-sent to ${user.email}.`)
  }

  const resetPassword = (user: ManagedUser) => {
    setConfirm({
      title: 'Send password reset',
      message: `Email a secure password reset link to ${user.email}? Existing sessions stay active until they set a new password.`,
      confirmLabel: 'Send reset link',
      tone: 'brand',
      onConfirm: () => {
        setConfirm(null)
        showToast(`Password reset link sent to ${user.email}.`)
      },
    })
  }

  const revokeSessions = (user: ManagedUser) => {
    setConfirm({
      title: 'Revoke all sessions',
      message: `Sign ${user.fullName} out of every device? They must sign in again to continue.`,
      confirmLabel: 'Revoke sessions',
      tone: 'red',
      onConfirm: () => {
        setConfirm(null)
        showToast(`All sessions revoked for ${user.fullName}.`)
      },
    })
  }

  const exportCsv = () => {
    const csv = usersToCsv(filteredUsers)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `state_users_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Exported ${filteredUsers.length} users to CSV.`)
  }

  const activeRoleScope = (user: ManagedUser) =>
    user.scopeType === 'zone' ? user.zone ?? '—' : user.scopeType === 'city' ? user.city ?? '—' : `${user.state} (state)`

  return (
    <section className="um-section" aria-label="User management">
      <style>{`
        .um-section { display: grid; gap: 16px; }
        .um-scope-note { display: flex; align-items: center; gap: 10px; background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.16); border-radius: 14px; padding: 11px 14px; font-size: 0.78rem; color: #1d4ed8; font-weight: 600; }
        .um-scope-note strong { font-weight: 800; }
        .um-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; background: #fff; border: 1px solid var(--sa-line); border-radius: 18px; padding: 16px 18px; box-shadow: var(--sa-shadow); }
        .um-head h3 { margin: 0; font-size: 1.1rem; letter-spacing: -0.03em; }
        .um-head p { margin: 4px 0 0; font-size: 0.8rem; color: var(--sa-muted); }
        .um-head-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .um-primary { border: 0; border-radius: 10px; padding: 10px 16px; font: inherit; font-size: 0.82rem; font-weight: 800; cursor: pointer; color: #fff; background: linear-gradient(100deg, var(--sa-brand), var(--sa-brand-deep)); box-shadow: 0 10px 22px rgba(239,74,18,0.28); }
        .um-primary[disabled] { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
        .um-toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .um-toolbar .sa-input { flex: 1 1 220px; }
        .um-table-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .um-act { border: 1px solid var(--sa-line); background: #fff; color: var(--sa-text); border-radius: 8px; padding: 5px 10px; font: inherit; font-size: 0.72rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .um-act:hover { border-color: rgba(255,107,44,0.45); color: var(--sa-brand-deep); }
        .um-act.danger:hover { border-color: rgba(239,68,68,0.5); color: #b91c1c; }
        .um-act:disabled { opacity: 0.45; cursor: not-allowed; }
        .um-pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px; border-top: 1px solid rgba(15,23,42,0.06); }
        .um-pager span { font-size: 0.76rem; font-weight: 700; color: var(--sa-muted); }
        .um-pager-btns { display: flex; gap: 8px; }
        .um-avatar { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 0.82rem; color: #fff; background: linear-gradient(135deg, #0ea56f, #08a66c); flex-shrink: 0; }
        .um-avatar.lg { width: 56px; height: 56px; font-size: 1.05rem; }
        .um-name-cell { display: flex; align-items: center; gap: 10px; }
        .um-role-badge { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; background: rgba(124,58,237,0.12); color: #6d28d9; white-space: nowrap; }
        .um-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 1040; display: flex; justify-content: flex-end; }
        .um-drawer { width: min(560px, 100%); height: 100%; background: #f8fafc; box-shadow: -30px 0 60px rgba(15,23,42,0.25); display: flex; flex-direction: column; animation: um-slide 0.22s ease; }
        @keyframes um-slide { from { transform: translateX(40px); opacity: 0.4; } to { transform: translateX(0); opacity: 1; } }
        .um-drawer-head { background: #fff; padding: 18px 20px; border-bottom: 1px solid var(--sa-line); display: grid; gap: 12px; }
        .um-drawer-head-top { display: flex; align-items: flex-start; gap: 14px; }
        .um-drawer-title { display: grid; gap: 3px; min-width: 0; }
        .um-drawer-title strong { font-size: 1.06rem; }
        .um-drawer-title span { font-size: 0.78rem; color: var(--sa-muted); }
        .um-close { margin-left: auto; border: 1px solid var(--sa-line); background: #fff; width: 32px; height: 32px; border-radius: 9px; font-size: 1rem; cursor: pointer; color: #64748b; }
        .um-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .um-tab { border: 1px solid transparent; background: #f2f5f7; color: var(--sa-muted); border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 0.74rem; font-weight: 700; cursor: pointer; }
        .um-tab.active { background: rgba(255,107,44,0.12); color: var(--sa-brand-deep); border-color: rgba(255,107,44,0.3); }
        .um-drawer-body { padding: 18px 20px; overflow-y: auto; display: grid; gap: 16px; align-content: start; }
        .um-card { background: #fff; border: 1px solid var(--sa-line); border-radius: 16px; padding: 16px; display: grid; gap: 12px; }
        .um-card h4 { margin: 0; font-size: 0.9rem; }
        .um-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
        .um-meta { display: grid; gap: 3px; }
        .um-meta span { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--sa-muted); }
        .um-meta strong { font-size: 0.86rem; }
        .um-quick { display: flex; gap: 8px; flex-wrap: wrap; }
        .um-perm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
        .um-perm-group { display: grid; gap: 6px; align-content: start; }
        .um-perm-group-title { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--sa-muted); }
        .um-perm-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; cursor: pointer; }
        .um-perm-item.disabled { opacity: 0.6; cursor: not-allowed; }
        .um-session { display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px solid var(--sa-line); border-radius: 12px; padding: 12px; }
        .um-session div { display: grid; gap: 2px; }
        .um-session strong { font-size: 0.84rem; }
        .um-session span { font-size: 0.72rem; color: var(--sa-muted); }
        .um-current { font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--sa-green); }
        .um-timeline { display: grid; gap: 0; }
        .um-tl-item { display: grid; grid-template-columns: 14px 1fr; gap: 12px; padding-bottom: 14px; position: relative; }
        .um-tl-item:not(:last-child)::before { content: ''; position: absolute; left: 6px; top: 14px; bottom: 0; width: 2px; background: rgba(15,23,42,0.1); }
        .um-tl-dot { width: 12px; height: 12px; border-radius: 999px; margin-top: 3px; background: var(--sa-brand-deep); box-shadow: 0 0 0 3px rgba(255,107,44,0.15); }
        .um-tl-body { display: grid; gap: 2px; }
        .um-tl-body strong { font-size: 0.82rem; }
        .um-tl-body span { font-size: 0.72rem; color: var(--sa-muted); }
        .um-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); z-index: 1050; display: grid; place-items: center; padding: 20px; }
        .um-modal { width: min(640px, 100%); max-height: calc(100vh - 40px); background: #fff; border-radius: 20px; box-shadow: 0 30px 70px rgba(15,23,42,0.35); display: flex; flex-direction: column; overflow: hidden; }
        .um-modal.sm { width: min(440px, 100%); }
        .um-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 20px; border-bottom: 1px solid var(--sa-line); }
        .um-modal-head h3 { margin: 0; font-size: 1.02rem; }
        .um-modal-body { padding: 18px 20px; overflow-y: auto; display: grid; gap: 14px; }
        .um-modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--sa-line); background: #fbfcfd; }
        .um-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .um-checkline { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; }
        .um-required { color: #b91c1c; }
        @media (max-width: 640px) { .um-head { flex-direction: column; } }
      `}</style>

      <div className="um-scope-note">
        <span>🛡️</span>
        <span>
          Restricted to <strong>{stateProfile.name}</strong> · Super Admin accounts and privileges are hidden and cannot be managed from this console.
        </span>
      </div>

      <div className="um-head">
        <div>
          <h3>Users &amp; Access</h3>
          <p>Create staff accounts, assign City / Zone / Finance / Dispatcher / Support roles, manage permissions and sessions.</p>
        </div>
        <div className="um-head-actions">
          {onBack && (
            <button type="button" className="sa-btn-ghost" onClick={onBack}>
              ← Back
            </button>
          )}
          <button type="button" className="sa-btn-ghost" onClick={exportCsv}>
            Export CSV
          </button>
          <button type="button" className="um-primary" onClick={openAdd} disabled={!canManage}>
            + Add User
          </button>
        </div>
      </div>

      <StatCards
        cards={cards}
        activeKey={statusFilter}
        onSelect={(key) => {
          setStatusFilter(statusFilter === key ? 'All' : (key as 'All' | ManagedUserStatus))
          resetPage()
        }}
      />

      <section className="sa-panel">
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search users"
            placeholder="Search name, email, phone, role or location..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetPage()
            }}
          />
          <select
            className="sa-select"
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as 'All' | ManagedUserStatus)
              resetPage()
            }}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
          <select
            className="sa-select"
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as 'All' | ManagedRoleKey)
              resetPage()
            }}
          >
            <option value="All">All roles</option>
            {roleOptions.map((role) => (
              <option key={role.key} value={role.key}>
                {role.label}
              </option>
            ))}
          </select>
          <select
            className="sa-select"
            aria-label="Filter by city"
            value={cityFilter}
            onChange={(event) => {
              setCityFilter(event.target.value)
              setZoneFilter('All')
              resetPage()
            }}
          >
            <option value="All">All cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select
            className="sa-select"
            aria-label="Filter by zone"
            value={zoneFilter}
            onChange={(event) => {
              setZoneFilter(event.target.value)
              resetPage()
            }}
          >
            <option value="All">All zones</option>
            {zoneOptions.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          <button type="button" className="sa-btn-ghost" onClick={resetFilters}>
            Reset
          </button>
          <span className="sa-toolbar-meta">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="sa-empty">
            <p>No users match the current filters.</p>
            <button type="button" className="sa-btn-ghost" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>City / Zone</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="um-name-cell">
                          <span className="um-avatar">
                            {user.fullName
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)}
                          </span>
                          <span className="sa-cell-strong">{user.fullName}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className="um-role-badge">{roleLabel(user.role)}</span>
                      </td>
                      <td>
                        {user.city ?? '—'}
                        {user.zone ? <span className="sa-cell-sub">{user.zone} zone</span> : user.scopeType === 'state' ? <span className="sa-cell-sub">Statewide</span> : null}
                      </td>
                      <td>
                        <StatusPill status={user.status} />
                      </td>
                      <td>{formatRelative(user.lastLogin)}</td>
                      <td>
                        <div className="um-table-actions">
                          <button type="button" className="um-act" onClick={() => openDetails(user)}>
                            View
                          </button>
                          <button type="button" className="um-act" onClick={() => openEdit(user)}>
                            Edit
                          </button>
                          {user.status === 'Active' ? (
                            <button type="button" className="um-act danger" onClick={() => deactivateUser(user)}>
                              Deactivate
                            </button>
                          ) : user.status === 'Pending' ? (
                            <button type="button" className="um-act" onClick={() => resendInvite(user)}>
                              Resend invite
                            </button>
                          ) : (
                            <button type="button" className="um-act" onClick={() => activateUser(user)}>
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
            <div className="um-pager">
              <span>
                Page {currentPage} of {pageCount} · {filteredUsers.length} users
              </span>
              <div className="um-pager-btns">
                <button
                  type="button"
                  className="sa-btn-ghost"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="sa-btn-ghost"
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {detailUser && (
        <div className="um-overlay" onClick={(event) => event.target === event.currentTarget && setDetailUser(null)}>
          <div className="um-drawer" role="dialog" aria-modal="true" aria-label={`${detailUser.fullName} details`}>
            <div className="um-drawer-head">
              <div className="um-drawer-head-top">
                <span className="um-avatar lg">
                  {detailUser.fullName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div className="um-drawer-title">
                  <strong>{detailUser.fullName}</strong>
                  <span>{detailUser.email}</span>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className={`sa-pill ${userStatusPillClass[detailUser.status]}`}>{detailUser.status}</span>
                    <span className="um-role-badge">{roleLabel(detailUser.role)}</span>
                  </div>
                </div>
                <button type="button" className="um-close" onClick={() => setDetailUser(null)} aria-label="Close details">
                  ×
                </button>
              </div>
              <div className="um-tabs">
                {AUDIT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`um-tab ${detailTab === tab.id ? 'active' : ''}`}
                    onClick={() => setDetailTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="um-drawer-body">
              {detailTab === 'overview' && (
                <>
                  <div className="um-card">
                    <h4>Account &amp; location</h4>
                    <div className="um-meta-grid">
                      <div className="um-meta">
                        <span>Phone</span>
                        <strong>{detailUser.phone}</strong>
                      </div>
                      <div className="um-meta">
                        <span>Role</span>
                        <strong>{roleLabel(detailUser.role)}</strong>
                      </div>
                      <div className="um-meta">
                        <span>Assignment</span>
                        <strong>{activeRoleScope(detailUser)}</strong>
                      </div>
                      <div className="um-meta">
                        <span>State scope</span>
                        <strong>{detailUser.state}</strong>
                      </div>
                      <div className="um-meta">
                        <span>Email verified</span>
                        <strong>{detailUser.emailVerified ? 'Yes' : 'No'}</strong>
                      </div>
                      <div className="um-meta">
                        <span>MFA</span>
                        <strong>{detailUser.mfaEnabled ? 'Enabled' : 'Not enabled'}</strong>
                      </div>
                      <div className="um-meta">
                        <span>Created</span>
                        <strong>{formatDateTime(detailUser.createdAt)}</strong>
                      </div>
                      <div className="um-meta">
                        <span>Last login</span>
                        <strong>{formatRelative(detailUser.lastLogin)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="um-card">
                    <h4>Quick actions</h4>
                    <div className="um-quick">
                      <button type="button" className="sa-btn-ghost" onClick={() => openEdit(detailUser)}>
                        Edit user
                      </button>
                      {detailUser.status !== 'Active' && (
                        <button type="button" className="sa-btn-ghost" onClick={() => activateUser(detailUser)}>
                          Activate
                        </button>
                      )}
                      {detailUser.status === 'Active' && (
                        <button type="button" className="sa-btn-ghost" onClick={() => deactivateUser(detailUser)}>
                          Deactivate
                        </button>
                      )}
                      <button type="button" className="sa-btn-ghost" onClick={() => resendInvite(detailUser)}>
                        {detailUser.status === 'Pending' ? 'Resend invitation' : 'Send invitation'}
                      </button>
                      <button type="button" className="sa-btn-ghost" onClick={() => resetPassword(detailUser)}>
                        Reset password
                      </button>
                      <button type="button" className="sa-btn-ghost" onClick={() => revokeSessions(detailUser)}>
                        Revoke sessions
                      </button>
                    </div>
                  </div>
                </>
              )}

              {detailTab === 'permissions' && (
                <div className="um-card">
                  <h4>Permissions &amp; privileges</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--sa-muted)' }}>
                    Toggle what {detailUser.fullName.split(' ')[0]} can do. Super Admin privileges are never available here.
                  </p>
                  <PermissionsEditor
                    value={detailUser.permissions}
                    onChange={(next) => {
                      updateUser(detailUser.id, { permissions: next })
                      showToast('Permissions updated.')
                    }}
                  />
                </div>
              )}

              {detailTab === 'access' && (
                <>
                  <div className="um-card">
                    <h4>Location assignment</h4>
                    <div className="um-meta-grid">
                      <div className="um-meta">
                        <span>Scope type</span>
                        <strong>{detailUser.scopeType}</strong>
                      </div>
                      <div className="um-meta">
                        <span>City</span>
                        <strong>{detailUser.city ?? '—'}</strong>
                      </div>
                      <div className="um-meta">
                        <span>Zone</span>
                        <strong>{detailUser.zone ?? '—'}</strong>
                      </div>
                    </div>
                    <button type="button" className="sa-btn-ghost" style={{ justifySelf: 'start' }} onClick={() => openEdit(detailUser)}>
                      Change assignment
                    </button>
                  </div>

                  <div className="um-card">
                    <h4>Active sessions</h4>
                    {sessionsFor(detailUser).length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sa-muted)' }}>No active sessions.</p>
                    ) : (
                      sessionsFor(detailUser).map((session) => (
                        <div className="um-session" key={session.id}>
                          <div>
                            <strong>
                              {session.device} {session.current && <span className="um-current">· current</span>}
                            </strong>
                            <span>
                              {session.browser} · {session.ip} · {session.location}
                            </span>
                            <span>Last active {formatRelative(session.lastActive)}</span>
                          </div>
                        </div>
                      ))
                    )}
                    {sessionsFor(detailUser).length > 0 && (
                      <button
                        type="button"
                        className="sa-btn-ghost"
                        style={{ justifySelf: 'start' }}
                        onClick={() => revokeSessions(detailUser)}
                      >
                        Revoke all sessions
                      </button>
                    )}
                  </div>
                </>
              )}

              {detailTab === 'logins' && (
                <div className="um-card">
                  <h4>Login history</h4>
                  {loginHistoryFor(detailUser).length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sa-muted)' }}>
                      No sign-ins recorded yet. This account has not accepted its invitation.
                    </p>
                  ) : (
                    <div className="sa-table-wrap">
                      <table className="sa-table" style={{ minWidth: 0 }}>
                        <thead>
                          <tr>
                            <th>When</th>
                            <th>Device</th>
                            <th>IP</th>
                            <th>Method</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loginHistoryFor(detailUser).map((event) => (
                            <tr key={event.id}>
                              <td>{formatDateTime(event.at)}</td>
                              <td>{event.device}</td>
                              <td>{event.ip}</td>
                              <td>{event.method}</td>
                              <td>
                                <span className={`sa-pill ${event.result === 'success' ? 'green' : 'red'}`}>{event.result}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'audit' && (
                <div className="um-card">
                  <h4>Audit trail</h4>
                  <div className="um-timeline">
                    {auditTrailFor(detailUser).map((entry) => (
                      <div className="um-tl-item" key={entry.id}>
                        <span className="um-tl-dot" />
                        <div className="um-tl-body">
                          <strong>{entry.action}</strong>
                          <span>
                            {entry.actor} · {formatDateTime(entry.at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="um-modal-overlay" onClick={(event) => event.target === event.currentTarget && setShowAdd(false)}>
          <form className="um-modal" onSubmit={handleAddSubmit}>
            <div className="um-modal-head">
              <h3>Add user</h3>
              <button type="button" className="um-close" onClick={() => setShowAdd(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="um-modal-body">
              <div className="um-form-grid">
                <label className="sa-field">
                  <span>
                    Full name <span className="um-required">*</span>
                  </span>
                  <input
                    className="sa-input"
                    value={addForm.fullName}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, fullName: event.target.value }))}
                    placeholder="e.g. Ramesh Varma"
                  />
                </label>
                <label className="sa-field">
                  <span>
                    Work email <span className="um-required">*</span>
                  </span>
                  <input
                    className="sa-input"
                    type="email"
                    value={addForm.email}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="name@equiphub.in"
                  />
                </label>
                <label className="sa-field">
                  <span>Phone</span>
                  <input
                    className="sa-input"
                    value={addForm.phone}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="+91 90000 00000"
                  />
                </label>
                <label className="sa-field">
                  <span>Role</span>
                  <select
                    className="sa-select"
                    value={addForm.role}
                    onChange={(event) => {
                      const role = event.target.value as ManagedRoleKey
                      setAddForm((prev) => ({
                        ...prev,
                        role,
                        permissions: [...ROLE_DEFAULT_PERMISSIONS[role]],
                        zone: '',
                      }))
                    }}
                  >
                    {roleOptions
                      .filter((role) => !isForbiddenRole(role.key))
                      .map((role) => (
                        <option key={role.key} value={role.key}>
                          {role.label} · {role.scope}
                        </option>
                      ))}
                  </select>
                </label>
                {roleMeta(addForm.role).scope !== 'state' && (
                  <label className="sa-field">
                    <span>City</span>
                    <select
                      className="sa-select"
                      value={addForm.city}
                      onChange={(event) => setAddForm((prev) => ({ ...prev, city: event.target.value, zone: '' }))}
                    >
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {roleMeta(addForm.role).scope === 'zone' && (
                  <label className="sa-field">
                    <span>Zone</span>
                    <select
                      className="sa-select"
                      value={addForm.zone}
                      onChange={(event) => setAddForm((prev) => ({ ...prev, zone: event.target.value }))}
                    >
                      <option value="">Select zone</option>
                      {zoneRows
                        .filter((zone) => zone.city === addForm.city)
                        .map((zone) => (
                          <option key={zone.id} value={zone.name}>
                            {zone.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </div>

              <p style={{ margin: 0, fontSize: '0.76rem', fontFamily: 'inherit', color: 'var(--sa-muted)' }}>
                {roleMeta(addForm.role).description}
              </p>

              <div>
                <span className="sa-field">
                  <span>Permissions ({addForm.permissions.length} selected)</span>
                </span>
                <PermissionsEditor
                  value={addForm.permissions}
                  onChange={(next) => setAddForm((prev) => ({ ...prev, permissions: next }))}
                />
              </div>

              <label className="um-checkline">
                <input
                  type="checkbox"
                  checked={addForm.sendInvite}
                  onChange={(event) => setAddForm((prev) => ({ ...prev, sendInvite: event.target.checked }))}
                />
                Send invitation email now (account stays Pending until accepted)
              </label>
              <label className="um-checkline">
                <input
                  type="checkbox"
                  checked={addForm.requireMfa}
                  onChange={(event) => setAddForm((prev) => ({ ...prev, requireMfa: event.target.checked }))}
                />
                Require multi-factor authentication
              </label>
            </div>
            <div className="um-modal-foot">
              <button type="button" className="sa-btn-ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button type="submit" className="um-primary">
                {addForm.sendInvite ? 'Create & send invite' : 'Create user'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editUser && (
        <div className="um-modal-overlay" onClick={(event) => event.target === event.currentTarget && setEditUser(null)}>
          <form className="um-modal" onSubmit={handleEditSubmit}>
            <div className="um-modal-head">
              <h3>Edit {editUser.fullName}</h3>
              <button type="button" className="um-close" onClick={() => setEditUser(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="um-modal-body">
              <div className="um-form-grid">
                <label className="sa-field">
                  <span>Full name</span>
                  <input
                    className="sa-input"
                    value={editForm.fullName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  />
                </label>
                <label className="sa-field">
                  <span>Phone</span>
                  <input
                    className="sa-input"
                    value={editForm.phone}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </label>
                <label className="sa-field">
                  <span>Role</span>
                  <select
                    className="sa-select"
                    value={editForm.role}
                    onChange={(event) => {
                      const role = event.target.value as ManagedRoleKey
                      setEditForm((prev) => ({
                        ...prev,
                        role,
                        permissions: [...ROLE_DEFAULT_PERMISSIONS[role]],
                        zone: '',
                      }))
                    }}
                  >
                    {roleOptions
                      .filter((role) => !isForbiddenRole(role.key))
                      .map((role) => (
                        <option key={role.key} value={role.key}>
                          {role.label} · {role.scope}
                        </option>
                      ))}
                  </select>
                </label>
                {roleMeta(editForm.role).scope !== 'state' && (
                  <label className="sa-field">
                    <span>City</span>
                    <select
                      className="sa-select"
                      value={editForm.city}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, city: event.target.value, zone: '' }))}
                    >
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {roleMeta(editForm.role).scope === 'zone' && (
                  <label className="sa-field">
                    <span>Zone</span>
                    <select
                      className="sa-select"
                      value={editForm.zone}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, zone: event.target.value }))}
                    >
                      <option value="">Select zone</option>
                      {zoneRows
                        .filter((zone) => zone.city === editForm.city)
                        .map((zone) => (
                          <option key={zone.id} value={zone.name}>
                            {zone.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </div>

              <div>
                <span className="sa-field">
                  <span>Permissions ({editForm.permissions.length} selected)</span>
                </span>
                <PermissionsEditor
                  value={editForm.permissions}
                  onChange={(next) => setEditForm((prev) => ({ ...prev, permissions: next }))}
                />
              </div>

              <label className="um-checkline">
                <input
                  type="checkbox"
                  checked={editForm.requireMfa}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, requireMfa: event.target.checked }))}
                />
                Require multi-factor authentication
              </label>
            </div>
            <div className="um-modal-foot">
              <button type="button" className="sa-btn-ghost" onClick={() => setEditUser(null)}>
                Cancel
              </button>
              <button type="submit" className="um-primary">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}

      {confirm && (
        <div className="um-modal-overlay" onClick={(event) => event.target === event.currentTarget && setConfirm(null)}>
          <div className="um-modal sm" role="alertdialog" aria-modal="true" aria-label={confirm.title}>
            <div className="um-modal-head">
              <h3>{confirm.title}</h3>
            </div>
            <div className="um-modal-body">
              <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.55, color: '#475569' }}>{confirm.message}</p>
            </div>
            <div className="um-modal-foot">
              <button type="button" className="sa-btn-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={confirm.tone === 'red' ? 'sa-btn reject' : 'um-primary'}
                onClick={confirm.onConfirm}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="sa-toast">{toast}</div>}
    </section>
  )
}
