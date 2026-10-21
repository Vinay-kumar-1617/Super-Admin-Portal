import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import { availableOperators, type AuditEntry, type DispatchJob } from './operationsData'
import FilterBar, { filterBarStyles } from './FilterBar'
import { emptyDateRange, type DateRange } from './dateRange'

export type DispatchAction = {
  jobId: string
  action: 'assign' | 'reassign' | 'prioritize'
  operatorId?: string
  reason: string
}

type DispatchSectionProps = {
  jobs: DispatchJob[]
  audit: AuditEntry[]
  onDispatchAction: (input: DispatchAction) => void
}

type JobAction = 'assign' | 'reassign' | 'prioritize'

const JOB_STATUSES = ['Unassigned', 'Assigned', 'In Progress', 'At Risk', 'Stuck'] as const

export default function DispatchSection({ jobs, audit, onDispatchAction }: DispatchSectionProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [action, setAction] = useState<JobAction>('assign')
  const [operatorId, setOperatorId] = useState('')
  const [reason, setReason] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>(emptyDateRange)

  const unassigned = jobs.filter((job) => job.status === 'Unassigned')

  const zones = useMemo(() => Array.from(new Set(jobs.map((job) => job.zone))).sort(), [jobs])

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase()
    return jobs.filter((job) => {
      if (statusFilter !== 'all' && job.status !== statusFilter) return false
      if (priorityFilter !== 'all' && job.priority !== priorityFilter) return false
      if (zoneFilter !== 'all' && job.zone !== zoneFilter) return false
      if (dateRange.from && job.requestedOn < dateRange.from) return false
      if (dateRange.to && job.requestedOn > dateRange.to) return false
      if (!term) return true
      return [job.id, job.bookingId, job.customer, job.machine, job.operator ?? '', job.zone, job.city]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [jobs, search, statusFilter, priorityFilter, zoneFilter, dateRange])

  const openJob = jobs.find((job) => job.id === selectedJob) ?? null
  const needsOperator = action !== 'prioritize'
  const canSubmit =
    openJob !== null && reason.trim().length >= 4 && (!needsOperator || operatorId !== '')

  const reset = () => {
    setSelectedJob(null)
    setAction('assign')
    setOperatorId('')
    setReason('')
  }

  const submit = () => {
    if (!openJob || !canSubmit) return
    onDispatchAction({ jobId: openJob.id, action, operatorId: needsOperator ? operatorId : undefined, reason: reason.trim() })
    reset()
  }

  return (
    <>
      <section className="sa-panel">
        <style>{filterBarStyles}</style>
        <div className="sa-panel-header">
          <h3>Dispatch queue</h3>
          <span className="sa-panel-sub">
            {unassigned.length} unassigned · override assignment requires a reason and is audited
          </span>
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchLabel="Search dispatch jobs"
          searchPlaceholder="Search job, booking, customer, machine or operator..."
          selects={[
            {
              id: 'status',
              label: 'Filter by job status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'All statuses' },
                ...JOB_STATUSES.map((status) => ({ value: status, label: status })),
              ],
            },
            {
              id: 'priority',
              label: 'Filter by priority',
              value: priorityFilter,
              onChange: setPriorityFilter,
              options: [
                { value: 'all', label: 'All priorities' },
                { value: 'Urgent', label: 'Urgent' },
                { value: 'Normal', label: 'Normal' },
              ],
            },
            {
              id: 'zone',
              label: 'Filter by zone',
              value: zoneFilter,
              onChange: setZoneFilter,
              options: [
                { value: 'all', label: 'All zones' },
                ...zones.map((zone) => ({ value: zone, label: zone })),
              ],
            },
          ]}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateLabel="Filter jobs by requested date"
          resultLabel={`${visibleJobs.length} of ${jobs.length} jobs`}
        />
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Route</th>
                <th>Machine</th>
                <th>Requested</th>
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
                  <td>
                    {job.zone}
                    <span className="sa-cell-sub">{job.city}</span>
                  </td>
                  <td>{job.machine}</td>
                  <td className="sa-num">
                    {job.requested}
                    <span className="sa-cell-sub">
                      {job.requestedOn} · SLA {job.sla}m
                    </span>
                  </td>
                  <td>{job.operator ?? '—'}</td>
                  <td>{job.priority === 'Urgent' ? <StatusPill status="Urgent" /> : <StatusPill status="Normal" />}</td>
                  <td>
                    <StatusPill status={job.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="sa-btn-ghost"
                      onClick={() => {
                        setSelectedJob(job.id)
                        setAction(job.status === 'Unassigned' ? 'assign' : job.status === 'In Progress' ? 'reassign' : 'prioritize')
                        setOperatorId('')
                        setReason('')
                      }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {visibleJobs.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="sa-empty">
                      <p>No dispatch jobs match the current filters.</p>
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
            <h3>Override · {openJob.id}</h3>
            <span className="sa-panel-sub">{openJob.customer} · {openJob.zone}, {openJob.city}</span>
          </div>
          <div className="sa-toolbar ops-action-form">
            <label className="ops-field">
              Action
              <select className="sa-select" value={action} onChange={(event) => setAction(event.target.value as JobAction)}>
                <option value="assign">Assign manually</option>
                <option value="reassign">Reassign operator</option>
                <option value="prioritize">Prioritize job</option>
              </select>
            </label>
            {needsOperator && (
              <label className="ops-field">
                Operator
                <select className="sa-select" value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
                  <option value="">Select operator…</option>
                  {availableOperators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name} · {operator.zone} ({operator.city})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="ops-field ops-field-grow">
              Reason (required, audited)
              <input
                className="sa-input"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Why is this override necessary?"
              />
            </label>
            <div className="ops-field-actions">
              <button type="button" className="sa-btn approve" disabled={!canSubmit} onClick={submit}>
                Apply override
              </button>
              <button type="button" className="sa-btn-ghost" onClick={reset}>
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Audit trail</h3>
          <span className="sa-panel-sub">Every override, reassignment and cancellation with its reason</span>
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
