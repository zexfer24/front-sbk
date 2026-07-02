import { NextResponse } from "next/server"
import { createItem, listItems } from "@/lib/api/inventory-demo-store"
import { DB_INVENTORY_CATEGORIES, type DbInventoryCategory } from "@/lib/types/inventory"
import { getSupabase } from "@/lib/supabase/client"

// Único punto de entrada que el navegador conoce (/api/inventory). Habla
// directo con Supabase (tabla inventory_items) si las credenciales están
// configuradas; si no, usa el store de demo en memoria.
// Ver db/SUPABASE_CONNECTION.md.

const SELECT_COLUMNS =
  'id, sku, name, category, price, stock, specs, createdAt:created_at, updatedAt:updated_at'

function isDbCategory(value: string): value is DbInventoryCategory {
  return (DB_INVENTORY_CATEGORIES as readonly string[]).includes(value)
}

export async function GET() {
  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase
      .from("inventory_items")
      .select(SELECT_COLUMNS)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "error_supabase", detail: error.message }, { status: 500 })
    }
    return NextResponse.json({ items: data, source: "supabase" })
  }

  return NextResponse.json({ items: listItems(), source: "demo" })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "cuerpo_invalido" }, { status: 400 })
  }

  const { sku, name, category, price, stock } = body as Record<string, unknown>

  if (typeof sku !== "string" || sku.trim().length === 0) {
    return NextResponse.json({ error: "sku_requerido" }, { status: 400 })
  }
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "nombre_requerido" }, { status: 400 })
  }
  if (typeof category !== "string" || !isDbCategory(category)) {
    return NextResponse.json({ error: "categoria_invalida" }, { status: 400 })
  }
  if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
    return NextResponse.json({ error: "precio_invalido" }, { status: 400 })
  }
  if (typeof stock !== "number" || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    return NextResponse.json({ error: "stock_invalido" }, { status: 400 })
  }

  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase
      .from("inventory_items")
      .insert({ sku: sku.trim().toUpperCase(), name: name.trim(), category, price, stock })
      .select(SELECT_COLUMNS)
      .single()

    if (error) {
      // 23505 = unique_violation (Postgres) — el SKU ya existe.
      if (error.code === "23505") {
        return NextResponse.json({ error: "sku_duplicado" }, { status: 409 })
      }
      return NextResponse.json({ error: "error_supabase", detail: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  }

  const result = createItem({ sku, name, category, price, stock })
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }
  return NextResponse.json(result.item, { status: 201 })
}
