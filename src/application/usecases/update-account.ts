import type { EmptyObject } from "type-fest";

import * as UserEntity from "../../domain/entities/user.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as UserDto from "../dtos/user.ts";

type Deps = {
  repos: { user: IUserRepoForAuthed };
};

type Input = {
  userId: UserEntity.Type["id"];
  name?: UserEntity.Name.Type;
};

type Output = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    updated: UserDto.Type;
  };
}>;

export async function updateAccount(deps: Deps, input: Input): Promise<Output> {
  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "AccountNotFound" };
  }

  const updatedUser = UserEntity.updateAccount(user, input);
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
    updated: UserDto.fromEntity(updatedUser),
  };
}
