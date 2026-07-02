// ============================================================================
// Tipos de dominio · Inventario (forma real en Supabase)
// Ver db/schema.sql y db/SUPABASE_CONNECTION.md.
//
// Nota de integración: la base de datos guarda la categoría como
// 'Motor' | 'Frenos' | 'Transmisión' | 'Accesorios' (con tilde,
// capitalizada), pero el diseño visual de v0 (lib/inventory.ts) usa
// 'motor' | 'frenos' | 'transmision' | 'accesorios' (sin tilde, minúscula)
// para sus iconos y colores de carril. category-map.ts traduce entre
// ambas formas para no tener que elegir una sola convención en los dos
// lugares — la base de datos no se toca, el diseño visual tampoco.
// ============================================================================

export const DB_INVENTORY_CATEGORIES = ["Motor", "Frenos", "Transmisión", "Accesorios"] as const

export type DbInventoryCategory = (typeof DB_INVENTORY_CATEGORIES)[number]

export type InventoryItemDb = {
  id: string
  sku: string
  name: string
  category: DbInventoryCategory
  price: number
  stock: number
  specs: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type NewInventoryItemDb = {
  sku: string
  name: string
  category: DbInventoryCategory
  price: number
  stock: number
}
