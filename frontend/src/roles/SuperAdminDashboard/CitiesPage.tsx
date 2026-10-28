import { useState, useMemo, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { statesPageStyles } from './pageStyles'
import type { CityItem } from './citiesData'
import { initialZonesData, type ZoneItem } from './zonesData'
import CityMetricPage, { type CityMetricView } from './CityMetricPage'
import type { BookingStatus, StateActivity, StateBooking } from './statesData'
import { initialStatesData } from './statesData'

type CityMetric = 'districts' | 'active-zones' | 'users' | 'officers'

type CitiesPageProps = {
  cities: CityItem[]
  zones?: ZoneItem[]
  setCities: Dispatch<SetStateAction<CityItem[]>>
  onBack?: () => void
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusFilterChange: (filter: 'all' | 'active' | 'inactive') => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  initialSearchQuery?: string
}

export default function CitiesPage({
  cities,
  zones: zonesProp,
  setCities,
  onBack,
  statusFilter,
  onStatusFilterChange,
  isAddModalOpen,
  setIsAddModalOpen,
  initialSearchQuery,
}: CitiesPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? '')
  const [stateFilter, setStateFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<CityMetric | null>(null)
  const [metricView, setMetricView] = useState<CityMetricView | null>(null)

  // Selected City for viewing details
  const [viewCity, setViewCity] = useState<CityItem | null>(null)
  const [editCity, setEditCity] = useState<CityItem | null>(null)

  // Booking filters inside the selected City details page
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingDistrictFilter, setBookingDistrictFilter] = useState('all')
  const [bookingZoneFilter, setBookingZoneFilter] = useState('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | BookingStatus>('all')
  const [bookingDateFilter, setBookingDateFilter] = useState('')

  // Selected Booking for viewing full booking details modal
  const [selectedBooking, setSelectedBooking] = useState<StateBooking | null>(null)

  // Add City form state
  const [addForm, setAddForm] = useState({
    name: '',
    code: '',
    stateName: initialStatesData[0]?.name ?? '',
    headquarters: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    totalDistricts: 3,
    keyDistricts: '',
    totalZones: 4,
    totalUsers: 80,
    status: 'Active' as 'Active' | 'Inactive',
    region: '',
  })

  // Edit City form state
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    code: '',
    stateName: '',
    headquarters: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    totalDistricts: 0,
    keyDistricts: '',
    totalZones: 0,
    totalUsers: 0,
    status: 'Active' as 'Active' | 'Inactive',
    region: '',
  })

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // State options for the state dropdown (only states that have cities), with counts
  const stateOptions = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>()
    cities.forEach((ct) => {
      const entry = counts.get(ct.stateId) ?? { name: ct.stateName, count: 0 }
      entry.count += 1
      counts.set(ct.stateId, entry)
    })
    return [...counts.entries()]
      .map(([id, entry]) => ({ id, name: entry.name, count: entry.count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [cities])

  // City options scoped to the selected state ("respective cities in a state")
  const cityOptions = useMemo(() => {
    return cities
      .filter((ct) => stateFilter === 'all' || ct.stateId === stateFilter)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [cities, stateFilter])

  // Filtered cities list for the main page
  const filteredCities = useMemo(() => {
    return cities.filter((ct) => {
      // State selection filter
      if (stateFilter !== 'all' && ct.stateId !== stateFilter) return false

      // City selection filter
      if (cityFilter !== 'all' && ct.id !== cityFilter) return false

      // Status filter
      if (statusFilter === 'active' && ct.status !== 'Active') return false
      if (statusFilter === 'inactive' && ct.status !== 'Inactive') return false

      // Search filter
      if (!searchQuery.trim()) return true
      const query = searchQuery.trim().toLowerCase()
      const matchName = ct.name.toLowerCase().includes(query)
      const matchCode = ct.code.toLowerCase().includes(query)
      const matchState = ct.stateName.toLowerCase().includes(query)
      const matchAdmin = ct.admin?.name.toLowerCase().includes(query) || ct.admin?.email.toLowerCase().includes(query)

      return matchName || matchCode || matchState || matchAdmin
    })
  }, [cities, stateFilter, cityFilter, statusFilter, searchQuery])

  // Aggregate stats for the main page
  const activeCount = useMemo(() => cities.filter((c) => c.status === 'Active').length, [cities])
  const inactiveCount = useMemo(() => cities.filter((c) => c.status === 'Inactive').length, [cities])
  const totalZonesCount = useMemo(() => cities.reduce((sum, c) => sum + c.totalZones, 0), [cities])
  const totalDistrictsCount = useMemo(() => cities.reduce((sum, c) => sum + c.totalDistricts, 0), [cities])
  const totalUsersCount = useMemo(() => cities.reduce((sum, c) => sum + c.totalUsers, 0), [cities])
  const totalOfficersCount = useMemo(
    () => cities.reduce((sum, c) => sum + (c.userBreakdown?.fieldOfficers ?? 0), 0),
    [cities],
  )

  const selectedMetricRows = useMemo(() => {
    if (!selectedMetric) return []

    const allZones = zonesProp ?? initialZonesData

    return cities
      .map((city) => ({
        city,
        value:
          selectedMetric === 'districts'
            ? city.totalDistricts
            : selectedMetric === 'active-zones'
              ? allZones.filter((z) => (z.cityId === city.id || z.cityName?.toLowerCase() === city.name.toLowerCase()) && z.status === 'Active').length || city.totalZones
              : selectedMetric === 'users'
                ? city.totalUsers
                : city.userBreakdown?.fieldOfficers ?? 0,
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value || a.city.name.localeCompare(b.city.name))
  }, [selectedMetric, cities, zonesProp])

  // Zone options for the selected city
  const cityZoneOptions = useMemo(() => {
    if (!viewCity || !viewCity.bookings) return []
    const zones = Array.from(new Set(viewCity.bookings.map((bk) => bk.zone).filter(Boolean)))
    return zones.sort()
  }, [viewCity])

  // Filtered bookings for the selected city
  const filteredCityBookings = useMemo(() => {
    if (!viewCity || !viewCity.bookings) return []
    return viewCity.bookings.filter((bk) => {
      // Zone filter
      if (bookingZoneFilter !== 'all' && bk.zone?.toLowerCase() !== bookingZoneFilter.toLowerCase()) {
        return false
      }

      // District filter
      if (bookingDistrictFilter !== 'all' && bk.district.toLowerCase() !== bookingDistrictFilter.toLowerCase()) {
        return false
      }

      // Status filter
      if (bookingStatusFilter !== 'all' && bk.status !== bookingStatusFilter) {
        return false
      }

      // Date filter
      if (bookingDateFilter && bk.date !== bookingDateFilter) {
        return false
      }

      // Search filter
      if (!bookingSearch.trim()) return true
      const q = bookingSearch.trim().toLowerCase()
      const matchId = bk.id.toLowerCase().includes(q)
      const matchCustomer = bk.customer.toLowerCase().includes(q)
      const matchType = bk.bookingType.toLowerCase().includes(q)
      const matchProvider = bk.assignedProvider.toLowerCase().includes(q)
      const matchDistrict = bk.district.toLowerCase().includes(q)

      return matchId || matchCustomer || matchType || matchProvider || matchDistrict
    })
  }, [viewCity, bookingSearch, bookingZoneFilter, bookingDistrictFilter, bookingStatusFilter, bookingDateFilter])

  // Unique list of districts for the selected city's district filter dropdown
  const cityDistrictOptions = useMemo(() => {
    if (!viewCity) return []
    const districtSet = new Set<string>()
    if (viewCity.keyDistricts) {
      viewCity.keyDistricts.forEach((d) => districtSet.add(d))
    }
    if (viewCity.bookings) {
      viewCity.bookings.forEach((bk) => districtSet.add(bk.district))
    }
    return Array.from(districtSet).sort()
  }, [viewCity])

  // Open city details and reset sub-filters
  const handleOpenCityDetails = (ct: CityItem) => {
    setViewCity(ct)
    setMetricView(null)
    setBookingSearch('')
    setBookingDistrictFilter('all')
    setBookingZoneFilter('all')
    setBookingStatusFilter('all')
    setBookingDateFilter('')
    setSelectedBooking(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const exitCityDetails = () => {
    setMetricView(null)
    setViewCity(null)
    setSelectedBooking(null)
  }

  // Toggle status handler
  const handleToggleStatus = (cityId: string) => {
    setCities((prev) =>
      prev.map((c) => {
        if (c.id === cityId) {
          const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active'
          const updatedActivity: StateActivity = {
            id: `act-toggle-${Date.now()}`,
            action: `City status changed to ${nextStatus}`,
            actor: 'Super Admin',
            timestamp: 'Just now',
            tone: nextStatus === 'Active' ? 'green' : 'orange',
          }
          const updated = {
            ...c,
            status: nextStatus as 'Active' | 'Inactive',
            recentActivity: [updatedActivity, ...c.recentActivity],
          }
          if (viewCity?.id === cityId) setViewCity(updated)
          showToast(`${c.name} is now ${nextStatus}.`)
          return updated
        }
        return c
      }),
    )
  }

  // Open Edit modal
  const openEditModal = (item: CityItem) => {
    setEditForm({
      id: item.id,
      name: item.name,
      code: item.code,
      stateName: item.stateName,
      headquarters: item.headquarters ?? '',
      adminName: item.admin?.name ?? '',
      adminEmail: item.admin?.email ?? '',
      adminPhone: item.admin?.phone ?? '',
      totalDistricts: item.totalDistricts,
      keyDistricts: item.keyDistricts?.join(', ') ?? '',
      totalZones: item.totalZones,
      totalUsers: item.totalUsers,
      status: item.status,
      region: item.region ?? '',
    })
    setEditCity(item)
  }

  // Submit Edit form
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!editForm.name.trim() || !editForm.code.trim()) {
      showToast('City name and code are required.')
      return
    }

    setCities((prev) =>
      prev.map((c) => {
        if (c.id === editForm.id) {
          const hasAdmin = Boolean(editForm.adminName.trim())
          const keyDistrictsList = editForm.keyDistricts
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean)

          const updated: CityItem = {
            ...c,
            name: editForm.name.trim(),
            code: editForm.code.trim().toUpperCase(),
            stateName: editForm.stateName,
            headquarters: editForm.headquarters.trim() || undefined,
            region: editForm.region.trim() || undefined,
            totalDistricts: Number(editForm.totalDistricts) || 0,
            keyDistricts: keyDistrictsList.length ? keyDistrictsList : c.keyDistricts,
            totalZones: Number(editForm.totalZones) || 0,
            totalUsers: Number(editForm.totalUsers) || 0,
            status: editForm.status,
            admin: hasAdmin
              ? {
                  name: editForm.adminName.trim(),
                  email: editForm.adminEmail.trim() || `${editForm.code.toLowerCase()}.admin@fieldwork.in`,
                  phone: editForm.adminPhone.trim() || '+91 98000 00000',
                  assignedDate: c.admin?.assignedDate ?? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                }
              : null,
            recentActivity: [
              {
                id: `act-edit-${Date.now()}`,
                action: 'City details updated by Super Admin',
                actor: 'Super Admin',
                timestamp: 'Just now',
                tone: 'blue',
              },
              ...c.recentActivity,
            ],
          }
          if (viewCity?.id === c.id) setViewCity(updated)
          return updated
        }
        return c
      }),
    )

    showToast(`City "${editForm.name}" updated successfully.`)
    setEditCity(null)
  }

  // Submit Add City form
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!addForm.name.trim() || !addForm.code.trim()) {
      showToast('Please enter both City Name and City Code.')
      return
    }

    const codeUpper = addForm.code.trim().toUpperCase()
    if (cities.some((c) => c.code.toUpperCase() === codeUpper)) {
      showToast(`A city with code "${codeUpper}" already exists.`)
      return
    }

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const todayIso = new Date().toISOString().split('T')[0]

    const hasAdmin = Boolean(addForm.adminName.trim())
    const keyDistrictsList = addForm.keyDistricts
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)

    const primaryDistrict = keyDistrictsList[0] || 'Central District'

    const newCity: CityItem = {
      id: `city-${codeUpper.toLowerCase()}-${Date.now()}`,
      name: addForm.name.trim(),
      code: codeUpper,
      stateId: initialStatesData.find((s) => s.name === addForm.stateName)?.id ?? '',
      stateName: addForm.stateName,
      headquarters: addForm.headquarters.trim() || undefined,
      region: addForm.region.trim() || 'Municipal Operating Zone',
      totalDistricts: Number(addForm.totalDistricts) || 1,
      keyDistricts: keyDistrictsList.length ? keyDistrictsList : ['Central District'],
      totalZones: Number(addForm.totalZones) || 1,
      totalUsers: Number(addForm.totalUsers) || 50,
      userBreakdown: {
        zoneAdmins: Number(addForm.totalZones) || 1,
        fieldOfficers: 8,
        operators: Math.max(0, (Number(addForm.totalUsers) || 50) - 12),
      },
      status: addForm.status,
      createdDate: todayStr,
      admin: hasAdmin
        ? {
            name: addForm.adminName.trim(),
            email: addForm.adminEmail.trim() || `${codeUpper.toLowerCase()}.admin@fieldwork.in`,
            phone: addForm.adminPhone.trim() || '+91 98000 12345',
            assignedDate: todayStr,
          }
        : null,
      bookingSummary: {
        total: 8,
        pending: 1,
        confirmed: 2,
        completed: 5,
        cancelled: 0,
      },
      recentActivity: [
        {
          id: `act-add-${Date.now()}`,
          action: 'City newly launched and added to the platform',
          actor: 'Super Admin',
          timestamp: 'Just now',
          tone: 'green',
        },
      ],
      bookings: [
        {
          id: `BK-${codeUpper}-1001`,
          customer: 'City Infrastructure Corp',
          customerPhone: '+91 98001 22334',
          customerEmail: 'projects@cityinfra.in',
          bookingType: 'JCB 3DX Backhoe Loader',
          zone: `${addForm.name.trim()} Zone 1`,
          district: primaryDistrict,
          date: todayIso,
          time: '09:00 AM',
          status: 'Confirmed',
          assignedProvider: `${addForm.name.trim()} Heavy Fleet`,
          amount: '₹34,000',
          siteAddress: `${primaryDistrict} Industrial Sector 1`,
          duration: '5 Days',
        },
      ],
    }

    setCities((prev) => [newCity, ...prev])
    showToast(`City "${newCity.name} (${newCity.code})" created successfully!`)
    setIsAddModalOpen(false)
    setAddForm({
      name: '',
      code: '',
      stateName: initialStatesData[0]?.name ?? '',
      headquarters: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      totalDistricts: 3,
      keyDistricts: '',
      totalZones: 4,
      totalUsers: 80,
      status: 'Active',
      region: '',
    })
  }

  return (
    <div className="states-page">
      <style>{statesPageStyles}</style>
      <style>{`
        .cities-toolbar-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cities-state-select {
          min-width: 210px;
          cursor: pointer;
        }

        .cities-city-select {
          min-width: 190px;
          cursor: pointer;
        }

        .cities-clear-btn {
          border: 0;
          background: transparent;
          color: var(--brand-orange);
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          padding: 6px 4px;
        }

        .cities-clear-btn:hover {
          text-decoration: underline;
        }

        .states-header {
          align-items: center;
        }

        .states-header-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 3px;
        }

        .states-created-date {
          font-size: 0.74rem;
          color: #64748b;
          font-weight: 500;
        }

        .states-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .states-header-actions .btn-secondary,
        .states-header-actions .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 8px 16px;
          font-size: 0.84rem;
          font-weight: 700;
          box-sizing: border-box;
          white-space: nowrap;
        }

        .states-breadcrumb button:hover {
          text-decoration: underline;
        }

        .state-metric-breakdown {
          width: 100%;
          border-collapse: collapse;
        }

        .state-metric-breakdown th,
        .state-metric-breakdown td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.07);
          text-align: left;
        }

        .state-metric-breakdown th {
          color: #64748b;
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .state-metric-breakdown td:last-child,
        .state-metric-breakdown th:last-child {
          text-align: right;
        }
      `}</style>

      {/* Breadcrumb & Header */}
      {!viewCity && (
        <header className="states-header">
          <div className="states-header-copy">
            <div className="states-breadcrumb">
              <button type="button" onClick={onBack}>Dashboard</button>
            </div>
            <h2>Cities & Jurisdictions</h2>
          </div>

          <div className="states-header-actions">
            {onBack && (
              <button type="button" className="btn-secondary" onClick={onBack}>
                ← Back to Overview
              </button>
            )}
            <button type="button" className="btn-primary geo-add-action" onClick={() => setIsAddModalOpen(true)}>
              <span>+</span> Add City
            </button>
          </div>
        </header>
      )}

      {!viewCity && (
        <>
          {/* Aggregate Stats Bar */}
          <section className="states-stats-grid" aria-label="Cities summary statistics">
            <button
              type="button"
              className={`states-stat-card interactive ${statusFilter === 'all' && !selectedMetric ? 'selected' : ''}`}
              aria-pressed={statusFilter === 'all' && !selectedMetric}
              onClick={() => {
                onStatusFilterChange('all')
                setStateFilter('all')
                setCityFilter('all')
                setSearchQuery('')
                setSelectedMetric(null)
              }}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Total Cities</span>
                <span className="states-stat-value">{cities.length}</span>
              </div>
              <span className="states-stat-badge slate">City Hubs</span>
            </button>

            <button
              type="button"
              className={`states-stat-card interactive ${statusFilter === 'active' && !selectedMetric ? 'selected' : ''}`}
              aria-pressed={statusFilter === 'active' && !selectedMetric}
              onClick={() => {
                onStatusFilterChange('active')
                setStateFilter('all')
                setCityFilter('all')
                setSearchQuery('')
                setSelectedMetric(null)
              }}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Active Cities</span>
                <span className="states-stat-value">{activeCount}</span>
              </div>
              <span className="states-stat-badge green">{Math.round((activeCount / (cities.length || 1)) * 100)}% Live</span>
            </button>

            <button
              type="button"
              className={`states-stat-card interactive ${statusFilter === 'inactive' && !selectedMetric ? 'selected' : ''}`}
              aria-pressed={statusFilter === 'inactive' && !selectedMetric}
              onClick={() => {
                onStatusFilterChange('inactive')
                setStateFilter('all')
                setCityFilter('all')
                setSearchQuery('')
                setSelectedMetric(null)
              }}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Inactive Cities</span>
                <span className="states-stat-value">{inactiveCount}</span>
              </div>
              <span className="states-stat-badge orange">Paused</span>
            </button>

            <button
              type="button"
              className={`states-stat-card interactive ${selectedMetric === 'districts' ? 'selected' : ''}`}
              aria-pressed={selectedMetric === 'districts'}
              onClick={() => setSelectedMetric('districts')}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Total Districts</span>
                <span className="states-stat-value">{totalDistrictsCount}</span>
              </div>
              <span className="states-stat-badge blue">Coverage</span>
            </button>

            <button
              type="button"
              className={`states-stat-card interactive ${selectedMetric === 'active-zones' ? 'selected' : ''}`}
              aria-pressed={selectedMetric === 'active-zones'}
              onClick={() => setSelectedMetric('active-zones')}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Active Zones</span>
                <span className="states-stat-value">{totalZonesCount}</span>
              </div>
              <span className="states-stat-badge blue">Zonal Coverage</span>
            </button>

            <button
              type="button"
              className={`states-stat-card interactive ${selectedMetric === 'users' ? 'selected' : ''}`}
              aria-pressed={selectedMetric === 'users'}
              onClick={() => setSelectedMetric('users')}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Total Users</span>
                <span className="states-stat-value">{totalUsersCount.toLocaleString()}</span>
              </div>
              <span className="states-stat-badge orange">All users</span>
            </button>

            <button
              type="button"
              className={`states-stat-card interactive ${selectedMetric === 'officers' ? 'selected' : ''}`}
              aria-pressed={selectedMetric === 'officers'}
              onClick={() => setSelectedMetric('officers')}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Officers</span>
                <span className="states-stat-value">{totalOfficersCount.toLocaleString()}</span>
              </div>
              <span className="states-stat-badge orange">Field officers</span>
            </button>
          </section>

          {/* Search and Filters Toolbar */}
          <section className="states-toolbar" aria-label="Cities filter and search controls">
            <div className="states-search-box">
              <input
                type="text"
                placeholder="Search by city name, code, state, admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search cities"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="cities-toolbar-filters">
              <select
                className="bookings-filter-select cities-state-select"
                aria-label="Filter by state"
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value)
                  setCityFilter('all')
                }}
              >
                <option value="all">All states ({stateOptions.length})</option>
                {stateOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.count} {option.count === 1 ? 'city' : 'cities'})
                  </option>
                ))}
              </select>

              <select
                className="bookings-filter-select cities-city-select"
                aria-label="Select a city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="all">
                  {stateFilter === 'all'
                    ? `All cities (${cityOptions.length})`
                    : `All cities in ${stateOptions.find((option) => option.id === stateFilter)?.name ?? 'state'} (${cityOptions.length})`}
                </option>
                {cityOptions.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name} ({ct.code}) · {ct.status}
                  </option>
                ))}
              </select>

              {cityFilter !== 'all' && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    const selected = cities.find((ct) => ct.id === cityFilter)
                    if (selected) handleOpenCityDetails(selected)
                  }}
                >
                  View details
                </button>
              )}

              {(stateFilter !== 'all' || cityFilter !== 'all') && (
                <button
                  type="button"
                  className="cities-clear-btn"
                  onClick={() => {
                    setStateFilter('all')
                    setCityFilter('all')
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="states-filter-pills" role="tablist" aria-label="Filter by status">
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => onStatusFilterChange('all')}
              >
                All Cities <span className="filter-pill-count">{cities.length}</span>
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => onStatusFilterChange('active')}
              >
                Active <span className="filter-pill-count">{activeCount}</span>
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'inactive' ? 'active' : ''}`}
                onClick={() => onStatusFilterChange('inactive')}
              >
                Inactive <span className="filter-pill-count">{inactiveCount}</span>
              </button>
            </div>
          </section>

          {/* Cities Table Card */}
          <section className="states-table-card" aria-label="Cities table list">
            <div className="states-table-wrap">
              <table className="states-table">
                <thead>
                  <tr>
                    <th>City Name</th>
                    <th>State</th>
                    <th>City Admin</th>
                    <th>Districts</th>
                    <th>Zones</th>
                    <th>Total Users</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCities.length > 0 ? (
                    filteredCities.map((ct) => (
                      <tr
                        key={ct.id}
                        className="states-table-row"
                        onClick={() => handleOpenCityDetails(ct)}
                        title={`Click to view ${ct.name} city details and bookings`}
                      >
                        <td>
                          <div className="state-name-cell">
                            <div className="state-avatar-badge">{ct.code}</div>
                            <div className="state-name-info">
                              <strong>{ct.name}</strong>
                              <span>{ct.headquarters ? `HQ: ${ct.headquarters}` : ct.region ?? 'Municipal Zone'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="state-code-badge">{ct.stateName}</span>
                        </td>
                        <td>
                          {ct.admin ? (
                            <div className="admin-pill">
                              <strong>{ct.admin.name}</strong>
                              <span>{ct.admin.email}</span>
                            </div>
                          ) : (
                            <span className="unassigned-badge">⚠ Unassigned</span>
                          )}
                        </td>
                        <td>
                          <strong>{ct.totalDistricts}</strong> <span style={{ color: '#64748b' }}>districts</span>
                        </td>
                        <td>
                          <strong>{ct.totalZones}</strong> <span style={{ color: '#64748b' }}>zones</span>
                        </td>
                        <td>
                          <strong>{ct.totalUsers.toLocaleString()}</strong> <span style={{ color: '#64748b' }}>users</span>
                        </td>
                        <td>
                          <span className={`status-pill ${ct.status.toLowerCase()}`}>
                            <span className="status-dot" />
                            {ct.status}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {ct.createdDate}
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button
                              type="button"
                              className="action-btn view icon-action"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenCityDetails(ct)
                              }}
                              aria-label={`View details for ${ct.name}`}
                              title="View city"
                            >
                              👁️
                            </button>
                            <button
                              type="button"
                              className="action-btn edit icon-action"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditModal(ct)
                              }}
                              aria-label={`Edit ${ct.name}`}
                              title="Edit city"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className={`action-btn icon-action ${ct.status === 'Active' ? 'toggle-deactivate' : 'toggle-activate'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleStatus(ct.id)
                              }}
                              aria-label={`${ct.status === 'Active' ? 'Deactivate' : 'Activate'} ${ct.name}`}
                              title={ct.status === 'Active' ? 'Deactivate city' : 'Activate city'}
                            >
                              {ct.status === 'Active' ? '🚫' : '✅'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9}>
                        <div className="empty-states-panel">
                          <div className="empty-icon">🏙️</div>
                          <h4>No cities found</h4>
                          <p>
                            {stateFilter !== 'all' || cityFilter !== 'all'
                              ? 'No cities match the selected state or city combined with the current search or status filters.'
                              : searchQuery
                                ? `No cities matching "${searchQuery}". Try clearing search or changing filters.`
                                : 'No cities are available under this status filter.'}
                          </p>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setSearchQuery('')
                              setStateFilter('all')
                              setCityFilter('all')
                              onStatusFilterChange('all')
                            }}
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* CITY METRIC PAGE (OPENED FROM THE CITY KPI CARDS) */}
      {viewCity && metricView && (
        <CityMetricPage
          city={viewCity}
          view={metricView}
          zones={zonesProp ?? initialZonesData}
          onChangeView={setMetricView}
          onBack={() => setMetricView(null)}
          onExitCity={exitCityDetails}
          onViewBooking={setSelectedBooking}
        />
      )}

      {/* CITY DETAILS PAGE (DYNAMICALLY DRIVEN BY SELECTED CITY) */}
      {viewCity && !metricView && (
        <>
          <header className="states-header" aria-labelledby="view-city-title">
            <div className="states-header-copy">
              <div className="states-breadcrumb">
                <button type="button" onClick={exitCityDetails}>
                  Cities
                </button>
                <span>›</span>
                <span>{viewCity.name}</span>
              </div>
              <h2 id="view-city-title">{viewCity.name} — City Overview</h2>
              <div className="states-header-meta">
                <span className="state-code-badge">{viewCity.code}</span>
                <span className="state-code-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                  {viewCity.stateName}
                </span>
                <span className={`status-pill ${viewCity.status.toLowerCase()}`}>
                  <span className="status-dot" />
                  {viewCity.status}
                </span>
                <span className="states-created-date">
                  Created: {viewCity.createdDate}
                </span>
              </div>
            </div>
            <div className="states-header-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleToggleStatus(viewCity.id)}
              >
                <span>{viewCity.status === 'Active' ? '🚫' : '✅'}</span>
                <span>{viewCity.status === 'Active' ? 'Deactivate City' : 'Activate City'}</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const target = viewCity
                  openEditModal(target)
                }}
              >
                <span>✏️</span>
                <span>Edit City</span>
              </button>
              <button type="button" className="btn-primary" onClick={exitCityDetails}>
                <span>←</span>
                <span>Back to Cities</span>
              </button>
            </div>
          </header>

          <section
            style={{ display: 'grid', gap: 16 }}
            aria-labelledby="view-city-title"
          >
            {/* 1. CITY BOOKINGS & DISTRICT METRICS SUMMARY */}
            <div className="view-section" style={{ background: '#fff' }}>
              <h4 className="view-section-title">
                <span>City Performance & Booking Summary</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Real-time Territorial Metrics</span>
              </h4>

              <div className="state-bookings-kpi-grid">
                <button
                  type="button"
                  className="state-kpi-tile primary interactive"
                  onClick={() => setMetricView('bookings')}
                  title={`Open all bookings for ${viewCity.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewCity.bookingSummary?.total.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Total Bookings</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile amber interactive"
                  onClick={() => setMetricView('pending')}
                  title={`Open pending bookings for ${viewCity.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewCity.bookingSummary?.pending.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Pending</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile blue interactive"
                  onClick={() => setMetricView('confirmed')}
                  title={`Open confirmed bookings for ${viewCity.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewCity.bookingSummary?.confirmed.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Confirmed</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile green interactive"
                  onClick={() => setMetricView('completed')}
                  title={`Open completed bookings for ${viewCity.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewCity.bookingSummary?.completed.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Completed</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile red interactive"
                  onClick={() => setMetricView('cancelled')}
                  title={`Open cancelled bookings for ${viewCity.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewCity.bookingSummary?.cancelled.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Cancelled</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile interactive"
                  onClick={() => setMetricView('users')}
                  title={`Open user distribution for ${viewCity.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewCity.totalUsers.toLocaleString()}
                  </span>
                  <span className="state-kpi-tile-label">Total Users</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile interactive"
                  onClick={() => setMetricView('districts')}
                  title={`Open district coverage for ${viewCity.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewCity.totalDistricts}
                  </span>
                  <span className="state-kpi-tile-label">Districts</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile interactive"
                  onClick={() => setMetricView('zones')}
                  title={`Open zone breakdown for ${viewCity.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewCity.totalZones}
                  </span>
                  <span className="state-kpi-tile-label">Zones</span>
                </button>
              </div>
            </div>

            {/* 2. ASSIGNED CITY ADMIN */}
            <div className="view-section">
              <h4 className="view-section-title">
                <span>City Administrator Details</span>
                {viewCity.admin && <span style={{ color: '#078653' }}>● Active Jurisdictional Scope</span>}
              </h4>

              {viewCity.admin ? (
                <div className="admin-card-view">
                  <div className="admin-view-left">
                    <div className="admin-avatar-lg">
                      {viewCity.admin.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="admin-details-text">
                      <strong>{viewCity.admin.name}</strong>
                      <span>Work Email: {viewCity.admin.email}</span>
                      <span>Contact: {viewCity.admin.phone ?? 'No phone provided'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="state-code-badge" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                      Assigned Scope: City · {viewCity.name}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                      Assigned on {viewCity.admin.assignedDate ?? 'Launch'}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '14px', background: '#fff1f2', borderRadius: '10px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: '#9f1239', fontSize: '0.88rem' }}>No City Admin Assigned</strong>
                    <p style={{ margin: '2px 0 0', color: '#be123c', fontSize: '0.78rem' }}>
                      This city is operating without a dedicated primary administrator.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.76rem', padding: '6px 12px' }}
                    onClick={() => {
                      const target = viewCity
                      openEditModal(target)
                    }}
                  >
                    Assign Admin
                  </button>
                </div>
              )}
            </div>

            {/* 3. BOOKINGS SECTION (WITH DYNAMIC SEARCH & FILTERS) */}
            <div className="view-section">
              <h4 className="view-section-title">
                <span>Recent & Active Bookings in {viewCity.name}</span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Showing {filteredCityBookings.length} of {viewCity.bookings?.length ?? 0} bookings
                </span>
              </h4>

              {/* Bookings Search & Filter Controls */}
              <div className="bookings-toolbar">
                <input
                  type="text"
                  className="bookings-search-input"
                  placeholder="Search by Booking ID, customer, equipment, provider..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  aria-label="Search bookings in city"
                />

                {/* Filter by District */}
                <select
                  className="bookings-filter-select"
                  value={bookingDistrictFilter}
                  onChange={(e) => {
                    setBookingDistrictFilter(e.target.value)
                    setBookingZoneFilter('all')
                  }}
                  aria-label="Filter bookings by district"
                >
                  <option value="all">All Districts</option>
                  {cityDistrictOptions.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>

                {/* Filter by Zone */}
                <select
                  className="bookings-filter-select"
                  value={bookingZoneFilter}
                  onChange={(e) => setBookingZoneFilter(e.target.value)}
                  aria-label="Filter bookings by zone"
                >
                  <option value="all">All Zones</option>
                  {cityZoneOptions.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>

                {/* Filter by Status */}
                <select
                  className="bookings-filter-select"
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value as 'all' | BookingStatus)}
                  aria-label="Filter bookings by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {/* Filter by Date */}
                <input
                  type="date"
                  className="bookings-filter-date"
                  value={bookingDateFilter}
                  onChange={(e) => setBookingDateFilter(e.target.value)}
                  title="Filter bookings by date"
                  aria-label="Filter bookings by date"
                />

                {(bookingSearch || bookingZoneFilter !== 'all' || bookingDistrictFilter !== 'all' || bookingStatusFilter !== 'all' || bookingDateFilter) && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                    onClick={() => {
                      setBookingSearch('')
                      setBookingZoneFilter('all')
                      setBookingDistrictFilter('all')
                      setBookingStatusFilter('all')
                      setBookingDateFilter('')
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Bookings Table */}
              <div className="bookings-table-wrap">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer / User</th>
                      <th>Booking Type</th>
                      <th>Zone</th>
                      <th>District</th>
                      <th>Booking Date</th>
                      <th>Booking Time</th>
                      <th>Status</th>
                      <th>Assigned Provider</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCityBookings.length > 0 ? (
                      filteredCityBookings.map((bk) => (
                        <tr key={bk.id}>
                          <td>
                            <span className="booking-id-tag">{bk.id}</span>
                          </td>
                          <td>
                            <div style={{ display: 'grid', gap: '2px' }}>
                              <strong style={{ color: '#0f172a' }}>{bk.customer}</strong>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{bk.customerPhone}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{bk.bookingType}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{bk.zone}</span>
                          </td>
                          <td>
                            <span className="district-tag" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                              📍 {bk.district}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', color: '#475569' }}>{bk.date}</td>
                          <td style={{ whiteSpace: 'nowrap', color: '#475569' }}>{bk.time}</td>
                          <td>
                            <span className={`status-pill ${bk.status.toLowerCase()}`}>
                              <span className="status-dot" />
                              {bk.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 600 }}>
                              {bk.assignedProvider}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="action-btn view"
                              style={{ padding: '5px 9px', fontSize: '0.72rem' }}
                              onClick={() => setSelectedBooking(bk)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                          <div style={{ display: 'grid', gap: '6px', placeItems: 'center' }}>
                            <span>📋</span>
                            <strong>No bookings found for {viewCity.name}</strong>
                            <span style={{ fontSize: '0.76rem' }}>
                              {bookingSearch || bookingZoneFilter !== 'all' || bookingDistrictFilter !== 'all' || bookingStatusFilter !== 'all' || bookingDateFilter
                                ? 'No bookings match your selected search or filters.'
                                : 'No bookings recorded for this city yet.'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      {/* METRIC BREAKDOWN MODAL */}
      {selectedMetric && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedMetric(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="city-metric-title"
        >
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <div>
                  <h3 id="city-metric-title">
                    {{
                      districts: 'Districts by city',
                      'active-zones': 'Active zones by city',
                      users: 'Users by city',
                      officers: 'Field officers by city',
                    }[selectedMetric]}
                  </h3>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    Total: {{
                      districts: totalDistrictsCount,
                      'active-zones': totalZonesCount,
                      users: totalUsersCount,
                      officers: totalOfficersCount,
                    }[selectedMetric].toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedMetric(null)}
                aria-label="Close metric breakdown"
              >
                ×
              </button>
            </header>
            <div className="modal-body" style={{ gap: 0, padding: 0 }}>
              <div className="states-table-wrap">
                <table className="state-metric-breakdown">
                  <thead>
                    <tr>
                      <th>City</th>
                      <th>State</th>
                      <th>{{
                        districts: 'Districts',
                        'active-zones': 'Active zones',
                        users: 'Users',
                        officers: 'Field officers',
                      }[selectedMetric]}</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMetricRows.map(({ city, value }) => (
                      <tr key={city.id}>
                        <td><strong>{city.name}</strong> <span style={{ color: '#64748b' }}>({city.code})</span></td>
                        <td><span className="state-code-badge">{city.stateName}</span></td>
                        <td>{value.toLocaleString()}</td>
                        <td>
                          <button
                            type="button"
                            className="action-btn view"
                            onClick={() => {
                              handleOpenCityDetails(city)
                              setSelectedMetric(null)
                            }}
                          >
                            View city
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1020 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBooking(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-details-title"
        >
          <div className="modal-card booking-detail-modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <div>
                  <h3 id="booking-details-title">Booking Details — {selectedBooking.id}</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                    <span className={`status-pill ${selectedBooking.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {selectedBooking.status}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {selectedBooking.date} • {selectedBooking.time}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
              >
                ×
              </button>
            </header>

            <div className="modal-body" style={{ gap: '16px' }}>
              <div className="view-section" style={{ background: '#fff' }}>
                <h4 className="view-section-title">
                  <span>Equipment & Rental Summary</span>
                  <span style={{ color: '#078653', fontWeight: 800 }}>{selectedBooking.amount}</span>
                </h4>
                <div className="details-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <div className="detail-item">
                    <span className="detail-label">Machinery Type</span>
                    <span className="detail-value">{selectedBooking.bookingType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rental Duration</span>
                    <span className="detail-value">{selectedBooking.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Assigned Provider</span>
                    <span className="detail-value">{selectedBooking.assignedProvider}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Booking Status</span>
                    <span className="detail-value">{selectedBooking.status}</span>
                  </div>
                </div>
              </div>

              <div className="view-section" style={{ background: '#fff' }}>
                <h4 className="view-section-title">
                  <span>Customer & Contact Information</span>
                </h4>
                <div className="details-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <div className="detail-item">
                    <span className="detail-label">Customer / Company</span>
                    <span className="detail-value">{selectedBooking.customer}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone Contact</span>
                    <span className="detail-value">{selectedBooking.customerPhone}</span>
                  </div>
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="detail-label">Work Email</span>
                    <span className="detail-value">{selectedBooking.customerEmail}</span>
                  </div>
                </div>
              </div>

              <div className="view-section" style={{ background: '#fff' }}>
                <h4 className="view-section-title">
                  <span>Site & Deployment Location</span>
                </h4>
                <div className="details-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <div className="detail-item">
                    <span className="detail-label">Zone</span>
                    <span className="detail-value">{selectedBooking.zone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">District</span>
                    <span className="detail-value">📍 {selectedBooking.district}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Jurisdiction</span>
                    <span className="detail-value">
                      {viewCity ? `${viewCity.name} · ${viewCity.stateName}` : selectedBooking.district}
                    </span>
                  </div>
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="detail-label">Site Address</span>
                    <span className="detail-value">{selectedBooking.siteAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            <footer className="modal-footer">
              <button type="button" className="btn-primary" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* EDIT CITY MODAL */}
      {editCity && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditCity(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-city-title"
        >
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <h3 id="edit-city-title">Edit City — {editCity.name}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setEditCity(null)} aria-label="Close edit form">
                ×
              </button>
            </header>

            <form onSubmit={handleEditSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>City Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Pune"
                    />
                  </div>

                  <div className="form-field">
                    <label>City Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={editForm.code}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. PNQ"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>State</label>
                    <select
                      value={editForm.stateName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, stateName: e.target.value }))}
                    >
                      {initialStatesData.map((st) => (
                        <option key={st.id} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Headquarters</label>
                    <input
                      type="text"
                      value={editForm.headquarters}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, headquarters: e.target.value }))}
                      placeholder="e.g. Pune"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Operational Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Geographic Corridor / Region</label>
                    <input
                      type="text"
                      value={editForm.region}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, region: e.target.value }))}
                      placeholder="e.g. Western Industrial Belt"
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Assigned City Admin</h4>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Admin Full Name</label>
                      <input
                        type="text"
                        value={editForm.adminName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, adminName: e.target.value }))}
                        placeholder="Leave blank if unassigned"
                      />
                    </div>

                    <div className="form-field">
                      <label>Work Email</label>
                      <input
                        type="email"
                        value={editForm.adminEmail}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                        placeholder="admin@fieldwork.in"
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: '12px' }}>
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={editForm.adminPhone}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, adminPhone: e.target.value }))}
                      placeholder="+91 98000 00000"
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Districts, Zones & Workforce</h4>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Total Districts</label>
                      <input
                        type="number"
                        min={1}
                        value={editForm.totalDistricts}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, totalDistricts: parseInt(e.target.value, 10) || 0 }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>Total Zones</label>
                      <input
                        type="number"
                        min={1}
                        value={editForm.totalZones}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, totalZones: parseInt(e.target.value, 10) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: '12px' }}>
                    <div className="form-field">
                      <label>Total Users & Officers</label>
                      <input
                        type="number"
                        min={0}
                        value={editForm.totalUsers}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, totalUsers: parseInt(e.target.value, 10) || 0 }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>Key Districts (comma-separated)</label>
                      <input
                        type="text"
                        value={editForm.keyDistricts}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, keyDistricts: e.target.value }))}
                        placeholder="e.g. Mumbai Suburban, Mumbai City"
                      />
                      <span className="form-hint">Separate district names with commas.</span>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditCity(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ADD CITY MODAL */}
      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-city-title"
        >
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <h3 id="add-city-title">Add New City</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleAddSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>City Name *</label>
                    <input
                      type="text"
                      required
                      value={addForm.name}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Indore"
                    />
                  </div>

                  <div className="form-field">
                    <label>City Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={addForm.code}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. IDR"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>State</label>
                    <select
                      value={addForm.stateName}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, stateName: e.target.value }))}
                    >
                      {initialStatesData.map((st) => (
                        <option key={st.id} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Headquarters</label>
                    <input
                      type="text"
                      value={addForm.headquarters}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, headquarters: e.target.value }))}
                      placeholder="e.g. Indore"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Initial Status</label>
                    <select
                      value={addForm.status}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Geographic Corridor / Region</label>
                    <input
                      type="text"
                      value={addForm.region}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, region: e.target.value }))}
                      placeholder="e.g. Central India Industrial Corridor"
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Assign City Admin (Optional)</h4>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Admin Full Name</label>
                      <input
                        type="text"
                        value={addForm.adminName}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, adminName: e.target.value }))}
                        placeholder="e.g. Vikram Sharma"
                      />
                    </div>

                    <div className="form-field">
                      <label>Work Email</label>
                      <input
                        type="email"
                        value={addForm.adminEmail}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                        placeholder="v.sharma@fieldwork.in"
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: '12px' }}>
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={addForm.adminPhone}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, adminPhone: e.target.value }))}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Districts, Zones & Workforce</h4>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Total Districts *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={addForm.totalDistricts}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, totalDistricts: parseInt(e.target.value, 10) || 1 }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>Total Zones *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={addForm.totalZones}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, totalZones: parseInt(e.target.value, 10) || 1 }))}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: '12px' }}>
                    <div className="form-field">
                      <label>Estimated Users & Officers</label>
                      <input
                        type="number"
                        min={0}
                        value={addForm.totalUsers}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, totalUsers: parseInt(e.target.value, 10) || 0 }))}
                      />
                    </div>

                    <div className="form-field">
                      <label>Key Districts (comma-separated)</label>
                      <input
                        type="text"
                        value={addForm.keyDistricts}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, keyDistricts: e.target.value }))}
                        placeholder="e.g. Indore East, Indore West"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary geo-add-action">
                  Add City
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="states-toast" role="status">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
