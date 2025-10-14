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

// Ticket source types
export const TICKET_SOURCES = {
  CHATBOT: "chatbot",
  EMAIL: "email",
  GLPI: "glpi",
  SOLMAN: "solman",
} as const;

export const ticketSourceValidator = v.union(
  v.literal(TICKET_SOURCES.CHATBOT),
  v.literal(TICKET_SOURCES.EMAIL),
  v.literal(TICKET_SOURCES.GLPI),
  v.literal(TICKET_SOURCES.SOLMAN),
);

// Ticket status types
export const TICKET_STATUS = {
  OPEN: "open",
  ASSIGNED: "assigned",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export const ticketStatusValidator = v.union(
  v.literal(TICKET_STATUS.OPEN),
  v.literal(TICKET_STATUS.ASSIGNED),
  v.literal(TICKET_STATUS.RESOLVED),
  v.literal(TICKET_STATUS.CLOSED),
);

// Ticket priority types
export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export const ticketPriorityValidator = v.union(
  v.literal(TICKET_PRIORITY.LOW),
  v.literal(TICKET_PRIORITY.MEDIUM),
  v.literal(TICKET_PRIORITY.HIGH),
  v.literal(TICKET_PRIORITY.CRITICAL),
);

// Ticket categories
export const TICKET_CATEGORIES = {
  HARDWARE: "Hardware Issues",
  SOFTWARE: "Software/Application Support",
  NETWORK: "Network Connectivity",
  ACCESS: "Access Management",
  EMAIL: "Email/Communication Tools",
  OTHER: "Other",
} as const;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      department: v.optional(v.string()),
      employeeId: v.optional(v.string()),
    }).index("email", ["email"]),

    tickets: defineTable({
      source: ticketSourceValidator,
      userId: v.id("users"),
      subject: v.string(),
      description: v.string(),
      status: ticketStatusValidator,
      priority: ticketPriorityValidator,
      category: v.string(),
      assignedTeam: v.optional(v.string()),
      resolvedAt: v.optional(v.number()),
      closedAt: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_priority", ["priority"])
      .index("by_team", ["assignedTeam"]),

    chatMessages: defineTable({
      ticketId: v.optional(v.id("tickets")),
      userId: v.id("users"),
      message: v.string(),
      isBot: v.boolean(),
      intent: v.optional(v.string()),
      entities: v.optional(v.array(v.string())),
    })
      .index("by_ticket", ["ticketId"])
      .index("by_user", ["userId"]),

    teams: defineTable({
      name: v.string(),
      category: v.string(),
      description: v.string(),
      email: v.optional(v.string()),
    }).index("by_category", ["category"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;