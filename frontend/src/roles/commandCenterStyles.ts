// Shared layout, header, table and card styles for the command-center style
// role dashboards (Super Admin pattern). Rendered via <style> tags by each role.
export const commandCenterStyles = `
        :root {
          --sa-page-bg: #f6f8fa;
          --sa-sidebar-bg: #101827;
          --sa-card-bg: #ffffff;
          --sa-line: rgba(15, 23, 42, 0.08);
          --sa-text: #182230;
          --sa-muted: #8a96a6;
          --sa-green: #08a66c;
          --sa-green-soft: rgba(8, 166, 108, 0.12);
          --sa-blue: #2563eb;
          --sa-blue-soft: rgba(37, 99, 235, 0.12);
          --sa-purple: #7c3aed;
          --sa-purple-soft: rgba(124, 58, 237, 0.12);
          --sa-orange: #f59e0b;
          --sa-orange-soft: rgba(245, 158, 11, 0.12);
          --sa-red: #ef4444;
          --sa-red-soft: rgba(239, 68, 68, 0.12);
          --sa-brand: #ff6b2c;
          --sa-brand-deep: #ef4a12;
          --sa-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
        }

        .stateadmin-role-dashboard {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 20px;
          width: 100%;
          color: var(--sa-text);
        }

        .sa-sidebar {
          background: var(--sa-sidebar-bg);
          border-radius: 24px;
          padding: 18px 14px 14px;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: sticky;
          top: 16px;
          height: calc(100vh - 32px);
          min-height: 0;
          overflow-y: auto;
          box-shadow: 0 18px 50px rgba(16, 24, 39, 0.12);
        }

        .sa-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sa-brand-badge {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--sa-brand), var(--sa-brand-deep));
          color: #fff;
          font-weight: 800;
          box-shadow: 0 10px 22px rgba(239, 74, 18, 0.3);
          flex-shrink: 0;
        }

        .sa-brand-text {
          font-size: 0.86rem;
          font-weight: 700;
          color: #fff;
        }

        .sa-brand-meta {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.55);
          margin-top: 2px;
        }

        .sa-sidebar-label {
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.42);
          padding: 0 10px 8px;
        }

        .sa-nav {
          display: grid;
          gap: 4px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .sa-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: rgba(255, 255, 255, 0.72);
          font: inherit;
          font-size: 0.86rem;
          font-weight: 600;
          padding: 10px 12px;
          cursor: pointer;
          text-align: left;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .sa-nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .sa-nav-item.active {
          background: linear-gradient(100deg, var(--sa-brand), var(--sa-brand-deep));
          color: #fff;
          box-shadow: 0 10px 22px rgba(239, 74, 18, 0.28);
        }

        .sa-nav-badge {
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          display: inline-grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
          font-size: 0.66rem;
          font-weight: 800;
        }

        .sa-nav-item.active .sa-nav-badge {
          background: rgba(255, 255, 255, 0.24);
        }

        .sa-scope-card {
          margin: 0 4px;
          padding: 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: grid;
          gap: 8px;
        }

        .sa-scope-card strong {
          font-size: 0.78rem;
          color: #fff;
        }

        .sa-scope-card span {
          font-size: 0.74rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.5;
        }

        .sa-account {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 10px 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sa-account-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #0ea56f, #08a66c);
          color: #fff;
          font-size: 0.76rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .sa-account-copy {
          min-width: 0;
          display: grid;
          gap: 1px;
        }

        .sa-account-copy strong {
          font-size: 0.78rem;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sa-account-copy span {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sa-signout {
          margin-left: auto;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          border-radius: 9px;
          font: inherit;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 6px 9px;
          cursor: pointer;
        }

        .sa-signout:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .sa-main {
          display: grid;
          gap: 20px;
          min-width: 0;
          align-content: start;
        }

        .sa-content {
          display: grid;
          gap: 20px;
          min-width: 0;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid var(--sa-line);
          border-radius: 22px;
          padding: 18px 20px;
          box-shadow: var(--sa-shadow);
        }

        .header-copy {
          display: grid;
          gap: 4px;
          min-width: 0;
        }

        .header-kicker {
          margin: 0;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--sa-muted);
          font-weight: 700;
        }

        .header-title {
          margin: 0;
          font-size: clamp(1.5rem, 2vw, 2rem);
          letter-spacing: -0.05em;
          line-height: 1.1;
          font-weight: 800;
        }

        .header-breadcrumb {
          color: var(--sa-muted);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .header-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
          position: relative;
          z-index: 45;
        }

        .header-panel-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.18);
          z-index: 40;
        }

        .header-search-wrap,
        .header-popover-wrap {
          position: relative;
        }

        .header-search {
          min-width: 220px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--sa-line);
          background: #fff;
          color: var(--sa-text);
        }

        .header-action {
          background: #f2f5f7;
          border: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 12px;
          padding: 9px 12px;
          color: var(--sa-text);
          font: inherit;
          font-weight: 700;
          font-size: 0.8rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .header-action:hover,
        .header-action.is-open {
          border-color: rgba(255, 107, 44, 0.45);
          background: #fff;
        }

        .header-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0ea56f, #08a66c);
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 0.78rem;
          box-shadow: 0 10px 22px rgba(8, 166, 108, 0.24);
        }

        .org-button {
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #fff;
          border-radius: 10px;
          padding: 7px 10px;
          color: var(--sa-text);
          font: inherit;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
        }

        .org-button:hover {
          border-color: rgba(255, 107, 44, 0.45);
        }

        .org-button.primary {
          background: var(--sa-green-soft);
          color: var(--sa-green);
          border-color: rgba(8, 166, 108, 0.2);
        }

        .org-button.primary:hover {
          border-color: rgba(8, 166, 108, 0.4);
        }

        .header-badge {
          background: var(--sa-brand-deep);
          color: #fff;
          border-radius: 999px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          font-size: 0.66rem;
          font-weight: 800;
          display: inline-grid;
          place-items: center;
        }

        .header-badge-amber {
          background: var(--sa-orange);
        }

        .header-popover {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 370px;
          max-width: calc(100vw - 32px);
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 16px;
          box-shadow: 0 24px 56px rgba(15, 23, 42, 0.2);
          z-index: 50;
          overflow: hidden;
          text-align: left;
        }

        .header-popover.search-popover {
          right: auto;
          left: 0;
          width: 430px;
        }

        .header-popover-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .header-popover-head h4 {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 800;
          color: #0f172a;
        }

        .header-popover-meta {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .header-popover-action {
          border: 0;
          background: transparent;
          color: var(--sa-brand-deep);
          font: inherit;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          padding: 0;
        }

        .header-popover-action:hover {
          text-decoration: underline;
        }

        .header-popover-foot {
          padding: 12px 16px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          background: #f8fafc;
        }

        .header-popover-foot .header-action {
          width: 100%;
          justify-content: center;
        }

        .header-feed-list {
          display: grid;
          max-height: 360px;
          overflow-y: auto;
        }

        .header-feed-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          border: 0;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          background: transparent;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .header-feed-item:hover {
          background: #f8fafc;
        }

        .header-feed-item:last-child {
          border-bottom: 0;
        }

        .header-feed-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .header-feed-dot.green { background: var(--sa-green); }
        .header-feed-dot.amber { background: var(--sa-orange); }
        .header-feed-dot.red { background: var(--sa-red); }
        .header-feed-dot.blue { background: var(--sa-blue); }

        .header-feed-body {
          display: grid;
          gap: 3px;
          min-width: 0;
        }

        .header-feed-body strong {
          font-size: 0.82rem;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .header-feed-body > span {
          font-size: 0.74rem;
          color: #64748b;
          line-height: 1.45;
        }

        .header-feed-body .header-feed-time {
          font-size: 0.68rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .header-feed-unread {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--sa-brand-deep);
          flex-shrink: 0;
        }

        .header-alert-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .header-sev {
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 0.66rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }

        .header-sev.critical { background: var(--sa-red-soft); color: #b91c1c; }
        .header-sev.warning { background: var(--sa-orange-soft); color: #b45309; }
        .header-sev.info { background: var(--sa-blue-soft); color: #1d4ed8; }

        .header-feed-empty {
          padding: 20px 16px;
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
        }

        .period-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 11px 16px;
          border: 0;
          background: transparent;
          font: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          text-align: left;
        }

        .period-menu-item:hover {
          background: #f8fafc;
        }

        .period-menu-item.selected {
          color: var(--sa-brand-deep);
          font-weight: 800;
          background: rgba(255, 107, 44, 0.06);
        }

        .period-current {
          font-size: 0.66rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #94a3b8;
        }

        .search-result-group {
          padding: 7px 16px;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
          background: #f8fafc;
          border-bottom: 1px solid rgba(15, 23, 42, 0.05);
        }

        .search-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          padding: 11px 16px;
          border: 0;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          background: transparent;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }

        .search-result-item:hover {
          background: #f8fafc;
        }

        .search-result-item strong {
          font-size: 0.84rem;
          color: #0f172a;
        }

        .search-result-sub {
          font-size: 0.72rem;
          color: #64748b;
          text-align: right;
        }

        .sa-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 70;
          background: #101827;
          color: #fff;
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 0.84rem;
          font-weight: 700;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.28);
        }

        .sa-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .sa-kpi-card {
          background: var(--sa-card-bg);
          border: 1px solid var(--sa-line);
          border-radius: 18px;
          padding: 16px;
          box-shadow: var(--sa-shadow);
          display: grid;
          gap: 10px;
          width: 100%;
          font: inherit;
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .sa-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
          border-color: rgba(255, 107, 44, 0.45);
        }

        .sa-kpi-card:focus-visible {
          outline: 3px solid rgba(255, 107, 44, 0.45);
          outline-offset: 3px;
        }

        .sa-kpi-card.green { border-color: rgba(8, 166, 108, 0.18); }
        .sa-kpi-card.blue { border-color: rgba(37, 99, 235, 0.18); }
        .sa-kpi-card.purple { border-color: rgba(124, 58, 237, 0.18); }
        .sa-kpi-card.orange { border-color: rgba(245, 158, 11, 0.18); }

        .sa-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sa-kpi-label {
          color: var(--sa-muted);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .sa-kpi-change {
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 0.7rem;
          font-weight: 800;
          background: var(--sa-green-soft);
          color: var(--sa-green);
        }

        .sa-kpi-value {
          font-size: clamp(1.5rem, 2vw, 1.95rem);
          letter-spacing: -0.05em;
          font-weight: 800;
        }

        .sa-kpi-desc {
          font-size: 0.74rem;
          color: var(--sa-muted);
          line-height: 1.5;
        }

        .sa-kpi-open {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--sa-brand-deep);
        }

        .sa-kpi-card:hover .sa-kpi-open {
          text-decoration: underline;
        }

        .sa-attention {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .sa-attention-card {
          border: 1px solid var(--sa-line);
          background: var(--sa-card-bg);
          border-radius: 18px;
          box-shadow: var(--sa-shadow);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font: inherit;
          color: inherit;
          text-align: left;
          cursor: pointer;
          min-width: 0;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .sa-attention-card:hover {
          border-color: rgba(255, 107, 44, 0.45);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
        }

        .sa-attention-label {
          color: var(--sa-muted);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .sa-attention-value {
          font-size: 1.9rem;
          letter-spacing: -0.06em;
          font-weight: 800;
          line-height: 1;
        }

        .sa-analytics-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 18px;
        }

        .sa-lower-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 18px;
        }

        .sa-panel {
          background: var(--sa-card-bg);
          border: 1px solid var(--sa-line);
          border-radius: 22px;
          box-shadow: var(--sa-shadow);
          overflow: hidden;
          min-width: 0;
        }

        .sa-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 18px 12px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .sa-panel-header h3 {
          margin: 0;
          font-size: 1.05rem;
          letter-spacing: -0.04em;
        }

        .sa-panel-sub {
          font-size: 0.74rem;
          color: var(--sa-muted);
          font-weight: 600;
        }

        .sa-chip-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sa-chip {
          border: 1px solid transparent;
          border-radius: 999px;
          background: #f3f6f7;
          color: var(--sa-muted);
          padding: 6px 12px;
          font: inherit;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
        }

        .sa-chip:hover {
          border-color: rgba(255, 107, 44, 0.35);
        }

        .sa-chip.active {
          background: rgba(8, 166, 108, 0.12);
          color: var(--sa-green);
        }

        .sa-chip.active.orange {
          background: rgba(255, 107, 44, 0.12);
          color: var(--sa-brand-deep);
        }

        .sa-legend {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          padding: 14px 18px 0;
        }

        .sa-legend span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--sa-muted);
        }

        .sa-legend i {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          display: inline-block;
        }

        .sa-legend .rev { background: rgba(8, 166, 108, 0.85); }
        .sa-legend .bkg { background: rgba(37, 99, 235, 0.85); }

        .sa-bars {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          height: 190px;
          padding: 14px 18px 0;
        }

        .sa-bar-group {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
        }

        .sa-bar {
          flex: 1;
          border-radius: 8px 8px 0 0;
          min-height: 12px;
        }

        .sa-bar.revenue { background: linear-gradient(180deg, rgba(8, 166, 108, 0.92), rgba(8, 166, 108, 0.35)); }
        .sa-bar.bookings { background: linear-gradient(180deg, rgba(37, 99, 235, 0.92), rgba(37, 99, 235, 0.35)); }

        .sa-bar-labels {
          display: flex;
          gap: 10px;
          padding: 8px 18px 16px;
        }

        .sa-bar-labels span {
          flex: 1;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--sa-muted);
        }

        .sa-util-list {
          display: grid;
          gap: 14px;
          padding: 16px 18px 18px;
        }

        .sa-util-row {
          display: grid;
          gap: 6px;
        }

        .sa-util-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .sa-util-top span:last-child {
          color: var(--sa-muted);
        }

        .sa-progress {
          display: block;
          height: 7px;
          border-radius: 999px;
          background: #eef2f5;
          overflow: hidden;
        }

        .sa-progress > span {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(8, 166, 108, 0.9), rgba(8, 166, 108, 0.55));
        }

        .sa-progress-cell {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-width: 130px;
        }

        .sa-progress-cell .sa-progress {
          flex: 1;
          min-width: 70px;
        }

        .sa-progress-cell > span:last-child {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--sa-muted);
        }

        .sa-feed {
          display: grid;
        }

        .sa-feed-item {
          display: grid;
          gap: 3px;
          padding: 12px 18px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .sa-feed-item:last-child {
          border-bottom: 0;
        }

        button.sa-feed-item {
          appearance: none;
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          text-align: left;
          cursor: pointer;
          font: inherit;
        }

        button.sa-feed-item:hover {
          background: rgba(37, 99, 235, 0.05);
        }

        .sa-feed-item strong {
          font-size: 0.8rem;
          color: var(--sa-text);
          font-weight: 700;
        }

        .sa-feed-item strong em {
          font-style: normal;
          color: var(--sa-brand-deep);
        }

        .sa-feed-item span {
          font-size: 0.72rem;
          color: var(--sa-muted);
        }

        .sa-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          background: #fbfcfd;
        }

        .sa-input {
          flex: 1;
          min-width: 180px;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid var(--sa-line);
          background: #fff;
          color: var(--sa-text);
          font: inherit;
          font-size: 0.82rem;
        }

        .sa-select {
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid var(--sa-line);
          background: #fff;
          color: var(--sa-text);
          font: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .sa-btn-ghost {
          border: 1px solid var(--sa-line);
          background: #fff;
          color: var(--sa-text);
          border-radius: 10px;
          padding: 9px 14px;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        .sa-btn-ghost:hover {
          border-color: rgba(255, 107, 44, 0.45);
          color: var(--sa-brand-deep);
        }

        .sa-toolbar-meta {
          margin-left: auto;
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--sa-muted);
        }

        .sa-input-sm {
          flex: 0 0 92px;
          min-width: 92px;
        }

        .sa-inline-edit {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sa-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          padding: 18px;
        }

        .sa-field {
          display: grid;
          gap: 6px;
        }

        .sa-field > span {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--sa-muted);
        }

        .sa-form-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 0 18px 18px;
        }

        .sa-stat-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1px;
          background: rgba(15, 23, 42, 0.06);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .sa-stat {
          display: grid;
          gap: 4px;
          padding: 14px 18px;
          background: #fff;
        }

        .sa-stat span {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--sa-muted);
        }

        .sa-stat strong {
          font-size: 1.02rem;
          color: var(--sa-text);
          font-variant-numeric: tabular-nums;
        }

        .sa-report-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
          padding: 18px;
        }

        .sa-report-card {
          display: grid;
          gap: 8px;
          align-content: start;
          padding: 16px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
        }

        .sa-report-card h4 {
          margin: 0;
          font-size: 0.86rem;
          color: var(--sa-text);
        }

        .sa-report-card p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--sa-muted);
        }

        .sa-report-card .sa-chip-row {
          margin-top: 4px;
        }

        .sp-thread {
          display: grid;
          gap: 12px;
          padding: 18px;
        }

        .sp-msg {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-left: 3px solid var(--sa-blue);
          border-radius: 12px;
          padding: 12px 14px;
          background: #fff;
        }

        .sp-msg.internal {
          border-left-color: var(--sa-orange);
          background: #fffaf3;
        }

        .sp-msg-head {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .sp-msg-head strong {
          font-size: 0.82rem;
          color: var(--sa-text);
        }

        .sp-msg-role {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--sa-muted);
        }

        .sp-msg-time {
          margin-left: auto;
          font-size: 0.7rem;
          color: var(--sa-muted);
        }

        .sp-msg-body {
          margin: 0;
          font-size: 0.82rem;
          line-height: 1.5;
          color: var(--sa-text);
        }

        .sp-timeline {
          display: grid;
          padding: 18px;
        }

        .sp-timeline-item {
          position: relative;
          display: grid;
          grid-template-columns: 16px 1fr;
          gap: 12px;
          padding-bottom: 16px;
        }

        .sp-timeline-item:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 16px;
          bottom: 0;
          width: 2px;
          background: rgba(15, 23, 42, 0.1);
        }

        .sp-timeline-dot {
          width: 12px;
          height: 12px;
          margin-top: 3px;
          border-radius: 999px;
          background: var(--sa-brand-deep);
          box-shadow: 0 0 0 3px rgba(255, 107, 44, 0.15);
        }

        .sp-timeline-body {
          display: grid;
          gap: 2px;
        }

        .sp-timeline-body strong {
          font-size: 0.82rem;
          color: var(--sa-text);
        }

        .sp-timeline-body p {
          margin: 2px 0 0;
          font-size: 0.78rem;
          color: var(--sa-muted);
        }

        .sp-person-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1px;
          background: rgba(15, 23, 42, 0.06);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .sp-person {
          display: grid;
          gap: 3px;
          padding: 14px 18px;
          background: #fff;
        }

        .sp-person span:first-child {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--sa-muted);
        }

        .sp-person strong {
          font-size: 0.86rem;
          color: var(--sa-text);
        }

        .sp-person span:last-child {
          font-size: 0.74rem;
          color: var(--sa-muted);
        }

        .sa-form-error {
          margin: 0;
          padding: 0 18px 12px;
          color: #b91c1c;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .sa-table-wrap {
          overflow-x: auto;
        }

        .sa-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        .sa-table th {
          text-align: left;
          vertical-align: middle;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sa-muted);
          padding: 12px 18px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background: #fff;
          white-space: nowrap;
        }

        .sa-table td {
          padding: 13px 18px;
          vertical-align: middle;
          font-size: 0.82rem;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          color: var(--sa-text);
          white-space: nowrap;
        }

        .sa-table tr:last-child td {
          border-bottom: 0;
        }

        .sa-table tbody tr:hover td {
          background: #f8fafc;
        }

        .sa-cell-strong {
          font-weight: 700;
        }

        .sa-cell-sub {
          display: block;
          font-size: 0.7rem;
          color: var(--sa-muted);
          margin-top: 2px;
        }

        td.sa-cell-sub {
          display: table-cell;
          vertical-align: middle;
          margin-top: 0;
        }

        td.sa-cell-sub > .sa-cell-sub {
          margin-top: 2px;
        }

        .sa-num {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
        }

        .sa-table-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-start;
        }

        .sa-table-act {
          border: 1px solid var(--sa-line);
          background: #fff;
          color: var(--sa-text);
          border-radius: 8px;
          padding: 5px 10px;
          font: inherit;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .sa-table-act:hover {
          border-color: rgba(255, 107, 44, 0.45);
          color: var(--sa-brand-deep);
        }

        .sa-table-act.danger {
          color: #b91c1c;
          border-color: rgba(239, 68, 68, 0.35);
        }

        .sa-table-act.danger:hover {
          border-color: rgba(239, 68, 68, 0.5);
        }

        .sa-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .sa-pill.green { background: var(--sa-green-soft); color: var(--sa-green); }
        .sa-pill.amber { background: var(--sa-orange-soft); color: #b45309; }
        .sa-pill.red { background: var(--sa-red-soft); color: #b91c1c; }
        .sa-pill.blue { background: var(--sa-blue-soft); color: #1d4ed8; }
        .sa-pill.purple { background: #ede9fe; color: #6d28d9; }
        .sa-pill.slate { background: #eef2f5; color: #64748b; }

        .sa-trend-up {
          color: var(--sa-green);
          font-weight: 700;
        }

        .sa-trend-flat {
          color: var(--sa-muted);
          font-weight: 700;
        }

        .sa-empty {
          padding: 36px 18px;
          text-align: center;
          display: grid;
          gap: 12px;
          justify-items: center;
        }

        .sa-empty p {
          margin: 0;
          color: var(--sa-muted);
          font-size: 0.86rem;
        }

        .sa-approval-list {
          display: grid;
        }

        .sa-approval-item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: center;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }

        .sa-approval-item:last-child {
          border-bottom: 0;
        }

        .sa-approval-copy {
          display: grid;
          gap: 5px;
          min-width: 0;
        }

        .sa-approval-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sa-approval-id {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--sa-muted);
          letter-spacing: 0.04em;
        }

        .sa-approval-copy strong {
          font-size: 0.9rem;
          color: var(--sa-text);
        }

        .sa-approval-copy p {
          margin: 0;
          font-size: 0.78rem;
          color: var(--sa-muted);
          line-height: 1.5;
        }

        .sa-approval-meta {
          font-size: 0.7rem;
          color: var(--sa-muted);
          font-weight: 700;
        }

        .sa-approval-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .sa-btn {
          border: 0;
          border-radius: 10px;
          padding: 9px 16px;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
        }

        .sa-btn.approve {
          background: var(--sa-green);
          color: #fff;
          box-shadow: 0 8px 18px rgba(8, 166, 108, 0.24);
        }

        .sa-btn.approve:hover {
          background: #079562;
        }

        .sa-btn.reject {
          background: #fff;
          color: #b91c1c;
          border: 1px solid rgba(239, 68, 68, 0.35);
        }

        .sa-btn.reject:hover {
          background: var(--sa-red-soft);
        }

        .sa-view-link {
          border: 0;
          background: transparent;
          color: var(--sa-brand-deep);
          font: inherit;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          padding: 0;
        }

        .sa-view-link:hover {
          text-decoration: underline;
        }

        .sa-btn.return {
          background: var(--sa-blue-soft);
          color: #1d4ed8;
          border: 1px solid rgba(37, 99, 235, 0.35);
        }

        .sa-btn.return:hover {
          background: rgba(37, 99, 235, 0.2);
        }

        .sa-btn.ghost {
          background: #fff;
          color: var(--sa-text);
          border: 1px solid var(--sa-line);
        }

        .sa-btn.ghost:hover {
          background: #f1f5f9;
        }

        .sa-btn.primary {
          background: var(--sa-brand-deep);
          color: #fff;
          box-shadow: 0 8px 18px rgba(239, 74, 18, 0.24);
        }

        .sa-btn.primary:hover {
          background: var(--sa-brand);
        }

        .sa-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .sa-approval-history {
          display: grid;
          gap: 8px;
          justify-items: start;
        }

        .sa-history-list {
          list-style: none;
          margin: 0;
          padding: 0 0 0 12px;
          display: grid;
          gap: 10px;
          border-left: 2px solid var(--sa-line);
          width: 100%;
        }

        .sa-history-item {
          display: grid;
          gap: 4px;
        }

        .sa-history-head {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sa-history-head strong {
          font-size: 0.78rem;
          color: var(--sa-text);
        }

        .sa-history-comment {
          margin: 0;
          font-size: 0.76rem;
          color: var(--sa-muted);
          font-style: italic;
          line-height: 1.5;
        }

        .sa-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(16, 24, 39, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 60;
        }

        .sa-modal {
          background: var(--sa-card-bg);
          border-radius: 18px;
          width: min(520px, 100%);
          box-shadow: 0 24px 60px rgba(16, 24, 39, 0.28);
          display: grid;
          overflow: hidden;
        }

        .sa-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--sa-line);
        }

        .sa-modal-header h4 {
          margin: 0 0 4px;
          font-size: 1rem;
          color: var(--sa-text);
        }

        .sa-modal-close {
          border: 0;
          background: transparent;
          font-size: 1.4rem;
          line-height: 1;
          color: var(--sa-muted);
          cursor: pointer;
          padding: 0 4px;
        }

        .sa-modal-close:hover {
          color: var(--sa-text);
        }

        .sa-modal-body {
          padding: 18px 20px;
          display: grid;
          gap: 10px;
        }

        .sa-modal-detail {
          margin: 0;
          font-size: 0.84rem;
          color: var(--sa-text);
          line-height: 1.55;
        }

        .sa-modal-hint {
          margin: 0;
          font-size: 0.76rem;
          color: var(--sa-muted);
        }

        .sa-comment-label {
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--sa-text);
          letter-spacing: 0.02em;
        }

        .sa-comment-input {
          font: inherit;
          font-size: 0.82rem;
          color: var(--sa-text);
          border: 1px solid var(--sa-line);
          border-radius: 10px;
          padding: 10px 12px;
          resize: vertical;
          width: 100%;
          box-sizing: border-box;
        }

        .sa-comment-input:focus {
          outline: none;
          border-color: var(--sa-brand);
          box-shadow: 0 0 0 3px rgba(255, 107, 44, 0.15);
        }

        .sa-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid var(--sa-line);
          background: #fafbfc;
        }

        .sa-btn-ghost:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .finance-header-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .finance-tabs {
          flex-wrap: wrap;
          padding: 12px 18px 0;
        }

        .sa-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .sa-stat-card {
          display: grid;
          gap: 6px;
          text-align: left;
          font: inherit;
          color: inherit;
          cursor: pointer;
          background: var(--sa-card-bg);
          border: 1px solid var(--sa-line);
          border-top: 3px solid var(--sa-line);
          border-radius: 18px;
          box-shadow: var(--sa-shadow);
          padding: 16px 18px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .sa-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
        }

        .sa-stat-card:focus-visible {
          outline: 3px solid rgba(255, 107, 44, 0.45);
          outline-offset: 3px;
        }

        .sa-stat-label {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sa-muted);
        }

        .sa-stat-value {
          font-size: clamp(1.6rem, 2.2vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .sa-stat-sub {
          font-size: 0.74rem;
          color: var(--sa-muted);
        }

        .sa-stat-card.tone-brand {
          border-top-color: var(--sa-brand);
        }

        .sa-stat-card.tone-purple {
          border-top-color: var(--sa-purple);
        }

        .sa-stat-card.tone-blue {
          border-top-color: var(--sa-blue);
        }

        .sa-stat-card.tone-green {
          border-top-color: var(--sa-green);
        }

        .sa-stat-card.tone-red {
          border-top-color: var(--sa-red);
        }

        .sa-stat-card.tone-amber {
          border-top-color: var(--sa-orange);
        }

        .sa-stat-card.tone-slate {
          border-top-color: var(--sa-muted);
        }

        .sa-stat-card.compact .sa-stat-value {
          font-size: clamp(1.2rem, 1.5vw, 1.5rem);
        }

        .sa-stat-card.static {
          cursor: default;
        }

        .sa-stat-card.static:hover {
          transform: none;
          box-shadow: var(--sa-shadow);
        }

        .sa-stat-card.active {
          box-shadow: 0 0 0 2px rgba(255, 107, 44, 0.4), var(--sa-shadow);
        }

        .finance-panel .sa-stat-grid {
          padding: 16px 18px 0;
        }

        .finance-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          padding: 16px 18px 4px;
        }

        .finance-summary-item {
          display: grid;
          gap: 4px;
          background: #f8fafb;
          border: 1px solid var(--sa-line);
          border-radius: 14px;
          padding: 12px 14px;
        }

        .finance-summary-item strong {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--sa-text);
          font-variant-numeric: tabular-nums;
        }

        .sa-modal.wide {
          width: min(780px, 100%);
          max-height: min(88vh, 780px);
          grid-template-rows: auto 1fr auto;
        }

        .support-body {
          overflow-y: auto;
          max-height: 62vh;
        }

        .support-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 10px;
        }

        .support-meta-item {
          display: grid;
          gap: 2px;
          background: #f8fafb;
          border: 1px solid var(--sa-line);
          border-radius: 12px;
          padding: 10px 12px;
        }

        .support-meta-item span {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: var(--sa-muted);
        }

        .support-meta-item strong {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--sa-text);
        }

        .support-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: var(--sa-text);
          margin: 6px 0 2px;
        }

        .support-thread,
        .support-notes {
          display: grid;
          gap: 10px;
        }

        .support-msg {
          display: grid;
          gap: 4px;
          border: 1px solid var(--sa-line);
          border-left: 3px solid var(--sa-blue);
          border-radius: 12px;
          padding: 10px 12px;
          background: #fff;
        }

        .support-msg.internal {
          border-left-color: var(--sa-orange);
          background: #fff8f3;
        }

        .support-msg.system {
          border-left-color: #94a3b8;
          background: #f8fafb;
        }

        .support-msg-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .support-msg-head strong {
          font-size: 0.82rem;
          color: var(--sa-text);
        }

        .support-msg-body {
          margin: 0;
          font-size: 0.82rem;
          color: var(--sa-text);
          line-height: 1.5;
        }

        .support-msg-meta {
          font-size: 0.72rem;
          color: var(--sa-muted);
        }

        .support-compose {
          display: grid;
          gap: 8px;
        }

        .support-compose-row {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .support-empty {
          font-size: 0.8rem;
          color: var(--sa-muted);
          margin: 0;
        }

        .sa-date {
          width: 158px;
          font: inherit;
          font-size: 0.82rem;
          color: var(--sa-text);
          background: #fff;
          border: 1px solid var(--sa-line);
          border-radius: 10px;
          padding: 8px 10px;
        }

        .reports-note {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 0 18px;
          font-size: 0.78rem;
          color: var(--sa-muted);
        }

        .reports-range {
          padding: 0 18px;
          font-size: 0.78rem;
          color: var(--sa-muted);
        }

        .notif-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 18px;
          flex-wrap: wrap;
        }

        .notif-toolbar-meta {
          font-size: 0.78rem;
          color: var(--sa-muted);
        }

        .notif-list {
          display: grid;
          gap: 10px;
          padding: 4px 18px 18px;
        }

        .notif-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 12px;
          align-items: start;
          background: var(--sa-card-bg);
          border: 1px solid var(--sa-line);
          border-radius: 14px;
          padding: 14px 16px;
          box-shadow: var(--sa-shadow);
        }

        .notif-card.unread {
          border-left: 3px solid var(--sa-brand);
        }

        .notif-card.read {
          opacity: 0.72;
        }

        .notif-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          margin-top: 6px;
          background: var(--sa-muted);
        }

        .notif-dot.green { background: var(--sa-green); }
        .notif-dot.amber { background: var(--sa-orange); }
        .notif-dot.red { background: var(--sa-red); }
        .notif-dot.blue { background: var(--sa-blue); }

        .notif-body {
          display: grid;
          gap: 4px;
        }

        .notif-title {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 0.92rem;
          color: var(--sa-text);
        }

        .notif-detail {
          margin: 0;
          font-size: 0.82rem;
          color: var(--sa-muted);
        }

        .notif-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 0.74rem;
          color: var(--sa-muted);
        }

        .notif-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
        }

        .notif-empty {
          margin: 0;
          padding: 32px 18px;
          text-align: center;
          font-size: 0.84rem;
          color: var(--sa-muted);
        }
      `
