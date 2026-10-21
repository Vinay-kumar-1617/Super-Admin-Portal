// Zone-scoped reports & analytics datasets for the Madhapur Zone Admin dashboard.
// All data is limited to localities inside the Madhapur zone only.
// Role-based access: Zone Admin can only view reports for their assigned zone.
export type ZoneReportId =
  | 'bookings'
  | 'occupancy'
  | 'collections'
  | 'support'
  | 'sla'
  | 'transactions'
  | 'maintenance'
  | 'dispatch'
  | 'staff'
  | 'audit';

export type ZoneReportCategory = {
  id: ZoneReportId;
  label: string;
  description: string;
  icon: string;
};

export const zoneReportCatalog: ZoneReportCategory[] = [
  {
    id: 'bookings',
    label: 'Rental Applications',
    description: 'Booking volume, status and approval trends by locality',
    icon: 'calendar',
  },
  {
    id: 'occupancy',
    label: 'Vehicle Performance',
    description: 'Machine availability, utilization and performance by locality',
    icon: 'truck',
  },
  {
    id: 'collections',
    label: 'Revenue & Payments',
    description: 'Revenue collected, outstanding balances and payouts by locality',
    icon: 'rupee',
  },
  {
    id: 'support',
    label: 'Customer Support',
    description: 'Maintenance, incident and refund requests by type and locality',
    icon: 'headset',
  },
  {
    id: 'sla',
    label: 'SLA & Escalations',
    description: 'First-response and resolution SLA compliance by locality',
    icon: 'clock',
  },
  {
    id: 'transactions',
    label: 'Rental Transactions',
    description: 'Detailed rental transaction ledger by locality',
    icon: 'receipt',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    description: 'Machine maintenance requests, service history and costs',
    icon: 'wrench',
  },
  {
    id: 'dispatch',
    label: 'Dispatch Operations',
    description: 'Job assignments, dispatch SLAs and fleet movement by locality',
    icon: 'route',
  },
  {
    id: 'staff',
    label: 'Staff Performance',
    description: 'Operator and zone staff activity, jobs and ratings',
    icon: 'badge',
  },
  {
    id: 'audit',
    label: 'Audit Activity',
    description: 'Admin actions, access attempts and audit trail for the zone',
    icon: 'shield',
  },
];

export const zoneReportPeriods = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
];

export const zoneReportStatuses = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'overdue', label: 'Overdue' },
];

export const zoneLocalities = [
  'HITEC City',
  'Raidurg',
  'Kavuri Hills',
  'Manikonda',
  'Nanakramguda',
  'Kondapur',
];

export const zoneLocalityAreas: Record<string, string> = {
  'HITEC City': 'HITEC City corridor',
  Raidurg: 'Financial district',
  'Kavuri Hills': 'IT hub east',
  Manikonda: 'Residential corridor',
  Nanakramguda: 'Business district',
  Kondapur: 'Northern corridor',
};

// Summary KPIs for the Zone Admin dashboard (zone-scoped to Madhapur).
export const zoneSummaryCards = [
  {
    id: 'active-rentals',
    label: 'Active Rentals',
    value: '142',
    change: '+12',
    tone: 'blue',
    sub: 'Currently on-hire across Madhapur',
  },
  {
    id: 'available-vehicles',
    label: 'Available Vehicles',
    value: '52',
    change: '-4',
    tone: 'green',
    sub: 'Machines ready for dispatch',
  },
  {
    id: 'rental-revenue',
    label: 'Rental Revenue',
    value: '₹1.18M',
    change: '+22.4%',
    tone: 'green',
    sub: 'Gross revenue this month',
  },
  {
    id: 'pending-payments',
    label: 'Pending Payments',
    value: '₹86,400',
    change: '+8',
    tone: 'amber',
    sub: 'Outstanding customer payments',
  },
  {
    id: 'open-complaints',
    label: 'Open Complaints',
    value: '6',
    change: '-2',
    tone: 'red',
    sub: 'Unresolved support tickets',
  },
  {
    id: 'overdue-tasks',
    label: 'Overdue Tasks',
    value: '4',
    change: '+1',
    tone: 'orange',
    sub: 'Maintenance past SLA window',
  },
];

const DAYS = 90;
const isoDaysAgo = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const pseudo = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const round1 = (value: number) => Math.round(value * 10) / 10;

