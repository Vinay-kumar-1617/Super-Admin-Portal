import { useState, useMemo, type FormEvent } from 'react'
import { statesPageStyles } from './pageStyles'
import StateMetricPage, { type StateMetricView } from './StateMetricPage'
import type { BookingStatus, StateActivity, StateBooking, StateItem } from './statesData'
import type { CityItem } from './citiesData'
import type { ZoneItem } from './zonesData'

type StateMetric = 'districts' | 'active-zones' | 'users' | 'officers'

type EditStateForm = {
  id: string
  name: string
  code: string
  capital: string
  adminName: string
  adminEmail: string
  adminPhone: string
  totalDistricts: number
  keyDistricts: string
  totalUsers: number
  status: 'Active' | 'Inactive'
  region: string
}

const emptyEditStateForm: EditStateForm = {
  id: '',
  name: '',
  code: '',
  capital: '',
  adminName: '',
  adminEmail: '',
  adminPhone: '',
  totalDistricts: 0,
  keyDistricts: '',
  totalUsers: 0,
  status: 'Active',
  region: '',
}

const buildEditStateForm = (item: StateItem): EditStateForm => ({
  id: item.id,
  name: item.name,
  code: item.code,
  capital: item.capital ?? '',
  adminName: item.admin?.name ?? '',
  adminEmail: item.admin?.email ?? '',
  adminPhone: item.admin?.phone ?? '',
  totalDistricts: item.totalDistricts,
  keyDistricts: item.keyDistricts?.join(', ') ?? '',
  totalUsers: item.totalUsers,
  status: item.status,
  region: item.region ?? '',
})

type StatesPageProps = {
  states: StateItem[]
  cities: CityItem[]
  zones: ZoneItem[]
  setStates: React.Dispatch<React.SetStateAction<StateItem[]>>
  onBack?: () => void
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusFilterChange: (filter: 'all' | 'active' | 'inactive') => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  initialSearchQuery?: string
  initialSelectedState?: string
}

