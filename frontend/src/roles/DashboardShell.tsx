import { commandCenterStyles } from './commandCenterStyles'

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
          <div className="sa-sidebar-label">Console</div>
          <ul className="sa-nav">
            {stats.map((stat, index) => (
              <li key={stat.label}>
                <button type="button" className={`sa-nav-item ${index === 0 ? 'active' : ''}`}>
                  <span>{stat.label}</span>
                  <span className="sa-nav-badge">{stat.value}</span>
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
          <button type="button" className="sa-signout" onClick={onSignOut}>
            Logout
          </button>
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
              <div className="header-avatar">{initials}</div>
              <button type="button" className="org-button" onClick={onSignOut}>Logout</button>
            </div>
          </div>
        </header>

        <div className="sa-content">
          <div className="sa-kpi-grid">
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
            <section className="sa-panel">
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

            <section className="sa-panel">
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
