import type { ReactNode } from 'react'
import type {
  ComplianceCheck,
  ComplianceDecisionContext,
  CompliancePermission,
} from './compliancePermissions'

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
  Compliant: 'green',
  'Non-compliant': 'red',
  'In progress': 'blue',
  Completed: 'green',
  'In preparation': 'amber',
  Critical: 'red',
  Major: 'amber',
  Minor: 'blue',
  'Under review': 'blue',
  Closed: 'green',
  'No record': 'slate',
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

/**
 * Action button that asks the permission model before it renders as usable.
 *
 * When the permission is refused the button is disabled and the reason is
 * exposed as a tooltip (disabled buttons do not fire hover events on their own,
 * so the reason sits on the wrapper) together with a lock marker.
 */
export function GatedAction({
  check,
  permission,
  context,
  className,
  onClick,
  disabled,
  title,
  children,
}: {
  check: ComplianceCheck
  permission: CompliancePermission
  context?: ComplianceDecisionContext
  className?: string
  onClick?: () => void
  disabled?: boolean
  title?: string
  children: ReactNode
}) {
  const decision = check(permission, context)
  const blocked = !decision.allowed
  const tooltip = blocked ? decision.reason : title
  return (
    <span className={`cf-gate${blocked ? ' blocked' : ''}`} title={tooltip}>
      <button
        type="button"
        className={className}
        disabled={blocked || disabled}
        aria-disabled={blocked || undefined}
        title={tooltip}
        onClick={onClick}
      >
        {blocked ? (
          <>
            <span className="cf-gate-lock" aria-hidden="true">
              &#128274;
            </span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    </span>
  )
}
