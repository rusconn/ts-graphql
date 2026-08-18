import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";

type Deps = {
  repos: { user: IUserRepoForAuthed };
};

type Input = {
  userId: User.Type["id"];
  name?: User.Name.Type;
};

type Output = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    updated: Dtos.User.Type;
  };
}>;

export async function updateAccount(deps: Deps, input: Input): Promise<Output> {
  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "AccountNotFound" };
  }

  const updatedUser = User.updateAccount(user, input);
  try {
    await deps.repos.user.update(updatedUser);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    updated: Dtos.User.fromEntity(updatedUser),
  };
}
