import ts, { Type } from "typescript";
import TypescriptSourceFile from "./TypescriptSourceFile";
import { writeToDist } from "./toolkit";
import { format } from "prettier";
import { createFastifyRoute, createFastifyRoutePlugin } from "./templating";
import Platform from "./enums/Platform";
import { HTTPMethod, httpMethods } from "./constants/methods";

export class RouteParser {
  public static createRoutesForController(controllerSourceFile: TypescriptSourceFile, entityModel: TypescriptSourceFile) : RouteCollection {
    const controllerIR = controllerSourceFile.getTsIntermediateRepresentation();

    let defaultExportedClass : ts.ClassDeclaration | null = null;

    ts.forEachChild(controllerIR, node => {
      if(ts.isClassDeclaration(node)) {
        const hasExportKeyword = node.modifiers?.some(mod => mod.kind == ts.SyntaxKind.ExportKeyword);
        const hasDefaultKeyword = node.modifiers?.some(mod => mod.kind == ts.SyntaxKind.DefaultKeyword);

        if(hasExportKeyword && hasDefaultKeyword) {
          defaultExportedClass = node;
        }
      }
    });

    if(defaultExportedClass == null) throw new Error("Crimson controller files must include a default export.");
    
    // https://stackoverflow.com/questions/63188436/typescript-compiler-api-to-access-base-interfaces-or-classes

    const controller = (defaultExportedClass as ts.ClassDeclaration);

    let isExentionOfCrimsonComponent = false;

    if (controller.heritageClauses) {
      for(const hc of controller.heritageClauses) {
        // If the class extends another class
        if (hc.token === ts.SyntaxKind.ExtendsKeyword) {
          const baseType = hc.types[0]; // Get the base class - assumed to be the first type after extend as per common standard.

          // If the base class is CrimsonComponent.
          if(baseType.getText() === "CrimsonComponent") {
            isExentionOfCrimsonComponent = true;
            break;
          }
        }
      }
    }

    if(!isExentionOfCrimsonComponent)
      throw new Error("Controller does not extend CrimsonComponent");

    const routeCollection = new RouteCollection(entityModel);

    ts.forEachChild(controller, node => {
      if(ts.isMethodDeclaration(node)) {
        const route = RouteBlueprint.create(node, entityModel); 
        
        routeCollection.addRoute(route);
      }
    });

    return routeCollection;
  }
}

export class RouteCollection {
  private routes: RouteBlueprint[] = [];
  private entityModel: TypescriptSourceFile;

  constructor(entityModel: TypescriptSourceFile) {
    this.entityModel = entityModel;
  }

  public addRoute(route: RouteBlueprint) {
    this.routes.push(route);
  }

  public getRoutes() : RouteBlueprint[] {
    return this.routes;
  }

  public getEntityModel() : TypescriptSourceFile {
    return this.entityModel;
  }

  public mergeCollection(otherCollection: RouteCollection) {
    if(this.entityModel.getIdentifier() != otherCollection.entityModel.getIdentifier())
      throw Error("Non-compatible route collections.");

    for(const route of otherCollection.getRoutes()) {
      this.routes.push(route);
    }
  }
}

export class RouteGenerator {
  public static async createAndWriteRouteFile(routeCollection: RouteCollection) {
    const routeCodeblocks = routeCollection.getRoutes().map(route => createFastifyRoute(route));

    const routePlugin = createFastifyRoutePlugin(
      routeCollection.getEntityModel().getIdentifier()!.toLowerCase(),
      routeCodeblocks,
      routeCollection.getEntityModel()
    );

    await this.writeFile(routePlugin, routeCollection.getEntityModel())
  }

  private static async writeFile(content: string, entityModel: TypescriptSourceFile) {
    await writeToDist(content, `routes/${entityModel.getIdentifier()}.routes.ts`, Platform.SERVER, {parser: "typescript"});
  }
}

export class RouteBlueprint {
  private method: HTTPMethod;
  private routeName: string;
  private codeblock: string;
  private entityModel: TypescriptSourceFile;

  constructor(method: HTTPMethod, routeName: string, codeblock: string, entityModel: TypescriptSourceFile) {
    this.method = method;
    this.routeName = routeName;
    this.codeblock = codeblock;
    this.entityModel = entityModel;
  }

  getCodeBlock() {
    return this.codeblock;
  }

  getHttpMethod() {
    return this.method;
  }

  getRouteName() {
    return this.routeName;
  }

  getEntityModel() {
    return this.entityModel;
  }

  static create(method: ts.MethodDeclaration, entityModel: TypescriptSourceFile) : RouteBlueprint {
    const methodName = method.name.getText();

    // Ensure function identifier starts with a HTTP method.
    const httpMethod = httpMethods.find(method => methodName?.startsWith(method));
    
    if(!httpMethod) throw new Error("Function identifier must start with a HTTP Method.")

    // Split on the http method and then take the latter half to get route name.
    let routeName = methodName?.split(httpMethod)[1];

    // If no route name is provided, the route name just becomes the HTTP method.
    if(!routeName) routeName = httpMethod;

    const codeblock = method.body?.getText();

    if(!codeblock) throw new Error("Route must include a body.");

    return new RouteBlueprint(httpMethod, routeName, codeblock, entityModel);
  }
}