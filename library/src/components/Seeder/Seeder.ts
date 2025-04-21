import CrimsonComponent from "../../base/CrimsonComponent";
import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpPayload } from "../../interfaces/CrimsonHttp";

export default class Seeder<T> extends CrimsonComponent {
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
}