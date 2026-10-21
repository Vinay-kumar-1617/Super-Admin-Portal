import { useMemo, useState } from 'react'
import { PriorityPill, StatusPill, SuitabilityPill } from './shared'
import { suitabilityFor } from './dispatcherUtils'
import type { DispatcherOperator, DispatchJob, Reassignment } from './dispatcherData'

export type ReassignAction = {
  jobId: string
  operatorId: string
  reason: string
  notifyCustomer: boolean
  notifyOwner: boolean
}

type ReassignSectionProps = {
  jobs: DispatchJob[]
  operators: DispatcherOperator[]
  reassignments: Reassignment[]
  onReassign: (input: ReassignAction) => void
}

const reasonPresets = [
  'Original operator dropped out.',
  'Operator is running late beyond the SLA.',
  'Operator cannot complete the job.',
  'Vehicle breakdown — replacement needed.',
  'Operator went offline mid-job.',
]

const reassignable = (job: DispatchJob) => job.status !== 'Unassigned'

export default function ReassignSection({ jobs, operators, reassignments, onReassign }: ReassignSectionProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [operatorId, setOperatorId] = useState('')
  const [reason, setReason] = useState('')
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [notifyOwner, setNotifyOwner] = useState(true)

  const openJob = jobs.find((job) => job.id === selectedJob) ?? null
  const activeJobs = jobs.filter(reassignable)

  const candidates = useMemo(() => {
    if (!openJob) return []
    const rank = { Match: 0, Partial: 1, 'Not suitable': 2 } as const
    return operators
      .filter((operator) => operator.id !== openJob.operatorId && operator.status !== 'Offline')
      .map((operator) => ({ operator, suitability: suitabilityFor(openJob, operator) }))
      .sort((a, b) => rank[a.suitability] - rank[b.suitability] || a.operator.distanceKm - b.operator.distanceKm)
  }, [openJob, operators])

  const reset = () => {
    setSelectedJob(null)
    setOperatorId('')
    setReason('')
    setNotifyCustomer(true)
    setNotifyOwner(true)
  }

  const submit = () => {
    if (!openJob || !operatorId || reason.trim().length < 4) return
    onReassign({ jobId: openJob.id, operatorId, reason: reason.trim(), notifyCustomer, notifyOwner })
    reset()
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Reassignment · dispatch.reassign</h3>
          <span className="sa-panel-sub">
            {activeJobs.length} active jobs · move a job when the operator drops out, is late or cannot complete
          </span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Zone</th>
                <th>Machine</th>
                <th>Current operator</th>
                <th>Priority</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {activeJobs.map((job) => (
                <tr key={job.id} className={selectedJob === job.id ? 'sa-row-selected' : ''}>
                  <td className="sa-cell-strong">
                    {job.id}
                    <span className="sa-cell-sub">
                      {job.bookingId} · {job.customer}
                    </span>
                  </td>
                  <td>{job.zone}</td>
                  <td>{job.machine}</td>
                  <td>
                    {job.operator ?? '—'}
                    <span className="sa-cell-sub">{job.operatorAccepted ? 'Accepted' : 'Not accepted'}</span>
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
                      {job.id === selectedJob ? 'Close' : 'Reassign'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {openJob && (
        <section className="sa-panel ops-action-panel">
          <div className="sa-panel-header">
            <h3>Move {openJob.id}</h3>
            <span className="sa-panel-sub">
              From {openJob.operator ?? 'unassigned'} · {openJob.zone}, {openJob.city}
            </span>
          </div>
          <div className="ds-reassign-grid">
            <div className="ds-reassign-form">
              <label className="ops-field">
                Quick reason
                <select
                  className="sa-select"
                  value=""
                  onChange={(event) => {
                    if (event.target.value) setReason(event.target.value)
                  }}
                >
                  <option value="">Choose a preset…</option>
                  {reasonPresets.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ops-field ops-field-grow">
                Reason (required, audited)
                <input
                  className="sa-input"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Why is this job moving to another operator?"
                />
              </label>
              <div className="ds-check-row">
                <label className="ds-check">
                  <input
                    type="checkbox"
                    checked={notifyCustomer}
                    onChange={(event) => setNotifyCustomer(event.target.checked)}
                  />
                  Notify customer
                </label>
                <label className="ds-check">
                  <input
                    type="checkbox"
                    checked={notifyOwner}
                    onChange={(event) => setNotifyOwner(event.target.checked)}
                  />
                  Notify owner
                </label>
                <label className="ds-check">
                  <input type="checkbox" checked readOnly />
                  Notify affected operators
                </label>
              </div>
              <div className="ops-field-actions">
                <button type="button" className="sa-btn approve" disabled={!operatorId || reason.trim().length < 4} onClick={submit}>
                  Confirm reassignment
                </button>
                <button type="button" className="sa-btn-ghost" onClick={reset}>
                  Cancel
                </button>
              </div>
            </div>

            <div className="ds-reassign-candidates">
              <span className="ds-subhead">Choose a replacement operator</span>
              <div className="sa-feed ds-scroll">
                {candidates.map(({ operator, suitability }) => (
                  <button
                    key={operator.id}
                    type="button"
                    className={`ds-candidate ${operatorId === operator.id ? 'selected' : ''}`}
                    onClick={() => setOperatorId(operator.id)}
                  >
                    <span className="ds-candidate-main">
                      <strong>{operator.name}</strong>
                      <span>{operator.vehicle} · {operator.zone}</span>
                    </span>
                    <span className="ds-candidate-meta">
                      <SuitabilityPill value={suitability} />
                      <StatusPill status={operator.status} />
                      <span className="sa-approval-meta">{operator.distanceKm} km</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Reassignment history</h3>
          <span className="sa-panel-sub">Every move with its recorded reason and who was notified</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Job</th>
                <th>From → To</th>
                <th>Reason</th>
                <th>Notified</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {reassignments.map((record) => (
                <tr key={record.id}>
                  <td className="sa-cell-strong">{record.id}</td>
                  <td>{record.jobId}</td>
                  <td>
                    {record.from} → {record.to}
                  </td>
                  <td>{record.reason}</td>
                  <td>
                    {record.notifyCustomer ? 'Customer' : ''}
                    {record.notifyCustomer && record.notifyOwner ? ', ' : ''}
                    {record.notifyOwner ? 'Owner' : ''}
                    <span className="sa-cell-sub">Operators affected</span>
                  </td>
                  <td>{record.time}</td>
                </tr>
              ))}
              {reassignments.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="sa-empty">
                      <p>No reassignments recorded this shift.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
