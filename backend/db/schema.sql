-- Pepenaldo E-Commerce — PostgreSQL schema
-- Run this against your Supabase / Postgres database before starting the backend.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
  phone         VARCHAR(30),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CATEGORIES ----------
CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(80) UNIQUE NOT NULL,
  slug  VARCHAR(80) UNIQUE NOT NULL
);

-- ---------- PRODUCTS ----------
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(160) NOT NULL,
  description  TEXT,
  price        NUMERIC(12,2) NOT NULL,       -- in Naira
  stock        INTEGER NOT NULL DEFAULT 0,
  image_url    TEXT,
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CART (persisted per user; guest carts live in frontend state) ----------
CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ---------- ORDERS ----------
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_amount      NUMERIC(12,2) NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending|paid|shipped|delivered|cancelled
  payment_reference VARCHAR(100) UNIQUE,
  payment_status    VARCHAR(20) NOT NULL DEFAULT 'unpaid',  -- unpaid|paid|failed
  shipping_address  TEXT NOT NULL,
  shipping_phone    VARCHAR(30) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- ORDER ITEMS (snapshot of product at purchase time) ----------
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(160) NOT NULL,
  unit_price  NUMERIC(12,2) NOT NULL,
  quantity    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Seed one admin account (change password after first login!)
-- Password below is a bcrypt hash for "ChangeMe123!" — see README for how to regenerate.
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@pepenaldo.com', '$2b$10$8KzQZ2mF7yqjX0jJXqzq3.7z1WmXe4Y6nq0m1zj6vZ1jz8x0uS0Zi', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (name, slug) VALUES
  ('Tech', 'tech'),
  ('Food', 'food'),
  ('Fashion', 'fashion')
ON CONFLICT (name) DO NOTHING;
