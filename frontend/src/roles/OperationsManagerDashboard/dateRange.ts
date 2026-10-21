// Shared date-range helpers for the Operations Manager pages.

export type DateRange = {
  from: string
  to: string
}

export const emptyDateRange: DateRange = { from: '', to: '' }

export const rangePresets = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
]

export const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const parseIso = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export const isoDaysAgo = (days: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return toIso(date)
}

export const formatDay = (value: string) =>
  parseIso(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatRangeLabel = (range: DateRange) => {
  if (!range.from && !range.to) return 'Any date'
  if (range.from && range.to) {
    if (range.from === range.to) return formatDay(range.from)
    return `${formatDay(range.from)} – ${formatDay(range.to)}`
  }
  return range.from ? `From ${formatDay(range.from)}` : `Until ${formatDay(range.to)}`
}
