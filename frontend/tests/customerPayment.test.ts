import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateCustomerBalances,
  customerPaymentSeeds,
  recordCustomerPayment,
  recordCustomerReminder,
} from '../src/roles/FinanceAdminDashboard/customerPaymentData.ts'

test('customer accounts include booking and invoice history plus separate deposits and advances', () => {
  assert.ok(customerPaymentSeeds.length > 0)
  customerPaymentSeeds.forEach((customer) => {
    assert.ok(customer.bookings.length > 0)
    assert.ok(customer.invoices.length > 0)
    assert.ok(customer.advancePayment >= 0)
    assert.ok(customer.securityDeposit >= 0)
    assert.ok(customer.refundTotal >= 0)
  })
})

test('customer balances calculate collections, advances, outstanding and overdue separately', () => {
  const zainab = customerPaymentSeeds.find((customer) => customer.customer === 'Zainab Ali')
  assert.ok(zainab)
  const balances = calculateCustomerBalances(zainab)
  assert.equal(balances.totalInvoiced, 22500)
  assert.equal(balances.totalCollected, 5000)
  assert.equal(balances.outstandingBalance, 15000)
  assert.equal(balances.overdueAmount, 17500)
  assert.equal(balances.securityDeposit, 7500)
})

test('customer payment collection requires a valid amount and transaction reference', () => {
  const zainab = customerPaymentSeeds.find((customer) => customer.customer === 'Zainab Ali')
  assert.ok(zainab)
  assert.equal(recordCustomerPayment(zainab, 'INV-58188', 20000, 'NEFT', 'UTR-1', '2026-04-20 11:00'), null)
  assert.equal(recordCustomerPayment(zainab, 'INV-58188', 1000, 'NEFT', '', '2026-04-20 11:00'), null)

  const updated = recordCustomerPayment(zainab, 'INV-58188', 17500, 'NEFT', 'UTR-CUS-001', '2026-04-20 11:00')
  assert.ok(updated)
  const invoice = updated.invoices.find((item) => item.id === 'INV-58188')
  assert.ok(invoice)
  assert.equal(invoice.status, 'Paid')
  assert.equal(invoice.collected, 22500)
  assert.equal(invoice.paymentReference, 'UTR-CUS-001')
  assert.equal(invoice.paidAt, '2026-04-20 11:00')
})

test('partial payments update the outstanding balance and append collection history', () => {
  const zainab = customerPaymentSeeds.find((customer) => customer.customer === 'Zainab Ali')
  assert.ok(zainab)
  const updated = recordCustomerPayment(zainab, 'INV-58188', 2500, 'UPI', 'UPI-CUS-001', '2026-10-24 11:00')
  assert.ok(updated)
  assert.equal(calculateCustomerBalances(updated).outstandingBalance, 12500)
  assert.equal(updated.history.at(-1)?.action, 'Payment collected')
  assert.match(updated.history.at(-1)?.detail ?? '', /UPI-CUS-001/)
})

test('reminders only append history for invoices with outstanding amounts', () => {
  const priya = customerPaymentSeeds.find((customer) => customer.customer === 'Priya Nair')
  assert.ok(priya)
  assert.equal(recordCustomerReminder(priya, 'INV-58204', '2026-04-20 12:00'), null)

  const zainab = customerPaymentSeeds.find((customer) => customer.customer === 'Zainab Ali')
  assert.ok(zainab)
  const updated = recordCustomerReminder(zainab, 'INV-58188', '2026-04-20 12:00')
  assert.ok(updated)
  assert.equal(updated.history.at(-1)?.action, 'Payment reminder sent')
  assert.match(updated.history.at(-1)?.detail ?? '', /₹17,500/)
})
