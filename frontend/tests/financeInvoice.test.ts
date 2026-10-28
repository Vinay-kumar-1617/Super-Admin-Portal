import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  collectFinanceInvoicePayment,
  createFinanceInvoice,
  editFinanceInvoice,
  financeInvoiceBalance,
  financeInvoiceSeeds,
  financeInvoiceStatus,
  issueFinanceInvoice,
  totalFinanceInvoice,
  type FinanceInvoiceDraft,
} from '../src/roles/FinanceAdminDashboard/financeInvoiceData.ts'

const draft: FinanceInvoiceDraft = {
  customer: 'Test Customer',
  bookingId: 'BK-TEST-1',
  issuedAt: '2026-10-01',
  dueAt: '2026-10-15',
  rentalCharges: 10000,
  fuel: 1000,
  transportation: 500,
  overtime: 750,
  tax: 1800,
  discount: 300,
  penalties: 200,
  deposits: 2500,
}

test('invoice totals include all rental charges and subtract discounts', () => {
  assert.equal(totalFinanceInvoice(draft), 16450)
})

test('invoices can be created and edited while they are drafts', () => {
  const created = createFinanceInvoice(draft, 'INV-TEST-1', '2026-10-01 10:00')
  assert.ok(created)
  assert.equal(created.status, 'Draft')
  assert.equal(created.customer, 'Test Customer')

  const edited = editFinanceInvoice(created, { ...draft, fuel: 1250 }, '2026-10-02 10:00')
  assert.ok(edited)
  assert.equal(edited.fuel, 1250)
  assert.equal(edited.updatedAt, '2026-10-02 10:00')
  assert.equal(editFinanceInvoice({ ...created, status: 'Unpaid' }, draft, '2026-10-02 10:00'), null)
})

test('invoice drafts reject invalid dates, negative line items and non-positive totals', () => {
  assert.equal(createFinanceInvoice({ ...draft, issuedAt: '' }, 'INV-INVALID-1', '2026-10-01 10:00'), null)
  assert.equal(createFinanceInvoice({ ...draft, dueAt: '2026-02-30' }, 'INV-INVALID-2', '2026-10-01 10:00'), null)
  assert.equal(createFinanceInvoice({ ...draft, fuel: -1 }, 'INV-INVALID-3', '2026-10-01 10:00'), null)
  assert.equal(createFinanceInvoice({ ...draft, rentalCharges: 0, discount: 30000 }, 'INV-INVALID-4', '2026-10-01 10:00'), null)
})

test('invoice issue moves drafts into unpaid or overdue collection status', () => {
  const created = createFinanceInvoice(draft, 'INV-TEST-2', '2026-10-01 10:00')
  assert.ok(created)
  assert.equal(issueFinanceInvoice(created, '2026-10-10 09:00')?.status, 'Unpaid')
  assert.equal(issueFinanceInvoice(created, '2026-10-20 09:00')?.status, 'Overdue')
})

test('invoice collections support partial and full payment with transaction references', () => {
  const invoice = financeInvoiceSeeds.find((item) => item.id === 'INV-58210')
  assert.ok(invoice)
  const balance = financeInvoiceBalance(invoice)
  assert.equal(collectFinanceInvoicePayment(invoice, balance + 1, 'REF-1', '2026-10-10 10:00'), null)
  assert.equal(collectFinanceInvoicePayment(invoice, 1000, '', '2026-10-10 10:00'), null)

  const partial = collectFinanceInvoicePayment(invoice, 1000, 'REF-PART-1', '2026-10-10 10:00')
  assert.ok(partial)
  assert.equal(partial.status, 'Partially paid')
  assert.equal(partial.collected, 1000)
  assert.equal(financeInvoiceBalance(partial), balance - 1000)

  const fullyPaid = collectFinanceInvoicePayment(partial, balance - 1000, 'REF-FULL-1', '2026-10-11 11:00')
  assert.ok(fullyPaid)
  assert.equal(fullyPaid.status, 'Paid')
  assert.equal(fullyPaid.paymentReference, 'REF-FULL-1')
  assert.equal(fullyPaid.paidAt, '2026-10-11 11:00')
})

test('invoice overdue status is derived only for issued invoices with an unpaid balance', () => {
  const overdue = financeInvoiceSeeds.find((item) => item.id === 'INV-58188')
  assert.ok(overdue)
  assert.equal(financeInvoiceStatus(overdue, '2026-10-23'), 'Overdue')
  const paid = collectFinanceInvoicePayment(overdue, financeInvoiceBalance(overdue), 'REF-OVERDUE-CLEAR', '2026-10-23 12:00')
  assert.ok(paid)
  assert.equal(paid.status, 'Paid')
  assert.equal(financeInvoiceStatus({ ...overdue, status: 'Draft' }, '2026-10-23'), 'Draft')
})
