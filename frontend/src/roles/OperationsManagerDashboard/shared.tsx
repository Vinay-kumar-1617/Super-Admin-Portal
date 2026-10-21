const statusPillClass: Record<string, string> = {
  Active: 'green',
  Available: 'green',
  Confirmed: 'green',
  Completed: 'green',
  Approved: 'green',
  Verified: 'green',
  Resolved: 'green',
  Balanced: 'green',
  'On shift': 'green',
  'In Progress': 'green',
  Pending: 'amber',
  Inspection: 'amber',
  Review: 'amber',
  Open: 'amber',
  'Under Review': 'amber',
  Unassigned: 'amber',
  'At Risk': 'amber',
  'On break': 'amber',
  'Ending soon': 'amber',
  New: 'amber',
  Warning: 'amber',
  Short: 'red',
  Stuck: 'red',
  Escalated: 'red',
  Maintenance: 'red',
  Cancelled: 'red',
  Rejected: 'red',
  Suspended: 'red',
  Inactive: 'red',
  Incident: 'red',
  Critical: 'red',
  Urgent: 'red',
  Rented: 'blue',
  Assigned: 'blue',
  Info: 'blue',
  'On Hire': 'blue',
  Acknowledged: 'blue',
  Surplus: 'blue',
  Action: 'blue',
  Note: 'slate',
  Normal: 'slate',
  'Not started': 'slate',
  // Issue & incident report statuses and severities.
  Reported: 'amber',
  Investigating: 'blue',
  'Action taken': 'purple',
  Closed: 'slate',
  Major: 'orange',
  Minor: 'slate',
  // Dispute priorities.
  High: 'amber',
  Medium: 'blue',
  Low: 'slate',
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
