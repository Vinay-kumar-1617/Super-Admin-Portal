// State-scoped location management data for the Telangana State Admin dashboard.
export type LocationTab = 'cities' | 'zones' | 'admins' | 'activity' | 'performance'

export const locationTabs: Array<{ id: LocationTab; label: string; hint: string }> = [
  { id: 'cities', label: 'Cities', hint: 'View, create and manage cities in the state' },
  { id: 'zones', label: 'Zones', hint: 'Create and manage zones within each city' },
  { id: 'admins', label: 'Admin assignments', hint: 'Assign City Admins and Zone Admins' },
  { id: 'activity', label: 'Applications, properties & users', hint: 'Applications, properties and users by location' },
  { id: 'performance', label: 'Performance', hint: 'City-wise and zone-wise performance monitoring' },
]

export type LocationStatus = 'Active' | 'Inactive' | 'Pending activation'
export type ZoneStatus = 'Active' | 'Review' | 'Inactive'

export type AdminOfficer = {
  id: string
  name: string
  email: string
}

export const cityAdminPool: AdminOfficer[] = [
  { id: 'CA-101', name: 'Anil Kumar', email: 'anil.kumar@ts-rental.gov.in' },
  { id: 'CA-102', name: 'Swapna Reddy', email: 'swapna.reddy@ts-rental.gov.in' },
  { id: 'CA-103', name: 'Mohan Rao', email: 'mohan.rao@ts-rental.gov.in' },
  { id: 'CA-104', name: 'Lakshmi Prasanna', email: 'lakshmi.prasanna@ts-rental.gov.in' },
  { id: 'CA-105', name: 'Ravi Shankar', email: 'ravi.shankar@ts-rental.gov.in' },
  { id: 'CA-106', name: 'Deepa Nair', email: 'deepa.nair@ts-rental.gov.in' },
  { id: 'CA-107', name: 'Imran Khan', email: 'imran.khan@ts-rental.gov.in' },
  { id: 'CA-108', name: 'Kavya Sri', email: 'kavya.sri@ts-rental.gov.in' },
]

export const zoneAdminPool: AdminOfficer[] = [
  { id: 'ZA-201', name: 'Srinivas Rao', email: 'srinivas.rao@ts-rental.gov.in' },
  { id: 'ZA-202', name: 'Bhavani Devi', email: 'bhavani.devi@ts-rental.gov.in' },
  { id: 'ZA-203', name: 'Naresh Kumar', email: 'naresh.kumar@ts-rental.gov.in' },
  { id: 'ZA-204', name: 'Anitha Kumari', email: 'anitha.kumari@ts-rental.gov.in' },
  { id: 'ZA-205', name: 'Rajesh Goud', email: 'rajesh.goud@ts-rental.gov.in' },
  { id: 'ZA-206', name: 'Sunitha Rao', email: 'sunitha.rao@ts-rental.gov.in' },
  { id: 'ZA-207', name: 'Mahesh Babu', email: 'mahesh.babu@ts-rental.gov.in' },
  { id: 'ZA-208', name: 'Farhana Begum', email: 'farhana.begum@ts-rental.gov.in' },
  { id: 'ZA-209', name: 'Vijayendra', email: 'vijayendra@ts-rental.gov.in' },
  { id: 'ZA-210', name: 'Prasad Rao', email: 'prasad.rao@ts-rental.gov.in' },
  { id: 'ZA-211', name: 'Shanti Kumari', email: 'shanti.kumari@ts-rental.gov.in' },
  { id: 'ZA-212', name: 'Kiran Kumar', email: 'kiran.kumar@ts-rental.gov.in' },
]

export type ManagedCity = {
  id: string
  name: string
  code: string
  status: LocationStatus
  zones: number
  machines: number
  operators: number
  bookings: number
  utilization: number
  revenue: string
  satisfaction: number
  slaPct: number
  applications: number
  properties: number
  users: number
  pendingApprovals: number
  adminId: string | null
  admin: string | null
}

export type ManagedZone = {
  id: string
  name: string
  city: string
  status: ZoneStatus
  machines: number
  operators: number
  openJobs: number
  utilization: number
  satisfaction: number
  applications: number
  properties: number
  users: number
  adminId: string | null
  admin: string | null
}

