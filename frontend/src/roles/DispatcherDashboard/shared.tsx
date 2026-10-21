const statusPillClass: Record<string, string> = {
  Available: 'green',
  Completed: 'green',
  Verified: 'green',
  Resolved: 'green',
  'At site': 'green',
  'In Progress': 'green',
  Assigned: 'blue',
  'On the way': 'blue',
  Acknowledged: 'blue',
  Info: 'blue',
  Pending: 'amber',
  Waiting: 'amber',
  Review: 'amber',
  Open: 'amber',
  'At Risk': 'amber',
  Returning: 'amber',
  Warning: 'amber',
  Unassigned: 'slate',
  Normal: 'slate',
  Note: 'slate',
  Stuck: 'red',
  Escalated: 'red',
  Offline: 'red',
  Urgent: 'red',
  Critical: 'red',
  Cancelled: 'red',
}

const suitabilityClass: Record<string, string> = {
  Match: 'green',
  Partial: 'amber',
  'Not suitable': 'red',
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`sa-pill ${statusPillClass[status] ?? 'slate'}`}>{status}</span>
}

export function SuitabilityPill({ value }: { value: string }) {
  return <span className={`sa-pill ${suitabilityClass[value] ?? 'slate'}`}>{value}</span>
}

export function PriorityPill({ value }: { value: string }) {
  return <span className={`sa-pill ${value === 'Urgent' ? 'red' : 'slate'}`}>{value}</span>
}
