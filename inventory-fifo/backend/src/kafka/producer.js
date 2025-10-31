const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'inventory-app-producer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

const producer = kafka.producer();
const topic = process.env.KAFKA_TOPIC || 'inventory-events';

async function produceEvent(event) {
  if (!producer.isConnected) {
    await producer.connect();
    producer.isConnected = true;
  }
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(event) }]
  });
}

module.exports = { produceEvent };
