require('dotenv').config();
const { Kafka } = require('kafkajs');
const db = require('../db');
const batchModel = require('../models/batchModel');
const fifoService = require('../services/fifoService');

// ✅ Control Kafka usage via environment variable
const useKafka = process.env.USE_KAFKA === 'true';

// ✅ Detect whether to use Redpanda Cloud or Local Kafka
const useCloud = !!process.env.REDPANDA_BROKER && process.env.REDPANDA_BROKER.trim() !== '';

let kafka, consumer;

if (useKafka) {
  kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'inventory-app',
    brokers: useCloud
      ? [process.env.REDPANDA_BROKER]
      : (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    ssl: useCloud, // Required for Redpanda Cloud
    sasl: useCloud
      ? {
          mechanism: process.env.REDPANDA_SASL_MECHANISM || 'SCRAM-SHA-256',
          username: process.env.REDPANDA_USERNAME,
          password: process.env.REDPANDA_PASSWORD
        }
      : undefined,
  });

  consumer = kafka.consumer({
    groupId: `${process.env.KAFKA_CLIENT_ID || 'inventory-app'}-group`,
  });
}

const topic = process.env.KAFKA_TOPIC || 'inventory-events';

async function startConsumer() {
  if (!useKafka) {
    console.log('⚙️ Kafka consumer disabled (USE_KAFKA=false)');
    return;
  }

  try {
    console.log(`🚀 Starting Kafka consumer in ${useCloud ? 'Cloud' : 'Local'} mode...`);
    await consumer.connect();
    console.log(`✅ Connected to Kafka broker: ${useCloud ? process.env.REDPANDA_BROKER : process.env.KAFKA_BROKERS}`);

    await consumer.subscribe({ topic, fromBeginning: true });
    console.log(`📡 Subscribed to topic: ${topic}`);

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const value = message.value?.toString();
          if (!value) {
            console.warn('⚠️ Skipped empty message');
            return;
          }

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
              created_at: timestamp,
            });
            console.log(`🟢 Created batch for product ${product_id}`);
          } else if (event_type === 'sale') {
            await fifoService.processSale({ product_id, quantity, timestamp });
            console.log(`🟣 Processed sale for product ${product_id}`);
          } else {
            console.warn(`⚠️ Unknown event_type "${event_type}" for product ${product_id}`);
          }
        } catch (err) {
          console.error('❌ Error handling Kafka message:', err);
        }
      },
    });
  } catch (err) {
    console.error('🚨 Kafka consumer failed to start:', err);
  }
}

module.exports = { startConsumer };
