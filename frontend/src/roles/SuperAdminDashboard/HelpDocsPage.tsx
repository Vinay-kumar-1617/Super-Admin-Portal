import { useMemo, useState } from 'react'

type HelpDocsPageProps = {
  onBack: () => void
  onOpenTickets: () => void
}

const helpArticles = [
  {
    title: 'Managing user roles and permissions',
    category: 'Users & access',
    description: 'Assign roles, scope access by location, and review permissions for platform staff.',
    time: '5 min read',
  },
  {
    title: 'Reviewing and approving a refund',
    category: 'Payments & refunds',
    description: 'Find a request, review its booking and evidence, then approve or reject with a reason.',
    time: '4 min read',
  },
  {
    title: 'Updating a feature flag safely',
    category: 'Platform settings',
    description: 'Choose a scope and effective date, preview the change, and save it to apply.',
    time: '3 min read',
  },
  {
    title: 'Adding a new city to the platform',
    category: 'Geography',
    description: 'Set up a city, assign its administrator, and configure service coverage.',
    time: '6 min read',
  },
  {
    title: 'Investigating a booking or payment',
    category: 'Bookings & operations',
    description: 'Use booking records and audit history to trace actions and resolve exceptions.',
    time: '5 min read',
  },
  {
    title: 'Managing active sessions and MFA',
    category: 'Security',
    description: 'Review staff sessions, enforce MFA, and respond to reset requests.',
    time: '4 min read',
  },
]

const helpCategories = [
  { name: 'Users & access', icon: '♙', count: 'Roles, permissions, accounts' },
  { name: 'Bookings & operations', icon: '▦', count: 'Bookings, fleet, dispatch' },
  { name: 'Payments & refunds', icon: '₹', count: 'Payouts, invoices, refunds' },
  { name: 'Geography', icon: '⌖', count: 'States, cities, service areas' },
  { name: 'Platform settings', icon: '⚙', count: 'Rules, flags, configuration' },
  { name: 'Security', icon: '◇', count: 'Sessions, MFA, audit logs' },
]

const quickLinks = [
  { title: 'Help Center', detail: 'Find answers and practical walkthroughs', icon: '?', kind: 'help' },
  { title: 'User Guides', detail: 'Step-by-step platform guides', icon: '▤', kind: 'guides' },
  { title: 'FAQs', detail: 'Quick answers to common questions', icon: '☷', kind: 'faqs' },
  { title: 'Support Tickets', detail: 'View and manage support requests', icon: '✉', kind: 'tickets' },
  { title: 'System Status', detail: 'Current platform service health', icon: '◉', kind: 'status' },
  { title: 'Release Notes', detail: 'Recent improvements and updates', icon: '↗', kind: 'releases' },
] as const

type QuickLinkKind = (typeof quickLinks)[number]['kind']

