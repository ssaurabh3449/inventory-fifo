-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Inventory Batches table
CREATE TABLE IF NOT EXISTS inventory_batches (
    id SERIAL PRIMARY KEY,
    product_id TEXT REFERENCES products(id),
    quantity INTEGER NOT NULL,
    remaining_quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  quantity INT NOT NULL,
  total_cost NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sale Batches table (links each sale to inventory batches consumed)
CREATE TABLE IF NOT EXISTS sale_batches (
    id SERIAL PRIMARY KEY,
    sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
    batch_id INT REFERENCES inventory_batches(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL
);


-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Default admin user
INSERT INTO users (username, password)
VALUES ('admin', 'secret123')
ON CONFLICT (username) DO NOTHING;

-- Sample products
INSERT INTO products (id, name)
VALUES ('PRD001', 'Product A'),
       ('PRD002', 'Product B'),
       ('PRD003', 'Product C')
ON CONFLICT (id) DO NOTHING;
