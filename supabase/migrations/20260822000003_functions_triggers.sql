-- ============================================================================
-- Zoox — Server-side logic
-- 1) Automatic audit logging (every write across modules)
-- 2) Live-session lifecycle RPCs with SERVER-SIDE cost calculation
-- 3) Inventory / loyalty / attendance helpers
-- 4) Reporting aggregate views (Recharts data source)
-- All functions are SECURITY DEFINER with pinned search_path; callable by
-- authenticated users only.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) AUDIT: generic row-change trigger -> audit_logs
-- ---------------------------------------------------------------------------
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_name  text;
  v_role  text := 'System';
  v_old   jsonb;
  v_new   jsonb;
  v_label text;
begin
  if v_actor is not null then
    select p.full_name, p.role::text into v_name, v_role from public.profiles p where p.id = v_actor;
    v_name := coalesce(v_name, 'Unknown');
  else
    v_name := 'System';
  end if;

  if tg_op = 'DELETE' then v_old := to_jsonb(old); else v_new := to_jsonb(new); end if;
  if tg_op = 'UPDATE' then v_old := to_jsonb(old); end if;

  -- Human-friendly target label from the most identifying column available
  v_label := coalesce(
    v_new ->> 'name', v_new ->> 'title', v_new ->> 'invoice_number',
    v_new ->> 'sku', v_new ->> 'full_name', v_new ->> 'game', v_new ->> 'description',
    v_old ->> 'name', v_old ->> 'title', v_old ->> 'invoice_number',
    v_old ->> 'sku', v_old ->> 'full_name', v_old ->> 'game', v_old ->> 'description',
    ''
  );

  insert into public.audit_logs (
    actor_id, actor_name, actor_role, action, target_table,
    target_id, target_label, details, before_state, after_state, severity
  ) values (
    v_actor,
    v_name,
    coalesce(nullif(v_role, ''), 'System'),
    case tg_op when 'INSERT' then 'Created' when 'UPDATE' then 'Updated' else 'Deleted' end,
    tg_table_name,
    coalesce(v_new ->> 'id', v_old ->> 'id')::uuid,
    v_label,
    case tg_op
      when 'INSERT' then format('%s created in %s.', v_label, tg_table_name)
      when 'UPDATE' then format('%s updated in %s (%s field(s) changed).',
        v_label, tg_table_name,
        (select count(*) from jsonb_object_keys(v_new) k where v_old -> k is distinct from v_new -> k))
      else format('%s removed from %s.', v_label, tg_table_name)
    end,
    v_old,
    v_new,
    case when tg_op = 'DELETE' then 'Warning'::severity_level else 'Info'::severity_level end
  );

  return coalesce(new, old);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','customers','rooms','catalog_products','inventory_items',
    'reservations','live_sessions','session_products','hardware','sales',
    'expenses','staff','attendance','waiting_list','maintenance_tasks',
    'lost_found','feedback','rewards','settings'
  ]
  loop
    execute format('drop trigger if exists audit_%1$s on public.%1$I', t);
    execute format(
      'create trigger audit_%1$s after insert or update or delete on public.%1$I
       for each row execute function public.audit_row_change()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2) LIVE SESSIONS — server-authoritative elapsed time & billing
-- ---------------------------------------------------------------------------

-- Elapsed PLAY seconds for a session (excludes paused time).
create or replace function public.session_elapsed_seconds(p_session public.live_sessions)
returns integer
language sql stable
as $$
  select greatest(0, floor(extract(epoch from (
    coalesce(p_session.paused_at, now()) - p_session.started_at
  )) - p_session.paused_seconds))::integer
$$;

-- Billed minutes: fixed sessions are capped at booked + extended time.
create or replace function public.session_billed_minutes(p_session public.live_sessions)
returns integer
language sql stable
as $$
  select case
    when p_session.session_kind = 'fixed' and p_session.fixed_duration_minutes is not null
      then least(public.session_elapsed_seconds(p_session) / 60,
                 p_session.fixed_duration_minutes + p_session.extended_minutes)
    else public.session_elapsed_seconds(p_session) / 60
  end
$$;

