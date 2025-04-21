import Fastify, { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import AppDataSource from "./AppDataSource";
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
});

fastify.get('/', async function handler (request, reply) {
  return { metadata: 'Crimson Enabled API' }
})

fastify.addContentTypeParser(
  'application/json',
  { parseAs: 'string' },
  (req, body, done) => {
    let payload: string =
      typeof body === 'string' ? body : body.toString('utf8');

    if (!payload || payload.trim() === '') {
      return done(null, {});
    }

    const json = JSON.parse(payload);
    done(null, json);
  }
);

AppDataSource.initialize()
  .then(async () => {
    console.log("Database Connected");

    await fastify.listen({ port: 3000 });
  })
  .catch(() => {
    console.log("Database Failed")
  })