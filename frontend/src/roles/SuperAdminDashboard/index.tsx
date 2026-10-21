import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react'
import BookingLedgerPage from './BookingLedgerPage'
import KpiDetailPage from './KpiDetailPage'
import UsersPage from './UsersPage'
import ApprovalLimitsPage from './ApprovalLimitsPage'
import SessionsDevicesPage from './SessionsDevicesPage'
import RolesPermissionsPage from './RolesPermissionsPage'
import AuditLogPage from './AuditLogPage'
import { initialStaff, type StaffAccount } from './staffData'
import StatesPage from './StatesPage'
import CitiesPage from './CitiesPage'
import ZonesPage from './ZonesPage'
import ServiceAreasPage from './ServiceAreasPage'
import RulesEnginePage from './RulesEnginePage'
import AttentionDetailPage from './AttentionDetailPage'
import FeatureFlagsPage from './FeatureFlagsPage'
import GstManagementPage, { gstSections, type GstSection } from './GstManagementPage'
import DocumentManagementPage, { documentSections, type DocumentSection } from './DocumentManagementPage'
import RefundManagementPage from './RefundManagementPage'
import SupportTicketsPage from './SupportTicketsPage'
import NotificationsPage from './NotificationsPage'
import { initialCitiesData, type CityItem } from './citiesData'
import { initialZonesData, type ZoneItem } from './zonesData'
import { initialServiceAreasData, type ServiceAreaItem } from './serviceAreasData'
import { initialStatesData, type StateItem } from './statesData'
import { initialFeatureFlags, type FeatureFlag } from './featureFlagsData'
import { domainCategories, initialRulesData, type RuleDomain, type RuleItem } from './rulesEngineData'
import {
  attentionKpis,
  getAttentionSlugFromLocation,
  initialKycReviews,
  initialPayoutRequests,
  initialSecurityAlerts,
  initialUnassignedJobs,
  type AttentionAction,
  type AttentionSlug,
  type KycReview,
  type PayoutRequest,
  type SecurityAlert,
  type UnassignedJob,
} from './attentionData'
import {
  dashboardPeriods,
  initialDashboardAlerts,
  initialNotifications,
  type DashboardAlert,
  type DashboardNotification,
} from './headerFeedData'
import { superAdminFeatureGroups } from './featureGroups'
import { getKpiIndexFromLocation, getKpiSlug, kpiMetrics, type BookingStatusFilter } from './kpiData'
import {
  formatBookingCurrency,
  formatDateLabel,
  getBookingsForDate,
  getRecentDateOptions,
  summarizeBookings,
  toIsoDate,
} from './bookingDateData'

const geographyRows = [
  { state: 'Maharashtra', cities: 14, zones: 42, vehicles: 682, bookings: 3180, revenue: '₹9.4M', commission: '₹1.4M', status: 'Healthy' },
  { state: 'Karnataka', cities: 9, zones: 31, vehicles: 521, bookings: 2140, revenue: '₹7.9M', commission: '₹1.2M', status: 'Healthy' },
  { state: 'Telangana', cities: 7, zones: 24, vehicles: 412, bookings: 1768, revenue: '₹6.3M', commission: '₹0.9M', status: 'Watch' },
  { state: 'Tamil Nadu', cities: 10, zones: 36, vehicles: 598, bookings: 2480, revenue: '₹8.8M', commission: '₹1.3M', status: 'Healthy' },
]

const systemHealth = [
  { name: 'API', status: 'Operational', uptime: '99.98%', latency: '96ms' },
  { name: 'Payments', status: 'Operational', uptime: '99.92%', latency: '121ms' },
  { name: 'Maps', status: 'Operational', uptime: '99.95%', latency: '84ms' },
  { name: 'SMS', status: 'Degraded', uptime: '98.5%', latency: '210ms' },
]

const revenueTrendData = [
  { month: 'Nov', value: 4.2 },
  { month: 'Dec', value: 5.1 },
  { month: 'Jan', value: 5.9 },
  { month: 'Feb', value: 5.6 },
  { month: 'Mar', value: 6.8 },
  { month: 'Apr', value: 7.6 },
  { month: 'May', value: 7.1 },
  { month: 'Jun', value: 8.2 },
  { month: 'Jul', value: 8.8 },
  { month: 'Aug', value: 7.4 },
  { month: 'Sep', value: 9.6 },
  { month: 'Oct', value: 10.8 },
]

const revenueChartGeometry = { width: 720, height: 210, padX: 30, padTop: 24, padBottom: 34 }
const revenueMax = Math.max(...revenueTrendData.map((d) => d.value)) * 1.15
const revenuePoints = revenueTrendData.map((d, i) => {
  const { width, height, padX, padTop, padBottom } = revenueChartGeometry
  const stepX = (width - padX * 2) / (revenueTrendData.length - 1)
  const x = padX + i * stepX
  const y = height - padBottom - (d.value / revenueMax) * (height - padTop - padBottom)
  return { x, y, month: d.month, value: d.value }
})
const revenueLinePath = revenuePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
const revenueAreaPath = `${revenueLinePath} L ${revenuePoints[revenuePoints.length - 1].x.toFixed(1)} ${revenueChartGeometry.height - revenueChartGeometry.padBottom} L ${revenuePoints[0].x.toFixed(1)} ${revenueChartGeometry.height - revenueChartGeometry.padBottom} Z`

const supplyDemandData = [
  { label: 'Hyderabad', supply: 412, demand: 468 },
  { label: 'Mumbai', supply: 598, demand: 552 },
  { label: 'Pune', supply: 364, demand: 421 },
  { label: 'Bengaluru', supply: 505, demand: 588 },
  { label: 'Chennai', supply: 288, demand: 332 },
  { label: 'Delhi NCR', supply: 476, demand: 512 },
  { label: 'Jaipur', supply: 214, demand: 196 },
  { label: 'Lucknow', supply: 176, demand: 232 },
]
const supplyDemandMax = Math.max(...supplyDemandData.flatMap((d) => [d.supply, d.demand]))

const bookingTrendData = [
  { month: 'Nov', completed: 1180, ongoing: 320, cancelled: 96 },
  { month: 'Dec', completed: 1264, ongoing: 348, cancelled: 104 },
  { month: 'Jan', completed: 1388, ongoing: 372, cancelled: 118 },
  { month: 'Feb', completed: 1320, ongoing: 356, cancelled: 126 },
  { month: 'Mar', completed: 1462, ongoing: 402, cancelled: 132 },
  { month: 'Apr', completed: 1508, ongoing: 418, cancelled: 124 },
  { month: 'May', completed: 1614, ongoing: 446, cancelled: 138 },
  { month: 'Jun', completed: 1720, ongoing: 470, cancelled: 142 },
  { month: 'Jul', completed: 1786, ongoing: 498, cancelled: 148 },
  { month: 'Aug', completed: 1704, ongoing: 462, cancelled: 156 },
  { month: 'Sep', completed: 1892, ongoing: 512, cancelled: 146 },
  { month: 'Oct', completed: 2048, ongoing: 556, cancelled: 168 },
]
const bookingTrendTotals = bookingTrendData.map((d) => d.completed + d.ongoing + d.cancelled)
const bookingTrendGrandTotal = bookingTrendTotals.reduce((a, b) => a + b, 0)
const bookingTrendCompletion = Math.round((bookingTrendData.reduce((a, d) => a + d.completed, 0) / bookingTrendGrandTotal) * 100)

const recentOps = [
  { title: 'Payout approval', detail: '₹850,000 • Finance Admin • Hyderabad', status: 'Pending' },
  { title: 'New city activation', detail: 'Bengaluru Urban • City Admin', status: 'Approved' },
  { title: 'Compliance override', detail: 'Vehicle KA01AB1234 • Risk review', status: 'Escalated' },
  { title: 'Zone reassignment', detail: 'North Corridor • Operations', status: 'In progress' },
]

type OrgStatus = 'active' | 'draft' | 'inactive'

type OrgLocation = {
  id: string
  name: string
  type: 'state' | 'city' | 'zone'
  status: OrgStatus
  owner: string
  adminName?: string
  adminEmail?: string
  serviceArea: string
  hours: string
  children?: OrgLocation[]
}

const organizationSeed: OrgLocation[] = [
  {
    id: 'tg',
    name: 'Telangana',
    type: 'state',
    status: 'active',
    owner: 'State Admin • Hyderabad',
    adminName: 'Rakesh Reddy',
    adminEmail: 'rakesh.reddy@fieldwork.in',
    serviceArea: 'Hyderabad metro + statewide logistics',
    hours: '06:00–22:00',
    children: [
      {
        id: 'tg-hyd',
        name: 'Hyderabad',
        type: 'city',
        status: 'active',
        owner: 'City Admin • Hyderabad',
        serviceArea: 'IT corridor / airport / industrial east',
        hours: '05:30–23:00',
        children: [
          { id: 'tg-hyd-east', name: 'East', type: 'zone', status: 'active', owner: 'Zone Admin • East', serviceArea: 'Industrial east corridor', hours: '06:00–20:00' },
          { id: 'tg-hyd-west', name: 'West', type: 'zone', status: 'active', owner: 'Zone Admin • West', serviceArea: 'Urban access + commercial logistics', hours: '07:00–21:00' },
          { id: 'tg-hyd-north', name: 'North', type: 'zone', status: 'draft', owner: 'Zone Admin • North', serviceArea: 'Airport and urban expansion', hours: '06:30–21:30' },
        ],
      },
      {
        id: 'tg-war',
        name: 'Warangal',
        type: 'city',
        status: 'draft',
        owner: 'City Admin • Warangal',
        serviceArea: 'Regional rollout pending',
        hours: 'TBD',
        children: [
          { id: 'tg-war-central', name: 'Central', type: 'zone', status: 'draft', owner: 'Zone Admin • Central', serviceArea: 'City launch plan', hours: 'TBD' },
        ],
      },
    ],
  },
  {
    id: 'mh',
    name: 'Maharashtra',
    type: 'state',
    status: 'active',
    owner: 'State Admin • Pune',
    adminName: 'Priya Deshmukh',
    adminEmail: 'priya.deshmukh@fieldwork.in',
    serviceArea: 'Metro + industrial corridors',
    hours: '06:00–22:00',
    children: [
      {
        id: 'mh-bom',
        name: 'Mumbai',
        type: 'city',
        status: 'active',
        owner: 'City Admin • Mumbai',
        serviceArea: 'Harbor / urban / airport',
        hours: '05:00–23:00',
        children: [
          { id: 'mh-bom-nw', name: 'North West', type: 'zone', status: 'active', owner: 'Zone Admin • NW', serviceArea: 'Industrial cluster', hours: '06:00–20:00' },
          { id: 'mh-bom-s', name: 'South', type: 'zone', status: 'draft', owner: 'Zone Admin • South', serviceArea: 'Urban corridor', hours: '07:00–21:00' },
        ],
      },
      {
        id: 'mh-pun',
        name: 'Pune',
        type: 'city',
        status: 'active',
        owner: 'City Admin • Pune',
        serviceArea: 'Logistics + corporate',
        hours: '06:30–21:30',
        children: [
          { id: 'mh-pun-1', name: 'Pimpri', type: 'zone', status: 'active', owner: 'Zone Admin • Pimpri', serviceArea: 'Manufacturing belt', hours: '07:00–19:00' },
        ],
      },
    ],
  },
  {
    id: 'ka',
    name: 'Karnataka',
    type: 'state',
    status: 'draft',
    owner: 'Unassigned',
    serviceArea: 'Awaiting launch plan',
    hours: 'TBD',
    children: [
      {
        id: 'ka-blr',
        name: 'Bengaluru',
        type: 'city',
        status: 'active',
        owner: 'City Admin • Bengaluru',
        serviceArea: 'IT parks + city access',
        hours: '06:00–22:00',
        children: [
          { id: 'ka-blr-n', name: 'North', type: 'zone', status: 'active', owner: 'Zone Admin • North', serviceArea: 'Urban site access', hours: '06:00–20:00' },
          { id: 'ka-blr-e', name: 'East', type: 'zone', status: 'inactive', owner: 'Zone Admin • East', serviceArea: 'Scaling pending', hours: 'Closed' },
        ],
      },
    ],
  },
]

