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
  oldPassword: UserEntity.Password.Type;
  newPassword: UserEntity.Password.Type;
};

type Output = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  NewPasswordSameAsOld: EmptyObject;
  IncorrectOldPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: UserDto.Type;
  };
}>;

export async function changeAccountPassword(deps: Deps, input: Input): Promise<Output> {
  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "AccountNotFound" };
  }

  const changedUser = await UserEntity.changePassword(user, input);
  if (changedUser.isErr()) {
    switch (changedUser.error) {
      case "NewPasswordSameAsOld":
        return { type: "NewPasswordSameAsOld" };
      case "IncorrectOldPassword":
        return { type: "IncorrectOldPassword" };
      default:
        throw new Error(changedUser.error satisfies never);
    }
  }

  try {
    await deps.repos.user.update(changedUser.value);
  } catch (e) {
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: UserDto.fromEntity(changedUser.value),
  };
}
