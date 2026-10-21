import { useState } from 'react'
import { StatCards, type StatCard } from '../StateAdminDashboard/shared'
import {
  cityAdminName,
  eligibleToggleRoles,
  initialPermissionRequests,
  requestablePermissions,
  zoneStaff,
  zoneStaffRoles,
  zoneTasks,
  type PermissionRequest,
  type ZoneStaffMember,
  type ZoneStaffStatus,
  type ZoneTask,
} from './zoneUserManagementData'
import { zoneProfile } from './zoneAdminData'

const statusTone: Record<ZoneStaffStatus, string> = {
  Active: 'green',
  Inactive: 'slate',
  Suspended: 'red',
  Invited: 'amber',
}

type Props = { onToast?: (message: string) => void }

export default function UserManagementSection({ onToast }: Props) {
  const [staff, setStaff] = useState<ZoneStaffMember[]>(zoneStaff)
  const [tasks, setTasks] = useState<ZoneTask[]>(zoneTasks)
  const [requests, setRequests] = useState<PermissionRequest[]>(initialPermissionRequests)
  const [statusFilter, setStatusFilter] = useState<'All' | ZoneStaffStatus>('All')
  const [roleFilter, setRoleFilter] = useState<'All' | (typeof zoneStaffRoles)[number]>('All')
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [requestForm, setRequestForm] = useState<{ staffId: string; permission: string; reason: string }>({
    staffId: zoneStaff[0]?.id ?? '',
    permission: requestablePermissions[0]?.key ?? '',
    reason: '',
  })

  const showToast = (message: string) => {
    setToast(message)
    onToast?.(message)
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2400)
  }

  const filteredStaff = staff.filter((member) => {
    const matchesStatus = statusFilter === 'All' || member.status === statusFilter
    const matchesRole = roleFilter === 'All' || member.role === roleFilter
    const term = query.trim().toLowerCase()
    const matchesQuery =
      term === '' ||
      [member.name, member.email, member.role, member.id, member.zone].join(' ').toLowerCase().includes(term)
    return matchesStatus && matchesRole && matchesQuery
  })

  const toggleStatus = (member: ZoneStaffMember) => {
    if (!eligibleToggleRoles.includes(member.role)) {
      showToast(`Activating or deactivating ${member.role} accounts requires City Admin approval`)
      return
    }
    if (member.status === 'Suspended') {
      showToast('Suspended accounts can only be reactivated by the City Admin')
      return
    }
    const next: ZoneStaffStatus = member.status === 'Active' ? 'Inactive' : 'Active'
    setStaff((prev) => prev.map((item) => (item.id === member.id ? { ...item, status: next } : item)))
    showToast(`${member.name} ${next === 'Active' ? 'activated' : 'deactivated'}`)
  }

  const assignTask = (taskId: string, assigneeId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, assigneeId: assigneeId || null, status: assigneeId ? 'Assigned' : task.status === 'Completed' ? 'Completed' : 'Open' }
          : task,
      ),
    )
    const member = staff.find((item) => item.id === assigneeId)
    showToast(assigneeId && member ? `${taskId} assigned to ${member.name}` : `${taskId} unassigned`)
  }

  const sendPermissionRequest = () => {
    const member = staff.find((item) => item.id === requestForm.staffId)
    const perm = requestablePermissions.find((item) => item.key === requestForm.permission)
    if (!member || !perm || requestForm.reason.trim() === '') {
      showToast('Select a staff member, permission and reason')
      return
    }
    const request: PermissionRequest = {
      id: `PR-${100 + requests.length + 1}`,
      staffId: member.id,
      staffName: member.name,
      permission: perm.key,
      permissionLabel: perm.label,
      status: 'Pending',
      reason: requestForm.reason.trim(),
      requestedAt: 'just now',
      requestedBy: zoneProfile.adminName,
    }
    setRequests((prev) => [request, ...prev])
    setRequestForm((prev) => ({ ...prev, reason: '' }))
    showToast(`Permission request sent to ${cityAdminName} for ${member.name}`)
  }

  const assignedTasksFor = (id: string) => tasks.filter((task) => task.assigneeId === id && task.status !== 'Completed').length

  const staffStatusCounts = {
    total: staff.length,
    active: staff.filter((m) => m.status === 'Active').length,
    inactive: staff.filter((m) => m.status === 'Inactive').length,
    suspended: staff.filter((m) => m.status === 'Suspended').length,
    invited: staff.filter((m) => m.status === 'Invited').length,
  }

  const statCards: StatCard[] = [
    { key: 'All', label: 'Total staff', value: staff.length, tone: 'brand', sub: `${zoneProfile.name} scope` },
    { key: 'Active', label: 'Active', value: staffStatusCounts.active, tone: 'green', sub: `of ${staff.length} staff` },
    { key: 'Inactive', label: 'Inactive', value: staffStatusCounts.inactive, tone: 'slate', sub: `of ${staff.length} staff` },
    { key: 'Suspended', label: 'Suspended', value: staffStatusCounts.suspended, tone: 'red', sub: `of ${staff.length} staff` },
    { key: 'Invited', label: 'Invited', value: staffStatusCounts.invited, tone: 'amber', sub: `of ${staff.length} staff` },
  ]

  return (
    <section className="sa-panel finance-panel">
      <style>{`
        .zm-section { display: grid; gap: 16px; }
        .zm-scope-note { display: flex; align-items: center; gap: 10px; background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.16); border-radius: 14px; padding: 11px 14px; font-size: 0.78rem; color: #1d4ed8; font-weight: 600; }
        .zm-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .zm-tab { border: 1px solid var(--sa-line); background: #fff; color: var(--sa-muted); border-radius: 999px; padding: 7px 14px; font: inherit; font-size: 0.76rem; font-weight: 700; cursor: pointer; }
        .zm-tab.active { background: rgba(255,107,44,0.12); color: var(--sa-brand-deep); border-color: rgba(255,107,44,0.3); }
        .zm-status { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 999px; }
        .zm-table-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .zm-act { border: 1px solid var(--sa-line); background: #fff; color: var(--sa-text); border-radius: 8px; padding: 5px 10px; font: inherit; font-size: 0.72rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .zm-act:hover { border-color: rgba(255,107,44,0.45); color: var(--sa-brand-deep); }
        .zm-act.danger:hover { border-color: rgba(239,68,68,0.5); color: #b91c1c; }
        .zm-act:disabled { opacity: 0.45; cursor: not-allowed; }
        .zm-request { display: grid; gap: 10px; padding: 12px; border: 1px solid var(--sa-line); border-radius: 12px; background: #fff; }
      `}</style>

      <div className="sa-panel-header">
        <div>
          <h3>User management</h3>
          <span className="sa-panel-sub">Authorized zone-level staff, tasks and permissions inside {zoneProfile.name}, {zoneProfile.city}</span>
        </div>
        <div className="finance-header-controls">
          <span className="sa-pill blue">Zone Admin scope</span>
        </div>
      </div>

      <div className="zm-scope-note">
        <span>🛡️</span>
        <span>
          Restricted to <strong>{zoneProfile.name}</strong> · City Admin accounts and privileges are hidden. Extra permissions are requested from {cityAdminName}.
        </span>
      </div>

      <div className="finance-summary">
        <div className="finance-summary-item"><span className="sa-approval-meta">Staff</span><strong>{staffStatusCounts.total}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Active</span><strong>{staffStatusCounts.active}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Inactive</span><strong>{staffStatusCounts.inactive}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Suspended</span><strong>{staffStatusCounts.suspended}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Invited</span><strong>{staffStatusCounts.invited}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Open tasks</span><strong>{tasks.filter((t) => t.status !== 'Completed').length}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Pending requests</span><strong>{requests.filter((r) => r.status === 'Pending').length}</strong></div>
      </div>

      <StatCards
            cards={statCards}
            activeKey={statusFilter}
            onSelect={(key) => setStatusFilter(statusFilter === key ? 'All' : (key as 'All' | ZoneStaffStatus))}
          />

          <div className="sa-toolbar">
            <input className="sa-input" aria-label="Search zone staff" placeholder="Search name, email, role or id..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="sa-select" aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | ZoneStaffStatus)}>
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Invited">Invited</option>
            </select>
            <select className="sa-select" aria-label="Filter by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'All' | (typeof zoneStaffRoles)[number])}>
              <option value="All">All roles</option>
              {zoneStaffRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button type="button" className="sa-btn-ghost" onClick={() => { setQuery(''); setStatusFilter('All'); setRoleFilter('All') }}>Reset</button>
            <span className="sa-toolbar-meta">{filteredStaff.length} of {staff.length} staff</span>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="sa-empty"><p>No staff match the current filters.</p></div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last login</th>
                    <th>Open tasks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => {
                    const toggleAllowed = eligibleToggleRoles.includes(member.role) && member.status !== 'Suspended'
                    return (
                      <tr key={member.id}>
                        <td className="sa-cell-strong">
                          {member.name}
                          <span className="sa-cell-sub">{member.email} · {member.id}</span>
                        </td>
                        <td><span className="sa-pill blue">{member.role}</span></td>
                        <td>
                          <span className={`sa-pill ${statusTone[member.status]}`}>{member.status}</span>
                          {member.mfa && <span className="sa-cell-sub">MFA on</span>}
                        </td>
                        <td className="sa-cell-strong">
                          {member.lastLogin}
                          <span className="sa-cell-sub">{member.lastLoginIp}</span>
                        </td>
                        <td className="sa-num">{assignedTasksFor(member.id)}</td>
                        <td>
                          <div className="zm-table-actions">
                            <button type="button" className="zm-act" onClick={() => toggleStatus(member)} disabled={!toggleAllowed} title={toggleAllowed ? '' : 'Requires City Admin permission'}>
                              {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <h4 style={{ margin: '8px 0 0' }}>Task assignment</h4>
          <div className="reports-note">
            <span className="sa-pill amber">Assignment scope</span>
            <span>Tasks can be assigned to dispatchers and support agents in {zoneProfile.name}. Fleet inspectors follow their own rounds.</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Locality</th>
                  <th>Priority</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Assign to</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="sa-cell-strong">
                      {task.title}
                      <span className="sa-cell-sub">{task.detail}</span>
                    </td>
                    <td>{task.locality}</td>
                    <td><span className={`sa-pill ${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'amber' : 'slate'}`}>{task.priority}</span></td>
                    <td>{task.due}</td>
                    <td><span className={`sa-pill ${task.status === 'Completed' ? 'green' : task.status === 'Assigned' ? 'blue' : 'slate'}`}>{task.status}</span></td>
                    <td>
                      <select
                        className="sa-select"
                        aria-label={`Assign ${task.id}`}
                        value={task.assigneeId ?? ''}
                        onChange={(e) => assignTask(task.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {staff
                          .filter((m) => m.role === 'Dispatcher' || m.role === 'Support Agent')
                          .map((m) => (
                            <option key={m.id} value={m.id}>{m.name} · {m.role}</option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 style={{ margin: '8px 0 0' }}>Permission requests</h4>
          <div className="zm-request">
            <div className="support-section-title"><span>Request additional permissions from City Admin</span><span className="sa-approval-meta">{cityAdminName}</span></div>
            <div className="sa-toolbar" style={{ marginTop: 0 }}>
              <select className="sa-select" aria-label="Staff member" value={requestForm.staffId} onChange={(e) => setRequestForm((prev) => ({ ...prev, staffId: e.target.value }))}>
                {staff.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} · {m.role}</option>
                ))}
              </select>
              <select className="sa-select" aria-label="Permission" value={requestForm.permission} onChange={(e) => setRequestForm((prev) => ({ ...prev, permission: e.target.value }))}>
                {requestablePermissions.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
            <textarea
              className="sa-input"
              aria-label="Reason"
              placeholder="Reason for additional access..."
              value={requestForm.reason}
              onChange={(e) => setRequestForm((prev) => ({ ...prev, reason: e.target.value }))}
              style={{ minHeight: 60 }}
            />
            <button type="button" className="sa-btn primary" onClick={sendPermissionRequest}>Send request to City Admin</button>
          </div>

          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Staff</th>
                  <th>Permission</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="sa-cell-strong">{req.id}<span className="sa-cell-sub">{req.requestedBy}</span></td>
                    <td>{req.staffName}</td>
                    <td>{req.permissionLabel}</td>
                    <td><span className={`sa-pill ${req.status === 'Approved' ? 'green' : req.status === 'Denied' ? 'red' : 'amber'}`}>{req.status}</span></td>
                    <td>{req.requestedAt}</td>
                    <td>{req.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 style={{ margin: '8px 0 0' }}>Last login & activity</h4>
          <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
                <th>Last IP</th>
                <th>MFA</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td className="sa-cell-strong">
                    {member.name}
                    <span className="sa-cell-sub">{member.id}</span>
                  </td>
                  <td>{member.role}</td>
                  <td><span className={`sa-pill ${statusTone[member.status]}`}>{member.status}</span></td>
                  <td>{member.lastLogin}</td>
                  <td>{member.lastLoginIp}</td>
                  <td>{member.mfa ? 'On' : 'Off'}</td>
                  <td className="sa-num">{member.permissions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      {toast && <div className="sa-toast" role="status">{toast}</div>}
    </section>
  )
}