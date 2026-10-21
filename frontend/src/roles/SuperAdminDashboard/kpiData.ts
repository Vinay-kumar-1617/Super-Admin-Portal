export type KpiPeriod = {
  short: string
  full: string
}

export type KpiMetric = {
  label: string
  value: string
  reportedChange: string
  tone: 'green' | 'blue' | 'purple' | 'orange'
  currency: boolean
  description: string
  data: number[]
  periods?: KpiPeriod[]
  periodNoun?: string
}

export const kpiMetrics: KpiMetric[] = [
  {
    label: 'Total Revenue',
    value: '₹39.98M',
    reportedChange: '+28.0%',
    tone: 'green',
    currency: true,
    description: 'Gross rental revenue recorded across every active Fieldwork location, shown by fiscal quarter.',
    data: [31.24, 34.02, 36.86, 39.98],
    periodNoun: 'Quarter',
    periods: [
      { short: 'Q3', full: 'Q3 FY2025-26' },
      { short: 'Q4', full: 'Q4 FY2025-26' },
      { short: 'Q1', full: 'Q1 FY2026-27' },
      { short: 'Q2', full: 'Q2 FY2026-27' },
    ],
  },
  {
    label: 'Platform Commission',
    value: '₹5.99M',
    reportedChange: '+29.7%',
    tone: 'blue',
    currency: true,
    description: 'Platform commission accrued from rental activity across all locations.',
    data: [4.62, 4.91, 5.18, 5.54, 5.99],
  },
  {
    label: 'Total Bookings',
    value: '12,842',
    reportedChange: '+30.5%',
    tone: 'purple',
    currency: false,
    description: 'All bookings created across the platform in the selected period.',
    data: [9840, 10520, 11210, 12040, 12842],
  },
  {
    label: 'Vehicles',
    value: '3,700',
    reportedChange: '+18.6%',
    tone: 'blue',
    currency: false,
    description: 'Vehicles live on the platform and available for hire across all locations.',
    data: [3120, 3280, 3420, 3560, 3700],
  },
  {
    label: 'Operators',
    value: '1,627',
    reportedChange: '+16.2%',
    tone: 'purple',
    currency: false,
    description: 'Operators currently active and accepting jobs across the network.',
    data: [1400, 1450, 1505, 1565, 1627],
  },
  {
    label: 'Fleet Partners',
    value: '289',
    reportedChange: '+9.5%',
    tone: 'orange',
    currency: false,
    description: 'Fleet partners onboarded and supplying vehicles to the platform.',
    data: [264, 270, 277, 283, 289],
  },
  {
    label: 'Cities',
    value: '123',
    reportedChange: '+6.0%',
    tone: 'green',
    currency: false,
    description: 'Cities with live listings and booking activity.',
    data: [116, 118, 120, 121, 123],
  },
  {
    label: 'Zones',
    value: '464',
    reportedChange: '+7.9%',
    tone: 'orange',
    currency: false,
    description: 'Zones with active demand and vehicle supply.',
    data: [430, 438, 447, 455, 464],
  },
];


export const revenueBookings = [
  { id: 'RB001', date: '02-Oct-26', state: 'Telangana', city: 'Hyderabad', zone: 'Gachibowli', customerId: 'CUST-4821', customerName: 'Sri Krishna Projects', ownerId: 'OWN-2201', ownerName: 'Deccan Heavy Machinery', operatorId: 'OPR-3390', operatorName: 'Gopal Rao', bookingValue: 4000, commissionRate: 0.15, status: 'Completed' },
  { id: 'RB002', date: '03-Oct-26', state: 'Maharashtra', city: 'Mumbai', zone: 'Andheri', customerId: 'CUST-4833', customerName: 'Charminar Infra', ownerId: 'OWN-2202', ownerName: 'Sri Krishna Equipment Rentals', operatorId: 'OPR-3391', operatorName: 'Ravi Teja', bookingValue: 5000, commissionRate: 0.15, status: 'Completed' },
]

export const completedRevenueBookings = revenueBookings.filter((b) => b.status === 'Completed')

export const revenueByCity = Object.values(completedRevenueBookings.reduce<Record<string, {
  state: string
  city: string
  bookings: number
  grossRevenue: number
  commission: number
}>>((summary, booking) => {
  const key = `${booking.state}-${booking.city}`
  const citySummary = summary[key] ?? {
    state: booking.state,
    city: booking.city,
    bookings: 0,
    grossRevenue: 0,
    commission: 0,
  }
  citySummary.bookings += 1
  citySummary.grossRevenue += booking.bookingValue
  citySummary.commission += booking.bookingValue * booking.commissionRate
  summary[key] = citySummary
  return summary
}, {}))

export type SubscriptionPass = 'Free' | 'Silver' | 'Gold' | 'Platinum'


export const platformCommissionByVehicleType: Record<string, number> = {
  'Backhoe Loader': 15,
  Excavator: 15,
  Crane: 15,
  Compactor: 15,
  'Skid Steer': 15,
  Aerial: 15,
}

export const operatorCommissionBySubscription: Record<SubscriptionPass, number> = {
  Free: 40,
  Silver: 45,
  Gold: 50,
  Platinum: 55,
}

export const ownerCommissionRates: Record<string, number> = {
  'Backhoe Loader': 62,
  Excavator: 64,
  Crane: 66,
  Compactor: 60,
  'Skid Steer': 58,
  Aerial: 61,
}

