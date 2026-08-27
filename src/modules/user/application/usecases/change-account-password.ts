import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { Entity, type UserPassword } from "../../domain/entities/user.ts";
import { Dto } from "../dtos/user.ts";

type Deps = {
  repos: {
    user: {
      find(id: Entity["id"]): Promise<Entity | undefined>;
      update(user: Entity): Promise<void>;
    };
  };
};

type Input = {
  userId: Entity["id"];
  oldPassword: UserPassword;
  newPassword: UserPassword;
};

type Output = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  NewPasswordSameAsOld: EmptyObject;
  IncorrectOldPassword: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dto;
  };
}>;

export async function changeAccountPassword(deps: Deps, input: Input): Promise<Output> {
  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "AccountNotFound" };
  }

  const changedUser = await Entity.changePassword(user, input);
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
    changed: Dto.fromEntity(changedUser.value),
  };
}
