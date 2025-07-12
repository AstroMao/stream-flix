import { scanAllMedia } from '../services/scanner.js';

/**
 * Registers all API routes for the application.
 * @param {import('fastify').FastifyInstance} fastify - The Fastify instance.
 * @param {object} options - Plugin options.
 * @param {function} done - Callback to signal completion.
 */
export default async function apiRoutes(fastify, options, done) {

  // Endpoint to trigger a full media scan
  fastify.post('/scan', async (request, reply) => {
    try {
      // Don't wait for the scan to finish to send a response.
      // This prevents the request from timing out on large libraries.
      scanAllMedia();
      
      reply.code(202).send({ 
        message: 'Media scan initiated successfully. This process will run in the background.' 
      });
    } catch (error) {
      fastify.log.error(error, 'Failed to start media scan');
      reply.code(500).send({ error: 'Failed to start media scan.' });
    }
  });

  done();
}