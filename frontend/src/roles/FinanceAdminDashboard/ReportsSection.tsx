import { reportCards } from './financeAdminData'

type ReportsSectionProps = {
  onExport: (title: string, format: string) => void
}

export default function ReportsSection({ onExport }: ReportsSectionProps) {
  return (
    <section className="sa-panel">
      <div className="sa-panel-header">
        <h3>Finance reports</h3>
        <span className="sa-panel-sub">Revenue, commission, payout and reconciliation</span>
      </div>
      <div className="sa-report-grid">
        {reportCards.map((report) => (
          <article key={report.id} className="sa-report-card">
            <h4>{report.title}</h4>
            <p>{report.description}</p>
            <div className="sa-chip-row">
              {report.formats.map((format) => (
                <button
                  key={format}
                  type="button"
                  className="sa-chip"
                  onClick={() => onExport(report.title, format)}
                >
                  Export {format}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
