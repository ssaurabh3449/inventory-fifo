const db = require('../db');

async function createSale({ product_id, quantity, total_cost, created_at }) {
  const res = await db.query(
    `INSERT INTO sales (product_id, quantity, total_cost, created_at) VALUES ($1, $2, $3, $4) RETURNING *`,
    [product_id, quantity, total_cost, created_at || new Date().toISOString()]
  );
  return res.rows[0];
}

async function createSaleBatch({ sale_id, batch_id, quantity, unit_cost }) {
  await db.query(
    `INSERT INTO sale_batches (sale_id, batch_id, quantity, unit_cost) VALUES ($1,$2,$3,$4)`,
    [sale_id, batch_id, quantity, unit_cost]
  );
}

async function getLedger(limit = 200) {
  const purchases = await db.query(
    `SELECT 'purchase' as type, b.id as ref_id, b.product_id, b.quantity, b.unit_price, b.created_at
     FROM inventory_batches b
     ORDER BY created_at DESC
     LIMIT $1`, [limit]
  );
  const sales = await db.query(
    `SELECT s.id as sale_id, s.product_id, s.quantity, s.total_cost, s.created_at
     FROM sales s
     ORDER BY created_at DESC
     LIMIT $1`, [limit]
  );
  return { purchases: purchases.rows, sales: sales.rows };
}

module.exports = { createSale, createSaleBatch, getLedger };
