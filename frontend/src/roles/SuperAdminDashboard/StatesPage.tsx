import { useState, useMemo, useEffect, type FormEvent } from 'react'
import { statesPageStyles } from './pageStyles'
import type { BookingStatus, StateActivity, StateBooking, StateItem } from './statesData'

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
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Selected State for viewing details
  const [viewState, setViewState] = useState<StateItem | null>(null)
  const [editState, setEditState] = useState<StateItem | null>(null)

  useEffect(() => {
    if (initialSelectedState) {
      const found = states.find((s) => s.name.toLowerCase() === initialSelectedState.toLowerCase())
      if (found) {
        setViewState(found)
      }
    }
  }, [initialSelectedState, states])

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

  // Filtered states list for the main page
  const filteredStates = useMemo(() => {
    return states.filter((st) => {
      // State selection filter
      if (stateFilter !== 'all' && st.id !== stateFilter) return false

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
  }, [states, stateFilter, statusFilter, searchQuery])

  // Aggregate stats for the main page
  const activeCount = useMemo(() => states.filter((s) => s.status === 'Active').length, [states])
  const inactiveCount = useMemo(() => states.filter((s) => s.status === 'Inactive').length, [states])
  const totalDistrictsCount = useMemo(() => states.reduce((sum, s) => sum + s.totalDistricts, 0), [states])
  const totalZonesCount = useMemo(() => states.reduce((sum, s) => sum + (s.totalZones ?? 0), 0), [states])
  const totalUsersCount = useMemo(() => states.reduce((sum, s) => sum + s.totalUsers, 0), [states])

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
    setBookingSearch('')
    setBookingDistrictFilter('all')
    setBookingStatusFilter('all')
    setBookingDateFilter('')
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
          color: #ef4a12;
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          padding: 6px 4px;
        }

        .states-clear-btn:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Breadcrumb & Header */}
      <header className="states-header">
        <div className="states-header-copy">
          <div className="states-breadcrumb">
            <button type="button" onClick={onBack}>Dashboard</button>
            <span>/</span>
            <span>Geography</span>
            <span>/</span>
            <strong>States Management</strong>
          </div>
          <h2>States & Jurisdictions</h2>
          <p>
            Configure states, assign dedicated State Admins, monitor district coverage, officers, and operational activity.
          </p>
        </div>

        <div className="states-header-actions">
          {onBack && (
            <button type="button" className="btn-secondary" onClick={onBack}>
              ← Back to Overview
            </button>
          )}
          <button type="button" className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <span>+</span> Add State
          </button>
        </div>
      </header>

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

        <div className="states-stat-card">
          <div className="states-stat-info">
            <span className="states-stat-label">Total Districts</span>
            <span className="states-stat-value">{totalDistrictsCount}</span>
          </div>
          <span className="states-stat-badge blue">Monitored</span>
        </div>

        <div className="states-stat-card">
          <div className="states-stat-info">
            <span className="states-stat-label">Active Zones</span>
            <span className="states-stat-value">{totalZonesCount}</span>
          </div>
          <span className="states-stat-badge blue">Zonal Coverage</span>
        </div>

        <div className="states-stat-card">
          <div className="states-stat-info">
            <span className="states-stat-label">Users & Officers</span>
            <span className="states-stat-value">{totalUsersCount.toLocaleString()}</span>
          </div>
          <span className="states-stat-badge orange">Staff & Fleet</span>
        </div>
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
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="all">All states ({states.length})</option>
            {stateOptions.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.code}) · {st.status}
              </option>
            ))}
          </select>
          {stateFilter !== 'all' && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const selected = states.find((st) => st.id === stateFilter)
                  if (selected) handleOpenStateDetails(selected)
                }}
              >
                View details
              </button>
              <button type="button" className="states-clear-btn" onClick={() => setStateFilter('all')}>
                Clear
              </button>
            </>
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
                          className="action-btn view"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenStateDetails(st)
                          }}
                          aria-label={`View details for ${st.name}`}
                        >
                          View State
                        </button>
                        <button
                          type="button"
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(st)
                          }}
                          aria-label={`Edit ${st.name}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`action-btn ${st.status === 'Active' ? 'toggle-deactivate' : 'toggle-activate'}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(st.id)
                          }}
                          aria-label={`${st.status === 'Active' ? 'Deactivate' : 'Activate'} ${st.name}`}
                        >
                          {st.status === 'Active' ? 'Deactivate' : 'Activate'}
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

      {/* STATE DETAILS PAGE (DYNAMICALLY DRIVEN BY SELECTED STATE) */}
      {viewState && (
        <section
          style={{ display: 'grid', gap: 16, marginTop: 16 }}
          aria-labelledby="view-state-title"
        >
          <div className="states-header">
            <div className="states-header-copy">
              <div className="states-breadcrumb">
                <button type="button" onClick={() => setViewState(null)}>
                  States
                </button>
                <span>›</span>
                <span>{viewState.name}</span>
              </div>
              <h2 id="view-state-title">{viewState.name} — State Overview</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                <span className="state-code-badge">{viewState.code}</span>
                <span className={`status-pill ${viewState.status.toLowerCase()}`}>
                  <span className="status-dot" />
                  {viewState.status}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
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
                {viewState.status === 'Active' ? 'Deactivate State' : 'Activate State'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const target = viewState
                  openEditModal(target)
                }}
              >
                Edit State
              </button>
              <button type="button" className="btn-primary" onClick={() => setViewState(null)}>
                Back to States
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {/* 1. STATE BOOKINGS & DISTRICT METRICS SUMMARY */}
            <div className="view-section" style={{ background: '#fff' }}>
              <h4 className="view-section-title">
                <span>State Performance & Booking Summary</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Real-time Territorial Metrics</span>
              </h4>

              <div className="state-bookings-kpi-grid">
                <div className="state-kpi-tile primary">
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.total.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Total Bookings</span>
                </div>
                <div className="state-kpi-tile amber">
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.pending.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Pending</span>
                </div>
                <div className="state-kpi-tile blue">
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.confirmed.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Confirmed</span>
                </div>
                <div className="state-kpi-tile green">
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.completed.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Completed</span>
                </div>
                <div className="state-kpi-tile red">
                  <span className="state-kpi-tile-value">
                    {viewState.bookingSummary?.cancelled.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Cancelled</span>
                </div>
                <div className="state-kpi-tile">
                  <span className="state-kpi-tile-value">
                    {viewState.totalUsers.toLocaleString()}
                  </span>
                  <span className="state-kpi-tile-label">Total Users</span>
                </div>
                <div className="state-kpi-tile">
                  <span className="state-kpi-tile-value">
                    {viewState.totalDistricts}
                  </span>
                  <span className="state-kpi-tile-label">Districts</span>
                </div>
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
          </div>
        </section>
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
                <button type="submit" className="btn-primary">
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
