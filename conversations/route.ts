import { NextResponse } from "next/server"
import { listConversations } from "@/lib/api/chatwoot-demo-store"
import { getChatwootConfig, chatwootFetch } from "@/lib/chatwoot/client"

export async function GET() {
  const config = getChatwootConfig()

  if (config) {
    try {
      const data = await chatwootFetch<{ data: unknown[] }>("/conversations", {
        cache: "no-store",
      })
      const conversations = data.data.map(mapChatwootConversation)
      return NextResponse.json({ conversations, source: "chatwoot" })
    } catch {
      return NextResponse.json(
        { error: "error_chatwoot" },
        { status: 502 },
      )
    }
  }

  return NextResponse.json({ conversations: listConversations(), source: "demo" })
}

function mapChatwootConversation(raw: Record<string, unknown>) {
  const contact = (raw.contact as Record<string, unknown>) ?? {}
  const contactInbox = (raw.contact_inbox as Record<string, unknown>) ?? {}
  const lastMsg = (
    Array.isArray(raw.messages) && raw.messages.length > 0
      ? (raw.messages[raw.messages.length - 1] as Record<string, unknown>)
      : null
  ) as Record<string, unknown> | null

  return {
    id: String(raw.id ?? ""),
    contactName: String(contact.name ?? "Desconocido"),
    phone: String(contactInbox.source_id ?? contact.phone_number ?? ""),
    lastMessage: lastMsg ? String(lastMsg.content ?? "") : null,
    lastMessageAt: lastMsg
      ? new Date((lastMsg.created_at as number) * 1000).toISOString()
      : null,
    unreadCount: (raw.unread_count as number) ?? 0,
    status: String(raw.status ?? "open"),
    handledBy: raw.assignee ? "human" : "ai",
    online: false,
    typing: false,
    messages: [],
  }
}
