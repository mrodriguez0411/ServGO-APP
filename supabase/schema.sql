-- Extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- 🔐 USUARIOS
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique not null,
  telefono text,
  tipo text check (tipo in ('client', 'provider')) not null,
  foto text,
  -- Verification & status
  is_active boolean not null default false,
  is_verified boolean not null default false,
  verification_status text check (verification_status in ('pending','in_review','verified','rejected','banned')) not null default 'pending',
  verification_step text check (verification_step in ('phone','documents','face','completed')) not null default 'phone',
  phone_verified boolean not null default false,
  phone_verified_at timestamptz,
  last_verification_attempt timestamptz,
  -- Optional admin flag to allow admin policies
  is_admin boolean not null default false,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create index if not exists idx_usuarios_tipo on usuarios (tipo);
create index if not exists idx_usuarios_verif_status on usuarios (verification_status);
create index if not exists idx_usuarios_is_active on usuarios (is_active);

-- 🧰 SERVICIOS
create table if not exists servicios (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid not null references usuarios(id) on delete cascade,
  titulo text not null,
  descripcion text,
  precio numeric(10,2),
  categoria text,
  imagen text,
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create index if not exists idx_servicios_profesional on servicios (profesional_id);
create index if not exists idx_servicios_categoria on servicios (categoria);
create index if not exists idx_servicios_activo on servicios (activo);

-- 📅 TURNOS
create table if not exists turnos (
  id uuid primary key default gen_random_uuid(),
  servicio_id uuid not null references servicios(id) on delete cascade,
  cliente_id uuid not null references usuarios(id) on delete cascade,
  fecha date not null,
  hora time not null,
  estado text check (estado in ('pendiente', 'aceptado', 'completado', 'cancelado')) default 'pendiente',
  observaciones text,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  constraint uniq_turno_por_servicio_fecha_hora unique (servicio_id, fecha, hora)
);

create index if not exists idx_turnos_servicio on turnos (servicio_id);
create index if not exists idx_turnos_cliente on turnos (cliente_id);
create index if not exists idx_turnos_fecha on turnos (fecha);

-- 💳 PAGOS
create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  turno_id uuid not null references turnos(id) on delete cascade,
  monto numeric(10,2) not null,
  estado text check (estado in ('pendiente', 'pagado', 'fallido')) default 'pendiente',
  fecha_pago timestamptz not null default now(),
  fecha_creacion timestamptz not null default now()
);

create index if not exists idx_pagos_turno on pagos (turno_id);
create index if not exists idx_pagos_estado on pagos (estado);

-- ⭐ RESEÑAS (ligadas a turnos completados)
create table if not exists resenas (
  id uuid primary key default gen_random_uuid(),
  turno_id uuid not null references turnos(id) on delete cascade,
  servicio_id uuid not null references servicios(id) on delete cascade,
  cliente_id uuid not null references usuarios(id) on delete cascade,
  calificacion int check (calificacion between 1 and 5) not null,
  comentario text,
  fecha_creacion timestamptz not null default now(),
  constraint uniq_resena_por_turno unique (turno_id)
);

create index if not exists idx_resenas_servicio on resenas (servicio_id);
create index if not exists idx_resenas_cliente on resenas (cliente_id);

-- 🔁 Trigger helper for updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.fecha_actualizacion = now();
  return new;
end;
$$;

-- Attach triggers
drop trigger if exists set_timestamp_usuarios on usuarios;
create trigger set_timestamp_usuarios
before update on usuarios
for each row execute function set_updated_at();

drop trigger if exists set_timestamp_servicios on servicios;
create trigger set_timestamp_servicios
before update on servicios
for each row execute function set_updated_at();

drop trigger if exists set_timestamp_turnos on turnos;
create trigger set_timestamp_turnos
before update on turnos
for each row execute function set_updated_at();

-- 🔒 Row Level Security (RLS)
alter table usuarios enable row level security;
alter table servicios enable row level security;
alter table turnos enable row level security;
alter table pagos enable row level security;
alter table resenas enable row level security;

-- 📄 DOCUMENTOS DE VERIFICACION
create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios(id) on delete cascade,
  tipo text check (tipo in ('id_front','id_back','selfie','certification','other')) not null,
  url text not null,
  estado text check (estado in ('pending','approved','rejected')) not null default 'pending',
  rechazo_motivo text,
  subido_en timestamptz not null default now(),
  revisado_en timestamptz,
  revisado_por uuid references usuarios(id),
  fecha_creacion timestamptz not null default now()
);

create index if not exists idx_documentos_user on documentos (user_id);
create index if not exists idx_documentos_tipo on documentos (tipo);
create index if not exists idx_documentos_estado on documentos (estado);

-- RLS for documentos
alter table documentos enable row level security;

-- Owner can see and insert their own documents
drop policy if exists documentos_select_owner on documentos;
create policy documentos_select_owner
on documentos for select
using (user_id = auth.uid());

drop policy if exists documentos_insert_owner on documentos;
create policy documentos_insert_owner
on documentos for insert
with check (user_id = auth.uid());

