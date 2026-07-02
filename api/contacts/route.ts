import { NextResponse } from "next/server"
import { createContact, listContacts } from "@/lib/api/contacts-demo-store"
import type { ContactStatus } from "@/lib/types/contact"
import { getSupabase } from "@/lib/supabase/client"

// Habla directo con Supabase (tabla contacts) si las credenciales están
// configuradas; si no, usa el store de demo en memoria.
// Ver db/SUPABASE_CONNECTION.md.

const SELECT_COLUMNS =
  'id, phone, name, status, lastMessage:last_message, lastMessageAt:last_message_at, ' +
  'unreadCount:unread_count, totalSpent:total_spent, ordersCount:orders_count, tag, ' +
  'createdAt:created_at, updatedAt:updated_at'

function isContactStatus(value: string): value is ContactStatus {
  return value === "ia" || value === "humano"
}

export async function GET() {
  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase
      .from("contacts")
      .select(SELECT_COLUMNS)
      .order("last_message_at", { ascending: false, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: "error_supabase", detail: error.message }, { status: 500 })
    }
    return NextResponse.json({ contacts: data, source: "supabase" })
  }

  return NextResponse.json({ contacts: listContacts(), source: "demo" })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "cuerpo_invalido" }, { status: 400 })
  }

  const { phone, name, status, tag } = body as Record<string, unknown>

  if (typeof phone !== "string" || phone.trim().length === 0) {
    return NextResponse.json({ error: "telefono_requerido" }, { status: 400 })
  }
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "nombre_requerido" }, { status: 400 })
  }
  if (typeof status !== "string" || !isContactStatus(status)) {
    return NextResponse.json({ error: "estado_invalido" }, { status: 400 })
  }
  if (typeof tag !== "string" || tag.trim().length === 0) {
    return NextResponse.json({ error: "etiqueta_invalida" }, { status: 400 })
  }

  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase
      .from("contacts")
      .insert({ phone: phone.trim(), name: name.trim(), status, tag })
      .select(SELECT_COLUMNS)
      .single()

    if (error) {
      // 23505 = unique_violation (Postgres) — el teléfono ya existe.
      if (error.code === "23505") {
        return NextResponse.json({ error: "telefono_duplicado" }, { status: 409 })
      }
      return NextResponse.json({ error: "error_supabase", detail: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  }

  const result = createContact({ phone, name, status, tag })
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }
  return NextResponse.json(result.contact, { status: 201 })
}
