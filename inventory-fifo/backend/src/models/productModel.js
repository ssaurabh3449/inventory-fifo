const db = require('../db');

async function getAllProducts() {
  const res = await db.query('SELECT p.id, p.name, COALESCE(SUM(b.remaining_quantity),0) AS current_quantity, COALESCE(SUM(b.remaining_quantity*b.unit_price),0) AS total_inventory_cost FROM products p LEFT JOIN inventory_batches b ON p.id=b.product_id GROUP BY p.id');
  return res.rows;
}

module.exports = { getAllProducts };
