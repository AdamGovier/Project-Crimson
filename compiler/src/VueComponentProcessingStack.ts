import { globSync } from "glob";
import VueComponent from "./VueComponent";

export default class VueComponentProcessingStack {
  private paths: string[] = [];

  constructor(scanDirectory: string) {
    this.paths = globSync(`${scanDirectory}/**/*.vue`);
  }

  pop() {
    const path = this.paths.pop();

    if(path == null) throw new Error("Index out of bounds.");

    return new VueComponent(path);
  }

  isEmpty() : boolean {
    return this.paths.length === 0;
  }
}