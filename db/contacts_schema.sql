-- ============================================================================
-- SBK Motors · Esquema de contactos / CRM (PostgreSQL · proyecto Supabase
-- dedicado a CRM — separado del proyecto de Inventario).
-- ============================================================================
-- Corre esto completo en el SQL Editor de tu proyecto de Supabase de CRM.
-- La tabla queda vacía a propósito: los contactos se agregan a mano desde
-- el panel "Agregar contacto" de la app, o los va registrando el agente de
-- WhatsApp a través de n8n a medida que conoce clientes nuevos.
--
-- Diseño:
--   - "status": 'ia' (la IA está llevando la conversación) | 'humano' (un
--     asesor tomó el control).
--   - "last_message"/"last_message_at": resumen denormalizado de la
--     conversación, para no depender de una tabla de mensajes en el front.
--     Quedan NULL hasta que el contacto tenga su primera interacción real.
--   - "total_spent", "orders_count", "tag": campos de CRM — cuánto ha
--     gastado el cliente, cuántos pedidos ha hecho, y una etiqueta libre
--     de segmentación (Nuevo, Frecuente, VIP, Prospecto, Mayorista, etc.).
--     "tag" es TEXT libre, no ENUM, para poder agregar etiquetas nuevas
--     sin migrar el esquema cada vez.
-- ============================================================================

CREATE TYPE contact_status AS ENUM ('ia', 'humano');

CREATE TABLE contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  status          contact_status NOT NULL DEFAULT 'ia',
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count    INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  total_spent     NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  orders_count    INTEGER NOT NULL DEFAULT 0 CHECK (orders_count >= 0),
  tag             TEXT NOT NULL DEFAULT 'Nuevo',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_phone ON contacts (phone);
CREATE INDEX idx_contacts_last_message_at ON contacts (last_message_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Sin datos semilla: la tabla arranca vacía. Agrega tus primeros contactos
-- reales desde el panel "Agregar contacto" de la app, o verifica que esté
-- vacía con:
-- SELECT * FROM contacts;
