'use client'

import { Search, Power } from 'lucide-react'
import { categories, type CategoryId } from '@/lib/inventory'
import { cn } from '@/lib/utils'

interface InventoryToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  activeCategory: CategoryId | 'all'
  onCategoryChange: (value: CategoryId | 'all') => void
  onAdd: () => void
}

export function InventoryToolbar({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  onAdd,
}: InventoryToolbarProps) {
  const chips: { id: CategoryId | 'all'; label: string }[] = [
    { id: 'all', label: 'Todo' },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ]

  return (
    <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por nombre o SKU…"
            aria-label="Buscar artículos"
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="power-glow inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          <Power className="h-4 w-4" strokeWidth={2.5} />
          Agregar artículo
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = activeCategory === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onCategoryChange(chip.id)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors',
                active
                  ? 'border-primary bg-primary/15 text-foreground shadow-[0_0_12px_oklch(0.58_0.22_25/0.35)]'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
