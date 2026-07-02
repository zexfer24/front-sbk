'use client'

import { useRef, useState, useEffect } from 'react'
import {
  ArrowLeft,
  Bot,
  Check,
  Hand,
  Paperclip,
  Phone,
  SendHorizonal,
  Tag,
} from 'lucide-react'
import type { ChatwootConversation, ChatwootMessage } from '@/lib/types/chatwoot'
import { MessageBubble } from '@/components/chat/message-bubble'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'atendido', label: 'Atendido' },
  { value: 'cashea', label: 'Cashea' },
  { value: 'nuevo_mensaje', label: 'Nuevo Mensaje' },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]['value']

interface ChatPanelProps {
  conversation: ChatwootConversation
  messages: ChatwootMessage[]
  intervened: boolean
  category: string | null
  onBack: () => void
  onSend: (text: string) => void
  onToggleIntervene: () => void
  onSetCategory: (category: string | null) => void
}

export function ChatPanel({
  conversation,
  messages,
  intervened,
  category,
  onBack,
  onSend,
  onToggleIntervene,
  onSetCategory,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  const activeLabel = CATEGORIES.find((c) => c.value === category)?.label

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card/50 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary md:hidden"
          aria-label="Volver a la lista"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-metal/50 text-sm font-semibold text-foreground ring-1 ring-border">
          {conversation.contactName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {conversation.contactName}
          </p>
          <p className="flex items-center gap-1.5 truncate whitespace-nowrap font-mono text-xs text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            {conversation.phone}
            {conversation.typing && (
              <span className="ml-1 text-success">· escribiendo…</span>
            )}
          </p>
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all active:scale-95',
              category
                ? 'border border-primary/50 bg-primary/15 text-primary'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">
              {activeLabel ?? 'Categoría'}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-48 animate-blur-in overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
              <div className="px-3 py-2 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Categorizar
              </div>
              {CATEGORIES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSetCategory(category === opt.value ? null : opt.value)
                    setMenuOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                    category === opt.value
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {category === opt.value && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </span>
                  {opt.label}
                </button>
              ))}
              {category && (
                <>
                  <div className="border-t border-border" />
                  <button
                    type="button"
                    onClick={() => {
                      onSetCategory(null)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <span className="flex h-4 w-4 items-center justify-center" />
                    Quitar categoría
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleIntervene}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all active:scale-95',
            intervened
              ? 'border border-warning/50 bg-warning/15 text-warning'
              : 'power-glow bg-primary text-primary-foreground',
          )}
        >
          <Hand className="h-4 w-4" />
          <span className="hidden sm:inline">
            {intervened ? 'IA en pausa' : 'Intervenir'}
          </span>
        </button>
      </div>

      {intervened && (
        <div className="animate-blur-in flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning">
          <Hand className="h-3.5 w-3.5" />
          IA en pausa — tú tienes el control de esta conversación.
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                No hay mensajes en esta conversación
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}

        {conversation.typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-secondary px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card/50 px-4 py-3 sm:px-6">
        {intervened ? (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Adjuntar archivo"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe como asesor…"
              aria-label="Mensaje"
              className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
              aria-label="Enviar mensaje"
            >
              <SendHorizonal className="h-5 w-5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/50 px-4 py-3 text-xs text-muted-foreground">
            <Bot className="h-4 w-4 text-success" />
            La IA está respondiendo automáticamente. Pulsa{' '}
            <span className="font-semibold text-foreground">Intervenir</span>{' '}
            para tomar el control.
          </div>
        )}
      </div>
    </section>
  )
}
