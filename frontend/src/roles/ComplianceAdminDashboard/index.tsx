import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import {
  auditTrail,
  buildComplianceAlerts,
  complianceProfile,
  dashboardPeriods,
  documents as seedDocuments,
  escalationRows as seedEscalations,
  escalationRisks,
  evidenceOptions,
  expiryRows as seedExpiries,
  inspectionRows as seedInspections,
  permitRows as seedPermits,
  suspendDriverOptions,
  suspendVehicleOptions,
  suspensionRows as seedSuspensions,
  type AuditEntry,
  type ComplianceDocument,
  type DocStatus,
  type DocSubjectType,
  type EscalationDirection,
  type EscalationRow,
  type ExpiryRow,
  type InspectionRow,
  type InspectionStatus,
  type PermitRow,
  type PermitStatus,
  type SectionId,
  type SuspensionRow,
} from './complianceAdminData'
import OverviewSection from './OverviewSection'
import VehiclesSection, { type VehicleStatusFilter } from './VehiclesSection'
import DriversSection, { type DriverFilter } from './DriversSection'
import ViolationsSection, { type ViolationFilter } from './ViolationsSection'
import ActionsSection, { type ActionFilter } from './ActionsSection'
import AuditsSection, { type AuditFilter } from './AuditsSection'
import DocumentsSection from './DocumentsSection'
import PermitsSection from './PermitsSection'
import InspectionsSection from './InspectionsSection'
import SuspensionsSection from './SuspensionsSection'
import ExpirySection from './ExpirySection'
import EscalationsSection from './EscalationsSection'
import ReportsSection from './ReportsSection'
import RulesPermissionsSection from './RulesPermissionsSection'
import NotificationsSection from './NotificationsSection'
import {
  buildComplianceNotifications,
  loadNotificationPreferences,
  notificationMatchesPreferences,
  saveNotificationPreferences,
  seedReadNotificationIds,
  type ComplianceNotificationView,
  type NotificationPreferences,
} from './complianceNotificationData'
import {
  evaluateCompliancePermission,
  type ComplianceDecisionContext,
  type CompliancePermission,
} from './compliancePermissions'
import {
  alertTargetSection,
  buildUrgentAlerts,
  computeComplianceMetrics,
  complianceActivity as seedActivity,
  complianceAudits as seedAudits,
  complianceViolations as seedViolations,
  correctiveActions as seedCorrectiveActions,
  driverCredentials as seedCredentials,
  fleetVehicles as seedVehicles,
  type ActivityTone,
  type ComplianceActivity,
  type ComplianceAudit,
  type ComplianceKpiKey,
  type ComplianceViolation,
  type CorrectiveAction,
  type DriverCredential,
  type FleetVehicle,
  type UrgentAlert,
} from './complianceFleetData'

