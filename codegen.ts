import type { CodegenConfig } from "@graphql-codegen/cli";
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript";
import type { TypeScriptResolversPluginConfig } from "@graphql-codegen/typescript-resolvers";

const typescript: TypeScriptPluginConfig = {
  avoidOptionals: {
    defaultValue: true,
    query: true,
    mutation: true,
    subscription: true,
  },
  enumsAsConst: true,
  useTypeImports: true,
};

const typescriptResolvers: TypeScriptResolversPluginConfig = {
  makeResolverTypeCallable: true,
  optionalInfoArgument: true,
  resolverTypeWrapperSignature: "T",
  useIndexSignature: true,
  resolversNonOptionalTypename: {
    unionMember: true,
  },
};

const config: CodegenConfig = {
  schema: "src/**/*.graphql",
  generates: {
    "e2e/graphql/generated/": {
      documents: "e2e/graphql/**/*.ts",
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: "string",
        enumsAsConst: true,
        scalars: {
          ID: "string",
          DateTimeISO: "string",
          EmailAddress: "string",
          Void: "void",
        },
        skipTypename: true,
        useTypeImports: true,
      },
    },
    "schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/modules/": {
      preset: "graphql-modules",
      presetConfig: {
        baseTypesPath: "../app/graphql/types.generated.ts",
        importBaseTypesFrom: "../../../app/graphql/types.generated.ts",
        filename: "presentation/types.generated.ts",
        encapsulateModuleTypes: "none",
        requireRootResolvers: true,
        useGraphQLModules: false,
      },
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        ...typescript,
        ...typescriptResolvers,
        scalars: {
          ID: {
            input: "string",
            output: "../../modules/shared/mod.ts#ID",
          },
          DateTimeISO: "Date",
          EmailAddress: "../../modules/shared/mod.ts#EmailAddress as Email",
          Void: "void",
        },
        contextType: "./contexts.ts#Context",
        mappers: {
          Todo: "../../modules/todo/app.ts#TodoDto",
          User: "../../modules/user/app.ts#UserDto",
        },
      },
    },
  },
  emitLegacyCommonJSImports: false,
};

export default config;
