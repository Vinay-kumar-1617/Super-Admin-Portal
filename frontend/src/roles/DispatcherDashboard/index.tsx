import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import {
  contactLog as seedContactLog,
  dashboardPeriods,
  dispatcherAlerts,
  dispatcherAudit,
  dispatcherNotifications,
  dispatcherOperators,
  dispatcherProfile,
  dispatchJobs,
  escalations as seedEscalations,
  permissions,
  reassignments as seedReassignments,
  seedHandoverNotes,
  zoneBoundaries,
  type AuditEntry,
  type ContactEntry,
  type DispatcherNotification,
  type DispatcherOperator,
  type DispatchJob,
  type Escalation,
  type HandoverNote,
  type Reassignment,
  type SectionId,
} from './dispatcherData'
import OverviewSection from './OverviewSection'
import DispatchSection, { type AssignAction } from './DispatchSection'
import LiveMapSection from './LiveMapSection'
import ReassignSection, { type ReassignAction } from './ReassignSection'
import ContactSection, { type ContactAction } from './ContactSection'
import ShiftSection from './ShiftSection'
import EscalationsSection, { type CreateEscalation } from './EscalationsSection'

const dispatcherStyles = `
.sa-row-selected { background: var(--sa-wash, rgba(15, 23, 42, 0.05)); }
.ops-alert-btn { cursor: pointer; }
.ops-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
}
.ops-field-grow { flex: 1 1 260px; }
.ops-field-actions { display: flex; gap: 8px; align-items: center; }
.ops-action-panel { border-left: 3px solid var(--sa-accent, #f59e0b); }
.ops-action-form { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
.ops-map-layout {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 16px;
}
.ops-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 18px 16px;
  font-size: 11.5px;
  opacity: 0.8;
}
.ops-legend i {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  margin-right: 5px;
}
.ops-legend i.blue { background: #3b82f6; }
.ops-legend i.green { background: #22c55e; }
.ops-legend i.slate { background: #94a3b8; }
.ops-legend i.amber { background: #f59e0b; }
.ops-legend i.red { background: #ef4444; }
.ops-legend i.purple { background: #7c3aed; }
.ops-readonly-banner { font-size: 12.5px; opacity: 0.8; font-style: italic; padding: 12px 18px 0; margin: 0; }
.ops-scope-perm { display: block; font-size: 11.5px; line-height: 1.5; opacity: 0.72; margin-top: 6px; }
.ds-subhead {
  display: block;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.55;
  margin-bottom: 8px;
}
.ds-textarea {
  min-height: 74px;
  resize: vertical;
  font: inherit;
  padding: 9px 12px;
  width: 100%;
}
.ds-map-canvas {
  position: relative;
  height: 460px;
  margin: 14px 18px 0;
  border-radius: 14px;
  border: 1px solid var(--sa-line, #e4e7ec);
  background:
    linear-gradient(var(--sa-wash, rgba(15, 23, 42, 0.04)) 1px, transparent 1px),
    linear-gradient(90deg, var(--sa-wash, rgba(15, 23, 42, 0.04)) 1px, transparent 1px);
  background-size: 40px 40px;
  overflow: hidden;
}
.ds-city-boundary {
  position: absolute;
  inset: 6px;
  border: 2px dashed rgba(37, 99, 235, 0.35);
  border-radius: 16px;
}
.ds-city-boundary-label {
  position: absolute;
  top: -1px;
  left: 12px;
  transform: translateY(-50%);
  background: #fff;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 800;
  color: rgba(37, 99, 235, 0.75);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ds-zone {
  position: absolute;
  border: 1px solid rgba(100, 116, 139, 0.4);
  background: rgba(148, 163, 184, 0.06);
  border-radius: 12px;
  font: inherit;
  color: inherit;
  cursor: pointer;
  padding: 4px 6px;
  text-align: left;
}
.ds-zone span {
  font-size: 10.5px;
  font-weight: 800;
  color: #64748b;
}
.ds-zone:hover { background: rgba(148, 163, 184, 0.14); }
.ds-zone.selected {
  border-color: var(--sa-brand-deep, #ef4a12);
  background: rgba(255, 107, 44, 0.08);
}
.ds-map-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.3);
  z-index: 3;
}
.ds-map-dot.green { background: #22c55e; }
.ds-map-dot.blue { background: #3b82f6; }
.ds-map-dot.amber { background: #f59e0b; }
.ds-map-dot.purple { background: #7c3aed; }
.ds-map-dot.slate { background: #94a3b8; }
.ds-map-dot.red { background: #ef4444; }
.ds-map-dot.dimmed { opacity: 0.2; }
.ds-map-job {
  position: absolute;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  transform: translate(-50%, -50%);
  border-radius: 5px;
  background: #ffffff;
  border: 2px solid #0f172a;
  color: #0f172a;
  font-size: 10px;
  font-weight: 900;
  z-index: 4;
}
.ds-map-job.urgent { border-color: #ef4444; color: #b91c1c; background: #fff5f5; }
.ds-map-job.dimmed { opacity: 0.2; }
.ds-map-side { display: grid; gap: 18px; align-content: start; }
.ds-scroll { max-height: 420px; overflow-y: auto; }
.ds-reassign-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
  padding: 16px 18px 18px;
}
.ds-reassign-form { display: grid; gap: 12px; align-content: start; }
.ds-check-row { display: flex; flex-wrap: wrap; gap: 16px; }
.ds-check { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; }
.ds-candidate {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 11px 18px;
  border: 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.ds-candidate:hover { background: #f8fafc; }
.ds-candidate.selected { background: rgba(8, 166, 108, 0.08); }
.ds-candidate-main { display: grid; gap: 2px; }
.ds-candidate-main strong { font-size: 13px; }
.ds-candidate-main span { font-size: 11.5px; color: var(--sa-muted); }
.ds-candidate-meta { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ds-contact-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  grid-template-areas: "jobs compose" "log log";
  gap: 18px;
}
.ds-contact-layout > .sa-panel:nth-child(1) { grid-area: jobs; }
.ds-contact-layout > .sa-panel:nth-child(2) { grid-area: compose; }
.ds-contact-log { grid-area: log; }
.ds-contact-body { display: grid; gap: 12px; padding: 16px 18px 18px; }
.ds-channel { display: flex; gap: 8px; flex-wrap: wrap; }
.ds-quick { display: grid; }
.ds-select-row { cursor: pointer; }
.ds-select-row.selected { background: rgba(37, 99, 235, 0.08); }
.ds-note-form { display: grid; gap: 12px; padding: 16px 18px 18px; }
.ds-escalation-form {
  display: grid;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  background: #fbfcfd;
}
.ds-form-row { display: flex; flex-wrap: wrap; gap: 12px; }
.ds-form-row .ops-field { min-width: 160px; }
`

