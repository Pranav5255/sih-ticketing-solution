import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Ticket,
  Loader2,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const navigate = useNavigate();
  const tickets = useQuery(api.tickets.getUserTickets);
  const user = useQuery(api.users.currentUser);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const openTickets = tickets?.filter((t) => t.status === "open") || [];
  const assignedTickets = tickets?.filter((t) => t.status === "assigned") || [];
  const resolvedTickets = tickets?.filter((t) => t.status === "resolved") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="POWERGRID"
              className="h-10 w-10 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <span className="text-xl font-bold tracking-tight">POWERGRID</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email || user.name || "User"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Welcome back, {user.name || "User"}
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your IT support tickets and get instant help
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate("/chat")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6" />
                  Start Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get instant help from our AI assistant
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate("/tickets/new")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Plus className="h-6 w-6" />
                  Create Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Submit a new support request
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tickets Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Ticket className="h-6 w-6" />
                Your Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="open" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="open">
                    Open ({openTickets.length})
                  </TabsTrigger>
                  <TabsTrigger value="assigned">
                    Assigned ({assignedTickets.length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved">
                    Resolved ({resolvedTickets.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="open">
                  {openTickets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No open tickets
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {openTickets.map((ticket) => (
                        <TicketCard key={ticket._id} ticket={ticket} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="assigned">
                  {assignedTickets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No assigned tickets
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assignedTickets.map((ticket) => (
                        <TicketCard key={ticket._id} ticket={ticket} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="resolved">
                  {resolvedTickets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No resolved tickets
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {resolvedTickets.map((ticket) => (
                        <TicketCard key={ticket._id} ticket={ticket} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: any }) {
  const navigate = useNavigate();

  const priorityColors = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-orange-600",
    critical: "text-red-600",
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => navigate(`/tickets/${ticket._id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-lg">{ticket.subject}</h3>
          <span
            className={`text-sm font-medium ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}
          >
            {ticket.priority.toUpperCase()}
          </span>
        </div>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {ticket.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{ticket.category}</span>
          <span className="text-muted-foreground">
            {ticket.assignedTeam || "Unassigned"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}