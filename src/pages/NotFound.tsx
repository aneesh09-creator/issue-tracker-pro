import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Bug, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AnimatedBackground particleCount={30} />
      <div className="text-center relative z-10">
        <div className="nb-shadow bg-[#FFE066] inline-block p-4 mb-8">
          <Bug className="size-12" />
        </div>
        <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-3 text-white">404</h1>
        <p className="text-lg text-white/50 mb-8">
          This page doesn't exist.
        </p>
        <Button
          className="nb-btn bg-white/10 text-white rounded-none font-bold px-6 h-11 border-white/15 hover:bg-white/15"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
}
