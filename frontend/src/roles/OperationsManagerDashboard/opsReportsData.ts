// Analytics datasets for the Operations Manager reports page.
//
// Every dataset is date-stamped so the report date filters (period chips and
// the from / to range) narrow the numbers that are rendered, not just the
// heading. All figures are scoped to the operations manager's own zone.

export type OpsDailyRow = {
  date: string
  vehiclesTotal: number
  vehiclesOnHire: number
  vehiclesAvailable: number
  vehiclesMaintenance: number
  hoursOnHire: number
  idleHours: number
  downtimeHours: number
  bookingsCreated: number
  bookingsConfirmed: number
  bookingsActive: number
  bookingsCompleted: number
  bookingsCancelled: number
  revenue: number
  pickupsScheduled: number
  pickupsOnTime: number
  pickupsDelayed: number
  avgPickupDelayMins: number
  deliveriesScheduled: number
  deliveriesOnTime: number
  deliveriesDelayed: number
  avgDeliveryDelayMins: number
  returnsDue: number
  returnsOverdue: number
  incidentsRaised: number
  incidentsClosed: number
  revenueCollected: number
}

export type OverdueReturnRow = {
  id: string
  date: string
  bookingId: string
  customer: string
  machine: string
  locality: string
  dueDate: string
  daysOverdue: number
  penalty: number
  status: 'Overdue' | 'In review' | 'Extension approved'
}

export type DowntimeRow = {
  id: string
  date: string
  machine: string
  type: string
  planned: boolean
  hours: number
  mttrHrs: number
  cost: number
  workshop: string
  status: 'Scheduled' | 'In progress' | 'Completed' | 'Overdue'
}

export type IncidentRow = {
  id: string
  date: string
  type: string
  severity: 'Critical' | 'Warning' | 'Info'
  site: string
  raisedBy: string
  status: 'Open' | 'Investigating' | 'Closed'
  injuries: number
  resolutionHrs: number
}

export type StaffProductivityRow = {
  id: string
  date: string
  name: string
  role: string
  vehicle: string
  jobsCompleted: number
  hoursOnSite: number
  utilisationPct: number
  onTimePct: number
  rating: number
  status: 'On shift' | 'On leave' | 'Off shift'
}

export type SlaDailyRow = {
  date: string
  sla: string
  targetMins: number
  met: number
  breached: number
  responseMins: number
  resolutionHrs: number
}

export const REPORT_DAYS = 120

const pseudo = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43748.5453
  return value - Math.floor(value)
}

const round1 = (value: number) => Math.round(value * 10) / 10

const isoDaysAgo = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

