import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  LogOut,
  Loader2,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sourceFilter, setSourceFilter] = useState<string | undefined>(undefined);
  const [teamFilter, setTeamFilter] = useState<string | undefined>(undefined);

  const tickets = useQuery(api.tickets.getAllTickets, {
    status: statusFilter as any,
    source: sourceFilter as any,
    team: teamFilter,
  });
  
  const analytics = useQuery(api.tickets.getAnalytics);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const categoryData = analytics?.categoryBreakdown
    ? Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const teamData = analytics?.teamWorkload
    ? Object.entries(analytics.teamWorkload).map(([name, value]) => ({
        name: name.replace(" Team", ""),
        value,
      }))
    : [];

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
            <div>
              <span className="text-xl font-bold tracking-tight">POWERGRID</span>
              <Badge className="ml-3" variant="secondary">Admin</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              User View
            </Button>
            <span className="text-sm text-muted-foreground">
              {user.email || user.name || "Admin"}
            </span>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
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
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Unified view of all support tickets and analytics
            </p>
          </div>

          {/* Analytics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalTickets || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.openTickets || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Needs attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.avgResolutionTime || 0}h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.slaComplianceRate || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  On-time resolution
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Team Workload</CardTitle>
              </CardHeader>
              <CardContent>
                {teamData.length > 0 ? (
                  <ChartContainer
                    config={{
                      value: { label: "Tickets", color: "#3b82f6" },
                    }}
                  >
                    <BarChart data={teamData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ChartContainer
                    config={{
                      value: { label: "Tickets" },
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="chatbot">Chatbot</SelectItem>
                    <SelectItem value="glpi">GLPI</SelectItem>
                    <SelectItem value="solman">Solman</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={teamFilter} onValueChange={(v) => setTeamFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="Infrastructure Team">Infrastructure</SelectItem>
                    <SelectItem value="Network Team">Network</SelectItem>
                    <SelectItem value="IT Security Team">Security</SelectItem>
                    <SelectItem value="Application Team">Application</SelectItem>
                    <SelectItem value="Communication Team">Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>All Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {!tickets ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No tickets found
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <AdminTicketCard key={ticket._id} ticket={ticket} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function AdminTicketCard({ ticket }: { ticket: any }) {
  const navigate = useNavigate();

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-800",
    assigned: "bg-purple-100 text-purple-800",
    in_progress: "bg-indigo-100 text-indigo-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const sourceIcons = {
    email: <Mail className="h-4 w-4" />,
    chatbot: <MessageSquare className="h-4 w-4" />,
    glpi: <BarChart3 className="h-4 w-4" />,
    solman: <BarChart3 className="h-4 w-4" />,
  };

  const isOverdue = ticket.slaDeadline && Date.now() > ticket.slaDeadline && ticket.status !== "resolved" && ticket.status !== "closed";

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => navigate(`/tickets/${ticket._id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                {ticket.priority.toUpperCase()}
              </Badge>
              <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                {ticket.status.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {sourceIcons[ticket.source as keyof typeof sourceIcons]}
                {ticket.source}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive">OVERDUE</Badge>
              )}
            </div>
            <h3 className="font-bold text-lg">{ticket.subject}</h3>
          </div>
        </div>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {ticket.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{ticket.category}</span>
            <span className="text-muted-foreground">{ticket.assignedTeam}</span>
            {ticket.sentimentScore !== undefined && (
              <Badge variant="outline">
                Sentiment: {ticket.sentimentScore > 0 ? "😊" : ticket.sentimentScore < -0.3 ? "😠" : "😐"}
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground">
            {new Date(ticket._creationTime).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
