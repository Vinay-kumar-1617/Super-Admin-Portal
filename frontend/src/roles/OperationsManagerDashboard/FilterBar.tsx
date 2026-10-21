import DateRangePicker from './DateRangePicker'
import { emptyDateRange, type DateRange } from './dateRange'

export type FilterSelect = {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

type FilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  searchLabel?: string
  selects?: FilterSelect[]
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  dateLabel?: string
  resultLabel?: string
  onClear?: () => void
  children?: React.ReactNode
}

export const filterBarStyles = `
  .ops-filter-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin: 0 0 16px;
    padding: 12px 14px;
    border: 1px solid var(--sa-line);
    border-radius: 14px;
    background: #fbfcfd;
  }
  .ops-filter-search {
    flex: 1 1 220px;
    min-width: 180px;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    color: var(--sa-text);
    font: inherit;
    font-size: 0.82rem;
  }
  .ops-filter-select {
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    color: var(--sa-text);
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
  }
  .ops-filter-meta {
    font-size: 0.78rem;
    color: var(--sa-muted);
    white-space: nowrap;
  }
  .ops-filter-clear {
    border: 1px solid var(--sa-line);
    background: #fff;
    color: var(--sa-muted);
    border-radius: 10px;
    padding: 8px 12px;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }
  .ops-filter-clear:hover {
    color: var(--sa-text);
    border-color: var(--sa-line);
  }

  .ops-calendar { position: relative; }
  .ops-calendar-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid var(--sa-line);
    background: #fff;
    color: var(--sa-text);
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .ops-calendar-trigger svg { width: 15px; height: 15px; }
  .ops-calendar-trigger.open { border-color: var(--sa-brand); }
  .ops-calendar-trigger.active { color: var(--sa-brand-deep); border-color: rgba(255, 107, 44, 0.45); background: rgba(255, 107, 44, 0.06); }
  .ops-calendar-pop {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 40;
    width: 296px;
    padding: 12px;
    border-radius: 14px;
    border: 1px solid var(--sa-line);
    background: #fff;
    box-shadow: 0 18px 44px rgba(16, 24, 39, 0.16);
    display: grid;
    gap: 10px;
  }
  .ops-calendar-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .ops-calendar-presets .sa-chip { padding: 5px 10px; font-size: 0.72rem; }
  .ops-calendar-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ops-calendar-head strong { font-size: 0.84rem; color: var(--sa-text); }
  .ops-calendar-head .sa-btn-ghost { padding: 4px 10px; font-size: 0.9rem; }
  .ops-calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .ops-calendar-weekday {
    text-align: center;
    font-size: 0.64rem;
    font-weight: 800;
    color: var(--sa-muted);
    padding-bottom: 4px;
  }
  .ops-calendar-day {
    aspect-ratio: 1;
    border: 0;
    background: none;
    border-radius: 8px;
    font: inherit;
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--sa-text);
    cursor: pointer;
  }
  .ops-calendar-day:hover { background: #f3f6f7; }
  .ops-calendar-day.muted { color: #c2cad4; }
  .ops-calendar-day.today { box-shadow: inset 0 0 0 1px var(--sa-brand); color: var(--sa-brand-deep); }
  .ops-calendar-day.selected { background: var(--sa-brand); color: #fff; }
  .ops-calendar-day.pending { box-shadow: inset 0 0 0 2px var(--sa-brand); color: var(--sa-brand-deep); }
  .ops-calendar-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-top: 1px solid var(--sa-line);
    padding-top: 10px;
    font-size: 0.72rem;
    color: var(--sa-muted);
  }
  .ops-calendar-foot-actions { display: flex; gap: 6px; }
  .ops-calendar-foot-actions .sa-btn { padding: 6px 10px; font-size: 0.74rem; }
`

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  searchLabel = 'Search',
  selects = [],
  dateRange,
  onDateRangeChange,
  dateLabel = 'Date range',
  resultLabel,
  onClear,
  children,
}: FilterBarProps) {
  const hasFilters =
    search.trim() !== '' ||
    selects.some((select) => select.value !== 'all') ||
    Boolean(dateRange && (dateRange.from || dateRange.to))

  return (
    <div className="ops-filter-bar">
      <input
        className="ops-filter-search"
        aria-label={searchLabel}
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {selects.map((select) => (
        <select
          key={select.id}
          className="ops-filter-select"
          aria-label={select.label}
          value={select.value}
          onChange={(event) => select.onChange(event.target.value)}
        >
          {select.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {onDateRangeChange && (
        <DateRangePicker value={dateRange ?? emptyDateRange} onChange={onDateRangeChange} label={dateLabel} />
      )}

      {children}

      {resultLabel && <span className="ops-filter-meta">{resultLabel}</span>}

      {hasFilters && (
        <button
          type="button"
          className="ops-filter-clear"
          onClick={() => {
            onSearchChange('')
            selects.forEach((select) => select.onChange('all'))
            onDateRangeChange?.(emptyDateRange)
            onClear?.()
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
