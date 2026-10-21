import { useState } from 'react'

export const gstSections = [
  'GST Settings',
  'Owner GST Details',
  'Tax Configuration',
  'Invoices & Billing',
  'Reports & Compliance',
  'GST Audit Logs',
] as const

export type GstSection = (typeof gstSections)[number]

type GstManagementPageProps = {
  section: GstSection | 'all'
  onNavigate: (section: GstSection) => void
  onBack: () => void
}

const showAll = (section: GstManagementPageProps['section']) => section === 'all'

const sectionNumber = (item: GstSection) => String(gstSections.indexOf(item) + 1)

const ownerGstRows = [
  { id: 'OGST-001', owner: 'Deccan Heavy Machinery', gstin: '36AAJCT1234F1Z5', state: 'Telangana', type: 'Registered', status: 'Verified', verifiedOn: '18 Jun 2026' },
  { id: 'OGST-002', owner: 'Sri Krishna Equipment Rentals', gstin: '27AAKFR4321P1Z2', state: 'Maharashtra', type: 'Registered', status: 'Verified', verifiedOn: '02 Jul 2026' },
  { id: 'OGST-003', owner: 'Metro Machines Mumbai', gstin: '—', state: 'Maharashtra', type: 'Unregistered', status: 'Pending', verifiedOn: '—' },
  { id: 'OGST-004', owner: 'Greenfield Earthworks', gstin: '06ABFCD7890Q1Z3', state: 'Karnataka', type: 'Registered', status: 'Verified', verifiedOn: '12 Aug 2026' },
  { id: 'OGST-005', owner: 'Harmony Logistics', gstin: '—', state: 'Gujarat', type: 'Unregistered', status: 'Pending', verifiedOn: '—' },
  { id: 'OGST-006', owner: 'North Ridge Infra', gstin: '07AFGJK6543R1Z9', state: 'Delhi', type: 'Registered', status: 'Verified', verifiedOn: '25 Aug 2026' },
  { id: 'OGST-007', owner: 'Coastal Crane Co', gstin: '33FGTYU8765T1Z1', state: 'Tamil Nadu', type: 'Registered', status: 'Pending', verifiedOn: '—' },
]

const taxHeads = [
  { head: 'CGST', rate: 9, applies: 'Intra-state invoice value', note: 'Central GST charged on taxable value' },
  { head: 'SGST', rate: 9, applies: 'Intra-state invoice value', note: 'State GST charged on taxable value' },
  { head: 'IGST', rate: 18, applies: 'Inter-state invoice value', note: 'Integrated GST charged on taxable value' },
  { head: 'TDS · sec 194C', rate: 1, applies: 'Contractor / owner payments', note: 'Deducted at time of settlement to owner' },
]

const hsnCodes = [
  { code: '8429', item: 'Backhoe loader hire', rate: 18 },
  { code: '8429', item: 'Excavator hire', rate: 18 },
  { code: '8426', item: 'Crane hire', rate: 18 },
  { code: '8474', item: 'Compactor / roller hire', rate: 18 },
  { code: '8428', item: 'Boom lift / aerial platform hire', rate: 18 },
]

const invoices = [
  { no: 'INV-2026-0081', date: '01 Sep 2026', customer: 'Sri Krishna Projects', owner: 'Deccan Heavy Machinery', taxable: 34000, cgst: 3060, sgst: 3060, igst: 0, total: 40120, status: 'Paid' },
  { no: 'INV-2026-0082', date: '03 Sep 2026', customer: 'Charminar Infra', owner: 'Sri Krishna Equipment Rentals', taxable: 50000, cgst: 0, sgst: 0, igst: 9000, total: 59000, status: 'Paid' },
  { no: 'INV-2026-0083', date: '07 Sep 2026', customer: 'MGF Constructions', owner: 'Greenfield Earthworks', taxable: 26000, cgst: 2340, sgst: 2340, igst: 0, total: 30680, status: 'Pending' },
  { no: 'INV-2026-0084', date: '12 Sep 2026', customer: 'Nila Builders', owner: 'North Ridge Infra', taxable: 41000, cgst: 3690, sgst: 3690, igst: 0, total: 48380, status: 'Paid' },
  { no: 'INV-2026-0085', date: '18 Sep 2026', customer: 'Pearl Estates', owner: 'Coastal Crane Co', taxable: 32000, cgst: 0, sgst: 0, igst: 5760, total: 37760, status: 'Overdue' },
  { no: 'INV-2026-0086', date: '25 Sep 2026', customer: 'Ankur Logistics', owner: 'Metro Machines Mumbai', taxable: 18000, cgst: 0, sgst: 0, igst: 3240, total: 21240, status: 'Pending' },
]

