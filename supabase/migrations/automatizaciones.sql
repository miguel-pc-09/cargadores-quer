-- Automatizaciones de CargaQuer.

create extension if not exists pgcrypto;

-- Tabla para registrar avisos enviados.
create table if not exists public.avisos_email (
  id uuid primary key default gen_random_uuid(),

  tipo text not null,

  referencia_id text not null,

  destinatario text not null,

  estado text not null default 'enviado'
    check (estado in ('enviado', 'error')),

  detalle jsonb,

  enviado_en timestamptz not null default now(),

  constraint avisos_email_unico
    unique (tipo, referencia_id, destinatario)
);

alter table public.avisos_email
enable row level security;


-- Marca como avisados los usuarios ya aprobados.
insert into public.avisos_email (
  tipo,
  referencia_id,
  destinatario,
  estado,
  detalle
)
select
  'acceso_aprobado',
  p.id::text,
  coalesce(p.email, ''),
  'enviado',
  jsonb_build_object(
    'migracion_inicial',
    true
  )
from public.perfiles p
where p.estado_cuenta = 'verificada'
  and coalesce(p.email, '') <> ''
on conflict (
  tipo,
  referencia_id,
  destinatario
)
do nothing;


-- Caduca reservas no iniciadas.
create or replace function
public.cargaquer_caducar_reservas_no_iniciadas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  total integer;
begin

  with actualizadas as (

    update public.reservas r

    set
      estado = 'caducada',
      actualizada_en = now()

    where r.estado = 'confirmada'

      and greatest(

        (
          r.fecha::text
          || ' '
          || left(r.hora_inicio::text, 5)
        )::timestamp
          at time zone 'Europe/Madrid',

        r.creada_en

      ) + interval '15 minutes' <= now()

    returning r.id

  )

  select count(*)
  into total
  from actualizadas;

  return total;

end;
$$;


-- Obtiene usuarios pendientes sin aviso.
create or replace function
public.cargaquer_usuarios_pendientes_aviso()
returns table (
  usuario_id uuid,
  nombre text,
  apellidos text,
  email text,
  matricula text
)
language sql
security definer
set search_path = public
as $$

  select
    p.id,
    coalesce(p.nombre, ''),
    coalesce(p.apellidos, ''),
    coalesce(p.email, ''),
    coalesce(v.matricula, '')

  from public.perfiles p

  left join public.vehiculos v
    on v.usuario_id = p.id

  where p.estado_cuenta = 'pendiente'

    and coalesce(p.email, '') <> ''

    and not exists (

      select 1

      from public.avisos_email a

      where a.tipo = 'nuevo_usuario_admin'

        and a.referencia_id = p.id::text

        and a.estado = 'enviado'

    );

$$;


-- Obtiene usuarios aprobados sin aviso.
create or replace function
public.cargaquer_usuarios_aprobados_aviso()
returns table (
  usuario_id uuid,
  nombre text,
  apellidos text,
  email text
)
language sql
security definer
set search_path = public
as $$

  select
    p.id,
    coalesce(p.nombre, ''),
    coalesce(p.apellidos, ''),
    coalesce(p.email, '')

  from public.perfiles p

  where p.estado_cuenta = 'verificada'

    and coalesce(p.email, '') <> ''

    and not exists (

      select 1

      from public.avisos_email a

      where a.tipo = 'acceso_aprobado'

        and a.referencia_id = p.id::text

        and a.destinatario = p.email

        and a.estado = 'enviado'

    );

$$;


-- Obtiene reservas que empiezan en 15 minutos.
create or replace function
public.cargaquer_reservas_aviso_inicio()
returns table (
  reserva_id uuid,
  usuario_id uuid,
  email text,
  nombre text,
  cargador text,
  toma text,
  fecha date,
  hora_inicio text
)
language sql
security definer
set search_path = public
as $$

  select
    r.id,
    r.usuario_id,
    coalesce(p.email, ''),
    coalesce(p.nombre, ''),
    coalesce(c.nombre, 'Cargador'),
    coalesce(t.nombre, 'Toma'),
    r.fecha,
    left(r.hora_inicio::text, 5)

  from public.reservas r

  join public.perfiles p
    on p.id = r.usuario_id

  left join public.cargadores c
    on c.id = r.cargador_id

  left join public.tomas t
    on t.id = r.toma_id

  where r.estado = 'confirmada'

    and coalesce(p.email, '') <> ''

    and (

      (
        r.fecha::text
        || ' '
        || left(r.hora_inicio::text, 5)
      )::timestamp
        at time zone 'Europe/Madrid'

    ) >= now() + interval '14 minutes'

    and (

      (
        r.fecha::text
        || ' '
        || left(r.hora_inicio::text, 5)
      )::timestamp
        at time zone 'Europe/Madrid'

    ) < now() + interval '16 minutes'

    and not exists (

      select 1

      from public.avisos_email a

      where a.tipo = 'reserva_15_min'

        and a.referencia_id = r.id::text

        and a.destinatario = p.email

        and a.estado = 'enviado'

    );

$$;


-- Obtiene cargas que terminan en 15 minutos.
create or replace function
public.cargaquer_cargas_aviso_fin()
returns table (
  carga_id uuid,
  usuario_id uuid,
  email text,
  nombre text,
  cargador text,
  toma text,
  fecha_hora_fin_prevista timestamptz
)
language sql
security definer
set search_path = public
as $$

  select
    cg.id,
    cg.usuario_id,
    coalesce(p.email, ''),
    coalesce(p.nombre, ''),
    coalesce(c.nombre, 'Cargador'),
    coalesce(t.nombre, 'Toma'),
    cg.fecha_hora_fin_prevista

  from public.cargas cg

  join public.perfiles p
    on p.id = cg.usuario_id

  left join public.cargadores c
    on c.id = cg.cargador_id

  left join public.tomas t
    on t.id = cg.toma_id

  where cg.estado = 'activa'

    and cg.fecha_hora_fin_prevista is not null

    and coalesce(p.email, '') <> ''

    and cg.fecha_hora_fin_prevista
      >= now() + interval '14 minutes'

    and cg.fecha_hora_fin_prevista
      < now() + interval '16 minutes'

    and not exists (

      select 1

      from public.avisos_email a

      where a.tipo = 'carga_fin_15_min'

        and a.referencia_id = cg.id::text

        and a.destinatario = p.email

        and a.estado = 'enviado'

    );

$$;


-- Restringe las funciones al backend.
revoke all
on function
public.cargaquer_caducar_reservas_no_iniciadas()
from public, anon, authenticated;


revoke all
on function
public.cargaquer_usuarios_pendientes_aviso()
from public, anon, authenticated;


revoke all
on function
public.cargaquer_usuarios_aprobados_aviso()
from public, anon, authenticated;


revoke all
on function
public.cargaquer_reservas_aviso_inicio()
from public, anon, authenticated;


revoke all
on function
public.cargaquer_cargas_aviso_fin()
from public, anon, authenticated;


grant execute
on function
public.cargaquer_caducar_reservas_no_iniciadas()
to service_role;


grant execute
on function
public.cargaquer_usuarios_pendientes_aviso()
to service_role;


grant execute
on function
public.cargaquer_usuarios_aprobados_aviso()
to service_role;


grant execute
on function
public.cargaquer_reservas_aviso_inicio()
to service_role;


grant execute
on function
public.cargaquer_cargas_aviso_fin()
to service_role;


grant select, insert, update
on public.avisos_email
to service_role;