import type { Tagged } from "type-fest";

import * as UserEntity from "../../domain/entities/user.ts";

export type Type = Tagged<Raw, "CredentialDto">;

type Raw = {
  userId: UserEntity.Type["id"];
  password: UserEntity.Type["password"];
};
