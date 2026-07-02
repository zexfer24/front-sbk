// ============================================================================
// MODO DEMO — simulador de la tabla `inventory_items` de Postgres/Supabase.
// Vive solo en el servidor de Next.js. Mismas reglas que la tabla real:
// SKU único, UUID autogenerado, timestamps automáticos.
// ============================================================================

import type { InventoryItemDb, DbInventoryCategory } from "@/lib/types/inventory"

type SeedItem = {
  sku: string
  name: string
  category: DbInventoryCategory
  price: number
  stock: number
}

const SEED: SeedItem[] = [
  { sku: "MTR-PST-250", name: "Pistón forjado 250cc", category: "Motor", price: 89.9, stock: 18 },
  { sku: "MTR-JNT-001", name: "Kit de juntas completo", category: "Motor", price: 42.5, stock: 4 },
  { sku: "MTR-FLT-KN9", name: "Filtro de aceite K&N", category: "Motor", price: 15.0, stock: 31 },
  { sku: "MTR-BUJ-IR4", name: "Bujía iridio NGK", category: "Motor", price: 12.75, stock: 0 },
  { sku: "MTR-LEV-RC1", name: "Árbol de levas racing", category: "Motor", price: 210.0, stock: 6 },
  { sku: "FRN-DSC-320", name: "Disco flotante 320mm", category: "Frenos", price: 134.0, stock: 9 },
  { sku: "FRN-PST-SNT", name: "Pastillas sinterizadas", category: "Frenos", price: 28.9, stock: 3 },
  { sku: "FRN-BMB-RAD", name: "Bomba de freno radial", category: "Frenos", price: 175.5, stock: 12 },
  { sku: "FRN-LIQ-51", name: "Líquido DOT 5.1", category: "Frenos", price: 9.5, stock: 0 },
  { sku: "TRN-CAD-520", name: "Cadena DID 520 X-Ring", category: "Transmisión", price: 64.0, stock: 22 },
  { sku: "TRN-KIT-PC1", name: "Kit piñón + corona", category: "Transmisión", price: 78.0, stock: 5 },
  { sku: "TRN-EMB-DSC", name: "Disco de embrague", category: "Transmisión", price: 46.9, stock: 14 },
  { sku: "TRN-CBL-EMB", name: "Cable de embrague", category: "Transmisión", price: 11.0, stock: 2 },
  { sku: "ACC-CSC-FBR", name: "Casco integral fibra", category: "Accesorios", price: 289.0, stock: 7 },
  { sku: "ACC-GNT-RC2", name: "Guantes racing cuero", category: "Accesorios", price: 54.0, stock: 16 },
  { sku: "ACC-ESP-CNC", name: "Espejos retrovisores CNC", category: "Accesorios", price: 38.5, stock: 4 },
  { sku: "ACC-MAN-CNQ", name: "Manillar conquistador", category: "Accesorios", price: 67.0, stock: 0 },
]

function makeId() {
  return globalThis.crypto.randomUUID()
}

function seedStore(): InventoryItemDb[] {
  const now = new Date().toISOString()
  return SEED.map((s) => ({ ...s, id: makeId(), specs: {}, createdAt: now, updatedAt: now }))
}

const globalForStore = globalThis as unknown as { __inventoryStore?: InventoryItemDb[] }

function getStore(): InventoryItemDb[] {
  if (!globalForStore.__inventoryStore) {
    globalForStore.__inventoryStore = seedStore()
  }
  return globalForStore.__inventoryStore
}

export function listItems(): InventoryItemDb[] {
  return [...getStore()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function updateItem(
  id: string,
  patch: Partial<Pick<InventoryItemDb, 'name' | 'category' | 'price' | 'stock'>>,
): { item: InventoryItemDb } | { error: 'no_encontrado' } {
  const store = getStore()
  const idx = store.findIndex((it) => it.id === id)
  if (idx === -1) return { error: 'no_encontrado' }
  const updated: InventoryItemDb = { ...store[idx], ...patch, updatedAt: new Date().toISOString() }
  store[idx] = updated
  return { item: updated }
}

export function createItem(
  input: Pick<InventoryItemDb, "sku" | "name" | "category" | "price" | "stock">,
): { item: InventoryItemDb } | { error: "sku_duplicado" } {
  const store = getStore()
  const skuNormalized = input.sku.trim().toUpperCase()
  const exists = store.some((it) => it.sku.toUpperCase() === skuNormalized)
  if (exists) return { error: "sku_duplicado" }

  const now = new Date().toISOString()
  const item: InventoryItemDb = {
    id: makeId(),
    sku: skuNormalized,
    name: input.name.trim(),
    category: input.category,
    price: input.price,
    stock: input.stock,
    specs: {},
    createdAt: now,
    updatedAt: now,
  }
  store.push(item)
  return { item }
}

export function deleteItem(id: string): { id: string; deleted: true } | { error: "no_encontrado" } {
  const store = getStore()
  const idx = store.findIndex((it) => it.id === id)
  if (idx === -1) return { error: "no_encontrado" }
  store.splice(idx, 1)
  return { id, deleted: true }
}
