import { cityNames } from './serviceAreasData'

/* ------------------------------------------------------------------ *
 * Rule catalogues
 * ------------------------------------------------------------------ */

export type RuleCategory =
  | 'Pricing'
  | 'Security Deposit'
  | 'Booking & Cancellation'
  | 'Payment'
  | 'Late Return'
  | 'Damage & Loss'
  | 'Insurance'
  | 'Operator License'
  | 'Machine Documents'
  | 'Maintenance'
  | 'Safety'
  | 'Delivery & Pickup'
  | 'Location Restrictions'
  | 'Owner/Customer Compliance'
  | 'Penalties'
  | 'Platform Commission'

export const ruleCategories: RuleCategory[] = [
  'Pricing',
  'Security Deposit',
  'Booking & Cancellation',
  'Payment',
  'Late Return',
  'Damage & Loss',
  'Insurance',
  'Operator License',
  'Machine Documents',
  'Maintenance',
  'Safety',
  'Delivery & Pickup',
  'Location Restrictions',
  'Owner/Customer Compliance',
  'Penalties',
  'Platform Commission',
]

export type CategoryGroup = 'Money' | 'Booking' | 'Risk' | 'Compliance' | 'Operations'

export const categoryMeta: Record<RuleCategory, { code: string; group: CategoryGroup }> = {
  Pricing: { code: 'PR', group: 'Money' },
  'Security Deposit': { code: 'SD', group: 'Money' },
  'Booking & Cancellation': { code: 'BK', group: 'Booking' },
  Payment: { code: 'PM', group: 'Money' },
  'Late Return': { code: 'LR', group: 'Risk' },
  'Damage & Loss': { code: 'DM', group: 'Risk' },
  Insurance: { code: 'IN', group: 'Risk' },
  'Operator License': { code: 'OL', group: 'Compliance' },
  'Machine Documents': { code: 'MD', group: 'Compliance' },
  Maintenance: { code: 'MT', group: 'Operations' },
  Safety: { code: 'SF', group: 'Operations' },
  'Delivery & Pickup': { code: 'DP', group: 'Operations' },
  'Location Restrictions': { code: 'LC', group: 'Operations' },
  'Owner/Customer Compliance': { code: 'CC', group: 'Compliance' },
  Penalties: { code: 'PN', group: 'Risk' },
  'Platform Commission': { code: 'CM', group: 'Money' },
}

export type RuleDomain = 'global' | 'pricing' | 'booking'

export const domainCategories: Record<RuleDomain, RuleCategory[]> = {
  global: ruleCategories,
  pricing: ['Pricing', 'Platform Commission'],
  booking: ['Booking & Cancellation', 'Payment', 'Late Return'],
}

export type RuleScopeLevel = 'Global' | 'Country' | 'City' | 'Owner' | 'Customer' | 'Equipment' | 'Rental'

export const scopeLevels: { level: RuleScopeLevel; hint: string }[] = [
  { level: 'Global', hint: 'Applies to every booking on the platform' },
  { level: 'Country', hint: 'Applies to bookings inside one country' },
  { level: 'City', hint: 'Applies to bookings in one city' },
  { level: 'Owner', hint: 'Applies to one fleet owner / partner' },
  { level: 'Customer', hint: 'Applies to one customer type or account' },
  { level: 'Equipment', hint: 'Applies to one machine type' },
  { level: 'Rental', hint: 'Applies to one rental / contract type' },
]

export type RuleScope = {
  level: RuleScopeLevel
  target: string
}

export type RulePriority = 'Critical' | 'High' | 'Medium' | 'Low'
export const rulePriorities: RulePriority[] = ['Critical', 'High', 'Medium', 'Low']

export type RuleStatus = 'Draft' | 'Scheduled' | 'Active' | 'Paused' | 'Archived'
export const ruleStatuses: RuleStatus[] = ['Draft', 'Scheduled', 'Active', 'Paused', 'Archived']

export const equipmentTypes: string[] = [
  'Excavator',
  'Hydraulic Crane',
  'Tower Crane',
  'Wheel Loader',
  'Bulldozer',
  'Backhoe Loader',
  'Boom Lift',
  'Scissor Lift',
  'Forklift',
  'Dump Truck',
  'Concrete Mixer',
  'Compactor',
  'Generator Set',
  'Trolley',
]

export const rentalTypes: string[] = [
  'Self-operated (short term)',
  'Self-operated (long term)',
  'With certified operator',
  'Lease / monthly contract',
]

export const countryNames: string[] = ['India', 'United Arab Emirates', 'Nepal', 'Bangladesh', 'Sri Lanka']

export const ownerNames: string[] = [
  'Srinivas Infra Rentals',
  'Metro Crane Co.',
  'Bharat Heavy Fleet',
  'Deccan Equipment Partners',
  'Kaveri Machinery Services',
]

export const documentOptions: string[] = [
  'ID Proof',
  'Insurance Certificate',
  'Operator License',
  'Fitness Certificate',
  'Ownership Proof',
  'PUC / Emission Certificate',
  'Payment Proof',
  'Safety Induction Acknowledgement',
]

export const approvalLevels: string[] = ['City Admin', 'State Admin', 'Finance Admin', 'Super Admin']
export const notifyChannels: string[] = ['SMS', 'Email', 'Push', 'In-app']
export const notifyAudiences: string[] = ['Customer', 'Owner', 'Operator', 'All parties']

/* ------------------------------------------------------------------ *
 * Conditions
 * ------------------------------------------------------------------ */

export type ConditionFieldType = 'select' | 'number' | 'boolean'

export type ConditionFieldKey =
  | 'equipmentType'
  | 'machineStatus'
  | 'machineAgeYears'
  | 'machineRunningHours'
  | 'rentalDurationDays'
  | 'rentalType'
  | 'rentalDailyRate'
  | 'rentalTotalValue'
  | 'advanceNoticeHours'
  | 'city'
  | 'country'
  | 'deliveryDistanceKm'
  | 'isWeekend'
  | 'shiftWindow'
  | 'bookingChannel'
  | 'customerType'
  | 'customerKyc'
  | 'priorCompletedBookings'
  | 'priorCancellations'
  | 'ownerCompliance'
  | 'operatorLicense'
  | 'documentStatus'
  | 'insuranceStatus'
  | 'damageSeverity'
  | 'lateReturnHours'
  | 'paymentStatus'
  | 'paymentMethod'

export type ConditionFieldDef = {
  key: ConditionFieldKey
  label: string
  group: string
  type: ConditionFieldType
  options?: string[]
  unit?: string
}

export const conditionFields: ConditionFieldDef[] = [
  { key: 'equipmentType', label: 'Equipment type', group: 'Equipment', type: 'select', options: equipmentTypes },
  { key: 'machineStatus', label: 'Machine status', group: 'Equipment', type: 'select', options: ['Operational', 'In Maintenance', 'Retired'] },
  { key: 'machineAgeYears', label: 'Machine age', group: 'Equipment', type: 'number', unit: 'years' },
  { key: 'machineRunningHours', label: 'Machine running hours', group: 'Equipment', type: 'number', unit: 'hrs' },
  { key: 'rentalDurationDays', label: 'Rental duration', group: 'Rental', type: 'number', unit: 'days' },
  { key: 'rentalType', label: 'Rental type', group: 'Rental', type: 'select', options: rentalTypes },
  { key: 'rentalDailyRate', label: 'Daily rate', group: 'Rental', type: 'number', unit: '₹' },
  { key: 'rentalTotalValue', label: 'Total rental value', group: 'Rental', type: 'number', unit: '₹' },
  { key: 'advanceNoticeHours', label: 'Advance notice before start', group: 'Rental', type: 'number', unit: 'hrs' },
  { key: 'city', label: 'City / location', group: 'Location', type: 'select', options: cityNames },
  { key: 'country', label: 'Country', group: 'Location', type: 'select', options: countryNames },
  { key: 'deliveryDistanceKm', label: 'Delivery distance', group: 'Location', type: 'number', unit: 'km' },
  { key: 'isWeekend', label: 'Weekend or public holiday', group: 'Operations', type: 'boolean' },
  {
    key: 'shiftWindow',
    label: 'Shift window',
    group: 'Operations',
    type: 'select',
    options: ['Day (06:00-18:00)', 'Night (18:00-06:00)'],
  },
  { key: 'bookingChannel', label: 'Booking channel', group: 'Operations', type: 'select', options: ['App', 'Web', 'Phone', 'Partner API'] },
  { key: 'customerType', label: 'Customer type', group: 'Customer', type: 'select', options: ['Individual', 'SME', 'Enterprise', 'Government'] },
  { key: 'customerKyc', label: 'Customer KYC status', group: 'Customer', type: 'select', options: ['Verified', 'Pending', 'Rejected'] },
  { key: 'priorCompletedBookings', label: 'Completed bookings', group: 'Customer', type: 'number', unit: 'bookings' },
  { key: 'priorCancellations', label: 'Past cancellations', group: 'Customer', type: 'number', unit: 'cancellations' },
  { key: 'ownerCompliance', label: 'Owner compliance', group: 'Compliance', type: 'select', options: ['Compliant', 'Documents Due', 'Suspended'] },
  { key: 'operatorLicense', label: 'Operator license', group: 'Compliance', type: 'select', options: ['Valid', 'Expired', 'Not Required'] },
  { key: 'documentStatus', label: 'Machine documents', group: 'Compliance', type: 'select', options: ['Complete', 'Missing', 'Expiring'] },
  { key: 'insuranceStatus', label: 'Insurance status', group: 'Compliance', type: 'select', options: ['Valid', 'Expired', 'Not Purchased'] },
  { key: 'damageSeverity', label: 'Damage severity', group: 'Risk', type: 'select', options: ['None', 'Minor', 'Major', 'Total Loss'] },
  { key: 'lateReturnHours', label: 'Late return', group: 'Risk', type: 'number', unit: 'hrs' },
  { key: 'paymentStatus', label: 'Payment status', group: 'Payment', type: 'select', options: ['Paid', 'Partially Paid', 'Pending', 'Failed', 'Refunded'] },
  { key: 'paymentMethod', label: 'Payment method', group: 'Payment', type: 'select', options: ['UPI', 'Card', 'Net Banking', 'Wallet', 'Cash', 'Corporate Credit'] },
]

