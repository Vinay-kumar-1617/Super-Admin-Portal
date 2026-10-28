import { useMemo, useState } from 'react'
import {
  buildFinancialReport,
  financialReportToCsv,
  financialReportToExcelXml,
  type FinancialReportRange,
} from './financeReportsData'
import type { SectionId } from './financeAdminData'

type ReportMetric = {
  label: string
  value: number
  tone: 'green' | 'orange' | 'blue' | 'purple'
  description: string
  target: SectionId
}

const metricTargetLabels: Record<SectionId, string> = {
  overview: 'Overview',
  commission: 'Commission',
  settlements: 'Settlements',
  'owner-settlements': 'Owner settlements',
  'operator-payments': 'Operator payments',
  'customer-payments': 'Customer payments',
  payouts: 'Payouts',
  invoices: 'Invoices',
  refunds: 'Refunds',
  reconciliation: 'Reconciliation',
  approvals: 'Approval center',
  reports: 'Reports',
  'audit-log': 'Audit Log',
  notifications: 'Notifications',
}

const dataEndDate = '2026-04-30'
const lastDay = new Date(`${dataEndDate}T00:00:00Z`)
const dateOffset = (date: Date, days: number) => {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString().slice(0, 10)
}

const formatCurrency = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`

const compactCurrency = (amount: number) => {
  if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return formatCurrency(amount)
}

const dateSpan = (range: FinancialReportRange) => {
  if (range === 'daily') return { start: dateOffset(lastDay, -6), end: dataEndDate }
  if (range === 'weekly') return { start: dateOffset(lastDay, -55), end: dataEndDate }
  return { start: '2026-01-01', end: dataEndDate }
}

const downloadReport = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const chartLegend = [
  { key: 'revenue', label: 'Revenue', color: 'revenue' },
  { key: 'expenses', label: 'Expenses', color: 'expenses' },
  { key: 'netProfit', label: 'Net profit', color: 'profit' },
] as const

export default function FinancialReportsSection({ onNavigate }: { onNavigate: (id: SectionId) => void }) {
  const [range, setRange] = useState<FinancialReportRange>('monthly')
  const [customStart, setCustomStart] = useState('2026-04-01')
  const [customEnd, setCustomEnd] = useState(dataEndDate)
  const [appliedCustomStart, setAppliedCustomStart] = useState('2026-04-01')
  const [appliedCustomEnd, setAppliedCustomEnd] = useState(dataEndDate)
  const [customError, setCustomError] = useState('')

  const dates = range === 'custom'
    ? { start: appliedCustomStart, end: appliedCustomEnd }
    : dateSpan(range)
  const customDays =
    (new Date(`${dates.end}T00:00:00Z`).getTime() - new Date(`${dates.start}T00:00:00Z`).getTime()) / 86400000
  const chartRange: FinancialReportRange =
    range === 'monthly' || range === 'weekly' || (range === 'custom' && customDays > 31) ? 'weekly' : 'daily'
  const report = useMemo(
    () => buildFinancialReport(dates.start, dates.end, chartRange),
    [dates.start, dates.end, chartRange],
  )
  const maxChartValue = Math.max(1, ...report.series.map((point) => point.revenue))
  const displayedRange = `${report.startDate} to ${report.endDate}`

  const applyPreset = (nextRange: FinancialReportRange) => {
    setRange(nextRange)
    setCustomError('')
  }

  const applyCustomRange = () => {
    if (!customStart || !customEnd || customStart > customEnd) {
      setCustomError('Choose a valid start date on or before the end date.')
      return
    }
    if (customStart < '2026-01-01' || customEnd > dataEndDate) {
      setCustomError('Available report data runs from 01 Jan 2026 through 30 Apr 2026.')
      return
    }
    setCustomError('')
    setAppliedCustomStart(customStart)
    setAppliedCustomEnd(customEnd)
    setRange('custom')
  }

  const exportFilename = `finance-report-${report.startDate}-to-${report.endDate}`

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Financial performance report</h3>
            <span className="sa-panel-sub">Revenue, expenses, earnings, receivables, tax and equipment returns · {displayedRange}</span>
          </div>
          <div className="sa-inline-edit">
            <button type="button" className="sa-btn-ghost" onClick={() => downloadReport(`${exportFilename}.csv`, financialReportToCsv(report), 'text/csv;charset=utf-8')}>
              Export CSV
            </button>
            <button type="button" className="sa-btn-ghost" onClick={() => downloadReport(`${exportFilename}.xls`, financialReportToExcelXml(report), 'application/vnd.ms-excel;charset=utf-8')}>
              Export Excel
            </button>
          </div>
        </div>

        <div className="sa-chip-row" aria-label="Financial report date ranges">
          {([
            ['daily', 'Daily · last 7 days'],
            ['weekly', 'Weekly · last 8 weeks'],
            ['monthly', 'Monthly · year to date'],
            ['custom', 'Custom dates'],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" className={`sa-chip ${range === value ? 'active orange' : ''}`} onClick={() => applyPreset(value)}>
              {label}
            </button>
          ))}
        </div>

        {range === 'custom' && (
          <div className="sa-toolbar">
            <label className="sa-inline-edit">
              <span className="sa-cell-sub">Start date</span>
              <input className="sa-input" type="date" min="2026-01-01" max={dataEndDate} value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
            </label>
            <label className="sa-inline-edit">
              <span className="sa-cell-sub">End date</span>
              <input className="sa-input" type="date" min="2026-01-01" max={dataEndDate} value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
            </label>
            <button type="button" className="sa-btn approve" onClick={applyCustomRange}>Apply dates</button>
            <span className="sa-toolbar-meta">Data available 01 Jan–30 Apr 2026</span>
            {customError && <span className="cf-review-reason" role="alert">{customError}</span>}
          </div>
        )}

        <div className="sa-kpi-grid">
          {([
            { label: 'Revenue', value: report.totals.revenue, tone: 'green', description: 'Recognized rental and service revenue', target: 'overview' },
            { label: 'Expenses', value: report.totals.expenses, tone: 'orange', description: 'Owner earnings, wages, operations and tax paid', target: 'settlements' },
            { label: 'Net profit', value: report.totals.netProfit, tone: 'blue', description: 'Revenue less all categorized expenses', target: 'overview' },
            { label: 'Owner earnings', value: report.totals.ownerEarnings, tone: 'purple', description: 'Payables earned by equipment owners', target: 'payouts' },
            { label: 'Operator wages', value: report.totals.operatorWages, tone: 'green', description: 'Operator compensation accrued', target: 'payouts' },
            { label: 'Customer dues', value: report.totals.customerDues, tone: 'orange', description: 'Outstanding customer receivables', target: 'customer-payments' },
            { label: 'Tax collected', value: report.totals.taxCollected, tone: 'blue', description: 'Tax collected on revenue', target: 'reconciliation' },
            { label: 'Tax paid', value: report.totals.taxPaid, tone: 'purple', description: 'Tax remitted in the period', target: 'reconciliation' },
          ] satisfies ReportMetric[]).map((metric) => (
            <button
              key={metric.label}
              type="button"
              className={`sa-kpi-card ${metric.tone}`}
              title={formatCurrency(metric.value)}
              aria-label={`Open ${metricTargetLabels[metric.target]} for ${metric.label.toLowerCase()}`}
              onClick={() => onNavigate(metric.target)}
            >
              <div className="sa-kpi-top"><span className="sa-kpi-label">{metric.label}</span></div>
              <strong className="sa-kpi-value">{compactCurrency(metric.value)}</strong>
              <span className="sa-kpi-desc">{metric.description}</span>
              <span className="sa-kpi-open">View {metricTargetLabels[metric.target]} →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Revenue, expenses & profit trend</h3>
            <span className="sa-panel-sub">Amounts in rupees · hover bars for exact revenue</span>
          </div>
          <div className="sa-legend">
            {chartLegend.map((item) => <span key={item.key}><i className={item.color} />{item.label}</span>)}
          </div>
        </div>
        {report.series.length === 0 ? (
          <div className="sa-empty"><p>No financial records are available for this date range.</p></div>
        ) : (
          <div className="fr-chart-scroll">
            <div className="sa-bars fr-chart" role="img" aria-label={`Revenue and profitability chart for ${displayedRange}`}>
              {report.series.map((point) => (
                <div key={point.key} className="sa-bar-group">
                  <span className="sa-bar revenue" title={`${point.label}: revenue ${formatCurrency(point.revenue)}`} style={{ height: `${Math.max(2, (point.revenue / maxChartValue) * 100)}%` }} />
                  <span className="sa-bar expenses" title={`${point.label}: expenses ${formatCurrency(point.expenses)}`} style={{ height: `${Math.max(2, (point.expenses / maxChartValue) * 100)}%` }} />
                  <span className="sa-bar profit" title={`${point.label}: net profit ${formatCurrency(point.netProfit)}`} style={{ height: `${Math.max(2, (Math.max(0, point.netProfit) / maxChartValue) * 100)}%` }} />
                </div>
              ))}
            </div>
            <div className="sa-bar-labels fr-chart-labels">
              {report.series.map((point) => <span key={point.key}>{point.label}</span>)}
            </div>
          </div>
        )}
        <div className="sa-toolbar-meta">Net profit is revenue less owner earnings, operator wages, operating expenses and tax remitted.</div>
      </section>

      <style>{`
        .fr-chart-scroll { overflow-x: auto; }
        .fr-chart, .fr-chart-labels { min-width: max(100%, 640px); }
        .fr-chart .sa-bar { min-height: 0; }
        .fr-chart .sa-bar.expenses { background: linear-gradient(180deg, rgba(245, 158, 11, 0.92), rgba(245, 158, 11, 0.35)); }
        .fr-chart .sa-bar.profit { background: linear-gradient(180deg, rgba(37, 99, 235, 0.92), rgba(37, 99, 235, 0.35)); }
        .sa-legend .revenue { background: rgba(8, 166, 108, 0.85); }
        .sa-legend .expenses { background: rgba(245, 158, 11, 0.85); }
        .sa-legend .profit { background: rgba(37, 99, 235, 0.85); }
        .fr-chart-labels { min-width: max-content; }
        .fr-chart-labels span { min-width: 48px; }
      `}</style>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Equipment profitability</h3>
            <span className="sa-panel-sub">Revenue less owner earnings, wages, operating costs and tax · {displayedRange}</span>
          </div>
        </div>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead><tr><th>Equipment category</th><th>Revenue</th><th>Total expenses</th><th>Net profit</th><th>Profit margin</th></tr></thead>
            <tbody>
              {report.equipment.map((item) => (
                <tr key={item.equipment}>
                  <td className="sa-cell-strong">{item.equipment}</td>
                  <td className="sa-num">{formatCurrency(item.revenue)}</td>
                  <td className="sa-num">{formatCurrency(item.expenses)}</td>
                  <td className="sa-num">{formatCurrency(item.netProfit)}</td>
                  <td className="sa-num">{item.margin.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