-- Admin can review/update any document
drop policy if exists documentos_update_admin on documentos;
create policy documentos_update_admin
on documentos for update
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- Optional: allow owners to delete their own docs while pending
drop policy if exists documentos_delete_owner_pending on documentos;
create policy documentos_delete_owner_pending
on documentos for delete
using (user_id = auth.uid() and estado = 'pending');

-- Admin can read all documents
drop policy if exists documentos_select_admin on documentos;
create policy documentos_select_admin
on documentos for select
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- USUARIOS: cada user solo ve/actualiza su fila
drop policy if exists usuarios_select_self on usuarios;
create policy usuarios_select_self
on usuarios for select
using (id = auth.uid());

drop policy if exists usuarios_update_self on usuarios;
create policy usuarios_update_self
on usuarios for update
using (id = auth.uid());

-- Insert: solo puede insertar su propia fila
drop policy if exists usuarios_insert_self on usuarios;
create policy usuarios_insert_self
on usuarios for insert
with check (id = auth.uid());

-- Admin policies: leer y actualizar cualquier usuario
drop policy if exists usuarios_select_admin on usuarios;
create policy usuarios_select_admin
on usuarios for select
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

drop policy if exists usuarios_update_admin on usuarios;
create policy usuarios_update_admin
on usuarios for update
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- SERVICIOS: cualquiera puede ver activos, el profesional gestiona los suyos
drop policy if exists servicios_select_public on servicios;
create policy servicios_select_public
on servicios for select
using (activo = true);

drop policy if exists servicios_manage_own on servicios;
create policy servicios_manage_own
on servicios for all
using (
  profesional_id = auth.uid() and
  exists (select 1 from usuarios u where u.id = auth.uid() and u.tipo = 'provider')
)
with check (
  profesional_id = auth.uid() and
  exists (select 1 from usuarios u where u.id = auth.uid() and u.tipo = 'provider')
);

-- Admin can read all services
drop policy if exists servicios_select_admin on servicios;
create policy servicios_select_admin
on servicios for select
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- Admin can update any service (e.g., toggle activo)
drop policy if exists servicios_update_admin on servicios;
create policy servicios_update_admin
on servicios for update
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- TURNOS: cliente o profesional involucrado puede ver; crear solo el cliente
drop policy if exists turnos_select_related on turnos;
create policy turnos_select_related
on turnos for select
using (
  cliente_id = auth.uid() or
  servicio_id in (select id from servicios where profesional_id = auth.uid())
);

drop policy if exists turnos_insert_client on turnos;
create policy turnos_insert_client
on turnos for insert
with check (cliente_id = auth.uid());

-- Admin can read all appointments
drop policy if exists turnos_select_admin on turnos;
create policy turnos_select_admin
on turnos for select
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- PAGOS: visibles si pertenecen a tus turnos
drop policy if exists pagos_select_related on pagos;
create policy pagos_select_related
on pagos for select
using (
  turno_id in (
    select t.id from turnos t
    where t.cliente_id = auth.uid()
       or t.servicio_id in (select s.id from servicios s where s.profesional_id = auth.uid())
  )
);

-- Admin can read all payments
drop policy if exists pagos_select_admin on pagos;
create policy pagos_select_admin
on pagos for select
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- RESEÑAS: visibles si sos cliente o el profesional; crear solo cliente con turno completado
drop policy if exists resenas_select_related on resenas;
create policy resenas_select_related
on resenas for select
using (
  cliente_id = auth.uid() or
  servicio_id in (select id from servicios where profesional_id = auth.uid())
);

drop policy if exists resenas_insert_client_completed on resenas;
create policy resenas_insert_client_completed
on resenas for insert
with check (
  cliente_id = auth.uid()
  and exists (
    select 1 from turnos t
    where t.id = turno_id
      and t.cliente_id = auth.uid()
      and t.estado = 'completado'
  )
);

-- Admin can read all reviews
drop policy if exists resenas_select_admin on resenas;
create policy resenas_select_admin
on resenas for select
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- 📬 OUTBOX para notificaciones (procesadas por Edge Function o backend)
create table if not exists notifications_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references usuarios(id) on delete cascade,
  channel text check (channel in ('email','whatsapp')) not null,
  template text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists idx_outbox_user on notifications_outbox (user_id);
create index if not exists idx_outbox_channel on notifications_outbox (channel);
create index if not exists idx_outbox_processed on notifications_outbox (processed_at);

alter table notifications_outbox enable row level security;

-- Admin can see all outbox rows
drop policy if exists outbox_admin_access on notifications_outbox;
create policy outbox_admin_access
on notifications_outbox for all
using (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true))
with check (exists (select 1 from usuarios u where u.id = auth.uid() and u.is_admin = true));

