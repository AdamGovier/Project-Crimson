import ts, { Block, Identifier, TypeReference, TypeReferenceNode, VariableDeclaration } from "typescript";
import TypescriptSourceFile from "./TypescriptSourceFile";
import { stat } from "fs";
import { hostUri } from "./constants/hosts";
import { httpMethods } from "./constants/methods";

export interface ImportPathAdjustment {
  indentifier: string;
  newPath: string;
}

export type Transformer = ts.TransformerFactory<ts.SourceFile>;

export function applyTransform(transformer: Transformer, sourceFile: ts.SourceFile) {
  const result = ts.transform(sourceFile, [transformer]);

  return result.transformed[0];
}

export class TransformerGenerator {
  // Currently only supports default exports.
  static createImportPathAdjusterTransformer(adjustments:ImportPathAdjustment[]) : Transformer {
    const transformer: Transformer = context => {
    
      // Inspired by https://github.com/itsdouges/typescript-transformer-handbook?tab=readme-ov-file#writing-your-first-transformer
      return sourceFile => {
        const visitor = (node: ts.Node): ts.Node => {
          if (ts.isImportDeclaration(node)) {
            if(node.importClause && node.importClause.name) {
              const identifier = node.importClause?.name?.escapedText;
    
              if(identifier) {
                const adjustment = adjustments.find(adj => adj.indentifier === identifier);
    
                if(adjustment) {
                  // https://stackoverflow.com/questions/67723545/how-to-update-or-insert-to-import-using-typescript-compiler-api
                  return ts.factory.updateImportDeclaration(
                    node,
                    node.modifiers,
                    node.importClause,
                    ts.factory.createStringLiteral(adjustment.newPath),
                    node.attributes
                  );
                }
              }
            }
          }
      
          return ts.visitEachChild(node, visitor, context);
        };
      
        return ts.visitNode(sourceFile, visitor, ts.isSourceFile);
      };
    };

    return transformer;
  }

  static createEntryTsFastifyPluginTransformer(entityModels: TypescriptSourceFile[]) : Transformer {
    const entryTsTransformer: Transformer = context => {
      return sourceFile => {
        const fastifyInstanceDeclarationIndex = sourceFile.statements.findIndex(
          stmt => {
            if (ts.isVariableStatement(stmt)) {
              const declaration = stmt.declarationList.declarations[0] as VariableDeclaration;
              const identifier = declaration.name as Identifier;
              return identifier.text === "fastify";
            }

            return false;
          }
        ) + 1;

        const fastifyPlugins = entityModels.map(model => createFastifyPluginRegisterExpressionNode(model));
    
        fastifyPlugins.forEach(([_, plugin]) => addLineBreak(plugin, false));
    
        const updatedStatements = [
          ...fastifyPlugins.map(([importStmt, _]) => importStmt),
          ...sourceFile.statements.slice(0, fastifyInstanceDeclarationIndex),
          ...fastifyPlugins.map(([_, plugin]) => plugin),
          ...sourceFile.statements.slice(fastifyInstanceDeclarationIndex)
        ];
    
        return ts.factory.updateSourceFile(sourceFile, updatedStatements);
      }
    }

    return entryTsTransformer;
  }
}

export const entityModelImportTransformer = TransformerGenerator.createImportPathAdjusterTransformer([
  {
    indentifier: "CrimsonEntity",
    newPath: "../crimson/CrimsonEntity"
  }
]);

export const entryImportTransformer = TransformerGenerator.createImportPathAdjusterTransformer([
  {
    indentifier: "AppDataSource",
    newPath: "./crimson/AppDataSource"
  }
]);


export const serverToClientComponentTransformer: Transformer = context => {
  return sourceFile => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isCallExpression(node)) {
        if (ts.isPropertyAccessExpression(node.expression)) {
          if (ts.isIdentifier(node.expression.expression) && node.expression.expression.text === "client") {
            const newArgument = ts.factory.createPropertyAccessExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("props"),
                ts.factory.createIdentifier("entityModel")
              ),
              ts.factory.createIdentifier("name")
            );
  
            return ts.factory.updateCallExpression(
              node,
              node.expression,
              node.typeArguments,
              [newArgument, ...node.arguments]
            );
          }
        }
      }

      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'client') {
        if (node.initializer && ts.isCallExpression(node.initializer)) {
          const callExpr = node.initializer;

          if (ts.isIdentifier(callExpr.expression) && callExpr.expression.text === 'useController') {
            const typeArgs = callExpr.typeArguments;
          
            const newExpression = ts.factory.createNewExpression(
              ts.factory.createIdentifier((typeArgs![0] as TypeReferenceNode).typeName.getText()),
              [
                ts.factory.createTypeReferenceNode("TEntityModel", undefined)
              ],
              []
            );

            return ts.factory.updateVariableDeclaration(
              node,
              node.name,
              node.exclamationToken,
              node.type,
              newExpression
            );
          }
        }
      }

      return ts.visitEachChild(node, visitor, context);
    };
  
    return ts.visitNode(sourceFile, visitor, ts.isSourceFile);
  };
};

