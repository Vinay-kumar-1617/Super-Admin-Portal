import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import {
  auditTrail,
  buildComplianceAlerts,
  complianceNotifications,
  complianceProfile,
  dashboardPeriods,
  documents as seedDocuments,
  escalationRows as seedEscalations,
  escalationRisks,
  evidenceOptions,
  expiryRows as seedExpiries,
  inspectionRows as seedInspections,
  permitRows as seedPermits,
  permissions,
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
import DocumentsSection from './DocumentsSection'
import PermitsSection from './PermitsSection'
import InspectionsSection from './InspectionsSection'
import SuspensionsSection from './SuspensionsSection'
import ExpirySection from './ExpirySection'
import EscalationsSection from './EscalationsSection'
import ReportsSection from './ReportsSection'

// Compliance-specific extras layered on top of the shared command-center styles.
const cfStyles = `
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
.cf-scope-perm {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 10px;
  font-size: 11.5px;
  opacity: 0.85;
}
.cf-scope-perm strong {
  margin-top: 8px;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.7;
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
  { id: 'documents', label: 'Documents', title: 'Document verification', crumb: 'Documents' },
  { id: 'permits', label: 'Permits', title: 'Permits & validity', crumb: 'Permits' },
  { id: 'inspections', label: 'Inspections', title: 'Inspections & schedules', crumb: 'Inspections' },
  { id: 'suspensions', label: 'Suspensions', title: 'Compliance suspensions', crumb: 'Suspensions' },
  { id: 'expiries', label: 'Expiry tracking', title: 'Expiry tracking & reminders', crumb: 'Expiry' },
  { id: 'escalations', label: 'Escalations', title: 'Escalation desk', crumb: 'Escalations' },
  { id: 'reports', label: 'Reports', title: 'Reports & audit', crumb: 'Reports' },
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
  const [notifications, setNotifications] = useState(complianceNotifications)
  const [toast, setToast] = useState<string | null>(null)

  const [documents, setDocuments] = useState<ComplianceDocument[]>(seedDocuments)
  const [permits, setPermits] = useState<PermitRow[]>(seedPermits)
  const [inspections, setInspections] = useState<InspectionRow[]>(seedInspections)
  const [suspensions, setSuspensions] = useState<SuspensionRow[]>(seedSuspensions)
  const [expiries, setExpiries] = useState<ExpiryRow[]>(seedExpiries)
  const [escalations, setEscalations] = useState<EscalationRow[]>(seedEscalations)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(auditTrail)

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

  const [expiryFilter, setExpiryFilter] = useState<'All' | 'Due soon' | 'Lapsed' | 'Reminded'>('All')

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

  const navigateSection = (id: SectionId) => {
    window.history.pushState(null, '', `#compliance-admin/${id}`)
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
    setAuditLog((prev) => [
      { id: `AL-${20 + prev.length}`, time: 'Just now', actor: complianceProfile.adminName, action, detail },
      ...prev,
    ])
  }

  const pendingDocs = documents.filter((doc) => doc.status === 'Pending' || doc.status === 'Renewed').length
  const openEscalations = escalations.filter((row) => row.status === 'Open').length
  const unreadNotifications = notifications.filter((item) => !item.read).length
  const alerts = buildComplianceAlerts(documents, inspections, expiries)
  const sectionMeta = sections.find((section) => section.id === activeSection) ?? sections[0]

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

    return results
  }, [headerQuery, documents, permits, inspections])

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
    }

    navigateSection(result.section)
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
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: 'Verified', rejectReason: undefined } : doc)),
    )
    setExpandedDocId(null)
    setDocReason('')
    logAction('Verified document', id)
    showToast(`${id} verified`)
  }

  const rejectDoc = (id: string) => {
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
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    setSuspensions((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: 'Reinstated', reinstatedOn: today } : row)),
    )
    logAction('Reinstated', id)
    showToast(`${id} reinstated`)
  }

  const remindExpiry = (id: string) => {
    setExpiries((prev) => prev.map((row) => (row.id === id ? { ...row, reminded: true } : row)))
    logAction('Sent expiry reminder', id)
    showToast(`Reminder sent for ${id}`)
  }

  const remindAllPending = () => {
    const pending = expiries.filter((row) => row.daysLeft <= 7 && !row.reminded)
    setExpiries((prev) => prev.map((row) => (row.daysLeft <= 7 ? { ...row, reminded: true } : row)))
    logAction('Sent expiry reminders', `${pending.length} records`)
    showToast(`${pending.length} reminders sent`)
  }

  const createEscalation = () => {
    const subject = escSubject.trim()
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
    setEscalations((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'Acknowledged' } : row)))
    logAction('Acknowledged escalation', id)
    showToast(`${id} acknowledged`)
  }

  const resolveEscalation = (id: string) => {
    setEscalations((prev) => prev.map((row) => (row.id === id ? { ...row, status: 'Resolved' } : row)))
    logAction('Resolved escalation', id)
    showToast(`${id} resolved`)
  }

  const exportReport = () => {
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
    if (expiryFilter === 'Lapsed') return row.daysLeft < 0
    if (expiryFilter === 'Reminded') return row.reminded
    return true
  })

  const filteredEscalations = escalations.filter((row) => escFilter === 'All' || row.direction === escFilter)

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

        <div>
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
                  placeholder="Search documents, permits, inspections..."
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
                      <button type="button" className="header-action" onClick={() => openFeedTarget('expiries')}>
                        Open expiry tracking
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
                <div className="header-avatar">{complianceProfile.adminInitials}</div>
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
              expiryRows={expiries}
              onNavigate={navigateSection}
              onOpenDocuments={openDocuments}
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
            />
          )}

          {activeSection === 'expiries' && (
            <ExpirySection
              rows={filteredExpiries}
              filter={expiryFilter}
              onFilterChange={setExpiryFilter}
              onRemind={remindExpiry}
              onRemindAll={remindAllPending}
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
            />
          )}

          {activeSection === 'reports' && (
            <ReportsSection
              suspensions={suspensions}
              expiryRows={expiries}
              auditLog={auditLog}
              onExport={exportReport}
            />
          )}
        </div>
      </div>
    </section>
  )
}
