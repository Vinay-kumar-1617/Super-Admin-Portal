import { useMemo, useState } from 'react';
import { StatusPill } from './shared';
import { zoneProfile } from './zoneAdminData';
import {
  zoneSummaryCards,
  zoneReportCatalog,
  zoneReportPeriods,
  zoneReportStatuses,
  applicationRows,
  occupancyRows,
  paymentRows,
  supportRows,
  slaRows,
  staffRows,
  transactionRows,
  maintenanceRows,
  dispatchRows,
  auditRows,
  zoneAggregates,
  type ZoneReportId,
} from './zoneReportsData';

const ZONE_SCOPE = zoneProfile.name;

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const round1 = (value: number) => Math.round(value * 10) / 10;
const isoDay = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return date.toISOString().slice(0, 10);
};
const sumBy = <T,>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((total, row) => total + pick(row), 0);
const weightedAvg = <T,>(rows: T[], value: (row: T) => number, weight: (row: T) => number) => {
  const totalWeight = rows.reduce((total, row) => total + weight(row), 0);
  if (totalWeight === 0) return 0;
  return rows.reduce((total, row) => total + value(row) * weight(row), 0) / totalWeight;
};
const groupRows = <T,>(rows: T[], keyFn: (row: T) => string) => {
  const map = new Map<string, T[]>();
  rows.forEach((row) => {
    const key = keyFn(row);
    const list = map.get(key);
    if (list) list.push(row);
    else map.set(key, [row]);
  });
  return [...map.values()];
};

