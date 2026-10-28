import { useState } from 'react'
import { commandCenterStyles } from './commandCenterStyles'
import RoleHeaderMenus from './RoleHeaderMenus'

type DashboardStat = {
  label: string
  value: string
  tone?: 'primary' | 'secondary' | 'success' | 'alert'
}

type DashboardShellProps = {
  title: string
  subtitle: string
  summary: string
  stats: DashboardStat[]
  actions: string[]
  scope: string[]
  onSignOut?: () => void
}

const toneMap: Record<NonNullable<DashboardStat['tone']>, 'blue' | 'purple' | 'green' | 'orange'> = {
  primary: 'blue',
  secondary: 'purple',
  success: 'green',
  alert: 'orange',
}

const initialsFor = (label: string) =>
  label
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function DashboardShell({
  title,
  subtitle,
  summary,
  stats,
  actions,
  scope,
  onSignOut,
}: DashboardShellProps) {
  const initials = initialsFor(title)
  const [activeNav, setActiveNav] = useState('overview')
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const searchItems = [
    { label: 'Overview', detail: `${stats.length} dashboard metrics`, section: 'overview' },
    ...actions.map((label) => ({ label, detail: 'Priority action', section: 'priority-actions' })),
    ...scope.map((label) => ({ label, detail: 'Authority scope', section: 'authority-scope' })),
  ].filter((item) => normalizedQuery && `${item.label} ${item.detail}`.toLowerCase().includes(normalizedQuery))

  const navigateToSection = (section: string) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveNav(section)
  }

  return (
    <section className="stateadmin-role-dashboard">
      <style>{commandCenterStyles}</style>

      <aside className="sa-sidebar">
        <div className="sa-brand">
          <div className="sa-brand-badge">E</div>
          <div>
            <div className="sa-brand-text">EquipHub</div>
            <div className="sa-brand-meta">{title}</div>
          </div>
        </div>

        <div>
          <div className="sa-sidebar-label">Fleet operations</div>
          <ul className="sa-nav">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'priority-actions', label: 'Priority actions' },
              { id: 'authority-scope', label: 'Authority scope' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sa-nav-item ${activeNav === item.id ? 'active' : ''}`}
                  aria-current={activeNav === item.id ? 'page' : undefined}
                  onClick={() => navigateToSection(item.id)}
                >
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sa-scope-card">
          <strong>{title} scope</strong>
          <span>{scope[0] ?? summary}</span>
        </div>

        <div className="sa-account">
          <div className="sa-account-avatar">{initials}</div>
          <div className="sa-account-copy">
            <strong>{subtitle}</strong>
            <span>{title} access</span>
          </div>
        </div>
      </aside>

      <div className="sa-main">
        <header className="dashboard-header">
          <div className="header-copy">
            <p className="header-kicker">{title} command</p>
            <h1 className="header-title">{subtitle}</h1>
            <div className="header-breadcrumb">Overview / {title}</div>
          </div>

          <div className="header-actions">
            <div className="header-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="header-search-wrapper">
                <input
                  className="header-search"
                  aria-label="Search dashboard"
                  placeholder="Search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {normalizedQuery && (
                  <div className="header-search-results" role="listbox" aria-label="Search results">
                    {searchItems.length > 0 ? searchItems.map((item) => (
                      <button
                        key={`${item.section}-${item.label}`}
                        type="button"
                        className="search-result-item"
                        onClick={() => {
                          setQuery('')
                          navigateToSection(item.section)
                        }}
                      >
                        <strong>{item.label}</strong>
                        <span className="search-result-sub">{item.detail}</span>
                      </button>
                    )) : <div className="header-feed-empty">No matching dashboard items.</div>}
                  </div>
                )}
              </div>
              <RoleHeaderMenus
                notifications={[]}
                alerts={[]}
                initials={initials}
                onNotificationClick={() => undefined}
                onAlertClick={() => undefined}
                onMarkAllRead={() => undefined}
                onSignOut={onSignOut}
              />
            </div>
          </div>
        </header>

        <div className="sa-content">
          <div className="sa-kpi-grid" id="overview">
            {stats.map((stat) => (
              <div key={stat.label} className={`sa-kpi-card ${toneMap[stat.tone ?? 'primary']}`}>
                <div className="sa-kpi-top">
                  <span className="sa-kpi-label">{stat.label}</span>
                </div>
                <strong className="sa-kpi-value">{stat.value}</strong>
                <span className="sa-kpi-desc">{title} metric</span>
              </div>
            ))}
          </div>

          <div className="sa-lower-grid">
            <section className="sa-panel" id="priority-actions">
              <div className="sa-panel-header">
                <h3>Priority actions</h3>
                <span className="sa-panel-sub">{title} workspace</span>
              </div>
              <div className="sa-feed">
                {actions.map((action) => (
                  <div key={action} className="sa-feed-item">
                    <strong>{action}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="sa-panel" id="authority-scope">
              <div className="sa-panel-header">
                <h3>Authority scope</h3>
                <span className="sa-panel-sub">{summary}</span>
              </div>
              <div className="sa-feed">
                {scope.map((item) => (
                  <div key={item} className="sa-feed-item">
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