// ---------- Rental Applications ----------
export type ApplicationRow = {
  date: string;
  locality: string;
  submitted: number;
  approved: number;
  rejected: number;
  avgApprovalHrs: number;
};

export const applicationRows: ApplicationRow[] = [];
for (let day = 0; day < DAYS; day += 1) {
  const date = isoDaysAgo(day);
  zoneLocalities.forEach((locality, localityIndex) => {
    const base = 8 + (zoneLocalities.length - localityIndex) * 2;
    const submitted = Math.round(base * (0.7 + pseudo(day * 7 + localityIndex) * 0.7));
    const approved = Math.round(submitted * (0.6 + pseudo(day * 11 + localityIndex) * 0.32));
    const rejected = Math.max(0, submitted - approved - Math.round(pseudo(day * 13 + localityIndex) * 2));
    applicationRows.push({
      date,
      locality,
      submitted,
      approved,
      rejected,
      avgApprovalHrs: round1(14 + pseudo(day * 17 + localityIndex) * 24),
    });
  });
}

// ---------- Vehicle Performance / Occupancy ----------
export type OccupancyRow = {
  locality: string;
  area: string;
  total: number;
  occupied: number;
  available: number;
};

export const occupancyRows: OccupancyRow[] = zoneLocalities.map((locality, localityIndex) => {
  const total = 140 - localityIndex * 12;
  const occupied = Math.round(total * (0.68 + pseudo(localityIndex * 3) * 0.26));
  return { locality, area: zoneLocalityAreas[locality], total, occupied, available: total - occupied };
});

// ---------- Revenue & Payments ----------
export type PaymentRow = {
  date: string;
  locality: string;
  collected: number;
  outstanding: number;
  invoices: number;
};

export const paymentRows: PaymentRow[] = [];
for (let day = 0; day < DAYS; day += 1) {
  const date = isoDaysAgo(day);
  zoneLocalities.forEach((locality, localityIndex) => {
    const collectedBase = 120000 + (zoneLocalities.length - localityIndex) * 18000;
    paymentRows.push({
      date,
      locality,
      collected: Math.round(collectedBase * (0.75 + pseudo(day * 19 + localityIndex) * 0.45)),
      outstanding: Math.round((28000 + localityIndex * 5000) * (0.6 + pseudo(day * 23 + localityIndex) * 0.7)),
      invoices: Math.round(14 + localityIndex * 2 + pseudo(day * 29 + localityIndex) * 10),
    });
  });
}

// ---------- Customer Support ----------
export type SupportRow = {
  date: string;
  type: string;
  tickets: number;
  resolved: number;
  reopened: number;
  avgResponseMins: number;
  avgResolutionHrs: number;
};

export const supportRequestTypes = ['Maintenance', 'Incident', 'Refund', 'Change Request'];

export const supportRows: SupportRow[] = [];
for (let day = 0; day < DAYS; day += 1) {
  const date = isoDaysAgo(day);
  supportRequestTypes.forEach((type, typeIndex) => {
    const tickets = Math.round(2 + typeIndex + pseudo(day * 61 + typeIndex) * 8);
    const resolved = Math.round(tickets * (0.6 + pseudo(day * 67 + typeIndex) * 0.35));
    supportRows.push({
      date,
      type,
      tickets,
      resolved,
      reopened: Math.round(resolved * (0.04 + pseudo(day * 71 + typeIndex) * 0.12)),
      avgResponseMins: Math.round(15 + pseudo(day * 73 + typeIndex) * 28),
      avgResolutionHrs: round1(4 + pseudo(day * 79 + typeIndex) * 16),
    });
  });
}

// ---------- SLA & Escalations ----------
export type SlaRow = {
  locality: string;
  tickets: number;
  metFirstResponse: number;
  metResolution: number;
  avgResponseMins: number;
  compliancePct: number;
};

export const slaRows: SlaRow[] = zoneLocalities.map((locality, localityIndex) => {
  const tickets = 95 - localityIndex * 7;
  const metFirstResponse = Math.round(tickets * (0.8 + pseudo(localityIndex * 11) * 0.18));
  const metResolution = Math.round(tickets * (0.68 + pseudo(localityIndex * 19) * 0.24));
  return {
    locality,
    tickets,
    metFirstResponse,
    metResolution,
    avgResponseMins: Math.round(13 + pseudo(localityIndex * 23) * 24),
    compliancePct: Math.round(78 + pseudo(localityIndex * 29) * 20),
  };
});

