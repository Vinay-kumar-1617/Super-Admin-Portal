// Shared page styling used by the States & Cities management pages.
// The CSS below is rendered via <style> tags in each page component.
export const statesPageStyles = `        .states-page {
          display: grid;
          gap: 20px;
          min-width: 0;
          align-content: start;
          color: #182230;
          font-family: inherit;
        }

        /* Top Header Card */
        .states-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 24px;
          border: 1px solid rgba(15,23,42,0.08);
          border-left: 4px solid var(--brand-orange, #ff6b2c);
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(15,23,42,0.05);
        }

        .states-header-copy {
          display: grid;
          gap: 6px;
          min-width: 0;
        }

        .states-header-copy h2 {
          margin: 0;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #182230;
          line-height: 1.25;
        }

        .states-header-copy p {
          margin: 0;
          color: #64748b;
          font-size: 0.88rem;
          line-height: 1.4;
        }

        .states-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.76rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }

        .states-breadcrumb button {
          border: 0;
          background: transparent;
          color: var(--brand-orange);
          padding: 0;
          font: inherit;
          cursor: pointer;
          font-weight: 700;
        }

        .states-breadcrumb button:hover {
          text-decoration: underline;
        }

        .states-header-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .states-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .states-header-actions .btn-primary,
        .states-header-actions .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          box-sizing: border-box;
          white-space: nowrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #ff6b2c, #ef4a12);
          color: #fff;
          border: 0;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(239, 74, 18, 0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(239, 74, 18, 0.35);
        }

        .geo-add-action { background: linear-gradient(100deg, #b84318, #8f2f0d); box-shadow: 0 6px 14px rgba(143,47,13,0.2); }
        .geo-add-action:hover { background: linear-gradient(100deg, #a83b14, #7c280a); box-shadow: 0 8px 18px rgba(143,47,13,0.25); }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          color: #1e293b;
          border: 1px solid rgba(15,23,42,0.12);
          border-radius: 12px;
          padding: 9px 15px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .btn-secondary:hover {
          background: #f1f5f9;
        }

        /* Stats Cards */
        .states-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 14px;
        }

.states-stat-card {
  --stat-accent: #64748b;
  background: linear-gradient(180deg, #fff, #fffdf9);
  border: 1px solid rgba(15,23,42,0.08);
  border-left: 4px solid var(--stat-accent);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 12px 26px -18px rgba(15,23,42,0.4);
}

.states-stat-card.primary,
.states-stat-card:has(.states-stat-badge.blue) { --stat-accent: #2563eb; }
.states-stat-card.success,
.states-stat-card:has(.states-stat-badge.green) { --stat-accent: #08a66c; }
.states-stat-card.danger,
.states-stat-card:has(.states-stat-badge.red) { --stat-accent: #ef4444; }
.states-stat-card.purple,
.states-stat-card:has(.states-stat-badge.purple) { --stat-accent: #7c3aed; }
.states-stat-card.orange,
.states-stat-card:has(.states-stat-badge.orange) { --stat-accent: #f59e0b; }
.states-stat-card:has(.states-stat-badge.slate) { --stat-accent: #64748b; }

        /* Interactive filter cards: selection must not change the card's outer size */
        .states-stat-card.interactive {
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          text-align: left;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

.states-stat-card.interactive:hover {
  border-color: rgba(8,166,108,0.35);
  border-left-color: var(--stat-accent);
}

.states-stat-card.interactive:focus-visible {
  outline: 2px solid rgba(8,166,108,0.45);
  outline-offset: 2px;
}

.states-stat-card.interactive.selected {
  border-color: #08a66c;
  border-left-color: var(--stat-accent);
  box-shadow: inset 0 0 0 2px rgba(8,166,108,0.25), 0 4px 12px rgba(15,23,42,0.03);
}

        .states-stat-info {
          display: grid;
          gap: 4px;
        }

        .states-stat-label {
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
        }

.states-stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: #0f172a;
}

.states-stat-card:has(.states-stat-badge.blue) .states-stat-value { color: #1d4ed8; }
.states-stat-card:has(.states-stat-badge.green) .states-stat-value { color: #078653; }
.states-stat-card:has(.states-stat-badge.red) .states-stat-value { color: #b91c1c; }
.states-stat-card:has(.states-stat-badge.purple) .states-stat-value { color: #6d28d9; }
.states-stat-card:has(.states-stat-badge.orange) .states-stat-value { color: #b45309; }
.states-stat-card:has(.states-stat-badge.slate) .states-stat-value { color: #334155; }

        .states-stat-badge {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .states-stat-badge.orange { background: rgba(255,107,44,0.12); color: #c94310; }
        .states-stat-badge.green { background: rgba(8,166,108,0.12); color: #078653; }
        .states-stat-badge.blue { background: rgba(37,99,235,0.12); color: #1d4ed8; }
        .states-stat-badge.slate { background: rgba(100,116,139,0.12); color: #475569; }

        /* Filter & Search Bar */
        .states-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 14px;
          padding: 14px 18px;
          box-shadow: 0 4px 12px rgba(15,23,42,0.03);
        }

        .states-search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 260px;
          max-width: 420px;
        }

        .states-search-box input {
          width: 100%;
          min-height: 40px;
          padding: 8px 36px 8px 14px;
          border: 1px solid rgba(15,23,42,0.14);
          border-radius: 10px;
          background: #f8fafc;
          color: #182230;
          font: inherit;
          font-size: 0.84rem;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .states-search-box input:focus {
          outline: none;
          border-color: #ff6b2c;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(255,107,44,0.12);
        }

        .search-clear-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: 0;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1rem;
          padding: 2px 6px;
        }

        .states-filter-pills {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-pill {
          border: 1px solid rgba(15,23,42,0.1);
          background: #f8fafc;
          color: #64748b;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .filter-pill.active {
          background: #101827;
          border-color: #101827;
          color: #fff;
        }

        .filter-pill-count {
          padding: 1px 6px;
          border-radius: 999px;
          background: rgba(255,255,255,0.2);
          font-size: 0.68rem;
        }

        .filter-pill:not(.active) .filter-pill-count {
          background: rgba(15,23,42,0.08);
          color: #334155;
        }

        /* Table Card */
        .states-table-card {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 16px;
          box-shadow: 0 12px 28px rgba(15,23,42,0.05);
          overflow: hidden;
        }

        .states-table-wrap {
          overflow-x: auto;
          width: 100%;
        }

        .states-table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.82rem;
        }

        .states-table th {
          background: #f8fafc;
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(15,23,42,0.08);
          white-space: nowrap;
        }

        .states-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          vertical-align: middle;
          color: #1e293b;
        }

        .states-table-row {
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .states-table-row:hover {
          background: #f0f7ff;
        }

        .state-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .state-avatar-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 0.85rem;
          font-weight: 800;
          background: linear-gradient(135deg, rgba(255,107,44,0.15), rgba(239,74,18,0.08));
          color: #c94310;
          border: 1px solid rgba(255,107,44,0.2);
          flex-shrink: 0;
        }

        .state-name-info {
          display: grid;
          gap: 2px;
        }

        .state-name-info strong {
          font-size: 0.92rem;
          color: #0f172a;
        }

        .state-name-info span {
          font-size: 0.72rem;
          color: #64748b;
        }

        .state-code-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #334155;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.78rem;
          font-weight: 800;
          border: 1px solid rgba(15,23,42,0.08);
        }

        .admin-pill {
          display: grid;
          gap: 2px;
        }

        .admin-pill strong {
          color: #1e293b;
          font-size: 0.82rem;
        }

        .admin-pill span {
          color: #64748b;
          font-size: 0.72rem;
        }

        .unassigned-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          background: #fff1f2;
          color: #be123c;
          font-size: 0.72rem;
          font-weight: 700;
          border: 1px solid #fecdd3;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: capitalize;
        }

        .status-pill.active {
          background: rgba(8,166,108,0.12);
          color: #078653;
          border: 1px solid rgba(8,166,108,0.24);
        }

        .status-pill.inactive {
          background: rgba(100,116,139,0.12);
          color: #475569;
          border: 1px solid rgba(100,116,139,0.2);
        }

        .status-pill.pending {
          background: rgba(245,158,11,0.12);
          color: #b45309;
          border: 1px solid rgba(245,158,11,0.25);
        }

        .status-pill.confirmed {
          background: rgba(37,99,235,0.12);
          color: #1d4ed8;
          border: 1px solid rgba(37,99,235,0.25);
        }

        .status-pill.completed {
          background: rgba(8,166,108,0.12);
          color: #078653;
          border: 1px solid rgba(8,166,108,0.25);
        }

        .status-pill.cancelled {
          background: rgba(239,68,68,0.12);
          color: #b91c1c;
          border: 1px solid rgba(239,68,68,0.25);
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .table-actions-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .action-btn {
          border: 1px solid rgba(15,23,42,0.1);
          background: #fff;
          color: #1e293b;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn.icon-action {
          display: inline-grid;
          width: 34px;
          height: 32px;
          padding: 0;
          place-items: center;
          font-size: 0.95rem;
        }

        .action-btn.icon-action:focus-visible {
          outline: 3px solid rgba(37,99,235,0.4);
          outline-offset: 2px;
        }

        .action-btn:hover {
          background: #f8fafc;
          border-color: rgba(15,23,42,0.2);
        }

        .action-btn.view {
          color: #2563eb;
          border-color: rgba(37,99,235,0.2);
          background: rgba(37,99,235,0.04);
        }

        .action-btn.view:hover {
          background: rgba(37,99,235,0.1);
        }

        .action-btn.edit {
          color: #0f172a;
        }

        .action-btn.toggle-deactivate {
          color: #b91c1c;
          border-color: rgba(239,68,68,0.2);
          background: rgba(239,68,68,0.04);
        }

        .action-btn.toggle-deactivate:hover {
          background: rgba(239,68,68,0.1);
        }

        .action-btn.toggle-activate {
          color: #078653;
          border-color: rgba(8,166,108,0.25);
          background: rgba(8,166,108,0.05);
        }

        .action-btn.toggle-activate:hover {
          background: rgba(8,166,108,0.12);
        }

        /* Empty State */
        .empty-states-panel {
          padding: 48px 20px;
          text-align: center;
          display: grid;
          gap: 12px;
          place-items: center;
        }

        .empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #f1f5f9;
          display: grid;
          place-items: center;
          font-size: 1.5rem;
          color: #64748b;
        }

        .empty-states-panel h4 {
          margin: 0;
          font-size: 1.1rem;
        }

        .empty-states-panel p {
          margin: 0;
          color: #64748b;
          font-size: 0.85rem;
          max-width: 360px;
        }

        /* Toast Alert */
        .states-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #101827;
          color: #fff;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 16px 36px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1100;
          animation: slideUp 0.25s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Modal Overlays */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 999;
          overflow-y: auto;
        }

        .modal-card {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 680px;
          box-shadow: 0 24px 50px rgba(15,23,42,0.25);
          overflow: hidden;
          display: grid;
          max-height: 90vh;
          grid-template-rows: auto 1fr auto;
          animation: modalPop 0.2s ease-out;
        }

        .modal-card.view-modal-card {
          max-width: 960px;
        }

        .modal-card.booking-detail-modal-card {
          max-width: 560px;
          z-index: 1050;
        }

        @keyframes modalPop {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(15,23,42,0.08);
          background: #f8fafc;
        }

        .modal-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-header-info h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(15,23,42,0.1);
          background: #fff;
          color: #64748b;
          display: grid;
          place-items: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          display: grid;
          gap: 20px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(15,23,42,0.08);
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        /* Form Styles */
        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-field {
          display: grid;
          gap: 6px;
        }

        .form-field label {
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #475569;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          min-height: 40px;
          padding: 8px 12px;
          border: 1px solid rgba(15,23,42,0.15);
          border-radius: 10px;
          background: #fff;
          color: #0f172a;
          font: inherit;
          font-size: 0.84rem;
          box-sizing: border-box;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #ff6b2c;
          box-shadow: 0 0 0 3px rgba(255,107,44,0.12);
        }

        .form-hint {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* View State Detailed Sections */
        .view-section {
          background: #f8fafc;
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 14px;
          padding: 18px 20px;
          display: grid;
          gap: 14px;
        }

        .view-section-title {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          padding-bottom: 8px;
          margin: 0;
        }

        /* State Bookings KPI Summary in View Modal */
        .state-bookings-kpi-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 12px;
        }

        .state-kpi-tile {
          --tile-accent: #64748b;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-left: 4px solid var(--tile-accent);
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 12px 26px -18px rgba(15,23,42,0.4);
          display: grid;
          gap: 6px;
        }

        .state-kpi-tile.primary { --tile-accent: var(--brand-orange); background: linear-gradient(180deg,#fff,#fffaf7); }
        .state-kpi-tile.amber { --tile-accent: #f59e0b; background: linear-gradient(180deg,#fff,#fffdf5); }
        .state-kpi-tile.blue { --tile-accent: #2563eb; background: linear-gradient(180deg,#fff,#f8faff); }
        .state-kpi-tile.green { --tile-accent: #08a66c; background: linear-gradient(180deg,#fff,#f6fdf9); }
        .state-kpi-tile.red { --tile-accent: #ef4444; background: linear-gradient(180deg,#fff,#fff8f8); }

        button.state-kpi-tile {
          width: 100%;
          text-align: left;
          font: inherit;
          color: inherit;
        }

        .state-kpi-tile.interactive {
          cursor: pointer;
          transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
        }

        .state-kpi-tile.interactive:hover {
          transform: translateY(-2px);
          border-color: rgba(15,23,42,0.16);
          box-shadow: 0 18px 30px -20px rgba(15,23,42,0.5);
        }

        .state-kpi-tile.interactive:focus-visible {
          outline: 3px solid rgba(255,107,44,0.4);
          outline-offset: 2px;
        }

        .state-kpi-tile.selected {
          border-color: var(--tile-accent);
          box-shadow: 0 0 0 2px rgba(255,107,44,0.18), 0 18px 30px -20px rgba(15,23,42,0.5);
        }

        .state-kpi-tile-value {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.1;
          color: #0f172a;
        }

        .state-kpi-tile.primary .state-kpi-tile-value { color: #c94310; }
        .state-kpi-tile.amber .state-kpi-tile-value { color: #b45309; }
        .state-kpi-tile.blue .state-kpi-tile-value { color: #1d4ed8; }
        .state-kpi-tile.green .state-kpi-tile-value { color: #078653; }
        .state-kpi-tile.red .state-kpi-tile-value { color: #b91c1c; }

        .state-kpi-tile-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.66rem;
          color: #64748b;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .state-kpi-tile-label::before {
          content: '';
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: var(--tile-accent);
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .detail-item {
          display: grid;
          gap: 3px;
        }

        .detail-label {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }

        .detail-value {
          font-size: 0.88rem;
          color: #0f172a;
          font-weight: 700;
        }

        .admin-card-view {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
          padding: 14px 16px;
        }

        .admin-view-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-avatar-lg {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0ea56f, #08a66c);
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 1rem;
        }

        .admin-details-text {
          display: grid;
          gap: 3px;
        }

        .admin-details-text strong {
          font-size: 0.95rem;
          color: #0f172a;
        }

        .admin-details-text span {
          font-size: 0.76rem;
          color: #64748b;
        }

        /* Bookings Section Toolbar */
        .bookings-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 12px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
        }

        .bookings-search-input {
          flex: 1;
          min-width: 220px;
          min-height: 38px;
          padding: 6px 12px;
          border: 1px solid rgba(15,23,42,0.14);
          border-radius: 8px;
          font: inherit;
          font-size: 0.82rem;
          color: #182230;
        }

        .bookings-search-input:focus {
          outline: none;
          border-color: #ff6b2c;
          box-shadow: 0 0 0 2px rgba(255,107,44,0.12);
        }

        .bookings-filter-select {
          min-height: 38px;
          padding: 6px 10px;
          border: 1px solid rgba(15,23,42,0.14);
          border-radius: 8px;
          background: #fff;
          font: inherit;
          font-size: 0.8rem;
          color: #182230;
        }

        .bookings-filter-date {
          min-height: 38px;
          padding: 6px 10px;
          border: 1px solid rgba(15,23,42,0.14);
          border-radius: 8px;
          background: #fff;
          font: inherit;
          font-size: 0.8rem;
          color: #182230;
        }

        /* Bookings Table */
        .bookings-table-wrap {
          overflow-x: auto;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 12px;
        }

        .bookings-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .bookings-table th {
          background: #f8fafc;
          color: #64748b;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(15,23,42,0.08);
          white-space: nowrap;
          text-align: left;
        }

        .bookings-table td {
          padding: 11px 12px;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          vertical-align: middle;
          color: #1e293b;
        }

        .bookings-table tr:hover {
          background: #f8faff;
        }

        .booking-id-tag {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 800;
          font-size: 0.76rem;
          color: #0f172a;
          background: #f1f5f9;
          padding: 3px 7px;
          border-radius: 5px;
          border: 1px solid rgba(15,23,42,0.08);
          display: inline-block;
        }

        .districts-pill-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }

        .district-tag {
          padding: 5px 10px;
          border-radius: 8px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          font-size: 0.76rem;
          font-weight: 700;
          color: #334155;
        }

        .users-breakdown-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .user-role-card {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          display: grid;
          gap: 4px;
        }

        .user-role-count {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .user-role-title {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
        }

        .activity-timeline {
          display: grid;
          gap: 10px;
        }

        .activity-timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 10px;
          padding: 10px 14px;
        }

        .activity-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .activity-dot.green { background: #08a66c; }
        .activity-dot.blue { background: #2563eb; }
        .activity-dot.orange { background: #f59e0b; }
        .activity-dot.slate { background: #64748b; }

        .activity-content {
          display: grid;
          gap: 3px;
          flex: 1;
        }

        .activity-content strong {
          font-size: 0.82rem;
          color: #1e293b;
        }

        .activity-meta {
          font-size: 0.72rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 8px;
        }`