export default function StatesPage({
  states,
  cities,
  zones,
  setStates,
  onBack,
  statusFilter,
  onStatusFilterChange,
  isAddModalOpen,
  setIsAddModalOpen,
  initialSearchQuery,
  initialSelectedState,
}: StatesPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? '')
  const [stateFilter, setStateFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<StateMetric | null>(null)

  // Selected State for viewing details
  const [viewState, setViewState] = useState<StateItem | null>(() => {
    if (!initialSelectedState) return null
    return states.find((s) => s.name.toLowerCase() === initialSelectedState.toLowerCase()) ?? null
  })
  const [metricView, setMetricView] = useState<StateMetricView | null>(null)
  const [editState, setEditState] = useState<StateItem | null>(null)

  // Booking filters inside the selected State details modal
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingDistrictFilter, setBookingDistrictFilter] = useState('all')
  const [bookingZoneFilter, setBookingZoneFilter] = useState('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | BookingStatus>('all')
  const [bookingDateFilter, setBookingDateFilter] = useState('')

  // Selected Booking for viewing full booking details modal
  const [selectedBooking, setSelectedBooking] = useState<StateBooking | null>(null)

  // Add State form state
  const [addForm, setAddForm] = useState({
    name: '',
    code: '',
    capital: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    totalDistricts: 20,
    keyDistricts: '',
    totalUsers: 150,
    status: 'Active' as 'Active' | 'Inactive',
    region: '',
  })

  // Edit State form state
  const [editForm, setEditForm] = useState<EditStateForm>(emptyEditStateForm)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Alphabetical state options for the state selection dropdown
  const stateOptions = useMemo(() => [...states].sort((a, b) => a.name.localeCompare(b.name)), [states])
  const cityOptions = useMemo(
    () => cities
      .filter((city) => stateFilter === 'all' || city.stateId === stateFilter)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [cities, stateFilter],
  )
  const zoneOptions = useMemo(
    () => zones
      .filter((zone) => {
        if (stateFilter !== 'all' && zone.stateName !== states.find((state) => state.id === stateFilter)?.name) return false
        if (cityFilter !== 'all' && zone.cityId !== cityFilter) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
    [zones, states, stateFilter, cityFilter],
  )

  // Filtered states list for the main page
  const filteredStates = useMemo(() => {
    return states.filter((st) => {
      // State selection filter
      if (stateFilter !== 'all' && st.id !== stateFilter) return false
      if (cityFilter !== 'all' && !cities.some((city) => city.id === cityFilter && city.stateId === st.id)) return false
      if (zoneFilter !== 'all' && !zones.some((zone) => zone.id === zoneFilter && zone.stateName === st.name)) return false

      // Status filter
      if (statusFilter === 'active' && st.status !== 'Active') return false
      if (statusFilter === 'inactive' && st.status !== 'Inactive') return false

      // Search filter
      if (!searchQuery.trim()) return true
      const query = searchQuery.trim().toLowerCase()
      const matchName = st.name.toLowerCase().includes(query)
      const matchCode = st.code.toLowerCase().includes(query)
      const matchAdmin = st.admin?.name.toLowerCase().includes(query) || st.admin?.email.toLowerCase().includes(query)
      const matchCapital = st.capital?.toLowerCase().includes(query)

      return matchName || matchCode || matchAdmin || matchCapital
    })
  }, [states, cities, zones, stateFilter, cityFilter, zoneFilter, statusFilter, searchQuery])

  // Aggregate stats for the main page
  const activeCount = useMemo(() => states.filter((s) => s.status === 'Active').length, [states])
  const inactiveCount = useMemo(() => states.filter((s) => s.status === 'Inactive').length, [states])
  const totalDistrictsCount = useMemo(() => states.reduce((sum, s) => sum + s.totalDistricts, 0), [states])
  const totalZonesCount = useMemo(() => zones.filter((zone) => zone.status === 'Active').length, [zones])
  const totalUsersCount = useMemo(() => states.reduce((sum, s) => sum + s.totalUsers, 0), [states])
  const totalOfficersCount = useMemo(
    () => states.reduce((sum, state) => sum + (state.userBreakdown?.fieldOfficers ?? 0), 0),
    [states],
  )
  const selectedMetricRows = useMemo(() => {
    if (!selectedMetric) return []

    return states
      .map((state) => ({
        state,
        value: selectedMetric === 'districts'
          ? state.totalDistricts
          : selectedMetric === 'active-zones'
            ? zones.filter((zone) => zone.status === 'Active' && zone.stateName === state.name).length
            : selectedMetric === 'users'
              ? state.totalUsers
              : state.userBreakdown?.fieldOfficers ?? 0,
      }))
      .sort((a, b) => b.value - a.value || a.state.name.localeCompare(b.state.name))
  }, [selectedMetric, states, zones])

  // Zone options for the selected state
  const stateZoneOptions = useMemo(() => {
    if (!viewState || !viewState.bookings) return []
    const zones = Array.from(new Set(viewState.bookings.map((bk) => bk.zone).filter(Boolean)))
    return zones.sort()
  }, [viewState])

  // Filtered bookings for the selected state
  const filteredStateBookings = useMemo(() => {
    if (!viewState || !viewState.bookings) return []
    return viewState.bookings.filter((bk) => {
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
  }, [viewState, bookingSearch, bookingZoneFilter, bookingDistrictFilter, bookingStatusFilter, bookingDateFilter])

  // Unique list of districts for the selected state's district filter dropdown
  const stateDistrictOptions = useMemo(() => {
    if (!viewState) return []
    const districtSet = new Set<string>()
    if (viewState.keyDistricts) {
      viewState.keyDistricts.forEach((d) => districtSet.add(d))
    }
    if (viewState.bookings) {
      viewState.bookings.forEach((bk) => districtSet.add(bk.district))
    }
    return Array.from(districtSet).sort()
  }, [viewState])

  // Open state details and reset sub-filters
  const handleOpenStateDetails = (st: StateItem) => {
    setViewState(st)
    setMetricView(null)
    setBookingSearch('')
    setBookingDistrictFilter('all')
    setBookingStatusFilter('all')
    setBookingDateFilter('')
    setSelectedBooking(null)
  }

  const exitStateDetails = () => {
    setMetricView(null)
    setViewState(null)
    setSelectedBooking(null)
  }

  // Toggle status handler
  const handleToggleStatus = (stateId: string) => {
    setStates((prev) =>
      prev.map((s) => {
        if (s.id === stateId) {
          const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active'
          const updatedActivity: StateActivity = {
            id: `act-toggle-${Date.now()}`,
            action: `State status changed to ${nextStatus}`,
            actor: 'Super Admin',
            timestamp: 'Just now',
            tone: nextStatus === 'Active' ? 'green' : 'orange',
          }
          const updated = {
            ...s,
            status: nextStatus as 'Active' | 'Inactive',
            recentActivity: [updatedActivity, ...s.recentActivity],
          }
          if (viewState?.id === stateId) setViewState(updated)
          showToast(`${s.name} is now ${nextStatus}.`)
          return updated
        }
        return s
      }),
    )
  }

  // Open Edit modal
  const openEditModal = (item: StateItem) => {
    setEditForm(buildEditStateForm(item))
    setEditState(item)
  }

  // Submit Edit form
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!editForm.name.trim() || !editForm.code.trim()) {
      showToast('State name and code are required.')
      return
    }

    setStates((prev) =>
      prev.map((s) => {
        if (s.id === editForm.id) {
          const hasAdmin = Boolean(editForm.adminName.trim())
          const keyDistrictsList = editForm.keyDistricts
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean)

          const updated: StateItem = {
            ...s,
            name: editForm.name.trim(),
            code: editForm.code.trim().toUpperCase(),
            capital: editForm.capital.trim() || undefined,
            region: editForm.region.trim() || undefined,
            totalDistricts: Number(editForm.totalDistricts) || 0,
            keyDistricts: keyDistrictsList.length ? keyDistrictsList : s.keyDistricts,
            totalUsers: Number(editForm.totalUsers) || 0,
            status: editForm.status,
            admin: hasAdmin
              ? {
                  name: editForm.adminName.trim(),
                  email: editForm.adminEmail.trim() || `${editForm.code.toLowerCase()}.admin@fieldwork.in`,
                  phone: editForm.adminPhone.trim() || '+91 98000 00000',
                  assignedDate: s.admin?.assignedDate ?? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                }
              : null,
            recentActivity: [
              {
                id: `act-edit-${Date.now()}`,
                action: 'State details updated by Super Admin',
                actor: 'Super Admin',
                timestamp: 'Just now',
                tone: 'blue',
              },
              ...s.recentActivity,
            ],
          }
          if (viewState?.id === s.id) setViewState(updated)
          return updated
        }
        return s
      }),
    )

    showToast(`State "${editForm.name}" updated successfully.`)
    setEditState(null)
  }

  // Submit Add State form
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!addForm.name.trim() || !addForm.code.trim()) {
      showToast('Please enter both State Name and State Code.')
      return
    }

    const codeUpper = addForm.code.trim().toUpperCase()
    if (states.some((s) => s.code.toUpperCase() === codeUpper)) {
      showToast(`A state with code "${codeUpper}" already exists.`)
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

    const newState: StateItem = {
      id: `state-${codeUpper.toLowerCase()}-${Date.now()}`,
      name: addForm.name.trim(),
      code: codeUpper,
      capital: addForm.capital.trim() || undefined,
      region: addForm.region.trim() || 'Regional Operating Corridor',
      totalDistricts: Number(addForm.totalDistricts) || 1,
      totalZones: 4,
      keyDistricts: keyDistrictsList.length ? keyDistrictsList : ['Central District', 'Industrial Corridor'],
      totalUsers: Number(addForm.totalUsers) || 50,
      userBreakdown: {
        cityAdmins: 2,
        zoneAdmins: 4,
        fieldOfficers: 14,
        operators: Math.max(0, (Number(addForm.totalUsers) || 50) - 20),
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
        total: 15,
        pending: 2,
        confirmed: 3,
        completed: 10,
        cancelled: 0,
      },
      recentActivity: [
        {
          id: `act-add-${Date.now()}`,
          action: 'State newly launched and added to national platform',
          actor: 'Super Admin',
          timestamp: 'Just now',
          tone: 'green',
        },
      ],
      bookings: [
        {
          id: `BK-${codeUpper}-1001`,
          customer: 'Regional Infra Corp',
          customerPhone: '+91 98001 22334',
          customerEmail: 'projects@regionalinfra.in',
          bookingType: 'JCB 3DX Backhoe Loader',
          zone: 'Zone 1',
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

    setStates((prev) => [newState, ...prev])
    showToast(`State "${newState.name} (${newState.code})" created successfully!`)
    setIsAddModalOpen(false)
    setAddForm({
      name: '',
      code: '',
      capital: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      totalDistricts: 20,
      keyDistricts: '',
      totalUsers: 150,
      status: 'Active',
      region: '',
    })
  }

  return (
    <div className="states-page">
      <style>{statesPageStyles}</style>
      <style>{`
        .states-toolbar-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .states-state-select {
          min-width: 230px;
          cursor: pointer;
        }

        .states-clear-btn {
          border: 0;
          background: transparent;
          color: var(--brand-orange);
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          padding: 6px 4px;
        }

        .states-clear-btn:hover {
          text-decoration: underline;
        }

        .states-page {
          width: 100%;
          max-width: 100%;
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

        @media (min-width: 1100px) {
          .states-page .states-table {
            min-width: 0;
            table-layout: fixed;
          }

          .states-page .states-table th,
          .states-page .states-table td {
            padding-right: clamp(8px, 0.8vw, 14px);
            padding-left: clamp(8px, 0.8vw, 14px);
          }

          .states-page .states-table th:nth-child(1) { width: 18%; }
          .states-page .states-table th:nth-child(2) { width: 9%; }
          .states-page .states-table th:nth-child(3) { width: 20%; }
          .states-page .states-table th:nth-child(4) { width: 10%; }
          .states-page .states-table th:nth-child(5) { width: 10%; }
          .states-page .states-table th:nth-child(6) { width: 9%; }
          .states-page .states-table th:nth-child(7) { width: 12%; }
          .states-page .states-table th:nth-child(8) { width: 12%; }

          .states-page .state-name-cell {
            min-width: 0;
            gap: 8px;
          }

          .states-page .state-name-info,
          .states-page .admin-pill {
            min-width: 0;
            overflow-wrap: anywhere;
          }

          .states-page .table-actions-cell {
            gap: 4px;
          }

          .states-page .action-btn.icon-action {
            flex: 0 0 30px;
            width: 30px;
            height: 30px;
          }
        }

        .states-header {
          align-items: center;
        }

        .states-dashboard-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 6px;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--brand-orange);
          font: inherit;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
        }
        .states-dashboard-back:hover { color: #c94310; text-decoration: underline; }
        .states-dashboard-back:focus-visible { outline: 3px solid rgba(255,107,44,0.4); outline-offset: 4px; }

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

        @media (max-width: 900px) {
          .states-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .states-header-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>

      {!viewState && (
        <header className="states-header">
          <div className="states-header-copy">
            {onBack && (
              <button type="button" className="states-dashboard-back" onClick={onBack}>
                <span aria-hidden="true">←</span> Dashboard overview
              </button>
            )}
            <h2>States & Jurisdictions</h2>
          </div>

          <div className="states-header-actions">
            <button type="button" className="btn-primary geo-add-action" onClick={() => setIsAddModalOpen(true)}>
              <span>+</span> Add State
            </button>
          </div>
        </header>
      )}

      {!viewState && (
        <>
      {/* Aggregate Stats Bar */}
      <section className="states-stats-grid" aria-label="States summary statistics">
        <button
          type="button"
          className={`states-stat-card interactive ${statusFilter === 'all' ? 'selected' : ''}`}
          aria-pressed={statusFilter === 'all'}
          onClick={() => onStatusFilterChange('all')}
        >
          <div className="states-stat-info">
            <span className="states-stat-label">Total States</span>
            <span className="states-stat-value">{states.length}</span>
          </div>
          <span className="states-stat-badge slate">National Hub</span>
        </button>

        <button
          type="button"
          className={`states-stat-card interactive ${statusFilter === 'active' ? 'selected' : ''}`}
          aria-pressed={statusFilter === 'active'}
          onClick={() => onStatusFilterChange('active')}
        >
          <div className="states-stat-info">
            <span className="states-stat-label">Active States</span>
            <span className="states-stat-value">{activeCount}</span>
          </div>
          <span className="states-stat-badge green">{Math.round((activeCount / (states.length || 1)) * 100)}% Live</span>
        </button>

        <button
          type="button"
          className={`states-stat-card interactive ${statusFilter === 'inactive' ? 'selected' : ''}`}
          aria-pressed={statusFilter === 'inactive'}
          onClick={() => onStatusFilterChange('inactive')}
        >
          <div className="states-stat-info">
            <span className="states-stat-label">Inactive States</span>
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
          <span className="states-stat-badge blue">Monitored</span>
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
            <span className="states-stat-label">Users</span>
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
      <section className="states-toolbar" aria-label="States filter and search controls">
        <div className="states-search-box">
          <input
            type="text"
            placeholder="Search by state name, code, admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search states"
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

        <div className="states-toolbar-filters">
          <select
            className="bookings-filter-select states-state-select"
            aria-label="Select a state"
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value)
              setCityFilter('all')
              setZoneFilter('all')
            }}
          >
            <option value="all">All states ({states.length})</option>
            {stateOptions.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.code}) · {st.status}
              </option>
            ))}
          </select>
          <select
            className="bookings-filter-select states-state-select"
            aria-label="Filter by city"
            value={cityFilter}
            onChange={(event) => {
              setCityFilter(event.target.value)
              setZoneFilter('all')
            }}
          >
            <option value="all">All cities ({cityOptions.length})</option>
            {cityOptions.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} · {city.stateName}
              </option>
            ))}
          </select>
          <select
            className="bookings-filter-select states-state-select"
            aria-label="Filter by zone"
            value={zoneFilter}
            onChange={(event) => setZoneFilter(event.target.value)}
          >
            <option value="all">All zones ({zoneOptions.length})</option>
            {zoneOptions.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} · {zone.cityName}
              </option>
            ))}
          </select>
          {stateFilter !== 'all' && (
            <>
              <button
                type="button"
                className="action-btn view icon-action"
                onClick={() => {
                  const selected = states.find((st) => st.id === stateFilter)
                  if (selected) handleOpenStateDetails(selected)
                }}
                aria-label={`View details for ${states.find((st) => st.id === stateFilter)?.name ?? 'selected state'}`}
                title="View state details"
              >
                👁️
              </button>
            </>
          )}
          {(stateFilter !== 'all' || cityFilter !== 'all' || zoneFilter !== 'all') && (
            <button
              type="button"
              className="states-clear-btn"
              onClick={() => {
                setStateFilter('all')
                setCityFilter('all')
                setZoneFilter('all')
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="states-filter-pills" role="tablist" aria-label="Filter by status">
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('all')}
          >
            All States <span className="filter-pill-count">{states.length}</span>
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

      {/* States Table Card */}
      <section className="states-table-card" aria-label="States table list">
        <div className="states-table-wrap">
          <table className="states-table">
            <thead>
              <tr>
                <th>State Name</th>
                <th>State Code</th>
                <th>State Admin</th>
                <th>Total Districts</th>
                <th>Total Users</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStates.length > 0 ? (
                filteredStates.map((st) => (
                  <tr
                    key={st.id}
                    className="states-table-row"
                    onClick={() => handleOpenStateDetails(st)}
                    title={`Click to view ${st.name} state details and bookings`}
                  >
                    <td>
                      <div className="state-name-cell">
                        <div className="state-avatar-badge">{st.code}</div>
                        <div className="state-name-info">
                          <strong>{st.name}</strong>
                          <span>{st.capital ? `HQ: ${st.capital}` : st.region ?? 'India Corridor'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="state-code-badge">{st.code}</span>
                    </td>
                    <td>
                      {st.admin ? (
                        <div className="admin-pill">
                          <strong>{st.admin.name}</strong>
                          <span>{st.admin.email}</span>
                        </div>
                      ) : (
                        <span className="unassigned-badge">⚠ Unassigned</span>
                      )}
                    </td>
                    <td>
                      <strong>{st.totalDistricts}</strong> <span style={{ color: '#64748b' }}>districts</span>
                    </td>
                    <td>
                      <strong>{st.totalUsers.toLocaleString()}</strong> <span style={{ color: '#64748b' }}>users</span>
                    </td>
                    <td>
                      <span className={`status-pill ${st.status.toLowerCase()}`}>
                        <span className="status-dot" />
                        {st.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {st.createdDate}
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="action-btn view icon-action"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenStateDetails(st)
                          }}
                          aria-label={`View details for ${st.name}`}
                          title="View state"
                        >
                          👁️
                        </button>
                        <button
                          type="button"
                          className="action-btn edit icon-action"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(st)
                          }}
                          aria-label={`Edit ${st.name}`}
                          title="Edit state"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={`action-btn icon-action ${st.status === 'Active' ? 'toggle-deactivate' : 'toggle-activate'}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(st.id)
                          }}
                          aria-label={`${st.status === 'Active' ? 'Deactivate' : 'Activate'} ${st.name}`}
                          title={st.status === 'Active' ? 'Deactivate state' : 'Activate state'}
                        >
                          {st.status === 'Active' ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-states-panel">
                      <div className="empty-icon">📍</div>
                      <h4>No states found</h4>
                      <p>
                        {stateFilter !== 'all'
                          ? 'No states match the selected state combined with the current search or status filters.'
                          : searchQuery
                            ? `No states matching "${searchQuery}". Try clearing search or changing filters.`
                            : 'No states are available under this status filter.'}
                      </p>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setSearchQuery('')
                          setStateFilter('all')
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

      {/* STATE METRIC PAGE (OPENED FROM THE STATE KPI CARDS) */}
      {viewState && metricView && (
        <StateMetricPage
          state={viewState}
          view={metricView}
          cities={cities}
          zones={zones}
          onChangeView={setMetricView}
          onBack={() => setMetricView(null)}
          onExitState={exitStateDetails}
          onViewBooking={setSelectedBooking}
        />
      )}

      {/* STATE DETAILS PAGE (DYNAMICALLY DRIVEN BY SELECTED STATE) */}
      {viewState && !metricView && (
        <>
          <header className="states-header" aria-labelledby="view-state-title">
            <div className="states-header-copy">
              <div className="states-breadcrumb">
                <button type="button" onClick={exitStateDetails}>
                  States
                </button>
                <span>›</span>
                <span>{viewState.name}</span>
              </div>
              <h2 id="view-state-title">{viewState.name} — State Overview</h2>
              <div className="states-header-meta">
                <span className="state-code-badge">{viewState.code}</span>
                <span className={`status-pill ${viewState.status.toLowerCase()}`}>
                  <span className="status-dot" />
                  {viewState.status}
                </span>
                <span className="states-created-date">
                  Created: {viewState.createdDate}
                </span>
              </div>
            </div>
            <div className="states-header-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleToggleStatus(viewState.id)}
              >
                <span>{viewState.status === 'Active' ? '🚫' : '✅'}</span>
                <span>{viewState.status === 'Active' ? 'Deactivate State' : 'Activate State'}</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const target = viewState
                  openEditModal(target)
                }}
              >
                <span>✏️</span>
                <span>Edit State</span>
              </button>
              <button type="button" className="btn-primary" onClick={exitStateDetails}>
                <span>←</span>
                <span>Back to States</span>
              </button>
            </div>
          </header>

          <section
            style={{ display: 'grid', gap: 16 }}
            aria-labelledby="view-state-title"
          >
            {/* 1. STATE BOOKINGS & DISTRICT METRICS SUMMARY */}
            <div className="view-section" style={{ background: '#fff' }}>
              <h4 className="view-section-title">
                <span>State Performance & Booking Summary</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Real-time Territorial Metrics</span>
              </h4>

              <div className="state-bookings-kpi-grid">
                <button
                  type="button"
                  className="state-kpi-tile primary interactive"
                  onClick={() => setMetricView('bookings')}
                  title={`Open all bookings for ${viewState.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.total.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Total Bookings</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile amber interactive"
                  onClick={() => setMetricView('pending')}
                  title={`Open pending bookings for ${viewState.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.pending.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Pending</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile blue interactive"
                  onClick={() => setMetricView('confirmed')}
                  title={`Open confirmed bookings for ${viewState.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.confirmed.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Confirmed</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile green interactive"
                  onClick={() => setMetricView('completed')}
                  title={`Open completed bookings for ${viewState.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.completed.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Completed</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile red interactive"
                  onClick={() => setMetricView('cancelled')}
                  title={`Open cancelled bookings for ${viewState.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.cancelled.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Cancelled</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile interactive"
                  onClick={() => setMetricView('users')}
                  title={`Open user distribution for ${viewState.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewState.totalUsers.toLocaleString()}
                  </span>
                  <span className="state-kpi-tile-label">Total Users</span>
                </button>
                <button
                  type="button"
                  className="state-kpi-tile interactive"
                  onClick={() => setMetricView('districts')}
                  title={`Open district coverage for ${viewState.name}`}
                >
                  <span className="state-kpi-tile-value">
                    {viewState.totalDistricts}
                  </span>
                  <span className="state-kpi-tile-label">Districts</span>
                </button>
              </div>
            </div>

            {/* 2. ASSIGNED STATE ADMIN */}
            <div className="view-section">
              <h4 className="view-section-title">
                <span>State Administrator Details</span>
                {viewState.admin && <span style={{ color: '#078653' }}>● Active Jurisdictional Scope</span>}
              </h4>

              {viewState.admin ? (
                <div className="admin-card-view">
                  <div className="admin-view-left">
                    <div className="admin-avatar-lg">
                      {viewState.admin.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="admin-details-text">
                      <strong>{viewState.admin.name}</strong>
                      <span>Work Email: {viewState.admin.email}</span>
                      <span>Contact: {viewState.admin.phone ?? 'No phone provided'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="state-code-badge" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                      Assigned Scope: State · {viewState.name}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                      Assigned on {viewState.admin.assignedDate ?? 'Launch'}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '14px', background: '#fff1f2', borderRadius: '10px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: '#9f1239', fontSize: '0.88rem' }}>No State Admin Assigned</strong>
                    <p style={{ margin: '2px 0 0', color: '#be123c', fontSize: '0.78rem' }}>
                      This state is operating without a dedicated primary administrator.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.76rem', padding: '6px 12px' }}
                    onClick={() => {
                      const target = viewState
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
                <span>Recent & Active Bookings in {viewState.name}</span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Showing {filteredStateBookings.length} of {viewState.bookings?.length ?? 0} bookings
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
                  aria-label="Search bookings in state"
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
                  <option value="all">All Districts ({viewState.totalDistricts})</option>
                  {stateDistrictOptions.map((dist) => (
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
                  {stateZoneOptions.map((zone) => (
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
                    {filteredStateBookings.length > 0 ? (
                      filteredStateBookings.map((bk) => (
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
                              className="action-btn view icon-action"
                              onClick={() => setSelectedBooking(bk)}
                              aria-label={`View booking ${bk.id}`}
                              title="View booking details"
                            >
                              👁️
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                          <div style={{ display: 'grid', gap: '6px', placeItems: 'center' }}>
                            <span>📋</span>
                            <strong>No bookings found for {viewState.name}</strong>
                            <span style={{ fontSize: '0.76rem' }}>
                              {bookingSearch || bookingZoneFilter !== 'all' || bookingDistrictFilter !== 'all' || bookingStatusFilter !== 'all' || bookingDateFilter
                                ? 'No bookings match your selected search or filters.'
                                : 'No bookings recorded for this state yet.'}
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

      {/* VIEW BOOKING DETAILS MODAL */}
      {selectedMetric && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedMetric(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="state-metric-title"
        >
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <div>
                  <h3 id="state-metric-title">
                    {{
                      districts: 'Districts by state',
                      'active-zones': 'Active zones by state',
                      users: 'Users by state',
                      officers: 'Field officers by state',
                    }[selectedMetric]}
                  </h3>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    National total: {{
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
                    {selectedMetricRows.map(({ state, value }) => (
                      <tr key={state.id}>
                        <td><strong>{state.name}</strong> <span style={{ color: '#64748b' }}>({state.code})</span></td>
                        <td>{value.toLocaleString()}</td>
                        <td>
                          <button
                            type="button"
                            className="action-btn view"
                            onClick={() => {
                              handleOpenStateDetails(state)
                              setSelectedMetric(null)
                            }}
                          >
                            View state
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
                    <span className="detail-label">District</span>
                    <span className="detail-value">📍 {selectedBooking.district}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Jurisdiction</span>
                    <span className="detail-value">{viewState?.name}</span>
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

      {/* EDIT STATE MODAL */}
      {editState && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditState(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-state-title"
        >
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <h3 id="edit-state-title">Edit State — {editState.name}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setEditState(null)} aria-label="Close edit form">
                ×
              </button>
            </header>

            <form onSubmit={handleEditSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>State Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>

                  <div className="form-field">
                    <label>State Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={editForm.code}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. MH"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Capital / Regional Hub</label>
                    <input
                      type="text"
                      value={editForm.capital}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, capital: e.target.value }))}
                      placeholder="e.g. Mumbai"
                    />
                  </div>

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
                </div>

                <div className="form-field">
                  <label>Geographic Corridor / Region</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, region: e.target.value }))}
                    placeholder="e.g. Western Logistics Corridor"
                  />
                </div>

                <div style={{ borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Assigned State Admin</h4>
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
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Districts & Workforce</h4>
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
                      <label>Total Users & Officers</label>
                      <input
                        type="number"
                        min={0}
                        value={editForm.totalUsers}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, totalUsers: parseInt(e.target.value, 10) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: '12px' }}>
                    <label>Key Districts (comma-separated)</label>
                    <input
                      type="text"
                      value={editForm.keyDistricts}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, keyDistricts: e.target.value }))}
                      placeholder="e.g. Pune, Mumbai, Nagpur, Thane"
                    />
                    <span className="form-hint">Separate district names with commas.</span>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditState(null)}>
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

      {/* ADD STATE MODAL */}
      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-state-title"
        >
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <h3 id="add-state-title">Add New State</h3>
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
                    <label>State Name *</label>
                    <input
                      type="text"
                      required
                      value={addForm.name}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Madhya Pradesh"
                    />
                  </div>

                  <div className="form-field">
                    <label>State Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={addForm.code}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. MP"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Capital / Regional Hub</label>
                    <input
                      type="text"
                      value={addForm.capital}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, capital: e.target.value }))}
                      placeholder="e.g. Bhopal"
                    />
                  </div>

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

                <div style={{ borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Assign State Admin (Optional)</h4>
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
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Districts & Workforce</h4>
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
                      <label>Estimated Users & Officers</label>
                      <input
                        type="number"
                        min={0}
                        value={addForm.totalUsers}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, totalUsers: parseInt(e.target.value, 10) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: '12px' }}>
                    <label>Key Districts (comma-separated)</label>
                    <input
                      type="text"
                      value={addForm.keyDistricts}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, keyDistricts: e.target.value }))}
                      placeholder="e.g. Indore, Bhopal, Jabalpur, Gwalior"
                    />
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary geo-add-action">
                  Add State
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
