-- Solicitudes de registro de CargaQuer.

create extension if not exists pgcrypto;

-- Tabla de solicitudes pendientes.
create table if not exists public.solicitudes_registro (
  id uuid primary key default gen_random_uuid(),

  usuario_id uuid not null
    unique
    references auth.users(id)
    on delete cascade,

  nombre text not null,

  apellidos text not null,

  telefono text,

  -- DNI guardado como SHA-256.
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


-- Protege los DNI existentes.
update public.solicitudes_registro
set dni = encode(
  digest(
    upper(
      regexp_replace(
        trim(dni),
        '[[:space:]-]',
        '',
        'g'
      )
    ),
    'sha256'
  ),
  'hex'
)
where dni is not null
  and trim(dni) <> ''
  and dni !~ '^[0-9a-fA-F]{64}$';


-- Protege los DNI de perfiles existentes.
update public.perfiles
set dni = encode(
  digest(
    upper(
      regexp_replace(
        trim(dni),
        '[[:space:]-]',
        '',
        'g'
      )
    ),
    'sha256'
  ),
  'hex'
)
where dni is not null
  and trim(dni) <> ''
  and dni !~ '^[0-9a-fA-F]{64}$';


-- Elimina vehículos creados por el flujo antiguo.
delete from public.vehiculos v
using public.solicitudes_registro s
where v.usuario_id = s.usuario_id
  and s.estado = 'pendiente';


-- Elimina perfiles creados por el flujo antiguo.
delete from public.perfiles p
using public.solicitudes_registro s
where p.id = s.usuario_id
  and p.rol = 'usuario'
  and s.estado = 'pendiente';


-- Elimina el trigger antiguo.
drop trigger if exists cargaquer_nuevo_usuario
on auth.users;


-- Elimina triggers antiguos de perfiles o vehículos.
do $$
declare
  trigger_actual record;
  definicion_funcion text;
begin

  for trigger_actual in

    select
      t.tgname,
      t.tgfoid

    from pg_trigger t

    where t.tgrelid = 'auth.users'::regclass
      and not t.tgisinternal

  loop

    definicion_funcion :=
      pg_get_functiondef(trigger_actual.tgfoid);

    if
      definicion_funcion ilike '%perfiles%'
      or definicion_funcion ilike '%vehiculos%'
    then

      execute format(
        'drop trigger if exists %I on auth.users',
        trigger_actual.tgname
      );

    end if;

  end loop;

end;
$$;


-- Elimina la política de lectura anterior.
drop policy if exists
  "solicitud propia lectura"
on public.solicitudes_registro;


-- Permite leer la solicitud propia.
create policy
  "solicitud propia lectura"
on public.solicitudes_registro
for select
to authenticated
using (
  usuario_id = auth.uid()
);


-- Elimina la política anterior de administradores.
drop policy if exists
  "administradores leen solicitudes"
on public.solicitudes_registro;


-- Permite al administrador leer solicitudes.
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


-- Función para crear una solicitud de registro.
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

  -- Obtiene el nombre.
  v_nombre :=
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'nombre',
        ''
      )
    );


  -- Obtiene los apellidos.
  v_apellidos :=
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'apellidos',
        ''
      )
    );


  -- Obtiene el teléfono.
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


  -- Obtiene el DNI.
  v_dni :=
    nullif(
      lower(
        trim(
          coalesce(
            new.raw_user_meta_data ->> 'dni',
            ''
          )
        )
      ),
      ''
    );


  -- Protege DNI antiguos enviados en claro.
  if v_dni is not null
     and v_dni !~ '^[0-9a-f]{64}$'
  then

    v_dni :=
      encode(
        digest(
          upper(
            regexp_replace(
              v_dni,
              '[[:space:]-]',
              '',
              'g'
            )
          ),
          'sha256'
        ),
        'hex'
      );

  end if;


  -- Obtiene el cliente.
  v_cliente :=
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'cliente',
        'Ayuntamiento de Quer'
      )
    );


  -- Obtiene el tipo de usuario.
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


  -- Obtiene la filiación.
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


  -- Obtiene y normaliza la matrícula.
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


  -- Comprueba los datos obligatorios.
  if
    v_nombre = ''
    or v_apellidos = ''
    or coalesce(new.email, '') = ''
    or v_matricula = ''
  then

    raise exception
      'Faltan datos obligatorios para crear la solicitud de registro.';

  end if;


  -- Guarda la solicitud pendiente.
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
    matricula,
    estado
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
    v_matricula,
    'pendiente'
  );


  return new;

end;
$$;


-- Ejecuta la solicitud al crear un usuario.
create trigger cargaquer_nuevo_usuario
after insert
on auth.users
for each row
execute function
public.cargaquer_crear_solicitud_registro();


-- Función para aprobar una solicitud.
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

  -- Comprueba permisos de administrador.
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


  -- Obtiene la solicitud.
  select *
  into v_solicitud

  from public.solicitudes_registro

  where id = p_solicitud_id

  for update;


  -- Comprueba que exista.
  if not found then

    raise exception
      'No se ha encontrado la solicitud.';

  end if;


  -- Comprueba que siga pendiente.
  if v_solicitud.estado <> 'pendiente' then

    raise exception
      'La solicitud ya ha sido procesada.';

  end if;


  -- Crea el perfil del usuario.
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


  -- Crea el vehículo validado.
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


  -- Marca la solicitud como aprobada.
  update public.solicitudes_registro

  set
    estado = 'aprobada',
    motivo_rechazo = null,
    actualizado_en = now()

  where id = p_solicitud_id;

end;
$$;


-- Función para rechazar una solicitud.
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

  -- Comprueba permisos de administrador.
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


  -- Marca la solicitud como rechazada.
  update public.solicitudes_registro

  set
    estado = 'rechazada',

    motivo_rechazo =
      'Solicitud rechazada por el Ayuntamiento.',

    actualizado_en = now()

  where id = p_solicitud_id
    and estado = 'pendiente';


  -- Comprueba que se haya actualizado.
  if not found then

    raise exception
      'La solicitud no existe o ya ha sido procesada.';

  end if;

end;
$$;


-- Permisos del esquema.
grant usage
on schema public
to authenticated, service_role;


-- Permisos de cargadores y tomas.
grant select
on public.cargadores, public.tomas
to authenticated;


-- Permisos de reservas y cargas.
grant select, insert, update
on public.reservas, public.cargas
to authenticated;


-- Permisos de perfiles y vehículos.
grant select, update
on public.perfiles, public.vehiculos
to authenticated;


-- Permisos de solicitudes.
grant select
on public.solicitudes_registro
to authenticated;


grant select, insert, update, delete
on public.solicitudes_registro
to service_role;


-- Permisos de avisos.
grant select, insert, update
on public.avisos_email
to service_role;


-- Retira acceso público a aprobar solicitudes.
revoke all
on function
public.cargaquer_aprobar_solicitud(uuid)
from public, anon;


-- Retira acceso público a rechazar solicitudes.
revoke all
on function
public.cargaquer_rechazar_solicitud(uuid)
from public, anon;


-- Permite aprobar a usuarios autenticados.
grant execute
on function
public.cargaquer_aprobar_solicitud(uuid)
to authenticated;


-- Permite rechazar a usuarios autenticados.
grant execute
on function
public.cargaquer_rechazar_solicitud(uuid)
to authenticated;