import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [auth, setAuth] = useState(localStorage.getItem('auth') || null);

  const onLogin = (header) => {
    localStorage.setItem('auth', header);
    setAuth(header);
  };

  const onLogout = () => {
    localStorage.removeItem('auth');
    setAuth(null);
  };

  // 👇 Add backend health check on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:4000/health');
        if (!res.ok) throw new Error('Backend unreachable');
      } catch (err) {
        // Backend down or database reset → clear auth
        localStorage.removeItem('auth');
        setAuth(null);
      }
    };

    checkBackend();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route
          path="/dashboard"
          element={
            auth ? (
              <Dashboard authHeader={auth} onLogout={onLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={auth ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
