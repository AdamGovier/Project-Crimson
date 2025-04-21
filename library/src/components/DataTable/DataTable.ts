import CrimsonComponent from "../../base/CrimsonComponent";
import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpPayload } from "../../interfaces/CrimsonHttp";
import { FindOptionsWhere } from "typeorm";

export interface DataTableResponse<T> {
  totalItemCount: number,
  itemsForPage: T[]
}

export default class DataTable<T> extends CrimsonComponent {
  async getTableItems(req: HttpPayload | undefined = undefined): Promise<DataTableResponse<T>> {
    function decodeWhereClause(where: string) {
      //@ts-ignore
      return where
        .split(',')
        .reduce((acc, kv) => {
          const [key, value] = kv.split(':');
          //@ts-ignore
          acc[key] = value;
          return acc;
        });
    }

    const ctx = this.getContext();

    const data = this.getFocusedRepository();
  
    ctx.res.code(200);

    const query = ctx.req!.query as any;

    const [items, totalItems] = await data.findAndCount({
      skip: (parseInt(query!["page"]) - 1) * parseInt(query!["itemsPerPage"]),
      take: parseInt(query!["itemsPerPage"]),
      order: query["sortBy"] ?
        {
          [query["sortBy"]]: query["sortOrder"].toUpperCase()
        }
      : {},
      // @ts-ignore
      where: query["where"] ? decodeWhereClause(query["where"]) : {}
    });

    return {
      itemsForPage: items,
      totalItemCount: totalItems
    }
  }

  async postSeed(req: HttpPayload<T[]> | undefined = undefined): Promise<T[]> {
    const ctx = this.getContext();

    const data = this.getFocusedRepository();

    //@ts-ignore
    const createdInstances = req?.body?.map(item => 
      data.create(item)
    );

    const items = await data.save(createdInstances);

    ctx.res.code(200);

    return items;
  }

  async deleteItem(req: HttpPayload<T> | undefined = undefined) {
    const ctx = this.getContext();

    const data = this.getFocusedRepository();

    const query = ctx.req!.query as any;
    await data.delete(query._id!)

    ctx.res.code(200);
  }
}