create or replace function public.start_session(
  p_room_id                uuid,
  p_guest_name             text default '',
  p_phone                  text default '',
  p_game                   text default '',
  p_players                integer default 1,
  p_session_kind           session_kind default 'open',
  p_fixed_duration_minutes integer default null,
  p_customer_id            uuid default null,
  p_reservation_id         uuid default null,
  p_controller_ids         uuid[] default '{}'
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_room   public.rooms;
  v_id     uuid;
  v_serial text;
begin
  if not public.is_staff_plus() then
    raise exception 'Only staff can start sessions';
  end if;

  select * into v_room from public.rooms where id = p_room_id for update;
  if v_room.id is null then raise exception 'Room not found'; end if;
  if v_room.status = 'Maintenance' then raise exception 'Room % is under maintenance', v_room.name; end if;
  if exists (
    select 1 from public.live_sessions
    where room_id = p_room_id and status in ('active', 'paused')
  ) then
    raise exception 'Room % already has an active session', v_room.name;
  end if;

  insert into public.live_sessions (
    room_id, reservation_id, customer_id, guest_name, phone, game, players,
    hourly_rate, session_kind, fixed_duration_minutes
  ) values (
    p_room_id, p_reservation_id, p_customer_id, p_guest_name, p_phone, p_game, p_players,
    v_room.hourly_rate, p_session_kind, p_fixed_duration_minutes
  ) returning id into v_id;

  update public.rooms set status = 'Occupied' where id = p_room_id;

  foreach v_serial in array coalesce(p_controller_ids, '{}') loop
    insert into public.session_controllers (session_id, hardware_id)
    select v_id, h.id from public.hardware h
      where (h.serial = v_serial or h.id::text = v_serial)
    on conflict do nothing;
  end loop;

  return v_id;
end;
$$;

create or replace function public.pause_session(p_session_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.live_sessions
     set status = 'paused', paused_at = now()
   where id = p_session_id and status = 'active';
  if not found then raise exception 'Session is not active'; end if;
end;
$$;

create or replace function public.resume_session(p_session_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.live_sessions
     set paused_seconds = paused_seconds + floor(extract(epoch from (now() - paused_at)))::int,
         paused_at = null,
         status = 'active'
   where id = p_session_id and status = 'paused';
  if not found then raise exception 'Session is not paused'; end if;
end;
$$;

create or replace function public.extend_session(p_session_id uuid, p_minutes integer)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_minutes is null or p_minutes <= 0 then raise exception 'Minutes must be positive'; end if;
  update public.live_sessions
     set extended_minutes = extended_minutes + p_minutes
   where id = p_session_id and status in ('active', 'paused');
  if not found then raise exception 'Session not found'; end if;
end;
$$;

create or replace function public.add_session_product(
  p_session_id uuid,
  p_product_id uuid default null,
  p_name       text default null,
  p_price      numeric default null,
  p_qty        integer default 1
)
returns void
language plpgsql security definer set search_path = public as $$
declare v public.catalog_products;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'Quantity must be positive'; end if;

  if p_product_id is not null then
    select * into v from public.catalog_products where id = p_product_id;
    if v.id is null then raise exception 'Product not found'; end if;
    p_name  := coalesce(p_name, v.name);
    p_price := coalesce(p_price, v.price);
  end if;
  if p_name is null or p_price is null then
    raise exception 'Product name and price are required';
  end if;

  update public.session_products sp
     set qty = sp.qty + p_qty
   where sp.session_id = p_session_id and sp.product_id is not distinct from p_product_id
     and sp.name = p_name;
  if not found then
    insert into public.session_products (session_id, product_id, name, price, qty)
    values (p_session_id, p_product_id, p_name, p_price, p_qty);
  end if;
end;
$$;

-- THE critical path: authoritative checkout. Computes the final bill
-- server-side so billing survives tab closes/crashes/reconnects.
-- Creates the Sale (+ items), frees the room, updates customer stats/loyalty.
create or replace function public.end_session(
  p_session_id     uuid,
  p_payment_method payment_method default 'Cash'
)
returns uuid  -- sale id
language plpgsql
security definer set search_path = public
as $$
declare
  s              public.live_sessions;
  v_billed_min   integer;
  v_time_cost    numeric(12,2);
  v_prod_cost    numeric(12,2);
  v_subtotal     numeric(12,2);
  v_tax_rate     numeric(5,2);
  v_tax          numeric(12,2);
  v_total        numeric(12,2);
  v_sale_id      uuid;
  v_points       integer;
  v_tier         loyalty_tier;
  v_cust         public.customers;
begin
  if not public.is_staff_plus() then
    raise exception 'Only staff can close sessions';
  end if;

  select * into s from public.live_sessions where id = p_session_id for update;
  if s.id is null then raise exception 'Session not found'; end if;
  if s.status = 'completed' then raise exception 'Session already closed'; end if;

  v_billed_min := public.session_billed_minutes(s);

  -- Mirror of UI math: round((minutes / 60) * rate), whole EGP.
  v_time_cost := round((v_billed_min::numeric / 60) * s.hourly_rate);
  select coalesce(sum(price * qty), 0) into v_prod_cost from public.session_products where session_id = s.id;

  v_subtotal := v_time_cost + v_prod_cost;
  select tax_rate::numeric(5,2) into v_tax_rate from public.settings where id = 1;
  v_tax      := round(v_subtotal * coalesce(v_tax_rate, 0) / 100, 2);
  v_total    := v_subtotal + v_tax;

  insert into public.sales (customer_id, walk_in_name, session_id, subtotal, tax, total,
                            payment_method, sold_by)
  values (s.customer_id,
          coalesce(nullif(s.guest_name, ''), 'Walk-in'),
          s.id, v_subtotal, v_tax, v_total, p_payment_method, auth.uid())
  returning id into v_sale_id;

  if v_time_cost > 0 or v_billed_min > 0 then
    insert into public.sale_items (sale_id, kind, name, price, qty)
    values (v_sale_id, 'session_time',
            'Playtime — ' || coalesce(nullif(s.game, ''), 'Session') ||
            ' (' || v_billed_min || ' min)',
            s.hourly_rate, round(v_billed_min::numeric / 60, 2));
  end if;

  insert into public.sale_items (sale_id, product_id, kind, name, price, qty)
  select v_sale_id, product_id, 'product', name, price, qty
    from public.session_products where session_id = s.id;

  update public.live_sessions set
    status = 'completed', ended_at = now(), closed_by = auth.uid(),
    billed_minutes = v_billed_min, time_cost = v_time_cost,
    products_cost = v_prod_cost, total_cost = v_total
  where id = s.id;

  update public.rooms set status = 'Available' where id = s.room_id;

  if s.customer_id is not null then
    select * into v_cust from public.customers where id = s.customer_id for update;
    if v_cust.id is not null then
      v_points := floor(v_total * 0.6)::integer;  -- matches seed ratio (~0.6 pts/EGP)
      update public.customers set
        visits = visits + 1,
        total_spent = total_spent + v_total,
        loyalty_points = loyalty_points + v_points,
        last_visit = current_date
      where id = v_cust.id;

      insert into public.loyalty_transactions (customer_id, delta, reason, actor_id)
      values (v_cust.id, v_points, 'Session checkout — ' || v_total::text || ' EGP', auth.uid());
    end if;
  end if;

  return v_sale_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3) INVENTORY / LOYALTY / ATTENDANCE helpers
-- ---------------------------------------------------------------------------
create or replace function public.adjust_inventory(
  p_item_id uuid, p_delta integer, p_reason text default ''
)
returns integer
language plpgsql security definer set search_path = public as $$
declare v public.inventory_items;
begin
  if not public.is_staff_plus() then raise exception 'Not allowed'; end if;
  select * into v from public.inventory_items where id = p_item_id for update;
  if v.id is null then raise exception 'Item not found'; end if;
  if v.stock + p_delta < 0 then raise exception 'Insufficient stock'; end if;

  update public.inventory_items set
    stock = stock + p_delta,
    last_restocked = case when p_delta > 0 then current_date else last_restocked end,
    status = case
      when stock + p_delta = 0 then 'Out of Stock'::stock_status
      when stock + p_delta <= reorder_level then 'Low Stock'::stock_status
      else 'In Stock'::stock_status end
  where id = p_item_id;

  insert into public.inventory_movements (item_id, delta, reason, actor_id)
  values (p_item_id, p_delta, p_reason, auth.uid());

  return v.stock + p_delta;
end;
$$;

create or replace function public.tier_for_points(p_points integer)
returns loyalty_tier language sql immutable as $$
  select case
    when p_points >= 5000 then 'VIP'::loyalty_tier
    when p_points >= 2000 then 'Gold'::loyalty_tier
    when p_points >= 800  then 'Silver'::loyalty_tier
    else 'Bronze'::loyalty_tier end
$$;

create or replace function public.adjust_loyalty_points(
  p_customer_id uuid, p_delta integer, p_reason text default ''
)
returns integer
language plpgsql security definer set search_path = public as $$
declare v public.customers;
begin
  if not public.is_staff_plus() then raise exception 'Not allowed'; end if;
  select * into v from public.customers where id = p_customer_id for update;
  if v.id is null then raise exception 'Customer not found'; end if;

  update public.customers set
    loyalty_points = greatest(0, loyalty_points + p_delta),
    tier = public.tier_for_points(greatest(0, loyalty_points + p_delta))
  where id = p_customer_id;

  insert into public.loyalty_transactions (customer_id, delta, reason, actor_id)
  values (p_customer_id, p_delta, p_reason, auth.uid());

  return greatest(0, v.loyalty_points + p_delta);
end;
$$;

-- Shift clock map mirrors StaffAttendance mock data
create or replace function public.check_in(p_staff_id uuid)
returns attendance_state
language plpgsql security definer set search_path = public as $$
declare
  v_shift shift_name;
  v_start time;
  v_now   time := localtime;
  v_late  integer;
begin
  if not public.is_staff_plus() then raise exception 'Not allowed'; end if;
  select shift into v_shift from public.staff where id = p_staff_id;
  if v_shift is null then raise exception 'Staff not found'; end if;

  v_start := case v_shift
    when 'Morning' then '09:00' when 'Midday' then '12:00'
    when 'Evening' then '16:00' else '20:00' end::time;

  v_late := greatest(0, floor(extract(epoch from (v_now - v_start)) / 60))::integer;

  insert into public.attendance (
    staff_id, work_date, shift_label, shift_start, shift_end,
    status, location, check_in_at, minutes_late
  ) values (
    p_staff_id, current_date, v_shift, v_start, v_start + interval '8 hours',
    case when v_late > 0 then 'Late' else 'On Time' end::attendance_state,
    '', now(), v_late
  )
  on conflict (staff_id, work_date, shift_label) do update
    set check_in_at = now(), minutes_late = excluded.minutes_late,
        status = excluded.status;

  return case when v_late > 0 then 'Late' else 'On Time' end::attendance_state;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) REPORTING VIEWS (consumed by Reports page via Supabase)
-- ---------------------------------------------------------------------------
create or replace view public.revenue_daily with (security_invoker = true) as
select sold_at::date as day,
       count(*)                        as transactions,
       sum(subtotal)::numeric(12,2)    as subtotal,
       sum(tax)::numeric(12,2)         as tax,
       sum(total)::numeric(12,2)       as revenue
from public.sales
group by 1;

create or replace view public.expenses_daily with (security_invoker = true) as
select expense_date as day,
       count(*)                     as entries,
       sum(amount)::numeric(12,2)   as spend
from public.expenses
group by 1;

create or replace view public.occupancy_daily with (security_invoker = true) as
select started_at::date as day,
       count(*)                                        as sessions,
       coalesce(avg(billed_minutes), 0)::numeric(10,1) as avg_minutes,
       coalesce(sum(billed_minutes), 0)::numeric(12,1) as room_minutes,
       coalesce(sum(total_cost), 0)::numeric(12,2)     as revenue
from public.live_sessions
where status = 'completed'
group by 1;

create or replace view public.top_customers_view with (security_invoker = true) as
select id, name, tier, visits,
       total_spent::numeric(12,2) as total_spent,
       loyalty_points
from public.customers
order by total_spent desc
limit 20;

grant usage on schema public to authenticated;
grant execute on all functions in schema public to authenticated;
