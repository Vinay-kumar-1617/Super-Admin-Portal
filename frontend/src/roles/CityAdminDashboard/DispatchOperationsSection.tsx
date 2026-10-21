import { useEffect, useMemo, useState } from 'react'
import { ProgressCell, StatCards, StatusPill, type StatCard } from './shared'
import { cityProfile } from './cityAdminData'
import {
  cityDispatchers,
  cityDispatchExceptions,
  cityDispatchJobs,
  cityDispatchPermissions,
  dispatchTabs,
  hasDispatchPermission,
  type DispatchException,
  type DispatchExceptionStatus,
  type DispatchJob,
  type DispatchJobStatus,
  type DispatchTab,
} from './cityDispatchData'

const jobStatuses: Array<'All' | DispatchJobStatus> = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed']

const jobTones: Record<'All' | DispatchJobStatus, StatCard['tone']> = {
  All: 'brand',
  Pending: 'amber',
  Assigned: 'blue',
  'In Progress': 'purple',
  Completed: 'green',
}

const slaTone: Record<DispatchJob['sla'], string> = {
  'On track': 'green',
  'Due soon': 'amber',
  Overdue: 'red',
}

const severityTone: Record<DispatchException['severity'], string> = {
  Critical: 'red',
  Warning: 'amber',
  Info: 'blue',
}

const exceptionStatusTone: Record<DispatchExceptionStatus, string> = {
  Open: 'red',
  Acknowledged: 'amber',
  Resolved: 'green',
}

type DispatchOperationsSectionProps = {
  onToast?: (message: string) => void
  zoneScope?: string
}

