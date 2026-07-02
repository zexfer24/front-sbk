-- ============================================================================
-- SBK Motors · Esquema de inventario (PostgreSQL · proyecto Supabase
-- dedicado a Inventario — separado del proyecto de CRM).
-- ============================================================================
-- Corre esto completo en el SQL Editor de tu proyecto de Supabase de
-- Inventario.
-- ============================================================================

CREATE TYPE inventory_category AS ENUM ('Motor', 'Frenos', 'Transmisión', 'Accesorios');

CREATE TABLE inventory_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  category    inventory_category NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  specs       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE INDEX idx_inventory_items_name_trgm ON inventory_items USING gin (name gin_trgm_ops);
CREATE INDEX idx_inventory_items_sku ON inventory_items (sku);
CREATE INDEX idx_inventory_items_category ON inventory_items (category);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Datos semilla (los mismos 17 artículos del diseño visual, para que la
-- demo tenga contenido real desde el primer momento).
-- ============================================================================
INSERT INTO inventory_items (sku, name, category, price, stock) VALUES
  ('MTR-PST-250', 'Pistón forjado 250cc',          'Motor',        89.90,  18),
  ('MTR-JNT-001', 'Kit de juntas completo',         'Motor',        42.50,  4),
  ('MTR-FLT-KN9', 'Filtro de aceite K&N',           'Motor',        15.00,  31),
  ('MTR-BUJ-IR4', 'Bujía iridio NGK',                'Motor',        12.75,  0),
  ('MTR-LEV-RC1', 'Árbol de levas racing',           'Motor',        210.00, 6),
  ('FRN-DSC-320', 'Disco flotante 320mm',            'Frenos',       134.00, 9),
  ('FRN-PST-SNT', 'Pastillas sinterizadas',          'Frenos',       28.90,  3),
  ('FRN-BMB-RAD', 'Bomba de freno radial',           'Frenos',       175.50, 12),
  ('FRN-LIQ-51',  'Líquido DOT 5.1',                  'Frenos',       9.50,   0),
  ('TRN-CAD-520', 'Cadena DID 520 X-Ring',           'Transmisión',  64.00,  22),
  ('TRN-KIT-PC1', 'Kit piñón + corona',               'Transmisión',  78.00,  5),
  ('TRN-EMB-DSC', 'Disco de embrague',                'Transmisión',  46.90,  14),
  ('TRN-CBL-EMB', 'Cable de embrague',                'Transmisión',  11.00,  2),
  ('ACC-CSC-FBR', 'Casco integral fibra',             'Accesorios',   289.00, 7),
  ('ACC-GNT-RC2', 'Guantes racing cuero',             'Accesorios',   54.00,  16),
  ('ACC-ESP-CNC', 'Espejos retrovisores CNC',         'Accesorios',   38.50,  4),
  ('ACC-MAN-CNQ', 'Manillar conquistador',            'Accesorios',   67.00,  0);
