import React, { useState } from 'react';
import './Simulator.css'; // 👈 we'll add a tiny CSS loader here

export default function Simulator({ onSimulate }) {
  const [loading, setLoading] = useState(false);

  const example = [
    { product_id: 'PRD001', event_type: 'purchase', quantity: 100, unit_price: 50.00 },
    { product_id: 'PRD001', event_type: 'purchase', quantity: 50, unit_price: 60.00 },
    { product_id: 'PRD001', event_type: 'sale', quantity: 30 },
    { product_id: 'PRD001', event_type: 'sale', quantity: 80 }
  ];

  const run = async () => {
    try {
      setLoading(true);
      const withTimestamps = example.map(e => ({ ...e, timestamp: new Date().toISOString() }));
      await onSimulate(withTimestamps);
      alert('Simulation events sent');
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Failed to send simulation events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <p>Click to send 4 demo events (2 purchases, 2 sales).</p>

      <button onClick={run} disabled={loading}>
        {loading ? 'Running...' : 'Run Demo Simulation'}
      </button>

      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
          <p>Sending demo events...</p>
        </div>
      )}
    </div>
  );
}
