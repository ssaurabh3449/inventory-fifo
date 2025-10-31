const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'inventory-app-producer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

const producer = kafka.producer();
const topic = process.env.KAFKA_TOPIC || 'inventory-events';

let isConnected = false;

async function produceEvent(event) {
  try {
    // Connect once and reuse the producer
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
    isConnected = false; // reset flag so next attempt reconnects
  }
}

// Graceful shutdown to avoid dangling connections
process.on('SIGINT', async () => {
  if (isConnected) {
    await producer.disconnect();
    console.log('🛑 Kafka producer disconnected');
  }
  process.exit(0);
});

module.exports = { produceEvent };