// ---------- Staff Performance ----------
export type StaffRow = {
  id: string;
  name: string;
  role: string;
  locality: string;
  jobs: number;
  rating: number;
  status: 'Active' | 'On leave' | 'Suspended';
};

export const staffRows: StaffRow[] = [
  { id: 'ST-101', name: 'Kiran Vardhan', role: 'Zone Operator', locality: 'HITEC City', jobs: 214, rating: 4.9, status: 'Active' },
  { id: 'ST-104', name: 'Sunita Devi', role: 'Zone Operator', locality: 'Raidurg', jobs: 148, rating: 4.8, status: 'Active' },
  { id: 'ST-121', name: 'Ravi Teja', role: 'Zone Operator', locality: 'Kavuri Hills', jobs: 162, rating: 4.7, status: 'Active' },
  { id: 'ST-122', name: 'Fatima Zahra', role: 'Zone Operator', locality: 'HITEC City', jobs: 139, rating: 4.8, status: 'Active' },
  { id: 'ST-123', name: 'Bharat Reddy', role: 'Zone Operator', locality: 'Manikonda', jobs: 121, rating: 4.6, status: 'Active' },
  { id: 'ST-124', name: 'Lakshmi Prasad', role: 'Zone Operator', locality: 'Nanakramguda', jobs: 97, rating: 4.5, status: 'Active' },
  { id: 'ST-125', name: 'Arjun Deshmukh', role: 'Zone Operator', locality: 'Kondapur', jobs: 66, rating: 4.4, status: 'On leave' },
  { id: 'ST-126', name: 'Nazia Sultana', role: 'Zone Operator', locality: 'Raidurg', jobs: 58, rating: 4.6, status: 'Active' },
  { id: 'ST-127', name: 'Prakash Raju', role: 'Zone Operator', locality: 'Manikonda', jobs: 47, rating: 4.1, status: 'Suspended' },
  { id: 'ST-128', name: 'Vineet Sharma', role: 'Zone Operator', locality: 'Kavuri Hills', jobs: 35, rating: 4.3, status: 'Active' },
];

// ---------- Rental Transactions ----------
export type TransactionRow = {
  id: string;
  date: string;
  customer: string;
  locality: string;
  machine: string;
  operator: string;
  amount: string;
  status: 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Partial' | 'Refunded';
};

export const transactionRows: TransactionRow[] = [
  { id: 'BK-5185', date: '22 Sep 2025', customer: 'HCC Constructions', locality: 'HITEC City', machine: 'Tower Crane 6T', operator: 'Kiran Vardhan', amount: '₹2,96,000', status: 'Confirmed', paymentStatus: 'Pending' },
  { id: 'BK-5182', date: '12 Sep 2025', customer: 'L&T Metro Rail', locality: 'HITEC City', machine: 'CAT 320 Excavator', operator: 'Kiran Vardhan', amount: '₹2,24,000', status: 'Active', paymentStatus: 'Paid' },
  { id: 'BK-5180', date: '11 Sep 2025', customer: 'Phoenix Green Homes', locality: 'Raidurg', machine: 'Schwing Stetter Mixer', operator: 'Sunita Devi', amount: '₹1,08,000', status: 'Active', paymentStatus: 'Paid' },
  { id: 'BK-5177', date: '09 Sep 2025', customer: 'Cyberabad Development', locality: 'Nanakramguda', machine: 'CAT 320 Excavator', operator: 'Ravi Teja', amount: '₹2,32,000', status: 'Active', paymentStatus: 'Partial' },
  { id: 'BK-5175', date: '17 Sep 2025', customer: 'My Home Nexus', locality: 'Kavuri Hills', machine: 'Volvo FMX Tipper', operator: 'Fatima Zahra', amount: '₹1,44,000', status: 'Confirmed', paymentStatus: 'Paid' },
  { id: 'BK-5170', date: '05 Sep 2025', customer: 'Divyasree Developers', locality: 'Manikonda', machine: 'ACE Hydra Crane 14T', operator: 'Bharat Reddy', amount: '₹2,68,000', status: 'Active', paymentStatus: 'Pending' },
  { id: 'BK-5166', date: '02 Sep 2025', customer: 'Amara Infrastructure', locality: 'Kondapur', machine: 'JCB 3CX Backhoe', operator: 'Arjun Deshmukh', amount: '₹86,000', status: 'Completed', paymentStatus: 'Paid' },
  { id: 'BK-5164', date: '01 Sep 2025', customer: 'Vascon Engineers', locality: 'Raidurg', machine: 'JCB 3CX Backhoe', operator: 'Sunita Devi', amount: '₹92,000', status: 'Completed', paymentStatus: 'Paid' },
  { id: 'BK-5162', date: '29 Aug 2025', customer: 'Cyberabad Builders', locality: 'Nanakramguda', machine: 'Motor Grader MG-180', operator: 'Ravi Teja', amount: '₹1,12,000', status: 'Cancelled', paymentStatus: 'Refunded' },
  { id: 'BK-5158', date: '27 Aug 2025', customer: 'Sai Infra Projects', locality: 'Kondapur', machine: 'Compactor RM-800', operator: 'Nazia Sultana', amount: '₹72,000', status: 'Completed', paymentStatus: 'Paid' },
  { id: 'BK-5154', date: '20 Sep 2025', customer: 'Aparna Constructions', locality: 'Kavuri Hills', machine: 'Tipper 10 Wheeler', operator: 'Vineet Sharma', amount: '₹94,000', status: 'Confirmed', paymentStatus: 'Pending' },
  { id: 'BK-5140', date: '25 Aug 2025', customer: 'Deccan Roadlines', locality: 'HITEC City', machine: 'JCB 3CX', operator: 'Kiran Vardhan', amount: '₹88,000', status: 'Completed', paymentStatus: 'Paid' },
];