const sidebarPageGroup: Record<string, number> = {
  States: 0,
  Cities: 0,
  Zones: 0,
  'Service Areas': 0,
  Users: 1,
  'Roles & Permissions': 1,
  'Approval Limits': 1,
  'Sessions & Devices': 11,
  'Global Rules': 2,
  'Booking Rules': 2,
  Pricing: 3,
  'Feature Flags': 2,
  'Audit Log': 2,
  'GST Settings': 3,
  'Owner GST Details': 3,
  'Tax Configuration': 3,
  'Invoices & Billing': 3,
  'Reports & Compliance': 3,
  'GST Audit Logs': 3,
  'Help / Docs': 10,
  'Super Admin Profile': 1,
}

const gstSectionSlug: Record<string, string> = {
  'GST Settings': 'gst-settings',
  'Owner GST Details': 'owner-gst',
  'Tax Configuration': 'tax-config',
  'Invoices & Billing': 'invoices',
  'Reports & Compliance': 'reports',
  'GST Audit Logs': 'audit',
}

const gstSlugToSection: Record<string, GstSection> = Object.fromEntries(
  Object.entries(gstSectionSlug).map(([section, slug]) => [slug, section as GstSection]),
)

const documentSectionSlug: Record<string, string> = {
  'Vehicle Documents': 'vehicle-docs',
  'Driver Documents': 'driver-docs',
  'Owner Documents': 'owner-docs',
  'GST & Tax Documents': 'tax-docs',
  'Verification & Expiry Tracking': 'expiry-tracking',
  'Document History': 'doc-history',
}

const documentSlugToSection: Record<string, DocumentSection> = Object.fromEntries(
  Object.entries(documentSectionSlug).map(([section, slug]) => [slug, section as DocumentSection]),
)

type SuperAdminDashboardProps = {
  onSignOut?: () => void
}

const isBookingLedgerLocation = () => typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/bookings')

const getBookingFilterFromLocation = (): BookingStatusFilter => {
  if (typeof window === 'undefined') return 'All'
  if (window.location.hash.endsWith('/completed')) return 'Completed'
  if (window.location.hash.endsWith('/cancelled')) return 'Cancelled'
  return 'All'
}

type SearchTarget =
  | { kind: 'geo'; page: 'States' | 'Cities' | 'Zones'; query: string }
  | { kind: 'kpi'; label: string }
  | { kind: 'page'; page: string }

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  target: SearchTarget
}

const searchablePages = [
  'States',
  'Cities',
  'Zones',
  'Service Areas',
  'Global Rules',
  'Booking Rules',
  'Pricing',
  'Feature Flags',
  'Users',
  'Roles & Permissions',
]

