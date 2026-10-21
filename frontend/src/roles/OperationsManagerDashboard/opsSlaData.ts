// Live deadlines and delay queues for the Operations Manager.
//
// Every entry is a task, pickup, return, incident or service target that is
// running against a promised time. Deadlines are stored as timestamps so the
// page can show a live countdown and raise an escalation before the target is
// missed.

export type OpsDeadlineKind =
  | 'Task deadline'
  | 'Delayed pickup'
  | 'Overdue return'
  | 'Unresolved incident'
  | 'Service target breach'

export type OpsDeadline = {
  id: string
  kind: OpsDeadlineKind
  title: string
  reference: string
  owner: string
  site: string
  raisedAt: string
  /** ISO timestamp the target is due by. */
  deadline: string
  /** Minutes allowed from the raise time. */
  targetMins: number
  detail: string
  escalated: boolean
  escalatedTo?: string
  escalatedAt?: string
}

export const opsDeadlineKinds: OpsDeadlineKind[] = [
  'Task deadline',
  'Delayed pickup',
  'Overdue return',
  'Unresolved incident',
  'Service target breach',
]

export const slaEscalationTarget = 'City admin · Hyderabad · Praveen Kumar'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const now = Date.now()
const at = (offsetMs: number) => new Date(now + offsetMs).toISOString()
const ago = (offsetMs: number) => new Date(now - offsetMs).toISOString()

/** Human readable "how long ago" label for a moment in the past. */
const timeAgo = (offsetMs: number) => {
  const minutes = Math.round(offsetMs / MINUTE)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return `${Math.round(hours / 24)} d ago`
}

