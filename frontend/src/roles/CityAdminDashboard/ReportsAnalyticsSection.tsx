import { useMemo, useState, type ReactNode } from 'react'
import { ProgressCell, StatCards, type StatCard } from './shared'
import { cityProfile } from './cityAdminData'
import {
  applicationRows,
  cityReportCatalog,
  cityReportPeriods,
  occupancyRows,
  paymentRows,
  slaRows,
  supportRows,
  zonePerformanceRows,
  type CityReportId,
} from './cityReportsData'

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`

const round1 = (value: number) => Math.round(value * 10) / 10

const isoDay = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return date.toISOString().slice(0, 10)
}

const sumBy = <T,>(rows: T[], pick: (row: T) => number) => rows.reduce((total, row) => total + pick(row), 0)

const weightedAvg = <T,>(rows: T[], value: (row: T) => number, weight: (row: T) => number) => {
  const totalWeight = rows.reduce((total, row) => total + weight(row), 0)
  if (totalWeight === 0) return 0
  return rows.reduce((total, row) => total + value(row) * weight(row), 0) / totalWeight
}

const groupRows = <T,>(rows: T[], keyFn: (row: T) => string) => {
  const map = new Map<string, T[]>()
  rows.forEach((row) => {
    const key = keyFn(row)
    const list = map.get(key)
    if (list) list.push(row)
    else map.set(key, [row])
  })
  return [...map.values()]
}

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

type ReportView = {
  cards: StatCard[]
  columns: string[]
  rows: ReactNode[][]
  csv: Array<Array<string | number>>
  note?: string
}

type ReportsAnalyticsSectionProps = {
  onToast?: (message: string) => void
}

export default function ReportsAnalyticsSection({ onToast }: ReportsAnalyticsSectionProps) {
  const [report, setReport] = useState<CityReportId>('applications')
  const [periodId, setPeriodId] = useState('30')
  const [from, setFrom] = useState(isoDay(29))
  const [to, setTo] = useState(isoDay(0))

  const activeReport = cityReportCatalog.find((item) => item.id === report) ?? cityReportCatalog[0]

  const applyPeriod = (id: string) => {
    setPeriodId(id)
    const preset = cityReportPeriods.find((item) => item.id === id)
    const days = preset ? preset.days : 30
    setFrom(isoDay(days - 1))
    setTo(isoDay(0))
  }

  const view: ReportView = useMemo(() => {
    const inRange = (date: string) => date >= from && date <= to

    if (report === 'applications') {
      const rows = applicationRows.filter((row) => inRange(row.date))
      const grouped = groupRows(rows, (row) => row.zone)
        .map((list) => {
          const submitted = sumBy(list, (row) => row.submitted)
          const approved = sumBy(list, (row) => row.approved)
          return {
            zone: list[0].zone,
            submitted,
            approved,
            rejected: sumBy(list, (row) => row.rejected),
            hrs: round1(weightedAvg(list, (row) => row.avgApprovalHrs, (row) => row.submitted)),
          }
        })
        .sort((a, b) => b.submitted - a.submitted)
      const submitted = sumBy(rows, (row) => row.submitted)
      const approved = sumBy(rows, (row) => row.approved)
      const cards: StatCard[] = [
        { key: 'sub', label: 'Applications', value: submitted, tone: 'brand', static: true, sub: `${from} to ${to}` },
        { key: 'app', label: 'Approved', value: approved, tone: 'green', static: true, sub: 'Within range' },
        { key: 'rate', label: 'Approval rate', value: `${submitted ? Math.round((approved / submitted) * 100) : 0}%`, tone: 'blue', static: true },
        { key: 'hrs', label: 'Avg approval time', value: `${round1(weightedAvg(rows, (row) => row.avgApprovalHrs, (row) => row.submitted))} h`, tone: 'amber', static: true },
      ]
      return {
        cards,
        columns: ['Zone', 'Submitted', 'Approved', 'Rejected', 'Avg approval (h)'],
        rows: grouped.map((row) => [row.zone, row.submitted, row.approved, row.rejected, row.hrs]),
        csv: grouped.map((row) => [row.zone, row.submitted, row.approved, row.rejected, row.hrs]),
      }
    }

    if (report === 'occupancy') {
      const grouped = occupancyRows
        .map((row) => ({ ...row, pct: Math.round((row.occupied / row.total) * 100) }))
        .sort((a, b) => b.pct - a.pct)
      const total = sumBy(occupancyRows, (row) => row.total)
      const occupied = sumBy(occupancyRows, (row) => row.occupied)
      const cards: StatCard[] = [
        { key: 'tot', label: 'Properties listed', value: total, tone: 'brand', static: true },
        { key: 'occ', label: 'Occupied', value: occupied, tone: 'green', static: true },
        { key: 'av', label: 'Available', value: total - occupied, tone: 'amber', static: true },
        { key: 'pct', label: 'Occupancy', value: `${Math.round((occupied / total) * 100)}%`, tone: 'blue', static: true },
      ]
      return {
        cards,
        columns: ['Zone', 'Area', 'Total', 'Occupied', 'Available', 'Occupancy'],
        rows: grouped.map((row) => [
          row.zone,
          row.area,
          row.total,
          row.occupied,
          row.available,
          <ProgressCell key={row.zone} value={row.pct} />,
        ]),
        csv: grouped.map((row) => [row.zone, row.area, row.total, row.occupied, row.available, `${row.pct}%`]),
        note: 'Snapshot of current property listings across Hyderabad zones.',
      }
    }

    if (report === 'collections') {
      const rows = paymentRows.filter((row) => inRange(row.date))
      const grouped = groupRows(rows, (row) => row.zone)
        .map((list) => ({
          zone: list[0].zone,
          collected: sumBy(list, (row) => row.collected),
          outstanding: sumBy(list, (row) => row.outstanding),
          invoices: sumBy(list, (row) => row.invoices),
        }))
        .sort((a, b) => b.collected - a.collected)
      const collected = sumBy(rows, (row) => row.collected)
      const outstanding = sumBy(rows, (row) => row.outstanding)
      const cards: StatCard[] = [
        { key: 'col', label: 'Collected', value: inr(collected), tone: 'green', static: true, sub: `${from} to ${to}` },
        { key: 'out', label: 'Outstanding', value: inr(outstanding), tone: 'amber', static: true },
        { key: 'inv', label: 'Invoices', value: sumBy(rows, (row) => row.invoices), tone: 'blue', static: true },
        { key: 'rate', label: 'Collection rate', value: `${collected + outstanding ? Math.round((collected / (collected + outstanding)) * 100) : 0}%`, tone: 'brand', static: true },
      ]
      return {
        cards,
        columns: ['Zone', 'Collected', 'Outstanding', 'Invoices'],
        rows: grouped.map((row) => [row.zone, inr(row.collected), inr(row.outstanding), row.invoices]),
        csv: grouped.map((row) => [row.zone, row.collected, row.outstanding, row.invoices]),
      }
    }

    if (report === 'zones') {
      const sorted = [...zonePerformanceRows].sort((a, b) => b.revenue - a.revenue)
      const cards: StatCard[] = [
        { key: 'zones', label: 'Zones covered', value: zonePerformanceRows.length, tone: 'brand', static: true },
        { key: 'apps', label: 'Applications', value: sumBy(zonePerformanceRows, (row) => row.applications), tone: 'blue', static: true },
        { key: 'rev', label: 'Revenue', value: inr(sumBy(zonePerformanceRows, (row) => row.revenue)), tone: 'green', static: true },
        { key: 'occ', label: 'Avg occupancy', value: `${Math.round(sumBy(zonePerformanceRows, (row) => row.occupancyPct) / zonePerformanceRows.length)}%`, tone: 'purple', static: true },
      ]
      return {
        cards,
        columns: ['Zone', 'Applications', 'Approvals', 'Revenue', 'Occupancy', 'Collection', 'Resolution'],
        rows: sorted.map((row) => [
          row.zone,
          row.applications,
          row.approvals,
          inr(row.revenue),
          <ProgressCell key={`o-${row.zone}`} value={row.occupancyPct} />,
          <ProgressCell key={`c-${row.zone}`} value={row.collectionPct} />,
          <ProgressCell key={`r-${row.zone}`} value={row.resolutionPct} />,
        ]),
        csv: sorted.map((row) => [
          row.zone,
          row.applications,
          row.approvals,
          row.revenue,
          `${row.occupancyPct}%`,
          `${row.collectionPct}%`,
          `${row.resolutionPct}%`,
        ]),
        note: 'Ranked by revenue. Occupancy, collection and resolution shown as progress.',
      }
    }

    if (report === 'sla') {
      const sorted = [...slaRows].sort((a, b) => b.compliancePct - a.compliancePct)
      const tickets = sumBy(slaRows, (row) => row.tickets)
      const metResolution = sumBy(slaRows, (row) => row.metResolution)
      const cards: StatCard[] = [
        { key: 't', label: 'Tickets', value: tickets, tone: 'brand', static: true },
        { key: 'comp', label: 'Avg SLA compliance', value: `${Math.round(sumBy(slaRows, (row) => row.compliancePct) / slaRows.length)}%`, tone: 'green', static: true },
        { key: 'met', label: 'Resolved in SLA', value: `${tickets ? Math.round((metResolution / tickets) * 100) : 0}%`, tone: 'blue', static: true },
        { key: 'resp', label: 'Avg first response', value: `${Math.round(sumBy(slaRows, (row) => row.avgResponseMins) / slaRows.length)} min`, tone: 'amber', static: true },
      ]
      return {
        cards,
        columns: ['Zone', 'Tickets', 'Met first response', 'Met resolution', 'Avg response', 'Compliance'],
        rows: sorted.map((row) => [
          row.zone,
          row.tickets,
          row.metFirstResponse,
          row.metResolution,
          `${row.avgResponseMins} min`,
          <ProgressCell key={row.zone} value={row.compliancePct} />,
        ]),
        csv: sorted.map((row) => [
          row.zone,
          row.tickets,
          row.metFirstResponse,
          row.metResolution,
          `${row.avgResponseMins} min`,
          `${row.compliancePct}%`,
        ]),
        note: 'First response within 30 minutes · resolution within 24 hours.',
      }
    }

    const rows = supportRows.filter((row) => inRange(row.date))
    const grouped = groupRows(rows, (row) => row.category)
      .map((list) => {
        const tickets = sumBy(list, (row) => row.tickets)
        const resolved = sumBy(list, (row) => row.resolved)
        return {
          category: list[0].category,
          tickets,
          resolved,
          reopened: sumBy(list, (row) => row.reopened),
          response: Math.round(weightedAvg(list, (row) => row.avgResponseMins, (row) => row.tickets)),
          resolution: round1(weightedAvg(list, (row) => row.avgResolutionHrs, (row) => row.tickets)),
          rate: tickets ? Math.round((resolved / tickets) * 100) : 0,
        }
      })
      .sort((a, b) => b.tickets - a.tickets)
    const tickets = sumBy(rows, (row) => row.tickets)
    const resolved = sumBy(rows, (row) => row.resolved)
    const cards: StatCard[] = [
      { key: 't', label: 'Tickets', value: tickets, tone: 'brand', static: true, sub: `${from} to ${to}` },
      { key: 'r', label: 'Resolved', value: resolved, tone: 'green', static: true, sub: `${tickets ? Math.round((resolved / tickets) * 100) : 0}% resolution` },
      { key: 'resp', label: 'Avg first response', value: `${Math.round(weightedAvg(rows, (row) => row.avgResponseMins, (row) => row.tickets))} min`, tone: 'blue', static: true },
      { key: 'res', label: 'Avg resolution', value: `${round1(weightedAvg(rows, (row) => row.avgResolutionHrs, (row) => row.tickets))} h`, tone: 'amber', static: true },
    ]
    return {
      cards,
      columns: ['Category', 'Tickets', 'Resolved', 'Reopened', 'Avg response', 'Avg resolution', 'Resolution rate'],
      rows: grouped.map((row) => [row.category, row.tickets, row.resolved, row.reopened, `${row.response} min`, `${row.resolution} h`, <ProgressCell key={row.category} value={row.rate} />]),
      csv: grouped.map((row) => [row.category, row.tickets, row.resolved, row.reopened, `${row.response} min`, `${row.resolution} h`, `${row.rate}%`]),
    }
  }, [report, from, to])

  const rangeLabel = `${from} to ${to}`
  const fileBase = `city_${report}_${from}_to_${to}`

  const handleCsv = () => {
    downloadCsv(`${fileBase}.csv`, [[`${activeReport.label} · ${rangeLabel}`], [], view.columns, ...view.csv])
    onToast?.(`CSV exported · ${activeReport.label}`)
  }

  const handlePdf = () => {
    exportPdf(
      `${activeReport.label} report`,
      `${cityProfile.name}, ${cityProfile.state} · ${rangeLabel} · Generated by ${cityProfile.adminName} (City Admin)`,
      view.columns,
      view.csv as Array<Array<string | number>>,
    )
    onToast?.(`PDF export opened · ${activeReport.label}`)
  }

  return (
    <section className="sa-panel finance-panel">
      <div className="sa-panel-header">
        <div>
          <h3>Reports &amp; analytics</h3>
          <span className="sa-panel-sub">
            Cross-domain reporting for {cityProfile.name} with date-based filtering and authorized exports
          </span>
        </div>
        <div className="finance-header-controls">
          <button type="button" className="sa-btn-ghost" onClick={handleCsv}>
            Export CSV
          </button>
          <button type="button" className="sa-btn primary" onClick={handlePdf}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="sa-toolbar">
        {cityReportPeriods.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`sa-chip ${periodId === preset.id ? 'active orange' : ''}`}
            onClick={() => applyPeriod(preset.id)}
          >
            {preset.label}
          </button>
        ))}
        <span className="sa-toolbar-meta">Range</span>
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
        <span className="sa-toolbar-meta">to</span>
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
      </div>

      <div className="sa-chip-row finance-tabs">
        {cityReportCatalog.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sa-chip ${report === item.id ? 'active orange' : ''}`}
            onClick={() => setReport(item.id)}
            title={item.description}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="reports-note">
        <span className="sa-pill green">Authorized</span>
        <span>
          Reports limited to {cityProfile.name} · <strong>{activeReport.label}</strong> · {rangeLabel}
        </span>
      </div>

      <StatCards cards={view.cards} />

      {view.note && <p className="reports-range">{view.note}</p>}

      <div className="sa-table-wrap">
        <table className="sa-table">
          <thead>
            <tr>
              {view.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.length === 0 ? (
              <tr>
                <td colSpan={view.columns.length}>
                  <span className="sa-approval-meta">No data in the selected date range.</span>
                </td>
              </tr>
            ) : (
              view.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={cellIndex === 0 ? 'sa-cell-strong' : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
