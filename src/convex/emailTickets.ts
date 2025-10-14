import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Find or create user from email
export const findOrCreateUser = internalMutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingUser) {
      return existingUser._id;
    }
    
    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name || args.email.split("@")[0],
      role: "user",
    });
    
    return userId;
  },
});

// Create ticket from email
export const createEmailTicket = internalMutation({
  args: {
    userId: v.id("users"),
    senderEmail: v.string(),
    subject: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    sentimentScore: v.number(),
  },
  handler: async (ctx, args) => {
    // Get routing rule for category
    const rule = await ctx.db
      .query("routingRules")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .first();
    
    // Calculate SLA deadline
    const slaHours = rule?.slaHours || 24;
    const slaDeadline = Date.now() + (slaHours * 60 * 60 * 1000);
    
    // Create ticket
    const ticketId = await ctx.db.insert("tickets", {
      source: "email",
      userId: args.userId,
      senderEmail: args.senderEmail,
      subject: args.subject,
      description: args.description,
      status: "open",
      priority: args.priority,
      category: args.category,
      assignedTeam: rule?.assignedTeam || "General IT Support",
      sentimentScore: args.sentimentScore,
      slaDeadline,
    });
    
    // Create history entry
    await ctx.db.insert("ticketHistory", {
      ticketId,
      userId: args.userId,
      action: "created",
      newValue: "open",
      notes: `Ticket created from email: ${args.senderEmail}`,
    });
    
    return ticketId;
  },
});
