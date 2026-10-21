import { useState } from 'react'
import { activeCityRecords, activeOperatorRecords, activeVehicleRecords, activeZoneRecords, commissionBookings, completedRevenueBookings, fleetPartnerRecords, formatKpiDelta, formatKpiValue, kpiMonths, operatorCommissionBySubscription, ownerCommissionRates, platformCommissionByVehicleType, revenueBookings, totalBookingRecords, type BookingCustomerType, type BookingPriority, type CityStatus, type KpiMetric, type OperatorStatus, type PartnerStatus, type SubscriptionPass, type TotalBookingStatus, type VehicleStatus, type ZoneStatus } from './kpiData'

type KpiDetailPageProps = {
  metric: KpiMetric
  onBack: () => void
  onOpenBookingLedger: (filter: any) => void
}

function RecordSelect({ value, onChange, options, label, allLabel }: { value: string; onChange: (value: string) => void; options: string[]; label: string; allLabel: string }) {
  return (
    <label className="record-select">
      <span className="record-select-label">{label}</span>
      <select
        className="record-select-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        <option value="All">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

export default function KpiDetailPage({ metric, onBack, onOpenBookingLedger }: KpiDetailPageProps) {
  const latestValue = metric.data[metric.data.length - 1]
  const previousValue = metric.data[metric.data.length - 2]
  const startingValue = metric.data[0]
  const monthlyDelta = latestValue - previousValue
  const monthlyPercent = previousValue === 0 ? 0 : (monthlyDelta / previousValue) * 100
  const periodDelta = latestValue - startingValue
  const periodPercent = startingValue === 0 ? 0 : (periodDelta / startingValue) * 100
  const averageValue = metric.data.reduce((total, value) => total + value, 0) / metric.data.length
  const maximumValue = Math.max(...metric.data)
  const peakIndex = metric.data.indexOf(maximumValue)
  const risingMonths = metric.data.slice(1).filter((value, index) => value > metric.data[index]).length
  const periods = metric.periods ?? kpiMonths
  const periodNoun = metric.periodNoun ?? 'Month'
  const periodNounLower = periodNoun.toLowerCase()
  const octoberGrossRevenue = completedRevenueBookings.reduce((total: number, booking: any) => total + booking.bookingValue, 0)
  const octoberCommission = completedRevenueBookings.reduce((total: number, booking: any) => total + booking.bookingValue * booking.commissionRate, 0)
  const octoberNetRevenue = octoberGrossRevenue - octoberCommission
  const cancelledBookingCount = revenueBookings.length - completedRevenueBookings.length
  const operatorPassOptions = [...new Set(commissionBookings.map((booking) => booking.operatorPass))].sort()
  const ownerPassOptions = [...new Set(commissionBookings.map((booking) => booking.ownerPass))].sort()
  const vehicleCategoryOptions = [...new Set(commissionBookings.map((booking) => booking.vehicleCategory))].sort()
  const [commissionOperatorPass, setCommissionOperatorPass] = useState('All')
  const [commissionOwnerPass, setCommissionOwnerPass] = useState('All')
  const [commissionVehicleType, setCommissionVehicleType] = useState('All')
  const [commissionSearch, setCommissionSearch] = useState('')
  const passFilteredCommissionBookings = commissionBookings.filter((booking) => {
    const matchesOperatorPass = commissionOperatorPass === 'All' || booking.operatorPass === commissionOperatorPass
    const matchesOwnerPass = commissionOwnerPass === 'All' || booking.ownerPass === commissionOwnerPass
    return matchesOperatorPass && matchesOwnerPass
  })
  const [ownerCommissionRatesState, setOwnerCommissionRatesState] = useState<Record<string, number>>(ownerCommissionRates)
  const [platformCommissionRatesState, setPlatformCommissionRatesState] = useState<Record<string, number>>(platformCommissionByVehicleType)
  const commissionVehicleBreakdown = vehicleCategoryOptions.map((category) => {
    const rows = passFilteredCommissionBookings.filter((booking) => booking.vehicleCategory === category)
    return {
      category,
      rate: ownerCommissionRatesState[category] ?? 0,
      platformRate: platformCommissionRatesState[category] ?? 15,
      bookings: rows.length,
      ownerCommission: rows.reduce((total: number, booking: any) => total + (booking.rentalValue * (ownerCommissionRatesState[category] ?? 0) / 100), 0),
      rentalValue: rows.reduce((total: number, booking: any) => total + booking.rentalValue, 0),
    }
  })
  const commissionSearchTerm = commissionSearch.trim().toLowerCase()
  const filteredCommissionBookings = passFilteredCommissionBookings.filter(
    (booking) => (commissionVehicleType === 'All' || booking.vehicleCategory === commissionVehicleType) &&
      (commissionSearchTerm === '' || booking.id.toLowerCase().includes(commissionSearchTerm)),
  )
  const commissionTotals = filteredCommissionBookings.reduce((totals: any, booking: any) => ({
    rentalValue: totals.rentalValue + booking.rentalValue,
    platformCommission: totals.platformCommission + booking.platformCommission,
    operatorShare: totals.operatorShare + booking.operatorShare,
    ownerShare: totals.ownerShare + booking.ownerShare,
  }), { rentalValue: 0, platformCommission: 0, operatorShare: 0, ownerShare: 0 })
  const pendingSettlementCount = filteredCommissionBookings.filter((booking) => booking.settlement === 'Pending').length
  const totalBookingValue = totalBookingRecords.reduce((total, booking) => total + booking.amount, 0)
  const ongoingBookings = totalBookingRecords.filter((booking) => booking.status === 'Ongoing').length
  const completedBookingRecords = totalBookingRecords.filter((booking) => booking.status === 'Completed').length
  const upcomingBookings = totalBookingRecords.filter((booking) => booking.status === 'Upcoming').length
  const cancelledBookingRecords = totalBookingRecords.filter((booking) => booking.status === 'Cancelled').length
  const bookingStatusClass = (status: TotalBookingStatus) => status.toLowerCase()
  const [bookingRecordFilter, setBookingRecordFilter] = useState<TotalBookingStatus | 'All'>('All')
  const [bookingRecordSearch, setBookingRecordSearch] = useState('')
  const bookingPlans = [...new Set(totalBookingRecords.map((booking) => booking.plan))].sort()
  const [bookingPlanFilter, setBookingPlanFilter] = useState('All')
  const bookingStates = [...new Set(totalBookingRecords.map((booking) => booking.state))].sort()
  const [bookingStateFilter, setBookingStateFilter] = useState('All')
  const bookingCities = [...new Set(totalBookingRecords
    .filter((booking) => bookingStateFilter === 'All' || booking.state === bookingStateFilter)
    .map((booking) => booking.city))].sort()
  const [bookingCityFilter, setBookingCityFilter] = useState('All')
  const bookingZones = [...new Set(totalBookingRecords
    .filter((booking) => bookingStateFilter === 'All' || booking.state === bookingStateFilter)
    .filter((booking) => bookingCityFilter === 'All' || booking.city === bookingCityFilter)
    .map((booking) => booking.zone))].sort()
  const [bookingZoneFilter, setBookingZoneFilter] = useState('All')
  const bookingPriorities: BookingPriority[] = ['Normal', 'Priority']
  const [bookingPriorityFilter, setBookingPriorityFilter] = useState<BookingPriority | 'All'>('All')
  const selectBookingPriority = (value: string) => setBookingPriorityFilter(value as BookingPriority | 'All')
  const bookingCustomerTypes: BookingCustomerType[] = ['Company / Project', 'Individual / Personal']
  const [bookingCustomerTypeFilter, setBookingCustomerTypeFilter] = useState<BookingCustomerType | 'All'>('All')
  const selectBookingCustomerType = (value: string) => setBookingCustomerTypeFilter(value as BookingCustomerType | 'All')
  const companyBookings = totalBookingRecords.filter((booking) => booking.customerType === 'Company / Project').length
  const individualBookings = totalBookingRecords.filter((booking) => booking.customerType === 'Individual / Personal').length
  const selectBookingState = (value: string) => {
    setBookingStateFilter(value)
    setBookingCityFilter('All')
    setBookingZoneFilter('All')
  }
  const selectBookingCity = (value: string) => {
    setBookingCityFilter(value)
    setBookingZoneFilter('All')
  }
  const filteredBookingRecords = totalBookingRecords.filter((booking) => {
    const bookingSearchTerm = bookingRecordSearch.trim().toLowerCase()
    const matchesSearch = bookingSearchTerm === '' ||
      booking.id.toLowerCase().includes(bookingSearchTerm) ||
      booking.customerId.toLowerCase().includes(bookingSearchTerm) ||
      booking.ownerId.toLowerCase().includes(bookingSearchTerm) ||
      booking.operatorId.toLowerCase().includes(bookingSearchTerm)
    const matchesStatus = bookingRecordFilter === 'All' || booking.status === bookingRecordFilter
    const matchesPlan = bookingPlanFilter === 'All' || booking.plan === bookingPlanFilter
    const matchesState = bookingStateFilter === 'All' || booking.state === bookingStateFilter
    const matchesCity = bookingCityFilter === 'All' || booking.city === bookingCityFilter
    const matchesZone = bookingZoneFilter === 'All' || booking.zone === bookingZoneFilter
    const matchesPriority = bookingPriorityFilter === 'All' || booking.priority === bookingPriorityFilter
    const matchesCustomerType = bookingCustomerTypeFilter === 'All' || booking.customerType === bookingCustomerTypeFilter
    return matchesSearch && matchesStatus && matchesPlan && matchesState && matchesCity && matchesZone && matchesPriority && matchesCustomerType
  })
  const [vehicleFilter, setVehicleFilter] = useState<VehicleStatus | 'All'>('All')
  const vehicleCategories = [...new Set(activeVehicleRecords.map((vehicle) => vehicle.category))].sort()
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState('All')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const filteredVehicles = activeVehicleRecords.filter((vehicle) => {
    const searchTerm = vehicleSearch.trim().toLowerCase()
    const matchesSearch = searchTerm === '' ||
      vehicle.id.toLowerCase().includes(searchTerm) ||
      vehicle.equipment.toLowerCase().includes(searchTerm) ||
      vehicle.ownerId.toLowerCase().includes(searchTerm) ||
      vehicle.ownerName.toLowerCase().includes(searchTerm) ||
      vehicle.operatorId.toLowerCase().includes(searchTerm) ||
      vehicle.operatorName.toLowerCase().includes(searchTerm)
    const matchesStatus = vehicleFilter === 'All' || vehicle.status === vehicleFilter
    const matchesCategory = vehicleCategoryFilter === 'All' || vehicle.category === vehicleCategoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })
  const availableVehicles = activeVehicleRecords.filter((vehicle) => vehicle.status === 'Available').length
  const onHireVehicles = activeVehicleRecords.filter((vehicle) => vehicle.status === 'On Hire').length
  const maintenanceVehicles = activeVehicleRecords.filter((vehicle) => vehicle.status === 'Maintenance').length
  const idleVehicles = activeVehicleRecords.filter((vehicle) => vehicle.status === 'Idle').length
  const averageUtilization = Math.round(activeVehicleRecords.reduce((total, vehicle) => total + vehicle.utilization, 0) / activeVehicleRecords.length)
  const fleetDailyRate = activeVehicleRecords.reduce((total, vehicle) => total + vehicle.dailyRate, 0)
  const vehicleStatusClass = (status: VehicleStatus) => (status === 'On Hire' ? 'on-hire' : status.toLowerCase())
  const [operatorFilter, setOperatorFilter] = useState<OperatorStatus | 'All'>('All')
  const operatorSkills = [...new Set(activeOperatorRecords.map((operator) => operator.skill))].sort()
  const [operatorSkillFilter, setOperatorSkillFilter] = useState('All')
  const [operatorSearch, setOperatorSearch] = useState('')
  const filteredOperators = activeOperatorRecords.filter((operator) => {
    const searchTerm = operatorSearch.trim().toLowerCase()
    const matchesSearch = searchTerm === '' ||
      operator.id.toLowerCase().includes(searchTerm) ||
      operator.name.toLowerCase().includes(searchTerm) ||
      operator.skill.toLowerCase().includes(searchTerm) ||
      operator.ownerId.toLowerCase().includes(searchTerm) ||
      operator.ownerName.toLowerCase().includes(searchTerm)
    const matchesStatus = operatorFilter === 'All' || operator.status === operatorFilter
    const matchesSkill = operatorSkillFilter === 'All' || operator.skill === operatorSkillFilter
    return matchesSearch && matchesStatus && matchesSkill
  })
  const availableOperators = activeOperatorRecords.filter((operator) => operator.status === 'Available').length
  const onJobOperators = activeOperatorRecords.filter((operator) => operator.status === 'On Job').length
  const offDutyOperators = activeOperatorRecords.filter((operator) => operator.status === 'Off Duty').length
  const onLeaveOperators = activeOperatorRecords.filter((operator) => operator.status === 'On Leave').length
  const averageOperatorRating = (activeOperatorRecords.reduce((total, operator) => total + operator.rating, 0) / activeOperatorRecords.length).toFixed(1)
  const totalOperatorJobs = activeOperatorRecords.reduce((total, operator) => total + operator.completedJobs, 0)
  const operatorStatusClass = (status: OperatorStatus) => status.toLowerCase().replace(' ', '-')
  const [partnerFilter, setPartnerFilter] = useState<PartnerStatus | 'All'>('All')
  const partnerStates = [...new Set(fleetPartnerRecords.map((partner) => partner.state))].sort()
  const [partnerStateFilter, setPartnerStateFilter] = useState('All')
  const [partnerSearch, setPartnerSearch] = useState('')
  const filteredPartners = fleetPartnerRecords.filter((partner) => {
    const searchTerm = partnerSearch.trim().toLowerCase()
    const matchesSearch = searchTerm === '' ||
      partner.id.toLowerCase().includes(searchTerm) ||
      partner.name.toLowerCase().includes(searchTerm) ||
      partner.contactName.toLowerCase().includes(searchTerm)
    const matchesStatus = partnerFilter === 'All' || partner.status === partnerFilter
    const matchesState = partnerStateFilter === 'All' || partner.state === partnerStateFilter
    return matchesSearch && matchesStatus && matchesState
  })
  const activePartners = fleetPartnerRecords.filter((partner) => partner.status === 'Active').length
  const pendingPartners = fleetPartnerRecords.filter((partner) => partner.status === 'Pending').length
  const suspendedPartners = fleetPartnerRecords.filter((partner) => partner.status === 'Suspended').length
  const dormantPartners = fleetPartnerRecords.filter((partner) => partner.status === 'Dormant').length
  const totalPartnerFleet = fleetPartnerRecords.reduce((total, partner) => total + partner.fleetSize, 0)
  const totalPartnerActiveVehicles = fleetPartnerRecords.reduce((total, partner) => total + partner.activeVehicles, 0)
  const averagePartnerRating = (fleetPartnerRecords.reduce((total, partner) => total + partner.rating, 0) / fleetPartnerRecords.length).toFixed(1)
  const [cityFilter, setCityFilter] = useState<CityStatus | 'All'>('All')
  const cityStates = [...new Set(activeCityRecords.map((city) => city.state))].sort()
  const [cityStateFilter, setCityStateFilter] = useState('All')
  const [citySearch, setCitySearch] = useState('')
  const filteredCities = activeCityRecords.filter((city) => {
    const searchTerm = citySearch.trim().toLowerCase()
    const matchesSearch = searchTerm === '' ||
      city.id.toLowerCase().includes(searchTerm) ||
      city.name.toLowerCase().includes(searchTerm)
    const matchesStatus = cityFilter === 'All' || city.status === cityFilter
    const matchesState = cityStateFilter === 'All' || city.state === cityStateFilter
    return matchesSearch && matchesStatus && matchesState
  })
  const liveCities = activeCityRecords.filter((city) => city.status === 'Active').length
  const launchingCities = activeCityRecords.filter((city) => city.status === 'Launching').length
  const pausedCities = activeCityRecords.filter((city) => city.status === 'Paused').length
  const plannedCities = activeCityRecords.filter((city) => city.status === 'Planned').length
  const totalCityZones = activeCityRecords.reduce((total, city) => total + city.zones, 0)
  const totalCityVehicles = activeCityRecords.reduce((total, city) => total + city.activeVehicles, 0)
  const totalCityBookings = activeCityRecords.reduce((total, city) => total + city.monthlyBookings, 0)
  const [zoneFilter, setZoneFilter] = useState<ZoneStatus | 'All'>('All')
  const zoneCities = [...new Set(activeZoneRecords.map((zone) => zone.city))].sort()
  const [zoneCityFilter, setZoneCityFilter] = useState('All')
  const [zoneSearch, setZoneSearch] = useState('')
  const filteredZones = activeZoneRecords.filter((zone) => {
    const searchTerm = zoneSearch.trim().toLowerCase()
    const matchesSearch = searchTerm === '' ||
      zone.id.toLowerCase().includes(searchTerm) ||
      zone.name.toLowerCase().includes(searchTerm) ||
      zone.manager.toLowerCase().includes(searchTerm)
    const matchesStatus = zoneFilter === 'All' || zone.status === zoneFilter
    const matchesCity = zoneCityFilter === 'All' || zone.city === zoneCityFilter
    return matchesSearch && matchesStatus && matchesCity
  })
  const liveZones = activeZoneRecords.filter((zone) => zone.status === 'Active').length
  const launchingZones = activeZoneRecords.filter((zone) => zone.status === 'Launching').length
  const pausedZones = activeZoneRecords.filter((zone) => zone.status === 'Paused').length
  const plannedZones = activeZoneRecords.filter((zone) => zone.status === 'Planned').length
  const totalZoneVehicles = activeZoneRecords.reduce((total, zone) => total + zone.activeVehicles, 0)
  const totalZoneOperators = activeZoneRecords.reduce((total, zone) => total + zone.activeOperators, 0)
  const totalZoneBookings = activeZoneRecords.reduce((total, zone) => total + zone.monthlyBookings, 0)
  return (
    <div className="kpi-detail-page">
      <style>{`
        .kpi-detail-page {
          display: grid;
          gap: 18px;
          min-width: 0;
        }

        .kpi-detail-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          margin: 0 0 8px;
          border: 0;
          background: transparent;
          color: #ef4a12;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .kpi-detail-back:focus-visible {
          outline: 3px solid rgba(255,107,44,0.45);
          outline-offset: 4px;
        }

        .kpi-detail-period-change {
          display: grid;
          align-content: center;
          gap: 6px;
          min-width: 150px;
          padding: 12px 16px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 14px;
          background: #fff;
        }

        .kpi-detail-period-change span,
        .kpi-detail-summary-card span {
          color: #8a96a6;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .kpi-detail-period-change strong {
          color: #08a66c;
          font-size: 1.25rem;
        }

        .kpi-detail-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .revenue-booking-summary {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          padding: 0 18px 18px;
        }

        .kpi-detail-summary-card {
          display: grid;
          gap: 7px;
          padding: 18px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(15,23,42,0.05);
        }

        button.kpi-detail-summary-card {
          width: 100%;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        button.kpi-detail-summary-card:hover {
          border-color: rgba(255,107,44,0.45);
          transform: translateY(-2px);
        }

        button.kpi-detail-summary-card:focus-visible {
          outline: 3px solid rgba(255,107,44,0.45);
          outline-offset: 3px;
        }

        button.kpi-detail-summary-card.selected {
          border-color: rgba(255,107,44,0.6);
          background: rgba(255,107,44,0.07);
          box-shadow: inset 0 0 0 1px rgba(255,107,44,0.14);
        }

        .kpi-detail-summary-card strong {
          color: #182230;
          font-size: 1.35rem;
        }

        .kpi-detail-summary-card small {
          color: #8a96a6;
        }

        .kpi-detail-insight {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 20px;
          border: 1px solid rgba(255,107,44,0.2);
          border-radius: 14px;
          background: linear-gradient(110deg, rgba(255,107,44,0.09), #fff 62%);
        }

        .kpi-detail-insight h3 {
          margin: 0 0 5px;
          color: #182230;
          font-size: 0.98rem;
        }

        .kpi-detail-insight p {
          margin: 0;
          color: #64748b;
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .kpi-detail-insight strong {
          flex: 0 0 auto;
          color: #ef4a12;
          font-size: 1.1rem;
          text-align: right;
        }

        .kpi-detail-chart {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          align-items: end;
          gap: 18px;
          min-height: 230px;
          padding: 18px 8px 0;
        }

        .kpi-detail-point {
          display: grid;
          grid-template-rows: 1fr auto auto;
          justify-items: center;
          gap: 8px;
          min-width: 0;
        }

        .kpi-detail-bar-track {
          width: 100%;
          height: 156px;
          display: flex;
          align-items: flex-end;
          border-bottom: 1px solid rgba(15,23,42,0.1);
        }

        .kpi-detail-bar {
          width: 100%;
          min-height: 10px;
          border-radius: 8px 8px 2px 2px;
          background: linear-gradient(180deg, rgba(255,107,44,0.95), rgba(239,74,18,0.42));
        }

        .kpi-detail-bar.blue { background: linear-gradient(180deg, rgba(37,99,235,0.9), rgba(37,99,235,0.35)); }
        .kpi-detail-bar.purple { background: linear-gradient(180deg, rgba(124,58,237,0.9), rgba(124,58,237,0.35)); }
        .kpi-detail-bar.orange { background: linear-gradient(180deg, rgba(245,158,11,0.9), rgba(245,158,11,0.35)); }

        .kpi-detail-value {
          color: #182230;
          font-size: 0.78rem;
          font-weight: 800;
          text-align: center;
        }

        .kpi-detail-month {
          color: #8a96a6;
          font-size: 0.74rem;
          font-weight: 700;
        }

        .kpi-detail-table-wrap {
          overflow-x: auto;
        }

        .kpi-detail-table {
          min-width: 500px;
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .kpi-detail-table th,
        .kpi-detail-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(15,23,42,0.07);
          vertical-align: middle;
          white-space: nowrap;
        }

        .kpi-detail-table th {
          color: #64748b;
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .kpi-detail-table tfoot td {
          border-top: 2px solid rgba(15,23,42,0.1);
          border-bottom: 0;
          background: #f8fafb;
        }

        .commission-flow-panel {
          display: grid;
          gap: 18px;
          padding-bottom: 18px;
        }

        .commission-flow-main {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 16px;
          padding: 0 18px;
        }

        .commission-flow-node,
        .commission-flow-allocation {
          display: grid;
          gap: 7px;
          padding: 18px;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          background: #fff;
        }

        .commission-flow-node span,
        .commission-flow-allocation span,
        .commission-flow-allocation small {
          color: #64748b;
          font-size: 0.76rem;
        }

        .commission-flow-node strong,
        .commission-flow-allocation strong {
          color: #182230;
          font-size: 1.25rem;
        }

        .commission-flow-node small {
          color: #8a96a6;
        }

        .commission-flow-customer {
          border-top: 3px solid #2563eb;
        }

        .commission-flow-booking {
          border-top: 3px solid #ff6b2c;
        }

        .commission-flow-arrow {
          color: #ef4a12;
          font-size: 0.8rem;
          font-weight: 800;
          text-align: center;
        }

        .commission-flow-branch-label {
          color: #64748b;
          font-size: 0.76rem;
          font-weight: 800;
          text-align: center;
          text-transform: uppercase;
        }

        .commission-flow-allocations {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          padding: 0 18px;
        }

        .commission-flow-allocation.platform {
          border-top: 3px solid #ff6b2c;
        }

        .commission-flow-allocation.operator {
          border-top: 3px solid #2563eb;
        }

        .commission-flow-allocation.owner {
          border-top: 3px solid #08a66c;
        }

        .commission-flow-reconciliation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 0 18px;
          padding: 15px 18px;
          border: 1px solid rgba(8,166,108,0.18);
          border-radius: 12px;
          background: rgba(8,166,108,0.07);
        }

        .commission-flow-reconciliation div {
          display: grid;
          gap: 4px;
        }

        .commission-flow-reconciliation span {
          color: #64748b;
          font-size: 0.74rem;
        }

        .commission-flow-reconciliation strong {
          color: #087e53;
          font-size: 0.9rem;
        }

        .commission-flow-admin {
          justify-self: center;
          padding: 8px 14px;
          border-radius: 999px;
          background: #101827;
          color: #fff;
          font-size: 0.76rem;
          font-weight: 800;
        }

        .commission-settlement-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(8,166,108,0.1);
          color: #078653;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .commission-settlement-status.pending {
          background: rgba(245,158,11,0.14);
          color: #a16207;
        }

        .booking-record-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(8,166,108,0.1);
          color: #078653;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .booking-priority {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(100,116,139,0.12);
          color: #475569;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .booking-priority-priority {
          background: rgba(255,107,44,0.14);
          color: #c94310;
        }

        .booking-customer-type {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
          font-size: 0.7rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .booking-customer-type.individual {
          background: rgba(255,107,44,0.13);
          color: #c94310;
        }

        .booking-record-status.ongoing {
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
        }

        .booking-record-status.upcoming {
          background: rgba(245,158,11,0.14);
          color: #a16207;
        }

        .booking-record-status.cancelled {
          background: rgba(239,68,68,0.1);
          color: #dc2626;
        }

        .vehicle-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(100,116,139,0.12);
          color: #475569;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .vehicle-status.available {
          background: rgba(8,166,108,0.1);
          color: #078653;
        }

        .vehicle-status.on-hire {
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
        }

        .vehicle-status.maintenance {
          background: rgba(245,158,11,0.14);
          color: #a16207;
        }

        .operator-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(100,116,139,0.12);
          color: #475569;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .operator-status.available {
          background: rgba(8,166,108,0.1);
          color: #078653;
        }

        .operator-status.on-job {
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
        }

        .operator-status.on-leave {
          background: rgba(245,158,11,0.14);
          color: #a16207;
        }

        .kpi-detail-table td.operator-record-details {
          min-width: 240px;
          white-space: normal;
        }

        .partner-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(100,116,139,0.12);
          color: #475569;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .partner-status.active {
          background: rgba(8,166,108,0.1);
          color: #078653;
        }

        .partner-status.pending {
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
        }

        .partner-status.suspended {
          background: rgba(239,68,68,0.1);
          color: #dc2626;
        }

        .kpi-detail-table td.partner-record-details {
          min-width: 240px;
          white-space: normal;
        }

        .city-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(100,116,139,0.12);
          color: #475569;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .city-status.active {
          background: rgba(8,166,108,0.1);
          color: #078653;
        }

        .city-status.launching {
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
        }

        .city-status.paused {
          background: rgba(245,158,11,0.14);
          color: #a16207;
        }

        .kpi-detail-table td.city-record-details {
          min-width: 240px;
          white-space: normal;
        }

        .zone-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(100,116,139,0.12);
          color: #475569;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .zone-status.active {
          background: rgba(8,166,108,0.1);
          color: #078653;
        }

        .zone-status.launching {
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
        }

        .zone-status.paused {
          background: rgba(245,158,11,0.14);
          color: #a16207;
        }

        .kpi-detail-table td.zone-record-details {
          min-width: 240px;
          white-space: normal;
        }

        .panel-header-tools {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .record-select {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .record-select-label {
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .record-select-input {
          min-width: 160px;
          padding: 9px 12px;
          border: 1px solid rgba(15,23,42,0.14);
          border-radius: 10px;
          background: #fff;
          color: inherit;
          font: inherit;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .record-select-input:focus-visible {
          outline: 3px solid rgba(255,107,44,0.4);
          outline-offset: 2px;
        }

        .record-search-input {
          cursor: text;
        }

        .vehicle-utilization {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vehicle-utilization-track {
          width: 54px;
          height: 6px;
          border-radius: 999px;
          background: rgba(15,23,42,0.1);
          overflow: hidden;
        }

        .vehicle-utilization-fill {
          height: 100%;
          border-radius: 999px;
          background: #08a66c;
        }

        .kpi-detail-table td.vehicle-record-details {
          min-width: 240px;
          white-space: normal;
        }

        .kpi-detail-table td.booking-record-details {
          min-width: 260px;
          white-space: normal;
        }

        .booking-record-entity {
          display: grid;
          gap: 2px;
        }

        .booking-record-entity small {
          color: #8a96a6;
        }

        .kpi-detail-table tr.commission-type-row {
          cursor: pointer;
        }

        .kpi-detail-table tr.commission-type-row.selected {
          background: rgba(255, 107, 44, 0.08);
        }

        .kpi-detail-table tr.commission-type-row.selected td:first-child {
          box-shadow: inset 3px 0 0 #ff6b2c;
        }

        .kpi-detail-source {
          margin: 0;
          padding: 0 18px 18px;
          color: #64748b;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .revenue-panel {
          padding: 18px;
        }

        .revenue-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .kpi-detail-summary-card.metric-card {
          gap: 9px;
          border-left: 4px solid rgba(15,23,42,0.12);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .kpi-detail-summary-card.metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 36px -20px rgba(15,23,42,0.4);
        }

        .kpi-detail-summary-card.metric-card strong {
          font-size: 1.5rem;
          letter-spacing: -0.04em;
        }

        .metric-card-top {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .metric-card-icon {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 9px;
          font-size: 0.92rem;
          font-weight: 800;
          background: rgba(100,116,139,0.12);
          color: #475569;
          flex: 0 0 auto;
        }

        .metric-card.accent-slate { border-left-color: #64748b; }
        .metric-card.accent-slate .metric-card-icon { background: rgba(100,116,139,0.15); color: #334155; }

        .metric-card.accent-green { border-left-color: #08a66c; }
        .metric-card.accent-green strong { color: #078653; }
        .metric-card.accent-green .metric-card-icon { background: rgba(8,166,108,0.15); color: #078653; }

        .metric-card.accent-red { border-left-color: #ef4444; }
        .metric-card.accent-red strong { color: #dc2626; }
        .metric-card.accent-red .metric-card-icon { background: rgba(239,68,68,0.15); color: #dc2626; }

        .metric-card.accent-orange { border-left-color: #ff6b2c; }
        .metric-card.accent-orange strong { color: #c94310; }
        .metric-card.accent-orange .metric-card-icon { background: rgba(255,107,44,0.16); color: #c94310; }

        .metric-card.accent-blue { border-left-color: #2563eb; }
        .metric-card.accent-blue strong { color: #1d4ed8; }
        .metric-card.accent-blue .metric-card-icon { background: rgba(37,99,235,0.15); color: #1d4ed8; }

        .metric-card.accent-purple { border-left-color: #7c3aed; }
        .metric-card.accent-purple strong { color: #6d28d9; }
        .metric-card.accent-purple .metric-card-icon { background: rgba(124,58,237,0.15); color: #6d28d9; }
      `}</style>

      <header className="dashboard-header">
        <div className="header-copy">
          <button type="button" className="kpi-detail-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Dashboard overview
          </button>
          <p className="header-kicker">National overview / KPI detail</p>
          <h1 className="header-title">{metric.label}</h1>
          <div className="header-breadcrumb">{periods[0].full} to {periods[periods.length - 1].full} · {periods.length} {periodNounLower}ly samples</div>
        </div>
        <div className="kpi-detail-period-change">
          <span>Change since {periods[0].short}</span>
          <strong>{periodPercent >= 0 ? '+' : ''}{periodPercent.toFixed(1)}%</strong>
        </div>
      </header>

      <p className="health-meta">{metric.description}</p>

      <section className="kpi-detail-summary" aria-label="KPI summary">
        <article className="kpi-detail-summary-card">
          <span>Latest period · {periods[periods.length - 1].short}</span>
          <strong>{formatKpiValue(metric, latestValue)}</strong>
          <small>Current sample value</small>
        </article>
        <article className="kpi-detail-summary-card">
          <span>Change vs {periods[periods.length - 2].short}</span>
          <strong>{formatKpiDelta(metric, monthlyDelta)}</strong>
          <small>{monthlyPercent >= 0 ? '+' : ''}{monthlyPercent.toFixed(1)}% {periodNounLower} over {periodNounLower}</small>
        </article>
        <article className="kpi-detail-summary-card">
          <span>Change since {periods[0].short}</span>
          <strong>{formatKpiDelta(metric, periodDelta)}</strong>
          <small>{periodPercent >= 0 ? '+' : ''}{periodPercent.toFixed(1)}% across the sample</small>
        </article>
        <article className="kpi-detail-summary-card">
          <span>Period average</span>
          <strong>{formatKpiValue(metric, averageValue)}</strong>
          <small>Average of {periods.length} {periodNounLower}ly samples</small>
        </article>
      </section>

      <section className="kpi-detail-insight" aria-label="Trend insight">
        <div>
          <h3>Trend readout</h3>
          <p>
            {risingMonths === metric.data.length - 1
              ? `The KPI rose in all ${risingMonths} ${periodNounLower}-to-${periodNounLower} comparisons.`
              : `The KPI rose in ${risingMonths} of ${metric.data.length - 1} ${periodNounLower}-to-${periodNounLower} comparisons.`}
            {' '}Its highest sample was recorded in {periods[peakIndex].full}.
          </p>
        </div>
        <strong>{formatKpiValue(metric, maximumValue)} peak</strong>
      </section>

      {metric.label === 'Platform Commission' && (
        <>
          <section className="panel commission-flow-panel" aria-labelledby="commission-flow-title">
            <div className="panel-header">
              <div>
                <h3 id="commission-flow-title">Commission and settlement flow</h3>
                <span className="health-meta">How customer rental payments are allocated and reconciled · illustrative sample</span>
              </div>
              <span className="chip active">{filteredCommissionBookings.length} bookings</span>
            </div>

            <div className="commission-flow-main">
              <div className="commission-flow-node commission-flow-customer">
                <span>Payment source</span>
                <strong>Customers</strong>
                <small>{filteredCommissionBookings.length} payments · ₹{commissionTotals.rentalValue.toLocaleString('en-IN')}</small>
              </div>
              <div className="commission-flow-arrow" aria-hidden="true">Payment →</div>
              <div className="commission-flow-node commission-flow-booking">
                <span>Booking rental value</span>
                <strong>₹{commissionTotals.rentalValue.toLocaleString('en-IN')}</strong>
                <small>Rental value to allocate</small>
              </div>
            </div>

            <div className="commission-flow-branch-label">Rental value is split between</div>
            <div className="commission-flow-allocations">
              <article className="commission-flow-allocation platform">
                <span>Platform commission</span>
                <strong>₹{commissionTotals.platformCommission.toLocaleString('en-IN')}</strong>
                <small>Platform earnings</small>
              </article>
              <article className="commission-flow-allocation operator">
                <span>Operator share</span>
                <strong>₹{commissionTotals.operatorShare.toLocaleString('en-IN')}</strong>
                <small>Operator settlement</small>
              </article>
              <article className="commission-flow-allocation owner">
                <span>Owner share</span>
                <strong>₹{commissionTotals.ownerShare.toLocaleString('en-IN')}</strong>
                <small>Owner settlement</small>
              </article>
            </div>

            <div className="commission-flow-reconciliation">
              <div>
                <span>Reconciliation</span>
                <strong>₹{(commissionTotals.platformCommission + commissionTotals.operatorShare + commissionTotals.ownerShare).toLocaleString('en-IN')} allocated = ₹{commissionTotals.rentalValue.toLocaleString('en-IN')} rental value</strong>
              </div>
              <span>{filteredCommissionBookings.length - pendingSettlementCount} settled · {pendingSettlementCount} pending</span>
            </div>
            <div className="commission-flow-admin">Reconciled and reviewed by Super Admin</div>
          </section>

          <section className="panel" aria-labelledby="owner-commission-vehicle-type-title">
            <div className="panel-header">
              <div>
                <h3 id="owner-commission-vehicle-type-title">Owner commission by vehicle type</h3>
                <span className="health-meta">Select a vehicle type to view its owner commission rate and filter the bookings below.</span>
              </div>
              <div className="panel-header-tools">
                <RecordSelect value={commissionVehicleType} onChange={setCommissionVehicleType} options={vehicleCategoryOptions} label="Vehicle type" allLabel="All vehicle types" />
                <span className="chip active">Dummy data</span>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="kpi-detail-table">
                <thead>
                  <tr>
                    <th>Vehicle type</th>
                    <th>Commission rates</th><th>Platform commission rate</th>
                    <th>Bookings</th>
                    <th>Owner commission</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionVehicleBreakdown.map((row) => (
                    <tr
                      key={row.category}
                      className={`commission-type-row ${commissionVehicleType === row.category ? 'selected' : ''}`}
                      onClick={() => setCommissionVehicleType(commissionVehicleType === row.category ? 'All' : row.category)}
                    >
                      <td><strong>{row.category}</strong></td>
                      <td>
                        <input
                          type="number"
                          value={row.rate}
                          min={0}
                          max={100}
                          step={0.1}
                          className="record-select-input"
                          style={{ width: '60px', display: 'inline-block', marginRight: '4px' }}
                          onChange={(e) => setOwnerCommissionRatesState(prev => ({ ...prev, [row.category]: parseFloat(e.target.value) || 0 }))}
                        />% (Owner)
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.platformRate}
                          min={0}
                          max={100}
                          step={0.1}
                          className="record-select-input"
                          style={{ width: '60px', display: 'inline-block', marginRight: '4px' }}
                          onChange={(e) => setPlatformCommissionRatesState(prev => ({ ...prev, [row.category]: parseFloat(e.target.value) || 0 }))}
                        />% (Platform)
                      </td>
                      <td>{row.bookings}</td>
                      <td>₹{row.ownerCommission.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>All vehicle types</strong></td>
                    <td>—</td><td>—</td>
                    <td><strong>{passFilteredCommissionBookings.length}</strong></td>
                    <td><strong>₹{commissionVehicleBreakdown.reduce((total, row) => total + row.ownerCommission, 0).toLocaleString('en-IN')}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="kpi-detail-source">Owner commission is the owner's share of rental value and is set per vehicle type. Click a row or use the selector to filter the commission by booking table.</p>
          </section>

          <section className="panel" aria-labelledby="commission-settlement-table-title">
            <div className="panel-header">
              <div>
                <h3 id="commission-settlement-table-title">Commission by booking</h3>
                <span className="health-meta">Showing {filteredCommissionBookings.length} of {commissionBookings.length} records · filter operators and owners by subscription pass. Rental value equals platform commission + operator share + owner share.</span>
              </div>
              <div className="panel-header-tools">
                <RecordSelect value={commissionOperatorPass} onChange={setCommissionOperatorPass} options={operatorPassOptions} label="Operator pass" allLabel="All passes" />
                <RecordSelect value={commissionOwnerPass} onChange={setCommissionOwnerPass} options={ownerPassOptions} label="Owner pass" allLabel="All passes" />
                <input
                  type="text"
                  className="record-select-input record-search-input"
                  value={commissionSearch}
                  onChange={(event) => setCommissionSearch(event.target.value)}
                  placeholder="Search booking ID"
                  aria-label="Search commission bookings by ID"
                />
                <span className="chip active">Dummy data</span>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="kpi-detail-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Owner</th>
                    <th>Operator</th>
                    <th>Vehicle</th>
                    <th>Category</th>
                    <th>Rental value</th>
                    <th>Platform commission</th>
                    <th>Operator share</th>
                    <th>Owner share</th>
                    <th>Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissionBookings.length === 0 && (
                    <tr>
                      <td colSpan={11}>No commission records match the current filters.</td>
                    </tr>
                  )}
                  {filteredCommissionBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td><strong>{booking.id}</strong></td>
                      <td>{booking.customer}</td>
                      <td>
                        <span className="booking-record-entity">
                          {booking.owner}
<small>{booking.ownerPass} pass · {booking.ownerCommissionRate}% owner rate · {booking.operatorPass} pass ({operatorCommissionBySubscription[booking.operatorPass as SubscriptionPass]}% op.)</small>
                        </span>
                      </td>
                      <td>
                        <span className="booking-record-entity">
                          {booking.operator}
                          <small>{booking.operatorPass} pass</small>
                        </span>
                      </td>
                      <td>{booking.vehicle}</td>
                      <td>{booking.vehicleCategory}</td>
                      <td>₹{booking.rentalValue.toLocaleString('en-IN')}</td>
                      <td>₹{booking.platformCommission.toLocaleString('en-IN')}</td>
                      <td>₹{booking.operatorShare.toLocaleString('en-IN')}</td>
                      <td>₹{booking.ownerShare.toLocaleString('en-IN')}</td>
                      <td><span className={`commission-settlement-status ${booking.settlement === 'Pending' ? 'pending' : ''}`}>{booking.settlement}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6}><strong>Total</strong></td>
                    <td><strong>₹{commissionTotals.rentalValue.toLocaleString('en-IN')}</strong></td>
                    <td><strong>₹{commissionTotals.platformCommission.toLocaleString('en-IN')}</strong></td>
                    <td><strong>₹{commissionTotals.operatorShare.toLocaleString('en-IN')}</strong></td>
                    <td><strong>₹{commissionTotals.ownerShare.toLocaleString('en-IN')}</strong></td>
                    <td><strong>{filteredCommissionBookings.length - pendingSettlementCount}/{filteredCommissionBookings.length} settled</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="kpi-detail-source">Illustrative booking-level settlement data for interface preview; these amounts are separate from the monthly Platform Commission KPI samples.</p>
          </section>
        </>
      )}

      {metric.label === 'Total Revenue' && (
        <section className="panel revenue-panel" aria-label="October booking sample">
          <section className="revenue-summary" aria-label="October booking KPIs">
            <button
              type="button"
              className="kpi-detail-summary-card metric-card accent-slate"
              aria-label={`View all ${revenueBookings.length} booking records in the ledger`}
              onClick={() => onOpenBookingLedger('All')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▤</span><span>All booking records</span></span>
              <strong>{revenueBookings.length}</strong>
              <small>View all records</small>
            </button>
            <button
              type="button"
              className="kpi-detail-summary-card metric-card accent-green"
              aria-label={`View ${completedRevenueBookings.length} completed bookings in the ledger`}
              onClick={() => onOpenBookingLedger('Completed')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✓</span><span>Completed</span></span>
              <strong>{completedRevenueBookings.length}</strong>
              <small>Included in revenue totals</small>
            </button>
            <button
              type="button"
              className="kpi-detail-summary-card metric-card accent-red"
              aria-label={`View ${cancelledBookingCount} cancelled bookings in the ledger`}
              onClick={() => onOpenBookingLedger('Cancelled')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✕</span><span>Cancelled</span></span>
              <strong>{cancelledBookingCount}</strong>
              <small>Excluded from revenue totals</small>
            </button>
            <article className="kpi-detail-summary-card metric-card accent-orange">
              <span className="metric-card-top"><span className="metric-card-icon">₹</span><span>Gross revenue</span></span>
              <strong>₹{octoberGrossRevenue.toLocaleString('en-IN')}</strong>
              <small>Completed bookings only</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-purple">
              <span className="metric-card-top"><span className="metric-card-icon">%</span><span>Commission</span></span>
              <strong>₹{octoberCommission.toLocaleString('en-IN')}</strong>
              <small>15% of booking value</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-blue">
              <span className="metric-card-top"><span className="metric-card-icon">◈</span><span>Net revenue</span></span>
              <strong>₹{octoberNetRevenue.toLocaleString('en-IN')}</strong>
              <small>Gross less commission</small>
            </article>
          </section>
        </section>
      )}

      {metric.label === 'Total Bookings' && (
        <section className="panel" aria-labelledby="total-bookings-title">
          <div className="panel-header">
            <div>
              <h3 id="total-bookings-title">Booking records sample</h3>
              <span className="health-meta">Showing {filteredBookingRecords.length} of {totalBookingRecords.length} records · filter by status, priority, customer type, plan, state, city or zone</span>
            </div>
            <div className="panel-header-tools">
              <RecordSelect value={bookingStateFilter} onChange={selectBookingState} options={bookingStates} label="State" allLabel="All states" />
              <RecordSelect value={bookingCityFilter} onChange={selectBookingCity} options={bookingCities} label="City" allLabel="All cities" />
              <RecordSelect value={bookingZoneFilter} onChange={setBookingZoneFilter} options={bookingZones} label="Zone" allLabel="All zones" />
              <RecordSelect value={bookingPlanFilter} onChange={setBookingPlanFilter} options={bookingPlans} label="Plan" allLabel="All plans" />
              <RecordSelect value={bookingPriorityFilter} onChange={selectBookingPriority} options={bookingPriorities} label="Priority" allLabel="All priorities" />
              <RecordSelect value={bookingCustomerTypeFilter} onChange={selectBookingCustomerType} options={bookingCustomerTypes} label="Customer" allLabel="All customers" />
              <input
                type="text"
                className="record-select-input record-search-input"
                value={bookingRecordSearch}
                onChange={(event) => setBookingRecordSearch(event.target.value)}
                placeholder="Search booking ID"
                aria-label="Search booking records by ID"
              />
              <span className="chip active">Dummy data</span>
            </div>
          </div>

          <section className="kpi-detail-summary revenue-booking-summary" aria-label="Booking record KPIs">
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-slate ${bookingRecordFilter === 'All' ? 'selected' : ''}`}
              aria-pressed={bookingRecordFilter === 'All'}
              onClick={() => setBookingRecordFilter('All')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▤</span><span>Total bookings</span></span>
              <strong>{totalBookingRecords.length}</strong>
              <small>All sample records</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-blue ${bookingRecordFilter === 'Ongoing' ? 'selected' : ''}`}
              aria-pressed={bookingRecordFilter === 'Ongoing'}
              onClick={() => setBookingRecordFilter('Ongoing')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▶</span><span>Ongoing</span></span>
              <strong>{ongoingBookings}</strong>
              <small>Currently on hire</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-green ${bookingRecordFilter === 'Completed' ? 'selected' : ''}`}
              aria-pressed={bookingRecordFilter === 'Completed'}
              onClick={() => setBookingRecordFilter('Completed')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✓</span><span>Completed</span></span>
              <strong>{completedBookingRecords}</strong>
              <small>Closed bookings</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-orange ${bookingRecordFilter === 'Upcoming' ? 'selected' : ''}`}
              aria-pressed={bookingRecordFilter === 'Upcoming'}
              onClick={() => setBookingRecordFilter('Upcoming')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">◔</span><span>Upcoming</span></span>
              <strong>{upcomingBookings}</strong>
              <small>Scheduled bookings</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-red ${bookingRecordFilter === 'Cancelled' ? 'selected' : ''}`}
              aria-pressed={bookingRecordFilter === 'Cancelled'}
              onClick={() => setBookingRecordFilter('Cancelled')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✕</span><span>Cancelled</span></span>
              <strong>{cancelledBookingRecords}</strong>
              <small>Not fulfilled</small>
            </button>
            <article className="kpi-detail-summary-card metric-card accent-purple">
              <span className="metric-card-top"><span className="metric-card-icon">₹</span><span>Booking value</span></span>
              <strong>₹{totalBookingValue.toLocaleString('en-IN')}</strong>
              <small>All listed records</small>
            </article>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-blue ${bookingCustomerTypeFilter === 'Company / Project' ? 'selected' : ''}`}
              aria-pressed={bookingCustomerTypeFilter === 'Company / Project'}
              onClick={() => setBookingCustomerTypeFilter(bookingCustomerTypeFilter === 'Company / Project' ? 'All' : 'Company / Project')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▣</span><span>Company / Project</span></span>
              <strong>{companyBookings}</strong>
              <small>Corporate & project bookings</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-orange ${bookingCustomerTypeFilter === 'Individual / Personal' ? 'selected' : ''}`}
              aria-pressed={bookingCustomerTypeFilter === 'Individual / Personal'}
              onClick={() => setBookingCustomerTypeFilter(bookingCustomerTypeFilter === 'Individual / Personal' ? 'All' : 'Individual / Personal')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">◉</span><span>Individual / Personal</span></span>
              <strong>{individualBookings}</strong>
              <small>Personal & self-use bookings</small>
            </button>
          </section>

          <div className="chart-wrap kpi-detail-table-wrap">
            <table className="state-table kpi-detail-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Customer type</th>
                  <th>Owner</th>
                  <th>Operator</th>
                  <th>Equipment</th>
                  <th>Plan</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookingRecords.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.id}</strong></td>
                    <td>
                      <span className="booking-record-entity">
                        <span>{booking.customerName}</span>
                        <small>{booking.customerId}</small>
                      </span>
                    </td>
                    <td><span className={`booking-customer-type ${booking.customerType === 'Individual / Personal' ? 'individual' : 'company'}`}>{booking.customerType}</span></td>
                    <td>
                      <span className="booking-record-entity">
                        <span>{booking.ownerName}</span>
                        <small>{booking.ownerId}</small>
                      </span>
                    </td>
                    <td>
                      <span className="booking-record-entity">
                        <span>{booking.operatorName}</span>
                        <small>{booking.operatorId}</small>
                      </span>
                    </td>
                    <td>{booking.equipment}</td>
                    <td>{booking.plan}</td>
                    <td><span className={`booking-priority booking-priority-${booking.priority.toLowerCase()}`}>{booking.priority}</span></td>
                    <td>
                      <span className="booking-record-entity">
                        <span>{booking.city}, {booking.state}</span>
                        <small>{booking.zone}</small>
                      </span>
                    </td>
                    <td>{booking.startDate} → {booking.endDate}</td>
                    <td>₹{booking.amount.toLocaleString('en-IN')}</td>
                    <td><span className={`booking-record-status ${bookingStatusClass(booking.status)}`}>{booking.status}</span></td>
                    <td className="booking-record-details">{booking.details}</td>
                  </tr>
                ))}
                {filteredBookingRecords.length === 0 && (
                  <tr>
                    <td colSpan={13}>No booking records match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="kpi-detail-source">Illustrative booking-level records for interface preview; customer, owner and operator IDs are sample identifiers.</p>
        </section>
      )}

      {metric.label === 'Vehicles' && (
        <section className="panel" aria-labelledby="active-vehicles-title">
          <div className="panel-header">
            <div>
              <h3 id="active-vehicles-title">Fleet records sample</h3>
              <span className="health-meta">Showing {filteredVehicles.length} of {activeVehicleRecords.length} vehicles · filter by status or category</span>
            </div>
            <div className="panel-header-tools">
              <RecordSelect value={vehicleCategoryFilter} onChange={setVehicleCategoryFilter} options={vehicleCategories} label="Category" allLabel="All categories" />
              <input
                type="text"
                className="record-select-input record-search-input"
                value={vehicleSearch}
                onChange={(event) => setVehicleSearch(event.target.value)}
                placeholder="Search vehicle ID, owner or operator"
                aria-label="Search vehicles by ID"
              />
              <span className="chip active">Dummy data</span>
            </div>
          </div>

          <section className="kpi-detail-summary revenue-booking-summary" aria-label="Active vehicle KPIs">
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-slate ${vehicleFilter === 'All' ? 'selected' : ''}`}
              aria-pressed={vehicleFilter === 'All'}
              onClick={() => setVehicleFilter('All')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▤</span><span>Total vehicles</span></span>
              <strong>{activeVehicleRecords.length}</strong>
              <small>All sample vehicles</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-green ${vehicleFilter === 'Available' ? 'selected' : ''}`}
              aria-pressed={vehicleFilter === 'Available'}
              onClick={() => setVehicleFilter('Available')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✓</span><span>Available</span></span>
              <strong>{availableVehicles}</strong>
              <small>Ready for dispatch</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-blue ${vehicleFilter === 'On Hire' ? 'selected' : ''}`}
              aria-pressed={vehicleFilter === 'On Hire'}
              onClick={() => setVehicleFilter('On Hire')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▶</span><span>On hire</span></span>
              <strong>{onHireVehicles}</strong>
              <small>Currently deployed</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-red ${vehicleFilter === 'Maintenance' ? 'selected' : ''}`}
              aria-pressed={vehicleFilter === 'Maintenance'}
              onClick={() => setVehicleFilter('Maintenance')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">⚙</span><span>Maintenance</span></span>
              <strong>{maintenanceVehicles}</strong>
              <small>Out of service</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-orange ${vehicleFilter === 'Idle' ? 'selected' : ''}`}
              aria-pressed={vehicleFilter === 'Idle'}
              onClick={() => setVehicleFilter('Idle')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">⏸</span><span>Idle</span></span>
              <strong>{idleVehicles}</strong>
              <small>Not deployed</small>
            </button>
            <article className="kpi-detail-summary-card metric-card accent-purple">
              <span className="metric-card-top"><span className="metric-card-icon">%</span><span>Avg utilization</span></span>
              <strong>{averageUtilization}%</strong>
              <small>Across listed vehicles</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-blue">
              <span className="metric-card-top"><span className="metric-card-icon">₹</span><span>Fleet daily rate</span></span>
              <strong>₹{fleetDailyRate.toLocaleString('en-IN')}</strong>
              <small>Combined per-day rate</small>
            </article>
          </section>

          <div className="chart-wrap kpi-detail-table-wrap">
            <table className="state-table kpi-detail-table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>Operator</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Utilization</th>
                  <th>Daily rate</th>
                  <th>Last service</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td><strong>{vehicle.id}</strong></td>
                    <td>{vehicle.equipment}</td>
                    <td>{vehicle.category}</td>
                    <td>
                      <span className="booking-record-entity">
                        <span>{vehicle.ownerName}</span>
                        <small>{vehicle.ownerId}</small>
                      </span>
                    </td>
                    <td>
                      <span className="booking-record-entity">
                        <span>{vehicle.operatorName}</span>
                        <small>{vehicle.operatorId}</small>
                      </span>
                    </td>
                    <td>{vehicle.city}, {vehicle.state}</td>
                    <td><span className={`vehicle-status ${vehicleStatusClass(vehicle.status)}`}>{vehicle.status}</span></td>
                    <td>
                      <span className="vehicle-utilization">
                        <span className="vehicle-utilization-track">
                          <span className="vehicle-utilization-fill" style={{ width: `${vehicle.utilization}%` }} />
                        </span>
                        {vehicle.utilization}%
                      </span>
                    </td>
                    <td>₹{vehicle.dailyRate.toLocaleString('en-IN')}</td>
                    <td>{vehicle.lastService}</td>
                    <td className="vehicle-record-details">{vehicle.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kpi-detail-source">Illustrative fleet-level records for interface preview; owner and operator IDs are sample identifiers.</p>
        </section>
      )}

      {metric.label === 'Operators' && (
        <section className="panel" aria-labelledby="active-operators-title">
          <div className="panel-header">
            <div>
              <h3 id="active-operators-title">Operator records sample</h3>
              <span className="health-meta">Showing {filteredOperators.length} of {activeOperatorRecords.length} operators · filter by status or skill</span>
            </div>
            <div className="panel-header-tools">
              <RecordSelect value={operatorSkillFilter} onChange={setOperatorSkillFilter} options={operatorSkills} label="Skill" allLabel="All skills" />
              <input
                type="text"
                className="record-select-input record-search-input"
                value={operatorSearch}
                onChange={(event) => setOperatorSearch(event.target.value)}
                placeholder="Search operator ID or owner"
                aria-label="Search operators by ID"
              />
              <span className="chip active">Dummy data</span>
            </div>
          </div>

          <section className="kpi-detail-summary revenue-booking-summary" aria-label="Active operator KPIs">
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-slate ${operatorFilter === 'All' ? 'selected' : ''}`}
              aria-pressed={operatorFilter === 'All'}
              onClick={() => setOperatorFilter('All')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▤</span><span>Total operators</span></span>
              <strong>{activeOperatorRecords.length}</strong>
              <small>All sample operators</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-green ${operatorFilter === 'Available' ? 'selected' : ''}`}
              aria-pressed={operatorFilter === 'Available'}
              onClick={() => setOperatorFilter('Available')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✓</span><span>Available</span></span>
              <strong>{availableOperators}</strong>
              <small>Ready for dispatch</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-blue ${operatorFilter === 'On Job' ? 'selected' : ''}`}
              aria-pressed={operatorFilter === 'On Job'}
              onClick={() => setOperatorFilter('On Job')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▶</span><span>On job</span></span>
              <strong>{onJobOperators}</strong>
              <small>Currently deployed</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-orange ${operatorFilter === 'Off Duty' ? 'selected' : ''}`}
              aria-pressed={operatorFilter === 'Off Duty'}
              onClick={() => setOperatorFilter('Off Duty')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">⏸</span><span>Off duty</span></span>
              <strong>{offDutyOperators}</strong>
              <small>Off rotation</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-red ${operatorFilter === 'On Leave' ? 'selected' : ''}`}
              aria-pressed={operatorFilter === 'On Leave'}
              onClick={() => setOperatorFilter('On Leave')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✈</span><span>On leave</span></span>
              <strong>{onLeaveOperators}</strong>
              <small>Approved absence</small>
            </button>
            <article className="kpi-detail-summary-card metric-card accent-purple">
              <span className="metric-card-top"><span className="metric-card-icon">★</span><span>Avg rating</span></span>
              <strong>{averageOperatorRating}</strong>
              <small>Out of 5.0</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-blue">
              <span className="metric-card-top"><span className="metric-card-icon">◈</span><span>Completed jobs</span></span>
              <strong>{totalOperatorJobs.toLocaleString('en-IN')}</strong>
              <small>Lifetime, listed operators</small>
            </article>
          </section>

          <div className="chart-wrap kpi-detail-table-wrap">
            <table className="state-table kpi-detail-table">
              <thead>
                <tr>
                  <th>Operator ID</th>
                  <th>Operator</th>
                  <th>Skill</th>
                  <th>Owner</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Rating</th>
                  <th>Completed jobs</th>
                  <th>Experience</th>
                  <th>Last active</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperators.map((operator) => (
                  <tr key={operator.id}>
                    <td><strong>{operator.id}</strong></td>
                    <td>{operator.name}</td>
                    <td>{operator.skill}</td>
                    <td>
                      <span className="booking-record-entity">
                        <span>{operator.ownerName}</span>
                        <small>{operator.ownerId}</small>
                      </span>
                    </td>
                    <td>{operator.city}, {operator.state}</td>
                    <td><span className={`operator-status ${operatorStatusClass(operator.status)}`}>{operator.status}</span></td>
                    <td>{operator.rating.toFixed(1)} ★</td>
                    <td>{operator.completedJobs.toLocaleString('en-IN')}</td>
                    <td>{operator.experienceYears} yrs</td>
                    <td>{operator.lastActive}</td>
                    <td className="operator-record-details">{operator.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kpi-detail-source">Illustrative operator-level records for interface preview; operator and owner IDs are sample identifiers.</p>
        </section>
      )}

      {metric.label === 'Fleet Partners' && (
        <section className="panel" aria-labelledby="fleet-partners-title">
          <div className="panel-header">
            <div>
              <h3 id="fleet-partners-title">Fleet partner records sample</h3>
              <span className="health-meta">Showing {filteredPartners.length} of {fleetPartnerRecords.length} partners · filter by status or state</span>
            </div>
            <div className="panel-header-tools">
              <RecordSelect value={partnerStateFilter} onChange={setPartnerStateFilter} options={partnerStates} label="State" allLabel="All states" />
              <input
                type="text"
                className="record-select-input record-search-input"
                value={partnerSearch}
                onChange={(event) => setPartnerSearch(event.target.value)}
                placeholder="Search partner ID, name or contact"
                aria-label="Search partners by ID"
              />
              <span className="chip active">Dummy data</span>
            </div>
          </div>

          <section className="kpi-detail-summary revenue-booking-summary" aria-label="Fleet partner KPIs">
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-slate ${partnerFilter === 'All' ? 'selected' : ''}`}
              aria-pressed={partnerFilter === 'All'}
              onClick={() => setPartnerFilter('All')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▤</span><span>Total partners</span></span>
              <strong>{fleetPartnerRecords.length}</strong>
              <small>All sample accounts</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-green ${partnerFilter === 'Active' ? 'selected' : ''}`}
              aria-pressed={partnerFilter === 'Active'}
              onClick={() => setPartnerFilter('Active')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✓</span><span>Active</span></span>
              <strong>{activePartners}</strong>
              <small>Approved and renting</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-orange ${partnerFilter === 'Pending' ? 'selected' : ''}`}
              aria-pressed={partnerFilter === 'Pending'}
              onClick={() => setPartnerFilter('Pending')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">◔</span><span>Pending</span></span>
              <strong>{pendingPartners}</strong>
              <small>Awaiting approval</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-red ${partnerFilter === 'Suspended' ? 'selected' : ''}`}
              aria-pressed={partnerFilter === 'Suspended'}
              onClick={() => setPartnerFilter('Suspended')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">⚠</span><span>Suspended</span></span>
              <strong>{suspendedPartners}</strong>
              <small>Under review</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-purple ${partnerFilter === 'Dormant' ? 'selected' : ''}`}
              aria-pressed={partnerFilter === 'Dormant'}
              onClick={() => setPartnerFilter('Dormant')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">⏸</span><span>Dormant</span></span>
              <strong>{dormantPartners}</strong>
              <small>Low activity</small>
            </button>
            <article className="kpi-detail-summary-card metric-card accent-blue">
              <span className="metric-card-top"><span className="metric-card-icon">▤</span><span>Total fleet size</span></span>
              <strong>{totalPartnerFleet.toLocaleString('en-IN')}</strong>
              <small>Across listed partners</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-green">
              <span className="metric-card-top"><span className="metric-card-icon">▶</span><span>Active vehicles</span></span>
              <strong>{totalPartnerActiveVehicles.toLocaleString('en-IN')}</strong>
              <small>Currently deployed</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-purple">
              <span className="metric-card-top"><span className="metric-card-icon">★</span><span>Avg rating</span></span>
              <strong>{averagePartnerRating}</strong>
              <small>Out of 5.0</small>
            </article>
          </section>

          <div className="chart-wrap kpi-detail-table-wrap">
            <table className="state-table kpi-detail-table">
              <thead>
                <tr>
                  <th>Partner ID</th>
                  <th>Partner</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Fleet size</th>
                  <th>Active vehicles</th>
                  <th>Rating</th>
                  <th>Joined</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <tr key={partner.id}>
                    <td><strong>{partner.id}</strong></td>
                    <td>{partner.name}</td>
                    <td>{partner.contactName}</td>
                    <td>{partner.city}, {partner.state}</td>
                    <td><span className={`partner-status ${partner.status.toLowerCase()}`}>{partner.status}</span></td>
                    <td>{partner.fleetSize.toLocaleString('en-IN')}</td>
                    <td>{partner.activeVehicles.toLocaleString('en-IN')}</td>
                    <td>{partner.rating.toFixed(1)} ★</td>
                    <td>{partner.joinedOn}</td>
                    <td className="partner-record-details">{partner.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kpi-detail-source">Illustrative fleet partner records for interface preview; partner and contact details are sample data.</p>
        </section>
      )}

      {metric.label === 'Cities' && (
        <section className="panel" aria-labelledby="active-cities-title">
          <div className="panel-header">
            <div>
              <h3 id="active-cities-title">City records sample</h3>
              <span className="health-meta">Showing {filteredCities.length} of {activeCityRecords.length} cities · filter by status or state</span>
            </div>
            <div className="panel-header-tools">
              <RecordSelect value={cityStateFilter} onChange={setCityStateFilter} options={cityStates} label="State" allLabel="All states" />
              <input
                type="text"
                className="record-select-input record-search-input"
                value={citySearch}
                onChange={(event) => setCitySearch(event.target.value)}
                placeholder="Search city ID or name"
                aria-label="Search cities by ID"
              />
              <span className="chip active">Dummy data</span>
            </div>
          </div>

          <section className="kpi-detail-summary revenue-booking-summary" aria-label="Active city KPIs">
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-slate ${cityFilter === 'All' ? 'selected' : ''}`}
              aria-pressed={cityFilter === 'All'}
              onClick={() => setCityFilter('All')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▤</span><span>Total cities</span></span>
              <strong>{activeCityRecords.length}</strong>
              <small>All sample cities</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-green ${cityFilter === 'Active' ? 'selected' : ''}`}
              aria-pressed={cityFilter === 'Active'}
              onClick={() => setCityFilter('Active')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✓</span><span>Active</span></span>
              <strong>{liveCities}</strong>
              <small>Live and serving</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-blue ${cityFilter === 'Launching' ? 'selected' : ''}`}
              aria-pressed={cityFilter === 'Launching'}
              onClick={() => setCityFilter('Launching')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▶</span><span>Launching</span></span>
              <strong>{launchingCities}</strong>
              <small>Pilot rollout</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-orange ${cityFilter === 'Paused' ? 'selected' : ''}`}
              aria-pressed={cityFilter === 'Paused'}
              onClick={() => setCityFilter('Paused')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">⏸</span><span>Paused</span></span>
              <strong>{pausedCities}</strong>
              <small>Temporarily halted</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-purple ${cityFilter === 'Planned' ? 'selected' : ''}`}
              aria-pressed={cityFilter === 'Planned'}
              onClick={() => setCityFilter('Planned')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">◔</span><span>Planned</span></span>
              <strong>{plannedCities}</strong>
              <small>Upcoming launch</small>
            </button>
            <article className="kpi-detail-summary-card metric-card accent-blue">
              <span className="metric-card-top"><span className="metric-card-icon">▦</span><span>Total zones</span></span>
              <strong>{totalCityZones.toLocaleString('en-IN')}</strong>
              <small>Across listed cities</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-green">
              <span className="metric-card-top"><span className="metric-card-icon">▶</span><span>Active vehicles</span></span>
              <strong>{totalCityVehicles.toLocaleString('en-IN')}</strong>
              <small>Deployed in cities</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-purple">
              <span className="metric-card-top"><span className="metric-card-icon">◈</span><span>Monthly bookings</span></span>
              <strong>{totalCityBookings.toLocaleString('en-IN')}</strong>
              <small>Combined city volume</small>
            </article>
          </section>

          <div className="chart-wrap kpi-detail-table-wrap">
            <table className="state-table kpi-detail-table">
              <thead>
                <tr>
                  <th>City ID</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Status</th>
                  <th>Zones</th>
                  <th>Active vehicles</th>
                  <th>Active operators</th>
                  <th>Monthly bookings</th>
                  <th>Launched</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((city) => (
                  <tr key={city.id}>
                    <td><strong>{city.id}</strong></td>
                    <td>{city.name}</td>
                    <td>{city.state}</td>
                    <td><span className={`city-status ${city.status.toLowerCase()}`}>{city.status}</span></td>
                    <td>{city.zones.toLocaleString('en-IN')}</td>
                    <td>{city.activeVehicles.toLocaleString('en-IN')}</td>
                    <td>{city.activeOperators.toLocaleString('en-IN')}</td>
                    <td>{city.monthlyBookings.toLocaleString('en-IN')}</td>
                    <td>{city.launchedOn}</td>
                    <td className="city-record-details">{city.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kpi-detail-source">Illustrative city-level records for interface preview; city and zone counts are sample data.</p>
        </section>
      )}

      {metric.label === 'Zones' && (
        <section className="panel" aria-labelledby="active-zones-title">
          <div className="panel-header">
            <div>
              <h3 id="active-zones-title">Zone records sample</h3>
              <span className="health-meta">Showing {filteredZones.length} of {activeZoneRecords.length} zones · filter by status or city</span>
            </div>
            <div className="panel-header-tools">
              <RecordSelect value={zoneCityFilter} onChange={setZoneCityFilter} options={zoneCities} label="City" allLabel="All cities" />
              <input
                type="text"
                className="record-select-input record-search-input"
                value={zoneSearch}
                onChange={(event) => setZoneSearch(event.target.value)}
                placeholder="Search zone ID, name or manager"
                aria-label="Search zones by ID"
              />
              <span className="chip active">Dummy data</span>
            </div>
          </div>

          <section className="kpi-detail-summary revenue-booking-summary" aria-label="Active zone KPIs">
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-slate ${zoneFilter === 'All' ? 'selected' : ''}`}
              aria-pressed={zoneFilter === 'All'}
              onClick={() => setZoneFilter('All')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▤</span><span>Total zones</span></span>
              <strong>{activeZoneRecords.length}</strong>
              <small>All sample zones</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-green ${zoneFilter === 'Active' ? 'selected' : ''}`}
              aria-pressed={zoneFilter === 'Active'}
              onClick={() => setZoneFilter('Active')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">✓</span><span>Active</span></span>
              <strong>{liveZones}</strong>
              <small>Live and serving</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-blue ${zoneFilter === 'Launching' ? 'selected' : ''}`}
              aria-pressed={zoneFilter === 'Launching'}
              onClick={() => setZoneFilter('Launching')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">▶</span><span>Launching</span></span>
              <strong>{launchingZones}</strong>
              <small>Pilot rollout</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-orange ${zoneFilter === 'Paused' ? 'selected' : ''}`}
              aria-pressed={zoneFilter === 'Paused'}
              onClick={() => setZoneFilter('Paused')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">⏸</span><span>Paused</span></span>
              <strong>{pausedZones}</strong>
              <small>Temporarily halted</small>
            </button>
            <button
              type="button"
              className={`kpi-detail-summary-card metric-card accent-purple ${zoneFilter === 'Planned' ? 'selected' : ''}`}
              aria-pressed={zoneFilter === 'Planned'}
              onClick={() => setZoneFilter('Planned')}
            >
              <span className="metric-card-top"><span className="metric-card-icon">◔</span><span>Planned</span></span>
              <strong>{plannedZones}</strong>
              <small>Upcoming launch</small>
            </button>
            <article className="kpi-detail-summary-card metric-card accent-blue">
              <span className="metric-card-top"><span className="metric-card-icon">▶</span><span>Active vehicles</span></span>
              <strong>{totalZoneVehicles.toLocaleString('en-IN')}</strong>
              <small>Deployed in zones</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-green">
              <span className="metric-card-top"><span className="metric-card-icon">▦</span><span>Active operators</span></span>
              <strong>{totalZoneOperators.toLocaleString('en-IN')}</strong>
              <small>Working in zones</small>
            </article>
            <article className="kpi-detail-summary-card metric-card accent-purple">
              <span className="metric-card-top"><span className="metric-card-icon">◈</span><span>Monthly bookings</span></span>
              <strong>{totalZoneBookings.toLocaleString('en-IN')}</strong>
              <small>Combined zone volume</small>
            </article>
          </section>

          <div className="chart-wrap kpi-detail-table-wrap">
            <table className="state-table kpi-detail-table">
              <thead>
                <tr>
                  <th>Zone ID</th>
                  <th>Zone</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Status</th>
                  <th>Active vehicles</th>
                  <th>Active operators</th>
                  <th>Monthly bookings</th>
                  <th>Area (km²)</th>
                  <th>Manager</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map((zone) => (
                  <tr key={zone.id}>
                    <td><strong>{zone.id}</strong></td>
                    <td>{zone.name}</td>
                    <td>{zone.city}</td>
                    <td>{zone.state}</td>
                    <td><span className={`zone-status ${zone.status.toLowerCase()}`}>{zone.status}</span></td>
                    <td>{zone.activeVehicles.toLocaleString('en-IN')}</td>
                    <td>{zone.activeOperators.toLocaleString('en-IN')}</td>
                    <td>{zone.monthlyBookings.toLocaleString('en-IN')}</td>
                    <td>{zone.areaKm2}</td>
                    <td>{zone.manager}</td>
                    <td className="zone-record-details">{zone.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kpi-detail-source">Illustrative zone-level records for interface preview; zone, manager and coverage figures are sample data.</p>
        </section>
      )}

      <section className="panel" aria-labelledby="kpi-period-breakdown">
        <div className="panel-header">
          <div>
            <h3 id="kpi-period-breakdown">{periodNoun}ly breakdown</h3>
            <span className="health-meta">{periodNoun}-over-{periodNounLower} change is calculated from the sample values shown.</span>
          </div>
        </div>
        <div className="chart-wrap kpi-detail-table-wrap">
          <table className="state-table kpi-detail-table">
            <thead>
              <tr>
                <th>{periodNoun}</th>
                <th>{metric.label}</th>
                <th>Change from prior {periodNounLower}</th>
                <th>Change %</th>
              </tr>
            </thead>
            <tbody>
              {metric.data.map((value, index) => {
                const previous = metric.data[index - 1]
                const delta = previous === undefined ? null : value - previous
                const percentChange = previous === undefined || previous === 0 ? null : (delta! / previous) * 100
                return (
                  <tr key={periods[index].full}>
                    <td>{periods[index].full}</td>
                    <td><strong>{formatKpiValue(metric, value)}</strong></td>
                    <td>{delta === null ? 'Baseline' : formatKpiDelta(metric, delta)}</td>
                    <td>{percentChange === null ? 'Baseline' : `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="kpi-detail-source">Illustrative dummy data for interface preview only; values are not live platform analytics.</p>
      </section>

      <section className="panel" aria-label={`${metric.label} ${periodNounLower}ly trend chart`}>
        <div className="panel-header">
          <div>
            <h3>{periodNoun}ly trend</h3>
            <span className="health-meta">Each bar represents the value recorded for that {periodNounLower}.</span>
          </div>
          <span className="chip active">Sample data</span>
        </div>
        <div className="chart-wrap">
          <div className="kpi-detail-chart">
            {metric.data.map((value, index) => (
              <div className="kpi-detail-point" key={periods[index].short}>
                <div className="kpi-detail-bar-track">
                  <div
                    className={`kpi-detail-bar ${metric.tone}`}
                    style={{ height: `${Math.max(12, (value / maximumValue) * 100)}%` }}
                    role="img"
                    aria-label={`${periods[index].full}: ${formatKpiValue(metric, value)}`}
                  />
                </div>
                <span className="kpi-detail-value">{formatKpiValue(metric, value)}</span>
                <span className="kpi-detail-month">{periods[index].short}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