type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

const sections: SectionMeta[] = [
  { id: 'overview', label: 'Dispatch overview', title: 'Dispatch overview', crumb: 'Overview' },
  { id: 'dispatch', label: 'Dispatch', title: 'Dispatch · dispatch.read / dispatch.assign', crumb: 'Dispatch' },
  { id: 'map', label: 'Live map', title: 'Live map · operators & jobs', crumb: 'Live map' },
  { id: 'reassign', label: 'Reassignment', title: 'Reassignment · dispatch.reassign', crumb: 'Reassignment' },
  { id: 'contact', label: 'Operator contact', title: 'Operator contact · driver.contact', crumb: 'Contact' },
  { id: 'shift', label: 'Shift handover', title: 'Shift handover', crumb: 'Shift' },
  { id: 'escalations', label: 'Escalations', title: 'Escalations', crumb: 'Escalations' },
]

const sectionIds: SectionId[] = sections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#dispatcher/${id}`)) ?? 'overview'
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
}

type DispatcherDashboardProps = {
  onSignOut?: () => void
}

export default function DispatcherDashboard({ onSignOut }: DispatcherDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState(dashboardPeriods[1])
  const [notifications, setNotifications] = useState<DispatcherNotification[]>(dispatcherNotifications)
  const [jobs, setJobs] = useState<DispatchJob[]>(dispatchJobs)
  const [operators, setOperators] = useState<DispatcherOperator[]>(dispatcherOperators)
  const [reassignments, setReassignments] = useState<Reassignment[]>(seedReassignments)
  const [contactEntries, setContactEntries] = useState<ContactEntry[]>(seedContactLog)
  const [notes, setNotes] = useState<HandoverNote[]>(seedHandoverNotes)
  const [escalationRows, setEscalationRows] = useState<Escalation[]>(seedEscalations)
  const [audit, setAudit] = useState<AuditEntry[]>(dispatcherAudit)
  const [focusJobId, setFocusJobId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [auditSeq, setAuditSeq] = useState(211)
  const [noteSeq, setNoteSeq] = useState(7)
  const [contactSeq, setContactSeq] = useState(59)
  const [reassignSeq, setReassignSeq] = useState(32)
  const [escalationSeq, setEscalationSeq] = useState(22)

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
    window.history.pushState(null, '', `#dispatcher/${id}`)
    setActiveSection(id)
    setHeaderPanel(null)
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2600)
  }

  const appendAudit = (action: string, target: string, reason: string) => {
    const id = `AU-${auditSeq}`
    setAuditSeq(auditSeq + 1)
    setAudit((prev) => [{ id, time: 'Just now', actor: dispatcherProfile.name, action, target, reason }, ...prev])
  }

  const unassignedCount = jobs.filter((job) => job.status === 'Unassigned').length
  const openEscalations = escalationRows.filter((row) => row.status !== 'Escalated').length
  const unreadNotifications = notifications.filter((item) => !item.read).length
  const sectionMeta = sections.find((section) => section.id === activeSection) ?? sections[0]

  const handleAssign = ({ jobId, operatorId, reason }: AssignAction) => {
    const operator = operators.find((entry) => entry.id === operatorId)
    if (!operator) return
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, operator: operator.name, operatorId: operator.id, status: 'Assigned', operatorAccepted: true }
          : job,
      ),
    )
    setOperators((prev) => prev.map((entry) => (entry.id === operatorId ? { ...entry, status: 'Assigned' } : entry)))
    appendAudit('Manual dispatch override', `${jobId} → ${operator.name}`, reason)
    setNotifications((prev) => [
      { id: `dn-${auditSeq}`, title: 'Operator assigned', detail: `${jobId} assigned to ${operator.name}.`, time: 'Just now', tone: 'green', read: false, target: 'dispatch' },
      ...prev,
    ])
    showToast(`${jobId} assigned to ${operator.name}`)
  }

  const handleReassign = ({ jobId, operatorId, reason, notifyCustomer, notifyOwner }: ReassignAction) => {
    const operator = operators.find((entry) => entry.id === operatorId)
    const job = jobs.find((entry) => entry.id === jobId)
    if (!operator || !job) return
    const from = job.operator ?? 'Unassigned'
    setJobs((prev) =>
      prev.map((entry) =>
        entry.id === jobId
          ? {
              ...entry,
              operator: operator.name,
              operatorId: operator.id,
              status: entry.status === 'Stuck' ? 'Assigned' : entry.status,
              operatorAccepted: true,
            }
          : entry,
      ),
    )
    setOperators((prev) => prev.map((entry) => (entry.id === operatorId ? { ...entry, status: 'Assigned' } : entry)))
    setReassignments((prev) => [
      { id: `RA-${reassignSeq}`, jobId, from, to: operator.name, reason, time: 'Just now', notifyCustomer, notifyOwner },
      ...prev,
    ])
    setReassignSeq(reassignSeq + 1)
    appendAudit('Reassigned job', `${jobId} → ${operator.name}`, reason)
    showToast(`${jobId} reassigned to ${operator.name}`)
  }

  const handleContact = ({ jobId, operatorId, channel, message, note }: ContactAction) => {
    const operator = operators.find((entry) => entry.id === operatorId)
    if (!operator) return
    setContactEntries((prev) => [
      {
        id: `CL-${contactSeq}`,
        jobId,
        operatorId,
        operator: operator.name,
        channel,
        message,
        note,
        time: 'Just now',
        by: dispatcherProfile.name,
      },
      ...prev,
    ])
    setContactSeq(contactSeq + 1)
    appendAudit('Contacted operator', `${jobId} → ${operator.name}`, note || message)
    showToast(channel === 'Message' ? `Message sent to ${operator.name}` : `Call with ${operator.name} logged`)
  }

  const addHandoverNote = (text: string, jobId?: string) => {
    const id = `HN-${noteSeq}`
    setNoteSeq(noteSeq + 1)
    setNotes((prev) => [
      { id, time: 'Just now', author: dispatcherProfile.name, shift: 'Morning', text: jobId ? `[${jobId}] ${text}` : text },
      ...prev,
    ])
    showToast('Handover note added')
  }

  const acknowledgeEscalation = (id: string) => {
    setEscalationRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'Acknowledged' } : row)))
    showToast(`${id} acknowledged`)
  }

  const escalate = (id: string, target: string, reason: string) => {
    setEscalationRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: 'Escalated', escalatedTo: target } : row)),
    )
    appendAudit('Escalated issue', `${id} → ${target}`, reason)
    showToast(`${id} escalated to ${target.split(' · ')[1] ?? target}`)
  }

  const createEscalation = ({ kind, reference, subject, detail, severity, target }: CreateEscalation) => {
    const id = `ESC-${escalationSeq}`
    setEscalationSeq(escalationSeq + 1)
    setEscalationRows((prev) => [
      { id, kind, reference, subject, detail, received: 'Just now', severity, status: 'Open', escalatedTo: target },
      ...prev,
    ])
    appendAudit(`Raised ${kind.toLowerCase()}`, `${id} → ${target}`, subject)
    showToast(`${id} raised to ${target.split(' · ')[1] ?? target}`)
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const openFeedTarget = (target: string) => {
    setHeaderPanel(null)
    if (sectionIds.some((id) => id === target)) navigateSection(target as SectionId)
  }

  const goAssign = (jobId: string) => {
    setFocusJobId(jobId)
    navigateSection('dispatch')
  }

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

    jobs
      .filter(
        (job) =>
          job.id.toLowerCase().includes(query) ||
          job.customer.toLowerCase().includes(query) ||
          job.bookingId.toLowerCase().includes(query) ||
          job.zone.toLowerCase().includes(query),
      )
      .forEach((job) =>
        push(
          { id: `job-${job.id}`, group: 'Jobs', label: job.id, sub: `${job.customer} · ${job.status}`, section: 'dispatch' },
          5,
        ),
      )

    operators
      .filter((operator) => operator.name.toLowerCase().includes(query) || operator.zone.toLowerCase().includes(query))
      .forEach((operator) =>
        push(
          {
            id: `op-${operator.id}`,
            group: 'Operators',
            label: operator.name,
            sub: `${operator.vehicle} · ${operator.status} · ${operator.zone}`,
            section: 'map',
          },
          5,
        ),
      )

    zoneBoundaries
      .filter((zone) => zone.name.toLowerCase().includes(query))
      .forEach((zone) =>
        push({ id: `zone-${zone.id}`, group: 'Zones', label: zone.name, sub: `${zone.city} zone`, section: 'map' }, 3),
      )

    return results
  }, [headerQuery, jobs, operators])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')
    navigateSection(result.section)
  }

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>
      <style>{dispatcherStyles}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">Dispatcher · {dispatcherProfile.city}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">Dispatch</div>
          <ul className="sa-nav">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`sa-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => navigateSection(section.id)}
                >
                  <span>{section.label}</span>
                  {section.id === 'dispatch' && unassignedCount > 0 && (
                    <span className="sa-nav-badge">{unassignedCount}</span>
                  )}
                  {section.id === 'escalations' && openEscalations > 0 && (
                    <span className="sa-nav-badge">{openEscalations}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>{dispatcherProfile.city} scope</strong>
          <span>{zoneBoundaries.length} zones in scope · on shift {dispatcherProfile.shift} ({dispatcherProfile.shiftWindow})</span>
          {permissions.map((permission) => (
            <span key={permission.scope} className="ops-scope-perm">
              <strong>{permission.scope}:</strong> {permission.detail}
            </span>
          ))}
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{dispatcherProfile.initials}</div>
          <div className="sa-account-copy">
            <strong>{dispatcherProfile.name}</strong>
            <span>{dispatcherProfile.email}</span>
          </div>
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Logout
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="dashboard-header">
          <div className="header-copy">
            <p className="header-kicker">
              {dispatcherProfile.city} · {dispatcherProfile.shift} shift
            </p>
            <h1 className="header-title">{sectionMeta.title}</h1>
            <div className="header-breadcrumb">
              Overview / {dispatcherProfile.state} / Dispatch / {sectionMeta.crumb}
            </div>
          </div>

          <div className="header-actions">
            <div className="header-toolbar">
              {headerPanel && <div className="header-panel-backdrop" aria-hidden="true" onClick={() => setHeaderPanel(null)} />}

              <div className="header-search-wrap">
                <input
                  className="header-search"
                  aria-label="Search jobs, operators and zones"
                  placeholder="Search jobs, operators, zones..."
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
                      <div className="header-feed-empty">
                        No matches for “{headerQuery.trim()}”. Try a job id, operator or zone.
                      </div>
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

              <div className="header-popover-wrap">
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

              <div className="header-popover-wrap">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'alerts' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'alerts' ? null : 'alerts')}
                >
                  Alerts <span className="header-badge header-badge-amber">{dispatcherAlerts.length}</span>
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{dispatcherAlerts.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {dispatcherAlerts.map((item) => (
                        <button key={item.id} type="button" className="header-feed-item" onClick={() => openFeedTarget(item.target)}>
                          <span
                            className={`header-feed-dot ${
                              item.severity === 'Critical' ? 'red' : item.severity === 'Warning' ? 'amber' : 'blue'
                            }`}
                          />
                          <span className="header-feed-body">
                            <span className="header-alert-top">
                              <strong>{item.title}</strong>
                              <span className={`header-sev ${item.severity.toLowerCase()}`}>{item.severity}</span>
                            </span>
                            <span>{item.detail}</span>
                            <span className="header-feed-time">{item.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="header-popover-foot">
                      <button type="button" className="header-action" onClick={() => openFeedTarget('overview')}>
                        Open overview
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap">
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <div className="header-avatar">{dispatcherProfile.initials}</div>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
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
            <OverviewSection jobs={jobs} operators={operators} onNavigate={navigateSection} />
          )}

          {activeSection === 'dispatch' && (
            <DispatchSection
              key={focusJobId ?? 'dispatch'}
              jobs={jobs}
              operators={operators}
              audit={audit}
              focusJobId={focusJobId}
              onAssign={handleAssign}
            />
          )}

          {activeSection === 'map' && <LiveMapSection jobs={jobs} operators={operators} onAssign={goAssign} />}

          {activeSection === 'reassign' && (
            <ReassignSection
              jobs={jobs}
              operators={operators}
              reassignments={reassignments}
              onReassign={handleReassign}
            />
          )}

          {activeSection === 'contact' && (
            <ContactSection jobs={jobs} operators={operators} contactLog={contactEntries} onContact={handleContact} />
          )}

          {activeSection === 'shift' && <ShiftSection jobs={jobs} notes={notes} onAddNote={addHandoverNote} />}

          {activeSection === 'escalations' && (
            <EscalationsSection
              rows={escalationRows}
              onCreate={createEscalation}
              onAcknowledge={acknowledgeEscalation}
              onEscalate={escalate}
            />
          )}
        </div>
      </div>
    </section>
  )
}
