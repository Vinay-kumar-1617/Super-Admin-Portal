import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import { opsProfile } from './operationsData'
import {
  zoneEscalationReport,
  zoneFinancialSummary,
  zoneReportPeriods,
} from './operationsData'
import {
  downtimeRows,
  incidentRows,
  isoDaysAgo,
  opsDailyRows,
  overdueReturnRows,
  slaDailyRows,
  slaTargets,
  staffProductivityRows,
} from './opsReportsData'
import { opsPermissions } from './opsRulesData'

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`

const round1 = (value: number) => Math.round(value * 10) / 10

const sumBy = <T,>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((total, row) => total + pick(row), 0)

const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const exportPdf = (title: string, subtitle: string, columns: string[], rows: Array<Array<string | number>>) => {
  const win = window.open('', '_blank', 'width=1024,height=768')
  if (!win) return
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`)
    .join('')
  win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1f2937; padding: 24px; }
      h1 { font-size: 18px; margin: 0 0 4px; }
      p.meta { color: #6b7280; font-size: 12px; margin: 0 0 16px; }
      table { border-collapse: collapse; width: 100%; font-size: 12px; }
      th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
      th { background: #f3f4f6; font-weight: 700; }
      tr:nth-child(even) td { background: #fafafa; }
    </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">${escapeHtml(subtitle)}</p>
    <table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
    <tbody>${body}</tbody></table>
    </body></html>`)
  win.document.close()
  win.focus()
  win.print()
}

const reportsStyles = `
  .om-rules-intro {
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-brand);
    border-radius: 16px;
    padding: 16px 20px;
    background: #fffaf3;
    display: grid;
    gap: 8px;
  }
  .om-rules-intro strong {
    font-size: 0.9rem;
    color: var(--sa-brand-deep);
  }
  .om-rules-intro p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .om-kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 10px;
  }
  .om-kpi-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 8px;
  }
  .om-kpi-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .om-kpi-label {
    margin: 0;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--sa-muted);
  }
  .om-kpi-value {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--sa-text);
  }
  .om-kpi-change {
    font-size: 0.7rem;
    font-weight: 800;
  }
  .om-kpi-change.up { color: var(--sa-green); }
  .om-kpi-change.down { color: var(--sa-red); }
  .om-kpi-change.flat { color: var(--sa-muted); }
  .om-kpi-sub {
    margin: 0;
    font-size: 0.76rem;
    color: var(--sa-muted);
    line-height: 1.5;
  }
  .om-cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 14px;
    margin-top: 20px;
  }
  .om-cat-card.active {
    border-color: rgba(255, 107, 44, 0.45);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  }
  .om-filter-meta {
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--sa-muted);
  }
  .om-cat-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 10px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .om-cat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
    border-color: rgba(255, 107, 44, 0.45);
  }
  .om-cat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .om-cat-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #f3f6f7;
    flex-shrink: 0;
  }
  .om-cat-icon svg { width: 16px; height: 16px; }
  .om-cat-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
  }
  .om-cat-desc {
    margin: 0;
    font-size: 0.78rem;
    color: var(--sa-muted);
    line-height: 1.5;
  }
  .om-filter-bar {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 14px 18px;
    background: #fbfcfd;
    display: grid;
    gap: 12px;
    margin-top: 20px;
  }
  .om-filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .om-filter-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--sa-muted);
    flex-shrink: 0;
  }
  .om-detail {
    margin-top: 20px;
    display: grid;
    gap: 16px;
  }
  .om-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .om-detail-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .om-detail-title h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .om-detail-sub {
    margin: 0;
    font-size: 0.78rem;
    color: var(--sa-muted);
  }
  .om-export-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .om-charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 12px;
  }
  .om-chart-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 12px;
  }
  .om-chart-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .om-chart-title {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--sa-muted);
  }
  .om-chart-wrap {
    position: relative;
    height: 190px;
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }
  .om-chart-col {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 24px;
  }
  .om-bar {
    width: 100%;
    max-width: 52px;
    flex: 0 0 auto;
    border-radius: 6px 6px 0 0;
    background: linear-gradient(180deg, var(--sa-brand), rgba(255, 107, 44, 0.55));
    min-height: 6px;
    position: relative;
  }
  .om-bar-label {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.68rem;
    color: var(--sa-muted);
    white-space: nowrap;
  }
  .om-bar-value {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--sa-text);
    white-space: nowrap;
  }
  .om-table-wrap { overflow-x: auto; }
  .om-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 720px;
    font-size: 0.82rem;
  }
  .om-table th {
    text-align: left;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sa-muted);
    padding: 12px 16px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: #fbfcfd;
    white-space: nowrap;
  }
  .om-table td {
    padding: 11px 16px;
    vertical-align: middle;
    color: var(--sa-text);
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    white-space: nowrap;
  }
  .om-table tr:last-child td { border-bottom: 0; }
  .om-table tr:hover td { background: #f8fafc; }
  .om-empty {
    padding: 36px 18px;
    text-align: center;
    display: grid;
    gap: 12px;
    justify-items: center;
    color: var(--sa-muted);
  }

  @media (max-width: 720px) {
    .om-kpi-grid { grid-template-columns: 1fr; }
    .om-cat-grid { grid-template-columns: 1fr; }
    .om-charts { grid-template-columns: 1fr; }
    .om-table { font-size: 0.78rem; }
    .om-table th, .om-table td { padding: 8px 12px; }
  }
`
type ReportCategoryId =
  | 'summary'
  | 'utilization'
  | 'bookings'
  | 'logistics'
  | 'returns'
  | 'downtime'
  | 'staff'
  | 'incidents'
  | 'sla'
  | 'finance'
  | 'escalations'

type StatCard = {
  key: string
  label: string
  value: string
  tone: 'blue' | 'orange' | 'purple' | 'green' | 'amber' | 'red'
  sub: string
}

const categoryIcons: Record<string, string> = {
  Summary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  Utilization: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20a8 8 0 1 0-8-8"/><path d="M4 12h4l2-6 3 12 2.5-6H20"/></svg>`,
  Bookings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="17" width="20" height="5" rx="2" ry="2"/><circle cx="7" cy="22" r="2"/><circle cx="17" cy="22" r="2"/><path d="M7 22V12a5 5 0 0 1 10 0v10"/></svg>`,
  Logistics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 3h13v13H1z"/><path d="M14 8h4l3 3v5h-7z"/><circle cx="5.5" cy="19.5" r="2"/><circle cx="17.5" cy="19.5" r="2"/></svg>`,
  Returns: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
  Downtime: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1 0 8.49l-3.76 3.76z"/><path d="M3 21h9"/></svg>`,
  Staff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`,
  Incidents: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  SLA: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
  Finance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  Escalations: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2V22M2 12h20"/></svg>`,
}

