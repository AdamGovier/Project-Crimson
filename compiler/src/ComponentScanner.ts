import CrimsonComponentReference from "./CrimsonComponentReference";
import { findPath } from "./toolkit";
import { translateAliasPath } from "./transformers";
import VueComponent from "./VueComponent";
import { baseParse, ElementNode, Node, NodeTypes, RootNode, SimpleExpressionNode, TemplateChildNode, TemplateNode, TextNode } from '@vue/compiler-dom';
import ts, { SourceFile } from "typescript";

export default class ComponentScanner {
  static findReferencedCrimsonComponents(component: VueComponent) : CrimsonComponentReference[] {
    let results: CrimsonComponentReference[] = [];
    
    results = this.findIdentifiersInComponentTemplate(component);

    results = this.findImportsOfIdentifiers(component, results);

    return results;
  }

  /**
   * 
   * @param component 
   * @returns [entityModelIdentifier, crimsonComponentIdentifier][]
   */
  private static findIdentifiersInComponentTemplate(component: VueComponent) : CrimsonComponentReference[] {
    let identifiers: CrimsonComponentReference[] = [];

    function findIdentifiersRecursive(node: TemplateChildNode | RootNode) {
      // If node has a field called props. https://vuejs.org/guide/components/props
      if('props' in node) { 
        // Loop through all props.
        for(const prop of node.props) {

          // If prop is of type Directive https://vuejs.org/api/built-in-directives.html, and is v-bind:entityModel.
          // All Crimson entities have the directive :entityModel.
          if(prop.type == NodeTypes.DIRECTIVE && (prop.rawName === ":entityModel" || prop.rawName === ":entity-model") ) {

            // Store result
            identifiers.push(new CrimsonComponentReference(
              (prop.exp as SimpleExpressionNode).content,
              node.tag
            ));
    
            // Each component should only support one :entityModel directive. This is per Vue spec and Crimson spec.
            break;
          }
        }
      }

      // If the node has children, check the children and it's children for Crimson components recursively.
      if('children' in node && node.children.length) {

        for (const child of node.children) {
          findIdentifiersRecursive(child as TemplateChildNode);
        }
      }
    }

    const syntaxTree = component.getVueTemplateIntermediateRepresentation();

    findIdentifiersRecursive(syntaxTree);

    return identifiers;
  }

  private static findImportsOfIdentifiers(component: VueComponent, results: CrimsonComponentReference[]) : CrimsonComponentReference[] {
    const basePath = component.getPath();

    function populateImportPathsRecursive(source: SourceFile, currentNode: ts.Node) {
      // If node is an import statement then investigate further.
      if (ts.isImportDeclaration(currentNode)) {
        let path = currentNode.moduleSpecifier?.getText(source).replace(/^['"]|['"]$/g, "");

        // Translate alias paths
        path = translateAliasPath(path);

        // Get the path of the import relative to the component getting scanned. And remove undesired formatting.
        path = findPath(basePath, path);

        const importIdentifier = currentNode.importClause?.name?.getText(source)!;

        // Find results which match the import identifier
        const matchingTargets = results.filter(res =>
          res.doesKeyMatchEntityModelIdentifier(importIdentifier) ||
          res.doesKeyMatchCrimsonComponentIdentifier(importIdentifier)
        );

        // Populate each matching target.
        matchingTargets.forEach(target => {
          const isModelImport = target.doesKeyMatchEntityModelIdentifier(importIdentifier);
          if (isModelImport) {
            // Bind entity model source file path, if path does not include .ts - append it.
            target.bindModel(path.endsWith(".ts") ? path : `${path}.ts`);
          } else {
            target.bindCrimsonComponent(path);
          }
        });
      }

      ts.forEachChild(currentNode,  (node) => populateImportPathsRecursive(source, node))
    }

    const tsIR = component.getTsIntermediateRepresentation();

    populateImportPathsRecursive(
      tsIR,
      tsIR as ts.Node
    )

    return results;
  }
}