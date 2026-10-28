export const accessSections = [
  'Users',
  'Roles & Permissions',
  'Approval Limits',
  'Sessions & Devices',
] as const

export type AccessSection = (typeof accessSections)[number]
