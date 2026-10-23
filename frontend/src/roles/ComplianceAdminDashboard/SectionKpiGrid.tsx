export type SectionKpiTone = 'green' | 'blue' | 'orange' | 'red'
export type SectionKpiBadgeTone = 'green' | 'blue' | 'amber' | 'red'

export type SectionKpiItem = {
  key: string
  label: string
  value: string
  badge: string
  badgeTone?: SectionKpiBadgeTone
  desc: string
  tone?: SectionKpiTone
  openLabel?: string
  active?: boolean
}

type SectionKpiGridProps = {
  items: SectionKpiItem[]
  onSelect?: (key: string) => void
}

/**
 * Section level KPI row. Mirrors the shared `sa-kpi-grid` / `sa-kpi-card`
 * pattern used by the other role dashboards so every console reads the same.
 * Cards become buttons when the section can drill into the metric.
 */
export function SectionKpiGrid({ items, onSelect }: SectionKpiGridProps) {
  return (
    <div className="sa-kpi-grid">
      {items.map((item) => {
        const body = (
          <>
            <div className="sa-kpi-top">
              <span className="sa-kpi-label">{item.label}</span>
              <span className={`sa-kpi-change ${item.badgeTone ?? ''}`.trim()}>{item.badge}</span>
            </div>
            <strong className="sa-kpi-value">{item.value}</strong>
            <span className="sa-kpi-desc">{item.desc}</span>
            {onSelect && <span className="sa-kpi-open">{item.openLabel ?? `Show ${item.label.toLowerCase()} →`}</span>}
          </>
        )

        if (!onSelect) {
          return (
            <div key={item.key} className={`sa-kpi-card ${item.tone ?? ''}`.trim()}>
              {body}
            </div>
          )
        }

        return (
          <button
            key={item.key}
            type="button"
            className={`sa-kpi-card ${item.tone ?? ''} ${item.active ? 'is-active' : ''}`.trim()}
            aria-label={`${item.label} — ${item.value}. ${item.openLabel ?? 'Show this metric'}`}
            aria-pressed={item.active}
            onClick={() => onSelect(item.key)}
          >
            {body}
          </button>
        )
      })}
    </div>
  )
}