// Compliance-specific extras layered on top of the shared command-center styles.
// The first block re-skins the shared system with the refined State Admin /
// Zone Admin console look so this dashboard matches those dashboards exactly.
// The card surface is intentionally NOT overridden here: KPI cards and panels
// inherit the shared `--sa-card-bg` (#ffffff) exactly like the other role
// dashboards, instead of a dashboard-local translucent white.
const cfStyles = `
.stateadmin-role-dashboard {
  --sa-text: #0f172a;
  --sa-muted: #667085;
  --sa-shadow: 0 24px 60px -24px rgba(15, 23, 42, 0.35);
}
.stateadmin-role-dashboard .sa-sidebar {
  background: radial-gradient(120% 120% at 0% 0%, #0f172a 0%, #0a1324 70%, #070c18 100%);
  padding: 18px 14px 12px;
  gap: 22px;
  box-shadow: 0 28px 80px -30px rgba(2, 6, 23, 0.9);
  backdrop-filter: blur(6px);
}
.stateadmin-role-dashboard .sa-nav-wrap {
  flex: 0 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.stateadmin-role-dashboard .sa-scope-card,
.stateadmin-role-dashboard .sa-account {
  flex-shrink: 0;
}
.stateadmin-role-dashboard .sa-brand {
  padding: 8px 10px 20px;
}
.stateadmin-role-dashboard .sa-brand-text {
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.stateadmin-role-dashboard .sa-brand-meta {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.stateadmin-role-dashboard .sa-sidebar-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
}
.stateadmin-role-dashboard .sa-nav-item {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.92rem;
}
.stateadmin-role-dashboard .sa-nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
}
.stateadmin-role-dashboard .sa-nav-item.active {
  background: linear-gradient(90deg, rgba(255, 107, 44, 0.24), rgba(239, 74, 18, 0.08));
  box-shadow: inset 3px 0 0 var(--sa-brand), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  color: #fff;
}
.stateadmin-role-dashboard .sa-nav-badge {
  min-width: 32px;
  height: auto;
  padding: 3px 7px;
  background: rgba(255, 255, 255, 0.08);
  color: #d9e4f2;
  font-size: 0.64rem;
  font-weight: 700;
}
.stateadmin-role-dashboard .dashboard-header {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
  border-color: rgba(15, 23, 42, 0.06);
  box-shadow: 0 24px 60px -28px rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
}
.stateadmin-role-dashboard .sa-kpi-card {
  padding: 16px 16px 14px;
  gap: 12px;
}
.stateadmin-role-dashboard .sa-kpi-label {
  font-size: 0.82rem;
}
.stateadmin-role-dashboard .sa-kpi-value {
  font-size: clamp(1.4rem, 1.8vw, 1.9rem);
}
.stateadmin-role-dashboard .sa-kpi-change {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.8rem;
  color: var(--sa-green);
}
.stateadmin-role-dashboard .sa-panel-header h3 {
  font-size: 1.08rem;
}
.stateadmin-role-dashboard .org-button {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  border-radius: 10px;
  padding: 7px 10px;
  color: var(--sa-text);
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}
.stateadmin-role-dashboard .org-button:hover {
  border-color: rgba(255, 107, 44, 0.45);
}
.stateadmin-role-dashboard .sa-cell-sub {
  font-weight: 400;
}
.sa-row-selected {
  background: var(--sa-wash, rgba(15, 23, 42, 0.05));
}
.sa-expand-row > td {
  padding: 0 16px 16px;
}
.sa-pill.purple {
  background: rgba(124, 58, 237, 0.12);
  color: #6d28d9;
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.cf-review {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cf-review-copy strong {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}
.cf-review-copy p {
  margin: 4px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  opacity: 0.85;
}
.cf-review-reason {
  color: #b91c1c;
  opacity: 1 !important;
}
.cf-review-note {
  color: #1d4ed8;
  opacity: 1 !important;
}
.cf-review-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.cf-review-actions .sa-input {
  flex: 1 1 240px;
}
.cf-history {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  font-size: 12.5px;
}
.cf-history li {
  padding: 5px 0;
  border-bottom: 1px dashed var(--sa-line, rgba(127, 127, 127, 0.25));
  opacity: 0.85;
}
.cf-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
  align-items: end;
  padding: 6px 0 4px;
}
.cf-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
}
.cf-field > span {
  font-weight: 600;
  opacity: 0.75;
}
.cf-field-grow {
  grid-column: span 2;
}
.cf-alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}
.cf-alert {
  border: 1px solid var(--sa-line, rgba(127, 127, 127, 0.25));
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12.5px;
  line-height: 1.5;
}
.cf-alert-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}
.cf-flag {
  display: inline-block;
  margin-left: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #b45309;
  border: 1px dashed #b45309;
  border-radius: 999px;
  padding: 1px 8px;
}
.cf-warn-num {
  color: #b45309;
  font-weight: 600;
}
.cf-report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
.cf-stat {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px dashed var(--sa-line, rgba(127, 127, 127, 0.25));
}
.cf-stat strong {
  font-size: 20px;
}
.cf-stat span {
  font-size: 12.5px;
  opacity: 0.8;
  text-align: right;
}
.cf-scope-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px 16px;
  padding: 14px 18px 16px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}
.cf-scope-list strong {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--sa-muted);
  margin-bottom: 4px;
}
.cf-scope-list span {
  font-size: 0.74rem;
  line-height: 1.5;
  color: var(--sa-text);
}
.cf-report-block {
  display: flex;
  flex-direction: column;
}
.cf-report-block > .cf-stat {
  margin: 0 18px;
  padding: 12px 0;
}
.cf-report-block > .sa-panel-header + .cf-stat {
  padding-top: 16px;
}
.cf-report-block > .cf-stat:last-of-type {
  border-bottom: 0;
}
.cf-reason-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 18px;
  padding: 14px 0 16px;
}
.cf-reason-row {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12.5px;
  padding: 6px 0;
}
.cf-reason-row > span:first-child {
  flex: 1 1 auto;
}
.cf-reason-row .sa-progress {
  flex: 0 0 120px;
}
.sa-kpi-card.red {
  border-color: rgba(239, 68, 68, 0.22);
}
.sa-kpi-card.is-active {
  border-color: rgba(255, 107, 44, 0.55);
  box-shadow: 0 0 0 3px rgba(255, 107, 44, 0.12), var(--sa-shadow);
}
.sa-kpi-change.green { background: transparent; color: var(--sa-green); }
.sa-kpi-change.blue { background: transparent; color: #1d4ed8; }
.sa-kpi-change.amber { background: transparent; color: #b45309; }
.sa-kpi-change.red { background: transparent; color: #b91c1c; }
.cf-score-card {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  border-color: rgba(8, 166, 108, 0.22);
}
.cf-score-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.cf-score-copy .sa-kpi-value {
  font-size: clamp(1.4rem, 1.8vw, 1.8rem);
}
.cf-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.cf-ring-core {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--sa-card-bg);
  display: grid;
  place-items: center;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--sa-text);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.1);
}
.cf-score-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--sa-muted);
}
.cf-score-legend span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.cf-score-legend i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.cf-alert-scroll {
  max-height: 460px;
  overflow-y: auto;
  padding: 14px 18px;
}
.cf-alert-critical {
  border-left: 3px solid var(--sa-red);
  background: rgba(239, 68, 68, 0.04);
}
.cf-alert-warning {
  border-left: 3px solid var(--sa-orange);
  background: rgba(245, 158, 11, 0.04);
}
.cf-alert.is-acknowledged {
  opacity: 0.55;
  background: transparent;
}
.cf-alert-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.cf-alert-meta {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--sa-muted);
}
.cf-activity-feed {
  max-height: 460px;
  overflow-y: auto;
}
.cf-activity-item strong {
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex-wrap: wrap;
}
.cf-activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
  display: inline-block;
}
.cf-activity-dot.green { background: var(--sa-green); }
.cf-activity-dot.amber { background: var(--sa-orange); }
.cf-activity-dot.red { background: var(--sa-red); }
.cf-activity-dot.blue { background: var(--sa-blue); }
.cf-stat-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px 18px 18px;
}
.cf-stat-strip .cf-stat {
  border-bottom: 0;
  border-left: 3px solid var(--sa-line);
  padding: 4px 0 4px 12px;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.cf-stat-strip .cf-stat strong {
  font-size: 1.6rem;
}
.cf-stat-strip .cf-stat span {
  text-align: left;
}
.cf-row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cf-gate {
  display: inline-flex;
}
.cf-gate .cf-gate-lock {
  margin-right: 5px;
  font-size: 0.72rem;
  line-height: 1;
  opacity: 0.85;
}
.cf-gate.blocked button {
  text-decoration: line-through;
  text-decoration-color: rgba(185, 28, 28, 0.45);
}
.cf-alert-title {
  appearance: none;
  background: none;
  border: 0;
  padding: 0;
  margin: 0;
  font: inherit;
  font-weight: 700;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.cf-alert-title:hover {
  color: var(--sa-brand-deep);
  text-decoration: underline;
}
button.cf-feed-link:hover {
  background: rgba(255, 107, 44, 0.05);
}
.header-feed-dot.purple {
  background: #7c3aed;
}
.header-feed-dot.slate {
  background: #64748b;
}
.cf-notif-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cf-notif-toolbar {
  align-items: flex-start;
  padding: 0 18px 14px;
}
.cf-notif-toolbar .sa-input {
  flex: 1 1 240px;
  max-width: 360px;
}
.cf-notif-prefs {
  padding: 0 18px 18px;
}
.cf-notif-pref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 14px;
}
.cf-notif-pref-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--sa-line);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.015);
}
.cf-notif-pref-group > strong {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sa-muted);
}
.cf-notif-check {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 0.8rem;
  color: var(--sa-text);
  cursor: pointer;
}
.cf-notif-check input {
  margin-top: 2px;
  accent-color: var(--sa-brand);
}
.cf-notif-check-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cf-notif-check-copy strong {
  font-weight: 700;
}
.cf-notif-check-copy em {
  font-style: normal;
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--sa-muted);
}
.cf-notif-pref-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--sa-muted);
}
.cf-notif-pref-note {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--sa-muted);
}
.cf-notif-record-link {
  appearance: none;
  background: none;
  border: 0;
  padding: 0;
  margin: 0;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--sa-brand-deep);
  text-align: left;
  cursor: pointer;
}
.cf-notif-record-link:hover {
  text-decoration: underline;
}
@media (max-width: 720px) {
  .cf-notif-toolbar .sa-input {
    max-width: none;
  }
}
`

type SectionMeta = {
  id: SectionId
  label: string
  title: string
  crumb: string
}

