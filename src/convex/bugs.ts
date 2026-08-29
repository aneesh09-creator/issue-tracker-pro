import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { BUG_STATUSES, BUG_PRIORITIES } from "./schema";

async function requireUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  return userId;
}

export const list = query({
  args: {
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assigneeId: v.optional(v.id("users")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bugs = await ctx.db.query("bugs").order("desc").collect();

    if (args.status) {
      bugs = bugs.filter((b) => b.status === args.status);
    }
    if (args.priority) {
      bugs = bugs.filter((b) => b.priority === args.priority);
    }
    if (args.assigneeId) {
      bugs = bugs.filter((b) => b.assigneeId === args.assigneeId);
    }
    if (args.search) {
      const q = args.search.toLowerCase();
      bugs = bugs.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)),
      );
    }

    // Fetch assignee and reporter info
    const bugsWithUsers = await Promise.all(
      bugs.map(async (bug) => {
        const assignee = bug.assigneeId
          ? await ctx.db.get(bug.assigneeId)
          : null;
        const reporter = await ctx.db.get(bug.reporterId);
        return {
          ...bug,
          assignee: assignee
            ? { id: assignee._id, name: assignee.name, email: assignee.email }
            : null,
          reporter: reporter
            ? { id: reporter._id, name: reporter.name, email: reporter.email }
            : null,
        };
      }),
    );

    return bugsWithUsers;
  },
});

export const get = query({
  args: { bugId: v.id("bugs") },
  handler: async (ctx, args) => {
    const bug = await ctx.db.get(args.bugId);
    if (!bug) return null;

    const assignee = bug.assigneeId ? await ctx.db.get(bug.assigneeId) : null;
    const reporter = await ctx.db.get(bug.reporterId);

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_bug", (q) => q.eq("bugId", args.bugId))
      .order("asc")
      .collect();

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author: author
            ? { id: author._id, name: author.name, email: author.email }
            : null,
        };
      }),
    );

    return {
      ...bug,
      assignee: assignee
        ? { id: assignee._id, name: assignee.name, email: assignee.email }
        : null,
      reporter: reporter
        ? { id: reporter._id, name: reporter.name, email: reporter.email }
        : null,
      comments: commentsWithAuthors,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal(BUG_PRIORITIES.LOW),
      v.literal(BUG_PRIORITIES.MEDIUM),
      v.literal(BUG_PRIORITIES.HIGH),
      v.literal(BUG_PRIORITIES.CRITICAL),
    ),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const now = Date.now();

    return await ctx.db.insert("bugs", {
      title: args.title,
      description: args.description,
      status: BUG_STATUSES.OPEN,
      priority: args.priority,
      assigneeId: args.assigneeId,
      reporterId: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    bugId: v.id("bugs"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal(BUG_STATUSES.OPEN),
        v.literal(BUG_STATUSES.IN_PROGRESS),
        v.literal(BUG_STATUSES.RESOLVED),
        v.literal(BUG_STATUSES.CLOSED),
      ),
    ),
    priority: v.optional(
      v.union(
        v.literal(BUG_PRIORITIES.LOW),
        v.literal(BUG_PRIORITIES.MEDIUM),
        v.literal(BUG_PRIORITIES.HIGH),
        v.literal(BUG_PRIORITIES.CRITICAL),
      ),
    ),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const { bugId, ...updates } = args;

    const existing = await ctx.db.get(bugId);
    if (!existing) throw new Error("Bug not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.priority !== undefined) patch.priority = updates.priority;
    if (updates.assigneeId !== undefined) patch.assigneeId = updates.assigneeId;

    await ctx.db.patch(bugId, patch);
  },
});

export const remove = mutation({
  args: { bugId: v.id("bugs") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    await ctx.db.delete(args.bugId);
  },
});

export const stats = query({
  handler: async (ctx) => {
    const bugs = await ctx.db.query("bugs").collect();

    const total = bugs.length;
    const open = bugs.filter((b) => b.status === "open").length;
    const inProgress = bugs.filter((b) => b.status === "in_progress").length;
    const resolved = bugs.filter((b) => b.status === "resolved").length;
    const closed = bugs.filter((b) => b.status === "closed").length;
    const critical = bugs.filter((b) => b.priority === "critical").length;
    const high = bugs.filter((b) => b.priority === "high").length;

    return { total, open, inProgress, resolved, closed, critical, high };
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({ id: u._id, name: u.name, email: u.email }));
  },
});
