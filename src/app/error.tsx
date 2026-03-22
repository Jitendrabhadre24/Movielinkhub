"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error centrally if needed
    console.error("PLATFORM_CRITICAL:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="p-8 bg-card/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] shadow-2xl space-y-6">
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/20">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              PIPELINE FAILURE
            </h1>
            <p className="text-white/40 text-sm font-medium">
              We encountered a critical error while streaming data. This might be due to a connection issue or permission constraints.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-left">
            <p className="text-[10px] font-mono text-primary/60 uppercase tracking-widest mb-1">Error Signature:</p>
            <p className="text-[11px] font-mono text-white/30 line-clamp-2 break-all">
              {error.message || "Unknown cryptographic failure"}
            </p>
          </div>

          <Button 
            onClick={() => reset()}
            className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase italic tracking-tighter h-14 rounded-xl glow-primary"
          >
            <RefreshCcw className="mr-2 h-5 w-5" /> RESTART HUB
          </Button>
        </div>
      </div>
    </div>
  );
}