export const serverToClientControllerTransformer: Transformer = context => {
  return sourceFile => {
    const visitor = (node: ts.Node): ts.Node => {
      if(ts.isMethodDeclaration(node)) {
        const methodName = node.name.getText();
        const httpMethod = httpMethods.find(method => methodName?.startsWith(method));

        if(httpMethod) {
          const routeName = methodName?.split(httpMethod)[1];

          return ts.factory.updateMethodDeclaration(
            node,
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.questionToken,
            node.typeParameters,
            [
              // controllerName:string | undefined = undefined
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier("controllerName"),
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
              ),
              ...node.parameters
            ],
            node.type,
            createClientApiCallBlock(httpMethod, routeName)
          );
        }
      }

      return ts.visitEachChild(node, visitor, context);
    };
  
    return ts.visitNode(sourceFile, visitor, ts.isSourceFile);
  };
};

function createClientApiCallBlock(httpMethod: string, routeName: string) : Block {
  return ts.factory.createBlock([
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier("response"),
            undefined,
            undefined,
            ts.factory.createAwaitExpression(
              ts.factory.createCallExpression(
                ts.factory.createIdentifier("fetch"),
                undefined,
                [
                  createUrlNode(hostUri, routeName),

                  ts.factory.createObjectLiteralExpression([
                    ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier("method"),
                      ts.factory.createStringLiteral(httpMethod.toUpperCase())
                    ),
                    ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier("headers"),
                      ts.factory.createObjectLiteralExpression(
                        [
                          ts.factory.createPropertyAssignment(
                            ts.factory.createStringLiteral("Content-Type"),
                            ts.factory.createStringLiteral("application/json") 
                          )
                        ],
                        true
                      )
                    ),
                    ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier("body"),
                      // Stringify JS object if body included.
                      ts.factory.createConditionalExpression(
                        // Check if req.body exists
                        ts.factory.createPropertyAccessChain(
                          ts.factory.createIdentifier("req"),
                          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                          ts.factory.createIdentifier("body")
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        // True
                        ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("JSON"),
                            ts.factory.createIdentifier("stringify")
                          ),
                          undefined,
                          [
                            ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier("req"),
                              ts.factory.createIdentifier("body")
                            )
                          ]
                        ),
                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                        // False, set body to be empty
                        ts.factory.createIdentifier("undefined")
                      )
                    ),
                  ], true)
                ]
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
  
    // Create a 'const json = await response.json();' statement
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier("json"),
            undefined,
            undefined,
            ts.factory.createAwaitExpression(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("response"),
                  ts.factory.createIdentifier("json")
                ),
                undefined,
                []
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
  
    // Return 'json'
    ts.factory.createReturnStatement(ts.factory.createIdentifier("json")),
  ], true);
}

function createFastifyPluginRegisterExpressionNode(entityModel: TypescriptSourceFile) {
  const identifier = `${entityModel.getIdentifier()?.toLocaleLowerCase()}Routes`;
  const modelPath = `./routes/${entityModel.getIdentifier()}.routes`

  const importStmt = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      ts.factory.createIdentifier(identifier!),
      undefined
    ),
    ts.factory.createStringLiteral(modelPath)
  )

  const expression = ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("fastify"),
        ts.factory.createIdentifier("register")
      ),
      undefined, // no generic
      [
        ts.factory.createIdentifier(identifier),
        ts.factory.createObjectLiteralExpression([
          ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier("prefix"),
            ts.factory.createStringLiteral(`/${entityModel.getIdentifier()}`)
          )
        ], true)
      ]
    )
  );

  return [importStmt, expression];
}

export function addLineBreak(node: ts.Node, isAfterNode: boolean) {
  if(isAfterNode)
    ts.addSyntheticTrailingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, "!--empty-line--!", true);
  else
    ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, "!--empty-line--!", true);
}

export function translateAliasPath(path: string) {
  if(path.includes("@crimson")) {
    path = path.replace("@crimson/", "../../library/src/");
  }

  return path;
}

export const stripClientModelDecoratorsTransformer: Transformer = context => {
  return sourceFile => {
    const statements = sourceFile.statements;

    const updatedTopLevelStatements = statements.filter(node => !ts.isDecorator(node));

    return ts.factory.updateSourceFile(sourceFile, updatedTopLevelStatements);
  };
}

function createUrlNode(
  hostUri: string,
  routeName: string
): ts.TemplateExpression {
  return ts.factory.createTemplateExpression(
    ts.factory.createTemplateHead(`${hostUri}/`),
    [
      ts.factory.createTemplateSpan(
        ts.factory.createIdentifier("controllerName"),
        ts.factory.createTemplateMiddle(`/${routeName}?`)
      ),
      // Add query paramaters
      ts.factory.createTemplateSpan(
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createNewExpression(
              ts.factory.createIdentifier("URLSearchParams"),
              undefined,
              [
                // req?.query ?? {}
                ts.factory.createBinaryExpression(
                  ts.factory.createPropertyAccessChain(
                    ts.factory.createIdentifier("req"),
                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    ts.factory.createIdentifier("query")
                  ),
                  ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                  // If no req query just provide an empty object.
                  ts.factory.createObjectLiteralExpression([], false)
                )
              ]
            ),
            ts.factory.createIdentifier("toString")
          ),
          undefined,
          []
        ),
        ts.factory.createTemplateTail(``)
      )
    ]
  );
}
