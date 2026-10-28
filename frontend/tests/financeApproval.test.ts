import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  approvalCategories,
  approvalLimits,
  approveFinanceRequest,
  canApproveFinanceRequest,
  financeApprovalRequests,
  rejectFinanceRequest,
  type FinanceApprovalRequest,
} from '../src/roles/FinanceAdminDashboard/financeApprovalData.ts'

const makeRequest = (overrides: Partial<FinanceApprovalRequest> = {}): FinanceApprovalRequest => ({
  id: 'REQ-1',
  category: 'Expense claim',
  subject: 'Field travel',
  requestedBy: 'Maker',
  requestedAt: '2026-04-02 10:00',
  amount: '₹10,000',
  numericAmount: 10000,
  approvalLimit: approvalLimits['Expense claim'],
  description: 'Travel reimbursement',
  status: 'Pending',
  ...overrides,
})

test('approval center covers all requested finance categories and existing queues', () => {
  assert.deepEqual(approvalCategories, [
    'Owner payout',
    'Operator payment',
    'Refund',
    'Expense claim',
    'Discount',
    'Manual adjustment',
  ])
  assert.ok(financeApprovalRequests.some((request) => request.legacyType === 'payout' && request.category === 'Owner payout'))
  assert.ok(financeApprovalRequests.some((request) => request.legacyType === 'payout' && request.category === 'Operator payment'))
  assert.ok(financeApprovalRequests.some((request) => request.legacyType === 'refund'))
})

test('makers cannot approve their own requests', () => {
  assert.match(canApproveFinanceRequest(makeRequest(), 'Maker') ?? '', /cannot approve their own request/)
  assert.equal(canApproveFinanceRequest(makeRequest(), 'Finance Admin'), null)
})

test('above-limit requests require two different approvers and retain both timestamps', () => {
  const aboveLimit = makeRequest({ numericAmount: 30000, amount: '₹30,000' })
  const firstDecision = approveFinanceRequest(aboveLimit, 'Finance Admin', '2026-04-02 11:00')

  assert.ok(firstDecision)
  assert.equal(firstDecision.status, 'Awaiting second approval')
  assert.equal(firstDecision.firstApprover, 'Finance Admin')
  assert.equal(firstDecision.firstApprovedAt, '2026-04-02 11:00')
  assert.match(canApproveFinanceRequest(firstDecision, 'Finance Admin') ?? '', /different approver/)

  const finalDecision = approveFinanceRequest(firstDecision, 'Finance Director', '2026-04-02 12:00')
  assert.ok(finalDecision)
  assert.equal(finalDecision.status, 'Approved')
  assert.equal(finalDecision.firstApprover, 'Finance Admin')
  assert.equal(finalDecision.approvedBy, 'Finance Director')
  assert.equal(finalDecision.approvedAt, '2026-04-02 12:00')
})

test('within-limit approvals still require a checker distinct from the maker', () => {
  const approved = approveFinanceRequest(makeRequest(), 'Finance Admin', '2026-04-02 11:00')
  assert.ok(approved)
  assert.equal(approved.status, 'Approved')
  assert.equal(approved.approvedBy, 'Finance Admin')
  assert.equal(approved.approvedAt, '2026-04-02 11:00')
})

test('rejections require and record a reason, approver and timestamp', () => {
  const request = makeRequest()
  assert.equal(rejectFinanceRequest(request, 'Finance Admin', '  ', '2026-04-02 11:00'), null)

  const rejected = rejectFinanceRequest(request, 'Finance Admin', ' Missing receipt ', '2026-04-02 11:00')
  assert.ok(rejected)
  assert.equal(rejected.status, 'Rejected')
  assert.equal(rejected.rejectedBy, 'Finance Admin')
  assert.equal(rejected.rejectedAt, '2026-04-02 11:00')
  assert.equal(rejected.rejectionReason, 'Missing receipt')
})
