import { useMemo, useState, type FormEvent } from 'react'
import { StatusPill } from './shared'
import {
  financeInvoiceBalance,
  financeInvoiceStatus,
  totalFinanceInvoice,
  type FinanceInvoice,
  type FinanceInvoiceAmounts,
  type FinanceInvoiceDraft,
  type FinanceInvoiceStatus,
} from './financeInvoiceData'

type InvoicesSectionProps = {
  invoices: FinanceInvoice[]
  onCreate: (draft: FinanceInvoiceDraft) => string | null
  onEdit: (id: string, draft: FinanceInvoiceDraft) => boolean
  onIssue: (id: string) => void
  onCollect: (id: string, amount: number, reference: string) => boolean
}

const amountFields: Array<{ key: keyof FinanceInvoiceAmounts; label: string; sign: -1 | 1 }> = [
  { key: 'rentalCharges', label: 'Rental charges', sign: 1 },
  { key: 'fuel', label: 'Fuel', sign: 1 },
  { key: 'transportation', label: 'Transportation', sign: 1 },
  { key: 'overtime', label: 'Overtime', sign: 1 },
  { key: 'tax', label: 'Taxes', sign: 1 },
  { key: 'discount', label: 'Discounts', sign: -1 },
  { key: 'penalties', label: 'Penalties', sign: 1 },
  { key: 'deposits', label: 'Deposits', sign: 1 },
]

