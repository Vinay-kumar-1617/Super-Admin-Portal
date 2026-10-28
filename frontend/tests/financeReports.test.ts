import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildFinancialReport,
  financialReportRecords,
  financialReportToCsv,
  financialReportToExcelXml,
} from '../src/roles/FinanceAdminDashboard/financeReportsData.ts'

test('daily, weekly and monthly financial reports aggregate the selected dates', () => {
  const daily = buildFinancialReport('2026-04-24', '2026-04-30', 'daily')
  const weekly = buildFinancialReport('2026-03-06', '2026-04-30', 'weekly')
  const monthly = buildFinancialReport('2026-01-01', '2026-04-30', 'monthly')

  assert.equal(daily.series.length, 7)
  assert.ok(weekly.series.length >= 8)
  assert.equal(monthly.series.length, 4)
  assert.equal(monthly.totals.revenue, financialReportRecords.reduce((sum, item) => sum + item.revenue, 0))
  assert.equal(
    monthly.totals.netProfit,
    monthly.totals.revenue - monthly.totals.expenses,
  )
})

test('custom report dates exclude records outside the selected interval', () => {
  const report = buildFinancialReport('2026-02-10', '2026-02-12', 'daily')
  const expectedRecords = financialReportRecords.filter((record) => record.date >= '2026-02-10' && record.date <= '2026-02-12')

  assert.equal(report.series.length, 3)
  assert.equal(report.totals.revenue, expectedRecords.reduce((sum, item) => sum + item.revenue, 0))
  assert.equal(report.totals.customerDues, expectedRecords.reduce((sum, item) => sum + item.customerDues, 0))
})

test('tax, earnings and equipment profitability reconcile to report totals', () => {
  const report = buildFinancialReport('2026-04-01', '2026-04-30', 'monthly')

  assert.equal(report.equipment.reduce((sum, item) => sum + item.revenue, 0), report.totals.revenue)
  assert.equal(report.equipment.reduce((sum, item) => sum + item.expenses, 0), report.totals.expenses)
  assert.equal(report.equipment.reduce((sum, item) => sum + item.netProfit, 0), report.totals.netProfit)
  assert.ok(report.totals.taxCollected > report.totals.taxPaid)
  assert.ok(report.totals.ownerEarnings > 0)
  assert.ok(report.totals.operatorWages > 0)
})

test('CSV and Excel exports include report summary, periods and equipment profitability', () => {
  const report = buildFinancialReport('2026-04-01', '2026-04-30', 'monthly')
  const csv = financialReportToCsv(report)
  const excel = financialReportToExcelXml(report)

  assert.match(csv, /^Section,Period,Metric,Amount \(INR\)/)
  assert.match(csv, /Summary,2026-04-01 to 2026-04-30,Net profit/)
  assert.match(csv, /Equipment profitability,Excavators,Profit margin \(%\)/)
  assert.match(excel, /mso-application progid="Excel\.Sheet"/)
  assert.match(excel, /<Worksheet ss:Name="Finance report">/)
  assert.match(excel, /Equipment profitability/)
})
