import { useState } from 'react'
import { documentSections, type DocumentSection } from './documentSections'

type DocVerificationStatus = 'Pending' | 'Approved' | 'Rejected'

type DocumentManagementPageProps = {
  section: DocumentSection | 'all'
  onNavigate: (section: DocumentSection) => void
  onBack: () => void
}

const vehicleDocs = [
  { reg: 'TS 09 HR 4521', vehicle: 'Backhoe Loader', owner: 'Deccan Heavy Machinery', rc: 'Valid', insurance: '18 Dec 2026', puc: '05 Nov 2026', fitness: 'Valid', permit: '31 Mar 2027', status: 'Compliant' },
  { reg: 'TS 08 XU 1890', vehicle: 'Excavator', owner: 'Sri Krishna Equipment Rentals', rc: 'Valid', insurance: '12 Oct 2026', puc: '22 Nov 2026', fitness: 'Valid', permit: '15 Feb 2027', status: 'Attention' },
  { reg: 'MH 12 KL 3401', vehicle: 'Crane', owner: 'Metro Machines Mumbai', rc: 'Valid', insurance: '05 Sep 2026', puc: '28 Sep 2026', fitness: '12 Nov 2026', permit: '30 Apr 2027', status: 'Expired' },
  { reg: 'TG 21 AV 7812', vehicle: 'Boom Lift', owner: 'Greenfield Earthworks', rc: 'Valid', insurance: '09 Jan 2027', puc: '18 Dec 2026', fitness: '20 Nov 2026', permit: '21 Aug 2027', status: 'Compliant' },
  { reg: 'GU 05 ER 6620', vehicle: 'Compactor', owner: 'Harmony Logistics', rc: 'Valid', insurance: '26 Aug 2026', puc: '02 Oct 2026', fitness: 'Valid', permit: '11 Jan 2027', status: 'Expired' },
  { reg: 'KA 03 NS 3307', vehicle: 'Roller', owner: 'Coastal Crane Co', rc: 'Valid', insurance: '14 Feb 2027', puc: '27 Dec 2026', fitness: 'Valid', permit: '09 Jun 2027', status: 'Compliant' },
]

const driverDocs = [
  { driver: 'Ramesh K.', dlNo: 'TS-0920150432510', vehicleClass: 'LMV · Heavy', validTill: '18 Apr 2027', state: 'Telangana', status: 'Verified' },
  { driver: 'Suresh M.', dlNo: 'TS-0820180211191', vehicleClass: 'LMV', validTill: '02 Nov 2026', state: 'Telangana', status: 'Expiring' },
  { driver: 'Amit P.', dlNo: 'MH-1220163014988', vehicleClass: 'LMV · Heavy · Crane', validTill: '25 Oct 2026', state: 'Maharashtra', status: 'Expiring' },
  { driver: 'Nagaraju V.', dlNo: 'TG-2120190418870', vehicleClass: 'LMV · Heavy', validTill: '12 Aug 2027', state: 'Andhra Pradesh', status: 'Verified' },
  { driver: 'Farhan S.', dlNo: 'GU-0520201176309', vehicleClass: 'LMV', validTill: '15 Dec 2026', state: 'Gujarat', status: 'Pending' },
  { driver: 'Karthik R.', dlNo: 'KA-0320202055192', vehicleClass: 'LMV · Heavy', validTill: '30 Jan 2027', state: 'Karnataka', status: 'Verified' },
]