const statusOptions: Array<'All' | FinanceInvoiceStatus> = ['All', 'Draft', 'Unpaid', 'Partially paid', 'Paid', 'Overdue']
const currency = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`
const today = () => new Date().toISOString().slice(0, 10)
const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}
const csvCell = (value: string | number) => {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const blankDraft = (): FinanceInvoiceDraft => {
  const issuedAt = today()
  return {
    customer: '',
    bookingId: '',
    issuedAt,
    dueAt: addDays(issuedAt, 14),
    rentalCharges: 0,
    fuel: 0,
    transportation: 0,
    overtime: 0,
    tax: 0,
    discount: 0,
    penalties: 0,
    deposits: 0,
  }
}

const draftFromInvoice = (invoice: FinanceInvoice): FinanceInvoiceDraft => ({
  customer: invoice.customer,
  bookingId: invoice.bookingId,
  issuedAt: invoice.issuedAt,
  dueAt: invoice.dueAt,
  rentalCharges: invoice.rentalCharges,
  fuel: invoice.fuel,
  transportation: invoice.transportation,
  overtime: invoice.overtime,
  tax: invoice.tax,
  discount: invoice.discount,
  penalties: invoice.penalties,
  deposits: invoice.deposits,
})

const downloadInvoice = (invoice: FinanceInvoice) => {
  const rows: Array<[string, string | number]> = [
    ['Invoice', invoice.id],
    ['Customer', invoice.customer],
    ['Booking', invoice.bookingId],
    ['Issued', invoice.issuedAt || 'Not issued'],
    ['Due', invoice.dueAt],
    ...amountFields.map(({ key, label, sign }) => [label, invoice[key] * sign] as [string, number]),
    ['Invoice total', totalFinanceInvoice(invoice)],
    ['Collected', invoice.collected],
    ['Balance due', financeInvoiceBalance(invoice)],
    ['Status', financeInvoiceStatus(invoice, today())],
    ['Payment reference', invoice.paymentReference ?? '—'],
    ['Paid at', invoice.paidAt ?? '—'],
  ]
  const content = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${invoice.id}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function InvoicesSection({ invoices, onCreate, onEdit, onIssue, onCollect }: InvoicesSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | FinanceInvoiceStatus>('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(invoices[0]?.id ?? '')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<FinanceInvoiceDraft>(blankDraft)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentReference, setPaymentReference] = useState('')

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const status = financeInvoiceStatus(invoice, today())
      return (statusFilter === 'All' || status === statusFilter) &&
        (search === '' || [invoice.id, invoice.customer, invoice.bookingId, invoice.paymentReference ?? ''].some((value) => value.toLowerCase().includes(search)))
    })
  }, [invoices, statusFilter, query])
  const selected = rows.find((invoice) => invoice.id === selectedId) ?? rows[0]
  const draftTotal = totalFinanceInvoice(draft)
  const balance = selected ? financeInvoiceBalance(selected) : 0

  const saveDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (editingId) {
      if (onEdit(editingId, draft)) {
        setSelectedId(editingId)
        setEditingId(null)
      }
      return
    }
    const id = onCreate(draft)
    if (id) {
      setSelectedId(id)
      setDraft(blankDraft())
    }
  }

  const submitPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    if (onCollect(selected.id, Number(paymentAmount.replace(/,/g, '')), paymentReference)) {
      setPaymentAmount('')
      setPaymentReference('')
    }
  }

  const startEdit = (invoice: FinanceInvoice) => {
    setSelectedId(invoice.id)
    setEditingId(invoice.id)
    setDraft(draftFromInvoice(invoice))
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Invoice management</h3>
            <span className="sa-panel-sub">Create, edit, issue, collect and download itemized rental invoices.</span>
          </div>
          <button type="button" className="sa-btn approve" onClick={() => { setEditingId(null); setDraft(blankDraft()) }}>Create invoice</button>
        </div>
        <div className="sa-toolbar">
          <input className="sa-input" aria-label="Search invoices" placeholder="Search invoice, customer, booking or payment reference..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <span className="sa-toolbar-meta">{rows.length} of {invoices.length} invoices</span>
        </div>
        <div className="sa-chip-row">
          {statusOptions.map((status) => <button key={status} type="button" className={`sa-chip ${statusFilter === status ? 'active orange' : ''}`} onClick={() => setStatusFilter(status)}>{status}</button>)}
        </div>
        {rows.length === 0 ? (
          <div className="sa-empty"><p>No invoices match the selected filters.</p></div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Invoice / customer</th><th>Booking</th><th>Issued</th><th>Due</th><th>Total</th><th>Collected</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map((invoice) => {
                  const status = financeInvoiceStatus(invoice, today())
                  return (
                    <tr key={invoice.id} className={selected?.id === invoice.id ? 'sa-row-selected' : undefined}>
                      <td className="sa-cell-strong">{invoice.id}<span className="sa-cell-sub">{invoice.customer}</span></td>
                      <td className="sa-num">{invoice.bookingId}</td>
                      <td className="sa-num">{invoice.issuedAt || 'Draft'}</td>
                      <td className="sa-num">{invoice.dueAt}</td>
                      <td className="sa-num">{currency(totalFinanceInvoice(invoice))}</td>
                      <td className="sa-num">{currency(invoice.collected)}</td>
                      <td className="sa-num">{currency(financeInvoiceBalance(invoice))}</td>
                      <td><StatusPill status={status} /></td>
                      <td>
                        <span className="sa-inline-edit">
                          <button type="button" className="sa-btn-ghost" onClick={() => setSelectedId(invoice.id)}>Details</button>
                          {invoice.status === 'Draft' && (
                            <>
                              <button type="button" className="sa-btn-ghost" onClick={() => startEdit(invoice)}>Edit</button>
                              <button type="button" className="sa-btn approve" onClick={() => onIssue(invoice.id)}>Issue</button>
                            </>
                          )}
                          <button type="button" className="sa-btn-ghost" onClick={() => downloadInvoice(invoice)}>Download</button>
                        </span>
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
          <div><h3>{editingId ? `Edit draft ${editingId}` : 'Create invoice draft'}</h3><span className="sa-panel-sub">Drafts can be edited; issue an invoice to make it collectible.</span></div>
          {editingId && <button type="button" className="sa-btn-ghost" onClick={() => { setEditingId(null); setDraft(blankDraft()) }}>Cancel edit</button>}
        </div>
        <form className="sa-toolbar" onSubmit={saveDraft}>
          <input className="sa-input" aria-label="Invoice customer" placeholder="Customer name" value={draft.customer} onChange={(event) => setDraft((previous) => ({ ...previous, customer: event.target.value }))} required />
          <input className="sa-input" aria-label="Invoice booking ID" placeholder="Booking ID" value={draft.bookingId} onChange={(event) => setDraft((previous) => ({ ...previous, bookingId: event.target.value }))} required />
          <label className="sa-inline-edit"><span className="sa-cell-sub">Issue date</span><input className="sa-input" type="date" aria-label="Invoice issue date" value={draft.issuedAt} onChange={(event) => setDraft((previous) => ({ ...previous, issuedAt: event.target.value }))} required /></label>
          <label className="sa-inline-edit"><span className="sa-cell-sub">Due date</span><input className="sa-input" type="date" aria-label="Invoice due date" min={draft.issuedAt} value={draft.dueAt} onChange={(event) => setDraft((previous) => ({ ...previous, dueAt: event.target.value }))} required /></label>
          {amountFields.map(({ key, label, sign }) => (
            <label key={key} className="sa-inline-edit">
              <span className="sa-cell-sub">{label}{sign < 0 ? ' (subtracted)' : ''}</span>
              <input className="sa-input" type="number" min="0" step="0.01" aria-label={`Invoice ${label.toLowerCase()}`} value={draft[key]} onChange={(event) => setDraft((previous) => ({ ...previous, [key]: Number(event.target.value) }))} />
            </label>
          ))}
          <span className="sa-toolbar-meta">Draft total: <strong>{currency(draftTotal)}</strong></span>
          <button type="submit" className="sa-btn approve">{editingId ? 'Save draft changes' : 'Save draft'}</button>
        </form>
      </section>

      {selected && (
        <>
          <section className="sa-panel">
            <div className="sa-panel-header"><div><h3>{selected.id} · invoice details</h3><span className="sa-panel-sub">{selected.customer} · booking {selected.bookingId} · due {selected.dueAt}</span></div><StatusPill status={financeInvoiceStatus(selected, today())} /></div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead><tr><th>Charge</th><th>Amount</th></tr></thead>
                <tbody>
                  {amountFields.map(({ key, label, sign }) => <tr key={key}><td>{label}</td><td className="sa-num">{sign < 0 ? '−' : ''}{currency(selected[key])}</td></tr>)}
                  <tr><td className="sa-cell-strong">Invoice total</td><td className="sa-num sa-cell-strong">{currency(totalFinanceInvoice(selected))}</td></tr>
                  <tr><td>Amount collected</td><td className="sa-num">{currency(selected.collected)}</td></tr>
                  <tr><td className="sa-cell-strong">Balance due</td><td className="sa-num sa-cell-strong">{currency(balance)}</td></tr>
                </tbody>
              </table>
            </div>
            {selected.status !== 'Draft' && balance > 0 && (
              <form className="sa-toolbar" onSubmit={submitPayment}>
                <input className="sa-input" aria-label="Invoice payment amount" type="number" min="0.01" max={balance} step="0.01" placeholder={`Collect up to ${currency(balance)}`} value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} required />
                <input className="sa-input" aria-label="Invoice payment reference" placeholder="Transaction reference" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} required />
                <button type="submit" className="sa-btn approve">Record payment</button>
              </form>
            )}
            {selected.paymentReference && <p className="sa-toolbar-meta">Latest payment reference: {selected.paymentReference} · {selected.paidAt ?? 'part payment'}</p>}
            <button type="button" className="sa-btn-ghost" onClick={() => downloadInvoice(selected)}>Download invoice / receipt</button>
          </section>
        </>
      )}
    </>
  )
}
