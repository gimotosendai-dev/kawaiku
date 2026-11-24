-- 子育て支援センターアプリ フェーズ1 テーブル定義（下書き）
-- Supabase（PostgreSQL）用。ローカルのSupabaseで動作確認してから本番に適用すること。
-- フェーズ2の予約まわりは、フェーズ1が動いてから追加する。

create table facilities (
  id text primary key,
  name text not null,
  host text,
  address text,
  phone text,
  open_days text[] default '{}',
  open_time text,
  close_time text,
  reservation_type text not null default 'phone'
    check (reservation_type in ('external_web','external_app','onsite_or_phone','phone')),
  reservation_url text,
  reservation_note text,
  target_note text,
  color text,
  instagram_url text,
  image_url text,
  created_at timestamptz default now()
);

create table event_templates (
  id uuid primary key default gen_random_uuid(),
  facility_id text not null references facilities(id),
  name text not null,
  title text not null,
  category text not null,
  start_time text,
  end_time text,
  description text,
  min_age_months int,
  max_age_months int,
  target_tags text[] default '{}',
  capacity int,
  reservation_required boolean default false,
  fee_yen int,
  items_to_bring text[] default '{}',
  place_name text,
  repeat_rule text,               -- 例: 'weekly:tue'
  created_at timestamptz default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  facility_id text not null references facilities(id),
  template_id uuid references event_templates(id),
  date date not null,
  start_time text,
  end_time text,
  title text not null,
  category text not null,
  description text,
  min_age_months int,             -- null = 年齢制限なし
  max_age_months int,
  target_tags text[] default '{}',
  capacity int,                   -- 定員（組）。null = 制限なし
  reservation_required boolean default false,
  reservation_opens_at timestamptz,
  fee_yen int,
  items_to_bring text[] default '{}',
  place_name text,
  parking_busy boolean default false,
  image_url text,
  status text not null default 'draft'
    check (status in ('draft','published','cancelled')),
  stamp_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index events_date_idx on events(date);

create table notices (
  id uuid primary key default gen_random_uuid(),
  facility_id text not null references facilities(id),
  title text not null,
  body text,
  published_on date default current_date,
  expires_on date
);

create table closures (
  id uuid primary key default gen_random_uuid(),
  facility_id text not null references facilities(id),
  date date not null,
  reason text
);

create table newsletters (
  id uuid primary key default gen_random_uuid(),
  facility_id text not null references facilities(id),
  month text not null,            -- '2026-11'
  file_url text
);

create table facility_staff (
  user_id uuid references auth.users(id) on delete cascade,
  facility_id text references facilities(id),
  role text not null default 'staff' check (role in ('staff','admin')),
  primary key (user_id, facility_id)
);

-- ===== 権限（RLS） =====
alter table facilities enable row level security;
alter table events enable row level security;
alter table event_templates enable row level security;
alter table notices enable row level security;
alter table closures enable row level security;
alter table newsletters enable row level security;
alter table facility_staff enable row level security;

-- ログインしている人が、その施設の職員かどうか
create or replace function is_staff_of(fid text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from facility_staff
    where user_id = auth.uid() and (facility_id = fid or role = 'admin')
  );
$$;

-- 誰でも読める
create policy "公開: 施設" on facilities for select using (true);
create policy "公開: 公開済みイベント" on events for select using (status <> 'draft' or is_staff_of(facility_id));
create policy "公開: お知らせ" on notices for select using (true);
create policy "公開: 臨時休所" on closures for select using (true);
create policy "公開: おたより" on newsletters for select using (true);

-- 職員は自分の施設だけ編集できる
create policy "職員: 施設情報" on facilities for update using (is_staff_of(id));
create policy "職員: イベント" on events for all using (is_staff_of(facility_id)) with check (is_staff_of(facility_id));
create policy "職員: テンプレート" on event_templates for all using (is_staff_of(facility_id)) with check (is_staff_of(facility_id));
create policy "職員: お知らせ" on notices for all using (is_staff_of(facility_id)) with check (is_staff_of(facility_id));
create policy "職員: 臨時休所" on closures for all using (is_staff_of(facility_id)) with check (is_staff_of(facility_id));
create policy "職員: おたより" on newsletters for all using (is_staff_of(facility_id)) with check (is_staff_of(facility_id));
create policy "職員: 自分の所属を見る" on facility_staff for select using (user_id = auth.uid());
