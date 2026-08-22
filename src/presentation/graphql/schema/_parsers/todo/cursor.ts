import * as Todo from "../../../../../domain/entities/todo.ts";
import { parseCursor } from "../_shared/cursor.ts";

export const parseTodoCursor = parseCursor(Todo.Id.is);
