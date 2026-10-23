import { Fragment, useState } from 'react'
import { GatedAction, StatusPill } from './shared'
import { useFocusRow } from './useRecordFocus'
import { SectionKpiGrid, type SectionKpiItem } from './SectionKpiGrid'
import type { ComplianceAudit } from './complianceFleetData'
import type { ComplianceCheck } from './compliancePermissions'

export type AuditFilter = 'All' | 'Scheduled' | 'In preparation' | 'Completed'

const filterOptions: AuditFilter[] = ['All', 'Scheduled', 'In preparation', 'Completed']

type AuditsSectionProps = {
  rows: ComplianceAudit[]
  all: ComplianceAudit[]
  filter: AuditFilter
  onFilterChange: (value: AuditFilter) => void
  onStart: (id: string) => void
  focusId?: string
  check: ComplianceCheck
}

export default function AuditsSection({
  rows,
  all,
  filter,
  onFilterChange,
  onStart,
  focusId,
  check,
}: AuditsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const focusedRowRef = useFocusRow(focusId)
  const total = all.length
  const scheduled = all.filter((row) => row.status === 'Scheduled').length
  const preparation = all.filter((row) => row.status === 'In preparation').length
  const completed = all.filter((row) => row.status === 'Completed').length
  const upcoming = all.filter((row) => row.status !== 'Completed')
  const coverage = upcoming.reduce((sum, row) => sum + row.vehicles, 0)
  const nextAudit = upcoming.slice().sort((a, b) => a.daysUntil - b.daysUntil)[0]

  const toggle = (id: string) => setExpandedId((current) => (current === id ? null : id))

  const kpis: SectionKpiItem[] = [
    {
      key: 'All',
      label: 'Audits on record',
      value: String(total).padStart(2, '0'),
      badge: `${coverage} machines`,
      desc: 'Statutory, internal and random sampling audits',
      openLabel: 'Show every audit →',
      active: filter === 'All',
    },
    {
      key: 'Scheduled',
      label: 'Scheduled',
      value: String(scheduled).padStart(2, '0'),
      badge: nextAudit ? `Next in ${nextAudit.daysUntil} days` : 'Nothing due',
      badgeTone: 'blue',
      desc: 'Dated and confirmed with the auditor',
      tone: 'blue',
      openLabel: 'Show scheduled audits →',
      active: filter === 'Scheduled',
    },
    {
      key: 'In preparation',
      label: 'In preparation',
      value: String(preparation).padStart(2, '0'),
      badge: 'Checklist open',
      badgeTone: 'amber',
      desc: 'Scope set, evidence still being gathered',
      tone: 'orange',
      openLabel: 'Show audits in preparation →',
      active: filter === 'In preparation',
    },
    {
      key: 'Completed',
      label: 'Completed',
      value: String(completed).padStart(2, '0'),
      badge: 'Signed off',
      badgeTone: 'green',
      desc: 'Report filed and the findings handed over',
      tone: 'green',
      openLabel: 'Show completed audits →',
      active: filter === 'Completed',
    },
  ]

  return (
    <>
      <SectionKpiGrid items={kpis} onSelect={(key) => onFilterChange(key as AuditFilter)} />

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Audit schedule</h3>
          <div className="sa-chip-row">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`sa-chip ${filter === option ? 'active orange' : ''}`}
                onClick={() => onFilterChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="sa-toolbar">
          <span className="sa-panel-sub">Open a row to review the audit checklist before the window starts.</span>
          <span className="sa-toolbar-meta">
            {rows.length} of {total} audits
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No audits match this filter.</p>
            <button type="button" className="sa-btn-ghost" onClick={() => onFilterChange('All')}>
              Show all
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Audit</th>
                  <th>Scope</th>
                  <th>City</th>
                  <th>Auditor</th>
                  <th>Scheduled</th>
                  <th>Machines</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((audit) => (
                  <Fragment key={audit.id}>
                    <tr
                      ref={audit.id === focusId ? focusedRowRef : undefined}
                      className={audit.id === focusId ? 'sa-row-selected' : undefined}
                    >
                      <td className="sa-cell-strong">
                        <button type="button" className="sa-view-link" onClick={() => toggle(audit.id)}>
                          {audit.title}
                        </button>
                        <span className="sa-cell-sub">{audit.id}</span>
                      </td>
                      <td>{audit.scope}</td>
                      <td>{audit.city}</td>
                      <td>{audit.auditor}</td>
                      <td>
                        {audit.scheduledOn}
                        <span className="sa-cell-sub">
                          {audit.status === 'Completed'
                            ? 'closed'
                            : audit.daysUntil < 0
                              ? `${Math.abs(audit.daysUntil)} days ago`
                              : `in ${audit.daysUntil} days`}
                        </span>
                      </td>
                      <td className="sa-num">{audit.vehicles}</td>
                      <td>
                        <StatusPill status={audit.status} />
                      </td>
                      <td>
                        {audit.status === 'Completed' ? (
                          <span className="sa-approval-meta">Closed</span>
                        ) : (
                          <GatedAction
                            check={check}
                            permission="audit.start"
                            className="sa-btn-ghost"
                            onClick={() => onStart(audit.id)}
                          >
                            {audit.status === 'Scheduled' ? 'Start audit' : 'Confirm date'}
                          </GatedAction>
                        )}
                      </td>
                    </tr>
                    {expandedId === audit.id && (
                      <tr className="sa-expand-row">
                        <td colSpan={8}>
                          <div className="cf-review">
                            <div className="cf-review-copy">
                              <strong>Audit checklist · {audit.title}</strong>
                              <p>
                                {audit.scope} · {audit.vehicles} machines · led by {audit.auditor}
                              </p>
                            </div>
                            <ul className="cf-history">
                              {audit.checklist.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
