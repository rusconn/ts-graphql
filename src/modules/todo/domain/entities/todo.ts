import type { Tagged } from "type-fest";

import type { UserEntity } from "../../../user/mod.ts";
import { Description } from "./todo/description.ts";
import { Id } from "./todo/id.ts";
import { Status } from "./todo/status.ts";
import { Title } from "./todo/title.ts";

export type Entity = Tagged<Raw, "TodoEntity">;

type Raw = {
  id: Id;
  title: Title;
  description: Description;
  status: Status;
  userId: UserEntity["id"];
  createdAt: Date;
  updatedAt: Date;
};

export const Entity = {
  MAX_COUNT: 10_000,

  create(input: Pick<Entity, "userId" | "title" | "description">): Entity {
    const { id, date } = Id.createWithDate();
    return {
      id,
      title: input.title,
      description: input.description,
      status: Status.PENDING,
      userId: input.userId,
      createdAt: date,
      updatedAt: date,
    } satisfies Raw as Entity;
  },

  changeStatus(todo: Entity, input: Entity["status"]): Entity {
    return this.update(todo, { status: input });
  },

  update(todo: Entity, input: Partial<Pick<Entity, "title" | "description" | "status">>): Entity {
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
  },

  Description,
  Id,
  Status,
  Title,
};
