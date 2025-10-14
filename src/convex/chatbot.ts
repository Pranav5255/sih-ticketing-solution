import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Save chat message
export const sendMessage = mutation({
  args: {
    message: v.string(),
    ticketId: v.optional(v.id("tickets")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Save user message
    const messageId = await ctx.db.insert("chatMessages", {
      userId: user._id,
      message: args.message,
      isBot: false,
      ticketId: args.ticketId,
    });

    // Classify intent and generate response
    const { intent, response, category, priority } = classifyIntent(
      args.message
    );

    // Save bot response
    await ctx.db.insert("chatMessages", {
      userId: user._id,
      message: response,
      isBot: true,
      intent,
      ticketId: args.ticketId,
    });

    return {
      messageId,
      intent,
      response,
      category,
      priority,
      requiresTicket: !isSelfServiceable(intent),
    };
  },
});

// Get chat history for user
export const getChatHistory = query({
  args: {
    ticketId: v.optional(v.id("tickets")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    let messagesQuery = ctx.db.query("chatMessages").withIndex("by_user", (q) =>
      q.eq("userId", user._id)
    );

    if (args.ticketId) {
      messagesQuery = ctx.db
        .query("chatMessages")
        .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId));
    }

    const messages = await messagesQuery.order("asc").collect();

    return messages;
  },
});

// Intent classification logic
function classifyIntent(message: string): {
  intent: string;
  response: string;
  category: string;
  priority: string;
} {
  const lowerMessage = message.toLowerCase();

  // Password reset
  if (
    lowerMessage.includes("password") &&
    (lowerMessage.includes("reset") ||
      lowerMessage.includes("forgot") ||
      lowerMessage.includes("change"))
  ) {
    return {
      intent: "password_reset",
      response:
        "I can help you reset your password. Please follow these steps:\n\n1. Go to https://password.powergrid.com\n2. Click 'Forgot Password'\n3. Enter your employee ID\n4. Check your email for reset link\n\nIf you still need help, I can create a ticket for the IT Security Team.",
      category: "Access Management",
      priority: "medium",
    };
  }

  // VPN access
  if (
    lowerMessage.includes("vpn") ||
    (lowerMessage.includes("remote") && lowerMessage.includes("access"))
  ) {
    return {
      intent: "vpn_access",
      response:
        "For VPN access issues:\n\n1. Ensure you have the latest VPN client installed\n2. Check your internet connection\n3. Verify your credentials\n4. Try disconnecting and reconnecting\n\nVPN Setup Guide: https://vpn.powergrid.com/setup\n\nShould I create a ticket for the Network Team?",
      category: "Network Connectivity",
      priority: "high",
    };
  }

  // Software installation
  if (
    lowerMessage.includes("install") ||
    lowerMessage.includes("software") ||
    lowerMessage.includes("application")
  ) {
    return {
      intent: "software_installation",
      response:
        "For software installation:\n\n1. Visit the Software Center: https://apps.powergrid.com\n2. Search for the application you need\n3. Click 'Install' and follow prompts\n\nIf the software isn't available or you need special access, I can create a ticket for the Application Team.",
      category: "Software/Application Support",
      priority: "low",
    };
  }

  // Hardware issues
  if (
    lowerMessage.includes("hardware") ||
    lowerMessage.includes("laptop") ||
    lowerMessage.includes("desktop") ||
    lowerMessage.includes("monitor") ||
    lowerMessage.includes("keyboard") ||
    lowerMessage.includes("mouse")
  ) {
    return {
      intent: "hardware_issue",
      response:
        "I understand you're experiencing a hardware issue. To help you better, please provide:\n\n- Device type (laptop/desktop/peripheral)\n- Asset ID (if available)\n- Description of the problem\n\nI'll create a ticket for the Infrastructure Team to assist you.",
      category: "Hardware Issues",
      priority: "medium",
    };
  }

  // Network connectivity
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("internet") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("wifi")
  ) {
    return {
      intent: "network_issue",
      response:
        "For network connectivity issues:\n\n1. Check if your ethernet cable is connected\n2. Try restarting your router\n3. Forget and reconnect to WiFi\n4. Run network diagnostics\n\nIf the issue persists, I'll create a ticket for the Network Team.",
      category: "Network Connectivity",
      priority: "high",
    };
  }

  // Email issues
  if (
    lowerMessage.includes("email") ||
    lowerMessage.includes("outlook") ||
    lowerMessage.includes("mail")
  ) {
    return {
      intent: "email_issue",
      response:
        "For email issues:\n\n1. Check your internet connection\n2. Restart Outlook\n3. Clear cache and cookies\n4. Verify mailbox isn't full\n\nI can create a ticket for the Communication Team if needed.",
      category: "Email/Communication Tools",
      priority: "medium",
    };
  }

  // Default response
  return {
    intent: "general_inquiry",
    response:
      "I'm here to help with IT support. I can assist with:\n\n• Password resets\n• VPN access\n• Software installation\n• Hardware issues\n• Network connectivity\n• Email problems\n\nPlease describe your issue, and I'll either provide immediate help or create a ticket for the appropriate team.",
    category: "Other",
    priority: "medium",
  };
}

// Check if intent can be self-serviced
function isSelfServiceable(intent: string): boolean {
  const selfServiceIntents = [
    "password_reset",
    "vpn_access",
    "software_installation",
  ];
  return selfServiceIntents.includes(intent);
}