// ---------- Maintenance ----------
export type MaintenanceRow = {
  id: string;
  date: string;
  machine: string;
  locality: string;
  type: string;
  cost: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Overdue';
};

export const maintenanceRows: MaintenanceRow[] = [
  { id: 'MT-091', date: '22 Sep 2025', machine: 'CAT 320 Excavator', locality: 'HITEC City', type: 'Hydraulic hose replacement', cost: '₹12,800', status: 'Pending' },
  { id: 'MT-089', date: '20 Sep 2025', machine: 'Volvo FMX Tipper', locality: 'Kondapur', type: 'Brake-pad replacement', cost: '₹9,400', status: 'Approved' },
  { id: 'MT-092', date: '18 Sep 2025', machine: 'Schwing Stetter Mixer', locality: 'Raidurg', type: 'Drum inspection', cost: '₹6,200', status: 'Completed' },
  { id: 'MT-084', date: '15 Sep 2025', machine: 'Hydra Crane Fleet', locality: 'Raidurg', type: '500-hour service', cost: '₹36,000', status: 'Completed' },
  { id: 'MT-093', date: '12 Sep 2025', machine: 'ACE Hydra Crane 14T', locality: 'Manikonda', type: 'Boom cylinder seal', cost: '₹15,600', status: 'Overdue' },
  { id: 'MT-090', date: '10 Sep 2025', machine: 'CAT 320 Excavator', locality: 'Nanakramguda', type: 'Bucket teeth replacement', cost: '₹7,800', status: 'Pending' },
  { id: 'MT-094', date: '08 Sep 2025', machine: 'JCB 3CX Backhoe', locality: 'Kondapur', type: 'Engine oil change', cost: '₹4,500', status: 'Completed' },
  { id: 'MT-085', date: '05 Sep 2025', machine: 'Tower Crane 6T', locality: 'HITEC City', type: 'Cable inspection', cost: '₹11,200', status: 'Approved' },
];

// ---------- Dispatch Operations ----------
export type DispatchRow = {
  id: string;
  date: string;
  jobId: string;
  locality: string;
  machine: string;
  operator: string;
  assignedAt: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Delayed';
};

