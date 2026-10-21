import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import {
  auditTrail,
  availableOperators,
  dashboardPeriods,
  daysAgoIso,
  disputes,
  dispatchJobs,
  escalations as seedEscalations,
  opsAlerts,
  opsBookings,
  opsNotifications,
  opsProfile,
  permissions,
  seedHandoverNotes,
  supplyRows,
  vehicles,
  type AuditEntry,
  type Escalation,
  type HandoverNote,
  type OpsBooking,
  type SectionId,
  type VehicleStatus,
} from './operationsData'
import OverviewSection from './OverviewSection'
import DispatchSection, { type DispatchAction } from './DispatchSection'
import BookingsSection, { type BookingEdit } from './BookingsSection'
import VehiclesSection from './VehiclesSection'
import LiveMapSection from './LiveMapSection'
import ShiftSection from './ShiftSection'
import EscalationsSection from './EscalationsSection'
import SlaDelaysSection from './SlaDelaysSection'
import { emptyDateRange, type DateRange } from './dateRange'
import { opsDeadlines, slaEscalationTarget } from './opsSlaData'
import ApprovalsSection, { type ApprovalDecisionPayload } from './ApprovalsSection'
import { approvalEscalationTarget, opsApprovalRequests, type OpsRequest } from './opsApprovalsData'
import DisputesSection from './DisputesSection'
import IssuesSection, { type IssueDraft } from './IssuesSection'
import { opsIssues, zoneAdminTarget, type OpsIssue } from './opsIssuesData'
import ReportsSection from './ReportsSection'
import AuditSection from './AuditSection'
import RulesAndPermissionsSection from './RulesAndPermissionsSection'
import NotificationsSection from './NotificationsSection'

// Ops-specific extras layered on top of the shared command-center styles.
const opsStyles = `
button.sa-approval-item {
  text-align: left;
  width: 100%;
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}
button.sa-approval-item:hover {
  background: var(--sa-wash, rgba(15, 23, 42, 0.04));
}
.ops-alert-btn {
  cursor: pointer;
}
.sa-row-selected {
  background: var(--sa-wash, rgba(15, 23, 42, 0.05));
}
.sa-expand-row > td {
  padding: 0 16px 16px;
}
.ops-manage-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(320px, 1.6fr);
  gap: 18px;
  padding-top: 6px;
}
.ops-history strong {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
}
.ops-history ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ops-history li {
  font-size: 12.5px;
  line-height: 1.5;
  padding: 5px 0;
  border-bottom: 1px dashed var(--sa-line, rgba(127, 127, 127, 0.25));
  opacity: 0.85;
}
.ops-history li span {
  display: inline-block;
  min-width: 92px;
  font-weight: 700;
  opacity: 0.7;
}
.ops-manage-form,
.ops-action-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}
.ops-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
}
.ops-field-grow {
  flex: 1 1 260px;
}
.ops-field-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ops-action-panel {
  border-left: 3px solid var(--sa-accent, #f59e0b);
}
.ops-map-layout {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 16px;
}
.ops-map-canvas {
  position: relative;
  height: 440px;
  border-radius: 14px;
  border: 1px solid var(--sa-line, #e4e7ec);
  background:
    linear-gradient(var(--sa-wash, rgba(15, 23, 42, 0.04)) 1px, transparent 1px),
    linear-gradient(90deg, var(--sa-wash, rgba(15, 23, 42, 0.04)) 1px, transparent 1px);
  background-size: 44px 44px;
  overflow: hidden;
}
.ops-city {
  position: absolute;
  transform: translate(-50%, -8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: none;
  border: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  padding: 4px;
  border-radius: 10px;
}
.ops-city.selected {
  outline: 2px solid var(--sa-accent, #f59e0b);
  outline-offset: 2px;
}
.ops-city-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
}
.ops-city-dot.blue { color: #3b82f6; background: rgba(59, 130, 246, 0.25); }
.ops-city-dot.amber { color: #f59e0b; background: rgba(245, 158, 11, 0.3); }
.ops-city-dot.red { color: #ef4444; background: rgba(239, 68, 68, 0.3); }
.ops-city-label {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.ops-city-meta {
  font-size: 10.5px;
  opacity: 0.65;
  white-space: nowrap;
}
.ops-vehicle-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.ops-vehicle-dot.blue { background: #3b82f6; }
.ops-vehicle-dot.green { background: #22c55e; }
.ops-vehicle-dot.slate { background: #94a3b8; }
.ops-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 4px 2px;
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
.ops-readonly-banner {
  font-size: 12.5px;
  opacity: 0.75;
  font-style: italic;
}
.ops-report-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.ops-report-block > strong {
  display: block;
  font-size: 13px;
  margin-bottom: 10px;
}
.ops-scope-perm {
  display: block;
  font-size: 11.5px;
  line-height: 1.5;
  opacity: 0.72;
  margin-top: 6px;
}
`

