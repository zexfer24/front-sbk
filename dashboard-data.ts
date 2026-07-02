// Mock data for the SBK Motors dashboard, chat and CRM views.
// Hours of operation shown across the day in the bar charts.

export const dayHours = [
  '08h',
  '09h',
  '10h',
  '11h',
  '12h',
  '13h',
  '14h',
  '15h',
  '16h',
  '17h',
  '18h',
  '19h',
]

export interface HourlySeries {
  /** revenue generated per hour (in local currency units) */
  revenue: number[]
  /** active customer chats per hour */
  chats: number[]
  /** messages sent per hour */
  messages: number[]
}

export const hourly: HourlySeries = {
  revenue: [120, 240, 410, 690, 520, 300, 480, 760, 980, 1240, 870, 540],
  chats: [3, 6, 9, 14, 11, 7, 10, 16, 21, 24, 17, 11],
  messages: [24, 51, 88, 142, 119, 73, 108, 176, 233, 281, 192, 121],
}

export interface Kpi {
  id: string
  label: string
  value: string
  /** percent change vs. previous day; positive = up */
  trend: number
  hint: string
}

export const kpis: Kpi[] = [
  {
    id: 'revenue',
    label: 'Dinero generado hoy',
    value: 'US$ 8,150',
    trend: 18.2,
    hint: 'vs. ayer (US$ 6,890)',
  },
  {
    id: 'sales',
    label: 'Ventas completadas',
    value: '34',
    trend: 12.5,
    hint: 'vs. ayer (30)',
  },
  {
    id: 'new-chats',
    label: 'Nuevos chats iniciados',
    value: '49',
    trend: 7.8,
    hint: 'vs. ayer (45)',
  },
  {
    id: 'customers',
    label: 'Clientes totales',
    value: '1,284',
    trend: 2.1,
    hint: 'acumulado histórico',
  },
  {
    id: 'success',
    label: 'Tasa de éxito en venta',
    value: '69%',
    trend: -3.4,
    hint: '34 ventas / 49 chats',
  },
]

// ---------------------------------------------------------------------------
// Live chat
// ---------------------------------------------------------------------------

export type Sender = 'customer' | 'ai' | 'human'

export interface ChatMessage {
  id: string
  sender: Sender
  text: string
  time: string
  status?: 'sent' | 'delivered' | 'read'
}

export interface Conversation {
  id: string
  name: string
  phone: string
  lastMessage: string
  time: string
  unread: number
  handledBy: 'ai' | 'human'
  online?: boolean
  typing?: boolean
  messages: ChatMessage[]
}

export const conversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Marco Salinas',
    phone: '+58 412 555 1023',
    lastMessage: '¿Tienen pastillas para una Pulsar NS200?',
    time: '14:32',
    unread: 2,
    handledBy: 'ai',
    online: true,
    typing: true,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Hola, buenas tardes. Necesito repuestos para mi moto.',
        time: '14:28',
      },
      {
        id: 'm2',
        sender: 'ai',
        text: '¡Hola Marco! Bienvenido a SBK Motors. Con gusto te ayudo. ¿Qué modelo de moto tienes y qué repuesto buscas?',
        time: '14:29',
        status: 'read',
      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'Es una Bajaj Pulsar NS200.',
        time: '14:30',
      },
      {
        id: 'm4',
        sender: 'customer',
        text: '¿Tienen pastillas para una Pulsar NS200?',
        time: '14:32',
      },
      {
        id: 'm5',
        sender: 'ai',
        text: 'Sí, tenemos pastillas sinterizadas compatibles (SKU FRN-PST-SNT) a US$ 28.90. Quedan 3 en stock. ¿Deseas reservarlas?',
        time: '14:32',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'c2',
    name: 'Lucía Fernández',
    phone: '+58 414 778 2210',
    lastMessage: 'Perfecto, paso mañana a recoger el casco.',
    time: '13:54',
    unread: 0,
    handledBy: 'human',
    online: false,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Quería confirmar si llegó el casco integral que pedí.',
        time: '13:40',
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'Déjame verificar con el equipo del taller, un momento por favor.',
        time: '13:41',
        status: 'read',
      },
      {
        id: 'm3',
        sender: 'human',
        text: 'Hola Lucía, soy Diego del taller. Tu casco fibra talla M ya está disponible para recojo.',
        time: '13:50',
        status: 'read',
      },
      {
        id: 'm4',
        sender: 'customer',
        text: 'Perfecto, paso mañana a recoger el casco.',
        time: '13:54',
      },
    ],
  },
  {
    id: 'c3',
    name: 'Renzo Quispe',
    phone: '+58 424 331 8890',
    lastMessage: 'Gracias por la cotización 🙌',
    time: '12:10',
    unread: 0,
    handledBy: 'ai',
    online: true,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Buenas, cuánto cuesta una cadena DID 520?',
        time: '12:05',
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'La cadena DID 520 X-Ring cuesta US$ 64.00 e incluye garantía de 6 meses.',
        time: '12:06',
        status: 'read',
      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'Gracias por la cotización 🙌',
        time: '12:10',
      },
    ],
  },
  {
    id: 'c4',
    name: 'Andrea Ríos',
    phone: '+58 416 220 4471',
    lastMessage: '¿Hacen envíos a Maracaibo?',
    time: '11:47',
    unread: 1,
    handledBy: 'ai',
    online: false,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: '¿Hacen envíos a Maracaibo?',
        time: '11:47',
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'Sí, enviamos a todo el país por Zoom y MRW. El costo depende del destino y peso.',
        time: '11:47',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'c5',
    name: 'Taller El Rápido',
    phone: '+58 426 909 1188',
    lastMessage: 'Necesito 10 kits de juntas al por mayor.',
    time: '10:22',
    unread: 0,
    handledBy: 'human',
    online: true,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Necesito 10 kits de juntas al por mayor.',
        time: '10:22',
      },
      {
        id: 'm2',
        sender: 'human',
        text: 'Claro, te preparo una cotización mayorista con descuento por volumen.',
        time: '10:25',
        status: 'read',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Nota: los clientes de ejemplo (CRM) que vivían aquí ahora están en
// db/contacts_schema.sql (Supabase real) y en
// lib/api/contacts-demo-store.ts (modo demo). CrmView ya no usa datos mock
// locales — lee de Supabase directo o del store demo, a través de
// useContacts().
// ---------------------------------------------------------------------------
