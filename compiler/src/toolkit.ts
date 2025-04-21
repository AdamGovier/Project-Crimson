import path from "path";
import fs from "fs";
import { format, Options } from "prettier";
import Platform from "./enums/Platform";
import ts, { SourceFile } from "typescript";
import { basePath, clientTsConfigPath, clientViteConfigPath, inputProjectPath, packageJsonExportPath, pkgTemplatePath } from "./constants/paths";
import { PackageJson, TsConfigJson } from "type-fest";
import { coreServerDependencies } from "./constants/packageJson";
import { decodeEmptyLines } from "ts-empty-line-encoder";
import { globSync } from "glob";
import TypescriptSourceFile from "./TypescriptSourceFile";
import { applyTransform, stripClientModelDecoratorsTransformer } from "./transformers";
import { removeDecorators } from "./templating";

export function findPath(routePath: string, relativePath: string) {
  // Get absolute path of routePath.
  const baseDir = path.dirname(path.resolve(routePath));

  return path.resolve(baseDir, relativePath); ;
}

export function deleteDist() {
  fs.rmSync(basePath, { recursive: true, force: true });
}

function ensureDirectoryExists(targetPath: string) {
  const directory = path.dirname(targetPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export function getPlatformPath(platform: Platform) : string {
  switch (platform) {
    case Platform.CLIENT:
        return "client"
    case Platform.SERVER:
        return "server"
    case Platform.SHARED:
        return "shared"
    case Platform.ROOT:
      return "";
  
    default:
      throw new Error("Platform does not exist.");
  }
}

export async function writeToDist(content: string, pathAndFilename: string, platform: Platform, formatting?: Options) {
  const distPath = path.resolve(basePath, getPlatformPath(platform), pathAndFilename);
  ensureDirectoryExists(distPath);

  // https://stackoverflow.com/a/58382419/19024729
  content = decodeEmptyLines(content);
  content = content.replace(/\/\*!—empty-line—!\*\//g, "");

  if(formatting) {
    content = await format(content, formatting);
  }

  fs.writeFileSync(distPath, content, 'utf8');
}

export function copyFileToDist(sourcePath: string, pathAndFilename: string, platform: Platform) {
  const distPath = path.resolve(basePath, getPlatformPath(platform), pathAndFilename);
  ensureDirectoryExists(distPath);
  fs.copyFileSync(sourcePath, distPath);
}

export function copyDirectoryToDist(pathToDirectory: string, pastePath: string, platform: Platform) {
  const distPath = path.resolve(basePath, getPlatformPath(platform), pastePath);
  ensureDirectoryExists(distPath);
  fs.cpSync(pathToDirectory, distPath, { recursive: true});
}

export function convertSourceFileToCodeblock(sourceFile: ts.SourceFile) {
  // https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
  // https://kinda-silly-blog.vercel.app/posts/typescript-compiler-api
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  
  return printer.printFile(sourceFile);
}

export async function writePackageJson() {
  const rawJson = fs.readFileSync(pkgTemplatePath, 'utf-8');

  const packageJson = JSON.parse(rawJson) as PackageJson; 

  packageJson.dependencies = coreServerDependencies;

  writeToDist(JSON.stringify(packageJson), packageJsonExportPath, Platform.ROOT)
}

export async function updateClientTsConfigToIncludePathAlias() {
  const tsConfigRaw = fs.readFileSync(clientTsConfigPath, 'utf-8');

  const tsConfig = JSON.parse(tsConfigRaw) as TsConfigJson;

  tsConfig.compilerOptions!.paths!["@crimson/*"] = ["./crimsonLib/*"];

  await writeToDist(JSON.stringify(tsConfig), "tsconfig.app.json", Platform.CLIENT);
}

export async function updateClientViteConfigToIncludePathAlias() {
  const viteConfig = fs.readFileSync(clientViteConfigPath, 'utf-8');

  await writeToDist(viteConfig.replace("../library/src", "./crimsonLib"), "vite.config.ts", Platform.CLIENT);
}

export async function convertModelsToClientModels() {
  const paths = globSync(`${inputProjectPath}/**/models/*.ts`);

  const updatedModels = paths.map(path => {
    const file = fs.readFileSync(path, 'utf-8');

    const output = removeDecorators(file).replace('import { Entity, Column } from "typeorm"', "");
    
    return [path, output];
  });

  for(const [path, updatedSource] of updatedModels) {
    const pathSplit = path.split(/[\\/]+/);

    const fileName = pathSplit[pathSplit.length - 1];

    await writeToDist(updatedSource, `./src/models/${fileName}`, Platform.CLIENT, {
      parser: "typescript"
    });
  }
}

/**
 * 
 * @param path to Vue component.
 */
export function createRawVueComponentWithNewScriptTag(path: string, script: SourceFile) : string {
  const vueComponentRaw = fs.readFileSync(path, 'utf-8');

  // Replaces between <script *any argument*></script>
  const updatedComponent = vueComponentRaw.replace(
    /(<script\b[^>]*>)[\s\S]*?(<\/script>)/,
    `$1\n${convertSourceFileToCodeblock(script)}\n$2`
  );

  return updatedComponent;
}

export function distinct<T>(
  array: T[],
  compare: (a: T, b: T) => boolean
): T[] {
  return array.filter((item, index, self) =>
    index === self.findIndex(other => compare(other, item))
  );
}