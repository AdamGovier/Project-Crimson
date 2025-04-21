import Platform from "../enums/Platform";
import { getPlatformPath } from "../toolkit";

interface CopyFromToPath {
  fromPath: string,
  toPath: string
}

export const basePath = "../dist";

export const clientPath: CopyFromToPath = {
  fromPath: "../input",
  toPath: ""
}

export const libraryToClientPath: CopyFromToPath = {
  fromPath: "../library/src",
  toPath: "crimsonLib"
}

export const appDataSourcePath: CopyFromToPath = {
  fromPath: "./src/core/server/AppDataSource.ts",
  toPath: "crimson/AppDataSource.ts"
}

export const crimsonEntityPath: CopyFromToPath = {
  fromPath: "../library/src/base/CrimsonEntity.ts",
  toPath: "crimson/CrimsonEntity.ts"
}

export const tsConfigPath: CopyFromToPath = {
  fromPath: "./src/core/server/tsconfig.template.json",
  toPath: "tsconfig.json"
}

export const dynamicModelPath = (name: string) => `models/${name}.ts`; 

export const inputProjectPath = "../input";

export const pkgTemplatePath = "./src/core/server/pkgtemplate.json";

export const packageJsonExportPath = "package.json";

export const entryTsOutputPath = "index.ts";

export const clientTsConfigPath = `${basePath}/${getPlatformPath(Platform.CLIENT)}/tsconfig.app.json`;
export const clientViteConfigPath = `${basePath}/${getPlatformPath(Platform.CLIENT)}/vite.config.ts`;