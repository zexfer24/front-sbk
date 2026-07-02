# Conexión a Supabase — directa, sin n8n de intermediario

El dashboard (Inventario y Contactos) habla **directo con Supabase**, sin
pasar por n8n. n8n queda dedicado únicamente al agente de IA de WhatsApp,
que tiene su propia conexión a esta misma base de datos configurada
*dentro de n8n* (su propio nodo Postgres) — completamente desacoplada de
este proyecto de Next.js.

```
Navegador → /api/inventory (Next.js, servidor) → Supabase (tabla inventory_items)
Navegador → /api/contacts  (Next.js, servidor) → Supabase (tabla contacts)

n8n (agente de WhatsApp) → Supabase (mismas tablas, conexión propia de n8n)
```

Esto significa: si tu túnel de ngrok o tu Docker de n8n se caen, el
dashboard sigue funcionando con total normalidad — solo el agente de
WhatsApp se vería afectado.

## Una sola base de datos, dos tablas

Inventario y Contactos viven en el **mismo proyecto de Supabase**, solo en
tablas distintas (`inventory_items` y `contacts`). Por eso ambos usan
exactamente las mismas credenciales — no necesitas duplicar nada.

## Variables de entorno

```
# Server-only. NUNCA agregues el prefijo NEXT_PUBLIC_ a estas dos — la
# service_role key tiene permisos completos sobre la base de datos
# (bypassa Row Level Security) y jamás debe llegar al navegador.
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Necesaria para que las Server Components llamen a nuestras rutas
# internas con una URL absoluta. En producción (Vercel), pon la URL
# pública real de tu app.
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

Encuentras ambos valores en tu proyecto de Supabase: **Settings → API**.
- `SUPABASE_URL` = "Project URL"
- `SUPABASE_SERVICE_ROLE_KEY` = "service_role" (en la sección "Project API keys" — no la "anon public")

No necesitas la `anon` key en este proyecto: como todo el acceso pasa por
las rutas internas de Next.js (código de servidor, nunca el navegador
directo), `service_role` es la única key que se usa aquí.

## Cómo sabe el front si está usando datos reales o de demo

Cada respuesta de `/api/inventory` y `/api/contacts` incluye un campo
`source: "supabase" | "demo"`. Si `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
no están configuradas, las rutas caen automáticamente al modo demo (datos
en memoria) — así puedes seguir trabajando en el front sin tener las
credenciales a mano. El badge "Sincronizado con Supabase" / "Modo demo"
que ves en Inventario y CRM refleja ese campo en tiempo real, no una
variable que tengas que sincronizar a mano.

## Esquema esperado

Las columnas que el código espera están definidas en:
- `db/schema.sql` — tabla `inventory_items`
- `db/contacts_schema.sql` — tabla `contacts`

Corre ambos archivos completos en el SQL Editor de tu proyecto de
Supabase. El código lee/escribe usando alias de columnas vía PostgREST
(ej. `created_at` se expone como `createdAt`), así que no necesitas
cambiar nada si ya corriste esos esquemas tal cual están.

## Si algo falla

Las rutas devuelven `{ "error": "error_supabase", "detail": "..." }` con
status 500 si Supabase responde con un error inesperado (credenciales
incorrectas, tabla inexistente, columna con otro nombre, etc.) — el
campo `detail` trae el mensaje exacto de Postgres/PostgREST para que
puedas diagnosticarlo rápido.

Errores esperados y manejados explícitamente:
- SKU duplicado al crear un artículo → `{ "error": "sku_duplicado" }` (409)
- Teléfono duplicado al crear un contacto → `{ "error": "telefono_duplicado" }` (409)
- Eliminar un artículo que no existe → `{ "error": "no_encontrado" }` (404)