-- 🔧 Función segura para aprobar usuarios
create or replace function approve_user(p_user_id uuid, p_reviewer uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Ensure caller is admin
  if not exists (select 1 from usuarios where id = p_reviewer and is_admin = true) then
    raise exception 'not_authorized';
  end if;

  update usuarios
  set is_active = true,
      is_verified = true,
      verification_status = 'verified',
      verification_step = 'completed',
      fecha_actualizacion = now()
  where id = p_user_id;

  -- Enqueue notifications (email and whatsapp)
  insert into notifications_outbox (user_id, channel, template, payload)
  values
    (p_user_id, 'email', 'user_approved', jsonb_build_object('message', 'Tu cuenta ha sido aprobada.')), 
    (p_user_id, 'whatsapp', 'user_approved', jsonb_build_object('message', 'Tu cuenta ha sido aprobada.'));
end;
$$;

-- Trigger to enqueue notifications when a user transitions to verified and active (defensive)
create or replace function enqueue_on_user_verified()
returns trigger
language plpgsql
security definer
as $$
begin
  if (new.is_active = true and new.is_verified = true and new.verification_status = 'verified')
     and (old.is_verified is distinct from new.is_verified or old.is_active is distinct from new.is_active or old.verification_status is distinct from new.verification_status) then
    insert into notifications_outbox (user_id, channel, template, payload)
    values
      (new.id, 'email', 'user_approved', jsonb_build_object('message', 'Tu cuenta ha sido aprobada.')),
      (new.id, 'whatsapp', 'user_approved', jsonb_build_object('message', 'Tu cuenta ha sido aprobada.'));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enqueue_on_user_verified on usuarios;
create trigger trg_enqueue_on_user_verified
after update on usuarios
for each row execute function enqueue_on_user_verified();

-- 🏷️ CATEGORIAS
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  slug text not null unique,
  descripcion text,
  icono text,
  activa boolean not null default true,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create index if not exists idx_categorias_activa on categorias (activa);
create index if not exists idx_categorias_slug on categorias (slug);

-- Relación N:N entre servicios y categorías
create table if not exists servicios_categorias (
  servicio_id uuid not null references servicios(id) on delete cascade,
  categoria_id uuid not null references categorias(id) on delete cascade,
  fecha_creacion timestamptz not null default now(),
  primary key (servicio_id, categoria_id)
);

create index if not exists idx_serv_cat_servicio on servicios_categorias (servicio_id);
create index if not exists idx_serv_cat_categoria on servicios_categorias (categoria_id);

-- Junction: profesionales (usuarios tipo provider) <-> categorias
create table if not exists profesionales_categorias (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  categoria_id uuid not null references categorias(id) on delete cascade,
  fecha_creacion timestamptz not null default now(),
  primary key (usuario_id, categoria_id)
);

-- Enable RLS for new tables
alter table categorias enable row level security;
alter table profesionales_categorias enable row level security;
alter table servicios_categorias enable row level security;

-- CATEGORIAS: lectura publica (solo activas)
drop policy if exists categorias_select_public on categorias;
create policy categorias_select_public
on categorias for select
using (activa = true);

-- PROFESIONALES_CATEGORIAS: el profesional gestiona sus filas
drop policy if exists profesionales_categorias_select_self on profesionales_categorias;
create policy profesionales_categorias_select_self
on profesionales_categorias for select
using (
  usuario_id = auth.uid()
  or exists (
    select 1
    from servicios s
    join servicios_categorias sc on sc.servicio_id = s.id
    where s.profesional_id = auth.uid()
      and sc.categoria_id = profesionales_categorias.categoria_id
  )
);

drop policy if exists profesionales_categorias_insert_self on profesionales_categorias;
create policy profesionales_categorias_insert_self
on profesionales_categorias for insert
with check (
  usuario_id = auth.uid()
  and exists (select 1 from usuarios u where u.id = auth.uid() and u.tipo = 'provider')
);

drop policy if exists profesionales_categorias_delete_self on profesionales_categorias;
create policy profesionales_categorias_delete_self
on profesionales_categorias for delete
using (usuario_id = auth.uid());

-- Trigger updated_at for categorias
drop trigger if exists set_timestamp_categorias on categorias;
create trigger set_timestamp_categorias
before update on categorias
for each row execute function set_updated_at();

-- SERVICIOS_CATEGORIAS RLS: solo el dueño del servicio puede gestionar vínculos
drop policy if exists servicios_categorias_select_owner on servicios_categorias;
create policy servicios_categorias_select_owner
on servicios_categorias for select
using (
  exists (
    select 1 from servicios s
    where s.id = servicios_categorias.servicio_id
      and s.profesional_id = auth.uid()
  )
);

drop policy if exists servicios_categorias_insert_owner on servicios_categorias;
create policy servicios_categorias_insert_owner
on servicios_categorias for insert
with check (
  exists (
    select 1 from servicios s
    where s.id = servicio_id
      and s.profesional_id = auth.uid()
  )
);

drop policy if exists servicios_categorias_delete_owner on servicios_categorias;
create policy servicios_categorias_delete_owner
on servicios_categorias for delete
using (
  exists (
    select 1 from servicios s
    where s.id = servicios_categorias.servicio_id
      and s.profesional_id = auth.uid()
  )
);
