import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import '../styles.css';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('secret123');
  const nav = useNavigate();

  const doLogin = async (e) => {
    e.preventDefault();
    const { credHeader } = await login(user, pass);
    try {
      const res = await fetch((process.env.REACT_APP_API_BASE || 'http://localhost:4000') + '/api/products', {
        headers: { Authorization: credHeader }
      });
      if (!res.ok) throw new Error('Auth failed');
      onLogin(credHeader);
      nav('/dashboard');
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          padding: '40px 50px',
          width: '380px',
          textAlign: 'center',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <h2 style={{ marginBottom: '25px', color: '#1e3a8a', fontWeight: '700' }}>
          Inventory FIFO — Login
        </h2>

        <form onSubmit={doLogin}>
          <input
            style={{
              width: '100%',
              padding: '12px 14px',
              marginBottom: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none',
              transition: 'border 0.2s ease, box-shadow 0.2s ease',
            }}
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onFocus={(e) => {
              e.target.style.border = '1px solid #3b82f6';
              e.target.style.boxShadow = '0 0 6px rgba(59,130,246,0.3)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />

          <input
            type="password"
            style={{
              width: '100%',
              padding: '12px 14px',
              marginBottom: '20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none',
              transition: 'border 0.2s ease, box-shadow 0.2s ease',
            }}
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onFocus={(e) => {
              e.target.style.border = '1px solid #3b82f6';
              e.target.style.boxShadow = '0 0 6px rgba(59,130,246,0.3)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, transform 0.1s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
