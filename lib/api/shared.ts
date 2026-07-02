// Indica si una respuesta de /api/inventory o /api/contacts vino de
// Supabase real o del store de demo en memoria. Cada ruta lo incluye en su
// respuesta GET, así el front siempre refleja el estado real del backend
// en vez de depender de una variable de entorno que haya que sincronizar
// a mano. Ver db/SUPABASE_CONNECTION.md.
export type DataSource = "supabase" | "demo"
