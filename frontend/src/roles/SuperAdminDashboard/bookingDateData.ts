export type BookingStatus = 'Completed' | 'Ongoing' | 'Pending' | 'Cancelled'

export type DashboardBooking = {
  id: string
  customer: string
  bookingType: string
  category: string
  state: string
  city: string
  zone: string
  time: string
  duration: string
  provider: string
  operator: string
  owner: string
  status: BookingStatus
  amount: number
}

export type BookingDateSummary = {
  total: number
  completed: number
  ongoing: number
  pending: number
  cancelled: number
  revenue: number
  completionRate: number
}

const customers = [
  'Godrej Properties Ltd',
  'L&T Construction',
  'Tata Projects Infrastructure',
  'Shapoorji Pallonji EPC',
  'Mahindra Lifespaces',
  'DLF Builders',
  'Prestige Group',
  'Brigade Enterprises',
  'Aparna Constructions',
  'My Home Group',
  'Ramky Infra',
  'Sobha Developers',
]

const equipment = [
  { name: 'Hydraulic Excavator (JCB 385LC)', category: 'Earthmoving', base: 78000 },
  { name: 'Backhoe Loader (JCB 3DX)', category: 'Earthmoving', base: 34500 },
  { name: 'Skid Steer Loader', category: 'Earthmoving', base: 26000 },
  { name: 'Bulldozer D6', category: 'Earthmoving', base: 118000 },
  { name: 'Vibratory Compactor 11T', category: 'Compaction', base: 56000 },
  { name: 'Motor Grader', category: 'Roadworks', base: 62000 },
  { name: 'Hydraulic Crane 50T', category: 'Lifting', base: 145000 },
  { name: 'Tower Crane (TC-5013)', category: 'Lifting', base: 210000 },
  { name: 'Boom Lift 16m', category: 'Access', base: 32000 },
  { name: 'Concrete Boom Pump 36m', category: 'Concrete', base: 96000 },
  { name: 'Transit Mixer 6m³', category: 'Concrete', base: 28000 },
  { name: 'Pile Driving Rig', category: 'Foundation', base: 168000 },
]

const locations = [
  { state: 'Telangana', city: 'Hyderabad', zone: 'Hyderabad East' },
  { state: 'Telangana', city: 'Hyderabad', zone: 'Hyderabad West' },
  { state: 'Maharashtra', city: 'Pune', zone: 'Pune West' },
  { state: 'Maharashtra', city: 'Mumbai', zone: 'Mumbai Central' },
  { state: 'Karnataka', city: 'Bengaluru', zone: 'Bengaluru South' },
  { state: 'Karnataka', city: 'Mysuru', zone: 'Mysuru Central' },
  { state: 'Tamil Nadu', city: 'Chennai', zone: 'Chennai North' },
  { state: 'Gujarat', city: 'Ahmedabad', zone: 'Ahmedabad East' },
  { state: 'Delhi NCR', city: 'Noida', zone: 'Noida Sector 62' },
]

const providers = [
  'Apex Earthmovers',
  'Western Heavy Fleet',
  'Deccan Equipment Rentals',
  'Southern Cranes & Co',
  'Metro Lifting Solutions',
  'Sunrise Rentals',
  'Vidarbha Heavy Equipment',
  'Gujarat Plant Hire',
]

const operators = [
  'Rajesh Kumar',
  'Suresh Babu',
  'Amit Singh',
  'Mohan Reddy',
  'Karthik Naidu',
  'Vikram Mehta',
  'Ravi Chandran',
  'Arjun Patel',
  'Naveen Kumar',
  'Santosh Yadav',
  'Prakash Rao',
  'Mahesh Gowda',
]

const owners = [
  'Manoj Equipment Co.',
  'Global Plant Services',
  'Reddy Heavy Machinery',
  'Sharma Rentals',
  'TechnoLift Pvt Ltd',
  'Krishna Infra',
  'Patel Fleet Solutions',
  'Infinite Cranes',
  'Sai Machinery',
  'Elite Earthmovers',
  'BlueLine Rentals',
  'GreenField Fleet',
]

function mulberry32(seed: number) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function formatDateLabel(iso: string) {
  if (!iso) return 'the selected date'
  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatBookingCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function getRecentDateOptions(days = 7) {
  const today = new Date()
  const options: { iso: string; label: string }[] = []
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const iso = toIsoDate(date)
    const label =
      offset === 0
        ? 'Today'
        : offset === 1
          ? 'Yesterday'
          : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    options.push({ iso, label })
  }
  return options
}

export function getBookingsForDate(iso: string): DashboardBooking[] {
  if (!iso) return []
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return []

  const rng = mulberry32(hashString(iso))
  const weekday = date.getDay()
  const isWeekend = weekday === 0 || weekday === 6
  const count = Math.round((isWeekend ? 6 : 12) + rng() * 6)
  const stamp = iso.replace(/-/g, '').slice(2)
  const bookings: DashboardBooking[] = []

  for (let i = 0; i < count; i += 1) {
    const item = equipment[Math.floor(rng() * equipment.length)]
    const location = locations[Math.floor(rng() * locations.length)]
    const customer = customers[Math.floor(rng() * customers.length)]
    const provider = providers[Math.floor(rng() * providers.length)]
    const operator = operators[Math.floor(rng() * operators.length)]
    const owner = owners[Math.floor(rng() * owners.length)]

    const roll = rng()
    const status: BookingStatus =
      roll > 0.86 ? 'Cancelled' : roll > 0.72 ? 'Pending' : roll > 0.56 ? 'Ongoing' : 'Completed'

    const days = 2 + Math.floor(rng() * 21)
    const amount = Math.round((item.base * (days / 7) * (0.85 + rng() * 0.4)) / 500) * 500

    const hour = 7 + Math.floor(rng() * 11)
    const minute = Math.floor(rng() * 12) * 5
    const meridiem = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    const time = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${meridiem}`

    bookings.push({
      id: `BK-${stamp}-${String(i + 1).padStart(2, '0')}`,
      customer,
      bookingType: item.name,
      category: item.category,
      state: location.state,
      city: location.city,
      zone: location.zone,
      time,
      duration: `${days} ${days === 1 ? 'day' : 'days'}`,
      provider,
      operator,
      owner,
      status,
      amount,
    })
  }

  bookings.sort((a, b) => a.time.localeCompare(b.time))
  return bookings
}

export function summarizeBookings(bookings: DashboardBooking[]): BookingDateSummary {
  const summary = bookings.reduce<BookingDateSummary>(
    (acc, booking) => {
      acc.total += 1
      acc.revenue += booking.amount
      if (booking.status === 'Completed') acc.completed += 1
      else if (booking.status === 'Ongoing') acc.ongoing += 1
      else if (booking.status === 'Pending') acc.pending += 1
      else acc.cancelled += 1
      return acc
    },
    { total: 0, completed: 0, ongoing: 0, pending: 0, cancelled: 0, revenue: 0, completionRate: 0 },
  )
  summary.completionRate = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0
  return summary
}
