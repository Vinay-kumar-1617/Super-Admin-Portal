import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import RoleHeaderMenus from '../RoleHeaderMenus'
import {
  accountRows,
  auditEvents as seedEvents,
  auditNotifications,
  auditorProfile,
  commissionHistoryRows,
  dashboardPeriods,
  emptyAuditFilters,
  filterEvents,
  financeRecords,
  initialFindings,
  initialSavedFilters,
  nextOwnActivityId,
  operationsRecords,
  permissions,
  priceHistoryRows,
  roleScopeRows,
  ruleHistoryRows,
  scheduledReports as seedSchedules,
  type AuditEvent,
  type AuditFilters,
  type ExportRecord,
  type Finding,
  type FindingDraft,
  type OwnActivityEntry,
  type SavedFilter,
  type ScheduledReport,
  type SectionId,
} from './auditorData'
import OverviewSection from './OverviewSection'
import AuditLogSection from './AuditLogSection'
import ReadOnlySection from './ReadOnlySection'
import ControlReviewsSection from './ControlReviewsSection'
import FindingsSection, { type NewFinding } from './FindingsSection'
import ReportsSection from './ReportsSection'

const audStyles = `
.aud-saved {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  background: #fbfcfd;
}
.aud-saved-label {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--sa-muted);
}
.aud-saved-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.aud-saved-remove {
  border: 0;
  background: transparent;
  color: #b91c1c;
  font: inherit;
  font-size: 0.9rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}
.aud-flag {
  border: 1px solid var(--sa-line);
  background: #fff;
  color: var(--sa-muted);
  border-radius: 999px;
  padding: 4px 10px;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
}
.aud-flag.on {
  background: var(--sa-orange-soft);
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.5);
}
.aud-marks {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.aud-star {
  border: 1px solid var(--sa-line);
  background: #fff;
  color: var(--sa-muted);
  border-radius: 999px;
  width: 26px;
  height: 26px;
  font-size: 0.9rem;
  line-height: 1;
  cursor: pointer;
}
.aud-star.on {
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.5);
  background: var(--sa-orange-soft);
}
.aud-sensitive {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #b91c1c;
  background: var(--sa-red-soft);
  border-radius: 999px;
  padding: 1px 7px;
}
.aud-diff {
  min-width: 480px;
}
.aud-diff th,
.aud-diff td {
  padding: 8px 12px;
}
.aud-finding {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}
.aud-finding:last-child {
  border-bottom: 0;
}
.aud-finding-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.aud-finding-body {
  display: grid;
  gap: 6px;
}
.aud-finding-body strong {
  font-size: 0.92rem;
  color: var(--sa-text);
}
.aud-finding-body p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--sa-muted);
  line-height: 1.55;
}
.aud-evidence {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.aud-evidence-label {
  font-size: 0.66rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--sa-muted);
}
.aud-evidence-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1d4ed8;
  background: var(--sa-blue-soft);
  border-radius: 6px;
  padding: 2px 8px;
}
.aud-finding-assign {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 4px 0;
}
.aud-finding-assign .cf-field {
  min-width: 200px;
}
.aud-comments {
  display: grid;
  gap: 10px;
}
.aud-reveal {
  border: 0;
  background: transparent;
  color: var(--sa-brand-deep);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.aud-reveal:hover {
  text-decoration: underline;
}
.aud-progress-hot > span {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.9), rgba(239, 68, 68, 0.55)) !important;
}
`

type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

const sections: SectionMeta[] = [
  { id: 'overview', label: 'Overview', title: 'Audit overview', crumb: 'Overview' },
  { id: 'audit-log', label: 'Audit log', title: 'Audit log review', crumb: 'Audit log' },
  { id: 'read-only', label: 'Read-only access', title: 'Read-only access', crumb: 'Read-only' },
  { id: 'controls', label: 'Control reviews', title: 'Control reviews', crumb: 'Controls' },
  { id: 'findings', label: 'Findings', title: 'Findings', crumb: 'Findings' },
  { id: 'reports', label: 'Reports', title: 'Reports & exports', crumb: 'Reports' },
]

