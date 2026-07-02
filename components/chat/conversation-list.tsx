'use client'

import { Bot, Search, User, X } from 'lucide-react'
import { useState } from 'react'
import type { ChatwootConversation } from '@/lib/types/chatwoot'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  conversations: ChatwootConversation[]
  activeId: string | null
  categories: Record<string, string | null>
  onSelect: (id: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  atendido: 'Atendido',
  cashea: 'Cashea',
  nuevo_mensaje: 'Nuevo Mensaje',
}

export function ConversationList({
  conversations,
  activeId,
  categories,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')

  const filtered = conversations.filter((c) => {
    const matchesSearch =
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchesFilter =
      filter === 'all' ||
      (filter === 'open' && c.status === 'open') ||
      (filter === 'resolved' && c.status === 'resolved')
    return matchesSearch && matchesFilter
  })

  return (
    <aside className="flex h-full w-full flex-col">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversación..."
            aria-label="Buscar conversación"
            className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-2 flex gap-1">
          {(['all', 'open', 'resolved'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 rounded-md px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wider transition-colors',
                filter === f
                  ? 'bg-primary/15 text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f === 'all' ? 'Todas' : f === 'open' ? 'Abiertas' : 'Resueltas'}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {search ? 'Sin resultados' : 'No hay conversaciones'}
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  'flex items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors w-full',
                  isActive ? 'bg-primary/10' : 'hover:bg-secondary/60',
                )}
              >
                <div className="relative shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-metal/50 text-sm font-semibold text-foreground ring-1 ring-border">
                    {c.contactName.charAt(0)}
                  </div>
                  {c.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-success" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {c.contactName}
                    </p>
                    <span className="shrink-0 font-mono text-[0.65rem] text-muted-foreground">
                      {formatTime(c.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {c.typing ? (
                        <span className="text-success">escribiendo…</span>
                      ) : (
                        c.lastMessage
                      )}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-primary px-1 font-mono text-[0.6rem] font-bold text-primary-foreground">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium',
                        c.handledBy === 'ai'
                          ? 'bg-success/15 text-success'
                          : 'bg-warning/15 text-warning',
                      )}
                    >
                      {c.handledBy === 'ai' ? (
                        <Bot className="h-2.5 w-2.5" />
                      ) : (
                        <User className="h-2.5 w-2.5" />
                      )}
                      {c.handledBy === 'ai' ? 'IA' : 'Asesor'}
                    </span>
                    {categories[c.id] && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-medium text-primary">
                        {CATEGORY_LABELS[categories[c.id]!] ?? categories[c.id]}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}

function formatTime(iso: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `${diffMin}min`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'ayer'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
}
