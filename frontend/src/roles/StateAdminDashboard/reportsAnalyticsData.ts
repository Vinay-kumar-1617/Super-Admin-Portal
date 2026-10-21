// State-scoped reports & analytics datasets for the Telangana State Admin dashboard.
export type ReportId = 'applications' | 'occupancy' | 'regions' | 'users' | 'payments' | 'dispatch' | 'support'

export const reportCatalog: Array<{ id: ReportId; label: string; description: string }> = [
  { id: 'applications', label: 'Rental applications', description: 'Application performance across cities and zones' },
  { id: 'occupancy', label: 'Property occupancy', description: 'Availability and occupancy of listed properties' },
  { id: 'regions', label: 'City & zone comparison', description: 'City-wise and zone-wise side-by-side comparison' },
  { id: 'users', label: 'User activity & workload', description: 'User activity and workload by role' },
  { id: 'payments', label: 'Payments & outstanding', description: 'Rent collection and outstanding balances' },
  { id: 'dispatch', label: 'Dispatch performance', description: 'Dispatch jobs, on-time delivery and turnaround' },
  { id: 'support', label: 'Support & complaints', description: 'Support tickets, resolutions and SLA times' },
]

export const reportPeriods: Array<{ id: string; label: string; days: number }> = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
]

export const stateCities = [
  'Hyderabad',
  'Warangal',
  'Karimnagar',
  'Nizamabad',
  'Khammam',
  'Ramagundam',
  'Nalgonda',
  'Suryapet',
]

export const cityZones: Record<string, string> = {
  Hyderabad: 'Madhapur',
  Warangal: 'Hanamkonda',
  Karimnagar: 'Chowrasta',
  Nizamabad: 'Bodhan Road',
  Khammam: 'Wyra Road',
  Ramagundam: 'Godavarikhani',
  Nalgonda: 'Miryalaguda Road',
  Suryapet: 'Alair Road',
}

export const staffRoles = ['City Admin', 'Zone Admin', 'Dispatcher', 'Operations', 'Finance', 'Support']
export const supportCategories = ['Billing', 'Machine fault', 'Booking', 'Refund', 'Staff conduct', 'Application', 'Property']

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
  city: string
  zone: string
  submitted: number
  approved: number
  rejected: number
  avgApprovalHrs: number
}

export type UserActivityRow = {
  date: string
  city: string
  role: string
  activeUsers: number
  sessions: number
  actions: number
  avgWorkloadPct: number
}

export type PaymentRow = {
  date: string
  city: string
  collected: number
  outstanding: number
  invoices: number
}

export type DispatchRow = {
  date: string
  city: string
  jobs: number
  onTime: number
  delayed: number
  avgTatMins: number
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
  city: string
  zone: string
  total: number
  occupied: number
  available: number
}

export type RegionRow = {
  city: string
  applications: number
  approvals: number
  revenue: number
  occupancyPct: number
  dispatchTatMins: number
  collectionPct: number
}

export const applicationRows: ApplicationRow[] = []
export const userActivityRows: UserActivityRow[] = []
export const paymentRows: PaymentRow[] = []
export const dispatchRows: DispatchRow[] = []
export const supportRows: SupportRow[] = []

for (let day = 0; day < DAYS; day += 1) {
  const date = isoDaysAgo(day)

  stateCities.forEach((city, cityIndex) => {
    const zone = cityZones[city]

    const base = 6 + cityIndex * 2
    const submitted = Math.round(base * (0.7 + pseudo(day * 7 + cityIndex) * 0.7))
    const approved = Math.round(submitted * (0.58 + pseudo(day * 11 + cityIndex) * 0.34))
    const rejected = Math.max(0, submitted - approved - Math.round(pseudo(day * 13 + cityIndex) * 2))
    applicationRows.push({
      date,
      city,
      zone,
      submitted,
      approved,
      rejected,
      avgApprovalHrs: round1(16 + pseudo(day * 17 + cityIndex) * 26),
    })

    const collectedBase = 120000 + cityIndex * 26000
    paymentRows.push({
      date,
      city,
      collected: Math.round(collectedBase * (0.75 + pseudo(day * 19 + cityIndex) * 0.45)),
      outstanding: Math.round((42000 + cityIndex * 9000) * (0.6 + pseudo(day * 23 + cityIndex) * 0.7)),
      invoices: Math.round(18 + cityIndex * 4 + pseudo(day * 29 + cityIndex) * 15),
    })

    const jobsBase = 9 + cityIndex * 2
    const jobs = Math.round(jobsBase * (0.7 + pseudo(day * 31 + cityIndex) * 0.6))
    const delayed = Math.round(jobs * (0.04 + pseudo(day * 37 + cityIndex) * 0.14))
    dispatchRows.push({
      date,
      city,
      jobs,
      onTime: jobs - delayed,
      delayed,
      avgTatMins: Math.round(34 + pseudo(day * 41 + cityIndex) * 32),
    })

    staffRoles.forEach((role, roleIndex) => {
      const activeBase = 5 + roleIndex * 3 + cityIndex
      const activeUsers = Math.round(activeBase * (0.8 + pseudo(day * 43 + roleIndex * 5 + cityIndex) * 0.4))
      const sessions = activeUsers * Math.round(2 + pseudo(day * 47 + roleIndex * 3 + cityIndex) * 4)
      userActivityRows.push({
        date,
        city,
        role,
        activeUsers,
        sessions,
        actions: sessions * Math.round(3 + pseudo(day * 53 + roleIndex + cityIndex) * 5),
        avgWorkloadPct: Math.round(38 + pseudo(day * 59 + roleIndex * 2 + cityIndex) * 52),
      })
    })
  })

  supportCategories.forEach((category, categoryIndex) => {
    const tickets = Math.round(4 + categoryIndex + pseudo(day * 61 + categoryIndex) * 12)
    const resolved = Math.round(tickets * (0.6 + pseudo(day * 67 + categoryIndex) * 0.35))
    supportRows.push({
      date,
      category,
      tickets,
      resolved,
      reopened: Math.round(resolved * (0.03 + pseudo(day * 71 + categoryIndex) * 0.1)),
      avgResponseMins: Math.round(14 + pseudo(day * 73 + categoryIndex) * 34),
      avgResolutionHrs: round1(4 + pseudo(day * 79 + categoryIndex) * 22),
    })
  })
}

export const occupancyRows: OccupancyRow[] = stateCities.map((city, cityIndex) => {
  const total = 120 + cityIndex * 34
  const occupied = Math.round(total * (0.62 + pseudo(cityIndex * 3) * 0.3))
  return { city, zone: cityZones[city], total, occupied, available: total - occupied }
})

export const regionRows: RegionRow[] = stateCities.map((city, cityIndex) => {
  const applications = 320 + cityIndex * 70
  const approvals = Math.round(applications * (0.6 + pseudo(cityIndex * 5) * 0.3))
  return {
    city,
    applications,
    approvals,
    revenue: 1800000 + cityIndex * 420000,
    occupancyPct: Math.round(60 + pseudo(cityIndex * 7) * 32),
    dispatchTatMins: Math.round(36 + pseudo(cityIndex * 11) * 28),
    collectionPct: Math.round(72 + pseudo(cityIndex * 13) * 24),
  }
})
