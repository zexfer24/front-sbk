import { NextResponse } from "next/server"
import { deleteItem } from "@/lib/api/inventory-demo-store"
import { getSupabase } from "@/lib/supabase/client"

// POST (no DELETE) por simplicidad del lado del cliente. Ver
// db/SUPABASE_CONNECTION.md.

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const id = body && typeof body === "object" ? (body as Record<string, unknown>).id : undefined

  if (typeof id !== "string" || id.trim().length === 0) {
    return NextResponse.json({ error: "id_requerido" }, { status: 400 })
  }

  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase.from("inventory_items").delete().eq("id", id).select("id")

    if (error) {
      return NextResponse.json({ error: "error_supabase", detail: error.message }, { status: 500 })
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 })
    }
    return NextResponse.json({ id, deleted: true })
  }

  const result = deleteItem(id)
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json(result)
}
