import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all teams
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    return teams;
  },
});

// Initialize default teams
export const initializeTeams = mutation({
  args: {},
  handler: async (ctx) => {
    const existingTeams = await ctx.db.query("teams").collect();
    
    if (existingTeams.length > 0) {
      return { message: "Teams already initialized" };
    }

    const teams = [
      {
        name: "IT Security Team",
        category: "Access Management",
        description: "Handles password resets, access requests, and security issues",
        email: "security@powergrid.com",
      },
      {
        name: "Infrastructure Team",
        category: "Hardware Issues",
        description: "Manages hardware repairs, replacements, and maintenance",
        email: "infrastructure@powergrid.com",
      },
      {
        name: "Network Team",
        category: "Network Connectivity",
        description: "Resolves network, VPN, and connectivity issues",
        email: "network@powergrid.com",
      },
      {
        name: "Application Team",
        category: "Software/Application Support",
        description: "Supports software installation and application issues",
        email: "applications@powergrid.com",
      },
      {
        name: "Communication Team",
        category: "Email/Communication Tools",
        description: "Handles email and communication tool problems",
        email: "communications@powergrid.com",
      },
      {
        name: "General IT Support",
        category: "Other",
        description: "General IT support for miscellaneous issues",
        email: "support@powergrid.com",
      },
    ];

    for (const team of teams) {
      await ctx.db.insert("teams", team);
    }

    return { message: "Teams initialized successfully" };
  },
});
