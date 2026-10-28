export type AttentionSlug = 'payouts-awaiting-approval' | 'security-alerts' | 'unassigned-jobs' | 'kyc-reviews'

export type AttentionTone = 'amber' | 'red' | 'blue' | 'green'

export type AttentionKpi = {
  slug: AttentionSlug
  title: string
  kicker: string
  description?: string
  tone: AttentionTone
}

export const attentionKpis: AttentionKpi[] = [
  {
    slug: 'payouts-awaiting-approval',
    title: 'Payouts awaiting approval',
    kicker: 'National overview / Finance queue',
    tone: 'amber',
  },
  {
    slug: 'security-alerts',
    title: 'Security alerts',
    kicker: 'National overview / Platform health',
    tone: 'red',
  },
  {
    slug: 'unassigned-jobs',
    title: 'Unassigned jobs',
    kicker: 'National overview / Dispatch queue',
    tone: 'blue',
  },
  {
    slug: 'kyc-reviews',
    title: 'KYC reviews',
    kicker: 'National overview / Partner verification',
    tone: 'green',
  },
]

export type PayoutRequest = {
  id: string
  partner: string
  role: 'Owner' | 'Operator' | 'Fleet Partner'
  city: string
  amount: number
  method: 'Bank transfer' | 'UPI'
  requestedOn: string
}

export const initialPayoutRequests: PayoutRequest[] = [
  { id: 'PO-2041', partner: 'Rahul Meena', role: 'Operator', city: 'Hyderabad', amount: 48500, method: 'Bank transfer', requestedOn: '05-Oct-26' },
  { id: 'PO-2042', partner: 'Sunrise Rentals', role: 'Fleet Partner', city: 'Pune', amount: 126000, method: 'Bank transfer', requestedOn: '05-Oct-26' },
  { id: 'PO-2043', partner: 'Anita Desai', role: 'Owner', city: 'Bengaluru', amount: 32750, method: 'UPI', requestedOn: '06-Oct-26' },
  { id: 'PO-2044', partner: 'Metro Heavyworks', role: 'Owner', city: 'Chennai', amount: 89400, method: 'Bank transfer', requestedOn: '06-Oct-26' },
  { id: 'PO-2045', partner: 'Imran Qureshi', role: 'Operator', city: 'Mumbai', amount: 21600, method: 'UPI', requestedOn: '07-Oct-26' },
]

export type SecurityAlert = {
  id: string
  severity: 'Critical' | 'High' | 'Medium'
  category: 'Session' | 'Payment' | 'Access'
  summary: string
  source: string
  detectedAt: string
}

export const initialSecurityAlerts: SecurityAlert[] = [
  {
    id: 'SA-01',
    severity: 'Critical',
    category: 'Session',
    summary: 'Repeated failed admin logins from an unrecognised device',
    source: 'Auth service',
    detectedAt: '2 hours ago',
  },
  {
    id: 'SA-02',
    severity: 'High',
    category: 'Payment',
    summary: 'Payout bank account changed minutes before a release',
    source: 'Fraud rules engine',
    detectedAt: '5 hours ago',
  },
  {
    id: 'SA-03',
    severity: 'Medium',
    category: 'Access',
    summary: 'Partner API key used outside its allowed region',
    source: 'Gateway monitor',
    detectedAt: 'Yesterday',
  },
]

export type UnassignedJob = {
  id: string
  customer: string
  equipment: string
  city: string
  requestedFor: string
  duration: string
}

export const initialUnassignedJobs: UnassignedJob[] = [
  { id: 'JOB-301', customer: 'Arjun Steel Traders', equipment: 'Excavator', city: 'Hyderabad', requestedFor: 'Today · 2 PM', duration: '3 days' },
  { id: 'JOB-302', customer: 'Kavya Infra Projects', equipment: 'Crane', city: 'Pune', requestedFor: 'Today · 5 PM', duration: '2 days' },
  { id: 'JOB-303', customer: 'Sarita Builders', equipment: 'Backhoe Loader', city: 'Bengaluru', requestedFor: 'Today · 6 PM', duration: '1 day' },
  { id: 'JOB-304', customer: 'Delta Earthmovers', equipment: 'Boom Lift', city: 'Chennai', requestedFor: 'Tomorrow · 9 AM', duration: '5 days' },
  { id: 'JOB-305', customer: 'Vikram Logistics', equipment: 'Tipper Truck', city: 'Mumbai', requestedFor: 'Tomorrow · 11 AM', duration: '4 days' },
  { id: 'JOB-306', customer: 'Neha Constructions', equipment: 'Compactor', city: 'Delhi', requestedFor: 'Tomorrow · 3 PM', duration: '2 days' },
  { id: 'JOB-307', customer: 'Orbis Mining Co.', equipment: 'Wheel Loader', city: 'Kolkata', requestedFor: '10-Oct · 8 AM', duration: '7 days' },
]

