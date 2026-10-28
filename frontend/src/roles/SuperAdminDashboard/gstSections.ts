export const gstSections = [
  'GST Settings',
  'Owner GST Details',
  'Tax Configuration',
  'Invoices & Billing',
  'Reports & Compliance',
  'GST Audit Logs',
] as const

export type GstSection = (typeof gstSections)[number]
