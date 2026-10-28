import { useMemo, useState, type FormEvent } from 'react'
import { financeProfile, type AuditEntry } from './financeAdminData'
import {
  approvalCategories,
  canApproveFinanceRequest,
  financeApprovers,
  formatApprovalAmount,
  type ApprovalCategory,
  type ApprovalStatus,
  type FinanceApprovalRequest,
} from './financeApprovalData'
import { StatusPill } from './shared'

type ApprovalCenterSectionProps = {
  requests: FinanceApprovalRequest[]
  audit: AuditEntry[]
  onApprove: (id: string, approver: string) => void
  onReject: (id: string, approver: string, reason: string) => void
  onCreate: (category: ApprovalCategory, subject: string, amount: number, description: string, requestedBy: string) => void
}

type ApprovalQueueFilter = 'All' | 'Open' | ApprovalStatus

const statusOptions: ApprovalQueueFilter[] = [
  'All',
  'Open',
  'Pending',
  'Awaiting second approval',
  'Approved',
  'Rejected',
  'Processed',
  'Paid',
  'Failed',
  'On hold',
]

const makerOptions = ['Finance Operations', 'Support Operations', 'Ravi Deshmukh', 'Anita Shah', 'Priya Nair', 'State Finance Officer']

const readableTime = (timestamp?: string) => timestamp || '—'

