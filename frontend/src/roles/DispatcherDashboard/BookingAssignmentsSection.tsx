import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import type { AssignmentSlot, Booking, BookingStatus, DispatcherOperator, Equipment } from './dispatcherData'

type BookingAssignmentsSectionProps = {
  bookings: Booking[]
  equipment: Equipment[]
  operators: DispatcherOperator[]
  assignmentSlots: AssignmentSlot[]
  onAssign: (assignment: {
    bookingId: string
    equipmentId: string
    operatorId: string
    startDate: string
    endDate: string
    startTime: string
    durationHours: number
  }) => void
  onSchedule: (bookingId: string, startDate: string, startTime: string) => void
}

const statusFilters: Array<'All' | BookingStatus> = ['All', 'Confirmed', 'Pending', 'Assigned', 'Scheduled', 'On Hold']

export default function BookingAssignmentsSection({
  bookings,
  equipment,
  operators,
  assignmentSlots,
  onAssign,
  onSchedule,
}: BookingAssignmentsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All')
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [equipmentId, setEquipmentId] = useState('')
  const [operatorId, setOperatorId] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [conflictMsg, setConflictMsg] = useState('')

  const selectedBooking = bookings.find((b) => b.bookingId === selectedBookingId) ?? null

  const visibleBookings = useMemo(() => {
    if (statusFilter === 'All') return bookings
    return bookings.filter((b) => b.status === statusFilter)
  }, [bookings, statusFilter])

  const matchingEquipment = useMemo(() => {
    if (!selectedBooking) return []
    return equipment
      .filter((eq) => eq.type === selectedBooking.requiredType && eq.owner === selectedBooking.owner)
      .sort((a, b) => Number(b.status === 'Available') - Number(a.status === 'Available'))
  }, [selectedBooking, equipment])

  const matchingOperators = useMemo(() => {
    if (!selectedBooking) return []
    return operators
      .filter((op) => op.zone === selectedBooking.zone || op.vehicleType === selectedBooking.requiredType)
      .sort((a, b) => {
        const rank = { Available: 0, 'On the way': 1, Returning: 2, 'At site': 3, Assigned: 4, Offline: 6 } as Record<string, number>
        return (rank[a.status] ?? 5) - (rank[b.status] ?? 5) || a.distanceKm - b.distanceKm
      })
  }, [selectedBooking, operators])

  const hasConflict = useMemo(() => {
    if (!selectedBooking || !equipmentId || !scheduleDate || !scheduleTime) return false
    return assignmentSlots.some((slot) => {
      if (slot.equipmentId !== equipmentId) return false
      if (slot.startDate === scheduleDate && slot.startTime === scheduleTime) return true
      if (slot.startDate === scheduleDate && slot.bookingId !== selectedBooking.bookingId) {
        const start = parseInt(scheduleTime.replace(':', ''))
        const end = start + (selectedBooking.durationHours * 100)
        const sStart = parseInt(slot.startTime.replace(':', ''))
        const sEnd = sStart + (slot.durationHours * 100)
        return start < sEnd && end > sStart
      }
      return false
    })
  }, [selectedBooking, equipmentId, scheduleDate, scheduleTime, assignmentSlots])

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId === selectedBookingId ? null : bookingId)
    setEquipmentId('')
    setOperatorId('')
    setScheduleDate('')
    setScheduleTime('')
    setConflictMsg('')
    const booking = bookings.find((b) => b.bookingId === bookingId)
    if (booking) {
      setScheduleDate(booking.startDate)
      setScheduleTime(booking.startTime)
    }
  }

  const submitAssignment = () => {
    if (!selectedBooking || !equipmentId || !operatorId || !scheduleDate || !scheduleTime) return
    if (hasConflict) {
      setConflictMsg('Conflict detected: Equipment already assigned in this time slot.')
      return
    }
    setConflictMsg('')
    onAssign({
      bookingId: selectedBooking.bookingId,
      equipmentId,
      operatorId,
      startDate: scheduleDate,
      endDate: selectedBooking.endDate,
      startTime: scheduleTime,
      durationHours: selectedBooking.durationHours,
    })
    setSelectedBookingId(null)
    setEquipmentId('')
    setOperatorId('')
  }

  const submitSchedule = () => {
    if (!selectedBooking || !scheduleDate || !scheduleTime) return
    if (hasConflict) {
      setConflictMsg('Conflict detected: Cannot schedule due to equipment conflict.')
      return
    }
    setConflictMsg('')
    onSchedule(selectedBooking.bookingId, scheduleDate, scheduleTime)
  }

  return (
    <>
      <style>{`
        .ba-grid { display: grid; gap: 16px; }
        .ba-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 18px 0; }
        .ba-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .ba-chip {
          border: 1px solid transparent;
          border-radius: 999px;
          background: #f3f6f7;
          color: var(--sa-muted, #8a96a6);
          padding: 6px 12px;
          font: inherit;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
        }
        .ba-chip.active { background: rgba(255, 107, 44, 0.12); color: var(--sa-brand-deep, #ef4a12); }
        .ba-meta { margin-left: auto; font-size: 0.76rem; color: var(--sa-muted, #8a96a6); font-weight: 600; }
        .ba-table-wrap { overflow-x: auto; }
        .ba-table { width: 100%; border-collapse: collapse; min-width: 980px; }
        .ba-table thead th {
          text-align: left;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--sa-muted, #8a96a6);
          font-weight: 800;
          padding: 12px 18px;
          background: linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0) 100%);
          border-bottom: 1px solid rgba(15, 23, 42, 0.06);
        }
        .ba-table tbody td { padding: 14px 18px; border-bottom: 1px solid rgba(15, 23, 42, 0.05); font-size: 0.88rem; vertical-align: middle; }
        .ba-table tbody tr:hover { background: rgba(248, 250, 252, 0.7); }
        .ba-table tbody tr.selected { background: rgba(255, 107, 44, 0.06); }
        .ba-cell-strong { font-weight: 700; }
        .ba-cell-sub { display: block; margin-top: 2px; font-size: 0.74rem; color: var(--sa-muted, #8a96a6); font-weight: 600; }
        .ba-num { font-variant-numeric: tabular-nums; }
        .ba-action { border: 1px solid rgba(15, 23, 42, 0.1); border-radius: 999px; padding: 7px 14px; background: transparent; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
        .ba-action.primary { border-color: rgba(255, 107, 44, 0.6); color: var(--sa-brand-deep, #ef4a12); font-weight: 600; }
        .ba-panel { background: var(--sa-card-bg, #fff); border: 1px solid var(--sa-line, rgba(15,23,42,0.08)); border-radius: 22px; box-shadow: 0 12px 28px rgba(15,23,42,0.05); overflow: hidden; }
        .ba-panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 18px 12px; border-bottom: 1px solid rgba(15,23,42,0.06); }
        .ba-panel-header h3 { margin: 0; font-size: 1.02rem; letter-spacing: -0.03em; }
        .ba-panel-sub { font-size: 0.76rem; color: var(--sa-muted, #8a96a6); font-weight: 600; }
        .ba-form-grid { display: grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: 12px; padding: 16px 18px; }
        .ba-field { grid-column: span 6; display: grid; gap: 6px; font-size: 0.8rem; font-weight: 700; }
        .ba-field.full { grid-column: 1 / -1; }
        .ba-input, .ba-select { border: 1px solid rgba(15,23,42,0.12); border-radius: 12px; padding: 9px 12px; font: inherit; font-size: 0.86rem; }
        .ba-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .ba-btn { border: 1px solid rgba(15,23,42,0.12); background: transparent; border-radius: 999px; padding: 9px 16px; font: inherit; font-size: 0.82rem; font-weight: 800; cursor: pointer; }
        .ba-btn.primary { background: linear-gradient(135deg, var(--sa-brand, #ff6b2c), var(--sa-brand-deep, #ef4a12)); color: #fff; border-color: transparent; }
        .ba-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ba-conflict { grid-column: 1 / -1; font-size: 0.82rem; font-weight: 700; color: #b91c1c; }
        .ba-table-sm { width: 100%; border-collapse: collapse; }
        .ba-table-sm thead th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--sa-muted, #8a96a6); padding: 10px 18px; border-bottom: 1px solid rgba(15,23,42,0.06); }
        .ba-table-sm tbody td { padding: 12px 18px; border-bottom: 1px solid rgba(15,23,42,0.05); font-size: 0.86rem; }
        .ba-table-sm tbody tr:last-child td { border-bottom: 0; }
      `}</style>

      <div className="ba-grid">
        <section className="ba-panel">
          <div className="ba-panel-header">
            <div>
              <h3>Booking assignments</h3>
            </div>
            <StatusPill status={visibleBookings.filter((b) => b.status === 'Confirmed').length > 0 ? 'Open' : 'Normal'} />
          </div>
          <div className="ba-toolbar">
            <div className="ba-chip-row">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`ba-chip ${statusFilter === filter ? 'active' : ''}`}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span className="ba-meta">{visibleBookings.length} booking{visibleBookings.length === 1 ? '' : 's'}</span>
          </div>
          <div className="ba-table-wrap">
            <table className="ba-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer / Owner</th>
                  <th>Site</th>
                  <th>Requirement</th>
                  <th>Schedule</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => (
                  <tr key={booking.bookingId} className={selectedBookingId === booking.bookingId ? 'selected' : ''}>
                    <td className="ba-cell-strong">
                      {booking.bookingId}
                      <span className="ba-cell-sub">{booking.id}</span>
                    </td>
                    <td>
                      {booking.customer}
                      <span className="ba-cell-sub">{booking.owner}</span>
                    </td>
                    <td>
                      {booking.zone}, {booking.city}
                      <span className="ba-cell-sub">{booking.siteAddress}</span>
                    </td>
                    <td>
                      {booking.requiredType} × {booking.quantity}
                      {booking.machine && <span className="ba-cell-sub">{booking.machine}</span>}
                    </td>
                    <td className="ba-num">
                      {booking.startDate} {booking.startTime}
                      <span className="ba-cell-sub">{booking.durationHours}h · {booking.endDate}</span>
                    </td>
                    <td>
                      <StatusPill status={booking.priority === 'Urgent' ? 'Urgent' : 'Normal'} />
                    </td>
                    <td>
                      <StatusPill status={booking.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="ba-action" style={{ fontWeight: 600 }} onClick={() => handleSelectBooking(booking.bookingId)}>
                        {selectedBookingId === booking.bookingId ? 'Close' : 'Review & assign'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedBooking && (
          <section className="ba-panel">
            <div className="ba-panel-header">
              <div>
                <h3 style={{ fontWeight: 700 }}>Assign & schedule · {selectedBooking.bookingId}</h3>
                <span className="ba-panel-sub">{selectedBooking.customer} · {selectedBooking.zone} · Needs {selectedBooking.requiredType}</span>
              </div>
              <StatusPill status={selectedBooking.status} />
            </div>
            <div className="ba-form-grid">
              <label className="ba-field" style={{ fontWeight: 600 }}>
                Delivery / start date
                <input type="date" className="ba-input" value={scheduleDate} onChange={(e) => { setScheduleDate(e.target.value); setConflictMsg('') }} />
              </label>
              <label className="ba-field" style={{ fontWeight: 600 }}>
                Start time
                <input type="time" className="ba-input" value={scheduleTime} onChange={(e) => { setScheduleTime(e.target.value); setConflictMsg('') }} />
              </label>
              <div className="ba-field full" style={{ fontWeight: 600 }}>
                <span>Equipment (filtered by type & owner)</span>
                <select className="ba-select" value={equipmentId} onChange={(e) => { setEquipmentId(e.target.value); setConflictMsg('') }}>
                  <option value="">Select equipment</option>
                  {matchingEquipment.map((eq) => (
                    <option key={eq.id} value={eq.id} disabled={eq.status !== 'Available'}>
                      {eq.machine} · {eq.id} · {eq.zone} · {eq.status} · {eq.rate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ba-field full" style={{ fontWeight: 600 }}>
                <span>Operator (nearby / suitable)</span>
                <select className="ba-select" value={operatorId} onChange={(e) => setOperatorId(e.target.value)}>
                  <option value="">Select operator</option>
                  {matchingOperators.map((op) => (
                    <option key={op.id} value={op.id} disabled={op.status === 'Offline'}>
                      {op.name} · {op.vehicle} · {op.zone} · {op.status} · {op.distanceKm}km · ★{op.rating}
                    </option>
                  ))}
                </select>
              </div>
              {conflictMsg && <div className="ba-conflict">{conflictMsg}</div>}
              <div className="ba-actions">
                <button type="button" className="ba-btn" style={{ fontWeight: 600 }} onClick={submitSchedule} disabled={!scheduleDate || !scheduleTime || hasConflict}>
                  Update schedule
                </button>
                <button type="button" className="ba-btn primary" style={{ fontWeight: 600 }} onClick={submitAssignment} disabled={!equipmentId || !operatorId || !scheduleDate || !scheduleTime || hasConflict}>
                  Assign equipment & operator
                </button>
                <span className="ba-panel-sub">Prevents conflicting assignments by equipment/time overlap</span>
              </div>
            </div>
          </section>
        )}

        <section className="ba-panel">
          <div className="ba-panel-header">
            <div>
              <h3>Active assignments</h3>
              <span className="ba-panel-sub">Equipment/operator scheduled against bookings</span>
            </div>
          </div>
          <div className="ba-table-wrap">
            <table className="ba-table-sm">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Equipment</th>
                  <th>Operator</th>
                  <th>Schedule</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {assignmentSlots.map((slot) => {
                  const eq = equipment.find((e) => e.id === slot.equipmentId)
                  const op = operators.find((o) => o.id === slot.operatorId)
                  return (
                    <tr key={`${slot.bookingId}-${slot.equipmentId}-${slot.startTime}`}>
                      <td className="ba-cell-strong">{slot.bookingId}</td>
                      <td>
                        {eq?.machine || slot.equipmentId}
                        <span className="ba-cell-sub">{eq?.owner}</span>
                      </td>
                      <td>
                        {op?.name || slot.operatorId}
                        <span className="ba-cell-sub">{op?.vehicle}</span>
                      </td>
                      <td className="ba-num">
                        {slot.startDate} {slot.startTime}
                        <span className="ba-cell-sub">to {slot.endDate}</span>
                      </td>
                      <td className="ba-num">{slot.durationHours}h</td>
                    </tr>
                  )
                })}
                {assignmentSlots.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '18px' }}>
                      <span className="ba-panel-sub">No active assignments yet</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
