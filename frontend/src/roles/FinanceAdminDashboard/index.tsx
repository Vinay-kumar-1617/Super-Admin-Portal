import { Fragment, useEffect, useMemo, useState } from 'react'
import { commandCenterStyles } from '../commandCenterStyles'
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

  const navBadges: Partial<Record<SectionId, number>> = {
    settlements: activeSettlements,
    payouts: openPayouts,
    refunds: pendingRefunds,
    reconciliation: openMismatches,
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

    store.invoices
      .filter((item) => item.id.toLowerCase().includes(query) || item.party.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `inv-${item.id}`, group: 'Invoices', label: item.id, sub: `${item.kind} · ${item.party}`, section: 'invoices' }, 3),
      )

    store.refunds
      .filter((item) => item.id.toLowerCase().includes(query) || item.booking.toLowerCase().includes(query) || item.customer.toLowerCase().includes(query))
      .forEach((item) =>
        push({ id: `rf-${item.id}`, group: 'Refunds', label: item.customer, sub: `${item.id} · ${item.booking}`, section: 'refunds' }, 3),
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
  }, [headerQuery, store.rates, store.settlements, store.payouts, store.invoices, store.refunds, store.reconItems])

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
          <div className="header-copy">
            <p className="header-kicker">Global · {financeProfile.scopeLabel} command</p>
            <h1 className="header-title">{sectionMeta.title}</h1>
            <div className="header-breadcrumb">Overview / Finance / {sectionMeta.crumb}</div>
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

              <div className="header-popover-wrap">
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
                  </div>
                )}
              </div>

              <div className="header-popover-wrap">
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

              <div className="header-popover-wrap">
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
                <div className="header-avatar">{financeProfile.initials}</div>
                <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
              </div>
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

          {activeSection === 'payouts' && (
            <PayoutsSection
              payouts={store.payouts}
              approvalLimit={financeProfile.approvalLimit}
              onApprove={store.approvePayout}
              onSecondApproval={store.secondApproval}
              onHold={store.holdPayout}
              onRelease={store.releasePayout}
              onReject={store.rejectPayout}
              onRetry={store.retryPayout}
            />
          )}

          {activeSection === 'invoices' && (
            <InvoicesSection invoices={store.invoices} onResend={store.resendInvoice} onDownload={store.downloadInvoice} />
          )}

          {activeSection === 'refunds' && (
            <RefundsSection
              refunds={store.refunds}
              onApprove={store.approveRefund}
              onReject={store.rejectRefund}
              onProcess={store.processRefund}
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

          {activeSection === 'reports' && (
            <ReportsSection audit={store.audit} onExport={handleExport} onNavigate={navigateSection} />
          )}
        </div>
      </div>
    </section>
  )
}
