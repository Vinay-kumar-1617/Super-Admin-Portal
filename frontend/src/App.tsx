import { useEffect, useMemo, useState, type ComponentType } from 'react'
import type { RoleKey } from '@fieldwork/shared'
import './App.css'
import LoginScreen from './auth/LoginScreen'
import { getSignedInProfile } from './auth/profile'
import { supabase } from './lib/supabase'
import {
  SuperAdminDashboard,
  StateAdminDashboard,
  CityAdminDashboard,
  ZoneAdminDashboard,
  OperationsManagerDashboard,
  ComplianceAdminDashboard,
  FinanceAdminDashboard,
  SupportAdminDashboard,
  DispatcherDashboard,
  AuditorDashboard,
  FleetManagerDashboard,
} from './roles'

type BookingSelection = {
  city: string
  plan: string
  product: string
  price: string
}

type LoggedInUser = {
  roleKey: RoleKey
  email: string
  isDemo?: boolean
}

const machineTypes = [
  { name: 'JCB 3DX', price: '₹2,499/day', image: 'https://dayimrentals.com/wp-content/uploads/1710997085_full.jpg' },
  { name: 'Excavator', price: '₹3,199/day', image: 'https://5.imimg.com/data5/SELLER/Default/2023/1/JN/BN/YD/3763192/jcb-385lc-01-500x500.png' },
  { name: 'Hydraulic Crane', price: '₹5,499/day', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTp4NgcyvFZrJeXcmuLmPHO1F0E42J0Crpx9hL3EmjEw&s=10' },
  { name: 'Compactor', price: '₹1,899/day', image: 'https://cdn.motorbazee.com/ImageData/model/800x600/184468.jpg' },
]

const productCategories = [
  'Excavator',
  'Backhoe Loader',
  'Motor Grader',
  'Wheel Loader',
  'Crane',
  'Concrete Mixer',
  'Compactor',
  'Skid Steer Loader',
  'Concrete Pump',
  'Telehandler',
  'Dozer',
]

const brandNames = [
  'JCB',
  'Caterpillar',
  'Tata Hitachi',
  'Volvo',
  'Hyundai',
  'SANY',
  'Escorts Kubota',
  'Mahindra CE',
  'AJAX Engg',
  'Schwing Stetter',
  'L&T Komatsu',
  'CASE',
]

const whyChooseUs = [
  { title: 'Verified fleet', detail: 'Freshly inspected machines ready for heavy-duty work.' },
  { title: 'Instant booking', detail: 'Reserve your equipment in minutes across major cities.' },
  { title: 'Transparent pricing', detail: 'No hidden fees with all-in daily or monthly plans.' },
  { title: 'Service support', detail: 'Dedicated experts help with dispatch and breakdown support.' },
]

const howItWorks = [
  'Choose your city and machinery type.',
  'Pick the rental plan that matches your site and schedule.',
  'Get confirmation and deploy your equipment in record time.',
]

const accountRules = [
  'Super admin: create only 1 or 2 of these accounts.',
  'State admin: one per state, limited to that state.',
  'City admin: one or more per city, limited to that city.',
  'Zone admin: one or more per zone, limited to that zone. They approve and manage operators and watch jobs in their zone.',
  'Support roles: finance admin, support agent, dispute handler, KYC verifier, moderator and platform admin. Give each person only the role they need.',
]

type RoleOption = {
  key: RoleKey
  label: string
  component: ComponentType<{ onSignOut?: () => void }>
}

const roleOptions: RoleOption[] = [
  { key: 'super-admin', label: 'Super admin', component: SuperAdminDashboard },
  { key: 'state-admin', label: 'State admin', component: StateAdminDashboard },
  { key: 'city-admin', label: 'City admin', component: CityAdminDashboard },
  { key: 'zone-admin', label: 'Zone admin', component: ZoneAdminDashboard },
  { key: 'operations-manager', label: 'Operations manager', component: OperationsManagerDashboard },
  { key: 'compliance-admin', label: 'Compliance admin', component: ComplianceAdminDashboard },
  { key: 'finance-admin', label: 'Finance admin', component: FinanceAdminDashboard },
  { key: 'support-admin', label: 'Support admin', component: SupportAdminDashboard },
  { key: 'dispatcher', label: 'Dispatcher', component: DispatcherDashboard },
  { key: 'auditor', label: 'Auditor', component: AuditorDashboard },
  { key: 'fleet-manager', label: 'Fleet manager', component: FleetManagerDashboard },
]

function App() {
  const [selectedCity, setSelectedCity] = useState('Hyderabad')
  const [selectedPlan, setSelectedPlan] = useState('Monthly / Contract')
  const [selectedProduct, setSelectedProduct] = useState('JCB 3DX')
  const [selectedBooking, setSelectedBooking] = useState<BookingSelection | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<'products' | 'brands' | null>(null)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('equiprent-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.dataset.theme = savedTheme
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    let isMounted = true
    let sessionRevision = 0
    const restoreProfile = (userId: string, email: string) => {
      const revision = ++sessionRevision
      window.setTimeout(() => {
        void getSignedInProfile(userId, email).then((profile) => {
          if (isMounted && revision === sessionRevision) setLoggedInUser(profile)
        })
      }, 0)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        sessionRevision += 1
        setLoggedInUser(null)
        return
      }
      restoreProfile(session.user.id, session.user.email ?? '')
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        if (isMounted) setLoggedInUser(null)
        return
      }
      restoreProfile(data.session.user.id, data.session.user.email ?? '')
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const openBooking = (product: string, price: string, city = selectedCity, plan = selectedPlan) => {
    setSelectedBooking({ city, plan, product, price })
  }

  const activeRole = useMemo(
    () => roleOptions.find(({ key }) => key === loggedInUser?.roleKey),
    [loggedInUser],
  )
  const ActiveRoleDashboard = activeRole?.component
  const activeRoleLabel = activeRole?.label ?? loggedInUser?.roleKey.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')

  const handleLogin = (roleKey: RoleKey, email: string) => {
    setLoggedInUser({ roleKey, email, isDemo: false })
    setShowLogin(false)
  }

  const handleDemoLogin = (roleKey: RoleKey, email: string) => {
    if (!import.meta.env.DEV || supabase) return
    setLoggedInUser({ roleKey, email, isDemo: true })
    setShowLogin(false)
  }

  const handleLogout = async () => {
    if (supabase && !loggedInUser?.isDemo) await supabase.auth.signOut()
    setLoggedInUser(null)
  }

  return (
    <div className="revv-app">
      {ActiveRoleDashboard && loggedInUser ? (
        <main className="superadmin-standalone">
          <section className="dashboard-panel container" aria-label={`${activeRoleLabel} dashboard`}>
          {/* Removed topbar with session info as requested; profile/logout moved inside dashboard UI */}
            <ActiveRoleDashboard onSignOut={handleLogout} />
          </section>
        </main>
      ) : (
      <>
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand-block" aria-label="Fieldwork admin home">
            <span className="brand-mark">E</span>
            <span className="brand-word">EquipHub</span>
          </div>

          <nav className="main-nav" aria-label="Main navigation">
            <div className="nav-dropdown">
              <button
                type="button"
                className={`nav-dropdown-toggle ${openDropdown === 'products' ? 'active' : ''}`}
                onClick={() => {
                  setOpenDropdown(openDropdown === 'products' ? null : 'products')
                  document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Fleet
              </button>

              {openDropdown === 'products' && (
                <div className="nav-dropdown-menu">
                  {productCategories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className="nav-dropdown-item"
                      onClick={() => {
                        setSelectedProduct(category)
                        setOpenDropdown(null)
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="nav-dropdown">
              <button
                type="button"
                className={`nav-dropdown-toggle ${openDropdown === 'brands' ? 'active' : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'brands' ? null : 'brands')}
              >
                Brands
              </button>

              {openDropdown === 'brands' && (
                <div className="nav-dropdown-menu">
                  {brandNames.map((brand) => (
                    <button type="button" key={brand} className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}>
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="#why-us">Why us</a>
            <a href="#process">How it works</a>
            <a href="#accounts">Accounts</a>
          </nav>

          <div className="header-actions">
            <button type="button" className="header-cta vendor-cta" onClick={() => setShowLogin(true)}>Become a Vendor</button>
            <button type="button" className="header-cta combined-cta" onClick={() => setShowLogin(true)}>Login / Signup</button>
            <button type="button" className="header-cta" onClick={() => openBooking(selectedProduct, 'From ₹2,499/day', selectedCity, selectedPlan)}>Get app</button>
            {loggedInUser && <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>}
          </div>
        </div>
      </header>

      {showLogin && (
        <div className="auth-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) setShowLogin(false)
        }}>
          <LoginScreen onLogin={handleLogin} onDemoLogin={handleDemoLogin} onClose={() => setShowLogin(false)} />
        </div>
      )}

      <main className="landing-page">
        <section className="hero-section container">
          <div className="hero-copy">
            <span className="eyebrow">Heavy equipment rentals</span>
            <h1>Move your next project faster with reliable heavy machinery.</h1>
            <p>
              Rent JCBs, cranes, excavators, and site-ready equipment with flexible plans for construction,
              infra, and industrial projects.
            </p>

            <div className="cta-row">
              <button type="button" className="primary-btn" onClick={() => setShowLogin(true)}>Login / Signup</button>
              <button type="button" className="secondary-btn" onClick={() => openBooking(selectedProduct, 'From ₹2,499/day', selectedCity, selectedPlan)}>Book now</button>
            </div>

            <div className="mini-stats">
              <div>
                <strong>2,500+</strong>
                <span>machines</span>
              </div>
              <div>
                <strong>120+</strong>
                <span>cities</span>
              </div>
              <div>
                <strong>4.8/5</strong>
                <span>ratings</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <img
                src="https://dayimrentals.com/wp-content/uploads/1710997085_full.jpg"
                alt="Most booked JCB on a construction site"
              />
              <div className="floating-badge">Most booked</div>
              <div className="price-tag">From ₹2,499/day</div>
            </div>
          </div>
        </section>

        <section className="booking-panel container">
          <div className="booking-strip">
            <div className="booking-header">
              <span className="eyebrow muted">Quick booking</span>
              <h2>Reserve your machine</h2>
            </div>

            <div className="booking-form">
              <label>
                <span>City</span>
                <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
                  <option>Hyderabad</option>
                  <option>Bengaluru</option>
                  <option>Chennai</option>
                  <option>Pune</option>
                  <option>Delhi</option>
                </select>
              </label>

              <label>
                <span>Equipment</span>
                <select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}>
                  <option>JCB 3DX</option>
                  <option>Hydraulic Excavator</option>
                  <option>Hydraulic Crane</option>
                  <option>Compactor</option>
                  <option>Crawler Crane</option>
                </select>
              </label>

              <label>
                <span>Plan</span>
                <select value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value)}>
                  <option>Monthly / Contract</option>
                  <option>Daily rental</option>
                  <option>Weekly rental</option>
                  <option>Project rental</option>
                </select>
              </label>

              <button type="button" className="primary-btn" onClick={() => openBooking(selectedProduct, 'From ₹2,499/day', selectedCity, selectedPlan)}>
                Check availability
              </button>
            </div>
          </div>
        </section>

        <section className="fleet-section container" id="fleet">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Popular fleet</span>
              <h2>Built for construction and industrial jobs</h2>
            </div>
            <button type="button" className="text-link">Explore all equipment</button>
          </div>

          <div className="fleet-grid">
            {machineTypes.map((machine) => (
              <article className="fleet-card" key={machine.name}>
                <img src={machine.image} alt={machine.name} />
                <div className="fleet-card-body">
                  <div className="card-topline">
                    <span>{machine.name}</span>
                    <strong>{machine.price}</strong>
                  </div>
                  <p>Available for site-ready rental with operator support and quick dispatch.</p>
                  <button type="button" className="fleet-action" onClick={() => openBooking(machine.name, machine.price, selectedCity, selectedPlan)}>
                    Reserve now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="features-section container" id="why-us">
          <div className="section-heading center">
            <span className="eyebrow">Why choose us</span>
            <h2>Operational confidence for every site</h2>
          </div>

          <div className="why-grid">
            {whyChooseUs.map((item) => (
              <div className="feature-card" key={item.title}>
                <div className="feature-icon">✓</div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="process-section container" id="process">
          <div className="section-heading center">
            <span className="eyebrow">How it works</span>
            <h2>Simple steps to get your machine on-site</h2>
          </div>

          <div className="process-grid">
            {howItWorks.map((step, index) => (
              <div className="process-card" key={step}>
                <span className="step-index">0{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="account-section container" id="accounts">
          <h2>Accounts inside the admin panel</h2>
          <p>Staff share one login page, and each person&apos;s role decides what they see:</p>
          <ul>
            {accountRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      </main>

      {selectedBooking && (
        <div className="booking-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedBooking(null)
        }}>
          <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
            <button type="button" className="booking-close" onClick={() => setSelectedBooking(null)} aria-label="Close booking details">×</button>
            <p className="booking-tag">Action summary</p>
            <h3 id="booking-title">{selectedBooking.product}</h3>
            <div className="booking-grid">
              <div><span>City</span><strong>{selectedBooking.city}</strong></div>
              <div><span>Plan</span><strong>{selectedBooking.plan}</strong></div>
              <div><span>Price</span><strong>{selectedBooking.price}</strong></div>
            </div>
            <button type="button" className="primary-btn" onClick={() => setSelectedBooking(null)}>Continue</button>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="brand-block" aria-label="Fieldwork admin home">
            <span className="brand-mark">F</span>
            <span className="brand-word">fieldwork</span>
          </div>
          <div className="footer-text">Fieldwork rentals • Built for every job site</div>
        </div>
      </footer>
      </>
      )}
    </div>
  )
}

export default App