export const conditionFieldMap: Record<ConditionFieldKey, ConditionFieldDef> = conditionFields.reduce(
  (acc, field) => {
    acc[field.key] = field
    return acc
  },
  {} as Record<ConditionFieldKey, ConditionFieldDef>,
)

export type ConditionOperator = 'is' | 'is_not' | 'in' | 'not_in' | 'equals' | 'greater_than' | 'less_than' | 'at_least' | 'at_most' | 'is_true' | 'is_false'

export const operatorLabels: Record<ConditionOperator, string> = {
  is: 'is',
  is_not: 'is not',
  in: 'is one of',
  not_in: 'is none of',
  equals: '=',
  greater_than: '>',
  less_than: '<',
  at_least: '>=',
  at_most: '<=',
  is_true: 'is true',
  is_false: 'is false',
}

export const operatorsForType = (type: ConditionFieldType): ConditionOperator[] => {
  if (type === 'number') return ['greater_than', 'less_than', 'at_least', 'at_most', 'equals']
  if (type === 'boolean') return ['is_true', 'is_false']
  return ['is', 'is_not', 'in', 'not_in']
}

export type RuleCondition = {
  id: string
  field: ConditionFieldKey
  operator: ConditionOperator
  value: string
}

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ */

export type ActionType =
  | 'add_fee'
  | 'add_deposit'
  | 'apply_discount'
  | 'apply_penalty'
  | 'block_booking'
  | 'require_approval'
  | 'require_documents'
  | 'send_notification'

export type ActionUnit = 'percent' | 'flat'

export type RuleAction = {
  id: string
  type: ActionType
  unit?: ActionUnit
  amount?: number
  label?: string
  approvalLevel?: string
  documents?: string[]
  channel?: string
  audience?: string
}

export const actionCatalog: { type: ActionType; label: string; description: string }[] = [
  { type: 'add_fee', label: 'Add fee', description: 'Add a fee or surcharge to the booking total' },
  { type: 'add_deposit', label: 'Require deposit', description: 'Collect a security deposit before confirmation' },
  { type: 'apply_discount', label: 'Apply discount', description: 'Reduce the payable amount for matching bookings' },
  { type: 'apply_penalty', label: 'Apply penalty', description: 'Charge a penalty after the triggering event' },
  { type: 'block_booking', label: 'Block booking', description: 'Reject the booking request outright' },
  { type: 'require_approval', label: 'Require approval', description: 'Hold the booking until an admin approves it' },
  { type: 'require_documents', label: 'Require documents', description: 'Ask for listed documents before confirmation' },
  { type: 'send_notification', label: 'Send notification', description: 'Notify the relevant parties on a channel' },
]

export const actionLabel = (type: ActionType): string =>
  actionCatalog.find((item) => item.type === type)?.label ?? type

/* ------------------------------------------------------------------ *
 * Rule shape
 * ------------------------------------------------------------------ */

export type RuleSchedule = {
  mode: 'Immediate' | 'Scheduled' | 'Recurring'
  startDate: string
  endDate: string
  days: number[]
  startTime: string
  endTime: string
}

export type RuleExceptions = {
  customers: string[]
  owners: string[]
  machines: string[]
  locations: string[]
}

export type RuleVersion = {
  version: number
  date: string
  actor: string
  summary: string
  status: RuleStatus
}

export type RuleAuditAction =
  | 'Create'
  | 'Edit'
  | 'Activate'
  | 'Pause'
  | 'Schedule'
  | 'Duplicate'
  | 'Archive'
  | 'Publish'
  | 'Conflict scan'
  | 'Simulation'
  | 'AI draft'
  | 'Restore'

export type RuleAuditEntry = {
  id: string
  ts: string
  actor: string
  action: RuleAuditAction
  detail: string
  ruleId?: string
  ruleName?: string
}

