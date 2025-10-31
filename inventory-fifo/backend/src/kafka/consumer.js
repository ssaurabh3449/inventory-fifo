require('dotenv').config();
const { Kafka } = require('kafkajs');
const db = require('../db');
const batchModel = require('../models/batchModel');
const fifoService = require('../services/fifoService');

const useKafka = process.env.USE_KAFKA === 'true';
if (!useKafka) {
  console.log('⚠️ USE_KAFKA is false — Kafka consumer disabled');
  return;
}

const useCloud = !!process.env.REDPANDA_BROKER;

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'inventory-app',
  brokers: useCloud
    ? [process.env.REDPANDA_BROKER]
    : (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  ssl: useCloud,
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
  await consumer.subscribe({ topic, fromBeginning: false });
  console.log(`✅ Kafka consumer subscribed to topic: ${topic}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const value = message.value.toString();
        const event = JSON.parse(value);
        console.log('📥 Received Kafka event:', event);

        const { product_id, event_type, quantity, unit_price, timestamp } = event;

        if (!product_id || !event_type || !quantity) {
          console.warn('⚠️ Skipping incomplete event:', event);
          return;
        }

        // Ensure product exists
        await db.query(
          `INSERT INTO products (id, name)
           VALUES ($1, $2)
           ON CONFLICT (id) DO NOTHING`,
          [product_id, product_id]
        );

        if (event_type.toLowerCase() === 'purchase') {
          await batchModel.createBatch({
            product_id,
            quantity,
            unit_price,
            created_at: timestamp
          });
          console.log(`🟢 Purchase recorded for ${product_id}`);
        } 
        else if (event_type.toLowerCase() === 'sale') {
          await fifoService.processSale({ product_id, quantity, timestamp });
          console.log(`🟣 Sale processed for ${product_id}`);
        } 
        else {
          console.warn('⚠️ Unknown event type:', event_type);
        }

      } catch (err) {
        console.error('❌ Error handling Kafka message:', err);
      }
    }
  });
}

startConsumer().catch(err => {
  console.error('❌ Kafka consumer startup error:', err);
});

process.on('SIGINT', async () => {
  await consumer.disconnect();
  console.log('🛑 Kafka consumer disconnected');
  process.exit(0);
});
