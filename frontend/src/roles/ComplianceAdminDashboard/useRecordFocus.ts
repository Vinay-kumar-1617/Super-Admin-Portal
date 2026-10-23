import { useEffect, useRef } from 'react'

/**
 * Highlights and scrolls to a register row opened from a notification.
 *
 * The ref is only attached to the focused row, so mounting a section from a
 * deep link brings the linked record into view once and leaves the rest of the
 * table alone.
 */
export function useFocusRow(key: string | boolean | undefined) {
  const ref = useRef<HTMLTableRowElement | null>(null)

  useEffect(() => {
    if (key) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [key])

  return ref
}
