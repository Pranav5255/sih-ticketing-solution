import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Loader2, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Chat() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.chatbot.getChatHistory, {});
  const sendMessage = useMutation(api.chatbot.sendMessage);
  const createTicket = useMutation(api.tickets.create);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setIsTyping(true);

    try {
      const response = await sendMessage({ message: userMessage });

      if (response.requiresTicket) {
        // Ask if user wants to create a ticket
        setTimeout(() => {
          setIsTyping(false);
        }, 500);
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setIsTyping(false);
    }
  };

  const handleCreateTicket = async (category: string, priority: string) => {
    try {
      const lastUserMessage = messages
        ?.filter((m) => !m.isBot)
        .slice(-1)[0]?.message;

      if (!lastUserMessage) {
        toast.error("No message to create ticket from");
        return;
      }

      const ticketId = await createTicket({
        source: "chatbot",
        subject: lastUserMessage.substring(0, 100),
        description: lastUserMessage,
        category,
        priority: priority as any,
      });

      toast.success("Ticket created successfully!");
      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">AI Assistant</span>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Chat with Support</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6" ref={scrollRef}>
                <div className="space-y-6 py-6">
                  {/* Welcome Message */}
                  {(!messages || messages.length === 0) && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm">
                            Hello! I'm your IT support assistant. I can help you with:
                          </p>
                          <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                            <li>Password resets</li>
                            <li>VPN access issues</li>
                            <li>Software installation</li>
                            <li>Hardware problems</li>
                            <li>Network connectivity</li>
                            <li>Email issues</li>
                          </ul>
                          <p className="text-sm mt-2">
                            How can I assist you today?
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {messages?.map((msg, index) => (
                    <div key={msg._id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            msg.isBot
                              ? "bg-primary/10"
                              : "bg-secondary"
                          }`}
                        >
                          {msg.isBot ? (
                            <Bot className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div
                          className={`rounded-lg p-4 ${
                            msg.isBot ? "bg-muted" : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-100" />
                            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-6">
                <div className="flex gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isTyping}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
