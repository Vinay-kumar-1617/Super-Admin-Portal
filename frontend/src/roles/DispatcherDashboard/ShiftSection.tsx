import { useState } from 'react'
import { PriorityPill, StatusPill } from './shared'
import type { DispatchJob, HandoverNote } from './dispatcherData'

type ShiftSectionProps = {
  jobs: DispatchJob[]
  notes: HandoverNote[]
  onAddNote: (text: string, jobId?: string) => void
}

export default function ShiftSection({ jobs, notes, onAddNote }: ShiftSectionProps) {
  const [draft, setDraft] = useState('')
  const [jobId, setJobId] = useState('')
  const [showPrevious, setShowPrevious] = useState(true)

  const focusJobs = jobs.filter((job) => job.status === 'Unassigned' || job.status === 'At Risk' || job.status === 'Stuck')

  const visibleNotes = showPrevious ? notes : notes.filter((note) => note.shift === 'Morning')

  const submit = () => {
    const text = draft.trim()
    if (text.length < 4) return
    onAddNote(text, jobId || undefined)
    setDraft('')
    setJobId('')
  }

  const flagJob = (job: DispatchJob) => {
    setJobId(job.id)
    setDraft((current) =>
      current.trim() ? current : `${job.id}: ${job.priority === 'Urgent' ? 'urgent — ' : ''}${job.zone} needs watching into the next shift.`,
    )
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Open &amp; at-risk jobs for the next shift</h3>
          <span className="sa-panel-sub">{focusJobs.length} jobs need watching · flag any into a handover note</span>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Zone</th>
                <th>Operator</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Waiting</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {focusJobs.map((job) => (
                <tr key={job.id}>
                  <td className="sa-cell-strong">
                    {job.id}
                    <span className="sa-cell-sub">{job.customer}</span>
                  </td>
                  <td>{job.zone}</td>
                  <td>{job.operator ?? 'Unassigned'}</td>
                  <td>
                    <PriorityPill value={job.priority} />
                  </td>
                  <td>
                    <StatusPill status={job.status} />
                  </td>
                  <td className="sa-num">{job.waiting} min</td>
                  <td>
                    <button type="button" className="sa-btn-ghost" onClick={() => flagJob(job)}>
                      Flag to note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="sa-lower-grid">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Write handover</h3>
            <span className="sa-panel-sub">Carry context across shift changes</span>
          </div>
          <div className="ds-note-form">
            <label className="ops-field">
              Link a job (optional)
              <select className="sa-select" value={jobId} onChange={(event) => setJobId(event.target.value)}>
                <option value="">No specific job</option>
                {focusJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.id} · {job.zone} · {job.status}
                  </option>
                ))}
              </select>
            </label>
            <label className="ops-field ops-field-grow">
              Note
              <textarea
                className="sa-input ds-textarea"
                aria-label="Handover note"
                placeholder="What should the next dispatcher watch, and what is already in motion?"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </label>
            <div className="ops-field-actions">
              <button type="button" className="sa-btn approve" disabled={draft.trim().length < 4} onClick={submit}>
                Add handover note
              </button>
            </div>
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Handover notes</h3>
            <button type="button" className="sa-view-link" onClick={() => setShowPrevious((value) => !value)}>
              {showPrevious ? 'This shift only' : 'Include previous shift'}
            </button>
          </div>
          <div className="sa-feed">
            {visibleNotes.map((note) => (
              <div key={note.id} className="sa-feed-item">
                <strong>
                  {note.author} <em>· {note.shift} shift · {note.time}</em>
                </strong>
                <p>{note.text}</p>
              </div>
            ))}
            {visibleNotes.length === 0 && (
              <div className="sa-empty">
                <p>No handover notes for this shift yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
