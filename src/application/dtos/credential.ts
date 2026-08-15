import type { Tagged } from "type-fest";

import * as Entities from "../../domain/entities.ts";

export type Type = Tagged<Raw, "CredentialDto">;

type Raw = {
  userId: Entities.User.Type["id"];
  password: Entities.User.Type["password"];
};
