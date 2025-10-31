import React from 'react';
export default function Ledger({ ledger }) {
  return (
    <div>
      <h3>Purchases (recent)</h3>
      <table>
        <thead><tr><th>Batch ID</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Time</th></tr></thead>
        <tbody>
          {ledger.purchases && ledger.purchases.map(p=>(
            <tr key={p.ref_id}>
              <td>{p.ref_id}</td><td>{p.product_id}</td><td>{p.quantity}</td><td>{p.unit_price}</td><td>{p.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Sales (recent)</h3>
      <table>
        <thead><tr><th>Sale ID</th><th>Product</th><th>Qty</th><th>Total Cost</th><th>Time</th></tr></thead>
        <tbody>
          {ledger.sales && ledger.sales.map(s=>(
            <tr key={s.sale_id}>
              <td>{s.sale_id}</td><td>{s.product_id}</td><td>{s.quantity}</td><td>{s.total_cost}</td><td>{s.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
