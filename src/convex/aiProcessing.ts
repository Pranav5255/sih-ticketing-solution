"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Analyze email content with AI
export const analyzeEmailContent = action({
  args: {
    subject: v.string(),
    body: v.string(),
    senderEmail: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Sentiment analysis (-1.0 to 1.0)
      const sentiment = analyzeSentiment(args.subject + " " + args.body);
      
      // Category classification
      const category = await classifyCategory(args.subject, args.body);
      
      // Priority determination
      const priority = determinePriority(sentiment, category, args.subject);
      
      // Extract entities
      const entities = extractEntities(args.body);
      
      return {
        sentiment,
        category,
        priority,
        entities,
      };
    } catch (error) {
      console.error("AI processing error:", error);
      return {
        sentiment: 0,
        category: "Other",
        priority: "medium" as const,
        entities: [],
      };
    }
  },
});

// Add a local analysis helper to avoid calling an action from another action and break circular types
type Analysis = {
  sentiment: number;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  entities: string[];
};

async function analyzeEmailLocal(subject: string, body: string): Promise<Analysis> {
  const sentiment = analyzeSentiment(subject + " " + body);
  const category = await classifyCategory(subject, body);
  const priority = determinePriority(sentiment, category, subject);
  const entities = extractEntities(body);
  return { sentiment, category, priority, entities };
}

// Sentiment analysis function
function analyzeSentiment(text: string): number {
  const lowerText = text.toLowerCase();
  
  // Urgent/frustrated keywords
  const urgentKeywords = ["urgent", "critical", "emergency", "asap", "immediately", "frustrated", "angry", "broken", "down", "not working"];
  const calmKeywords = ["please", "thank", "kindly", "appreciate", "help", "question"];
  
  let score = 0;
  
  urgentKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) score -= 0.15;
  });
  
  calmKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) score += 0.1;
  });
  
  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, score));
}

// Category classification
async function classifyCategory(subject: string, body: string): Promise<string> {
  const text = (subject + " " + body).toLowerCase();
  
  const categoryKeywords: Record<string, string[]> = {
    "Hardware Issues": ["laptop", "desktop", "printer", "monitor", "keyboard", "mouse", "hardware", "device"],
    "Network Connectivity": ["vpn", "wifi", "internet", "connection", "network", "ethernet", "router"],
    "Access Management": ["password", "login", "permissions", "account", "access", "reset", "locked"],
    "Software/Application Support": ["software", "application", "install", "update", "license", "app", "program"],
    "Email/Communication Tools": ["email", "outlook", "teams", "communication", "mail", "calendar"],
  };
  
  let maxMatches = 0;
  let bestCategory = "Other";
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

// Priority determination
function determinePriority(sentiment: number, category: string, subject: string): "low" | "medium" | "high" | "critical" {
  const subjectLower = subject.toLowerCase();
  
  // Critical keywords
  if (subjectLower.includes("critical") || subjectLower.includes("emergency") || subjectLower.includes("urgent")) {
    return "critical";
  }
  
  // High priority based on sentiment
  if (sentiment < -0.3) {
    return "high";
  }
  
  // High priority categories
  if (category === "Network Connectivity" || category === "Access Management") {
    return "high";
  }
  
  // Medium priority based on sentiment
  if (sentiment < 0) {
    return "medium";
  }
  
  return "low";
}

// Extract entities from text
function extractEntities(text: string): string[] {
  const entities: string[] = [];
  
  // Employee ID pattern (e.g., EMP12345)
  const empIdMatch = text.match(/EMP\d{5}/gi);
  if (empIdMatch) entities.push(...empIdMatch);
  
  // Asset number pattern (e.g., AST-12345)
  const assetMatch = text.match(/AST-\d{5}/gi);
  if (assetMatch) entities.push(...assetMatch);
  
  // Error code pattern (e.g., ERR-500)
  const errorMatch = text.match(/ERR-\d{3}/gi);
  if (errorMatch) entities.push(...errorMatch);
  
  return entities;
}

// Process incoming email and create ticket
export const processEmail = action({
  args: {
    senderEmail: v.string(),
    senderName: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // AI analysis (local)
      const analysis: Analysis = await analyzeEmailLocal(args.subject, args.body);

      // Find or create user
      const userId: Id<"users"> = await ctx.runMutation(internal.emailTickets.findOrCreateUser, {
        email: args.senderEmail,
        name: args.senderName,
      });

      // Create ticket
      const ticketId: Id<"tickets"> = await ctx.runMutation(internal.emailTickets.createEmailTicket, {
        userId,
        senderEmail: args.senderEmail,
        subject: args.subject,
        description: args.body,
        category: analysis.category,
        priority: analysis.priority,
        sentimentScore: analysis.sentiment,
      });

      // Send acknowledgment email (placeholder - would integrate with email service)
      console.log(`Acknowledgment email sent to ${args.senderEmail} for ticket ${ticketId}`);

      return {
        success: true,
        ticketId,
        analysis,
      };
    } catch (error) {
      console.error("Email processing error:", error);
      throw new Error("Failed to process email");
    }
  },
});