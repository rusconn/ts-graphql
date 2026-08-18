import type { EmptyObject } from "type-fest";

import { User } from "../../domain/entities.ts";
import type { IUserRepoForAuthed } from "../../domain/repositories/user/for-authed.ts";
import type { DiscriminatedUnion } from "../../lib/type.ts";
import * as Dtos from "../dtos.ts";
import { EmailAlreadyExistsError } from "../errors/email-already-exists.ts";

type Deps = {
  repos: { user: IUserRepoForAuthed };
};

type Input = {
  userId: User.Type["id"];
  email: User.Email.Type;
};

type Output = DiscriminatedUnion<{
  AccountNotFound: EmptyObject;
  EmailAlreadyTaken: EmptyObject;
  UnexpectedFailure: {
    cause: unknown;
  };
  Success: {
    changed: Dtos.User.Type;
  };
}>;

export async function changeAccountEmail(deps: Deps, input: Input): Promise<Output> {
  const user = await deps.repos.user.find(input.userId);
  if (!user) {
    return { type: "AccountNotFound" };
  }

  const changedUser = User.changeEmail(user, input.email);
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
    changed: Dtos.User.fromEntity(changedUser),
  };
}
