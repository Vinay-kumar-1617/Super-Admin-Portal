import { useState } from 'react'
import { StatusPill } from './shared'
import { sortJobsByUrgency } from './dispatcherUtils'
import type { DispatcherOperator, DispatchJob, OperatorStatus } from './dispatcherData'
import { zoneBoundaries } from './dispatcherData'

type LiveMapSectionProps = {
  jobs: DispatchJob[]
  operators: DispatcherOperator[]
  onAssign: (jobId: string) => void
}

const statusOrder: OperatorStatus[] = ['Available', 'Assigned', 'On the way', 'At site', 'Returning']

const dotClass: Record<string, string> = {
  Available: 'green',
  Assigned: 'blue',
  'On the way': 'amber',
  'At site': 'purple',
  Returning: 'slate',
  Offline: 'red',
}

export default function LiveMapSection({ jobs, operators, onAssign }: LiveMapSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | OperatorStatus>('All')
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showJobs, setShowJobs] = useState(true)

  const visibleOperators = operators.filter(
    (operator) =>
      (statusFilter === 'All' || operator.status === statusFilter) &&
      (!selectedZone || operator.zone === selectedZone),
  )

  const unassigned = sortJobsByUrgency(jobs.filter((job) => job.status === 'Unassigned'))
  const visibleJobs = selectedZone
    ? unassigned.filter((job) => job.zone === selectedZone)
    : unassigned

  const nearestFor = (job: DispatchJob): DispatcherOperator | undefined => {
    const pool = operators.filter((operator) => operator.status === 'Available')
    const sameZone = pool.filter((operator) => operator.zone === job.zone)
    return sameZone[0] ?? pool[0]
  }

  return (
    <div className="ops-map-layout">
      <section className="sa-panel">
        <div className="sa-panel-header">
          <h3>Live map · Hyderabad</h3>
          <span className="sa-panel-sub">Operators, vehicles, unassigned jobs and zone boundaries</span>
        </div>
        <div className="sa-toolbar">
          <div className="sa-chip-row">
            <button
              type="button"
              className={`sa-chip ${statusFilter === 'All' ? 'active' : ''}`}
              onClick={() => setStatusFilter('All')}
            >
              All
            </button>
            {statusOrder.map((status) => (
              <button
                key={status}
                type="button"
                className={`sa-chip ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`sa-chip orange ${showJobs ? 'active orange' : ''}`}
            onClick={() => setShowJobs((value) => !value)}
          >
            {showJobs ? 'Unassigned jobs ✓' : 'Unassigned jobs'}
          </button>
        </div>
        <div className="ds-map-canvas">
          <div className="ds-city-boundary">
            <span className="ds-city-boundary-label">Hyderabad city boundary</span>
          </div>
          {zoneBoundaries.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`ds-zone ${selectedZone === zone.name ? 'selected' : ''}`}
              style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
              onClick={() => setSelectedZone(selectedZone === zone.name ? null : zone.name)}
            >
              <span>{zone.name}</span>
            </button>
          ))}

          {operators.map((operator) => {
            const dimmed =
              (statusFilter !== 'All' && operator.status !== statusFilter) ||
              (selectedZone !== null && operator.zone !== selectedZone)
            return (
              <span
                key={operator.id}
                className={`ds-map-dot ${dotClass[operator.status] ?? 'slate'} ${dimmed ? 'dimmed' : ''}`}
                style={{ left: `${operator.map.x}%`, top: `${operator.map.y}%` }}
                title={`${operator.name} · ${operator.vehicle} · ${operator.status} · ${operator.zone}`}
              />
            )
          })}

          {showJobs &&
            unassigned.map((job) => (
              <span
                key={job.id}
                className={`ds-map-job ${job.priority === 'Urgent' ? 'urgent' : ''} ${
                  selectedZone && job.zone !== selectedZone ? 'dimmed' : ''
                }`}
                style={{ left: `${job.map.x}%`, top: `${job.map.y}%` }}
                title={`${job.id} · ${job.requiredType} · ${job.zone} · waiting ${job.waiting} min`}
              >
                {job.priority === 'Urgent' ? '!' : 'J'}
              </span>
            ))}
        </div>
        <div className="ops-legend">
          <span>
            <i className="green" /> Available
          </span>
          <span>
            <i className="blue" /> Assigned
          </span>
          <span>
            <i className="amber" /> On the way
          </span>
          <span>
            <i className="purple" /> At site
          </span>
          <span>
            <i className="slate" /> Returning
          </span>
          <span>
            <i className="red" /> Offline
          </span>
        </div>
      </section>

      <div className="ds-map-side">
        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>{selectedZone ?? 'All zones'}</h3>
            <button type="button" className="sa-view-link" onClick={() => setSelectedZone(null)}>
              {selectedZone ? 'Clear zone' : `${operators.length} operators tracked`}
            </button>
          </div>
          <div className="sa-feed">
            {visibleOperators.map((operator) => (
              <div key={operator.id} className="sa-feed-item">
                <strong>
                  {operator.name} <em>{operator.vehicle}</em>
                </strong>
                <span className="sa-approval-tags">
                  <StatusPill status={operator.status} />
                  <span className="sa-approval-meta">
                    {operator.zone} · {operator.distanceKm} km · seen {operator.since}
                  </span>
                </span>
              </div>
            ))}
            {visibleOperators.length === 0 && (
              <div className="sa-empty">
                <p>No operators match this view.</p>
                <button
                  type="button"
                  className="sa-btn-ghost"
                  onClick={() => {
                    setStatusFilter('All')
                    setSelectedZone(null)
                  }}
                >
                  Reset map filters
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="sa-panel">
          <div className="sa-panel-header">
            <h3>Unassigned jobs nearby</h3>
            <span className="sa-panel-sub">{visibleJobs.length} waiting in {selectedZone ?? 'Hyderabad'}</span>
          </div>
          <div className="sa-feed">
            {visibleJobs.map((job) => {
              const nearest = nearestFor(job)
              return (
                <div key={job.id} className="sa-feed-item">
                  <strong>
                    {job.id} <em>{job.requiredType}</em>
                  </strong>
                  <span>
                    {job.zone} · waiting {job.waiting} min · {job.priority === 'Urgent' ? 'urgent' : 'normal'}
                  </span>
                  <span className="sa-approval-tags">
                    <StatusPill status={job.waiting > job.sla ? 'Critical' : 'Normal'} />
                    {nearest ? (
                      <span className="sa-approval-meta">
                        Nearest: {nearest.name} · {nearest.distanceKm} km ({nearest.status})
                      </span>
                    ) : (
                      <span className="sa-approval-meta">No available operator nearby</span>
                    )}
                    <button type="button" className="sa-view-link" onClick={() => onAssign(job.id)}>
                      Assign →
                    </button>
                  </span>
                </div>
              )
            })}
            {visibleJobs.length === 0 && (
              <div className="sa-empty">
                <p>No unassigned jobs in this view.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
