import ts, { SourceFile } from "typescript";
import fs from "fs";
import TypescriptSourceFile from "./TypescriptSourceFile";
import { parse } from "vue/compiler-sfc";
import { baseParse, RootNode } from '@vue/compiler-dom';
import { encodeEmptyLines } from "ts-empty-line-encoder";

export default class VueComponent extends TypescriptSourceFile {
  constructor(path: string) {
    super(path);
  }

  override getTsIntermediateRepresentation() : SourceFile {
    const [_, script] = this.getTemplateAndScript();

    const encoded = encodeEmptyLines(script);

    return ts.createSourceFile(this.path, encoded, ts.ScriptTarget.Latest, true);
  }

  getVueTemplateIntermediateRepresentation() : RootNode {
    const [template] = this.getTemplateAndScript();

    return baseParse(template);
  }

  private getTemplateAndScript() : [string, string] {
    const componentRaw = fs.readFileSync(this.path, 'utf-8');

    const { descriptor } = parse(componentRaw);

    return [
      descriptor.template?.content ?? "",
      descriptor.scriptSetup?.content ?? ""
    ]
  }
}