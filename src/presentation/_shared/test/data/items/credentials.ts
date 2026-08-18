import type * as Db from "../../../../../infrastructure/datasources/db/types.ts";
import { items as users } from "./users.ts";

export const items = {
  alice: {
    userId: users.alice.id,
    /** raw: alicealice */
    password:
      "$argon2id$v=19$m=4096,p=1,t=1$9Mou4sWn3rUQXX/rd8Myjg$s0awh0q12eTt2srrVnQ/1pXXU1DvkRrq7AYbfb2TR7Y",
  },
  bob: {
    userId: users.bob.id,
    /** raw: bobbob12 */
    password:
      "$argon2id$v=19$m=65536,p=4,t=3$nHurSahXbP6H4DsxcsbwDg$2f+zHxwW/a6ooT6mSuUNiNVL9VHN0bxrXTapzqJr1l4",
  },
} satisfies Record<string, Db.Credential>;
