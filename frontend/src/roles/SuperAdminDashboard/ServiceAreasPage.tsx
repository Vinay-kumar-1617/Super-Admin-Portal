import { useMemo, useRef, useState, type Dispatch, type FormEvent, type PointerEvent as ReactPointerEvent, type SetStateAction } from 'react'
import { statesPageStyles } from './pageStyles'
import type { StateActivity } from './statesData'
import {
  buildDefaultHours,
  cityAnchors,
  cityNames,
  coverageTypes,
  defaultPricing,
  providerPool,
  serviceCatalog,
  type AreaOperatingHour,
  type AreaPricing,
  type CoverageType,
  type MapPoint,
  type ServiceAreaItem,
  type ServiceAreaProvider,
} from './serviceAreasData'

type ServiceAreasPageProps = {
  areas: ServiceAreaItem[]
  setAreas: Dispatch<SetStateAction<ServiceAreaItem[]>>
  onBack?: () => void
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusFilterChange: (filter: 'all' | 'active' | 'inactive') => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
}

type AreaForm = {
  name: string
  code: string
  cityName: string
  description: string
  coverageType: CoverageType
  radiusKm: number
  pinCodes: string
  services: string[]
  hours: AreaOperatingHour[]
  pricing: AreaPricing
  status: 'Active' | 'Inactive'
  center: MapPoint
}

type ConfirmState = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}

const MAP_W = 640
const MAP_H = 400
const KM_TO_PX = 12

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

let idSeq = 1000

const nextId = (prefix: string) => {
  idSeq += 1
  return `${prefix}-${idSeq}`
}

const nextActivityId = () => nextId('act')

const emptyForm = (): AreaForm => ({
  name: '',
  code: '',
  cityName: cityNames[0] ?? 'Mumbai',
  description: '',
  coverageType: 'Radius',
  radiusKm: 8,
  pinCodes: '',
  services: ['Crane Hire'],
  hours: buildDefaultHours(),
  pricing: { ...defaultPricing },
  status: 'Active',
  center: { x: 50, y: 50 },
})