const dayLabel = (iso: string) => {
  const date = new Date(`${iso}T12:00:00`)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export const opsDailyRows: OpsDailyRow[] = []

for (let day = 0; day < REPORT_DAYS; day += 1) {
  const date = isoDaysAgo(day)
  const wave = pseudo(day * 11 + 3)
  const weekend = new Date(`${date}T12:00:00`).getDay()
  const isWeekend = weekend === 0

  const vehiclesTotal = 50
  const vehiclesOnHire = Math.round(26 + wave * 8 - (isWeekend ? 5 : 0))
  const vehiclesMaintenance = Math.round(3 + pseudo(day * 17 + 5) * 7)
  const vehiclesAvailable = Math.max(0, vehiclesTotal - vehiclesOnHire - vehiclesMaintenance)

  const bookingsCreated = Math.round(14 + wave * 12 - (isWeekend ? 6 : 0))
  const bookingsConfirmed = Math.round(bookingsCreated * (0.68 + pseudo(day * 23 + 1) * 0.24))
  const bookingsCancelled = Math.round(bookingsCreated * (0.04 + pseudo(day * 29 + 7) * 0.07))
  const bookingsCompleted = Math.round(10 + pseudo(day * 31 + 11) * 14)
  const bookingsActive = Math.max(0, bookingsConfirmed - bookingsCompleted)

  const pickupsScheduled = Math.round(9 + pseudo(day * 37 + 13) * 12)
  const pickupsDelayed = Math.round(pickupsScheduled * (0.05 + pseudo(day * 41 + 3) * 0.16))
  const deliveriesScheduled = Math.round(7 + pseudo(day * 43 + 17) * 10)
  const deliveriesDelayed = Math.round(deliveriesScheduled * (0.06 + pseudo(day * 47 + 5) * 0.18))

  opsDailyRows.push({
    date,
    vehiclesTotal,
    vehiclesOnHire,
    vehiclesAvailable,
    vehiclesMaintenance,
    hoursOnHire: Math.round(vehiclesOnHire * (7 + pseudo(day * 53 + 2) * 2.4)),
    idleHours: Math.round(vehiclesAvailable * (4 + pseudo(day * 59 + 4) * 3)),
    downtimeHours: Math.round(vehiclesMaintenance * (9 + pseudo(day * 61 + 6) * 16)),
    bookingsCreated,
    bookingsConfirmed,
    bookingsActive,
    bookingsCompleted,
    bookingsCancelled,
    revenue: Math.round(60000 + pseudo(day * 67 + 9) * 140000),
    pickupsScheduled,
    pickupsOnTime: pickupsScheduled - pickupsDelayed,
    pickupsDelayed,
    avgPickupDelayMins: Math.round(8 + pseudo(day * 71 + 3) * 46),
    deliveriesScheduled,
    deliveriesOnTime: deliveriesScheduled - deliveriesDelayed,
    deliveriesDelayed,
    avgDeliveryDelayMins: Math.round(12 + pseudo(day * 73 + 5) * 58),
    returnsDue: Math.round(5 + pseudo(day * 79 + 7) * 9),
    returnsOverdue: Math.round(1 + pseudo(day * 83 + 11) * 4),
    incidentsRaised: Math.round(pseudo(day * 89 + 2) * 4),
    incidentsClosed: 0,
    revenueCollected: Math.round(52000 + pseudo(day * 97 + 13) * 120000),
  })
}

opsDailyRows.reverse()

const localities = ['HITEC City', 'Raidurg', 'Kondapur', 'Gachibowli', 'Uppal', 'Manikonda']
const customers = ['HCC Constructions', 'L&T Metro Rail', 'MEIL', 'My Home Builders', 'Ramky Infra', 'Sobha Realty']
const machines = ['CAT 320 Excavator', 'Tower Crane 6T', 'ACE Hydra Crane 14T', 'Volvo FMX Tipper', 'Schwing Stetter Mixer', 'JCB 3CX Backhoe']
const workshops = ['HITEC City yard', 'Raidurg workshop', 'Kondapur service bay', 'Gachibowli depot']
const operators = ['Kiran Vardhan', 'Sunita Devi', 'Ravi Teja', 'Fatima Zahra', 'Bharat Reddy', 'Imran Ali', 'Ayesha Siddiqui']
const sites = ['Metro rail site', 'TSIIC plot', 'Highway depot', 'Construction yard', 'Warehouse yard']

export const overdueReturnRows: OverdueReturnRow[] = Array.from({ length: 34 }, (_, index) => {
  const day = index * 3 + 1
  const date = isoDaysAgo(day)
  const daysOverdue = Math.round(1 + pseudo(index * 13 + 3) * 21)
  const status: OverdueReturnRow['status'] =
    index % 5 === 0 ? 'Extension approved' : index % 3 === 0 ? 'In review' : 'Overdue'
  return {
    id: `OR-${220 + index}`,
    date,
    bookingId: `BK-${5150 + index}`,
    customer: customers[index % customers.length],
    machine: machines[index % machines.length],
    locality: localities[index % localities.length],
    dueDate: isoDaysAgo(day - daysOverdue),
    daysOverdue,
    penalty: Math.round(2500 + daysOverdue * 900),
    status,
  }
})

export const downtimeRows: DowntimeRow[] = Array.from({ length: 46 }, (_, index) => {
  const day = index * 2 + 1
  const planned = index % 3 === 0
  const hours = Math.round((planned ? 4 : 9) + pseudo(index * 17 + 5) * 46)
  return {
    id: `DT-${180 + index}`,
    date: isoDaysAgo(day),
    machine: machines[index % machines.length],
    type: planned
      ? 'Scheduled service'
      : ['Hydraulic failure', 'Engine fault', 'Tyre puncture', 'Electrical fault', 'Overhaul'][index % 5],
    planned,
    hours,
    mttrHrs: round1(1.5 + pseudo(index * 23 + 7) * 9),
    cost: Math.round((planned ? 8000 : 18000) + pseudo(index * 29 + 9) * 46000),
    workshop: workshops[index % workshops.length],
    status: index % 4 === 0 ? 'In progress' : index % 7 === 0 ? 'Overdue' : 'Completed',
  }
})

export const incidentRows: IncidentRow[] = Array.from({ length: 28 }, (_, index) => {
  const day = index * 4 + 1
  const severity: IncidentRow['severity'] = index % 7 === 0 ? 'Critical' : index % 3 === 0 ? 'Warning' : 'Info'
  const status: IncidentRow['status'] = index % 4 === 0 ? 'Open' : index % 3 === 0 ? 'Investigating' : 'Closed'
  return {
    id: `INC-${90 + index}`,
    date: isoDaysAgo(day),
    type: ['Equipment damage', 'Site safety', 'Operator conduct', 'Delivery damage', 'Access dispute'][index % 5],
    severity,
    site: sites[index % sites.length],
    raisedBy: operators[index % operators.length],
    status,
    injuries: severity === 'Critical' ? (index % 3 === 0 ? 1 : 0) : 0,
    resolutionHrs: round1(2 + pseudo(index * 31 + 11) * 46),
  }
})

export const staffProductivityRows: StaffProductivityRow[] = Array.from({ length: 42 }, (_, index) => {
  const day = index * 2 + 1
  const jobs = Math.round(4 + pseudo(index * 37 + 5) * 22)
  const hours = Math.round(jobs * (5 + pseudo(index * 41 + 3) * 2.2))
  return {
    id: `SP-${140 + index}`,
    date: isoDaysAgo(day),
    name: operators[index % operators.length],
    role: index % 5 === 0 ? 'Zone Operator' : index % 5 === 1 ? 'Site Supervisor' : 'Zone Operator',
    vehicle: machines[index % machines.length],
    jobsCompleted: jobs,
    hoursOnSite: hours,
    utilisationPct: Math.round(52 + pseudo(index * 43 + 7) * 46),
    onTimePct: Math.round(68 + pseudo(index * 47 + 9) * 31),
    rating: round1(3.9 + pseudo(index * 53 + 13) * 1.1),
    status: index % 6 === 0 ? 'On leave' : index % 4 === 0 ? 'Off shift' : 'On shift',
  }
})

export const slaTargets = [
  { id: 'sla-dispatch', name: 'Dispatch assignment', targetMins: 30 },
  { id: 'sla-pickup', name: 'Pickup slot', targetMins: 60 },
  { id: 'sla-delivery', name: 'Delivery slot', targetMins: 120 },
  { id: 'sla-incident', name: 'Incident response', targetMins: 45 },
]

export const slaDailyRows: SlaDailyRow[] = []

for (let day = 0; day < REPORT_DAYS; day += 1) {
  const date = isoDaysAgo(day)
  slaTargets.forEach((target, index) => {
    const volume = Math.round(8 + pseudo(day * 61 + index * 7) * 26)
    const breached = Math.round(volume * (0.03 + pseudo(day * 67 + index * 11) * 0.16))
    slaDailyRows.push({
      date,
      sla: target.id,
      targetMins: target.targetMins,
      met: volume - breached,
      breached,
      responseMins: Math.round(target.targetMins * (0.5 + pseudo(day * 71 + index * 13) * 1.1)),
      resolutionHrs: round1(1 + pseudo(day * 73 + index * 17) * 7),
    })
  })
}

export { dayLabel, isoDaysAgo, round1 }
