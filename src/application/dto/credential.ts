import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";

export type Type = Tagged<Raw, "CredentialDto">;

type Raw = {
  userId: Domain.User.Type["id"];
  password: Domain.User.Type["password"];
};
