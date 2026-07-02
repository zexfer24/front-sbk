export type SenderType = "customer" | "ai" | "human"

export interface ChatwootMessage {
  id: string
  content: string
  messageType: "incoming" | "outgoing" | "activity"
  senderType: SenderType
  senderName: string | null
  createdAt: string
  attachments: { id: string; fileUrl: string; fileType: string }[]
  status?: "sent" | "delivered" | "read"
}

export interface ChatwootConversation {
  id: string
  contactName: string
  phone: string
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  status: "open" | "resolved" | "pending"
  handledBy: SenderType
  online: boolean
  typing: boolean
  messages: ChatwootMessage[]
}

export type NewMessageInput = {
  content: string
  messageType: "outgoing" | "activity"
  attachments?: { fileUrl: string; fileType: string }[]
}
