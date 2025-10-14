import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  Bot,
  Mail,
  MessageSquare,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const features = [
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
      icon: Shield,
      title: "Unified Platform",
      description:
        "Consolidates GLPI, Solman, and email into a single seamless experience",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="POWERGRID" className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight">POWERGRID</span>
          </div>
          <div className="flex items-center gap-4">
            {!isLoading && (
              <Button
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                variant="default"
                size="lg"
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-bold tracking-tight mb-8">
            Unified IT Support
            <br />
            <span className="text-muted-foreground">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            One intelligent platform for all your IT support needs. No more
            juggling multiple portals. Get help instantly with AI-powered
            assistance.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              size="lg"
              className="text-lg px-8 py-6"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Chatting
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              View Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-32 border-t">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-center mb-20">
            Everything you need in one place
          </h2>
          <div className="grid md:grid-cols-2 gap-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-8 py-32 border-t">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-16 text-center"
        >
          <div>
            <div className="text-5xl font-bold tracking-tight mb-4">85%</div>
            <div className="text-lg text-muted-foreground">
              Classification Accuracy
            </div>
          </div>
          <div>
            <div className="text-5xl font-bold tracking-tight mb-4">30%</div>
            <div className="text-lg text-muted-foreground">
              Self-Resolution Rate
            </div>
          </div>
          <div>
            <div className="text-5xl font-bold tracking-tight mb-4">&lt;2s</div>
            <div className="text-lg text-muted-foreground">Response Time</div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-32 border-t">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight mb-8">
            Ready to simplify IT support?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Join POWERGRID employees using our unified platform
          </p>
          <Button
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            size="lg"
            className="text-lg px-8 py-6"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-8 text-center text-muted-foreground">
          <p>© 2024 POWERGRID. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}