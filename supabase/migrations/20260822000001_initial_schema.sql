-- ============================================================================
-- Zoox Gaming Center — initial schema
-- Postgres 15 / Supabase. UUID PKs, enum types, FKs, realtime publication.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enum types (status fields across all modules)
-- ---------------------------------------------------------------------------
create type app_role            as enum ('owner', 'manager', 'staff', 'customer');
create type room_type           as enum ('Standard', 'Premium', 'VIP');
create type room_status         as enum ('Available', 'Occupied', 'Reserved', 'Maintenance');
create type reservation_status  as enum ('Reserved', 'Arrived', 'Active', 'Completed', 'Cancelled', 'No Show', 'Waiting', 'Late');
create type session_status      as enum ('active', 'paused', 'completed', 'cancelled');
create type session_kind        as enum ('open', 'fixed');
create type zone_category       as enum ('playstation', 'billiards', 'cafe');
create type payment_method      as enum ('Cash', 'Card', 'Wallet', 'Transfer');
create type stock_status        as enum ('In Stock', 'Low Stock', 'Out of Stock');
create type hardware_type       as enum ('Console', 'Controller', 'Headset', 'Monitor', 'Cable');
create type hardware_status     as enum ('In Use', 'Available', 'Maintenance', 'Retired');
create type hardware_condition  as enum ('Excellent', 'Good', 'Fair', 'Poor');
create type lf_category         as enum ('Phone', 'Wallet', 'Accessory', 'Clothing', 'Other');
create type lf_status           as enum ('Unclaimed', 'Returned', 'Disposed');
create type feedback_status     as enum ('new', 'reviewed');
create type loyalty_tier        as enum ('Bronze', 'Silver', 'Gold', 'VIP');
create type maint_priority      as enum ('Low', 'Medium', 'High', 'Urgent');
create type task_status         as enum ('Open', 'In Progress', 'Done', 'Cancelled');
create type staff_title         as enum ('Receptionist', 'Cafe Cashier', 'Floor Supervisor', 'Technician', 'Manager');
create type shift_name          as enum ('Morning', 'Midday', 'Evening', 'Night');
create type staff_state         as enum ('Active', 'On Leave', 'Terminated');
create type waiting_status      as enum ('Waiting', 'Notified', 'Seated', 'Cancelled');
create type attendance_state    as enum ('On Time', 'Late', 'Absent', 'Off Duty');
create type severity_level      as enum ('Info', 'Warning', 'Critical');

-- ---------------------------------------------------------------------------
-- Profiles: 1-1 with auth.users, carries the role used by RLS everywhere.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  phone       text not null default '',
  role        app_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- Auto-create a profile whenever a user signs up (default role: customer).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::app_role, 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Customers (walk-in capable; optional link to an auth user)
