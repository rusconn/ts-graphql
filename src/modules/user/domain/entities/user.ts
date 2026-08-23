import { err, ok, Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { Email } from "./user/email.ts";
import { Id } from "./user/id.ts";
import { Name } from "./user/name.ts";
import { Password, type PasswordHashed } from "./user/password.ts";

export type { Password as UserPassword } from "./user/password.ts";

export type Entity = Tagged<Raw, "UserEntity">;

type Raw = {
  id: Id;
  name: Name;
  email: Email;
  password: PasswordHashed;
  createdAt: Date;
  updatedAt: Date;
};

export const Entity = {
  async create(input: Pick<Entity, "name" | "email"> & { password: Password }): Promise<Entity> {
    const { id, date } = Id.createWithDate();
    return {
      id,
      name: input.name,
      email: input.email,
      password: await Password.hash(input.password),
      createdAt: date,
      updatedAt: date,
    } satisfies Raw as Entity;
  },

  async authenticate(user: Entity, password: Password): Promise<boolean> {
    return await Password.match(password, user.password);
  },

  updateAccount(user: Entity, input: Partial<Pick<Entity, "name">>): Entity {
    return this.update(user, input);
  },

  changeEmail(user: Entity, input: Entity["email"]): Entity {
    return this.update(user, { email: input });
  },

  async changePassword(
    user: Entity,
    input: {
      oldPassword: Password;
      newPassword: Password;
    },
  ): Promise<Result<Entity, ChangePasswordError>> {
    if (input.oldPassword === input.newPassword) {
      return err("NewPasswordSameAsOld");
    }

    const match = await this.authenticate(user, input.oldPassword);
    if (!match) {
      return err("IncorrectOldPassword");
    }

    return ok(this.update(user, { password: await Password.hash(input.newPassword) }));
  },

  update(user: Entity, input: Partial<Pick<Entity, "name" | "email" | "password">>): Entity {
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
  },

  Email,
  Id,
  Name,
  Password,
};

type ChangePasswordError =
  | "IncorrectOldPassword" //
  | "NewPasswordSameAsOld";
