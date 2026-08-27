import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { Entity } from "../../domain/entities/user.ts";
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
  name?: Entity["name"];
};

type Output = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    updated: Dto;
  };
}>;

export async function updateAccount(deps: Deps, input: Input): Promise<Output> {
  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "AccountNotFound" };
  }

  const updatedUser = Entity.updateAccount(user, input);
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
    updated: Dto.fromEntity(updatedUser),
  };
}
