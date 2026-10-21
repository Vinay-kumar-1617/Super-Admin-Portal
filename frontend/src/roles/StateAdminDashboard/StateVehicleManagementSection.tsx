import { useMemo } from 'react'
import VehicleManagementSection from '../ZoneAdminDashboard/VehicleManagementSection'
import { fleetRows } from './stateAdminData'
import type { Vehicle } from '../ZoneAdminDashboard/vehicleManagementData'

const mapStatus = (status: string): Vehicle['status'] => {
  if (status === 'Rented') return 'Rented'
  if (status === 'Maintenance' || status === 'Inspection') return 'Under Maintenance'
  if (status === 'Available') return 'Available'
  return 'Inactive'
}

const mapCategory = (type: string): Vehicle['category'] => {
  if (type.toLowerCase().includes('crane')) return 'Crane'
  if (type.toLowerCase().includes('tipper')) return 'Tipper'
  if (type.toLowerCase().includes('mixer')) return 'Mixer'
  if (type.toLowerCase().includes('compactor')) return 'Compactor'
  if (type.toLowerCase().includes('excavator') || type.toLowerCase().includes('backhoe')) return type.toLowerCase().includes('backhoe') ? 'Backhoe' : 'Excavator'
  return 'Backhoe'
}

export default function StateVehicleManagementSection({ onToast }: { onToast?: (message: string) => void }) {
  const vehicles = useMemo<Vehicle[]>(
    () =>
      fleetRows.map((machine) => ({
        id: machine.id,
        regNo: machine.regNo,
        make: machine.model.split(' ')[0],
        model: machine.model,
        year: 2022,
        fuelType: 'Diesel',
        category: mapCategory(machine.type),
        locality: machine.zoneName || machine.zoneId || machine.city,
        city: machine.city,
        partner: machine.partner,
        status: mapStatus(machine.status),
        utilization: machine.utilization,
        dailyRate: machine.dailyRate,
        documents: { rc: 'Valid', insurance: 'Valid', puc: 'Valid', permit: 'Valid' },
        maintenance: { lastService: '—', nextService: '—', downtimeDays: 0, cost: 0 },
        inspection: { date: '—', condition: 'Good', result: 'Pass', notes: `${machine.status} status from state fleet.` },
      })),
    [],
  )

  return <VehicleManagementSection onToast={onToast} vehicles={vehicles} scopeLabel="Telangana" />
}