import { useMemo, useState } from 'react'
import { ScopePill, StatusPill } from './shared'
import type { Invoice, InvoiceKind } from './financeAdminData'

type InvoicesSectionProps = {
  invoices: Invoice[]
  onResend: (id: string) => void
  onDownload: (id: string) => void
}

const kindFilters: Array<'All' | InvoiceKind> = [
  'All',
  'Customer invoice',
  'Receipt',
  'Commission statement',
  'Payout statement',
]

export default function InvoicesSection({ invoices, onResend, onDownload }: InvoicesSectionProps) {
  const [kindFilter, setKindFilter] = useState<'All' | InvoiceKind>('All')
  const [query, setQuery] = useState('')

  const rows = useMemo(
    () =>
      invoices.filter(
        (item) =>
          (kindFilter === 'All' || item.kind === kindFilter) &&
          (query.trim() === '' ||
            item.id.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.party.toLowerCase().includes(query.trim().toLowerCase()) ||
            item.related.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [invoices, kindFilter, query],
  )

  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Invoices & statements</h3>
        <div className="sa-chip-row">
          {kindFilters.map((option) => (
            <button
              key={option}
              type="button"
              className={`sa-chip ${kindFilter === option ? 'active orange' : ''}`}
              onClick={() => setKindFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="sa-toolbar">
        <input
          className="sa-input"
          aria-label="Search invoices and statements"
          placeholder="Search id, party or booking..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="sa-toolbar-meta">
          {rows.length} of {invoices.length} documents
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="sa-empty">
          <p>No documents match the current filters.</p>
          <button
            type="button"
            className="sa-btn-ghost"
            onClick={() => {
              setKindFilter('All')
              setQuery('')
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Party</th>
                <th>Related</th>
                <th>Amount</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td className="sa-cell-strong">
                    {item.id}
                    <span className="sa-cell-sub">
                      <ScopePill value={item.kind} />
                    </span>
                  </td>
                  <td>{item.party}</td>
                  <td className="sa-num">{item.related}</td>
                  <td className="sa-num">{item.amount}</td>
                  <td className="sa-num">{item.issued}</td>
                  <td className="sa-num">{item.due}</td>
                  <td>
                    <StatusPill status={item.status} />
                  </td>
                  <td>
                    <span className="sa-inline-edit">
                      <button type="button" className="sa-btn-ghost" onClick={() => onDownload(item.id)}>
                        Download
                      </button>
                      <button type="button" className="sa-btn-ghost" onClick={() => onResend(item.id)}>
                        Resend
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
