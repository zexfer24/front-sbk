// ============================================================================
// MODO DEMO — simulador de la tabla `contacts` (con columnas de CRM).
// Empieza vacío a propósito: los contactos reales se agregan a mano desde
// el panel "Agregar contacto" en la UI, o llegan solos cuando el agente de
// WhatsApp (vía su propia conexión en n8n) registre clientes nuevos.
// ============================================================================

import type { Contact, NewContact } from "@/lib/types/contact"

function makeId() {
  return globalThis.crypto.randomUUID()
}

const globalForStore = globalThis as unknown as { __contactsStore?: Contact[] }

function getStore(): Contact[] {
  if (!globalForStore.__contactsStore) {
    globalForStore.__contactsStore = []
  }
  return globalForStore.__contactsStore
}

export function listContacts(): Contact[] {
  return [...getStore()].sort((a, b) => {
    const aTime = a.lastMessageAt ?? a.createdAt
    const bTime = b.lastMessageAt ?? b.createdAt
    return aTime < bTime ? 1 : -1
  })
}

export function updateContact(
  id: string,
  patch: Partial<Pick<Contact, 'name' | 'phone' | 'status' | 'tag'>>,
): { contact: Contact } | { error: 'no_encontrado' | 'telefono_duplicado' } {
  const store = getStore()
  const idx = store.findIndex((c) => c.id === id)
  if (idx === -1) return { error: 'no_encontrado' }
  if (patch.phone !== undefined) {
    const phoneNormalized = patch.phone.trim()
    const conflict = store.find((c) => c.phone === phoneNormalized && c.id !== id)
    if (conflict) return { error: 'telefono_duplicado' }
    patch = { ...patch, phone: phoneNormalized }
  }
  const updated: Contact = { ...store[idx], ...patch, updatedAt: new Date().toISOString() }
  store[idx] = updated
  return { contact: updated }
}

export function deleteContact(id: string): { id: string; deleted: true } | { error: 'no_encontrado' } {
  const store = getStore()
  const idx = store.findIndex((c) => c.id === id)
  if (idx === -1) return { error: 'no_encontrado' }
  store.splice(idx, 1)
  return { id, deleted: true }
}

export function createContact(
  input: NewContact,
): { contact: Contact } | { error: "telefono_duplicado" } {
  const store = getStore()
  const phoneNormalized = input.phone.trim()
  const exists = store.some((c) => c.phone === phoneNormalized)
  if (exists) return { error: "telefono_duplicado" }

  const now = new Date().toISOString()
  const contact: Contact = {
    id: makeId(),
    phone: phoneNormalized,
    name: input.name.trim(),
    status: input.status,
    tag: input.tag,
    lastMessage: null,
    lastMessageAt: null,
    unreadCount: 0,
    totalSpent: 0,
    ordersCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  store.push(contact)
  return { contact }
}
