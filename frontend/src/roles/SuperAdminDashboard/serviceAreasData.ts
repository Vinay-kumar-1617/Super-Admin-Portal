import type { StateActivity } from './statesData'

export type CoverageType = 'Radius' | 'ZIP / PIN Codes' | 'Custom Polygon'

export type MapPoint = {
  x: number
  y: number
}

export type AreaOperatingHour = {
  day: string
  open: string
  close: string
  closed: boolean
}

export type AreaPricing = {
  baseFare: number
  perKm: number
  perHour: number
  minimumFare: number
  surgeMultiplier: number
}

export type ServiceAreaProvider = {
  id: string
  name: string
  contact: string
  email: string
  vehicles: number
  rating: number
  status: 'Active' | 'Inactive'
  specialty: string
}

export type ServiceAreaStats = {
  bookings: number
  revenue: number
  avgResponseMins: number
  fillRate: number
}

export type ServiceAreaItem = {
  id: string
  name: string
  code: string
  cityName: string
  stateName: string
  description: string
  coverageType: CoverageType
  radiusKm: number
  pinCodes: string[]
  center: MapPoint
  services: string[]
  hours: AreaOperatingHour[]
  pricing: AreaPricing
  providers: ServiceAreaProvider[]
  customers: number
  status: 'Active' | 'Inactive'
  createdDate: string
  stats: ServiceAreaStats
  recentActivity: StateActivity[]
}

export const coverageTypes: CoverageType[] = ['Radius', 'ZIP / PIN Codes', 'Custom Polygon']

export const serviceCatalog: string[] = [
  'Crane Hire',
  'Excavator Rental',
  'Backhoe Loader',
  'Tipper Haulage',
  'Concrete Mixer',
  'Forklift Rental',
  'Water Tanker',
  'Boom Lift',
  'Trencher',
  'Compactor',
  'Flatbed Transport',
  'Worker Crew On-Demand',
]

export const weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const cityAnchors: Record<string, { lat: number; lng: number; stateName: string }> = {
  Mumbai: { lat: 19.076, lng: 72.8777, stateName: 'Maharashtra' },
  Pune: { lat: 18.5204, lng: 73.8567, stateName: 'Maharashtra' },
  Nagpur: { lat: 21.1458, lng: 79.0882, stateName: 'Maharashtra' },
  Hyderabad: { lat: 17.385, lng: 78.4867, stateName: 'Telangana' },
  Warangal: { lat: 17.9689, lng: 79.5941, stateName: 'Telangana' },
  Bengaluru: { lat: 12.9716, lng: 77.5946, stateName: 'Karnataka' },
  Mysuru: { lat: 12.2958, lng: 76.6394, stateName: 'Karnataka' },
  Chennai: { lat: 13.0827, lng: 80.2707, stateName: 'Tamil Nadu' },
  Coimbatore: { lat: 11.0168, lng: 76.9558, stateName: 'Tamil Nadu' },
  Jaipur: { lat: 26.9124, lng: 75.7873, stateName: 'Rajasthan' },
  Jodhpur: { lat: 26.2389, lng: 73.0243, stateName: 'Rajasthan' },
  Lucknow: { lat: 26.8467, lng: 80.9462, stateName: 'Uttar Pradesh' },
  Varanasi: { lat: 25.3176, lng: 82.9739, stateName: 'Uttar Pradesh' },
}

export const cityNames: string[] = Object.keys(cityAnchors)

export const buildDefaultHours = (
  weekdayOpen = '06:00',
  weekdayClose = '22:00',
  sundayClosed = false,
): AreaOperatingHour[] =>
  weekDays.map((day) => ({
    day,
    open: day === 'Sunday' ? '07:00' : weekdayOpen,
    close: day === 'Sunday' ? '21:00' : weekdayClose,
    closed: day === 'Sunday' ? sundayClosed : false,
  }))

export const defaultPricing: AreaPricing = {
  baseFare: 450,
  perKm: 28,
  perHour: 320,
  minimumFare: 750,
  surgeMultiplier: 1,
}

