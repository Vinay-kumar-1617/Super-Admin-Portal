import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  approveOwnerSettlement,
  canApproveOwnerSettlement,
  markOwnerSettlementPaid,
  ownerSettlementSeeds,
  rejectOwnerSettlement,
  type OwnerSettlement,
} from '../src/roles/FinanceAdminDashboard/ownerSettlementData.ts'

const pendingSettlement = (): OwnerSettlement => {
  const settlement = ownerSettlementSeeds.find((item) => item.status === 'Pending' && item.netPayable <= 200000)
  assert.ok(settlement)
  return settlement
}

test('owner settlement net payable reconciles the full earnings breakdown', () => {
  ownerSettlementSeeds.forEach((settlement) => {
    assert.equal(
      settlement.netPayable,
      settlement.grossRentalEarnings -
        settlement.platformCommission -
        settlement.approvedExpenses -
        settlement.deductions -
        settlement.taxAmount,
    )
    assert.ok(settlement.taxableAmount >= 0)
  })
})

test('one independent approver approves owner settlements regardless of amount', () => {
  const aboveLimit = ownerSettlementSeeds.find((item) => item.status === 'Pending' && item.netPayable > 200000)
  assert.ok(aboveLimit)
  assert.equal(canApproveOwnerSettlement(aboveLimit, aboveLimit.requestedBy), 'The settlement creator cannot approve their own settlement.')

  const approved = approveOwnerSettlement(aboveLimit, 'Anita Shah', '2026-04-17 09:00')
  assert.ok(approved)
  assert.equal(approved.status, 'Approved')
  assert.equal(approved.approvedBy, 'Anita Shah')
  assert.equal(approved.approvedAt, '2026-04-17 09:00')
  assert.equal(approved.history.at(-1)?.detail, 'Single independent approval recorded.')
})

test('within-limit settlement may be approved once by an independent checker', () => {
  const approved = approveOwnerSettlement(pendingSettlement(), 'Rohit Menon', '2026-04-17 11:00')
  assert.ok(approved)
  assert.equal(approved.status, 'Approved')
  assert.equal(approved.approvedBy, 'Rohit Menon')
  assert.equal(approved.history.at(-1)?.action, 'Settlement approved')
})

test('rejections require a reason and append approval history', () => {
  const settlement = pendingSettlement()
  assert.equal(rejectOwnerSettlement(settlement, 'Rohit Menon', '  ', '2026-04-17 11:00'), null)
  const rejected = rejectOwnerSettlement(settlement, 'Rohit Menon', ' Verify expense receipt ', '2026-04-17 11:00')
  assert.ok(rejected)
  assert.equal(rejected.status, 'Rejected')
  assert.equal(rejected.rejectionReason, 'Verify expense receipt')
  assert.equal(rejected.history.at(-1)?.actor, 'Rohit Menon')
})

test('only approved settlements with a payment reference may be marked paid', () => {
  const approved = approveOwnerSettlement(pendingSettlement(), 'Rohit Menon', '2026-04-17 11:00')
  assert.ok(approved)
  assert.equal(markOwnerSettlementPaid(approved, 'Payment Operations', '', '2026-04-17 12:00'), null)

  const paid = markOwnerSettlementPaid(approved, 'Payment Operations', 'UTR-12345', '2026-04-17 12:00')
  assert.ok(paid)
  assert.equal(paid.status, 'Paid')
  assert.equal(paid.paymentReference, 'UTR-12345')
  assert.equal(paid.paidAt, '2026-04-17 12:00')
  assert.equal(paid.history.at(-1)?.action, 'Payout completed')
})
