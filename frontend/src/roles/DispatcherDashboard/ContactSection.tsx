import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import { quickMessages, type ContactChannel, type ContactEntry, type DispatcherOperator, type DispatchJob } from './dispatcherData'

export type ContactAction = {
  jobId: string
  operatorId: string
  channel: ContactChannel
  message: string
  note: string
}

type ContactSectionProps = {
  jobs: DispatchJob[]
  operators: DispatcherOperator[]
  contactLog: ContactEntry[]
  onContact: (input: ContactAction) => void
}

export default function ContactSection({ jobs, operators, contactLog, onContact }: ContactSectionProps) {
  const [jobId, setJobId] = useState(jobs[0]?.id ?? '')
  const [operatorId, setOperatorId] = useState(jobs[0]?.operatorId ?? '')
  const [channel, setChannel] = useState<ContactChannel>('Message')
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')
  const [logFilter, setLogFilter] = useState('All')

  const activeJobs = jobs.filter((job) => job.status !== 'Unassigned' || job.operatorId)

  const selectedJob = jobs.find((job) => job.id === jobId) ?? null
  const selectedOperator = operators.find((operator) => operator.id === operatorId) ?? null

  const operatorOptions = useMemo(() => {
    if (selectedJob?.operatorId) {
      const assigned = operators.find((operator) => operator.id === selectedJob.operatorId)
      if (assigned) return [assigned, ...operators.filter((operator) => operator.id !== assigned.id)]
    }
    return operators
  }, [selectedJob, operators])

  const filteredLog = logFilter === 'All' ? contactLog : contactLog.filter((entry) => entry.jobId === logFilter)

  const canSend = message.trim().length > 0 && (channel === 'Call' || message.trim().length >= 4)

  const pickJob = (job: DispatchJob) => {
    setJobId(job.id)
    setOperatorId(job.operatorId ?? '')
    setMessage('')
    setNote('')
  }

  const submit = () => {
    if (!selectedJob || !selectedOperator || !canSend) return
    onContact({
      jobId: selectedJob.id,
      operatorId: selectedOperator.id,
      channel,
      message: message.trim(),
      note: note.trim(),
    })
    setMessage('')
    setNote('')
  }

  return (
    <div className="ds-contact-layout">
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Jobs</h3>
          <span className="sa-panel-sub">Pick a job to contact its operator</span>
        </div>
        <div className="sa-feed ds-scroll">
          {activeJobs.map((job) => (
            <button
              key={job.id}
              type="button"
              className={`sa-feed-item ds-select-row ${jobId === job.id ? 'selected' : ''}`}
              onClick={() => pickJob(job)}
            >
              <strong>
                {job.id} <em>{job.operator ?? 'Unassigned'}</em>
              </strong>
              <span className="sa-approval-tags">
                <StatusPill status={job.status} />
                <span className="sa-approval-meta">
                  {job.zone} · {job.machine}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Contact operator</h3>
          <span className="sa-panel-sub">driver.contact · call or message and log it against the job</span>
        </div>
        {selectedJob && (
          <div className="ds-contact-body">
            <div className="ds-channel">
              {(['Message', 'Call'] as ContactChannel[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`sa-chip ${channel === option ? 'active' : ''}`}
                  onClick={() => setChannel(option)}
                >
                  {option === 'Message' ? 'Message operator' : 'Log a call'}
                </button>
              ))}
            </div>

            <label className="ops-field">
              Operator
              <select className="sa-select" value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
                <option value="">Select operator…</option>
                {operatorOptions.map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.name} · {operator.phone} · {operator.zone}
                  </option>
                ))}
              </select>
            </label>

            {channel === 'Message' && (
              <div className="ds-quick">
                <span className="ds-subhead">Quick messages</span>
                <div className="sa-chip-row">
                  {quickMessages.map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      className={`sa-chip ${message === quick ? 'active' : ''}`}
                      onClick={() => setMessage(quick)}
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="ops-field">
              {channel === 'Message' ? 'Message' : 'Call topic'}
              <input
                className="sa-input"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={channel === 'Message' ? 'Type or pick a quick message…' : 'What was discussed on the call?'}
              />
            </label>
            <label className="ops-field">
              Contact note (kept in the job log)
              <input
                className="sa-input"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Outcome, ETA, customer instructions…"
              />
            </label>
            <div className="ops-field-actions">
              <button type="button" className="sa-btn approve" disabled={!selectedOperator || !canSend} onClick={submit}>
                {channel === 'Message' ? 'Send & log' : 'Log call'}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="sa-panel ds-contact-log">
        <div className="sa-panel-header">
          <h3>Contact log</h3>
          <span className="sa-panel-sub">{filteredLog.length} entries</span>
        </div>
        <div className="sa-toolbar">
          <label className="ops-field">
            Filter by job
            <select className="sa-select" value={logFilter} onChange={(event) => setLogFilter(event.target.value)}>
              <option value="All">All jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.id}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Operator</th>
                <th>Channel</th>
                <th>Message / topic</th>
                <th>Note</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLog.map((entry) => (
                <tr key={entry.id}>
                  <td className="sa-cell-strong">{entry.jobId}</td>
                  <td>{entry.operator}</td>
                  <td>
                    <StatusPill status={entry.channel === 'Call' ? 'Info' : 'Assigned'} />
                    <span className="sa-cell-sub">{entry.channel}</span>
                  </td>
                  <td>{entry.message}</td>
                  <td>{entry.note || '—'}</td>
                  <td>
                    {entry.time}
                    <span className="sa-cell-sub">{entry.by}</span>
                  </td>
                </tr>
              ))}
              {filteredLog.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="sa-empty">
                      <p>No contact logged for this job yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