export type CommissionBooking = {
  id: string
  customer: string
  owner: string
  ownerPass: SubscriptionPass
  operator: string
  operatorPass: SubscriptionPass
  vehicle: string
  vehicleCategory: string
  ownerCommissionRate: number
  rentalValue: number
  platformCommission: number
  operatorShare: number
  ownerShare: number
  settlement: 'Settled' | 'Pending'
}

export const commissionBookings: CommissionBooking[] = [
  { id: 'BK1001', customer: 'Customer A', owner: 'Owner A', ownerPass: 'Platinum', operator: 'Operator A', operatorPass: 'Gold', vehicle: 'JCB 3DX', vehicleCategory: 'Backhoe Loader', ownerCommissionRate: 62, rentalValue: 10000, platformCommission: 1500, operatorShare: 2300, ownerShare: 6200, settlement: 'Pending' },
  { id: 'BK1002', customer: 'Customer B', owner: 'Owner B', ownerPass: 'Silver', operator: 'Operator A', operatorPass: 'Gold', vehicle: 'CAT 320 GC', vehicleCategory: 'Excavator', ownerCommissionRate: 64, rentalValue: 8000, platformCommission: 1200, operatorShare: 1680, ownerShare: 5120, settlement: 'Settled' },
  { id: 'BK1003', customer: 'Customer C', owner: 'Owner A', ownerPass: 'Platinum', operator: 'Operator B', operatorPass: 'Silver', vehicle: 'Hydraulic Crane 25T', vehicleCategory: 'Crane', ownerCommissionRate: 66, rentalValue: 12000, platformCommission: 1800, operatorShare: 2280, ownerShare: 7920, settlement: 'Settled' },
  { id: 'BK1004', customer: 'Customer D', owner: 'Owner C', ownerPass: 'Gold', operator: 'Operator C', operatorPass: 'Platinum', vehicle: 'Komatsu PC200', vehicleCategory: 'Excavator', ownerCommissionRate: 64, rentalValue: 15000, platformCommission: 2250, operatorShare: 3150, ownerShare: 9600, settlement: 'Pending' },
  { id: 'BK1005', customer: 'Customer E', owner: 'Owner B', ownerPass: 'Silver', operator: 'Operator C', operatorPass: 'Platinum', vehicle: 'Compactor RM-800', vehicleCategory: 'Compactor', ownerCommissionRate: 60, rentalValue: 6000, platformCommission: 900, operatorShare: 1500, ownerShare: 3600, settlement: 'Settled' },
  { id: 'BK1006', customer: 'Customer F', owner: 'Owner C', ownerPass: 'Gold', operator: 'Operator B', operatorPass: 'Silver', vehicle: 'Tower Crane TC-6', vehicleCategory: 'Crane', ownerCommissionRate: 66, rentalValue: 20000, platformCommission: 3000, operatorShare: 3800, ownerShare: 13200, settlement: 'Settled' },
  { id: 'BK1007', customer: 'Customer G', owner: 'Owner A', ownerPass: 'Platinum', operator: 'Operator D', operatorPass: 'Free', vehicle: 'Skid Steer S650', vehicleCategory: 'Skid Steer', ownerCommissionRate: 58, rentalValue: 5000, platformCommission: 750, operatorShare: 1350, ownerShare: 2900, settlement: 'Pending' },
  { id: 'BK1008', customer: 'Customer H', owner: 'Owner B', ownerPass: 'Silver', operator: 'Operator D', operatorPass: 'Free', vehicle: 'Boom Lift 12m', vehicleCategory: 'Aerial', ownerCommissionRate: 61, rentalValue: 7000, platformCommission: 1050, operatorShare: 1680, ownerShare: 4270, settlement: 'Settled' },
]

export type TotalBookingStatus = 'Completed' | 'Ongoing' | 'Upcoming' | 'Cancelled'

export type BookingPriority = 'Normal' | 'Priority'

export type BookingCustomerType = 'Company / Project' | 'Individual / Personal'

export type TotalBookingRecord = {
  id: string
  customerId: string
  customerName: string
  customerType: BookingCustomerType
  ownerId: string
  ownerName: string
  operatorId: string
  operatorName: string
  equipment: string
  plan: 'Daily' | 'Weekly' | 'Monthly' | 'Project'
  state: string
  city: string
  zone: string
  startDate: string
  endDate: string
  amount: number
  status: TotalBookingStatus
  priority: BookingPriority
  details: string
}

