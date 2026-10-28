import { useMemo, useState } from 'react'
import { ProgressCell, StatCards, type StatCard } from './shared'
import { stateProfile } from './stateAdminData'
import {
  cityAdminPool,
  cityDeactivationRules,
  locationTabs,
  managedCities,
  managedZones,
  zoneAdminPool,
  zoneDeactivationRules,
  type LocationStatus,
  type LocationTab,
  type ManagedCity,
  type ManagedZone,
  type ZoneStatus,
} from './locationManagementData'

const locationStatusTone: Record<string, string> = {
  Active: 'green',
  Inactive: 'slate',
  'Pending activation': 'amber',
  Review: 'amber',
}

type CityDraft = { id: string | null; name: string; code: string; status: LocationStatus; adminId: string }
type ZoneDraft = { id: string | null; name: string; city: string; status: ZoneStatus; adminId: string }

const emptyCityDraft: CityDraft = { id: null, name: '', code: '', status: 'Pending activation', adminId: '' }
const emptyZoneDraft = (city: string): ZoneDraft => ({ id: null, name: '', city, status: 'Active', adminId: '' })

const slug = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

type LocationManagementSectionProps = {
  onToast?: (message: string) => void
}

export default function LocationManagementSection({ onToast }: LocationManagementSectionProps) {
  const [tab, setTab] = useState<LocationTab>('cities')
  const [cities, setCities] = useState<ManagedCity[]>(managedCities)
  const [zones, setZones] = useState<ManagedZone[]>(managedZones)
  const [cityQuery, setCityQuery] = useState('')
  const [cityStatus, setCityStatus] = useState<'All' | LocationStatus>('All')
  const [zoneCity, setZoneCity] = useState('All')
  const [zoneQuery, setZoneQuery] = useState('')
  const [cityDraft, setCityDraft] = useState<CityDraft | null>(null)
  const [zoneDraft, setZoneDraft] = useState<ZoneDraft | null>(null)

  const cityNames = cities.map((city) => city.name)

  const cityOptions = (includeAll: boolean) => (includeAll ? ['All', ...cityNames] : cityNames)

  const totals = useMemo(() => {
    const activeCities = cities.filter((city) => city.status === 'Active').length
    const pendingCities = cities.filter((city) => city.status === 'Pending activation').length
    const cityAdmins = cities.filter((city) => city.adminId !== null).length
    const zoneAdmins = zones.filter((zone) => zone.adminId !== null).length
    return { activeCities, pendingCities, cityAdmins, zoneAdmins }
  }, [cities, zones])

  const filteredCities = cities.filter((city) => {
    const matchesStatus = cityStatus === 'All' || city.status === cityStatus
    const term = cityQuery.trim().toLowerCase()
    const matchesQuery =
      term === '' || [city.name, city.code, city.admin ?? ''].join(' ').toLowerCase().includes(term)
    return matchesStatus && matchesQuery
  })

  const filteredZones = zones.filter((zone) => {
    const matchesCity = zoneCity === 'All' || zone.city === zoneCity
    const term = zoneQuery.trim().toLowerCase()
    const matchesQuery = term === '' || [zone.name, zone.city, zone.admin ?? ''].join(' ').toLowerCase().includes(term)
    return matchesCity && matchesQuery
  })

  const cityCards: StatCard[] = [
    { key: 'All', label: 'All cities', value: cities.length, tone: 'brand', sub: 'State-wide' },
    { key: 'Active', label: 'Active', value: totals.activeCities, tone: 'green', sub: `of ${cities.length}` },
    { key: 'Inactive', label: 'Inactive', value: cities.filter((city) => city.status === 'Inactive').length, tone: 'slate', sub: 'Deactivated' },
    { key: 'Pending activation', label: 'Pending', value: totals.pendingCities, tone: 'amber', sub: 'Awaiting go-live' },
  ]

  const saveCity = () => {
    if (!cityDraft || cityDraft.name.trim() === '' || cityDraft.code.trim() === '') return
    const admin = cityAdminPool.find((officer) => officer.id === cityDraft.adminId) ?? null
    if (cityDraft.id) {
      setCities((prev) =>
        prev.map((city) =>
          city.id === cityDraft.id
            ? { ...city, name: cityDraft.name.trim(), code: cityDraft.code.trim().toUpperCase(), status: cityDraft.status, adminId: admin?.id ?? null, admin: admin?.name ?? null }
            : city,
        ),
      )
      onToast?.(`City ${cityDraft.name} updated`)
    } else {
      const id = `cty-${slug(cityDraft.code) || slug(cityDraft.name)}`
      setCities((prev) => [
        ...prev,
        { id, name: cityDraft.name.trim(), code: cityDraft.code.trim().toUpperCase(), status: cityDraft.status, zones: 0, machines: 0, operators: 0, bookings: 0, utilization: 0, revenue: '₹0', satisfaction: 0, slaPct: 0, applications: 0, properties: 0, users: 0, pendingApprovals: 0, adminId: admin?.id ?? null, admin: admin?.name ?? null },
      ])
      onToast?.(`City ${cityDraft.name} created`)
    }
    setCityDraft(null)
  }

  const saveZone = () => {
    if (!zoneDraft || zoneDraft.name.trim() === '' || zoneDraft.city === '') return
    const admin = zoneAdminPool.find((officer) => officer.id === zoneDraft.adminId) ?? null
    if (zoneDraft.id) {
      setZones((prev) =>
        prev.map((zone) =>
          zone.id === zoneDraft.id
            ? { ...zone, name: zoneDraft.name.trim(), city: zoneDraft.city, status: zoneDraft.status, adminId: admin?.id ?? null, admin: admin?.name ?? null }
            : zone,
        ),
      )
      onToast?.(`Zone ${zoneDraft.name} updated`)
    } else {
      setZones((prev) => [
        ...prev,
        { id: `zn-${slug(zoneDraft.city)}-${slug(zoneDraft.name)}`, name: zoneDraft.name.trim(), city: zoneDraft.city, status: zoneDraft.status, machines: 0, operators: 0, openJobs: 0, utilization: 0, satisfaction: 0, applications: 0, properties: 0, users: 0, adminId: admin?.id ?? null, admin: admin?.name ?? null },
      ])
      setCities((prev) => prev.map((city) => (city.name === zoneDraft.city ? { ...city, zones: city.zones + 1 } : city)))
      onToast?.(`Zone ${zoneDraft.name} created in ${zoneDraft.city}`)
    }
    setZoneDraft(null)
  }

  const toggleCity = (city: ManagedCity) => {
    if (city.status === 'Active') {
      const blockers = cityDeactivationRules(city)
      if (blockers.length > 0) {
        onToast?.(`Cannot deactivate ${city.name}: ${blockers.join(', ')}`)
        return
      }
      setCities((prev) => prev.map((item) => (item.id === city.id ? { ...item, status: 'Inactive' } : item)))
      onToast?.(`${city.name} deactivated`)
    } else {
      setCities((prev) => prev.map((item) => (item.id === city.id ? { ...item, status: 'Active' } : item)))
      onToast?.(`${city.name} activated`)
    }
  }

  const toggleZone = (zone: ManagedZone) => {
    if (zone.status === 'Active') {
      const blockers = zoneDeactivationRules(zone)
      if (blockers.length > 0) {
        onToast?.(`Cannot deactivate ${zone.name}: ${blockers.join(', ')}`)
        return
      }
      setZones((prev) => prev.map((item) => (item.id === zone.id ? { ...item, status: 'Inactive' } : item)))
      onToast?.(`${zone.name} deactivated`)
    } else {
      setZones((prev) => prev.map((item) => (item.id === zone.id ? { ...item, status: 'Active' } : item)))
      onToast?.(`${zone.name} activated`)
    }
  }

  const assignCityAdmin = (cityId: string, adminId: string) => {
    const admin = cityAdminPool.find((officer) => officer.id === adminId) ?? null
    setCities((prev) => prev.map((city) => (city.id === cityId ? { ...city, adminId: admin?.id ?? null, admin: admin?.name ?? null } : city)))
    onToast?.(admin ? `${admin.name} assigned as City Admin` : 'City Admin unassigned')
  }

  const assignZoneAdmin = (zoneId: string, adminId: string) => {
    const admin = zoneAdminPool.find((officer) => officer.id === adminId) ?? null
    setZones((prev) => prev.map((zone) => (zone.id === zoneId ? { ...zone, adminId: admin?.id ?? null, admin: admin?.name ?? null } : zone)))
    onToast?.(admin ? `${admin.name} assigned as Zone Admin` : 'Zone Admin unassigned')
  }

  const activityTotals = useMemo(
    () => ({
      applications: cities.reduce((total, city) => total + city.applications, 0),
      properties: cities.reduce((total, city) => total + city.properties, 0),
      users: cities.reduce((total, city) => total + city.users, 0),
    }),
    [cities],
  )

  const performanceCards: StatCard[] = useMemo(() => {
    const avgUtil = Math.round(cities.filter((city) => city.status === 'Active').reduce((total, city) => total + city.utilization, 0) / Math.max(1, totals.activeCities))
    const bookings = cities.reduce((total, city) => total + city.bookings, 0)
    const avgSatisfaction = cities.filter((city) => city.satisfaction > 0)
    const satisfaction = avgSatisfaction.reduce((total, city) => total + city.satisfaction, 0) / Math.max(1, avgSatisfaction.length)
    return [
      { key: 'util', label: 'Avg utilization', value: `${avgUtil}%`, tone: 'blue', static: true, sub: 'Active cities' },
      { key: 'bookings', label: 'Total bookings', value: bookings, tone: 'brand', static: true },
      { key: 'satisfaction', label: 'Avg satisfaction', value: satisfaction.toFixed(1), tone: 'green', static: true, sub: 'Out of 5.0' },
      { key: 'admins', label: 'Admins assigned', value: `${totals.cityAdmins + totals.zoneAdmins}`, tone: 'purple', static: true, sub: `${totals.cityAdmins} city · ${totals.zoneAdmins} zone` },
    ]
  }, [cities, totals])

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Location management</h3>
     
        </div>
        <div className="finance-header-controls">
          <span className="sa-pill green">Create &amp; edit authorized</span>
        </div>
      </div>

      <div className="sa-chip-row finance-tabs">
        {locationTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sa-chip ${tab === item.id ? 'active orange' : ''}`}
            onClick={() => setTab(item.id)}
            title={item.hint}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="finance-summary">
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Cities</span>
          <strong>{cities.length}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Active cities</span>
          <strong>{totals.activeCities}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Zones</span>
          <strong>{zones.length}</strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">City Admins</span>
          <strong>
            {totals.cityAdmins}/{cities.length}
          </strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Zone Admins</span>
          <strong>
            {totals.zoneAdmins}/{zones.length}
          </strong>
        </div>
        <div className="finance-summary-item">
          <span className="sa-approval-meta">Pending activation</span>
          <strong>{totals.pendingCities}</strong>
        </div>
      </div>

      {tab === 'cities' && (
        <>
          <StatCards
            cards={cityCards}
            activeKey={cityStatus}
            onSelect={(key) => setCityStatus(cityStatus === key ? 'All' : (key as 'All' | LocationStatus))}
          />
          <div className="sa-toolbar">
            <input className="sa-input" aria-label="Search cities" placeholder="Search city, code or admin..." value={cityQuery} onChange={(event) => setCityQuery(event.target.value)} />
            <button type="button" className="sa-btn-ghost" onClick={() => { setCityQuery(''); setCityStatus('All') }}>
              Reset
            </button>
            <button type="button" className="sa-btn primary" onClick={() => setCityDraft({ ...emptyCityDraft })}>
              Create city
            </button>
            <span className="sa-toolbar-meta">
              {filteredCities.length} of {cities.length} cities
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Status</th>
                  <th>Zones</th>
                  <th>City admin</th>
                  <th>Applications</th>
                  <th>Properties</th>
                  <th>Users</th>
                  <th>Utilization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((city) => {
                  const blockers = cityDeactivationRules(city)
                  const blocked = city.status === 'Active' && blockers.length > 0
                  return (
                    <tr key={city.id}>
                      <td className="sa-cell-strong">
                        {city.name}
                        <span className="sa-cell-sub">{city.code}</span>
                      </td>
                      <td>
                        <span className={`sa-pill ${locationStatusTone[city.status]}`}>{city.status}</span>
                      </td>
                      <td className="sa-num">{city.zones}</td>
                      <td className="sa-cell-strong">
                        {city.admin ?? 'Unassigned'}
                        <span className="sa-cell-sub">{city.adminId ?? '—'}</span>
                      </td>
                      <td className="sa-num">{city.applications}</td>
                      <td className="sa-num">{city.properties}</td>
                      <td className="sa-num">{city.users}</td>
                      <td>
                        <ProgressCell value={city.utilization} />
                      </td>
                      <td>
                        <div className="sa-approval-actions">
                          <button
                            type="button"
                            className="sa-btn ghost"
                            onClick={() => setCityDraft({ id: city.id, name: city.name, code: city.code, status: city.status, adminId: city.adminId ?? '' })}
                          >
                            Edit
                          </button>
                          {city.status === 'Active' ? (
                            <button
                              type="button"
                              className="sa-btn return"
                              disabled={blocked}
                              title={blocked ? `Blocked by: ${blockers.join(', ')}` : 'Deactivate city'}
                              onClick={() => toggleCity(city)}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button type="button" className="sa-btn approve" onClick={() => toggleCity(city)}>
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'zones' && (
        <>
          <div className="sa-toolbar">
            <input className="sa-input" aria-label="Search zones" placeholder="Search zone, city or admin..." value={zoneQuery} onChange={(event) => setZoneQuery(event.target.value)} />
            <select className="sa-select" aria-label="Filter zones by city" value={zoneCity} onChange={(event) => setZoneCity(event.target.value)}>
              {cityOptions(true).map((city) => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All cities' : city}
                </option>
              ))}
            </select>
            <button type="button" className="sa-btn-ghost" onClick={() => { setZoneQuery(''); setZoneCity('All') }}>
              Reset
            </button>
            <button type="button" className="sa-btn primary" onClick={() => setZoneDraft(emptyZoneDraft(zoneCity === 'All' ? cityNames[0] ?? '' : zoneCity))}>
              Create zone
            </button>
            <span className="sa-toolbar-meta">
              {filteredZones.length} of {zones.length} zones
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Zone admin</th>
                  <th>Machines</th>
                  <th>Open jobs</th>
                  <th>Properties</th>
                  <th>Utilization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map((zone) => {
                  const blockers = zoneDeactivationRules(zone)
                  const blocked = zone.status === 'Active' && blockers.length > 0
                  return (
                    <tr key={zone.id}>
                      <td className="sa-cell-strong">
                        {zone.name}
                        <span className="sa-cell-sub">{zone.id}</span>
                      </td>
                      <td>{zone.city}</td>
                      <td>
                        <span className={`sa-pill ${locationStatusTone[zone.status]}`}>{zone.status}</span>
                      </td>
                      <td className="sa-cell-strong">
                        {zone.admin ?? 'Unassigned'}
                        <span className="sa-cell-sub">{zone.adminId ?? '—'}</span>
                      </td>
                      <td className="sa-num">{zone.machines}</td>
                      <td className="sa-num">{zone.openJobs}</td>
                      <td className="sa-num">{zone.properties}</td>
                      <td>
                        <ProgressCell value={zone.utilization} />
                      </td>
                      <td>
                        <div className="sa-approval-actions">
                          <button
                            type="button"
                            className="sa-btn ghost"
                            onClick={() => setZoneDraft({ id: zone.id, name: zone.name, city: zone.city, status: zone.status, adminId: zone.adminId ?? '' })}
                          >
                            Edit
                          </button>
                          {zone.status === 'Active' ? (
                            <button
                              type="button"
                              className="sa-btn return"
                              disabled={blocked}
                              title={blocked ? `Blocked by: ${blockers.join(', ')}` : 'Deactivate zone'}
                              onClick={() => toggleZone(zone)}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button type="button" className="sa-btn approve" onClick={() => toggleZone(zone)}>
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'admins' && (
        <>
          <div className="reports-note">
            <span className="sa-pill green">Authorized</span>
            <span>Assign a City Admin or Zone Admin to each location. Changing a selection reassigns immediately.</span>
          </div>
          <div className="support-section-title">
            <span>City Admins</span>
            <span className="sa-approval-meta">
              {totals.cityAdmins} of {cities.length} cities assigned
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Status</th>
                  <th>Zones</th>
                  <th>Assigned City Admin</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id}>
                    <td className="sa-cell-strong">
                      {city.name}
                      <span className="sa-cell-sub">{city.code}</span>
                    </td>
                    <td>
                      <span className={`sa-pill ${locationStatusTone[city.status]}`}>{city.status}</span>
                    </td>
                    <td className="sa-num">{city.zones}</td>
                    <td>
                      <select className="sa-select" aria-label={`Assign City Admin for ${city.name}`} value={city.adminId ?? ''} onChange={(event) => assignCityAdmin(city.id, event.target.value)}>
                        <option value="">Unassigned</option>
                        {cityAdminPool.map((officer) => (
                          <option key={officer.id} value={officer.id}>
                            {officer.name} · {officer.id}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="support-section-title">
            <span>Zone Admins</span>
            <span className="sa-approval-meta">
              {totals.zoneAdmins} of {zones.length} zones assigned
            </span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Assigned Zone Admin</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td className="sa-cell-strong">{zone.name}</td>
                    <td>{zone.city}</td>
                    <td>
                      <span className={`sa-pill ${locationStatusTone[zone.status]}`}>{zone.status}</span>
                    </td>
                    <td>
                      <select className="sa-select" aria-label={`Assign Zone Admin for ${zone.name}`} value={zone.adminId ?? ''} onChange={(event) => assignZoneAdmin(zone.id, event.target.value)}>
                        <option value="">Unassigned</option>
                        {zoneAdminPool.map((officer) => (
                          <option key={officer.id} value={officer.id}>
                            {officer.name} · {officer.id}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'activity' && (
        <>
          <div className="finance-summary">
            <div className="finance-summary-item">
              <span className="sa-approval-meta">Applications</span>
              <strong>{activityTotals.applications}</strong>
            </div>
            <div className="finance-summary-item">
              <span className="sa-approval-meta">Properties</span>
              <strong>{activityTotals.properties}</strong>
            </div>
            <div className="finance-summary-item">
              <span className="sa-approval-meta">Users</span>
              <strong>{activityTotals.users}</strong>
            </div>
          </div>
          <div className="support-section-title">
            <span>By city</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Applications</th>
                  <th>Properties</th>
                  <th>Users</th>
                  <th>Pending approvals</th>
                </tr>
              </thead>
              <tbody>
                {[...cities]
                  .sort((a, b) => b.applications - a.applications)
                  .map((city) => (
                    <tr key={city.id}>
                      <td className="sa-cell-strong">{city.name}</td>
                      <td className="sa-num">{city.applications}</td>
                      <td className="sa-num">{city.properties}</td>
                      <td className="sa-num">{city.users}</td>
                      <td className="sa-num">{city.pendingApprovals}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="support-section-title">
            <span>By zone</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>City</th>
                  <th>Applications</th>
                  <th>Properties</th>
                  <th>Users</th>
                </tr>
              </thead>
              <tbody>
                {[...zones]
                  .sort((a, b) => b.applications - a.applications)
                  .map((zone) => (
                    <tr key={zone.id}>
                      <td className="sa-cell-strong">{zone.name}</td>
                      <td>{zone.city}</td>
                      <td className="sa-num">{zone.applications}</td>
                      <td className="sa-num">{zone.properties}</td>
                      <td className="sa-num">{zone.users}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'performance' && (
        <>
          <StatCards cards={performanceCards} />
          <div className="support-section-title">
            <span>City-wise performance</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Utilization</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Satisfaction</th>
                  <th>SLA met</th>
                </tr>
              </thead>
              <tbody>
                {[...cities]
                  .sort((a, b) => b.utilization - a.utilization)
                  .map((city) => (
                    <tr key={city.id}>
                      <td className="sa-cell-strong">
                        {city.name}
                        <span className="sa-cell-sub">{city.status}</span>
                      </td>
                      <td>
                        <ProgressCell value={city.utilization} />
                      </td>
                      <td className="sa-num">{city.bookings}</td>
                      <td className="sa-num">{city.revenue}</td>
                      <td>
                        <ProgressCell value={Math.round(city.satisfaction * 20)} />
                      </td>
                      <td>
                        <ProgressCell value={city.slaPct} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="support-section-title">
            <span>Zone-wise performance</span>
          </div>
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>City</th>
                  <th>Utilization</th>
                  <th>Open jobs</th>
                  <th>Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {[...zones]
                  .sort((a, b) => b.utilization - a.utilization)
                  .map((zone) => (
                    <tr key={zone.id}>
                      <td className="sa-cell-strong">
                        {zone.name}
                        <span className="sa-cell-sub">{zone.status}</span>
                      </td>
                      <td>{zone.city}</td>
                      <td>
                        <ProgressCell value={zone.utilization} />
                      </td>
                      <td className="sa-num">{zone.openJobs}</td>
                      <td>
                        <ProgressCell value={Math.round(zone.satisfaction * 20)} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {cityDraft && (
        <div className="sa-modal-overlay" role="presentation" onClick={() => setCityDraft(null)}>
          <div className="sa-modal" role="dialog" aria-modal="true" aria-label={cityDraft.id ? 'Edit city' : 'Create city'} onClick={(event) => event.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h4>{cityDraft.id ? 'Edit city' : 'Create city'}</h4>
                <span className="sa-approval-meta">City records for {stateProfile.name}</span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={() => setCityDraft(null)}>
                ×
              </button>
            </div>
            <div className="sa-modal-body">
              <label className="sa-comment-label" htmlFor="city-name">City name</label>
              <input id="city-name" className="sa-input" value={cityDraft.name} onChange={(event) => setCityDraft({ ...cityDraft, name: event.target.value })} placeholder="e.g. Medchal" />
              <label className="sa-comment-label" htmlFor="city-code">City code</label>
              <input id="city-code" className="sa-input" value={cityDraft.code} onChange={(event) => setCityDraft({ ...cityDraft, code: event.target.value })} placeholder="e.g. MDL" />
              <label className="sa-comment-label" htmlFor="city-status">Status</label>
              <select id="city-status" className="sa-select" value={cityDraft.status} onChange={(event) => setCityDraft({ ...cityDraft, status: event.target.value as LocationStatus })}>
                {(['Pending activation', 'Active', 'Inactive'] as LocationStatus[]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <label className="sa-comment-label" htmlFor="city-admin">City Admin</label>
              <select id="city-admin" className="sa-select" value={cityDraft.adminId} onChange={(event) => setCityDraft({ ...cityDraft, adminId: event.target.value })}>
                <option value="">Unassigned</option>
                {cityAdminPool.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} · {officer.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={() => setCityDraft(null)}>
                Cancel
              </button>
              <button type="button" className="sa-btn primary" disabled={cityDraft.name.trim() === '' || cityDraft.code.trim() === ''} onClick={saveCity}>
                {cityDraft.id ? 'Save changes' : 'Create city'}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoneDraft && (
        <div className="sa-modal-overlay" role="presentation" onClick={() => setZoneDraft(null)}>
          <div className="sa-modal" role="dialog" aria-modal="true" aria-label={zoneDraft.id ? 'Edit zone' : 'Create zone'} onClick={(event) => event.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h4>{zoneDraft.id ? 'Edit zone' : 'Create zone'}</h4>
                <span className="sa-approval-meta">Zones within a city in {stateProfile.name}</span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={() => setZoneDraft(null)}>
                ×
              </button>
            </div>
            <div className="sa-modal-body">
              <label className="sa-comment-label" htmlFor="zone-name">Zone name</label>
              <input id="zone-name" className="sa-input" value={zoneDraft.name} onChange={(event) => setZoneDraft({ ...zoneDraft, name: event.target.value })} placeholder="e.g. Kompally" />
              <label className="sa-comment-label" htmlFor="zone-city">City</label>
              <select id="zone-city" className="sa-select" value={zoneDraft.city} onChange={(event) => setZoneDraft({ ...zoneDraft, city: event.target.value })}>
                {cityOptions(false).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <label className="sa-comment-label" htmlFor="zone-status">Status</label>
              <select id="zone-status" className="sa-select" value={zoneDraft.status} onChange={(event) => setZoneDraft({ ...zoneDraft, status: event.target.value as ZoneStatus })}>
                {(['Active', 'Review', 'Inactive'] as ZoneStatus[]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <label className="sa-comment-label" htmlFor="zone-admin">Zone Admin</label>
              <select id="zone-admin" className="sa-select" value={zoneDraft.adminId} onChange={(event) => setZoneDraft({ ...zoneDraft, adminId: event.target.value })}>
                <option value="">Unassigned</option>
                {zoneAdminPool.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} · {officer.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={() => setZoneDraft(null)}>
                Cancel
              </button>
              <button type="button" className="sa-btn primary" disabled={zoneDraft.name.trim() === '' || zoneDraft.city === ''} onClick={saveZone}>
                {zoneDraft.id ? 'Save changes' : 'Create zone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
