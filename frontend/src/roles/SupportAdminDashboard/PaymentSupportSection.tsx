import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import type { PaymentIssueType, PaymentResolutionStatus, SupportPaymentIssue } from './supportAdminData'

type PaymentSupportSectionProps = {
  issues: SupportPaymentIssue[]
  onStatusChange: (id: string, status: PaymentResolutionStatus) => void
}

const issueTypes: Array<'All' | PaymentIssueType> = [
  'All',
  'Failed payment',
  'Duplicate transaction',
  'Refund request',
  'Payment discrepancy',
  'Settlement complaint',
]
const resolutionStatuses: PaymentResolutionStatus[] = ['Open', 'Investigating', 'Resolved', 'Escalated']

export default function PaymentSupportSection({ issues, onStatusChange }: PaymentSupportSectionProps) {
  const [issueFilter, setIssueFilter] = useState<'All' | PaymentIssueType>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentResolutionStatus>('All')
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return issues.filter((issue) =>
      (issueFilter === 'All' || issue.issueType === issueFilter) &&
      (statusFilter === 'All' || issue.status === statusFilter) &&
      (!search || [
        issue.id,
        issue.reference,
        issue.booking,
        issue.ticket,
        issue.reporter,
        issue.issueType,
        issue.summary,
      ].some((value) => value.toLowerCase().includes(search))),
    )
  }, [issues, issueFilter, statusFilter, query])

  const openCount = issues.filter((issue) => issue.status === 'Open').length
  const investigatingCount = issues.filter((issue) => issue.status === 'Investigating').length
  const escalatedCount = issues.filter((issue) => issue.status === 'Escalated').length
  const resolvedCount = issues.filter((issue) => issue.status === 'Resolved').length

  return (
    <div className="support-payment-support">
      <style>{`
        .support-payment-kpis { margin-bottom: 18px; }
        .support-payment-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .support-payment-support .sa-panel-sub,
        .support-payment-support .sa-cell-sub,
        .support-payment-support .sa-toolbar-meta { color: #586579; }
        .support-payment-summary { min-width: 230px; max-width: 340px; color: #465468; font-size: .76rem; line-height: 1.5; }
        .support-payment-resolution-controls { display: grid; grid-template-columns: 90px minmax(140px, 1fr); align-items: center; gap: 8px; }
        .support-payment-resolution-controls .sa-pill { justify-self: start; }
        .support-payment-status { width: 100%; min-width: 0; }
        .support-payment-ref { font-variant-numeric: tabular-nums; white-space: nowrap; }
        @media (max-width: 900px) {
          .support-payment-summary { min-width: 180px; }
          .support-payment-resolution-controls { grid-template-columns: 1fr; gap: 6px; }
        }
      `}</style>
      <div className="sa-kpi-grid support-payment-kpis" aria-label="Payment issue totals">
        <div className="sa-kpi-card orange">
          <div className="sa-kpi-top"><span className="sa-kpi-label">Open</span><span className="sa-kpi-change">Needs review</span></div>
          <strong className="sa-kpi-value">{openCount}</strong>
          <span className="sa-kpi-desc">New payment issues to triage</span>
        </div>
        <div className="sa-kpi-card blue">
          <div className="sa-kpi-top"><span className="sa-kpi-label">Investigating</span><span className="sa-kpi-change">In progress</span></div>
          <strong className="sa-kpi-value">{investigatingCount}</strong>
          <span className="sa-kpi-desc">Being checked with payment records</span>
        </div>
        <div className="sa-kpi-card purple">
          <div className="sa-kpi-top"><span className="sa-kpi-label">Escalated</span><span className="sa-kpi-change">Finance</span></div>
          <strong className="sa-kpi-value">{escalatedCount}</strong>
          <span className="sa-kpi-desc">Referred for finance-team resolution</span>
        </div>
        <div className="sa-kpi-card green">
          <div className="sa-kpi-top"><span className="sa-kpi-label">Resolved</span><span className="sa-kpi-change">Complete</span></div>
          <strong className="sa-kpi-value">{resolvedCount}</strong>
          <span className="sa-kpi-desc">Resolution recorded for the reporter</span>
        </div>
      </div>

      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Payment issue tracker</h3>
            <span className="sa-panel-sub">Failed payments, duplicate charges, refunds, discrepancies, and settlements</span>
          </div>
          <span className="sa-pill slate">{issues.length} cases</span>
        </div>
        <div className="sa-toolbar">
          <input
            className="sa-input"
            aria-label="Search payment issues"
            placeholder="Search transaction, booking, ticket or reporter..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="sa-select"
            aria-label="Filter by resolution status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'All' | PaymentResolutionStatus)}
          >
            <option value="All">All resolution statuses</option>
            {resolutionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <span className="sa-toolbar-meta">{rows.length} of {issues.length} issues</span>
        </div>
        <div className="support-payment-filters" aria-label="Filter by issue type">
          {issueTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`sa-chip ${issueFilter === type ? 'active orange' : ''}`}
              onClick={() => setIssueFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
        {rows.length === 0 ? (
          <div className="sa-empty">
            <p>No payment issues match the current filters.</p>
            <button
              type="button"
              className="sa-btn-ghost"
              onClick={() => { setIssueFilter('All'); setStatusFilter('All'); setQuery('') }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Issue / reference</th>
                  <th>Reporter</th>
                  <th>Booking / ticket</th>
                  <th>Amount</th>
                  <th>Issue details</th>
                  <th>Resolution</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((issue) => (
                  <tr key={issue.id}>
                    <td className="sa-cell-strong">
                      {issue.issueType}
                      <span className="sa-cell-sub">{issue.id} · {issue.reportedAt}</span>
                      <span className="sa-cell-sub support-payment-ref">Ref: {issue.reference}</span>
                    </td>
                    <td>
                      {issue.reporter}
                      <span className="sa-cell-sub">{issue.reporterType}</span>
                    </td>
                    <td className="sa-cell-sub">
                      {issue.booking}
                      <span className="sa-cell-sub">Ticket: {issue.ticket}</span>
                    </td>
                    <td className="sa-num">{issue.amount}</td>
                    <td>
                      <div className="support-payment-summary">{issue.summary}</div>
                      <span className="sa-cell-sub">Next step: {issue.resolution}</span>
                    </td>
                    <td>
                      <div className="support-payment-resolution-controls">
                        <StatusPill status={issue.status} />
                        <select
                          className="sa-select support-payment-status"
                          aria-label={`Resolution status for ${issue.id}`}
                          value={issue.status}
                          onChange={(event) => onStatusChange(issue.id, event.target.value as PaymentResolutionStatus)}
                        >
                          {resolutionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
