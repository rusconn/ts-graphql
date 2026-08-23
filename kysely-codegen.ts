import { defineConfig } from "kysely-codegen";

export default defineConfig({
  camelCase: true,
  customImports: {
    Uuidv7: "../../../../shared/util/uuid/v7.ts",
  },
  dialect: "postgres",
  outFile: "src/modules/shared/infrastructure/datasources/db/types.generated.ts",
  typeMapping: {
    uuid: "Uuidv7", // uuidv7にするとstringになってしまうよう
  },
});
