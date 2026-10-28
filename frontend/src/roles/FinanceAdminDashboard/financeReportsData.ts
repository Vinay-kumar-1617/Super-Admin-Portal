export type FinancialReportRecord = {
  date: string
  equipment: string
  revenue: number
  ownerEarnings: number
  operatorWages: number
  operatingExpenses: number
  customerDues: number
  taxCollected: number
  taxPaid: number
}

export type FinancialReportTotals = {
  revenue: number
  expenses: number
  netProfit: number
  ownerEarnings: number
  operatorWages: number
  customerDues: number
  taxCollected: number
  taxPaid: number
}

export type FinancialReportPoint = FinancialReportTotals & {
  key: string
  label: string
}

export type EquipmentProfitability = {
  equipment: string
  revenue: number
  expenses: number
  netProfit: number
  margin: number
}

export type FinancialReport = {
  startDate: string
  endDate: string
  totals: FinancialReportTotals
  series: FinancialReportPoint[]
  equipment: EquipmentProfitability[]
}

export type FinancialReportRange = 'daily' | 'weekly' | 'monthly' | 'custom'

const equipmentTypes = [
  { name: 'Excavators', weight: 0.34 },
  { name: 'Cranes', weight: 0.24 },
  { name: 'Loaders & JCBs', weight: 0.27 },
  { name: 'Generators', weight: 0.15 },
]

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

export const financialReportRecords: FinancialReportRecord[] = Array.from({ length: 120 }, (_, dayIndex) => {
  const date = new Date(Date.UTC(2026, 0, dayIndex + 1))
  const day = dayIndex + 1
  const dateString = toIsoDate(date)

  return equipmentTypes.map(({ name, weight }, equipmentIndex) => {
    const dailyBase = 1050000 + ((day * 7919 + equipmentIndex * 19013) % 410000)
    const revenue = Math.round(dailyBase * weight)
    const ownerEarnings = Math.round(revenue * (0.53 + equipmentIndex * 0.01))
    const operatorWages = Math.round(revenue * (0.12 + (day % 4) * 0.005))
    const operatingExpenses = Math.round(revenue * (0.08 + equipmentIndex * 0.008))
    const customerDues = Math.round(revenue * ((day + equipmentIndex) % 5 === 0 ? 0.14 : 0.055))
    const taxCollected = Math.round(revenue * 0.18)
    const taxPaid = Math.round(taxCollected * (0.7 + (equipmentIndex % 2) * 0.05))

    return {
      date: dateString,
      equipment: name,
      revenue,
      ownerEarnings,
      operatorWages,
      operatingExpenses,
      customerDues,
      taxCollected,
      taxPaid,
    }
  })
}).flat()

const emptyTotals = (): FinancialReportTotals => ({
  revenue: 0,
  expenses: 0,
  netProfit: 0,
  ownerEarnings: 0,
  operatorWages: 0,
  customerDues: 0,
  taxCollected: 0,
  taxPaid: 0,
})

const addRecord = (totals: FinancialReportTotals, record: FinancialReportRecord) => {
  totals.revenue += record.revenue
  totals.expenses += record.ownerEarnings + record.operatorWages + record.operatingExpenses + record.taxPaid
  totals.ownerEarnings += record.ownerEarnings
  totals.operatorWages += record.operatorWages
  totals.customerDues += record.customerDues
  totals.taxCollected += record.taxCollected
  totals.taxPaid += record.taxPaid
  totals.netProfit += record.revenue - record.ownerEarnings - record.operatorWages - record.operatingExpenses - record.taxPaid
  return totals
}

const rangeDates = (startDate: string, endDate: string) =>
  financialReportRecords.filter((record) => record.date >= startDate && record.date <= endDate)

const dayLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })

const periodFor = (date: string, range: FinancialReportRange): { key: string; label: string } => {
  const parsed = new Date(`${date}T00:00:00Z`)
  if (range === 'monthly') {
    const key = date.slice(0, 7)
    return { key, label: parsed.toLocaleDateString('en-IN', { month: 'short', year: '2-digit', timeZone: 'UTC' }) }
  }
  if (range === 'weekly') {
    const start = new Date(parsed)
    const weekday = (start.getUTCDay() + 6) % 7
    start.setUTCDate(start.getUTCDate() - weekday)
    const key = toIsoDate(start)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 6)
    return { key, label: `${dayLabel(key)}–${dayLabel(toIsoDate(end))}` }
  }
  return { key: date, label: dayLabel(date) }
}

