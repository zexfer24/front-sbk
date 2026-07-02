"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  toggleIntervention,
} from "@/lib/api/chatwoot"
import type { ChatwootConversation, ChatwootMessage, NewMessageInput } from "@/lib/types/chatwoot"
import type { DataSource } from "@/lib/api/shared"

export function useChatwoot() {
  const [conversations, setConversations] = useState<ChatwootConversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatwootMessage[]>([])
  const [source, setSource] = useState<DataSource>("demo")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intervened, setIntervened] = useState<Record<string, boolean>>({})
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const initialId = useRef<string | null>(null)

  const loadConversations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchConversations()
      setConversations(data.conversations)
      setSource(data.source)
      if (!initialId.current && data.conversations.length > 0) {
        initialId.current = data.conversations[0].id
        setActiveId(data.conversations[0].id)
      }
    } catch {
      setError("No se pudieron cargar las conversaciones.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await fetchMessages(conversationId)
      setMessages(data.messages)
    } catch {
      setMessages([])
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId)
    }
  }, [activeId, loadMessages])

  useEffect(() => {
    if (!activeId) return

    pollingRef.current = setInterval(() => {
      loadMessages(activeId)
    }, 5000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [activeId, loadMessages])

  const selectConversation = useCallback(
    (id: string) => {
      setActiveId(id)
      setMessages([])
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
      )
    },
    [],
  )

  const send = useCallback(
    async (input: NewMessageInput) => {
      if (!activeId) return
      const msg = await sendMessage(activeId, input)
      setMessages((prev) => [...prev, msg])
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, lastMessage: input.content, handledBy: "human" }
            : c,
        ),
      )
    },
    [activeId],
  )

  const toggle = useCallback(async () => {
    if (!activeId) return
    const newState = !intervened[activeId]
    setIntervened((prev) => ({ ...prev, [activeId]: newState }))
    try {
      await toggleIntervention(activeId, newState)
    } catch {
      setIntervened((prev) => ({ ...prev, [activeId]: !newState }))
    }
  }, [activeId, intervened])

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  return {
    conversations,
    activeId,
    activeConversation,
    messages,
    source,
    loading,
    error,
    intervened: activeId ? intervened[activeId] ?? false : false,
    selectConversation,
    send,
    toggle,
    reload: loadConversations,
  }
}
