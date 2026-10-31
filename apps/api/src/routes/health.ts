import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/live', async () => {
    return { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() };
  });

  fastify.get('/ready', async () => {
    return { status: 'ready', timestamp: new Date().toISOString() };
  });
};
