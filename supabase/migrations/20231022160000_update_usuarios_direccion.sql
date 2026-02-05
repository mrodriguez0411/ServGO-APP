-- Primero, creamos las columnas temporales si no existen
DO $$
BEGIN
    -- Verificamos si las columnas de dirección existen
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'usuarios' 
              AND column_name = 'direccion' 
              AND data_type = 'text') THEN
        -- Si existe la columna direccion como text, la renombramos temporalmente
        ALTER TABLE public.usuarios RENAME COLUMN direccion TO direccion_texto;
    END IF;
    
    -- Verificamos y renombramos las demás columnas si existen
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'usuarios' 
              AND column_name = 'piso') THEN
        ALTER TABLE public.usuarios RENAME COLUMN piso TO piso_temp;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'usuarios' 
              AND column_name = 'departamento') THEN
        ALTER TABLE public.usuarios RENAME COLUMN departamento TO departamento_temp;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'usuarios' 
              AND column_name = 'codigo_postal') THEN
        ALTER TABLE public.usuarios RENAME COLUMN codigo_postal TO codigo_postal_temp;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'usuarios' 
              AND column_name = 'ciudad') THEN
        ALTER TABLE public.usuarios RENAME COLUMN ciudad TO ciudad_temp;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'usuarios' 
              AND column_name = 'provincia') THEN
        ALTER TABLE public.usuarios RENAME COLUMN provincia TO provincia_temp;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'usuarios' 
              AND column_name = 'pais') THEN
        ALTER TABLE public.usuarios RENAME COLUMN pais TO pais_temp;
    END IF;
END $$;

-- Añadimos la columna direccion como JSONB
ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS direccion JSONB;

-- Actualizamos la columna direccion con los datos de las columnas temporales
UPDATE public.usuarios
SET direccion = jsonb_build_object(
  'calle', COALESCE(direccion_texto, ''),
  'numero', '',
  'piso', COALESCE(piso_temp, ''),
  'departamento', COALESCE(departamento_temp, ''),
  'codigoPostal', COALESCE(codigo_postal_temp, ''),
  'ciudad', COALESCE(ciudad_temp, ''),
  'provincia', COALESCE(provincia_temp, ''),
  'pais', COALESCE(pais_temp, 'Argentina')
)
WHERE direccion IS NULL;

-- Eliminamos las columnas temporales
ALTER TABLE public.usuarios 
  DROP COLUMN IF EXISTS direccion_texto,
  DROP COLUMN IF EXISTS piso_temp,
  DROP COLUMN IF EXISTS departamento_temp,
  DROP COLUMN IF EXISTS codigo_postal_temp,
  DROP COLUMN IF EXISTS ciudad_temp,
  DROP COLUMN IF EXISTS provincia_temp,
  DROP COLUMN IF EXISTS pais_temp;

-- Actualizamos el tipo usuarios_row_type
DROP TYPE IF EXISTS public.usuarios_row_type;
CREATE TYPE public.usuarios_row_type AS (
  id text,
  email text,
  nombre text,
  telefono text,
  tipo text,
  direccion jsonb,
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

-- Actualizamos los comentarios
COMMENT ON COLUMN public.usuarios.direccion IS 'Datos de la dirección del usuario en formato JSON';

-- Creamos un índice para búsquedas por ciudad
CREATE INDEX IF NOT EXISTS idx_usuarios_direccion_ciudad ON public.usuarios ((direccion->>'ciudad'));

-- Creamos un índice para búsquedas por provincia
CREATE INDEX IF NOT EXISTS idx_usuarios_direccion_provincia ON public.usuarios ((direccion->>'provincia'));

-- Creamos un índice para búsquedas por código postal
CREATE INDEX IF NOT EXISTS idx_usuarios_direccion_codigo_postal ON public.usuarios ((direccion->>'codigoPostal'));
