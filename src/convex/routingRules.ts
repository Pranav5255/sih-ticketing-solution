import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Initialize default routing rules
export const initializeRules = mutation({
  args: {},
  handler: async (ctx) => {
    const existingRules = await ctx.db.query("routingRules").collect();
    
    if (existingRules.length > 0) {
      return { message: "Routing rules already initialized" };
    }

    const rules = [
      {
        category: "Hardware Issues",
        keywords: ["laptop", "desktop", "printer", "monitor", "keyboard", "mouse", "hardware"],
        assignedTeam: "Infrastructure Team",
        escalationThreshold: 4,
        slaHours: 24,
      },
      {
        category: "Network Connectivity",
        keywords: ["vpn", "wifi", "internet", "connection", "network", "ethernet"],
        assignedTeam: "Network Team",
        escalationThreshold: 2,
        slaHours: 8,
      },
      {
        category: "Access Management",
        keywords: ["password", "login", "permissions", "account", "access", "reset"],
        assignedTeam: "IT Security Team",
        escalationThreshold: 1,
        slaHours: 4,
      },
      {
        category: "Software/Application Support",
        keywords: ["software", "application", "install", "update", "license", "app"],
        assignedTeam: "Application Team",
        escalationThreshold: 3,
        slaHours: 16,
      },
      {
        category: "Email/Communication Tools",
        keywords: ["email", "outlook", "teams", "communication", "mail"],
        assignedTeam: "Communication Team",
        escalationThreshold: 2,
        slaHours: 12,
      },
    ];

    for (const rule of rules) {
      await ctx.db.insert("routingRules", rule);
    }

    return { message: "Routing rules initialized successfully", count: rules.length };
  },
});

// Get all routing rules
export const getAllRules = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("routingRules").collect();
  },
});

// Get rule by category
export const getRuleByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("routingRules")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .first();
  },
});
