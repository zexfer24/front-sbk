import { Cog, Disc3, Link2, HardHat, type LucideIcon } from 'lucide-react'

export type StockStatus = 'available' | 'low' | 'out'

export type CategoryId = 'motor' | 'frenos' | 'transmision' | 'accesorios'

export interface Category {
  id: CategoryId
  label: string
  icon: LucideIcon
  /** chroma hue for the lane accent, derived from the crimson base */
  hue: number
}

export const categories: Category[] = [
  { id: 'motor', label: 'Motor', icon: Cog, hue: 25 },
  { id: 'frenos', label: 'Frenos', icon: Disc3, hue: 15 },
  { id: 'transmision', label: 'Transmisión', icon: Link2, hue: 35 },
  { id: 'accesorios', label: 'Accesorios', icon: HardHat, hue: 45 },
]

export function getStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out'
  if (stock <= 5) return 'low'
  return 'available'
}

export const statusMeta: Record<
  StockStatus,
  { label: string; color: string; dot: string; text: string }
> = {
  available: {
    label: 'Disponible',
    color: 'border-success/40 bg-success/10',
    dot: 'bg-success text-success',
    text: 'text-success',
  },
  low: {
    label: 'Stock bajo',
    color: 'border-warning/40 bg-warning/10',
    dot: 'bg-warning text-warning',
    text: 'text-warning',
  },
  out: {
    label: 'Agotado',
    color: 'border-primary/40 bg-primary/10',
    dot: 'bg-primary text-primary',
    text: 'text-primary',
  },
}

// Nota: los 17 artículos de ejemplo que vivían aquí (initialItems) ahora
// están en db/schema.sql (Supabase real) y en
// lib/api/inventory-demo-store.ts (modo demo). La vista de Inventario ya
// no usa datos mock locales — lee de Supabase directo o del store demo.
