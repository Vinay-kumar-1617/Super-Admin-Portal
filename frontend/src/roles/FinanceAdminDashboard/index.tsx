import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
import RoleHeaderMenus from '../RoleHeaderMenus'
import {
  financeAlerts,
  financeNotifications,
  financePeriods,
  financeProfile,
  financeSections,
  paymentGateways,
  reportCards,
  scopeBreakdown,
  type FinanceNotification,
  type SectionId,
} from './financeAdminData'
import { useFinanceAdmin } from './useFinanceAdmin'
import OverviewSection from './OverviewSection'
import CommissionSection from './CommissionSection'
import SettlementsSection from './SettlementsSection'
import PayoutsSection from './PayoutsSection'
import InvoicesSection from './InvoicesSection'
import RefundsSection from './RefundsSection'
import ReconciliationSection from './ReconciliationSection'
import ReportsSection from './ReportsSection'
import AuditLogSection from './AuditLogSection'
import NotificationsSection from './NotificationsSection'
import ApprovalCenterSection from './ApprovalCenterSection'
import FinancialReportsSection from './FinancialReportsSection'
import OwnerSettlementsSection from './OwnerSettlementsSection'
import OperatorPaymentsSection from './OperatorPaymentsSection'
import CustomerPaymentsSection from './CustomerPaymentsSection'

const sectionIds: SectionId[] = financeSections.map((section) => section.id)

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'overview'
  return sectionIds.find((id) => window.location.hash.startsWith(`#finance-admin/${id}`)) ?? 'overview'
}

type SearchResult = {
  id: string
  group: string
  label: string
  sub: string
  section: SectionId
}

type FinanceAdminDashboardProps = {
  onSignOut?: () => void
}