const sectionIds: SectionId[] = sections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#auditor/${id}`)) ?? 'overview'
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
  query?: string
}

type AuditorDashboardProps = {
  onSignOut?: () => void
}

const initialOwnActivity: OwnActivityEntry[] = [
  { id: nextOwnActivityId(), time: 'Today · 09:45', action: 'Signed in', detail: 'National read-only audit session' },
]

export default function AuditorDashboard({ onSignOut }: AuditorDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState('This Month')
  const [notifications, setNotifications] = useState(auditNotifications)
  const [toast, setToast] = useState<string | null>(null)

  const [events, setEvents] = useState<AuditEvent[]>(seedEvents)
  const [filters, setFilters] = useState<AuditFilters>(emptyAuditFilters)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(initialSavedFilters)
  const [bookmarks, setBookmarks] = useState<string[]>([])

  const [findings, setFindings] = useState<Finding[]>(initialFindings)
  const [findingDraft, setFindingDraft] = useState<FindingDraft | null>(null)
  const [raisedControls, setRaisedControls] = useState<string[]>([])
  const [reviewedOverrides, setReviewedOverrides] = useState<string[]>([])
  const [personalRevealed, setPersonalRevealed] = useState(false)

  const [ownActivity, setOwnActivity] = useState<OwnActivityEntry[]>(initialOwnActivity)
  const [exports, setExports] = useState<ExportRecord[]>([])
  const [schedules, setSchedules] = useState<ScheduledReport[]>(seedSchedules)

  useEffect(() => {
    const syncFromHash = () => setActiveSection(sectionFromHash())
    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('popstate', syncFromHash)
    }
  }, [])

  const navigateSection = (id: SectionId) => {
    window.history.pushState(null, '', `#auditor/${id}`)
    setActiveSection(id)
    setHeaderPanel(null)
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2600)
  }

  const logAction = (action: string, detail: string) => {
    setOwnActivity((prev) => [{ id: nextOwnActivityId(), time: 'Just now', action, detail }, ...prev])
  }

  const sectionMeta = sections.find((section) => section.id === activeSection) ?? sections[0]
  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters])
  const openFindings = findings.filter((finding) => finding.status !== 'Verified').length
  const flaggedCount = events.filter((event) => event.flagged).length
  const unreadNotifications = notifications.filter((item) => !item.read).length

  const alerts = useMemo(() => {
    const fromEvents = events
      .filter((event) => event.flagged)
      .map((event) => ({
        id: `alert-${event.id}`,
        severity: 'Critical' as const,
        title: `${event.action}: ${event.target}`,
        detail: `${event.actor} · ${event.time}`,
      }))
    const fromFindings = findings
      .filter((finding) => finding.severity === 'High' && finding.status !== 'Verified')
      .map((finding) => ({
        id: `alert-${finding.id}`,
        severity: 'Warning' as const,
        title: finding.title,
        detail: `${finding.area} · ${finding.status} · ${finding.assignee}`,
      }))
    return [...fromEvents, ...fromFindings]
  }, [events, findings])

  const superAdminEvents = useMemo(() => events.filter((event) => event.role === 'Super admin'), [events])

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = headerQuery.trim().toLowerCase()
    if (!query) return []
    const results: SearchResult[] = []
    const push = (result: SearchResult, limit: number) => {
      if (results.filter((item) => item.group === result.group).length < limit) results.push(result)
    }

    sections
      .filter((section) => section.label.toLowerCase().includes(query) || section.title.toLowerCase().includes(query))
      .forEach((section) =>
        push({ id: `sec-${section.id}`, group: 'Sections', label: section.label, sub: 'Open section', section: section.id }, 4),
      )

    events
      .filter((event) => `${event.id} ${event.actor} ${event.action} ${event.target}`.toLowerCase().includes(query))
      .forEach((event) =>
        push(
          { id: `ev-${event.id}`, group: 'Audit events', label: event.action, sub: `${event.actor} · ${event.target}`, section: 'audit-log', query: event.id },
          5,
        ),
      )

    findings
      .filter((finding) => `${finding.id} ${finding.title} ${finding.assignee}`.toLowerCase().includes(query))
      .forEach((finding) =>
        push({ id: `fnd-${finding.id}`, group: 'Findings', label: finding.title, sub: `${finding.severity} · ${finding.status}`, section: 'findings' }, 4),
      )

    accountRows
      .filter((account) => `${account.person} ${account.role} ${account.area}`.toLowerCase().includes(query))
      .forEach((account) =>
        push({ id: `acc-${account.id}`, group: 'Accounts', label: account.person, sub: `${account.role} · ${account.area}`, section: 'read-only' }, 4),
      )

    return results
  }, [headerQuery, events, findings])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')
    if (result.section === 'audit-log' && result.query) {
      setFilters({ ...emptyAuditFilters, query: result.query })
    }
    navigateSection(result.section)
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const openFeedTarget = (target: SectionId) => {
    setHeaderPanel(null)
    navigateSection(target)
  }

  // ----- Audit log handlers -----
  const changeFilters = (patch: Partial<AuditFilters>) => setFilters((prev) => ({ ...prev, ...patch }))
  const resetFilters = () => setFilters(emptyAuditFilters)
  const toggleFlag = (id: string) => {
    setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, flagged: !event.flagged } : event)))
    const event = events.find((item) => item.id === id)
    if (event) logAction(event.flagged ? 'Removed flag' : 'Flagged event', `${id} · ${event.action}`)
  }
  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    logAction('Bookmarked event', id)
  }
  const applySavedFilter = (filter: SavedFilter) => {
    setFilters({
      ...emptyAuditFilters,
      area: filter.area,
      result: filter.result,
      actor: filter.actor,
      state: filter.state,
      query: filter.query,
    })
    showToast(`Applied "${filter.name}"`)
  }
  const deleteSavedFilter = (id: string) => {
    setSavedFilters((prev) => prev.filter((item) => item.id !== id))
  }
  const saveCurrentFilter = (name: string) => {
    const filter: SavedFilter = {
      id: `SF-${Date.now()}`,
      name,
      area: filters.area,
      result: filters.result,
      actor: filters.actor,
      state: filters.state,
      query: filters.query,
    }
    setSavedFilters((prev) => [...prev, filter])
    logAction('Saved review filter', name)
    showToast(`Saved "${name}"`)
  }

  const registerExport = (name: string, kind: string, rows: number) => {
    const record: ExportRecord = { id: `EXP-${exports.length + 1}`, time: 'Just now', name, kind, rows }
    setExports((prev) => [...prev, record])
    logAction('Exported', `${name} · ${rows} rows`)
  }

  const exportAuditLog = () => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
    const rows: string[][] = [
      ['Id', 'Time', 'Actor', 'Role', 'Action', 'Target', 'Area', 'State', 'City', 'Result', 'Amount', 'Flagged'],
      ...filteredEvents.map((event) => [
        event.id,
        event.time,
        event.actor,
        event.role,
        event.action,
        event.target,
        event.area,
        event.state,
        event.city,
        event.result,
        event.amount ?? '',
        event.flagged ? 'Yes' : 'No',
      ]),
    ]
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'audit-log-extract.csv'
    link.click()
    URL.revokeObjectURL(url)
    registerExport('Audit log extract', 'Audit log', filteredEvents.length)
    showToast('Audit log exported (logged)')
  }

  const exportReport = (name: string, kind: string) => {
    const rows: string[][] = [
      ['Report', name],
      ['Generated by', auditorProfile.adminName],
      ['Findings', String(findings.length)],
      ['Open findings', String(openFindings)],
      ['Flagged events', String(flaggedCount)],
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    registerExport(name, kind, rows.length - 1)
    showToast(`${name} exported (logged)`)
  }

  // ----- Findings handlers -----
  const createFinding = (payload: NewFinding) => {
    const finding: Finding = {
      id: `FND-${1202 + findings.length}`,
      title: payload.title,
      detail: payload.detail,
      area: payload.area,
      severity: payload.severity,
      status: payload.assignee === 'Unassigned' ? 'Open' : 'Assigned',
      assignee: payload.assignee,
      evidence: payload.evidence,
      opened: 'Today',
      rechecks: 0,
      auditor: auditorProfile.adminName,
      comments: [{ id: `c-${Date.now()}`, author: auditorProfile.adminName, role: 'Auditor', time: 'Just now', body: 'Finding raised with evidence.' }],
    }
    setFindings((prev) => [finding, ...prev])
    logAction('Raised finding', `${finding.id} · ${finding.title}`)
    showToast('Finding raised')
  }

  const raiseDraft = (draft: FindingDraft) => {
    setFindingDraft(draft)
    navigateSection('findings')
    showToast('Finding draft loaded — review and raise')
  }

  const assignFinding = (id: string, assignee: string) => {
    setFindings((prev) =>
      prev.map((finding) =>
        finding.id === id
          ? { ...finding, assignee, status: finding.status === 'Open' && assignee !== 'Unassigned' ? 'Assigned' : finding.status }
          : finding,
      ),
    )
    logAction('Assigned finding', `${id} → ${assignee}`)
  }

  const commentFinding = (id: string, body: string) => {
    setFindings((prev) =>
      prev.map((finding) =>
        finding.id === id
          ? {
              ...finding,
              comments: [...finding.comments, { id: `c-${Date.now()}`, author: auditorProfile.adminName, role: 'Auditor', time: 'Just now', body }],
            }
          : finding,
      ),
    )
    logAction('Commented on finding', id)
  }

  const recheckFinding = (id: string) => {
    setFindings((prev) => prev.map((finding) => (finding.id === id ? { ...finding, rechecks: finding.rechecks + 1, status: 'In review' } : finding)))
    logAction('Re-checked finding', id)
    showToast('Re-check started')
  }

  const verifyFinding = (id: string) => {
    setFindings((prev) => prev.map((finding) => (finding.id === id ? { ...finding, status: 'Verified' } : finding)))
    logAction('Verified finding fix', id)
    showToast('Finding verified and closed')
  }

  const reopenFinding = (id: string) => {
    setFindings((prev) => prev.map((finding) => (finding.id === id ? { ...finding, status: 'Reopened' } : finding)))
    logAction('Reopened finding', id)
    showToast('Finding reopened')
  }

  const reviewOverride = (id: string) => {
    setReviewedOverrides((prev) => [...prev, id])
    logAction('Reviewed override', id)
    showToast('Override marked reviewed')
  }

  const setRevealPersonal = (value: boolean) => {
    setPersonalRevealed(value)
    logAction(value ? 'Revealed personal data' : 'Masked personal data', 'Read-only records')
    showToast(value ? 'Personal data revealed (logged)' : 'Personal data masked')
  }

  const toggleSchedule = (id: string) => {
    setSchedules((prev) => prev.map((report) => (report.id === id ? { ...report, status: report.status === 'Active' ? 'Paused' : 'Active' } : report)))
    const report = schedules.find((item) => item.id === id)
    if (report) logAction('Updated scheduled report', `${id} · ${report.status === 'Active' ? 'Paused' : 'Resumed'}`)
  }

  const raiseOnControl = (key: string, draft: FindingDraft) => {
    setRaisedControls((prev) => [...prev, key])
    createFinding({
      title: draft.title,
      detail: draft.detail,
      area: draft.area,
      severity: draft.severity,
      evidence: draft.evidence,
      assignee: 'Unassigned',
    })
    showToast('Finding raised from control review')
  }

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>
      <style>{audStyles}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">Auditor · {auditorProfile.adminName}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">Audit workspace</div>
          <ul className="sa-nav">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`sa-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => navigateSection(section.id)}
                >
                  <span>{section.label}</span>
                  {section.id === 'audit-log' && flaggedCount > 0 && <span className="sa-nav-badge">{flaggedCount}</span>}
                  {section.id === 'findings' && openFindings > 0 && <span className="sa-nav-badge">{openFindings}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>{auditorProfile.name} scope</strong>
          <span>Read-only · national. State-limited auditors can be added later for state-level reviews.</span>
          <div className="cf-scope-perm">
            {permissions.map((group) => (
              <Fragment key={group.group}>
                <strong>{group.group}</strong>
                <span>{group.items.join(' · ')}</span>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{auditorProfile.adminInitials}</div>
          <div className="sa-account-copy">
            <strong>{auditorProfile.adminName}</strong>
            <span>{auditorProfile.adminEmail}</span>
          </div>
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Logout
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="dashboard-header">
          <div className="role-header-leading">
            <div className="role-header-brand" aria-label="EquipHub">
              <span className="role-header-brand-mark" aria-hidden="true">E</span>
              <span>EquipHub</span>
            </div>
            <div className="header-copy">
              <h1 className="header-title">{sectionMeta.title}</h1>
              <div className="header-breadcrumb">Read-only audit · {auditorProfile.name}</div>
            </div>
          </div>

          <div className="header-actions">
            <div className="header-toolbar">
              {headerPanel && <div className="header-panel-backdrop" aria-hidden="true" onClick={() => setHeaderPanel(null)} />}

              <div className="header-search-wrap">
                <input
                  className="header-search"
                  aria-label="Search the auditor dashboard"
                  placeholder="Search events, findings, accounts..."
                  value={headerQuery}
                  onChange={(event) => {
                    const value = event.target.value
                    setHeaderQuery(value)
                    setHeaderPanel(value.trim() ? 'search' : null)
                  }}
                  onFocus={() => setHeaderPanel(headerQuery.trim() ? 'search' : null)}
                />
                {headerPanel === 'search' && (
                  <div className="header-popover search-popover" role="listbox" aria-label="Search results">
                    <div className="header-popover-head">
                      <h4>Search results</h4>
                      <span className="header-popover-meta">{searchResults.length} found</span>
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="header-feed-empty">No matches for “{headerQuery.trim()}”.</div>
                    ) : (
                      searchResults.map((result, index) => {
                        const showGroup = index === 0 || searchResults[index - 1].group !== result.group
                        return (
                          <Fragment key={result.id}>
                            {showGroup && <div className="search-result-group">{result.group}</div>}
                            <button type="button" className="search-result-item" onClick={() => runSearchResult(result)}>
                              <strong>{result.label}</strong>
                              <span className="search-result-sub">{result.sub}</span>
                            </button>
                          </Fragment>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'notifications' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'notifications' ? null : 'notifications')}
                >
                  Notifications {unreadNotifications > 0 && <span className="header-badge">{unreadNotifications}</span>}
                </button>
                {headerPanel === 'notifications' && (
                  <div className="header-popover" role="dialog" aria-label="Notifications">
                    <div className="header-popover-head">
                      <h4>Notifications</h4>
                      {unreadNotifications > 0 && (
                        <button type="button" className="header-popover-action" onClick={markAllNotificationsRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="header-feed-list">
                      {notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="header-feed-item"
                          onClick={() => {
                            markNotificationRead(item.id)
                            openFeedTarget(item.target)
                          }}
                        >
                          <span className={`header-feed-dot ${item.tone}`} />
                          <span className="header-feed-body">
                            <strong>
                              {item.title}
                              {!item.read && <span className="header-feed-unread" />}
                            </strong>
                            <span>{item.detail}</span>
                            <span className="header-feed-time">{item.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'alerts' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'alerts' ? null : 'alerts')}
                >
                  Alerts {alerts.length > 0 && <span className="header-badge header-badge-amber">{alerts.length}</span>}
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{alerts.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {alerts.map((item) => (
                        <div key={item.id} className="header-feed-item">
                          <span className={`header-feed-dot ${item.severity === 'Critical' ? 'red' : 'amber'}`} />
                          <span className="header-feed-body">
                            <span className="header-alert-top">
                              <strong>{item.title}</strong>
                              <span className={`header-sev ${item.severity.toLowerCase()}`}>{item.severity}</span>
                            </span>
                            <span>{item.detail}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="header-popover-foot">
                      <button type="button" className="header-action" onClick={() => openFeedTarget('controls')}>
                        Open control reviews
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'period' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'period' ? null : 'period')}
                >
                  {period} ▾
                </button>
                {headerPanel === 'period' && (
                  <div className="header-popover" role="dialog" aria-label="Dashboard period">
                    <div className="header-popover-head">
                      <h4>Dashboard period</h4>
                    </div>
                    {dashboardPeriods.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`period-menu-item ${period === option ? 'selected' : ''}`}
                        onClick={() => {
                          setPeriod(option)
                          setHeaderPanel(null)
                          logAction('Changed period', option)
                          showToast(`Period set to ${option}`)
                        }}
                      >
                        <span>{option}</span>
                        {period === option && <span className="period-current">Current</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="legacy-profile-control" style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <div className="header-avatar">{auditorProfile.adminInitials}</div>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
              <RoleHeaderMenus
                notifications={notifications}
                alerts={alerts.map((item) => ({
                  ...item,
                  time: 'Recent',
                  target: 'controls',
                }))}
                initials={auditorProfile.adminInitials}
                onNotificationClick={(item) => {
                  markNotificationRead(item.id)
                  const target = sections.find((section) => section.id === item.target)
                  if (target) openFeedTarget(target.id)
                }}
                onAlertClick={(item) => {
                  const target = sections.find((section) => section.id === item.target)
                  if (target) openFeedTarget(target.id)
                }}
                onMarkAllRead={markAllNotificationsRead}
                onSignOut={onSignOut}
                onAlertsFooter={() => openFeedTarget('controls')}
                alertsFooterLabel="Open control reviews"
              />
            </div>
          </div>
        </header>

        {toast && (
          <div className="sa-toast" role="status">
            {toast}
          </div>
        )}

        <div className="sa-content">
          {activeSection === 'overview' && (
            <OverviewSection events={events} period={period} onNavigate={navigateSection} />
          )}

          {activeSection === 'audit-log' && (
            <AuditLogSection
              rows={filteredEvents}
              total={events.length}
              filters={filters}
              onFilterChange={changeFilters}
              onReset={resetFilters}
              savedFilters={savedFilters}
              onApplySavedFilter={applySavedFilter}
              onDeleteSavedFilter={deleteSavedFilter}
              onSaveCurrentFilter={saveCurrentFilter}
              expandedId={expandedId}
              bookmarkedIds={bookmarks}
              onToggleExpand={(id) => setExpandedId((current) => (current === id ? null : id))}
              onToggleFlag={toggleFlag}
              onToggleBookmark={toggleBookmark}
              onExport={exportAuditLog}
              onRaiseFinding={(event) =>
                raiseDraft({
                  title: `Review ${event.action.toLowerCase()}: ${event.target}`,
                  detail: `${event.actor} (${event.role}) performed "${event.action}" on ${event.target}${event.note ? ` — ${event.note}` : ''}.`,
                  area: event.area,
                  severity: event.sensitive ? 'High' : 'Medium',
                  evidence: [event.id],
                })
              }
            />
          )}

          {activeSection === 'read-only' && (
            <ReadOnlySection
              accounts={accountRows}
              roleScopes={roleScopeRows}
              ruleHistory={ruleHistoryRows}
              priceHistory={priceHistoryRows}
              commissionHistory={commissionHistoryRows}
              financeRecords={financeRecords}
              operationsRecords={operationsRecords}
              personalRevealed={personalRevealed}
              onSetPersonalRevealed={setRevealPersonal}
            />
          )}

          {activeSection === 'controls' && (
            <ControlReviewsSection
              superAdminEvents={superAdminEvents}
              raisedControls={raisedControls}
              reviewedOverrides={reviewedOverrides}
              onRaise={raiseOnControl}
              onReviewOverride={reviewOverride}
            />
          )}

          {activeSection === 'findings' && (
            <FindingsSection
              findings={findings}
              draft={findingDraft}
              onClearDraft={() => setFindingDraft(null)}
              onCreate={createFinding}
              onAssign={assignFinding}
              onComment={commentFinding}
              onRecheck={recheckFinding}
              onVerify={verifyFinding}
              onReopen={reopenFinding}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsSection
              findings={findings}
              ownActivity={ownActivity}
              exports={exports}
              scheduledReports={schedules}
              onExport={exportReport}
              onToggleSchedule={toggleSchedule}
            />
          )}
        </div>
      </div>
    </section>
  )
}
