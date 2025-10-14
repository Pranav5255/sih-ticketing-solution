import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Bot, Mail, Zap, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="POWERGRID" className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight">POWERGRID</span>
          </div>
          <Button onClick={() => navigate("/dashboard")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold tracking-tight mb-6">
            Unified IT Support Made Simple
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            One intelligent platform for all your IT support needs. No more
            juggling multiple portals. Get help instantly with AI-powered
            assistance.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/dashboard")}>
              Start Chatting
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
              View Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Bot,
              title: "AI-Powered Chatbot",
              description:
                "Intelligent assistant that understands your IT issues and provides instant solutions",
            },
            {
              icon: Mail,
              title: "Email Integration",
              description:
                "Send support requests via email and track them in one unified dashboard",
            },
            {
              icon: Zap,
              title: "Smart Routing",
              description:
                "Automatically routes tickets to the right team based on issue category and priority",
            },
            {
              icon: LayoutDashboard,
              title: "Unified Platform",
              description:
                "Consolidates GLPI, Solman, and email into a single seamless experience",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 border rounded-lg hover:border-primary transition-colors"
            >
              <feature.icon className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { stat: "85%", label: "Classification Accuracy" },
            { stat: "30%", label: "Self-Resolution Rate" },
            { stat: "<2s", label: "Response Time" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="text-5xl font-bold mb-2">{item.stat}</div>
              <div className="text-muted-foreground">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-primary/5 rounded-2xl p-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to simplify IT support?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join POWERGRID employees using our unified platform
          </p>
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Get Started Now
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-8 py-8 text-center text-muted-foreground">
          © 2024 POWERGRID. All rights reserved.
        </div>
      </footer>
    </div>
  );
}