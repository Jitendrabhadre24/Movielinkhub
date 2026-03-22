"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, ShieldCheck, PlayCircle, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({ isOpen, onOpenChange }: SubscriptionModalProps) {
  const [spotsLeft, setSpotsLeft] = useState(7);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Subtle urgency simulation
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setSpotsLeft((prev) => (prev > 2 ? prev - 1 : prev));
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleFreeStart = () => {
    setIsRedirecting(true);
    // Secure verification simulation before redirect to boost perceived value
    setTimeout(() => {
      window.location.href = "https://gameflashx.space/sl/o1m5r";
    }, 2200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0B0B0B] border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="p-8 md:p-12 space-y-10 relative">
          {/* SECURE LOADING OVERLAY */}
          {isRedirecting && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/10 rounded-full animate-spin border-t-primary shadow-[0_0_30px_rgba(255,215,0,0.2)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-10 w-10 text-primary animate-pulse fill-primary" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter glow-text-primary">SECURE VERIFICATION</h2>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">CONNECTING TO GLOBAL CONTENT SERVER...</p>
                  <p className="text-[9px] font-mono text-primary/60 uppercase">ENCRYPTING ACCESS TOKEN: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
              </div>
            </div>
          )}

          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-fit bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary fill-primary" />
              <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">MEMBER EXCLUSIVE</span>
            </div>
            <DialogTitle className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
              CHOOSE YOUR <span className="gold-gradient-text">PLAN</span>
            </DialogTitle>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">Select access level to continue streaming</p>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-8 relative items-center">
            {/* Premium Plan (Price Anchor - Dimmed to push towards Free) */}
            <div className="group relative bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6 transition-all duration-500 hover:bg-white/[0.07] order-2 md:order-1 opacity-50 hover:opacity-100">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">DIAMOND ELITE</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$19.99</span>
                  <span className="text-xs font-black text-white/30 uppercase tracking-widest">/ MONTH</span>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  { icon: Zap, text: "Ultra HD Streaming" },
                  { icon: ShieldCheck, text: "Zero Advertisements" },
                  { icon: PlayCircle, text: "Global Servers" }
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-white/60">
                    <feature.icon className="h-4 w-4 text-white/20" />
                    <span className="uppercase tracking-tighter">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full h-12 border-white/10 hover:border-white/30 text-white/40 hover:text-white rounded-xl font-black uppercase tracking-tighter italic">
                Subscribe Now
              </Button>
            </div>

            {/* Free Plan (Primary Focus - Highlighted) */}
            <div className="relative z-10 bg-primary/5 border-2 border-primary/40 p-10 rounded-[2.5rem] space-y-8 shadow-[0_0_50px_rgba(255,215,0,0.15)] transform md:scale-110 transition-all duration-500 hover:shadow-[0_0_70px_rgba(255,215,0,0.25)] order-1 md:order-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse whitespace-nowrap">
                ⚡ LIMITED TIME OFFER
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-primary uppercase italic tracking-tighter glow-text-primary leading-none">START FREE</h3>
                <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Sponsored Access Mode</p>
              </div>

              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                  <p className="text-[11px] font-black text-primary uppercase tracking-widest leading-relaxed">
                    NO CREDIT CARD REQUIRED<br/>
                    UNLIMITED 24H ACCESS
                  </p>
                </div>
                
                <div className="text-center space-y-1">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">HURRY: ONLY {spotsLeft} SPOTS LEFT</p>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse transition-all duration-1000" style={{ width: `${(spotsLeft/10)*100}%` }} />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleFreeStart}
                disabled={isRedirecting}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-black rounded-[1.25rem] font-black text-lg uppercase tracking-tighter italic glow-primary transform hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.3)]"
              >
                {isRedirecting ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : (
                  "⚡ START FREE NOW"
                )}
              </Button>
            </div>
          </div>

          <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-[0.4em] pb-2">
            SECURE ENCRYPTED VERIFICATION REQUIRED
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
