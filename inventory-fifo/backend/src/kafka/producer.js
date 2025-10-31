require('dotenv').config();
const { Kafka } = require('kafkajs');

const useKafka = process.env.USE_KAFKA === 'true';
if (!useKafka) {
  console.log('⚠️ USE_KAFKA is false — Kafka producer disabled');
}

const useCloud = !!process.env.REDPANDA_BROKER;

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'inventory-app-producer',
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

const producer = kafka.producer();
const topic = process.env.KAFKA_TOPIC || 'inventory-events';
let isConnected = false;

/**
 * Produce a Kafka event (purchase/sale)
 */
async function produceEvent(event) {
  if (!useKafka) {
    console.log('🚫 Kafka disabled — skipping event:', event);
    return;
  }

  try {
    if (!isConnected) {
      await producer.connect();
      isConnected = true;
      console.log('✅ Kafka producer connected');
    }

    await producer.send({
      topic,
      messages: [
        {
          key: event.product_id ? event.product_id.toString() : null,
          value: JSON.stringify(event),
          headers: { eventType: event.event_type || 'unknown' }
        }
      ]
    });

    console.log('📦 Produced event:', event);
  } catch (err) {
    console.error('❌ Error producing Kafka event:', err);
    isConnected = false; // reconnect on next send
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  if (isConnected) {
    await producer.disconnect();
    console.log('🛑 Kafka producer disconnected');
  }
  process.exit(0);
});

module.exports = { produceEvent };