export const totalBookingRecords: TotalBookingRecord[] = [
  { id: 'TB-12001', customerId: 'CUST-4821', customerName: 'Sri Krishna Projects', customerType: 'Company / Project', ownerId: 'OWN-2201', ownerName: 'Deccan Heavy Machinery', operatorId: 'OPR-3390', operatorName: 'Gopal Rao', equipment: 'JCB 3DX', plan: 'Monthly', state: 'Telangana', city: 'Hyderabad', zone: 'Gachibowli', startDate: '02-Oct-26', endDate: '01-Nov-26', amount: 74970, status: 'Ongoing', priority: 'Priority', details: 'Backhoe loader for metro site excavation with operator and fuel.' },
  { id: 'TB-12002', customerId: 'CUST-4833', customerName: 'Charminar Infra', customerType: 'Company / Project', ownerId: 'OWN-2202', ownerName: 'Sri Krishna Equipment Rentals', operatorId: 'OPR-3391', operatorName: 'Ravi Teja', equipment: 'CAT 320 GC', plan: 'Project', state: 'Telangana', city: 'Hyderabad', zone: 'Hitech City', startDate: '01-Oct-26', endDate: '30-Dec-26', amount: 275910, status: 'Ongoing', priority: 'Normal', details: 'Excavator package for a three-month township project.' },
  { id: 'TB-12003', customerId: 'CUST-4840', customerName: 'Pune Metro Contractors', customerType: 'Company / Project', ownerId: 'OWN-2210', ownerName: 'Sahyadri Plant Hire', operatorId: 'OPR-3402', operatorName: 'Naresh Kumar', equipment: 'Hydraulic Crane 25T', plan: 'Weekly', state: 'Maharashtra', city: 'Pune', zone: 'Hinjewadi', startDate: '04-Oct-26', endDate: '11-Oct-26', amount: 38493, status: 'Completed', priority: 'Priority', details: 'Crane deployment for precast girder lifting.' },
  { id: 'TB-12004', customerId: 'CUST-4855', customerName: 'Bengaluru BuildTech', customerType: 'Company / Project', ownerId: 'OWN-2215', ownerName: 'Karnataka Earthmovers', operatorId: 'OPR-3410', operatorName: 'Mahesh Kumar', equipment: 'Komatsu PC200', plan: 'Monthly', state: 'Karnataka', city: 'Bengaluru', zone: 'Whitefield', startDate: '06-Oct-26', endDate: '05-Nov-26', amount: 88488, status: 'Ongoing', priority: 'Priority', details: 'Excavation and trenching for a data-centre build.' },
  { id: 'TB-12005', customerId: 'CUST-4861', customerName: 'Raman Nair', customerType: 'Individual / Personal', ownerId: 'OWN-2220', ownerName: 'Marina Machinery', operatorId: 'OPR-3418', operatorName: 'Imran Sheikh', equipment: 'Compactor RM-800', plan: 'Daily', state: 'Tamil Nadu', city: 'Chennai', zone: 'Guindy', startDate: '08-Oct-26', endDate: '10-Oct-26', amount: 6150, status: 'Ongoing', priority: 'Normal', details: 'Compaction for a driveway and garden work at a private residence.' },
  { id: 'TB-12006', customerId: 'CUST-4870', customerName: 'Delhi Urban Infra', customerType: 'Company / Project', ownerId: 'OWN-2224', ownerName: 'Capital Equipment Bank', operatorId: 'OPR-3425', operatorName: 'Venkat Rao', equipment: 'Tower Crane TC-6', plan: 'Project', state: 'Delhi', city: 'Delhi', zone: 'Okhla', startDate: '12-Oct-26', endDate: '12-Jan-27', amount: 352000, status: 'Upcoming', priority: 'Priority', details: 'Tower crane for a high-rise commercial tower.' },
  { id: 'TB-12007', customerId: 'CUST-4878', customerName: 'Warangal Roads Authority', customerType: 'Company / Project', ownerId: 'OWN-2231', ownerName: 'Warangal Earthmovers', operatorId: 'OPR-3433', operatorName: 'Kiran Vardhan', equipment: 'MG-180 Motor Grader', plan: 'Weekly', state: 'Telangana', city: 'Warangal', zone: 'Warangal Central', startDate: '03-Oct-26', endDate: '10-Oct-26', amount: 26600, status: 'Completed', priority: 'Normal', details: 'Grading for a state highway shoulder repair.' },
  { id: 'TB-12008', customerId: 'CUST-4884', customerName: 'Hubli Cement Works', customerType: 'Company / Project', ownerId: 'OWN-2238', ownerName: 'North Karnataka Rentals', operatorId: 'OPR-3440', operatorName: 'Ashok Yadav', equipment: 'Tipper 10W', plan: 'Monthly', state: 'Karnataka', city: 'Hubli', zone: 'Hubli Industrial Area', startDate: '05-Oct-26', endDate: '04-Nov-26', amount: 129000, status: 'Ongoing', priority: 'Normal', details: 'Aggregate hauling for a cement plant expansion.' },
  { id: 'TB-12009', customerId: 'CUST-4890', customerName: 'Valli Devi', customerType: 'Individual / Personal', ownerId: 'OWN-2244', ownerName: 'Kongu Plant Solutions', operatorId: 'OPR-3448', operatorName: 'Suresh Babu', equipment: 'Schwing Stetter S4', plan: 'Daily', state: 'Tamil Nadu', city: 'Coimbatore', zone: 'Peelamedu', startDate: '09-Oct-26', endDate: '09-Oct-26', amount: 5400, status: 'Completed', priority: 'Priority', details: 'Concrete pumping for a concrete slab of a private home construction.' },
  { id: 'TB-12010', customerId: 'CUST-4896', customerName: 'Nalgonda Irrigation Dept', customerType: 'Company / Project', ownerId: 'OWN-2250', ownerName: 'Deccan Heavy Machinery', operatorId: 'OPR-3455', operatorName: 'Gopal Rao', equipment: 'Skid Steer S650', plan: 'Weekly', state: 'Telangana', city: 'Nalgonda', zone: 'Nalgonda Town', startDate: '11-Oct-26', endDate: '18-Oct-26', amount: 17430, status: 'Upcoming', priority: 'Normal', details: 'Canal bank clearing and light earthmoving.' },
  { id: 'TB-12011', customerId: 'CUST-4902', customerName: 'Mumbai Coastal Builders', customerType: 'Company / Project', ownerId: 'OWN-2256', ownerName: 'Sahyadri Plant Hire', operatorId: 'OPR-3461', operatorName: 'Naresh Kumar', equipment: 'Hydraulic Crane 25T', plan: 'Monthly', state: 'Maharashtra', city: 'Mumbai', zone: 'Andheri East', startDate: '01-Oct-26', endDate: '31-Oct-26', amount: 168000, status: 'Cancelled', priority: 'Normal', details: 'Cancelled after the client deferred site mobilisation.' },
  { id: 'TB-12012', customerId: 'CUST-4909', customerName: 'Suryapet Solar Farms', customerType: 'Company / Project', ownerId: 'OWN-2262', ownerName: 'Greenfield Machinery', operatorId: 'OPR-3468', operatorName: 'Kavya Sree', equipment: 'Backhoe Loader', plan: 'Project', state: 'Telangana', city: 'Suryapet', zone: 'Suryapet Town', startDate: '07-Oct-26', endDate: '06-Dec-26', amount: 198000, status: 'Ongoing', priority: 'Priority', details: 'Trenching and foundation work for a solar park.' },
]

