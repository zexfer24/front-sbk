'use client'

import { useId, useState } from 'react'
import { X, Loader2, Pencil, Trash2 } from 'lucide-react'
import { categories, type CategoryId } from '@/lib/inventory'
import { dbCategoryToUi, uiCategoryToDb } from '@/lib/category-map'
import type { InventoryItemDb } from '@/lib/types/inventory'
import { cn } from '@/lib/utils'

interface EditItemModalProps {
  item: InventoryItemDb | null
  onClose: () => void
  onUpdate: (
    id: string,
    patch: Partial<Pick<InventoryItemDb, 'name' | 'category' | 'price' | 'stock'>>,
  ) => Promise<{ error: string } | { item: InventoryItemDb }>
  onDelete: (id: string) => Promise<unknown>
}

export function EditItemModal({ item, onClose, onUpdate, onDelete }: EditItemModalProps) {
  const formId = useId()

  const [name, setName] = useState(item?.name ?? '')
  const [category, setCategory] = useState<CategoryId>(
    item ? dbCategoryToUi(item.category) : 'motor',
  )
  const [price, setPrice] = useState(item ? String(item.price) : '')
  const [stock, setStock] = useState(item ? String(item.stock) : '')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (!item) return null

  function handleClose() {
    if (submitting || deleting) return
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const priceNum = Number(price)
    const stockNum = Number(stock)

    if (!name.trim()) {
      setFormError('El nombre del artículo es obligatorio.')
      return
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setFormError('El precio debe ser un número válido.')
      return
    }
    if (Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      setFormError('El stock debe ser un número entero, mayor o igual a 0.')
      return
    }

    setSubmitting(true)
    const result = await onUpdate(item.id, {
      name: name.trim(),
      category: uiCategoryToDb(category),
      price: priceNum,
      stock: stockNum,
    })
    setSubmitting(false)

    if ('error' in result) {
      setFormError('No se pudo guardar el artículo. Intenta de nuevo.')
      return
    }

    onClose()
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete(item.id)
    setDeleting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={handleClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className="animate-blur-in relative w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div>
              <h2 id={`${formId}-title`} className="heading-stamp text-sm text-foreground">
                Editar artículo
              </h2>
              <p className="font-mono text-[0.65rem] text-muted-foreground">{item.sku}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${formId}-name`} className="text-xs font-semibold text-muted-foreground">
              Nombre del artículo
            </label>
            <input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Categoría</span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors',
                    category === cat.id
                      ? 'border-primary bg-primary/15 text-foreground shadow-[0_0_12px_oklch(0.58_0.22_25/0.35)]'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-price`} className="text-xs font-semibold text-muted-foreground">
                Precio (US$)
              </label>
              <input
                id={`${formId}-price`}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className="rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-stock`} className="text-xs font-semibold text-muted-foreground">
                Stock
              </label>
              <input
                id={`${formId}-stock`}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                inputMode="numeric"
                placeholder="0"
                className="rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
              {formError}
            </p>
          )}

          <div className="mt-1 flex items-center justify-between gap-2">
            {/* Delete zone */}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">¿Eliminar?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Sí, eliminar'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                >
                  No
                </button>
              </div>
            )}

            {/* Save */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="power-glow flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
