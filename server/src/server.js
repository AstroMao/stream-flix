import Fastify from 'fastify';
import config from './config/index.js';
import apiRoutes from './api/routes.js';

// Initialize Fastify
const fastify = Fastify({
  logger: true // Enables logging for development
});

// Register our API routes
fastify.register(apiRoutes, { prefix: '/api' });

// Health check route
fastify.get('/', async (request, reply) => {
  return { status: 'ok', message: 'Stream-Flex server is running' };
});

/**
 * Starts the server on the configured host and port.
 */
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on http://localhost:${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