const sections: SectionMeta[] = [
  { id: 'overview', label: 'Overview', title: 'Compliance overview', crumb: 'Overview' },
  { id: 'notifications', label: 'Notifications', title: 'Notifications', crumb: 'Notifications' },
  { id: 'vehicles', label: 'Vehicles', title: 'Fleet compliance', crumb: 'Vehicles' },
  { id: 'drivers', label: 'Drivers', title: 'Driver credentials', crumb: 'Drivers' },
  { id: 'violations', label: 'Violations', title: 'Violations & notices', crumb: 'Violations' },
  { id: 'actions', label: 'Corrective actions', title: 'Corrective actions', crumb: 'Actions' },
  { id: 'audits', label: 'Audits', title: 'Audit schedule', crumb: 'Audits' },
  { id: 'documents', label: 'Documents', title: 'Document verification', crumb: 'Documents' },
  { id: 'permits', label: 'Permits', title: 'Permits & validity', crumb: 'Permits' },
  { id: 'inspections', label: 'Inspections', title: 'Inspections & schedules', crumb: 'Inspections' },
  { id: 'suspensions', label: 'Suspensions', title: 'Compliance suspensions', crumb: 'Suspensions' },
  { id: 'expiries', label: 'Expiry tracking', title: 'Expiry tracking & reminders', crumb: 'Expiry' },
  { id: 'escalations', label: 'Escalations', title: 'Escalation desk', crumb: 'Escalations' },
  { id: 'reports', label: 'Reports', title: 'Reports & audit', crumb: 'Reports' },
  { id: 'rules', label: 'Rules & permissions', title: 'Rules & permissions', crumb: 'Rules' },
]

const sectionIds: SectionId[] = sections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#compliance-admin/${id}`)) ?? 'overview'
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
  query?: string
}

type ComplianceAdminDashboardProps = {
  onSignOut?: () => void
}