const ownerDocs = [
  { owner: 'Deccan Heavy Machinery', id: 'Aadhaar · PAN ✓', address: 'Utility bill · Rent agreement ✓', business: 'GST cert · Bank statement ✓', status: 'Complete' },
  { owner: 'Sri Krishna Equipment Rentals', id: 'Aadhaar · PAN ✓', address: 'Utility bill ✓', business: 'GST cert ✓', status: 'Partial' },
  { owner: 'Metro Machines Mumbai', id: 'PAN ✓', address: 'Utility bill ✓', business: 'Business proof pending', status: 'Partial' },
  { owner: 'Greenfield Earthworks', id: 'Aadhaar · PAN ✓', address: 'Utility bill ✓', business: 'GST cert · MoA ✓', status: 'Complete' },
  { owner: 'Harmony Logistics', id: 'Aadhaar · PAN ✓', address: 'Rent agreement ✓', business: 'GST cert ✓', status: 'Complete' },
  { owner: 'North Ridge Infra', id: 'Aadhaar ✓', address: 'Proof pending', business: 'GST cert ✓', status: 'Partial' },
  { owner: 'Coastal Crane Co', id: 'Aadhaar · PAN ✓', address: 'Utility bill ✓', business: 'GST cert · Bank statement ✓', status: 'Complete' },
]

const taxDocs = [
  { name: 'GST registration certificate', ref: '36AAECI6729R1ZK', period: 'Valid till lifetime', onFile: '12 Mar 2023', status: 'On file' },
  { name: 'GSTR-1 · Jul 2026', ref: 'RET-2026-07', period: 'Jul 2026', onFile: '10 Aug 2026', status: 'Filed' },
  { name: 'GSTR-3B · Jul 2026', ref: 'RET-2026-07B', period: 'Jul 2026', onFile: '20 Aug 2026', status: 'Filed' },
  { name: 'GSTR-1 · Aug 2026', ref: 'RET-2026-08', period: 'Aug 2026', onFile: '10 Sep 2026', status: 'Filed' },
  { name: 'GSTR-3B · Aug 2026', ref: 'RET-2026-08B', period: 'Aug 2026', onFile: '20 Sep 2026', status: 'Filed' },
  { name: 'GSTR-1 · Sep 2026', ref: 'RET-2026-09', period: 'Sep 2026', onFile: '—', status: 'Pending' },
  { name: 'ITC reconciliation', ref: 'ITC-2026-R2', period: 'Q2 FY26-27', onFile: '01 Oct 2026', status: 'On file' },
]

const expiries = [
  { entity: 'Crane · MH 12 KL 3401', owner: 'Metro Machines Mumbai', document: 'Insurance', expiry: '05 Sep 2026', daysLeft: 'Expired' },
  { entity: 'Compactor · GU 05 ER 6620', owner: 'Harmony Logistics', document: 'Insurance', expiry: '26 Aug 2026', daysLeft: 'Expired' },
  { entity: 'Compactor · GU 05 ER 6620', owner: 'Harmony Logistics', document: 'PUC', expiry: '02 Oct 2026', daysLeft: '10 days' },
  { entity: 'Crane · MH 12 KL 3401', owner: 'Metro Machines Mumbai', document: 'PUC', expiry: '28 Sep 2026', daysLeft: '14 days' },
  { entity: 'Excavator · TS 08 XU 1890', owner: 'Sri Krishna Equipment Rentals', document: 'Insurance', expiry: '12 Oct 2026', daysLeft: 'Due today' },
  { entity: 'Amit P.', owner: 'Metro Machines Mumbai', document: 'Driving licence', expiry: '25 Oct 2026', daysLeft: '12 days' },
  { entity: 'Suresh M.', owner: 'Sri Krishna Equipment Rentals', document: 'Driving licence', expiry: '02 Nov 2026', daysLeft: '20 days' },
]

const pendingVerifications = [
  { entity: 'Farhan S.', type: 'Driving licence', uploaded: '11 Oct 2026', submittedBy: 'Sri Krishna Equipment Rentals', status: 'Pending' },
  { entity: 'Harmony Logistics', type: 'Business documents', uploaded: '09 Oct 2026', submittedBy: 'Owner self-service', status: 'Pending' },
  { entity: 'Metro Machines Mumbai', type: 'Business proof', uploaded: '08 Oct 2026', submittedBy: 'Owner self-service', status: 'Pending' },
  { entity: 'TG 21 AV 7812', type: 'Fitness certificate', uploaded: '06 Oct 2026', submittedBy: 'North Ridge Infra', status: 'Pending' },
]

