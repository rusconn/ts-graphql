import { parseCursor } from "../../../../shared/mod.ts";
import { Entity } from "../../../domain/entities/todo.ts";

export const parseTodoCursor = parseCursor(Entity.Id.is);