const reportMeta: Record<ReportCategoryId, { title: string; sub: string }> = {
  summary: { title: 'Zone Summary', sub: `Key metrics for ${opsProfile.zone} zone · ${opsProfile.city}, ${opsProfile.state}` },
  utilization: { title: 'Vehicle Utilization', sub: `Fleet hours on hire, idle time and downtime for ${opsProfile.zone} zone` },
  bookings: { title: 'Booking Activity', sub: `Bookings created, confirmed, completed and cancelled for ${opsProfile.zone} zone` },
  logistics: { title: 'Pickup & Delivery Performance', sub: `On-time pickups, deliveries and delay trends for ${opsProfile.zone} zone` },
  returns: { title: 'Overdue Returns', sub: `Returns past their due date, penalties and extensions for ${opsProfile.zone} zone` },
  downtime: { title: 'Maintenance Downtime', sub: `Planned and unplanned downtime, repair time and cost for ${opsProfile.zone} zone` },
  staff: { title: 'Staff Productivity', sub: `Jobs completed, hours on site and on-time rate for ${opsProfile.zone} zone` },
  incidents: { title: 'Incidents', sub: `Operational incidents, severity and resolution for ${opsProfile.zone} zone` },
  sla: { title: 'SLA Compliance', sub: `Response and resolution against each zone SLA for ${opsProfile.zone} zone` },
  finance: { title: 'Financial Report', sub: `Revenue, payments and collections for ${opsProfile.zone} zone` },
  escalations: { title: 'Escalation Report', sub: `Escalations by severity for ${opsProfile.zone} zone` },
}

const reportCategories: Array<{ id: ReportCategoryId; label: string; desc: string; icon: string }> = [
  { id: 'summary', label: 'Zone Summary', desc: 'Key operational metrics and KPIs', icon: 'Summary' },
  { id: 'utilization', label: 'Vehicle Utilization', desc: 'Hours on hire, idle and downtime', icon: 'Utilization' },
  { id: 'bookings', label: 'Booking Activity', desc: 'Volume, status and cancellations', icon: 'Bookings' },
  { id: 'logistics', label: 'Pickup & Delivery', desc: 'On-time slots and delay trends', icon: 'Logistics' },
  { id: 'returns', label: 'Overdue Returns', desc: 'Late returns and penalties', icon: 'Returns' },
  { id: 'downtime', label: 'Maintenance Downtime', desc: 'Downtime hours, MTTR and cost', icon: 'Downtime' },
  { id: 'staff', label: 'Staff Productivity', desc: 'Jobs, hours and on-time rate', icon: 'Staff' },
  { id: 'incidents', label: 'Incidents', desc: 'Severity and resolution times', icon: 'Incidents' },
  { id: 'sla', label: 'SLA Compliance', desc: 'Met, breached and response time', icon: 'SLA' },
  { id: 'finance', label: 'Finance', desc: 'Revenue and collections', icon: 'Finance' },
  { id: 'escalations', label: 'Escalations', desc: 'Severity and response times', icon: 'Escalations' },
]

const exportPermission = opsPermissions.find((permission) => permission.key === 'report.export')
const canExportReports = exportPermission?.effect === 'allow'

