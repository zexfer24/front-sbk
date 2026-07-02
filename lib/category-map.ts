// ============================================================================
// Traduce entre la categoría tal como vive en Supabase (capitalizada, con
// tilde) y el CategoryId que usa el diseño visual de v0 (lib/inventory.ts:
// 'motor' | 'frenos' | 'transmision' | 'accesorios').
// ============================================================================

import type { CategoryId } from "@/lib/inventory"
import type { DbInventoryCategory } from "@/lib/types/inventory"

const DB_TO_UI: Record<DbInventoryCategory, CategoryId> = {
  Motor: "motor",
  Frenos: "frenos",
  Transmisión: "transmision",
  Accesorios: "accesorios",
}

const UI_TO_DB: Record<CategoryId, DbInventoryCategory> = {
  motor: "Motor",
  frenos: "Frenos",
  transmision: "Transmisión",
  accesorios: "Accesorios",
}

export function dbCategoryToUi(category: DbInventoryCategory): CategoryId {
  return DB_TO_UI[category] ?? "motor"
}

export function uiCategoryToDb(category: CategoryId): DbInventoryCategory {
  return UI_TO_DB[category]
}
