import ts from "typescript";
import fs from "fs";
import { encodeEmptyLines } from "ts-empty-line-encoder";

export default class TypescriptSourceFile {
  protected path: string;
  public sourceFile: ts.SourceFile;

  // Optional provide an identifier
  protected identifier: string | undefined;

  constructor(path: string) {
    this.path = path;

    const content = encodeEmptyLines(fs.readFileSync(this.path, 'utf-8'));

    this.sourceFile = ts.createSourceFile(this.path, content, ts.ScriptTarget.Latest, true);
  }

  setIdentifier(identifier: string) {
    this.identifier = identifier;
  }

  getIdentifier() {
    return this.identifier;
  }

  getTsIntermediateRepresentation() : ts.SourceFile {
    return this.sourceFile;
  }

  getPath() : string {
    return this.path;
  }
}

