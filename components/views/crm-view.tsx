'use client'

import { useMemo, useState } from 'react'
import { Bot, Clock, Phone, Receipt, User, Wallet, Loader2, AlertCircle, Users, UserPlus, Pencil } from 'lucide-react'
import type { Contact } from '@/lib/types/contact'
import { useContacts } from '@/lib/hooks/use-contacts'
import { timeAgo } from '@/lib/time-ago'
import { PageHeader } from '@/components/page-header'
import { AddContactModal } from '@/components/add-contact-modal'
import { EditContactModal } from '@/components/edit-contact-modal'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'ia' | 'humano'

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'ia', label: 'Atendidos por IA' },
  { id: 'humano', label: 'Con asesor' },
]

function CustomerCard({
  contact,
  index,
  onEdit,
}: {
  contact: Contact
  index: number
  onEdit: (c: Contact) => void
}) {
  const isAi = contact.status === 'ia'
  return (
    <article
      className={cn(
        'animate-assemble group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-4',
        'transition-all duration-200 hover:-translate-y-1 hover:border-primary/50',
        'hover:shadow-[0_0_0_1px_oklch(0.58_0.22_25/0.4),0_8px_24px_-8px_oklch(0.58_0.22_25/0.5)]',
      )}
      style={{ animationDelay: `${Math.min(index, 20) * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-metal/50 text-base font-semibold text-foreground ring-1 ring-border">
            {contact.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{contact.name}</h3>
            <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {contact.phone}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold',
            isAi ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
          )}
        >
          {isAi ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
          {isAi ? 'IA' : 'Asesor'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Última interacción · {timeAgo(contact.lastMessageAt)}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <div className="leading-tight">
            <p className="font-mono text-sm font-bold tabular-nums text-foreground">
              US$ {contact.totalSpent.toLocaleString('en-US')}
            </p>
            <p className="text-[0.65rem] text-muted-foreground">Gastado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-foreground/70" />
          <div className="leading-tight">
            <p className="font-mono text-sm font-bold tabular-nums text-foreground">{contact.ordersCount}</p>
            <p className="text-[0.65rem] text-muted-foreground">Pedidos</p>
          </div>
        </div>
      </div>

      <span className="absolute right-3 top-3 rounded-full border border-border bg-secondary px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        {contact.tag}
      </span>

      {/* Edit button — appears on hover */}
      <button
        type="button"
        onClick={() => onEdit(contact)}
        aria-label={`Editar ${contact.name}`}
        className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-primary/15 hover:text-primary group-hover:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </article>
  )
}

export function CrmView() {
  const { contacts, source, loading, error, create, update, remove } = useContacts()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return contacts.filter((c) => {
      const matchFilter = filter === 'all' || c.status === filter
      const matchQuery = q === '' || c.name.toLowerCase().includes(q) || c.phone.includes(q)
      return matchFilter && matchQuery
    })
  }, [contacts, filter, query])

  const aiCount = contacts.filter((c) => c.status === 'ia').length
  const humanCount = contacts.filter((c) => c.status === 'humano').length

  return (
    <>
      <PageHeader eyebrow="Libreta de clientes" title="CRM del taller">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs',
              source === 'supabase'
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-border bg-card text-muted-foreground',
            )}
            title={source === 'supabase' ? 'Conectado directo a Supabase' : 'Modo demo — configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY'}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', source === 'supabase' ? 'bg-success' : 'bg-muted-foreground')} />
            {source === 'supabase' ? 'Sincronizado con Supabase' : 'Modo demo'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">
            <Bot className="h-3.5 w-3.5" />
            {aiCount} con IA
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs text-warning">
            <User className="h-3.5 w-3.5" />
            {humanCount} con asesor
          </span>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="power-glow inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Agregar contacto
          </button>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente por nombre o teléfono…"
          aria-label="Buscar clientes"
          className="h-11 w-full rounded-lg border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors',
                  active
                    ? 'border-primary bg-primary/15 text-foreground shadow-[0_0_12px_oklch(0.58_0.22_25/0.35)]'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Cargando clientes…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
          <AlertCircle className="h-6 w-6 text-primary" />
          <p className="text-sm text-primary">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {contacts.length === 0
              ? 'Todavía no hay clientes registrados. Agrega el primero para empezar.'
              : 'No se encontraron clientes para tu búsqueda.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <main className="grid flex-1 auto-rows-min grid-cols-1 content-start gap-4 px-4 pb-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
          {filtered.map((c, i) => (
            <CustomerCard key={c.id} contact={c} index={i} onEdit={setEditingContact} />
          ))}
        </main>
      )}

      <AddContactModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={create} />

      <EditContactModal
        key={editingContact?.id}
        contact={editingContact}
        onClose={() => setEditingContact(null)}
        onUpdate={update}
        onDelete={remove}
      />
    </>
  )
}
