-- db/migrations/001_init.sql
-- Applied automatically by the postgres container via /docker-entrypoint-initdb.d
-- on first boot of a fresh volume.

CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  balance_cents BIGINT NOT NULL DEFAULT 1000000,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id        BIGSERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  price     BIGINT NOT NULL,                -- cents, never floats
  available INT NOT NULL CHECK (available >= 0)
);

CREATE TABLE cart_items (
  user_id     BIGINT NOT NULL REFERENCES users(id),
  product_id  BIGINT NOT NULL REFERENCES products(id),
  qty         INT NOT NULL CHECK (qty >= 1),
  unit_price  BIGINT NOT NULL,              -- price snapshot (lesson 10)
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE orders (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL,
  total_cents     BIGINT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,     -- lesson 11
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed catalog (the blueprint ships none; the walkthrough needs product id 1)
INSERT INTO products (name, price, available) VALUES
  ('Wireless Mouse', 2500, 100),
  ('Mechanical Keyboard', 8900, 50);