const filings = [
  { period: 'Jul 2026', form: 'GSTR-1', status: 'Filed', filedOn: '10 Aug 2026', due: '11 Aug 2026' },
  { period: 'Jul 2026', form: 'GSTR-3B', status: 'Filed', filedOn: '20 Aug 2026', due: '20 Aug 2026' },
  { period: 'Aug 2026', form: 'GSTR-1', status: 'Filed', filedOn: '10 Sep 2026', due: '11 Sep 2026' },
  { period: 'Aug 2026', form: 'GSTR-3B', status: 'Filed', filedOn: '20 Sep 2026', due: '20 Sep 2026' },
  { period: 'Sep 2026', form: 'GSTR-1', status: 'Due', filedOn: '—', due: '11 Oct 2026' },
  { period: 'Sep 2026', form: 'GSTR-3B', status: 'Due', filedOn: '—', due: '20 Oct 2026' },
]

const gstAuditEvents = [
  { time: '12 Oct 2026 · 09:41', actor: 'Super Admin', action: 'Settings updated', detail: 'Invoice numbering switched to financial-year basis.' },
  { time: '10 Oct 2026 · 14:22', actor: 'Finance Admin', action: 'HSN code updated', detail: 'Aerial platform hire mapped to HSN 8428.' },
  { time: '06 Oct 2026 · 11:05', actor: 'Finance Admin', action: 'Owner GST verified', detail: 'GSTIN 06ABFCD7890Q1Z3 approved for Greenfield Earthworks.' },
  { time: '01 Oct 2026 · 16:48', actor: 'Super Admin', action: 'Tax rate changed', detail: 'TDS (sec 194C) configured at 1% for contractor settlements.' },
  { time: '28 Sep 2026 · 10:12', actor: 'Finance Admin', action: 'Invoice generated', detail: 'INV-2026-0085 issued with IGST for inter-state booking.' },
]

