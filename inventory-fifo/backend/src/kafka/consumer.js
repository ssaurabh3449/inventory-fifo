require('dotenv').config();
const { Kafka } = require('kafkajs');
const db = require('../db');
const batchModel = require('../models/batchModel');
const fifoService = require('../services/fifoService');

const useCloud = !!process.env.REDPANDA_BROKER; // detect if running on Redpanda Cloud

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'inventory-app',
  brokers: useCloud
    ? [process.env.REDPANDA_BROKER]
    : (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  ssl: useCloud, // Redpanda requires SSL
  sasl: useCloud
    ? {
        mechanism: process.env.REDPANDA_SASL_MECHANISM || 'SCRAM-SHA-256',
        username: process.env.REDPANDA_USERNAME,
        password: process.env.REDPANDA_PASSWORD
      }
    : undefined
});

const topic = process.env.KAFKA_TOPIC || 'inventory-events';
const consumer = kafka.consumer({
  groupId: `${process.env.KAFKA_CLIENT_ID || 'inventory-app'}-group`
});

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  console.log(`✅ Kafka consumer subscribed to ${topic}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const value = message.value.toString();
        const event = JSON.parse(value);
        console.log('📦 Received event:', event);

        const { product_id, event_type, quantity, unit_price, timestamp } = event;

        if (event_type === 'purchase') {
          await db.query(
            `INSERT INTO products (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [product_id, product_id]
          );
          await batchModel.createBatch({
            product_id,
            quantity,
            unit_price,
            created_at: timestamp
          });
          console.log('🟢 Created batch for product', product_id);
        } else if (event_type === 'sale') {
          await fifoService.processSale({ product_id, quantity, timestamp });
          console.log('🟣 Processed sale for product', product_id);
        } else {
          console.warn('⚠️ Unknown event_type', event_type);
        }
      } catch (err) {
        console.error('❌ Error handling kafka message:', err);
      }
    }
  });
}

module.exports = { startConsumer };
