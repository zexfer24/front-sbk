'use client'

import { Bot, Check, CheckCheck, Paperclip, User } from 'lucide-react'
import type { ChatwootMessage } from '@/lib/types/chatwoot'
import { cn } from '@/lib/utils'

const senderLabels: Record<string, string> = {
  customer: '',
  ai: 'Asistente IA',
  human: 'Asesor',
}

export function MessageBubble({ message }: { message: ChatwootMessage }) {
  const isCustomer = message.messageType === 'incoming'
  const isAi = message.senderType === 'ai'
  const isHuman = message.senderType === 'human'

  return (
    <div className={cn('flex w-full', isCustomer ? 'justify-start' : 'justify-end')}>
      <div className="flex max-w-[78%] flex-col gap-1 sm:max-w-[65%]">
        {!isCustomer && (
          <span
            className={cn(
              'flex items-center gap-1 self-end text-[0.65rem] font-medium uppercase tracking-wider',
              isAi ? 'text-success' : 'text-warning',
            )}
          >
            {isAi ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {message.senderName ?? senderLabels[message.senderType]}
          </span>
        )}
        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-[0_1px_0_0_oklch(0_0_0/0.3)]',
            isCustomer &&
              'rounded-bl-sm border border-border bg-secondary text-foreground',
            isAi &&
              'rounded-br-sm border border-success/30 bg-success/10 text-foreground',
            isHuman &&
              'rounded-br-sm border border-warning/30 bg-warning/10 text-foreground',
          )}
        >
          <p className="text-pretty">{message.content}</p>

          {message.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-background/50 px-2 py-1 text-[0.65rem] text-muted-foreground"
                >
                  <Paperclip className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{att.fileUrl.split('/').pop()}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="font-mono text-[0.6rem] text-muted-foreground">
              {formatTime(message.createdAt)}
            </span>
            {!isCustomer && message.status && (
              <span
                className={cn(
                  message.status === 'read'
                    ? 'text-[oklch(0.72_0.15_220)]'
                    : 'text-muted-foreground',
                )}
              >
                {message.status === 'sent' ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}
