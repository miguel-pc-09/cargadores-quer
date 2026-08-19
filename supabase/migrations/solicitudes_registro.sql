-- ============================================================
-- CargaQuer
-- Solicitudes de registro pendientes de aprobación municipal
-- ============================================================

create table if not exists public.solicitudes_registro (
  id uuid primary key default gen_random_uuid(),

  usuario_id uuid not null
    unique
    references auth.users(id)
    on delete cascade,

  nombre text not null,

  apellidos text not null,

  telefono text,

  dni text,

  email text not null,

  cliente text not null
    default 'Ayuntamiento de Quer',

  tipo_usuario text,

  filiacion text,

  matricula text not null,

  estado text not null
    default 'pendiente'
    check (
      estado in (
        'pendiente',
        'aprobada',
        'rechazada'
      )
    ),

  motivo_rechazo text,

  creado_en timestamptz not null
    default now(),

  actualizado_en timestamptz not null
    default now()
);

alter table public.solicitudes_registro
enable row level security;


-- ============================================================
-- El usuario autenticado puede consultar SU propia solicitud.
-- Esto permite mostrar correctamente "pendiente" o "rechazada"
-- cuando intenta iniciar sesión.
-- ============================================================

drop policy if exists
"solicitud propia lectura"
on public.solicitudes_registro;

create policy
"solicitud propia lectura"
on public.solicitudes_registro
for select
to authenticated
using (
  usuario_id = auth.uid()
);


-- ============================================================
-- El administrador puede consultar todas las solicitudes.
-- ============================================================

drop policy if exists
"administradores leen solicitudes"
on public.solicitudes_registro;

create policy
"administradores leen solicitudes"
on public.solicitudes_registro
for select
to authenticated
using (
  exists (
    select 1

    from public.perfiles p

    where p.id = auth.uid()

      and p.rol = 'administrador'
  )
);


-- ============================================================
-- REGISTRO
--
-- Cuando Supabase crea el usuario en auth.users:
--
-- SÍ:
--   crea solicitudes_registro
--
-- NO:
--   crea perfiles
--   crea vehiculos
--
-- Los datos definitivos solamente se crean cuando
-- el Ayuntamiento aprueba la solicitud.
-- ============================================================

create or replace function
public.cargaquer_crear_solicitud_registro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text;

  v_apellidos text;

  v_telefono text;

  v_dni text;

  v_cliente text;

  v_tipo_usuario text;

  v_filiacion text;

  v_matricula text;
begin

  v_nombre :=
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'nombre',
        ''
      )
    );

  v_apellidos :=
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'apellidos',
        ''
      )
    );

  v_telefono :=
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'telefono',
          ''
        )
      ),
      ''
    );

  v_dni :=
    nullif(
      upper(
        trim(
          coalesce(
            new.raw_user_meta_data ->> 'dni',
            ''
          )
        )
      ),
      ''
    );

  v_cliente :=
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'cliente',
        'Ayuntamiento de Quer'
      )
    );

  v_tipo_usuario :=
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'tipo_usuario',
          ''
        )
      ),
      ''
    );

  v_filiacion :=
    nullif(
      trim(
        coalesce(
          new.raw_user_meta_data ->> 'filiacion',
          ''
        )
      ),
      ''
    );

  v_matricula :=
    upper(
      regexp_replace(
        trim(
          coalesce(
            new.raw_user_meta_data ->> 'matricula',
            ''
          )
        ),
        '[[:space:]-]',
        '',
        'g'
      )
    );


  if
    v_nombre = ''
    or v_apellidos = ''
    or coalesce(new.email, '') = ''
    or v_matricula = ''
  then
    raise exception
      'Faltan datos obligatorios para crear la solicitud de registro.';
  end if;


  insert into public.solicitudes_registro (
    usuario_id,
    nombre,
    apellidos,
    telefono,
    dni,
    email,
    cliente,
    tipo_usuario,
    filiacion,
    matricula
  )
  values (
    new.id,
    v_nombre,
    v_apellidos,
    v_telefono,
    v_dni,
    lower(new.email),
    v_cliente,
    v_tipo_usuario,
    v_filiacion,
    v_matricula
  );


  return new;