type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

const sections: SectionMeta[] = [
  { id: 'overview', label: 'Overview', title: 'Operations overview', crumb: 'Overview' },
  { id: 'dispatch', label: 'Dispatch', title: 'Dispatch overrides', crumb: 'Dispatch' },
  { id: 'bookings', label: 'Bookings', title: 'Bookings · booking.manage', crumb: 'Bookings' },
  { id: 'vehicles', label: 'Vehicles', title: 'Vehicles & drivers', crumb: 'Vehicles' },
  { id: 'map', label: 'Live map', title: 'Live map · vehicles & drivers', crumb: 'Live map' },
  { id: 'shift', label: 'Shift', title: 'Shift coordination', crumb: 'Shift' },
  { id: 'escalations', label: 'Escalations', title: 'Escalations inbox', crumb: 'Escalations' },
  { id: 'sla', label: 'SLA & delays', title: 'SLA & delays', crumb: 'SLA & delays' },
  { id: 'approvals', label: 'Approvals & requests', title: 'Approvals & requests', crumb: 'Approvals' },
  { id: 'disputes', label: 'Disputes', title: 'Disputes & tickets · read only', crumb: 'Disputes' },
  { id: 'issues', label: 'Issues & incidents', title: 'Issues & incident reports', crumb: 'Issues & incidents' },
  { id: 'reports', label: 'Reports', title: 'Operations reports', crumb: 'Reports' },
  { id: 'audit', label: 'Audit logs', title: 'Audit logs · read only', crumb: 'Audit logs' },
  { id: 'rules', label: 'Rules & permissions', title: 'Rules & permissions', crumb: 'Rules & permissions' },
  { id: 'notifications', label: 'Notifications', title: 'Notifications', crumb: 'Notifications' },
]

const sectionIds: SectionId[] = sections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#operations-manager/${id}`)) ?? 'overview'
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
  query?: string
}

type OperationsManagerDashboardProps = {
  onSignOut?: () => void
}

