import CrimsonComponent from "../../base/CrimsonComponent";
import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpPayload } from "../../interfaces/CrimsonHttp";

export default class Form<T> extends CrimsonComponent {
  async postCreate(payload: HttpPayload<T> | undefined = undefined): Promise<T> {
    const ctx = this.getContext();

    const data = this.getFocusedRepository();

    const entityInstance  = data.create(ctx.req?.body);

    const createdItem = await data.save(entityInstance);

    ctx.res.code(200);

    return createdItem;
  }
}