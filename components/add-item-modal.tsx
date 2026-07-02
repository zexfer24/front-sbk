'use client'

import { useId, useState } from 'react'
import { X, Loader2, Power } from 'lucide-react'
import { categories, type CategoryId } from '@/lib/inventory'
import { uiCategoryToDb } from '@/lib/category-map'
import type { NewInventoryItemDb } from '@/lib/types/inventory'
import { cn } from '@/lib/utils'

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: NewInventoryItemDb) => Promise<{ error: string } | { item: unknown }>
}

export function AddItemModal({ open, onClose, onSubmit }: AddItemModalProps) {
  const formId = useId()
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CategoryId>('motor')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (!open) return null

  function reset() {
    setSku('')
    setName('')
    setCategory('motor')
    setPrice('')
    setStock('')
    setFormError(null)
  }

  function handleClose() {
    if (submitting) return
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const priceNum = Number(price)
    const stockNum = Number(stock)

    if (!sku.trim() || !name.trim()) {
      setFormError('Completa el SKU y el nombre del artículo.')
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
    const result = await onSubmit({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: uiCategoryToDb(category),
      price: priceNum,
      stock: stockNum,
    })
    setSubmitting(false)

    if ('error' in result) {
      setFormError(
        result.error === 'sku_duplicado'
          ? `Ya existe un artículo con el SKU "${sku.trim().toUpperCase()}".`
          : 'No se pudo agregar el artículo. Intenta de nuevo.',
      )
      return
    }

    reset()
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
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Power className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <h2 id={`${formId}-title`} className="heading-stamp text-sm text-foreground">
              Agregar artículo
            </h2>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${formId}-sku`} className="text-xs font-semibold text-muted-foreground">
              SKU
            </label>
            <input
              id={`${formId}-sku`}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Ej. MTR-0930"
              autoFocus
              className="rounded-lg border border-input bg-background px-3.5 py-2.5 font-mono text-sm uppercase text-foreground outline-none placeholder:font-sans placeholder:normal-case placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${formId}-name`} className="text-xs font-semibold text-muted-foreground">
              Nombre del artículo
            </label>
            <input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Kit de arrastre 428H"
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
                Stock inicial
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

          <div className="mt-1 flex items-center justify-end gap-2">
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
              {submitting ? 'Agregando…' : 'Agregar al inventario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
