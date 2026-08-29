import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const BUG_STATUSES = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export const BUG_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    bugs: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      status: v.union(
        v.literal(BUG_STATUSES.OPEN),
        v.literal(BUG_STATUSES.IN_PROGRESS),
        v.literal(BUG_STATUSES.RESOLVED),
        v.literal(BUG_STATUSES.CLOSED),
      ),
      priority: v.union(
        v.literal(BUG_PRIORITIES.LOW),
        v.literal(BUG_PRIORITIES.MEDIUM),
        v.literal(BUG_PRIORITIES.HIGH),
        v.literal(BUG_PRIORITIES.CRITICAL),
      ),
      assigneeId: v.optional(v.id("users")),
      reporterId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_priority", ["priority"])
      .index("by_assignee", ["assigneeId"])
      .index("by_reporter", ["reporterId"])
      .index("by_created", ["createdAt"]),

    comments: defineTable({
      bugId: v.id("bugs"),
      authorId: v.id("users"),
      content: v.string(),
      createdAt: v.number(),
    })
      .index("by_bug", ["bugId"])  
      .index("by_author", ["authorId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
