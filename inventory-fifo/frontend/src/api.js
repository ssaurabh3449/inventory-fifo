import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

const instance = axios.create({ baseURL: API_BASE });

export function makeAuthHeader(authHeader) {
  return { headers: { Authorization: authHeader } };
}

export async function login(username, password) {
  const credentials = btoa(`${username}:${password}`);
  const credHeader = `Basic ${credentials}`;
  return { credHeader };
}

export async function getProducts(authHeader) {
  const res = await instance.get('/api/products', { headers: { Authorization: authHeader } });
  return res.data;
}

export async function getLedger(authHeader) {
  const res = await instance.get('/api/ledger', { headers: { Authorization: authHeader } });
  return res.data;
}

export async function pushEvent(event, authHeader) {
  const res = await instance.post('/api/event', event, { headers: { Authorization: authHeader } });
  return res.data;
}