export default function ApprovalCenterSection({
  requests,
  audit,
  onApprove,
  onReject,
  onCreate,
}: ApprovalCenterSectionProps) {
  const [approver, setApprover] = useState(financeProfile.name)
  const [categoryFilter, setCategoryFilter] = useState<'All' | ApprovalCategory>('All')
  const [statusFilter, setStatusFilter] = useState<ApprovalQueueFilter>('Open')
  const [query, setQuery] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [auditQuery, setAuditQuery] = useState('')
  const [newCategory, setNewCategory] = useState<ApprovalCategory>('Expense claim')
  const [newSubject, setNewSubject] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newMaker, setNewMaker] = useState('Finance Operations')

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return requests.filter((request) => {
      const matchesSearch =
        search === '' ||
        [request.id, request.category, request.subject, request.requestedBy, request.description, request.rejectionReason ?? '']
          .some((value) => value.toLowerCase().includes(search))
      return (
        (categoryFilter === 'All' || request.category === categoryFilter) &&
        (statusFilter === 'All' ||
          (statusFilter === 'Open'
            ? request.status === 'Pending' || request.status === 'Awaiting second approval'
            : request.status === statusFilter)) &&
        matchesSearch
      )
    })
  }, [requests, categoryFilter, statusFilter, query])

  const searchableAudit = useMemo(() => {
    const search = auditQuery.trim().toLowerCase()
    return audit.filter((entry) => {
      if (entry.area !== 'approvals') return false
      return (
        search === '' ||
        [entry.time, entry.actor, entry.action, entry.detail].some((value) => value.toLowerCase().includes(search))
      )
    })
  }, [audit, auditQuery])

  const openCount = requests.filter((request) => request.status === 'Pending' || request.status === 'Awaiting second approval').length
  const secondApprovalCount = requests.filter((request) => request.status === 'Awaiting second approval').length
  const aboveLimitCount = requests.filter(
    (request) =>
      (request.status === 'Pending' || request.status === 'Awaiting second approval') &&
      request.numericAmount > request.approvalLimit,
  ).length

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amount = Number(newAmount.replace(/,/g, ''))
    onCreate(newCategory, newSubject, amount, newDescription, newMaker)
    if (newSubject.trim() && amount > 0 && newDescription.trim()) {
      setNewSubject('')
      setNewAmount('')
      setNewDescription('')
    }
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Finance approval center</h3>
            <span className="sa-panel-sub">Maker-checker approvals and decision history across finance requests</span>
          </div>
          <label className="sa-inline-edit">
            <span className="sa-cell-sub">Acting approver</span>
            <select className="sa-input" aria-label="Acting approver" value={approver} onChange={(event) => setApprover(event.target.value)}>
              {financeApprovers.map((item) => (
                <option key={item.name} value={item.name}>{item.name} · {item.role}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="sa-stat-strip">
          <div className="sa-stat"><span>Awaiting decision</span><strong>{openCount}</strong></div>
          <div className="sa-stat"><span>Second approval required</span><strong>{secondApprovalCount}</strong></div>
          <div className="sa-stat"><span>Open above limit</span><strong>{aboveLimitCount}</strong></div>
          <div className="sa-stat"><span>Base payout limit</span><strong>{formatApprovalAmount(200000)}</strong></div>
        </div>

        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search approval requests"
            placeholder="Search ID, requester, payee or detail..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="sa-input" aria-label="Filter approval category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'All' | ApprovalCategory)}>
            <option value="All">All categories</option>
            {approvalCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select className="sa-input" aria-label="Filter approval status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ApprovalQueueFilter)}>
            {statusOptions.map((status) => <option key={status} value={status}>{status === 'All' ? 'All statuses' : status === 'Open' ? 'Open requests' : status}</option>)}
          </select>
          <span className="sa-toolbar-meta">{rows.length} of {requests.length} requests</span>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Rejection reason"
            placeholder="Required to reject a request"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
          <span className="sa-toolbar-meta">Above-limit decisions require two different approvers; no maker may approve their own request.</span>
        </div>

        {rows.length === 0 ? (
          <div className="sa-empty"><p>No requests match the current filters.</p></div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Requested by</th>
                  <th>Amount / limit</th>
                  <th>Approval trail</th>
                  <th>Status / reason</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((request) => {
                  const canDecide = request.status === 'Pending' || request.status === 'Awaiting second approval'
                  const decisionError = canApproveFinanceRequest(request, approver)
                  const needsSecondApproval = request.status === 'Awaiting second approval'
                  return (
                    <tr key={request.id}>
                      <td className="sa-cell-strong">
                        {request.subject}
                        <span className="sa-cell-sub">{request.id} · {request.category}</span>
                        <span className="sa-cell-sub">{request.description}</span>
                      </td>
                      <td className="sa-cell-strong">
                        {request.requestedBy}
                        <span className="sa-cell-sub">{readableTime(request.requestedAt)}</span>
                      </td>
                      <td className="sa-num">
                        {request.amount}
                        <span className={`sa-cell-sub ${request.numericAmount > request.approvalLimit ? 'cf-review-reason' : ''}`}>
                          Limit {formatApprovalAmount(request.approvalLimit)}
                        </span>
                      </td>
                      <td className="sa-cell-sub">
                        {request.firstApprover ? (
                          <>
                            <span>1st: {request.firstApprover}</span>
                            <span className="sa-cell-sub">{readableTime(request.firstApprovedAt)}</span>
                          </>
                        ) : <span>Awaiting first reviewer</span>}
                        {request.approvedBy && (
                          <span className="sa-cell-sub">Final: {request.approvedBy} · {readableTime(request.approvedAt)}</span>
                        )}
                        {request.rejectedBy && (
                          <span className="sa-cell-sub">Rejected by {request.rejectedBy} · {readableTime(request.rejectedAt)}</span>
                        )}
                      </td>
                      <td>
                        <StatusPill status={request.status} />
                        {request.rejectionReason && <span className="sa-cell-sub">{request.rejectionReason}</span>}
                      </td>
                      <td>
                        {canDecide ? (
                          <span className="sa-inline-edit">
                            <button
                              type="button"
                              className="sa-btn approve"
                              disabled={Boolean(decisionError)}
                              title={decisionError ?? undefined}
                              onClick={() => onApprove(request.id, approver)}
                            >
                              {needsSecondApproval ? 'Second approval' : request.numericAmount > request.approvalLimit ? 'Review & escalate' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              className="sa-btn reject"
                              disabled={!rejectionReason.trim() || Boolean(decisionError)}
                              title={decisionError ?? (!rejectionReason.trim() ? 'Enter a rejection reason first.' : undefined)}
                              onClick={() => onReject(request.id, approver, rejectionReason)}
                            >
                              Reject
                            </button>
                            {decisionError && <span className="sa-cell-sub">{decisionError}</span>}
                          </span>
                        ) : <span className="sa-cell-sub">No action required</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Submit an approval request</h3>
            <span className="sa-panel-sub">New requests enter the queue as pending and cannot be self-approved.</span>
          </div>
        </div>
        <form className="sa-toolbar" onSubmit={submitRequest}>
          <select className="sa-input" aria-label="Request category" value={newCategory} onChange={(event) => setNewCategory(event.target.value as ApprovalCategory)}>
            {approvalCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input className="sa-input" aria-label="Request subject" placeholder="Payee, claimant or adjustment subject" value={newSubject} onChange={(event) => setNewSubject(event.target.value)} required />
          <input className="sa-input" aria-label="Request amount" placeholder="Amount in ₹" inputMode="decimal" value={newAmount} onChange={(event) => setNewAmount(event.target.value)} required />
          <select className="sa-input" aria-label="Request maker" value={newMaker} onChange={(event) => setNewMaker(event.target.value)}>
            {makerOptions.map((maker) => <option key={maker} value={maker}>{maker}</option>)}
          </select>
          <input className="sa-input" aria-label="Request description" placeholder="Reason and supporting reference" value={newDescription} onChange={(event) => setNewDescription(event.target.value)} required />
          <button type="submit" className="sa-btn approve">Submit request</button>
        </form>
      </section>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Approval audit log</h3>
            <span className="sa-panel-sub">Searchable maker, approver, decision, rejection reason and timestamp history</span>
          </div>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search approval audit log"
            placeholder="Search actor, action, request ID or rejection reason..."
            value={auditQuery}
            onChange={(event) => setAuditQuery(event.target.value)}
          />
          <span className="sa-toolbar-meta">{searchableAudit.length} of {audit.filter((entry) => entry.area === 'approvals').length} approval events</span>
        </div>
        {searchableAudit.length === 0 ? (
          <div className="sa-empty"><p>No approval audit entries match your search.</p></div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Timestamp</th><th>Approver / maker</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>
                {searchableAudit.map((entry) => (
                  <tr key={entry.id}>
                    <td className="sa-num">{entry.time}</td>
                    <td className="sa-cell-strong">{entry.actor}</td>
                    <td>{entry.action}</td>
                    <td className="sa-cell-sub">{entry.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
