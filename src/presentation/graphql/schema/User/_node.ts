import type { User } from "../../../../domain/entities.ts";
import type { ContextForAuthed } from "../../yoga/contexts.ts";

export async function getNode(ctx: ContextForAuthed, id: User.Type["id"]) {
  return await ctx.queries.user.find(id);
}
