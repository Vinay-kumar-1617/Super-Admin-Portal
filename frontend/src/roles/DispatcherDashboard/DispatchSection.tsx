import { useMemo, useState } from 'react'
import { PriorityPill, StatusPill, SuitabilityPill } from './shared'
import { sortJobsByUrgency, suitabilityFor } from './dispatcherUtils'
import type { AuditEntry, DispatcherOperator, DispatchJob, JobStatus } from './dispatcherData'

export type AssignAction = {
  jobId: string
  operatorId: string
  reason: string
}

type DispatchSectionProps = {
  jobs: DispatchJob[]
  operators: DispatcherOperator[]
  audit: AuditEntry[]
  focusJobId?: string | null
  onAssign: (input: AssignAction) => void
}

const statusFilters: Array<'All' | JobStatus> = ['All', 'Unassigned', 'Assigned', 'In Progress', 'At Risk', 'Stuck']

const statusRank: Record<string, number> = { Available: 0, 'On the way': 1, Returning: 2, 'At site': 3, Assigned: 4, 'In Progress': 4, Offline: 6 }

export default function DispatchSection({ jobs, operators, audit, focusJobId, onAssign }: DispatchSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All')
  const [urgentOnly, setUrgentOnly] = useState(!focusJobId)
  const [selectedJob, setSelectedJob] = useState<string | null>(focusJobId ?? null)
  const [operatorId, setOperatorId] = useState('')
  const [reason, setReason] = useState('')

  const openJob = jobs.find((job) => job.id === selectedJob) ?? null
  const canManualAssign = openJob !== null && !openJob.ownerAssigned && !openJob.operatorAccepted

  const visibleJobs = useMemo(() => {
    const filtered = jobs.filter(
      (job) => (statusFilter === 'All' || job.status === statusFilter) && (!urgentOnly || job.priority === 'Urgent'),
    )
    return sortJobsByUrgency(filtered)
  }, [jobs, statusFilter, urgentOnly])

  const candidates = useMemo(() => {
    if (!openJob) return []
    const rank = { Match: 0, Partial: 1, 'Not suitable': 2 } as const
    return operators
      .filter((operator) => operator.id !== openJob.operatorId)
      .map((operator) => ({ operator, suitability: suitabilityFor(openJob, operator) }))
      .sort(
        (a, b) =>
          rank[a.suitability] - rank[b.suitability] ||
          (statusRank[a.operator.status] ?? 5) - (statusRank[b.operator.status] ?? 5) ||
          a.operator.distanceKm - b.operator.distanceKm,
      )
  }, [openJob, operators])

  const reset = () => {
    setSelectedJob(null)
    setOperatorId('')
    setReason('')
  }

  const submit = () => {
    if (!openJob || !canManualAssign || !operatorId || reason.trim().length < 4) return
    onAssign({ jobId: openJob.id, operatorId, reason: reason.trim() })
    reset()
  }

  const urgentCount = jobs.filter((job) => job.priority === 'Urgent' && job.status === 'Unassigned').length

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Dispatch board · {jobs.length} jobs in Hyderabad</h3>
          <span className="sa-panel-sub">
            dispatch.read · {urgentCount} urgent unassigned waiting · override assign is audited
          </span>
        </div>
        <div className="sa-toolbar">
          <div className="sa-chip-row">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`sa-chip ${statusFilter === filter ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`sa-chip orange ${urgentOnly ? 'active orange' : ''}`}
            onClick={() => setUrgentOnly((value) => !value)}
          >
            {urgentOnly ? 'Urgent first ✓' : 'Urgent first'}
          </button>
          <span className="sa-toolbar-meta">{visibleJobs.length} shown</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Zone</th>
                <th>Machine</th>
                <th>Owner</th>
                <th>Requested</th>
                <th>Waiting</th>
                <th>Operator</th>
                <th>Priority</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleJobs.map((job) => (
                <tr key={job.id} className={selectedJob === job.id ? 'sa-row-selected' : ''}>
                  <td className="sa-cell-strong">
                    {job.id}
                    <span className="sa-cell-sub">
                      {job.bookingId} · {job.customer}
                    </span>
                  </td>
                  <td>{job.zone}</td>
                  <td>
                    {job.machine}
                    <span className="sa-cell-sub">{job.requiredType}</span>
                  </td>
                  <td>
                    {job.owner}
                    <span className="sa-cell-sub">{job.ownerAssigned ? 'Owner assigned' : 'Owner has not assigned'}</span>
                  </td>
                  <td className="sa-num">{job.requested}</td>
                  <td className="sa-num">
                    <span style={{ color: job.waiting > job.sla ? '#b91c1c' : undefined, fontWeight: 700 }}>
                      {job.waiting} min
                    </span>
                    <span className="sa-cell-sub">SLA {job.sla}m</span>
                  </td>
                  <td>
                    {job.operator ?? '—'}
                    {job.operator && <span className="sa-cell-sub">{job.operatorAccepted ? 'Accepted' : 'Declined'}</span>}
                  </td>
                  <td>
                    <PriorityPill value={job.priority} />
                  </td>
                  <td>
                    <StatusPill status={job.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="sa-btn-ghost"
                      onClick={() => {
                        setSelectedJob(job.id === selectedJob ? null : job.id)
                        setOperatorId('')
                        setReason('')
                      }}
                    >
                      {job.id === selectedJob ? 'Close' : job.status === 'Unassigned' ? 'Assign' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
              {visibleJobs.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <div className="sa-empty">
                      <p>No jobs match this filter.</p>
                      <button type="button" className="sa-btn-ghost" onClick={() => { setStatusFilter('All'); setUrgentOnly(false) }}>
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {openJob && (
        <section className="sa-panel ops-action-panel">
          <div className="sa-panel-header">
            <h3>Assign · {openJob.id}</h3>
            <span className="sa-panel-sub">
              {openJob.customer} · {openJob.zone}, {openJob.city} · needs {openJob.requiredType}
            </span>
          </div>

          {!canManualAssign && (
            <p className="ds-note ops-readonly-banner">
              {openJob.operatorAccepted
                ? `${openJob.operator} has already accepted this job. Use Reassignment to move it.`
                : `${openJob.owner} already assigned an operator. Use Reassignment to change it.`}
            </p>
          )}

          {canManualAssign && (
            <>
              <div className="sa-toolbar">
                <label className="ops-field ops-field-grow">
                  Reason (required, audited)
                  <input
                    className="sa-input"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Why are you assigning this operator?"
                  />
                </label>
                <div className="ops-field-actions">
                  <button
                    type="button"
                    className="sa-btn approve"
                    disabled={!operatorId || reason.trim().length < 4}
                    onClick={submit}
                  >
                    Assign operator
                  </button>
                  <button type="button" className="sa-btn-ghost" onClick={reset}>
                    Cancel
                  </button>
                </div>
              </div>
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Operator</th>
                      <th>Vehicle</th>
                      <th>Suitability</th>
                      <th>Status</th>
                      <th>Distance</th>
                      <th>Rating</th>
                      <th>Today</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(({ operator, suitability }) => (
                      <tr key={operator.id} className={operatorId === operator.id ? 'sa-row-selected' : ''}>
                        <td className="sa-cell-strong">
                          {operator.name}
                          <span className="sa-cell-sub">
                            {operator.id} · {operator.zone}
                          </span>
                        </td>
                        <td>
                          {operator.vehicle}
                          <span className="sa-cell-sub">{operator.vehicleType}</span>
                        </td>
                        <td>
                          <SuitabilityPill value={suitability} />
                        </td>
                        <td>
                          <StatusPill status={operator.status} />
                        </td>
                        <td className="sa-num">{operator.distanceKm} km</td>
                        <td className="sa-num">{operator.rating}</td>
                        <td className="sa-num">{operator.jobsToday}</td>
                        <td>
                          <button
                            type="button"
                            className={operatorId === operator.id ? 'sa-btn approve' : 'sa-btn-ghost'}
                            onClick={() => setOperatorId(operator.id)}
                          >
                            {operatorId === operator.id ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Dispatch audit</h3>
          <span className="sa-panel-sub">Every assignment, reassignment and operator contact with its reason</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Entry</th>
                <th>Time</th>
                <th>Action</th>
                <th>Target</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((entry) => (
                <tr key={entry.id}>
                  <td className="sa-cell-strong">{entry.id}</td>
                  <td>{entry.time}</td>
                  <td>
                    {entry.action}
                    <span className="sa-cell-sub">{entry.actor}</span>
                  </td>
                  <td>{entry.target}</td>
                  <td>{entry.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