const formatLatLng = (cityName: string, point: MapPoint) => {
  const anchor = cityAnchors[cityName]
  if (!anchor) return 'Lat —, Lng —'
  const lat = anchor.lat + ((50 - point.y) / 100) * 0.28
  const lng = anchor.lng + ((point.x - 50) / 100) * 0.28
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

const coverageAreaLabel = (area: ServiceAreaItem) => {
  if (area.coverageType === 'Radius') {
    return `${(Math.PI * area.radiusKm * area.radiusKm).toFixed(1)} km²`
  }
  if (area.coverageType === 'ZIP / PIN Codes') {
    return `${area.pinCodes.length} PIN codes`
  }
  return 'Custom boundary'
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatRevenue = (value: number) => (value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${value.toLocaleString('en-IN')}`)

const mapBlocks = (() => {
  const blocks: { x: number; y: number; w: number; h: number; tone: number }[] = []
  const cols = 8
  const rows = 5
  const pad = 7
  const bw = (MAP_W - pad * (cols + 1)) / cols
  const bh = (MAP_H - pad * (rows + 1)) / rows
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      blocks.push({ x: pad + c * (bw + pad), y: pad + r * (bh + pad), w: bw, h: bh, tone: (r * cols + c) % 4 })
    }
  }
  return blocks
})()

const blockTones = ['#ffffff', '#f7fafc', '#eef3f8', '#f4f7fb']

const polygonPath = (cx: number, cy: number, size: number) => {
  const factors = [1, 0.76, 1.08, 0.82, 1.14, 0.72, 1.02, 0.88]
  return factors
    .map((factor, index) => {
      const angle = (index / factors.length) * Math.PI * 2
      const x = cx + Math.cos(angle) * size * factor
      const y = cy + Math.sin(angle) * size * factor * 0.82
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ') + ' Z'
}

const serviceAreaPageStyles = `
  .sa-coverage-cell { display: grid; gap: 4px; }
  .sa-coverage-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 9px;
    border-radius: 8px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
    font-size: 0.74rem;
    font-weight: 800;
    white-space: nowrap;
  }
  .sa-coverage-badge.polygon { background: #f5f3ff; border-color: #ddd6fe; color: #6d28d9; }
  .sa-coverage-badge.pins { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
  .sa-sub-text { font-size: 0.72rem; color: #64748b; }
  .sa-providers-cell { display: flex; align-items: center; gap: 8px; }
  .sa-mini-avatar {
    width: 26px; height: 26px; border-radius: 8px;
    background: linear-gradient(135deg, rgba(37,99,235,0.16), rgba(37,99,235,0.06));
    color: #1d4ed8; display: grid; place-items: center;
    font-size: 0.62rem; font-weight: 800; border: 1px solid rgba(37,99,235,0.2);
  }
  .action-btn.danger { color: #b91c1c; border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.05); }
  .action-btn.danger:hover { background: rgba(239,68,68,0.12); }

  .sa-form-modal { max-width: 940px; }
  .sa-confirm-card { max-width: 460px; }
  .sa-provider-modal { max-width: 860px; }

  .sa-form-section {
    border: 1px solid rgba(15,23,42,0.08);
    background: #f8fafc;
    border-radius: 14px;
    padding: 16px 18px;
    display: grid;
    gap: 14px;
  }
  .sa-form-section-title {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .sa-form-section-title span:last-child { font-size: 0.7rem; color: #94a3b8; letter-spacing: 0.04em; }

  .sa-map-wrap {
    position: relative;
    border: 1px solid rgba(15,23,42,0.1);
    border-radius: 12px;
    overflow: hidden;
    background: #e9eff6;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
  }
  .sa-map-hint {
    position: absolute;
    left: 10px;
    top: 10px;
    background: rgba(16,24,39,0.82);
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 5px 9px;
    border-radius: 999px;
    letter-spacing: 0.02em;
    pointer-events: none;
  }
  .sa-map-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 12px;
    padding: 10px 12px;
  }
  .sa-legend-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #334155;
    background: #f8fafc;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 999px;
    padding: 4px 10px;
  }
  .sa-legend-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4a12; }
  .sa-legend-dot.blue { background: #2563eb; }

  .sa-check-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .sa-check-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid rgba(15,23,42,0.1);
    border-radius: 10px;
    padding: 9px 11px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .sa-check-item.checked {
    border-color: rgba(255,107,44,0.45);
    background: rgba(255,107,44,0.06);
    color: #c94310;
  }
  .sa-check-item input { accent-color: #ff6b2c; width: 15px; height: 15px; }

  .sa-hours-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr auto;
    gap: 10px;
    align-items: center;
    background: #fff;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 10px;
    padding: 8px 12px;
  }
  .sa-hours-row strong { font-size: 0.8rem; color: #1e293b; }
  .sa-hours-row input[type="time"] {
    min-height: 36px;
    padding: 4px 8px;
    border: 1px solid rgba(15,23,42,0.15);
    border-radius: 8px;
    font: inherit;
    font-size: 0.8rem;
    background: #fff;
  }
  .sa-closed-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748b;
    white-space: nowrap;
  }
  .sa-closed-toggle input { accent-color: #ef4444; }
  .sa-hours-row.is-closed { opacity: 0.6; background: #f8fafc; }

  .sa-price-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
  .sa-price-grid .form-field label { font-size: 0.68rem; }

  .sa-pin-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .sa-pin-chip {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.72rem;
    font-weight: 700;
    background: #f1f5f9;
    border: 1px solid rgba(15,23,42,0.1);
    color: #334155;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .sa-service-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(255,107,44,0.08);
    border: 1px solid rgba(255,107,44,0.2);
    color: #c94310;
    font-size: 0.76rem;
    font-weight: 700;
  }

  .sa-detail-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 16px; }
  .sa-hours-list { display: grid; gap: 6px; }
  .sa-hours-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: #fff;
    border: 1px solid rgba(15,23,42,0.07);
    border-radius: 9px;
    padding: 8px 12px;
    font-size: 0.8rem;
  }
  .sa-hours-item span { color: #64748b; font-weight: 600; }
  .sa-hours-item strong { color: #0f172a; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.78rem; }
  .sa-hours-item.closed { background: #f8fafc; color: #94a3b8; }
  .sa-hours-item.closed strong { color: #94a3b8; }

  .sa-pricing-list { display: grid; gap: 8px; }
  .sa-pricing-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: #fff;
    border: 1px solid rgba(15,23,42,0.07);
    border-radius: 9px;
    padding: 9px 12px;
    font-size: 0.8rem;
    color: #475569;
  }
  .sa-pricing-row strong { color: #0f172a; font-size: 0.88rem; }

  .sa-provider-list { display: grid; gap: 10px; }
  .sa-provider-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    background: #fff;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 12px;
    padding: 12px 14px;
    flex-wrap: wrap;
  }
  .sa-provider-left { display: flex; align-items: center; gap: 12px; }
  .sa-provider-avatar {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 0.8rem;
  }
  .sa-provider-text { display: grid; gap: 2px; }
  .sa-provider-text strong { font-size: 0.9rem; color: #0f172a; }
  .sa-provider-text span { font-size: 0.74rem; color: #64748b; }
  .sa-provider-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .sa-rating {
    display: inline-flex; align-items: center; gap: 4px;
    background: #fffbeb; color: #b45309; border: 1px solid #fde68a;
    border-radius: 999px; padding: 3px 9px; font-size: 0.72rem; font-weight: 800;
  }

  .sa-confirm-icon {
    width: 46px; height: 46px; border-radius: 14px;
    display: grid; place-items: center; font-size: 1.35rem;
    background: rgba(239,68,68,0.12); color: #b91c1c;
    border: 1px solid rgba(239,68,68,0.2);
  }
  .sa-confirm-icon.warn { background: rgba(245,158,11,0.14); color: #b45309; border-color: rgba(245,158,11,0.25); }
  .sa-confirm-body { display: grid; gap: 10px; }
  .sa-confirm-body h4 { margin: 0; font-size: 1.05rem; color: #0f172a; }
  .sa-confirm-body p { margin: 0; color: #64748b; font-size: 0.86rem; line-height: 1.55; }

  .btn-danger {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    color: #fff; border: 0; border-radius: 12px; padding: 10px 18px;
    font-size: 0.84rem; font-weight: 700; cursor: pointer;
    box-shadow: 0 8px 18px rgba(185,28,28,0.24);
  }
  .btn-warn {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: #fff; border: 0; border-radius: 12px; padding: 10px 18px;
    font-size: 0.84rem; font-weight: 700; cursor: pointer;
    box-shadow: 0 8px 18px rgba(217,119,6,0.24);
  }

  .sa-radio-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .sa-radio-pill {
    display: inline-flex; align-items: center; gap: 7px;
    border: 1px solid rgba(15,23,42,0.12); background: #fff;
    border-radius: 999px; padding: 8px 14px; font-size: 0.8rem;
    font-weight: 700; color: #475569; cursor: pointer;
  }
  .sa-radio-pill.active-on { border-color: rgba(8,166,108,0.4); background: rgba(8,166,108,0.08); color: #078653; }
  .sa-radio-pill.active-off { border-color: rgba(100,116,139,0.4); background: rgba(100,116,139,0.08); color: #475569; }
  .sa-radio-pill input { accent-color: #ff6b2c; }
`

function CoverageMap({
  center,
  radiusKm,
  coverageType,
  cityName,
  interactive = false,
  onChange,
}: {
  center: MapPoint
  radiusKm: number
  coverageType: CoverageType
  cityName: string
  interactive?: boolean
  onChange?: (point: MapPoint) => void
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const draggingRef = useRef(false)

  const cx = (center.x / 100) * MAP_W
  const cy = (center.y / 100) * MAP_H
  const size = clamp(radiusKm, 1, 30) * KM_TO_PX

  const updateFromEvent = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || !onChange) return
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 3, 97)
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 4, 96)
    onChange({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) })
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    draggingRef.current = true
    svgRef.current?.setPointerCapture(event.pointerId)
    updateFromEvent(event)
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return
    updateFromEvent(event)
  }

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    draggingRef.current = false
    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId)
    }
  }

  const pinCount = clamp(radiusKm, 2, 10)
  const pinDots =
    coverageType === 'ZIP / PIN Codes'
      ? Array.from({ length: pinCount }, (_, index) => {
          const angle = (index / pinCount) * Math.PI * 2 + 0.5
          return {
            x: cx + Math.cos(angle) * size * 0.72,
            y: cy + Math.sin(angle) * size * 0.6,
            label: index + 1,
          }
        })
      : []

  return (
    <div className="sa-map-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        style={{ width: '100%', height: 'auto', display: 'block', touchAction: interactive ? 'none' : 'auto', cursor: interactive ? 'crosshair' : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="img"
        aria-label={`Coverage map for ${cityName}`}
      >
        <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#e9eff6" />

        {mapBlocks.map((block, index) => (
          <rect
            key={`block-${index}`}
            x={block.x}
            y={block.y}
            width={block.w}
            height={block.h}
            rx="4"
            fill={blockTones[block.tone]}
            stroke="rgba(148,163,184,0.25)"
          />
        ))}

        <rect x="40" y="230" width="120" height="80" rx="8" fill="#dcf5e6" stroke="#a7e8c1" />
        <rect x="470" y="40" width="130" height="70" rx="8" fill="#dcf5e6" stroke="#a7e8c1" />

        <path d="M0,340 C120,320 220,380 340,350 C460,320 560,368 640,338 L640,400 L0,400 Z" fill="#cfe6f7" stroke="#a9d3ef" />
        <path d="M0,340 C120,320 220,380 340,350 C460,320 560,368 640,338" fill="none" stroke="#8ec6ea" strokeWidth="2" />

        <line x1="0" y1="168" x2={MAP_W} y2="168" stroke="#ffffff" strokeWidth="14" />
        <line x1="0" y1="168" x2={MAP_W} y2="168" stroke="#fcd34d" strokeWidth="2" strokeDasharray="14 12" />
        <line x1="318" y1="0" x2="318" y2={MAP_H} stroke="#ffffff" strokeWidth="14" />
        <line x1="318" y1="0" x2="318" y2={MAP_H} stroke="#fcd34d" strokeWidth="2" strokeDasharray="14 12" />

        {coverageType === 'Radius' && (
          <>
            <circle cx={cx} cy={cy} r={size} fill="rgba(37,99,235,0.14)" stroke="#2563eb" strokeWidth="2" strokeDasharray="8 7" />
            <circle cx={cx} cy={cy} r={Math.max(size * 0.55, 8)} fill="rgba(37,99,235,0.10)" stroke="rgba(37,99,235,0.35)" strokeWidth="1" />
          </>
        )}

        {coverageType === 'ZIP / PIN Codes' && (
          <circle cx={cx} cy={cy} r={size} fill="rgba(8,166,108,0.10)" stroke="#08a66c" strokeWidth="2" strokeDasharray="4 8" />
        )}

        {coverageType === 'Custom Polygon' && (
          <path d={polygonPath(cx, cy, size)} fill="rgba(124,58,237,0.14)" stroke="#7c3aed" strokeWidth="2" strokeDasharray="10 6" />
        )}

        {pinDots.map((dot) => (
          <g key={`pin-${dot.label}`}>
            <circle cx={dot.x} cy={dot.y} r="9" fill="#ffffff" stroke="#08a66c" strokeWidth="2" />
            <text x={dot.x} y={dot.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="800" fill="#078653">
              {dot.label}
            </text>
          </g>
        ))}

        <g>
          <circle cx={cx} cy={cy} r="17" fill="rgba(239,74,18,0.16)" />
          <circle cx={cx} cy={cy} r="9" fill="#ffffff" stroke="#ef4a12" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="3.5" fill="#ef4a12" />
        </g>

        <g transform={`translate(${clamp(cx + 16, 6, MAP_W - 150)}, ${clamp(cy - 30, 8, MAP_H - 30)})`}>
          <rect x="0" y="0" width="146" height="24" rx="12" fill="rgba(16,24,39,0.86)" />
          <text x="10" y="16" fontSize="11" fontWeight="700" fill="#ffffff">
            {cityName} • {radiusKm} km
          </text>
        </g>
      </svg>

      {interactive && <div className="sa-map-hint">Click or drag the map to move the centre</div>}
    </div>
  )
}

export default function ServiceAreasPage({
  areas,
  setAreas,
  onBack,
  statusFilter,
  onStatusFilterChange,
  isAddModalOpen,
  setIsAddModalOpen,
}: ServiceAreasPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [coverageFilter, setCoverageFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [viewArea, setViewArea] = useState<ServiceAreaItem | null>(null)
  const [editTarget, setEditTarget] = useState<ServiceAreaItem | null>(null)
  const [form, setForm] = useState<AreaForm>(emptyForm)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  const [manageTarget, setManageTarget] = useState<ServiceAreaItem | null>(null)
  const [providerSearch, setProviderSearch] = useState('')
  const [newProvider, setNewProvider] = useState({ name: '', contact: '', email: '', vehicles: 8, specialty: '' })

  const showToast = (message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(null), 4000)
  }

  const activeCount = useMemo(() => areas.filter((a) => a.status === 'Active').length, [areas])
  const inactiveCount = useMemo(() => areas.filter((a) => a.status === 'Inactive').length, [areas])
  const totalProviders = useMemo(() => areas.reduce((sum, a) => sum + a.providers.length, 0), [areas])
  const totalCustomers = useMemo(() => areas.reduce((sum, a) => sum + a.customers, 0), [areas])
  const citiesCovered = useMemo(() => new Set(areas.map((a) => a.cityName)).size, [areas])
  const avgRadius = useMemo(
    () => (areas.length ? (areas.reduce((sum, a) => sum + a.radiusKm, 0) / areas.length).toFixed(1) : '0'),
    [areas],
  )

  const filteredAreas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return areas.filter((area) => {
      if (statusFilter === 'active' && area.status !== 'Active') return false
      if (statusFilter === 'inactive' && area.status !== 'Inactive') return false
      if (cityFilter !== 'all' && area.cityName !== cityFilter) return false
      if (coverageFilter !== 'all' && area.coverageType !== coverageFilter) return false
      if (!query) return true
      return (
        area.name.toLowerCase().includes(query) ||
        area.code.toLowerCase().includes(query) ||
        area.cityName.toLowerCase().includes(query) ||
        area.stateName.toLowerCase().includes(query) ||
        area.description.toLowerCase().includes(query) ||
        area.pinCodes.some((pin) => pin.includes(query)) ||
        area.services.some((service) => service.toLowerCase().includes(query))
      )
    })
  }, [areas, statusFilter, cityFilter, coverageFilter, searchQuery])

  const hasActiveFilters = Boolean(searchQuery || cityFilter !== 'all' || coverageFilter !== 'all' || statusFilter !== 'all')

  const resetFilters = () => {
    setSearchQuery('')
    setCityFilter('all')
    setCoverageFilter('all')
    onStatusFilterChange('all')
  }

  const syncViewArea = (updated: ServiceAreaItem) => {
    if (viewArea?.id === updated.id) setViewArea(updated)
    if (manageTarget?.id === updated.id) setManageTarget(updated)
  }

  const applyUpdate = (id: string, updater: (area: ServiceAreaItem) => ServiceAreaItem) => {
    setAreas((prev) => prev.map((area) => (area.id === id ? updater(area) : area)))
    const next = areas.find((area) => area.id === id)
    if (next) syncViewArea(updater(next))
  }

  const logActivity = (area: ServiceAreaItem, action: string, tone: StateActivity['tone'] = 'blue'): StateActivity[] => [
    { id: nextActivityId(), action, actor: 'Super Admin', timestamp: 'Just now', tone },
    ...area.recentActivity,
  ]

  const openAddForm = () => {
    setForm(emptyForm())
    setEditTarget(null)
    setIsAddModalOpen(true)
  }

  const openEditForm = (area: ServiceAreaItem) => {
    setForm({
      name: area.name,
      code: area.code,
      cityName: area.cityName,
      description: area.description,
      coverageType: area.coverageType,
      radiusKm: area.radiusKm,
      pinCodes: area.pinCodes.join(', '),
      services: [...area.services],
      hours: area.hours.map((h) => ({ ...h })),
      pricing: { ...area.pricing },
      status: area.status,
      center: { ...area.center },
    })
    setIsAddModalOpen(false)
    setEditTarget(area)
  }

  const closeForm = () => {
    setIsAddModalOpen(false)
    setEditTarget(null)
    setForm(emptyForm())
    setProviderSearch('')
    setNewProvider({ name: '', contact: '', email: '', vehicles: 8, specialty: '' })
  }

  const isEditMode = editTarget !== null

  const openDetails = (area: ServiceAreaItem) => {
    setViewArea(area)
    setManageTarget(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service) ? prev.services.filter((s) => s !== service) : [...prev.services, service],
    }))
  }

  const updateHour = (index: number, patch: Partial<AreaOperatingHour>) => {
    setForm((prev) => ({
      ...prev,
      hours: prev.hours.map((hour, i) => (i === index ? { ...hour, ...patch } : hour)),
    }))
  }

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault()
    const name = form.name.trim()
    const code = form.code.trim().toUpperCase()
    if (!name || !code) {
      showToast('Area name and short code are required.')
      return
    }
    if (areas.some((a) => a.code.toUpperCase() === code && a.id !== editTarget?.id)) {
      showToast(`A service area with code "${code}" already exists.`)
      return
    }
    if (form.services.length === 0) {
      showToast('Select at least one available service.')
      return
    }
    if (form.radiusKm < 1 || form.radiusKm > 60) {
      showToast('Service radius must be between 1 and 60 km.')
      return
    }

    const pins = form.pinCodes
      .split(',')
      .map((pin) => pin.trim())
      .filter(Boolean)
    const anchor = cityAnchors[form.cityName]

    if (isEditMode && editTarget) {
      const updated: ServiceAreaItem = {
        ...editTarget,
        name,
        code,
        cityName: form.cityName,
        stateName: anchor?.stateName ?? editTarget.stateName,
        description: form.description.trim(),
        coverageType: form.coverageType,
        radiusKm: Number(form.radiusKm),
        pinCodes: pins,
        center: form.center,
        services: [...form.services],
        hours: form.hours.map((h) => ({ ...h })),
        pricing: { ...form.pricing },
        status: form.status,
        recentActivity: logActivity(editTarget, 'Service area configuration updated by Super Admin'),
      }
      setAreas((prev) => prev.map((area) => (area.id === updated.id ? updated : area)))
      syncViewArea(updated)
      showToast(`Service area "${name}" updated successfully.`)
      closeForm()
      return
    }

    const created: ServiceAreaItem = {
      id: `${nextId('sa')}-${code.toLowerCase()}`,
      name,
      code,
      cityName: form.cityName,
      stateName: anchor?.stateName ?? '',
      description: form.description.trim(),
      coverageType: form.coverageType,
      radiusKm: Number(form.radiusKm),
      pinCodes: pins,
      center: form.center,
      services: [...form.services],
      hours: form.hours.map((h) => ({ ...h })),
      pricing: { ...form.pricing },
      providers: [],
      customers: 0,
      status: form.status,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      stats: { bookings: 0, revenue: 0, avgResponseMins: 0, fillRate: 0 },
      recentActivity: [
        { id: nextActivityId(), action: `Service area created for ${form.cityName}`, actor: 'Super Admin', timestamp: 'Just now', tone: 'green' },
      ],
    }

    setAreas((prev) => [created, ...prev])
    showToast(`Service area "${name} (${code})" created successfully!`)
    closeForm()
  }

  const requestStatusChange = (area: ServiceAreaItem) => {
    if (area.status === 'Inactive') {
      applyUpdate(area.id, (current) => ({
        ...current,
        status: 'Active',
        recentActivity: logActivity(current, 'Service area activated', 'green'),
      }))
      showToast(`${area.name} is now Active.`)
      return
    }

    setConfirm({
      title: 'Deactivate service area?',
      message: `Deactivating "${area.name}" stops new bookings inside this coverage zone. Existing bookings and assigned providers are not affected.`,
      confirmLabel: 'Deactivate',
      onConfirm: () => {
        applyUpdate(area.id, (current) => ({
          ...current,
          status: 'Inactive',
          recentActivity: logActivity(current, 'Service area deactivated', 'orange'),
        }))
        showToast(`${area.name} is now Inactive.`)
      },
    })
  }

  const requestDelete = (area: ServiceAreaItem) => {
    setConfirm({
      title: 'Delete service area?',
      message: `"${area.name}" and its coverage configuration will be permanently removed from ${area.cityName}. This cannot be undone.`,
      confirmLabel: 'Delete Area',
      onConfirm: () => {
        setAreas((prev) => prev.filter((item) => item.id !== area.id))
        if (viewArea?.id === area.id) setViewArea(null)
        if (manageTarget?.id === area.id) setManageTarget(null)
        showToast(`Service area "${area.name}" deleted.`)
      },
    })
  }

  const openManageProviders = (area: ServiceAreaItem) => {
    setProviderSearch('')
    setNewProvider({ name: '', contact: '', email: '', vehicles: 8, specialty: '' })
    setManageTarget(area)
  }

  const assignProvider = (areaId: string, provider: ServiceAreaProvider) => {
    applyUpdate(areaId, (current) => ({
      ...current,
      providers: [...current.providers, provider],
      recentActivity: logActivity(current, `${provider.name} assigned to coverage zone`, 'green'),
    }))
    showToast(`${provider.name} assigned.`)
  }

  const unassignProvider = (areaId: string, providerId: string) => {
    applyUpdate(areaId, (current) => {
      const target = current.providers.find((p) => p.id === providerId)
      return {
        ...current,
        providers: current.providers.filter((p) => p.id !== providerId),
        recentActivity: logActivity(current, `${target?.name ?? 'Provider'} removed from coverage zone`, 'orange'),
      }
    })
    showToast('Provider removed from this service area.')
  }

  const addAndAssignProvider = (event: FormEvent) => {
    event.preventDefault()
    if (!manageTarget) return
    if (!newProvider.name.trim() || !newProvider.contact.trim()) {
      showToast('Provider name and contact number are required.')
      return
    }
    const provider: ServiceAreaProvider = {
      id: nextId('prov'),
      name: newProvider.name.trim(),
      contact: newProvider.contact.trim(),
      email: newProvider.email.trim() || 'ops@fieldwork.in',
      vehicles: Number(newProvider.vehicles) || 0,
      rating: 4.0,
      status: 'Active',
      specialty: newProvider.specialty.trim() || 'General fleet',
    }
    applyUpdate(manageTarget.id, (current) => ({
      ...current,
      providers: [...current.providers, provider],
      recentActivity: logActivity(current, `${provider.name} onboarded to ${current.name}`, 'green'),
    }))
    setNewProvider({ name: '', contact: '', email: '', vehicles: 8, specialty: '' })
    showToast(`${provider.name} added and assigned.`)
  }

  const suggestedProviders = useMemo(() => {
    if (!manageTarget) return []
    const assignedIds = new Set(manageTarget.providers.map((p) => p.id))
    const query = providerSearch.trim().toLowerCase()
    return providerPool.filter((provider) => {
      if (assignedIds.has(provider.id)) return false
      if (!query) return true
      return provider.name.toLowerCase().includes(query) || provider.specialty.toLowerCase().includes(query)
    })
  }, [manageTarget, providerSearch])

  const formModalOpen = isAddModalOpen || editTarget !== null

  return (
    <div className="states-page">
      <style>{statesPageStyles}</style>
      <style>{serviceAreaPageStyles}</style>

      {!viewArea && (
        <header className="states-header">
          <div className="states-header-copy">
            <div className="states-breadcrumb">
              <button type="button" onClick={onBack}>Dashboard</button>
              <span>/</span>
              <span>Geography</span>
              <span>/</span>
              <strong>Service Areas</strong>
            </div>
            <h2>Service Areas</h2>
          </div>

          <div className="states-header-actions">
            {onBack && (
              <button type="button" className="btn-secondary" onClick={onBack}>
                ← Back to Overview
              </button>
            )}
            <button type="button" className="btn-primary geo-add-action" onClick={openAddForm}>
              <span>+</span> Add Service Area
            </button>
          </div>
        </header>
      )}

      {!viewArea && (
        <>
          <section className="states-stats-grid" aria-label="Service area summary statistics">
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Total Areas</span>
                <span className="states-stat-value">{areas.length}</span>
              </div>
              <span className="states-stat-badge slate">Coverage</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Active Areas</span>
                <span className="states-stat-value">{activeCount}</span>
              </div>
              <span className="states-stat-badge green">{Math.round((activeCount / (areas.length || 1)) * 100)}% Live</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Inactive Areas</span>
                <span className="states-stat-value">{inactiveCount}</span>
              </div>
              <span className="states-stat-badge orange">Paused</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Providers</span>
                <span className="states-stat-value">{totalProviders}</span>
              </div>
              <span className="states-stat-badge blue">Assigned</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Customers</span>
                <span className="states-stat-value">{totalCustomers.toLocaleString()}</span>
              </div>
              <span className="states-stat-badge blue">Reach</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Avg Radius</span>
                <span className="states-stat-value">{avgRadius} km</span>
              </div>
              <span className="states-stat-badge orange">{citiesCovered} Cities</span>
            </div>
          </section>

          <section className="states-toolbar" aria-label="Service area filter and search controls">
            <div className="states-search-box">
              <input
                type="text"
                placeholder="Search by area, code, city, PIN code or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search service areas"
              />
              {searchQuery && (
                <button type="button" className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  ×
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="bookings-filter-select"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                aria-label="Filter by city"
              >
                <option value="all">All Cities</option>
                {cityNames.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                className="bookings-filter-select"
                value={coverageFilter}
                onChange={(e) => setCoverageFilter(e.target.value)}
                aria-label="Filter by coverage type"
              >
                <option value="all">All Coverage Types</option>
                {coverageTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <div className="states-filter-pills" role="tablist" aria-label="Filter by status">
                <button type="button" className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => onStatusFilterChange('all')}>
                  All <span className="filter-pill-count">{areas.length}</span>
                </button>
                <button type="button" className={`filter-pill ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => onStatusFilterChange('active')}>
                  Active <span className="filter-pill-count">{activeCount}</span>
                </button>
                <button type="button" className={`filter-pill ${statusFilter === 'inactive' ? 'active' : ''}`} onClick={() => onStatusFilterChange('inactive')}>
                  Inactive <span className="filter-pill-count">{inactiveCount}</span>
                </button>
              </div>

              {hasActiveFilters && (
                <button type="button" className="btn-secondary" style={{ padding: '7px 12px', fontSize: '0.76rem' }} onClick={resetFilters}>
                  Reset
                </button>
              )}
            </div>
          </section>

          <section className="states-table-card" aria-label="Service areas table list">
            <div className="states-table-wrap">
              <table className="states-table" style={{ minWidth: 1180 }}>
                <thead>
                  <tr>
                    <th>Area Name</th>
                    <th>City</th>
                    <th>Coverage / Radius</th>
                    <th>Providers</th>
                    <th>Customers</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAreas.length > 0 ? (
                    filteredAreas.map((area) => (
                      <tr
                        key={area.id}
                        className="states-table-row"
                        onClick={() => openDetails(area)}
                        title={`Click to view ${area.name} details`}
                      >
                        <td>
                          <div className="state-name-cell">
                            <div className="state-avatar-badge">{area.code}</div>
                            <div className="state-name-info">
                              <strong>{area.name}</strong>
                              <span>{area.services.length} services • {area.pinCodes.length} PIN codes</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="state-code-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            {area.cityName}
                          </span>
                        </td>
                        <td>
                          <div className="sa-coverage-cell">
                            <span
                              className={`sa-coverage-badge ${
                                area.coverageType === 'Custom Polygon' ? 'polygon' : area.coverageType === 'ZIP / PIN Codes' ? 'pins' : ''
                              }`}
                            >
                              {area.coverageType === 'Radius' ? `Radius ${area.radiusKm} km` : area.coverageType}
                            </span>
                            <span className="sa-sub-text">{coverageAreaLabel(area)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="sa-providers-cell">
                            <div className="sa-mini-avatar">{area.providers.length}</div>
                            <div className="state-name-info">
                              <strong>{area.providers.length ? area.providers[0].name : 'No provider'}</strong>
                              <span>{area.providers.length > 1 ? `+${area.providers.length - 1} more assigned` : 'Manage in actions'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{area.customers.toLocaleString()}</strong>{' '}
                          <span style={{ color: '#64748b', fontSize: '0.76rem' }}>customers</span>
                        </td>
                        <td>
                          <span className={`status-pill ${area.status.toLowerCase()}`}>
                            <span className="status-dot" />
                            {area.status}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{area.createdDate}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="table-actions-cell">
                            <button type="button" className="action-btn view icon-action" onClick={() => openDetails(area)} aria-label={`View ${area.name}`} title="View service area">
                              👁️
                            </button>
                            <button type="button" className="action-btn edit icon-action" onClick={() => openEditForm(area)} aria-label={`Edit ${area.name}`} title="Edit service area">
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="action-btn icon-action"
                              onClick={() => openManageProviders(area)}
                              aria-label={`Manage providers for ${area.name}`}
                              title="Manage providers"
                            >
                              👥
                            </button>
                            <button
                              type="button"
                              className={`action-btn icon-action ${area.status === 'Active' ? 'toggle-deactivate' : 'toggle-activate'}`}
                              onClick={() => requestStatusChange(area)}
                              aria-label={`${area.status === 'Active' ? 'Deactivate' : 'Activate'} ${area.name}`}
                              title={area.status === 'Active' ? 'Deactivate service area' : 'Activate service area'}
                            >
                              {area.status === 'Active' ? '🚫' : '✅'}
                            </button>
                            <button type="button" className="action-btn danger icon-action" onClick={() => requestDelete(area)} aria-label={`Delete ${area.name}`} title="Delete service area">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-states-panel">
                          <div className="empty-icon">🗺️</div>
                          <h4>No service areas found</h4>
                          <p>
                            {searchQuery || cityFilter !== 'all' || coverageFilter !== 'all'
                              ? 'No service areas match your search or filters. Try clearing them.'
                              : 'No service areas exist under this status filter yet.'}
                          </p>
                          {hasActiveFilters && (
                            <button type="button" className="btn-secondary" onClick={resetFilters}>
                              Reset Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {viewArea && (
        <section style={{ display: 'grid', gap: 16 }} aria-labelledby="view-area-title">
          <div className="states-header">
            <div className="states-header-copy">
              <div className="states-breadcrumb">
                <button type="button" onClick={() => setViewArea(null)}>Service Areas</button>
                <span>›</span>
                <span>{viewArea.name}</span>
              </div>
              <h2 id="view-area-title">{viewArea.name} — Coverage Overview</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                <span className="state-code-badge">{viewArea.code}</span>
                <span className="state-code-badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                  {viewArea.cityName}, {viewArea.stateName}
                </span>
                <span className={`sa-coverage-badge ${viewArea.coverageType === 'Custom Polygon' ? 'polygon' : viewArea.coverageType === 'ZIP / PIN Codes' ? 'pins' : ''}`}>
                  {viewArea.coverageType === 'Radius' ? `Radius ${viewArea.radiusKm} km` : viewArea.coverageType}
                </span>
                <span className={`status-pill ${viewArea.status.toLowerCase()}`}>
                  <span className="status-dot" />
                  {viewArea.status}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Created: {viewArea.createdDate}</span>
              </div>
            </div>
            <div className="states-header-actions">
              <button type="button" className="btn-secondary" onClick={() => openManageProviders(viewArea)}>
                Manage Providers
              </button>
              <button type="button" className="btn-secondary" onClick={() => openEditForm(viewArea)}>
                Edit
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => requestStatusChange(viewArea)}
              >
                {viewArea.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => requestDelete(viewArea)} style={{ color: '#b91c1c', borderColor: 'rgba(239,68,68,0.3)' }}>
                Delete
              </button>
              <button type="button" className="btn-primary" onClick={() => setViewArea(null)}>
                Back to Service Areas
              </button>
            </div>
          </div>

          <div className="states-stats-grid">
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Providers</span>
                <span className="states-stat-value">{viewArea.providers.length}</span>
              </div>
              <span className="states-stat-badge blue">Assigned</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Customers</span>
                <span className="states-stat-value">{viewArea.customers.toLocaleString()}</span>
              </div>
              <span className="states-stat-badge slate">In Zone</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Bookings (30d)</span>
                <span className="states-stat-value">{viewArea.stats.bookings.toLocaleString()}</span>
              </div>
              <span className="states-stat-badge green">Demand</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Revenue (30d)</span>
                <span className="states-stat-value" style={{ fontSize: '1.3rem' }}>{formatRevenue(viewArea.stats.revenue)}</span>
              </div>
              <span className="states-stat-badge orange">Earnings</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Avg Response</span>
                <span className="states-stat-value">{viewArea.stats.avgResponseMins || '—'}{viewArea.stats.avgResponseMins ? ' min' : ''}</span>
              </div>
              <span className="states-stat-badge blue">SLA</span>
            </div>
            <div className="states-stat-card">
              <div className="states-stat-info">
                <span className="states-stat-label">Fill Rate</span>
                <span className="states-stat-value">{viewArea.stats.fillRate}%</span>
              </div>
              <span className="states-stat-badge green">Utilisation</span>
            </div>
          </div>

          <div className="sa-detail-grid">
            <div className="view-section" style={{ background: '#fff' }}>
              <h4 className="view-section-title">
                <span>Coverage Map</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{coverageAreaLabel(viewArea)}</span>
              </h4>
              <CoverageMap
                center={viewArea.center}
                radiusKm={viewArea.radiusKm}
                coverageType={viewArea.coverageType}
                cityName={viewArea.cityName}
              />
              <div className="sa-map-legend">
                <span className="sa-legend-chip"><span className="sa-legend-dot" /> Centre {formatLatLng(viewArea.cityName, viewArea.center)}</span>
                <span className="sa-legend-chip"><span className="sa-legend-dot blue" /> {viewArea.coverageType} • {viewArea.radiusKm} km</span>
                <span className="sa-legend-chip">{viewArea.pinCodes.length} PIN codes</span>
                <span className="sa-legend-chip">{viewArea.services.length} services live</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div className="view-section">
                <h4 className="view-section-title"><span>Area Summary</span></h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                  {viewArea.description || 'No description provided for this service area.'}
                </p>
                <div className="details-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <div className="detail-item">
                    <span className="detail-label">Coverage Type</span>
                    <span className="detail-value">{viewArea.coverageType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Service Radius</span>
                    <span className="detail-value">{viewArea.radiusKm} km</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Coverage Area</span>
                    <span className="detail-value">{coverageAreaLabel(viewArea)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City</span>
                    <span className="detail-value">{viewArea.cityName}, {viewArea.stateName}</span>
                  </div>
                </div>
                <div>
                  <span className="detail-label">ZIP / PIN Codes</span>
                  <div className="sa-pin-chips" style={{ marginTop: 6 }}>
                    {viewArea.pinCodes.length ? (
                      viewArea.pinCodes.map((pin) => <span className="sa-pin-chip" key={pin}>{pin}</span>)
                    ) : (
                      <span className="sa-sub-text">No PIN codes published for this area.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="view-section">
                <h4 className="view-section-title">
                  <span>Available Services</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{viewArea.services.length} live</span>
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {viewArea.services.length ? (
                    viewArea.services.map((service) => (
                      <span className="sa-service-chip" key={service}>● {service}</span>
                    ))
                  ) : (
                    <span className="sa-sub-text">No services enabled yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="view-section">
            <h4 className="view-section-title">
              <span>Assigned Providers</span>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                onClick={() => openManageProviders(viewArea)}
              >
                + Manage Providers
              </button>
            </h4>
            {viewArea.providers.length ? (
              <div className="sa-provider-list">
                {viewArea.providers.map((provider) => (
                  <div className="sa-provider-row" key={provider.id}>
                    <div className="sa-provider-left">
                      <div className="sa-provider-avatar">{initials(provider.name)}</div>
                      <div className="sa-provider-text">
                        <strong>{provider.name}</strong>
                        <span>{provider.specialty} • {provider.vehicles} vehicles • {provider.contact}</span>
                      </div>
                    </div>
                    <div className="sa-provider-meta">
                      <span className="sa-rating">★ {provider.rating.toFixed(1)}</span>
                      <span className={`status-pill ${provider.status.toLowerCase()}`}>
                        <span className="status-dot" />
                        {provider.status}
                      </span>
                      <button
                        type="button"
                        className="action-btn toggle-deactivate"
                        onClick={() => unassignProvider(viewArea.id, provider.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-states-panel" style={{ padding: '28px 16px' }}>
                <div className="empty-icon">🚚</div>
                <h4>No providers assigned</h4>
                <p>Assign at least one provider so bookings inside this coverage zone can be fulfilled.</p>
                <button type="button" className="btn-primary" onClick={() => openManageProviders(viewArea)}>Manage Providers</button>
              </div>
            )}
          </div>

          <div className="sa-detail-grid">
            <div className="view-section">
              <h4 className="view-section-title"><span>Operating Hours</span><span style={{ fontSize: '0.72rem', color: '#64748b' }}>Local time</span></h4>
              <div className="sa-hours-list">
                {viewArea.hours.map((hour) => (
                  <div className={`sa-hours-item ${hour.closed ? 'closed' : ''}`} key={hour.day}>
                    <span>{hour.day}</span>
                    <strong>{hour.closed ? 'Closed' : `${hour.open} – ${hour.close}`}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="view-section">
              <h4 className="view-section-title"><span>Pricing</span><span style={{ fontSize: '0.72rem', color: '#64748b' }}>₹ INR</span></h4>
              <div className="sa-pricing-list">
                <div className="sa-pricing-row"><span>Base fare</span><strong>₹{viewArea.pricing.baseFare}</strong></div>
                <div className="sa-pricing-row"><span>Per kilometre</span><strong>₹{viewArea.pricing.perKm}</strong></div>
                <div className="sa-pricing-row"><span>Per hour</span><strong>₹{viewArea.pricing.perHour}</strong></div>
                <div className="sa-pricing-row"><span>Minimum fare</span><strong>₹{viewArea.pricing.minimumFare}</strong></div>
                <div className="sa-pricing-row"><span>Surge multiplier</span><strong>{viewArea.pricing.surgeMultiplier}×</strong></div>
              </div>
            </div>
          </div>

          <div className="view-section">
            <h4 className="view-section-title"><span>Recent Activity</span></h4>
            <div className="activity-timeline">
              {viewArea.recentActivity.map((activity) => (
                <div className="activity-timeline-item" key={activity.id}>
                  <span className={`activity-dot ${activity.tone}`} />
                  <div className="activity-content">
                    <strong>{activity.action}</strong>
                    <span className="activity-meta">
                      <span>{activity.actor}</span>
                      <span>•</span>
                      <span>{activity.timestamp}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {formModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm()
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sa-form-title"
        >
          <div className="modal-card sa-form-modal">
            <header className="modal-header">
              <div className="modal-header-info">
                <h3 id="sa-form-title">{isEditMode ? `Edit Service Area — ${editTarget?.name}` : 'Add New Service Area'}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={closeForm} aria-label="Close form">
                ×
              </button>
            </header>

            <form onSubmit={handleFormSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="sa-form-section">
                  <h4 className="sa-form-section-title"><span>Basic Details</span><span>Step 1</span></h4>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Area Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Andheri East Corridor"
                      />
                    </div>
                    <div className="form-field">
                      <label>Short Code *</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={form.code}
                        onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g. SAE"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>City *</label>
                      <select
                        value={form.cityName}
                        onChange={(e) => setForm((prev) => ({ ...prev, cityName: e.target.value }))}
                      >
                        {cityNames.map((city) => (
                          <option key={city} value={city}>
                            {city} {cityAnchors[city] ? `• ${cityAnchors[city].stateName}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Status</label>
                      <div className="sa-radio-row">
                        <label className={`sa-radio-pill ${form.status === 'Active' ? 'active-on' : ''}`}>
                          <input
                            type="radio"
                            name="sa-status"
                            checked={form.status === 'Active'}
                            onChange={() => setForm((prev) => ({ ...prev, status: 'Active' }))}
                          />
                          Active
                        </label>
                        <label className={`sa-radio-pill ${form.status === 'Inactive' ? 'active-off' : ''}`}>
                          <input
                            type="radio"
                            name="sa-status"
                            checked={form.status === 'Inactive'}
                            onChange={() => setForm((prev) => ({ ...prev, status: 'Inactive' }))}
                          />
                          Inactive
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this service area covers, access rules and typical demand..."
                    />
                  </div>
                </div>

                <div className="sa-form-section">
                  <h4 className="sa-form-section-title">
                    <span>Coverage Location & Radius</span>
                    <span>Step 2 • Interactive map</span>
                  </h4>
                  <CoverageMap
                    center={form.center}
                    radiusKm={form.radiusKm}
                    coverageType={form.coverageType}
                    cityName={form.cityName}
                    interactive
                    onChange={(point) => setForm((prev) => ({ ...prev, center: point }))}
                  />
                  <div className="sa-map-legend">
                    <span className="sa-legend-chip"><span className="sa-legend-dot" /> Centre {formatLatLng(form.cityName, form.center)}</span>
                    <span className="sa-legend-chip"><span className="sa-legend-dot blue" /> Radius {form.radiusKm} km</span>
                    <span className="sa-legend-chip">{coverageTypeHint(form.coverageType)}</span>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Coverage Type *</label>
                      <select
                        value={form.coverageType}
                        onChange={(e) => setForm((prev) => ({ ...prev, coverageType: e.target.value as CoverageType }))}
                      >
                        {coverageTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Service Radius (km) *</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={form.radiusKm}
                        onChange={(e) => setForm((prev) => ({ ...prev, radiusKm: clamp(Number(e.target.value) || 1, 1, 60) }))}
                      />
                      <span className="form-hint">Drag on the map to move the centre; radius drives the coverage circle.</span>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>ZIP / PIN Codes</label>
                    <input
                      type="text"
                      value={form.pinCodes}
                      onChange={(e) => setForm((prev) => ({ ...prev, pinCodes: e.target.value }))}
                      placeholder="e.g. 400059, 400060, 400061"
                    />
                    <span className="form-hint">
                      {form.pinCodes.split(',').map((p) => p.trim()).filter(Boolean).length} PIN code(s) parsed — separate with commas.
                    </span>
                  </div>
                </div>

                <div className="sa-form-section">
                  <h4 className="sa-form-section-title">
                    <span>Available Services</span>
                    <span>{form.services.length} selected</span>
                  </h4>
                  <div className="sa-check-grid">
                    {serviceCatalog.map((service) => {
                      const checked = form.services.includes(service)
                      return (
                        <label className={`sa-check-item ${checked ? 'checked' : ''}`} key={service}>
                          <input type="checkbox" checked={checked} onChange={() => toggleService(service)} />
                          {service}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="sa-form-section">
                  <h4 className="sa-form-section-title"><span>Operating Hours</span><span>Step 3</span></h4>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {form.hours.map((hour, index) => (
                      <div className={`sa-hours-row ${hour.closed ? 'is-closed' : ''}`} key={hour.day}>
                        <strong>{hour.day}</strong>
                        <input
                          type="time"
                          value={hour.open}
                          disabled={hour.closed}
                          onChange={(e) => updateHour(index, { open: e.target.value })}
                          aria-label={`${hour.day} opening time`}
                        />
                        <input
                          type="time"
                          value={hour.close}
                          disabled={hour.closed}
                          onChange={(e) => updateHour(index, { close: e.target.value })}
                          aria-label={`${hour.day} closing time`}
                        />
                        <label className="sa-closed-toggle">
                          <input
                            type="checkbox"
                            checked={hour.closed}
                            onChange={(e) => updateHour(index, { closed: e.target.checked })}
                          />
                          Closed
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sa-form-section">
                  <h4 className="sa-form-section-title"><span>Pricing</span><span>Step 4 • ₹ INR</span></h4>
                  <div className="sa-price-grid">
                    <div className="form-field">
                      <label>Base Fare</label>
                      <input
                        type="number"
                        min={0}
                        value={form.pricing.baseFare}
                        onChange={(e) => setForm((prev) => ({ ...prev, pricing: { ...prev.pricing, baseFare: Number(e.target.value) || 0 } }))}
                      />
                    </div>
                    <div className="form-field">
                      <label>Per Km</label>
                      <input
                        type="number"
                        min={0}
                        value={form.pricing.perKm}
                        onChange={(e) => setForm((prev) => ({ ...prev, pricing: { ...prev.pricing, perKm: Number(e.target.value) || 0 } }))}
                      />
                    </div>
                    <div className="form-field">
                      <label>Per Hour</label>
                      <input
                        type="number"
                        min={0}
                        value={form.pricing.perHour}
                        onChange={(e) => setForm((prev) => ({ ...prev, pricing: { ...prev.pricing, perHour: Number(e.target.value) || 0 } }))}
                      />
                    </div>
                    <div className="form-field">
                      <label>Minimum Fare</label>
                      <input
                        type="number"
                        min={0}
                        value={form.pricing.minimumFare}
                        onChange={(e) => setForm((prev) => ({ ...prev, pricing: { ...prev.pricing, minimumFare: Number(e.target.value) || 0 } }))}
                      />
                    </div>
                    <div className="form-field">
                      <label>Surge (×)</label>
                      <input
                        type="number"
                        min={1}
                        max={3}
                        step={0.05}
                        value={form.pricing.surgeMultiplier}
                        onChange={(e) => setForm((prev) => ({ ...prev, pricing: { ...prev.pricing, surgeMultiplier: Number(e.target.value) || 1 } }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className={isEditMode ? 'btn-primary' : 'btn-primary geo-add-action'}>
                  {isEditMode ? 'Save Changes' : 'Add Service Area'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {manageTarget && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1010 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setManageTarget(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sa-providers-title"
        >
          <div className="modal-card sa-provider-modal">
            <header className="modal-header">
              <div className="modal-header-info">
                <div>
                  <h3 id="sa-providers-title">Manage Providers</h3>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 3 }}>
                    {manageTarget.name} • {manageTarget.providers.length} assigned
                  </div>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setManageTarget(null)} aria-label="Close manage providers">
                ×
              </button>
            </header>

            <div className="modal-body">
              <div className="view-section" style={{ background: '#fff' }}>
                <h4 className="view-section-title"><span>Currently Assigned</span></h4>
                {manageTarget.providers.length ? (
                  <div className="sa-provider-list">
                    {manageTarget.providers.map((provider) => (
                      <div className="sa-provider-row" key={provider.id}>
                        <div className="sa-provider-left">
                          <div className="sa-provider-avatar">{initials(provider.name)}</div>
                          <div className="sa-provider-text">
                            <strong>{provider.name}</strong>
                            <span>{provider.specialty} • {provider.vehicles} vehicles • {provider.contact}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="action-btn toggle-deactivate"
                          onClick={() => unassignProvider(manageTarget.id, provider.id)}
                        >
                          Unassign
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>
                    No providers are assigned to this coverage zone yet.
                  </p>
                )}
              </div>

              <div className="view-section" style={{ background: '#fff' }}>
                <h4 className="view-section-title">
                  <span>Assign From Provider Network</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{suggestedProviders.length} available</span>
                </h4>
                <input
                  type="text"
                  className="bookings-search-input"
                  placeholder="Search providers by name or specialty..."
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  aria-label="Search available providers"
                />
                {suggestedProviders.length ? (
                  <div className="sa-provider-list">
                    {suggestedProviders.map((provider) => (
                      <div className="sa-provider-row" key={provider.id}>
                        <div className="sa-provider-left">
                          <div className="sa-provider-avatar" style={{ background: 'linear-gradient(135deg, #0ea56f, #08a66c)' }}>
                            {initials(provider.name)}
                          </div>
                          <div className="sa-provider-text">
                            <strong>{provider.name}</strong>
                            <span>{provider.specialty} • {provider.vehicles} vehicles • ★ {provider.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="action-btn toggle-activate"
                          onClick={() => assignProvider(manageTarget.id, provider)}
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>
                    {providerSearch ? 'No unassigned providers match your search.' : 'Every provider in the network is already assigned.'}
                  </p>
                )}
              </div>

              <form className="view-section" style={{ background: '#fff' }} onSubmit={addAndAssignProvider}>
                <h4 className="view-section-title"><span>Onboard New Provider</span></h4>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Provider Name *</label>
                    <input
                      type="text"
                      value={newProvider.name}
                      onChange={(e) => setNewProvider((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Mumbai Heavy Lifts"
                    />
                  </div>
                  <div className="form-field">
                    <label>Contact Number *</label>
                    <input
                      type="text"
                      value={newProvider.contact}
                      onChange={(e) => setNewProvider((prev) => ({ ...prev, contact: e.target.value }))}
                      placeholder="+91 98000 00000"
                    />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Operations Email</label>
                    <input
                      type="email"
                      value={newProvider.email}
                      onChange={(e) => setNewProvider((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="ops@provider.in"
                    />
                  </div>
                  <div className="form-field">
                    <label>Vehicles</label>
                    <input
                      type="number"
                      min={0}
                      value={newProvider.vehicles}
                      onChange={(e) => setNewProvider((prev) => ({ ...prev, vehicles: Number(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Specialty</label>
                  <input
                    type="text"
                    value={newProvider.specialty}
                    onChange={(e) => setNewProvider((prev) => ({ ...prev, specialty: e.target.value }))}
                    placeholder="e.g. Cranes & Boom Lifts"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-primary geo-add-action">Add & Assign</button>
                </div>
              </form>
            </div>

            <footer className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setManageTarget(null)}>
                Done
              </button>
            </footer>
          </div>
        </div>
      )}

      {confirm && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1080 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirm(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sa-confirm-title"
        >
          <div className="modal-card sa-confirm-card">
            <div className="modal-body sa-confirm-body">
              <div className={`sa-confirm-icon ${confirm.confirmLabel === 'Deactivate' ? 'warn' : ''}`}>
                {confirm.confirmLabel === 'Deactivate' ? '⚠' : '🗑'}
              </div>
              <h4 id="sa-confirm-title">{confirm.title}</h4>
              <p>{confirm.message}</p>
            </div>
            <footer className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={confirm.confirmLabel === 'Deactivate' ? 'btn-warn' : 'btn-danger'}
                onClick={() => {
                  confirm.onConfirm()
                  setConfirm(null)
                }}
              >
                {confirm.confirmLabel}
              </button>
            </footer>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="states-toast" role="status">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

function coverageTypeHint(type: CoverageType) {
  if (type === 'Radius') return 'Circular coverage from centre'
  if (type === 'ZIP / PIN Codes') return 'Coverage limited to PIN codes'
  return 'Custom drawn boundary'
}

