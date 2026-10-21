import { useState, useMemo, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { statesPageStyles } from './pageStyles'
import type { ZoneItem } from './zonesData'
import { initialCitiesData } from './citiesData'
import type { BookingStatus, StateActivity, StateBooking } from './statesData'

type ZonesPageProps = {
  zones: ZoneItem[]
  setZones: Dispatch<SetStateAction<ZoneItem[]>>
  onBack?: () => void
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusFilterChange: (filter: 'all' | 'active' | 'inactive') => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  initialSearchQuery?: string
}

export default function ZonesPage({
  zones,
  setZones,
  onBack,
  statusFilter,
  onStatusFilterChange,
  isAddModalOpen,
  setIsAddModalOpen,
  initialSearchQuery,
}: ZonesPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? '')
  const [stateFilter, setStateFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Selected Zone for viewing details
  const [viewZone, setViewCity] = useState<ZoneItem | null>(null)
  const [editZone, setEditCity] = useState<ZoneItem | null>(null)

  // Booking filters inside the selected Zone details page
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingDistrictFilter, setBookingDistrictFilter] = useState('all')
  const [bookingZoneFilter, setBookingZoneFilter] = useState('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | BookingStatus>('all')
  const [bookingDateFilter, setBookingDateFilter] = useState('')

  // Selected Booking for viewing full booking details modal
  const [selectedBooking, setSelectedBooking] = useState<StateBooking | null>(null)

  // Add Zone form state
  const [addForm, setAddForm] = useState({
    name: '',
    code: '',
    cityName: initialCitiesData[0]?.name ?? '',
    headquarters: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    totalDistricts: 3,
    keyDistricts: '',
    totalUsers: 80,
    status: 'Active' as 'Active' | 'Inactive',
    region: '',
  })

  // Edit Zone form state
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    code: '',
    cityName: '',
    headquarters: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    totalDistricts: 0,
    keyDistricts: '',
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

  // Filtered zones list for the main page
  // State options for the state dropdown (only states that have zones), with zone counts
  const stateOptions = useMemo(() => {
    const counts = new Map<string, number>()
    zones.forEach((zt) => counts.set(zt.stateName, (counts.get(zt.stateName) ?? 0) + 1))
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [zones])

  // City options scoped to the selected state, with zone counts
  const cityOptions = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>()
    zones
      .filter((zt) => stateFilter === 'all' || zt.stateName === stateFilter)
      .forEach((zt) => {
        const entry = counts.get(zt.cityId) ?? { name: zt.cityName, count: 0 }
        entry.count += 1
        counts.set(zt.cityId, entry)
      })
    return [...counts.entries()]
      .map(([id, entry]) => ({ id, name: entry.name, count: entry.count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [zones, stateFilter])

  // Zone options scoped to the selected state and city ("respective zone in a city")
  const zoneOptions = useMemo(() => {
    return zones
      .filter(
        (zt) =>
          (stateFilter === 'all' || zt.stateName === stateFilter) &&
          (cityFilter === 'all' || zt.cityId === cityFilter),
      )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [zones, stateFilter, cityFilter])

  const filteredZones = useMemo(() => {
    return zones.filter((ct) => {
      // State selection filter
      if (stateFilter !== 'all' && ct.stateName !== stateFilter) return false

      // City selection filter
      if (cityFilter !== 'all' && ct.cityId !== cityFilter) return false

      // Zone selection filter
      if (zoneFilter !== 'all' && ct.id !== zoneFilter) return false

      // Status filter
      if (statusFilter === 'active' && ct.status !== 'Active') return false
      if (statusFilter === 'inactive' && ct.status !== 'Inactive') return false

      // Search filter
      if (!searchQuery.trim()) return true
      const query = searchQuery.trim().toLowerCase()
      const matchName = ct.name.toLowerCase().includes(query)
      const matchCode = ct.code.toLowerCase().includes(query)
      const matchState = ct.stateName.toLowerCase().includes(query)
      const matchCity = ct.cityName.toLowerCase().includes(query)
      const matchAdmin = ct.admin?.name.toLowerCase().includes(query) || ct.admin?.email.toLowerCase().includes(query)
      const matchHq = ct.headquarters?.toLowerCase().includes(query)

      return matchName || matchCode || matchState || matchCity || matchAdmin || matchHq
    })
  }, [zones, stateFilter, cityFilter, zoneFilter, statusFilter, searchQuery])

  // Aggregate stats for the main page
  const activeCount = useMemo(() => zones.filter((c) => c.status === 'Active').length, [zones])
  const inactiveCount = useMemo(() => zones.filter((c) => c.status === 'Inactive').length, [zones])
  const citiesCovered = useMemo(() => new Set(zones.map((c) => c.cityId).filter(Boolean)).size, [zones])
  const totalDistrictsCount = useMemo(() => zones.reduce((sum, c) => sum + c.totalDistricts, 0), [zones])
  const totalUsersCount = useMemo(() => zones.reduce((sum, c) => sum + c.totalUsers, 0), [zones])

  // Zone options for the selected zone
  const zoneBookingOptions = useMemo(() => {
    if (!viewZone || !viewZone.bookings) return []
    const zoneNames = Array.from(new Set(viewZone.bookings.map((bk) => bk.zone).filter(Boolean)))
    return zoneNames.sort()
  }, [viewZone])

  // Filtered bookings for the selected zone
  const filteredZoneBookings = useMemo(() => {
    if (!viewZone || !viewZone.bookings) return []
    return viewZone.bookings.filter((bk) => {
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
  }, [viewZone, bookingSearch, bookingZoneFilter, bookingDistrictFilter, bookingStatusFilter, bookingDateFilter])

  // Unique list of districts for the selected zone's district filter dropdown
  const districtOptions = useMemo(() => {
    if (!viewZone) return []
    const districtSet = new Set<string>()
    if (viewZone.keyDistricts) {
      viewZone.keyDistricts.forEach((d) => districtSet.add(d))
    }
    if (viewZone.bookings) {
      viewZone.bookings.forEach((bk) => districtSet.add(bk.district))
    }
    return Array.from(districtSet).sort()
  }, [viewZone])

  // Open zone details and reset sub-filters
  const handleOpenZoneDetails = (ct: ZoneItem) => {
    setViewCity(ct)
    setBookingSearch('')
    setBookingDistrictFilter('all')
    setBookingZoneFilter('all')
    setBookingStatusFilter('all')
    setBookingDateFilter('')
    setSelectedBooking(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Toggle status handler
  const handleToggleStatus = (zone: string) => {
    setZones((prev) =>
      prev.map((c) => {
        if (c.id === zone) {
          const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active'
          const updatedActivity: StateActivity = {
            id: `act-toggle-${Date.now()}`,
            action: `Zone status changed to ${nextStatus}`,
            actor: 'Super Admin',
            timestamp: 'Just now',
            tone: nextStatus === 'Active' ? 'green' : 'orange',
          }
          const updated = {
            ...c,
            status: nextStatus as 'Active' | 'Inactive',
            recentActivity: [updatedActivity, ...c.recentActivity],
          }
          if (viewZone?.id === zone) setViewCity(updated)
          showToast(`${c.name} is now ${nextStatus}.`)
          return updated
        }
        return c
      }),
    )
  }

  // Open Edit modal
  const openEditModal = (item: ZoneItem) => {
    setEditForm({
      id: item.id,
      name: item.name,
      code: item.code,
      cityName: item.cityName,
      headquarters: item.headquarters ?? '',
      adminName: item.admin?.name ?? '',
      adminEmail: item.admin?.email ?? '',
      adminPhone: item.admin?.phone ?? '',
      totalDistricts: item.totalDistricts,
      keyDistricts: item.keyDistricts?.join(', ') ?? '',
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
      showToast('Zone name and code are required.')
      return
    }

    setZones((prev) =>
      prev.map((c) => {
        if (c.id === editForm.id) {
          const hasAdmin = Boolean(editForm.adminName.trim())
          const keyDistrictsList = editForm.keyDistricts
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean)

          const cityMeta = initialCitiesData.find((ct) => ct.name === editForm.cityName)
          const updated: ZoneItem = {
            ...c,
            name: editForm.name.trim(),
            code: editForm.code.trim().toUpperCase(),
            stateName: cityMeta?.stateName ?? c.stateName,
            cityName: editForm.cityName,
            headquarters: editForm.headquarters.trim() || undefined,
            region: editForm.region.trim() || undefined,
            totalDistricts: Number(editForm.totalDistricts) || 0,
            keyDistricts: keyDistrictsList.length ? keyDistrictsList : c.keyDistricts,
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
                action: 'Zone details updated by Super Admin',
                actor: 'Super Admin',
                timestamp: 'Just now',
                tone: 'blue',
              },
              ...c.recentActivity,
            ],
          }
          if (viewZone?.id === c.id) setViewCity(updated)
          return updated
        }
        return c
      }),
    )

    showToast(`Zone "${editForm.name}" updated successfully.`)
    setEditCity(null)
  }

  // Submit Add Zone form
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!addForm.name.trim() || !addForm.code.trim()) {
      showToast('Please enter both Zone Name and Zone Code.')
      return
    }

    const codeUpper = addForm.code.trim().toUpperCase()
    if (zones.some((c) => c.code.toUpperCase() === codeUpper)) {
      showToast(`A zone with code "${codeUpper}" already exists.`)
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
    const cityMeta = initialCitiesData.find((c) => c.name === addForm.cityName)

    const newZone: ZoneItem = {
      id: `zone-${codeUpper.toLowerCase()}-${Date.now()}`,
      name: addForm.name.trim(),
      code: codeUpper,
      cityId: cityMeta?.id ?? '',
      cityName: addForm.cityName,
      stateName: cityMeta?.stateName ?? '',
      headquarters: addForm.headquarters.trim() || undefined,
      region: addForm.region.trim() || 'Municipal Operating Zone',
      totalDistricts: Number(addForm.totalDistricts) || 1,
      keyDistricts: keyDistrictsList.length ? keyDistrictsList : ['Central District'],
      totalUsers: Number(addForm.totalUsers) || 50,
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
          action: 'Zone newly launched and added to the platform',
          actor: 'Super Admin',
          timestamp: 'Just now',
          tone: 'green',
        },
      ],
      bookings: [
        {
          id: `BK-${codeUpper}-1001`,
          customer: 'Zone Infrastructure Corp',
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

    setZones((prev) => [newZone, ...prev])
    showToast(`Zone "${newZone.name} (${newZone.code})" created successfully!`)
    setIsAddModalOpen(false)
    setAddForm({
      name: '',
      code: '',
      cityName: initialCitiesData[0]?.name ?? '',
      headquarters: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      totalDistricts: 3,
      keyDistricts: '',
      totalUsers: 80,
      status: 'Active',
      region: '',
    })
  }

  return (
    <div className="states-page">
      <style>{statesPageStyles}</style>
      <style>{`
        .zones-toolbar-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .zones-state-select {
          min-width: 195px;
          cursor: pointer;
        }

        .zones-city-select {
          min-width: 190px;
          cursor: pointer;
        }

        .zones-zone-select {
          min-width: 190px;
          cursor: pointer;
        }

        .zones-clear-btn {
          border: 0;
          background: transparent;
          color: #ef4a12;
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          padding: 6px 4px;
        }

        .zones-clear-btn:hover {
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
            <strong>Zones Management</strong>
          </div>
          <h2>Zones & Jurisdictions</h2>
          <p>
            Manage zone hubs, assign dedicated Zone Admins, monitor zones, districts, officers, and operational activity.
          </p>
        </div>

        <div className="states-header-actions">
          {onBack && (
            <button type="button" className="btn-secondary" onClick={onBack}>
              ← Back to Overview
            </button>
          )}
          <button type="button" className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <span>+</span> Add Zone
          </button>
        </div>
      </header>

      {!viewZone && (
        <>
          {/* Aggregate Stats Bar */}
          <section className="states-stats-grid" aria-label="Zones summary statistics">
            <button
              type="button"
              className={`states-stat-card interactive ${statusFilter === 'all' ? 'selected' : ''}`}
              aria-pressed={statusFilter === 'all'}
              onClick={() => {
                onStatusFilterChange('all')
                setStateFilter('all')
                setCityFilter('all')
                setZoneFilter('all')
                setSearchQuery('')
              }}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Total Zones</span>
                <span className="states-stat-value">{zones.length}</span>
              </div>
              <span className="states-stat-badge slate">Zone Hubs</span>
            </button>

            <button
              type="button"
              className={`states-stat-card interactive ${statusFilter === 'active' ? 'selected' : ''}`}
              aria-pressed={statusFilter === 'active'}
              onClick={() => {
                onStatusFilterChange('active')
                setStateFilter('all')
                setCityFilter('all')
                setZoneFilter('all')
                setSearchQuery('')
              }}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Active Zones</span>
                <span className="states-stat-value">{activeCount}</span>
              </div>
              <span className="states-stat-badge green">{Math.round((activeCount / (zones.length || 1)) * 100)}% Live</span>
            </button>

            <button
              type="button"
              className={`states-stat-card interactive ${statusFilter === 'inactive' ? 'selected' : ''}`}
              aria-pressed={statusFilter === 'inactive'}
              onClick={() => {
                onStatusFilterChange('inactive')
                setStateFilter('all')
                setCityFilter('all')
                setZoneFilter('all')
                setSearchQuery('')
              }}
            >
              <div className="states-stat-info">
                <span className="states-stat-label">Inactive Zones</span>
                <span className="states-stat-value">{inactiveCount}</span>
              </div>
              <span className="states-stat-badge orange">Paused</span>
            </button>

            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Total Districts</span>
                <span className="states-stat-value">{totalDistrictsCount}</span>
              </div>
              <span className="states-stat-badge blue">Coverage</span>
            </div>

            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Cities Covered</span>
                <span className="states-stat-value">{citiesCovered}</span>
              </div>
              <span className="states-stat-badge blue">Linked Hubs</span>
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
          <section className="states-toolbar" aria-label="Zones filter and search controls">
            <div className="states-search-box">
              <input
                type="text"
                placeholder="Search by zone name, code, state, admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search zones"
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

            <div className="zones-toolbar-filters">
              <select
                className="bookings-filter-select zones-state-select"
                aria-label="Filter by state"
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value)
                  setCityFilter('all')
                  setZoneFilter('all')
                }}
              >
                <option value="all">All states ({stateOptions.length})</option>
                {stateOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.name} ({option.count} {option.count === 1 ? 'zone' : 'zones'})
                  </option>
                ))}
              </select>

              <select
                className="bookings-filter-select zones-city-select"
                aria-label="Filter by city"
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value)
                  setZoneFilter('all')
                }}
              >
                <option value="all">
                  {stateFilter === 'all'
                    ? `All cities (${cityOptions.length})`
                    : `All cities in ${stateFilter} (${cityOptions.length})`}
                </option>
                {cityOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.count} {option.count === 1 ? 'zone' : 'zones'})
                  </option>
                ))}
              </select>

              <select
                className="bookings-filter-select zones-zone-select"
                aria-label="Select a zone"
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
              >
                <option value="all">
                  {cityFilter !== 'all'
                    ? `All zones in ${cityOptions.find((option) => option.id === cityFilter)?.name ?? 'city'} (${zoneOptions.length})`
                    : `All zones (${zoneOptions.length})`}
                </option>
                {zoneOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.code}) · {option.status}
                  </option>
                ))}
              </select>

              {zoneFilter !== 'all' && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    const selected = zones.find((zt) => zt.id === zoneFilter)
                    if (selected) handleOpenZoneDetails(selected)
                  }}
                >
                  View details
                </button>
              )}

              {(stateFilter !== 'all' || cityFilter !== 'all' || zoneFilter !== 'all') && (
                <button
                  type="button"
                  className="zones-clear-btn"
                  onClick={() => {
                    setStateFilter('all')
                    setCityFilter('all')
                    setZoneFilter('all')
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
                All Zones <span className="filter-pill-count">{zones.length}</span>
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

          {/* Zones Table Card */}
          <section className="states-table-card" aria-label="Zones table list">
            <div className="states-table-wrap">
              <table className="states-table">
                <thead>
                  <tr>
                    <th>Zone Name</th>
                    <th>State</th>
                    <th>Zone Admin</th>
                    <th>Districts</th>
                    <th>City</th>
                    <th>Total Users</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredZones.length > 0 ? (
                    filteredZones.map((ct) => (
                      <tr
                        key={ct.id}
                        className="states-table-row"
                        onClick={() => handleOpenZoneDetails(ct)}
                        title={`Click to view ${ct.name} zone details and bookings`}
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
                          <span className="state-code-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            {ct.cityName}
                          </span>
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
                              className="action-btn view"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenZoneDetails(ct)
                              }}
                              aria-label={`View details for ${ct.name}`}
                            >
                              View Zone
                            </button>
                            <button
                              type="button"
                              className="action-btn edit"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditModal(ct)
                              }}
                              aria-label={`Edit ${ct.name}`}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`action-btn ${ct.status === 'Active' ? 'toggle-deactivate' : 'toggle-activate'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleStatus(ct.id)
                              }}
                              aria-label={`${ct.status === 'Active' ? 'Deactivate' : 'Activate'} ${ct.name}`}
                            >
                              {ct.status === 'Active' ? 'Deactivate' : 'Activate'}
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
                          <h4>No zones found</h4>
                          <p>
                            {stateFilter !== 'all' || cityFilter !== 'all' || zoneFilter !== 'all'
                              ? 'No zones match the selected state, city or zone combined with the current search or status filters.'
                              : searchQuery
                                ? `No zones matching "${searchQuery}". Try clearing search or changing filters.`
                                : 'No zones are available under this status filter.'}
                          </p>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setSearchQuery('')
                              setStateFilter('all')
                              setCityFilter('all')
                              setZoneFilter('all')
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

      {/* CITY DETAILS PAGE (DYNAMICALLY DRIVEN BY SELECTED CITY) */}
      {viewZone && (
        <section
          style={{ display: 'grid', gap: 16, marginTop: 16 }}
          aria-labelledby="view-zone-title"
        >
          <div className="states-header">
            <div className="states-header-copy">
              <div className="states-breadcrumb">
                <button type="button" onClick={() => setViewCity(null)}>
                  Zones
                </button>
                <span>›</span>
                <span>{viewZone.name}</span>
              </div>
              <h2 id="view-zone-title">{viewZone.name} — Zone Overview</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                <span className="state-code-badge">{viewZone.code}</span>
                <span className="state-code-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                  {viewZone.cityName}, {viewZone.stateName}
                </span>
                <span className={`status-pill ${viewZone.status.toLowerCase()}`}>
                  <span className="status-dot" />
                  {viewZone.status}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Created: {viewZone.createdDate}
                </span>
              </div>
            </div>
            <div className="states-header-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleToggleStatus(viewZone.id)}
              >
                {viewZone.status === 'Active' ? 'Deactivate Zone' : 'Activate Zone'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const target = viewZone
                  openEditModal(target)
                }}
              >
                Edit Zone
              </button>
              <button type="button" className="btn-primary" onClick={() => setViewCity(null)}>
                Back to Zones
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {/* 1. CITY BOOKINGS & DISTRICT METRICS SUMMARY */}
            <div className="view-section" style={{ background: '#fff' }}>
              <h4 className="view-section-title">
                <span>Zone Performance & Booking Summary</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Real-time Territorial Metrics</span>
              </h4>

              <div className="state-bookings-kpi-grid">
                <div className="state-kpi-tile primary">
                  <span className="state-kpi-tile-value">
                    {viewZone.bookingSummary?.total.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Total Bookings</span>
                </div>
                <div className="state-kpi-tile amber">
                  <span className="state-kpi-tile-value">
                    {viewZone.bookingSummary?.pending.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Pending</span>
                </div>
                <div className="state-kpi-tile blue">
                  <span className="state-kpi-tile-value">
                    {viewZone.bookingSummary?.confirmed.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Confirmed</span>
                </div>
                <div className="state-kpi-tile green">
                  <span className="state-kpi-tile-value">
                    {viewZone.bookingSummary?.completed.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Completed</span>
                </div>
                <div className="state-kpi-tile red">
                  <span className="state-kpi-tile-value">
                    {viewZone.bookingSummary?.cancelled.toLocaleString() ?? '0'}
                  </span>
                  <span className="state-kpi-tile-label">Cancelled</span>
                </div>
                <div className="state-kpi-tile">
                  <span className="state-kpi-tile-value">
                    {viewZone.totalUsers.toLocaleString()}
                  </span>
                  <span className="state-kpi-tile-label">Total Users</span>
                </div>
                <div className="state-kpi-tile">
                  <span className="state-kpi-tile-value">
                    {viewZone.totalDistricts}
                  </span>
                  <span className="state-kpi-tile-label">Districts</span>
                </div>
                <div className="state-kpi-tile">
                  <span className="state-kpi-tile-value">{viewZone.cityName}</span>
                  <span className="state-kpi-tile-label">Head City</span>
                </div>
              </div>
            </div>

            {/* 2. ASSIGNED CITY ADMIN */}
            <div className="view-section">
              <h4 className="view-section-title">
                <span>Zone Administrator Details</span>
                {viewZone.admin && <span style={{ color: '#078653' }}>● Active Jurisdictional Scope</span>}
              </h4>

              {viewZone.admin ? (
                <div className="admin-card-view">
                  <div className="admin-view-left">
                    <div className="admin-avatar-lg">
                      {viewZone.admin.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="admin-details-text">
                      <strong>{viewZone.admin.name}</strong>
                      <span>Work Email: {viewZone.admin.email}</span>
                      <span>Contact: {viewZone.admin.phone ?? 'No phone provided'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="state-code-badge" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                      Assigned Scope: Zone · {viewZone.name}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                      Assigned on {viewZone.admin.assignedDate ?? 'Launch'}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '14px', background: '#fff1f2', borderRadius: '10px', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: '#9f1239', fontSize: '0.88rem' }}>No Zone Admin Assigned</strong>
                    <p style={{ margin: '2px 0 0', color: '#be123c', fontSize: '0.78rem' }}>
                      This zone is operating without a dedicated primary administrator.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.76rem', padding: '6px 12px' }}
                    onClick={() => {
                      const target = viewZone
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
                <span>Recent & Active Bookings in {viewZone.name}</span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Showing {filteredZoneBookings.length} of {viewZone.bookings?.length ?? 0} bookings
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
                  aria-label="Search bookings in zone"
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
                  {districtOptions.map((dist) => (
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
                  {zoneBookingOptions.map((zone) => (
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
                    {filteredZoneBookings.length > 0 ? (
                      filteredZoneBookings.map((bk) => (
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
                            <strong>No bookings found for {viewZone.name}</strong>
                            <span style={{ fontSize: '0.76rem' }}>
                              {bookingSearch || bookingZoneFilter !== 'all' || bookingDistrictFilter !== 'all' || bookingStatusFilter !== 'all' || bookingDateFilter
                                ? 'No bookings match your selected search or filters.'
                                : 'No bookings recorded for this zone yet.'}
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
                      {viewZone ? `${viewZone.name} · ${viewZone.cityName}, ${viewZone.stateName}` : selectedBooking.district}
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
      {editZone && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditCity(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-zone-title"
        >
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <h3 id="edit-zone-title">Edit Zone — {editZone.name}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setEditCity(null)} aria-label="Close edit form">
                ×
              </button>
            </header>

            <form onSubmit={handleEditSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Zone Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Pune"
                    />
                  </div>

                  <div className="form-field">
                    <label>Zone Code *</label>
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
                    <label>City *</label>
                    <select
                      value={editForm.cityName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, cityName: e.target.value }))}
                    >
                      {initialCitiesData.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}, {c.stateName}
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
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Assigned Zone Admin</h4>
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
                  <div className="form-field">
                    <label>Total Districts</label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.totalDistricts}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, totalDistricts: parseInt(e.target.value, 10) || 0 }))}
                    />
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
                        placeholder="e.g. Mumbai Suburban, Mumbai Zone"
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
          aria-labelledby="add-zone-title"
        >
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-header-info">
                <h3 id="add-zone-title">Add New Zone</h3>
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
                    <label>Zone Name *</label>
                    <input
                      type="text"
                      required
                      value={addForm.name}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Indore"
                    />
                  </div>

                  <div className="form-field">
                    <label>Zone Code *</label>
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
                    <label>City *</label>
                    <select
                      value={addForm.cityName}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, cityName: e.target.value }))}
                    >
                      {initialCitiesData.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}, {c.stateName}
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
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#1e293b' }}>Assign Zone Admin (Optional)</h4>
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
                <button type="submit" className="btn-primary">
                  Add Zone
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
