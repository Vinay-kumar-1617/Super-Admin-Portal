import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  AUDIT_TABS,
  type DetailTab,
  DEMO_MANAGED_USERS,
  GEO,
  MANAGED_ROLES,
  NATIONAL_LABEL,
  PERMISSION_CATALOG,
  ROLE_DEFAULT_PERMISSIONS,
  auditTrailFor,
  cityOptionsForState,
  formatDateTime,
  formatRelative,
  loginHistoryFor,
  roleLabel,
  roleMeta,
  sessionsFor,
  stateOptions,
  userStatusPillClass,
  zoneOptionsForCity,
  type ManagedRoleKey,
  type ManagedUser,
  type ManagedUserStatus,
} from './usersData'

const PAGE_SIZE = 7

type UsersPageProps = {
  onBack?: () => void
  embedded?: boolean
  addUserRequest?: number
}

type AddUserForm = {
  fullName: string
  email: string
  phone: string
  role: ManagedRoleKey
  state: string
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

const emptyAddForm = (): AddUserForm => {
  const state = stateOptions[0] ?? ''
  return {
    fullName: '',
    email: '',
    phone: '',
    role: 'city-admin',
    state,
    city: cityOptionsForState(state)[0] ?? '',
    zone: '',
    permissions: [...ROLE_DEFAULT_PERMISSIONS['city-admin']],
    sendInvite: true,
    requireMfa: false,
  }
}

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

export default function UsersPage({ onBack, embedded = false, addUserRequest = 0 }: UsersPageProps) {
  const [users, setUsers] = useState<ManagedUser[]>(() => DEMO_MANAGED_USERS)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | ManagedUserStatus>('All')
  const [roleFilter, setRoleFilter] = useState<'All' | ManagedRoleKey>('All')
  const [stateFilter, setStateFilter] = useState('All')
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

  const filterCityOptions = useMemo(() => {
    if (stateFilter === 'All') return Array.from(new Set(GEO.flatMap((entry) => entry.cities.map((city) => city.name))))
    return cityOptionsForState(stateFilter)
  }, [stateFilter])

  const filterZoneOptions = useMemo(() => {
    if (cityFilter !== 'All') {
      const owner = GEO.flatMap((entry) => entry.cities.map((city) => ({ state: entry.state, name: city.name }))).find(
        (city) => city.name === cityFilter,
      )
      return zoneOptionsForCity(owner?.state ?? stateFilter, cityFilter)
    }
    const states = stateFilter === 'All' ? GEO : GEO.filter((entry) => entry.state === stateFilter)
    return Array.from(new Set(states.flatMap((entry) => entry.cities.flatMap((city) => city.zones))))
  }, [stateFilter, cityFilter])

  const scopedUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((user) => {
      if (roleFilter !== 'All' && user.role !== roleFilter) return false
      if (stateFilter !== 'All' && user.state !== stateFilter) return false
      if (cityFilter !== 'All' && user.city !== cityFilter) return false
      if (zoneFilter !== 'All' && user.zone !== zoneFilter) return false
      if (!q) return true
      return (
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q) ||
        roleLabel(user.role).toLowerCase().includes(q) ||
        user.state.toLowerCase().includes(q) ||
        (user.city ?? '').toLowerCase().includes(q) ||
        (user.zone ?? '').toLowerCase().includes(q)
      )
    })
  }, [users, query, roleFilter, stateFilter, cityFilter, zoneFilter])

  const filteredUsers = useMemo(
    () => scopedUsers.filter((user) => statusFilter === 'All' || user.status === statusFilter),
    [scopedUsers, statusFilter],
  )

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pagedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const counts = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.status === 'Active').length,
      inactive: users.filter((user) => user.status === 'Inactive').length,
      pending: users.filter((user) => user.status === 'Pending').length,
    }),
    [users],
  )

  const cards: Array<{ key: 'All' | ManagedUserStatus; label: string; value: number; tone: string; sub: string }> = [
    { key: 'All', label: 'Total users', value: counts.total, tone: 'brand', sub: 'All states & scopes' },
    { key: 'Active', label: 'Active', value: counts.active, tone: 'green', sub: `of ${counts.total} total` },
    { key: 'Inactive', label: 'Inactive', value: counts.inactive, tone: 'slate', sub: `of ${counts.total} total` },
    { key: 'Pending', label: 'Pending invites', value: counts.pending, tone: 'amber', sub: `of ${counts.total} total` },
  ]

  const resetPage = () => setPage(1)
  const resetFilters = () => {
    setQuery('')
    setStatusFilter('All')
    setRoleFilter('All')
    setStateFilter('All')
    setCityFilter('All')
    setZoneFilter('All')
    resetPage()
  }

  const openAdd = () => {
    setAddForm(emptyAddForm())
    setShowAdd(true)
  }

  useEffect(() => {
    if (embedded && addUserRequest > 0) openAdd()
  }, [addUserRequest, embedded])

  const openEdit = (user: ManagedUser) => {
    setEditUser(user)
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      state: user.state,
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

  const applyRoleChange = (form: AddUserForm, role: ManagedRoleKey): AddUserForm => {
    const meta = roleMeta(role)
    const state = meta.scope === 'national' ? NATIONAL_LABEL : form.state === NATIONAL_LABEL ? stateOptions[0] ?? '' : form.state
    const city =
      meta.scope === 'national' || meta.scope === 'state' ? '' : cityOptionsForState(state)[0] ?? ''
    return {
      ...form,
      role,
      state,
      city,
      zone: '',
      permissions: [...ROLE_DEFAULT_PERMISSIONS[role]],
    }
  }

  const handleAddSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!addForm.fullName.trim() || !addForm.email.trim()) {
      showToast('Full name and work email are required.')
      return
    }
    if (users.some((user) => user.email.toLowerCase() === addForm.email.trim().toLowerCase())) {
      showToast('A user with that email already exists.')
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
      state: meta.scope === 'national' ? NATIONAL_LABEL : addForm.state,
      city: meta.scope === 'city' || meta.scope === 'zone' ? addForm.city || null : null,
      zone: meta.scope === 'zone' ? addForm.zone || null : null,
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
    const meta = roleMeta(editForm.role)
    updateUser(editUser.id, {
      fullName: editForm.fullName.trim(),
      phone: editForm.phone.trim() || '—',
      role: editForm.role,
      scopeType: meta.scope,
      state: meta.scope === 'national' ? NATIONAL_LABEL : editForm.state,
      city: meta.scope === 'city' || meta.scope === 'zone' ? editForm.city || null : null,
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

  const activeRoleScope = (user: ManagedUser) => {
    if (user.scopeType === 'national') return 'All India (national)'
    if (user.scopeType === 'zone') return `${user.zone ?? '—'} · ${user.city ?? user.state}`
    if (user.scopeType === 'city') return `${user.city ?? '—'} · ${user.state}`
    return `${user.state} (state)`
  }

  const renderScopeFields = (form: AddUserForm, setForm: (updater: (prev: AddUserForm) => AddUserForm) => void) => {
    const scope = roleMeta(form.role).scope
    if (scope === 'national') return null
    return (
      <>
        <label className="um-field">
          <span>State</span>
          <select
            className="um-select"
            value={form.state}
            onChange={(event) => {
              const state = event.target.value
              setForm((prev) => ({ ...prev, state, city: cityOptionsForState(state)[0] ?? '', zone: '' }))
            }}
          >
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        {scope === 'city' || scope === 'zone' ? (
          <label className="um-field">
            <span>City</span>
            <select
              className="um-select"
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value, zone: '' }))}
            >
              {cityOptionsForState(form.state).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {scope === 'zone' ? (
          <label className="um-field">
            <span>Zone</span>
            <select
              className="um-select"
              value={form.zone}
              onChange={(event) => setForm((prev) => ({ ...prev, zone: event.target.value }))}
            >
              <option value="">Select zone</option>
              {zoneOptionsForCity(form.state, form.city).map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </>
    )
  }

  return (
    <section className="um-section" aria-label="User management">
      <style>{`
        .um-section { display: grid; gap: 16px; }
        .um-scope-note { display: flex; align-items: center; gap: 10px; background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.16); border-radius: 14px; padding: 11px 14px; font-size: 0.78rem; color: #1d4ed8; font-weight: 600; }
        .um-scope-note strong { font-weight: 800; }
        .um-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; background: #fff; border: 1px solid rgba(15,23,42,0.08); border-left: 4px solid #ff6b2c; border-radius: 18px; padding: 16px 18px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
        .um-head.embedded { align-items: center; justify-content: space-between; }
        .um-head h3 { margin: 0; font-size: 1.2rem; letter-spacing: -0.03em; color: #182230; }
        .um-head p { margin: 4px 0 0; font-size: 0.82rem; color: #64748b; }
        .um-head-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .um-primary { border: 0; border-radius: 10px; padding: 10px 16px; font: inherit; font-size: 0.82rem; font-weight: 800; cursor: pointer; color: #fff; background: linear-gradient(100deg, #b84318, #8f2f0d); box-shadow: 0 6px 14px rgba(143,47,13,0.2); }
        .um-primary:hover:not(:disabled) { background: linear-gradient(100deg, #a83b14, #7c280a); }
        .um-primary[disabled] { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
        .um-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .um-stat { text-align: left; display: grid; gap: 4px; background: #fff; border: 1px solid rgba(15,23,42,0.08); border-left: 4px solid rgba(15,23,42,0.12); border-radius: 14px; padding: 14px 16px; cursor: pointer; font: inherit; }
        .um-stat:hover { box-shadow: 0 12px 28px rgba(15,23,42,0.08); }
        .um-stat.active { box-shadow: 0 12px 28px rgba(255,107,44,0.2); border-color: rgba(255,107,44,0.5); }
        .um-stat.tone-brand { border-left-color: #ff6b2c; }
        .um-stat.tone-green { border-left-color: #08a66c; }
        .um-stat.tone-slate { border-left-color: #94a3b8; }
        .um-stat.tone-amber { border-left-color: #f59e0b; }
        .um-stat-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .um-stat-value { font-size: 1.5rem; font-weight: 800; color: #182230; }
        .um-stat-sub { font-size: 0.7rem; color: #94a3b8; }
        .um-panel { background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 16px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); overflow: hidden; min-width: 0; }
        .um-toolbar { display: flex; flex-wrap: wrap; gap: 10px; padding: 14px 16px; border-bottom: 1px solid rgba(15,23,42,0.07); align-items: center; }
        .um-toolbar .um-input { flex: 1 1 240px; }
        .um-toolbar-meta { margin-left: auto; font-size: 0.74rem; font-weight: 700; color: #64748b; }
        .um-input, .um-select { min-height: 38px; padding: 8px 10px; border: 1px solid rgba(15,23,42,0.14); border-radius: 10px; background: #fff; color: #182230; font: inherit; font-size: 0.8rem; }
        .um-ghost { border: 1px solid rgba(15,23,42,0.12); background: #fff; color: #182230; border-radius: 10px; padding: 8px 12px; font: inherit; font-size: 0.78rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .um-ghost:hover { border-color: rgba(255,107,44,0.45); color: #ef4a12; }
        .um-ghost:disabled { opacity: 0.45; cursor: not-allowed; }
        .um-ghost.danger { color: #b91c1c; border-color: rgba(239,68,68,0.35); }
        .um-ghost.danger:hover { border-color: rgba(239,68,68,0.6); color: #b91c1c; }
        .um-table-wrap { overflow-x: auto; }
        .um-table { width: 100%; min-width: 1080px; border-collapse: collapse; text-align: left; }
        .um-table th, .um-table td { padding: 12px 14px; border-bottom: 1px solid rgba(15,23,42,0.06); font-size: 0.78rem; vertical-align: middle; }
        .um-table th { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background: #fbfcfd; }
        .um-cell-strong { font-weight: 800; color: #182230; }
        .um-cell-sub { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 500; }
        .um-pill { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 0.68rem; font-weight: 800; text-transform: capitalize; }
        .um-pill.green { background: rgba(8,166,108,0.12); color: #078653; }
        .um-pill.slate { background: rgba(100,116,139,0.14); color: #475569; }
        .um-pill.amber { background: rgba(245,158,11,0.16); color: #b45309; }
        .um-pill.red { background: rgba(239,68,68,0.12); color: #b91c1c; }
        .um-empty { display: grid; gap: 10px; place-items: center; padding: 44px 20px; color: #64748b; font-size: 0.84rem; }
        .um-table-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .um-act { border: 1px solid rgba(15,23,42,0.12); background: #fff; color: #182230; border-radius: 8px; padding: 5px 10px; font: inherit; font-size: 0.72rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .um-act.icon-action { display: inline-grid; width: 32px; height: 30px; padding: 0; place-items: center; font-size: 0.95rem; }
        .um-act:hover { border-color: rgba(255,107,44,0.45); color: #ef4a12; }
        .um-act.danger:hover { border-color: rgba(239,68,68,0.5); color: #b91c1c; }
        .um-pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-top: 1px solid rgba(15,23,42,0.06); }
        .um-pager span { font-size: 0.74rem; font-weight: 700; color: #64748b; }
        .um-pager-btns { display: flex; gap: 8px; }
        .um-avatar { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 0.82rem; color: #fff; background: linear-gradient(135deg, #b84318, #8f2f0d); flex-shrink: 0; }
        .um-avatar.lg { width: 56px; height: 56px; font-size: 1.05rem; }
        .um-name-cell { display: flex; align-items: center; gap: 10px; }
        .um-role-badge { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 800; background: rgba(124,58,237,0.12); color: #6d28d9; white-space: nowrap; }
        .um-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 1040; display: flex; justify-content: flex-end; }
        .um-drawer { width: min(580px, 100%); height: 100%; background: #f8fafc; box-shadow: -30px 0 60px rgba(15,23,42,0.25); display: flex; flex-direction: column; animation: um-slide 0.22s ease; }
        @keyframes um-slide { from { transform: translateX(40px); opacity: 0.4; } to { transform: translateX(0); opacity: 1; } }
        .um-drawer-head { background: #fff; padding: 18px 20px; border-bottom: 1px solid rgba(15,23,42,0.08); display: grid; gap: 12px; }
        .um-drawer-head-top { display: flex; align-items: flex-start; gap: 14px; }
        .um-drawer-title { display: grid; gap: 3px; min-width: 0; }
        .um-drawer-title strong { font-size: 1.06rem; color: #182230; }
        .um-drawer-title span { font-size: 0.78rem; color: #64748b; }
        .um-close { margin-left: auto; border: 1px solid rgba(15,23,42,0.12); background: #fff; width: 32px; height: 32px; border-radius: 9px; font-size: 1rem; cursor: pointer; color: #64748b; }
        .um-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .um-tab { border: 1px solid transparent; background: #f2f5f7; color: #64748b; border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 0.74rem; font-weight: 700; cursor: pointer; }
        .um-tab.active { background: rgba(255,107,44,0.12); color: #ef4a12; border-color: rgba(255,107,44,0.3); }
        .um-drawer-body { padding: 18px 20px; overflow-y: auto; display: grid; gap: 16px; align-content: start; }
        .um-card { background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 16px; padding: 16px; display: grid; gap: 12px; }
        .um-card h4 { margin: 0; font-size: 0.9rem; color: #182230; }
        .um-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
        .um-meta { display: grid; gap: 3px; }
        .um-meta span { font-size: 0.66rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #94a3b8; }
        .um-meta strong { font-size: 0.86rem; color: #182230; }
        .um-quick { display: flex; gap: 8px; flex-wrap: wrap; }
        .um-perm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
        .um-perm-group { display: grid; gap: 6px; align-content: start; }
        .um-perm-group-title { font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
        .um-perm-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; cursor: pointer; }
        .um-perm-item.disabled { opacity: 0.6; cursor: not-allowed; }
        .um-session { display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px solid rgba(15,23,42,0.08); border-radius: 12px; padding: 12px; }
        .um-session div { display: grid; gap: 2px; }
        .um-session strong { font-size: 0.84rem; color: #182230; }
        .um-session span { font-size: 0.72rem; color: #64748b; }
        .um-current { font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #08a66c; }
        .um-timeline { display: grid; gap: 0; }
        .um-tl-item { display: grid; grid-template-columns: 14px 1fr; gap: 12px; padding-bottom: 14px; position: relative; }
        .um-tl-item:not(:last-child)::before { content: ''; position: absolute; left: 6px; top: 14px; bottom: 0; width: 2px; background: rgba(15,23,42,0.1); }
        .um-tl-dot { width: 12px; height: 12px; border-radius: 999px; margin-top: 3px; background: #ef4a12; box-shadow: 0 0 0 3px rgba(255,107,44,0.15); }
        .um-tl-body { display: grid; gap: 2px; }
        .um-tl-body strong { font-size: 0.82rem; color: #182230; }
        .um-tl-body span { font-size: 0.72rem; color: #64748b; }
        .um-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); z-index: 1050; display: grid; place-items: center; padding: 20px; }
        .um-modal { width: min(660px, 100%); max-height: calc(100vh - 40px); background: #fff; border-radius: 20px; box-shadow: 0 30px 70px rgba(15,23,42,0.35); display: flex; flex-direction: column; overflow: hidden; }
        .um-modal.sm { width: min(440px, 100%); }
        .um-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 20px; border-bottom: 1px solid rgba(15,23,42,0.08); }
        .um-modal-head h3 { margin: 0; font-size: 1.02rem; color: #182230; }
        .um-modal-body { padding: 18px 20px; overflow-y: auto; display: grid; gap: 14px; }
        .um-modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid rgba(15,23,42,0.08); background: #fbfcfd; }
        .um-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .um-field { display: grid; gap: 6px; }
        .um-field > span:first-child { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .um-checkline { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; }
        .um-required { color: #b91c1c; }
        .um-toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); background: #182230; color: #fff; padding: 11px 18px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; box-shadow: 0 20px 40px rgba(15,23,42,0.35); z-index: 1100; }
        .um-note { margin: 0; font-size: 0.76rem; color: #64748b; }
        @media (max-width: 900px) {
          .um-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .um-head { flex-direction: column; align-items: stretch; }
          .um-head.embedded .um-head-actions { justify-content: flex-end; }
        }
      `}</style>

      

      {!embedded && <div className="um-head">
        <h3>Users &amp; Access</h3>
        <div className="um-head-actions">
          {onBack && (
            <button type="button" className="um-ghost" onClick={onBack}>
              ← Back
            </button>
          )}
          <button type="button" className="um-primary" onClick={openAdd} disabled={!canManage}>
            + Add User
          </button>
        </div>
      </div>}

      <div className="um-stats">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            className={`um-stat tone-${card.tone}${statusFilter === card.key ? ' active' : ''}`}
            onClick={() => {
              setStatusFilter(statusFilter === card.key ? 'All' : card.key)
              resetPage()
            }}
          >
            <span className="um-stat-label">{card.label}</span>
            <strong className="um-stat-value">{card.value}</strong>
            <span className="um-stat-sub">{card.sub}</span>
          </button>
        ))}
      </div>

      <section className="um-panel">
        <div className="um-toolbar">
          <input
            className="um-input"
            aria-label="Search users"
            placeholder="Search name, email, phone, role or location..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetPage()
            }}
          />
          <select
            className="um-select"
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
            className="um-select"
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
            className="um-select"
            aria-label="Filter by state"
            value={stateFilter}
            onChange={(event) => {
              setStateFilter(event.target.value)
              setCityFilter('All')
              setZoneFilter('All')
              resetPage()
            }}
          >
            <option value="All">All states</option>
            <option value={NATIONAL_LABEL}>All India (national)</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <select
            className="um-select"
            aria-label="Filter by city"
            value={cityFilter}
            onChange={(event) => {
              setCityFilter(event.target.value)
              setZoneFilter('All')
              resetPage()
            }}
          >
            <option value="All">All cities</option>
            {filterCityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select
            className="um-select"
            aria-label="Filter by zone"
            value={zoneFilter}
            onChange={(event) => {
              setZoneFilter(event.target.value)
              resetPage()
            }}
          >
            <option value="All">All zones</option>
            {filterZoneOptions.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          <button type="button" className="um-ghost" onClick={resetFilters}>
            Reset
          </button>
          <span className="um-toolbar-meta">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="um-empty">
            <p>No users match the current filters.</p>
            <button type="button" className="um-ghost" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="um-table-wrap">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>State</th>
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
                          <span className="um-cell-strong">{user.fullName}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className="um-role-badge">{roleLabel(user.role)}</span>
                      </td>
                      <td>{user.state}</td>
                      <td>
                        {user.city ?? '—'}
                        {user.zone ? (
                          <span className="um-cell-sub">{user.zone} zone</span>
                        ) : user.scopeType === 'state' ? (
                          <span className="um-cell-sub">Statewide</span>
                        ) : user.scopeType === 'national' ? (
                          <span className="um-cell-sub">National</span>
                        ) : null}
                      </td>
                      <td>
                        <span className={`um-pill ${userStatusPillClass[user.status]}`}>{user.status}</span>
                      </td>
                      <td>{formatRelative(user.lastLogin)}</td>
                      <td>
                        <div className="um-table-actions">
                          <button type="button" className="um-act icon-action" onClick={() => openDetails(user)} aria-label={`View ${user.fullName}`} title="View">
                            👁️
                          </button>
                          <button type="button" className="um-act icon-action" onClick={() => openEdit(user)} aria-label={`Edit ${user.fullName}`} title="Edit">
                            ✏️
                          </button>
                          {user.status === 'Active' ? (
                            <button type="button" className="um-act icon-action danger" onClick={() => deactivateUser(user)} aria-label={`Deactivate ${user.fullName}`} title="Deactivate">
                              🚫
                            </button>
                          ) : user.status === 'Pending' ? (
                            <button type="button" className="um-act icon-action" onClick={() => resendInvite(user)} aria-label={`Resend invite to ${user.fullName}`} title="Resend invite">
                              ✉️
                            </button>
                          ) : (
                            <button type="button" className="um-act icon-action" onClick={() => activateUser(user)} aria-label={`Activate ${user.fullName}`} title="Activate">
                              ✅
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
                  className="um-ghost"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="um-ghost"
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
                    <span className={`um-pill ${userStatusPillClass[detailUser.status]}`}>{detailUser.status}</span>
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
                        <span>State</span>
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
                      <button type="button" className="um-ghost" onClick={() => openEdit(detailUser)}>
                        Edit user
                      </button>
                      {detailUser.status !== 'Active' && (
                        <button type="button" className="um-ghost" onClick={() => activateUser(detailUser)}>
                          Activate
                        </button>
                      )}
                      {detailUser.status === 'Active' && (
                        <button type="button" className="um-ghost" onClick={() => deactivateUser(detailUser)}>
                          Deactivate
                        </button>
                      )}
                      <button type="button" className="um-ghost" onClick={() => resendInvite(detailUser)}>
                        {detailUser.status === 'Pending' ? 'Resend invitation' : 'Send invitation'}
                      </button>
                      <button type="button" className="um-ghost" onClick={() => resetPassword(detailUser)}>
                        Reset password
                      </button>
                      <button type="button" className="um-ghost" onClick={() => revokeSessions(detailUser)}>
                        Revoke sessions
                      </button>
                    </div>
                  </div>
                </>
              )}

              {detailTab === 'permissions' && (
                <div className="um-card">
                  <h4>Permissions &amp; privileges</h4>
                  <p className="um-note">Toggle what {detailUser.fullName.split(' ')[0]} can do across the platform.</p>
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
                        <span>State</span>
                        <strong>{detailUser.state}</strong>
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
                    <button type="button" className="um-ghost" style={{ justifySelf: 'start' }} onClick={() => openEdit(detailUser)}>
                      Change assignment
                    </button>
                  </div>

                  <div className="um-card">
                    <h4>Active sessions</h4>
                    {sessionsFor(detailUser).length === 0 ? (
                      <p className="um-note">No active sessions.</p>
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
                        className="um-ghost"
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
                    <p className="um-note">No sign-ins recorded yet. This account has not accepted its invitation.</p>
                  ) : (
                    <div className="um-table-wrap">
                      <table className="um-table" style={{ minWidth: 0 }}>
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
                                <span className={`um-pill ${event.result === 'success' ? 'green' : 'red'}`}>{event.result}</span>
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
                <label className="um-field">
                  <span>
                    Full name <span className="um-required">*</span>
                  </span>
                  <input
                    className="um-input"
                    value={addForm.fullName}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, fullName: event.target.value }))}
                    placeholder="e.g. Anitha Rao"
                  />
                </label>
                <label className="um-field">
                  <span>
                    Work email <span className="um-required">*</span>
                  </span>
                  <input
                    className="um-input"
                    type="email"
                    value={addForm.email}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="name@equiphub.in"
                  />
                </label>
                <label className="um-field">
                  <span>Phone</span>
                  <input
                    className="um-input"
                    value={addForm.phone}
                    onChange={(event) => setAddForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="+91 90000 00000"
                  />
                </label>
                <label className="um-field">
                  <span>Role</span>
                  <select
                    className="um-select"
                    value={addForm.role}
                    onChange={(event) => setAddForm((prev) => applyRoleChange(prev, event.target.value as ManagedRoleKey))}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.key} value={role.key}>
                        {role.label} · {role.scope}
                      </option>
                    ))}
                  </select>
                </label>
                {renderScopeFields(addForm, setAddForm)}
              </div>

              <p className="um-note">{roleMeta(addForm.role).description}</p>

              <div>
                <span className="um-field">
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
              <button type="button" className="um-ghost" onClick={() => setShowAdd(false)}>
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
                <label className="um-field">
                  <span>Full name</span>
                  <input
                    className="um-input"
                    value={editForm.fullName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  />
                </label>
                <label className="um-field">
                  <span>Phone</span>
                  <input
                    className="um-input"
                    value={editForm.phone}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </label>
                <label className="um-field">
                  <span>Role</span>
                  <select
                    className="um-select"
                    value={editForm.role}
                    onChange={(event) => setEditForm((prev) => applyRoleChange(prev, event.target.value as ManagedRoleKey))}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.key} value={role.key}>
                        {role.label} · {role.scope}
                      </option>
                    ))}
                  </select>
                </label>
                {renderScopeFields(editForm, setEditForm)}
              </div>

              <div>
                <span className="um-field">
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
              <button type="button" className="um-ghost" onClick={() => setEditUser(null)}>
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
              <p className="um-note" style={{ lineHeight: 1.55 }}>{confirm.message}</p>
            </div>
            <div className="um-modal-foot">
              <button type="button" className="um-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={confirm.tone === 'red' ? 'um-ghost danger' : 'um-primary'}
                onClick={confirm.onConfirm}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="um-toast">{toast}</div>}
    </section>
  )
}
