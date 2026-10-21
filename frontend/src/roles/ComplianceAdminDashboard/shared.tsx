const statusPillClass: Record<string, string> = {
  Pending: 'amber',
  Renewed: 'blue',
  Verified: 'green',
  Rejected: 'red',
  Valid: 'green',
  'Pending verification': 'amber',
  Expiring: 'amber',
  Expired: 'red',
  Missing: 'red',
  Scheduled: 'blue',
  Overdue: 'red',
  Pass: 'green',
  Fail: 'red',
  'Pass with conditions': 'amber',
  Suspended: 'red',
  Reinstated: 'green',
  Lapsed: 'red',
  'Due soon': 'amber',
  Healthy: 'green',
  Backlog: 'red',
  Balanced: 'amber',
  Clear: 'green',
  Open: 'amber',
  Acknowledged: 'blue',
  Resolved: 'green',
  Outgoing: 'blue',
  Incoming: 'purple',
  Driver: 'blue',
  Vehicle: 'purple',
  Owner: 'green',
  'Fleet Partner': 'amber',
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`sa-pill ${statusPillClass[status] ?? 'slate'}`}>{status}</span>
}

export function ProgressCell({ value }: { value: number }) {
  return (
    <span className="sa-progress-cell">
      <span className="sa-progress">
        <span style={{ width: `${value}%` }} />
      </span>
      <span>{value}%</span>
    </span>
  )
}