end;
$$;


drop trigger if exists
cargaquer_nuevo_usuario
on auth.users;


create trigger
cargaquer_nuevo_usuario
after insert
on auth.users
for each row
execute function
public.cargaquer_crear_solicitud_registro();


-- ============================================================
-- APROBAR SOLICITUD
--
-- El Ayuntamiento pulsa Aceptar.
--
-- En una única transacción:
--
-- 1. comprueba que quien lo ejecuta es administrador
-- 2. obtiene la solicitud
-- 3. crea el perfil
-- 4. crea el vehículo
-- 5. marca la solicitud como aprobada
--
-- Si cualquiera de esos pasos falla, no se guarda ninguno.
-- ============================================================

create or replace function
public.cargaquer_aprobar_solicitud(
  p_solicitud_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_solicitud public.solicitudes_registro%rowtype;
begin

  if not exists (
    select 1

    from public.perfiles p

    where p.id = auth.uid()

      and p.rol = 'administrador'
  )
  then
    raise exception
      'No tienes permisos para aprobar solicitudes.';
  end if;


  select *
  into v_solicitud
  from public.solicitudes_registro
  where id = p_solicitud_id
  for update;


  if not found then
    raise exception
      'No se ha encontrado la solicitud.';
  end if;


  if v_solicitud.estado <> 'pendiente' then
    raise exception
      'La solicitud ya ha sido procesada.';
  end if;


  insert into public.perfiles (
    id,
    nombre,
    apellidos,
    telefono,
    dni,
    rol,
    estado_cuenta,
    cliente,
    tipo_usuario,
    filiacion,
    email
  )
  values (
    v_solicitud.usuario_id,
    v_solicitud.nombre,
    v_solicitud.apellidos,
    v_solicitud.telefono,
    v_solicitud.dni,
    'usuario',
    'verificada',
    v_solicitud.cliente,
    v_solicitud.tipo_usuario,
    v_solicitud.filiacion,
    v_solicitud.email
  );


  insert into public.vehiculos (
    usuario_id,
    matricula,
    estado_validacion,
    motivo_rechazo
  )
  values (
    v_solicitud.usuario_id,
    v_solicitud.matricula,
    'validado',
    null
  );


  update public.solicitudes_registro

  set
    estado = 'aprobada',

    motivo_rechazo = null,

    actualizado_en = now()

  where id = p_solicitud_id;

end;
$$;


-- ============================================================
-- RECHAZAR SOLICITUD
--
-- No crea ni perfil ni vehículo.
-- ============================================================

create or replace function
public.cargaquer_rechazar_solicitud(
  p_solicitud_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

  if not exists (
    select 1

    from public.perfiles p

    where p.id = auth.uid()

      and p.rol = 'administrador'
  )
  then
    raise exception
      'No tienes permisos para rechazar solicitudes.';
  end if;


  update public.solicitudes_registro

  set
    estado = 'rechazada',

    motivo_rechazo =
      'Solicitud rechazada por el Ayuntamiento.',

    actualizado_en = now()

  where id = p_solicitud_id

    and estado = 'pendiente';


  if not found then
    raise exception
      'La solicitud no existe o ya ha sido procesada.';
  end if;

end;
$$;


revoke all
on function
public.cargaquer_aprobar_solicitud(uuid)
from public, anon;


revoke all
on function
public.cargaquer_rechazar_solicitud(uuid)
from public, anon;


grant execute
on function
public.cargaquer_aprobar_solicitud(uuid)
to authenticated;


grant execute
on function
public.cargaquer_rechazar_solicitud(uuid)
to authenticated;


grant select
on public.solicitudes_registro
to authenticated;