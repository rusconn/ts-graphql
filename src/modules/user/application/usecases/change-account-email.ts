import type { EmptyObject } from "type-fest";

import type { DiscriminatedUnion } from "../../../../lib/type.ts";
import { Entity } from "../../domain/entities/user.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";
import { Dto } from "../dtos/user.ts";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.ts";

type Deps = {
  repos: { user: IUserRepoForAuthed };
};

type Input = {
  userId: Entity["id"];
  email: Entity["email"];
};

type Output = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  EmailAlreadyTaken: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dto;
  };
}>;

export async function changeAccountEmail(deps: Deps, input: Input): Promise<Output> {
  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "AccountNotFound" };
  }

  const changedUser = Entity.changeEmail(user, input.email);
  try {
    await deps.repos.user.update(changedUser);
  } catch (e) {
    if (e instanceof EmailAlreadyExistsError) {
      return { type: "EmailAlreadyTaken" };
    }
    return {
      type: "UnexpectedFailure",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: Dto.fromEntity(changedUser),
  };
}