const docHistory = [
  { time: '12 Oct 2026 · 10:15', actor: 'Super Admin', action: 'Uploaded', detail: 'Fitness certificate for TG 21 AV 7812 added to vehicle record.' },
  { time: '11 Oct 2026 · 16:42', actor: 'Owner', action: 'Uploaded', detail: 'Driving licence (DL) submitted by Farhan S. for verification.' },
  { time: '10 Oct 2026 · 09:30', actor: 'Finance Admin', action: 'Verified', detail: 'GST registration certificate confirmed for Greenfield Earthworks.' },
  { time: '08 Oct 2026 · 14:05', actor: 'Owner', action: 'Uploaded', detail: 'Business documents submitted by Harmony Logistics.' },
  { time: '06 Oct 2026 · 11:48', actor: 'Super Admin', action: 'Renewed', detail: 'PUC renewed for Excavator TS 08 XU 1890.' },
  { time: '01 Oct 2026 · 08:20', actor: 'System', action: 'Expired', detail: 'Insurance lapsed on Crane MH 12 KL 3401 — alert raised.' },
]

export default function DocumentManagementPage({ section, onNavigate, onBack }: DocumentManagementPageProps) {
  const activeSection: DocumentSection = section === 'all' ? 'Vehicle Documents' : section
  const [vehicleFilter, setVehicleFilter] = useState<string>('All')
  const [driverFilter, setDriverFilter] = useState<string>('All')
  const [ownerFilter, setOwnerFilter] = useState<string>('All')
  const [taxFilter, setTaxFilter] = useState<string>('All')
  const [verifications, setVerifications] = useState(() =>
    pendingVerifications.map((row) => ({ ...row, status: 'Pending' as DocVerificationStatus })),
  )
  const [history, setHistory] = useState(docHistory)

  const reviewDocument = (index: number, status: DocVerificationStatus) => {
    const row = verifications[index]
    if (!row || row.status === status) return
    setVerifications((prev) => prev.map((item, i) => (i === index ? { ...item, status } : item)))
    setHistory((prev) => [
      {
        time: 'Just now',
        actor: 'Super Admin',
        action: status === 'Approved' ? 'Verified' : 'Rejected',
        detail: `${row.type} for ${row.entity} ${status === 'Approved' ? 'approved' : 'rejected'} by Super Admin.`,
      },
      ...prev,
    ])
  }

  const filteredVehicles = vehicleDocs.filter((row) => vehicleFilter === 'All' || row.status === vehicleFilter)
  const filteredDrivers = driverDocs.filter((row) => driverFilter === 'All' || row.status === driverFilter)
  const filteredOwners = ownerDocs.filter((row) => ownerFilter === 'All' || row.status === ownerFilter)
  const filteredTaxDocs = taxDocs.filter((row) => taxFilter === 'All' || row.status === taxFilter)

  const docCard = (icon: string, label: string, value: string, accent: 'accent-green' | 'accent-blue' | 'accent-orange' | 'accent-purple' | 'accent-red' | 'accent-slate') => (
    <article className={`doc-card ${accent}`}>
      <span className="doc-card-top"><span className="doc-card-icon">{icon}</span><span>{label}</span></span>
      <strong>{value}</strong>
    </article>
  )

  return (
    <div className="doc-page">
      <style>{`
        .doc-page {
          display: grid;
          gap: 18px;
          min-width: 0;
        }

        .doc-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .doc-section-heading {
          margin: 0;
          font-size: 1rem;
          letter-spacing: -0.01em;
          color: var(--text);
        }

        .doc-tabs .doc-tab {
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: #fff;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
        }
        .doc-tabs .doc-tab:hover { border-color: rgba(255, 107, 44, 0.4); color: #c94310; }
        .doc-tabs .doc-tab.active { background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep)); color: #fff; border-color: transparent; box-shadow: 0 10px 22px -10px rgba(239, 74, 18, 0.7); }

        .doc-summary-grid {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .doc-summary-grid.doc-summary-three { grid-template-columns: repeat(3, minmax(0, 1fr)); }

        .doc-card {
          display: grid;
          gap: 8px;
          padding: 16px 18px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid var(--line);
          border-left: 4px solid rgba(15, 23, 42, 0.12);
          box-shadow: var(--shadow);
        }
        .doc-card strong { font-size: 1.3rem; letter-spacing: -0.02em; }
        .doc-card small { color: var(--muted); }

        .doc-card-top { display: flex; align-items: center; gap: 8px; font-size: 0.76rem; font-weight: 700; color: #475569; }
        .doc-card-icon { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 7px; font-size: 0.72rem; background: rgba(15, 23, 42, 0.08); }

        .doc-card.accent-slate { border-left-color: #64748b; }
        .doc-card.accent-green { border-left-color: #08a66c; }
        .doc-card.accent-green strong { color: #078653; }
        .doc-card.accent-green .doc-card-icon { background: rgba(8, 166, 108, 0.14); color: #078653; }
        .doc-card.accent-red { border-left-color: #ef4444; }
        .doc-card.accent-red strong { color: #dc2626; }
        .doc-card.accent-red .doc-card-icon { background: rgba(239, 68, 68, 0.13); color: #dc2626; }
        .doc-card.accent-orange { border-left-color: #ff6b2c; }
        .doc-card.accent-orange strong { color: #c94310; }
        .doc-card.accent-orange .doc-card-icon { background: rgba(255, 107, 44, 0.15); color: #c94310; }
        .doc-card.accent-blue { border-left-color: #2563eb; }
        .doc-card.accent-blue strong { color: #1d4ed8; }
        .doc-card.accent-blue .doc-card-icon { background: rgba(37, 99, 235, 0.13); color: #1d4ed8; }
        .doc-card.accent-purple { border-left-color: #7c3aed; }
        .doc-card.accent-purple strong { color: #6d28d9; }
        .doc-card.accent-purple .doc-card-icon { background: rgba(124, 58, 237, 0.13); color: #6d28d9; }

        .doc-sub-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .doc-filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .doc-filter-row select {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text);
        }

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
          color: var(--brand-orange);
          cursor: pointer;
        }
        .kpi-detail-back:hover { color: #c94310; text-decoration: underline; }

        .operator-record-details {
          max-width: 280px;
          color: #64748b;
          font-size: 0.78rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doc-note {
          margin: 0;
          padding: 0 18px 18px;
          color: #64748b;
          font-size: 0.78rem;
          line-height: 1.5;
        }

        .doc-review-actions {
          display: flex;
          gap: 8px;
        }

        .doc-review-btn {
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fff;
          border-radius: 8px;
          padding: 5px 10px;
          font: inherit;
          font-size: 0.74rem;
          font-weight: 800;
          color: #475569;
          cursor: pointer;
          white-space: nowrap;
        }

        .doc-review-btn.approve:hover { border-color: rgba(8, 166, 108, 0.5); color: #078653; }
        .doc-review-btn.reject:hover { border-color: rgba(220, 38, 38, 0.5); color: #dc2626; }
        .doc-review-btn.approve.active { background: rgba(8, 166, 108, 0.12); border-color: rgba(8, 166, 108, 0.5); color: #078653; }
        .doc-review-btn.reject.active { background: rgba(220, 38, 38, 0.12); border-color: rgba(220, 38, 38, 0.5); color: #dc2626; }
        .doc-review-btn:focus-visible { outline: 3px solid rgba(255, 107, 44, 0.4); outline-offset: 2px; }
      `}</style>

      <header className="dashboard-header">
        <div>
          <button type="button" className="kpi-detail-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Dashboard overview
          </button>
          
          <h1 className="header-title">{activeSection}</h1>
        
        </div>
        <span className="chip active">Docs synced</span>
      </header>

      <nav className="doc-tabs" aria-label="Document features">
        {documentSections.map((item) => (
          <button
            key={item}
            type="button"
            className={`doc-tab ${activeSection === item ? 'active' : ''}`}
            aria-current={activeSection === item ? 'location' : undefined}
            onClick={() => onNavigate(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      {activeSection === 'Vehicle Documents' && (
        <>
          <h2 className="doc-section-heading">Vehicle Documents</h2>
          <div className="doc-summary-grid doc-summary-three">
            {docCard('▤', 'Vehicles tracked', String(vehicleDocs.length), 'accent-slate')}
            {docCard('✓', 'Fully compliant', String(vehicleDocs.filter((row) => row.status === 'Compliant').length), 'accent-green')}
            {docCard('⚠', 'On alert / expired', String(vehicleDocs.filter((row) => row.status !== 'Compliant').length), 'accent-orange')}
          </div>

          <section className="panel" aria-labelledby="vehicle-docs-title">
            <div className="panel-header">
              <div>
                <h3 id="vehicle-docs-title">RC · Insurance · PUC · Fitness · Permits</h3>
                <span className="health-meta">Showing {filteredVehicles.length} of {vehicleDocs.length} vehicles · filter by compliance status</span>
              </div>
              <div className="doc-filter-row">
                <select aria-label="Filter by compliance status" value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="Compliant">Compliant</option>
                  <option value="Attention">Attention</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr>
                    <th>Vehicle</th><th>Equipment</th><th>RC</th><th>Insurance</th><th>PUC</th><th>Fitness</th><th>Permit</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((row) => (
                    <tr key={row.reg}>
                      <td><strong>{row.reg}</strong></td>
                      <td>{row.vehicle}</td>
                      <td><span className="booking-date-status completed">{row.rc}</span></td>
                      <td>{row.insurance}</td>
                      <td>{row.puc}</td>
                      <td>{row.fitness}</td>
                      <td>{row.permit}</td>
                      <td><span className={`booking-date-status ${row.status === 'Compliant' ? 'completed' : row.status === 'Attention' ? 'ongoing' : 'pending'}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="doc-note">Keep RC, Insurance, PUC, Fitness Certificate and Permits up to date for every asset.</p>
          </section>
        </>
      )}

      {activeSection === 'Driver Documents' && (
        <>
          <h2 className="doc-section-heading">Driver Documents</h2>
          <div className="doc-summary-grid doc-summary-three">
            {docCard('▤', 'Drivers', String(driverDocs.length), 'accent-slate')}
            {docCard('✓', 'DL verified', String(driverDocs.filter((row) => row.status === 'Verified').length), 'accent-green')}
            {docCard('⚠', 'Expiring / pending', String(driverDocs.filter((row) => row.status !== 'Verified').length), 'accent-orange')}
          </div>

          <section className="panel" aria-labelledby="driver-docs-title">
            <div className="panel-header">
              <div>
                <h3 id="driver-docs-title">Driving licence records</h3>
                <span className="health-meta">Showing {filteredDrivers.length} of {driverDocs.length} drivers · Driving Licence (DL) verification status</span>
              </div>
              <div className="doc-filter-row">
                <select aria-label="Filter by licence status" value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="Verified">Verified</option>
                  <option value="Expiring">Expiring</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr>
                    <th>Driver</th><th>DL number</th><th>Vehicle class</th><th>Valid till</th><th>State</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((row) => (
                    <tr key={row.dlNo}>
                      <td><strong>{row.driver}</strong></td>
                      <td>{row.dlNo}</td>
                      <td>{row.vehicleClass}</td>
                      <td>{row.validTill}</td>
                      <td>{row.state}</td>
                      <td><span className={`booking-date-status ${row.status === 'Verified' ? 'completed' : row.status === 'Expiring' ? 'ongoing' : 'pending'}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="doc-note">Verify DL validity before assigning a driver to a vehicle.</p>
          </section>
        </>
      )}

      {activeSection === 'Owner Documents' && (
        <>
          <h2 className="doc-section-heading">Owner Documents</h2>
          <div className="doc-summary-grid doc-summary-three">
            {docCard('▤', 'Owners', String(ownerDocs.length), 'accent-slate')}
            {docCard('✓', 'Complete set', String(ownerDocs.filter((row) => row.status === 'Complete').length), 'accent-green')}
            {docCard('⚠', 'Partial set', String(ownerDocs.filter((row) => row.status === 'Partial').length), 'accent-orange')}
          </div>

          <section className="panel" aria-labelledby="owner-docs-title">
            <div className="panel-header">
              <div>
                <h3 id="owner-docs-title">ID proof · Address proof · Business documents</h3>
                <span className="health-meta">Showing {filteredOwners.length} of {ownerDocs.length} owners · document completeness</span>
              </div>
              <div className="doc-filter-row">
                <select aria-label="Filter by document completeness" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="Complete">Complete</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr>
                    <th>Owner</th><th>ID proof</th><th>Address proof</th><th>Business documents</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwners.map((row) => (
                    <tr key={row.owner}>
                      <td><strong>{row.owner}</strong></td>
                      <td>{row.id}</td>
                      <td>{row.address}</td>
                      <td>{row.business}</td>
                      <td><span className={`booking-date-status ${row.status === 'Complete' ? 'completed' : 'pending'}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="doc-note">Owner document records cover ID proof, address proof and business documents.</p>
          </section>
        </>
      )}

      {activeSection === 'GST & Tax Documents' && (
        <>
          <h2 className="doc-section-heading">GST & Tax Documents</h2>
          <div className="doc-summary-grid doc-summary-three">
            {docCard('▤', 'Documents on file', String(taxDocs.length), 'accent-slate')}
            {docCard('✓', 'Filed / on file', String(taxDocs.filter((row) => row.status !== 'Pending').length), 'accent-green')}
            {docCard('⏳', 'Pending', String(taxDocs.filter((row) => row.status === 'Pending').length), 'accent-orange')}
          </div>

          <section className="panel" aria-labelledby="tax-docs-title">
            <div className="panel-header">
              <div>
                <h3 id="tax-docs-title">GST returns, certificates & tax records</h3>
                <span className="health-meta">Showing {filteredTaxDocs.length} of {taxDocs.length} documents · GST forms and tax references</span>
              </div>
              <div className="doc-filter-row">
                <select aria-label="Filter by document status" value={taxFilter} onChange={(event) => setTaxFilter(event.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="On file">On file</option>
                  <option value="Filed">Filed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr>
                    <th>Document</th><th>Reference / number</th><th>Period</th><th>On file</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaxDocs.map((row) => (
                    <tr key={row.ref}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.ref}</td>
                      <td>{row.period}</td>
                      <td>{row.onFile}</td>
                      <td><span className={`booking-date-status ${row.status === 'Pending' ? 'pending' : 'completed'}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="doc-note">GST & tax document store retains registration certificates, returns and tax references.</p>
          </section>
        </>
      )}

      {activeSection === 'Verification & Expiry Tracking' && (
        <>
          <h2 className="doc-section-heading">Verification & Expiry Tracking</h2>
          <div className="doc-summary-grid doc-summary-three">
            {docCard('⚠', 'Expired', String(expiries.filter((row) => row.daysLeft === 'Expired').length), 'accent-red')}
            {docCard('⏳', 'Expiring in 30 days', String(expiries.filter((row) => row.daysLeft !== 'Expired' && row.daysLeft !== 'Due today').length), 'accent-orange')}
            {docCard('◔', 'Pending verification', String(verifications.filter((row) => row.status === 'Pending').length), 'accent-blue')}
          </div>

          <div className="doc-sub-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Upcoming expiries</h3>
                  <span className="health-meta">Documents expiring or already lapsed across vehicles and drivers.</span>
                </div>
              </div>
              <div className="chart-wrap kpi-detail-table-wrap">
                <table className="state-table kpi-detail-table">
                  <thead>
                    <tr><th>Entity</th><th>Document</th><th>Expiry</th><th>Days left</th></tr>
                  </thead>
                  <tbody>
                    {expiries.map((row, index) => (
                      <tr key={index}>
                        <td><strong>{row.entity}</strong></td>
                        <td>{row.owner}</td>
                        <td>{row.expiry}</td>
                        <td><span className={`booking-date-status ${row.daysLeft === 'Expired' ? 'pending' : 'ongoing'}`}>{row.daysLeft}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Verification queue</h3>
                  <span className="health-meta">Documents uploaded and awaiting verification. Super Admins can approve or reject each submission.</span>
                </div>
              </div>
              <div className="chart-wrap kpi-detail-table-wrap">
                <table className="state-table kpi-detail-table">
                  <thead>
                    <tr><th>Entity</th><th>Document</th><th>Uploaded</th><th>Submitted by</th><th>Status</th><th>Decision</th></tr>
                  </thead>
                  <tbody>
                    {verifications.map((row, index) => (
                      <tr key={index}>
                        <td><strong>{row.entity}</strong></td>
                        <td>{row.type}</td>
                        <td>{row.uploaded}</td>
                        <td>{row.submittedBy}</td>
                        <td><span className={`booking-date-status ${row.status === 'Approved' ? 'completed' : row.status === 'Rejected' ? 'pending' : 'ongoing'}`}>{row.status}</span></td>
                        <td>
                          <div className="doc-review-actions">
                            <button type="button" className={`doc-review-btn approve ${row.status === 'Approved' ? 'active' : ''}`} onClick={() => reviewDocument(index, 'Approved')}>Approve</button>
                            <button type="button" className={`doc-review-btn reject ${row.status === 'Rejected' ? 'active' : ''}`} onClick={() => reviewDocument(index, 'Rejected')}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <p className="doc-note">Expiry and verification tracking; renewal alerts fire as documents approach their due date.</p>
        </>
      )}

      {activeSection === 'Document History' && (
        <>
          <h2 className="doc-section-heading">Document History</h2>
          <div className="doc-summary-grid doc-summary-three">
            {docCard('▤', 'Total events', String(history.length), 'accent-slate')}
            {docCard('✓', 'Verified / renewed', String(history.filter((event) => event.action === 'Verified' || event.action === 'Renewed').length), 'accent-green')}
            {docCard('⬆', 'Uploads this week', '3', 'accent-blue')}
          </div>

          <section className="panel" aria-labelledby="doc-history-title">
            <div className="panel-header">
              <div>
                <h3 id="doc-history-title">Document activity trail</h3>
                <span className="health-meta">Chronological log of document uploads, verifications, renewals and expiry alerts.</span>
              </div>
            </div>
            <div className="chart-wrap kpi-detail-table-wrap">
              <table className="state-table kpi-detail-table">
                <thead>
                  <tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Details</th></tr>
                </thead>
                <tbody>
                  {history.map((event, index) => (
                    <tr key={index}>
                      <td>{event.time}</td>
                      <td>{event.actor}</td>
                      <td><span className={`booking-date-status ${event.action === 'Expired' || event.action === 'Rejected' ? 'pending' : event.action === 'Uploaded' ? 'ongoing' : 'completed'}`}>{event.action}</span></td>
                      <td className="operator-record-details">{event.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