export type VehicleStatus = 'Available' | 'On Hire' | 'Maintenance' | 'Idle'

export type ActiveVehicleRecord = {
  id: string
  equipment: string
  category: string
  ownerId: string
  ownerName: string
  operatorId: string
  operatorName: string
  state: string
  city: string
  status: VehicleStatus
  utilization: number
  dailyRate: number
  lastService: string
  details: string
}

export const activeVehicleRecords: ActiveVehicleRecord[] = [
  { id: 'VH-5001', equipment: 'JCB 3DX', category: 'Backhoe Loader', ownerId: 'OWN-2201', ownerName: 'Deccan Heavy Machinery', operatorId: 'OPR-3390', operatorName: 'Gopal Rao', state: 'Telangana', city: 'Hyderabad', status: 'On Hire', utilization: 92, dailyRate: 4200, lastService: '21-Sep-26', details: 'Assigned to TB-12001 at the metro excavation site.' },
  { id: 'VH-5002', equipment: 'CAT 320 GC', category: 'Excavator', ownerId: 'OWN-2202', ownerName: 'Sri Krishna Equipment Rentals', operatorId: 'OPR-3391', operatorName: 'Ravi Teja', state: 'Telangana', city: 'Hyderabad', status: 'On Hire', utilization: 88, dailyRate: 5600, lastService: '18-Sep-26', details: 'Township project excavator on a three-month hire.' },
  { id: 'VH-5003', equipment: 'Hydraulic Crane 25T', category: 'Crane', ownerId: 'OWN-2210', ownerName: 'Sahyadri Plant Hire', operatorId: 'OPR-3402', operatorName: 'Naresh Kumar', state: 'Maharashtra', city: 'Pune', status: 'Available', utilization: 61, dailyRate: 6800, lastService: '27-Sep-26', details: 'Serviced and idle at the Pune yard, ready for dispatch.' },
  { id: 'VH-5004', equipment: 'Komatsu PC200', category: 'Excavator', ownerId: 'OWN-2215', ownerName: 'Karnataka Earthmovers', operatorId: 'OPR-3410', operatorName: 'Mahesh Kumar', state: 'Karnataka', city: 'Bengaluru', status: 'On Hire', utilization: 95, dailyRate: 5400, lastService: '15-Sep-26', details: 'Trenching for a data-centre build on a monthly plan.' },
  { id: 'VH-5005', equipment: 'Compactor RM-800', category: 'Compactor', ownerId: 'OWN-2220', ownerName: 'Marina Machinery', operatorId: 'OPR-3418', operatorName: 'Imran Sheikh', state: 'Tamil Nadu', city: 'Chennai', status: 'On Hire', utilization: 79, dailyRate: 3100, lastService: '29-Sep-26', details: 'Coastal road compaction on a short daily hire.' },
  { id: 'VH-5006', equipment: 'Tower Crane TC-6', category: 'Crane', ownerId: 'OWN-2224', ownerName: 'Capital Equipment Bank', operatorId: 'OPR-3425', operatorName: 'Venkat Rao', state: 'Delhi', city: 'Delhi', status: 'Available', utilization: 44, dailyRate: 8200, lastService: '30-Sep-26', details: 'Reserved for an upcoming high-rise booking from 12 Oct.' },
  { id: 'VH-5007', equipment: 'MG-180 Motor Grader', category: 'Grader', ownerId: 'OWN-2231', ownerName: 'Warangal Earthmovers', operatorId: 'OPR-3433', operatorName: 'Kiran Vardhan', state: 'Telangana', city: 'Warangal', status: 'Maintenance', utilization: 0, dailyRate: 3900, lastService: '08-Oct-26', details: 'Blade hydraulic repair in progress, back on 12 Oct.' },
  { id: 'VH-5008', equipment: 'Tipper 10W', category: 'Haulage', ownerId: 'OWN-2238', ownerName: 'North Karnataka Rentals', operatorId: 'OPR-3440', operatorName: 'Ashok Yadav', state: 'Karnataka', city: 'Hubli', status: 'On Hire', utilization: 84, dailyRate: 4600, lastService: '22-Sep-26', details: 'Aggregate hauling for a cement plant expansion.' },
  { id: 'VH-5009', equipment: 'Schwing Stetter S4', category: 'Concrete Pump', ownerId: 'OWN-2244', ownerName: 'Kongu Plant Solutions', operatorId: 'OPR-3448', operatorName: 'Suresh Babu', state: 'Tamil Nadu', city: 'Coimbatore', status: 'Idle', utilization: 23, dailyRate: 5400, lastService: '25-Sep-26', details: 'Idle at the yard after the factory slab pour completed.' },
  { id: 'VH-5010', equipment: 'Skid Steer S650', category: 'Skid Steer', ownerId: 'OWN-2250', ownerName: 'Deccan Heavy Machinery', operatorId: 'OPR-3455', operatorName: 'Gopal Rao', state: 'Telangana', city: 'Nalgonda', status: 'Available', utilization: 58, dailyRate: 2490, lastService: '26-Sep-26', details: 'Available for canal bank clearing from 11 Oct.' },
  { id: 'VH-5011', equipment: 'Backhoe Loader', category: 'Backhoe Loader', ownerId: 'OWN-2262', ownerName: 'Greenfield Machinery', operatorId: 'OPR-3468', operatorName: 'Kavya Sree', state: 'Telangana', city: 'Suryapet', status: 'On Hire', utilization: 91, dailyRate: 4000, lastService: '19-Sep-26', details: 'Solar park trenching on a two-month project plan.' },
  { id: 'VH-5012', equipment: 'Dozer D6', category: 'Dozer', ownerId: 'OWN-2210', ownerName: 'Sahyadri Plant Hire', operatorId: 'OPR-3402', operatorName: 'Naresh Kumar', state: 'Maharashtra', city: 'Mumbai', status: 'Maintenance', utilization: 0, dailyRate: 7200, lastService: '06-Oct-26', details: 'Undercarriage replacement scheduled this week.' },
  { id: 'VH-5013', equipment: 'Boom Lift 12m', category: 'Aerial', ownerId: 'OWN-2224', ownerName: 'Capital Equipment Bank', operatorId: 'OPR-3425', operatorName: 'Venkat Rao', state: 'Delhi', city: 'Delhi', status: 'Available', utilization: 66, dailyRate: 2900, lastService: '28-Sep-26', details: 'Inspected and available for warehousing work.' },
  { id: 'VH-5014', equipment: 'Poclain 140', category: 'Excavator', ownerId: 'OWN-2215', ownerName: 'Karnataka Earthmovers', operatorId: 'OPR-3410', operatorName: 'Mahesh Kumar', state: 'Karnataka', city: 'Mysuru', status: 'Idle', utilization: 31, dailyRate: 5100, lastService: '24-Sep-26', details: 'Idle since the irrigation contract wrapped up.' },
]