export const operatorAssignees = [
  'Ravi Kumar · Hyderabad',
  'Suresh Patil · Pune',
  'Deepa Nair · Bengaluru',
  'Anand Raj · Chennai',
  'Farhan Shaikh · Mumbai',
  'Vivek Sharma · Delhi',
]

export type KycReview = {
  id: string
  applicant: string
  type: 'Owner' | 'Operator' | 'Fleet Partner'
  city: string
  documents: string
  submittedOn: string
}

export const initialKycReviews: KycReview[] = [
  { id: 'KY-101', applicant: 'Sunil Verma', type: 'Owner', city: 'Delhi', documents: 'Aadhaar · PAN · Address proof', submittedOn: '04-Oct-26' },
  { id: 'KY-102', applicant: 'Meera Joshi', type: 'Operator', city: 'Pune', documents: 'Driving licence · PAN', submittedOn: '04-Oct-26' },
  { id: 'KY-103', applicant: 'Granite Logistics', type: 'Fleet Partner', city: 'Hyderabad', documents: 'GST · PAN · Registration', submittedOn: '04-Oct-26' },
  { id: 'KY-104', applicant: 'Rakesh Yadav', type: 'Owner', city: 'Jaipur', documents: 'Aadhaar · PAN', submittedOn: '05-Oct-26' },
  { id: 'KY-105', applicant: 'Pooja Iyer', type: 'Operator', city: 'Chennai', documents: 'Driving licence · Aadhaar', submittedOn: '05-Oct-26' },
  { id: 'KY-106', applicant: 'Ashwin Traders', type: 'Fleet Partner', city: 'Mumbai', documents: 'GST · PAN', submittedOn: '05-Oct-26' },
  { id: 'KY-107', applicant: 'Karan Malhotra', type: 'Owner', city: 'Gurugram', documents: 'Aadhaar · PAN · Vehicle RC', submittedOn: '06-Oct-26' },
  { id: 'KY-108', applicant: 'Sunita Rao', type: 'Operator', city: 'Bengaluru', documents: 'Driving licence · Address proof', submittedOn: '06-Oct-26' },
  { id: 'KY-109', applicant: 'Bhavesh Patel', type: 'Owner', city: 'Ahmedabad', documents: 'Aadhaar · PAN', submittedOn: '06-Oct-26' },
  { id: 'KY-110', applicant: 'Nandi Equipment Hire', type: 'Fleet Partner', city: 'Bengaluru', documents: 'GST · Registration', submittedOn: '07-Oct-26' },
  { id: 'KY-111', applicant: 'Aftab Sheikh', type: 'Operator', city: 'Kolkata', documents: 'Driving licence · PAN', submittedOn: '07-Oct-26' },
  { id: 'KY-112', applicant: 'Lata Kamble', type: 'Owner', city: 'Nagpur', documents: 'Aadhaar · Address proof', submittedOn: '07-Oct-26' },
]

export type AttentionAction =
  | { type: 'approve-payout'; id: string }
  | { type: 'reject-payout'; id: string }
  | { type: 'resolve-alert'; id: string }
  | { type: 'dismiss-alert'; id: string }
  | { type: 'assign-job'; id: string; operator: string }
  | { type: 'approve-kyc'; id: string }
  | { type: 'reject-kyc'; id: string }
  | { type: 'docs-kyc'; id: string }

export function getAttentionSlugFromLocation(): AttentionSlug | null {
  if (typeof window === 'undefined' || !window.location.hash.startsWith('#super-admin/attention/')) return null
  const slug = window.location.hash.slice('#super-admin/attention/'.length)
  return attentionKpis.some((item) => item.slug === slug) ? (slug as AttentionSlug) : null
}

export function formatRupees(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}
