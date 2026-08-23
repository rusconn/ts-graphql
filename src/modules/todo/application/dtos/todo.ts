import type { Tagged, UnwrapTagged } from "type-fest";

import { Entity } from "../../domain/entities/todo.ts";

export type Dto = Tagged<Raw, "TodoDto">;

type Raw = UnwrapTagged<Entity>;

export const Dto = {
  fromEntity(entity: Entity): Dto {
    return entity as unknown as Dto;
  },
};
