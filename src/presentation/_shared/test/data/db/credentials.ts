import type * as Db from "../../../../../infrastructure/datasources/db/types.ts";
import { db as users } from "./users.ts";

export const db = {
  admin: {
    userId: users.admin.id,
    /** raw: adminadmin */
    password:
      "$argon2id$v=19$m=4096,p=1,t=1$dY4M7DFpt0wjn7Jm+7Ei3A$NmNGi8NeMOAQ1NTDzvEPWWmKZd657TB61z1t5f6N7IE",
  },
  alice: {
    userId: users.alice.id,
    /** raw: alicealice */
    password:
      "$argon2id$v=19$m=4096,p=1,t=1$9Mou4sWn3rUQXX/rd8Myjg$s0awh0q12eTt2srrVnQ/1pXXU1DvkRrq7AYbfb2TR7Y",
  },
} satisfies Record<string, Db.Credential>;