export default function SuperAdminDashboard({ onSignOut }: SuperAdminDashboardProps) {
  const [selectedKpiIndex, setSelectedKpiIndex] = useState<number | null>(() => getKpiIndexFromLocation())
  const [isBookingLedgerPage, setIsBookingLedgerPage] = useState(isBookingLedgerLocation)
  const [bookingStatusFilter, setBookingStatusFilter] = useState<BookingStatusFilter>(getBookingFilterFromLocation)
  const [activeNav, setActiveNav] = useState('overview')
  const [selectedSidebarPage, setSelectedSidebarPage] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/pricing-rules')) {
      return 'Pricing'
    }
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/booking-rules')) {
      return 'Booking Rules'
    }
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/global-rules')) {
      return 'Global Rules'
    }
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/feature-flags')) {
      return 'Feature Flags'
    }
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/service-areas')) {
      return 'Service Areas'
    }
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/zones')) {
      return 'Zones'
    }
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/cities')) {
      return 'Cities'
    }
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/states')) {
      return 'States'
    }
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#super-admin/notifications')) {
      return 'Notifications'
    }
    return null
  })
  const [statesList, setStatesList] = useState<StateItem[]>(initialStatesData)
  const [citiesList, setCitiesList] = useState<CityItem[]>(initialCitiesData)
  const [zonesList, setZonesList] = useState<ZoneItem[]>(initialZonesData)
  const [serviceAreasList, setServiceAreasList] = useState<ServiceAreaItem[]>(initialServiceAreasData)
  const [rulesList, setRulesList] = useState<RuleItem[]>(initialRulesData)
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(initialPayoutRequests)
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(initialSecurityAlerts)
  const [unassignedJobs, setUnassignedJobs] = useState<UnassignedJob[]>(initialUnassignedJobs)
  const [kycReviews, setKycReviews] = useState<KycReview[]>(initialKycReviews)
  const [featureFlagsList, setFeatureFlagsList] = useState<FeatureFlag[]>(initialFeatureFlags)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [globalQuery, setGlobalQuery] = useState('')
  const [notificationsList, setNotificationsList] = useState<DashboardNotification[]>(initialNotifications)
  const [alertsList] = useState<DashboardAlert[]>(initialDashboardAlerts)
  const [dashboardPeriod, setDashboardPeriod] = useState('This Month')
  const [bookingDate, setBookingDate] = useState<string>(() => toIsoDate(new Date()))
  const [bookingDateSearch, setBookingDateSearch] = useState('')
  const [pageSearch, setPageSearch] = useState<{ page: string; query: string; token: number } | null>(null)
  const [selectedAttentionSlug, setSelectedAttentionSlug] = useState<AttentionSlug | null>(() => getAttentionSlugFromLocation())
  const [citiesFilterFromSidebar, setCitiesFilterFromSidebar] = useState<'all' | 'active' | 'inactive'>('all')
  const [zonesFilterFromSidebar, setZonesFilterFromSidebar] = useState<'all' | 'active' | 'inactive'>('all')
  const [sidebarTriggerAddZone, setSidebarTriggerAddZone] = useState(false)
  const [sidebarTriggerAddCity, setSidebarTriggerAddCity] = useState(false)
  const [statesFilterFromSidebar, setStatesFilterFromSidebar] = useState<'all' | 'active' | 'inactive'>('all')
  const [sidebarTriggerAddState, setSidebarTriggerAddState] = useState(false)
  const [organization, setOrganization] = useState<OrgLocation[]>(organizationSeed)
  // sidebarPageSearch not used after cleanup

  const [orgEditId, setOrgEditId] = useState<string | null>(null)
  const [orgAdminId, setOrgAdminId] = useState<string | null>(null)
  const [orgEditForm, setOrgEditForm] = useState<{ name: string; serviceArea: string; hours: string; status: OrgStatus }>({ name: '', serviceArea: '', hours: '', status: 'active' })
  const [orgAdminForm, setOrgAdminForm] = useState<{ adminName: string; adminEmail: string }>({ adminName: '', adminEmail: '' })
  const [staffList, setStaffList] = useState<StaffAccount[]>(initialStaff)
  const [serviceAreasFilterFromSidebar, setServiceAreasFilterFromSidebar] = useState<'all' | 'active' | 'inactive'>('all')
  const [sidebarTriggerAddServiceArea, setSidebarTriggerAddServiceArea] = useState(false)
  const selectedKpi = selectedKpiIndex === null ? null : kpiMetrics[selectedKpiIndex]

  const recentBookingDates = getRecentDateOptions(7)
  const selectedDateBookings = getBookingsForDate(bookingDate)
  const selectedDateSummary = summarizeBookings(selectedDateBookings)
  const bookingDateSearchTerm = bookingDateSearch.trim().toLowerCase()
  const visibleDateBookings = bookingDateSearchTerm === ''
    ? selectedDateBookings
    : selectedDateBookings.filter((booking) =>
        booking.id.toLowerCase().includes(bookingDateSearchTerm) ||
        booking.customer.toLowerCase().includes(bookingDateSearchTerm) ||
        booking.operator.toLowerCase().includes(bookingDateSearchTerm) ||
        booking.owner.toLowerCase().includes(bookingDateSearchTerm))

  useEffect(() => {
    const syncKpiPage = () => {
      setSelectedKpiIndex(getKpiIndexFromLocation())
      setSelectedAttentionSlug(getAttentionSlugFromLocation())
      setIsBookingLedgerPage(isBookingLedgerLocation())
      setBookingStatusFilter(getBookingFilterFromLocation())
      if (window.location.hash.startsWith('#super-admin/pricing-rules')) {
        setSelectedSidebarPage('Pricing')
      } else if (window.location.hash.startsWith('#super-admin/booking-rules')) {
        setSelectedSidebarPage('Booking Rules')
      } else if (window.location.hash.startsWith('#super-admin/global-rules')) {
        setSelectedSidebarPage('Global Rules')
      } else if (window.location.hash.startsWith('#super-admin/feature-flags')) {
        setSelectedSidebarPage('Feature Flags')
      } else if (window.location.hash.startsWith('#super-admin/audit-log')) {
        setSelectedSidebarPage('Audit Log')
      } else if (window.location.hash.startsWith('#super-admin/service-areas')) {
        setSelectedSidebarPage('Service Areas')
      } else if (window.location.hash.startsWith('#super-admin/zones')) {
        setSelectedSidebarPage('Zones')
      } else if (window.location.hash.startsWith('#super-admin/states')) {
        setSelectedSidebarPage('States')
      } else if (window.location.hash.startsWith('#super-admin/cities')) {
        setSelectedSidebarPage('Cities')
      } else if (window.location.hash.startsWith('#super-admin/gst/')) {
        const gstSection = gstSlugToSection[window.location.hash.slice('#super-admin/gst/'.length)]
        if (gstSection) setSelectedSidebarPage(gstSection)
      } else if (window.location.hash === '#super-admin/gst' || window.location.hash.startsWith('#super-admin/gst?')) {
        setSelectedSidebarPage('GST Management')
      } else if (window.location.hash.startsWith('#super-admin/documents/')) {
        const documentSection = documentSlugToSection[window.location.hash.slice('#super-admin/documents/'.length)]
        if (documentSection) setSelectedSidebarPage(documentSection)
      } else if (window.location.hash === '#super-admin/documents' || window.location.hash.startsWith('#super-admin/documents?')) {
        setSelectedSidebarPage('Document Management')
      } else if (window.location.hash === '#super-admin/refunds' || window.location.hash.startsWith('#super-admin/refunds?')) {
        setSelectedSidebarPage('Refund Management')
      } else if (window.location.hash === '#super-admin/tickets' || window.location.hash.startsWith('#super-admin/tickets?')) {
        setSelectedSidebarPage('Support Tickets')
      } else if (
        window.location.hash === '#super-admin/notifications' ||
        window.location.hash.startsWith('#super-admin/notifications?')
      ) {
        setSelectedSidebarPage('Notifications')
      }
    }
    window.addEventListener('hashchange', syncKpiPage)
    window.addEventListener('popstate', syncKpiPage)

    return () => {
      window.removeEventListener('hashchange', syncKpiPage)
      window.removeEventListener('popstate', syncKpiPage)
    }
  }, [])

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = globalQuery.trim().toLowerCase()
    if (!query) return []

    const results: SearchResult[] = []
    const push = (result: SearchResult, limit: number) => {
      if (results.filter((item) => item.group === result.group).length < limit) results.push(result)
    }

    statesList
      .filter((state) => state.name.toLowerCase().includes(query) || state.code.toLowerCase().includes(query))
      .forEach((state) =>
        push(
          {
            id: `state-${state.id}`,
            group: 'Geography',
            label: state.name,
            sub: `State · ${state.code}`,
            target: { kind: 'geo', page: 'States', query: state.name },
          },
          3,
        ),
      )

    citiesList
      .filter((city) => city.name.toLowerCase().includes(query))
      .forEach((city) =>
        push(
          {
            id: `city-${city.id}`,
            group: 'Geography',
            label: city.name,
            sub: `City · ${city.stateName}`,
            target: { kind: 'geo', page: 'Cities', query: city.name },
          },
          4,
        ),
      )

    zonesList
      .filter((zone) => zone.name.toLowerCase().includes(query))
      .forEach((zone) =>
        push(
          {
            id: `zone-${zone.id}`,
            group: 'Geography',
            label: zone.name,
            sub: `Zone · ${zone.cityName}`,
            target: { kind: 'geo', page: 'Zones', query: zone.name },
          },
          3,
        ),
      )

    kpiMetrics
      .filter((metric) => metric.label.toLowerCase().includes(query))
      .forEach((metric) =>
        push(
          {
            id: `kpi-${getKpiSlug(metric.label)}`,
            group: 'KPIs',
            label: metric.label,
            sub: metric.description,
            target: { kind: 'kpi', label: metric.label },
          },
          4,
        ),
      )

    searchablePages
      .filter((page) => page.toLowerCase().includes(query))
      .forEach((page) =>
        push(
          {
            id: `page-${page}`,
            group: 'Navigation',
            label: page,
            sub: 'Open section',
            target: { kind: 'page', page },
          },
          5,
        ),
      )

    return results
  }, [globalQuery, statesList, citiesList, zonesList])

  const openKpiPage = (index: number) => {
    const slug = getKpiSlug(kpiMetrics[index].label)
    window.history.pushState({ fieldworkKpiPage: true }, '', `#super-admin/kpi/${slug}`)
    setSelectedKpiIndex(index)
  }

  const returnToOverview = () => {
    if (window.history.state?.fieldworkKpiPage) {
      window.history.back()
      return
    }

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#super-admin`)
    setSelectedKpiIndex(null)
  }

  const attentionCounts: Record<AttentionSlug, number> = {
    'payouts-awaiting-approval': payoutRequests.length,
    'security-alerts': securityAlerts.length,
    'unassigned-jobs': unassignedJobs.length,
    'kyc-reviews': kycReviews.length,
  }

  const openAttentionQueue = (slug: AttentionSlug) => {
    window.history.pushState({ fieldworkAttentionPage: true }, '', `#super-admin/attention/${slug}`)
    setSelectedAttentionSlug(slug)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const returnFromAttention = () => {
    if (window.history.state?.fieldworkAttentionPage) {
      window.history.back()
      return
    }

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#super-admin`)
    setSelectedAttentionSlug(null)
  }

  const handleAttentionAction = (action: AttentionAction) => {
    switch (action.type) {
      case 'approve-payout':
      case 'reject-payout':
        setPayoutRequests((prev) => prev.filter((item) => item.id !== action.id))
        break
      case 'resolve-alert':
      case 'dismiss-alert':
        setSecurityAlerts((prev) => prev.filter((item) => item.id !== action.id))
        break
      case 'assign-job':
        setUnassignedJobs((prev) => prev.filter((item) => item.id !== action.id))
        break
      case 'approve-kyc':
      case 'reject-kyc':
      case 'docs-kyc':
        setKycReviews((prev) => prev.filter((item) => item.id !== action.id))
        break
    }
  }

  const openBookingLedger = (filter: BookingStatusFilter) => {
    window.history.pushState({ fieldworkBookingLedgerPage: true }, '', `#super-admin/bookings/${filter.toLowerCase()}`)
    setSelectedKpiIndex(null)
    setIsBookingLedgerPage(true)
    setBookingStatusFilter(filter)
  }

  const updateBookingLedgerFilter = (filter: BookingStatusFilter) => {
    window.history.replaceState({ ...window.history.state, fieldworkBookingLedgerPage: true }, '', `#super-admin/bookings/${filter.toLowerCase()}`)
    setBookingStatusFilter(filter)
  }

  const returnToRevenue = () => {
    if (window.history.state?.fieldworkBookingLedgerPage) {
      window.history.back()
      return
    }

    const revenueIndex = kpiMetrics.findIndex((metric) => metric.label === 'Total Revenue')
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#super-admin/kpi/total-revenue`)
    setSelectedKpiIndex(revenueIndex)
    setIsBookingLedgerPage(false)
  }

  const navigateToSection = (section: string) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveNav(section)
  }

  const navigateSidebar = (label: string, options?: { keepSearch?: boolean }) => {
    if (label === 'Sign Out') {
      onSignOut?.()
      return
    }

    if (label === 'States') {
      window.history.pushState(null, '', '#super-admin/states')
    } else if (label === 'Cities') {
      window.history.pushState(null, '', '#super-admin/cities')
    } else if (label === 'Zones') {
      window.history.pushState(null, '', '#super-admin/zones')
    } else if (label === 'Service Areas') {
      window.history.pushState(null, '', '#super-admin/service-areas')
    } else if (label === 'Feature Flags') {
      window.history.pushState(null, '', '#super-admin/feature-flags')
    } else if (label === 'Audit Log') {
      window.history.pushState(null, '', '#super-admin/audit-log')
    } else if (label === 'Global Rules') {
      window.history.pushState(null, '', '#super-admin/global-rules')
    } else if (label === 'Booking Rules') {
      window.history.pushState(null, '', '#super-admin/booking-rules')
    } else if (label === 'Pricing') {
      window.history.pushState(null, '', '#super-admin/pricing-rules')
    } else if (gstSectionSlug[label]) {
      window.history.pushState(null, '', `#super-admin/gst/${gstSectionSlug[label]}`)
    } else if (label === 'GST Management') {
      window.history.pushState(null, '', '#super-admin/gst')
    } else if (documentSectionSlug[label]) {
      window.history.pushState(null, '', `#super-admin/documents/${documentSectionSlug[label]}`)
    } else if (label === 'Document Management') {
      window.history.pushState(null, '', '#super-admin/documents')
    } else if (label === 'Refund Management') {
      window.history.pushState(null, '', '#super-admin/refunds')
    } else if (label === 'Support Tickets') {
      window.history.pushState(null, '', '#super-admin/tickets')
    } else if (label === 'Notifications') {
      window.history.pushState(null, '', '#super-admin/notifications')
    } else if (label === 'Dashboard') {
      if (
        window.location.hash.startsWith('#super-admin/states') ||
        window.location.hash.startsWith('#super-admin/cities') ||
        window.location.hash.startsWith('#super-admin/zones') ||
        window.location.hash.startsWith('#super-admin/service-areas') ||
        window.location.hash.startsWith('#super-admin/feature-flags') ||
        window.location.hash.startsWith('#super-admin/audit-log') ||
        window.location.hash.startsWith('#super-admin/global-rules') ||
        window.location.hash.startsWith('#super-admin/booking-rules') ||
        window.location.hash.startsWith('#super-admin/pricing-rules') ||
        window.location.hash.startsWith('#super-admin/kpi/') ||
        window.location.hash.startsWith('#super-admin/attention/') ||
        window.location.hash.startsWith('#super-admin/bookings/') ||
        window.location.hash.startsWith('#super-admin/gst/') ||
        window.location.hash === '#super-admin/gst' ||
        window.location.hash.startsWith('#super-admin/documents/') ||
        window.location.hash === '#super-admin/documents' ||
        window.location.hash.startsWith('#super-admin/refunds') ||
        window.location.hash === '#super-admin/refunds' ||
        window.location.hash.startsWith('#super-admin/tickets') ||
        window.location.hash === '#super-admin/tickets' ||
        window.location.hash.startsWith('#super-admin/notifications') ||
        window.location.hash === '#super-admin/notifications'
      ) {
        window.history.pushState(null, '', '#super-admin')
      }
    }

    setSelectedKpiIndex(null)
    setSelectedAttentionSlug(null)
    setIsBookingLedgerPage(false)
    setSelectedSidebarPage(label === 'Dashboard' ? null : label)
    if (label === 'Dashboard') setActiveNav('overview')
    if (!options?.keepSearch) setPageSearch(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openOrgEdit = (state: OrgLocation) => {
    setOrgEditForm({ name: state.name, serviceArea: state.serviceArea, hours: state.hours, status: state.status })
    setOrgEditId(state.id)
  }

  const openOrgAdmin = (state: OrgLocation) => {
    setOrgAdminForm({ adminName: state.adminName ?? '', adminEmail: state.adminEmail ?? '' })
    setOrgAdminId(state.id)
  }

  const submitOrgEdit = (e: FormEvent) => {
    e.preventDefault()
    if (!orgEditForm.name.trim()) return
    setOrganization((prev) =>
      prev.map((s) =>
        s.id === orgEditId
          ? { ...s, name: orgEditForm.name.trim(), serviceArea: orgEditForm.serviceArea.trim(), hours: orgEditForm.hours.trim(), status: orgEditForm.status }
          : s,
      ),
    )
    setOrgEditId(null)
  }

  const submitOrgAdmin = (e: FormEvent) => {
    e.preventDefault()
    const name = orgAdminForm.adminName.trim()
    const email = orgAdminForm.adminEmail.trim()
    if (!name || !email) return
    setOrganization((prev) =>
      prev.map((s) => (s.id === orgAdminId ? { ...s, adminName: name, adminEmail: email, owner: `State Admin • ${s.name}` } : s)),
    )
    setOrgAdminId(null)
  }

  const navigateFromSearch = (page: string, query: string) => {
    setPageSearch((prev) => ({ page, query, token: (prev?.token ?? 0) + 1 }))
    navigateSidebar(page, { keepSearch: true })
  }

  const runSearchTarget = (target: SearchTarget) => {
    setHeaderPanel(null)
    setGlobalQuery('')

    if (target.kind === 'geo') {
      navigateFromSearch(target.page, target.query)
      return
    }

    if (target.kind === 'kpi') {
      const index = kpiMetrics.findIndex((metric) => metric.label === target.label)
      if (index >= 0) openKpiPage(index)
      return
    }

    navigateSidebar(target.page)
  }

  const markNotificationRead = (id: string) => {
    setNotificationsList((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllNotificationsRead = () => {
    setNotificationsList((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const openFeedTarget = (target?: string) => {
    setHeaderPanel(null)
    if (!target) return

    if (target.startsWith('attention:')) {
      const slug = target.slice('attention:'.length) as AttentionSlug
      if (attentionKpis.some((item) => item.slug === slug)) openAttentionQueue(slug)
      return
    }

    if (target.startsWith('page:')) {
      navigateSidebar(target.slice('page:'.length))
      return
    }

    if (target.startsWith('kpi:')) {
      const label = target.slice('kpi:'.length)
      const index = kpiMetrics.findIndex((metric) => metric.label === label)
      if (index >= 0) openKpiPage(index)
    }
  }

  const unreadNotifications = notificationsList.filter((item) => !item.read).length

  const rulesCountFor = (ruleDomain: RuleDomain) =>
    rulesList.filter((rule) => domainCategories[ruleDomain].includes(rule.category)).length

  const selectedPageFeatures = selectedSidebarPage
    ? superAdminFeatureGroups[sidebarPageGroup[selectedSidebarPage] ?? 0].items
    : []

  return (
    <section className="superadmin-role-dashboard">
      <style>{`
        :root {
          --page-bg: radial-gradient(1200px 600px at top left, #fbfbfd 0%, #f1f5f9 100%);
          --sidebar-bg: radial-gradient(120% 120% at 0% 0%, #0f172a 0%, #0a1324 70%, #070c18 100%);
          --sidebar-text: rgba(255,255,255,0.8);
          --card-bg: rgba(255,255,255,0.98);
          --line: rgba(15, 23, 42, 0.08);
          --text: #0f172a;
          --muted: #667085;
          --green: #08a66c;
          --green-soft: rgba(8, 166, 108, 0.12);
          --blue: #2563eb;
          --blue-soft: rgba(37, 99, 235, 0.12);
          --purple: #7c3aed;
          --purple-soft: rgba(124, 58, 237, 0.12);
          --orange: #f59e0b;
          --orange-soft: rgba(245, 158, 11, 0.12);
          --red: #ef4444;
          --red-soft: rgba(239, 68, 68, 0.12);
          --amber: #f59e0b;
          --brand-orange: #ff6b2c;
          --brand-orange-deep: #ef4a12;
          --shadow: 0 24px 60px -24px rgba(15, 23, 42, 0.35);
        }

        * { box-sizing: border-box; }

        .superadmin-role-dashboard {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 20px;
          width: 100%;
          color: var(--text);
        }

        .superadmin-sidebar {
          background: var(--sidebar-bg);
          border-radius: 24px;
          padding: 18px 14px 12px;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 22px;
          position: sticky;
          top: 16px;
          height: calc(100vh - 32px);
          min-height: 0;
          overflow-y: auto;
          box-shadow: 0 28px 80px -30px rgba(2, 6, 23, 0.9);
          backdrop-filter: blur(6px);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .brand-badge {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep));
          color: #fff;
          font-weight: 800;
          box-shadow: 0 10px 22px rgba(239, 74, 18, 0.3);
        }

        .brand-text {
          font-size: 1.08rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .brand-meta {
          font-size: 0.7rem;
          color: var(--sidebar-text);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sidebar-section {
          display: grid;
          gap: 10px;
        }

        .sidebar-label {
          padding: 0 10px;
          color: rgba(255,255,255,0.5);
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .sidebar-stack {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 4px;
        }

        .sidebar-item {
          width: 100%;
          border: 0;
          background: transparent;
          color: var(--sidebar-text);
          padding: 10px 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 0.92rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-item.active {
          background: linear-gradient(90deg, rgba(255,107,44,0.24), rgba(239,74,18,0.08));
          color: #fff;
          box-shadow: inset 3px 0 0 var(--brand-orange), inset 0 0 0 1px rgba(255,255,255,0.08);
        }

        .sidebar-item:hover {
          background: rgba(255,255,255,0.04);
          color: #fff;
        }

        .sidebar-pill {
          min-width: 32px;
          padding: 3px 7px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: #d9e4f2;
          font-size: 0.64rem;
          font-weight: 700;
          text-align: center;
        }

        .sidebar-footer {
          margin-top: auto;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 12px;
          display: grid;
          gap: 8px;
        }

        .superadmin-main {
          display: grid;
          gap: 20px;
          min-width: 0;
          align-content: start;
        }

        .superadmin-main [id] {
          scroll-margin-top: 20px;
        }

        .dashboard-content {
          display: grid;
          gap: 20px;
          min-width: 0;
          align-content: start;
        }

        .sidebar-page {
          display: grid;
          gap: 18px;
          min-width: 0;
        }

        .sidebar-page-intro {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 22px;
          background: #fff;
          border: 1px solid var(--line);
          border-left: 4px solid var(--brand-orange);
          border-radius: 16px;
          box-shadow: var(--shadow);
        }

        .sidebar-page-intro h2 {
          margin: 4px 0 8px;
          font-size: 1.55rem;
        }

        .sidebar-page-intro p:last-child {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .sidebar-page-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .sidebar-page-feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 12px;
          color: var(--text);
          line-height: 1.5;
        }

        .sidebar-page-feature::before {
          content: '';
          flex: 0 0 8px;
          height: 8px;
          margin-top: 6px;
          border-radius: 50%;
          background: var(--brand-orange);
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%);
          border: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 22px;
          padding: 18px 20px;
          box-shadow: 0 24px 60px -28px rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
        }

        .header-copy {
          display: grid;
          gap: 4px;
        }

        .superadmin-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
          padding: 5px 6px;
          border-radius: 12px;
          background: linear-gradient(100deg, var(--brand-orange), var(--brand-orange-deep));
        }

        .nav-pill {
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255,255,255,0.88);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-pill.active {
          background: #fff;
          border-color: rgba(255,255,255,0.8);
          color: var(--brand-orange-deep);
        }

        .nav-pill:hover {
          background: rgba(255,255,255,0.16);
          color: #fff;
        }

        .header-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .header-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .header-kicker {
          margin: 0;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 700;
        }

        .header-title {
          margin: 0;
          font-size: clamp(1.8rem, 2vw, 2.4rem);
          letter-spacing: -0.06em;
          line-height: 1.1;
          font-weight: 800;
        }

        .header-breadcrumb {
          color: var(--muted);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .header-action {
          background: #f2f5f7;
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 12px;
          padding: 9px 12px;
          color: var(--text);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .header-search {
          min-width: 220px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #fff;
          color: var(--text);
        }

        .header-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0ea56f, #08a66c);
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 800;
          box-shadow: 0 10px 22px rgba(8,166,108,0.24);
        }

        .header-toolbar {
          position: relative;
          z-index: 45;
        }

        .header-search-wrap,
        .header-popover-wrap {
          position: relative;
        }

        .header-panel-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.18);
          z-index: 40;
        }

        .header-popover {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 370px;
          max-width: calc(100vw - 32px);
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 16px;
          box-shadow: 0 24px 56px rgba(15, 23, 42, 0.2);
          z-index: 50;
          overflow: hidden;
          text-align: left;
        }

        .search-popover {
          right: auto;
          left: 0;
          width: 430px;
        }

        .header-popover-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .header-popover-head h4 {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 800;
          color: #0f172a;
        }

        .header-popover-meta {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .header-popover-action {
          border: 0;
          background: transparent;
          color: #ef4a12;
          font: inherit;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          padding: 0;
        }

        .header-popover-action:hover {
          text-decoration: underline;
        }

        .header-popover-foot {
          padding: 12px 16px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .header-popover-foot .header-action {
          width: 100%;
          justify-content: center;
        }

        .header-feed-list {
          display: grid;
          max-height: 360px;
          overflow-y: auto;
        }

        .header-feed-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          border: 0;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          background: transparent;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .header-feed-item:hover {
          background: #f8fafc;
        }

        .header-feed-item:last-child {
          border-bottom: 0;
        }

        .header-feed-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .header-feed-dot.green {
          background: #08a66c;
        }

        .header-feed-dot.amber {
          background: #f59e0b;
        }

        .header-feed-dot.red {
          background: #ef4444;
        }

        .header-feed-dot.blue {
          background: #2563eb;
        }

        .header-feed-body {
          display: grid;
          gap: 3px;
          min-width: 0;
        }

        .header-feed-body strong {
          font-size: 0.82rem;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .header-feed-body > span {
          font-size: 0.74rem;
          color: #64748b;
          line-height: 1.45;
        }

        .header-feed-body .header-feed-time {
          font-size: 0.68rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .header-feed-unread {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4a12;
          flex-shrink: 0;
        }

        .header-alert-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .header-sev {
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 0.66rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }

        .header-sev.critical {
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
        }

        .header-sev.warning {
          background: rgba(245, 158, 11, 0.14);
          color: #b45309;
        }

        .header-sev.info {
          background: rgba(37, 99, 235, 0.12);
          color: #1d4ed8;
        }

        .header-feed-empty {
          padding: 20px 16px;
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
        }

        .header-badge {
          background: #ef4a12;
          color: #fff;
          border-radius: 999px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          font-size: 0.66rem;
          font-weight: 800;
          display: inline-grid;
          place-items: center;
        }

        .header-badge-amber {
          background: #f59e0b;
        }

        .period-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 11px 16px;
          border: 0;
          background: transparent;
          font: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          text-align: left;
        }

        .period-menu-item:hover {
          background: #f8fafc;
        }

        .period-menu-item.selected {
          color: #ef4a12;
          font-weight: 800;
          background: rgba(255, 107, 44, 0.06);
        }

        .period-current {
          font-size: 0.66rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }

        .period-menu-item.selected .period-current {
          color: #ef4a12;
        }

        .search-result-group {
          padding: 7px 16px;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
          background: #f8fafc;
          border-bottom: 1px solid rgba(15, 23, 42, 0.05);
        }

        .search-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          padding: 11px 16px;
          border: 0;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          background: transparent;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }

        .search-result-item:hover {
          background: #f8fafc;
        }

        .search-result-item strong {
          font-size: 0.84rem;
          color: #0f172a;
        }

        .search-result-sub {
          font-size: 0.72rem;
          color: #64748b;
          text-align: right;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .kpi-card {
          background: var(--card-bg);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 16px 16px 14px;
          box-shadow: var(--shadow);
          display: grid;
          gap: 12px;
          text-align: left;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 30px rgba(15,23,42,0.08);
        }

        .kpi-card.green { border-color: rgba(8,166,108,0.18); }
        .kpi-card.blue { border-color: rgba(37,99,235,0.18); }
        .kpi-card.purple { border-color: rgba(124,58,237,0.18); }
        .kpi-card.orange { border-color: rgba(245,158,11,0.18); }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .kpi-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: var(--green-soft);
          color: var(--green);
          font-weight: 700;
          font-size: 1.25rem;
        }

        .kpi-card.blue .kpi-icon { background: var(--blue-soft); color: var(--blue); }
        .kpi-card.purple .kpi-icon { background: var(--purple-soft); color: var(--purple); }
        .kpi-card.orange .kpi-icon { background: var(--orange-soft); color: var(--orange); }

        .kpi-label {
          color: var(--muted);
          font-size: 0.82rem;
          font-weight: 600;
        }

        .kpi-value {
          font-size: clamp(1.4rem, 1.8vw, 1.9rem);
          letter-spacing: -0.05em;
          font-weight: 800;
        }

        .kpi-change {
          color: var(--green);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .attention {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .attention-card {
          border: 1px solid var(--line);
          background: var(--card-bg);
          border-radius: 18px;
          box-shadow: var(--shadow);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .attention-label {
          color: var(--muted);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .attention-value {
          font-size: 2rem;
          letter-spacing: -0.06em;
          font-weight: 800;
          line-height: 1;
        }

        button.attention-card {
          font: inherit;
          color: inherit;
          text-align: left;
          cursor: pointer;
          min-width: 0;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        button.attention-card:hover {
          border-color: rgba(255,107,44,0.45);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15,23,42,0.08);
        }

        button.attention-card:focus-visible {
          outline: 3px solid rgba(255,107,44,0.45);
          outline-offset: 3px;
        }

        button.list-item-link {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          font: inherit;
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        button.list-item-link:hover {
          background: #f8fafc;
        }

        button.list-item-link:focus-visible {
          outline: 3px solid rgba(255,107,44,0.45);
          outline-offset: -3px;
        }

        .tone-amber { color: var(--amber); }
        .tone-red { color: var(--red); }
        .tone-blue { color: var(--blue); }
        .tone-green { color: var(--green); }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 18px;
        }

        .panel {
          background: var(--card-bg);
          border: 1px solid var(--line);
          border-radius: 22px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 18px 12px;
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.08rem;
          letter-spacing: -0.04em;
        }

        .chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chip {
          border-radius: 999px;
          background: #f3f6f7;
          color: var(--muted);
          padding: 6px 10px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .chip.active {
          background: rgba(8,166,108,0.12);
          color: var(--green);
        }

        .chart-wrap {
          padding: 16px 18px 18px;
        }

        .bars-row {
          display: flex;
          align-items: end;
          gap: 8px;
          height: 180px;
          padding-top: 12px;
        }

        .bar-group {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: end;
          justify-content: center;
          gap: 4px;
        }

        .mini-bar {
          flex: 1;
          border-radius: 8px 8px 0 0;
          background: linear-gradient(180deg, rgba(8,166,108,0.9), rgba(8,166,108,0.38));
          min-height: 30px;
        }

        .mini-bar.blue { background: linear-gradient(180deg, rgba(37,99,235,0.9), rgba(37,99,235,0.38)); }
        .mini-bar.orange { background: linear-gradient(180deg, rgba(245,158,11,0.9), rgba(245,158,11,0.38)); }

        .line-chart {
          height: 180px;
          display: flex;
          align-items: end;
          gap: 8px;
          padding-top: 12px;
        }

        .bar {
          flex: 1;
          border-radius: 10px 10px 0 0;
          background: linear-gradient(180deg, rgba(8,166,108,0.9), rgba(8,166,108,0.35));
          min-height: 46px;
          position: relative;
        }

        .bar.alt { background: linear-gradient(180deg, rgba(37,99,235,0.9), rgba(37,99,235,0.35)); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .state-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
        }

        .state-table th,
        .state-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          text-align: left;
        }

        .state-table th {
          color: var(--muted);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .status-pill {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(8,166,108,0.12);
          color: var(--green);
        }

        .status-pill.watch {
          background: rgba(245,158,11,0.12);
          color: #b45309;
        }

        .operations-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 18px;
        }

        .list-panel {
          padding: 0 0 12px;
        }

        .list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }

        .list-item:last-child {
          border-bottom: 0;
        }

        .list-main {
          display: grid;
          gap: 4px;
        }

        .list-main strong {
          font-size: 0.96rem;
        }

        .list-main span {
          color: var(--muted);
          font-size: 0.8rem;
        }

        .status-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(8,166,108,0.1);
          color: var(--green);
        }

        .status-tag.pending { background: rgba(245,158,11,0.15); color: #b45309; }
        .status-tag.escalated { background: rgba(239,68,68,0.12); color: var(--red); }
        .status-tag.in-progress { background: rgba(37,99,235,0.12); color: var(--blue); }

        .organization-panel {
          display: grid;
          gap: 16px;
        }

        .organization-grid {
          display: grid;
          grid-template-columns: 1.5fr 0.9fr;
          gap: 18px;
        }

        .org-tree {
          display: grid;
          gap: 12px;
        }

        .org-node {
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 16px;
          background: #f8fafb;
          padding: 14px 16px;
          display: grid;
          gap: 10px;
        }

        .org-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .org-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .org-admin {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }

        .org-admin strong {
          font-size: 0.82rem;
        }

        .org-admin a {
          font-size: 0.76rem;
          color: var(--green);
          text-decoration: none;
        }

        .org-admin a:hover {
          text-decoration: underline;
        }

        .org-unassigned {
          color: #b45309;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .org-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(15,23,42,0.45);
        }

        .org-modal {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          display: grid;
          gap: 12px;
          box-shadow: 0 24px 60px rgba(15,23,42,0.25);
        }

        .org-modal h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .org-modal-hint {
          margin: -6px 0 0;
          color: var(--muted);
          font-size: 0.82rem;
        }

        .org-modal-field {
          display: grid;
          gap: 6px;
        }

        .org-modal-field label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .org-modal-field input,
        .org-modal-field select {
          min-height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.12);
          background: #f8fafb;
          padding: 9px 10px;
          font: inherit;
          font-weight: 600;
        }

        .org-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 4px;
        }

        .org-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 54px;
          border-radius: 999px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 6px 9px;
          background: rgba(8,166,108,0.12);
          color: var(--green);
        }

        .org-badge.draft {
          background: rgba(245,158,11,0.12);
          color: #b45309;
        }

        .org-badge.inactive {
          background: rgba(148,163,184,0.12);
          color: #475569;
        }

        .org-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .org-button {
          border: 1px solid rgba(15,23,42,0.08);
          background: #fff;
          border-radius: 10px;
          padding: 7px 10px;
          color: var(--text);
          font-size: 0.72rem;
          font-weight: 700;
        }

        .org-button.primary {
          background: rgba(8,166,108,0.12);
          color: var(--green);
          border-color: rgba(8,166,108,0.2);
        }

        .org-children {
          display: grid;
          gap: 10px;
          padding-left: 16px;
          border-left: 2px solid rgba(15,23,42,0.06);
        }

        .org-leaf {
          display: grid;
          gap: 6px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.05);
          border-radius: 10px;
          padding: 10px 12px;
        }

        .org-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .org-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(8,166,108,0.12);
          color: var(--green);
          font-size: 0.7rem;
          font-weight: 700;
        }

        .org-chip.draft {
          background: rgba(245,158,11,0.14);
          color: #b45309;
        }

        .org-chip.inactive {
          background: rgba(148,163,184,0.16);
          color: #475569;
        }

        .org-quick {
          display: grid;
          gap: 12px;
        }

        .org-quick-card {
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 16px;
          background: #fff;
          padding: 14px 16px;
        }

        .org-quick-card h4 {
          margin: 0 0 8px;
          font-size: 1rem;
        }

        .org-checklist {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }

        .org-checklist li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #374151;
          font-size: 0.8rem;
        }

        .org-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--green);
        }

        .org-fields {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .org-field {
          display: grid;
          gap: 6px;
        }

        .org-field label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .org-field span {
          display: inline-flex;
          align-items: center;
          min-height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.08);
          background: #f8fafb;
          padding: 9px 10px;
          font-weight: 600;
        }



        .health-wrap .health-grid {
          display: grid;
          gap: 10px;
          padding: 0;
        }

        .health-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 2px 0 14px;
          margin-bottom: 12px;
          border-bottom: 1px dashed rgba(15,23,42,0.1);
        }

        .health-hero-value {
          display: block;
          font-size: 1.7rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #0f172a;
        }

        .health-hero-label {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
        }

        .health-hero-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #334155;
        }

        .health-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 0 4px rgba(8,166,108,0.16);
          flex-shrink: 0;
        }

        .health-dot.degraded {
          background: var(--amber);
          box-shadow: 0 0 0 4px rgba(245,158,11,0.18);
        }

        .health-item {
          display: grid;
          gap: 10px;
          padding: 12px 12px;
          border-radius: 12px;
          background: #f8fafb;
          border: 1px solid rgba(15,23,42,0.06);
        }

        .health-item-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .health-item-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .health-uptime {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .health-uptime-track {
          flex: 1;
          height: 7px;
          border-radius: 999px;
          background: rgba(15,23,42,0.07);
          overflow: hidden;
        }

        .health-uptime-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(8,166,108,0.7), #08a66c);
        }

        .health-uptime-fill.degraded {
          background: linear-gradient(90deg, rgba(245,158,11,0.7), var(--amber));
        }

        .health-name {
          font-weight: 700;
        }

        .health-meta {
          color: var(--muted);
          font-size: 0.72rem;
          margin-top: 2px;
        }

        .health-status {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .health-status.healthy { color: var(--green); }
        .health-status.degraded { color: var(--amber); }

        .trend-hero {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
          padding-bottom: 14px;
          margin-bottom: 4px;
          border-bottom: 1px dashed rgba(15,23,42,0.1);
        }

        .trend-hero-item {
          display: grid;
          gap: 3px;
        }

        .trend-hero-label {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
        }

        .trend-hero-value {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0f172a;
        }

        .trend-hero-value.trend-up { color: var(--green); }

        .trend-chart-svg {
          width: 100%;
          height: auto;
          display: block;
          margin-top: 12px;
          overflow: visible;
        }

        .trend-axis-label {
          font-size: 11px;
          font-weight: 700;
          fill: #94a3b8;
        }

        .trend-point-label {
          font-size: 12px;
          font-weight: 800;
          fill: #2563eb;
        }

        .sd-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding-bottom: 14px;
          border-bottom: 1px dashed rgba(15,23,42,0.1);
          font-size: 0.74rem;
          font-weight: 700;
          color: #475569;
        }

        .sd-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .sd-legend-gap {
          margin-left: auto;
          font-weight: 600;
          color: #64748b;
        }

        .sd-legend-gap strong { color: #ef4a12; }

        .sd-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }

        .sd-dot.supply { background: linear-gradient(180deg, rgba(8,166,108,0.95), rgba(8,166,108,0.5)); }
        .sd-dot.demand { background: linear-gradient(180deg, rgba(245,158,11,0.95), rgba(245,158,11,0.5)); }
        .sd-dot.completed { background: linear-gradient(180deg, rgba(8,166,108,0.95), rgba(8,166,108,0.55)); }
        .sd-dot.ongoing { background: linear-gradient(180deg, rgba(37,99,235,0.92), rgba(37,99,235,0.55)); }
        .sd-dot.cancelled { background: linear-gradient(180deg, rgba(239,74,18,0.92), rgba(239,74,18,0.55)); }

        .sd-chart {
          display: flex;
          align-items: end;
          gap: 10px;
          height: 196px;
          padding-top: 14px;
        }

        .sd-group {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .sd-bars {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: end;
          justify-content: center;
          gap: 4px;
        }

        .sd-bar {
          flex: 1;
          max-width: 20px;
          min-height: 6px;
          border-radius: 7px 7px 3px 3px;
          transition: transform 0.15s ease;
        }

        .sd-bar.supply { background: linear-gradient(180deg, rgba(8,166,108,0.95), rgba(8,166,108,0.4)); }
        .sd-bar.demand { background: linear-gradient(180deg, rgba(245,158,11,0.95), rgba(245,158,11,0.4)); }

        .sd-group:hover .sd-bar { transform: scaleY(1.04); transform-origin: bottom; }

        .sd-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
          white-space: nowrap;
        }

        .sd-gap {
          font-size: 0.66rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 999px;
        }

        .sd-gap.short { background: rgba(239,74,18,0.1); color: #ef4a12; }
        .sd-gap.surplus { background: rgba(8,166,108,0.1); color: #078653; }

        .bt-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin: 10px 0 6px;
          font-size: 0.74rem;
          font-weight: 700;
          color: #475569;
        }

        .bt-chart {
          display: flex;
          align-items: end;
          gap: 10px;
          height: 196px;
          padding-top: 8px;
        }

        .bt-group {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bt-track {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: end;
          justify-content: center;
        }

        .bt-bar {
          width: 100%;
          max-width: 20px;
          display: flex;
          flex-direction: column-reverse;
          min-height: 6px;
          border-radius: 8px 8px 3px 3px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(15,23,42,0.05);
        }

        .bt-seg {
          width: 100%;
        }

        .bt-seg.completed { background: linear-gradient(180deg, rgba(8,166,108,0.95), rgba(8,166,108,0.45)); }
        .bt-seg.ongoing { background: linear-gradient(180deg, rgba(37,99,235,0.92), rgba(37,99,235,0.4)); }
        .bt-seg.cancelled { background: linear-gradient(180deg, rgba(239,74,18,0.92), rgba(239,74,18,0.45)); }

        .bt-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
        }

        .bt-hero {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
          padding-bottom: 12px;
          margin-bottom: 6px;
          border-bottom: 1px dashed rgba(15,23,42,0.1);
        }

        .bt-hero-item {
          display: grid;
          gap: 3px;
        }

        .bt-hero-label {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
        }

        .bt-hero-value {
          font-size: 1.22rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #0f172a;
        }

        .bt-hero-value.green { color: var(--green); }
        .bt-hero-value.blue { color: #2563eb; }
        .bt-hero-value.red { color: #ef4a12; }

        .bt-simple-chart {
          display: grid;
          gap: 10px;
        }

        .bt-simple-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bt-simple-bar {
          flex: 1;
          height: 12px;
          border-radius: 999px;
          background: #f3f6f7;
          display: flex;
          overflow: hidden;
        }

        .bt-simple-seg.completed { background: linear-gradient(90deg, rgba(8,166,108,0.95), #08a66c); }
        .bt-simple-seg.ongoing { background: linear-gradient(90deg, rgba(37,99,235,0.9), #1d4ed8); }
        .bt-simple-seg.cancelled { background: linear-gradient(90deg, rgba(239,74,18,0.92), #ef4a12); }

        .bt-simple-label {
          width: 36px;
          text-align: right;
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
        }
        .booking-date-panel .panel-header {
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 14px;
        }

        .booking-date-title p {
          margin: 4px 0 0;
          color: var(--muted);
          font-size: 0.78rem;
        }

        .booking-date-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .booking-date-controls .chip {
          border: 0;
          cursor: pointer;
          font: inherit;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .booking-date-input {
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 6px 12px;
          background: #fff;
          color: #182230;
          font: inherit;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .booking-date-input:focus-visible {
          outline: 2px solid rgba(8,166,108,0.35);
          outline-offset: 1px;
        }

        .booking-date-search {
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 6px 12px;
          background: #fff;
          color: #182230;
          font: inherit;
          font-size: 0.76rem;
          min-width: 180px;
        }

        .booking-date-search:focus-visible {
          outline: 2px solid rgba(8,166,108,0.35);
          outline-offset: 1px;
        }

        .booking-date-no-match {
          padding: 18px;
          color: var(--muted);
          font-size: 0.8rem;
          text-align: center;
        }

        .booking-date-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .booking-date-stat {
          display: grid;
          gap: 4px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #f8fafb;
          border: 1px solid rgba(15,23,42,0.06);
        }

        .booking-date-stat span {
          color: var(--muted);
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .booking-date-stat strong {
          font-size: 1.15rem;
          color: #182230;
        }

        .booking-date-stat strong.tone-green { color: var(--green); }
        .booking-date-stat strong.tone-blue { color: #2563eb; }
        .booking-date-stat strong.tone-amber { color: #b45309; }
        .booking-date-stat strong.tone-red { color: #dc2626; }

        .booking-date-table-wrap {
          overflow-x: auto;
        }

        .booking-date-table {
          min-width: 920px;
        }

        .booking-date-id {
          font-weight: 800;
          color: #182230;
        }

        .booking-date-equip {
          display: grid;
          gap: 2px;
        }

        .booking-date-equip strong {
          font-size: 0.82rem;
        }

        .booking-date-equip span {
          color: var(--muted);
          font-size: 0.72rem;
        }

        .booking-date-status {
          display: inline-flex;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .booking-date-status.completed { background: rgba(8,166,108,0.12); color: var(--green); }
        .booking-date-status.ongoing { background: rgba(37,99,235,0.12); color: #2563eb; }
        .booking-date-status.pending { background: rgba(245,158,11,0.14); color: #b45309; }
        .booking-date-status.cancelled { background: rgba(239,68,68,0.12); color: #dc2626; }

        .booking-date-empty {
          padding: 30px 18px;
          text-align: center;
          color: var(--muted);
          font-size: 0.86rem;
        }
      `}</style>

      <aside className="superadmin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">E</div>
          <div>
            <div className="brand-text">EquipHub</div>
            <div className="brand-meta">Platform Admin</div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Overview</div>
          <ul className="sidebar-stack">
            <li><button type="button" onClick={() => navigateSidebar('Dashboard')} className={`sidebar-item ${selectedSidebarPage === null ? 'active' : ''}`}>Dashboard <span className="sidebar-pill">Live</span></button></li>
          </ul>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Geography</div>
          <ul className="sidebar-stack">
            <li>
              <button
                type="button"
                onClick={() => {
                  setStatesFilterFromSidebar('all')
                  navigateSidebar('States')
                }}
                className={`sidebar-item ${selectedSidebarPage === 'States' ? 'active' : ''}`}
              >
                <span>States</span>
                <span className="sidebar-pill">{statesList.length}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setCitiesFilterFromSidebar('all')
                  navigateSidebar('Cities')
                }}
                className={`sidebar-item ${selectedSidebarPage === 'Cities' ? 'active' : ''}`}
              >
                <span>Cities</span>
                <span className="sidebar-pill">{citiesList.length}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setZonesFilterFromSidebar('all')
                  navigateSidebar('Zones')
                }}
                className={`sidebar-item ${selectedSidebarPage === 'Zones' ? 'active' : ''}`}
              >
                <span>Zones</span>
                <span className="sidebar-pill">{zonesList.length}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setServiceAreasFilterFromSidebar('all')
                  navigateSidebar('Service Areas')
                }}
                className={`sidebar-item ${selectedSidebarPage === 'Service Areas' ? 'active' : ''}`}
              >
                <span>Service Areas</span>
                <span className="sidebar-pill">{serviceAreasList.length}</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Organization & Access</div>
          <ul className="sidebar-stack">
            <li><button type="button" onClick={() => navigateSidebar('Users')} className={`sidebar-item ${selectedSidebarPage === 'Users' ? 'active' : ''}`}>Users</button></li>
            <li><button type="button" onClick={() => navigateSidebar('Roles & Permissions')} className={`sidebar-item ${selectedSidebarPage === 'Roles & Permissions' ? 'active' : ''}`}>Roles & Permissions</button></li>
            <li><button type="button" onClick={() => navigateSidebar('Approval Limits')} className={`sidebar-item ${selectedSidebarPage === 'Approval Limits' ? 'active' : ''}`}>Approval Limits</button></li>
            <li><button type="button" onClick={() => navigateSidebar('Sessions & Devices')} className={`sidebar-item ${selectedSidebarPage === 'Sessions & Devices' ? 'active' : ''}`}>Sessions & Devices</button></li>
          </ul>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Platform</div>
          <ul className="sidebar-stack">
            <li>
              <button
                type="button"
                onClick={() => navigateSidebar('Global Rules')}
                className={`sidebar-item ${selectedSidebarPage === 'Global Rules' ? 'active' : ''}`}
              >
                <span>Global Rules</span>
                <span className="sidebar-pill">{rulesCountFor('global')}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateSidebar('Booking Rules')}
                className={`sidebar-item ${selectedSidebarPage === 'Booking Rules' ? 'active' : ''}`}
              >
                <span>Booking Rules</span>
                <span className="sidebar-pill">{rulesCountFor('booking')}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateSidebar('Pricing')}
                className={`sidebar-item ${selectedSidebarPage === 'Pricing' ? 'active' : ''}`}
              >
                <span>Pricing</span>
                <span className="sidebar-pill">{rulesCountFor('pricing')}</span>
              </button>
            </li>
             <li>
              <button
                type="button"
                onClick={() => navigateSidebar('Feature Flags')}
                className={`sidebar-item ${selectedSidebarPage === 'Feature Flags' ? 'active' : ''}`}
              >
                <span>Feature Flags</span>
                <span className="sidebar-pill">{featureFlagsList.filter((flag) => flag.enabled).length} ON</span>
              </button>
            </li>
            <li><button type="button" onClick={() => navigateSidebar('GST Management')} className={`sidebar-item ${selectedSidebarPage === 'GST Management' ? 'active' : ''}`}>GST Management</button></li>
            <li><button type="button" onClick={() => navigateSidebar('Document Management')} className={`sidebar-item ${selectedSidebarPage === 'Document Management' ? 'active' : ''}`}>Document Management</button></li>
            <li><button type="button" onClick={() => navigateSidebar('Refund Management')} className={`sidebar-item ${selectedSidebarPage === 'Refund Management' ? 'active' : ''}`}>Refund Management</button></li>
            <li><button type="button" onClick={() => navigateSidebar('Support Tickets')} className={`sidebar-item ${selectedSidebarPage === 'Support Tickets' ? 'active' : ''}`}>Support Tickets</button></li>
            <li><button type="button" onClick={() => navigateSidebar('Notifications')} className={`sidebar-item ${selectedSidebarPage === 'Notifications' ? 'active' : ''}`}>Notifications <span className="sidebar-pill">{unreadNotifications}</span></button></li>
            <li>
              <button
                type="button"
                onClick={() => navigateSidebar('Audit Log')}
                className={`sidebar-item ${selectedSidebarPage === 'Audit Log' ? 'active' : ''}`}
              >
                <span>Audit Log</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <button type="button" onClick={() => navigateSidebar('Help / Docs')} className={`sidebar-item ${selectedSidebarPage === 'Help / Docs' ? 'active' : ''}`}>Help / Docs</button>
          <button type="button" onClick={() => navigateSidebar('Super Admin Profile')} className={`sidebar-item ${selectedSidebarPage === 'Super Admin Profile' ? 'active' : ''}`}>Super Admin Profile</button>
          <button type="button" onClick={() => navigateSidebar('Sign Out')} className="sidebar-item">Sign Out</button>
        </div>
      </aside>

      <div className="superadmin-main">
        <header className="dashboard-header">
          <div className="header-copy">
            <p className="header-kicker">National Overview</p>
            <h1 className="header-title">India • All States • All Cities</h1>
            <div className="header-breadcrumb">Overview / Platform / National View</div>
          </div>

          <div className="header-actions">
            {selectedSidebarPage === null && (
              <nav className="superadmin-nav" aria-label="Super admin menu">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'geography', label: 'Geography' },
                  { id: 'operations', label: 'Operations' },
                  { id: 'finance', label: 'Finance' },
                  { id: 'compliance', label: 'Compliance' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-pill ${activeNav === item.id ? 'active' : ''}`}
                    aria-current={activeNav === item.id ? 'location' : undefined}
                    onClick={() => navigateToSection(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            <div className="header-toolbar">
              {headerPanel && <div className="header-panel-backdrop" aria-hidden="true" onClick={() => setHeaderPanel(null)} />}

              <div className="header-search-wrap">
                <input
                  className="header-search"
                  aria-label="Global search"
                  placeholder="Search states, cities, zones..."
                  value={globalQuery}
                  onChange={(event) => {
                    const value = event.target.value
                    setGlobalQuery(value)
                    setHeaderPanel(value.trim() ? 'search' : null)
                  }}
                  onFocus={() => setHeaderPanel(globalQuery.trim() ? 'search' : null)}
                />
                {headerPanel === 'search' && (
                  <div className="header-popover search-popover" role="listbox" aria-label="Search results">
                    <div className="header-popover-head">
                      <h4>Search results</h4>
                      <span className="header-popover-meta">{searchResults.length} found</span>
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="header-feed-empty">No matches for “{globalQuery.trim()}”. Try a state, city, zone or KPI name.</div>
                    ) : (
                      searchResults.map((result, index) => {
                        const showGroup = index === 0 || searchResults[index - 1].group !== result.group
                        return (
                          <Fragment key={result.id}>
                            {showGroup && <div className="search-result-group">{result.group}</div>}
                            <button type="button" className="search-result-item" onClick={() => runSearchTarget(result.target)}>
                              <strong>{result.label}</strong>
                              <span className="search-result-sub">{result.sub}</span>
                            </button>
                          </Fragment>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="header-popover-wrap">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'notifications' ? 'is-open' : ''}`}
                  aria-label="View notifications"
                  onClick={() => setHeaderPanel(headerPanel === 'notifications' ? null : 'notifications')}
                >
                  🔔 {unreadNotifications > 0 && <span className="header-badge">{unreadNotifications}</span>}
                </button>
                {headerPanel === 'notifications' && (
                  <div className="header-popover" role="dialog" aria-label="Notifications">
                    <div className="header-popover-head">
                      <h4>Notifications</h4>
                      {unreadNotifications > 0 && (
                        <button type="button" className="header-popover-action" onClick={markAllNotificationsRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="header-feed-list">
                      {notificationsList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="header-feed-item"
                          onClick={() => {
                            markNotificationRead(item.id)
                            openFeedTarget(item.target)
                          }}
                        >
                          <span className={`header-feed-dot ${item.tone}`} />
                          <span className="header-feed-body">
                            <strong>
                              {item.title}
                              {!item.read && <span className="header-feed-unread" />}
                            </strong>
                            <span>{item.detail}</span>
                            <span className="header-feed-time">{item.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'alerts' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'alerts' ? null : 'alerts')}
                >
                  ⚠ Alerts {alertsList.length > 0 && <span className="header-badge header-badge-amber">{alertsList.length}</span>}
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{alertsList.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {alertsList.map((item) => (
                        <button key={item.id} type="button" className="header-feed-item" onClick={() => openFeedTarget(item.target)}>
                          <span className={`header-feed-dot ${item.severity === 'Critical' ? 'red' : item.severity === 'Warning' ? 'amber' : 'blue'}`} />
                          <span className="header-feed-body">
                            <span className="header-alert-top">
                              <strong>{item.title}</strong>
                              <span className={`header-sev ${item.severity.toLowerCase()}`}>{item.severity}</span>
                            </span>
                            <span>{item.detail}</span>
                            <span className="header-feed-time">{item.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="header-popover-foot">
                      <button type="button" className="header-action" onClick={() => openFeedTarget('attention:security-alerts')}>
                        Open security queue
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'period' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'period' ? null : 'period')}
                >
                  {dashboardPeriod} ▾
                </button>
                {headerPanel === 'period' && (
                  <div className="header-popover period-popover" role="dialog" aria-label="Dashboard period">
                    <div className="header-popover-head">
                      <h4>Dashboard period</h4>
                    </div>
                    {dashboardPeriods.map((period) => (
                      <button
                        key={period}
                        type="button"
                        className={`period-menu-item ${dashboardPeriod === period ? 'selected' : ''}`}
                        onClick={() => {
                          setDashboardPeriod(period)
                          setHeaderPanel(null)
                        }}
                      >
                        <span>{period}</span>
                        {dashboardPeriod === period && <span className="period-current">Current</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <button
                  type="button"
                  className="header-avatar"
                  aria-label="User profile"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      if (window.location.hash.startsWith('#super-admin/profile')) {
                        navigateSidebar('Dashboard')
                      } else {
                        navigateSidebar('Super Admin Profile')
                      }
                    }
                  }}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  SA
                </button>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>Super Admin</span>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
            </div>
          </div>
        </header>

        {isBookingLedgerPage ? (
          <BookingLedgerPage onBack={returnToRevenue} initialFilter={bookingStatusFilter} onFilterChange={updateBookingLedgerFilter} />
        ) : selectedAttentionSlug ? (
          <AttentionDetailPage
            slug={selectedAttentionSlug}
            payouts={payoutRequests}
            alerts={securityAlerts}
            jobs={unassignedJobs}
            kycs={kycReviews}
            onAct={handleAttentionAction}
            onBack={returnFromAttention}
          />
        ) : selectedKpi ? (
          <KpiDetailPage metric={selectedKpi} onBack={returnToOverview} onOpenBookingLedger={openBookingLedger} />
        ) : selectedSidebarPage === 'States' ? (
          <StatesPage
            key={`states-page-${pageSearch?.page === 'States' ? pageSearch.token : 0}`}
            states={statesList}
            setStates={setStatesList}
            onBack={() => navigateSidebar('Dashboard')}
            statusFilter={statesFilterFromSidebar}
            onStatusFilterChange={setStatesFilterFromSidebar}
            isAddModalOpen={sidebarTriggerAddState}
            setIsAddModalOpen={setSidebarTriggerAddState}
            initialSearchQuery={pageSearch?.page === 'States' ? pageSearch.query : undefined}
            initialSelectedState={pageSearch?.page === 'States' ? pageSearch.query : undefined}
          />
        ) : selectedSidebarPage === 'Cities' ? (
          <CitiesPage
            key={`cities-page-${pageSearch?.page === 'Cities' ? pageSearch.token : 0}`}
            cities={citiesList}
            setCities={setCitiesList}
            onBack={() => navigateSidebar('Dashboard')}
            statusFilter={citiesFilterFromSidebar}
            onStatusFilterChange={setCitiesFilterFromSidebar}
            isAddModalOpen={sidebarTriggerAddCity}
            setIsAddModalOpen={setSidebarTriggerAddCity}
            initialSearchQuery={pageSearch?.page === 'Cities' ? pageSearch.query : undefined}
          />
        ) : selectedSidebarPage === 'Zones' ? (
          <ZonesPage
            key={`zones-page-${pageSearch?.page === 'Zones' ? pageSearch.token : 0}`}
            zones={zonesList}
            setZones={setZonesList}
            onBack={() => navigateSidebar('Dashboard')}
            statusFilter={zonesFilterFromSidebar}
            onStatusFilterChange={setZonesFilterFromSidebar}
            isAddModalOpen={sidebarTriggerAddZone}
            setIsAddModalOpen={setSidebarTriggerAddZone}
            initialSearchQuery={pageSearch?.page === 'Zones' ? pageSearch.query : undefined}
          />
        ) : selectedSidebarPage === 'Service Areas' ? (
          <ServiceAreasPage
            areas={serviceAreasList}
            setAreas={setServiceAreasList}
            onBack={() => navigateSidebar('Dashboard')}
            statusFilter={serviceAreasFilterFromSidebar}
            onStatusFilterChange={setServiceAreasFilterFromSidebar}
            isAddModalOpen={sidebarTriggerAddServiceArea}
            setIsAddModalOpen={setSidebarTriggerAddServiceArea}
          />
        ) : selectedSidebarPage === 'Global Rules' ||
            selectedSidebarPage === 'Booking Rules' ||
            selectedSidebarPage === 'Pricing' ? (
          <RulesEnginePage
            section={selectedSidebarPage}
            domain={
              selectedSidebarPage === 'Pricing'
                ? 'pricing'
                : selectedSidebarPage === 'Booking Rules'
                  ? 'booking'
                  : 'global'
            }
            rules={rulesList}
            setRules={setRulesList}
            onBack={() => navigateSidebar('Dashboard')}
          />
        ) : selectedSidebarPage === 'Feature Flags' ? (
          <FeatureFlagsPage
            flags={featureFlagsList}
            setFlags={setFeatureFlagsList}
            onBack={() => navigateSidebar('Dashboard')}
          />
        ) : selectedSidebarPage === 'Audit Log' ? (
          <AuditLogPage onBack={() => navigateSidebar('Dashboard')} />
        ) : selectedSidebarPage === 'Users' ? (
          <UsersPage onBack={() => navigateSidebar('Dashboard')} />
        ) : selectedSidebarPage === 'Roles & Permissions' ? (
          <RolesPermissionsPage onBack={() => navigateSidebar('Dashboard')} />
        ) : selectedSidebarPage === 'Approval Limits' ? (
          <ApprovalLimitsPage staff={staffList} setStaff={setStaffList} onBack={() => navigateSidebar('Dashboard')} />
        ) : selectedSidebarPage === 'Sessions & Devices' ? (
          <SessionsDevicesPage staff={staffList} setStaff={setStaffList} onBack={() => navigateSidebar('Dashboard')} />
        ) : selectedSidebarPage === 'Document Management' ? (
          <DocumentManagementPage
            section="all"
            onNavigate={(section) => navigateSidebar(section)}
            onBack={() => navigateSidebar('Dashboard')}
          />
        ) : selectedSidebarPage === 'Refund Management' ? (
          <RefundManagementPage onBack={() => navigateSidebar('Dashboard')} />
        ) : selectedSidebarPage === 'Support Tickets' ? (
          <SupportTicketsPage onBack={() => navigateSidebar('Dashboard')} />
        ) : selectedSidebarPage === 'Notifications' ? (
          <NotificationsPage
            notifications={notificationsList}
            setNotifications={setNotificationsList}
            onNavigate={openFeedTarget}
            onBack={() => navigateSidebar('Dashboard')}
          />
        ) : selectedSidebarPage && documentSections.includes(selectedSidebarPage as DocumentSection) ? (
          <DocumentManagementPage
            section={selectedSidebarPage as DocumentSection}
            onNavigate={(section) => navigateSidebar(section)}
            onBack={() => navigateSidebar('Dashboard')}
          />
        ) : selectedSidebarPage === 'GST Management' ? (
          <GstManagementPage
            section="all"
            onNavigate={(section) => navigateSidebar(section)}
            onBack={() => navigateSidebar('Dashboard')}
          />
        ) : selectedSidebarPage && gstSections.includes(selectedSidebarPage as GstSection) ? (
          <GstManagementPage
            section={selectedSidebarPage as GstSection}
            onNavigate={(section) => navigateSidebar(section)}
            onBack={() => navigateSidebar('Dashboard')}
          />
        ) : selectedSidebarPage ? (
          <section className="sidebar-page" aria-live="polite">
            <div className="sidebar-page-intro">
              <div>
                <p className="header-kicker">Super Admin Workspace</p>
                <h2>{selectedSidebarPage}</h2>
                <p>{superAdminFeatureGroups[sidebarPageGroup[selectedSidebarPage] ?? 0].title}</p>
              </div>
              <button type="button" className="header-action" onClick={() => navigateSidebar('Dashboard')}>Back to dashboard</button>
            </div>
            <div className="sidebar-page-list">
              {selectedPageFeatures.map((feature) => (
                <div className="sidebar-page-feature" key={feature}>{feature}</div>
              ))}
            </div>
          </section>
        ) : (
          <div className="dashboard-content">
        <div className="kpi-grid" id="overview">
          {kpiMetrics.map((item, index) => (
            <button
              type="button"
              key={item.label}
              className={`kpi-card ${item.tone}`}
              aria-label={`Open ${item.label} detail page`}
              onClick={() => openKpiPage(index)}
            >
              <div className="kpi-top">
                <div className="kpi-label">{item.label}</div>
                <div className="kpi-icon">↗</div>
              </div>
              <div className="kpi-value">{item.value}</div>
              <div className="kpi-change">{item.reportedChange}</div>
            </button>
          ))}
        </div>

        <section className="attention">
          {attentionKpis.map((item) => (
            <button
              type="button"
              key={item.slug}
              className="attention-card"
              aria-label={`Open ${item.title} queue`}
              onClick={() => openAttentionQueue(item.slug)}
            >
              <div>
                <div className="attention-label">{item.title}</div>
                <div className={`attention-value tone-${item.tone}`}>{attentionCounts[item.slug]}</div>
              </div>
              <div className="kpi-icon">↗</div>
            </button>
          ))}
        </section>

        <section className="panel organization-panel" id="geography">
          <div className="panel-header">
            <h3>Geography and organization</h3>
            <button type="button" className="org-button primary" onClick={() => { setSidebarTriggerAddState(true); navigateSidebar('States') }}>+ Launch new state</button>
          </div>

          <div className="chart-wrap org-tree">
            {organization.map((state) => (
              <div key={state.id} className="org-node">
                <div className="org-summary">
                  <div>
                    <strong>{state.name}</strong>
                    <div className="org-meta">
                      <span className={`org-badge ${state.status}`}>{state.status}</span>
                      {state.adminName ? (
                        <span className="org-admin">
                          <strong>{state.adminName}</strong>
                          <a href={`mailto:${state.adminEmail}`}>{state.adminEmail}</a>
                        </span>
                      ) : (
                        <span className="org-unassigned">No state admin assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="org-actions">
                    <button type="button" className="org-button" onClick={() => openOrgEdit(state)}>Edit</button>
                    <button
                      type="button"
                      className={state.adminName ? 'org-button' : 'org-button primary'}
                      onClick={() => openOrgAdmin(state)}
                    >
                      {state.adminName ? 'Change admin' : 'Assign admin'}
                    </button>
                  </div>
                </div>

                <div className="org-children">
                  {state.children?.map((city) => (
                    <div key={city.id} className="org-leaf">
                      <div className="org-summary">
                        <div>
                          <strong>{city.name}</strong>
                          <div className="org-meta">
                            <span className={`org-badge ${city.status}`}>{city.status}</span>
                            <small>{city.owner}</small>
                          </div>
                        </div>
                        <div className="org-chip-row">
                          {city.children?.map((zone) => (
                            <span key={zone.id} className={`org-chip ${zone.status}`}>{zone.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {orgEditId && (
          <div className="org-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit state">
            <form className="org-modal" onSubmit={submitOrgEdit}>
              <h3>Edit state</h3>
              <div className="org-modal-field">
                <label>State name</label>
                <input value={orgEditForm.name} onChange={(e) => setOrgEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="org-modal-field">
                <label>Service area</label>
                <input value={orgEditForm.serviceArea} onChange={(e) => setOrgEditForm((f) => ({ ...f, serviceArea: e.target.value }))} />
              </div>
              <div className="org-modal-field">
                <label>Operating hours</label>
                <input value={orgEditForm.hours} onChange={(e) => setOrgEditForm((f) => ({ ...f, hours: e.target.value }))} />
              </div>
              <div className="org-modal-field">
                <label>Status</label>
                <select value={orgEditForm.status} onChange={(e) => setOrgEditForm((f) => ({ ...f, status: e.target.value as OrgStatus }))}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="org-modal-actions">
                <button type="button" className="org-button" onClick={() => setOrgEditId(null)}>Cancel</button>
                <button type="submit" className="org-button primary">Save changes</button>
              </div>
            </form>
          </div>
        )}

        {orgAdminId && (
          <div className="org-modal-overlay" role="dialog" aria-modal="true" aria-label="Assign state admin">
            <form className="org-modal" onSubmit={submitOrgAdmin}>
              <h3>{organization.find((s) => s.id === orgAdminId)?.adminName ? 'Change state admin' : 'Assign state admin'}</h3>
              <p className="org-modal-hint">{organization.find((s) => s.id === orgAdminId)?.name}</p>
              <div className="org-modal-field">
                <label>Admin name</label>
                <input value={orgAdminForm.adminName} onChange={(e) => setOrgAdminForm((f) => ({ ...f, adminName: e.target.value }))} placeholder="e.g. Rakesh Reddy" />
              </div>
              <div className="org-modal-field">
                <label>Admin email</label>
                <input type="email" value={orgAdminForm.adminEmail} onChange={(e) => setOrgAdminForm((f) => ({ ...f, adminEmail: e.target.value }))} placeholder="name@fieldwork.in" />
              </div>
              <div className="org-modal-actions">
                <button type="button" className="org-button" onClick={() => setOrgAdminId(null)}>Cancel</button>
                <button type="submit" className="org-button primary">{organization.find((s) => s.id === orgAdminId)?.adminName ? 'Save admin' : 'Assign admin'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="analytics-grid" id="finance">
          <div className="panel">
            <div className="panel-header">
              <h3>Revenue Trend</h3>
              <div className="chip-row">
                <span className="chip active">Monthly</span>
                <span className="chip">Quarterly</span>
                <span className="chip">Yearly</span>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="trend-hero">
                <div className="trend-hero-item">
                  <span className="trend-hero-label">12-month revenue</span>
                  <span className="trend-hero-value">₹87.1M</span>
                </div>
                <div className="trend-hero-item">
                  <span className="trend-hero-label">This month</span>
                  <span className="trend-hero-value">₹10.8M</span>
                </div>
                <div className="trend-hero-item">
                  <span className="trend-hero-label">Month over month</span>
                  <span className="trend-hero-value trend-up">▲ 12.5%</span>
                </div>
              </div>
              <svg
                className="trend-chart-svg"
                viewBox={`0 0 ${revenueChartGeometry.width} ${revenueChartGeometry.height}`}
                role="img"
                aria-label="Revenue trend over the last 12 months"
              >
                <defs>
                  <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(8,166,108,0.38)" />
                    <stop offset="100%" stopColor="rgba(8,166,108,0.02)" />
                  </linearGradient>
                  <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#08a66c" />
                    <stop offset="55%" stopColor="#0e9f8b" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                  const y = revenueChartGeometry.padTop + t * (revenueChartGeometry.height - revenueChartGeometry.padTop - revenueChartGeometry.padBottom)
                  return (
                    <line
                      key={t}
                      x1={revenueChartGeometry.padX}
                      x2={revenueChartGeometry.width - revenueChartGeometry.padX}
                      y1={y}
                      y2={y}
                      stroke="rgba(15,23,42,0.07)"
                      strokeDasharray="4 6"
                    />
                  )
                })}
                <path d={revenueAreaPath} fill="url(#revenueArea)" />
                <path d={revenueLinePath} fill="none" stroke="url(#revenueLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {revenuePoints.map((p, i) => (
                  <g key={p.month}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={i === revenuePoints.length - 1 ? 6 : 3.5}
                      fill="#fff"
                      stroke={i === revenuePoints.length - 1 ? '#2563eb' : '#08a66c'}
                      strokeWidth="3"
                    />
                    <text x={p.x} y={revenueChartGeometry.height - 12} textAnchor="middle" className="trend-axis-label">{p.month}</text>
                    {i === revenuePoints.length - 1 && (
                      <text x={p.x} y={p.y - 14} textAnchor="middle" className="trend-point-label">{`₹${p.value}M`}</text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Bookings Trend</h3>
              <div className="chip-row">
                <span className="chip active">All</span>
                <span className="chip">Accepted</span>
                <span className="chip">Closed</span>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="bt-hero">
                <div className="bt-hero-item">
                  <span className="bt-hero-label">Total bookings (12m)</span>
                  <span className="bt-hero-value">{bookingTrendGrandTotal.toLocaleString()}</span>
                </div>
                <div className="bt-hero-item">
                  <span className="bt-hero-label">Completed</span>
                  <span className="bt-hero-value green">{bookingTrendData.reduce((a, d) => a + d.completed, 0).toLocaleString()}</span>
                </div>
                <div className="bt-hero-item">
                  <span className="bt-hero-label">Ongoing</span>
                  <span className="bt-hero-value blue">{bookingTrendData.reduce((a, d) => a + d.ongoing, 0).toLocaleString()}</span>
                </div>
                <div className="bt-hero-item">
                  <span className="bt-hero-label">Cancelled</span>
                  <span className="bt-hero-value red">{bookingTrendData.reduce((a, d) => a + d.cancelled, 0).toLocaleString()}</span>
                </div>
                <div className="bt-hero-item">
                  <span className="bt-hero-label">Completion</span>
                  <span className="bt-hero-value green">{bookingTrendCompletion}%</span>
                </div>
              </div>
              <div className="bt-simple-chart">
                {bookingTrendData.map((d, i) => {
                  const total = bookingTrendTotals[i]
                  const completedPct = (d.completed / total) * 100
                  const ongoingPct = (d.ongoing / total) * 100
                  const cancelledPct = (d.cancelled / total) * 100
                  return (
                    <div className="bt-simple-group" key={d.month}>
                      <div className="bt-simple-bar">
                        <div className="bt-simple-seg completed" style={{ width: `${completedPct}%` }} />
                        <div className="bt-simple-seg ongoing" style={{ width: `${ongoingPct}%` }} />
                        <div className="bt-simple-seg cancelled" style={{ width: `${cancelledPct}%` }} />
                      </div>
                      <span className="bt-simple-label">{d.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="panel booking-date-panel" id="booking-date">
          <div className="panel-header">
            <div className="booking-date-title">
              <h3>Bookings by date</h3>
              <p>Select a date to see every booking scheduled that day.</p>
            </div>
            <div className="booking-date-controls">
              <div className="chip-row">
                {recentBookingDates.map((option) => (
                  <button
                    key={option.iso}
                    type="button"
                    className={`chip ${bookingDate === option.iso ? 'active' : ''}`}
                    onClick={() => setBookingDate(option.iso)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                className="booking-date-input"
                value={bookingDate}
                onChange={(event) => setBookingDate(event.target.value)}
                aria-label="Filter bookings by date"
              />
              <input
                type="text"
                className="booking-date-search"
                value={bookingDateSearch}
                onChange={(event) => setBookingDateSearch(event.target.value)}
                placeholder="Search booking ID"
                aria-label="Search bookings by ID"
              />
            </div>
          </div>
          <div className="chart-wrap">
            {selectedDateSummary.total > 0 ? (
              <Fragment>
                <div className="booking-date-summary">
                  <div className="booking-date-stat">
                    <span>Total</span>
                    <strong>{selectedDateSummary.total}</strong>
                  </div>
                  <div className="booking-date-stat">
                    <span>Completed</span>
                    <strong className="tone-green">{selectedDateSummary.completed}</strong>
                  </div>
                  <div className="booking-date-stat">
                    <span>Ongoing</span>
                    <strong className="tone-blue">{selectedDateSummary.ongoing}</strong>
                  </div>
                  <div className="booking-date-stat">
                    <span>Pending</span>
                    <strong className="tone-amber">{selectedDateSummary.pending}</strong>
                  </div>
                  <div className="booking-date-stat">
                    <span>Cancelled</span>
                    <strong className="tone-red">{selectedDateSummary.cancelled}</strong>
                  </div>
                  <div className="booking-date-stat">
                    <span>Revenue</span>
                    <strong>{formatBookingCurrency(selectedDateSummary.revenue)}</strong>
                  </div>
                  <div className="booking-date-stat">
                    <span>Completion</span>
                    <strong className="tone-green">{selectedDateSummary.completionRate}%</strong>
                  </div>
                </div>
                <div className="booking-date-table-wrap">
                  <table className="state-table booking-date-table">
                    <thead>
                      <tr>
                        <th>Booking</th>
                        <th>Customer</th>
                        <th>Operator</th>
                        <th>Owner</th>
                        <th>Equipment</th>
                        <th>Location</th>
                        <th>Slot</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDateBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            <span className="booking-date-id">{booking.id}</span>
                          </td>
                          <td>{booking.customer}</td>
                          <td>{booking.operator}</td>
                          <td>{booking.owner}</td>
                          <td>
                            <div className="booking-date-equip">
                              <strong>{booking.bookingType}</strong>
                              <span>{booking.category} · {booking.provider}</span>
                            </div>
                          </td>
                          <td>
                            <div className="booking-date-equip">
                              <strong>{booking.city}</strong>
                              <span>{booking.state} · {booking.zone}</span>
                            </div>
                          </td>
                          <td>{booking.time}</td>
                          <td>{booking.duration}</td>
                          <td>
                            <span className={`booking-date-status ${booking.status.toLowerCase()}`}>{booking.status}</span>
                          </td>
                          <td>{formatBookingCurrency(booking.amount)}</td>
                        </tr>
                      ))}
                      {visibleDateBookings.length === 0 && (
                        <tr>
                          <td colSpan={10} className="booking-date-no-match">No bookings match “{bookingDateSearch}”.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Fragment>
            ) : (
              <div className="booking-date-empty">
                No bookings scheduled on {formatDateLabel(bookingDate)}. Choose another date to see its bookings.
              </div>
            )}
          </div>
        </div>

        <div className="stats-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Supply vs Demand</h3>
              <div className="chip-row">
                <span className="chip active">National</span>
                <span className="chip">City</span>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="sd-legend">
                <span className="sd-legend-item"><span className="sd-dot supply" /> Supply · vehicles</span>
                <span className="sd-legend-item"><span className="sd-dot demand" /> Demand · bookings</span>
                <span className="sd-legend-item sd-legend-gap">Net gap <strong>−341</strong></span>
              </div>
              <div className="sd-chart">
                {supplyDemandData.map((d) => {
                  const gap = d.demand - d.supply
                  return (
                    <div className="sd-group" key={d.label} title={`${d.label} · supply ${d.supply}, demand ${d.demand}`}>
                      <div className="sd-bars">
                        <div className="sd-bar supply" style={{ height: `${Math.round((d.supply / supplyDemandMax) * 100)}%` }} />
                        <div className="sd-bar demand" style={{ height: `${Math.round((d.demand / supplyDemandMax) * 100)}%` }} />
                      </div>
                      <span className="sd-label">{d.label}</span>
                      <span className={`sd-gap ${gap > 0 ? 'short' : 'surplus'}`}>{gap > 0 ? `−${gap}` : `+${Math.abs(gap)}`}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>System Health</h3>
              <div className="chip-row">
                <span className="chip active">Live</span>
              </div>
            </div>
            <div className="chart-wrap health-wrap">
              <div className="health-hero">
                <div>
                  <span className="health-hero-value">99.6%</span>
                  <span className="health-hero-label">platform uptime</span>
                </div>
                <span className="health-hero-status"><span className="health-dot healthy" /> 3 of 4 services operational</span>
              </div>
              <div className="health-grid">
                {systemHealth.map((service) => {
                  const healthy = service.status === 'Operational'
                  return (
                    <div key={service.name} className="health-item">
                      <div className="health-item-top">
                        <div className="health-item-name">
                          <span className={`health-dot ${healthy ? 'healthy' : 'degraded'}`} />
                          <div>
                            <div className="health-name">{service.name}</div>
                            <div className="health-meta">{service.latency} latency</div>
                          </div>
                        </div>
                        <div className={`health-status ${healthy ? 'healthy' : 'degraded'}`}>{service.status}</div>
                      </div>
                      <div className="health-uptime">
                        <div className="health-uptime-track">
                          <div className={`health-uptime-fill ${healthy ? 'healthy' : 'degraded'}`} style={{ width: service.uptime }} />
                        </div>
                        <span className="health-meta">{service.uptime} uptime</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Platform Geography</h3>
            <div className="chip-row">
              <span className="chip active">National</span>
              <button type="button" className="chip" style={{ cursor: 'pointer', border: 0, font: 'inherit' }} onClick={() => navigateSidebar('States')}>States</button>
              <span className="chip">Cities</span>
            </div>
          </div>
          <div className="chart-wrap" style={{ paddingTop: 12 }}>
            <table className="state-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Cities</th>
                  <th>Zones</th>
                  <th>Vehicles</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                 {geographyRows.map((row) => (
                   <tr key={row.state}>
                     <td>
                       <button
                         type="button"
                         onClick={() => {
                           setPageSearch({ page: 'States', query: row.state, token: (pageSearch?.token ?? 0) + 1 })
                           setStatesFilterFromSidebar('all')
                           navigateSidebar('States', { keepSearch: true })
                         }}
                         style={{
                           background: 'transparent',
                           border: 0,
                           padding: 0,
                           font: 'inherit',
                           color: 'var(--blue)',
                           fontWeight: 700,
                           cursor: 'pointer',
                           textDecoration: 'underline',
                         }}
                       >
                         {row.state}
                       </button>
                     </td>
                     <td>{row.cities}</td>
                     <td>{row.zones}</td>
                     <td>{row.vehicles}</td>
                     <td>{row.bookings}</td>
                     <td>{row.revenue}</td>
                     <td>{row.commission}</td>
                     <td><span className={`status-pill ${row.status === 'Watch' ? 'watch' : ''}`}>{row.status}</span></td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="operations-grid" id="operations">
          <div className="panel list-panel">
            <div className="panel-header">
              <h3>Recent Operations</h3>
              <div className="chip-row">
                <span className="chip active">Today</span>
              </div>
            </div>
            {recentOps.map((item) => (
              <div key={item.title} className="list-item">
                <div className="list-main">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <span className={`status-tag ${item.status.toLowerCase() === 'pending' ? 'pending' : item.status.toLowerCase() === 'escalated' ? 'escalated' : item.status.toLowerCase() === 'in progress' ? 'in-progress' : ''}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div className="panel list-panel" id="compliance">
            <div className="panel-header">
              <h3>Requires Your Attention</h3>
            </div>
            <button
              type="button"
              className="list-item list-item-link"
              onClick={() => openAttentionQueue('payouts-awaiting-approval')}
            >
              <div className="list-main">
                <strong>{payoutRequests.length} Payouts awaiting approval</strong>
                <span>Finance review queue</span>
              </div>
              <span className="status-tag pending">Action</span>
            </button>
            <button
              type="button"
              className="list-item list-item-link"
              onClick={() => openAttentionQueue('kyc-reviews')}
            >
              <div className="list-main">
                <strong>{kycReviews.length} KYC reviews</strong>
                <span>Partner verification</span>
              </div>
              <span className="status-tag">Review</span>
            </button>
            <button
              type="button"
              className="list-item list-item-link"
              onClick={() => openAttentionQueue('security-alerts')}
            >
              <div className="list-main">
                <strong>{securityAlerts.length} open security alerts</strong>
                <span>MFA / session checks</span>
              </div>
              <span className="status-tag escalated">Critical</span>
            </button>
            <button
              type="button"
              className="list-item list-item-link"
              onClick={() => openAttentionQueue('unassigned-jobs')}
            >
              <div className="list-main">
                <strong>{unassignedJobs.length} unassigned jobs</strong>
                <span>Dispatch queue</span>
              </div>
              <span className="status-tag in-progress">Assign</span>
            </button>
          </div>
        </div>
          </div>
        )}
      </div>
    </section>
  )
}
