import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Create a new ticket
export const create = mutation({
  args: {
    source: v.union(
      v.literal("chatbot"),
      v.literal("email"),
      v.literal("glpi"),
      v.literal("solman")
    ),
    subject: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Route ticket to appropriate team
    const routing = routeTicket(args.category, args.priority);

    const ticketId = await ctx.db.insert("tickets", {
      source: args.source,
      userId: user._id,
      subject: args.subject,
      description: args.description,
      status: "open",
      priority: args.priority,
      category: args.category,
      assignedTeam: routing.team,
    });

    return ticketId;
  },
});

// Get all tickets for current user
export const getUserTickets = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return tickets;
  },
});

// Get ticket by ID
export const getById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const ticket = await ctx.db.get(args.ticketId);
    
    if (!ticket) {
      return null;
    }

    // Check if user owns the ticket or is admin
    if (ticket.userId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return ticket;
  },
});

// Update ticket status
export const updateStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(
      v.literal("open"),
      v.literal("assigned"),
      v.literal("resolved"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const updateData: any = { status: args.status };

    if (args.status === "resolved") {
      updateData.resolvedAt = Date.now();
    } else if (args.status === "closed") {
      updateData.closedAt = Date.now();
    }

    await ctx.db.patch(args.ticketId, updateData);

    return { success: true };
  },
});

// Get all tickets (admin only)
export const getAllTickets = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("assigned"),
        v.literal("resolved"),
        v.literal("closed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (args.status) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
      return tickets;
    }

    const tickets = await ctx.db.query("tickets").order("desc").collect();
    return tickets;
  },
});

// Intelligent routing function
function routeTicket(
  category: string,
  priority: string
): { team: string; priority: string } {
  if (category === "Access Management" && priority === "high") {
    return { team: "IT Security Team", priority: "high" };
  } else if (category === "Hardware Issues") {
    return { team: "Infrastructure Team", priority };
  } else if (category === "Network Connectivity") {
    return { team: "Network Team", priority };
  } else if (category === "Software/Application Support") {
    return { team: "Application Team", priority };
  } else if (category === "Email/Communication Tools") {
    return { team: "Communication Team", priority };
  }
  return { team: "General IT Support", priority: "medium" };
}