export const managedCities: ManagedCity[] = [
  { id: 'cty-hyd', name: 'Hyderabad', code: 'HYD', status: 'Active', zones: 6, machines: 212, operators: 298, bookings: 1286, utilization: 93, revenue: '₹4.62M', satisfaction: 4.6, slaPct: 94, applications: 184, properties: 412, users: 1180, pendingApprovals: 9, adminId: 'CA-101', admin: 'Anil Kumar' },
  { id: 'cty-wgl', name: 'Warangal', code: 'WGL', status: 'Active', zones: 2, machines: 58, operators: 84, bookings: 286, utilization: 88, revenue: '₹0.94M', satisfaction: 4.4, slaPct: 90, applications: 62, properties: 138, users: 372, pendingApprovals: 4, adminId: 'CA-102', admin: 'Swapna Reddy' },
  { id: 'cty-krm', name: 'Karimnagar', code: 'KRM', status: 'Active', zones: 1, machines: 50, operators: 70, bookings: 240, utilization: 85, revenue: '₹0.81M', satisfaction: 4.3, slaPct: 88, applications: 48, properties: 116, users: 301, pendingApprovals: 3, adminId: 'CA-103', admin: 'Mohan Rao' },
  { id: 'cty-nzb', name: 'Nizamabad', code: 'NZB', status: 'Active', zones: 1, machines: 40, operators: 54, bookings: 178, utilization: 82, revenue: '₹0.62M', satisfaction: 4.2, slaPct: 86, applications: 39, properties: 94, users: 244, pendingApprovals: 2, adminId: 'CA-104', admin: 'Lakshmi Prasanna' },
  { id: 'cty-khm', name: 'Khammam', code: 'KHM', status: 'Active', zones: 1, machines: 38, operators: 50, bookings: 164, utilization: 80, revenue: '₹0.56M', satisfaction: 4.1, slaPct: 85, applications: 34, properties: 88, users: 219, pendingApprovals: 2, adminId: 'CA-105', admin: 'Ravi Shankar' },
  { id: 'cty-rmd', name: 'Ramagundam', code: 'RMD', status: 'Active', zones: 1, machines: 34, operators: 44, bookings: 142, utilization: 78, revenue: '₹0.48M', satisfaction: 4.0, slaPct: 83, applications: 28, properties: 72, users: 186, pendingApprovals: 1, adminId: 'CA-106', admin: 'Deepa Nair' },
  { id: 'cty-srt', name: 'Suryapet', code: 'SRT', status: 'Active', zones: 1, machines: 28, operators: 36, bookings: 118, utilization: 74, revenue: '₹0.36M', satisfaction: 3.9, slaPct: 81, applications: 22, properties: 58, users: 148, pendingApprovals: 1, adminId: null, admin: null },
  { id: 'cty-nlg', name: 'Nalgonda', code: 'NLG', status: 'Active', zones: 1, machines: 26, operators: 34, bookings: 104, utilization: 72, revenue: '₹0.32M', satisfaction: 3.8, slaPct: 80, applications: 19, properties: 51, users: 132, pendingApprovals: 1, adminId: 'CA-107', admin: 'Imran Khan' },
  { id: 'cty-spt', name: 'Siddipet', code: 'SPT', status: 'Pending activation', zones: 0, machines: 0, operators: 0, bookings: 0, utilization: 0, revenue: '₹0', satisfaction: 0, slaPct: 0, applications: 6, properties: 0, users: 0, pendingApprovals: 2, adminId: null, admin: null },
]