export default function FinanceAdminDashboard({ onSignOut }: FinanceAdminDashboardProps) {
  const store = useFinanceAdmin()
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash)
  const [headerPanel, setHeaderPanel] = useState<'search' | 'notifications' | 'alerts' | 'period' | null>(null)
  const [headerQuery, setHeaderQuery] = useState('')
  const [period, setPeriod] = useState('This Month')
  const [notifications, setNotifications] = useState<FinanceNotification[]>(financeNotifications)

  useEffect(() => {
    const syncFromHash = () => setActiveSection(sectionFromHash())
    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('popstate', syncFromHash)
    }
  }, [])

  const navigateSection = (id: SectionId) => {
    window.history.pushState(null, '', `#finance-admin/${id}`)
    setActiveSection(id)
    setHeaderPanel(null)
  }

  const unreadNotifications = notifications.filter((item) => !item.read).length
  const sectionMeta = financeSections.find((section) => section.id === activeSection) ?? financeSections[0]

  const openPayouts = store.payouts.filter((item) => item.status === 'Pending' || item.status === 'Awaiting second approval').length
  const failedPayouts = store.payouts.filter((item) => item.status === 'Failed').length
  const pendingRefunds = store.refunds.filter((item) => item.status === 'Pending').length
  const openMismatches = store.reconItems.filter((item) => item.status === 'Mismatch' || item.status === 'Investigating').length
  const activeSettlements = store.settlements.filter((item) => item.status === 'Draft' || item.status === 'Review').length
  const pendingApprovals = store.approvalRequests.filter((item) => item.status === 'Pending' || item.status === 'Awaiting second approval').length
  const pendingOwnerSettlements = store.ownerSettlements.filter((item) => item.status === 'Pending').length
  const pendingOperatorPayments = store.operatorPayments.filter((item) => item.status === 'Pending').length
  const customersWithOutstandingBalances = store.customerPayments.filter((customer) =>
    customer.invoices.some((invoice) => invoice.amount > invoice.collected),
  ).length

  const navBadges: Partial<Record<SectionId, number>> = {
    settlements: activeSettlements,
    payouts: openPayouts,
    refunds: pendingRefunds,
    reconciliation: openMismatches,
    approvals: pendingApprovals,
    'owner-settlements': pendingOwnerSettlements,
    'operator-payments': pendingOperatorPayments,
    'customer-payments': customersWithOutstandingBalances,
    notifications: unreadNotifications,
  }

  const searchResults = useMemo<SearchResult[]>(() => {
    const query = headerQuery.trim().toLowerCase()
    if (!query) return []

    const results: SearchResult[] = []
    const push = (result: SearchResult, limit: number) => {
      if (results.filter((item) => item.group === result.group).length < limit) results.push(result)
    }

    financeSections
      .filter((section) => section.label.toLowerCase().includes(query) || section.title.toLowerCase().includes(query))
      .forEach((section) =>
        push({ id: `sec-${section.id}`, group: 'Sections', label: section.label, sub: 'Open section', section: section.id }, 4),
      )

    scopeBreakdown
      .filter((row) => row.name.toLowerCase().includes(query) || row.level.toLowerCase().includes(query))
      .forEach((row) =>
        push({ id: `scope-${row.id}`, group: 'Scopes', label: row.name, sub: `${row.level} · ${row.region}`, section: 'overview' }, 3),
      )

    store.rates
      .filter((rate) => rate.name.toLowerCase().includes(query))
      .forEach((rate) =>
        push({ id: `rate-${rate.id}`, group: 'Commission', label: rate.name, sub: `${rate.scope} · ${rate.rate}%`, section: 'commission' }, 3),
      )

    store.settlements
      .filter((run) => run.id.toLowerCase().includes(query) || run.period.toLowerCase().includes(query))
      .forEach((run) =>
        push({ id: `st-${run.id}`, group: 'Settlements', label: run.id, sub: `${run.period} · ${run.status}`, section: 'settlements' }, 3),
      )

    store.payouts
      .filter((item) => item.id.toLowerCase().includes(query) || item.payee.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `py-${item.id}`, group: 'Payouts', label: item.payee, sub: `${item.id} · ${item.status}`, section: 'payouts' }, 4),
      )

    store.operatorPayments
      .filter((item) => item.id.toLowerCase().includes(query) || item.operator.toLowerCase().includes(query) || item.operatorCode.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `op-${item.id}`, group: 'Operator payments', label: item.operator, sub: `${item.id} · ${item.period} · ${item.status}`, section: 'operator-payments' }, 4),
      )

    store.customerPayments
      .filter((item) =>
        item.id.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        item.invoices.some((invoice) => invoice.id.toLowerCase().includes(query) || invoice.bookingId.toLowerCase().includes(query)),
      )
      .forEach((item) =>
        push({ id: `customer-${item.id}`, group: 'Customer payments', label: item.customer, sub: `${item.id} · ${item.city}`, section: 'customer-payments' }, 4),
      )

    store.invoices
      .filter((item) => item.id.toLowerCase().includes(query) || item.party.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `inv-${item.id}`, group: 'Invoices', label: item.id, sub: `${item.kind} · ${item.party}`, section: 'invoices' }, 3),
      )

    store.financeInvoices
      .filter((item) =>
        item.id.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.bookingId.toLowerCase().includes(query),
      )
      .forEach((item) =>
        push({ id: `fin-inv-${item.id}`, group: 'Invoices', label: item.id, sub: `${item.customer} · ${item.bookingId} · ${item.status}`, section: 'invoices' }, 4),
      )

    store.refunds
      .filter((item) => item.id.toLowerCase().includes(query) || item.booking.toLowerCase().includes(query) || item.customer.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `rf-${item.id}`, group: 'Refunds', label: item.customer, sub: `${item.id} · ${item.booking}`, section: 'refunds' }, 3),
      )

    store.approvalRequests
      .filter(
        (item) =>
          item.id.toLowerCase().includes(query) ||
          item.subject.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.requestedBy.toLowerCase().includes(query),
      )
      .forEach((item) =>
        push({
          id: `approval-${item.id}`,
          group: 'Approval center',
          label: item.subject,
          sub: `${item.id} · ${item.category} · ${item.status}`,
          section: 'approvals',
        }, 4),
      )

    store.reconItems
      .filter((item) => item.reference.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `rc-${item.id}`, group: 'Reconciliation', label: item.reference, sub: `${item.type} · ${item.status}`, section: 'reconciliation' }, 3),
      )

    reportCards
      .filter((report) => report.title.toLowerCase().includes(query))
      .forEach((report) =>
        push({ id: `rp-${report.id}`, group: 'Reports', label: report.title, sub: `Export ${report.formats.join(' / ')}`, section: 'reports' }, 3),
      )

    return results
  }, [headerQuery, store.rates, store.settlements, store.payouts, store.operatorPayments, store.customerPayments, store.invoices, store.financeInvoices, store.refunds, store.approvalRequests, store.reconItems])

  const runSearchResult = (result: SearchResult) => {
    setHeaderPanel(null)
    setHeaderQuery('')
    navigateSection(result.section)
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const openFeedTarget = (target: string) => {
    setHeaderPanel(null)
    if (sectionIds.some((id) => id === target)) navigateSection(target as SectionId)
  }

  const handleExport = (title: string, format: string) => {
    store.showToast(`${title} exported as ${format}`)
  }

  const attention = {
    failedPayouts,
    awaitingApproval: openPayouts,
    mismatches: store.reconItems.filter((item) => item.status === 'Mismatch').length,
    flaggedRefunds: store.refunds.filter((item) => item.flagged).length,
  }

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">Finance Admin · {financeProfile.scopeLabel}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">Finance operations</div>
          <ul className="sa-nav">
            {financeSections.map((section) => {
              const badge = navBadges[section.id]
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    className={`sa-nav-item ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => navigateSection(section.id)}
                  >
                    <span>{section.label}</span>
                    {badge ? <span className="sa-nav-badge">{badge}</span> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>Finance scope</strong>
          <span>
            Global revenue and payouts · approval limit {financeProfile.approvalLimit} · gateways {paymentGateways.join(' & ')}.
          </span>
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{financeProfile.initials}</div>
          <div className="sa-account-copy">
            <strong>{financeProfile.name}</strong>
            <span>{financeProfile.email}</span>
          </div>
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Logout
          </button>
        </div>
      </aside>

      <div className="sa-main">
        <header className="dashboard-header">
          <div className="role-header-leading">
            <div className="role-header-brand" aria-label="EquipHub">
              <span className="role-header-brand-mark" aria-hidden="true">E</span>
              <span>EquipHub</span>
            </div>
            <div className="header-copy">
              <h1 className="header-title">{sectionMeta.title}</h1>
              <div className="header-breadcrumb">Global · {financeProfile.scopeLabel}</div>
            </div>
          </div>

          <div className="header-actions">
            <div className="header-toolbar">
              {headerPanel && (
                <div className="header-panel-backdrop" aria-hidden="true" onClick={() => setHeaderPanel(null)} />
              )}

              <div className="header-search-wrap">
                <input
                  className="header-search"
                  aria-label="Search the finance dashboard"
                  placeholder="Search payouts, settlements, refunds..."
                  value={headerQuery}
                  onChange={(event) => {
                    const value = event.target.value
                    setHeaderQuery(value)
                    setHeaderPanel(value.trim() ? 'search' : null)
                  }}
                  onFocus={() => setHeaderPanel(headerQuery.trim() ? 'search' : null)}
                />
                {headerPanel === 'search' && (
                  <div className="header-popover search-popover" role="listbox" aria-label="Search results">
                    <div className="header-popover-head">
                      <h4>Search results</h4>
                      <span className="header-popover-meta">{searchResults.length} found</span>
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="header-feed-empty">
                        No matches for “{headerQuery.trim()}”. Try a payout id, settlement, refund or scope.
                      </div>
                    ) : (
                      searchResults.map((result, index) => {
                        const showGroup = index === 0 || searchResults[index - 1].group !== result.group
                        return (
                          <Fragment key={result.id}>
                            {showGroup && <div className="search-result-group">{result.group}</div>}
                            <button type="button" className="search-result-item" onClick={() => runSearchResult(result)}>
                              <strong>{result.label}</strong>
                              <span className="search-result-sub">{result.sub}</span>
                            </button>
                          </Fragment>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'notifications' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'notifications' ? null : 'notifications')}
                >
                  Notifications {unreadNotifications > 0 && <span className="header-badge">{unreadNotifications}</span>}
                </button>
                {headerPanel === 'notifications' && (
                  <div className="header-popover" role="dialog" aria-label="Notifications">
                    <div className="header-popover-head">
                      <h4>Notifications</h4>
                      {unreadNotifications > 0 && (
                        <button type="button" className="header-popover-action" onClick={markAllNotificationsRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="header-feed-list">
                      {notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="header-feed-item"
                          onClick={() => {
                            markNotificationRead(item.id)
                            openFeedTarget(item.target)
                          }}
                        >
                          <span className={`header-feed-dot ${item.tone}`} />
                          <span className="header-feed-body">
                            <strong>
                              {item.title}
                              {!item.read && <span className="header-feed-unread" />}
                            </strong>
                            <span>{item.detail}</span>
                            <span className="header-feed-time">{item.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="header-popover-head">
                      <button
                        type="button"
                        className="header-popover-action"
                        onClick={() => navigateSection('notifications')}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'alerts' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'alerts' ? null : 'alerts')}
                >
                  Alerts {financeAlerts.length > 0 && <span className="header-badge header-badge-amber">{financeAlerts.length}</span>}
                </button>
                {headerPanel === 'alerts' && (
                  <div className="header-popover" role="dialog" aria-label="Alerts">
                    <div className="header-popover-head">
                      <h4>Alerts</h4>
                      <span className="header-popover-meta">{financeAlerts.length} open</span>
                    </div>
                    <div className="header-feed-list">
                      {financeAlerts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="header-feed-item"
                          onClick={() => openFeedTarget(item.target)}
                        >
                          <span
                            className={`header-feed-dot ${item.severity === 'Critical' ? 'red' : item.severity === 'Warning' ? 'amber' : 'blue'}`}
                          />
                          <span className="header-feed-body">
                            <span className="header-alert-top">
                              <strong>{item.title}</strong>
                              <span className={`header-sev ${item.severity.toLowerCase()}`}>{item.severity}</span>
                            </span>
                            <span>{item.detail}</span>
                            <span className="header-feed-time">{item.time}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="header-popover-foot">
                      <button type="button" className="header-action" onClick={() => openFeedTarget('reconciliation')}>
                        Open reconciliation
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="header-popover-wrap legacy-header-control">
                <button
                  type="button"
                  className={`header-action ${headerPanel === 'period' ? 'is-open' : ''}`}
                  onClick={() => setHeaderPanel(headerPanel === 'period' ? null : 'period')}
                >
                  {period} ▾
                </button>
                {headerPanel === 'period' && (
                  <div className="header-popover" role="dialog" aria-label="Dashboard period">
                    <div className="header-popover-head">
                      <h4>Dashboard period</h4>
                    </div>
                    {financePeriods.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`period-menu-item ${period === option ? 'selected' : ''}`}
                        onClick={() => {
                          setPeriod(option)
                          setHeaderPanel(null)
                          store.showToast(`Period set to ${option}`)
                        }}
                      >
                        <span>{option}</span>
                        {period === option && <span className="period-current">Current</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="legacy-profile-control" style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <div className="header-avatar">{financeProfile.initials}</div>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
              <RoleHeaderMenus
                notifications={notifications}
                alerts={financeAlerts}
                initials={financeProfile.initials}
                onNotificationClick={(item) => { markNotificationRead(item.id); openFeedTarget(item.target) }}
                onAlertClick={(item) => openFeedTarget(item.target)}
                onMarkAllRead={markAllNotificationsRead}
                onSignOut={onSignOut}
                onAlertsFooter={() => openFeedTarget('reconciliation')}
                alertsFooterLabel="Open reconciliation"
              />
            </div>
          </div>
        </header>

        {store.toast && (
          <div className="sa-toast" role="status">
            {store.toast}
          </div>
        )}

        <div className="sa-content">
          {activeSection === 'overview' && <OverviewSection onNavigate={navigateSection} attention={attention} />}

          {activeSection === 'commission' && (
            <CommissionSection
              rates={store.rates}
              history={store.changes}
              onUpdateRate={store.updateRate}
              onSchedule={store.scheduleRate}
            />
          )}

          {activeSection === 'settlements' && (
            <SettlementsSection
              settlements={store.settlements}
              onRun={store.runSettlement}
              onFinalize={store.finalizeSettlement}
              onRerun={store.rerunSettlement}
              onCorrect={store.correctSettlement}
              onAdjust={store.updateSettlementAdjustment}
            />
          )}

          {activeSection === 'owner-settlements' && (
            <OwnerSettlementsSection
              settlements={store.ownerSettlements}
              onApprove={store.approveOwnerSettlement}
              onReject={store.rejectOwnerSettlement}
              onPay={store.payOwnerSettlement}
              onPayoutMethodChange={store.updateOwnerPayoutMethod}
            />
          )}

          {activeSection === 'operator-payments' && (
            <OperatorPaymentsSection
              payments={store.operatorPayments}
              onApprove={store.approveOperatorPayment}
              onReject={store.rejectOperatorPayment}
              onPay={store.payOperatorPayment}
              onMethodChange={store.changeOperatorPaymentMethod}
            />
          )}

          {activeSection === 'customer-payments' && (
            <CustomerPaymentsSection
              customers={store.customerPayments}
              onCollect={store.collectCustomerPayment}
              onReminder={store.sendCustomerPaymentReminder}
            />
          )}

          {activeSection === 'payouts' && (
            <PayoutsSection
              payouts={store.payouts}
              approvalLimit={financeProfile.approvalLimit}
              onApprove={(id) => store.approveFinanceRequest(id, financeProfile.name)}
              onSecondApproval={() => navigateSection('approvals')}
              onHold={store.holdPayout}
              onRelease={store.releasePayout}
              onReject={(id, reason) => store.rejectFinanceRequest(id, financeProfile.name, reason)}
              onRetry={store.retryPayout}
            />
          )}

          {activeSection === 'invoices' && (
            <InvoicesSection
              invoices={store.financeInvoices}
              onCreate={store.createInvoiceDraft}
              onEdit={store.editInvoiceDraft}
              onIssue={store.issueInvoice}
              onCollect={store.collectInvoicePayment}
            />
          )}

          {activeSection === 'refunds' && (
            <RefundsSection
              refunds={store.refunds}
              onProcess={store.processRefund}
              onNavigate={navigateSection}
            />
          )}

          {activeSection === 'reconciliation' && (
            <ReconciliationSection
              items={store.reconItems}
              periods={store.reconPeriods}
              onInvestigate={store.investigateRecon}
              onResolve={store.resolveRecon}
              onClosePeriod={store.closePeriod}
            />
          )}

          {activeSection === 'approvals' && (
            <ApprovalCenterSection
              requests={store.approvalRequests}
              audit={store.audit}
              onApprove={store.approveFinanceRequest}
              onReject={store.rejectFinanceRequest}
              onCreate={store.createFinanceApprovalRequest}
            />
          )}

          {activeSection === 'reports' && (
            <>
              <FinancialReportsSection onNavigate={navigateSection} />
              <ReportsSection onExport={handleExport} />
            </>
          )}

          {activeSection === 'audit-log' && (
            <AuditLogSection audit={store.audit} onNavigate={navigateSection} />
          )}

          {activeSection === 'notifications' && (
            <NotificationsSection
              notifications={notifications}
              setNotifications={setNotifications}
              onNavigate={navigateSection}
            />
          )}
        </div>
      </div>
    </section>
  )
}
