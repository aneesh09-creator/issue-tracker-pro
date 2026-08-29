import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Bug, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="nb-shadow bg-[#FFE066] inline-block p-4 mb-6">
          <Bug className="size-10" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          This page doesn't exist.
        </p>
        <Button
          className="nb-btn bg-[#1A1A1A] text-white rounded-none font-bold"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
}
