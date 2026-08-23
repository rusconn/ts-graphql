import { parseCursor } from "../../../../shared/mod.ts";
import { Entity as User } from "../../../domain/entities/user.ts";

export const parseUserCursor = parseCursor(User.Id.is);