export type RuleItem = {
  id: string
  code: string
  name: string
  description: string
  category: RuleCategory
  scope: RuleScope
  matchMode: 'all' | 'any'
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: RulePriority
  status: RuleStatus
  schedule: RuleSchedule
  exceptions: RuleExceptions
  createdBy: string
  createdDate: string
  updatedDate: string
  aiGenerated?: boolean
  versions: RuleVersion[]
  audit: RuleAuditEntry[]
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

let seq = 0

export const nextRuleId = (prefix: string) => {
  seq += 1
  return `${prefix}-${seq}`
}

export const nowStamp = (): string => {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const todayStamp = (): string => nowStamp().slice(0, 10)

export const prettyDate = (iso: string): string => {
  if (!iso) return '—'
  const parts = iso.split('-')
  if (parts.length < 3) return iso
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = Number(parts[1]) - 1
  return `${parts[2]} ${months[monthIndex] ?? parts[1]} ${parts[0]}`
}

export const defaultSchedule = (): RuleSchedule => ({
  mode: 'Immediate',
  startDate: '',
  endDate: '',
  days: [1, 2, 3, 4, 5],
  startTime: '00:00',
  endTime: '23:59',
})

export const emptyExceptions = (): RuleExceptions => ({ customers: [], owners: [], machines: [], locations: [] })

export const scopeTargetOptions = (level: RuleScopeLevel): string[] => {
  if (level === 'Country') return countryNames
  if (level === 'City') return cityNames
  if (level === 'Owner') return ownerNames
  if (level === 'Customer') return ['Individual', 'SME', 'Enterprise', 'Government']
  if (level === 'Equipment') return equipmentTypes
  if (level === 'Rental') return rentalTypes
  return []
}

export const scopeLabel = (scope: RuleScope): string =>
  scope.level === 'Global' ? 'Global' : `${scope.level} · ${scope.target}`

export const describeCondition = (condition: RuleCondition): string => {
  const def = conditionFieldMap[condition.field]
  const label = def?.label ?? condition.field
  if (condition.operator === 'is_true') return `${label} is true`
  if (condition.operator === 'is_false') return `${label} is false`
  const operator = operatorLabels[condition.operator] ?? condition.operator
  const unit = def?.unit ? ` ${def.unit}` : ''
  if (condition.operator === 'in' || condition.operator === 'not_in') {
    return `${label} ${operator} ${condition.value}`
  }
  return `${label} ${operator} ${condition.value}${unit}`
}

export const describeAction = (action: RuleAction): string => {
  const base = actionLabel(action.type)
  if (action.type === 'block_booking') return base
  if (action.type === 'require_approval') return `${base} · ${action.approvalLevel ?? 'State Admin'}`
  if (action.type === 'require_documents') return `${base} · ${(action.documents ?? []).join(', ') || 'no documents selected'}`
  if (action.type === 'send_notification') return `${base} · ${action.channel ?? 'In-app'} · ${action.audience ?? 'Customer'}`
  const unit = action.unit === 'percent' ? '%' : '₹'
  const amount = (action.amount ?? 0).toLocaleString('en-IN')
  return action.unit === 'percent'
    ? `${base} · ${amount}% ${action.label ? `(${action.label})` : ''}`.trim()
    : `${base} · ${unit}${amount} ${action.label ? `(${action.label})` : ''}`.trim()
}

export const describeSchedule = (schedule: RuleSchedule): string => {
  if (schedule.mode === 'Immediate') return 'Starts immediately'
  if (schedule.mode === 'Scheduled') {
    const end = schedule.endDate ? ` → ${prettyDate(schedule.endDate)}` : ' → until changed'
    return `${prettyDate(schedule.startDate)}${end}`
  }
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const days = schedule.days.map((day) => dayLabels[day]).join(', ') || 'No days selected'
  return `Recurring · ${days} · ${schedule.startTime}-${schedule.endTime}`
}

export const exceptionSummary = (exceptions: RuleExceptions): string => {
  const total =
    exceptions.customers.length + exceptions.owners.length + exceptions.machines.length + exceptions.locations.length
  if (total === 0) return 'No exceptions'
  const parts: string[] = []
  if (exceptions.customers.length) parts.push(`${exceptions.customers.length} customer(s)`)
  if (exceptions.owners.length) parts.push(`${exceptions.owners.length} owner(s)`)
  if (exceptions.machines.length) parts.push(`${exceptions.machines.length} machine(s)`)
  if (exceptions.locations.length) parts.push(`${exceptions.locations.length} location(s)`)
  return parts.join(' · ')
}

/* ------------------------------------------------------------------ *
 * Simulation
 * ------------------------------------------------------------------ */

export type ConditionValue = string | number | boolean
export type SimulationValues = Record<ConditionFieldKey, ConditionValue>

export type SimulationContext = {
  customerName: string
  ownerName: string
  machineId: string
  values: SimulationValues
}

export const defaultSimulationContext = (): SimulationContext => ({
  customerName: 'Priya Deshmukh',
  ownerName: 'Srinivas Infra Rentals',
  machineId: 'EXC-2041',
  values: {
    equipmentType: 'Excavator',
    machineStatus: 'Operational',
    machineAgeYears: 4,
    machineRunningHours: 3120,
    rentalDurationDays: 10,
    rentalType: 'Self-operated (short term)',
    rentalDailyRate: 8500,
    rentalTotalValue: 85000,
    advanceNoticeHours: 12,
    city: 'Hyderabad',
    country: 'India',
    deliveryDistanceKm: 18,
    isWeekend: true,
    shiftWindow: 'Day (06:00-18:00)',
    bookingChannel: 'App',
    customerType: 'SME',
    customerKyc: 'Verified',
    priorCompletedBookings: 6,
    priorCancellations: 1,
    ownerCompliance: 'Compliant',
    operatorLicense: 'Valid',
    documentStatus: 'Complete',
    insuranceStatus: 'Valid',
    damageSeverity: 'None',
    lateReturnHours: 0,
    paymentStatus: 'Pending',
    paymentMethod: 'UPI',
  },
})

const toNumber = (value: ConditionValue): number => (typeof value === 'number' ? value : Number(value) || 0)
const toText = (value: ConditionValue): string => (typeof value === 'boolean' ? String(value) : String(value))

export const evaluateCondition = (
  condition: RuleCondition,
  ctx: SimulationContext,
): { matched: boolean; text: string } => {
  const def = conditionFieldMap[condition.field]
  const actual = ctx.values[condition.field]
  const label = def?.label ?? condition.field
  const unit = def?.unit ? ` ${def.unit}` : ''

  if (condition.operator === 'is_true') {
    return { matched: actual === true, text: `${label} is true (scenario: ${toText(actual)})` }
  }
  if (condition.operator === 'is_false') {
    return { matched: actual === false, text: `${label} is false (scenario: ${toText(actual)})` }
  }

  if (def?.type === 'number') {
    const left = toNumber(actual)
    const right = Number(condition.value) || 0
    let matched: boolean
    if (condition.operator === 'greater_than') matched = left > right
    else if (condition.operator === 'less_than') matched = left < right
    else if (condition.operator === 'at_least') matched = left >= right
    else if (condition.operator === 'at_most') matched = left <= right
    else matched = left === right
    return {
      matched,
      text: `${label} ${operatorLabels[condition.operator]} ${condition.value}${unit} (scenario: ${left}${unit})`,
    }
  }

  const actualText = toText(actual).toLowerCase()
  if (condition.operator === 'in' || condition.operator === 'not_in') {
    const list = condition.value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
    const inside = list.includes(actualText)
    return {
      matched: condition.operator === 'in' ? inside : !inside,
      text: `${label} ${operatorLabels[condition.operator]} ${condition.value} (scenario: ${toText(actual)})`,
    }
  }

  const expected = condition.value.trim().toLowerCase()
  const matched = condition.operator === 'is' ? actualText === expected : actualText !== expected
  return {
    matched,
    text: `${label} ${operatorLabels[condition.operator]} ${condition.value} (scenario: ${toText(actual)})`,
  }
}

export const evaluateScope = (rule: RuleItem, ctx: SimulationContext): { matched: boolean; text: string } => {
  const { level, target } = rule.scope
  if (level === 'Global') return { matched: true, text: 'Scope: Global (applies platform-wide)' }
  const actual =
    level === 'Country'
      ? toText(ctx.values.country)
      : level === 'City'
        ? toText(ctx.values.city)
        : level === 'Owner'
          ? ctx.ownerName
          : level === 'Customer'
            ? `${toText(ctx.values.customerType)} / ${ctx.customerName}`
            : level === 'Equipment'
              ? toText(ctx.values.equipmentType)
              : toText(ctx.values.rentalType)

  let matched: boolean
  if (level === 'Customer') {
    matched =
      toText(ctx.values.customerType).toLowerCase() === target.toLowerCase() ||
      ctx.customerName.toLowerCase() === target.toLowerCase()
  } else {
    matched = actual.toLowerCase() === target.toLowerCase()
  }
  return { matched, text: `Scope: ${level} · ${target} (scenario: ${actual})` }
}

export const evaluateException = (rule: RuleItem, ctx: SimulationContext): string | null => {
  const { exceptions } = rule
  if (exceptions.customers.some((item) => item.toLowerCase() === ctx.customerName.toLowerCase())) {
    return `Customer exception: ${ctx.customerName} is excluded`
  }
  if (exceptions.owners.some((item) => item.toLowerCase() === ctx.ownerName.toLowerCase())) {
    return `Owner exception: ${ctx.ownerName} is excluded`
  }
  if (exceptions.machines.some((item) => item.toLowerCase() === ctx.machineId.toLowerCase())) {
    return `Machine exception: ${ctx.machineId} is excluded`
  }
  if (exceptions.locations.some((item) => item.toLowerCase() === toText(ctx.values.city).toLowerCase())) {
    return `Location exception: ${toText(ctx.values.city)} is excluded`
  }
  return null
}

export type SimulationMatch = {
  ruleId: string
  ruleName: string
  code: string
  category: RuleCategory
  priority: RulePriority
  reasons: string[]
  actions: RuleAction[]
}

export type SimulationSkip = {
  ruleId: string
  ruleName: string
  reason: string
}

export type SimulationTotals = {
  base: number
  fees: number
  deposits: number
  discounts: number
  penalties: number
  payableAtBooking: number
}

export type SimulationOutcome = {
  matches: SimulationMatch[]
  skipped: SimulationSkip[]
  blocked: { ruleName: string; priority: RulePriority; reason: string }[]
  approvals: { ruleName: string; level: string }[]
  documents: { ruleName: string; items: string[] }[]
  notifications: { ruleName: string; detail: string }[]
  totals: SimulationTotals
}

export type SimulationOptions = {
  onlyRuleId?: string
  includeInactive?: boolean
}

const actionAmountInRupees = (action: RuleAction, base: number): number => {
  const amount = action.amount ?? 0
  if (action.unit === 'percent') return Math.round((base * amount) / 100)
  return amount
}

export const runSimulation = (
  rules: RuleItem[],
  ctx: SimulationContext,
  options: SimulationOptions = {},
): SimulationOutcome => {
  const base = toNumber(ctx.values.rentalTotalValue) || toNumber(ctx.values.rentalDailyRate) * toNumber(ctx.values.rentalDurationDays)

  const candidates = rules.filter((rule) => {
    if (rule.status === 'Archived') return false
    if (options.onlyRuleId) return rule.id === options.onlyRuleId
    if (options.includeInactive) return true
    return rule.status === 'Active'
  })

  const outcome: SimulationOutcome = {
    matches: [],
    skipped: [],
    blocked: [],
    approvals: [],
    documents: [],
    notifications: [],
    totals: { base, fees: 0, deposits: 0, discounts: 0, penalties: 0, payableAtBooking: 0 },
  }

  for (const rule of candidates) {
    const scope = evaluateScope(rule, ctx)
    if (!scope.matched) {
      outcome.skipped.push({ ruleId: rule.id, ruleName: rule.name, reason: scope.text })
      continue
    }

    const exceptionReason = evaluateException(rule, ctx)
    if (exceptionReason) {
      outcome.skipped.push({ ruleId: rule.id, ruleName: rule.name, reason: exceptionReason })
      continue
    }

    const results = rule.conditions.map((condition) => evaluateCondition(condition, ctx))
    const matched =
      rule.conditions.length === 0
        ? true
        : rule.matchMode === 'all'
          ? results.every((item) => item.matched)
          : results.some((item) => item.matched)

    if (!matched) {
      outcome.skipped.push({
        ruleId: rule.id,
        ruleName: rule.name,
        reason: `Conditions not met: ${results.filter((item) => !item.matched).map((item) => item.text).join(' · ')}`,
      })
      continue
    }

    outcome.matches.push({
      ruleId: rule.id,
      ruleName: rule.name,
      code: rule.code,
      category: rule.category,
      priority: rule.priority,
      reasons: [scope.text, ...results.map((item) => item.text)],
      actions: rule.actions,
    })

    for (const action of rule.actions) {
      if (action.type === 'add_fee') outcome.totals.fees += actionAmountInRupees(action, base)
      else if (action.type === 'add_deposit') outcome.totals.deposits += actionAmountInRupees(action, base)
      else if (action.type === 'apply_discount') outcome.totals.discounts += actionAmountInRupees(action, base)
      else if (action.type === 'apply_penalty') outcome.totals.penalties += actionAmountInRupees(action, base)
      else if (action.type === 'block_booking') {
        outcome.blocked.push({
          ruleName: rule.name,
          priority: rule.priority,
          reason: `${rule.code} · ${rule.name} blocks this booking`,
        })
      } else if (action.type === 'require_approval') {
        outcome.approvals.push({ ruleName: rule.name, level: action.approvalLevel ?? 'State Admin' })
      } else if (action.type === 'require_documents') {
        outcome.documents.push({ ruleName: rule.name, items: action.documents ?? [] })
      } else if (action.type === 'send_notification') {
        outcome.notifications.push({
          ruleName: rule.name,
          detail: `${action.channel ?? 'In-app'} to ${action.audience ?? 'Customer'}`,
        })
      }
    }
  }

  const { fees, deposits, discounts, penalties } = outcome.totals
  outcome.totals.payableAtBooking = Math.max(0, base + fees + deposits + penalties - discounts)
  return outcome
}

/* ------------------------------------------------------------------ *
 * Conflict detection
 * ------------------------------------------------------------------ */

export type ConflictKind = 'Overlapping conditions' | 'Contradictory actions' | 'Duplicate scope'

export type RuleConflict = {
  id: string
  kind: ConflictKind
  severity: 'High' | 'Medium' | 'Low'
  ruleAId: string
  ruleAName: string
  ruleBId: string
  ruleBName: string
  sharedFields: string[]
  summary: string
  suggestion: string
}

const scopeOverlaps = (a: RuleScope, b: RuleScope): boolean => {
  if (a.level === 'Global' || b.level === 'Global') return true
  if (a.level !== b.level) return false
  return a.target.toLowerCase() === b.target.toLowerCase()
}

const isCharge = (type: ActionType): boolean => type === 'add_fee' || type === 'add_deposit' || type === 'apply_penalty'

export const detectConflicts = (rules: RuleItem[]): RuleConflict[] => {
  const live = rules.filter((rule) => rule.status === 'Active' || rule.status === 'Scheduled')
  const conflicts: RuleConflict[] = []

  for (let i = 0; i < live.length; i += 1) {
    for (let j = i + 1; j < live.length; j += 1) {
      const ruleA = live[i]
      const ruleB = live[j]
      if (!scopeOverlaps(ruleA.scope, ruleB.scope)) continue

      const fieldsA = new Set(ruleA.conditions.map((condition) => condition.field))
      const shared = ruleB.conditions
        .map((condition) => condition.field)
        .filter((field) => fieldsA.has(field))
      if (shared.length === 0) continue

      const sharedLabels = shared.map((field) => conditionFieldMap[field]?.label ?? field)
      const sameCategory = ruleA.category === ruleB.category
      const sameScope = ruleA.scope.level === ruleB.scope.level && ruleA.scope.target === ruleB.scope.target
      const duplicateScope =
        sameCategory && sameScope && ruleA.conditions.length > 0 && ruleA.conditions.length === ruleB.conditions.length && shared.length === ruleA.conditions.length

      const chargesA = ruleA.actions.some((action) => isCharge(action.type))
      const chargesB = ruleB.actions.some((action) => isCharge(action.type))
      const discountsA = ruleA.actions.some((action) => action.type === 'apply_discount')
      const discountsB = ruleB.actions.some((action) => action.type === 'apply_discount')
      const contradictory = (chargesA && discountsB) || (chargesB && discountsA)

      const pairWeight =
        (ruleA.priority === 'Critical' || ruleB.priority === 'Critical')
          ? 'High'
          : (ruleA.priority === 'High' || ruleB.priority === 'High')
            ? 'Medium'
            : 'Low'

      if (duplicateScope) {
        conflicts.push({
          id: `${ruleA.id}:${ruleB.id}:duplicate`,
          kind: 'Duplicate scope',
          severity: pairWeight,
          ruleAId: ruleA.id,
          ruleAName: ruleA.name,
          ruleBId: ruleB.id,
          ruleBName: ruleB.name,
          sharedFields: sharedLabels,
          summary: `Both rules target ${scopeLabel(ruleA.scope)} in ${ruleA.category} with identical conditions (${sharedLabels.join(', ')}).`,
          suggestion: 'Merge the two rules or archive the older version so only one decision path remains.',
        })
      } else if (contradictory) {
        conflicts.push({
          id: `${ruleA.id}:${ruleB.id}:contradiction`,
          kind: 'Contradictory actions',
          severity: pairWeight,
          ruleAId: ruleA.id,
          ruleAName: ruleA.name,
          ruleBId: ruleB.id,
          ruleBName: ruleB.name,
          sharedFields: sharedLabels,
          summary: `${ruleA.name} and ${ruleB.name} both trigger on ${sharedLabels.join(', ')} but one adds a charge while the other applies a discount.`,
          suggestion: 'Set a clear priority order or scope one rule to a narrower segment so the outcomes cannot fight.',
        })
      } else {
        conflicts.push({
          id: `${ruleA.id}:${ruleB.id}:overlap`,
          kind: 'Overlapping conditions',
          severity: pairWeight,
          ruleAId: ruleA.id,
          ruleAName: ruleA.name,
          ruleBId: ruleB.id,
          ruleBName: ruleB.name,
          sharedFields: sharedLabels,
          summary: `Both rules fire on ${sharedLabels.join(', ')} within overlapping scopes (${scopeLabel(ruleA.scope)} and ${scopeLabel(ruleB.scope)}).`,
          suggestion:
            ruleA.priority === ruleB.priority
              ? 'Differentiate priorities so the higher priority rule wins during evaluation.'
              : 'Confirm the higher priority rule should always win, or narrow one of the scopes.',
        })
      }
    }
  }

  return conflicts
}

/* ------------------------------------------------------------------ *
 * AI rule generator (local, deterministic parsing)
 * ------------------------------------------------------------------ */

export type AiParsedRule = {
  name: string
  description: string
  category: RuleCategory
  scope: RuleScope
  matchMode: 'all' | 'any'
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: RulePriority
  confidence: number
  detected: string[]
  notes: string[]
}

export const aiExamplePrompts: string[] = [
  'For excavators rented for more than 7 days, require 15% security deposit and valid insurance.',
  'Block bookings in Hyderabad when payment is still pending, and notify the customer by SMS.',
  'Give enterprise customers a 10% discount on rentals over ₹100,000 booked 30 days in advance.',
  'Charge a ₹2,500 penalty when a machine is returned more than 4 hours late.',
]

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

const makeCondition = (field: ConditionFieldKey, operator: ConditionOperator, value: string): RuleCondition => ({
  id: nextRuleId('cond'),
  field,
  operator,
  value,
})

const makeAction = (type: ActionType, extra: Partial<RuleAction> = {}): RuleAction => ({
  id: nextRuleId('act'),
  type,
  ...extra,
})

export const parseRuleWithAI = (prompt: string): AiParsedRule => {
  const text = prompt.trim()
  const lower = text.toLowerCase()
  const detected: string[] = []
  const notes: string[] = []
  const conditions: RuleCondition[] = []
  const actions: RuleAction[] = []

  const noteIf = (condition: boolean, message: string) => {
    if (condition) notes.push(message)
  }

  /* --- equipment --- */
  const genericKeywords = ['excavator', 'crane', 'loader', 'bulldozer', 'forklift', 'dozer', 'boom lift', 'scissor lift', 'mixer', 'generator', 'compactor', 'dump truck', 'trolley', 'backhoe']
  const equipmentHit =
    equipmentTypes.find((type) => lower.includes(type.toLowerCase())) ??
    genericKeywords
      .map((keyword) => equipmentTypes.find((type) => type.toLowerCase().includes(keyword)))
      .find((type) => type !== undefined)
  if (equipmentHit) {
    conditions.push(makeCondition('equipmentType', 'is', equipmentHit))
    detected.push(`Equipment type: ${equipmentHit}`)
  }
  const resolvedEquipment = equipmentHit

  /* --- rental duration --- */
  const dayMatch = lower.match(/(\d+)\s*(?:\+\s*)?(?:day|days|week|weeks)/)
  if (dayMatch) {
    const unitIsWeek = lower.slice(dayMatch.index ?? 0, (dayMatch.index ?? 0) + dayMatch[0].length).includes('week')
    const amount = Number(dayMatch[1]) * (unitIsWeek ? 7 : 1)
    const clause = lower.slice(Math.max(0, (dayMatch.index ?? 0) - 40), (dayMatch.index ?? 0) + dayMatch[0].length)
    let operator: ConditionOperator = 'greater_than'
    if (/less than|under|below|shorter than|within|upto|up to/.test(clause)) operator = 'less_than'
    else if (/at least|minimum|no less than|or more/.test(clause)) operator = 'at_least'
    else if (/more than|over|above|longer than|greater than|exceed|beyond/.test(clause)) operator = 'greater_than'
    else if (/exactly|for only|of/.test(clause)) operator = 'equals'
    conditions.push(makeCondition('rentalDurationDays', operator, String(amount)))
    detected.push(`Rental duration: ${operatorLabels[operator]} ${amount} days`)
  }

  /* --- money thresholds --- */
  const rupeeMatch = text.match(/₹\s*([0-9][0-9,]*(?:\.[0-9]+)?)/)
  const percentMatch = lower.match(/(\d+(?:\.\d+)?)\s*%/)

  if (rupeeMatch && /over|more than|above|exceed|greater than|above|worth|value|total/.test(lower)) {
    const amount = Number(rupeeMatch[1].replace(/,/g, ''))
    conditions.push(makeCondition('rentalTotalValue', 'greater_than', String(amount)))
    detected.push(`Total rental value: > ₹${amount.toLocaleString('en-IN')}`)
  }

  /* --- actions --- */
  const depositPercent = lower.match(/(\d+(?:\.\d+)?)\s*%[^.]{0,40}(?:security\s+)?deposit|deposit[^.]{0,40}?(\d+(?:\.\d+)?)\s*%/)
  if (depositPercent) {
    const raw = depositPercent[1] ?? depositPercent[2] ?? '0'
    actions.push(makeAction('add_deposit', { unit: 'percent', amount: Number(raw), label: 'Security deposit' }))
    detected.push(`Action: require ${raw}% security deposit`)
  } else if (/security\s+deposit|deposit/.test(lower)) {
    const flat = rupeeMatch ? Number(rupeeMatch[1].replace(/,/g, '')) : 0
    actions.push(
      makeAction('add_deposit', flat ? { unit: 'flat', amount: flat, label: 'Security deposit' } : { unit: 'percent', amount: 10, label: 'Security deposit' }),
    )
    detected.push(flat ? `Action: require ₹${flat.toLocaleString('en-IN')} security deposit` : 'Action: require security deposit (default 10%)')
    if (!rupeeMatch && !percentMatch) notes.push('No deposit amount was found — a 10% default was inserted for review.')
  }

  const discountPercent = lower.match(/(\d+(?:\.\d+)?)\s*%\s*discount|discount(?:\s\w+){0,3}\s(?:of\s|at\s)?(\d+(?:\.\d+)?)\s*%/)
  if (discountPercent) {
    const raw = discountPercent[1] ?? discountPercent[2] ?? '0'
    actions.push(makeAction('apply_discount', { unit: 'percent', amount: Number(raw), label: 'Volume discount' }))
    detected.push(`Action: ${raw}% discount`)
  }

  if (/penalt|fine|charge extra|surcharge/.test(lower) && !actions.some((action) => action.type === 'apply_penalty')) {
    const amount = rupeeMatch ? Number(rupeeMatch[1].replace(/,/g, '')) : 0
    const percent = percentMatch ? Number(percentMatch[1]) : 0
    actions.push(
      percent
        ? makeAction('apply_penalty', { unit: 'percent', amount: percent, label: 'Rule penalty' })
        : makeAction('apply_penalty', { unit: 'flat', amount: amount || 2000, label: 'Rule penalty' }),
    )
    detected.push('Action: apply penalty')
    if (!amount && !percent) notes.push('No penalty amount was found — a ₹2,000 default was inserted for review.')
  }

  if (/block|do not allow|not allow|disallow|reject|stop the booking|prevent/.test(lower)) {
    actions.push(makeAction('block_booking'))
    detected.push('Action: block booking')
  }

  if (/approv|escalat|sign[ -]?off|authoris|authoriz/.test(lower)) {
    let level = 'State Admin'
    if (/super\s*admin/.test(lower)) level = 'Super Admin'
    else if (/city\s*admin/.test(lower)) level = 'City Admin'
    else if (/finance/.test(lower)) level = 'Finance Admin'
    actions.push(makeAction('require_approval', { approvalLevel: level }))
    detected.push(`Action: require approval (${level})`)
  }

  if (/document|paperwork|proof|certificat|licence|license|kyc/.test(lower)) {
    const docs: string[] = []
    if (/insurance/.test(lower)) docs.push('Insurance Certificate')
    if (/licen[cs]e/.test(lower)) docs.push('Operator License')
    if (/fitness|rc\b|registration/.test(lower)) docs.push('Fitness Certificate')
    if (/kyc|id proof|identity/.test(lower)) docs.push('ID Proof')
    if (/ownership/.test(lower)) docs.push('Ownership Proof')
    const recognised = docs.length > 0
    if (!recognised) docs.push('ID Proof', 'Insurance Certificate')
    actions.push(makeAction('require_documents', { documents: docs }))
    detected.push(`Action: require documents (${docs.join(', ')})`)
    if (!recognised) notes.push('No specific document was named — ID Proof and Insurance Certificate were added.')
  } else if (/insurance/.test(lower)) {
    const docs = ['Insurance Certificate']
    actions.push(makeAction('require_documents', { documents: docs }))
    detected.push('Action: require insurance certificate')
  }

  if (/notif|alert|notify|sms|email|push|in-app/.test(lower)) {
    let channel = 'In-app'
    if (/\bsms\b/.test(lower)) channel = 'SMS'
    else if (/email/.test(lower)) channel = 'Email'
    else if (/push/.test(lower)) channel = 'Push'
    let audience = 'Customer'
    if (/owner|partner/.test(lower) && !/customer/.test(lower)) audience = 'Owner'
    else if (/operator|driver/.test(lower)) audience = 'Operator'
    else if (/both|all|parties/.test(lower)) audience = 'All parties'
    actions.push(makeAction('send_notification', { channel, audience }))
    detected.push(`Action: notify via ${channel} (${audience})`)
  }

  /* --- condition-only signals --- */
  if (/valid insurance|insurance.{0,20}(valid|active)|insured/.test(lower)) {
    conditions.push(makeCondition('insuranceStatus', 'is', 'Valid'))
    detected.push('Insurance status must be Valid')
  } else if (/no insurance|without insurance|uninsured/.test(lower)) {
    conditions.push(makeCondition('insuranceStatus', 'is_not', 'Valid'))
    detected.push('Insurance status is not Valid')
  }

  const cityHit = cityNames.find((city) => lower.includes(city.toLowerCase()))
  if (cityHit) {
    conditions.push(makeCondition('city', 'is', cityHit))
    detected.push(`City: ${cityHit}`)
  }

  const countryHit = countryNames.find((country) => lower.includes(country.toLowerCase()))
  if (countryHit && !cityHit) {
    conditions.push(makeCondition('country', 'is', countryHit))
    detected.push(`Country: ${countryHit}`)
  }

  const customerTypeHit = (['Individual', 'SME', 'Enterprise', 'Government'] as string[]).find((type) =>
    lower.includes(type.toLowerCase()),
  )
  if (customerTypeHit) {
    conditions.push(makeCondition('customerType', 'is', customerTypeHit))
    detected.push(`Customer type: ${customerTypeHit}`)
  }

  if (/weekend|saturday|sunday|public holiday|holiday/.test(lower)) {
    conditions.push(makeCondition('isWeekend', 'is_true', 'true'))
    detected.push('Weekend / holiday = true')
  }

  if (/pending payment|payment is pending|unpaid|before payment|payment.{0,15}pending/.test(lower)) {
    conditions.push(makeCondition('paymentStatus', 'is', 'Pending'))
    detected.push('Payment status: Pending')
  } else if (/\bpaid\b|payment confirmed|after payment/.test(lower)) {
    conditions.push(makeCondition('paymentStatus', 'is', 'Paid'))
    detected.push('Payment status: Paid')
  }

  const lateMatch = lower.match(/(\d+)\s*(?:hour|hours|hr|hrs)[^.]{0,30}(?:late|return)|(?:late|return)[^.]{0,30}?(\d+)\s*(?:hour|hours|hr|hrs)/)
  if (lateMatch || /late return|returned late|overdue/.test(lower)) {
    const hours = lateMatch ? Number(lateMatch[1] ?? lateMatch[2]) : 4
    conditions.push(makeCondition('lateReturnHours', 'greater_than', String(hours)))
    detected.push(`Late return > ${hours} hrs`)
  }

  if (/maintenance|under repair|service due/.test(lower)) {
    conditions.push(makeCondition('machineStatus', 'is', 'In Maintenance'))
    detected.push('Machine status: In Maintenance')
  }

  if (/partner api|api channel|partner channel/.test(lower)) {
    conditions.push(makeCondition('bookingChannel', 'is', 'Partner API'))
    detected.push('Booking channel: Partner API')
  }

  if (/expired license|license expired|licence expired/.test(lower)) {
    conditions.push(makeCondition('operatorLicense', 'is', 'Expired'))
    detected.push('Operator license: Expired')
  }

  /* --- scope --- */
  let scope: RuleScope = { level: 'Global', target: '' }
  if (cityHit) scope = { level: 'City', target: cityHit }
  else if (countryHit) scope = { level: 'Country', target: countryHit }
  else if (customerTypeHit) scope = { level: 'Customer', target: customerTypeHit }
  else if (resolvedEquipment && conditions.every((condition) => condition.field !== 'equipmentType')) {
    scope = { level: 'Equipment', target: resolvedEquipment }
  }
  if (scope.level !== 'Global') detected.push(`Scope: ${scopeLabel(scope)}`)

  /* --- category --- */
  let category: RuleCategory = 'Pricing'
  if (/security deposit|deposit/.test(lower)) category = 'Security Deposit'
  else if (/cancel/.test(lower)) category = 'Booking & Cancellation'
  else if (/penalt|fine/.test(lower)) category = 'Penalties'
  else if (/late|overdue|return/.test(lower)) category = 'Late Return'
  else if (/damage|loss|theft/.test(lower)) category = 'Damage & Loss'
  else if (/insurance/.test(lower)) category = 'Insurance'
  else if (/licen[cs]e|operator/.test(lower)) category = 'Operator License'
  else if (/document|paperwork|kyc proof|certificat/.test(lower)) category = 'Machine Documents'
  else if (/maintenance|service due|repair/.test(lower)) category = 'Maintenance'
  else if (/safety|helmet|induction/.test(lower)) category = 'Safety'
  else if (/deliver|pickup|drop/.test(lower)) category = 'Delivery & Pickup'
  else if (/restricted|prohibited|ban|blacklist/.test(lower)) category = 'Location Restrictions'
  else if (/compliance|suspend|kyc/.test(lower)) category = 'Owner/Customer Compliance'
  else if (/commission/.test(lower)) category = 'Platform Commission'
  else if (/payment|paid|upi|refund/.test(lower)) category = 'Payment'
  else if (/price|rate|discount|surcharge|fee/.test(lower)) category = 'Pricing'
  else if (/block|booking|notice|advance/.test(lower)) category = 'Booking & Cancellation'
  detected.push(`Category: ${category}`)

  /* --- priority --- */
  let priority: RulePriority
  if (/block|ban|prohibit|critical|must|illegal|blacklist/.test(lower)) priority = 'Critical'
  else if (/deposit|penalt|damage|insurance|licen[cs]e|approval/.test(lower)) priority = 'High'
  else if (/discount|surcharge|notification|inform/.test(lower)) priority = 'Low'
  else priority = 'Medium'
  detected.push(`Priority: ${priority}`)

  if (conditions.length === 0) {
    conditions.push(makeCondition('equipmentType', 'is', 'Excavator'))
    notes.push('No clear condition was recognised — an Equipment type condition was added as a placeholder.')
  }
  if (actions.length === 0) {
    actions.push(makeAction('send_notification', { channel: 'In-app', audience: 'Customer' }))
    notes.push('No action was recognised — a notification action was added so the rule does nothing harmful by default.')
  }

  const nameSource = text.replace(/\s+/g, ' ').replace(/[.!?]+$/, '')
  const name = nameSource.length > 78 ? `${nameSource.slice(0, 75)}...` : titleCase(nameSource)

  noteIf(scope.level === 'Global' && !cityHit && !countryHit, 'No location detected — rule will default to Global scope.')
  noteIf(!/%|₹/.test(text), 'No amount detected — review the action values before publishing.')

  const confidence = Math.max(38, Math.min(96, 34 + detected.length * 7 - notes.length * 6))

  return {
    name,
    description: `Generated from AI prompt: "${text}"`,
    category,
    scope,
    matchMode: 'all',
    conditions,
    actions,
    priority,
    confidence,
    detected,
    notes,
  }
}

/* ------------------------------------------------------------------ *
 * Seed rules
 * ------------------------------------------------------------------ */

const cond = (field: ConditionFieldKey, operator: ConditionOperator, value: string): RuleCondition => ({
  id: nextRuleId('cond'),
  field,
  operator,
  value,
})

const act = (type: ActionType, extra: Partial<RuleAction> = {}): RuleAction => ({
  id: nextRuleId('act'),
  type,
  ...extra,
})

const audit = (
  ruleId: string,
  ruleName: string,
  ts: string,
  action: RuleAuditAction,
  detail: string,
  actor = 'Diya Reddy',
): RuleAuditEntry => ({ id: nextRuleId('aud'), ts, actor, action, detail, ruleId, ruleName })

type SeedInput = {
  code: string
  name: string
  description: string
  category: RuleCategory
  scope?: RuleScope
  matchMode?: 'all' | 'any'
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: RulePriority
  status: RuleStatus
  schedule?: Partial<RuleSchedule>
  exceptions?: Partial<RuleExceptions>
  createdBy?: string
  createdDate: string
  updatedDate: string
  aiGenerated?: boolean
  versions: RuleVersion[]
  audit: RuleAuditEntry[]
}

const buildRule = (input: SeedInput): RuleItem => ({
  id: nextRuleId('rule'),
  code: input.code,
  name: input.name,
  description: input.description,
  category: input.category,
  scope: input.scope ?? { level: 'Global', target: '' },
  matchMode: input.matchMode ?? 'all',
  conditions: input.conditions,
  actions: input.actions,
  priority: input.priority,
  status: input.status,
  schedule: { ...defaultSchedule(), ...input.schedule },
  exceptions: { ...emptyExceptions(), ...input.exceptions },
  createdBy: input.createdBy ?? 'Diya Reddy',
  createdDate: input.createdDate,
  updatedDate: input.updatedDate,
  aiGenerated: input.aiGenerated,
  versions: input.versions,
  audit: input.audit,
})

const version = (
  number: number,
  date: string,
  summary: string,
  status: RuleStatus,
  actor = 'Diya Reddy',
): RuleVersion => ({ version: number, date, actor, summary, status })

export const initialRulesData: RuleItem[] = [
  buildRule({
    code: 'GLR-001',
    name: 'Long-haul excavator security deposit',
    description: 'Excavators booked for more than 7 days must collect a 15% refundable security deposit before confirmation.',
    category: 'Security Deposit',
    conditions: [cond('equipmentType', 'is', 'Excavator'), cond('rentalDurationDays', 'greater_than', '7')],
    actions: [act('add_deposit', { unit: 'percent', amount: 15, label: 'Security deposit' })],
    priority: 'Critical',
    status: 'Active',
    createdDate: '2026-07-14',
    updatedDate: '2026-09-30',
    versions: [
      version(1, '2026-07-14', 'Rule created for excavator fleet pilot', 'Draft'),
      version(2, '2026-08-02', 'Deposit raised from 10% to 15% after damage review', 'Active'),
      version(3, '2026-09-30', 'Scope widened from 3 cities to Global', 'Active', 'Aarav Mehta'),
    ],
    audit: [
      audit('GLR-001', 'Long-haul excavator security deposit', '2026-09-30 11:04', 'Edit', 'Scope changed from City to Global'),
      audit('GLR-001', 'Long-haul excavator security deposit', '2026-08-02 09:22', 'Activate', 'Published version 2 (deposit 15%)'),
      audit('GLR-001', 'Long-haul excavator security deposit', '2026-07-14 16:40', 'Create', 'Rule created from deposit template'),
    ],
  }),
  buildRule({
    code: 'GLR-002',
    name: 'Excavator loyalty discount for long rentals',
    description: 'Reward repeat long rentals on excavators with a 10% discount applied to the rental total.',
    category: 'Pricing',
    conditions: [cond('equipmentType', 'is', 'Excavator'), cond('rentalDurationDays', 'greater_than', '7')],
    actions: [act('apply_discount', { unit: 'percent', amount: 10, label: 'Loyalty discount' })],
    priority: 'Medium',
    status: 'Active',
    createdDate: '2026-08-21',
    updatedDate: '2026-09-18',
    versions: [
      version(1, '2026-08-21', 'Loyalty discount pilot created', 'Draft'),
      version(2, '2026-09-18', 'Activated after finance sign-off', 'Active'),
    ],
    audit: [
      audit('GLR-002', 'Excavator loyalty discount for long rentals', '2026-09-18 14:15', 'Activate', 'Rule activated platform-wide'),
      audit('GLR-002', 'Excavator loyalty discount for long rentals', '2026-08-21 10:02', 'Create', 'Rule created from pricing template'),
    ],
  }),
  buildRule({
    code: 'GLR-003',
    name: 'Hyderabad weekend demand surge',
    description: 'Apply an 8% demand surcharge on all rentals starting on weekends inside Hyderabad city limits.',
    category: 'Pricing',
    scope: { level: 'City', target: 'Hyderabad' },
    conditions: [cond('isWeekend', 'is_true', 'true')],
    actions: [act('add_fee', { unit: 'percent', amount: 8, label: 'Weekend demand surcharge' })],
    priority: 'High',
    status: 'Active',
    schedule: { mode: 'Scheduled', startDate: '2026-10-01', endDate: '2027-03-31' },
    createdDate: '2026-09-12',
    updatedDate: '2026-10-01',
    versions: [
      version(1, '2026-09-12', 'Weekend surge drafted for Hyderabad', 'Draft'),
      version(2, '2026-10-01', 'Scheduled for festive quarter', 'Scheduled'),
      version(3, '2026-10-02', 'Activated after schedule start', 'Active'),
    ],
    audit: [
      audit('GLR-003', 'Hyderabad weekend demand surge', '2026-10-02 00:15', 'Activate', 'Schedule window opened'),
      audit('GLR-003', 'Hyderabad weekend demand surge', '2026-10-01 18:30', 'Schedule', 'Window set 01 Oct 2026 → 31 Mar 2027'),
      audit('GLR-003', 'Hyderabad weekend demand surge', '2026-09-12 12:44', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-004',
    name: 'High-value rental loyalty discount',
    description: 'Enterprise customers get 5% off when the total rental value crosses ₹1,00,000.',
    category: 'Pricing',
    scope: { level: 'Customer', target: 'Enterprise' },
    conditions: [cond('rentalTotalValue', 'greater_than', '100000')],
    actions: [act('apply_discount', { unit: 'percent', amount: 5, label: 'High-value loyalty' })],
    priority: 'Low',
    status: 'Active',
    createdDate: '2026-06-30',
    updatedDate: '2026-09-05',
    versions: [version(1, '2026-06-30', 'Enterprise loyalty program v1', 'Active')],
    audit: [
      audit('GLR-004', 'High-value rental loyalty discount', '2026-09-05 09:10', 'Edit', 'Threshold raised from ₹80,000 to ₹1,00,000'),
      audit('GLR-004', 'High-value rental loyalty discount', '2026-06-30 15:05', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-005',
    name: 'Short-notice booking blackout',
    description: 'Block any booking starting in less than 6 hours so dispatch and safety checks can complete.',
    category: 'Booking & Cancellation',
    conditions: [cond('advanceNoticeHours', 'less_than', '6')],
    actions: [act('block_booking')],
    priority: 'High',
    status: 'Active',
    createdDate: '2026-05-18',
    updatedDate: '2026-05-18',
    versions: [version(1, '2026-05-18', 'Safety buffer enforced', 'Active')],
    audit: [audit('GLR-005', 'Short-notice booking blackout', '2026-05-18 08:00', 'Create', 'Rule created and activated')],
  }),
  buildRule({
    code: 'GLR-006',
    name: 'High-value cancellation handling fee',
    description: 'Bookings above ₹50,000 carry a flat ₹2,500 handling fee when cancelled inside the free window.',
    category: 'Booking & Cancellation',
    conditions: [cond('rentalTotalValue', 'greater_than', '50000')],
    actions: [act('add_fee', { unit: 'flat', amount: 2500, label: 'Cancellation handling fee' })],
    priority: 'Medium',
    status: 'Active',
    createdDate: '2026-06-11',
    updatedDate: '2026-08-19',
    versions: [
      version(1, '2026-06-11', 'Handling fee introduced', 'Active'),
      version(2, '2026-08-19', 'Fee raised from ₹1,500 to ₹2,500', 'Active'),
    ],
    audit: [
      audit('GLR-006', 'High-value cancellation handling fee', '2026-08-19 13:26', 'Edit', 'Fee amount updated'),
      audit('GLR-006', 'High-value cancellation handling fee', '2026-06-11 11:11', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-007',
    name: 'Unpaid bookings cannot be confirmed',
    description: 'Requests with pending payment are blocked from confirmation and the customer is notified automatically.',
    category: 'Payment',
    conditions: [cond('paymentStatus', 'is', 'Pending')],
    actions: [
      act('block_booking'),
      act('send_notification', { channel: 'SMS', audience: 'Customer' }),
    ],
    priority: 'Critical',
    status: 'Active',
    createdDate: '2026-04-27',
    updatedDate: '2026-04-27',
    versions: [version(1, '2026-04-27', 'Payment gate enforced', 'Active')],
    audit: [audit('GLR-007', 'Unpaid bookings cannot be confirmed', '2026-04-27 10:30', 'Create', 'Rule created and activated')],
  }),
  buildRule({
    code: 'GLR-008',
    name: 'Late return grace period penalty',
    description: 'After a 2-hour grace period, charge a flat ₹1,500 penalty for every late return.',
    category: 'Late Return',
    conditions: [cond('lateReturnHours', 'greater_than', '2')],
    actions: [act('apply_penalty', { unit: 'flat', amount: 1500, label: 'Late return penalty' })],
    priority: 'Medium',
    status: 'Active',
    createdDate: '2026-05-02',
    updatedDate: '2026-07-21',
    versions: [
      version(1, '2026-05-02', 'Grace period 1 hour', 'Active'),
      version(2, '2026-07-21', 'Grace period extended to 2 hours', 'Active'),
    ],
    audit: [
      audit('GLR-008', 'Late return grace period penalty', '2026-07-21 17:45', 'Edit', 'Grace period changed to 2 hours'),
      audit('GLR-008', 'Late return grace period penalty', '2026-05-02 09:55', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-009',
    name: 'Major damage excess recovery',
    description: 'Recover a ₹25,000 excess from the customer when a returned machine reports major damage.',
    category: 'Damage & Loss',
    conditions: [cond('damageSeverity', 'is', 'Major')],
    actions: [act('add_fee', { unit: 'flat', amount: 25000, label: 'Damage excess' })],
    priority: 'High',
    status: 'Active',
    createdDate: '2026-03-15',
    updatedDate: '2026-03-15',
    versions: [version(1, '2026-03-15', 'Damage recovery policy v1', 'Active')],
    audit: [audit('GLR-009', 'Major damage excess recovery', '2026-03-15 14:02', 'Create', 'Rule created')],
  }),
  buildRule({
    code: 'GLR-010',
    name: 'Insurance validity gate',
    description: 'Rentals without valid insurance must upload a certificate and get state admin approval.',
    category: 'Insurance',
    conditions: [cond('insuranceStatus', 'in', 'Expired, Not Purchased')],
    actions: [
      act('require_documents', { documents: ['Insurance Certificate'] }),
      act('require_approval', { approvalLevel: 'State Admin' }),
    ],
    priority: 'High',
    status: 'Active',
    createdDate: '2026-02-24',
    updatedDate: '2026-09-11',
    versions: [
      version(1, '2026-02-24', 'Insurance gate introduced', 'Active'),
      version(2, '2026-09-11', 'Approval added for expired policies', 'Active'),
    ],
    audit: [
      audit('GLR-010', 'Insurance validity gate', '2026-09-11 16:20', 'Edit', 'Approval action appended'),
      audit('GLR-010', 'Insurance validity gate', '2026-02-24 10:05', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-011',
    name: 'Operator license compliance block',
    description: 'Block any booking where the assigned operator licence has expired.',
    category: 'Operator License',
    conditions: [cond('operatorLicense', 'is', 'Expired')],
    actions: [act('block_booking'), act('send_notification', { channel: 'Push', audience: 'Owner' })],
    priority: 'High',
    status: 'Active',
    createdDate: '2026-01-30',
    updatedDate: '2026-01-30',
    versions: [version(1, '2026-01-30', 'Licence block enforced', 'Active')],
    audit: [audit('GLR-011', 'Operator license compliance block', '2026-01-30 12:00', 'Create', 'Rule created')],
  }),
  buildRule({
    code: 'GLR-012',
    name: 'Missing machine document hold',
    description: 'Machines with missing paperwork must present fitness and ownership proof before dispatch.',
    category: 'Machine Documents',
    conditions: [cond('documentStatus', 'is', 'Missing')],
    actions: [act('require_documents', { documents: ['Fitness Certificate', 'Ownership Proof'] })],
    priority: 'Medium',
    status: 'Active',
    createdDate: '2026-02-09',
    updatedDate: '2026-08-08',
    versions: [version(1, '2026-02-09', 'Document hold created', 'Active')],
    audit: [audit('GLR-012', 'Missing machine document hold', '2026-02-09 11:45', 'Create', 'Rule created')],
  }),
  buildRule({
    code: 'GLR-013',
    name: 'Maintenance window booking blackout',
    description: 'Machines flagged under maintenance cannot be booked until service sign-off is recorded.',
    category: 'Maintenance',
    conditions: [cond('machineStatus', 'is', 'In Maintenance')],
    actions: [act('block_booking')],
    priority: 'Critical',
    status: 'Scheduled',
    schedule: { mode: 'Scheduled', startDate: '2026-11-15' },
    createdDate: '2026-10-02',
    updatedDate: '2026-10-06',
    versions: [
      version(1, '2026-10-02', 'Blackout drafted', 'Draft'),
      version(2, '2026-10-06', 'Scheduled for 15 Nov 2026', 'Scheduled'),
    ],
    audit: [
      audit('GLR-013', 'Maintenance window booking blackout', '2026-10-06 15:12', 'Schedule', 'Effective 15 Nov 2026'),
      audit('GLR-013', 'Maintenance window booking blackout', '2026-10-02 09:31', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-014',
    name: 'Night shift safety induction',
    description: 'Night shift rentals require a signed safety induction and an in-app reminder to the operator.',
    category: 'Safety',
    conditions: [cond('shiftWindow', 'is', 'Night (18:00-06:00)')],
    actions: [
      act('require_documents', { documents: ['Safety Induction Acknowledgement'] }),
      act('send_notification', { channel: 'In-app', audience: 'Operator' }),
    ],
    priority: 'Medium',
    status: 'Draft',
    createdDate: '2026-10-04',
    updatedDate: '2026-10-07',
    versions: [
      version(1, '2026-10-04', 'Draft from safety review', 'Draft'),
      version(2, '2026-10-07', 'Notification action added', 'Draft'),
    ],
    audit: [
      audit('GLR-014', 'Night shift safety induction', '2026-10-07 18:05', 'Edit', 'Notification action appended'),
      audit('GLR-014', 'Night shift safety induction', '2026-10-04 13:40', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-015',
    name: 'Remote delivery surcharge',
    description: 'Deliveries beyond 40 km in Bengaluru carry a flat ₹1,200 logistics surcharge.',
    category: 'Delivery & Pickup',
    scope: { level: 'City', target: 'Bengaluru' },
    conditions: [cond('deliveryDistanceKm', 'greater_than', '40')],
    actions: [act('add_fee', { unit: 'flat', amount: 1200, label: 'Remote delivery surcharge' })],
    priority: 'Low',
    status: 'Active',
    createdDate: '2026-07-03',
    updatedDate: '2026-07-03',
    versions: [version(1, '2026-07-03', 'Remote delivery fee live', 'Active')],
    audit: [audit('GLR-015', 'Remote delivery surcharge', '2026-07-03 10:20', 'Create', 'Rule created and activated')],
  }),
  buildRule({
    code: 'GLR-016',
    name: 'Warangal rollout restriction',
    description: 'Bookings in Warangal stay paused until city launch readiness is confirmed by operations.',
    category: 'Location Restrictions',
    scope: { level: 'City', target: 'Warangal' },
    conditions: [],
    actions: [act('block_booking')],
    priority: 'High',
    status: 'Paused',
    exceptions: { locations: ['Warangal Industrial Belt'] },
    createdDate: '2026-06-19',
    updatedDate: '2026-09-27',
    versions: [
      version(1, '2026-06-19', 'City restriction enabled', 'Active'),
      version(2, '2026-09-27', 'Paused ahead of pilot reopening', 'Paused'),
    ],
    audit: [
      audit('GLR-016', 'Warangal rollout restriction', '2026-09-27 19:02', 'Pause', 'Paused for pilot reopening'),
      audit('GLR-016', 'Warangal rollout restriction', '2026-06-19 09:44', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-017',
    name: 'Owner document compliance hold',
    description: 'Owners with documents due are routed to city admin approval until compliance is restored.',
    category: 'Owner/Customer Compliance',
    conditions: [cond('ownerCompliance', 'is', 'Documents Due')],
    actions: [act('require_approval', { approvalLevel: 'City Admin' })],
    priority: 'Medium',
    status: 'Active',
    createdDate: '2026-04-08',
    updatedDate: '2026-08-30',
    versions: [version(1, '2026-04-08', 'Compliance hold v1', 'Active')],
    audit: [audit('GLR-017', 'Owner document compliance hold', '2026-04-08 11:35', 'Create', 'Rule created')],
  }),
  buildRule({
    code: 'GLR-018',
    name: 'Repeat cancellation penalty ladder',
    description: 'Customers with 3 or more past cancellations pay a ₹3,000 repeat-offender penalty.',
    category: 'Penalties',
    conditions: [cond('priorCancellations', 'at_least', '3')],
    actions: [act('apply_penalty', { unit: 'flat', amount: 3000, label: 'Repeat cancellation penalty' })],
    priority: 'High',
    status: 'Scheduled',
    schedule: { mode: 'Scheduled', startDate: '2026-11-01' },
    createdDate: '2026-09-25',
    updatedDate: '2026-10-05',
    versions: [
      version(1, '2026-09-25', 'Penalty ladder drafted', 'Draft'),
      version(2, '2026-10-05', 'Scheduled for 01 Nov 2026', 'Scheduled'),
    ],
    audit: [
      audit('GLR-018', 'Repeat cancellation penalty ladder', '2026-10-05 10:48', 'Schedule', 'Effective 01 Nov 2026'),
      audit('GLR-018', 'Repeat cancellation penalty ladder', '2026-09-25 16:15', 'Create', 'Rule created'),
    ],
  }),
  buildRule({
    code: 'GLR-019',
    name: 'Partner API commission uplift',
    description: 'Bookings arriving through partner APIs carry a 4% platform commission uplift.',
    category: 'Platform Commission',
    conditions: [cond('bookingChannel', 'is', 'Partner API')],
    actions: [act('add_fee', { unit: 'percent', amount: 4, label: 'Commission uplift' })],
    priority: 'Medium',
    status: 'Active',
    createdDate: '2026-05-29',
    updatedDate: '2026-09-14',
    versions: [version(1, '2026-05-29', 'Partner uplift v1', 'Active')],
    audit: [audit('GLR-019', 'Partner API commission uplift', '2026-05-29 14:58', 'Create', 'Rule created')],
  }),
  buildRule({
    code: 'GLR-020',
    name: 'Festive weekend surge pricing',
    description: 'Archived festive season rule that added a 5% weekend surcharge during the 2025 holiday period.',
    category: 'Pricing',
    conditions: [cond('isWeekend', 'is_true', 'true')],
    actions: [act('add_fee', { unit: 'percent', amount: 5, label: 'Festive surge' })],
    priority: 'Low',
    status: 'Archived',
    schedule: { mode: 'Scheduled', startDate: '2025-10-10', endDate: '2026-01-15' },
    createdDate: '2025-10-01',
    updatedDate: '2026-01-16',
    versions: [
      version(1, '2025-10-01', 'Festive surge created', 'Active'),
      version(2, '2026-01-16', 'Archived after season end', 'Archived'),
    ],
    audit: [
      audit('GLR-020', 'Festive weekend surge pricing', '2026-01-16 08:20', 'Archive', 'Archived after season end'),
      audit('GLR-020', 'Festive weekend surge pricing', '2025-10-01 09:00', 'Create', 'Rule created'),
    ],
  }),
]

export const initialRuleAuditLog: RuleAuditEntry[] = [
  {
    id: nextRuleId('aud'),
    ts: '2026-10-08 07:40',
    actor: 'Policy Engine',
    action: 'Conflict scan',
    detail: 'Nightly conflict scan completed across 20 live and scheduled rules.',
  },
  {
    id: nextRuleId('aud'),
    ts: '2026-10-07 21:15',
    actor: 'Aarav Mehta',
    action: 'Edit',
    detail: 'Approval limits for finance admins updated in parallel policy set.',
  },
  {
    id: nextRuleId('aud'),
    ts: '2026-10-06 15:12',
    actor: 'Policy Engine',
    action: 'Simulation',
    detail: 'Regression simulation run: 500 synthetic bookings, 0 unexpected blocks.',
  },
  {
    id: nextRuleId('aud'),
    ts: '2026-10-03 11:02',
    actor: 'Diya Reddy',
    action: 'Restore',
    detail: 'Archived rule GLR-016 restored to paused state after review.',
  },
  {
    id: nextRuleId('aud'),
    ts: '2026-09-30 11:04',
    actor: 'Aarav Mehta',
    action: 'Edit',
    detail: 'GLR-001 scope widened from City to Global.',
  },
  {
    id: nextRuleId('aud'),
    ts: '2026-09-27 19:02',
    actor: 'Kiran Rao',
    action: 'Pause',
    detail: 'GLR-016 paused for Warangal pilot reopening.',
  },
]
