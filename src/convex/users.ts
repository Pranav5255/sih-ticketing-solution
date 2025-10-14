import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current user. For now, returns a mock user.
 * Replace this with your actual auth implementation later.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    // TODO: Replace with actual auth logic
    // For now, return a mock user for development
    const mockUser = await ctx.db.query("users").first();
    return mockUser;
  },
});

/**
 * Get user by ID
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  // TODO: Replace with actual auth logic
  // For now, return the first user for development
  const mockUser = await ctx.db.query("users").first();
  return mockUser;
};

/**
 * Create a test user for development
 */
export const createTestUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role || "user",
    });
    return userId;
  },
});