-- Add address fields to usuarios table
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS piso TEXT,
ADD COLUMN IF NOT EXISTS departamento TEXT,
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(20),
ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100),
ADD COLUMN IF NOT EXISTS provincia VARCHAR(100),
ADD COLUMN IF NOT EXISTS pais VARCHAR(100);

-- Add comments to the new columns
COMMENT ON COLUMN public.usuarios.direccion IS 'Calle y número de la dirección';
COMMENT ON COLUMN public.usuarios.piso IS 'Piso del departamento (opcional)';
COMMENT ON COLUMN public.usuarios.departamento IS 'Departamento (opcional)';
COMMENT ON COLUMN public.usuarios.codigo_postal IS 'Código postal de la dirección';
COMMENT ON COLUMN public.usuarios.ciudad IS 'Ciudad de la dirección';
COMMENT ON COLUMN public.usuarios.provincia IS 'Provincia/Estado de la dirección';
COMMENT ON COLUMN public.usuarios.pais IS 'País de la dirección';

-- Update the Row type for the usuarios table
drop type if exists public.usuarios_row_type;
create type public.usuarios_row_type as (
  id text,
  email text,
  nombre text,
  telefono text,
  tipo text,
  direccion text,
  piso text,
  departamento text,
  codigo_postal text,
  ciudad text,
  provincia text,
  pais text,
  is_active boolean,
  is_verified boolean,
  verification_status text,
  verification_step text,
  fecha_creacion text,
  fecha_actualizacion text,
  foto text,
  is_admin boolean,
  last_verification_attempt text,
  phone_verified boolean,
  phone_verified_at text
);
