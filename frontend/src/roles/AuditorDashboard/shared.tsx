import { resultTone, severityTone, type AuditResult, type FindingSeverity } from './auditorData'

export function ResultPill({ result }: { result: AuditResult | 'Failed' | 'Success' }) {
  const normalized: AuditResult = result === 'Failed' ? 'Denied' : result === 'Success' ? 'Allowed' : result
  return <span className={`sa-pill ${resultTone[normalized]}`}>{normalized}</span>
}

export function SeverityPill({ severity }: { severity: FindingSeverity }) {
  return <span className={`sa-pill ${severityTone[severity]}`}>{severity}</span>
}

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    Active: 'green',
    Cleared: 'green',
    Verified: 'green',
    Fixed: 'green',
    Dismissed: 'slate',
    Suspended: 'red',
    Mismatch: 'red',
    Held: 'red',
    Open: 'amber',
    Pending: 'amber',
    Assigned: 'blue',
    'In review': 'blue',
    Dormant: 'amber',
    'Former staff': 'red',
    Reopened: 'red',
    Confirmed: 'red',
    'Needs review': 'amber',
  }
  return <span className={`sa-pill ${tone[status] ?? 'slate'}`}>{status}</span>
}

export function MaskedValue({
  masked,
  revealed,
  onReveal,
}: {
  masked: string
  revealed: boolean
  onReveal: () => void
}) {
  if (revealed) return <span>{masked}</span>
  return (
    <button type="button" className="aud-reveal" onClick={onReveal} title="Reveal personal data (logged)">
      {masked}
    </button>
  )
}
