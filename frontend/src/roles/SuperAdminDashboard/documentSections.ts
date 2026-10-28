export const documentSections = [
  'Vehicle Documents',
  'Driver Documents',
  'Owner Documents',
  'GST & Tax Documents',
  'Verification & Expiry Tracking',
  'Document History',
] as const

export type DocumentSection = (typeof documentSections)[number]
