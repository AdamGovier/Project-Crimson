import { RouteBlueprint } from "./routeGen";
import TypescriptSourceFile from "./TypescriptSourceFile";

export function createFastifyRoutePlugin(name: string, routes: string[], entityModel: TypescriptSourceFile) {
  const routePlugin = `
    import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
    import ${entityModel.getIdentifier()} from '../../server/models/${entityModel.getIdentifier()}';
    import AppDataSource from '../crimson/AppDataSource';

    export default async function ${name}Routes(fastify: FastifyInstance) {
      ${routes.join("\r\n")}
    }
  `;

  return replaceCrimsonKeywordsInRoutes(routePlugin, entityModel);
}

function replaceCrimsonKeywordsInRoutes(content: string, entityModel: TypescriptSourceFile) {
  content = content.replace(/this\.getFocusedRepository\(\);?/g, `AppDataSource.getRepository(${entityModel.getIdentifier()})`);
  content = content.replace(/this\.getContext\(\);?/g, `{req,res}`);

  return content;
}

export function createFastifyRoute(blueprint: RouteBlueprint) {
  const route = `
    fastify.${blueprint.getHttpMethod()}("/${blueprint.getRouteName()}", {
      async handler (req: FastifyRequest<{Body: ${blueprint.getEntityModel().getIdentifier()}}>, res: FastifyReply) {
      ${blueprint.getCodeBlock()}
      }
    });
  `;

  return route;
}

export function removeDecorators(codeblock: string) : string {
  return codeblock.replace(/@\w+\([\s\S]*?\)/g, '');
}