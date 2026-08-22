import * as User from "../../../../../domain/entities/user.ts";
import { parseCursor } from "../_shared/cursor.ts";

export const parseUserCursor = parseCursor(User.Id.is);
