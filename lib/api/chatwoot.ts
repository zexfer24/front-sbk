import type { ChatwootConversation, ChatwootMessage, NewMessageInput } from "@/lib/types/chatwoot"
import type { DataSource } from "@/lib/api/shared"

function baseUrl() {
  if (typeof window !== "undefined") return ""
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

export async function fetchConversations(): Promise<{
  conversations: ChatwootConversation[]
  source: DataSource
}> {
  const res = await fetch(`${baseUrl()}/api/chatwoot/conversations`, { cache: "no-store" })
  if (!res.ok) throw new Error("No se pudieron cargar las conversaciones")
  const data = await res.json()
  return { conversations: data.conversations, source: data.source }
}

export async function fetchMessages(
  conversationId: string,
): Promise<{ messages: ChatwootMessage[]; source: DataSource }> {
  const res = await fetch(
    `${baseUrl()}/api/chatwoot/conversations/${conversationId}/messages`,
    { cache: "no-store" },
  )
  if (!res.ok) throw new Error("No se pudieron cargar los mensajes")
  const data = await res.json()
  return { messages: data.messages, source: data.source }
}

export async function sendMessage(
  conversationId: string,
  input: NewMessageInput,
): Promise<ChatwootMessage> {
  const res = await fetch(
    `${baseUrl()}/api/chatwoot/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  )
  if (!res.ok) throw new Error("No se pudo enviar el mensaje")
  return res.json()
}

export async function toggleIntervention(
  conversationId: string,
  intervene: boolean,
): Promise<{ handledBy: string }> {
  const res = await fetch(
    `${baseUrl()}/api/chatwoot/conversations/${conversationId}/intervene`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intervene }),
    },
  )
  if (!res.ok) throw new Error("No se pudo cambiar el estado")
  return res.json()
}