export default function OperationsManagerDashboard({ onSignOut }: OperationsManagerDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState('This Month')
  const [notifications, setNotifications] = useState(opsNotifications.filter((n) => n.zone === opsProfile.zone))
  const [jobs, setJobs] = useState(dispatchJobs.filter((j) => j.zone === opsProfile.zone))
  const [audit, setAudit] = useState<AuditEntry[]>(auditTrail)
  const [bookings, setBookings] = useState<OpsBooking[]>(opsBookings.filter((b) => b.zone === opsProfile.zone))
  const [escalationRows, setEscalationRows] = useState<Escalation[]>(seedEscalations.filter((e) => e.city === opsProfile.city))
  const [notes, setNotes] = useState<HandoverNote[]>(seedHandoverNotes)
  const [issues, setIssues] = useState<OpsIssue[]>(opsIssues)
  const [issueSeq, setIssueSeq] = useState(1043)
  const [disputeReviewRequests, setDisputeReviewRequests] = useState<Record<string, { at: string; request: string }>>({})
  const [approvalRequests, setApprovalRequests] = useState<OpsRequest[]>(opsApprovalRequests)
  const [slaEscalations, setSlaEscalations] = useState<Record<string, string>>({})
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [vehicleStatus, setVehicleStatus] = useState<'All' | VehicleStatus>('All')
  const [vehicleDateRange, setVehicleDateRange] = useState<DateRange>(emptyDateRange)
  const [toast, setToast] = useState<string | null>(null)
  const [auditSeq, setAuditSeq] = useState(105)
  const [noteSeq, setNoteSeq] = useState(4)

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
    window.history.pushState(null, '', `#operations-manager/${id}`)
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
    setAudit((prev) => [{ id, time: 'Just now', actor: opsProfile.adminName, action, target, reason }, ...prev])
  }

  const appendHistory = (bookingId: string, event: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, history: [...booking.history, { time: 'Just now', event }] } : booking,
      ),
    )
  }

  const unassignedCount = jobs.filter((job) => job.status === 'Unassigned').length
  const newEscalations = escalationRows.filter((row) => row.status === 'New').length
  const unreadNotifications = notifications.filter((item) => !item.read).length
  const sectionMeta = sections.find((section) => section.id === activeSection) ?? sections[0]

  const handleDispatchAction = ({ jobId, action, operatorId, reason }: DispatchAction) => {
    const operatorName =
      operatorId !== undefined
        ? (availableOperators.find((entry) => entry.id === operatorId)?.name ?? operatorId)
        : undefined

    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job
        if (action === 'assign') return { ...job, operator: operatorName, status: 'Assigned' }
        if (action === 'reassign')
          return { ...job, operator: operatorName, status: job.status === 'In Progress' ? 'In Progress' : 'Assigned' }
        return { ...job, priority: 'Urgent' }
      }),
    )

    if (action === 'assign') appendAudit('Manual dispatch override', `${jobId} → ${operatorName}`, reason)
    else if (action === 'reassign') appendAudit('Reassigned job', `${jobId} → ${operatorName}`, reason)
    else appendAudit('Prioritized job', `${jobId} Urgent`, reason)

    showToast(
      action === 'assign'
        ? `${jobId} assigned to ${operatorName}`
        : action === 'reassign'
          ? `${jobId} reassigned to ${operatorName}`
          : `${jobId} marked urgent`,
    )
  }

  const handleBookingEdit = (id: string, patch: BookingEdit, reason: string) => {
    setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, ...patch } : booking)))
    appendHistory(id, `Details updated — ${reason}`)
    appendAudit('Booking details updated', id, reason)
    showToast(`${id} updated`)
  }

  const handleBookingReassign = (id: string, operatorName: string, reason: string) => {
    setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, operator: operatorName } : booking)))
    appendHistory(id, `Reassigned to ${operatorName} — ${reason}`)
    appendAudit('Booking reassigned', `${id} → ${operatorName}`, reason)
    showToast(`${id} reassigned to ${operatorName}`)
  }

  const handleBookingResolve = (id: string, reason: string) => {
    setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, stuck: false } : booking)))
    appendHistory(id, `Stuck job resolved — ${reason}`)
    appendAudit('Stuck job resolved', id, reason)
    showToast(`${id} marked resolved`)
  }

  const handleBookingCancel = (id: string, reason: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: 'Cancelled', stuck: false, operator: 'Unassigned' } : booking,
      ),
    )
    appendHistory(id, `Booking cancelled — ${reason}`)
    appendAudit('Booking cancelled', id, reason)
    showToast(`${id} cancelled`)
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

  const addHandoverNote = (text: string) => {
    const id = `HN-${noteSeq}`
    setNoteSeq(noteSeq + 1)
    setNotes((prev) => [{ id, time: 'Just now', date: daysAgoIso(0), author: opsProfile.adminName, text }, ...prev])
    showToast('Handover note added')
  }

  const recordIssue = (draft: IssueDraft) => {
    const id = `IS-${issueSeq}`
    setIssueSeq(issueSeq + 1)
    const issue: OpsIssue = {
      id,
      category: draft.category,
      severity: draft.severity,
      title: draft.title,
      detail: draft.detail,
      vehicle: draft.vehicle,
      registration: draft.registration,
      jobId: draft.jobId.trim() ? draft.jobId.trim() : null,
      bookingId: null,
      site: draft.site,
      reportedBy: opsProfile.adminName,
      reportedAt: 'Just now',
      assignedTo: draft.assignedTo.trim() ? draft.assignedTo.trim() : null,
      status: draft.escalateToZoneAdmin ? 'Escalated' : 'Reported',
      attachments: draft.attachments,
      escalatedTo: draft.escalateToZoneAdmin ? zoneAdminTarget : null,
      escalatedAt: draft.escalateToZoneAdmin ? 'Just now' : null,
      escalationReason: draft.escalateToZoneAdmin ? draft.escalationReason.trim() : null,
      resolutionNote: null,
      resolvedAt: null,
      injuries: 0,
      downtimeDays: 0,
    }
    setIssues((prev) => [issue, ...prev])
    appendAudit(
      'Incident reported',
      `${id} · ${draft.title}`,
      draft.escalateToZoneAdmin ? draft.escalationReason.trim() || draft.detail : draft.detail,
    )
    showToast(
      draft.escalateToZoneAdmin
        ? `${id} recorded and escalated to ${zoneAdminTarget}`
        : `${id} recorded`,
    )
  }

  const assignIssue = (id: string, assignee: string) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, assignedTo: assignee || null } : issue)),
    )
    appendAudit('Assigned incident owner', `${id} → ${assignee || 'Unassigned'}`, 'Incident ownership updated from the case file.')
    showToast(assignee ? `${id} assigned to ${assignee}` : `${id} left unassigned`)
  }

  const updateIssueStatus = (id: string, status: OpsIssue['status'], note: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status,
              resolutionNote: status === 'Resolved' || status === 'Closed' ? note : issue.resolutionNote,
              resolvedAt: status === 'Resolved' || status === 'Closed' ? 'Just now' : issue.resolvedAt,
            }
          : issue,
      ),
    )
    appendAudit('Updated incident status', `${id} → ${status}`, note)
    showToast(`${id} marked ${status.toLowerCase()}`)
  }

  const escalateIssue = (id: string, reason: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? { ...issue, status: 'Escalated', escalatedTo: zoneAdminTarget, escalatedAt: 'Just now', escalationReason: reason }
          : issue,
      ),
    )
    appendAudit('Escalated incident', `${id} → ${zoneAdminTarget}`, reason)
    showToast(`${id} escalated to the Zone Admin`)
  }

  const requestDisputeDecision = (id: string, request: string) => {
    const dispute = disputes.find((row) => row.id === id)
    setDisputeReviewRequests((prev) => ({ ...prev, [id]: { at: 'Just now', request } }))
    appendAudit('Dispute decision requested', `${id} → ${dispute?.owner ?? 'Case owner'}`, request)
    showToast(`Decision requested on ${id}`)
  }

  const decideApproval = ({ id, decision, comment }: ApprovalDecisionPayload) => {
    const request = approvalRequests.find((row) => row.id === id)
    setApprovalRequests((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              status: decision,
              assignee: decision === 'Escalated' ? approvalEscalationTarget : opsProfile.adminName,
              history: [
                ...row.history,
                {
                  id: `${id}-h${row.history.length + 1}`,
                  action: decision,
                  actor: opsProfile.adminName,
                  role: 'Operations Manager',
                  time: 'Just now',
                  comment: comment || undefined,
                },
              ],
            }
          : row,
      ),
    )
    appendAudit(
      decision === 'Approved'
        ? 'Approved request'
        : decision === 'Rejected'
          ? 'Rejected request'
          : decision === 'Returned'
            ? 'Returned request'
            : 'Escalated request',
      `${id} · ${request?.type ?? 'Request'}`,
      comment || 'Approved within the delegated limit.',
    )
  }

  const commentOnApproval = (id: string, text: string) => {
    const request = approvalRequests.find((row) => row.id === id)
    setApprovalRequests((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              comments: [
                ...row.comments,
                {
                  id: `${id}-c${row.comments.length + 1}`,
                  author: opsProfile.adminName,
                  role: 'Operations Manager',
                  time: 'Just now',
                  text,
                },
              ],
            }
          : row,
      ),
    )
    appendAudit('Commented on request', `${id} · ${request?.type ?? 'Request'}`, text)
  }

  const escalateSlaDeadline = (id: string, reason: string) => {
    const deadline = opsDeadlines.find((row) => row.id === id)
    setSlaEscalations((prev) => ({ ...prev, [id]: 'Just now' }))
    appendAudit(
      'Escalated SLA breach',
      `${id} · ${deadline?.reference ?? 'Deadline'} → ${slaEscalationTarget}`,
      reason,
    )
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

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.zone === opsProfile.zone &&
      (vehicleStatus === 'All' || vehicle.status === vehicleStatus) &&
      (!vehicleDateRange.from || vehicle.lastPingOn >= vehicleDateRange.from) &&
      (!vehicleDateRange.to || vehicle.lastPingOn <= vehicleDateRange.to) &&
      (vehicleQuery.trim() === '' ||
        vehicle.model.toLowerCase().includes(vehicleQuery.trim().toLowerCase()) ||
        vehicle.regNo.toLowerCase().includes(vehicleQuery.trim().toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(vehicleQuery.trim().toLowerCase()) ||
        vehicle.city.toLowerCase().includes(vehicleQuery.trim().toLowerCase())),
  )

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
        push(
          { id: `sec-${section.id}`, group: 'Sections', label: section.label, sub: 'Open section', section: section.id },
          4,
        ),
      )

    jobs
      .filter(
        (job) =>
          job.id.toLowerCase().includes(query) ||
          job.customer.toLowerCase().includes(query) ||
          job.bookingId.toLowerCase().includes(query),
      )
      .forEach((job) =>
        push(
          { id: `job-${job.id}`, group: 'Jobs', label: job.id, sub: `${job.customer} · ${job.status}`, section: 'dispatch' },
          4,
        ),
      )

    bookings
      .filter(
        (booking) =>
          booking.id.toLowerCase().includes(query) || booking.customer.toLowerCase().includes(query),
      )
      .forEach((booking) =>
        push(
          {
            id: `bk-${booking.id}`,
            group: 'Bookings',
            label: booking.id,
            sub: `${booking.customer} · ${booking.status}`,
            section: 'bookings',
          },
          4,
        ),
      )

    vehicles
      .filter(
        (vehicle) =>
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.regNo.toLowerCase().includes(query) ||
          vehicle.driver.toLowerCase().includes(query),
      )
      .forEach((vehicle) =>
        push(
          {
            id: `veh-${vehicle.id}`,
            group: 'Vehicles',
            label: vehicle.model,
            sub: `${vehicle.regNo} · ${vehicle.driver}`,
            section: 'vehicles',
            query: vehicle.regNo,
          },
          3,
        ),
      )

    supplyRows
      .filter((row) => row.zone.toLowerCase().includes(query) || row.city.toLowerCase().includes(query))
      .forEach((row) =>
        push(
          {
            id: `zone-${row.id}`,
            group: 'Zones',
            label: row.zone,
            sub: `${row.city} · demand ${row.demand} · ${row.balance}`,
            section: 'overview',
          },
          3,
        ),
      )

    return results
  }, [headerQuery, jobs, bookings])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')

    if (result.section === 'vehicles') {
      setVehicleQuery(result.query ?? '')
      setVehicleStatus('All')
    }

    navigateSection(result.section)
  }

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>
      <style>{opsStyles}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">Ops Manager · {opsProfile.state}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">Zone operations</div>
          <ul className="sa-nav">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`sa-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => navigateSection(section.id)}
                >
                  <span>{section.label}</span>
                  {section.id === 'dispatch' && unassignedCount > 0 && <span className="sa-nav-badge">{unassignedCount}</span>}
                  {section.id === 'escalations' && newEscalations > 0 && (
                    <span className="sa-nav-badge">{newEscalations}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>{opsProfile.zone} zone scope</strong>
          <span>
            {opsProfile.zone} · {opsProfile.city} · {opsProfile.state} only.
          </span>
          {permissions.map((permission) => (
            <span key={permission.scope} className="ops-scope-perm">
              <strong>{permission.scope}:</strong> {permission.detail}
            </span>
          ))}
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{opsProfile.adminInitials}</div>
          <div className="sa-account-copy">
            <strong>{opsProfile.adminName}</strong>
            <span>{opsProfile.adminEmail}</span>
          </div>
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Logout
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="dashboard-header">
          <div className="header-copy">
            <p className="header-kicker">{opsProfile.state} · {opsProfile.city} · {opsProfile.zone} command</p>
            <h1 className="header-title">{sectionMeta.title}</h1>
            <div className="header-breadcrumb">
              Overview / {opsProfile.state} / {opsProfile.city} / {opsProfile.zone} / {sectionMeta.crumb}
            </div>
          </div>

          <div className="header-actions">
            <div className="header-toolbar">
              {headerPanel && (
                <div className="header-panel-backdrop" aria-hidden="true" onClick={() => setHeaderPanel(null)} />
              )}

              <div className="header-search-wrap">
                <input
                  className="header-search"
                  aria-label="Search the operations dashboard"
                  placeholder="Search jobs, bookings, vehicles..."
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
                        No matches for “{headerQuery.trim()}”. Try a job id, booking, vehicle or zone.
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
                  Alerts <span className="header-badge header-badge-amber">{opsAlerts.length}</span>
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{opsAlerts.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {opsAlerts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="header-feed-item"
                          onClick={() => openFeedTarget(item.target)}
                        >
                          <span
                            className={`header-feed-dot ${item.severity === 'Critical' ? 'red' : item.severity === 'Warning' ? 'amber' : 'blue'}`}
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
                <div className="header-avatar">{opsProfile.adminInitials}</div>
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
          {activeSection === 'overview' && <OverviewSection onNavigate={navigateSection} />}

          {activeSection === 'dispatch' && (
            <DispatchSection jobs={jobs} audit={audit} onDispatchAction={handleDispatchAction} />
          )}

          {activeSection === 'bookings' && (
            <BookingsSection
              bookings={bookings}
              onEdit={handleBookingEdit}
              onReassign={handleBookingReassign}
              onResolve={handleBookingResolve}
              onCancel={handleBookingCancel}
            />
          )}

          {activeSection === 'vehicles' && (
            <VehiclesSection
              vehicles={filteredVehicles}
              query={vehicleQuery}
              onQueryChange={setVehicleQuery}
              status={vehicleStatus}
              onStatusChange={setVehicleStatus}
              dateRange={vehicleDateRange}
              onDateRangeChange={setVehicleDateRange}
              onReset={() => {
                setVehicleQuery('')
                setVehicleStatus('All')
                setVehicleDateRange(emptyDateRange)
              }}
            />
          )}

          {activeSection === 'map' && <LiveMapSection vehicles={vehicles} />}

          {activeSection === 'shift' && <ShiftSection notes={notes} onAddNote={addHandoverNote} />}

          {activeSection === 'escalations' && (
            <EscalationsSection rows={escalationRows} onAcknowledge={acknowledgeEscalation} onEscalate={escalate} />
          )}

          {activeSection === 'sla' && (
            <SlaDelaysSection escalated={slaEscalations} onEscalate={escalateSlaDeadline} onToast={showToast} />
          )}

          {activeSection === 'approvals' && (
            <ApprovalsSection
              requests={approvalRequests}
              onDecide={decideApproval}
              onComment={commentOnApproval}
              onToast={showToast}
            />
          )}

          {activeSection === 'disputes' && (
            <DisputesSection
              rows={disputes}
              reviewRequests={disputeReviewRequests}
              onRequestReview={requestDisputeDecision}
            />
          )}

          {activeSection === 'issues' && (
            <IssuesSection
              issues={issues}
              onRecord={recordIssue}
              onAssign={assignIssue}
              onStatus={updateIssueStatus}
              onEscalate={escalateIssue}
            />
          )}

          {activeSection === 'reports' && <ReportsSection onToast={showToast} />}

          {activeSection === 'audit' && <AuditSection sessionAudit={audit} onToast={showToast} />}

          {activeSection === 'rules' && <RulesAndPermissionsSection onToast={showToast} />}

          {activeSection === 'notifications' && (
            <NotificationsSection onNavigate={openFeedTarget} onToast={showToast} />
          )}
        </div>
      </div>
    </section>
  )
}
