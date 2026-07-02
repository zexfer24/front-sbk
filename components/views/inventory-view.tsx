'use client'

import { useMemo, useState } from 'react'
import { Loader2, AlertCircle, PackageOpen } from 'lucide-react'
import { getStatus, type CategoryId } from '@/lib/inventory'
import { dbCategoryToUi } from '@/lib/category-map'
import { useInventory } from '@/lib/hooks/use-inventory'
import { InventoryHeader } from '@/components/inventory-header'
import { InventoryToolbar } from '@/components/inventory-toolbar'
import { InventoryTable } from '@/components/inventory-table'
import { AddItemModal } from '@/components/add-item-modal'
import { EditItemModal } from '@/components/edit-item-modal'
import type { InventoryItemDb } from '@/lib/types/inventory'

export function InventoryView() {
  const { items, source, loading, error, create, update, remove } = useInventory()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItemDb | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || dbCategoryToUi(item.category) === activeCategory
      const matchesQuery =
        q === '' || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [items, query, activeCategory])

  const totalItems = items.length
  const unitsInShop = items.reduce((sum, item) => sum + item.stock, 0)
  const outOfStock = items.filter((item) => getStatus(item.stock) === 'out').length

  const hasResults = filtered.length > 0

  return (
    <>
      <InventoryHeader totalItems={totalItems} unitsInShop={unitsInShop} outOfStock={outOfStock} source={source} />

      <InventoryToolbar
        query={query}
        onQueryChange={setQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onAdd={() => setAddModalOpen(true)}
      />

      <main className="flex flex-1 flex-col gap-6 px-4 pb-16 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Cargando inventario…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
            <AlertCircle className="h-6 w-6 text-primary" />
            <p className="text-sm text-primary">{error}</p>
          </div>
        )}

        {!loading && !error && !hasResults && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? 'Todavía no hay artículos. Agrega el primero para empezar.'
                : 'No se encontraron artículos para tu búsqueda.'}
            </p>
          </div>
        )}

        {!loading && !error && hasResults && (
          <InventoryTable items={filtered} onDelete={remove} onEdit={setEditingItem} />
        )}
      </main>

      <AddItemModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={create} />

      <EditItemModal
        key={editingItem?.id}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onUpdate={update}
        onDelete={remove}
      />
    </>
  )
}