-- ---------------------------------------------------------------------------
create table public.customers (
  id             uuid primary key default gen_random_uuid(),
  auth_user_id   uuid unique references auth.users (id) on delete set null,
  name           text not null,
  phone          text not null default '',
  email          text not null default '',
  visits         integer not null default 0 check (visits >= 0),
  total_spent    numeric(12,2) not null default 0 check (total_spent >= 0),
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  tier           loyalty_tier not null default 'Bronze',
  last_visit     date,
  notes          text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index customers_phone_idx on public.customers (phone);
create index customers_tier_idx on public.customers (tier);

-- ---------------------------------------------------------------------------
-- Rooms & zones
-- ---------------------------------------------------------------------------
create table public.rooms (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  room_type    room_type not null default 'Standard',
  status       room_status not null default 'Available',
  capacity     integer not null default 2 check (capacity > 0),
  controllers  integer not null default 2 check (controllers >= 0),
  hourly_rate  numeric(10,2) not null check (hourly_rate >= 0),
  ps_model     text not null default 'PS5',
  category     zone_category not null default 'playstation',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalog (café products) & Inventory
-- ---------------------------------------------------------------------------
create table public.catalog_products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null default 'Drinks',
  price       numeric(10,2) not null check (price >= 0),
  emoji       text not null default '🎮',
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.inventory_items (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null default 'Drinks',
  sku             text not null unique,
  stock           integer not null default 0 check (stock >= 0),
  reorder_level   integer not null default 0 check (reorder_level >= 0),
  unit_price      numeric(10,2) not null default 0 check (unit_price >= 0),
  supplier        text not null default '',
  last_restocked  date,
  status          stock_status not null default 'In Stock',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.inventory_movements (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.inventory_items (id) on delete cascade,
  delta       integer not null,
  reason      text not null default '',
  actor_id    uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Reservations
-- ---------------------------------------------------------------------------
create table public.reservations (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references public.customers (id) on delete set null,
  guest_name       text not null default '',
  phone            text not null default '',
  room_id          uuid references public.rooms (id) on delete set null,
  category         zone_category not null default 'playstation',
  game             text not null default '',
  players          integer not null default 1 check (players > 0),
  res_date         date not null,
  res_time         time not null default '00:00',
  duration_minutes integer,
  status           reservation_status not null default 'Reserved',
  session_kind     session_kind not null default 'open',
  notes            text,
  created_by_role  app_role not null default 'staff',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index reservations_date_idx on public.reservations (res_date);
create index reservations_status_idx on public.reservations (status);
create index reservations_customer_idx on public.reservations (customer_id);

-- ---------------------------------------------------------------------------
-- Live sessions (the critical path)
-- elapsed = now - started_at - paused_seconds (server-authoritative)
-- costs are computed server-side by end_session(); running display is derived.
-- ---------------------------------------------------------------------------
create table public.live_sessions (
  id                      uuid primary key default gen_random_uuid(),
  room_id                 uuid not null references public.rooms (id) on delete restrict,
  reservation_id          uuid references public.reservations (id) on delete set null,
  customer_id             uuid references public.customers (id) on delete set null,
  guest_name              text not null default '',
  phone                   text not null default '',
  game                    text not null default '',
  players                 integer not null default 1 check (players > 0),
  hourly_rate             numeric(10,2) not null check (hourly_rate >= 0),
  session_kind            session_kind not null default 'open',
  fixed_duration_minutes  integer,
  extended_minutes        integer not null default 0 check (extended_minutes >= 0),
  started_at              timestamptz not null default now(),
  paused_seconds          integer not null default 0 check (paused_seconds >= 0),
  paused_at               timestamptz,
  ended_at                timestamptz,
  status                  session_status not null default 'active',
  billed_minutes          integer,
  time_cost               numeric(12,2),
  products_cost           numeric(12,2),
  total_cost              numeric(12,2),
  closed_by               uuid references auth.users (id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index live_sessions_status_idx on public.live_sessions (status);
create index live_sessions_room_idx on public.live_sessions (room_id);

create table public.session_products (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.live_sessions (id) on delete cascade,
  product_id  uuid references public.catalog_products (id) on delete set null,
  name        text not null,
  price       numeric(10,2) not null check (price >= 0),
  qty         integer not null default 1 check (qty > 0),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Hardware (defined before session_controllers, which links sessions to
-- the physical controllers used)
-- ---------------------------------------------------------------------------
create table public.hardware (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  type           hardware_type not null default 'Controller',
  model          text not null default '',
  serial         text not null unique,
  room_id        uuid references public.rooms (id) on delete set null,
  location       text not null default 'Store',
  status         hardware_status not null default 'Available',
  condition      hardware_condition not null default 'Good',
  purchase_date  date,
  last_serviced  date,
  notes          text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.session_controllers (
  session_id   uuid not null references public.live_sessions (id) on delete cascade,
  hardware_id  uuid not null references public.hardware (id) on delete cascade,
  primary key (session_id, hardware_id)
);

-- ---------------------------------------------------------------------------
-- Sales & sale items (café + session billing; payment_method per GOAL #5)
-- ---------------------------------------------------------------------------
create sequence public.sale_invoice_seq start 7841;

create table public.sales (
  id              uuid primary key default gen_random_uuid(),
  invoice_number  text not null unique default ('SL-' || nextval('public.sale_invoice_seq')),
  customer_id     uuid references public.customers (id) on delete set null,
  walk_in_name    text not null default 'Walk-in',
  session_id      uuid references public.live_sessions (id) on delete set null,
  subtotal        numeric(12,2) not null default 0 check (subtotal >= 0),
  tax             numeric(12,2) not null default 0 check (tax >= 0),
  total           numeric(12,2) not null default 0 check (total >= 0),
  payment_method  payment_method not null default 'Cash',
  sold_by         uuid references auth.users (id) on delete set null,
  sold_at         timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index sales_sold_at_idx on public.sales (sold_at desc);
create index sales_customer_idx on public.sales (customer_id);
create index sales_session_idx on public.sales (session_id);

create table public.sale_items (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid not null references public.sales (id) on delete cascade,
  product_id  uuid references public.catalog_products (id) on delete set null,
  kind        text not null default 'product' check (kind in ('product', 'session_time')),
  name        text not null,
  price       numeric(10,2) not null check (price >= 0),
  qty         numeric(6,2) not null default 1 check (qty > 0),
  emoji       text not null default ''
);

create index sale_items_sale_idx on public.sale_items (sale_id);

-- ---------------------------------------------------------------------------
-- Expenses
-- ---------------------------------------------------------------------------
create table public.expenses (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  category        text not null default 'Other',
  amount          numeric(12,2) not null check (amount >= 0),
  vendor          text not null default '',
  expense_date    date not null default current_date,
  payment_method  payment_method not null default 'Cash',
  notes           text not null default '',
  recurring       boolean not null default false,
  recorded_by     uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index expenses_date_idx on public.expenses (expense_date);

-- ---------------------------------------------------------------------------
-- Staff & attendance
-- ---------------------------------------------------------------------------
create table public.staff (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid unique references public.profiles (id) on delete set null,
  name               text not null,
  role               staff_title not null default 'Receptionist',
  email              text not null default '',
  phone              text not null default '',
  shift              shift_name not null default 'Morning',
  status             staff_state not null default 'Active',
  hourly_rate        numeric(10,2) not null default 0 check (hourly_rate >= 0),
  hire_date          date,
  emergency_contact  text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.attendance (
  id            uuid primary key default gen_random_uuid(),
  staff_id      uuid not null references public.staff (id) on delete cascade,
  work_date     date not null default current_date,
  shift_label   shift_name,
  shift_start   time,
  shift_end     time,
  status        attendance_state not null default 'Off Duty',
  location      text not null default '',
  check_in_at   timestamptz,
  minutes_late  integer not null default 0 check (minutes_late >= 0),
  created_at    timestamptz not null default now(),
  unique (staff_id, work_date, shift_label)
);

-- ---------------------------------------------------------------------------
-- Waiting list
-- ---------------------------------------------------------------------------
create table public.waiting_list (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  party_size       integer not null default 1 check (party_size > 0),
  room_preference  text not null default 'Any' check (room_preference in ('Standard','Premium','VIP','Any')),
  game             text,
  phone            text,
  joined_at        timestamptz not null default now(),
  status           waiting_status not null default 'Waiting',
  notified_at      timestamptz,
  seated_room_id   uuid references public.rooms (id) on delete set null,
  notes            text
);

-- ---------------------------------------------------------------------------
-- Maintenance
-- ---------------------------------------------------------------------------
create table public.maintenance_tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  location      text not null default '',
  priority      maint_priority not null default 'Medium',
  status        task_status not null default 'Open',
  assigned_to   uuid references public.staff (id) on delete set null,
  reported_by   uuid references public.staff (id) on delete set null,
  reported_at   timestamptz not null default now(),
  description   text not null default '',
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Lost & found / Feedback
-- ---------------------------------------------------------------------------
create table public.lost_found (
  id              uuid primary key default gen_random_uuid(),
  description     text not null,
  category        lf_category not null default 'Other',
  found_location  text not null default '',
  found_by        text not null default '',
  found_at        timestamptz not null default now(),
  status          lf_status not null default 'Unclaimed',
  claimed_by      text not null default '',
  claimed_at      timestamptz,
  notes           text not null default '',
  created_at      timestamptz not null default now()
);

create table public.feedback (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references public.customers (id) on delete set null,
  session_id    uuid references public.live_sessions (id) on delete set null,
  author_name   text not null default '',
  game          text not null default '',
  room_id       uuid references public.rooms (id) on delete set null,
  rating        integer not null check (rating between 1 and 5),
  tags          text[] not null default '{}',
  notes         text not null default '',
  submitted_at  timestamptz not null default now(),
  status        feedback_status not null default 'new'
);

-- ---------------------------------------------------------------------------
-- Loyalty rewards catalog + point transactions (points live on customers)
-- ---------------------------------------------------------------------------
create table public.rewards (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text not null default '',
  cost         integer not null check (cost >= 0),
  emoji        text not null default '🎁',
  enabled      boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.loyalty_transactions (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers (id) on delete cascade,
  delta        integer not null,
  reason       text not null default '',
  actor_id     uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index loyalty_tx_customer_idx on public.loyalty_transactions (customer_id);

-- ---------------------------------------------------------------------------
-- Audit logs (auto-populated by triggers — see functions migration)
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references auth.users (id) on delete set null,
  actor_name    text not null default 'System',
  actor_role    text not null default 'System',
  action        text not null,
  target_table  text not null default '',
  target_id     uuid,
  target_label  text not null default '',
  details       text not null default '',
  before_state  jsonb,
  after_state   jsonb,
  severity      severity_level not null default 'Info',
  created_at    timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Settings (singleton row)
-- ---------------------------------------------------------------------------
create table public.settings (
  id                       integer primary key default 1 check (id = 1),
  center_name              text not null default 'Zoox Gaming Center',
  center_phone             text not null default '',
  center_address           text not null default '',
  currency                 text not null default 'EGP',
  tax_rate                 numeric(5,2) not null default 14 check (tax_rate >= 0),
  low_stock_threshold      integer not null default 25 check (low_stock_threshold >= 0),
  standard_hourly          numeric(10,2) not null default 80,
  premium_hourly           numeric(10,2) not null default 100,
  vip_hourly               numeric(10,2) not null default 200,
  session_timeout_minutes  integer not null default 30,
  notifications_enabled    boolean not null default true,
  sound_enabled            boolean not null default true,
  maintenance_mode         boolean not null default false,
  updated_at               timestamptz not null default now(),
  updated_by               uuid references auth.users (id) on delete set null
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Realtime publication (live sessions floor updates without polling)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table
  public.live_sessions,
  public.session_products,
  public.rooms,
  public.reservations,
  public.waiting_list,
  public.sales;

-- ---------------------------------------------------------------------------
-- updated_at touch trigger for mutable tables
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','customers','rooms','catalog_products','inventory_items',
    'reservations','live_sessions','hardware','expenses','staff',
    'maintenance_tasks','settings'
  ]
  loop
    execute format(
      'create trigger touch_%1$s_updated before update on public.%1$I
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;
