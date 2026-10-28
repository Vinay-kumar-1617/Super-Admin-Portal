import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  approveOperatorPayment,
  markOperatorPaymentPaid,
  operatorPaymentSeeds,
  rejectOperatorPayment,
} from '../src/roles/FinanceAdminDashboard/operatorPaymentData.ts'

test('operator wage totals reconcile with job hours, overtime, allowances and deductions', () => {
  operatorPaymentSeeds.forEach((payment) => {
    const basePay = payment.jobs.reduce((sum, job) => sum + job.basePay, 0)
    const overtimePay = payment.jobs.reduce((sum, job) => sum + job.overtimePay, 0)
    assert.equal(payment.grossWages, basePay + overtimePay + payment.allowances + payment.bonuses)
    assert.equal(payment.netWages, payment.grossWages - payment.deductions - payment.taxWithheld)
    assert.ok(payment.jobs.every((job) => job.regularHours >= 0 && job.overtimeHours >= 0))
  })
})

test('operator payment approval requires a checker independent from the maker', () => {
  const pending = operatorPaymentSeeds.find((payment) => payment.status === 'Pending')
  assert.ok(pending)
  assert.equal(approveOperatorPayment(pending, pending.requestedBy, '2026-04-16 10:00'), null)

  const approved = approveOperatorPayment(pending, 'Rohit Menon', '2026-04-16 10:00')
  assert.ok(approved)
  assert.equal(approved.status, 'Approved')
  assert.equal(approved.approvedBy, 'Rohit Menon')
  assert.equal(approved.approvedAt, '2026-04-16 10:00')
})

test('operator payment rejection requires a reason and records the reviewer', () => {
  const pending = operatorPaymentSeeds.find((payment) => payment.status === 'Pending')
  assert.ok(pending)
  assert.equal(rejectOperatorPayment(pending, 'Rohit Menon', '  ', '2026-04-16 10:00'), null)

  const rejected = rejectOperatorPayment(pending, 'Rohit Menon', 'Missing approved timesheet', '2026-04-16 10:00')
  assert.ok(rejected)
  assert.equal(rejected.status, 'Rejected')
  assert.equal(rejected.rejectedBy, 'Rohit Menon')
  assert.equal(rejected.rejectionReason, 'Missing approved timesheet')
})

test('only approved operator payments with a payout reference may be marked paid', () => {
  const pending = operatorPaymentSeeds.find((payment) => payment.status === 'Pending')
  assert.ok(pending)
  const approved = approveOperatorPayment(pending, 'Rohit Menon', '2026-04-16 10:00')
  assert.ok(approved)
  assert.equal(markOperatorPaymentPaid(approved, '', '2026-04-16 12:00'), null)

  const paid = markOperatorPaymentPaid(approved, 'UTR-OP-TEST-01', '2026-04-16 12:00')
  assert.ok(paid)
  assert.equal(paid.status, 'Paid')
  assert.equal(paid.paymentReference, 'UTR-OP-TEST-01')
  assert.equal(paid.paidAt, '2026-04-16 12:00')
  assert.equal(paid.history.at(-1)?.action, 'Payment completed')
})