export const managedZones: ManagedZone[] = [
  { id: 'zn-hyd-1', name: 'Madhapur', city: 'Hyderabad', status: 'Active', machines: 52, operators: 68, openJobs: 16, utilization: 94, satisfaction: 4.7, applications: 42, properties: 96, users: 268, adminId: 'ZA-201', admin: 'Srinivas Rao' },
  { id: 'zn-hyd-2', name: 'Gachibowli', city: 'Hyderabad', status: 'Active', machines: 48, operators: 62, openJobs: 14, utilization: 92, satisfaction: 4.6, applications: 38, properties: 88, users: 244, adminId: 'ZA-202', admin: 'Bhavani Devi' },
  { id: 'zn-hyd-3', name: 'Kukatpally', city: 'Hyderabad', status: 'Active', machines: 44, operators: 56, openJobs: 12, utilization: 90, satisfaction: 4.5, applications: 34, properties: 79, users: 221, adminId: 'ZA-203', admin: 'Naresh Kumar' },
  { id: 'zn-hyd-4', name: 'Uppal', city: 'Hyderabad', status: 'Active', machines: 32, operators: 44, openJobs: 9, utilization: 86, satisfaction: 4.4, applications: 26, properties: 62, users: 176, adminId: 'ZA-204', admin: 'Anitha Kumari' },
  { id: 'zn-hyd-5', name: 'Begumpet', city: 'Hyderabad', status: 'Active', machines: 22, operators: 38, openJobs: 7, utilization: 84, satisfaction: 4.3, applications: 21, properties: 49, users: 142, adminId: 'ZA-205', admin: 'Rajesh Goud' },
  { id: 'zn-hyd-6', name: 'LB Nagar', city: 'Hyderabad', status: 'Review', machines: 14, operators: 30, openJobs: 5, utilization: 72, satisfaction: 3.9, applications: 23, properties: 38, users: 129, adminId: null, admin: null },
  { id: 'zn-wgl-1', name: 'Hanamkonda', city: 'Warangal', status: 'Active', machines: 32, operators: 44, openJobs: 7, utilization: 89, satisfaction: 4.5, applications: 36, properties: 74, users: 198, adminId: 'ZA-206', admin: 'Sunitha Rao' },
  { id: 'zn-wgl-2', name: 'Kazipet', city: 'Warangal', status: 'Active', machines: 26, operators: 40, openJobs: 5, utilization: 87, satisfaction: 4.3, applications: 26, properties: 64, users: 174, adminId: 'ZA-207', admin: 'Mahesh Babu' },
  { id: 'zn-krm-1', name: 'Chowrasta', city: 'Karimnagar', status: 'Active', machines: 50, operators: 70, openJobs: 8, utilization: 85, satisfaction: 4.3, applications: 48, properties: 116, users: 301, adminId: 'ZA-208', admin: 'Farhana Begum' },
  { id: 'zn-nzb-1', name: 'Bodhan Road', city: 'Nizamabad', status: 'Active', machines: 40, operators: 54, openJobs: 6, utilization: 82, satisfaction: 4.2, applications: 39, properties: 94, users: 244, adminId: 'ZA-209', admin: 'Vijayendra' },
  { id: 'zn-khm-1', name: 'Wyra Road', city: 'Khammam', status: 'Active', machines: 38, operators: 50, openJobs: 5, utilization: 80, satisfaction: 4.1, applications: 34, properties: 88, users: 219, adminId: 'ZA-210', admin: 'Prasad Rao' },
  { id: 'zn-rmd-1', name: 'Godavarikhani', city: 'Ramagundam', status: 'Review', machines: 34, operators: 44, openJobs: 4, utilization: 78, satisfaction: 4.0, applications: 28, properties: 72, users: 186, adminId: 'ZA-211', admin: 'Shanti Kumari' },
  { id: 'zn-srt-1', name: 'Alair Road', city: 'Suryapet', status: 'Active', machines: 28, operators: 36, openJobs: 3, utilization: 74, satisfaction: 3.9, applications: 22, properties: 58, users: 148, adminId: 'ZA-212', admin: 'Kiran Kumar' },
  { id: 'zn-nlg-1', name: 'Miryalaguda Road', city: 'Nalgonda', status: 'Review', machines: 26, operators: 34, openJobs: 3, utilization: 72, satisfaction: 3.8, applications: 19, properties: 51, users: 132, adminId: null, admin: null },
]

export const cityDeactivationRules = (city: ManagedCity): string[] => {
  const reasons: string[] = []
  if (city.zones > 0) reasons.push(`${city.zones} active zone${city.zones === 1 ? '' : 's'}`)
  if (city.machines > 0) reasons.push(`${city.machines} machines`)
  if (city.bookings > 0) reasons.push(`${city.bookings} bookings`)
  if (city.properties > 0) reasons.push(`${city.properties} properties`)
  return reasons
}

export const zoneDeactivationRules = (zone: ManagedZone): string[] => {
  const reasons: string[] = []
  if (zone.machines > 0) reasons.push(`${zone.machines} machines`)
  if (zone.openJobs > 0) reasons.push(`${zone.openJobs} open jobs`)
  if (zone.properties > 0) reasons.push(`${zone.properties} properties`)
  return reasons
}
