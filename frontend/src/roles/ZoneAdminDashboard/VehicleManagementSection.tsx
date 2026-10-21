import { useState } from 'react'
import { ProgressCell, StatCards, type StatCard } from '../CityAdminDashboard/shared'
import { vehicleRows, vehicleStatuses, type Vehicle, type VehicleStatus } from './vehicleManagementData'
import { zoneProfile } from './zoneAdminData'

const statusTone: Record<VehicleStatus, string> = {
  Available: 'green',
  Rented: 'blue',
  Reserved: 'amber',
  'Under Maintenance': 'orange',
  Inactive: 'slate',
}

const documentTone = (status: 'Valid' | 'Expiring' | 'Expired') =>
  status === 'Valid' ? 'green' : status === 'Expiring' ? 'amber' : 'red'

type VehicleManagementSectionProps = {
  onToast?: (message: string) => void
  vehicles?: Vehicle[]
  scopeLabel?: string
}

export default function VehicleManagementSection({ onToast, vehicles: initialVehicles, scopeLabel }: VehicleManagementSectionProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles ?? vehicleRows)
  const [statusFilter, setStatusFilter] = useState<'All' | VehicleStatus>('All')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'All' | Vehicle['category']>('All')
  const [cityFilter, setCityFilter] = useState('All')
  const [localityFilter, setLocalityFilter] = useState('All')
  const [selected, setSelected] = useState<Vehicle | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ regNo: '', make: '', model: '', year: '', fuelType: 'Diesel', category: 'Excavator', locality: 'HITEC City', partner: '', status: 'Available', dailyRate: '' })

  const showToast = (message: string) => onToast?.(message)

  const categories = ['All', ...Array.from(new Set(vehicles.map((vehicle) => vehicle.category)))] as Array<'All' | Vehicle['category']>
  const cities = ['All', ...Array.from(new Set(vehicles.map((vehicle) => vehicle.city).filter(Boolean)))]
  const localities = ['All', ...Array.from(new Set(vehicles.map((vehicle) => vehicle.locality)))]

  const filtered = vehicles.filter((vehicle) => {
    const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter
    const matchesCategory = categoryFilter === 'All' || vehicle.category === categoryFilter
    const matchesCity = cityFilter === 'All' || vehicle.city === cityFilter
    const matchesLocality = localityFilter === 'All' || vehicle.locality === localityFilter
    const term = query.trim().toLowerCase()
    const matchesQuery =
      term === '' ||
      [vehicle.id, vehicle.regNo, vehicle.make, vehicle.model, vehicle.category, vehicle.partner, vehicle.locality]
        .join(' ')
        .toLowerCase()
        .includes(term)
    return matchesStatus && matchesCategory && matchesCity && matchesLocality && matchesQuery
  })

  const stats: StatCard[] = [
    { key: 'All', label: 'Fleet size', value: vehicles.length, tone: 'brand', sub: `${scopeLabel ?? 'Zone'} scope` },
    { key: 'Available', label: 'Available', value: vehicles.filter((v) => v.status === 'Available').length, tone: 'green', sub: 'Ready for rental' },
    { key: 'Rented', label: 'Rented / reserved', value: vehicles.filter((v) => v.status === 'Rented' || v.status === 'Reserved').length, tone: 'blue', sub: 'On hire' },
    { key: 'Under Maintenance', label: 'Maintenance', value: vehicles.filter((v) => v.status === 'Under Maintenance').length, tone: 'amber', sub: 'Unavailable' },
    { key: 'Inactive', label: 'Inactive', value: vehicles.filter((v) => v.status === 'Inactive').length, tone: 'slate', sub: 'Out of service' },
  ]

  const totalUtilization = Math.round(vehicles.reduce((sum, vehicle) => sum + vehicle.utilization, 0) / vehicles.length)
  const unavailable = vehicles.filter((v) => v.status === 'Under Maintenance' || v.status === 'Inactive').length
  const maintenanceCost = vehicles.reduce((sum, vehicle) => sum + vehicle.maintenance.cost, 0)
  const rentedCount = vehicles.filter((v) => v.status === 'Rented').length

  const saveVehicle = () => {
    if (!form.regNo.trim() || !form.make.trim() || !form.model.trim() || !form.year.trim()) {
      showToast('Registration number, make, model and year are required.')
      return
    }
    const vehicle: Vehicle = {
      id: `VEH-${Date.now().toString().slice(-4)}`,
      regNo: form.regNo.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      fuelType: form.fuelType as Vehicle['fuelType'],
      category: form.category as Vehicle['category'],
      locality: form.locality,
      partner: form.partner.trim() || zoneProfile.adminName,
      status: form.status as VehicleStatus,
      utilization: 0,
      dailyRate: form.dailyRate.trim() || '—',
      documents: { rc: 'Valid', insurance: 'Valid', puc: 'Valid', permit: 'Valid' },
      maintenance: { lastService: '—', nextService: '—', downtimeDays: 0, cost: 0 },
      inspection: { date: '—', condition: 'Good', result: 'Pass', notes: 'Newly registered vehicle.' },
    }
    setVehicles((prev) => [vehicle, ...prev])
    setShowAdd(false)
    setForm({ regNo: '', make: '', model: '', year: '', fuelType: 'Diesel', category: 'Excavator', locality: 'HITEC City', partner: '', status: 'Available', dailyRate: '' })
    showToast(`${vehicle.regNo} registered in ${scopeLabel ?? 'zone'}.`)
  }

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Vehicle management</h3>
          <span className="sa-panel-sub">Fleet registry, documents, rentals, maintenance and inspections for {scopeLabel ?? 'Madhapur'}</span>
        </div>
        <div className="finance-header-controls">
          <button type="button" className="sa-btn primary" onClick={() => setShowAdd(true)}>+ Add vehicle</button>
        </div>
      </div>

      <StatCards cards={stats} activeKey={statusFilter} onSelect={(key) => setStatusFilter(statusFilter === key ? 'All' : (key as 'All' | VehicleStatus))} />

      <div className="sa-toolbar">
        <input className="sa-input" aria-label="Search vehicles" placeholder="Search registration, make, model, category or partner..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="sa-select" aria-label="Filter by category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as 'All' | Vehicle['category'])}>
          {categories.map((option) => (
            <option key={option} value={option}>{option === 'All' ? 'All categories' : option}</option>
          ))}
        </select>
        {cities.length > 2 && (
          <select className="sa-select" aria-label="Filter by city" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            {cities.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All cities' : option}</option>
            ))}
          </select>
        )}
        {localities.length > 2 && (
          <select className="sa-select" aria-label="Filter by locality" value={localityFilter} onChange={(e) => setLocalityFilter(e.target.value)}>
            {localities.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All localities' : option}</option>
            ))}
          </select>
        )}
        <button type="button" className="sa-btn-ghost" onClick={() => { setQuery(''); setStatusFilter('All'); setCategoryFilter('All'); setCityFilter('All'); setLocalityFilter('All') }}>Reset</button>
        <span className="sa-toolbar-meta">{filtered.length} of {vehicles.length} vehicles</span>
      </div>

      {filtered.length === 0 ? (
        <div className="sa-empty"><p>No vehicles match the current filters.</p></div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Make / model</th>
                <th>Year</th>
                <th>Category</th>
                <th>Locality</th>
                <th>Utilization</th>
                <th>Daily rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="sa-cell-strong">{vehicle.regNo}<span className="sa-cell-sub">{vehicle.id}</span></td>
                  <td className="sa-cell-strong">{vehicle.make}<span className="sa-cell-sub">{vehicle.model} · {vehicle.fuelType}</span></td>
                  <td className="sa-num">{vehicle.year}</td>
                  <td><span className="sa-pill blue">{vehicle.category}</span></td>
                  <td>{vehicle.locality}</td>
                  <td><ProgressCell value={vehicle.utilization} /></td>
                  <td className="sa-num">{vehicle.dailyRate}</td>
                  <td><span className={`sa-pill ${statusTone[vehicle.status]}`}>{vehicle.status}</span></td>
                  <td><button type="button" className="sa-table-act" onClick={() => setSelected(vehicle)}>Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="finance-summary">
        <div className="finance-summary-item"><span className="sa-approval-meta">Fleet size</span><strong>{vehicles.length}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Avg. utilization</span><strong>{totalUtilization}%</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Unavailable vehicles</span><strong>{unavailable}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Rented vehicles</span><strong>{rentedCount}</strong></div>
        <div className="finance-summary-item"><span className="sa-approval-meta">Maintenance cost</span><strong>₹{maintenanceCost.toLocaleString('en-IN')}</strong></div>
      </div>

      {selected && (
        <div className="sa-modal-overlay" role="presentation" onClick={() => setSelected(null)}>
          <div className="sa-modal" role="dialog" aria-modal="true" aria-label={`${selected.regNo} details`} onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h4>{selected.make} {selected.model}</h4>
                <span className="sa-approval-meta">{selected.regNo} · {selected.category} · {selected.year}</span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="sa-modal-body support-body">
              <div className="support-meta-grid">
                <div className="support-meta-item"><span>Fuel type</span><strong>{selected.fuelType}</strong></div>
                <div className="support-meta-item"><span>Partner</span><strong>{selected.partner}</strong></div>
                <div className="support-meta-item"><span>Locality</span><strong>{selected.locality}</strong></div>
                <div className="support-meta-item"><span>Status</span><strong>{selected.status}</strong></div>
                <div className="support-meta-item"><span>Utilization</span><strong>{selected.utilization}%</strong></div>
                <div className="support-meta-item"><span>Daily rate</span><strong>{selected.dailyRate}</strong></div>
              </div>

              <div className="support-section-title"><span>Documents</span></div>
              <div className="sa-chip-row">
                <span className={`sa-pill ${documentTone(selected.documents.rc)}`}>RC: {selected.documents.rc}</span>
                <span className={`sa-pill ${documentTone(selected.documents.insurance)}`}>Insurance: {selected.documents.insurance}</span>
                <span className={`sa-pill ${documentTone(selected.documents.puc)}`}>PUC: {selected.documents.puc}</span>
                <span className={`sa-pill ${documentTone(selected.documents.permit)}`}>Permit: {selected.documents.permit}</span>
              </div>

              <div className="support-section-title"><span>Rental assignment</span></div>
              {selected.rental ? (
                <div className="support-meta-grid">
                  <div className="support-meta-item"><span>Customer</span><strong>{selected.rental.customer}</strong></div>
                  <div className="support-meta-item"><span>Start date</span><strong>{selected.rental.startDate}</strong></div>
                  <div className="support-meta-item"><span>End date</span><strong>{selected.rental.endDate}</strong></div>
                </div>
              ) : (
                <p className="support-empty">No active rental assignment.</p>
              )}

              <div className="support-section-title"><span>Maintenance</span></div>
              <div className="support-meta-grid">
                <div className="support-meta-item"><span>Last service</span><strong>{selected.maintenance.lastService}</strong></div>
                <div className="support-meta-item"><span>Next service</span><strong>{selected.maintenance.nextService}</strong></div>
                <div className="support-meta-item"><span>Downtime</span><strong>{selected.maintenance.downtimeDays} days</strong></div>
                <div className="support-meta-item"><span>Cost</span><strong>₹{selected.maintenance.cost.toLocaleString('en-IN')}</strong></div>
              </div>

              <div className="support-section-title"><span>Inspection &amp; verification</span></div>
              <div className="support-meta-grid">
                <div className="support-meta-item"><span>Date</span><strong>{selected.inspection.date}</strong></div>
                <div className="support-meta-item"><span>Condition</span><strong>{selected.inspection.condition}</strong></div>
                <div className="support-meta-item"><span>Result</span><strong>{selected.inspection.result}</strong></div>
                <div className="support-meta-item"><span>Notes</span><strong>{selected.inspection.notes}</strong></div>
              </div>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="sa-modal-overlay" role="presentation" onClick={() => setShowAdd(false)}>
          <div className="sa-modal" role="dialog" aria-modal="true" aria-label="Add vehicle" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div>
                <h4>Add vehicle</h4>
                <span className="sa-approval-meta">{zoneProfile.name} · registration if permitted</span>
              </div>
              <button type="button" className="sa-modal-close" aria-label="Close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className="sa-modal-body support-body">
              <div className="sa-toolbar" style={{ marginTop: 0 }}>
                <input className="sa-input" placeholder="Registration number" value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} />
                <input className="sa-input" placeholder="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
                <input className="sa-input" placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                <input className="sa-input" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div className="sa-toolbar" style={{ marginTop: 0 }}>
                <select className="sa-select" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                  <option>Diesel</option><option>Petrol</option><option>CNG</option><option>Electric</option>
                </select>
                <select className="sa-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Excavator</option><option>Crane</option><option>Tipper</option><option>Mixer</option><option>Compactor</option><option>Backhoe</option>
                </select>
                <select className="sa-select" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })}>
                  <option>HITEC City</option><option>Raidurg</option><option>Kavuri Hills</option><option>Manikonda</option><option>Nanakramguda</option><option>Kondapur</option>
                </select>
                <select className="sa-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {vehicleStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <input className="sa-input" placeholder="Partner / owner" value={form.partner} onChange={(e) => setForm({ ...form, partner: e.target.value })} />
              <input className="sa-input" placeholder="Daily rate" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} />
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="sa-btn ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="button" className="sa-btn primary" onClick={saveVehicle}>Register vehicle</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}