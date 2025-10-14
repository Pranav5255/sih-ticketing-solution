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

    // Get routing rule
    const rule = await ctx.db
      .query("routingRules")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .first();

    // Calculate SLA deadline
    const slaHours = rule?.slaHours || 24;
    const slaDeadline = Date.now() + (slaHours * 60 * 60 * 1000);

    const ticketId = await ctx.db.insert("tickets", {
      source: args.source,
      userId: user._id,
      senderEmail: user.email,
      subject: args.subject,
      description: args.description,
      status: "open",
      priority: args.priority,
      category: args.category,
      assignedTeam: rule?.assignedTeam || "General IT Support",
      slaDeadline,
    });

    // Create history entry
    await ctx.db.insert("ticketHistory", {
      ticketId,
      userId: user._id,
      action: "created",
      newValue: "open",
      notes: `Ticket created via ${args.source}`,
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
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    notes: v.optional(v.string()),
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

    // Create history entry
    await ctx.db.insert("ticketHistory", {
      ticketId: args.ticketId,
      userId: user._id,
      action: "status_changed",
      oldValue: ticket.status,
      newValue: args.status,
      notes: args.notes,
    });

    return { success: true };
  },
});

// Update ticket assignment
export const updateAssignment = mutation({
  args: {
    ticketId: v.id("tickets"),
    assignedTeam: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    await ctx.db.patch(args.ticketId, {
      assignedTeam: args.assignedTeam,
      status: "assigned",
    });

    // Create history entry
    await ctx.db.insert("ticketHistory", {
      ticketId: args.ticketId,
      userId: user._id,
      action: "reassigned",
      oldValue: ticket.assignedTeam,
      newValue: args.assignedTeam,
      notes: args.notes,
    });

    return { success: true };
  },
});

// Add resolution notes
export const addResolutionNotes = mutation({
  args: {
    ticketId: v.id("tickets"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    await ctx.db.patch(args.ticketId, {
      resolutionNotes: args.notes,
    });

    // Create history entry
    await ctx.db.insert("ticketHistory", {
      ticketId: args.ticketId,
      userId: user._id,
      action: "notes_added",
      notes: "Resolution notes added",
    });

    return { success: true };
  },
});

// Get ticket history
export const getTicketHistory = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("ticketHistory")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .order("desc")
      .collect();

    // Fetch user details for each history entry
    const historyWithUsers = await Promise.all(
      history.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        return {
          ...entry,
          userName: user?.name || user?.email || "Unknown",
        };
      })
    );

    return historyWithUsers;
  },
});

// Get all tickets (admin only) with enhanced filtering
export const getAllTickets = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("resolved"),
        v.literal("closed")
      )
    ),
    source: v.optional(
      v.union(
        v.literal("chatbot"),
        v.literal("email"),
        v.literal("glpi"),
        v.literal("solman")
      )
    ),
    team: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical")
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    let tickets = await ctx.db.query("tickets").order("desc").collect();

    // Apply filters
    if (args.status) {
      tickets = tickets.filter((t) => t.status === args.status);
    }
    if (args.source) {
      tickets = tickets.filter((t) => t.source === args.source);
    }
    if (args.team) {
      tickets = tickets.filter((t) => t.assignedTeam === args.team);
    }
    if (args.priority) {
      tickets = tickets.filter((t) => t.priority === args.priority);
    }

    return tickets;
  },
});

// Get ticket analytics
export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const allTickets = await ctx.db.query("tickets").collect();

    const totalTickets = allTickets.length;
    const openTickets = allTickets.filter((t) => t.status === "open").length;
    const resolvedTickets = allTickets.filter((t) => t.status === "resolved").length;
    const closedTickets = allTickets.filter((t) => t.status === "closed").length;

    // Calculate average resolution time
    const resolvedWithTime = allTickets.filter((t) => t.resolvedAt && t._creationTime);
    const avgResolutionTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, t) => sum + (t.resolvedAt! - t._creationTime), 0) / resolvedWithTime.length
      : 0;

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    allTickets.forEach((t) => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    // Team workload
    const teamWorkload: Record<string, number> = {};
    allTickets.filter((t) => t.status !== "closed" && t.status !== "resolved").forEach((t) => {
      if (t.assignedTeam) {
        teamWorkload[t.assignedTeam] = (teamWorkload[t.assignedTeam] || 0) + 1;
      }
    });

    // SLA compliance
    const now = Date.now();
    const ticketsWithSLA = allTickets.filter((t) => t.slaDeadline);
    const slaCompliant = ticketsWithSLA.filter((t) => {
      if (t.status === "resolved" || t.status === "closed") {
        return (t.resolvedAt || t.closedAt || 0) <= (t.slaDeadline || 0);
      }
      return now <= (t.slaDeadline || 0);
    }).length;
    const slaComplianceRate = ticketsWithSLA.length > 0
      ? (slaCompliant / ticketsWithSLA.length) * 100
      : 100;

    // Sentiment distribution
    const sentimentTickets = allTickets.filter((t) => t.sentimentScore !== undefined);
    const avgSentiment = sentimentTickets.length > 0
      ? sentimentTickets.reduce((sum, t) => sum + (t.sentimentScore || 0), 0) / sentimentTickets.length
      : 0;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      closedTickets,
      avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60 * 60)), // Convert to hours
      categoryBreakdown: categoryCount,
      teamWorkload,
      slaComplianceRate: Math.round(slaComplianceRate),
      avgSentiment: Math.round(avgSentiment * 100) / 100,
    };
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