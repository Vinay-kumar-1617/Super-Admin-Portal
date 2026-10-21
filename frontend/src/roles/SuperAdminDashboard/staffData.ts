export type StaffAccount = {
  id: string
  name: string
  email: string
  role: string
  scope: string
  approvalLimit: number
  active: boolean
  mfaRequired: boolean
  mfaResetRequested: boolean
  sessionActive: boolean
  canGrantRoles: boolean
  device?: string
  ipAddress?: string
  lastSeen?: string
  sessionStartedAt?: string
}

export const roleOptions = ['Super Admin', 'State Admin', 'City Admin', 'Zone Admin', 'Finance Admin', 'Support Admin', 'Operator', 'Auditor'] as const

export const scopeOptions = ['National', 'State · Telangana', 'City · Hyderabad', 'Zone · Hyderabad East', 'Zone · Hyderabad West'] as const

export const initialStaff: StaffAccount[] = [
  { id: 'ADM-001', name: 'Aarav Mehta', email: 'aarav.mehta@fieldwork.example', role: 'Super Admin', scope: 'National', approvalLimit: 1000000, active: true, mfaRequired: true, mfaResetRequested: false, sessionActive: true, canGrantRoles: true, device: 'MacBook Pro · Chrome', ipAddress: '103.21.44.10', lastSeen: 'Just now', sessionStartedAt: '2h ago' },
  { id: 'ADM-002', name: 'Diya Reddy', email: 'diya.reddy@fieldwork.example', role: 'Super Admin', scope: 'National', approvalLimit: 1000000, active: true, mfaRequired: true, mfaResetRequested: false, sessionActive: true, canGrantRoles: true, device: 'Windows 11 · Edge', ipAddress: '103.21.44.18', lastSeen: '5m ago', sessionStartedAt: '1h ago' },
  { id: 'STA-014', name: 'Kiran Rao', email: 'kiran.rao@fieldwork.example', role: 'State Admin', scope: 'State · Telangana', approvalLimit: 250000, active: true, mfaRequired: true, mfaResetRequested: false, sessionActive: true, canGrantRoles: false, device: 'iPad · Safari', ipAddress: '49.36.180.4', lastSeen: '12m ago', sessionStartedAt: '40m ago' },
  { id: 'CITY-028', name: 'Maya Iyer', email: 'maya.iyer@fieldwork.example', role: 'City Admin', scope: 'City · Hyderabad', approvalLimit: 100000, active: true, mfaRequired: true, mfaResetRequested: true, sessionActive: false, canGrantRoles: false, device: 'Android · Chrome', ipAddress: '49.205.61.77', lastSeen: 'Yesterday', sessionStartedAt: 'Yesterday' },
  { id: 'ZONE-061', name: 'Rohan Kumar', email: 'rohan.kumar@fieldwork.example', role: 'Zone Admin', scope: 'Zone · Hyderabad East', approvalLimit: 50000, active: true, mfaRequired: false, mfaResetRequested: false, sessionActive: true, canGrantRoles: false, device: 'Android · Chrome', ipAddress: '49.205.44.132', lastSeen: 'Just now', sessionStartedAt: '25m ago' },
  { id: 'AUD-009', name: 'Anika Shah', email: 'anika.shah@fieldwork.example', role: 'Auditor', scope: 'National', approvalLimit: 0, active: true, mfaRequired: true, mfaResetRequested: false, sessionActive: true, canGrantRoles: false, device: 'MacBook Air · Safari', ipAddress: '103.21.44.22', lastSeen: 'Just now', sessionStartedAt: '3h ago' },
]
