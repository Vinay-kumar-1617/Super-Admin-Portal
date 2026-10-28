import { commissionBookings, completedRevenueBookings, kpiMetrics, revenueBookings } from './kpiData'
import type { PayoutRequest } from './attentionData'

type FinancePageProps = {
  payoutRequests: PayoutRequest[]
  onBack: () => void
  onOpenRevenue: () => void
  onOpenPayouts: () => void
  onOpenBookings: () => void
  onOpenGst: () => void
  onOpenRefunds: () => void
}

const formatRupees = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const revenueMetric = kpiMetrics.find((metric) => metric.label === 'Total Revenue')
const commissionMetric = kpiMetrics.find((metric) => metric.label === 'Platform Commission')

export default function FinancePage({
  payoutRequests,
  onBack,
  onOpenRevenue,
  onOpenPayouts,
  onOpenBookings,
  onOpenGst,
  onOpenRefunds,
}: FinancePageProps) {
  const pendingPayoutTotal = payoutRequests.reduce((total, payout) => total + payout.amount, 0)
  const pendingSettlements = commissionBookings.filter((booking) => booking.settlement === 'Pending')
  const grossRevenue = completedRevenueBookings.reduce((total, booking) => total + booking.bookingValue, 0)
  const revenuePeriods = revenueMetric?.periods ?? []
  const maxRevenue = revenueMetric ? Math.max(...revenueMetric.data) : 0

  return (
    <div className="finance-page">
      <style>{`
        .finance-page {
          display: grid;
          gap: 18px;
          min-width: 0;
          color: #172033;
        }

        .finance-page * {
          box-sizing: border-box;
        }

        .finance-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 22px;
          border: 1px solid #e8edf3;
          border-radius: 18px;
          background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
          box-shadow: 0 12px 32px -26px rgba(15, 23, 42, 0.45);
        }

        .finance-heading p,
        .finance-heading h1 {
          margin: 0;
        }

        .finance-kicker {
          color: #b4532b;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .finance-heading h1 {
          margin-top: 4px;
          font-size: clamp(1.45rem, 2vw, 1.9rem);
          letter-spacing: -0.04em;
        }

        .finance-subtitle {
          margin-top: 5px !important;
          color: #64748b;
          font-size: 0.82rem;
        }

        .finance-back,
        .finance-link,
        .finance-tool {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #fff;
          color: #273449;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
        }

        .finance-back {
          flex: 0 0 auto;
          padding: 9px 12px;
          font-size: 0.78rem;
          color: var(--brand-orange-deep);
        }

        .finance-back:hover,
        .finance-link:hover,
        .finance-tool:hover {
          border-color: #f1a17d;
          background: #fffaf7;
        }

        .finance-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .finance-stat {
          display: grid;
          gap: 10px;
          min-width: 0;
          padding: 17px;
          border: 1px solid #e8edf3;
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 8px 24px -22px rgba(15, 23, 42, 0.45);
        }

        button.finance-stat {
          width: 100%;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }

        button.finance-stat:hover {
          transform: translateY(-2px);
          border-color: #f1a17d;
          box-shadow: 0 12px 26px -20px rgba(239, 74, 18, 0.4);
        }

        button.finance-stat:focus-visible {
          outline: 3px solid rgba(239, 74, 18, 0.35);
          outline-offset: 2px;
        }

        .finance-stat-label {
          color: #64748b;
          font-size: 0.73rem;
          font-weight: 650;
        }

        .finance-stat-value {
          overflow-wrap: anywhere;
          color: #111827;
          font-size: clamp(1.15rem, 1.8vw, 1.55rem);
          font-weight: 780;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }

        .finance-stat-note {
          color: #8390a2;
          font-size: 0.69rem;
          line-height: 1.4;
        }

        .finance-stat-note.attention { color: #b45309; }

        .finance-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
          gap: 14px;
        }

        .finance-panel {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e8edf3;
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 8px 24px -22px rgba(15, 23, 42, 0.45);
        }

        .finance-panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 18px;
          border-bottom: 1px solid #edf1f5;
        }

        .finance-panel-head h2 {
          margin: 0;
          color: #172033;
          font-size: 0.94rem;
          font-weight: 760;
        }

        .finance-panel-head p {
          margin: 4px 0 0;
          color: #8390a2;
          font-size: 0.72rem;
        }

        .finance-link {
          padding: 7px 10px;
          color: #b4532b;
          font-size: 0.7rem;
          white-space: nowrap;
        }

        .finance-trend {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: end;
          gap: 12px;
          min-height: 202px;
          padding: 20px 20px 16px;
        }

        .finance-quarter {
          display: grid;
          grid-template-rows: 1fr auto auto;
          justify-items: center;
          gap: 8px;
          height: 166px;
          min-width: 0;
        }

        .finance-bar-slot {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          height: 100%;
          border-bottom: 1px solid #e7edf3;
          background: repeating-linear-gradient(to bottom, transparent 0 39px, #f1f4f7 40px);
        }

        .finance-bar {
          width: min(44px, 62%);
          min-height: 8px;
          border-radius: 7px 7px 2px 2px;
          background: linear-gradient(180deg, #fb8b5c 0%, #ef4a12 100%);
          box-shadow: 0 5px 14px rgba(239, 74, 18, 0.15);
        }

        .finance-bar-value {
          color: #344054;
          font-size: 0.68rem;
          font-weight: 750;
          white-space: nowrap;
        }

        .finance-bar-label {
          color: #8390a2;
          font-size: 0.67rem;
          font-weight: 650;
        }

        .finance-payout-list {
          display: grid;
        }

        .finance-payout-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f3f6;
        }

        .finance-payout-row:last-child { border-bottom: 0; }

        .finance-payout-name {
          overflow: hidden;
          color: #293548;
          font-size: 0.76rem;
          font-weight: 720;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .finance-payout-meta {
          margin-top: 4px;
          color: #8390a2;
          font-size: 0.67rem;
        }

        .finance-payout-amount {
          color: #172033;
          font-size: 0.77rem;
          font-weight: 760;
          white-space: nowrap;
        }

        .finance-empty {
          padding: 22px 16px;
          color: #64748b;
          font-size: 0.78rem;
        }

        .finance-table-wrap {
          overflow-x: auto;
        }

        .finance-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.74rem;
          text-align: left;
        }

        .finance-table th,
        .finance-table td {
          padding: 11px 16px;
          border-bottom: 1px solid #f0f3f6;
          white-space: nowrap;
        }

        .finance-table th {
          background: #f8fafc;
          color: #78869a;
          font-size: 0.64rem;
          font-weight: 750;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .finance-table td { color: #475569; }
        .finance-table td strong { color: #1e293b; }

        .finance-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7c5a11;
          font-size: 0.68rem;
          font-weight: 700;
        }

        .finance-status::before {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e4a11b;
          content: '';
        }

        .finance-tools {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .finance-tool {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          text-align: left;
        }

        .finance-tool span:first-child {
          display: grid;
          gap: 4px;
          color: #293548;
          font-size: 0.78rem;
        }

        .finance-tool small {
          color: #8390a2;
          font-size: 0.67rem;
          font-weight: 500;
        }

        .finance-tool-arrow { color: #ef4a12; }

        @media (max-width: 950px) {
          .finance-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .finance-main-grid { grid-template-columns: minmax(0, 1fr); }
        }

        @media (max-width: 640px) {
          .finance-heading { align-items: flex-start; padding: 16px; }
          .finance-back { padding: 8px; }
          .finance-tools { grid-template-columns: minmax(0, 1fr); }
        }
      `}</style>

      <header className="finance-heading">
        <div>
          <p className="finance-kicker">Super Admin · Finance</p>
          <h1>Finance overview</h1>
          
        </div>
        <button type="button" className="finance-back" onClick={onBack}>← Dashboard</button>
      </header>

      <section className="finance-stat-grid" aria-label="Financial summary">
        <button type="button" className="finance-stat" onClick={onOpenRevenue} aria-label="View platform revenue details">
          <span className="finance-stat-label">Platform revenue</span>
          <strong className="finance-stat-value">{revenueMetric?.value ?? '—'}</strong>
          <span className="finance-stat-note">Quarterly gross rental revenue</span>
        </button>
        <button type="button" className="finance-stat" onClick={onOpenBookings} aria-label="View gross revenue in booking ledger">
          <span className="finance-stat-label">Gross revenue</span>
          <strong className="finance-stat-value">{formatRupees(grossRevenue)}</strong>
          <span className="finance-stat-note">Completed bookings · view ledger</span>
        </button>
        <article className="finance-stat">
          <span className="finance-stat-label">Platform commission</span>
          <strong className="finance-stat-value">{commissionMetric?.value ?? '—'}</strong>
          <span className="finance-stat-note">Commission earned across the platform</span>
        </article>
        <article className="finance-stat">
          <span className="finance-stat-label">Payouts awaiting approval</span>
          <strong className="finance-stat-value">{formatRupees(pendingPayoutTotal)}</strong>
          <span className="finance-stat-note attention">{payoutRequests.length} partner requests in queue</span>
        </article>
        <article className="finance-stat">
          <span className="finance-stat-label">Pending settlements</span>
          <strong className="finance-stat-value">{pendingSettlements.length}</strong>
          <span className="finance-stat-note">{commissionBookings.length} booking settlements tracked</span>
        </article>
      </section>

      <div className="finance-main-grid">
        <section className="finance-panel" aria-label="Quarterly revenue trend">
          <div className="finance-panel-head">
            <div>
              <h2>Revenue trend</h2>
              <p>Quarterly gross revenue · ₹M</p>
            </div>
            <button type="button" className="finance-link" onClick={onOpenBookings}>Booking ledger</button>
          </div>
          {revenueMetric && revenuePeriods.length > 0 ? (
            <div className="finance-trend">
              {revenuePeriods.map((period, index) => {
                const value = revenueMetric.data[index]
                if (value === undefined) return null
                return (
                  <div className="finance-quarter" key={period.full}>
                    <div className="finance-bar-slot">
                      <div
                        className="finance-bar"
                        style={{ height: `${maxRevenue > 0 ? (value / maxRevenue) * 100 : 0}%` }}
                        role="img"
                        aria-label={`${period.full}: ₹${value.toFixed(2)} million`}
                      />
                    </div>
                    <span className="finance-bar-value">₹{value.toFixed(2)}M</span>
                    <span className="finance-bar-label">{period.short}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="finance-empty">Quarterly revenue data is unavailable.</p>
          )}
        </section>

        <section className="finance-panel" aria-label="Payouts awaiting approval">
          <div className="finance-panel-head">
            <div>
              <h2>Pending partner payouts</h2>
              <p>{payoutRequests.length} requests · {formatRupees(pendingPayoutTotal)} total</p>
            </div>
            <button type="button" className="finance-link" onClick={onOpenPayouts}>Review queue</button>
          </div>
          <div className="finance-payout-list">
            {payoutRequests.length === 0 ? (
              <p className="finance-empty">No payouts are awaiting approval.</p>
            ) : payoutRequests.slice(0, 5).map((payout) => (
              <div className="finance-payout-row" key={payout.id}>
                <div>
                  <div className="finance-payout-name">{payout.partner}</div>
                  <div className="finance-payout-meta">{payout.id} · {payout.role} · {payout.method}</div>
                </div>
                <strong className="finance-payout-amount">{formatRupees(payout.amount)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="finance-panel" aria-label="Recent booking settlements">
        <div className="finance-panel-head">
          <div>
            <h2>Recent booking settlements</h2>
            <p>Booking value, commission, and settlement status from the ledger.</p>
          </div>
          <button type="button" className="finance-link" onClick={onOpenBookings}>View ledger</button>
        </div>
        {commissionBookings.length > 0 ? (
          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Owner</th>
                  <th>Booking value</th>
                  <th>Platform commission</th>
                  <th>Settlement</th>
                </tr>
              </thead>
              <tbody>
                {commissionBookings.slice(0, 6).map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.id}</strong></td>
                    <td>{booking.customer}</td>
                    <td>{booking.owner}</td>
                    <td>{formatRupees(booking.rentalValue)}</td>
                    <td>{formatRupees(booking.platformCommission)}</td>
                    <td><span className="finance-status">{booking.settlement}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : revenueBookings.length === 0 ? (
          <p className="finance-empty">No booking transactions are available.</p>
        ) : (
          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead>
                <tr><th>Booking</th><th>Customer</th><th>Owner</th><th>Booking value</th><th>Platform commission</th><th>Status</th></tr>
              </thead>
              <tbody>
                {revenueBookings.slice(0, 6).map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.id}</strong></td>
                    <td>{booking.customerName}</td>
                    <td>{booking.ownerName}</td>
                    <td>{formatRupees(booking.bookingValue)}</td>
                    <td>{formatRupees(booking.bookingValue * booking.commissionRate)}</td>
                    <td><span className="finance-status">{booking.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <nav className="finance-tools" aria-label="Finance management">
        <button type="button" className="finance-tool" onClick={onOpenGst}>
          <span>GST & invoices<small>Tax setup, invoices, filings, and GST audit</small></span>
          <span className="finance-tool-arrow" aria-hidden="true">↗</span>
        </button>
        <button type="button" className="finance-tool" onClick={onOpenRefunds}>
          <span>Refund management<small>Review refund requests and processing status</small></span>
          <span className="finance-tool-arrow" aria-hidden="true">↗</span>
        </button>
        <button type="button" className="finance-tool" onClick={onOpenPayouts}>
          <span>Payout approvals<small>Review partner payout requests</small></span>
          <span className="finance-tool-arrow" aria-hidden="true">↗</span>
        </button>
      </nav>
    </div>
  )
}
