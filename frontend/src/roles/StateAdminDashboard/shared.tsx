const statusPillClass: Record<string, string> = {
  Active: 'green',
  Available: 'green',
  Confirmed: 'green',
  Completed: 'green',
  Approved: 'green',
  Processed: 'green',
  Successful: 'green',
  Paid: 'green',
  Current: 'green',
  Pending: 'amber',
  Inspection: 'amber',
  Review: 'amber',
  'On break': 'amber',
  Assigned: 'blue',
  'In Progress': 'purple',
  Returned: 'blue',
  Rented: 'blue',
  Refunded: 'blue',
  Sent: 'blue',
  Maintenance: 'red',
  Cancelled: 'red',
  Rejected: 'red',
  Failed: 'red',
  Overdue: 'red',
  Critical: 'red',
  Inactive: 'slate',
  Offline: 'slate',
  Draft: 'slate',
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

export type StatTone = 'brand' | 'purple' | 'blue' | 'green' | 'red' | 'amber' | 'slate'

export type StatCard = {
  key: string
  label: string
  value: string | number
  tone: StatTone
  sub?: string
  static?: boolean
  compact?: boolean
}

export function StatCards({
  cards,
  activeKey,
  onSelect,
}: {
  cards: StatCard[]
  activeKey?: string
  onSelect?: (key: string) => void
}) {
  return (
    <div className="sa-stat-grid">
      {cards.map((card) => {
        const className = `sa-stat-card tone-${card.tone}${card.compact ? ' compact' : ''}${activeKey === card.key ? ' active' : ''}${card.static ? ' static' : ''}`
        const content = (
          <>
            <span className="sa-stat-label">{card.label}</span>
            <strong className="sa-stat-value">{card.value}</strong>
            {card.sub ? <span className="sa-stat-sub">{card.sub}</span> : null}
          </>
        )
        if (card.static) {
          return (
            <div key={card.key} className={className}>
              {content}
            </div>
          )
        }
        return (
          <button
            key={card.key}
            type="button"
            className={className}
            aria-pressed={activeKey === card.key}
            onClick={() => onSelect?.(card.key)}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