export default function ComplianceAdminDashboard({ onSignOut }: ComplianceAdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState('This Month')
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(seedReadNotificationIds)
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    loadNotificationPreferences,
  )
  const [recordFocus, setRecordFocus] = useState<{ section: SectionId; recordId: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [documents, setDocuments] = useState<ComplianceDocument[]>(seedDocuments)
  const [permits, setPermits] = useState<PermitRow[]>(seedPermits)
  const [inspections, setInspections] = useState<InspectionRow[]>(seedInspections)
  const [suspensions, setSuspensions] = useState<SuspensionRow[]>(seedSuspensions)
  const [expiries, setExpiries] = useState<ExpiryRow[]>(seedExpiries)
  const [escalations, setEscalations] = useState<EscalationRow[]>(seedEscalations)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(auditTrail)

  const [vehicles, setVehicles] = useState<FleetVehicle[]>(seedVehicles)
  const [credentials, setCredentials] = useState<DriverCredential[]>(seedCredentials)
  const [violations, setViolations] = useState<ComplianceViolation[]>(seedViolations)
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>(seedCorrectiveActions)
  const [audits, setAudits] = useState<ComplianceAudit[]>(seedAudits)
  const [activity, setActivity] = useState<ComplianceActivity[]>(seedActivity)
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([])

  const [vehicleFilter, setVehicleFilter] = useState<VehicleStatusFilter>('All')
  const [driverFilter, setDriverFilter] = useState<DriverFilter>('All')
  const [violationFilter, setViolationFilter] = useState<ViolationFilter>('All')
  const [actionFilter, setActionFilter] = useState<ActionFilter>('All')
  const [auditFilter, setAuditFilter] = useState<AuditFilter>('All')

  const [docQuery, setDocQuery] = useState('')
  const [docStatus, setDocStatus] = useState<'All' | DocStatus>('All')
  const [docType, setDocType] = useState<'All' | DocSubjectType>('All')
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)
  const [docReason, setDocReason] = useState('')

  const [permitQuery, setPermitQuery] = useState('')
  const [permitStatus, setPermitStatus] = useState<'All' | PermitStatus>('All')
  const [expandedPermitId, setExpandedPermitId] = useState<string | null>(null)

  const [inspQuery, setInspQuery] = useState('')
  const [inspStatus, setInspStatus] = useState<'All' | InspectionStatus>('All')
  const [expandedInspId, setExpandedInspId] = useState<string | null>(null)
  const [inspNote, setInspNote] = useState('')

  const [suspSubjectType, setSuspSubjectType] = useState<'Vehicle' | 'Driver'>('Vehicle')
  const [suspSubject, setSuspSubject] = useState(suspendVehicleOptions[0].name)
  const [suspReason, setSuspReason] = useState('')
  const [suspEvidence, setSuspEvidence] = useState(evidenceOptions[0])

  const [expiryFilter, setExpiryFilter] = useState<'All' | 'Due soon' | 'Next 30 days' | 'Lapsed' | 'Reminded'>('All')

  const [escFilter, setEscFilter] = useState<'All' | EscalationDirection>('All')
  const [escSubject, setEscSubject] = useState('')
  const [escTarget, setEscTarget] = useState('State admin')
  const [escRisk, setEscRisk] = useState(escalationRisks[0])
  const [escReason, setEscReason] = useState('')

  useEffect(() => {
    const syncFromHash = () => setActiveSection(sectionFromHash())
    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('popstate', syncFromHash)
    }
  }, [])

  useEffect(() => {
    saveNotificationPreferences(notificationPreferences)
  }, [notificationPreferences])

  const navigateSection = (id: SectionId, focusId?: string) => {
    window.history.pushState(null, '', `#compliance-admin/${id}`)
    setActiveSection(id)
    setRecordFocus(focusId ? { section: id, recordId: focusId } : null)
    setHeaderPanel(null)
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2600)
  }

  const logAction = (action: string, detail: string) => {
    setAuditLog((prev) => [
      { id: `AL-${20 + prev.length}`, time: 'Just now', actor: complianceProfile.adminName, action, detail },
      ...prev,
    ])
  }

  // Fleet actions land in both the audit trail and the dashboard activity feed.
  const logActivity = (action: string, detail: string, tone: ActivityTone) => {
    setActivity((prev) => [
      { id: `ACT-${92 + prev.length}`, time: 'Just now', actor: complianceProfile.adminName, action, detail, tone },
      ...prev,
    ])
    logAction(action, detail)
  }

  // The single permission gate for the console. Every mutating handler asks it
  // first; a refusal is surfaced to the actor and written to the audit trail
  // exactly like the backend records it, so the UI never drifts from the API.
  const checkPermission = (
    permission: CompliancePermission,
    context: ComplianceDecisionContext = {},
  ) => evaluateCompliancePermission(permission, context)

  const authorize = (
    permission: CompliancePermission,
    subject: string,
    context: ComplianceDecisionContext = {},
  ): boolean => {
    const decision = checkPermission(permission, context)
    if (decision.allowed) return true
    logActivity('Blocked by permission policy', `${permission} · ${subject} — ${decision.reason}`, 'red')
    showToast(decision.reason)
    return false
  }

  // Relative labels such as "2 weeks ago" drive the delegated-limit checks.
  const daysFromRelativeLabel = (label: string): number => {
    const normalized = label.trim().toLowerCase()
    if (normalized === '' || normalized === 'just now') return 0
    const amount = Number.parseInt(normalized, 10)
    if (Number.isNaN(amount)) return 0
    if (normalized.includes('week')) return amount * 7
    if (normalized.includes('month')) return amount * 30
    if (normalized.includes('year')) return amount * 365
    return amount
  }

  const pendingDocs = documents.filter((doc) => doc.status === 'Pending' || doc.status === 'Renewed').length
  const openEscalations = escalations.filter((row) => row.status === 'Open').length
  const notifications = useMemo<ComplianceNotificationView[]>(
    () =>
      buildComplianceNotifications({
        expiries,
        credentials,
        inspections,
        violations,
        correctiveActions,
        audits,
      })
        .filter((item) => notificationMatchesPreferences(item, notificationPreferences))
        .map((item) => ({ ...item, read: readNotificationIds.includes(item.id) })),
    [
      expiries,
      credentials,
      inspections,
      violations,
      correctiveActions,
      audits,
      notificationPreferences,
      readNotificationIds,
    ],
  )
  const unreadNotifications = notifications.filter((item) => !item.read).length
  const sectionMeta = sections.find((section) => section.id === activeSection) ?? sections[0]

  const metrics = useMemo(
    () =>
      computeComplianceMetrics({
        vehicles,
        expiries,
        credentials,
        violations,
        correctiveActions,
        audits,
      }),
    [vehicles, expiries, credentials, violations, correctiveActions, audits],
  )

  // Document-desk alerts and fleet alerts share one ranked urgent list.
  const alerts = useMemo<UrgentAlert[]>(() => {
    const documentAlerts = buildComplianceAlerts(documents, inspections, expiries)
    return [
      ...documentAlerts.map((alert) => ({
        id: alert.id,
        severity: alert.severity,
        category: alert.category,
        title: alert.title,
        detail: alert.detail,
        owner: 'Document desk',
        due: '—',
      })),
      ...buildUrgentAlerts({ vehicles, credentials, violations, correctiveActions, audits }),
      // Stable sort keeps the source order inside each severity band.
    ].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'Critical' ? -1 : 1))
  }, [documents, inspections, expiries, vehicles, credentials, violations, correctiveActions, audits])

  const openAlertCount = alerts.filter((alert) => !acknowledgedAlerts.includes(alert.id)).length
  const criticalAlertCount = alerts.filter(
    (alert) => alert.severity === 'Critical' && !acknowledgedAlerts.includes(alert.id),
  ).length

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

    documents
      .filter((doc) => doc.id.toLowerCase().includes(query) || doc.holder.toLowerCase().includes(query) || doc.kind.toLowerCase().includes(query))
      .forEach((doc) =>
        push(
          { id: `doc-${doc.id}`, group: 'Documents', label: doc.id, sub: `${doc.kind} · ${doc.holder}`, section: 'documents', query: doc.id },
          4,
        ),
      )

    permits
      .filter((permit) => permit.vehicle.toLowerCase().includes(query) || permit.id.toLowerCase().includes(query) || permit.driver.toLowerCase().includes(query))
      .forEach((permit) =>
        push(
          { id: `permit-${permit.id}`, group: 'Permits', label: permit.id, sub: `${permit.vehicle} · ${permit.driver}`, section: 'permits', query: permit.id },
          3,
        ),
      )

    inspections
      .filter((row) => row.vehicle.toLowerCase().includes(query) || row.id.toLowerCase().includes(query) || row.model.toLowerCase().includes(query))
      .forEach((row) =>
        push(
          { id: `insp-${row.id}`, group: 'Inspections', label: row.id, sub: `${row.model} · ${row.kind}`, section: 'inspections', query: row.id },
          3,
        ),
      )

    vehicles
      .filter(
        (vehicle) =>
          vehicle.plate.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.owner.toLowerCase().includes(query) ||
          vehicle.city.toLowerCase().includes(query),
      )
      .forEach((vehicle) =>
        push(
          { id: `veh-${vehicle.id}`, group: 'Vehicles', label: vehicle.plate, sub: `${vehicle.model} · ${vehicle.status}`, section: 'vehicles', query: vehicle.id },
          4,
        ),
      )

    credentials
      .filter(
        (row) =>
          row.driver.toLowerCase().includes(query) ||
          row.kind.toLowerCase().includes(query) ||
          row.reference.toLowerCase().includes(query),
      )
      .forEach((row) =>
        push(
          { id: `drv-${row.id}`, group: 'Drivers', label: row.driver, sub: `${row.kind} · ${row.status}`, section: 'drivers', query: row.id },
          3,
        ),
      )

    violations
      .filter(
        (row) =>
          row.id.toLowerCase().includes(query) ||
          row.type.toLowerCase().includes(query) ||
          row.vehicle.toLowerCase().includes(query) ||
          row.driver.toLowerCase().includes(query),
      )
      .forEach((row) =>
        push(
          { id: `vio-${row.id}`, group: 'Violations', label: row.id, sub: `${row.vehicle} · ${row.type}`, section: 'violations', query: row.id },
          3,
        ),
      )

    correctiveActions
      .filter(
        (row) =>
          row.id.toLowerCase().includes(query) ||
          row.action.toLowerCase().includes(query) ||
          row.vehicle.toLowerCase().includes(query) ||
          row.violation.toLowerCase().includes(query),
      )
      .forEach((row) =>
        push(
          { id: `act-${row.id}`, group: 'Corrective actions', label: row.id, sub: `${row.vehicle} · ${row.status}`, section: 'actions', query: row.id },
          3,
        ),
      )

    audits
      .filter(
        (row) =>
          row.id.toLowerCase().includes(query) ||
          row.title.toLowerCase().includes(query) ||
          row.scope.toLowerCase().includes(query) ||
          row.auditor.toLowerCase().includes(query),
      )
      .forEach((row) =>
        push(
          { id: `aud-${row.id}`, group: 'Audits', label: row.id, sub: `${row.title} · ${row.scheduledOn}`, section: 'audits', query: row.id },
          3,
        ),
      )

    return results
  }, [headerQuery, documents, permits, inspections, vehicles, credentials, violations, correctiveActions, audits])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')

    if (result.section === 'documents') {
      setDocQuery(result.query ?? '')
      setDocStatus('All')
      setDocType('All')
    } else if (result.section === 'permits') {
      setPermitQuery(result.query ?? '')
      setPermitStatus('All')
    } else if (result.section === 'inspections') {
      setInspQuery(result.query ?? '')
      setInspStatus('All')
    } else if (result.section === 'vehicles') {
      setVehicleFilter('All')
    } else if (result.section === 'drivers') {
      setDriverFilter('All')
    } else if (result.section === 'violations') {
      setViolationFilter('All')
    } else if (result.section === 'actions') {
      setActionFilter('All')
    } else if (result.section === 'audits') {
      setAuditFilter('All')
    }

    navigateSection(result.section)
  }

  const setNotificationRead = (id: string, read: boolean) => {
    setReadNotificationIds((prev) => {
      if (read) return prev.includes(id) ? prev : [...prev, id]
      return prev.filter((item) => item !== id)
    })
  }

  const markAllNotificationsRead = () => {
    setReadNotificationIds((prev) => [...new Set([...prev, ...notifications.map((item) => item.id)])])
  }

  // A notification deep-links to its owning register, clears the filters that
  // could hide the record, and hands the row id to the section for focus.
  const openNotification = (notification: ComplianceNotificationView) => {
    setNotificationRead(notification.id, true)
    if (notification.target === 'expiries') setExpiryFilter('All')
    if (notification.target === 'drivers') setDriverFilter('All')
    if (notification.target === 'violations') setViolationFilter('All')
    if (notification.target === 'actions') setActionFilter('All')
    if (notification.target === 'audits') setAuditFilter('All')
    if (notification.target === 'inspections') {
      setInspQuery('')
      setInspStatus('All')
    }
    navigateSection(notification.target, notification.recordId)
  }

  const openFeedTarget = (target: string) => {
    setHeaderPanel(null)
    if (sectionIds.some((id) => id === target)) navigateSection(target as SectionId)
  }

  const openDocuments = (status: 'All' | DocStatus) => {
    setDocStatus(status)
    setDocType('All')
    setDocQuery('')
    navigateSection('documents')
  }

  const toggleDoc = (id: string) => {
    setExpandedDocId((current) => (current === id ? null : id))
    setDocReason('')
  }

  const verifyDoc = (id: string) => {
    if (!authorize('document.verify', id)) return
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: 'Verified', rejectReason: undefined } : doc)),
    )
    setExpandedDocId(null)
    setDocReason('')
    logAction('Verified document', id)
    showToast(`${id} verified`)
  }

  const rejectDoc = (id: string) => {
    if (!authorize('document.reject', id)) return
    const reason = docReason.trim()
    if (reason.length < 4) return
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: 'Rejected', rejections: doc.rejections + 1, rejectReason: reason } : doc,
      ),
    )
    setExpandedDocId(null)
    setDocReason('')
    logAction('Rejected document', `${id} — ${reason}`)
    showToast(`${id} rejected`)
  }

  const resetDocFilters = () => {
    setDocQuery('')
    setDocStatus('All')
    setDocType('All')
  }

  const togglePermit = (id: string) => {
    setExpandedPermitId((current) => (current === id ? null : id))
  }

  const verifyPermit = (id: string) => {
    if (!authorize('permit.verify', id)) return
    setPermits((prev) => prev.map((permit) => (permit.id === id ? { ...permit, status: 'Valid' } : permit)))
    setExpandedPermitId(null)
    logAction('Verified permit', id)
    showToast(`${id} verified`)
  }

  const resetPermitFilters = () => {
    setPermitQuery('')
    setPermitStatus('All')
  }

  const toggleInspection = (id: string) => {
    setExpandedInspId((current) => (current === id ? null : id))
    setInspNote('')
  }

  const recordInspection = (id: string, result: 'Pass' | 'Fail' | 'Pass with conditions') => {
    if (!authorize('inspection.record', id)) return
    const note = inspNote.trim()
    setInspections((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              status: result,
              note: note || row.note,
              followUp: result === 'Pass' ? undefined : note || row.followUp,
            }
          : row,
      ),
    )
    setExpandedInspId(null)
    setInspNote('')
    logAction('Recorded inspection', `${id} · ${result}`)
    showToast(`${id} recorded as ${result}`)
  }

  const resetInspFilters = () => {
    setInspQuery('')
    setInspStatus('All')
  }

  const subjectOptions = suspSubjectType === 'Vehicle' ? suspendVehicleOptions : suspendDriverOptions

  const changeSuspSubjectType = (type: 'Vehicle' | 'Driver') => {
    setSuspSubjectType(type)
    const options = type === 'Vehicle' ? suspendVehicleOptions : suspendDriverOptions
    setSuspSubject(options[0].name)
  }

  const createSuspension = () => {
    const permission: CompliancePermission = suspSubjectType === 'Vehicle' ? 'vehicle.suspend' : 'driver.suspend'
    if (!authorize(permission, suspSubject)) return
    const reason = suspReason.trim()
    if (suspSubject === '' || reason.length < 4 || suspEvidence === '') return
    const option = subjectOptions.find((item) => item.name === suspSubject)
    const entry: SuspensionRow = {
      id: `SUS-${56 + suspensions.length}`,
      subjectType: suspSubjectType,
      subject: suspSubject,
      city: option?.city ?? 'Hyderabad',
      reason,
      evidence: suspEvidence,
      since: 'Just now',
      status: 'Suspended',
    }
    setSuspensions((prev) => [entry, ...prev])
    setSuspReason('')
    logAction(`Suspended ${suspSubjectType.toLowerCase()}`, `${suspSubject} — ${reason}`)
    showToast(`${suspSubject} suspended`)
  }

  const reinstateSuspension = (id: string) => {
    const suspension = suspensions.find((row) => row.id === id)
    if (
      !authorize('suspension.reinstate', id, {
        daysSuspended: daysFromRelativeLabel(suspension?.since ?? 'Just now'),
      })
    )
      return
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    setSuspensions((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: 'Reinstated', reinstatedOn: today } : row)),
    )
    logAction('Reinstated', id)
    showToast(`${id} reinstated`)
  }

  const remindExpiry = (id: string) => {
    if (!authorize('expiry.remind', id)) return
    setExpiries((prev) => prev.map((row) => (row.id === id ? { ...row, reminded: true } : row)))
    logAction('Sent expiry reminder', id)
    showToast(`Reminder sent for ${id}`)
  }

  const remindAllPending = () => {
    if (!authorize('expiry.remind', 'All pending expiry reminders')) return
    const pending = expiries.filter((row) => row.daysLeft <= 7 && !row.reminded)
    setExpiries((prev) => prev.map((row) => (row.daysLeft <= 7 ? { ...row, reminded: true } : row)))
    logAction('Sent expiry reminders', `${pending.length} records`)
    showToast(`${pending.length} reminders sent`)
  }

  const createEscalation = () => {
    const subject = escSubject.trim()
    if (!authorize('escalation.create', subject || 'New escalation')) return
    const reason = escReason.trim()
    if (subject === '' || reason.length < 4) return
    const entry: EscalationRow = {
      id: `ESC-${72 + escalations.length}`,
      direction: 'Outgoing',
      subject,
      risk: escRisk,
      party: escTarget,
      opened: 'Just now',
      detail: reason,
      status: 'Open',
    }
    setEscalations((prev) => [entry, ...prev])
    setEscSubject('')
    setEscReason('')
    logAction('Escalated case', `${subject} → ${escTarget}`)
    showToast(`Escalated to ${escTarget}`)
  }

  const acknowledgeEscalation = (id: string) => {
    if (!authorize('escalation.resolve', id)) return
    setEscalations((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'Acknowledged' } : row)))
    logAction('Acknowledged escalation', id)
    showToast(`${id} acknowledged`)
  }

  const resolveEscalation = (id: string) => {
    if (!authorize('escalation.resolve', id)) return
    setEscalations((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'Resolved' } : row)))
    logAction('Resolved escalation', id)
    showToast(`${id} resolved`)
  }

  const exportReport = () => {
    if (!authorize('report.export', 'Compliance report')) return
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
    const rows: string[][] = [
      ['Section', 'Id', 'Detail', 'Status'],
      ...documents.map((doc) => ['Documents', doc.id, `${doc.kind} · ${doc.holder}`, doc.status]),
      ...permits.map((permit) => ['Permits', permit.id, `${permit.vehicle} · ${permit.kind}`, permit.status]),
      ...inspections.map((row) => ['Inspections', row.id, `${row.vehicle} · ${row.kind}`, row.status]),
      ...suspensions.map((row) => ['Suspensions', row.id, `${row.subject} · ${row.reason}`, row.status]),
      ...expiries.map((row) => ['Expiries', row.id, `${row.item} · ${row.subject}`, `${row.daysLeft} days left`]),
    ]
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'compliance-report-october-2026.csv'
    link.click()
    URL.revokeObjectURL(url)
    logAction('Exported compliance report', `${rows.length - 1} records`)
    showToast('Compliance report exported')
  }

  const acknowledgeAlert = (id: string) => {
    const alert = alerts.find((item) => item.id === id)
    if (alert && !authorize('alert.acknowledge', alert.title)) return
    if (!alert || acknowledgedAlerts.includes(id)) return
    setAcknowledgedAlerts((prev) => [...prev, id])
    logActivity('Acknowledged alert', alert.title, 'amber')
    showToast('Alert acknowledged')
  }

  const resolveViolation = (id: string) => {
    const violation = violations.find((row) => row.id === id)
    if (!violation || violation.status === 'Closed') return
    if (!authorize('violation.resolve', violation.id)) return
    setViolations((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'Closed' } : row)))
    logActivity('Resolved violation', `${violation.id} · ${violation.type}`, 'green')
    showToast(`${violation.id} resolved`)
  }

  const completeCorrectiveAction = (id: string) => {
    const action = correctiveActions.find((row) => row.id === id)
    if (!action || action.status === 'Completed') return
    if (!authorize('action.complete', action.id, { daysOverdue: action.daysOverdue })) return
    setCorrectiveActions((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: 'Completed', daysOverdue: 0 } : row)),
    )
    logActivity('Closed corrective action', `${action.id} · ${action.vehicle}`, 'green')
    showToast(`${action.id} marked complete`)
  }

  const clearCredentialHold = (id: string) => {
    const credential = credentials.find((row) => row.id === id)
    if (!credential || credential.status === 'Valid' || credential.status === 'Expiring') return
    if (!authorize('driver.credential-clear', credential.driver)) return
    setCredentials((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: 'Valid', issue: 'Credential hold cleared' } : row)),
    )
    logActivity('Cleared credential hold', `${credential.driver} · ${credential.kind}`, 'green')
    showToast(`${credential.driver} credential cleared`)
  }

  const startAudit = (id: string) => {
    const audit = audits.find((row) => row.id === id)
    if (!audit || audit.status === 'Completed') return
    if (!authorize('audit.start', audit.id)) return
    setAudits((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'Scheduled' } : row)))
    logActivity('Started audit', `${audit.id} · ${audit.title}`, 'blue')
    showToast(`${audit.id} started`)
  }

  const clearVehicleHold = (id: string) => {
    const vehicle = vehicles.find((row) => row.id === id)
    if (!vehicle || vehicle.status !== 'Non-compliant') return
    if (!authorize('vehicle.hold-clear', vehicle.plate, { openViolations: vehicle.openIssues })) return
    setVehicles((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: 'Compliant', score: Math.max(row.score, 70), openIssues: 0, blocking: '—' }
          : row,
      ),
    )
    logActivity('Cleared vehicle hold', `${vehicle.plate} · ${vehicle.model}`, 'green')
    showToast(`${vehicle.plate} cleared for dispatch`)
  }

  // Every KPI card opens the page that owns the metric it shows.
  const openKpi = (key: ComplianceKpiKey) => {
    switch (key) {
      case 'compliant':
        setVehicleFilter('Compliant')
        navigateSection('vehicles')
        break
      case 'expiring':
        setExpiryFilter('Next 30 days')
        navigateSection('expiries')
        break
      case 'non-compliant':
        setVehicleFilter('Non-compliant')
        navigateSection('vehicles')
        break
      case 'credentials':
        setDriverFilter('Issue')
        navigateSection('drivers')
        break
      case 'violations':
        setViolationFilter('Open')
        navigateSection('violations')
        break
      case 'actions':
        setActionFilter('Overdue')
        navigateSection('actions')
        break
      case 'audits':
        setAuditFilter('Scheduled')
        navigateSection('audits')
        break
      case 'score':
        navigateSection('reports')
        break
    }
  }

  // Urgent alerts deep-link into the page that owns the alert category.
  const openAlert = (alert: UrgentAlert) => {
    const section = alertTargetSection(alert.category)
    if (section === 'vehicles') setVehicleFilter('Non-compliant')
    if (section === 'drivers') setDriverFilter('Issue')
    if (section === 'violations') setViolationFilter('Open')
    if (section === 'actions') setActionFilter('Overdue')
    if (section === 'audits') setAuditFilter('Scheduled')
    if (section === 'expiries') setExpiryFilter('All')
    navigateSection(section)
  }

  const raiseCorrectiveAction = (violationId: string) => {
    const violation = violations.find((row) => row.id === violationId)
    if (!violation) return
    if (!authorize('action.raise', violation.id)) return
    const alreadyRaised = correctiveActions.some((action) => action.violation === violationId)
    if (alreadyRaised) {
      showToast(`${violationId} already has a corrective action`)
      return
    }
    const entry: CorrectiveAction = {
      id: `CA-${2201 + correctiveActions.length}`,
      violation: violation.id,
      vehicle: violation.vehicle,
      action: `Submit compliance evidence for ${violation.type.toLowerCase()}`,
      owner: violation.city === 'Hyderabad' ? 'Deccan Heavy Machinery' : 'Partner fleet owner',
      dueOn: violation.respondBy,
      daysOverdue: 0,
      status: 'In progress',
      evidence: 'Requested from owner',
    }
    setCorrectiveActions((prev) => [entry, ...prev])
    logActivity('Raised corrective action', `${entry.id} · ${violation.id}`, 'blue')
    showToast(`${entry.id} raised for ${violation.id}`)
  }

  const exportFleetReport = () => {
    if (!authorize('fleet.export', 'Fleet compliance register')) return
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
    const rows: string[][] = [
      ['Section', 'Id', 'Detail', 'Status'],
      ...vehicles.map((vehicle) => [
        'Vehicles',
        vehicle.plate,
        `${vehicle.model} · ${vehicle.city} · ${vehicle.blocking}`,
        vehicle.status,
      ]),
      ...credentials.map((row) => ['Driver credentials', row.id, `${row.driver} · ${row.kind}`, row.status]),
      ...violations.map((row) => ['Violations', row.id, `${row.vehicle} · ${row.type}`, row.status]),
      ...correctiveActions.map((row) => ['Corrective actions', row.id, `${row.vehicle} · ${row.action}`, row.status]),
      ...audits.map((row) => ['Audits', row.id, `${row.title} · ${row.scope}`, row.status]),
    ]
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'fleet-compliance-report-october-2026.csv'
    link.click()
    URL.revokeObjectURL(url)
    logAction('Exported fleet compliance report', `${rows.length - 1} records`)
    showToast('Fleet compliance report exported')
  }

  const filteredDocs = documents.filter(
    (doc) =>
      (docStatus === 'All' || doc.status === docStatus) &&
      (docType === 'All' || doc.subjectType === docType) &&
      (docQuery.trim() === '' ||
        doc.id.toLowerCase().includes(docQuery.trim().toLowerCase()) ||
        doc.holder.toLowerCase().includes(docQuery.trim().toLowerCase()) ||
        doc.kind.toLowerCase().includes(docQuery.trim().toLowerCase())),
  )

  const filteredPermits = permits.filter(
    (permit) =>
      (permitStatus === 'All' || permit.status === permitStatus) &&
      (permitQuery.trim() === '' ||
        permit.id.toLowerCase().includes(permitQuery.trim().toLowerCase()) ||
        permit.vehicle.toLowerCase().includes(permitQuery.trim().toLowerCase()) ||
        permit.driver.toLowerCase().includes(permitQuery.trim().toLowerCase())),
  )

  const filteredInspections = inspections.filter(
    (row) =>
      (inspStatus === 'All' || row.status === inspStatus) &&
      (inspQuery.trim() === '' ||
        row.id.toLowerCase().includes(inspQuery.trim().toLowerCase()) ||
        row.vehicle.toLowerCase().includes(inspQuery.trim().toLowerCase()) ||
        row.model.toLowerCase().includes(inspQuery.trim().toLowerCase())),
  )

  const filteredExpiries = expiries.filter((row) => {
    if (expiryFilter === 'Due soon') return row.daysLeft >= 0 && row.daysLeft <= 7
    if (expiryFilter === 'Next 30 days') return row.daysLeft >= 0 && row.daysLeft <= 30
    if (expiryFilter === 'Lapsed') return row.daysLeft < 0
    if (expiryFilter === 'Reminded') return row.reminded
    return true
  })

  const filteredEscalations = escalations.filter((row) => escFilter === 'All' || row.direction === escFilter)

  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicleFilter === 'All' || vehicle.status === vehicleFilter,
  )

  const filteredCredentials = credentials.filter((row) => {
    if (driverFilter === 'All') return true
    if (driverFilter === 'Issue') return row.status !== 'Valid'
    return row.status === driverFilter
  })

  const filteredViolations = violations.filter(
    (row) => violationFilter === 'All' || row.status === violationFilter,
  )

  const filteredCorrectiveActions = correctiveActions.filter(
    (row) => actionFilter === 'All' || row.status === actionFilter,
  )

  const filteredAudits = audits.filter((row) => auditFilter === 'All' || row.status === auditFilter)

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>
      <style>{cfStyles}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">Compliance Admin · {complianceProfile.name}</div>
          </div>
        </div>

        <div className="sa-nav-wrap">
          <div className="sa-sidebar-label">Compliance operations</div>
          <ul className="sa-nav">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`sa-nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => navigateSection(section.id)}
                >
                  <span>{section.label}</span>
                  {section.id === 'overview' && criticalAlertCount > 0 && (
                    <span className="sa-nav-badge">{criticalAlertCount}</span>
                  )}
                  {section.id === 'notifications' && unreadNotifications > 0 && (
                    <span className="sa-nav-badge">{unreadNotifications}</span>
                  )}
                  {section.id === 'vehicles' && metrics.nonCompliantVehicles > 0 && (
                    <span className="sa-nav-badge">{metrics.nonCompliantVehicles}</span>
                  )}
                  {section.id === 'drivers' && metrics.driverCredentialIssues > 0 && (
                    <span className="sa-nav-badge">{metrics.driverCredentialIssues}</span>
                  )}
                  {section.id === 'violations' && metrics.openViolations > 0 && (
                    <span className="sa-nav-badge">{metrics.openViolations}</span>
                  )}
                  {section.id === 'actions' && metrics.overdueCorrectiveActions > 0 && (
                    <span className="sa-nav-badge">{metrics.overdueCorrectiveActions}</span>
                  )}
                  {section.id === 'documents' && pendingDocs > 0 && (
                    <span className="sa-nav-badge">{pendingDocs}</span>
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
          <strong>{complianceProfile.name} scope</strong>
          <span>
            {pendingDocs} documents awaiting review · {openEscalations} open escalations · state-wide audit.
          </span>
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{complianceProfile.adminInitials}</div>
          <div className="sa-account-copy">
            <strong>{complianceProfile.adminName}</strong>
            <span>{complianceProfile.adminEmail}</span>
          </div>
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Logout
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="dashboard-header">
          <div className="header-copy">
            <p className="header-kicker">{complianceProfile.name} · Compliance command</p>
            <h1 className="header-title">{sectionMeta.title}</h1>
            <div className="header-breadcrumb">
              Overview / {complianceProfile.name} / {sectionMeta.crumb}
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
                  aria-label="Search the compliance dashboard"
                  placeholder="Search vehicles, drivers, violations, documents..."
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
                        No matches for “{headerQuery.trim()}”. Try a document, permit or inspection id.
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
                      {notifications.length === 0 ? (
                        <div className="header-feed-empty">
                          Nothing needs attention. Expiring records, failed inspections, violations, audits and
                          overdue actions will appear here.
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="header-feed-item"
                            onClick={() => openNotification(item)}
                          >
                            <span className={`header-feed-dot ${item.tone}`} />
                            <span className="header-feed-body">
                              <strong>
                                {item.title}
                                {!item.read && <span className="header-feed-unread" />}
                              </strong>
                              <span>{item.category} · {item.detail}</span>
                              <span className="header-feed-time">
                                {item.priority} · {item.time}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="header-popover-foot">
                      <button
                        type="button"
                        className="header-action"
                        onClick={() => openFeedTarget('notifications')}
                      >
                        Open notifications page
                      </button>
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
                  Alerts {openAlertCount > 0 && <span className="header-badge header-badge-amber">{openAlertCount}</span>}
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">
                        {openAlertCount} open · {criticalAlertCount} critical
                      </span>
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
                      <button type="button" className="header-action" onClick={() => openFeedTarget('overview')}>
                        Open compliance dashboard
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
                <button
                  type="button"
                  className="header-avatar"
                  aria-label="Back to the compliance overview"
                  onClick={() => navigateSection('overview')}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {complianceProfile.adminInitials}
                </button>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  Compliance Admin
                </span>
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
            <OverviewSection
              documents={documents}
              permits={permits}
              inspections={inspections}
              vehicles={vehicles}
              audits={audits}
              activity={activity}
              metrics={metrics}
              alerts={alerts}
              acknowledgedAlerts={acknowledgedAlerts}
              onNavigate={navigateSection}
              onOpenDocuments={openDocuments}
              onOpenKpi={openKpi}
              onOpenAlert={openAlert}
              onAcknowledgeAlert={acknowledgeAlert}
              check={checkPermission}
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationsSection
              notifications={notifications}
              preferences={notificationPreferences}
              onPreferencesChange={setNotificationPreferences}
              onOpen={openNotification}
              onToggleRead={setNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
            />
          )}

          {activeSection === 'vehicles' && (
            <VehiclesSection
              rows={filteredVehicles}
              all={vehicles}
              filter={vehicleFilter}
              onFilterChange={setVehicleFilter}
              onClearHold={clearVehicleHold}
              onOpenSuspensions={() => navigateSection('suspensions')}
              check={checkPermission}
            />
          )}

          {activeSection === 'drivers' && (
            <DriversSection
              rows={filteredCredentials}
              all={credentials}
              filter={driverFilter}
              onFilterChange={setDriverFilter}
              onClearHold={clearCredentialHold}
              focusId={recordFocus?.section === 'drivers' ? recordFocus.recordId : undefined}
              check={checkPermission}
            />
          )}

          {activeSection === 'violations' && (
            <ViolationsSection
              rows={filteredViolations}
              all={violations}
              filter={violationFilter}
              onFilterChange={setViolationFilter}
              onResolve={resolveViolation}
              onRaiseAction={raiseCorrectiveAction}
              focusId={recordFocus?.section === 'violations' ? recordFocus.recordId : undefined}
              check={checkPermission}
            />
          )}

          {activeSection === 'actions' && (
            <ActionsSection
              rows={filteredCorrectiveActions}
              all={correctiveActions}
              filter={actionFilter}
              onFilterChange={setActionFilter}
              onComplete={completeCorrectiveAction}
              focusId={recordFocus?.section === 'actions' ? recordFocus.recordId : undefined}
              check={checkPermission}
            />
          )}

          {activeSection === 'audits' && (
            <AuditsSection
              rows={filteredAudits}
              all={audits}
              filter={auditFilter}
              onFilterChange={setAuditFilter}
              onStart={startAudit}
              focusId={recordFocus?.section === 'audits' ? recordFocus.recordId : undefined}
              check={checkPermission}
            />
          )}

          {activeSection === 'documents' && (
            <DocumentsSection
              query={docQuery}
              onQueryChange={setDocQuery}
              status={docStatus}
              onStatusChange={setDocStatus}
              subjectType={docType}
              onSubjectTypeChange={setDocType}
              rows={filteredDocs}
              expandedId={expandedDocId}
              onToggle={toggleDoc}
              reason={docReason}
              onReasonChange={setDocReason}
              onVerify={verifyDoc}
              onReject={rejectDoc}
              onReset={resetDocFilters}
              check={checkPermission}
            />
          )}

          {activeSection === 'permits' && (
            <PermitsSection
              query={permitQuery}
              onQueryChange={setPermitQuery}
              status={permitStatus}
              onStatusChange={setPermitStatus}
              rows={filteredPermits}
              expandedId={expandedPermitId}
              onToggle={togglePermit}
              onVerify={verifyPermit}
              onReset={resetPermitFilters}
              check={checkPermission}
            />
          )}

          {activeSection === 'inspections' && (
            <InspectionsSection
              query={inspQuery}
              onQueryChange={setInspQuery}
              status={inspStatus}
              onStatusChange={setInspStatus}
              rows={filteredInspections}
              expandedId={expandedInspId}
              note={inspNote}
              onNoteChange={setInspNote}
              onToggle={toggleInspection}
              onRecord={recordInspection}
              onReset={resetInspFilters}
              focusId={recordFocus?.section === 'inspections' ? recordFocus.recordId : undefined}
              check={checkPermission}
            />
          )}

          {activeSection === 'suspensions' && (
            <SuspensionsSection
              rows={suspensions}
              subjectType={suspSubjectType}
              onSubjectTypeChange={changeSuspSubjectType}
              subject={suspSubject}
              onSubjectChange={setSuspSubject}
              reason={suspReason}
              onReasonChange={setSuspReason}
              evidence={suspEvidence}
              onEvidenceChange={setSuspEvidence}
              onSuspend={createSuspension}
              onReinstate={reinstateSuspension}
              check={checkPermission}
            />
          )}

          {activeSection === 'expiries' && (
            <ExpirySection
              rows={filteredExpiries}
              filter={expiryFilter}
              onFilterChange={setExpiryFilter}
              onRemind={remindExpiry}
              onRemindAll={remindAllPending}
              focusId={recordFocus?.section === 'expiries' ? recordFocus.recordId : undefined}
              check={checkPermission}
            />
          )}

          {activeSection === 'escalations' && (
            <EscalationsSection
              rows={filteredEscalations}
              filter={escFilter}
              onFilterChange={setEscFilter}
              subject={escSubject}
              onSubjectChange={setEscSubject}
              target={escTarget}
              onTargetChange={setEscTarget}
              risk={escRisk}
              onRiskChange={(value) => setEscRisk(value as (typeof escalationRisks)[number])}
              reason={escReason}
              onReasonChange={setEscReason}
              onEscalate={createEscalation}
              onAcknowledge={acknowledgeEscalation}
              onResolve={resolveEscalation}
              check={checkPermission}
            />
          )}

          {activeSection === 'reports' && (
            <ReportsSection
              suspensions={suspensions}
              expiryRows={expiries}
              auditLog={auditLog}
              metrics={metrics}
              vehicles={vehicles}
              violations={violations}
              correctiveActions={correctiveActions}
              audits={audits}
              onExport={exportReport}
              onExportFleet={exportFleetReport}
              check={checkPermission}
            />
          )}

          {activeSection === 'rules' && <RulesPermissionsSection />}
        </div>
      </div>
    </section>
  )
}
