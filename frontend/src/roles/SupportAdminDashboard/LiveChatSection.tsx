import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { ChatAttachment, ChatStatus, LiveConversation } from './supportAdminData'
import { supportAgents } from './supportAdminData'

type LiveChatSectionProps = {
  conversations: LiveConversation[]
  onAssign: (id: string, assignee: string) => void
  onStatusChange: (id: string, status: ChatStatus) => void
  onMarkRead: (id: string) => void
  onSend: (id: string, body: string, attachments: ChatAttachment[]) => void
}

const statuses: ChatStatus[] = ['Open', 'Pending', 'Closed']

export default function LiveChatSection({ conversations, onAssign, onStatusChange, onMarkRead, onSend }: LiveChatSectionProps) {
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [reply, setReply] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const unreadCount = conversations.reduce((total, item) => total + item.unread, 0)

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return conversations.filter((item) =>
      !search || `${item.customer} ${item.subject} ${item.id} ${item.booking}`.toLowerCase().includes(search),
    )
  }, [conversations, query])
  const selected = conversations.find((item) => item.id === selectedId) ?? rows[0]

  const selectConversation = (conversation: LiveConversation) => {
    setSelectedId(conversation.id)
    setReply('')
    setAttachments([])
    onMarkRead(conversation.id)
  }

  const onFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    setAttachments((previous) => [
      ...previous,
      ...selectedFiles.map((file) => ({ name: file.name, type: file.type || 'application/octet-stream', size: file.size })),
    ])
    setFileInputKey((key) => key + 1)
  }

  const submitReply = () => {
    if (!selected || (!reply.trim() && attachments.length === 0)) return
    onSend(selected.id, reply, attachments)
    setReply('')
    setAttachments([])
  }

  return (
    <div className="support-live-chat">
      <style>{`
        .support-live-chat { display: grid; grid-template-columns: minmax(270px, .78fr) minmax(0, 1.7fr); gap: 16px; min-height: 610px; }
        .support-chat-list, .support-chat-thread { min-width: 0; }
        .support-chat-search { padding: 14px; border-bottom: 1px solid var(--sa-line); }
        .support-chat-items { display: grid; }
        .support-chat-item { display: grid; gap: 5px; width: 100%; padding: 14px 16px; border: 0; border-bottom: 1px solid var(--sa-line); background: #fff; color: var(--sa-text); text-align: left; cursor: pointer; font: inherit; }
        .support-chat-item:hover, .support-chat-item.active { background: #fff7f2; }
        .support-chat-item.active { box-shadow: inset 3px 0 var(--sa-brand); }
        .support-chat-item-top, .support-chat-thread-head, .support-chat-controls { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .support-chat-item-top strong { font-size: .84rem; }
        .support-chat-item-sub, .support-chat-time { color: #586579; font-size: .72rem; }
        .support-chat-preview { color: #465468; font-size: .76rem; line-height: 1.4; }
        .support-chat-unread { display: inline-grid; min-width: 20px; height: 20px; place-items: center; padding: 0 5px; border-radius: 999px; background: var(--sa-brand); color: #fff; font-size: .68rem; font-weight: 800; }
        .support-chat-thread { display: grid; grid-template-rows: auto 1fr auto; }
        .support-chat-thread-head { flex-wrap: wrap; padding: 16px 18px; border-bottom: 1px solid var(--sa-line); }
        .support-chat-thread-title { display: grid; gap: 5px; }
        .support-chat-thread-title h3 { margin: 0; color: var(--sa-text); font-size: 1rem; }
        .support-chat-thread-title span { color: #586579; font-size: .74rem; }
        .support-chat-controls { justify-content: flex-end; flex-wrap: wrap; }
        .support-chat-messages { display: flex; flex-direction: column; gap: 12px; min-height: 0; overflow-y: auto; padding: 18px; background: #f8fafc; }
        .support-chat-message { display: grid; gap: 5px; width: fit-content; max-width: min(82%, 580px); padding: 11px 13px; border: 1px solid #e3e8ef; border-radius: 14px 14px 14px 4px; background: #fff; }
        .support-chat-message.support { align-self: flex-end; border-color: #ffd4bd; border-radius: 14px 14px 4px 14px; background: #fff4ed; }
        .support-chat-message-head { display: flex; align-items: center; gap: 8px; color: #465468; font-size: .7rem; }
        .support-chat-message-head strong { color: #172033; }
        .support-chat-message p { margin: 0; color: #253246; font-size: .82rem; line-height: 1.5; overflow-wrap: anywhere; }
        .support-chat-attachment { display: flex; gap: 8px; align-items: center; padding: 7px 9px; border-radius: 8px; background: rgba(15, 23, 42, .05); color: #334155; font-size: .72rem; overflow-wrap: anywhere; }
        .support-chat-compose { display: grid; gap: 10px; padding: 14px; border-top: 1px solid var(--sa-line); }
        .support-chat-compose textarea { width: 100%; min-height: 76px; resize: vertical; }
        .support-chat-compose-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .support-chat-pending-files { display: flex; gap: 6px; flex-wrap: wrap; }
        .support-chat-empty { padding: 22px; color: #586579; font-size: .82rem; }
        @media (max-width: 820px) { .support-live-chat { grid-template-columns: minmax(0, 1fr); } .support-chat-list { max-height: 300px; overflow: auto; } .support-chat-thread { min-height: 500px; } }
      `}</style>
      <section className="sa-panel support-chat-list">
        <div className="sa-panel-header">
          <div>
            <h3>Conversations</h3>
            <span className="sa-panel-sub">{unreadCount} unread messages · {conversations.length} conversations</span>
          </div>
        </div>
        <div className="support-chat-search">
          <input className="sa-input" aria-label="Search conversations" placeholder="Search name, subject or booking..." value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="support-chat-items">
          {rows.map((conversation) => {
            const lastMessage = conversation.messages[conversation.messages.length - 1]
            return (
              <button
                key={conversation.id}
                type="button"
                className={`support-chat-item ${conversation.id === selected?.id ? 'active' : ''}`}
                onClick={() => selectConversation(conversation)}
              >
                <span className="support-chat-item-top">
                  <strong>{conversation.customer}</strong>
                  <span className="support-chat-time">{conversation.updated}</span>
                </span>
                <span className="support-chat-item-top">
                  <span className="support-chat-item-sub">{conversation.subject}</span>
                  {conversation.unread > 0 && <span className="support-chat-unread">{conversation.unread}</span>}
                </span>
                <span className="support-chat-preview">{lastMessage?.body ?? 'No messages yet'}</span>
              </button>
            )
          })}
          {rows.length === 0 && <div className="support-chat-empty">No conversations match your search.</div>}
        </div>
      </section>

      {selected ? (
        <section className="sa-panel support-chat-thread">
          <div className="support-chat-thread-head">
            <div className="support-chat-thread-title">
              <h3>{selected.customer} · {selected.subject}</h3>
              <span>{selected.id} · {selected.customerType} · Booking {selected.booking}</span>
            </div>
            <div className="support-chat-controls">
              <select className="sa-select" aria-label="Assign conversation" value={selected.assignee} onChange={(event) => onAssign(selected.id, event.target.value)}>
                {supportAgents.map((agent) => <option key={agent} value={agent}>{agent}</option>)}
              </select>
              <select className="sa-select" aria-label="Conversation status" value={selected.status} onChange={(event) => onStatusChange(selected.id, event.target.value as ChatStatus)}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
          <div className="support-chat-messages" aria-label="Conversation history">
            {selected.messages.map((message) => (
              <article key={message.id} className={`support-chat-message ${message.role === 'Support' ? 'support' : ''}`}>
                <div className="support-chat-message-head"><strong>{message.author}</strong><span>{message.role}</span><span>{message.time}</span></div>
                <p>{message.body}</p>
                {message.attachments.map((attachment) => (
                  <div className="support-chat-attachment" key={`${message.id}-${attachment.name}`} title={`${attachment.type} · ${attachment.size} bytes`}>
                    <span aria-hidden="true">📎</span>{attachment.name}
                  </div>
                ))}
              </article>
            ))}
          </div>
          <div className="support-chat-compose">
            <textarea className="sa-input" aria-label="Write a reply" placeholder="Write a reply to the customer..." value={reply} onChange={(event) => setReply(event.target.value)} />
            {attachments.length > 0 && (
              <div className="support-chat-pending-files">
                {attachments.map((attachment, index) => <span className="sa-pill slate" key={`${attachment.name}-${index}`}>{attachment.name}</span>)}
              </div>
            )}
            <div className="support-chat-compose-actions">
              <label className="sa-btn-ghost">
                Attach files
                <input key={fileInputKey} type="file" multiple hidden onChange={onFilesSelected} />
              </label>
              <button type="button" className="sa-btn approve" disabled={!reply.trim() && attachments.length === 0} onClick={submitReply}>Send reply</button>
            </div>
          </div>
        </section>
      ) : (
        <section className="sa-panel support-chat-thread"><div className="support-chat-empty">Select a conversation to view its history.</div></section>
      )}
    </div>
  )
}
