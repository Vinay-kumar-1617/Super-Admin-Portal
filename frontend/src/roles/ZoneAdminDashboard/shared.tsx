const statusPillClass: Record<string, string> = {
  Active: 'green',
  Available: 'green',
  Confirmed: 'green',
  Completed: 'green',
  Approved: 'green',
  Verified: 'green',
  Pending: 'amber',
  Inspection: 'amber',
  Review: 'amber',
  Rented: 'blue',
  Maintenance: 'red',
  Cancelled: 'red',
  Rejected: 'red',
  Suspended: 'red',
  Inactive: 'slate',
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
