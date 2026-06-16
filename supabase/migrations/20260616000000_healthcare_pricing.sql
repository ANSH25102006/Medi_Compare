-- Supabase Migration: Healthcare Pricing System (Phase 2)
-- Target DB: https://wialpeheyvjdsmfcwuvn.supabase.co

-- Drop existing tables to establish new structured schema
drop table if exists public.favorites cascade;
drop table if exists public.reviews cascade;
drop table if exists public.bookings cascade;
drop table if exists public.hospital_procedures cascade;
drop table if exists public.procedures cascade;
drop table if exists public.profiles cascade;
drop table if exists public.hospitals cascade;

-- Enable UUID generation extension if not present
create extension if not exists "uuid-ossp";

-- 1. HOSPITALS TABLE
create table public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text,
  address text,
  hospital_type text,
  description text,
  rating numeric(3, 2) default 4.5,
  total_reviews integer default 0,
  image_url text,
  website text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for fast queries
create index idx_hospitals_city on public.hospitals(city);
create index idx_hospitals_type on public.hospitals(hospital_type);

-- 2. PROCEDURES TABLE
create table public.procedures (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_procedures_name on public.procedures(name);
create index idx_procedures_category on public.procedures(category);

-- 3. HOSPITAL_PROCEDURES TABLE
create table public.hospital_procedures (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references public.hospitals(id) on delete cascade not null,
  procedure_id uuid references public.procedures(id) on delete cascade not null,
  price numeric not null check (price >= 0),
  currency text default 'INR' not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint unique_hospital_procedure unique (hospital_id, procedure_id)
);

create index idx_hospital_procedures_hospital on public.hospital_procedures(hospital_id);
create index idx_hospital_procedures_procedure on public.hospital_procedures(procedure_id);
create index idx_hospital_procedures_price on public.hospital_procedures(price);

-- 4. PROFILES TABLE
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'patient' check (role in ('patient', 'doctor', 'hospital_admin', 'super_admin')),
  phone text,
  hospital_id uuid references public.hospitals(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. BOOKINGS TABLE (using text IDs as generated in code)
create table public.bookings (
  id text primary key,
  hospital_id uuid references public.hospitals(id) on delete cascade not null,
  hospital_name text,
  service_name text,
  booking_date text,
  booking_time text,
  amount numeric check (amount >= 0),
  booking_status text default 'Confirmed',
  payment_id text,
  payment_status text,
  user_name text,
  user_email text,
  user_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. REVIEWS TABLE
create table public.reviews (
  id text primary key,
  hospital_id uuid references public.hospitals(id) on delete cascade not null,
  user_name text,
  user_email text,
  rating integer check (rating >= 1 and rating <= 5),
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. FAVORITES TABLE
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references public.hospitals(id) on delete cascade not null,
  user_email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_hospital_favorite unique (hospital_id, user_email)
);

-- 8. CHEAPEST PROCEDURES ANALYTICS VIEW
create or replace view public.cheapest_procedures as
select distinct on (hp.procedure_id)
  hp.procedure_id,
  p.name as procedure_name,
  hp.hospital_id,
  h.name as hospital_name,
  hp.price,
  hp.currency
from public.hospital_procedures hp
join public.procedures p on p.id = hp.procedure_id
join public.hospitals h on h.id = hp.hospital_id
order by hp.procedure_id, hp.price asc;

-- 9. TRIGGERS TO SYNC AUTH SIGNUPS TO PROFILES
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  user_role := lower(coalesce(new.raw_user_meta_data->>'role', 'patient'));
  if user_role = 'admin' then
    user_role := 'hospital_admin';
  end if;

  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    user_role,
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_user_update()
returns trigger as $$
declare
  user_role text;
begin
  user_role := lower(coalesce(new.raw_user_meta_data->>'role', 'patient'));
  if user_role = 'admin' then
    user_role := 'hospital_admin';
  end if;

  update public.profiles
  set 
    full_name = coalesce(new.raw_user_meta_data->>'name', full_name),
    phone = coalesce(new.raw_user_meta_data->>'phone', phone),
    role = user_role
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

-- 10. ROW LEVEL SECURITY POLICIES

-- Enable RLS
alter table public.hospitals enable row level security;
alter table public.procedures enable row level security;
alter table public.hospital_procedures enable row level security;
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

-- Public Read Policies
create policy "Allow public read access to hospitals"
  on public.hospitals for select using (true);

create policy "Allow public read access to procedures"
  on public.procedures for select using (true);

create policy "Allow public read access to hospital_procedures"
  on public.hospital_procedures for select using (true);

create policy "Allow users to read profiles"
  on public.profiles for select using (true);

create policy "Allow public to read reviews"
  on public.reviews for select using (true);

-- Authenticated Users Policies
create policy "Allow authenticated users to create bookings"
  on public.bookings for insert with check (auth.role() = 'authenticated');

create policy "Allow users to read their own bookings"
  on public.bookings for select using (
    auth.uid()::text = user_id 
    or auth.email() = user_email
    or exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('super_admin', 'doctor', 'hospital_admin')
    )
  );

create policy "Allow authenticated users to create reviews"
  on public.reviews for insert with check (auth.role() = 'authenticated');

create policy "Allow users to delete or update their own reviews"
  on public.reviews for all using (
    auth.email() = user_email 
    or exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role = 'super_admin'
    )
  );

create policy "Allow authenticated users to manage their favorites"
  on public.favorites for all using (
    auth.email() = user_email 
    or auth.uid()::text = user_email
  ) with check (auth.role() = 'authenticated');

-- Hospital Admin Policies
create policy "Allow hospital admins to update pricing"
  on public.hospital_procedures for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (
        profiles.role = 'super_admin'
        or (profiles.role = 'hospital_admin' and profiles.hospital_id = hospital_procedures.hospital_id)
      )
    )
  );

create policy "Allow hospital admins to insert pricing"
  on public.hospital_procedures for insert with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (
        profiles.role = 'super_admin'
        or (profiles.role = 'hospital_admin' and profiles.hospital_id = hospital_id)
      )
    )
  );

-- Super Admin Policies
create policy "Allow super admin full control on hospitals"
  on public.hospitals for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

create policy "Allow super admin full control on procedures"
  on public.procedures for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

create policy "Allow users to update their own profile"
  on public.profiles for update using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

-- 11. SEED DEFAULT PROCEDURES
insert into public.procedures (name, category, description) values
  ('MRI Scan', 'Radiology', 'Magnetic resonance imaging scan to visualize internal structures.'),
  ('CT Scan', 'Radiology', 'Computed tomography scan for cross-sectional internal imaging.'),
  ('Ultrasound', 'Radiology', 'Diagnostic ultrasound imaging.'),
  ('Cataract Surgery', 'Surgery', 'Surgical replacement of natural lens with intraocular lens.'),
  ('Knee Replacement', 'Orthopedics', 'Total knee replacement surgery to restore joint function.'),
  ('Hip Replacement', 'Orthopedics', 'Total hip replacement surgery.'),
  ('Heart Bypass', 'Cardiology', 'Coronary artery bypass graft (CABG) surgery.'),
  ('Angioplasty', 'Cardiology', 'Minimally invasive procedure to open narrowed coronary arteries.'),
  ('Full Body Health Checkup', 'Diagnostics', 'Comprehensive general health checkup screening panel.'),
  ('Blood Test Panel', 'Diagnostics', 'Routine blood chemistry and count screening panels.')
on conflict (name) do nothing;