export const opsDeadlines: OpsDeadline[] = [
  // --- Task deadlines: dispatch assignments against their SLA ---
  {
    id: 'DL-901',
    kind: 'Task deadline',
    title: 'JOB-7809 still unassigned',
    reference: 'JOB-7809 · BK-5193',
    owner: 'Ayesha Khan · Dispatch',
    site: 'Nizamabad depot',
    raisedAt: timeAgo(18 * MINUTE),
    deadline: at(12 * MINUTE),
    targetMins: 30,
    detail: 'Request-to-dispatch target is 30 minutes. No operator has picked the job up yet.',
    escalated: false,
  },
  {
    id: 'DL-902',
    kind: 'Task deadline',
    title: 'JOB-7801 awaiting crew handover',
    reference: 'JOB-7801 · BK-5190',
    owner: 'Neha Pillai · Shift',
    site: 'Metro rail site, HITEC City',
    raisedAt: timeAgo(26 * MINUTE),
    deadline: at(4 * MINUTE),
    targetMins: 30,
    detail: 'A replacement crane is being allocated but the handover slot closes in 4 minutes.',
    escalated: false,
  },
  {
    id: 'DL-903',
    kind: 'Task deadline',
    title: 'Site induction not completed for JOB-7788',
    reference: 'JOB-7788 · BK-5168',
    owner: 'Venkat Rao · Operator',
    site: 'Kondapur plot',
    raisedAt: timeAgo(58 * MINUTE),
    deadline: ago(13 * MINUTE),
    targetMins: 45,
    detail: 'The crew cannot start without the site induction, and the 45 minute target has already passed.',
    escalated: false,
  },
  {
    id: 'DL-904',
    kind: 'Task deadline',
    title: 'Return inspection not signed off',
    reference: 'JOB-7789 · BK-5171',
    owner: 'Workshop Team',
    site: 'Raidurg yard',
    raisedAt: timeAgo(52 * MINUTE),
    deadline: at(8 * MINUTE),
    targetMins: 45,
    detail: 'The machine is back at the yard but the release inspection has not been signed.',
    escalated: false,
  },
  {
    id: 'DL-905',
    kind: 'Task deadline',
    title: 'Escalation ESC-14 not acknowledged',
    reference: 'ESC-14',
    owner: 'City admin · Hyderabad',
    site: 'Hyderabad dispatch',
    raisedAt: timeAgo(90 * MINUTE),
    deadline: ago(30 * MINUTE),
    targetMins: 60,
    detail: 'The unassigned-queue escalation has been sitting with the city admin for 90 minutes.',
    escalated: true,
    escalatedTo: slaEscalationTarget,
    escalatedAt: timeAgo(75 * MINUTE),
  },

  // --- Delayed pickups ---
  {
    id: 'DL-906',
    kind: 'Delayed pickup',
    title: 'Pickup slot missed for the Sobha Realty crane',
    reference: 'JOB-7793 · BK-5171',
    owner: 'Ayesha Siddiqui · Operator',
    site: 'Sobha Realty, Gachibowli',
    raisedAt: timeAgo(72 * MINUTE),
    deadline: at(3 * MINUTE),
    targetMins: 60,
    detail: 'The pickup window closes in 3 minutes and the customer is waiting on site.',
    escalated: false,
  },
  {
    id: 'DL-907',
    kind: 'Delayed pickup',
    title: 'Crane pickup held by an unresolved gate denial',
    reference: 'JOB-7790 · BK-5173',
    owner: 'Imran Ali · Operator',
    site: 'Uppal site entry',
    raisedAt: timeAgo(3 * HOUR),
    deadline: ago(2 * HOUR),
    targetMins: 60,
    detail: 'The gate refused the pickup for the second time this week, so the slot was missed entirely.',
    escalated: true,
    escalatedTo: slaEscalationTarget,
    escalatedAt: timeAgo(2 * HOUR + 20 * MINUTE),
  },
  {
    id: 'DL-908',
    kind: 'Delayed pickup',
    title: 'Excavator pickup running 40 minutes late',
    reference: 'JOB-7795 · BK-5182',
    owner: 'Kiran Vardhan · Operator',
    site: 'L&T Metro Rail, HITEC City',
    raisedAt: timeAgo(55 * MINUTE),
    deadline: at(5 * MINUTE),
    targetMins: 60,
    detail: 'The machine handover at the yard is running behind and the site is ready to receive it.',
    escalated: false,
  },
  {
    id: 'DL-909',
    kind: 'Delayed pickup',
    title: 'Mixer pickup rescheduled after a fault',
    reference: 'JOB-7788 · BK-5168',
    owner: 'Rakesh Naidu · Operator',
    site: 'Kondapur service bay',
    raisedAt: timeAgo(4 * HOUR),
    deadline: at(26 * MINUTE),
    targetMins: 60,
    detail: 'A hydraulic fault moved the pickup to the next slot; the customer has been notified.',
    escalated: false,
  },

  // --- Overdue returns ---
  {
    id: 'DL-910',
    kind: 'Overdue return',
    title: 'Tipper return 6 days past the due date',
    reference: 'OR-226 · BK-5157',
    owner: 'Imran Ali · Operator',
    site: 'Ramky Infrastructure, Uppal',
    raisedAt: timeAgo(6 * DAY),
    deadline: ago(2 * DAY),
    targetMins: 1440,
    detail: 'The machine is still with the customer and the daily standby penalty is accruing.',
    escalated: true,
    escalatedTo: slaEscalationTarget,
    escalatedAt: timeAgo(1 * DAY),
  },
  {
    id: 'DL-911',
    kind: 'Overdue return',
    title: 'Crane return 21 hours past the due date',
    reference: 'OR-224 · BK-5151',
    owner: 'Ayesha Siddiqui · Operator',
    site: 'Deccan Roadlines, Madhapur',
    raisedAt: timeAgo(21 * HOUR),
    deadline: ago(3 * HOUR),
    targetMins: 1440,
    detail: 'The return was held for a customer sign-off that has not been provided.',
    escalated: false,
  },
  {
    id: 'DL-912',
    kind: 'Overdue return',
    title: 'Backhoe return pending an inspection slot',
    reference: 'OR-222 · BK-5154',
    owner: 'Rakesh Naidu · Operator',
    site: 'My Home Builders, Kukatpally',
    raisedAt: timeAgo(2 * DAY),
    deadline: at(6 * HOUR),
    targetMins: 1440,
    detail: 'The yard has no inspection slot free before the end of the day.',
    escalated: false,
  },

  // --- Unresolved incidents ---
  {
    id: 'DL-913',
    kind: 'Unresolved incident',
    title: 'Tip-over on the Kondapur ramp still under investigation',
    reference: 'INC-95 · IS-1041',
    owner: 'Workshop Team',
    site: 'Kondapur ramp, TSIIC plot',
    raisedAt: timeAgo(5 * HOUR),
    deadline: ago(1 * HOUR),
    targetMins: 45,
    detail: 'The 45 minute incident response target has passed and the statement is still being collected.',
    escalated: false,
  },
  {
    id: 'DL-914',
    kind: 'Unresolved incident',
    title: 'Near miss with a reversing JCB awaiting sign-off',
    reference: 'INC-93 · IS-1030',
    owner: 'Ayesha Khan · Dispatch',
    site: 'Raidurg plot',
    raisedAt: timeAgo(40 * MINUTE),
    deadline: at(5 * MINUTE),
    targetMins: 45,
    detail: 'The toolbox brief is drafted but the safety lead has not signed it off.',
    escalated: false,
  },
  {
    id: 'DL-915',
    kind: 'Unresolved incident',
    title: 'Site safety gear non-compliance unresolved',
    reference: 'INC-91 · TCK-123',
    owner: 'Support admin · Hyderabad',
    site: 'Aparna Constructions, Madhapur',
    raisedAt: timeAgo(9 * HOUR),
    deadline: at(2 * HOUR),
    targetMins: 45,
    detail: 'The toolkit audit is still open across the zone crews.',
    escalated: true,
    escalatedTo: slaEscalationTarget,
    escalatedAt: timeAgo(6 * HOUR),
  },

  // --- Breached service targets ---
  {
    id: 'DL-916',
    kind: 'Service target breach',
    title: 'Pickup slot compliance below target',
    reference: 'SLA · Pickup slot (60 min)',
    owner: 'Operations Manager',
    site: 'Madhapur zone',
    raisedAt: timeAgo(6 * HOUR),
    deadline: ago(1 * DAY),
    targetMins: 1440,
    detail: 'Pickup slot compliance has been under 85% for six consecutive days.',
    escalated: false,
  },
  {
    id: 'DL-917',
    kind: 'Service target breach',
    title: 'Dispatch assignment compliance below target',
    reference: 'SLA · Dispatch assignment (30 min)',
    owner: 'Operations Manager',
    site: 'Madhapur zone',
    raisedAt: timeAgo(2 * DAY),
    deadline: at(6 * HOUR),
    targetMins: 1440,
    detail: 'The 30 minute request-to-dispatch target is being missed on the busiest shifts.',
    escalated: true,
    escalatedTo: slaEscalationTarget,
    escalatedAt: timeAgo(1 * DAY),
  },
  {
    id: 'DL-918',
    kind: 'Service target breach',
    title: 'Delivery slot compliance under 90%',
    reference: 'SLA · Delivery slot (120 min)',
    owner: 'Operations Manager',
    site: 'Madhapur zone',
    raisedAt: timeAgo(9 * HOUR),
    deadline: ago(30 * MINUTE),
    targetMins: 1440,
    detail: 'Delivery slots have been slipping against the two hour target for the last week.',
    escalated: false,
  },
]

/** Formats the remaining time on a deadline for the countdown display. */
export function formatCountdown(deadline: string, nowMs: number): { label: string; overdue: boolean } {
  const diff = new Date(deadline).getTime() - nowMs
  const overdue = diff < 0
  const abs = Math.abs(diff)
  const days = Math.floor(abs / DAY)
  const hours = Math.floor((abs % DAY) / HOUR)
  const minutes = Math.floor((abs % HOUR) / MINUTE)
  const seconds = Math.floor((abs % MINUTE) / 1000)
  const pad = (value: number) => String(value).padStart(2, '0')
  const label =
    days > 0
      ? `${days}d ${pad(hours)}h`
      : hours > 0
        ? `${hours}h ${pad(minutes)}m`
        : `${pad(minutes)}m ${pad(seconds)}s`
  return { label: overdue ? `${label} over` : label, overdue }
}

/** Warning state for a deadline: critical once it is inside the last 25% of target. */
export function warningState(deadline: string, targetMins: number, nowMs: number): 'ok' | 'warning' | 'breached' {
  const diff = new Date(deadline).getTime() - nowMs
  if (diff < 0) return 'breached'
  if (diff <= (targetMins * MINUTE) / 4) return 'warning'
  return 'ok'
}
