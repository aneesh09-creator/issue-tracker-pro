import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import {
  Bug,
  ArrowRight,
  Zap,
  BarChart3,
  Users,
  Shield,
  CheckCircle2,
  CircleDot,
  Circle,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: <Zap className="size-5" />,
    title: "Fast Tracking",
    description: "Create and update bugs in seconds. No bloat, no clutter.",
    color: "bg-[#FFE066]",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "Clear Status",
    description: "Open, In Progress, Resolved, Closed. See where things stand.",
    color: "bg-[#7FBFFF]",
  },
  {
    icon: <Users className="size-5" />,
    title: "Team Ready",
    description: "Assign bugs, track who reported what, collaborate with comments.",
    color: "bg-[#7FFF7F]",
  },
  {
    icon: <Shield className="size-5" />,
    title: "Secure",
    description: "Authenticated access. Your team's bugs stay private.",
    color: "bg-[#FF9F7F]",
  },
];

const workflow = [
  { icon: <CircleDot className="size-5 text-[#7FBFFF]" />, label: "Report", text: "File a bug with title, description, and priority" },
  { icon: <Clock className="size-5 text-[#FFE066]" />, label: "Assign", text: "Pick an owner and set the status" },
  { icon: <CheckCircle2 className="size-5 text-[#7FFF7F]" />, label: "Resolve", text: "Fix it, comment the details, mark it done" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] relative">
      <AnimatedBackground count={22} seed={42} />

      {/* Nav */}
      <nav className="border-b-2 border-[#1A1A1A] px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="nb-shadow-sm bg-[#FFE066] p-2">
              <Bug className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">BugHive</span>
          </div>
          <Button
            className="nb-btn bg-[#1A1A1A] text-white rounded-none font-bold px-5"
            onClick={() => navigate("/auth")}
          >
            Sign In <ArrowRight className="size-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b-2 border-[#1A1A1A]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="nb-shadow bg-[#FFE066] inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6">
              V1 — For Small Teams
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-6">
              Track bugs.
              <br />
              <span className="text-muted-foreground">Ship fixes.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed">
              A minimal, fast bug tracker built for small dev teams.
              No complexity. Just clarity.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                className="nb-btn bg-[#1A1A1A] text-white rounded-none font-bold px-6 py-5 text-base"
                onClick={() => navigate("/auth")}
              >
                Get Started Free <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b-2 border-[#1A1A1A]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold tracking-tight mb-10">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="nb-card p-5 bg-white"
              >
                <div className={`nb-shadow-sm ${f.color} p-2 inline-block mb-3`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-b-2 border-[#1A1A1A] bg-[#F0F0F0]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold tracking-tight mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {workflow.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="nb-card bg-white p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="nb-shadow-sm bg-white px-2 py-0.5 text-sm font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step.icon}
                  <span className="font-bold text-lg">{step.label}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Start tracking now.
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Free for small teams. No credit card. No onboarding calls.
            </p>
            <Button
              className="nb-btn bg-[#1A1A1A] text-white rounded-none font-bold px-8 py-5 text-base"
              onClick={() => navigate("/auth")}
            >
              Launch BugHive <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t-2 border-[#1A1A1A] px-6 py-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="size-4" />
            <span className="text-sm font-bold uppercase">BugHive</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Built for devs who ship.
          </span>
        </div>
      </footer>
    </div>
  );
}
