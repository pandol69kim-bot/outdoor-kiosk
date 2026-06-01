-- =============================================
-- 야외 무인 유통 주문 플랫폼 - Supabase 스키마
-- Supabase SQL 에디터에 붙여넣기하여 실행
-- =============================================

-- 도매처 테이블
create table if not exists wholesalers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  contact     text,
  phone       text,
  email       text,
  notify_type text not null default 'email' check (notify_type in ('email', 'manual')),
  memo        text,
  created_at  timestamptz not null default now()
);

-- 상품 테이블
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  price            integer not null check (price > 0),
  wholesale_price  integer,
  image_url        text,
  wholesaler_id    uuid references wholesalers(id) on delete set null,
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 주문 테이블
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique,
  product_id        uuid references products(id) on delete set null,
  product_name      text not null,
  product_price     integer not null,
  quantity          integer not null default 1 check (quantity > 0),
  total_price       integer not null,
  customer_name     text not null,
  customer_phone    text not null,
  delivery_address  text not null,
  delivery_memo     text,
  status            text not null default 'received' check (status in ('received', 'forwarded', 'shipping', 'delivered')),
  wholesaler_id     uuid references wholesalers(id) on delete set null,
  wholesaler_name   text,
  notified_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- =============================================
-- RLS (Row Level Security) 정책
-- =============================================

alter table products enable row level security;
alter table wholesalers enable row level security;
alter table orders enable row level security;

-- 소비자: 활성 상품 읽기 허용 (비인증)
create policy "public_read_active_products"
  on products for select
  using (is_active = true);

-- 소비자: 주문 생성 허용 (비인증)
create policy "public_insert_orders"
  on orders for insert
  with check (true);

-- 관리자(인증된 사용자): 상품 전체 접근
create policy "admin_all_products"
  on products for all
  using (auth.role() = 'authenticated');

-- 관리자: 도매처 전체 접근
create policy "admin_all_wholesalers"
  on wholesalers for all
  using (auth.role() = 'authenticated');

-- 관리자: 주문 읽기/수정
create policy "admin_read_orders"
  on orders for select
  using (auth.role() = 'authenticated');

create policy "admin_update_orders"
  on orders for update
  using (auth.role() = 'authenticated');

-- =============================================
-- Storage 버킷 (SQL 에디터에서 실행 후,
-- Supabase 대시보드 Storage에서 수동으로
-- product-images 버킷을 Public으로 생성하세요)
-- =============================================

-- 또는 아래 SQL로 버킷 생성 (supabase_admin 권한 필요)
-- insert into storage.buckets (id, name, public)
-- values ('product-images', 'product-images', true)
-- on conflict do nothing;

-- =============================================
-- 샘플 데이터 (선택사항)
-- =============================================

-- insert into wholesalers (name, contact, phone, email, notify_type) values
--   ('신선마트', '홍길동', '02-1234-5678', 'order@freshmart.kr', 'email'),
--   ('자연농원', '김철수', '031-9876-5432', 'farm@nature.kr', 'manual');

-- insert into products (name, description, price, wholesale_price, wholesaler_id, sort_order) values
--   ('제주 감귤 5kg', '달콤한 제주산 감귤', 25000, 18000, (select id from wholesalers where name='신선마트'), 1),
--   ('국내산 사과 3kg', '아삭한 국내산 사과', 18000, 12000, (select id from wholesalers where name='자연농원'), 2);
