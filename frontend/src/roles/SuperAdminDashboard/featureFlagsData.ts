export type FeatureFlag = {
  id: string
  name: string
  description: string
  enabled: boolean
  scope: string
  effectiveDate: string
}

export const flagScopeOptions = [
  'Global',
  'All cities',
  'Pilot cities',
  'Select cities',
  'Partner pilots',
  'Internal testers',
]

export const initialFeatureFlags: FeatureFlag[] = [
  {
    id: 'online-booking',
    name: 'Online Booking',
    description: 'Customers can browse machines and request bookings directly from the app.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-01-01',
  },
  {
    id: 'instant-booking',
    name: 'Instant Booking',
    description: 'Bookings confirm immediately without waiting for owner acceptance.',
    enabled: false,
    scope: 'Pilot cities',
    effectiveDate: '2026-11-01',
  },
  {
    id: 'owner-approval',
    name: 'Owner Approval',
    description: 'Owners must approve each booking request before the machine is dispatched.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-01-01',
  },
  {
    id: 'customer-kyc',
    name: 'Customer KYC',
    description: 'Customers verify identity and documents before their first booking.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-02-01',
  },
  {
    id: 'machine-verification',
    name: 'Machine Verification',
    description: 'Machines require inspection and document checks before they go live.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-02-01',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    description: 'Cover rental damage and third-party liability through partner insurance.',
    enabled: true,
    scope: 'Partner pilots',
    effectiveDate: '2026-03-15',
  },
  {
    id: 'security-deposit',
    name: 'Security Deposit',
    description: 'Hold a refundable deposit against each rental until the machine is returned.',
    enabled: true,
    scope: 'All cities',
    effectiveDate: '2026-03-01',
  },
  {
    id: 'online-payment',
    name: 'Online Payment',
    description: 'Collect rental payments online via UPI, cards and netbanking.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-01-15',
  },
  {
    id: 'advance-payment',
    name: 'Advance Payment',
    description: 'Require a percentage of the rental value upfront to confirm a booking.',
    enabled: true,
    scope: 'All cities',
    effectiveDate: '2026-04-01',
  },
  {
    id: 'cancellation-policy',
    name: 'Cancellation Policy',
    description: 'Enforce time-based cancellation fees shown to the customer before checkout.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-01-01',
  },
  {
    id: 'late-return-charges',
    name: 'Late Return Charges',
    description: 'Charge hourly or daily penalties when a machine is returned past its window.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-01-10',
  },
  {
    id: 'damage-charges',
    name: 'Damage Charges',
    description: 'Apply assessed damage costs to the customer after the machine is returned.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-01-10',
  },
  {
    id: 'gps-tracking',
    name: 'GPS Tracking',
    description: 'Live machine location for customers, operators and the dispatch team.',
    enabled: false,
    scope: 'Select cities',
    effectiveDate: '2026-12-01',
  },
  {
    id: 'operator-requirement',
    name: 'Operator Requirement',
    description: 'Bookings that need a certified operator require one to be assigned before dispatch.',
    enabled: true,
    scope: 'Select cities',
    effectiveDate: '2026-05-01',
  },
  {
    id: 'maintenance-blocking',
    name: 'Maintenance Blocking',
    description: 'Block machines with open maintenance or failed inspections from booking.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-02-20',
  },
  {
    id: 'delivery-pickup',
    name: 'Delivery & Pickup',
    description: 'Offer door-step delivery and pickup of machines for an additional fee.',
    enabled: true,
    scope: 'Pilot cities',
    effectiveDate: '2026-06-01',
  },
  {
    id: 'dynamic-pricing',
    name: 'Dynamic Pricing',
    description: 'Adjust daily rates by demand, season and machine utilisation.',
    enabled: false,
    scope: 'Pilot cities',
    effectiveDate: '2026-11-15',
  },
  {
    id: 'promotions',
    name: 'Promotions',
    description: 'Apply coupon codes and seasonal offers at checkout.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-07-01',
  },
  {
    id: 'auto-refund',
    name: 'Auto Refund',
    description: 'Refund cancellations and security deposits automatically to the source account.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-04-15',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Send SMS, push and email updates across the booking lifecycle.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-01-01',
  },
  {
    id: 'ai-rule-generation',
    name: 'AI Rule Generation',
    description: 'Let admins draft pricing and booking rules from natural language prompts.',
    enabled: false,
    scope: 'Internal testers',
    effectiveDate: '2026-10-20',
  },
  {
    id: 'admin-override',
    name: 'Admin Override',
    description: 'Allow super admins to bypass active rules for a single transaction.',
    enabled: true,
    scope: 'Internal testers',
    effectiveDate: '2026-01-01',
  },
  {
    id: 'audit-logs',
    name: 'Audit Logs',
    description: 'Record every rule, flag and configuration change with actor and timestamp.',
    enabled: true,
    scope: 'Global',
    effectiveDate: '2026-01-01',
  },
]

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function formatFlagDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  const monthLabel = monthNames[Number(month) - 1] ?? month
  return `${day} ${monthLabel} ${year}`
}
