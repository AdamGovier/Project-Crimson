import { RouteBlueprint } from "./routeGen";
import TypescriptSourceFile from "./TypescriptSourceFile";
import VueComponent from "./VueComponent";

export default class CrimsonComponentReference {
  private entityModelIdentifier: string;
  private crimsonComponentIdentifier: string;

  private entityModelPath: string  | undefined;
  private crimsonComponentPath: string  | undefined;
  private crimsonControllerPath: string | undefined;

  private routeBlueprint: RouteBlueprint | undefined;

  constructor(entityModelIdentifier: string, crimsonComponentIdentifier: string) {
    this.entityModelIdentifier = entityModelIdentifier;
    this.crimsonComponentIdentifier = crimsonComponentIdentifier;
  }

  // Used for matching imports to template identifiers.
  doesKeyMatchEntityModelIdentifier(key: string) {
    return this.entityModelIdentifier == key;
  }

  // Used for matching imports to template identifiers.
  doesKeyMatchCrimsonComponentIdentifier(key: string) {
    return this.crimsonComponentIdentifier == key;
  }

  getModel() : TypescriptSourceFile {
    if(!this.entityModelPath) throw new Error("Component does not contain a entity reference.");

    const model = new TypescriptSourceFile(this.entityModelPath);

    model.setIdentifier(this.entityModelIdentifier);

    return model;
  }

  getModelPath() {
    if(!this.entityModelPath) throw new Error("Component does not contain a entity reference.");

    return this.entityModelPath;
  }

  getCrimsonComponent() : VueComponent {
    if(!this.crimsonComponentPath) throw new Error("Component does not contain a Crimson component.");

    return new VueComponent(this.crimsonComponentPath);
  }

  getController() : TypescriptSourceFile {
    if(!this.crimsonControllerPath) throw new Error("Component does not have a controller.");

    return new TypescriptSourceFile(this.crimsonControllerPath);
  }

  bindController(path: string) {
    this.crimsonControllerPath = path;
  }

  bindModel(path: string) {
    this.entityModelPath = path;
  }

  bindCrimsonComponent(path: string) {
    this.crimsonComponentPath = path;
  }

  equals(reference: CrimsonComponentReference) {
    return (this.entityModelIdentifier == reference.entityModelIdentifier && this.crimsonComponentIdentifier == reference.crimsonComponentIdentifier);
  }
}