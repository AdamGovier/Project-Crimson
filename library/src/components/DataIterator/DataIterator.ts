import CrimsonComponent from "../../base/CrimsonComponent";
import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpPayload } from "../../interfaces/CrimsonHttp";

export default class DataIterator<T> extends CrimsonComponent {
    async getItems(req: HttpPayload | undefined = undefined): Promise<T[]> {
      const ctx = this.getContext();

      // Get repo of T
      const data = this.getFocusedRepository();
    
      ctx.res.code(200);
  
      return data.find();
    }
}