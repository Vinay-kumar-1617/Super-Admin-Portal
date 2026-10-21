export type VehicleStatus = 'Available' | 'Rented' | 'Reserved' | 'Under Maintenance' | 'Inactive'
export type DocumentStatus = 'Valid' | 'Expiring' | 'Expired'

export type Vehicle = {
  id: string
  regNo: string
  make: string
  model: string
  year: number
  fuelType: 'Diesel' | 'Petrol' | 'CNG' | 'Electric'
  category: 'Excavator' | 'Crane' | 'Tipper' | 'Mixer' | 'Compactor' | 'Backhoe'
  locality: string
  city?: string
  partner: string
  status: VehicleStatus
  utilization: number
  dailyRate: string
  rental?: { customer: string; startDate: string; endDate: string }
  documents: { rc: DocumentStatus; insurance: DocumentStatus; puc: DocumentStatus; permit: DocumentStatus }
  maintenance: { lastService: string; nextService: string; downtimeDays: number; cost: number }
  inspection: { date: string; condition: 'Good' | 'Fair' | 'Poor'; result: 'Pass' | 'Fail'; notes: string }
}

export const vehicleStatuses: VehicleStatus[] = ['Available', 'Rented', 'Reserved', 'Under Maintenance', 'Inactive']

export const vehicleRows: Vehicle[] = [
  { id: 'VEH-3041', regNo: 'TS-07-HB-4412', make: 'Caterpillar', model: 'CAT 320 GC', year: 2022, fuelType: 'Diesel', category: 'Excavator', locality: 'HITEC City', partner: 'Sri Krishna Equipment Rentals', status: 'Rented', utilization: 95, dailyRate: '₹6,900', rental: { customer: 'L&T Metro Rail', startDate: '12 Sep', endDate: '26 Sep' }, documents: { rc: 'Valid', insurance: 'Valid', puc: 'Valid', permit: 'Valid' }, maintenance: { lastService: '10 Aug', nextService: '10 Oct', downtimeDays: 2, cost: 18000 }, inspection: { date: '08 Sep', condition: 'Good', result: 'Pass', notes: 'No major defects.' } },
  { id: 'VEH-3045', regNo: 'TS-07-TC-4471', make: 'ACE', model: 'Tower Crane TC-9', year: 2021, fuelType: 'Diesel', category: 'Crane', locality: 'HITEC City', partner: 'Charminar Plant Hire', status: 'Rented', utilization: 96, dailyRate: '₹10,400', rental: { customer: 'HCC Constructions', startDate: '22 Sep', endDate: '12 Oct' }, documents: { rc: 'Valid', insurance: 'Expiring', puc: 'Valid', permit: 'Valid' }, maintenance: { lastService: '15 Jul', nextService: '15 Sep', downtimeDays: 1, cost: 32000 }, inspection: { date: '05 Sep', condition: 'Good', result: 'Pass', notes: 'Hydraulic check completed.' } },
  { id: 'VEH-3046', regNo: 'TS-09-SW-2264', make: 'Schwing', model: 'Stetter S6', year: 2020, fuelType: 'Diesel', category: 'Mixer', locality: 'Raidurg', partner: 'Sri Krishna Equipment Rentals', status: 'Under Maintenance', utilization: 71, dailyRate: '₹5,600', documents: { rc: 'Valid', insurance: 'Valid', puc: 'Expired', permit: 'Valid' }, maintenance: { lastService: '01 Sep', nextService: '01 Oct', downtimeDays: 6, cost: 46000 }, inspection: { date: '01 Sep', condition: 'Fair', result: 'Fail', notes: 'Drum alignment issue.' } },
  { id: 'VEH-3048', regNo: 'TS-07-VF-8830', make: 'Volvo', model: 'FMX 440', year: 2019, fuelType: 'Diesel', category: 'Tipper', locality: 'Kondapur', partner: 'Deccan Heavy Machinery', status: 'Under Maintenance', utilization: 62, dailyRate: '₹7,300', documents: { rc: 'Valid', insurance: 'Valid', puc: 'Valid', permit: 'Expiring' }, maintenance: { lastService: '20 Aug', nextService: '20 Sep', downtimeDays: 9, cost: 61000 }, inspection: { date: '18 Sep', condition: 'Poor', result: 'Fail', notes: 'Brake pad replacement.' } },
  { id: 'VEH-3050', regNo: 'TS-07-BM-6612', make: 'Bomag', model: 'BW211', year: 2023, fuelType: 'Diesel', category: 'Compactor', locality: 'Manikonda', partner: 'Twin Cities Liftways', status: 'Available', utilization: 79, dailyRate: '₹4,600', documents: { rc: 'Valid', insurance: 'Valid', puc: 'Valid', permit: 'Valid' }, maintenance: { lastService: '12 Sep', nextService: '12 Nov', downtimeDays: 0, cost: 7200 }, inspection: { date: '12 Sep', condition: 'Good', result: 'Pass', notes: 'Ready for dispatch.' } },
  { id: 'VEH-3064', regNo: 'TS-07-JE-5526', make: 'JCB', model: '3DX Eco', year: 2021, fuelType: 'Diesel', category: 'Backhoe', locality: 'HITEC City', partner: 'Deccan Heavy Machinery', status: 'Available', utilization: 82, dailyRate: '₹4,400', documents: { rc: 'Valid', insurance: 'Valid', puc: 'Valid', permit: 'Valid' }, maintenance: { lastService: '05 Sep', nextService: '05 Nov', downtimeDays: 0, cost: 9100 }, inspection: { date: '05 Sep', condition: 'Good', result: 'Pass', notes: 'All systems okay.' } },
  { id: 'VEH-3053', regNo: 'TS-07-PM-4408', make: 'Putzmeister', model: 'Pump PM 36', year: 2020, fuelType: 'Diesel', category: 'Mixer', locality: 'Nanakramguda', partner: 'Sri Krishna Equipment Rentals', status: 'Reserved', utilization: 90, dailyRate: '₹8,800', rental: { customer: 'Cyberabad Builders', startDate: '24 Sep', endDate: '30 Sep' }, documents: { rc: 'Valid', insurance: 'Valid', puc: 'Valid', permit: 'Valid' }, maintenance: { lastService: '20 Jul', nextService: '20 Sep', downtimeDays: 1, cost: 21000 }, inspection: { date: '18 Sep', condition: 'Good', result: 'Pass', notes: 'Reserved for upcoming booking.' } },
]