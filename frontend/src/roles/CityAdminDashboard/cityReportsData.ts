// City-scoped reports & analytics datasets for the Hyderabad City Admin dashboard.
export type CityReportId = 'applications' | 'occupancy' | 'collections' | 'zones' | 'support' | 'sla'

export const cityReportCatalog: Array<{ id: CityReportId; label: string; description: string }> = [
  { id: 'applications', label: 'Application trends', description: 'Rental application volume and approval trends by zone' },
  { id: 'occupancy', label: 'Property occupancy', description: 'Availability and occupancy of listed properties by zone' },
  { id: 'collections', label: 'Collections', description: 'Rent collection and outstanding balances by zone' },
  { id: 'zones', label: 'Zone performance', description: 'Zone-wise side-by-side comparison of key operations' },
  { id: 'support', label: 'Complaint resolution', description: 'Support tickets, resolutions and reopen rates by category' },
  { id: 'sla', label: 'SLA compliance', description: 'First-response and resolution SLA compliance by zone' },
]

export const cityReportPeriods: Array<{ id: string; label: string; days: number }> = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
]

export const cityZones = ['Madhapur', 'Gachibowli', 'Kukatpally', 'Uppal', 'Begumpet', 'LB Nagar']

export const cityZoneAreas: Record<string, string> = {
  Madhapur: 'HITEC City corridor',
  Gachibowli: 'Financial district',
  Kukatpally: 'NH-44 industrial belt',
  Uppal: 'Eastern corridor',
  Begumpet: 'Central Hyderabad',
  'LB Nagar': 'Southern ring',
}

export const supportCategories = ['Billing', 'Machine fault', 'Booking', 'Refund', 'Operator conduct', 'Application', 'Property']

const DAYS = 90

const isoDaysAgo = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

const pseudo = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const round1 = (value: number) => Math.round(value * 10) / 10

export type ApplicationRow = {
  date: string
  zone: string
  submitted: number
  approved: number
  rejected: number
  avgApprovalHrs: number
}

export type PaymentRow = {
  date: string
  zone: string
  collected: number
  outstanding: number
  invoices: number
}

export type SupportRow = {
  date: string
  category: string
  tickets: number
  resolved: number
  reopened: number
  avgResponseMins: number
  avgResolutionHrs: number
}

export type OccupancyRow = {
  zone: string
  area: string
  total: number
  occupied: number
  available: number
}

export type ZonePerformanceRow = {
  zone: string
  applications: number
  approvals: number
  revenue: number
  occupancyPct: number
  collectionPct: number
  resolutionPct: number
}

export type SlaRow = {
  zone: string
  tickets: number
  metFirstResponse: number
  metResolution: number
  avgResponseMins: number
  compliancePct: number
}

export const applicationRows: ApplicationRow[] = []
export const paymentRows: PaymentRow[] = []
export const supportRows: SupportRow[] = []

for (let day = 0; day < DAYS; day += 1) {
  const date = isoDaysAgo(day)

  cityZones.forEach((zone, zoneIndex) => {
    const base = 8 + (cityZones.length - zoneIndex) * 2
    const submitted = Math.round(base * (0.7 + pseudo(day * 7 + zoneIndex) * 0.7))
    const approved = Math.round(submitted * (0.6 + pseudo(day * 11 + zoneIndex) * 0.32))
    const rejected = Math.max(0, submitted - approved - Math.round(pseudo(day * 13 + zoneIndex) * 2))
    applicationRows.push({
      date,
      zone,
      submitted,
      approved,
      rejected,
      avgApprovalHrs: round1(14 + pseudo(day * 17 + zoneIndex) * 24),
    })

    const collectedBase = 150000 + (cityZones.length - zoneIndex) * 22000
    paymentRows.push({
      date,
      zone,
      collected: Math.round(collectedBase * (0.75 + pseudo(day * 19 + zoneIndex) * 0.45)),
      outstanding: Math.round((38000 + zoneIndex * 7000) * (0.6 + pseudo(day * 23 + zoneIndex) * 0.7)),
      invoices: Math.round(16 + zoneIndex * 3 + pseudo(day * 29 + zoneIndex) * 12),
    })
  })

  supportCategories.forEach((category, categoryIndex) => {
    const tickets = Math.round(3 + categoryIndex + pseudo(day * 61 + categoryIndex) * 9)
    const resolved = Math.round(tickets * (0.62 + pseudo(day * 67 + categoryIndex) * 0.33))
    supportRows.push({
      date,
      category,
      tickets,
      resolved,
      reopened: Math.round(resolved * (0.03 + pseudo(day * 71 + categoryIndex) * 0.1)),
      avgResponseMins: Math.round(12 + pseudo(day * 73 + categoryIndex) * 30),
      avgResolutionHrs: round1(3 + pseudo(day * 79 + categoryIndex) * 18),
    })
  })
}

export const occupancyRows: OccupancyRow[] = cityZones.map((zone, zoneIndex) => {
  const total = 140 - zoneIndex * 12
  const occupied = Math.round(total * (0.66 + pseudo(zoneIndex * 3) * 0.28))
  return { zone, area: cityZoneAreas[zone], total, occupied, available: total - occupied }
})

export const zonePerformanceRows: ZonePerformanceRow[] = cityZones.map((zone, zoneIndex) => {
  const applications = 260 - zoneIndex * 24
  const approvals = Math.round(applications * (0.62 + pseudo(zoneIndex * 5) * 0.3))
  return {
    zone,
    applications,
    approvals,
    revenue: 2100000 - zoneIndex * 180000,
    occupancyPct: Math.round(64 + pseudo(zoneIndex * 7) * 30),
    collectionPct: Math.round(74 + pseudo(zoneIndex * 13) * 22),
    resolutionPct: Math.round(78 + pseudo(zoneIndex * 17) * 20),
  }
})

export const slaRows: SlaRow[] = cityZones.map((zone, zoneIndex) => {
  const tickets = 120 - zoneIndex * 9
  const metFirstResponse = Math.round(tickets * (0.82 + pseudo(zoneIndex * 11) * 0.16))
  const metResolution = Math.round(tickets * (0.7 + pseudo(zoneIndex * 19) * 0.22))
  return {
    zone,
    tickets,
    metFirstResponse,
    metResolution,
    avgResponseMins: Math.round(11 + pseudo(zoneIndex * 23) * 26),
    compliancePct: Math.round(80 + pseudo(zoneIndex * 29) * 18),
  }
})
