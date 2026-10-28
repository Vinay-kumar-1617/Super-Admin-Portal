import { useMemo, useState, type FormEvent } from 'react'
import { StatusPill } from './shared'
import {
  calculateCustomerBalances,
  customerPaymentMethods,
  type CustomerPaymentMethod,
  type CustomerPaymentProfile,
  type CustomerPaymentRecord,
} from './customerPaymentData'

type CustomerPaymentsSectionProps = {
  customers: CustomerPaymentProfile[]
  onCollect: (customerId: string, invoiceId: string, amount: number, method: CustomerPaymentMethod, reference: string) => void
  onReminder: (customerId: string, invoiceId: string) => void
}

const currency = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`
const csvCell = (value: string | number) => {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const downloadCustomerReceipt = (customer: CustomerPaymentRecord, invoiceId: string) => {
  const invoice = customer.invoices.find((item) => item.id === invoiceId)
  if (!invoice?.paymentReference) return
  const rows: Array<[string, string | number]> = [
    ['Customer payment receipt', invoice.paymentReference],
    ['Customer', customer.customer],
    ['Customer ID', customer.id],
    ['Phone', customer.phone],
    ['Email', customer.email],
    ['Booking', invoice.bookingId],
    ['Invoice', invoice.id],
    ['Invoice amount', invoice.amount],
    ['Collected to date', invoice.collected],
    ['Payment reference', invoice.paymentReference],
    ['Paid at', invoice.paidAt ?? '—'],
    ['Payment status', invoice.status],
  ]
  const content = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${invoice.paymentReference}-receipt.csv`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function CustomerPaymentsSection({ customers, onCollect, onReminder }: CustomerPaymentsSectionProps) {
  const [customerFilter, setCustomerFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(customers[0]?.id ?? '')
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<CustomerPaymentMethod>('UPI')
  const [reference, setReference] = useState('')

  const records = useMemo(() => customers.map(calculateCustomerBalances), [customers])
  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return records.filter((record) =>
      (customerFilter === 'All' || record.id === customerFilter) &&
      (search === '' || [record.customer, record.id, record.phone, record.email, ...record.invoices.map((invoice) => invoice.id), ...record.bookings.map((booking) => booking.id)]
        .some((value) => value.toLowerCase().includes(search))),
    )
  }, [records, customerFilter, query])
  const selected = rows.find((record) => record.id === selectedId) ?? rows[0]
  const pendingBalance = records.reduce((sum, record) => sum + record.outstandingBalance, 0)
  const overdueBalance = records.reduce((sum, record) => sum + record.overdueAmount, 0)
  const collectedTotal = records.reduce((sum, record) => sum + record.totalCollected, 0)
  const paymentsWithHistory = records.flatMap((record) =>
    record.invoices
      .filter((invoice) => invoice.paymentReference)
      .map((invoice) => ({ record, invoice })),
  )
  const currentInvoiceId =
    selected?.invoices.some((invoice) => invoice.id === invoiceId) ? invoiceId : selected?.invoices.find((invoice) => invoice.status !== 'Paid')?.id ?? ''

  const submitCollection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected || !currentInvoiceId) return
    const numericAmount = Number(amount.replace(/,/g, ''))
    onCollect(selected.id, currentInvoiceId, numericAmount, method, reference)
    setAmount('')
    setReference('')
  }

  return (
    <>
      <section className="sa-panel">
        <div className="sa-panel-header">
          <div>
            <h3>Customer payment management</h3>
            <span className="sa-panel-sub">Customer accounts, booking invoices, advance credits, security deposits, refunds and collection history</span>
          </div>
        </div>
        <div className="sa-stat-strip">
          <div className="sa-stat"><span>Outstanding balance</span><strong>{currency(pendingBalance)}</strong></div>
          <div className="sa-stat"><span>Overdue amount</span><strong>{currency(overdueBalance)}</strong></div>
          <div className="sa-stat"><span>Payments collected</span><strong>{currency(collectedTotal)}</strong></div>
          <div className="sa-stat"><span>Customers</span><strong>{records.length}</strong></div>
        </div>
        <div className="sa-toolbar">
          <select className="sa-input" aria-label="Select customer" value={customerFilter} onChange={(event) => { setCustomerFilter(event.target.value); setSelectedId(event.target.value === 'All' ? '' : event.target.value) }}>
            <option value="All">All customers</option>
            {records.map((record) => <option key={record.id} value={record.id}>{record.customer} · {record.id}</option>)}
          </select>
          <input className="sa-input" aria-label="Search customer payment records" placeholder="Search customer, phone, booking or invoice..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <span className="sa-toolbar-meta">{rows.length} of {records.length} customer accounts</span>
        </div>
        {rows.length === 0 ? (
          <div className="sa-empty"><p>No customer payment accounts match your search.</p></div>
        ) : (
          <div className="sa-table-wrap">
            <table className="sa-table">
              <thead><tr><th>Customer</th><th>Bookings / invoices</th><th>Advance</th><th>Security deposit</th><th>Refunds</th><th>Outstanding</th><th>Overdue</th><th>Account</th></tr></thead>
              <tbody>
                {rows.map((record) => (
                  <tr key={record.id} className={selected?.id === record.id ? 'sa-row-selected' : undefined}>
                    <td className="sa-cell-strong">{record.customer}<span className="sa-cell-sub">{record.id} · {record.city} · {record.phone}</span><span className="sa-cell-sub">{record.email}</span></td>
                    <td className="sa-num">{record.bookings.length} bookings<span className="sa-cell-sub">{record.invoices.length} invoices</span></td>
                    <td className="sa-num">{currency(record.advancePayment)}</td>
                    <td className="sa-num">{currency(record.securityDeposit)}</td>
                    <td className="sa-num">{currency(record.refundTotal)}</td>
                    <td className="sa-num">{currency(record.outstandingBalance)}</td>
                    <td className="sa-num">{record.overdueAmount > 0 ? <StatusPill status="Overdue" /> : '—'}<span className="sa-cell-sub">{currency(record.overdueAmount)}</span></td>
                    <td><button type="button" className="sa-btn-ghost" onClick={() => { setSelectedId(record.id); setCustomerFilter(record.id); setInvoiceId('') }}>{selected?.id === record.id ? 'Selected' : 'View account'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <>
          <section className="sa-panel">
            <div className="sa-panel-header">
              <div><h3>{selected.customer} · account details</h3><span className="sa-panel-sub">{selected.id} · {selected.phone} · {selected.email} · {selected.city}</span></div>
            </div>
            <div className="sa-stat-strip">
              <div className="sa-stat"><span>Total invoiced</span><strong>{currency(selected.totalInvoiced)}</strong></div>
              <div className="sa-stat"><span>Collected</span><strong>{currency(selected.totalCollected)}</strong></div>
              <div className="sa-stat"><span>Advance payments</span><strong>{currency(selected.advancePayment)}</strong></div>
              <div className="sa-stat"><span>Security deposits</span><strong>{currency(selected.securityDeposit)}</strong></div>
              <div className="sa-stat"><span>Processed refunds</span><strong>{currency(selected.refundTotal)}</strong></div>
              <div className="sa-stat"><span>Preferred method</span><strong>{selected.preferredMethod}</strong></div>
            </div>
            <div className="sa-panel-header"><h3>Booking & invoice history</h3></div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead><tr><th>Booking</th><th>Equipment</th><th>Period</th><th>Invoice</th><th>Amount</th><th>Collected</th><th>Due</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {selected.invoices.map((invoice) => {
                    const booking = selected.bookings.find((item) => item.id === invoice.bookingId)
                    return (
                      <tr key={invoice.id}>
                        <td className="sa-cell-strong">{invoice.bookingId}</td>
                        <td>{booking?.equipment ?? '—'}</td>
                        <td className="sa-num">{invoice.issuedAt}</td>
                        <td>{invoice.id}<span className="sa-cell-sub">Due {invoice.dueAt}</span></td>
                        <td className="sa-num">{currency(invoice.amount)}</td>
                        <td className="sa-num">{currency(invoice.collected)}</td>
                        <td className="sa-num">{currency(Math.max(0, invoice.amount - invoice.collected))}</td>
                        <td><StatusPill status={invoice.status} /></td>
                        <td>
                          <span className="sa-inline-edit">
                            {invoice.status !== 'Paid' && (
                              <>
                                <button type="button" className="sa-btn-ghost" onClick={() => { setInvoiceId(invoice.id); setAmount(String(invoice.amount - invoice.collected)) }}>Collect</button>
                                <button type="button" className="sa-btn-ghost" onClick={() => onReminder(selected.id, invoice.id)}>Send reminder</button>
                              </>
                            )}
                            {invoice.paymentReference && <button type="button" className="sa-btn-ghost" onClick={() => downloadCustomerReceipt(selected, invoice.id)}>Receipt</button>}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sa-panel">
            <div className="sa-panel-header"><div><h3>Collect customer payment</h3><span className="sa-panel-sub">Enter the amount and transaction reference to record a collection.</span></div></div>
            <form className="sa-toolbar" onSubmit={submitCollection}>
              <select className="sa-input" aria-label="Invoice to collect" value={currentInvoiceId} onChange={(event) => setInvoiceId(event.target.value)} required>
                <option value="" disabled>Select an open invoice</option>
                {selected.invoices.filter((invoice) => invoice.status !== 'Paid').map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.id} · due {currency(invoice.amount - invoice.collected)}</option>)}
              </select>
              <input className="sa-input" aria-label="Collection amount" placeholder="Amount in ₹" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} required />
              <select className="sa-input" aria-label="Collection payment method" value={method} onChange={(event) => setMethod(event.target.value as CustomerPaymentMethod)}>
                {customerPaymentMethods.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <input className="sa-input" aria-label="Collection transaction reference" placeholder="Transaction reference" value={reference} onChange={(event) => setReference(event.target.value)} required />
              <button type="submit" className="sa-btn approve" disabled={!currentInvoiceId}>Record payment</button>
            </form>
          </section>

          <section className="sa-panel">
            <div className="sa-panel-header"><div><h3>Payment, reminder & refund history</h3><span className="sa-panel-sub">Collections and refund events linked to customer invoices.</span></div></div>
            <div className="sa-table-wrap">
              <table className="sa-table">
                <thead><tr><th>Timestamp</th><th>Actor</th><th>Event</th><th>Details</th></tr></thead>
                <tbody>
                  {[...selected.history].reverse().map((event, index) => <tr key={`${event.at}-${event.action}-${index}`}><td className="sa-num">{event.at}</td><td className="sa-cell-strong">{event.actor}</td><td>{event.action}</td><td className="sa-cell-sub">{event.detail}</td></tr>)}
                </tbody>
              </table>
            </div>
            {paymentsWithHistory.filter(({ record }) => record.id === selected.id).length > 0 && (
              <div className="sa-panel-header"><h3>Payment receipts</h3></div>
            )}
            <div className="sa-chip-row">
              {paymentsWithHistory.filter(({ record }) => record.id === selected.id).map(({ invoice }) => (
                <button key={invoice.id} type="button" className="sa-btn-ghost" onClick={() => downloadCustomerReceipt(selected, invoice.id)}>
                  Download {invoice.paymentReference} receipt
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}
