import { NextResponse } from 'next/server'
import { updateItem } from '@/lib/api/inventory-demo-store'
import { deleteItem } from '@/lib/api/inventory-demo-store'
import { DB_INVENTORY_CATEGORIES, type DbInventoryCategory } from '@/lib/types/inventory'
import { getSupabase } from '@/lib/supabase/client'

const SELECT_COLUMNS =
  'id, sku, name, category, price, stock, specs, createdAt:created_at, updatedAt:updated_at'

function isDbCategory(value: string): value is DbInventoryCategory {
  return (DB_INVENTORY_CATEGORIES as readonly string[]).includes(value)
}

type RouteContext = { params: Promise<{ id: string }> }

// ── PATCH /api/inventory/[id] ────────────────────────────────────────────────
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'id_requerido' }, { status: 400 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'cuerpo_invalido' }, { status: 400 })
  }

  const { name, category, price, stock } = body as Record<string, unknown>

  const patch: Record<string, unknown> = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0)
      return NextResponse.json({ error: 'nombre_invalido' }, { status: 400 })
    patch.name = name.trim()
  }
  if (category !== undefined) {
    if (typeof category !== 'string' || !isDbCategory(category))
      return NextResponse.json({ error: 'categoria_invalida' }, { status: 400 })
    patch.category = category
  }
  if (price !== undefined) {
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0)
      return NextResponse.json({ error: 'precio_invalido' }, { status: 400 })
    patch.price = price
  }
  if (stock !== undefined) {
    if (typeof stock !== 'number' || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock))
      return NextResponse.json({ error: 'stock_invalido' }, { status: 400 })
    patch.stock = stock
  }

  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(patch)
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single()

    if (error) {
      if (error.code === 'PGRST116')
        return NextResponse.json({ error: 'no_encontrado' }, { status: 404 })
      return NextResponse.json({ error: 'error_supabase', detail: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  const result = updateItem(id, patch as Parameters<typeof updateItem>[1])
  if ('error' in result)
    return NextResponse.json({ error: result.error }, { status: 404 })
  return NextResponse.json(result.item)
}

// ── DELETE /api/inventory/[id] ───────────────────────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'id_requerido' }, { status: 400 })

  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
      .select('id')

    if (error)
      return NextResponse.json({ error: 'error_supabase', detail: error.message }, { status: 500 })
    if (!data || data.length === 0)
      return NextResponse.json({ error: 'no_encontrado' }, { status: 404 })
    return NextResponse.json({ id, deleted: true })
  }

  const result = deleteItem(id)
  if ('error' in result)
    return NextResponse.json({ error: result.error }, { status: 404 })
  return NextResponse.json(result)
}
