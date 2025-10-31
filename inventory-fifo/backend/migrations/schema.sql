-- products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT
);

-- inventory_batches (purchases)
CREATE TABLE IF NOT EXISTS inventory_batches (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  quantity BIGINT NOT NULL,
  remaining_quantity BIGINT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sales
CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  quantity BIGINT NOT NULL,
  total_cost NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sale_batches (records how a sale consumed batches)
CREATE TABLE IF NOT EXISTS sale_batches (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT REFERENCES sales(id),
  batch_id BIGINT REFERENCES inventory_batches(id),
  quantity BIGINT NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL
);

INSERT INTO products (id, name) VALUES ('PRD001', 'Sample Product') ON CONFLICT DO NOTHING;
