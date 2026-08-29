import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    bugId: v.id("bugs"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    if (!args.content.trim()) throw new Error("Comment cannot be empty");

    return await ctx.db.insert("comments", {
      bugId: args.bugId,
      authorId: userId,
      content: args.content.trim(),
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.commentId);
  },
});