export default function GstManagementPage({ section, onNavigate, onBack }: GstManagementPageProps) {
  const [ownerStatusFilter, setOwnerStatusFilter] = useState<string>('All')
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>('All')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('All')

  const filteredOwners = ownerGstRows.filter(
    (row) =>
      (ownerStatusFilter === 'All' || row.status === ownerStatusFilter) &&
      (ownerTypeFilter === 'All' || row.type === ownerTypeFilter),
  )
  const typeScopedOwners = ownerGstRows.filter((row) => ownerTypeFilter === 'All' || row.type === ownerTypeFilter)
  const filteredInvoices = invoices.filter((row) => invoiceStatusFilter === 'All' || row.status === invoiceStatusFilter)

  const totalInvoiced = invoices.reduce((total, row) => total + row.taxable, 0)
  const totalGst = invoices.reduce((total, row) => total + row.cgst + row.sgst + row.igst, 0)
  const pendingInvoices = invoices.filter((row) => row.status === 'Pending' || row.status === 'Overdue')

  const gstCard = (
    icon: string,
    label: string,
    value: string,
    accent: 'accent-green' | 'accent-blue' | 'accent-orange' | 'accent-purple' | 'accent-red' | 'accent-slate',
    action?: { onClick: () => void; active: boolean },
  ) => {
    const className = `gst-card ${accent}${action ? ' clickable' : ''}${action?.active ? ' active' : ''}`
    const content = (
      <>
        <span className="gst-card-top"><span className="gst-card-icon">{icon}</span><span>{label}</span></span>
        <strong>{value}</strong>
        <small>GST sample data</small>
      </>
    )

    if (action) {
      return (
        <button type="button" className={className} onClick={action.onClick} aria-pressed={action.active}>
          {content}
        </button>
      )
    }

    return <article className={className}>{content}</article>
  }

  return (
    <div className="gst-page">
      <style>{`
        .gst-page {
          display: grid;
          gap: 18px;
          min-width: 0;
        }

        .gst-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .gst-all-intro {
          margin: 0;
          color: var(--muted);
          font-size: 0.8rem;
        }

        .gst-section-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 1rem;
          letter-spacing: -0.01em;
          color: var(--text);
        }
        .gst-section-no {
          display: inline-grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 8px;
          font-size: 0.74rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep));
          color: #fff;
        }

        .gst-tab {
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: #fff;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
        }

        .gst-tab:hover { border-color: rgba(255, 107, 44, 0.4); color: #c94310; }
        .gst-tab.active { background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep)); color: #fff; border-color: transparent; box-shadow: 0 10px 22px -10px rgba(239, 74, 18, 0.7); }

        .gst-summary-grid {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .gst-summary-grid.gst-summary-three { grid-template-columns: repeat(3, minmax(0, 1fr)); }

        .gst-card {
          display: grid;
          gap: 8px;
          padding: 16px 18px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid var(--line);
          border-left: 4px solid rgba(15, 23, 42, 0.12);
          box-shadow: var(--shadow);
        }
        .gst-card strong { font-size: 1.3rem; letter-spacing: -0.02em; }
        .gst-card small { color: var(--muted); }
        .gst-card.clickable { cursor: pointer; font: inherit; text-align: left; width: 100%; transition: box-shadow 0.15s ease, transform 0.15s ease; }
        .gst-card.clickable:hover { box-shadow: 0 14px 30px -14px rgba(15, 23, 42, 0.35); transform: translateY(-1px); }
        .gst-card.clickable.active { box-shadow: 0 0 0 2px rgba(255, 107, 44, 0.45); }

        .gst-card-top { display: flex; align-items: center; gap: 8px; font-size: 0.76rem; font-weight: 700; color: #475569; }
        .gst-card-icon { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 7px; font-size: 0.72rem; background: rgba(15, 23, 42, 0.08); }

        .gst-card.accent-slate { border-left-color: #64748b; }
        .gst-card.accent-green { border-left-color: #08a66c; }
        .gst-card.accent-green strong { color: #078653; }
        .gst-card.accent-green .gst-card-icon { background: rgba(8, 166, 108, 0.14); color: #078653; }
        .gst-card.accent-red { border-left-color: #ef4444; }
        .gst-card.accent-red strong { color: #dc2626; }
        .gst-card.accent-red .gst-card-icon { background: rgba(239, 68, 68, 0.13); color: #dc2626; }
        .gst-card.accent-orange { border-left-color: #ff6b2c; }
        .gst-card.accent-orange strong { color: #c94310; }
        .gst-card.accent-orange .gst-card-icon { background: rgba(255, 107, 44, 0.15); color: #c94310; }
        .gst-card.accent-blue { border-left-color: #2563eb; }
        .gst-card.accent-blue strong { color: #1d4ed8; }
        .gst-card.accent-blue .gst-card-icon { background: rgba(37, 99, 235, 0.13); color: #1d4ed8; }
        .gst-card.accent-purple { border-left-color: #7c3aed; }
        .gst-card.accent-purple strong { color: #6d28d9; }
        .gst-card.accent-purple .gst-card-icon { background: rgba(124, 58, 237, 0.13); color: #6d28d9; }

        .gst-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .gst-field { display: grid; gap: 6px; }
        .gst-field label { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
        .gst-field input, .gst-field select {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          font: inherit;
          font-size: 0.86rem;
          color: var(--text);
        }

        .gst-filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .gst-filter-row select {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text);
        }

        .gst-hsn {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .subject-status-green { background: rgba(8, 166, 108, 0.12); color: #078653; }
        .subject-status-red { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
        .subject-status-amber { background: rgba(245, 158, 11, 0.16); color: #b45309; }

        .kpi-detail-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          padding: 0;
          font: inherit;
          font-size: 0.78rem;
          font-weight: 700;
          color: #2563eb;
          cursor: pointer;
        }
        .kpi-detail-back:hover { color: #1d4ed8; text-decoration: underline; }

        .operator-record-details {
          max-width: 280px;
          color: #64748b;
          font-size: 0.78rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gst-note {
          margin: 0;
          padding: 0 18px 18px;
          color: #64748b;
          font-size: 0.78rem;
          line-height: 1.5;
        }
      `}</style>

      <header className="dashboard-header">
        <div>
          <button type="button" className="kpi-detail-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Dashboard overview
          </button>
          <p className="header-kicker">Finance / GST Management</p>
          <h1 className="header-title">{section === 'all' ? 'GST Management' : section}</h1>
          <div className="header-breadcrumb">GST Management / {section === 'all' ? 'All features' : section}</div>
        </div>
        <span className="chip active">GSTIN verified</span>
      </header>

      <nav className="gst-tabs" aria-label="GST features">
        {gstSections.map((item) => (
          <button
            key={item}
            type="button"
            className={`gst-tab ${section === item ? 'active' : ''}`}
            aria-current={section === item ? 'location' : undefined}
            onClick={() => onNavigate(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      {section === 'all' && (
        <p className="gst-all-intro">All GST management features in one view. Use the tabs above to jump to an individual feature.</p>
      )}

      {(section === 'GST Settings' || showAll(section)) && (
        <>
          <h2 className="gst-section-heading"><span className="gst-section-no">{sectionNumber('GST Settings')}</span> GST Settings</h2>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Registration details</h3>
                <span className="health-meta">Primary GST registration used for all invoices raised on the platform.</span>
              </div>
              <span className="chip active">Registered</span>
            </div>
            <div className="chart-wrap">
              <div className="gst-form-grid">
                <label className="gst-field"><span>Legal name</span><input defaultValue="EquipHub Rental Services Pvt Ltd" readOnly /></label>
                <label className="gst-field"><span>GSTIN</span><input defaultValue="36AAECI6729R1ZK" readOnly /></label>
                <label className="gst-field"><span>State / UT</span><input defaultValue="Telangana" readOnly /></label>
                <label className="gst-field"><span>Registration type</span><input defaultValue="Regular (Composition off)" readOnly /></label>
                <label className="gst-field"><span>Registered address</span><input defaultValue="HITEC City, Hyderabad, Telangana 500081" readOnly /></label>
                <label className="gst-field"><span>Effective date of registration</span><input defaultValue="15 Mar 2023" readOnly /></label>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Invoice defaults</h3>
                <span className="health-meta">Applied automatically when invoices and credit notes are generated.</span>
              </div>
            </div>
            <div className="chart-wrap">
              <div className="gst-form-grid">
                <label className="gst-field"><span>Invoice numbering</span><input defaultValue="Financial-year based (INV-YYYY-NNNN)" readOnly /></label>
                <label className="gst-field"><span>Default HSN lookup</span><input defaultValue="Auto-apply by vehicle category" readOnly /></label>
                <label className="gst-field"><span>Inter-state tax head</span><input defaultValue="IGST 18%" readOnly /></label>
                <label className="gst-field"><span>Intra-state tax heads</span><input defaultValue="CGST 9% + SGST 9%" readOnly /></label>
              </div>
            </div>
          </section>
        </>
      )}

      {(section === 'Owner GST Details' || showAll(section)) && (
        <>
          <h2 className="gst-section-heading"><span className="gst-section-no">{sectionNumber('Owner GST Details')}</span> Owner GST Details</h2>
          <div className="gst-summary-grid gst-summary-three">
            {gstCard('▤', 'Total owners', String(typeScopedOwners.length), 'accent-slate', {
              onClick: () => setOwnerStatusFilter('All'),
              active: ownerStatusFilter === 'All',
            })}
            {gstCard('✓', 'GST verified', String(typeScopedOwners.filter((row) => row.status === 'Verified').length), 'accent-green', {
              onClick: () => setOwnerStatusFilter(ownerStatusFilter === 'Verified' ? 'All' : 'Verified'),
              active: ownerStatusFilter === 'Verified',
            })}
            {gstCard('◔', 'Pending verification', String(typeScopedOwners.filter((row) => row.status === 'Pending').length), 'accent-orange', {
              onClick: () => setOwnerStatusFilter(ownerStatusFilter === 'Pending' ? 'All' : 'Pending'),
              active: ownerStatusFilter === 'Pending',
            })}
          </div>

          <section className="panel" aria-labelledby="owner-gst-title">
            <div className="panel-header">
              <div>
                <h3 id="owner-gst-title">Owner GST records</h3>
                <span className="health-meta">Showing {filteredOwners.length} of {ownerGstRows.length} owners · filter by verification status or registration type</span>
              </div>
              <div className="gst-filter-row">
                <select aria-label="Filter by status" value={ownerStatusFilter} onChange={(event) => setOwnerStatusFilter(event.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                </select>
                <select aria-label="Filter by registration type" value={ownerTypeFilter} onChange={(event) => setOwnerTypeFilter(event.target.value)}>
                  <option value="All">All types</option>
                  <option value="Registered">Registered</option>
                  <option value="Unregistered">Unregistered</option>
                </select>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr>
                    <th>Owner</th>
                    <th>GSTIN</th>
                    <th>State</th>
                    <th>Registration</th>
                    <th>Status</th>
                    <th>Verified on</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwners.map((row) => (
                    <tr key={row.id}>
                      <td><strong>{row.owner}</strong></td>
                      <td>{row.gstin}</td>
                      <td>{row.state}</td>
                      <td>{row.type}</td>
                      <td><span className={`booking-date-status ${row.status === 'Verified' ? 'completed' : 'pending'}`}>{row.status}</span></td>
                      <td>{row.verifiedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="gst-note">Illustrative owner GST records for interface preview; GSTIN values are sample identifiers.</p>
          </section>
        </>
      )}

      {(section === 'Tax Configuration' || showAll(section)) && (
        <>
          <h2 className="gst-section-heading"><span className="gst-section-no">{sectionNumber('Tax Configuration')}</span> Tax Configuration</h2>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Tax heads</h3>
                <span className="health-meta">Applicable GST and TDS rates applied during invoicing and settlement.</span>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr><th>Tax head</th><th>Rate</th><th>Applies to</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {taxHeads.map((row) => (
                    <tr key={row.head}>
                      <td><strong>{row.head}</strong></td>
                      <td>{row.rate}%</td>
                      <td>{row.applies}</td>
                      <td className="operator-record-details">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="gst-hsn">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>HSN code mapping</h3>
                  <span className="health-meta">Equipment category to HSN code and GST rate.</span>
                </div>
              </div>
              <div className="chart-wrap kpi-detail-table-wrap">
                <table className="state-table kpi-detail-table">
                  <thead>
                    <tr><th>HSN</th><th>Equipment</th><th>Rate</th></tr>
                  </thead>
                  <tbody>
                    {hsnCodes.map((row, index) => (
                      <tr key={`${row.code}-${index}`}>
                        <td><strong>{row.code}</strong></td>
                        <td>{row.item}</td>
                        <td>{row.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>TDS & settlement</h3>
                  <span className="health-meta">Deductions applied at owner settlement time.</span>
                </div>
              </div>
              <div className="chart-wrap" style={{ display: 'grid', gap: '10px' }}>
                <div className="gst-card accent-purple">
                  <span className="gst-card-top"><span className="gst-card-icon">%</span><span>TDS on owner payout</span></span>
                  <strong>1%</strong>
                  <small>Sec 194C · contractor payments</small>
                </div>
                <div className="gst-card accent-blue">
                  <span className="gst-card-top"><span className="gst-card-icon">₹</span><span>TDS threshold</span></span>
                  <strong>₹30,000</strong>
                  <small>Single contract / aggregate during the year</small>
                </div>
              </div>
            </section>
          </div>
        </>
      )}

      {(section === 'Invoices & Billing' || showAll(section)) && (
        <>
          <h2 className="gst-section-heading"><span className="gst-section-no">{sectionNumber('Invoices & Billing')}</span> Invoices & Billing</h2>
          <div className="gst-summary-grid">
            {gstCard('▤', 'Invoices raised', String(invoices.length), 'accent-slate')}
            {gstCard('₹', 'Net taxable value', `₹${totalInvoiced.toLocaleString('en-IN')}`, 'accent-blue')}
            {gstCard('%', 'Total GST collected', `₹${totalGst.toLocaleString('en-IN')}`, 'accent-purple')}
            {gstCard('⏳', 'Pending / overdue', String(pendingInvoices.length), 'accent-orange')}
          </div>

          <section className="panel" aria-labelledby="invoice-list-title">
            <div className="panel-header">
              <div>
                <h3 id="invoice-list-title">Invoices</h3>
                <span className="health-meta">Showing {filteredInvoices.length} of {invoices.length} invoices · filter by payment status</span>
              </div>
              <div className="gst-filter-row">
                <select aria-label="Filter by payment status" value={invoiceStatusFilter} onChange={(event) => setInvoiceStatusFilter(event.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr>
                    <th>Invoice</th><th>Date</th><th>Customer</th><th>Owner</th>
                    <th>Taxable</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Total</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((row) => (
                    <tr key={row.no}>
                      <td><strong>{row.no}</strong></td>
                      <td>{row.date}</td>
                      <td>{row.customer}</td>
                      <td>{row.owner}</td>
                      <td>₹{row.taxable.toLocaleString('en-IN')}</td>
                      <td>₹{row.cgst.toLocaleString('en-IN')}</td>
                      <td>₹{row.sgst.toLocaleString('en-IN')}</td>
                      <td>₹{row.igst.toLocaleString('en-IN')}</td>
                      <td><strong>₹{row.total.toLocaleString('en-IN')}</strong></td>
                      <td><span className={`booking-date-status ${row.status === 'Paid' ? 'completed' : row.status === 'Pending' ? 'pending' : 'cancelled'}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="gst-note">Illustrative invoice records for interface preview; amounts are sample data.</p>
          </section>
        </>
      )}

      {(section === 'Reports & Compliance' || showAll(section)) && (
        <>
          <h2 className="gst-section-heading"><span className="gst-section-no">{sectionNumber('Reports & Compliance')}</span> Reports & Compliance</h2>
          <div className="gst-summary-grid gst-summary-three">
            {gstCard('▤', 'GSTR-1 · Sep 2026', 'Due 11 Oct', 'accent-orange')}
            {gstCard('◈', 'GSTR-3B · Sep 2026', 'Due 20 Oct', 'accent-blue')}
            {gstCard('✓', 'ITC reconciliation', 'In sync', 'accent-green')}
          </div>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Filing calendar</h3>
                <span className="health-meta">Period-wise GST returns and their filing status.</span>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr><th>Tax period</th><th>Form</th><th>Status</th><th>Filed on</th><th>Due date</th></tr>
                </thead>
                <tbody>
                  {filings.map((row, index) => (
                    <tr key={`${row.period}-${row.form}-${index}`}>
                      <td><strong>{row.period}</strong></td>
                      <td>{row.form}</td>
                      <td><span className={`booking-date-status ${row.status === 'Filed' ? 'completed' : 'pending'}`}>{row.status}</span></td>
                      <td>{row.filedOn}</td>
                      <td>{row.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="gst-note">Filing dates are illustrative and follow standard GST return due dates in India.</p>
          </section>
        </>
      )}

      {(section === 'GST Audit Logs' || showAll(section)) && (
        <>
          <h2 className="gst-section-heading"><span className="gst-section-no">{sectionNumber('GST Audit Logs')}</span> GST Audit Logs</h2>
          <div className="gst-summary-grid gst-summary-three">
            {gstCard('▤', 'Total events', String(gstAuditEvents.length), 'accent-slate')}
            {gstCard('✓', 'This week', '3', 'accent-green')}
            {gstCard('⚠', 'Configuration changes', '2', 'accent-orange')}
          </div>

          <section className="panel" aria-labelledby="gst-audit-title">
            <div className="panel-header">
              <div>
                <h3 id="gst-audit-title">GST activity trail</h3>
                <span className="health-meta">Chronological log of GST configuration, verification and filing actions.</span>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Details</th></tr>
                </thead>
                <tbody>
                  {gstAuditEvents.map((event, index) => (
                    <tr key={index}>
                      <td>{event.time}</td>
                      <td>{event.actor}</td>
                      <td><span className={`booking-date-status ${event.action.includes('verified') ? 'completed' : event.action.includes('rate changed') ? 'pending' : 'ongoing'}`}>{event.action}</span></td>
                      <td className="operator-record-details">{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="gst-note">Illustrative audit log for interface preview; entries are sample events.</p>
          </section>
        </>
      )}
    </div>
  )
}