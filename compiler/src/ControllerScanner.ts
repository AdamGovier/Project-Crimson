import path from "path";
import CrimsonComponentReference from "./CrimsonComponentReference";
import { findPath } from "./toolkit";
import TypescriptSourceFile from "./TypescriptSourceFile";
import VueComponent from "./VueComponent";
import ts, { ImportDeclaration } from "typescript";

export default class ControllerScanner {
  static findControllerPathInCrimsonComponent(crimsonComponent: VueComponent) : string {
    const representation = crimsonComponent.getTsIntermediateRepresentation();
    const crimsonLibraryPath = path.resolve(__dirname, '../../library');

    const importDecs: ImportDeclaration[] = [];
    let controllerPath = "";

    const findController = (node: ts.Node) => {
      if(ts.isImportDeclaration(node)) {
        importDecs.push(node);
      }
      
      if(ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText == "useController") {
        if(node.typeArguments && node.typeArguments.length > 0) {
          const type = node.typeArguments[0];
  
          importDecs.forEach(importDec => {
            if(`${importDec.importClause?.name?.getText(representation)}<TEntityModel>` == type.getText(representation)) {
              const path = findPath(crimsonComponent.getPath().replace("@crimson", crimsonLibraryPath), importDec.moduleSpecifier?.getText(representation).replace(/^['"]|['"]$/g, "")) + ".ts";
              controllerPath = path;

            }
          });
        }
      }
  
      ts.forEachChild(node, findController);
    }

    findController(representation);

    return controllerPath;
  }
}