export type OperatorStatus = 'Available' | 'On Job' | 'Off Duty' | 'On Leave'

export type ActiveOperatorRecord = {
  id: string
  name: string
  skill: string
  ownerId: string
  ownerName: string
  state: string
  city: string
  status: OperatorStatus
  rating: number
  completedJobs: number
  experienceYears: number
  lastActive: string
  details: string
}

export const activeOperatorRecords: ActiveOperatorRecord[] = [
  { id: 'OPR-3390', name: 'Gopal Rao', skill: 'Backhoe Loader', ownerId: 'OWN-2201', ownerName: 'Deccan Heavy Machinery', state: 'Telangana', city: 'Hyderabad', status: 'On Job', rating: 4.8, completedJobs: 214, experienceYears: 9, lastActive: '09-Oct-26', details: 'Operating VH-5001 on the metro excavation booking.' },
  { id: 'OPR-3391', name: 'Ravi Teja', skill: 'Excavator', ownerId: 'OWN-2202', ownerName: 'Sri Krishna Equipment Rentals', state: 'Telangana', city: 'Hyderabad', status: 'On Job', rating: 4.7, completedJobs: 186, experienceYears: 7, lastActive: '09-Oct-26', details: 'Assigned to the township project on VH-5002.' },
  { id: 'OPR-3402', name: 'Naresh Kumar', skill: 'Crane', ownerId: 'OWN-2210', ownerName: 'Sahyadri Plant Hire', state: 'Maharashtra', city: 'Pune', status: 'On Job', rating: 4.9, completedJobs: 241, experienceYears: 11, lastActive: '08-Oct-26', details: 'Completing the precast girder lifting hire.' },
  { id: 'OPR-3410', name: 'Mahesh Kumar', skill: 'Excavator', ownerId: 'OWN-2215', ownerName: 'Karnataka Earthmovers', state: 'Karnataka', city: 'Bengaluru', status: 'On Job', rating: 4.6, completedJobs: 158, experienceYears: 6, lastActive: '09-Oct-26', details: 'Trenching for the data-centre build on VH-5004.' },
  { id: 'OPR-3418', name: 'Imran Sheikh', skill: 'Compactor', ownerId: 'OWN-2220', ownerName: 'Marina Machinery', state: 'Tamil Nadu', city: 'Chennai', status: 'On Job', rating: 4.5, completedJobs: 132, experienceYears: 5, lastActive: '09-Oct-26', details: 'Riding the coastal road compaction hire.' },
  { id: 'OPR-3425', name: 'Venkat Rao', skill: 'Crane', ownerId: 'OWN-2224', ownerName: 'Capital Equipment Bank', state: 'Delhi', city: 'Delhi', status: 'Available', rating: 4.7, completedJobs: 198, experienceYears: 8, lastActive: '07-Oct-26', details: 'Cleared for the upcoming tower crane booking.' },
  { id: 'OPR-3433', name: 'Kiran Vardhan', skill: 'Grader', ownerId: 'OWN-2231', ownerName: 'Warangal Earthmovers', state: 'Telangana', city: 'Warangal', status: 'Off Duty', rating: 4.4, completedJobs: 121, experienceYears: 6, lastActive: '06-Oct-26', details: 'Off rotation after the highway shoulder job closed.' },
  { id: 'OPR-3440', name: 'Ashok Yadav', skill: 'Haulage', ownerId: 'OWN-2238', ownerName: 'North Karnataka Rentals', state: 'Karnataka', city: 'Hubli', status: 'On Job', rating: 4.6, completedJobs: 175, experienceYears: 7, lastActive: '09-Oct-26', details: 'Hauling aggregate for the cement plant expansion.' },
  { id: 'OPR-3448', name: 'Suresh Babu', skill: 'Concrete Pump', ownerId: 'OWN-2244', ownerName: 'Kongu Plant Solutions', state: 'Tamil Nadu', city: 'Coimbatore', status: 'Available', rating: 4.8, completedJobs: 203, experienceYears: 10, lastActive: '08-Oct-26', details: 'Available after the factory slab pour completed.' },
  { id: 'OPR-3455', name: 'Balu Naik', skill: 'Skid Steer', ownerId: 'OWN-2250', ownerName: 'Deccan Heavy Machinery', state: 'Telangana', city: 'Nalgonda', status: 'Available', rating: 4.3, completedJobs: 96, experienceYears: 4, lastActive: '05-Oct-26', details: 'Available for canal bank clearing from 11 Oct.' },
  { id: 'OPR-3461', name: 'Ramesh Pawar', skill: 'Crane', ownerId: 'OWN-2256', ownerName: 'Sahyadri Plant Hire', state: 'Maharashtra', city: 'Mumbai', status: 'On Leave', rating: 4.7, completedJobs: 189, experienceYears: 9, lastActive: '02-Oct-26', details: 'On approved leave until 14 Oct.' },
  { id: 'OPR-3468', name: 'Kavya Sree', skill: 'Backhoe Loader', ownerId: 'OWN-2262', ownerName: 'Greenfield Machinery', state: 'Telangana', city: 'Suryapet', status: 'On Job', rating: 4.9, completedJobs: 167, experienceYears: 6, lastActive: '09-Oct-26', details: 'Solar park trenching on a two-month project.' },
  { id: 'OPR-3472', name: 'Sana Fatima', skill: 'Aerial Lift', ownerId: 'OWN-2224', ownerName: 'Capital Equipment Bank', state: 'Delhi', city: 'Delhi', status: 'Available', rating: 4.6, completedJobs: 88, experienceYears: 3, lastActive: '08-Oct-26', details: 'Available for warehousing and maintenance work.' },
  { id: 'OPR-3479', name: 'Deepak Verma', skill: 'Dozer', ownerId: 'OWN-2210', ownerName: 'Sahyadri Plant Hire', state: 'Maharashtra', city: 'Mumbai', status: 'Off Duty', rating: 4.5, completedJobs: 144, experienceYears: 8, lastActive: '04-Oct-26', details: 'Off duty while VH-5012 undergoes undercarriage repair.' },
]