export default function DispatchOperationsSection({ onToast, zoneScope }: DispatchOperationsSectionProps) {
  const scopedJobs = zoneScope ? cityDispatchJobs.filter((job) => job.zone === zoneScope) : cityDispatchJobs
  const scopedJobIds = new Set(scopedJobs.map((job) => job.id))
  const scopedDispatchers = zoneScope ? cityDispatchers.filter((dispatcher) => dispatcher.zone === zoneScope) : cityDispatchers
  const zoneExceptions = zoneScope ? cityDispatchExceptions.filter((exception) => scopedJobIds.has(exception.jobId)) : cityDispatchExceptions

  const [tab, setTab] = useState<DispatchTab>('jobs')
  const [jobs, setJobs] = useState<DispatchJob[]>(scopedJobs)
  const [exceptions, setExceptions] = useState<DispatchException[]>(zoneExceptions)
  const [jobFilter, setJobFilter] = useState<'All' | DispatchJobStatus>('All')
  const [jobQuery, setJobQuery] = useState('')
  const [jobZone, setJobZone] = useState(zoneScope ?? 'All')
  const [slaFilter, setSlaFilter] = useState<'All' | DispatchJob['sla']>('All')
  const [exceptionFilter, setExceptionFilter] = useState<'All' | DispatchExceptionStatus>('All')
  const [historyJob, setHistoryJob] = useState('All')
  const [assignTarget, setAssignTarget] = useState<DispatchJob | null>(null)
  const [assignDispatcher, setAssignDispatcher] = useState('')

  const canAssign = hasDispatchPermission('dispatch.assign')
  const canHandleExceptions = hasDispatchPermission('dispatch.exceptions')

  useEffect(() => {
    if (!assignTarget) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAssignTarget(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [assignTarget])

  const dispatchers = scopedDispatchers

  const totals = useMemo(() => {
    return {
      delayed: jobs.filter((job) => job.sla === 'Overdue').length,
      dueSoon: jobs.filter((job) => job.sla === 'Due soon').length,
    }
  }, [jobs])

  const jobZones = zoneScope
    ? [zoneScope]
    : ['All', ...Array.from(new Set(jobs.map((job) => job.zone)))]

  const jobCards: StatCard[] = jobStatuses.map((status) => ({
    key: status,
    label: status === 'All' ? 'All jobs' : status,
    value: status === 'All' ? String(jobs.length) : String(jobs.filter((job) => job.status === status).length),
    tone: jobTones[status],
    sub: status === 'All' ? zoneScope ?? cityProfile.name : `of ${jobs.length} total`,
  }))

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = jobFilter === 'All' || job.status === jobFilter
    const matchesZone = jobZone === 'All' || job.zone === jobZone
    const query = jobQuery.trim().toLowerCase()
    const matchesQuery =
      query === '' ||
      [job.id, job.type, job.customer, job.zone, job.machine, job.machineId, job.dispatcher ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    return matchesStatus && matchesZone && matchesQuery
  })

  const filteredSchedule = jobs
    .filter((job) => slaFilter === 'All' || job.sla === slaFilter)
    .slice()
    .sort((a, b) => {
      const order: Record<DispatchJob['sla'], number> = { Overdue: 0, 'Due soon': 1, 'On track': 2 }
      return order[a.sla] - order[b.sla]
    })

  const filteredExceptions = exceptions.filter(
    (exception) => exceptionFilter === 'All' || exception.status === exceptionFilter,
  )

  const historyEntries = useMemo(
    () =>
      jobs.flatMap((job) =>
        job.history.map((entry) => ({ ...entry, jobId: job.id, jobType: job.type, zone: job.zone })),
      ),
    [jobs],
  )

  const filteredHistory = historyEntries.filter((entry) => historyJob === 'All' || entry.jobId === historyJob)

  const openAssign = (job: DispatchJob) => {
    if (!canAssign) {
      onToast?.('Assigning jobs requires the “Assign & reassign jobs” permission.')
      return
    }
    setAssignDispatcher(job.dispatcherId ?? '')
    setAssignTarget(job)
  }

  const closeAssign = () => {
    setAssignTarget(null)
    setAssignDispatcher('')
  }

  const confirmAssign = () => {
    if (!assignTarget || assignDispatcher === '') return
    const dispatcher = dispatchers.find((item) => item.id === assignDispatcher)
    if (!dispatcher) return
    const action = assignTarget.dispatcherId ? 'Reassigned' : 'Assigned'
    setJobs((prev) =>
      prev.map((job) =>
        job.id === assignTarget.id
          ? {
              ...job,
              dispatcherId: dispatcher.id,
              dispatcher: dispatcher.name,
              status: job.status === 'Pending' ? 'Assigned' : job.status,
              history: [
                ...job.history,
                {
                  id: `${job.id}-h${job.history.length + 1}`,
                  action,
                  actor: cityProfile.adminName,
                  role: 'City Admin',
                  time: 'just now',
                  note: `${action} to ${dispatcher.name} (${dispatcher.zone} · ${dispatcher.activeJobs}/${dispatcher.capacity} active).`,
                },
              ],
            }
          : job,
      ),
    )
    onToast?.(`${assignTarget.id} ${action.toLowerCase()} to ${dispatcher.name}`)
    closeAssign()
  }

  const updateException = (id: string, status: DispatchExceptionStatus) => {
    if (!canHandleExceptions) {
      onToast?.('Handling exceptions requires the “Handle exceptions” permission.')
      return
    }
    setExceptions((prev) => prev.map((exception) => (exception.id === id ? { ...exception, status } : exception)))
    onToast?.(`${id} ${status.toLowerCase()}`)
  }

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Dispatch &amp; operations</h3>
          <span className="sa-panel-sub">
            Jobs, deadlines, dispatcher workloads and exceptions across {zoneScope ?? cityProfile.name}
          </span>
        </div>
      </div>

      <div className="sa-chip-row finance-tabs">
        {dispatchTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sa-chip ${tab === item.id ? 'active orange' : ''}`}
            onClick={() => setTab(item.id)}
            title={item.hint}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        <>
          <StatCards
            cards={jobCards}
            activeKey={jobFilter}
            onSelect={(key) => setJobFilter(jobFilter === key ? 'All' : (key as 'All' | DispatchJobStatus))}
          />
          <div className="sa-toolbar">
            <input
              className="sa-input"
              aria-label="Search dispatch jobs"
              placeholder="Search job, customer, machine, zone or dispatcher..."
              value={jobQuery}
              onChange={(event) => setJobQuery(event.target.value)}
            />
            <select
              className="sa-select"
              aria-label="Filter jobs by zone"
              value={jobZone}
              onChange={(event) => setJobZone(event.target.value)}
            >
              {jobZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone === 'All' ? 'All zones' : zone}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => {
                setJobQuery('')
                setJobFilter('All')
                setJobZone('All')
              }}
            >
              Reset
            </button>
            <span className="sa-toolbar-meta">
              {filteredJobs.length} of {jobs.length} jobs · {jobZones.length - 1} zones
            </span>
          </div>
          {filteredJobs.length === 0 ? (
            <div className="sa-empty">
              <p>No jobs match the current filters.</p>
              <button
                type="button"
                className="sa-btn-ghost"
                onClick={() => {
                  setJobQuery('')
                  setJobFilter('All')
                  setJobZone('All')
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Zone</th>
                    <th>Machine</th>
                    <th>Dispatcher</th>
                    <th>Schedule</th>
                    <th>Deadline</th>
                    <th>SLA</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id}>
                      <td className="sa-cell-strong">
                        {job.id}
                        {job.priority === 'High' && <span className="sa-cell-sub">High priority</span>}
                      </td>
                      <td>{job.type}</td>
                      <td>{job.customer}</td>
                      <td className="sa-cell-strong">{job.zone}</td>
                      <td className="sa-cell-strong">
                        {job.machine}
                        <span className="sa-cell-sub">{job.machineId}</span>
                      </td>
                      <td className="sa-cell-strong">
                        {job.dispatcher ?? 'Unassigned'}
                        {job.dispatcherId && <span className="sa-cell-sub">{job.dispatcherId}</span>}
                      </td>
                      <td>{job.scheduled}</td>
                      <td>{job.deadline}</td>
                      <td>
                        <span className={`sa-pill ${slaTone[job.sla]}`}>{job.sla}</span>
                      </td>
                      <td>
                        <StatusPill status={job.status} />
                      </td>
                      <td>
                        {job.status === 'Completed' ? (
                          <span className="sa-approval-meta">Closed</span>
                        ) : (
                          <button type="button" className="sa-table-act" onClick={() => openAssign(job)}>
                            {job.dispatcherId ? 'Reassign' : 'Assign'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'schedule' && (
        <>
          <div className="sa-chip-row">
            {(['All', 'Overdue', 'Due soon', 'On track'] as const).map((option) => {
              const count =
                option === 'All' ? jobs.length : jobs.filter((job) => job.sla === option).length
              return (
                <button
                  key={option}
                  type="button"
                  className={`sa-chip ${slaFilter === option ? 'active orange' : ''}`}
                  onClick={() => setSlaFilter(option)}
                >
                  {option === 'All' ? 'All schedules' : option} · {count}
                </button>
              )
            })}
          </div>
          <div className="sa-toolbar">
            <span className="sa-panel-sub">
              {totals.delayed} overdue · {totals.dueSoon} due soon · deadlines sorted by urgency
            </span>
            <span className="sa-toolbar-meta">
              {filteredSchedule.length} of {jobs.length} scheduled jobs
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Type</th>
                  <th>Machine</th>
                  <th>Zone</th>
                  <th>Dispatcher</th>
                  <th>Scheduled</th>
                  <th>Deadline</th>
                  <th>SLA</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.map((job) => (
                  <tr key={job.id}>
                    <td className="sa-cell-strong">{job.id}</td>
                    <td>{job.type}</td>
                    <td>{job.machine}</td>
                    <td className="sa-cell-strong">{job.zone}</td>
                    <td>{job.dispatcher ?? 'Unassigned'}</td>
                    <td>{job.scheduled}</td>
                    <td>{job.deadline}</td>
                    <td>
                      <span className={`sa-pill ${slaTone[job.sla]}`}>{job.sla}</span>
                    </td>
                    <td>
                      <StatusPill status={job.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'dispatchers' && (
        <>
          <div className="sa-toolbar">
            <span className="sa-panel-sub">Workload against capacity for city dispatchers.</span>
            <span className="sa-toolbar-meta">
              {dispatchers.filter((d) => d.status === 'Available').length} available ·{' '}
              {dispatchers.filter((d) => d.status === 'Offline').length} offline
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Dispatcher</th>
                  <th>Base zone</th>
                  <th>Availability</th>
                  <th>Workload</th>
                  <th>Completed today</th>
                  <th>Completed week</th>
                  <th>Avg response</th>
                  <th>On-time</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {dispatchers.map((dispatcher) => (
                  <tr key={dispatcher.id}>
                    <td className="sa-cell-strong">
                      {dispatcher.name}
                      <span className="sa-cell-sub">{dispatcher.id}</span>
                    </td>
                    <td className="sa-cell-strong">{dispatcher.zone}</td>
                    <td>
                      <StatusPill status={dispatcher.status} />
                    </td>
                    <td>
                      <ProgressCell value={Math.round((dispatcher.activeJobs / dispatcher.capacity) * 100)} />
                      <span className="sa-cell-sub">
                        {dispatcher.activeJobs} of {dispatcher.capacity} active
                      </span>
                    </td>
                    <td className="sa-num">{dispatcher.completedToday}</td>
                    <td className="sa-num">{dispatcher.completedWeek}</td>
                    <td className="sa-num">{dispatcher.avgResponseMins} min</td>
                    <td className="sa-num">{dispatcher.onTimeRate}%</td>
                    <td className="sa-num">{dispatcher.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'exceptions' && (
        <>
          <div className="sa-chip-row">
            {(['All', 'Open', 'Acknowledged', 'Resolved'] as const).map((option) => {
              const count =
                option === 'All' ? exceptions.length : exceptions.filter((item) => item.status === option).length
              return (
                <button
                  key={option}
                  type="button"
                  className={`sa-chip ${exceptionFilter === option ? 'active orange' : ''}`}
                  onClick={() => setExceptionFilter(option)}
                >
                  {option === 'All' ? 'All exceptions' : option} · {count}
                </button>
              )
            })}
          </div>
          <div className="sa-toolbar">
            <span className="sa-panel-sub">Delayed, failed and escalated jobs needing attention.</span>
            <span className="sa-toolbar-meta">
              {filteredExceptions.length} of {exceptions.length} exceptions
            </span>
          </div>
          {filteredExceptions.length === 0 ? (
            <div className="sa-empty">
              <p>No exceptions with this status.</p>
              <button type="button" className="sa-btn-ghost" onClick={() => setExceptionFilter('All')}>
                Show all exceptions
              </button>
            </div>
          ) : (
            <div className="sa-approval-list">
              {filteredExceptions.map((exception) => (
                <article key={exception.id} className="sa-approval-item">
                  <div className="sa-approval-copy">
                    <div className="sa-approval-tags">
                      <span className="sa-approval-id">{exception.id}</span>
                      <span className="sa-pill blue">{exception.kind}</span>
                      <span className={`sa-pill ${severityTone[exception.severity]}`}>{exception.severity}</span>
                      <span className={`sa-pill ${exceptionStatusTone[exception.status]}`}>{exception.status}</span>
                      <span className="sa-approval-id">{exception.jobId}</span>
                    </div>
                    <strong>{exception.detail}</strong>
                    <span className="sa-approval-meta">
                      Raised by {exception.raisedBy} · {exception.time} · Owner {exception.owner}
                    </span>
                  </div>
                  <div className="sa-approval-actions">
                    {exception.status === 'Resolved' ? (
                      <span className="sa-approval-meta">Resolved</span>
                    ) : (
                      <>
                        {exception.status === 'Open' && (
                          <button type="button" className="sa-btn return" onClick={() => updateException(exception.id, 'Acknowledged')}>
                            Acknowledge
                          </button>
                        )}
                        <button type="button" className="sa-btn approve" onClick={() => updateException(exception.id, 'Resolved')}>
                          Resolve
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <>
          <div className="sa-toolbar">
            <select
              className="sa-select"
              aria-label="Filter history by job"
              value={historyJob}
              onChange={(event) => setHistoryJob(event.target.value)}
            >
              <option value="All">All jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.id} · {job.type}
                </option>
              ))}
            </select>
            <span className="sa-toolbar-meta">{filteredHistory.length} assignment changes recorded</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Time</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((entry) => (
                  <tr key={`${entry.jobId}-${entry.id}`}>
                    <td className="sa-cell-strong">
                      {entry.jobId}
                      <span className="sa-cell-sub">{entry.jobType}</span>
                    </td>
                    <td>
                      <span
                        className={`sa-pill ${
                          entry.action === 'Completed'
                            ? 'green'
                            : entry.action === 'Failed' || entry.action === 'Delayed'
                              ? 'red'
                              : entry.action === 'Escalated'
                                ? 'blue'
                                : 'slate'
                        }`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td>{entry.actor}</td>
                    <td>{entry.role}</td>
                    <td>{entry.time}</td>
                    <td>{entry.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="reports-note">
        <span className="sa-pill purple">Permission-controlled</span>
        <p>
          {cityDispatchPermissions
            .filter((permission) => permission.granted)
            .map((permission) => permission.label)
            .join(' · ')}{' '}
          — restricted: {cityDispatchPermissions.filter((permission) => !permission.granted).map((permission) => permission.label).join(' · ')}.
        </p>
      </div>

      {assignTarget && (
        <div className="sa-modal-overlay" role="presentation" onClick={closeAssign}>
          <div
            className="sa-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${assignTarget.dispatcherId ? 'Reassign' : 'Assign'} ${assignTarget.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sa-modal-header">
              <div>
                <h4>{assignTarget.dispatcherId ? 'Reassign job' : 'Assign job'}</h4>
                <span className="sa-approval-meta">
                  {assignTarget.id} · {assignTarget.type} · {assignTarget.zone}
                </span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={closeAssign}>
                ×
              </button>
            </div>
            <div className="sa-modal-body">
              <p className="sa-modal-detail">
                {assignTarget.machine} ({assignTarget.machineId}) for {assignTarget.customer}. Deadline {assignTarget.deadline}.
              </p>
              <p className="sa-modal-hint">Pick a dispatcher. Workload shows active jobs against capacity.</p>
              <label className="sa-comment-label" htmlFor="dispatch-assignee">
                Dispatcher
              </label>
              <select
                id="dispatch-assignee"
                className="sa-select"
                value={assignDispatcher}
                onChange={(event) => setAssignDispatcher(event.target.value)}
              >
                <option value="">Select a dispatcher…</option>
                {dispatchers.map((dispatcher) => (
                  <option key={dispatcher.id} value={dispatcher.id}>
                    {dispatcher.name} · {dispatcher.zone} · {dispatcher.status} · {dispatcher.activeJobs}/{dispatcher.capacity}
                  </option>
                ))}
              </select>
              <span className="sa-approval-meta">
                Assigned by {cityProfile.adminName} · the change is recorded in job history.
              </span>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={closeAssign}>
                Cancel
              </button>
              <button type="button" className="sa-btn primary" disabled={assignDispatcher === ''} onClick={confirmAssign}>
                {assignTarget.dispatcherId ? 'Reassign' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