export const providerPool: ServiceAreaProvider[] = [
  { id: 'prov-western', name: 'Western Heavy Fleet', contact: '+91 98201 44120', email: 'ops@westernheavy.in', vehicles: 42, rating: 4.7, status: 'Active', specialty: 'Cranes & Boom Lifts' },
  { id: 'prov-metro', name: 'Metro Machines Mumbai', contact: '+91 98202 33445', email: 'dispatch@metromachines.in', vehicles: 31, rating: 4.5, status: 'Active', specialty: 'Mixers & Concrete' },
  { id: 'prov-pune', name: 'Pune Commercial Fleet', contact: '+91 98220 55667', email: 'fleet@punecommercial.in', vehicles: 27, rating: 4.6, status: 'Active', specialty: 'Forklifts & Material Handling' },
  { id: 'prov-hyderabad', name: 'Hyderabad Highrise Fleet', contact: '+91 98490 22334', email: 'ops@hyderabadhighrise.in', vehicles: 38, rating: 4.8, status: 'Active', specialty: 'Tower Cranes & Excavators' },
  { id: 'prov-bengaluru', name: 'Bengaluru Tech Fleet', contact: '+91 98450 22334', email: 'ops@blrtechfleet.in', vehicles: 35, rating: 4.4, status: 'Active', specialty: 'Tippers & Haulage' },
  { id: 'prov-chennai', name: 'Chennai Expressway Fleet', contact: '+91 98840 22334', email: 'dispatch@chennaexp.in', vehicles: 29, rating: 4.3, status: 'Active', specialty: 'Flatbed & Transport' },
  { id: 'prov-jaipur', name: 'Jaipur Civil Fleet', contact: '+91 98290 66778', email: 'ops@jaipurcivil.in', vehicles: 22, rating: 4.2, status: 'Active', specialty: 'Backhoe & Compactors' },
  { id: 'prov-lucknow', name: 'Lucknow Civil Fleet', contact: '+91 99350 44556', email: 'ops@lucknowcivil.in', vehicles: 19, rating: 4.1, status: 'Active', specialty: 'Earthmovers' },
  { id: 'prov-nagpur', name: 'Nagpur Industrial Fleet', contact: '+91 98230 66778', email: 'fleet@nagpurindustrial.in', vehicles: 24, rating: 4.4, status: 'Active', specialty: 'Tippers & Trailers' },
  { id: 'prov-coimbatore', name: 'Coimbatore Industrial Fleet', contact: '+91 98430 11223', email: 'ops@cbeindustrial.in', vehicles: 18, rating: 4.2, status: 'Active', specialty: 'Foundry & Plant Support' },
  { id: 'prov-mysuru', name: 'Mysuru Civic Fleet', contact: '+91 98450 11223', email: 'ops@mysurucivic.in', vehicles: 15, rating: 4.0, status: 'Active', specialty: 'Civic Works' },
  { id: 'prov-varanasi', name: 'Varanasi Civic Fleet', contact: '+91 99350 77889', email: 'fleet@varanasivic.in', vehicles: 12, rating: 3.9, status: 'Inactive', specialty: 'Road & Ring Works' },
  { id: 'prov-jodhpur', name: 'Jodhpur Civic Fleet', contact: '+91 98290 55667', email: 'ops@jodhpurcivic.in', vehicles: 14, rating: 4.0, status: 'Active', specialty: 'Water Tankers' },
  { id: 'prov-warangal', name: 'Warangal District Fleet', contact: '+91 98490 77889', email: 'ops@warangalfleet.in', vehicles: 11, rating: 4.1, status: 'Active', specialty: 'Agro Logistics' },
]

const pickProviders = (...ids: string[]): ServiceAreaProvider[] =>
  ids
    .map((id) => providerPool.find((p) => p.id === id))
    .filter((p): p is ServiceAreaProvider => Boolean(p))

const pinRange = (start: number, count: number) =>
  Array.from({ length: count }, (_, i) => String(start + i))