export type PartnerStatus = 'Active' | 'Pending' | 'Suspended' | 'Dormant'

export type FleetPartnerRecord = {
  id: string
  name: string
  contactName: string
  state: string
  city: string
  status: PartnerStatus
  fleetSize: number
  activeVehicles: number
  rating: number
  joinedOn: string
  details: string
}

export const fleetPartnerRecords: FleetPartnerRecord[] = [
  { id: 'FP-8001', name: 'Deccan Heavy Machinery', contactName: 'Srinivas Reddy', state: 'Telangana', city: 'Hyderabad', status: 'Active', fleetSize: 86, activeVehicles: 74, rating: 4.8, joinedOn: '12-Mar-24', details: 'Long-standing partner supplying backhoes and skid steers.' },
  { id: 'FP-8002', name: 'Sri Krishna Equipment Rentals', contactName: 'Lakshmi Prasad', state: 'Telangana', city: 'Hyderabad', status: 'Active', fleetSize: 64, activeVehicles: 58, rating: 4.7, joinedOn: '02-Jun-24', details: 'Excavator-heavy fleet serving township projects.' },
  { id: 'FP-8003', name: 'Sahyadri Plant Hire', contactName: 'Prakash Deshmukh', state: 'Maharashtra', city: 'Pune', status: 'Active', fleetSize: 112, activeVehicles: 97, rating: 4.9, joinedOn: '18-Jan-24', details: 'Large crane and dozer fleet across western India.' },
  { id: 'FP-8004', name: 'Karnataka Earthmovers', contactName: 'Raghav Gowda', state: 'Karnataka', city: 'Bengaluru', status: 'Active', fleetSize: 73, activeVehicles: 66, rating: 4.6, joinedOn: '27-Apr-24', details: 'Excavators and haulage for infra and data-centre work.' },
  { id: 'FP-8005', name: 'Marina Machinery', contactName: 'Karthik Subramanian', state: 'Tamil Nadu', city: 'Chennai', status: 'Active', fleetSize: 48, activeVehicles: 41, rating: 4.5, joinedOn: '09-Aug-24', details: 'Compaction and road-building equipment specialist.' },
  { id: 'FP-8006', name: 'Capital Equipment Bank', contactName: 'Aditya Malhotra', state: 'Delhi', city: 'Delhi', status: 'Pending', fleetSize: 58, activeVehicles: 0, rating: 4.7, joinedOn: '28-Sep-26', details: 'Awaiting document verification before approval.' },
  { id: 'FP-8007', name: 'Warangal Earthmovers', contactName: 'Bhaskar Rao', state: 'Telangana', city: 'Warangal', status: 'Active', fleetSize: 39, activeVehicles: 33, rating: 4.4, joinedOn: '15-May-24', details: 'Graders and rollers for highway maintenance.' },
  { id: 'FP-8008', name: 'North Karnataka Rentals', contactName: 'Sunil Patil', state: 'Karnataka', city: 'Hubli', status: 'Active', fleetSize: 52, activeVehicles: 45, rating: 4.6, joinedOn: '21-Feb-24', details: 'Tipper and haulage fleet for industrial sites.' },
  { id: 'FP-8009', name: 'Kongu Plant Solutions', contactName: 'Senthil Kumar', state: 'Tamil Nadu', city: 'Coimbatore', status: 'Active', fleetSize: 44, activeVehicles: 37, rating: 4.8, joinedOn: '30-Jul-24', details: 'Concrete pumps and batching support equipment.' },
  { id: 'FP-8010', name: 'Greenfield Machinery', contactName: 'Anil Chowdary', state: 'Telangana', city: 'Suryapet', status: 'Pending', fleetSize: 26, activeVehicles: 0, rating: 4.5, joinedOn: '05-Oct-26', details: 'New applicant onboarding for solar-park projects.' },
  { id: 'FP-8011', name: 'Coastal Plant Services', contactName: 'Deepak Shetty', state: 'Maharashtra', city: 'Mumbai', status: 'Suspended', fleetSize: 61, activeVehicles: 0, rating: 4.1, joinedOn: '11-Nov-23', details: 'Suspended pending a compliance and insurance review.' },
  { id: 'FP-8012', name: 'Telangana Tractor House', contactName: 'Ramulu Yadav', state: 'Telangana', city: 'Nizamabad', status: 'Dormant', fleetSize: 18, activeVehicles: 3, rating: 4.2, joinedOn: '08-Aug-23', details: 'Low activity; fleet mostly idle since June.' },
  { id: 'FP-8013', name: 'Mysuru Machinery Mart', contactName: 'Girish Hegde', state: 'Karnataka', city: 'Mysuru', status: 'Active', fleetSize: 35, activeVehicles: 29, rating: 4.7, joinedOn: '03-Sep-24', details: 'Excavators and compactors for local contracts.' },
]

