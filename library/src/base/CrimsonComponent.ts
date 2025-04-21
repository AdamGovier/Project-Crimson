import { FastifyReply, FastifyRequest } from "fastify";
import { ObjectLiteral, Repository } from "typeorm";
import { HttpContext } from "../interfaces/CrimsonHttp";

/**
 * This is filled in by the compiler, but the empty class alows for your IDE to pickup available methods.
 */
export default abstract class CrimsonComponent {
  /**
   * Get access to the repository of entity model provided by the user. 
   */
  protected getFocusedRepository() : Repository<any> {
    //@ts-ignore
    return null;
  }

  /**
   * In the future when controller overriding is allowed this will allow to get other repositories other than the provided entity model. 
   * Not very useful for general controllers but bespoke controllers it might be, you could have classes inherit an interface to make it more reusable.
    */
  protected getRepository<T extends ObjectLiteral>() : Repository<T> {
    //@ts-ignore
    return null;
  }

  /**
   * Access request and response methods. 
   */
  protected getContext() : HttpContext {
    //@ts-ignore
    return null;
  }
}