export const initialServiceAreasData: ServiceAreaItem[] = [
  {
    id: 'sa-andheri',
    name: 'Andheri East Corridor',
    code: 'SAE',
    cityName: 'Mumbai',
    stateName: 'Maharashtra',
    description: 'Dense urban corridor serving metro construction, airport freight and commercial tower projects across Andheri East.',
    coverageType: 'Radius',
    radiusKm: 8,
    pinCodes: pinRange(400059, 6),
    center: { x: 46, y: 52 },
    services: ['Crane Hire', 'Boom Lift', 'Concrete Mixer', 'Forklift Rental', 'Flatbed Transport'],
    hours: buildDefaultHours('05:30', '23:00', false),
    pricing: { baseFare: 600, perKm: 42, perHour: 480, minimumFare: 1200, surgeMultiplier: 1.2 },
    providers: pickProviders('prov-western', 'prov-metro'),
    customers: 486,
    status: 'Active',
    createdDate: '22 Jan 2024',
    stats: { bookings: 412, revenue: 4860000, avgResponseMins: 22, fillRate: 91 },
    recentActivity: [
      { id: 'sa-act-1', action: 'Radius extended from 6 km to 8 km for airport freight zone', actor: 'Super Admin', timestamp: '4 hours ago', tone: 'blue' },
      { id: 'sa-act-2', action: 'Metro Machines Mumbai added as second coverage provider', actor: 'City Admin • Mumbai', timestamp: '2 days ago', tone: 'green' },
    ],
  },
  {
    id: 'sa-bkc',
    name: 'Bandra Kurla Complex',
    code: 'SAB',
    cityName: 'Mumbai',
    stateName: 'Maharashtra',
    description: 'Premium commercial district with tight access windows and high-rise maintenance demand.',
    coverageType: 'Custom Polygon',
    radiusKm: 5,
    pinCodes: pinRange(400051, 4),
    center: { x: 55, y: 58 },
    services: ['Crane Hire', 'Boom Lift', 'Worker Crew On-Demand'],
    hours: buildDefaultHours('07:00', '21:00', true),
    pricing: { baseFare: 750, perKm: 48, perHour: 560, minimumFare: 1500, surgeMultiplier: 1.35 },
    providers: pickProviders('prov-metro'),
    customers: 214,
    status: 'Active',
    createdDate: '25 Jan 2024',
    stats: { bookings: 186, revenue: 3120000, avgResponseMins: 26, fillRate: 88 },
    recentActivity: [
      { id: 'sa-act-3', action: 'Night access window approved for Plot C tower works', actor: 'Super Admin', timestamp: '1 day ago', tone: 'green' },
    ],
  },
  {
    id: 'sa-hinjawadi',
    name: 'Hinjawadi IT Park',
    code: 'SAH',
    cityName: 'Pune',
    stateName: 'Maharashtra',
    description: 'Campus-wide coverage for the Hinjawadi phases with restricted daytime heavy vehicle movement.',
    coverageType: 'ZIP / PIN Codes',
    radiusKm: 12,
    pinCodes: pinRange(411057, 5),
    center: { x: 38, y: 44 },
    services: ['Forklift Rental', 'Flatbed Transport', 'Water Tanker', 'Worker Crew On-Demand'],
    hours: buildDefaultHours('06:00', '22:00', false),
    pricing: { baseFare: 420, perKm: 30, perHour: 340, minimumFare: 800, surgeMultiplier: 1.1 },
    providers: pickProviders('prov-pune'),
    customers: 342,
    status: 'Active',
    createdDate: '01 Feb 2024',
    stats: { bookings: 328, revenue: 2740000, avgResponseMins: 31, fillRate: 86 },
    recentActivity: [
      { id: 'sa-act-4', action: 'Phase 3 PIN codes added to active coverage', actor: 'Zone Admin • Hinjawadi', timestamp: '3 hours ago', tone: 'blue' },
    ],
  },
  {
    id: 'sa-kharadi',
    name: 'Kharadi–Viman Nagar',
    code: 'SAK',
    cityName: 'Pune',
    stateName: 'Maharashtra',
    description: 'Mixed residential and data-centre belt with extended night-shift availability.',
    coverageType: 'Radius',
    radiusKm: 7,
    pinCodes: pinRange(411014, 4),
    center: { x: 61, y: 47 },
    services: ['Excavator Rental', 'Tipper Haulage', 'Water Tanker', 'Compactor'],
    hours: buildDefaultHours('06:00', '23:00', false),
    pricing: { baseFare: 400, perKm: 29, perHour: 320, minimumFare: 750, surgeMultiplier: 1 },
    providers: pickProviders('prov-pune', 'prov-western'),
    customers: 268,
    status: 'Active',
    createdDate: '05 Feb 2024',
    stats: { bookings: 244, revenue: 1980000, avgResponseMins: 28, fillRate: 84 },
    recentActivity: [
      { id: 'sa-act-5', action: 'Night shift deployment extended for data centre works', actor: 'City Admin • Pune', timestamp: '6 hours ago', tone: 'orange' },
    ],
  },
  {
    id: 'sa-gachibowli',
    name: 'Gachibowli Financial Belt',
    code: 'SAG',
    cityName: 'Hyderabad',
    stateName: 'Telangana',
    description: 'Financial district and high-rise cluster with heavy crane demand during tower topping cycles.',
    coverageType: 'Radius',
    radiusKm: 10,
    pinCodes: pinRange(500032, 5),
    center: { x: 44, y: 55 },
    services: ['Crane Hire', 'Excavator Rental', 'Concrete Mixer', 'Boom Lift', 'Tipper Haulage'],
    hours: buildDefaultHours('05:30', '23:00', false),
    pricing: { baseFare: 550, perKm: 36, perHour: 430, minimumFare: 1100, surgeMultiplier: 1.15 },
    providers: pickProviders('prov-hyderabad'),
    customers: 612,
    status: 'Active',
    createdDate: '15 Feb 2024',
    stats: { bookings: 586, revenue: 7420000, avgResponseMins: 19, fillRate: 94 },
    recentActivity: [
      { id: 'sa-act-6', action: 'Financial district high-rise booking block confirmed', actor: 'Zone Admin • East', timestamp: '5 hours ago', tone: 'green' },
    ],
  },
  {
    id: 'sa-jubilee',
    name: 'Jubilee Hills Residential',
    code: 'SAJ',
    cityName: 'Hyderabad',
    stateName: 'Telangana',
    description: 'Low-noise residential coverage with restricted hours for excavation and heavy haulage.',
    coverageType: 'ZIP / PIN Codes',
    radiusKm: 6,
    pinCodes: pinRange(500033, 3),
    center: { x: 52, y: 46 },
    services: ['Excavator Rental', 'Backhoe Loader', 'Worker Crew On-Demand'],
    hours: buildDefaultHours('07:00', '20:00', true),
    pricing: { baseFare: 500, perKm: 34, perHour: 400, minimumFare: 1000, surgeMultiplier: 1.05 },
    providers: pickProviders('prov-hyderabad'),
    customers: 198,
    status: 'Active',
    createdDate: '18 Feb 2024',
    stats: { bookings: 174, revenue: 1640000, avgResponseMins: 24, fillRate: 89 },
    recentActivity: [
      { id: 'sa-act-7', action: 'Noise curfew hours applied to residential blocks', actor: 'Super Admin', timestamp: '1 day ago', tone: 'orange' },
    ],
  },
  {
    id: 'sa-whitefield',
    name: 'Whitefield Tech Corridor',
    code: 'SAW',
    cityName: 'Bengaluru',
    stateName: 'Karnataka',
    description: 'Campus and logistics bay coverage serving IT parks, warehouses and airport-adjacent freight.',
    coverageType: 'Radius',
    radiusKm: 14,
    pinCodes: pinRange(560066, 6),
    center: { x: 64, y: 51 },
    services: ['Forklift Rental', 'Tipper Haulage', 'Flatbed Transport', 'Water Tanker', 'Trencher'],
    hours: buildDefaultHours('05:00', '23:00', false),
    pricing: { baseFare: 480, perKm: 33, perHour: 380, minimumFare: 900, surgeMultiplier: 1.1 },
    providers: pickProviders('prov-bengaluru'),
    customers: 724,
    status: 'Active',
    createdDate: '25 Feb 2024',
    stats: { bookings: 668, revenue: 6180000, avgResponseMins: 27, fillRate: 92 },
    recentActivity: [
      { id: 'sa-act-8', action: 'Campus expansions flagged for fleet review', actor: 'Zone Admin • Whitefield', timestamp: '6 hours ago', tone: 'orange' },
    ],
  },
  {
    id: 'sa-devanahalli',
    name: 'Devanahalli Aerotropolis',
    code: 'SAD',
    cityName: 'Bengaluru',
    stateName: 'Karnataka',
    description: 'Airport cargo and aerotropolis zone with 24x7 freight handling requirements.',
    coverageType: 'Radius',
    radiusKm: 16,
    pinCodes: pinRange(562110, 4),
    center: { x: 47, y: 33 },
    services: ['Crane Hire', 'Flatbed Transport', 'Tipper Haulage', 'Water Tanker'],
    hours: buildDefaultHours('00:00', '23:59', false),
    pricing: { baseFare: 650, perKm: 38, perHour: 520, minimumFare: 1400, surgeMultiplier: 1.25 },
    providers: pickProviders('prov-bengaluru', 'prov-western'),
    customers: 356,
    status: 'Active',
    createdDate: '27 Feb 2024',
    stats: { bookings: 342, revenue: 4980000, avgResponseMins: 21, fillRate: 90 },
    recentActivity: [
      { id: 'sa-act-9', action: 'Airport logistics corridor expansion approved', actor: 'Super Admin', timestamp: '1 day ago', tone: 'green' },
    ],
  },
  {
    id: 'sa-omr',
    name: 'OMR Expressway Belt',
    code: 'SAO',
    cityName: 'Chennai',
    stateName: 'Tamil Nadu',
    description: 'IT expressway coverage from Thoraipakkam to Sholinganallur with widening works in progress.',
    coverageType: 'Custom Polygon',
    radiusKm: 13,
    pinCodes: pinRange(600096, 5),
    center: { x: 58, y: 62 },
    services: ['Excavator Rental', 'Tipper Haulage', 'Compactor', 'Concrete Mixer'],
    hours: buildDefaultHours('06:00', '22:00', false),
    pricing: { baseFare: 460, perKm: 31, perHour: 360, minimumFare: 850, surgeMultiplier: 1.05 },
    providers: pickProviders('prov-chennai'),
    customers: 442,
    status: 'Active',
    createdDate: '06 Mar 2024',
    stats: { bookings: 398, revenue: 3540000, avgResponseMins: 33, fillRate: 83 },
    recentActivity: [
      { id: 'sa-act-10', action: 'Road widening fleet dispatched along Keltron bay', actor: 'City Admin • Chennai', timestamp: '7 hours ago', tone: 'blue' },
    ],
  },
  {
    id: 'sa-sitapura',
    name: 'Sitapura Industrial SEZ',
    code: 'SAS',
    cityName: 'Jaipur',
    stateName: 'Rajasthan',
    description: 'Special economic zone with 24x7 plant maintenance and groundworks coverage.',
    coverageType: 'ZIP / PIN Codes',
    radiusKm: 9,
    pinCodes: pinRange(302022, 4),
    center: { x: 57, y: 64 },
    services: ['Backhoe Loader', 'Tipper Haulage', 'Compactor', 'Flatbed Transport'],
    hours: buildDefaultHours('06:00', '22:00', false),
    pricing: { baseFare: 380, perKm: 26, perHour: 300, minimumFare: 700, surgeMultiplier: 1 },
    providers: pickProviders('prov-jaipur'),
    customers: 236,
    status: 'Active',
    createdDate: '16 Mar 2024',
    stats: { bookings: 218, revenue: 1760000, avgResponseMins: 35, fillRate: 81 },
    recentActivity: [
      { id: 'sa-act-11', action: 'SEZ plot groundworks booking approved', actor: 'Zone Admin • Sitapura', timestamp: '1 day ago', tone: 'green' },
    ],
  },
  {
    id: 'sa-gomti',
    name: 'Gomti Nagar Riverfront',
    code: 'SAL',
    cityName: 'Lucknow',
    stateName: 'Uttar Pradesh',
    description: 'Riverfront promenade and township coverage with seasonal monsoon restrictions.',
    coverageType: 'Radius',
    radiusKm: 7,
    pinCodes: pinRange(226010, 4),
    center: { x: 41, y: 57 },
    services: ['Backhoe Loader', 'Water Tanker', 'Concrete Mixer', 'Worker Crew On-Demand'],
    hours: buildDefaultHours('06:30', '21:30', false),
    pricing: { baseFare: 350, perKm: 24, perHour: 280, minimumFare: 650, surgeMultiplier: 1 },
    providers: pickProviders('prov-lucknow'),
    customers: 174,
    status: 'Active',
    createdDate: '24 Mar 2024',
    stats: { bookings: 162, revenue: 1240000, avgResponseMins: 38, fillRate: 79 },
    recentActivity: [
      { id: 'sa-act-12', action: 'Monsoon access advisory published for riverfront blocks', actor: 'City Admin • Lucknow', timestamp: '2 days ago', tone: 'orange' },
    ],
  },
  {
    id: 'sa-mihan',
    name: 'MIHAN SEZ Logistics',
    code: 'SAM',
    cityName: 'Nagpur',
    stateName: 'Maharashtra',
    description: 'Central India logistics hub with container handling and long-haul dispatch coverage.',
    coverageType: 'Radius',
    radiusKm: 18,
    pinCodes: pinRange(441108, 4),
    center: { x: 50, y: 61 },
    services: ['Tipper Haulage', 'Flatbed Transport', 'Crane Hire', 'Water Tanker'],
    hours: buildDefaultHours('00:00', '23:59', false),
    pricing: { baseFare: 420, perKm: 27, perHour: 330, minimumFare: 800, surgeMultiplier: 1.05 },
    providers: pickProviders('prov-nagpur'),
    customers: 158,
    status: 'Active',
    createdDate: '10 Feb 2024',
    stats: { bookings: 148, revenue: 1420000, avgResponseMins: 41, fillRate: 77 },
    recentActivity: [
      { id: 'sa-act-13', action: 'SEZ logistics hub added to fleet pool', actor: 'Zone Admin • MIHAN', timestamp: '2 days ago', tone: 'green' },
    ],
  },
  {
    id: 'sa-krs',
    name: 'Krishnaraja Heritage Core',
    code: 'SAQ',
    cityName: 'Mysuru',
    stateName: 'Karnataka',
    description: 'Heritage precinct coverage paused pending conservation clearance audit.',
    coverageType: 'ZIP / PIN Codes',
    radiusKm: 5,
    pinCodes: pinRange(570004, 3),
    center: { x: 49, y: 49 },
    services: ['Concrete Mixer', 'Worker Crew On-Demand', 'Water Tanker'],
    hours: buildDefaultHours('08:00', '18:00', true),
    pricing: { baseFare: 320, perKm: 22, perHour: 260, minimumFare: 600, surgeMultiplier: 1 },
    providers: pickProviders('prov-mysuru'),
    customers: 96,
    status: 'Inactive',
    createdDate: '04 Mar 2024',
    stats: { bookings: 74, revenue: 520000, avgResponseMins: 44, fillRate: 68 },
    recentActivity: [
      { id: 'sa-act-14', action: 'Service area paused pending heritage corridor audit', actor: 'Super Admin', timestamp: '1 day ago', tone: 'orange' },
    ],
  },
  {
    id: 'sa-sulur',
    name: 'Sulur Airbase Belt',
    code: 'SASU',
    cityName: 'Coimbatore',
    stateName: 'Tamil Nadu',
    description: 'Airbase periphery coverage suspended until aviation clearance for heavy lifts is issued.',
    coverageType: 'Radius',
    radiusKm: 11,
    pinCodes: pinRange(641402, 3),
    center: { x: 54, y: 38 },
    services: ['Tipper Haulage', 'Compactor', 'Backhoe Loader'],
    hours: buildDefaultHours('07:00', '19:00', true),
    pricing: { baseFare: 340, perKm: 23, perHour: 270, minimumFare: 650, surgeMultiplier: 1 },
    providers: pickProviders('prov-coimbatore'),
    customers: 84,
    status: 'Inactive',
    createdDate: '12 Mar 2024',
    stats: { bookings: 68, revenue: 460000, avgResponseMins: 46, fillRate: 64 },
    recentActivity: [
      { id: 'sa-act-15', action: 'Coverage paused for aviation clearance audit', actor: 'Super Admin', timestamp: '2 days ago', tone: 'orange' },
    ],
  },
]