export type CityStatus = 'Active' | 'Launching' | 'Paused' | 'Planned'

export type ActiveCityRecord = {
  id: string
  name: string
  state: string
  status: CityStatus
  zones: number
  activeVehicles: number
  activeOperators: number
  monthlyBookings: number
  launchedOn: string
  details: string
}

export const activeCityRecords: ActiveCityRecord[] = [
  { id: 'CT-1001', name: 'Hyderabad', state: 'Telangana', status: 'Active', zones: 24, activeVehicles: 812, activeOperators: 386, monthlyBookings: 2410, launchedOn: '14-Jan-24', details: 'Largest metro market, strong excavation demand.' },
  { id: 'CT-1002', name: 'Mumbai', state: 'Maharashtra', status: 'Active', zones: 19, activeVehicles: 684, activeOperators: 322, monthlyBookings: 1980, launchedOn: '14-Jan-24', details: 'High crane and haulage utilisation across port sites.' },
  { id: 'CT-1003', name: 'Bengaluru', state: 'Karnataka', status: 'Active', zones: 21, activeVehicles: 731, activeOperators: 351, monthlyBookings: 2165, launchedOn: '02-Feb-24', details: 'Infra and data-centre projects driving volume.' },
  { id: 'CT-1004', name: 'Chennai', state: 'Tamil Nadu', status: 'Active', zones: 16, activeVehicles: 498, activeOperators: 241, monthlyBookings: 1420, launchedOn: '18-Mar-24', details: 'Coastal road and compactor-heavy workload.' },
  { id: 'CT-1005', name: 'Delhi', state: 'Delhi', status: 'Active', zones: 17, activeVehicles: 522, activeOperators: 258, monthlyBookings: 1510, launchedOn: '27-Apr-24', details: 'Commercial high-rise and tower crane bookings.' },
  { id: 'CT-1006', name: 'Pune', state: 'Maharashtra', status: 'Active', zones: 13, activeVehicles: 366, activeOperators: 174, monthlyBookings: 1045, launchedOn: '09-May-24', details: 'Growing western-India partner network.' },
  { id: 'CT-1007', name: 'Warangal', state: 'Telangana', status: 'Active', zones: 8, activeVehicles: 148, activeOperators: 72, monthlyBookings: 402, launchedOn: '21-Jun-24', details: 'Highway and irrigation maintenance work.' },
  { id: 'CT-1008', name: 'Coimbatore', state: 'Tamil Nadu', status: 'Active', zones: 9, activeVehicles: 162, activeOperators: 81, monthlyBookings: 438, launchedOn: '30-Jul-24', details: 'Industrial and factory-floor concrete work.' },
  { id: 'CT-1009', name: 'Hubli', state: 'Karnataka', status: 'Launching', zones: 6, activeVehicles: 74, activeOperators: 38, monthlyBookings: 168, launchedOn: '19-Sep-26', details: 'Pilot launch with a small partner fleet.' },
  { id: 'CT-1010', name: 'Nizamabad', state: 'Telangana', status: 'Paused', zones: 4, activeVehicles: 12, activeOperators: 6, monthlyBookings: 24, launchedOn: '08-Aug-25', details: 'Operations paused during a demand review.' },
  { id: 'CT-1011', name: 'Suryapet', state: 'Telangana', status: 'Launching', zones: 5, activeVehicles: 41, activeOperators: 22, monthlyBookings: 96, launchedOn: '05-Oct-26', details: 'Solar-park projects onboarding new partners.' },
  { id: 'CT-1012', name: 'Mysuru', state: 'Karnataka', status: 'Planned', zones: 3, activeVehicles: 0, activeOperators: 0, monthlyBookings: 0, launchedOn: '—', details: 'Scheduled for launch after partner onboarding.' },
]

export type ZoneStatus = 'Active' | 'Launching' | 'Paused' | 'Planned'

