/**
 * Optional: run locally (outside docker) if you have node & kafkajs configured.
 * This script sends sample events directly to Kafka broker.
 */
const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'inventory-sim',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

const producer = kafka.producer();
const topic = process.env.KAFKA_TOPIC || 'inventory-events';

async function run() {
  await producer.connect();
  console.log('Producer connected');

  const events = [
    { product_id: 'PRD001', event_type: 'purchase', quantity: 100, unit_price: 50.00, timestamp: new Date().toISOString() },
    { product_id: 'PRD001', event_type: 'purchase', quantity: 50, unit_price: 60.00, timestamp: new Date().toISOString() },
    { product_id: 'PRD001', event_type: 'sale', quantity: 30, timestamp: new Date().toISOString() },
    { product_id: 'PRD001', event_type: 'sale', quantity: 80, timestamp: new Date().toISOString() }
  ];

  for (const e of events) {
    await producer.send({ topic, messages: [{ value: JSON.stringify(e) }] });
    console.log('Sent', e);
  }
  await producer.disconnect();
  console.log('Done');
}

run().catch(console.error);
