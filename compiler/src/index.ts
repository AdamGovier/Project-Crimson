import { SourceFile } from "typescript";
import ComponentScanner from "./ComponentScanner";
import { appDataSourcePath, clientPath, crimsonEntityPath, dynamicModelPath, entryTsOutputPath, inputProjectPath, libraryToClientPath, tsConfigPath } from "./constants/paths";
import ControllerScanner from "./ControllerScanner";
import Platform from "./enums/Platform";
import { RouteCollection, RouteGenerator, RouteParser } from "./routeGen";
import { convertModelsToClientModels, convertSourceFileToCodeblock, copyDirectoryToDist, copyFileToDist, createRawVueComponentWithNewScriptTag, deleteDist, distinct, updateClientTsConfigToIncludePathAlias, updateClientViteConfigToIncludePathAlias, writePackageJson, writeToDist } from "./toolkit";
import { applyTransform, entityModelImportTransformer, entryImportTransformer, serverToClientComponentTransformer, serverToClientControllerTransformer, TransformerGenerator } from "./transformers";
import TypescriptSourceFile from "./TypescriptSourceFile";
import VueComponentProcessingStack from "./VueComponentProcessingStack";
import groupBy from 'just-group-by';
import VueComponent from "./VueComponent";
import CrimsonComponentReference from "./CrimsonComponentReference";

(async () => {
  // Clear dist folder to remove previously compiled files.
  deleteDist();

  // Copy Vue Project
  copyDirectoryToDist(clientPath.fromPath, clientPath.toPath, Platform.CLIENT);
  copyDirectoryToDist(libraryToClientPath.fromPath, libraryToClientPath.toPath, Platform.CLIENT);

  // Copy required files
  copyFileToDist(appDataSourcePath.fromPath, appDataSourcePath.toPath, Platform.SERVER);
  copyFileToDist(tsConfigPath.fromPath, tsConfigPath.toPath, Platform.SERVER);
  copyFileToDist(crimsonEntityPath.fromPath, crimsonEntityPath.toPath, Platform.SERVER);

  // Update existing files
  await updateClientTsConfigToIncludePathAlias();
  await updateClientViteConfigToIncludePathAlias();
  await convertModelsToClientModels();

  const componentStack = new VueComponentProcessingStack(inputProjectPath + "/src");

  const controllersAndComponents: [TypescriptSourceFile, VueComponent][] = [];
  const unprocessedComponentReferences: CrimsonComponentReference[] = []

  while(!componentStack.isEmpty()) {
    const component = componentStack.pop();
    
    // Find if the component uses any Crimson components
    const componentReferences = ComponentScanner.findReferencedCrimsonComponents(component);
    
    // Component doesn't contain any Crimson components so continue to next iteration.
    if(componentReferences.length === 0) continue; 

    // Find and store the crimson component controller for each crimson component
    for(let i = 0; i < componentReferences.length; i++) {
      const controllerPath = ControllerScanner.findControllerPathInCrimsonComponent(componentReferences[i].getCrimsonComponent());

      componentReferences[i].bindController(controllerPath);
      controllersAndComponents.push([componentReferences[i].getController(), componentReferences[i].getCrimsonComponent()]);
    }

    unprocessedComponentReferences.push(...componentReferences)
  }

  const processedEntityModels: TypescriptSourceFile[] = [];

  // Group references by model.
  const referencesGrouped = groupBy(unprocessedComponentReferences, (ref) => ref.getModelPath());

  // Loop through each entity model group.
  for (const [modelPath, references] of Object.entries(referencesGrouped)) {
    const routesForPlugin = new RouteCollection(references![0].getModel())

    for(const ref of distinct(references, (a, b) => a.equals(b))) {
      if(ref == references[0]) {
        processedEntityModels.push(ref.getModel());
      }

      const controller = ref.getController();

      const routeCollection = RouteParser.createRoutesForController(controller, ref.getModel());

      routesForPlugin.mergeCollection(routeCollection);

      const cleanedModel = applyTransform(entityModelImportTransformer, ref.getModel().getTsIntermediateRepresentation());

      // Copy data model to the server/models/
      writeToDist(convertSourceFileToCodeblock(cleanedModel), dynamicModelPath(ref.getModel().getIdentifier()!), Platform.SERVER)
    }

    // Generate a routes file for the model and write to server/routes.
    await RouteGenerator.createAndWriteRouteFile(routesForPlugin);
  }

  // Update client components and controllers to allow the requesting of API resources.
  for (const [controller, component] of controllersAndComponents) {
    const controllerPathSegments = controller.getPath().split(/[\\/]+/);
    const controllerSubPath = `${controllerPathSegments[controllerPathSegments.length - 2]}/${controllerPathSegments[controllerPathSegments.length - 1]}`;

    const componentPathSegments = component.getPath().split(/[\\/]+/);
    const componentSubPath = `${componentPathSegments[componentPathSegments.length - 2]}/${componentPathSegments[componentPathSegments.length - 1]}`;

    const controllerUpdated = applyTransform(serverToClientControllerTransformer, controller.getTsIntermediateRepresentation());
    
    const componentScriptUpdated = applyTransform(serverToClientComponentTransformer, component.getTsIntermediateRepresentation());
    const componentUpdated = createRawVueComponentWithNewScriptTag(component.getPath(), componentScriptUpdated);

    await writeToDist(
      convertSourceFileToCodeblock(controllerUpdated),
      // Write to the crimsonLib folder instead.
      `./crimsonLib/components/${controllerSubPath}`,
      Platform.CLIENT
    );

    await writeToDist(
      componentUpdated,
      // Write to the crimsonLib folder instead.
      `./crimsonLib/components/${componentSubPath}`,
      Platform.CLIENT
    );
  }

  await writePackageJson();

  // index.ts setup
  const entryTs = new TypescriptSourceFile("./src/core/server/entry.ts");

  const entryTsPluginTransformer = TransformerGenerator.createEntryTsFastifyPluginTransformer(processedEntityModels);

  const templatedEntryTs = applyTransform(entryTsPluginTransformer, entryTs.getTsIntermediateRepresentation());
  const importParsedEntryTs = applyTransform(entryImportTransformer, templatedEntryTs);

  writeToDist(convertSourceFileToCodeblock(importParsedEntryTs), entryTsOutputPath, Platform.SERVER);
})();