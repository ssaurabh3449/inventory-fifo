import React from 'react';
export default function ProductTable({ products }) {
  return (
    <table>
      <thead>
        <tr><th>Product ID</th><th>Name</th><th>Current Qty</th><th>Total Inventory Cost</th><th>Avg Cost/Unit</th></tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p.product_id}>
            <td>{p.product_id}</td>
            <td>{p.name}</td>
            <td>{p.current_quantity}</td>
            <td>{p.total_inventory_cost}</td>
            <td>{p.average_cost_per_unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