export default function ReportsSection({ onToast }: { onToast?: (message: string) => void }) {
  const [activeReport, setActiveReport] = useState<ReportCategoryId>('summary')
  const [periodId, setPeriodId] = useState('30')
  const [from, setFrom] = useState(isoDaysAgo(29))
  const [to, setTo] = useState(isoDaysAgo(0))

  const activeCategory = reportMeta[activeReport]

  const applyPeriod = (id: string) => {
    setPeriodId(id)
    const preset = zoneReportPeriods.find((item) => item.id === id)
    const days = preset ? preset.days : 30
    setFrom(isoDaysAgo(days - 1))
    setTo(isoDaysAgo(0))
  }

  // Every dated dataset is narrowed to the selected range, so the date
  // filters change the numbers that are shown, not just the heading.
  const daily = useMemo(() => opsDailyRows.filter((row) => row.date >= from && row.date <= to), [from, to])
  const slaDaily = useMemo(() => slaDailyRows.filter((row) => row.date >= from && row.date <= to), [from, to])
  const overdue = useMemo(() => overdueReturnRows.filter((row) => row.date >= from && row.date <= to), [from, to])
  const downtime = useMemo(() => downtimeRows.filter((row) => row.date >= from && row.date <= to), [from, to])
  const incidents = useMemo(() => incidentRows.filter((row) => row.date >= from && row.date <= to), [from, to])
  const productivity = useMemo(
    () => staffProductivityRows.filter((row) => row.date >= from && row.date <= to),
    [from, to],
  )

  const days = daily.length || 1

  const totals = useMemo(() => {
    const onHire = daily.length ? daily[daily.length - 1].vehiclesOnHire : 0
    const fleet = daily.length ? daily[daily.length - 1].vehiclesTotal : 0
    const pickupsScheduled = sumBy(daily, (row) => row.pickupsScheduled)
    const pickupsOnTime = sumBy(daily, (row) => row.pickupsOnTime)
    const deliveriesScheduled = sumBy(daily, (row) => row.deliveriesScheduled)
    const deliveriesOnTime = sumBy(daily, (row) => row.deliveriesOnTime)
    const slaMet = sumBy(slaDaily, (row) => row.met)
    const slaBreached = sumBy(slaDaily, (row) => row.breached)
    const slaTotal = slaMet + slaBreached
    return {
      fleet,
      onHire,
      available: daily.length ? daily[daily.length - 1].vehiclesAvailable : 0,
      inMaintenance: daily.length ? daily[daily.length - 1].vehiclesMaintenance : 0,
      utilisationPct: fleet ? round1((onHire / fleet) * 100) : 0,
      hoursOnHire: sumBy(daily, (row) => row.hoursOnHire),
      idleHours: sumBy(daily, (row) => row.idleHours),
      downtimeHours: sumBy(daily, (row) => row.downtimeHours),
      bookingsCreated: sumBy(daily, (row) => row.bookingsCreated),
      bookingsConfirmed: sumBy(daily, (row) => row.bookingsConfirmed),
      bookingsCompleted: sumBy(daily, (row) => row.bookingsCompleted),
      bookingsCancelled: sumBy(daily, (row) => row.bookingsCancelled),
      bookingsActive: daily.length ? daily[daily.length - 1].bookingsActive : 0,
      revenue: sumBy(daily, (row) => row.revenue),
      revenueCollected: sumBy(daily, (row) => row.revenueCollected),
      pendingPayments: zoneFinancialSummary.pendingPayments,
      pickupsScheduled,
      pickupsOnTime,
      pickupsDelayed: pickupsScheduled - pickupsOnTime,
      pickupOnTimePct: pickupsScheduled ? round1((pickupsOnTime / pickupsScheduled) * 100) : 0,
      avgPickupDelayMins: daily.length
        ? Math.round(sumBy(daily, (row) => row.avgPickupDelayMins) / days)
        : 0,
      deliveriesScheduled,
      deliveriesOnTime,
      deliveriesDelayed: deliveriesScheduled - deliveriesOnTime,
      deliveryOnTimePct: deliveriesScheduled ? round1((deliveriesOnTime / deliveriesScheduled) * 100) : 0,
      avgDeliveryDelayMins: daily.length
        ? Math.round(sumBy(daily, (row) => row.avgDeliveryDelayMins) / days)
        : 0,
      returnsDue: sumBy(daily, (row) => row.returnsDue),
      returnsOverdue: sumBy(daily, (row) => row.returnsOverdue),
      slaMet,
      slaBreached,
      slaCompliancePct: slaTotal ? round1((slaMet / slaTotal) * 100) : 0,
      avgResponseMins: slaDaily.length
        ? Math.round(sumBy(slaDaily, (row) => row.responseMins) / slaDaily.length)
        : 0,
      avgResolutionHrs: slaDaily.length
        ? round1(sumBy(slaDaily, (row) => row.resolutionHrs) / slaDaily.length)
        : 0,
    }
  }, [daily, slaDaily, days])

  const slaSummary = useMemo(
    () =>
      slaTargets.map((target) => {
        const rows = slaDaily.filter((row) => row.sla === target.id)
        const met = sumBy(rows, (row) => row.met)
        const breached = sumBy(rows, (row) => row.breached)
        const total = met + breached
        return {
          ...target,
          met,
          breached,
          compliancePct: total ? round1((met / total) * 100) : 0,
          avgResponseMins: rows.length ? Math.round(sumBy(rows, (row) => row.responseMins) / rows.length) : 0,
          avgResolutionHrs: rows.length ? round1(sumBy(rows, (row) => row.resolutionHrs) / rows.length) : 0,
        }
      }),
    [slaDaily],
  )

  const bookingStatusRows = useMemo(
    () => [
      { status: 'Created', count: totals.bookingsCreated },
      { status: 'Confirmed', count: totals.bookingsConfirmed },
      { status: 'Active', count: totals.bookingsActive },
      { status: 'Completed', count: totals.bookingsCompleted },
      { status: 'Cancelled', count: totals.bookingsCancelled },
    ],
    [totals],
  )

  const fleetStatusRows = useMemo(
    () => [
      { status: 'On hire', count: totals.onHire },
      { status: 'Available', count: totals.available },
      { status: 'Maintenance', count: totals.inMaintenance },
    ],
    [totals],
  )

  const incidentSeverityRows = useMemo(
    () =>
      (['Critical', 'Warning', 'Info'] as const).map((severity) => ({
        severity,
        count: incidents.filter((row) => row.severity === severity).length,
        open: incidents.filter((row) => row.severity === severity && row.status !== 'Closed').length,
      })),
    [incidents],
  )

  const cards: StatCard[] = [
    { key: 'utilisation', label: 'Fleet utilisation', value: `${totals.utilisationPct}%`, tone: 'blue', sub: `${totals.onHire} of ${totals.fleet} on hire` },
    { key: 'bookings', label: 'Bookings', value: String(totals.bookingsCreated), tone: 'purple', sub: `${totals.bookingsCompleted} completed` },
    { key: 'onTime', label: 'Pickup on-time', value: `${totals.pickupOnTimePct}%`, tone: 'green', sub: `${totals.pickupsDelayed} delayed` },
    { key: 'overdue', label: 'Overdue returns', value: String(totals.returnsOverdue), tone: 'orange', sub: 'Past due date' },
    { key: 'sla', label: 'SLA compliance', value: `${totals.slaCompliancePct}%`, tone: 'amber', sub: `${totals.slaBreached} breached` },
    { key: 'revenue', label: 'Revenue', value: inr(totals.revenue), tone: 'red', sub: 'Collected in range' },
  ]

  const rangeLabel = `${from} to ${to}`
  const fileBase = `${opsProfile.zone.toLowerCase()}_zone_reports_${from}_to_${to}`

  // The exported table always mirrors what is on screen for the active report.
  const exportTable = useMemo(() => {
    switch (activeReport) {
      case 'utilization':
        return {
          columns: ['Date', 'Vehicles', 'On hire', 'Available', 'Maintenance', 'Utilisation %', 'Hours on hire', 'Idle hours', 'Downtime hours'],
          rows: daily.map((row) => [
            row.date,
            row.vehiclesTotal,
            row.vehiclesOnHire,
            row.vehiclesAvailable,
            row.vehiclesMaintenance,
            round1((row.vehiclesOnHire / row.vehiclesTotal) * 100),
            row.hoursOnHire,
            row.idleHours,
            row.downtimeHours,
          ]),
        }
      case 'bookings':
        return {
          columns: ['Date', 'Created', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Cancellation %', 'Revenue'],
          rows: daily.map((row) => [
            row.date,
            row.bookingsCreated,
            row.bookingsConfirmed,
            row.bookingsActive,
            row.bookingsCompleted,
            row.bookingsCancelled,
            round1((row.bookingsCancelled / row.bookingsCreated) * 100),
            row.revenue,
          ]),
        }
      case 'logistics':
        return {
          columns: ['Date', 'Pickups scheduled', 'Pickups on time', 'Pickups delayed', 'Avg pickup delay (min)', 'Deliveries scheduled', 'Deliveries on time', 'Deliveries delayed', 'Avg delivery delay (min)'],
          rows: daily.map((row) => [
            row.date,
            row.pickupsScheduled,
            row.pickupsOnTime,
            row.pickupsDelayed,
            row.avgPickupDelayMins,
            row.deliveriesScheduled,
            row.deliveriesOnTime,
            row.deliveriesDelayed,
            row.avgDeliveryDelayMins,
          ]),
        }
      case 'returns':
        return {
          columns: ['Reference', 'Raised on', 'Booking', 'Customer', 'Machine', 'Locality', 'Due date', 'Days overdue', 'Penalty', 'Status'],
          rows: overdue.map((row) => [
            row.id,
            row.date,
            row.bookingId,
            row.customer,
            row.machine,
            row.locality,
            row.dueDate,
            row.daysOverdue,
            row.penalty,
            row.status,
          ]),
        }
      case 'downtime':
        return {
          columns: ['Reference', 'Date', 'Machine', 'Type', 'Planned', 'Downtime hours', 'MTTR (hrs)', 'Cost', 'Workshop', 'Status'],
          rows: downtime.map((row) => [
            row.id,
            row.date,
            row.machine,
            row.type,
            row.planned ? 'Yes' : 'No',
            row.hours,
            row.mttrHrs,
            row.cost,
            row.workshop,
            row.status,
          ]),
        }
      case 'staff':
        return {
          columns: ['Reference', 'Date', 'Name', 'Role', 'Vehicle', 'Jobs completed', 'Hours on site', 'Utilisation %', 'On-time %', 'Rating', 'Status'],
          rows: productivity.map((row) => [
            row.id,
            row.date,
            row.name,
            row.role,
            row.vehicle,
            row.jobsCompleted,
            row.hoursOnSite,
            row.utilisationPct,
            row.onTimePct,
            row.rating,
            row.status,
          ]),
        }
      case 'incidents':
        return {
          columns: ['Reference', 'Date', 'Type', 'Severity', 'Site', 'Raised by', 'Status', 'Injuries', 'Resolution (hrs)'],
          rows: incidents.map((row) => [
            row.id,
            row.date,
            row.type,
            row.severity,
            row.site,
            row.raisedBy,
            row.status,
            row.injuries,
            row.resolutionHrs,
          ]),
        }
      case 'sla':
        return {
          columns: ['SLA', 'Target (min)', 'Met', 'Breached', 'Compliance %', 'Avg response (min)', 'Avg resolution (hrs)'],
          rows: slaSummary.map((row) => [
            row.name,
            row.targetMins,
            row.met,
            row.breached,
            row.compliancePct,
            row.avgResponseMins,
            row.avgResolutionHrs,
          ]),
        }
      case 'finance':
        return {
          columns: ['Metric', 'Value'],
          rows: [
            ['Revenue booked', totals.revenue],
            ['Revenue collected', totals.revenueCollected],
            ['Pending payments', totals.pendingPayments],
            ['Bookings created', totals.bookingsCreated],
            ['Bookings completed', totals.bookingsCompleted],
            ['Bookings cancelled', totals.bookingsCancelled],
            ['Average booking value', zoneFinancialSummary.avgBookingValue],
          ],
        }
      case 'escalations':
        return {
          columns: ['Severity', 'Count', 'Percentage'],
          rows: zoneEscalationReport.map((row) => [
            row.severity,
            row.count,
            round1((row.count / Math.max(1, sumBy(zoneEscalationReport, (item) => item.count))) * 100),
          ]),
        }
      default:
        return {
          columns: ['Metric', 'Value'],
          rows: [
            ['Days in range', daily.length],
            ['Fleet utilisation %', totals.utilisationPct],
            ['Hours on hire', totals.hoursOnHire],
            ['Idle hours', totals.idleHours],
            ['Downtime hours', totals.downtimeHours],
            ['Bookings created', totals.bookingsCreated],
            ['Bookings completed', totals.bookingsCompleted],
            ['Bookings cancelled', totals.bookingsCancelled],
            ['Pickup on-time %', totals.pickupOnTimePct],
            ['Delivery on-time %', totals.deliveryOnTimePct],
            ['Overdue returns', totals.returnsOverdue],
            ['SLA compliance %', totals.slaCompliancePct],
            ['Revenue', totals.revenue],
          ],
        }
    }
  }, [activeReport, daily, overdue, downtime, productivity, incidents, slaSummary, totals])

  const handleCsv = () => {
    if (!canExportReports) {
      onToast?.('Export not authorised for your account')
      return
    }
    const csv: Array<Array<string | number>> = [
      [`${activeCategory.title} · ${rangeLabel} · ${opsProfile.zone} zone`],
      [`${opsProfile.adminName} (Operations Manager) · ${opsProfile.zone} · ${opsProfile.city}, ${opsProfile.state}`],
      [],
      exportTable.columns,
      ...exportTable.rows.map((row) => row.map((cell) => String(cell))),
    ]
    downloadCsv(`${fileBase}.csv`, csv)
    onToast?.(`CSV exported · ${activeCategory.title} (${exportTable.rows.length} rows · ${opsProfile.zone} zone)`)
  }

  const handlePdf = () => {
    if (!canExportReports) {
      onToast?.('Export not authorised for your account')
      return
    }
    exportPdf(
      `${activeCategory.title} report`,
      `${opsProfile.zone}, ${opsProfile.city} · ${rangeLabel} · Generated by ${opsProfile.adminName} (Operations Manager) · Zone: ${opsProfile.zone}`,
      exportTable.columns,
      exportTable.rows,
    )
    onToast?.(`PDF export opened · ${activeCategory.title} (${opsProfile.zone} zone)`)
  }

  const chartMax = Math.max(1, ...bookingStatusRows.map((row) => row.count))
  const fleetMax = Math.max(1, ...fleetStatusRows.map((row) => row.count))

  return (
    <section className="sa-panel">
      <style>{reportsStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Operations reports &amp; analytics</h3>
          <span className="sa-panel-sub">
            Zone-scoped reporting for {opsProfile.zone} · {opsProfile.city}, {opsProfile.state} · {from} to {to}
          </span>
        </div>
        <div className="finance-header-controls">
          <span className="sa-pill slate">{canExportReports ? 'Export authorised' : 'Export restricted'}</span>
          <button type="button" className="sa-btn-ghost" onClick={handleCsv} disabled={!canExportReports}>
            Export CSV
          </button>
          <button type="button" className="sa-btn primary" onClick={handlePdf} disabled={!canExportReports}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="om-rules-intro">
        <strong>Your reporting authority is zone-scoped.</strong>
        <p>As the Operations Manager for {opsProfile.zone} zone, you can view reports and export data only for your assigned zone ({opsProfile.zone} · {opsProfile.city}, {opsProfile.state}). Data from other zones is hidden, and every export is recorded in the audit trail.</p>
      </div>

      <div className="om-kpi-grid">
        {cards.map((card) => (
          <div key={card.key} className="om-kpi-card">
            <div className="om-kpi-head">
              <span className="om-kpi-label">{card.label}</span>
              <span className={`om-kpi-change ${card.tone === 'green' || card.tone === 'blue' ? 'up' : card.tone === 'red' || card.tone === 'orange' ? 'down' : 'flat'}`}>
                {card.sub}
              </span>
            </div>
            <strong className="om-kpi-value">{card.value}</strong>
            <p className="om-kpi-sub">{card.sub === card.value ? '' : card.sub}</p>
          </div>
        ))}
      </div>

      <div className="om-cat-grid">
        {reportCategories.map((category) => (
          <div
            key={category.id}
            className={`om-cat-card ${activeReport === category.id ? 'active' : ''}`}
            onClick={() => setActiveReport(category.id)}
          >
            <div className="om-cat-head">
              <div className="om-cat-icon" dangerouslySetInnerHTML={{ __html: categoryIcons[category.icon] ?? categoryIcons.Summary }} />
              <div>
                <h4 className="om-cat-title">{category.label}</h4>
                <p className="om-cat-desc">{category.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="om-filter-bar">
        <div className="om-filter-row">
          <span className="om-filter-label">Period</span>
          {zoneReportPeriods.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`sa-chip ${periodId === preset.id ? 'active orange' : ''}`}
              onClick={() => applyPeriod(preset.id)}
            >
              {preset.label}
            </button>
          ))}
          <span className="om-filter-label">Range</span>
          <input
            className="sa-date"
            type="date"
            aria-label="Report from date"
            value={from}
            max={to}
            onChange={(event) => {
              setFrom(event.target.value)
              setPeriodId('custom')
            }}
          />
          <span className="om-filter-label">to</span>
          <input
            className="sa-date"
            type="date"
            aria-label="Report to date"
            value={to}
            min={from}
            onChange={(event) => {
              setTo(event.target.value)
              setPeriodId('custom')
            }}
          />
          <span className="om-filter-label">Days</span>
          <span className="om-filter-meta">{daily.length} days in range</span>
        </div>
      </div>

      <div className="om-detail">
        <div className="om-detail-header">
          <div className="om-detail-title">
            <h3>{activeCategory.title}</h3>
            <p className="om-detail-sub">{activeCategory.sub}</p>
          </div>
          <div className="om-export-group">
            <span className="sa-pill slate">{exportTable.rows.length} rows</span>
            <button type="button" className="sa-btn-ghost" onClick={handleCsv} disabled={!canExportReports}>
              Export CSV
            </button>
            <button type="button" className="sa-btn primary" onClick={handlePdf} disabled={!canExportReports}>
              Export PDF
            </button>
          </div>
        </div>

        {/* Zone summary */}
        {activeReport === 'summary' && (
          <>
            <div className="om-charts">
              <div className="om-chart-card">
                <div className="om-chart-head">
                  <span className="om-chart-title">Bookings by status</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--sa-muted)' }}>{totals.bookingsCreated} created</span>
                </div>
                <div className="om-chart-wrap">
                  {bookingStatusRows.map((row) => (
                    <div key={row.status} className="om-chart-col">
                      <div className="om-bar" style={{ height: `${(row.count / chartMax) * 100}%` }} title={`${row.status}: ${row.count}`}>
                        <span className="om-bar-value">{row.count}</span>
                      </div>
                      <span className="om-bar-label">{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="om-chart-card">
                <div className="om-chart-head">
                  <span className="om-chart-title">Fleet by status</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--sa-muted)' }}>{totals.fleet} vehicles</span>
                </div>
                <div className="om-chart-wrap">
                  {fleetStatusRows.map((row) => (
                    <div key={row.status} className="om-chart-col">
                      <div className="om-bar" style={{ height: `${(row.count / fleetMax) * 100}%` }} title={`${row.status}: ${row.count}`}>
                        <span className="om-bar-value">{row.count}</span>
                      </div>
                      <span className="om-bar-label">{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th style={{ textAlign: 'center' }}>Value</th>
                    <th style={{ textAlign: 'center' }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="sa-cell-strong">Fleet utilisation</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.utilisationPct}%</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.onHire} of {totals.fleet}</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Hours on hire</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.hoursOnHire}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.idleHours} idle hrs</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Bookings created</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.bookingsCreated}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.bookingsConfirmed} confirmed</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Bookings completed</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.bookingsCompleted}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>
                      {totals.bookingsCreated ? round1((totals.bookingsCompleted / totals.bookingsCreated) * 100) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Bookings cancelled</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.bookingsCancelled}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>
                      {totals.bookingsCreated ? round1((totals.bookingsCancelled / totals.bookingsCreated) * 100) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Pickup on-time</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.pickupOnTimePct}%</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.pickupsDelayed} delayed</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Delivery on-time</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.deliveryOnTimePct}%</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.deliveriesDelayed} delayed</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Overdue returns</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.returnsOverdue}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.returnsDue} due</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Maintenance downtime</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.downtimeHours} hrs</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.inMaintenance} in service</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">SLA compliance</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.slaCompliancePct}%</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{totals.slaBreached} breached</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Revenue</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{inr(totals.revenue)}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{inr(totals.revenueCollected)} collected</td>
                  </tr>
                  <tr>
                    <td className="sa-cell-strong">Pending payments</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{inr(totals.pendingPayments)}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Vehicle utilization */}
        {activeReport === 'utilization' && (
          <>
            <div className="om-kpi-grid">
              {[
                { label: 'Utilisation', value: `${totals.utilisationPct}%`, sub: `${totals.onHire} of ${totals.fleet} vehicles` },
                { label: 'Hours on hire', value: String(totals.hoursOnHire), sub: 'Across the range' },
                { label: 'Idle hours', value: String(totals.idleHours), sub: 'Available but unassigned' },
                { label: 'Downtime hours', value: String(totals.downtimeHours), sub: 'In maintenance' },
              ].map((item) => (
                <div key={item.label} className="om-kpi-card">
                  <div className="om-kpi-head">
                    <span className="om-kpi-label">{item.label}</span>
                  </div>
                  <strong className="om-kpi-value">{item.value}</strong>
                  <p className="om-kpi-sub">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>On hire</th>
                    <th style={{ textAlign: 'center' }}>Available</th>
                    <th style={{ textAlign: 'center' }}>Maintenance</th>
                    <th style={{ textAlign: 'center' }}>Utilisation</th>
                    <th style={{ textAlign: 'center' }}>Hours on hire</th>
                    <th style={{ textAlign: 'center' }}>Idle hrs</th>
                    <th style={{ textAlign: 'center' }}>Downtime hrs</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((row) => (
                    <tr key={row.date}>
                      <td className="sa-cell-strong">{row.date}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.vehiclesOnHire}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.vehiclesAvailable}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.vehiclesMaintenance}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{round1((row.vehiclesOnHire / row.vehiclesTotal) * 100)}%</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.hoursOnHire}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.idleHours}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.downtimeHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Booking activity */}
        {activeReport === 'bookings' && (
          <>
            <div className="om-kpi-grid">
              {[
                { label: 'Created', value: String(totals.bookingsCreated), sub: 'In range' },
                { label: 'Confirmed', value: String(totals.bookingsConfirmed), sub: 'Accepted by customer' },
                { label: 'Completed', value: String(totals.bookingsCompleted), sub: 'Returned and closed' },
                { label: 'Cancelled', value: String(totals.bookingsCancelled), sub: `${totals.bookingsCreated ? round1((totals.bookingsCancelled / totals.bookingsCreated) * 100) : 0}% of created` },
                { label: 'Revenue', value: inr(totals.revenue), sub: 'Booked in range' },
                { label: 'Collected', value: inr(totals.revenueCollected), sub: 'Payments received' },
              ].map((item) => (
                <div key={item.label} className="om-kpi-card">
                  <div className="om-kpi-head">
                    <span className="om-kpi-label">{item.label}</span>
                  </div>
                  <strong className="om-kpi-value">{item.value}</strong>
                  <p className="om-kpi-sub">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Created</th>
                    <th style={{ textAlign: 'center' }}>Confirmed</th>
                    <th style={{ textAlign: 'center' }}>Active</th>
                    <th style={{ textAlign: 'center' }}>Completed</th>
                    <th style={{ textAlign: 'center' }}>Cancelled</th>
                    <th style={{ textAlign: 'center' }}>Cancellation rate</th>
                    <th style={{ textAlign: 'center' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((row) => (
                    <tr key={row.date}>
                      <td className="sa-cell-strong">{row.date}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.bookingsCreated}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.bookingsConfirmed}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.bookingsActive}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.bookingsCompleted}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.bookingsCancelled}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{round1((row.bookingsCancelled / row.bookingsCreated) * 100)}%</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{inr(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pickup and delivery performance */}
        {activeReport === 'logistics' && (
          <>
            <div className="om-kpi-grid">
              {[
                { label: 'Pickups scheduled', value: String(totals.pickupsScheduled), sub: `${totals.pickupsOnTime} on time` },
                { label: 'Pickup on-time', value: `${totals.pickupOnTimePct}%`, sub: `${totals.pickupsDelayed} delayed` },
                { label: 'Avg pickup delay', value: `${totals.avgPickupDelayMins} min`, sub: 'Across the range' },
                { label: 'Deliveries scheduled', value: String(totals.deliveriesScheduled), sub: `${totals.deliveriesOnTime} on time` },
                { label: 'Delivery on-time', value: `${totals.deliveryOnTimePct}%`, sub: `${totals.deliveriesDelayed} delayed` },
                { label: 'Avg delivery delay', value: `${totals.avgDeliveryDelayMins} min`, sub: 'Across the range' },
              ].map((item) => (
                <div key={item.label} className="om-kpi-card">
                  <div className="om-kpi-head">
                    <span className="om-kpi-label">{item.label}</span>
                  </div>
                  <strong className="om-kpi-value">{item.value}</strong>
                  <p className="om-kpi-sub">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ textAlign: 'center' }}>Pickups</th>
                    <th style={{ textAlign: 'center' }}>On time</th>
                    <th style={{ textAlign: 'center' }}>Delayed</th>
                    <th style={{ textAlign: 'center' }}>Avg delay</th>
                    <th style={{ textAlign: 'center' }}>Deliveries</th>
                    <th style={{ textAlign: 'center' }}>On time</th>
                    <th style={{ textAlign: 'center' }}>Delayed</th>
                    <th style={{ textAlign: 'center' }}>Avg delay</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((row) => (
                    <tr key={row.date}>
                      <td className="sa-cell-strong">{row.date}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.pickupsScheduled}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.pickupsOnTime}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.pickupsDelayed}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.avgPickupDelayMins} min</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.deliveriesScheduled}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.deliveriesOnTime}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.deliveriesDelayed}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.avgDeliveryDelayMins} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Overdue returns */}
        {activeReport === 'returns' && (
          <>
            <div className="om-kpi-grid">
              {[
                { label: 'Overdue returns', value: String(overdue.length), sub: 'Raised in range' },
                { label: 'Avg days overdue', value: overdue.length ? String(Math.round(sumBy(overdue, (row) => row.daysOverdue) / overdue.length)) : '0', sub: 'Days past due date' },
                { label: 'Penalties', value: inr(sumBy(overdue, (row) => row.penalty)), sub: 'Recovery claimed' },
                { label: 'In review', value: String(overdue.filter((row) => row.status === 'In review').length), sub: 'Awaiting a decision' },
              ].map((item) => (
                <div key={item.label} className="om-kpi-card">
                  <div className="om-kpi-head">
                    <span className="om-kpi-label">{item.label}</span>
                  </div>
                  <strong className="om-kpi-value">{item.value}</strong>
                  <p className="om-kpi-sub">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Machine</th>
                    <th>Locality</th>
                    <th>Due date</th>
                    <th style={{ textAlign: 'center' }}>Days overdue</th>
                    <th style={{ textAlign: 'center' }}>Penalty</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.id}</td>
                      <td>{row.bookingId}</td>
                      <td>{row.customer}</td>
                      <td>{row.machine}</td>
                      <td>{row.locality}</td>
                      <td>{row.dueDate}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.daysOverdue}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{inr(row.penalty)}</td>
                      <td>
                        <StatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Maintenance downtime */}
        {activeReport === 'downtime' && (
          <>
            <div className="om-kpi-grid">
              {[
                { label: 'Downtime hours', value: String(sumBy(downtime, (row) => row.hours)), sub: `${downtime.length} events` },
                { label: 'Planned', value: String(downtime.filter((row) => row.planned).length), sub: 'Scheduled service' },
                { label: 'Unplanned', value: String(downtime.filter((row) => !row.planned).length), sub: 'Breakdowns' },
                { label: 'Avg MTTR', value: downtime.length ? `${round1(sumBy(downtime, (row) => row.mttrHrs) / downtime.length)} hrs` : '0 hrs', sub: 'Mean time to repair' },
                { label: 'Downtime cost', value: inr(sumBy(downtime, (row) => row.cost)), sub: 'Repairs and parts' },
                { label: 'Still open', value: String(downtime.filter((row) => row.status !== 'Completed').length), sub: 'In progress or overdue' },
              ].map((item) => (
                <div key={item.label} className="om-kpi-card">
                  <div className="om-kpi-head">
                    <span className="om-kpi-label">{item.label}</span>
                  </div>
                  <strong className="om-kpi-value">{item.value}</strong>
                  <p className="om-kpi-sub">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Machine</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'center' }}>Planned</th>
                    <th style={{ textAlign: 'center' }}>Hours</th>
                    <th style={{ textAlign: 'center' }}>MTTR</th>
                    <th style={{ textAlign: 'center' }}>Cost</th>
                    <th>Workshop</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {downtime.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.id}</td>
                      <td>{row.date}</td>
                      <td>{row.machine}</td>
                      <td>{row.type}</td>
                      <td style={{ textAlign: 'center' }}>{row.planned ? 'Yes' : 'No'}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.hours}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.mttrHrs} hrs</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{inr(row.cost)}</td>
                      <td>{row.workshop}</td>
                      <td>
                        <StatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Staff productivity */}
        {activeReport === 'staff' && (
          <>
            <div className="om-kpi-grid">
              {[
                { label: 'Staff on shift', value: String(productivity.filter((row) => row.status === 'On shift').length), sub: `${productivity.length} records` },
                { label: 'Jobs completed', value: String(sumBy(productivity, (row) => row.jobsCompleted)), sub: 'In range' },
                { label: 'Hours on site', value: String(sumBy(productivity, (row) => row.hoursOnSite)), sub: 'Delivered on site' },
                { label: 'Avg utilisation', value: `${productivity.length ? Math.round(sumBy(productivity, (row) => row.utilisationPct) / productivity.length) : 0}%`, sub: 'Across the range' },
                { label: 'Avg on-time', value: `${productivity.length ? Math.round(sumBy(productivity, (row) => row.onTimePct) / productivity.length) : 0}%`, sub: 'Slot adherence' },
                { label: 'Avg rating', value: productivity.length ? `${round1(sumBy(productivity, (row) => row.rating) / productivity.length)}` : '0', sub: 'Customer feedback' },
              ].map((item) => (
                <div key={item.label} className="om-kpi-card">
                  <div className="om-kpi-head">
                    <span className="om-kpi-label">{item.label}</span>
                  </div>
                  <strong className="om-kpi-value">{item.value}</strong>
                  <p className="om-kpi-sub">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Vehicle</th>
                    <th style={{ textAlign: 'center' }}>Jobs</th>
                    <th style={{ textAlign: 'center' }}>Hours</th>
                    <th style={{ textAlign: 'center' }}>Utilisation</th>
                    <th style={{ textAlign: 'center' }}>On-time</th>
                    <th style={{ textAlign: 'center' }}>Rating</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productivity.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.date}</td>
                      <td>{row.name}</td>
                      <td>{row.role}</td>
                      <td>{row.vehicle}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.jobsCompleted}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.hoursOnSite}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.utilisationPct}%</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.onTimePct}%</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.rating}</td>
                      <td>
                        <StatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Incidents */}
        {activeReport === 'incidents' && (
          <>
            <div className="om-kpi-grid">
              {[
                { label: 'Incidents raised', value: String(incidents.length), sub: 'In range' },
                { label: 'Open', value: String(incidents.filter((row) => row.status !== 'Closed').length), sub: 'Not yet closed' },
                { label: 'Critical', value: String(incidentSeverityRows.find((row) => row.severity === 'Critical')?.count ?? 0), sub: 'Highest severity' },
                { label: 'With injuries', value: String(sumBy(incidents, (row) => row.injuries)), sub: 'Reported casualties' },
                { label: 'Avg resolution', value: incidents.length ? `${round1(sumBy(incidents, (row) => row.resolutionHrs) / incidents.length)} hrs` : '0 hrs', sub: 'To close' },
                { label: 'Avg response', value: `${totals.avgResponseMins} min`, sub: 'Against the incident SLA' },
              ].map((item) => (
                <div key={item.label} className="om-kpi-card">
                  <div className="om-kpi-head">
                    <span className="om-kpi-label">{item.label}</span>
                  </div>
                  <strong className="om-kpi-value">{item.value}</strong>
                  <p className="om-kpi-sub">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Site</th>
                    <th>Raised by</th>
                    <th style={{ textAlign: 'center' }}>Injuries</th>
                    <th style={{ textAlign: 'center' }}>Resolution</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.id}</td>
                      <td>{row.date}</td>
                      <td>{row.type}</td>
                      <td>
                        <StatusPill status={row.severity} />
                      </td>
                      <td>{row.site}</td>
                      <td>{row.raisedBy}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.injuries}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.resolutionHrs} hrs</td>
                      <td>
                        <StatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SLA compliance */}
        {activeReport === 'sla' && (
          <>
            <div className="om-kpi-grid">
              {[
                { label: 'Overall compliance', value: `${totals.slaCompliancePct}%`, sub: 'Across every SLA' },
                { label: 'Breached', value: String(totals.slaBreached), sub: 'Missed targets' },
                { label: 'Met', value: String(totals.slaMet), sub: 'Inside target' },
                { label: 'Avg response', value: `${totals.avgResponseMins} min`, sub: 'First action' },
                { label: 'Avg resolution', value: `${totals.avgResolutionHrs} hrs`, sub: 'To close' },
                { label: 'SLAs tracked', value: String(slaSummary.length), sub: 'Zone service levels' },
              ].map((item) => (
                <div key={item.label} className="om-kpi-card">
                  <div className="om-kpi-head">
                    <span className="om-kpi-label">{item.label}</span>
                  </div>
                  <strong className="om-kpi-value">{item.value}</strong>
                  <p className="om-kpi-sub">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Service level</th>
                    <th style={{ textAlign: 'center' }}>Target</th>
                    <th style={{ textAlign: 'center' }}>Met</th>
                    <th style={{ textAlign: 'center' }}>Breached</th>
                    <th style={{ textAlign: 'center' }}>Compliance</th>
                    <th style={{ textAlign: 'center' }}>Avg response</th>
                    <th style={{ textAlign: 'center' }}>Avg resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {slaSummary.map((row) => (
                    <tr key={row.id}>
                      <td className="sa-cell-strong">{row.name}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.targetMins} min</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.met}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.breached}</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.compliancePct}%</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.avgResponseMins} min</td>
                      <td className="sa-num" style={{ textAlign: 'center' }}>{row.avgResolutionHrs} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="om-table-wrap">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    {slaSummary.map((row) => (
                      <th key={row.id} style={{ textAlign: 'center' }}>{row.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {daily.map((row) => (
                    <tr key={row.date}>
                      <td className="sa-cell-strong">{row.date}</td>
                      {slaSummary.map((target) => {
                        const sample = slaDaily.find((item) => item.date === row.date && item.sla === target.id)
                        const total = (sample?.met ?? 0) + (sample?.breached ?? 0)
                        const pct = total ? round1(((sample?.met ?? 0) / total) * 100) : 0
                        return (
                          <td key={target.id} className="sa-num" style={{ textAlign: 'center' }}>
                            {pct}%
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Finance view */}
        {activeReport === 'finance' && (
          <div className="om-table-wrap">
            <table className="om-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th style={{ textAlign: 'center' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sa-cell-strong">Revenue booked</td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>{inr(totals.revenue)}</td>
                </tr>
                <tr>
                  <td className="sa-cell-strong">Revenue collected</td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>{inr(totals.revenueCollected)}</td>
                </tr>
                <tr>
                  <td className="sa-cell-strong">Pending Payments</td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>{inr(totals.pendingPayments)}</td>
                </tr>
                <tr>
                  <td className="sa-cell-strong">Total Bookings</td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>{totals.bookingsCreated}</td>
                </tr>
                <tr>
                  <td className="sa-cell-strong">Completed Bookings</td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>{totals.bookingsCompleted}</td>
                </tr>
                <tr>
                  <td className="sa-cell-strong">Cancelled Bookings</td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>{totals.bookingsCancelled}</td>
                </tr>
                <tr>
                  <td className="sa-cell-strong">Avg Booking Value</td>
                  <td className="sa-num" style={{ textAlign: 'center' }}>{inr(zoneFinancialSummary.avgBookingValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Escalations view */}
        {activeReport === 'escalations' && (
          <div className="om-table-wrap">
            <table className="om-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th style={{ textAlign: 'center' }}>Count</th>
                  <th style={{ textAlign: 'center' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {zoneEscalationReport.map((row) => (
                  <tr key={row.severity}>
                    <td className="sa-cell-strong">{row.severity}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>{row.count}</td>
                    <td className="sa-num" style={{ textAlign: 'center' }}>
                      {round1((row.count / sumBy(zoneEscalationReport, (item) => item.count)) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
