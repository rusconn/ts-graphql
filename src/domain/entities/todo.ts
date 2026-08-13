import type { Tagged } from "type-fest";

import * as Description from "./todo/description.ts";
import * as Id from "./todo/id.ts";
import * as Status from "./todo/status.ts";
import * as Title from "./todo/title.ts";
import * as User from "./user.ts";

export { Description, Id, Status, Title };

export const MAX_COUNT = 10_000;

export type Type = Tagged<Raw, "TodoEntity">;

type Raw = {
  id: Id.Type;
  title: Title.Type;
  description: Description.Type;
  status: Status.Type;
  userId: User.Type["id"];
  createdAt: Date;
  updatedAt: Date;
};

export function create(userId: Type["userId"], input: Pick<Type, "title" | "description">): Type {
  const { id, date } = Id.createWithDate();
  return {
    id,
    title: input.title,
    description: input.description,
    status: Status.PENDING,
    userId,
    createdAt: date,
    updatedAt: date,
  } satisfies Raw as Type;
}

export function changeStatus(todo: Type, input: Type["status"]): Type {
  return update(todo, { status: input });
}

export function update(
  todo: Type,
  input: Partial<Pick<Type, "title" | "description" | "status">>,
): Type {
  return {
    ...todo,
    ...(input.title != null && {
      title: input.title,
    }),
    ...(input.description != null && {
      description: input.description,
    }),
    ...(input.status != null && {
      status: input.status,
    }),
    updatedAt: new Date(),
  };
}
