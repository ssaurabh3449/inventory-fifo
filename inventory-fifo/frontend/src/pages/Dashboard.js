import React, { useEffect, useState } from 'react';
import { getProducts, getLedger, pushEvent } from '../api';
import ProductTable from '../components/ProductTable';
import Ledger from '../components/Ledger';
import Simulator from '../components/Simulator';
import '../styles.css';

export default function Dashboard({ authHeader, onLogout }) {
  const [products, setProducts] = useState([]);
  const [ledger, setLedger] = useState({ purchases: [], sales: [] });

  async function load() {
    try {
      const p = await getProducts(authHeader);
      setProducts(p);
      const l = await getLedger(authHeader);
      setLedger(l);
    } catch (err) {
      console.error(err);
      alert('Error loading data: ' + err.message);
    }
  }

  useEffect(() => { load(); }, []);

  const simulateEvents = async (events) => {
    for (const e of events) {
      await pushEvent(e, authHeader);
    }
    await load();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
        fontFamily: "'Inter', sans-serif",
        padding: '30px 60px',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px 30px',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <h1
          style={{
            fontSize: '26px',
            fontWeight: '700',
            color: '#1e3a8a',
            margin: 0,
          }}
        >
          Inventory FIFO Dashboard
        </h1>
        <button
          onClick={() => { onLogout(); window.location = '/login'; }}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Logout
        </button>
      </div>

      {/* PRODUCTS SECTION */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px 30px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
          marginBottom: '30px',
        }}
      >
        <h2 style={{ color: '#111827', marginBottom: '20px' }}>📦 Products</h2>
        <ProductTable products={products} />
      </div>

      {/* LEDGER SECTION */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px 30px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
          marginBottom: '30px',
        }}
      >
        <h2 style={{ color: '#111827', marginBottom: '20px' }}>🧾 Transaction Ledger</h2>
        <Ledger ledger={ledger} />
      </div>

      {/* SIMULATOR SECTION */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '25px 30px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h2 style={{ color: '#111827', marginBottom: '20px' }}>⚙️ Simulator</h2>
        <Simulator onSimulate={simulateEvents} products={projects}/>
      </div>
    </div>
  );
}