export const dispatchRows: DispatchRow[] = [
  { id: 'DP-401', date: '22 Sep 2025', jobId: 'JOB-7741', locality: 'HITEC City', machine: 'Tower Crane 6T', operator: 'Kiran Vardhan', assignedAt: '08:15 AM', status: 'In Progress' },
  { id: 'DP-402', date: '22 Sep 2025', jobId: 'JOB-7742', locality: 'Raidurg', machine: 'Schwing Stetter Mixer', operator: 'Sunita Devi', assignedAt: '09:00 AM', status: 'Assigned' },
  { id: 'DP-403', date: '21 Sep 2025', jobId: 'JOB-7739', locality: 'Kavuri Hills', machine: 'Volvo FMX Tipper', operator: 'Fatima Zahra', assignedAt: '08:45 AM', status: 'Completed' },
  { id: 'DP-404', date: '21 Sep 2025', jobId: 'JOB-7740', locality: 'Manikonda', machine: 'ACE Hydra Crane 14T', operator: 'Bharat Reddy', assignedAt: '09:30 AM', status: 'Delayed' },
  { id: 'DP-405', date: '20 Sep 2025', jobId: 'JOB-7737', locality: 'Nanakramguda', machine: 'CAT 320 Excavator', operator: 'Ravi Teja', assignedAt: '08:20 AM', status: 'Completed' },
  { id: 'DP-406', date: '20 Sep 2025', jobId: 'JOB-7738', locality: 'Kondapur', machine: 'JCB 3CX Backhoe', operator: 'Arjun Deshmukh', assignedAt: '09:10 AM', status: 'Completed' },
  { id: 'DP-407', date: '19 Sep 2025', jobId: 'JOB-7735', locality: 'HITEC City', machine: 'JCB 3CX', operator: 'Kiran Vardhan', assignedAt: '08:05 AM', status: 'Completed' },
  { id: 'DP-408', date: '19 Sep 2025', jobId: 'JOB-7736', locality: 'Kavuri Hills', machine: 'Tipper 10 Wheeler', operator: 'Vineet Sharma', assignedAt: '08:50 AM', status: 'Completed' },
];

// ---------- Audit Activity ----------
export type AuditRow = {
  id: string;
  date: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  zone: string;
};

export const auditRows: AuditRow[] = [
  { id: 'AU-101', date: '22 Sep 2025', actor: 'Sridhar Nair', role: 'Zone Admin', action: 'Approved maintenance request', target: 'MT-089', zone: 'Madhapur' },
  { id: 'AU-102', date: '22 Sep 2025', actor: 'Sridhar Nair', role: 'Zone Admin', action: 'Updated operator badge', target: 'ST-125', zone: 'Madhapur' },
  { id: 'AU-103', date: '21 Sep 2025', actor: 'Dispatch Desk', role: 'Zone Staff', action: 'Assigned job', target: 'JOB-7741', zone: 'Madhapur' },
  { id: 'AU-104', date: '21 Sep 2025', actor: 'Sridhar Nair', role: 'Zone Admin', action: 'Rejected booking', target: 'BK-5162', zone: 'Madhapur' },
  { id: 'AU-105', date: '20 Sep 2025', actor: 'Finance Desk', role: 'Zone Staff', action: 'Released payout', target: 'PO-403', zone: 'Madhapur' },
  { id: 'AU-106', date: '19 Sep 2025', actor: 'Sridhar Nair', role: 'Zone Admin', action: 'Suspended operator', target: 'ST-127', zone: 'Madhapur' },
  { id: 'AU-107', date: '18 Sep 2025', actor: 'Sridhar Nair', role: 'Zone Admin', action: 'Updated locality details', target: 'Kondapur', zone: 'Madhapur' },
  { id: 'AU-108', date: '17 Sep 2025', actor: 'Dispatch Desk', role: 'Zone Staff', action: 'Flagged machine for service', target: 'MC-3048', zone: 'Madhapur' },
];

// Aggregated summary values derived from the zone-scoped rows.
export const zoneAggregates = {
  totalApplications: applicationRows.reduce((sum, row) => sum + row.submitted, 0),
  totalApproved: applicationRows.reduce((sum, row) => sum + row.approved, 0),
  totalRejected: applicationRows.reduce((sum, row) => sum + row.rejected, 0),
  totalRevenue: paymentRows.reduce((sum, row) => sum + row.collected, 0),
  totalOutstanding: paymentRows.reduce((sum, row) => sum + row.outstanding, 0),
  totalInvoices: paymentRows.reduce((sum, row) => sum + row.invoices, 0),
  totalTickets: supportRows.reduce((sum, row) => sum + row.tickets, 0),
  totalResolved: supportRows.reduce((sum, row) => sum + row.resolved, 0),
  totalMachines: occupancyRows.reduce((sum, row) => sum + row.total, 0),
  totalOccupied: occupancyRows.reduce((sum, row) => sum + row.occupied, 0),
  totalStaffJobs: staffRows.reduce((sum, row) => sum + row.jobs, 0),
};
