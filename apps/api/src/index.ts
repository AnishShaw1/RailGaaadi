import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { healthRoutes } from './routes/health.js';
import { trainRoutes } from './routes/trains.js';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Security headers
await server.register(helmet, {
  contentSecurityPolicy: false, // Disabled for dev flexibility
});

// CORS support
await server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
});

// Rate limiting (120 requests per minute per IP)
await server.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
});

// Register routes
await server.register(healthRoutes, { prefix: '/health' });
await server.register(trainRoutes, { prefix: '/api/v1/trains' });

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

try {
  await server.listen({ port: PORT, host: HOST });
  console.log(`🚆 RailGaadi BFF API server running at http://${HOST}:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