const downloadCsv = (filename: string, rows: Array<Array<string | number>>) => {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const exportPdf = (title: string, subtitle: string, columns: string[], rows: Array<Array<string | number>>) => {
  const win = window.open('', '_blank', 'width=1024,height=768');
  if (!win) return;
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`)
    .join('');
  win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1f2937; padding: 24px; }
      h1 { font-size: 18px; margin: 0 0 4px; }
      p.meta { color: #6b7280; font-size: 12px; margin: 0 0 16px; }
      table { border-collapse: collapse; width: 100%; font-size: 12px; }
      th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
      th { background: #f3f4f6; font-weight: 700; }
      tr:nth-child(even) td { background: #fafafa; }
    </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">${escapeHtml(subtitle)}</p>
    <table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
    <tbody>${body}</tbody></table>
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
};

const reportsStyles = `
  .za-reports-intro {
    border: 1px solid var(--sa-line);
    border-left: 4px solid var(--sa-brand);
    border-radius: 16px;
    padding: 16px 20px;
    background: #fffaf3;
    display: grid;
    gap: 8px;
  }
  .za-reports-intro strong {
    font-size: 0.9rem;
    color: var(--sa-brand-deep);
  }
  .za-reports-intro p {
    margin: 0;
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.6;
  }
  .za-kpi-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 10px;
  }
  .za-kpi-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 8px;
  }
  .za-kpi-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .za-kpi-label {
    margin: 0;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--sa-muted);
  }
  .za-kpi-value {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--sa-text);
  }
  .za-kpi-change {
    font-size: 0.7rem;
    font-weight: 800;
  }
  .za-kpi-change.up { color: var(--sa-green); }
  .za-kpi-change.down { color: var(--sa-red); }
  .za-kpi-change.flat { color: var(--sa-muted); }
  .za-kpi-sub {
    margin: 0;
    font-size: 0.76rem;
    color: var(--sa-muted);
    line-height: 1.5;
  }
  .za-cat-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 20px;
  }
  .za-cat-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 10px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .za-cat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
    border-color: rgba(255, 107, 44, 0.45);
  }
  .za-cat-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .za-cat-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #f3f6f7;
    flex-shrink: 0;
  }
  .za-cat-icon svg { width: 16px; height: 16px; }
  .za-cat-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--sa-text);
  }
  .za-cat-desc {
    margin: 0;
    font-size: 0.78rem;
    color: var(--sa-muted);
    line-height: 1.5;
  }
  .za-filter-bar {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 14px 18px;
    background: #fbfcfd;
    display: grid;
    gap: 12px;
    margin-top: 20px;
  }
  .za-filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .za-filter-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--sa-muted);
    flex-shrink: 0;
  }
  .za-detail {
    margin-top: 20px;
    display: grid;
    gap: 16px;
  }
  .za-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .za-detail-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .za-detail-title h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .za-detail-sub {
    margin: 0;
    font-size: 0.78rem;
    color: var(--sa-muted);
  }
  .za-export-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .za-charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 12px;
  }
  .za-chart-card {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    padding: 16px 18px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
    display: grid;
    gap: 12px;
  }
  .za-chart-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .za-chart-title {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--sa-muted);
  }
  .za-chart-wrap {
    position: relative;
    height: 160px;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding-bottom: 24px;
  }
  .za-bar {
    flex: 1;
    border-radius: 6px 6px 0 0;
    background: linear-gradient(180deg, var(--sa-brand), rgba(255, 107, 44, 0.55));
    min-height: 12px;
    position: relative;
  }
  .za-bar-label {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.68rem;
    color: var(--sa-muted);
    white-space: nowrap;
  }
  .za-bar-value {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .za-donut {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: conic-gradient(
      var(--sa-green) 0deg 120deg,
      var(--sa-blue) 120deg 240deg,
      #eef2f5 240deg 360deg
    );
    display: grid;
    place-items: center;
    margin: 0 auto;
  }
  .za-donut-center {
    display: grid;
    place-items: center;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  }
  .za-donut-value {
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--sa-text);
  }
  .za-donut-sub {
    font-size: 0.62rem;
    color: var(--sa-muted);
  }
  .za-breakdown {
    border: 1px solid var(--sa-line);
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  }
  .za-breakdown-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    background: #fbfcfd;
  }
  .za-breakdown-title {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--sa-muted);
  }
  .za-breakdown-meta {
    font-size: 0.74rem;
    color: var(--sa-muted);
    font-weight: 700;
  }
  .za-table-wrap { overflow-x: auto; }
  .za-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 720px;
    font-size: 0.82rem;
  }
  .za-table th {
    text-align: left;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sa-muted);
    padding: 12px 16px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    background: #fbfcfd;
    white-space: nowrap;
  }
  .za-table td {
    padding: 11px 16px;
    vertical-align: middle;
    color: var(--sa-text);
    border-bottom: 1px solid rgba(15, 23, 42, 0.06);
    white-space: nowrap;
  }
  .za-table tr:last-child td { border-bottom: 0; }
  .za-table tr:hover td { background: #f8fafc; }
  .za-table .sa-cell-strong { font-weight: 800; color: var(--sa-text); }
  .za-empty {
    padding: 36px 18px;
    text-align: center;
    display: grid;
    gap: 12px;
    justify-items: center;
    color: var(--sa-muted);
  }
  @media (max-width: 720px) {
    .za-kpi-grid { grid-template-columns: 1fr; }
    .za-cat-grid { grid-template-columns: 1fr; }
    .za-charts { grid-template-columns: 1fr; }
    .za-table { font-size: 0.78rem; }
    .za-table th, .za-table td { padding: 8px 12px; }
  }
`;

const categoryIcons: Record<string, string> = {
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="17" width="15" height="5"/><path d="M3 17h6l2 4h8l2-4H13a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1z"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/></svg>`,
  rupee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 14l7-3v-7l-7 3zM12 14l-7 3v7l7-3zM4 14h16M4 10h16"/></svg>`,
  headset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2v10c0 7 4 10 10 10M3 2l4 4M17 2l-4 4M3 12h4M17 12h-4"/><path d="M22 12c0 4.71-3.48 9-8 9s-8-4.29-8-9M13 17h-1M11 17h-1"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  receipt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1V2z"/></svg>`,
  wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1 0 8.49l-3.76 3.76z"/></svg>`,
  route: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 10v6M17 6l-5 5 5 5M9 13l-5-5 5-5M4 14h3M19 14h-3M5 19h1"/></svg>`,
  badge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>`,
};

const reportMeta: Record<ZoneReportId, { title: string; sub: string; columns: string[] }> = {
  bookings: { title: 'Rental Applications', sub: 'Booking volume, status and approval trends by locality · Madhapur zone', columns: ['Locality', 'Submitted', 'Approved', 'Rejected', 'Avg approval (h)'] },
  occupancy: { title: 'Vehicle Performance', sub: 'Machine availability, utilization and performance by locality · Madhapur zone', columns: ['Locality', 'Area', 'Total', 'Occupied', 'Available', 'Utilization'] },
  collections: { title: 'Revenue & Payments', sub: 'Revenue collected, outstanding balances and payouts by locality · Madhapur zone', columns: ['Locality', 'Collected', 'Outstanding', 'Invoices', 'Collection rate'] },
  support: { title: 'Customer Support', sub: 'Maintenance, incident and refund requests by type · Madhapur zone', columns: ['Request type', 'Tickets', 'Resolved', 'Reopened', 'Avg response', 'Avg resolution', 'Resolution rate'] },
  sla: { title: 'SLA & Escalations', sub: 'First-response and resolution SLA compliance by locality · Madhapur zone', columns: ['Locality', 'Tickets', 'Met first response', 'Met resolution', 'Avg response', 'Compliance'] },
  transactions: { title: 'Rental Transactions', sub: 'Detailed rental transaction ledger by locality · Madhapur zone', columns: ['Booking ID', 'Date', 'Customer', 'Locality', 'Machine', 'Operator', 'Amount', 'Status', 'Payment'] },
  maintenance: { title: 'Maintenance', sub: 'Machine maintenance requests, service history and costs · Madhapur zone', columns: ['Request ID', 'Date', 'Machine', 'Locality', 'Type', 'Cost', 'Status'] },
  dispatch: { title: 'Dispatch Operations', sub: 'Job assignments, dispatch SLAs and fleet movement by locality · Madhapur zone', columns: ['Job ID', 'Date', 'Locality', 'Machine', 'Operator', 'Assigned at', 'Status'] },
  staff: { title: 'Staff Performance', sub: 'Operator and zone staff activity, jobs and ratings · Madhapur zone', columns: ['Staff', 'Role', 'Locality', 'Jobs', 'Rating', 'Status'] },
  audit: { title: 'Audit Activity', sub: 'Admin actions, access attempts and audit trail · Madhapur zone', columns: ['Audit ID', 'Date', 'Actor', 'Role', 'Action', 'Target', 'Zone'] },
};

type TableData = Record<string, string | number>[];

type DetailView = {
  columns: string[];
  rows: TableData;
  totals: Record<string, string | number>;
  chart: { labels: string[]; values: number[] };
  note: string;
};

function buildBookings(from: string, to: string): DetailView {
  const rows = applicationRows.filter((row) => row.date >= from && row.date <= to);
  const grouped = groupRows(rows, (row) => row.locality)
    .map((list) => ({
      locality: list[0].locality,
      submitted: sumBy(list, (r) => r.submitted),
      approved: sumBy(list, (r) => r.approved),
      rejected: sumBy(list, (r) => r.rejected),
      avgHrs: round1(weightedAvg(list, (r) => r.avgApprovalHrs, (r) => r.submitted)),
    }))
    .sort((a, b) => b.submitted - a.submitted);
  return {
    columns: reportMeta.bookings.columns,
    rows: grouped.map((row) => ({
      Locality: row.locality,
      Submitted: row.submitted,
      Approved: row.approved,
      Rejected: row.rejected,
      'Avg approval (h)': row.avgHrs,
    })),
    totals: {
      Locality: 'Total',
      Submitted: sumBy(applicationRows, (r) => r.submitted),
      Approved: sumBy(applicationRows, (r) => r.approved),
      Rejected: sumBy(applicationRows, (r) => r.rejected),
      'Avg approval (h)': round1(weightedAvg(applicationRows, (r) => r.avgApprovalHrs, (r) => r.submitted)),
    },
    chart: { labels: grouped.map((r) => r.locality), values: grouped.map((r) => r.submitted) },
    note: `Bookings limited to ${ZONE_SCOPE} zone localities only. Cross-zone data is hidden by role-based access.`,
  };
}

function buildOccupancy(): DetailView {
  const grouped = occupancyRows
    .map((row) => ({ ...row, pct: Math.round((row.occupied / row.total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
  return {
    columns: reportMeta.occupancy.columns,
    rows: grouped.map((row) => ({
      Locality: row.locality,
      Area: row.area,
      Total: row.total,
      Occupied: row.occupied,
      Available: row.available,
      Utilization: `${row.pct}%`,
    })),
    totals: {
      Locality: 'Total',
      Total: sumBy(occupancyRows, (r) => r.total),
      Occupied: sumBy(occupancyRows, (r) => r.occupied),
      Available: sumBy(occupancyRows, (r) => r.available),
      Utilization: `${Math.round((sumBy(occupancyRows, (r) => r.occupied) / sumBy(occupancyRows, (r) => r.total)) * 100)}%`,
    },
    chart: { labels: grouped.map((r) => r.locality), values: grouped.map((r) => r.pct) },
    note: `Fleet utilization limited to ${ZONE_SCOPE} zone localities only.`,
  };
}

function buildCollections(from: string, to: string): DetailView {
  const rows = paymentRows.filter((row) => row.date >= from && row.date <= to);
  const grouped = groupRows(rows, (row) => row.locality)
    .map((list) => ({
      locality: list[0].locality,
      collected: sumBy(list, (r) => r.collected),
      outstanding: sumBy(list, (r) => r.outstanding),
      invoices: sumBy(list, (r) => r.invoices),
    }))
    .sort((a, b) => b.collected - a.collected);
  return {
    columns: reportMeta.collections.columns,
    rows: grouped.map((row) => ({
      Locality: row.locality,
      Collected: inr(row.collected),
      Outstanding: inr(row.outstanding),
      Invoices: row.invoices,
      'Collection rate': `${row.collected + row.outstanding ? Math.round((row.collected / (row.collected + row.outstanding)) * 100) : 0}%`,
    })),
    totals: {
      Locality: 'Total',
      Collected: inr(sumBy(paymentRows, (r) => r.collected)),
      Outstanding: inr(sumBy(paymentRows, (r) => r.outstanding)),
      Invoices: sumBy(paymentRows, (r) => r.invoices),
      'Collection rate': `${zoneAggregates.totalRevenue + zoneAggregates.totalOutstanding ? Math.round((zoneAggregates.totalRevenue / (zoneAggregates.totalRevenue + zoneAggregates.totalOutstanding)) * 100) : 0}%`,
    },
    chart: { labels: grouped.map((r) => r.locality), values: grouped.map((r) => r.collected) },
    note: `Payments and collections limited to ${ZONE_SCOPE} zone localities only.`,
  };
}

function buildSupport(from: string, to: string): DetailView {
  const rows = supportRows.filter((row) => row.date >= from && row.date <= to);
  const grouped = groupRows(rows, (row) => row.type)
    .map((list) => {
      const tickets = sumBy(list, (r) => r.tickets);
      const resolved = sumBy(list, (r) => r.resolved);
      return {
        type: list[0].type,
        tickets,
        resolved,
        reopened: sumBy(list, (r) => r.reopened),
        response: Math.round(weightedAvg(list, (r) => r.avgResponseMins, (r) => r.tickets)),
        resolution: round1(weightedAvg(list, (r) => r.avgResolutionHrs, (r) => r.tickets)),
        rate: tickets ? Math.round((resolved / tickets) * 100) : 0,
      };
    })
    .sort((a, b) => b.tickets - a.tickets);
  return {
    columns: reportMeta.support.columns,
    rows: grouped.map((row) => ({
      'Request type': row.type,
      Tickets: row.tickets,
      Resolved: row.resolved,
      Reopened: row.reopened,
      'Avg response': `${row.response} min`,
      'Avg resolution': `${row.resolution} h`,
      'Resolution rate': `${row.rate}%`,
    })),
    totals: {
      'Request type': 'Total',
      Tickets: sumBy(supportRows, (r) => r.tickets),
      Resolved: sumBy(supportRows, (r) => r.resolved),
      Reopened: sumBy(supportRows, (r) => r.reopened),
      'Avg response': `${Math.round(weightedAvg(supportRows, (r) => r.avgResponseMins, (r) => r.tickets))} min`,
      'Avg resolution': `${round1(weightedAvg(supportRows, (r) => r.avgResolutionHrs, (r) => r.tickets))} h`,
      'Resolution rate': `${zoneAggregates.totalTickets ? Math.round((zoneAggregates.totalResolved / zoneAggregates.totalTickets) * 100) : 0}%`,
    },
    chart: { labels: grouped.map((r) => r.type), values: grouped.map((r) => r.tickets) },
    note: `Support tickets limited to ${ZONE_SCOPE} zone only.`,
  };
}

function buildSla(): DetailView {
  const sorted = [...slaRows].sort((a, b) => b.compliancePct - a.compliancePct);
  return {
    columns: reportMeta.sla.columns,
    rows: sorted.map((row) => ({
      Locality: row.locality,
      Tickets: row.tickets,
      'Met first response': row.metFirstResponse,
      'Met resolution': row.metResolution,
      'Avg response': `${row.avgResponseMins} min`,
      Compliance: `${row.compliancePct}%`,
    })),
    totals: {
      Locality: 'Total',
      Tickets: sumBy(slaRows, (r) => r.tickets),
      'Met first response': sumBy(slaRows, (r) => r.metFirstResponse),
      'Met resolution': sumBy(slaRows, (r) => r.metResolution),
      'Avg response': `${Math.round(sumBy(slaRows, (r) => r.avgResponseMins) / slaRows.length)} min`,
      Compliance: `${Math.round(sumBy(slaRows, (r) => r.compliancePct) / slaRows.length)}%`,
    },
    chart: { labels: sorted.map((r) => r.locality), values: sorted.map((r) => r.compliancePct) },
    note: `SLA compliance limited to ${ZONE_SCOPE} zone localities only.`,
  };
}

function buildTransactions(): DetailView {
  return {
    columns: reportMeta.transactions.columns,
    rows: transactionRows.map((row) => ({
      'Booking ID': row.id,
      Date: row.date,
      Customer: row.customer,
      Locality: row.locality,
      Machine: row.machine,
      Operator: row.operator,
      Amount: row.amount,
      Status: row.status,
      Payment: row.paymentStatus,
    })),
    totals: {
      'Booking ID': 'Total',
      Amount: inr(sumBy(transactionRows, (r) => Number(r.amount.replace(/[^0-9]/g, '')) || 0)),
    },
    chart: {
      labels: transactionRows.map((r) => r.id),
      values: transactionRows.map((r) => Number(r.amount.replace(/[^0-9]/g, '')) || 0),
    },
    note: `Rental transactions limited to ${ZONE_SCOPE} zone localities only.`,
  };
}

function buildMaintenance(): DetailView {
  return {
    columns: reportMeta.maintenance.columns,
    rows: maintenanceRows.map((row) => ({
      'Request ID': row.id,
      Date: row.date,
      Machine: row.machine,
      Locality: row.locality,
      Type: row.type,
      Cost: row.cost,
      Status: row.status,
    })),
    totals: {
      'Request ID': 'Total',
      Cost: inr(sumBy(maintenanceRows, (r) => Number(r.cost.replace(/[^0-9]/g, '')) || 0)),
    },
    chart: {
      labels: maintenanceRows.map((r) => r.id),
      values: maintenanceRows.map((r) => Number(r.cost.replace(/[^0-9]/g, '')) || 0),
    },
    note: `Maintenance requests limited to ${ZONE_SCOPE} zone machines only.`,
  };
}

function buildDispatch(): DetailView {
  return {
    columns: reportMeta.dispatch.columns,
    rows: dispatchRows.map((row) => ({
      'Job ID': row.jobId,
      Date: row.date,
      Locality: row.locality,
      Machine: row.machine,
      Operator: row.operator,
      'Assigned at': row.assignedAt,
      Status: row.status,
    })),
    totals: { 'Job ID': 'Total' },
    chart: {
      labels: dispatchRows.map((r) => r.jobId),
      values: dispatchRows.map(() => 1),
    },
    note: `Dispatch operations limited to ${ZONE_SCOPE} zone localities only.`,
  };
}

function buildStaff(statusFilter: string): DetailView {
  return {
    columns: reportMeta.staff.columns,
    rows: staffRows
      .map((row) => ({
        Staff: row.name,
        Role: row.role,
        Locality: row.locality,
        Jobs: row.jobs,
        Rating: row.rating,
        Status: row.status,
      }))
      .filter((row) => statusFilter === 'all' || String(row.Status).toLowerCase() === statusFilter),
    totals: {
      Staff: 'Total',
      Jobs: sumBy(staffRows, (r) => r.jobs),
      Rating: round1(weightedAvg(staffRows, (r) => r.rating, (r) => r.jobs)),
    },
    chart: { labels: staffRows.map((r) => r.name), values: staffRows.map((r) => r.jobs) },
    note: `Staff performance limited to ${ZONE_SCOPE} zone staff only. Super Admin accounts are excluded.`,
  };
}

function buildAudit(): DetailView {
  return {
    columns: reportMeta.audit.columns,
    rows: auditRows.map((row) => ({
      'Audit ID': row.id,
      Date: row.date,
      Actor: row.actor,
      Role: row.role,
      Action: row.action,
      Target: row.target,
      Zone: row.zone,
    })),
    totals: { 'Audit ID': 'Total' },
    chart: { labels: auditRows.map((r) => r.id), values: auditRows.map(() => 1) },
    note: `Audit trail limited to ${ZONE_SCOPE} zone admin actions only. Cross-state and Super Admin actions are not visible.`,
  };
}

export default function ReportsSection({ onToast }: { onToast?: (message: string) => void }) {
  const [activeReport, setActiveReport] = useState<ZoneReportId>('bookings');
  const [periodId, setPeriodId] = useState('30');
  const [from, setFrom] = useState(isoDay(29));
  const [to, setTo] = useState(isoDay(0));
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const applyPeriod = (id: string) => {
    setPeriodId(id);
    const preset = zoneReportPeriods.find((item) => item.id === id);
    const days = preset ? preset.days : 30;
    setFrom(isoDay(days - 1));
    setTo(isoDay(0));
  };

  const activeCategory = zoneReportCatalog.find((item) => item.id === activeReport) ?? zoneReportCatalog[0];

  const detailView: DetailView = useMemo(() => {
    const matchesSearch = (row: TableData[number]) =>
      Object.values(row).some((cell) => String(cell).toLowerCase().includes(searchQuery.trim().toLowerCase()));
    const matchesStatus = (row: TableData[number]) => {
      if (statusFilter === 'all') return true;
      const status = String(row.status ?? '').toLowerCase();
      return status === statusFilter.toLowerCase();
    };

    let base: DetailView;
    switch (activeReport) {
      case 'bookings': base = buildBookings(from, to); break;
      case 'occupancy': base = buildOccupancy(); break;
      case 'collections': base = buildCollections(from, to); break;
      case 'support': base = buildSupport(from, to); break;
      case 'sla': base = buildSla(); break;
      case 'transactions': base = buildTransactions(); break;
      case 'maintenance': base = buildMaintenance(); break;
      case 'dispatch': base = buildDispatch(); break;
      case 'staff': base = buildStaff(statusFilter); break;
      case 'audit': base = buildAudit(); break;
    }
    let rows = base.rows;
    if (searchQuery) rows = rows.filter(matchesSearch);
    if (statusFilter !== 'all') rows = rows.filter(matchesStatus);
    return { ...base, rows };
  }, [activeReport, from, to, statusFilter, searchQuery]);

  const maxBar = Math.max(...detailView.chart.values, 1);
  const rangeLabel = `${from} to ${to}`;
  const fileBase = `zone_${activeReport}_${from}_to_${to}`;

  const handleCsv = () => {
    const csv = [
      [`${activeCategory.label} · ${rangeLabel} · ${ZONE_SCOPE} zone`],
      [],
      detailView.columns,
      ...detailView.rows.map((row) => detailView.columns.map((col) => row[col])),
    ];
    downloadCsv(`${fileBase}.csv`, csv);
    onToast?.(`CSV exported · ${activeCategory.label} (${ZONE_SCOPE} zone)`);
  };

  const handleExcel = () => {
    const csv = [
      [`${activeCategory.label} · ${rangeLabel} · ${ZONE_SCOPE} zone`],
      [],
      detailView.columns,
      ...detailView.rows.map((row) => detailView.columns.map((col) => row[col])),
    ];
    downloadCsv(`${fileBase}.xlsx`, csv);
    onToast?.(`Excel export prepared · ${activeCategory.label} (${ZONE_SCOPE} zone)`);
  };

  const handlePdf = () => {
    exportPdf(
      `${activeCategory.label} report`,
      `${zoneProfile.name}, ${zoneProfile.city} · ${rangeLabel} · Generated by ${zoneProfile.adminName} (Zone Admin) · Zone: ${ZONE_SCOPE}`,
      detailView.columns,
      detailView.rows.map((row) => detailView.columns.map((col) => row[col])),
    );
    onToast?.(`PDF export opened · ${activeCategory.label} (${ZONE_SCOPE} zone)`);
  };

  return (
    <section className="sa-panel">
      <style>{reportsStyles}</style>

      <div className="sa-panel-header">
        <div>
          <h3>Reports &amp; analytics</h3>
          <span className="sa-panel-sub">
            Zone-scoped reporting for {zoneProfile.name} · Role-based access enforced · All data restricted to {ZONE_SCOPE} zone
          </span>
        </div>
        <span className="sa-pill green">Authorized · {ZONE_SCOPE} zone only</span>
      </div>

      <div className="za-reports-intro">
        <strong>Your reporting authority is zone-scoped.</strong>
        <p>As the {zoneProfile.name} Zone Admin, you can view reports and export data only for your assigned zone ({ZONE_SCOPE} · {zoneProfile.city}, {zoneProfile.state}). Data from other zones, cities and states is hidden and every access is logged in the audit trail.</p>
      </div>

      <div className="za-kpi-grid">
        {zoneSummaryCards.map((card) => (
          <div key={card.id} className="za-kpi-card">
            <div className="za-kpi-head">
              <span className="za-kpi-label">{card.label}</span>
              <span className={`za-kpi-change ${card.change.startsWith('+') ? 'up' : card.change.startsWith('-') ? 'down' : 'flat'}`}>
                {card.change}
              </span>
            </div>
            <strong className="za-kpi-value">{card.value}</strong>
            <p className="za-kpi-sub">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="za-cat-grid">
        {zoneReportCatalog.map((category) => (
          <div key={category.id} className="za-cat-card" onClick={() => setActiveReport(category.id)}>
            <div className="za-cat-head">
              <div className="za-cat-icon" dangerouslySetInnerHTML={{ __html: categoryIcons[category.icon] ?? categoryIcons.shield }} />
              <div>
                <h4 className="za-cat-title">{category.label}</h4>
                <p className="za-cat-desc">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="za-filter-bar">
        <div className="za-filter-row">
          <span className="za-filter-label">Period</span>
          {zoneReportPeriods.map((preset) => (
            <button key={preset.id} type="button" className={`sa-chip ${periodId === preset.id ? 'active orange' : ''}`} onClick={() => applyPeriod(preset.id)}>
              {preset.label}
            </button>
          ))}
          <span className="za-filter-label">Range</span>
          <input className="sa-date" type="date" aria-label="Report from date" value={from} max={to} onChange={(event) => { setFrom(event.target.value); setPeriodId('custom'); }} />
          <span className="za-filter-label">to</span>
          <input className="sa-date" type="date" aria-label="Report to date" value={to} min={from} onChange={(event) => { setTo(event.target.value); setPeriodId('custom'); }} />
        </div>
        <div className="za-filter-row">
          <span className="za-filter-label">Status</span>
          {zoneReportStatuses.map((status) => (
            <button key={status.id} type="button" className={`sa-chip ${statusFilter === status.id ? 'active orange' : ''}`} onClick={() => setStatusFilter(status.id)}>
              {status.label}
            </button>
          ))}
          <span className="za-filter-label">Search</span>
          <input className="sa-input" aria-label="Search report table" placeholder="Search locality, ID, customer, machine..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        </div>
      </div>

      <div className="za-detail">
        <div className="za-detail-header">
          <div className="za-detail-title">
            <h3>{activeCategory.label}</h3>
            <p className="za-detail-sub">{activeCategory.description}</p>
          </div>
          <div className="za-export-group">
            <button type="button" className="sa-btn-ghost" onClick={handleCsv}>Export CSV</button>
            <button type="button" className="sa-btn-ghost" onClick={handleExcel}>Export Excel</button>
            <button type="button" className="sa-btn primary" onClick={handlePdf}>Export PDF</button>
          </div>
        </div>

        <div className="za-charts">
          <div className="za-chart-card">
            <div className="za-chart-head">
              <span className="za-chart-title">Volume by category</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--sa-muted)' }}>{detailView.rows.length} records</span>
            </div>
            <div className="za-chart-wrap">
              {detailView.chart.labels.map((label, index) => {
                const value = detailView.chart.values[index];
                const pct = maxBar ? (value / maxBar) * 100 : 0;
                return (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div className="za-bar" style={{ height: `${pct}%` }} title={`${label}: ${value}`}>
                      <span className="za-bar-value">{value}</span>
                    </div>
                    <span className="za-bar-label">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="za-chart-card">
            <div className="za-chart-head">
              <span className="za-chart-title">Distribution</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--sa-muted)' }}>{rangeLabel}</span>
            </div>
            <div className="za-donut">
              <div className="za-donut-center">
                <div>
                  <div className="za-donut-value">{detailView.rows.length}</div>
                  <div className="za-donut-sub">records</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="za-breakdown">
          <div className="za-breakdown-head">
            <span className="za-breakdown-title">Totals</span>
            <span className="za-breakdown-meta">{rangeLabel} · {ZONE_SCOPE} zone</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', padding: '14px 18px' }}>
            {Object.entries(detailView.totals).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--sa-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{key}</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--sa-text)' }}>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="za-breakdown">
          <div className="za-breakdown-head">
            <span className="za-breakdown-title">Breakdown</span>
            <span className="za-breakdown-meta">{detailView.rows.length} record{detailView.rows.length === 1 ? '' : 's'}</span>
          </div>
          <div className="za-table-wrap">
            {detailView.rows.length === 0 ? (
              <div className="za-empty">
                <p>No records match the current filters.</p>
                <button type="button" className="sa-btn-ghost" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>Reset filters</button>
              </div>
            ) : (
              <table className="za-table" role="grid" aria-label={`${activeCategory.label} breakdown · ${ZONE_SCOPE} zone`}>
                <thead>
                  <tr>{detailView.columns.map((column) => <th key={column}>{column}</th>)}</tr>
                </thead>
                <tbody>
                  {detailView.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {detailView.columns.map((col, cellIndex) => {
                        const cellValue = row[col];
                        const isStatus = col === 'Status' || col === 'Payment';
                        return (
                          <td key={cellIndex} className={cellIndex === 0 ? 'sa-cell-strong' : undefined}>
                            {isStatus ? <StatusPill status={String(cellValue)} /> : cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--sa-muted)' }}>{detailView.note}</p>
      </div>
    </section>
  );
}
