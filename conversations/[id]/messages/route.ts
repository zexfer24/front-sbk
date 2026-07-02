import { NextResponse } from "next/server"
import { getConversation, addMessage } from "@/lib/api/chatwoot-demo-store"
import { getChatwootConfig, chatwootFetch } from "@/lib/chatwoot/client"
import type { NewMessageInput } from "@/lib/types/chatwoot"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: "id_requerido" }, { status: 400 })

  const config = getChatwootConfig()

  if (config) {
    try {
      const data = await chatwootFetch<{ data: unknown[] }>(
        `/conversations/${id}/messages`,
        { cache: "no-store" },
      )
      const messages = data.data.map(mapChatwootMessage)
      return NextResponse.json({ messages, source: "chatwoot" })
    } catch {
      return NextResponse.json(
        { error: "error_chatwoot" },
        { status: 502 },
      )
    }
  }

  const conv = getConversation(id)
  if (!conv) {
    return NextResponse.json({ error: "no_encontrado" }, { status: 404 })
  }
  return NextResponse.json({ messages: conv.messages, source: "demo" })
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: "id_requerido" }, { status: 400 })

  const body = (await request.json().catch(() => null)) as NewMessageInput | null
  if (!body || typeof body.content !== "string" || body.content.trim().length === 0) {
    return NextResponse.json({ error: "contenido_requerido" }, { status: 400 })
  }

  const config = getChatwootConfig()

  if (config) {
    try {
      const data = await chatwootFetch<Record<string, unknown>>(
        `/conversations/${id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: body.content.trim(),
            message_type: "outgoing",
            private: false,
          }),
        },
      )
      return NextResponse.json(mapChatwootMessage(data))
    } catch {
      return NextResponse.json(
        { error: "error_chatwoot" },
        { status: 502 },
      )
    }
  }

  const msg = addMessage(id, body)
  if (!msg) {
    return NextResponse.json({ error: "no_encontrado" }, { status: 404 })
  }
  return NextResponse.json(msg, { status: 201 })
}

function mapChatwootMessage(raw: Record<string, unknown>) {
  const sender = (raw.sender as Record<string, unknown>) ?? {}
  const msgType = String(raw.message_type ?? "0")
  const isIncoming = msgType === "0"
  const isOutgoing = msgType === "1"

  let senderType: "customer" | "ai" | "human" = "customer"
  if (isOutgoing) {
    senderType = sender.type === "user" ? "human" : "ai"
  }

  return {
    id: String(raw.id ?? ""),
    content: String(raw.content ?? ""),
    messageType: isIncoming ? "incoming" : isOutgoing ? "outgoing" : "activity",
    senderType,
    senderName: sender.name ? String(sender.name) : null,
    createdAt: raw.created_at
      ? new Date((raw.created_at as number) * 1000).toISOString()
      : new Date().toISOString(),
    attachments: [],
    status: "delivered",
  }
}
