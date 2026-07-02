'use client'

import { useState } from 'react'
import { Trash2, Check, X, Loader2, Pencil } from 'lucide-react'
import { getStatus, statusMeta, type Category } from '@/lib/inventory'
import { cn } from '@/lib/utils'
import type { InventoryItemDb } from '@/lib/types/inventory'

interface InventoryRowProps {
  item: InventoryItemDb
  category: Category
  index: number
  onDelete: (id: string) => Promise<unknown>
  onEdit: (item: InventoryItemDb) => void
}

export function InventoryRow({ item, category, index, onDelete, onEdit }: InventoryRowProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const status = getStatus(item.stock)
  const meta = statusMeta[status]
  const Icon = category.icon

  async function handleConfirm() {
    setDeleting(true)
    await onDelete(item.id)
    setDeleting(false)
    setConfirming(false)
  }

  return (
    <tr
      className={cn(
        'animate-row-assemble group border-b border-border/60 transition-colors last:border-b-0',
        'hover:bg-secondary/40',
      )}
      style={{ animationDelay: `${Math.min(index, 24) * 30}ms` }}
    >
      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground sm:px-6">
        {item.sku}
      </td>
      <td className="px-4 py-3 sm:px-6">
        <span className="text-sm font-medium text-foreground text-pretty">{item.name}</span>
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 sm:table-cell sm:px-6">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs"
          style={{ color: `oklch(0.72 0.18 ${category.hue})` }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          {category.label}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm font-semibold tabular-nums text-foreground sm:px-6">
        ${item.price.toFixed(2)}
      </td>
      <td
        className={cn(
          'whitespace-nowrap px-4 py-3 text-right font-mono text-sm font-bold tabular-nums sm:px-6',
          status === 'low' && 'text-warning',
          status === 'out' && 'text-primary',
          status === 'available' && 'text-foreground',
        )}
      >
        {item.stock}
      </td>
      <td className="whitespace-nowrap px-4 py-3 sm:px-6">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium',
            meta.color,
            meta.text,
          )}
        >
          <span className={cn('status-dot h-1.5 w-1.5 rounded-full', meta.dot)} />
          {meta.label}
        </span>
      </td>
      <td className="relative whitespace-nowrap px-4 py-3 text-right sm:px-6">
        {!confirming && (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Editar ${item.name}`}
              className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Eliminar ${item.name}`}
              className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-primary/15 hover:text-primary"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
        {confirming && (
          <div className="animate-blur-in absolute inset-y-0 right-0 z-10 flex items-center gap-1.5 bg-card pl-3 pr-4 sm:pr-6">
            <span className="hidden text-xs text-muted-foreground sm:inline">¿Eliminar?</span>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
