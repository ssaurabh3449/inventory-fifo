const db = require('../db');

async function processSale({ product_id, quantity, timestamp }) {
  if (quantity <= 0) throw new Error('Quantity must be > 0');
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const batchesRes = await client.query(
      `SELECT * FROM inventory_batches WHERE product_id=$1 AND remaining_quantity>0 ORDER BY created_at ASC, id ASC`,
      [product_id]
    );
    let remainingToConsume = quantity;
    let totalCost = 0;
    const consumption = [];

    for (const b of batchesRes.rows) {
      if (remainingToConsume <= 0) break;
      const take = Math.min(remainingToConsume, Number(b.remaining_quantity));
      consumption.push({ batch_id: b.id, qty: take, unit_cost: b.unit_price });
      totalCost += take * parseFloat(b.unit_price);
      remainingToConsume -= take;
    }

    if (remainingToConsume > 0) {
      throw new Error('Insufficient stock to fulfill sale');
    }

    const saleRes = await client.query(
      `INSERT INTO sales (product_id, quantity, total_cost, created_at) VALUES ($1,$2,$3,$4) RETURNING *`,
      [product_id, quantity, totalCost, timestamp || new Date().toISOString()]
    );
    const sale = saleRes.rows[0];

    for (const c of consumption) {
      await client.query(
        `INSERT INTO sale_batches (sale_id, batch_id, quantity, unit_cost) VALUES ($1,$2,$3,$4)`,
        [sale.id, c.batch_id, c.qty, c.unit_cost]
      );
      await client.query(
        `UPDATE inventory_batches SET remaining_quantity = remaining_quantity - $1 WHERE id = $2`,
        [c.qty, c.batch_id]
      );
    }

    await client.query('COMMIT');
    return { sale, consumption };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { processSale };
