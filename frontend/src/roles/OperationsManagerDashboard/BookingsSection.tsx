import { useMemo, useState } from 'react'
import { StatusPill } from './shared'
import { availableOperators, type OpsBooking } from './operationsData'
import FilterBar, { filterBarStyles } from './FilterBar'
import { emptyDateRange, type DateRange } from './dateRange'

export type BookingEdit = {
  customer: string
  machine: string
  amount: string
  window: string
}

type BookingsSectionProps = {
  bookings: OpsBooking[]
  onEdit: (id: string, patch: BookingEdit, reason: string) => void
  onReassign: (id: string, operatorName: string, reason: string) => void
  onResolve: (id: string, reason: string) => void
  onCancel: (id: string, reason: string) => void
}

type ManageMode = 'edit' | 'reassign' | 'resolve' | 'cancel'

const BOOKING_STATUSES = ['Confirmed', 'Active', 'Completed', 'Cancelled'] as const

export default function BookingsSection({ bookings, onEdit, onReassign, onResolve, onCancel }: BookingsSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [mode, setMode] = useState<ManageMode>('edit')
  const [patch, setPatch] = useState<BookingEdit>({ customer: '', machine: '', amount: '', window: '' })
  const [operatorId, setOperatorId] = useState('')
  const [reason, setReason] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [machineFilter, setMachineFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>(emptyDateRange)

  const machines = useMemo(() => Array.from(new Set(bookings.map((booking) => booking.machine))).sort(), [bookings])
  const zones = useMemo(() => Array.from(new Set(bookings.map((booking) => booking.zone))).sort(), [bookings])

  const visibleBookings = useMemo(() => {
    const term = search.trim().toLowerCase()
    return bookings.filter((booking) => {
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false
      if (machineFilter !== 'all' && booking.machine !== machineFilter) return false
      if (zoneFilter !== 'all' && booking.zone !== zoneFilter) return false
      if (dateRange.from && booking.bookedOn < dateRange.from) return false
      if (dateRange.to && booking.bookedOn > dateRange.to) return false
      if (!term) return true
      return [booking.id, booking.customer, booking.machine, booking.operator, booking.zone, booking.city]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [bookings, search, statusFilter, machineFilter, zoneFilter, dateRange])

  const openBooking = bookings.find((booking) => booking.id === openId) ?? null

  const toggleManage = (booking: OpsBooking) => {
    if (openId === booking.id) {
      setOpenId(null)
      return
    }
    setOpenId(booking.id)
    setMode('edit')
    setPatch({ customer: booking.customer, machine: booking.machine, amount: booking.amount, window: booking.window })
    setOperatorId('')
    setReason('')
  }

  const canSubmit =
    openBooking !== null &&
    reason.trim().length >= 4 &&
    (mode === 'edit' ||
      mode === 'resolve' ||
      mode === 'cancel' ||
      (mode === 'reassign' && operatorId !== ''))

  const submit = () => {
    if (!openBooking || !canSubmit) return
    const id = openBooking.id
    const clean = reason.trim()
    if (mode === 'edit') onEdit(id, patch, clean)
    else if (mode === 'reassign') {
      const operator = availableOperators.find((entry) => entry.id === operatorId)
      onReassign(id, operator?.name ?? operatorId, clean)
    } else if (mode === 'resolve') onResolve(id, clean)
    else onCancel(id, clean)
    setOpenId(null)
  }

  return (
    <section className="sa-panel">
      <style>{filterBarStyles}</style>
      <div className="sa-panel-header">
        <h3>Bookings</h3>
        <span className="sa-panel-sub">
          booking.manage · update, reassign, resolve stuck jobs or cancel with a recorded reason
        </span>
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search bookings"
        searchPlaceholder="Search booking, customer, machine or operator..."
        selects={[
          {
            id: 'status',
            label: 'Filter by booking status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All statuses' },
              ...BOOKING_STATUSES.map((status) => ({ value: status, label: status })),
            ],
          },
          {
            id: 'machine',
            label: 'Filter by machine',
            value: machineFilter,
            onChange: setMachineFilter,
            options: [
              { value: 'all', label: 'All machines' },
              ...machines.map((machine) => ({ value: machine, label: machine })),
            ],
          },
          {
            id: 'zone',
            label: 'Filter by zone',
            value: zoneFilter,
            onChange: setZoneFilter,
            options: [
              { value: 'all', label: 'All zones' },
              ...zones.map((zone) => ({ value: zone, label: zone })),
            ],
          },
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateLabel="Filter bookings by booked date"
        resultLabel={`${visibleBookings.length} of ${bookings.length} bookings`}
      />
      <div className="sa-table-wrap">
        <table className="sa-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Route</th>
              <th>Machine</th>
              <th>Window</th>
              <th>Amount</th>
              <th>Operator</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleBookings.map((booking) => (
              <tr key={booking.id} className={openId === booking.id ? 'sa-row-selected' : ''}>
                <td className="sa-cell-strong">
                  {booking.id}
                  <span className="sa-cell-sub">
                    {booking.customer} · booked {booking.bookedOn}
                  </span>
                </td>
                <td>
                  {booking.zone}
                  <span className="sa-cell-sub">{booking.city}</span>
                </td>
                <td>{booking.machine}</td>
                <td>{booking.window}</td>
                <td className="sa-num">{booking.amount}</td>
                <td>{booking.operator}</td>
                <td>
                  <StatusPill status={booking.status} />
                  {booking.stuck && (
                    <>
                      {' '}
                      <StatusPill status="Stuck" />
                    </>
                  )}
                </td>
                <td>
                  <button type="button" className="sa-btn-ghost" onClick={() => toggleManage(booking)}>
                    {openId === booking.id ? 'Close' : 'Manage'}
                  </button>
                </td>
              </tr>
            ))}
            {visibleBookings.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="sa-empty">
                    <p>No bookings match the current filters.</p>
                  </div>
                </td>
              </tr>
            )}
            {openBooking && (
              <tr className="sa-expand-row">
                <td colSpan={8}>
                  <div className="ops-manage-grid">
                    <div className="ops-history">
                      <strong>Status history</strong>
                      <ul>
                        {openBooking.history.map((entry) => (
                          <li key={`${entry.time}-${entry.event}`}>
                            <span>{entry.time}</span> {entry.event}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="ops-manage-form">
                      <div className="sa-chip-row">
                        {(
                          [
                            ['edit', 'Update details'],
                            ['reassign', 'Reassign operator'],
                            ['resolve', 'Resolve stuck'],
                            ['cancel', 'Cancel booking'],
                          ] as Array<[ManageMode, string]>
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            className={`sa-chip ${mode === value ? 'active orange' : ''}`}
                            onClick={() => {
                              setMode(value)
                              setReason('')
                              setOperatorId('')
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {mode === 'edit' && (
                        <div className="ops-edit-grid">
                          {(
                            [
                              ['customer', 'Customer'],
                              ['machine', 'Machine'],
                              ['amount', 'Amount'],
                              ['window', 'Window'],
                            ] as Array<[keyof BookingEdit, string]>
                          ).map(([field, label]) => (
                            <label key={field} className="ops-field">
                              {label}
                              <input
                                className="sa-input"
                                value={patch[field]}
                                onChange={(event) => setPatch({ ...patch, [field]: event.target.value })}
                              />
                            </label>
                          ))}
                        </div>
                      )}

                      {mode === 'reassign' && (
                        <label className="ops-field">
                          New operator
                          <select className="sa-select" value={operatorId} onChange={(event) => setOperatorId(event.target.value)}>
                            <option value="">Select operator…</option>
                            {availableOperators.map((operator) => (
                              <option key={operator.id} value={operator.id}>
                                {operator.name} · {operator.zone} ({operator.city})
                              </option>
                            ))}
                          </select>
                        </label>
                      )}

                      <label className="ops-field ops-field-grow">
                        Reason (required, recorded in history)
                        <input
                          className="sa-input"
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          placeholder={
                            mode === 'cancel'
                              ? 'Why is this booking being cancelled?'
                              : mode === 'resolve'
                                ? 'What fixed the stuck job?'
                                : 'What needs correcting?'
                          }
                        />
                      </label>

                      <div className="ops-field-actions">
                        <button
                          type="button"
                          className={`sa-btn ${mode === 'cancel' ? 'reject' : 'approve'}`}
                          disabled={!canSubmit}
                          onClick={submit}
                        >
                          {mode === 'edit'
                            ? 'Save changes'
                            : mode === 'reassign'
                              ? 'Reassign'
                              : mode === 'resolve'
                                ? 'Mark resolved'
                                : 'Cancel booking'}
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
