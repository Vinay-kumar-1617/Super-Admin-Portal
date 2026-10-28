import { useCallback, useState } from 'react'
import {
  auditLog as seedAudit,
  categoryTargetMap,
  liveConversations as seedConversations,
  savedReplies,
  supportEscalations as seedEscalations,
  supportPaymentIssues as seedPaymentIssues,
  supportRefunds as seedRefunds,
  tickets as seedTickets,
  type AuditEntry,
  type EscalationCategory,
  type EscalationTarget,
  type ChatAttachment,
  type ChatStatus,
  type LiveConversation,
  type SavedReply,
  type SectionId,
  type SupportEscalation,
  type SupportPaymentIssue,
  type PaymentResolutionStatus,
  type SupportRefund,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
} from './supportAdminData'

const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ')
const clock = () => new Date().toTimeString().slice(0, 5)
const makeId = (prefix: string) => `${prefix}-${Date.now().toString().slice(-6)}`

export type NewRefundInput = {
  booking: string
  ticket: string
  customer: string
  amount: number
  reason: string
  cap: number
}

export type NewEscalationInput = {
  subject: string
  category: EscalationCategory
  reason: string
  ticket: string
}

const problemCategory: Record<string, { category: TicketCategory; priority: TicketPriority }> = {
  'Late operator': { category: 'Operator', priority: 'High' },
  'Wrong location': { category: 'Booking', priority: 'High' },
  'Booking question': { category: 'Booking', priority: 'Normal' },
}

