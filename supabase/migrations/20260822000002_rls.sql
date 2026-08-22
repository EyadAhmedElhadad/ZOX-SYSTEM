-- ============================================================================
-- Zoox — Row Level Security
-- Roles: Owner (full) / Manager (full minus settings writes, financial deletes)
--        Staff (operational, no financial/settings deletion)
--        Customer (own records only)
-- All helpers are SECURITY DEFINER and pinned to a safe search_path.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Role helpers
-- ---------------------------------------------------------------------------
create or replace function public.current_app_role()
returns app_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_app_role() = 'owner'
$$;

create or replace function public.is_owner_or_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_app_role() in ('owner', 'manager')
$$;

create or replace function public.is_staff_plus()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_app_role() in ('owner', 'manager', 'staff')
$$;

create or replace function public.own_customer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.customers where auth_user_id = auth.uid()
$$;

-- Prevent privilege self-escalation on profiles.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.id <> old.id then
    raise exception 'Cannot change profile owner';
  end if;
  if new.role <> old.role and not public.is_owner() then
    raise exception 'Only the owner can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','customers','rooms','catalog_products','inventory_items',
    'inventory_movements','reservations','live_sessions','session_products',
    'session_controllers','hardware','sales','sale_items','expenses','staff',
    'attendance','waiting_list','maintenance_tasks','lost_found','feedback',
    'rewards','loyalty_transactions','audit_logs','settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff_plus());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_manage on public.profiles for all to authenticated
  using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- customers: staff manage; customer sees & edits own record
-- ---------------------------------------------------------------------------
create policy customers_select on public.customers for select to authenticated
  using (public.is_staff_plus() or auth_user_id = auth.uid());
create policy customers_insert on public.customers for insert to authenticated
  with check (public.is_staff_plus() or auth_user_id = auth.uid());
create policy customers_update on public.customers for update to authenticated
  using (public.is_staff_plus() or auth_user_id = auth.uid())
  with check (public.is_staff_plus() or auth_user_id = auth.uid());
create policy customers_delete on public.customers for delete to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- rooms: everyone logged-in reads; staff can update status; delete mgmt only
-- ---------------------------------------------------------------------------
create policy rooms_select on public.rooms for select to authenticated using (true);
create policy rooms_insert on public.rooms for insert to authenticated
  with check (public.is_owner_or_manager());
create policy rooms_update on public.rooms for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy rooms_delete on public.rooms for delete to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- catalog_products: read by all, write mgmt
-- ---------------------------------------------------------------------------
create policy catalog_select on public.catalog_products for select to authenticated using (true);
create policy catalog_write on public.catalog_products for insert to authenticated
  with check (public.is_owner_or_manager());
create policy catalog_update on public.catalog_products for update to authenticated
  using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy catalog_delete on public.catalog_products for delete to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- inventory: staff operate stock; deletion is management-only
-- ---------------------------------------------------------------------------
create policy inv_select on public.inventory_items for select to authenticated using (true);
create policy inv_insert on public.inventory_items for insert to authenticated
  with check (public.is_staff_plus());
create policy inv_update on public.inventory_items for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy inv_delete on public.inventory_items for delete to authenticated
  using (public.is_owner_or_manager());

create policy invmov_select on public.inventory_movements for select to authenticated
  using (public.is_staff_plus());
create policy invmov_insert on public.inventory_movements for insert to authenticated
  with check (public.is_staff_plus());

-- ---------------------------------------------------------------------------
-- reservations: customers may create + read + cancel their own
-- ---------------------------------------------------------------------------
create policy res_select on public.reservations for select to authenticated
  using (public.is_staff_plus() or customer_id = public.own_customer_id());
create policy res_insert on public.reservations for insert to authenticated
  with check (
    public.is_staff_plus()
    or (customer_id = public.own_customer_id() and created_by_role = 'customer')
  );
create policy res_update on public.reservations for update to authenticated
  using (
    public.is_staff_plus()
    or (customer_id = public.own_customer_id() and status in ('Reserved', 'Waiting'))
  )
  with check (
    public.is_staff_plus()
    or (customer_id = public.own_customer_id() and status in ('Reserved', 'Waiting'))
  );
create policy res_delete on public.reservations for delete to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- live sessions + children: staff floor access only
-- ---------------------------------------------------------------------------
create policy sess_select on public.live_sessions for select to authenticated
  using (public.is_staff_plus());
create policy sess_insert on public.live_sessions for insert to authenticated
  with check (public.is_staff_plus());
create policy sess_update on public.live_sessions for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy sess_delete on public.live_sessions for delete to authenticated
  using (public.is_owner_or_manager());

create policy sprod_select on public.session_products for select to authenticated
  using (public.is_staff_plus());
create policy sprod_write on public.session_products for insert to authenticated
  with check (public.is_staff_plus());
create policy sprod_update on public.session_products for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy sprod_delete on public.session_products for delete to authenticated
  using (public.is_staff_plus());

create policy sctrl_all on public.session_controllers for all to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());

-- ---------------------------------------------------------------------------
-- hardware: staff operate, mgmt deletes
-- ---------------------------------------------------------------------------
create policy hw_select on public.hardware for select to authenticated using (true);
create policy hw_insert on public.hardware for insert to authenticated
  with check (public.is_staff_plus());
