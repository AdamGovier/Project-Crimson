import customerRoutes from "./routes/Customer.routes";
import invoiceRoutes from "./routes/Invoice.routes";
import inventoryRoutes from "./routes/Inventory.routes";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import AppDataSource from "./crimson/AppDataSource";
import cors from '@fastify/cors';

const fastify = Fastify({
    logger: true
});

fastify.register(customerRoutes, {
    prefix: "/Customer"
});

fastify.register(invoiceRoutes, {
    prefix: "/Invoice"
});

fastify.register(inventoryRoutes, {
    prefix: "/Inventory"
});

fastify.register(cors, {
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

fastify.get('/', async function handler(request, reply) {
    return { metadata: 'Crimson Enabled API' };
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    let payload: string = typeof body === 'string' ? body : body.toString('utf8');
    /*!--empty-line--!*/
    if (!payload || payload.trim() === '') {
        return done(null, {});
    }
    /*!--empty-line--!*/
    const json = JSON.parse(payload);
    done(null, json);
});

AppDataSource.initialize()
    .then(async () => {
    console.log("Database Connected");
    /*!--empty-line--!*/
    await fastify.listen({ port: 3000 });
})
    .catch(() => {
    console.log("Database Failed");
});
