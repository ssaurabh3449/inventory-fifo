import React from 'react';

export default function Simulator({ onSimulate }) {
  const example = [
    { product_id: 'PRD001', event_type: 'purchase', quantity: 100, unit_price: 50.00 },
    { product_id: 'PRD001', event_type: 'purchase', quantity: 50, unit_price: 60.00 },
    { product_id: 'PRD001', event_type: 'sale', quantity: 30 },
    { product_id: 'PRD001', event_type: 'sale', quantity: 80 }
  ];

  const run = async () => {
    const withTimestamps = example.map(e => ({ ...e, timestamp: new Date().toISOString() }));
    await onSimulate(withTimestamps);
    alert('Simulation events sent');
  };

  return (
    <div>
      <p>Click to send 4 demo events (2 purchases, 2 sales).</p>
      <button onClick={run}>Run Demo Simulation</button>
    </div>
  );
}