export function useSupportAdmin() {
  const [ticketList, setTicketList] = useState<Ticket[]>(seedTickets)
  const [refundList, setRefundList] = useState<SupportRefund[]>(seedRefunds)
  const [paymentIssueList, setPaymentIssueList] = useState<SupportPaymentIssue[]>(seedPaymentIssues)
  const [escalationList, setEscalationList] = useState<SupportEscalation[]>(seedEscalations)
  const [conversationList, setConversationList] = useState<LiveConversation[]>(seedConversations)
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current))
    }, 2600)
  }, [])

  const log = useCallback((action: string, area: SectionId, detail: string) => {
    setAudit((prev) => [{ id: makeId('au'), time: stamp(), actor: 'Anita Shah', action, area, detail }, ...prev])
  }, [])

  const patchTicket = useCallback(
    (id: string, patch: Partial<Ticket>, action: string, detail: string) => {
      setTicketList((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch, updated: stamp() } : item)))
      log(action, 'tickets', `${id} · ${detail}`)
      showToast(`${id} ${detail}`)
    },
    [log, showToast],
  )

  // ---- Tickets --------------------------------------------------------------
  const assignTicket = useCallback(
    (id: string, agent: string) => {
      const status = agent === 'Unassigned' ? 'New' : 'Open'
      patchTicket(id, { assignee: agent, status }, 'Ticket assigned', `assigned to ${agent}`)
    },
    [patchTicket],
  )

  const setPriority = useCallback((id: string, priority: TicketPriority) => patchTicket(id, { priority }, 'Priority set', `priority ${priority}`), [patchTicket])
  const setCategory = useCallback((id: string, category: TicketCategory) => patchTicket(id, { category }, 'Category set', `category ${category}`), [patchTicket])

  const replyTicket = useCallback(
    (id: string, body: string, internal: boolean) => {
      if (!body.trim()) return
      setTicketList((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: item.status === 'New' ? 'Open' : item.status,
                updated: stamp(),
                messages: [
                  ...item.messages,
                  { id: makeId('m'), author: 'Anita Shah', role: 'Support', body: body.trim(), time: clock(), internal },
                ],
              }
            : item,
        ),
      )
      log(internal ? 'Internal note added' : 'Ticket reply sent', 'tickets', `${id} · ${body.trim().slice(0, 48)}`)
      showToast(internal ? `${id} internal note added` : `${id} reply sent`)
    },
    [log, showToast],
  )

  const applySavedReply = useCallback(
    (id: string, reply: SavedReply) => {
      setTicketList((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                updated: stamp(),
                messages: [...item.messages, { id: makeId('m'), author: 'Anita Shah', role: 'Support', body: reply.body, time: clock(), internal: false }],
              }
            : item,
        ),
      )
      log('Saved reply used', 'tickets', `${id} · ${reply.title}`)
      showToast(`${id} used “${reply.title}”`)
    },
    [log, showToast],
  )

  const closeTicket = useCallback((id: string) => patchTicket(id, { status: 'Closed' }, 'Ticket closed', 'closed'), [patchTicket])
  const reopenTicket = useCallback(
    (id: string) => {
      setTicketList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'Open', reopened: item.reopened + 1, updated: stamp() } : item)),
      )
      log('Ticket reopened', 'tickets', `${id} · reopened`)
      showToast(`${id} reopened`)
    },
    [log, showToast],
  )

  const linkTicketBooking = useCallback((id: string, booking: string) => patchTicket(id, { booking }, 'Booking linked', `linked to ${booking}`), [patchTicket])

  const createTicketFromBooking = useCallback(
    (bookingId: string, requester: string, problem: string) => {
      const meta = problemCategory[problem] ?? { category: 'Booking' as TicketCategory, priority: 'Normal' as TicketPriority }
      const id = `TK-${Date.now().toString().slice(-4)}`
      const fresh: Ticket = {
        id,
        subject: `${problem} · ${bookingId}`,
        requester,
        requesterType: 'Customer',
        channel: 'Phone',
        category: meta.category,
        priority: meta.priority,
        status: 'New',
        assignee: 'Unassigned',
        booking: bookingId,
        created: stamp(),
        updated: stamp(),
        responseTarget: 'in 30 min',
        overdue: false,
        breachingSoon: false,
        reopened: 0,
        messages: [{ id: makeId('m'), author: requester, role: 'Customer', body: `Support raised: ${problem} for booking ${bookingId}.`, time: clock(), internal: false }],
      }
      setTicketList((prev) => [fresh, ...prev])
      log('Ticket created', 'tickets', `${id} · ${problem} · ${bookingId}`)
      showToast(`${id} created for ${bookingId}`)
      return id
    },
    [log, showToast],
  )

  // ---- Refunds --------------------------------------------------------------
  const createRefund = useCallback(
    (input: NewRefundInput) => {
      const id = `RF-${Date.now().toString().slice(-4)}`
      const aboveCap = input.amount > input.cap
      const fresh: SupportRefund = {
        id,
        booking: input.booking,
        ticket: input.ticket,
        customer: input.customer,
        amount: `₹${input.amount.toLocaleString('en-IN')}`,
        numericAmount: input.amount,
        reason: input.reason,
        status: aboveCap ? 'Escalated' : 'Approved',
        createdAt: stamp(),
        note: aboveCap ? 'Above cap · sent to finance admin' : 'Within cap, awaiting processing',
      }
      setRefundList((prev) => [fresh, ...prev])
      log(aboveCap ? 'Refund escalated' : 'Refund created', 'refunds', `${id} · ₹${input.amount.toLocaleString('en-IN')} · ${aboveCap ? 'above cap to finance' : 'within cap'}`)
      showToast(aboveCap ? `${id} escalated to finance admin` : `${id} created within cap`)
      return id
    },
    [log, showToast],
  )

  const updateRefund = useCallback(
    (id: string, status: SupportRefund['status'], note: string, action: string) => {
      setRefundList((prev) => prev.map((item) => (item.id === id ? { ...item, status, note } : item)))
      log(action, 'refunds', `${id} · ${note}`)
      showToast(`${id} ${note}`)
    },
    [log, showToast],
  )

  const escalateRefund = useCallback((id: string) => updateRefund(id, 'Escalated', 'sent to finance admin', 'Refund escalated'), [updateRefund])
  const processRefund = useCallback((id: string) => updateRefund(id, 'Processed', 'processed to customer', 'Refund processed'), [updateRefund])
  const rejectRefund = useCallback((id: string) => updateRefund(id, 'Rejected', 'rejected', 'Refund rejected'), [updateRefund])

  const updatePaymentIssueStatus = useCallback(
    (id: string, status: PaymentResolutionStatus) => {
      setPaymentIssueList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item)),
      )
      log('Payment issue status updated', 'payment-support', `${id} · ${status}`)
      showToast(`${id} marked ${status.toLowerCase()}`)
    },
    [log, showToast],
  )

  // ---- Escalations ----------------------------------------------------------
  const createEscalation = useCallback(
    (input: NewEscalationInput) => {
      const id = `ESC-${Date.now().toString().slice(-3)}`
      const target: EscalationTarget = categoryTargetMap[input.category]
      const fresh: SupportEscalation = {
        id,
        subject: input.subject,
        category: input.category,
        target,
        reason: input.reason,
        status: 'Open',
        priority: 'High',
        level: 'Level 1',
        slaDeadline: stamp(),
        progress: 0,
        resolutionNote: '',
        opened: stamp(),
        ticket: input.ticket || '—',
      }
      setEscalationList((prev) => [fresh, ...prev])
      log('Escalation raised', 'escalations', `${id} · ${target} · ${input.category}`)
      showToast(`${id} escalated to ${target}`)
      return id
    },
    [log, showToast],
  )

  const updateEscalation = useCallback(
    (id: string, status: SupportEscalation['status'], action: string) => {
      setEscalationList((prev) => prev.map((item) => (item.id === id
        ? { ...item, status, progress: status === 'Resolved' ? 100 : Math.max(item.progress, status === 'Acknowledged' ? 30 : 0), resolutionNote: status === 'Resolved' ? item.resolutionNote || 'Resolved by support team.' : item.resolutionNote }
        : item)))
      log(action, 'escalations', `${id} · ${status.toLowerCase()}`)
      showToast(`${id} ${status.toLowerCase()}`)
    },
    [log, showToast],
  )

  const acknowledgeEscalation = useCallback((id: string) => updateEscalation(id, 'Acknowledged', 'Escalation acknowledged'), [updateEscalation])
  const resolveEscalation = useCallback((id: string) => updateEscalation(id, 'Resolved', 'Escalation resolved'), [updateEscalation])

  const updateEscalationDetails = useCallback(
    (id: string, patch: Partial<Pick<SupportEscalation, 'priority' | 'target' | 'level' | 'slaDeadline' | 'progress' | 'resolutionNote'>>) => {
      setEscalationList((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item))
      log('Escalation updated', 'escalations', `${id} · ${Object.keys(patch).join(', ')}`)
      showToast(`${id} updated`)
    },
    [log, showToast],
  )

  const updateConversation = useCallback((id: string, patch: Partial<LiveConversation>, action: string) => {
    setConversationList((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item))
    log(action, 'live-chat', `${id} · ${Object.keys(patch).join(', ')}`)
    showToast(`${id} updated`)
  }, [log, showToast])

  const assignConversation = useCallback((id: string, assignee: string) => {
    updateConversation(id, { assignee }, 'Chat assigned')
  }, [updateConversation])

  const setConversationStatus = useCallback((id: string, status: ChatStatus) => {
    updateConversation(id, { status }, 'Chat status changed')
  }, [updateConversation])

  const markConversationRead = useCallback((id: string) => {
    setConversationList((prev) => prev.map((item) => item.id === id ? { ...item, unread: 0 } : item))
  }, [])

  const sendChatMessage = useCallback((id: string, body: string, attachments: ChatAttachment[]) => {
    if (!body.trim() && attachments.length === 0) return
    const message = { id: makeId('chat'), author: 'Anita Shah', role: 'Support' as const, body: body.trim() || 'Attachment sent.', time: clock(), attachments }
    setConversationList((prev) => prev.map((item) => item.id === id
      ? { ...item, messages: [...item.messages, message], unread: 0, updated: 'Now', status: item.status === 'Closed' ? 'Open' : item.status }
      : item))
    log('Chat reply sent', 'live-chat', `${id} · ${body.trim().slice(0, 48) || 'attachment'}`)
    showToast(`${id} reply sent`)
  }, [log, showToast])

  return {
    tickets: ticketList,
    refunds: refundList,
    paymentIssues: paymentIssueList,
    escalations: escalationList,
    conversations: conversationList,
    savedReplies,
    audit,
    toast,
    showToast,
    assignTicket,
    setPriority,
    setCategory,
    replyTicket,
    applySavedReply,
    closeTicket,
    reopenTicket,
    linkTicketBooking,
    createTicketFromBooking,
    createRefund,
    escalateRefund,
    processRefund,
    rejectRefund,
    updatePaymentIssueStatus,
    createEscalation,
    acknowledgeEscalation,
    resolveEscalation,
    updateEscalationDetails,
    assignConversation,
    setConversationStatus,
    markConversationRead,
    sendChatMessage,
  }
}

export type SupportAdminStore = ReturnType<typeof useSupportAdmin>
