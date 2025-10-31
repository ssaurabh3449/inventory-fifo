require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const requireAuth = require('./auth');
const consumer = require('./kafka/consumer');
const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({
  origin: [
    'https://inventory-fifo-pvbjl24ne-ssaurabh3449s-projects.vercel.app', // your frontend domain
    'http://localhost:3000' // optional, for local dev
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

app.use('/api', requireAuth, apiRoutes);
app.get('/', (req,res)=>res.send('Inventory FIFO backend up'));

const port = process.env.PORT || 4000;

// run migrations on startup (best-effort)
async function runMigrations() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migrations applied');
  } catch (err) {
    console.error('Migration error (might be fine on first run):', err.message);
  }
}

app.listen(port, async () => {
  console.log(`Backend listening on ${port}`);
  await runMigrations();
  try {
    await consumer.startConsumer();
    console.log('Kafka consumer started');
  } catch (err) {
    console.error('Failed to start Kafka consumer', err);
  }
});
