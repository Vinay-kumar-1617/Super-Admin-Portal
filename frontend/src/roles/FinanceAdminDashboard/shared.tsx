const statusPillClass: Record<string, string> = {
  Active: 'green',
  Finalized: 'green',
  Approved: 'green',
  Paid: 'green',
  Processed: 'green',
  Matched: 'green',
  Balanced: 'green',
  Closed: 'green',
  Scheduled: 'amber',
  Review: 'amber',
  Pending: 'amber',
  'Awaiting second approval': 'amber',
  Investigating: 'amber',
  Corrected: 'blue',
  Sent: 'blue',
  Open: 'blue',
  Failed: 'red',
  Held: 'red',
  Rejected: 'red',
  Overdue: 'red',
  Mismatch: 'red',
  Draft: 'slate',
  'Written off': 'slate',
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`sa-pill ${statusPillClass[status] ?? 'slate'}`}>{status}</span>
}

const scopePillClass: Record<string, string> = {
  State: 'blue',
  City: 'green',
  Zone: 'amber',
  Owner: 'blue',
  Operator: 'green',
  'Customer invoice': 'blue',
  Receipt: 'green',
  'Commission statement': 'amber',
  'Payout statement': 'slate',
}

export function ScopePill({ value }: { value: string }) {
  return <span className={`sa-pill ${scopePillClass[value] ?? 'slate'}`}>{value}</span>
}

export function RateCell({ rate, cap }: { rate: number; cap: number }) {
  const ratio = cap === 0 ? 0 : Math.min(100, Math.round((rate / cap) * 100))
  return (
    <span className="sa-progress-cell">
      <span className="sa-progress">
        <span style={{ width: `${ratio}%` }} />
      </span>
      <span>
        {rate}% / cap {cap}%
      </span>
    </span>
  )
}
