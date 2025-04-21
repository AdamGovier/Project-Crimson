import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import Customer from "../../server/models/Customer";
import AppDataSource from "../crimson/AppDataSource";

export default async function customerRoutes(fastify: FastifyInstance) {
  fastify.post("/Create", {
    async handler(req: FastifyRequest<{ Body: Customer }>, res: FastifyReply) {
      {
        const ctx = { req, res };

        const data = AppDataSource.getRepository(Customer);

        const entityInstance = data.create(ctx.req?.body);

        const createdItem = await data.save(entityInstance);

        ctx.res.code(200);

        return createdItem;
      }
    },
  });

  fastify.get("/Items", {
    async handler(req: FastifyRequest<{ Body: Customer }>, res: FastifyReply) {
      {
        const ctx = { req, res };

        // Get repo of T
        const data = AppDataSource.getRepository(Customer);

        ctx.res.code(200);

        return data.find();
      }
    },
  });
}