export type ActiveZoneRecord = {
  id: string
  name: string
  city: string
  state: string
  status: ZoneStatus
  activeVehicles: number
  activeOperators: number
  monthlyBookings: number
  areaKm2: number
  manager: string
  details: string
}

export const activeZoneRecords: ActiveZoneRecord[] = [
  { id: 'ZN-2001', name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', status: 'Active', activeVehicles: 164, activeOperators: 78, monthlyBookings: 512, areaKm2: 42, manager: 'Kavitha Reddy', details: 'IT corridor with steady excavation demand.' },
  { id: 'ZN-2002', name: 'Hitech City', city: 'Hyderabad', state: 'Telangana', status: 'Active', activeVehicles: 148, activeOperators: 71, monthlyBookings: 468, areaKm2: 38, manager: 'Kavitha Reddy', details: 'Commercial high-rises and crane bookings.' },
  { id: 'ZN-2003', name: 'Kukatpally', city: 'Hyderabad', state: 'Telangana', status: 'Active', activeVehicles: 121, activeOperators: 58, monthlyBookings: 372, areaKm2: 34, manager: 'Ravi Shankar', details: 'Residential and road-works equipment hire.' },
  { id: 'ZN-2004', name: 'LB Nagar', city: 'Hyderabad', state: 'Telangana', status: 'Launching', activeVehicles: 46, activeOperators: 22, monthlyBookings: 108, areaKm2: 29, manager: 'Ravi Shankar', details: 'New zone ramping up partner coverage.' },
  { id: 'ZN-2005', name: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', status: 'Active', activeVehicles: 152, activeOperators: 74, monthlyBookings: 486, areaKm2: 26, manager: 'Prakash Deshmukh', details: 'Port and metro works with high utilisation.' },
  { id: 'ZN-2006', name: 'Navi Mumbai', city: 'Mumbai', state: 'Maharashtra', status: 'Active', activeVehicles: 118, activeOperators: 56, monthlyBookings: 354, areaKm2: 40, manager: 'Prakash Deshmukh', details: 'Infra and haulage-heavy zone.' },
  { id: 'ZN-2007', name: 'Thane', city: 'Mumbai', state: 'Maharashtra', status: 'Paused', activeVehicles: 22, activeOperators: 11, monthlyBookings: 48, areaKm2: 31, manager: 'Deepak Shetty', details: 'Operations paused during a compliance review.' },
  { id: 'ZN-2008', name: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', status: 'Active', activeVehicles: 143, activeOperators: 69, monthlyBookings: 442, areaKm2: 36, manager: 'Raghav Gowda', details: 'Data-centre and tech-park construction demand.' },
  { id: 'ZN-2009', name: 'Electronic City', city: 'Bengaluru', state: 'Karnataka', status: 'Active', activeVehicles: 126, activeOperators: 61, monthlyBookings: 388, areaKm2: 33, manager: 'Raghav Gowda', details: 'Factory and warehousing equipment hire.' },
  { id: 'ZN-2010', name: 'Yeshwanthpur', city: 'Bengaluru', state: 'Karnataka', status: 'Launching', activeVehicles: 39, activeOperators: 19, monthlyBookings: 92, areaKm2: 27, manager: 'Sunil Patil', details: 'Pilot zone onboarding local partners.' },
  { id: 'ZN-2011', name: 'Guindy', city: 'Chennai', state: 'Tamil Nadu', status: 'Active', activeVehicles: 104, activeOperators: 51, monthlyBookings: 318, areaKm2: 24, manager: 'Karthik Subramanian', details: 'Industrial estate with concrete pump demand.' },
  { id: 'ZN-2012', name: 'Okhla', city: 'Delhi', state: 'Delhi', status: 'Active', activeVehicles: 96, activeOperators: 47, monthlyBookings: 286, areaKm2: 22, manager: 'Aditya Malhotra', details: 'Commercial construction and aerial lift work.' },
  { id: 'ZN-2013', name: 'Hinjewadi', city: 'Pune', state: 'Maharashtra', status: 'Planned', activeVehicles: 0, activeOperators: 0, monthlyBookings: 0, areaKm2: 28, manager: 'Unassigned', details: 'Scheduled for launch after partner onboarding.' },
]

export const kpiMonths = [
  { short: 'May', full: 'May 2026' },
  { short: 'Jun', full: 'June 2026' },
  { short: 'Jul', full: 'July 2026' },
  { short: 'Aug', full: 'August 2026' },
  { short: 'Sep', full: 'September 2026' },
]

export function formatKpiValue(metric: KpiMetric, value: number) {
  return metric.currency ? `₹${value.toFixed(2)}M` : Math.round(value).toLocaleString('en-IN')
}

export function formatKpiDelta(metric: KpiMetric, value: number) {
  const sign = value >= 0 ? '+' : '-'
  const formattedValue = metric.currency
    ? `₹${Math.abs(value).toFixed(2)}M`
    : Math.abs(Math.round(value)).toLocaleString('en-IN')
  return `${sign}${formattedValue}`
}

export function getKpiSlug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function getKpiIndexFromLocation() {
  if (typeof window === 'undefined' || !window.location.hash.startsWith('#super-admin/kpi/')) return null
  const slug = window.location.hash.slice('#super-admin/kpi/'.length)
  const index = kpiMetrics.findIndex((metric) => getKpiSlug(metric.label) === slug)
  return index < 0 ? null : index
}

export type BookingStatusFilter = 'All' | 'Completed' | 'Ongoing' | 'Upcoming' | 'Cancelled'