create policy hw_update on public.hardware for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy hw_delete on public.hardware for delete to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- sales: staff create/read; corrections mgmt-only; customers read own
-- ---------------------------------------------------------------------------
create policy sales_select on public.sales for select to authenticated
  using (public.is_staff_plus() or customer_id = public.own_customer_id());
create policy sales_insert on public.sales for insert to authenticated
  with check (public.is_staff_plus() or customer_id = public.own_customer_id());
create policy sales_update on public.sales for update to authenticated
  using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy sales_delete on public.sales for delete to authenticated
  using (public.is_owner());

create policy saleitems_select on public.sale_items for select to authenticated
  using (
    exists (
      select 1 from public.sales s
      where s.id = sale_id
        and (public.is_staff_plus() or s.customer_id = public.own_customer_id())
    )
  );
create policy saleitems_insert on public.sale_items for insert to authenticated
  with check (exists (select 1 from public.sales s where s.id = sale_id));
create policy saleitems_update on public.sale_items for update to authenticated
  using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy saleitems_delete on public.sale_items for delete to authenticated
  using (public.is_owner());

-- ---------------------------------------------------------------------------
-- expenses: staff read + record; financial deletion restricted
-- ---------------------------------------------------------------------------
create policy exp_select on public.expenses for select to authenticated
  using (public.is_staff_plus());
create policy exp_insert on public.expenses for insert to authenticated
  with check (public.is_staff_plus());
create policy exp_update on public.expenses for update to authenticated
  using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy exp_delete on public.expenses for delete to authenticated
  using (public.is_owner());

-- ---------------------------------------------------------------------------
-- staff directory & attendance
-- ---------------------------------------------------------------------------
create policy staff_select on public.staff for select to authenticated using (true);
create policy staff_insert on public.staff for insert to authenticated
  with check (public.is_owner_or_manager());
create policy staff_update on public.staff for update to authenticated
  using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy staff_delete on public.staff for delete to authenticated
  using (public.is_owner());

create policy att_select on public.attendance for select to authenticated
  using (public.is_staff_plus());
create policy att_insert on public.attendance for insert to authenticated
  with check (public.is_staff_plus());
create policy att_update on public.attendance for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy att_delete on public.attendance for delete to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- waiting list / maintenance / lost & found: operational for staff
-- ---------------------------------------------------------------------------
create policy wait_select on public.waiting_list for select to authenticated
  using (public.is_staff_plus());
create policy wait_insert on public.waiting_list for insert to authenticated
  with check (public.is_staff_plus());
create policy wait_update on public.waiting_list for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy wait_delete on public.waiting_list for delete to authenticated
  using (public.is_owner_or_manager());

create policy maint_select on public.maintenance_tasks for select to authenticated
  using (public.is_staff_plus());
create policy maint_insert on public.maintenance_tasks for insert to authenticated
  with check (public.is_staff_plus());
create policy maint_update on public.maintenance_tasks for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy maint_delete on public.maintenance_tasks for delete to authenticated
  using (public.is_owner_or_manager());

create policy lf_select on public.lost_found for select to authenticated
  using (public.is_staff_plus());
create policy lf_insert on public.lost_found for insert to authenticated
  with check (public.is_staff_plus());
create policy lf_update on public.lost_found for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy lf_delete on public.lost_found for delete to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- feedback: customers submit + read their own; staff triage
-- ---------------------------------------------------------------------------
create policy fb_select on public.feedback for select to authenticated
  using (public.is_staff_plus() or customer_id = public.own_customer_id());
create policy fb_insert on public.feedback for insert to authenticated
  with check (public.is_staff_plus() or customer_id = public.own_customer_id());
create policy fb_update on public.feedback for update to authenticated
  using (public.is_staff_plus()) with check (public.is_staff_plus());
create policy fb_delete on public.feedback for delete to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- loyalty rewards (catalog readable by all; points tx staff-managed or own read)
-- ---------------------------------------------------------------------------
create policy rw_select on public.rewards for select to authenticated using (true);
create policy rw_write on public.rewards for insert to authenticated
  with check (public.is_owner_or_manager());
create policy rw_update on public.rewards for update to authenticated
  using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy rw_delete on public.rewards for delete to authenticated
  using (public.is_owner_or_manager());

create policy ltx_select on public.loyalty_transactions for select to authenticated
  using (public.is_staff_plus() or customer_id = public.own_customer_id());
create policy ltx_insert on public.loyalty_transactions for insert to authenticated
  with check (public.is_staff_plus());

-- ---------------------------------------------------------------------------
-- audit logs: owner/manager read-only (writes happen via triggers/definer)
-- ---------------------------------------------------------------------------
create policy audit_select on public.audit_logs for select to authenticated
  using (public.is_owner_or_manager());

-- ---------------------------------------------------------------------------
-- settings: everyone reads; ONLY owner updates; no client deletes ever
-- ---------------------------------------------------------------------------
create policy settings_select on public.settings for select to authenticated using (true);
create policy settings_update on public.settings for update to authenticated
  using (public.is_owner()) with check (public.is_owner());
revoke delete on public.settings from anon, authenticated;
