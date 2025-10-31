const db = require('../db');

async function createBatch({ product_id, quantity, unit_price, created_at }) {
  const res = await db.query(
    `INSERT INTO inventory_batches (product_id, quantity, remaining_quantity, unit_price, created_at)
     VALUES ($1, $2, $2, $3, $4)
     RETURNING *`,
     [product_id, quantity, unit_price, created_at || new Date().toISOString()]
  );
  return res.rows[0];
}

module.exports = { createBatch };
