'use client'

import { categories } from '@/lib/inventory'
import { dbCategoryToUi } from '@/lib/category-map'
import { InventoryRow } from './inventory-row'
import type { InventoryItemDb } from '@/lib/types/inventory'

interface InventoryTableProps {
  items: InventoryItemDb[]
  onDelete: (id: string) => Promise<unknown>
  onEdit: (item: InventoryItemDb) => void
}

const columns = ['SKU', 'Artículo', 'Categoría', 'Precio', 'Stock', 'Estado', '']

// Fallback defensivo: si llega una categoría inesperada desde Supabase
// (typo, dato corrupto, etc.), no rompemos toda la tabla — mostramos la
// fila igual, con la primera categoría conocida como apariencia genérica.
const fallbackCategory = categories[0]

export function InventoryTable({ items, onDelete, onEdit }: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground sm:px-6"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const uiCategory = categories.find((c) => c.id === dbCategoryToUi(item.category)) ?? fallbackCategory
              return (
                <InventoryRow
                  key={item.id}
                  item={item}
                  category={uiCategory}
                  index={i}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
