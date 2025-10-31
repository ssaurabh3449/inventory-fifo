require('dotenv').config();
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'inventory-fifo',
  brokers: [process.env.REDPANDA_BROKER],
  ssl: true,
  sasl: {
    mechanism: process.env.REDPANDA_SASL_MECHANISM,
    username: process.env.REDPANDA_USERNAME,
    password: process.env.REDPANDA_PASSWORD
  },
    logLevel: logLevel.DEBUG
});

module.exports = kafka;
