"use client"

import { useCallback, useEffect, useState } from "react"
import { addInventoryItem, fetchInventory, removeInventoryItem, updateInventoryItem } from "@/lib/api/inventory"
import type { DataSource } from "@/lib/api/shared"
import type { InventoryItemDb, NewInventoryItemDb } from "@/lib/types/inventory"

export function useInventory() {
  const [items, setItems] = useState<InventoryItemDb[]>([])
  const [source, setSource] = useState<DataSource>("demo")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchInventory()
      setItems(data.items)
      setSource(data.source)
    } catch {
      setError("No se pudo cargar el inventario. Intenta de nuevo en un momento.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(async (input: NewInventoryItemDb) => {
    const result = await addInventoryItem(input)
    if ("error" in result) return result
    setItems((prev) => [result.item, ...prev])
    return result
  }, [])

  const update = useCallback(
    async (id: string, patch: Partial<Pick<InventoryItemDb, "name" | "category" | "price" | "stock">>) => {
      const result = await updateInventoryItem(id, patch)
      if ("error" in result) return result
      setItems((prev) => prev.map((it) => (it.id === id ? result.item : it)))
      return result
    },
    [],
  )

  const remove = useCallback(
    async (id: string) => {
      const previous = items
      setItems((prev) => prev.filter((it) => it.id !== id))
      const result = await removeInventoryItem(id)
      if ("error" in result) setItems(previous)
      return result
    },
    [items],
  )

  return { items, source, loading, error, reload: load, create, update, remove }
}
