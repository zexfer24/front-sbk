import { NextResponse } from 'next/server'
import { updateContact, deleteContact } from '@/lib/api/contacts-demo-store'
import type { ContactStatus } from '@/lib/types/contact'
import { getSupabase } from '@/lib/supabase/client'

const SELECT_COLUMNS =
  'id, phone, name, status, lastMessage:last_message, lastMessageAt:last_message_at, ' +
  'unreadCount:unread_count, totalSpent:total_spent, ordersCount:orders_count, tag, ' +
  'createdAt:created_at, updatedAt:updated_at'

function isContactStatus(value: string): value is ContactStatus {
  return value === 'ia' || value === 'humano'
}

type RouteContext = { params: Promise<{ id: string }> }

// ── PATCH /api/contacts/[id] ─────────────────────────────────────────────────
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'id_requerido' }, { status: 400 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'cuerpo_invalido' }, { status: 400 })
  }

  const { name, phone, status, tag } = body as Record<string, unknown>

  const patch: Record<string, unknown> = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0)
      return NextResponse.json({ error: 'nombre_invalido' }, { status: 400 })
    patch.name = name.trim()
  }
  if (phone !== undefined) {
    if (typeof phone !== 'string' || phone.trim().length === 0)
      return NextResponse.json({ error: 'telefono_invalido' }, { status: 400 })
    patch.phone = phone.trim()
  }
  if (status !== undefined) {
    if (typeof status !== 'string' || !isContactStatus(status))
      return NextResponse.json({ error: 'estado_invalido' }, { status: 400 })
    patch.status = status
  }
  if (tag !== undefined) {
    if (typeof tag !== 'string' || tag.trim().length === 0)
      return NextResponse.json({ error: 'etiqueta_invalida' }, { status: 400 })
    patch.tag = tag.trim()
  }

  const supabase = getSupabase()

  if (supabase) {
    const update: Record<string, unknown> = {}
    if (patch.name) update.name = patch.name
    if (patch.phone) update.phone = patch.phone
    if (patch.status) update.status = patch.status
    if (patch.tag) update.tag = patch.tag

    const { data, error } = await supabase
      .from('contacts')
      .update(update)
      .eq('id', id)
      .select(SELECT_COLUMNS)
      .single()

    if (error) {
      if (error.code === '23505')
        return NextResponse.json({ error: 'telefono_duplicado' }, { status: 409 })
      if (error.code === 'PGRST116')
        return NextResponse.json({ error: 'no_encontrado' }, { status: 404 })
      return NextResponse.json({ error: 'error_supabase', detail: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  const result = updateContact(id, patch as Parameters<typeof updateContact>[1])
  if ('error' in result) {
    const status = result.error === 'no_encontrado' ? 404 : 409
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result.contact)
}

// ── DELETE /api/contacts/[id] ────────────────────────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'id_requerido' }, { status: 400 })

  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .select('id')

    if (error)
      return NextResponse.json({ error: 'error_supabase', detail: error.message }, { status: 500 })
    if (!data || data.length === 0)
      return NextResponse.json({ error: 'no_encontrado' }, { status: 404 })
    return NextResponse.json({ id, deleted: true })
  }

  const result = deleteContact(id)
  if ('error' in result)
    return NextResponse.json({ error: result.error }, { status: 404 })
  return NextResponse.json(result)
}
