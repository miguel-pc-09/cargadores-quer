-- Finalización automática de cargas.

create extension if not exists pg_cron;


-- Finaliza las cargas que han alcanzado su hora prevista.
create or replace function
public.cargaquer_finalizar_cargas_vencidas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  total integer;
begin

  with cargas_vencidas as (

    select
      cg.id,
      cg.reserva_id,
      cg.fecha_hora_fin_prevista,

      round(
        (
          greatest(
            0::numeric,
            extract(
              epoch
              from (
                cg.fecha_hora_fin_prevista
                - cg.fecha_hora_inicio
              )
            ) / 3600
          )
          * coalesce(cg.potencia_actual_kw, 0)
        )::numeric,
        2
      ) as energia_consumida_kwh

    from public.cargas cg

    where cg.estado = 'activa'

      and cg.fecha_hora_fin_prevista is not null

      and cg.fecha_hora_fin_prevista <= now()

  ),

  cargas_actualizadas as (

    update public.cargas cg

    set
      estado = 'finalizada',

      fecha_hora_fin_real = cv.fecha_hora_fin_prevista,

      energia_consumida_kwh = cv.energia_consumida_kwh

    from cargas_vencidas cv

    where cg.id = cv.id

    returning
      cg.id,
      cg.reserva_id

  ),

  reservas_actualizadas as (

    update public.reservas r

    set
      estado = 'finalizada',

      actualizada_en = now()

    from cargas_actualizadas ca

    where ca.reserva_id is not null

      and r.id = ca.reserva_id

      and r.estado = 'activa'

    returning r.id

  )

  select count(*)
  into total
  from cargas_actualizadas;

  return total;

end;
$$;


-- Procesa los estados automáticos de reservas y cargas.
create or replace function
public.cargaquer_procesar_estados_automaticos()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  reservas_caducadas integer;
  cargas_finalizadas integer;
begin

  select public.cargaquer_caducar_reservas_no_iniciadas()
  into reservas_caducadas;

  select public.cargaquer_finalizar_cargas_vencidas()
  into cargas_finalizadas;

  return jsonb_build_object(
    'reservasCaducadas',
    coalesce(reservas_caducadas, 0),
    'cargasFinalizadas',
    coalesce(cargas_finalizadas, 0)
  );

end;
$$;


-- Restringe las funciones al backend.
revoke all
on function
public.cargaquer_finalizar_cargas_vencidas()
from public, anon, authenticated;


revoke all
on function
public.cargaquer_procesar_estados_automaticos()
from public, anon, authenticated;


-- Permite ejecutar las funciones al servicio.
grant execute
on function
public.cargaquer_finalizar_cargas_vencidas()
to service_role;


grant execute
on function
public.cargaquer_procesar_estados_automaticos()
to service_role;


-- Elimina el cron anterior si ya existe.
do $$
declare
  trabajo record;
begin

  for trabajo in
    select jobid
    from cron.job
    where jobname = 'cargaquer-estados-automaticos'
  loop

    perform cron.unschedule(trabajo.jobid);

  end loop;

end;
$$;


-- Ejecuta las automatizaciones cada minuto.
select cron.schedule(
  'cargaquer-estados-automaticos',
  '* * * * *',
  'select public.cargaquer_procesar_estados_automaticos();'
);