export default function HelpDocsPage({ onBack, onOpenTickets }: HelpDocsPageProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All topics')
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [activeResource, setActiveResource] = useState<QuickLinkKind | null>(null)

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return helpArticles.filter((article) => {
      const matchesCategory = selectedCategory === 'All topics' || article.category === selectedCategory
      const matchesQuery =
        !normalizedQuery ||
        `${article.title} ${article.category} ${article.description}`.toLowerCase().includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [query, selectedCategory])

  const selectQuickLink = (kind: QuickLinkKind) => {
    if (kind === 'tickets') {
      onOpenTickets()
      return
    }
    setActiveResource((current) => (current === kind ? null : kind))
    if (kind === 'help' || kind === 'guides' || kind === 'faqs') {
      setSelectedCategory('All topics')
      document.getElementById('help-articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="help-docs-page" aria-label="Help and documentation">
      <style>{`
        .help-docs-page { display: grid; gap: 22px; min-width: 0; color: #182230; }
        .help-docs-header {
          display: flex; align-items: center; justify-content: space-between; gap: 18px;
          padding: 22px 24px; background: #fff; border: 1px solid rgba(15,23,42,.08);
          border-left: 4px solid var(--brand-orange); border-radius: 16px;
          box-shadow: 0 12px 28px rgba(15,23,42,.05);
        }
        .help-docs-title { margin: 0; font-size: clamp(1.45rem, 2vw, 1.8rem); letter-spacing: -.04em; }
        .help-docs-subtitle { margin: 5px 0 0; color: #64748b; font-size: .86rem; }
        .help-docs-back {
          display: inline-flex; align-items: center; gap: 7px; margin: 0 0 8px; padding: 0;
          border: 0; background: transparent; color: var(--brand-orange); font: inherit;
          font-size: .78rem; font-weight: 800; cursor: pointer;
        }
        .help-docs-back:hover { color: #c94310; text-decoration: underline; }
        .help-docs-search-wrap { position: relative; }
        .help-docs-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 1rem; pointer-events: none; }
        .help-docs-search {
          box-sizing: border-box; width: 100%; min-height: 52px; padding: 12px 16px 12px 44px;
          border: 1px solid rgba(15,23,42,.12); border-radius: 14px; background: #fff;
          color: #182230; font: inherit; font-size: .9rem; box-shadow: 0 8px 24px rgba(15,23,42,.04);
        }
        .help-docs-search:focus { outline: 3px solid rgba(255,107,44,.18); border-color: var(--brand-orange); }
        .help-docs-section { display: grid; gap: 14px; min-width: 0; }
        .help-docs-section-head { display: flex; justify-content: space-between; align-items: end; gap: 12px; }
        .help-docs-section-head h2 { margin: 0; font-size: 1.08rem; letter-spacing: -.02em; }
        .help-docs-section-head p { margin: 4px 0 0; color: #64748b; font-size: .78rem; }
        .help-docs-quick-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
        .help-docs-quick-card {
          display: flex; align-items: flex-start; gap: 12px; min-width: 0; padding: 16px;
          border: 1px solid rgba(15,23,42,.08); border-radius: 14px; background: #fff;
          text-align: left; color: inherit; font: inherit; cursor: pointer;
          transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
        }
        .help-docs-quick-card:hover { transform: translateY(-2px); border-color: rgba(255,107,44,.4); box-shadow: 0 10px 24px rgba(15,23,42,.07); }
        .help-docs-quick-icon { flex: 0 0 38px; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px; background: rgba(255,107,44,.1); color: #d94d19; font-size: 1.1rem; font-weight: 800; }
        .help-docs-quick-copy { display: grid; gap: 4px; }
        .help-docs-quick-copy strong { font-size: .85rem; }
        .help-docs-quick-copy span { color: #64748b; font-size: .73rem; line-height: 1.4; }
        .help-docs-content-grid { display: grid; grid-template-columns: minmax(0,1.4fr) minmax(280px,.8fr); gap: 18px; align-items: start; }
        .help-docs-article-list, .help-docs-categories { display: grid; gap: 9px; }
        .help-docs-article {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          width: 100%; padding: 14px 16px; border: 1px solid rgba(15,23,42,.08);
          border-radius: 12px; background: #fff; color: inherit; text-align: left;
          font: inherit; cursor: pointer;
        }
        .help-docs-article:hover { border-color: rgba(255,107,44,.4); }
        .help-docs-article-main { display: grid; gap: 5px; }
        .help-docs-article-main strong { font-size: .83rem; }
        .help-docs-article-main span { color: #64748b; font-size: .74rem; line-height: 1.45; }
        .help-docs-article-meta { display: grid; justify-items: end; gap: 6px; flex: 0 0 auto; }
        .help-docs-tag { color: #b4532b; font-size: .66rem; font-weight: 800; }
        .help-docs-read-time { color: #94a3b8; font-size: .68rem; white-space: nowrap; }
        .help-docs-category {
          display: flex; align-items: center; gap: 11px; width: 100%; padding: 12px;
          border: 1px solid rgba(15,23,42,.08); border-radius: 11px; background: #fff;
          color: inherit; text-align: left; font: inherit; cursor: pointer;
        }
        .help-docs-category:hover, .help-docs-category.active { border-color: rgba(255,107,44,.42); background: #fffaf7; }
        .help-docs-category-icon { flex: 0 0 34px; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: #f1f5f9; color: #475569; font-weight: 800; }
        .help-docs-category-copy { display: grid; gap: 3px; }
        .help-docs-category-copy strong { font-size: .78rem; }
        .help-docs-category-copy span { color: #64748b; font-size: .69rem; }
        .help-docs-empty, .help-docs-resource { padding: 18px; border: 1px solid rgba(15,23,42,.08); border-radius: 12px; background: #fff; color: #64748b; font-size: .82rem; line-height: 1.5; }
        .help-docs-resource { display: flex; align-items: center; justify-content: space-between; gap: 16px; color: #334155; }
        .help-docs-resource p { margin: 4px 0 0; color: #64748b; font-size: .76rem; }
        .help-docs-contact {
          display: flex; align-items: center; justify-content: space-between; gap: 18px;
          padding: 20px 22px; border-radius: 16px;
          background: linear-gradient(110deg, #172033, #25334a); color: #fff;
        }
        .help-docs-contact h2 { margin: 0; font-size: 1rem; }
        .help-docs-contact p { margin: 5px 0 0; color: rgba(255,255,255,.72); font-size: .78rem; }
        .help-docs-contact-btn { flex: 0 0 auto; border: 0; border-radius: 10px; padding: 10px 14px; background: #ff6b2c; color: #fff; font: inherit; font-size: .78rem; font-weight: 800; cursor: pointer; }
        .help-docs-contact-btn:hover { background: #ef4a12; }
        @media (max-width: 900px) {
          .help-docs-content-grid { grid-template-columns: minmax(0,1fr); }
          .help-docs-quick-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
        }
        @media (max-width: 600px) {
          .help-docs-header, .help-docs-contact { align-items: flex-start; flex-direction: column; }
          .help-docs-quick-grid { grid-template-columns: minmax(0,1fr); }
          .help-docs-section-head { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      <header className="help-docs-header">
        <div>
          <button type="button" className="help-docs-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Back to Dashboard
          </button>
          <h1 className="help-docs-title">Help &amp; Docs</h1>
          <p className="help-docs-subtitle">Guidance and resources for running the EquipHub platform.</p>
        </div>
        <span className="chip active">Super Admin Workspace</span>
      </header>

      <label className="help-docs-search-wrap">
        <span className="help-docs-search-icon" aria-hidden="true">⌕</span>
        <input
          className="help-docs-search"
          type="search"
          aria-label="Search help and documentation"
          placeholder="Search help articles, guides, and FAQs..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSelectedArticle(null)
          }}
        />
      </label>

      <section className="help-docs-section" aria-labelledby="help-quick-access-title">
        <div className="help-docs-section-head">
          <div>
            <h2 id="help-quick-access-title">Quick access</h2>
            <p>Jump to the resources you use most.</p>
          </div>
        </div>
        <div className="help-docs-quick-grid">
          {quickLinks.map((link) => (
            <button
              key={link.kind}
              type="button"
              className="help-docs-quick-card"
              aria-pressed={activeResource === link.kind}
              onClick={() => selectQuickLink(link.kind)}
            >
              <span className="help-docs-quick-icon" aria-hidden="true">{link.icon}</span>
              <span className="help-docs-quick-copy">
                <strong>{link.title}</strong>
                <span>{link.detail}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeResource === 'status' && (
        <section className="help-docs-resource" aria-live="polite">
          <div><strong>System status</strong><p>Core platform services are operational. Service metrics are available from the platform overview.</p></div>
          <span className="chip active">Operational</span>
        </section>
      )}
      {activeResource === 'releases' && (
        <section className="help-docs-resource" aria-live="polite">
          <div><strong>Latest release · October 2026</strong><p>Improved admin navigation, refund request filtering, and feature-flag controls.</p></div>
          <span className="help-docs-read-time">Release notes</span>
        </section>
      )}

      <div className="help-docs-content-grid">
        <section className="help-docs-section" id="help-articles" aria-labelledby="help-popular-title">
          <div className="help-docs-section-head">
            <div>
              <h2 id="help-popular-title">{query.trim() ? 'Search results' : 'Popular help articles'}</h2>
              <p>{filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} to explore</p>
            </div>
            {selectedCategory !== 'All topics' && (
              <button type="button" className="help-docs-back" onClick={() => setSelectedCategory('All topics')}>
                Clear category
              </button>
            )}
          </div>
          {selectedArticle ? (
            <article className="help-docs-resource" aria-live="polite">
              <div>
                <strong>{selectedArticle}</strong>
                <p>{helpArticles.find((article) => article.title === selectedArticle)?.description} For additional help, contact the platform support team.</p>
              </div>
              <button type="button" className="help-docs-back" onClick={() => setSelectedArticle(null)}>← All articles</button>
            </article>
          ) : filteredArticles.length > 0 ? (
            <div className="help-docs-article-list">
              {filteredArticles.map((article) => (
                <button key={article.title} type="button" className="help-docs-article" onClick={() => setSelectedArticle(article.title)}>
                  <span className="help-docs-article-main">
                    <strong>{article.title}</strong>
                    <span>{article.description}</span>
                  </span>
                  <span className="help-docs-article-meta">
                    <span className="help-docs-tag">{article.category}</span>
                    <span className="help-docs-read-time">{article.time}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="help-docs-empty">No help articles match your search. Try different keywords or browse a category.</div>
          )}
        </section>

        <section className="help-docs-section" aria-labelledby="help-categories-title">
          <div className="help-docs-section-head">
            <div>
              <h2 id="help-categories-title">Browse by category</h2>
              <p>Find help for a specific part of the platform.</p>
            </div>
          </div>
          <div className="help-docs-categories">
            <button
              type="button"
              className={`help-docs-category${selectedCategory === 'All topics' ? ' active' : ''}`}
              aria-pressed={selectedCategory === 'All topics'}
              onClick={() => setSelectedCategory('All topics')}
            >
              <span className="help-docs-category-icon" aria-hidden="true">⌂</span>
              <span className="help-docs-category-copy"><strong>All topics</strong><span>Browse every help article</span></span>
            </button>
            {helpCategories.map((category) => (
              <button
                key={category.name}
                type="button"
                className={`help-docs-category${selectedCategory === category.name ? ' active' : ''}`}
                aria-pressed={selectedCategory === category.name}
                onClick={() => {
                  setSelectedCategory(category.name)
                  setSelectedArticle(null)
                }}
              >
                <span className="help-docs-category-icon" aria-hidden="true">{category.icon}</span>
                <span className="help-docs-category-copy"><strong>{category.name}</strong><span>{category.count}</span></span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="help-docs-contact" aria-labelledby="help-contact-title">
        <div>
          <h2 id="help-contact-title">Need a hand with something?</h2>
          <p>Our support team can help you resolve platform questions and operational issues.</p>
        </div>
        <button type="button" className="help-docs-contact-btn" onClick={onOpenTickets}>Contact Support</button>
      </section>
    </section>
  )
}
