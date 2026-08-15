import { err, ok, Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Email from "./user/email.ts";
import * as Id from "./user/id.ts";
import * as Name from "./user/name.ts";
import * as Password from "./user/password.ts";
import * as Role from "./user/role.ts";

export { Email, Id, Name, Password, Role };

export type Type = Tagged<Raw, "UserEntity">;

type Raw = {
  id: Id.Type;
  name: Name.Type;
  email: Email.Type;
  password: Password.TypeHashed;
  role: Role.Type;
  createdAt: Date;
  updatedAt: Date;
};

export async function create(
  input: Pick<Type, "name" | "email"> & { password: Password.Type },
): Promise<Type> {
  const { id, date } = Id.createWithDate();
  return {
    id,
    name: input.name,
    email: input.email,
    password: await Password.hash(input.password),
    role: Role.USER,
    createdAt: date,
    updatedAt: date,
  } satisfies Raw as Type;
}

export async function authenticate(user: Type, password: Password.Type): Promise<boolean> {
  return await Password.match(password, user.password);
}

export function updateAccount(user: Type, input: Partial<Pick<Type, "name">>): Type {
  return update(user, input);
}

export function changeEmail(user: Type, input: Type["email"]): Type {
  return update(user, { email: input });
}

export async function changePassword(
  user: Type,
  input: {
    oldPassword: Password.Type;
    newPassword: Password.Type;
  },
): Promise<Result<Type, ChangePasswordError>> {
  if (input.oldPassword === input.newPassword) {
    return err("NewPasswordSameAsOld");
  }

  const match = await authenticate(user, input.oldPassword);
  if (!match) {
    return err("IncorrectOldPassword");
  }

  return ok(update(user, { password: await Password.hash(input.newPassword) }));
}

export type ChangePasswordError =
  | "IncorrectOldPassword" //
  | "NewPasswordSameAsOld";

function update(user: Type, input: Partial<Pick<Type, "name" | "email" | "password">>): Type {
  return {
    ...user,
    ...(input.name != null && {
      name: input.name,
    }),
    ...(input.email != null && {
      email: input.email,
    }),
    ...(input.password != null && {
      password: input.password,
    }),
    updatedAt: new Date(),
  };
}
