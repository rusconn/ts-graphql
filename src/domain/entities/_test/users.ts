import type { UserRepo } from "../../../infrastructure/repositories/user.ts";
import type * as Entity from "../user.ts";

export const entities = {
  alice: {
    id: "0193cb69-a4be-754e-a5a0-462df1202f5e",
    name: "Alice",
    email: "alice@example.com",
    /** raw: alicealice */
    password:
      "$argon2id$v=19$m=4096,p=1,t=1$9Mou4sWn3rUQXX/rd8Myjg$s0awh0q12eTt2srrVnQ/1pXXU1DvkRrq7AYbfb2TR7Y",
    createdAt: new Date("2024-12-15T17:41:58.590Z"),
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
  } as Entity.Type,
  bob: {
    id: "01a012d0-01a3-763a-a0a1-61941f38aa42",
    name: "Bob",
    email: "bob@example.com",
    /** raw: bobbob12 */
    password:
      "$argon2id$v=19$m=65536,p=4,t=3$nHurSahXbP6H4DsxcsbwDg$2f+zHxwW/a6ooT6mSuUNiNVL9VHN0bxrXTapzqJr1l4",
    createdAt: new Date("2024-12-15T17:42:58.590Z"),
    updatedAt: new Date("2024-12-15T17:42:58.590Z"),
  } as Entity.Type,
} satisfies Record<string, Entity.Type>;

export async function seed(repo: UserRepo, ...entities: Entity.Type[]) {
  await Promise.all(entities.map((entity) => repo.add(entity)));
}
