import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import Inventory from "../../server/models/Inventory";
import AppDataSource from "../crimson/AppDataSource";

export default async function inventoryRoutes(fastify: FastifyInstance) {
  fastify.post("/Create", {
    async handler(req: FastifyRequest<{ Body: Inventory }>, res: FastifyReply) {
      {
        const ctx = { req, res };

        const data = AppDataSource.getRepository(Inventory);

        const entityInstance = data.create(ctx.req?.body);

        const createdItem = await data.save(entityInstance);

        ctx.res.code(200);

        return createdItem;
      }
    },
  });

  fastify.get("/TableItems", {
    async handler(req: FastifyRequest<{ Body: Inventory }>, res: FastifyReply) {
      {
        function decodeWhereClause(where: string) {
          //@ts-ignore
          return where.split(",").reduce((acc, kv) => {
            const [key, value] = kv.split(":");
            //@ts-ignore
            acc[key] = value;
            return acc;
          });
        }

        const ctx = { req, res };

        const data = AppDataSource.getRepository(Inventory);

        ctx.res.code(200);

        const query = ctx.req!.query as any;

        const [items, totalItems] = await data.findAndCount({
          skip:
            (parseInt(query!["page"]) - 1) * parseInt(query!["itemsPerPage"]),
          take: parseInt(query!["itemsPerPage"]),
          order: query["sortBy"]
            ? {
                [query["sortBy"]]: query["sortOrder"].toUpperCase(),
              }
            : {},
          // @ts-ignore
          where: query["where"] ? decodeWhereClause(query["where"]) : {},
        });

        return {
          itemsForPage: items,
          totalItemCount: totalItems,
        };
      }
    },
  });

  fastify.post("/Seed", {
    async handler(req: FastifyRequest<{ Body: Inventory }>, res: FastifyReply) {
      {
        const ctx = { req, res };

        const data = AppDataSource.getRepository(Inventory);

        //@ts-ignore
        const createdInstances = req?.body?.map((item) => data.create(item));

        const items = await data.save(createdInstances);

        ctx.res.code(200);

        return items;
      }
    },
  });

  fastify.delete("/Item", {
    async handler(req: FastifyRequest<{ Body: Inventory }>, res: FastifyReply) {
      {
        const ctx = { req, res };

        const data = AppDataSource.getRepository(Inventory);

        const query = ctx.req!.query as any;
        await data.delete(query._id!);

        ctx.res.code(200);
      }
    },
  });
}
