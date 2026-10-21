import { useEffect, useMemo, useRef, useState } from 'react'
import {
  emptyDateRange,
  formatDay,
  formatRangeLabel,
  isoDaysAgo,
  parseIso,
  rangePresets,
  toIso,
  type DateRange,
} from './dateRange'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

type DateRangePickerProps = {
  value: DateRange
  onChange: (range: DateRange) => void
  label?: string
  presets?: Array<{ id: string; label: string; days: number }>
}

export default function DateRangePicker({ value, onChange, label = 'Date range', presets = rangePresets }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value.from ? parseIso(value.from) : new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [pendingStart, setPendingStart] = useState<string>('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const toggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // Flip the popover to the left of the trigger when it would run off screen.
      setAlignRight(rect.right + 312 > window.innerWidth - 16)
    }
    setOpen((prev) => !prev)
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const days = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
    const offset = (first.getDay() + 6) % 7
    const start = new Date(first)
    start.setDate(first.getDate() - offset)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        iso: toIso(date),
        day: date.getDate(),
        inMonth: date.getMonth() === viewMonth.getMonth(),
        isToday: toIso(new Date()) === toIso(date),
      }
    })
  }, [viewMonth])

  const applyPreset = (daysBack: number) => {
    const to = isoDaysAgo(0)
    const from = isoDaysAgo(daysBack - 1)
    onChange({ from, to })
    setPendingStart('')
    setOpen(false)
  }

  const pickDay = (iso: string) => {
    if (!pendingStart) {
      setPendingStart(iso)
      onChange({ from: iso, to: iso })
      return
    }
    if (iso < pendingStart) {
      setPendingStart(iso)
      onChange({ from: iso, to: pendingStart })
      return
    }
    onChange({ from: pendingStart, to: iso })
    setPendingStart('')
  }

  const shiftMonth = (delta: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const inRange = (iso: string) => {
    if (!value.from) return false
    if (value.from === value.to) return iso === value.from
    return iso >= value.from && iso <= value.to
  }

  return (
    <div className="ops-calendar" ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`ops-calendar-trigger ${open ? 'open' : ''} ${value.from ? 'active' : ''}`}
        aria-label={label}
        aria-expanded={open}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{formatRangeLabel(value)}</span>
      </button>

      {open && (
        <div
          className="ops-calendar-pop"
          role="dialog"
          aria-label={label}
          style={alignRight ? { right: 0, left: 'auto' } : undefined}
        >
          <div className="ops-calendar-presets">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="sa-chip"
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="ops-calendar-head">
            <button type="button" className="sa-btn-ghost" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
              ‹
            </button>
            <strong>
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </strong>
            <button type="button" className="sa-btn-ghost" aria-label="Next month" onClick={() => shiftMonth(1)}>
              ›
            </button>
          </div>

          <div className="ops-calendar-grid">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="ops-calendar-weekday">
                {weekday}
              </span>
            ))}
            {days.map((day) => (
              <button
                key={day.iso}
                type="button"
                className={[
                  'ops-calendar-day',
                  day.inMonth ? '' : 'muted',
                  day.isToday ? 'today' : '',
                  inRange(day.iso) ? 'selected' : '',
                  pendingStart === day.iso ? 'pending' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={formatDay(day.iso)}
                onClick={() => pickDay(day.iso)}
              >
                {day.day}
              </button>
            ))}
          </div>

          <div className="ops-calendar-foot">
            <span>{pendingStart ? 'Pick the end date' : formatRangeLabel(value)}</span>
            <div className="ops-calendar-foot-actions">
              <button
                type="button"
                className="sa-btn-ghost"
                onClick={() => {
                  onChange(emptyDateRange)
                  setPendingStart('')
                }}
              >
                Clear
              </button>
              <button type="button" className="sa-btn approve" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