export const buildFinancialReport = (
  startDate: string,
  endDate: string,
  range: FinancialReportRange,
): FinancialReport => {
  const records = rangeDates(startDate, endDate)
  const totals = records.reduce(addRecord, emptyTotals())
  const points = new Map<string, FinancialReportPoint>()
  const equipmentRows = new Map<string, EquipmentProfitability>()

  records.forEach((record) => {
    const period = periodFor(record.date, range)
    let point = points.get(period.key)
    if (!point) {
      point = { ...emptyTotals(), ...period }
      points.set(period.key, point)
    }
    addRecord(point, record)

    let equipment = equipmentRows.get(record.equipment)
    if (!equipment) {
      equipment = { equipment: record.equipment, revenue: 0, expenses: 0, netProfit: 0, margin: 0 }
      equipmentRows.set(record.equipment, equipment)
    }
    equipment.revenue += record.revenue
    equipment.expenses += record.ownerEarnings + record.operatorWages + record.operatingExpenses + record.taxPaid
    equipment.netProfit +=
      record.revenue - record.ownerEarnings - record.operatorWages - record.operatingExpenses - record.taxPaid
  })

  const equipment = [...equipmentRows.values()]
    .map((row) => ({ ...row, margin: row.revenue === 0 ? 0 : (row.netProfit / row.revenue) * 100 }))
    .sort((a, b) => b.netProfit - a.netProfit)

  return {
    startDate,
    endDate,
    totals,
    series: [...points.values()].sort((a, b) => a.key.localeCompare(b.key)),
    equipment,
  }
}

export type ReportExportRow = {
  section: string
  period: string
  metric: string
  amount: number
}

export const financialReportExportRows = (report: FinancialReport): ReportExportRow[] => {
  const summary: ReportExportRow[] = [
    { section: 'Summary', period: `${report.startDate} to ${report.endDate}`, metric: 'Revenue', amount: report.totals.revenue },
    { section: 'Summary', period: `${report.startDate} to ${report.endDate}`, metric: 'Expenses', amount: report.totals.expenses },
    { section: 'Summary', period: `${report.startDate} to ${report.endDate}`, metric: 'Net profit', amount: report.totals.netProfit },
    { section: 'Summary', period: `${report.startDate} to ${report.endDate}`, metric: 'Owner earnings', amount: report.totals.ownerEarnings },
    { section: 'Summary', period: `${report.startDate} to ${report.endDate}`, metric: 'Operator wages', amount: report.totals.operatorWages },
    { section: 'Summary', period: `${report.startDate} to ${report.endDate}`, metric: 'Customer dues', amount: report.totals.customerDues },
    { section: 'Summary', period: `${report.startDate} to ${report.endDate}`, metric: 'Tax collected', amount: report.totals.taxCollected },
    { section: 'Summary', period: `${report.startDate} to ${report.endDate}`, metric: 'Tax paid', amount: report.totals.taxPaid },
  ]
  const periodRows = report.series.flatMap((point) => [
    { section: 'Period', period: point.label, metric: 'Revenue', amount: point.revenue },
    { section: 'Period', period: point.label, metric: 'Expenses', amount: point.expenses },
    { section: 'Period', period: point.label, metric: 'Net profit', amount: point.netProfit },
    { section: 'Period', period: point.label, metric: 'Owner earnings', amount: point.ownerEarnings },
    { section: 'Period', period: point.label, metric: 'Operator wages', amount: point.operatorWages },
    { section: 'Period', period: point.label, metric: 'Customer dues', amount: point.customerDues },
    { section: 'Period', period: point.label, metric: 'Tax collected', amount: point.taxCollected },
    { section: 'Period', period: point.label, metric: 'Tax paid', amount: point.taxPaid },
  ])
  const equipmentRows = report.equipment.flatMap((equipment) => [
    { section: 'Equipment profitability', period: equipment.equipment, metric: 'Revenue', amount: equipment.revenue },
    { section: 'Equipment profitability', period: equipment.equipment, metric: 'Expenses', amount: equipment.expenses },
    { section: 'Equipment profitability', period: equipment.equipment, metric: 'Net profit', amount: equipment.netProfit },
    { section: 'Equipment profitability', period: equipment.equipment, metric: 'Profit margin (%)', amount: equipment.margin },
  ])
  return [...summary, ...periodRows, ...equipmentRows]
}

const csvCell = (value: string | number) => {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export const financialReportToCsv = (report: FinancialReport) => {
  const rows = financialReportExportRows(report)
  return [
    ['Section', 'Period', 'Metric', 'Amount (INR)'].map(csvCell).join(','),
    ...rows.map((row) => [row.section, row.period, row.metric, row.amount].map(csvCell).join(',')),
  ].join('\r\n')
}

const xmlCell = (value: string | number) => {
  const type = typeof value === 'number' ? 'Number' : 'String'
  const text = String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
  return `<Cell><Data ss:Type="${type}">${text}</Data></Cell>`
}

export const financialReportToExcelXml = (report: FinancialReport) => {
  const rows = [
    ['Section', 'Period', 'Metric', 'Amount (INR)'],
    ...financialReportExportRows(report).map((row) => [row.section, row.period, row.metric, row.amount]),
  ]
  const worksheetRows = rows.map((row) => `<Row>${row.map(xmlCell).join('')}</Row>`).join('')
  return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Finance report"><Table>${worksheetRows}</Table></Worksheet></Workbook>`
}
