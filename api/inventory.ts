// ============================================================================
// Cliente de inventario. Siempre llama a las rutas internas /api/inventory*
// de este proyecto — esas rutas (servidor) hablan directo con Supabase si
// hay credenciales configuradas, o usan el store de demo si no.
// Ver db/SUPABASE_CONNECTION.md.
// ============================================================================

import type { InventoryItemDb, NewInventoryItemDb } from "@/lib/types/inventory"
import type { DataSource } from "@/lib/api/shared"

export type { DataSource }

function baseUrl() {
  if (typeof window !== "undefined") return ""
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

export async function fetchInventory(): Promise<{ items: InventoryItemDb[]; source: DataSource }> {
  const res = await fetch(`${baseUrl()}/api/inventory`, { cache: "no-store" })
  if (!res.ok) throw new Error("No se pudo cargar el inventario")
  const data = await res.json()
  return { items: data.items as InventoryItemDb[], source: data.source as DataSource }
}

export async function addInventoryItem(
  input: NewInventoryItemDb,
): Promise<{ item: InventoryItemDb } | { error: string }> {
  const res = await fetch(`${baseUrl()}/api/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) return { error: data.error ?? "error_desconocido" }
  return { item: data as InventoryItemDb }
}

export async function updateInventoryItem(
  id: string,
  patch: Partial<Pick<InventoryItemDb, "name" | "category" | "price" | "stock">>,
): Promise<{ item: InventoryItemDb } | { error: string }> {
  const res = await fetch(`${baseUrl()}/api/inventory/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  const data = await res.json()
  if (!res.ok) return { error: data.error ?? "error_desconocido" }
  return { item: data as InventoryItemDb }
}

export async function removeInventoryItem(id: string): Promise<{ ok: true } | { error: string }> {
  const res = await fetch(`${baseUrl()}/api/inventory/${id}`, {
    method: "DELETE",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return { error: data.error ?? "error_desconocido" }
  return { ok: true }
}
