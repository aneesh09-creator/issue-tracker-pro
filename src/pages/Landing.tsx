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
    <div className="min-h-screen relative">
      <AnimatedBackground particleCount={55} />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/10 px-6 py-4 bg-black/30 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="nb-shadow-sm bg-[#FFE066] p-2">
              <Bug className="size-5 text-[#0a0a12]" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase text-white">BugHive</span>
          </div>
          <Button
            className="nb-btn bg-white/10 text-white border-white/20 rounded-none font-bold px-5 hover:bg-white/15"
            onClick={() => navigate("/auth")}
          >
            Sign In <ArrowRight className="size-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 border-b-2 border-[#1A1A1A]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="nb-shadow bg-[#FFE066] inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-widest mb-8">
              V1 — For Small Teams
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-8 text-white">
              Track bugs.
              <br />
              <span className="text-white/50">Ship fixes.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-lg mb-10 leading-relaxed">
              A minimal, fast bug tracker built for small dev teams.
              No complexity. Just clarity.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                className="nb-btn bg-[#FFE066] text-[#0a0a12] rounded-none font-bold px-8 py-5 text-base border-[#FFE066] hover:bg-[#FFE066]/90"
                onClick={() => navigate("/auth")}
              >
                Get Started Free <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="nb-btn rounded-none font-bold px-8 py-5 text-base bg-white/5 text-white border-white/15 hover:bg-white/10"
                onClick={() => navigate("/auth")}
              >
                See Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-b-2 border-[#1A1A1A]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FFE066]/70 mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Everything you need.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="nb-card p-6 bg-black/30 backdrop-blur-sm group hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(255,255,255,0.1)] transition-all duration-200"
              >
                <div className={`nb-shadow-sm ${f.color} p-2.5 inline-block mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="relative z-10 border-b border-white/10 bg-black/20">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7FBFFF]/70 mb-3">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Three steps to ship.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {workflow.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="nb-card bg-black/30 backdrop-blur-sm p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="nb-shadow-sm bg-white/10 w-9 h-9 flex items-center justify-center text-sm font-bold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step.icon}
                  <span className="font-bold text-lg text-white">{step.label}</span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-white">
              Start tracking now.
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Free for small teams. No credit card. No onboarding calls.
            </p>
            <Button
              className="nb-btn bg-[#FFE066] text-[#0a0a12] rounded-none font-bold px-10 py-5 text-base border-[#FFE066] hover:bg-[#FFE066]/90"
              onClick={() => navigate("/auth")}
            >
              Launch BugHive <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-6 bg-black/30 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="size-4 text-[#FFE066]" />
            <span className="text-sm font-bold uppercase text-white">BugHive</span>
          </div>
          <span className="text-xs text-white/40">
            Built for devs who ship.
          </span>
        </div>
      </footer>
    </div>
  );
}
