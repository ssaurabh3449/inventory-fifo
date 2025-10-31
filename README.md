# Inventory Management System (FIFO) — Local Docker Setup
## Overview
This project implements an Inventory Management System using FIFO costing with:
- Backend: Node.js (Express), kafkajs (Kafka client), PostgreSQL
- Frontend: React
- Kafka: Redpanda (lightweight Kafka alternative) in Docker Compose
- DB: PostgreSQL in Docker Compose

## Quick start (single command)
1. Make sure Docker and Docker Compose are installed.
2. From the project root directory run:
   ```bash
   docker-compose up --build
   ```
3. Backend API will be available at: http://localhost:4000
4. Frontend will be available at: http://localhost:3000
5. Default login (Basic Auth for API):
   - username: `admin`
   - password: `secret123`

## Project layout
- backend/    -> Node.js backend with Kafka consumer and REST API
- frontend/   -> React app
- docker-compose.yml -> Brings up redpanda (Kafka), postgres, backend, frontend

## Notes
- The Kafka topic `inventory-events` will be used for purchases/sales.
- Use the Simulator in the frontend to push sample events (purchases & sales).
- Backend consumer starts automatically when the backend container starts.


## Commands to run it
- docker-compose up --build
## next time to do
- docker-compose down -v
- docker builder prune -a
- docker-compose build --no-cache
- docker-compose up
