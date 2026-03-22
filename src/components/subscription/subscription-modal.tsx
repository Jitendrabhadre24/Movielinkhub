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
import { triggerAdsterraPopunder } from "@/lib/ad-service";

interface SubscriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({ isOpen, onOpenChange }: SubscriptionModalProps) {
  const [spotsLeft, setSpotsLeft] = useState(7);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
    triggerAdsterraPopunder();
    
    setTimeout(() => {
      window.location.href = "https://gameflashx.space/sl/o1m5r";
    }, 2500);
  };

  const handlePremiumStart = () => {
    triggerAdsterraPopunder();
    // In a real app, this would redirect to a stripe checkout
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl bg-[#0B0B0B] border-white/5 p-0 overflow-y-auto max-h-[90vh] sm:max-h-none sm:overflow-visible rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="p-6 sm:p-10 md:p-14 space-y-8 sm:space-y-12 relative">
          {isRedirecting && (
            <div className="absolute inset-0 z-50 bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center space-y-6 sm:space-y-10 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-primary/10 rounded-full animate-spin border-t-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-pulse fill-primary" />
                </div>
              </div>
              <div className="text-center space-y-4 px-6">
                <h2 className="text-xl sm:text-3xl font-black text-white uppercase italic tracking-tighter glow-text-primary">ESTABLISHING SECURE PIPELINE</h2>
                <div className="space-y-2">
                  <p className="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">OPTIMIZING GLOBAL CONTENT DELIVERY...</p>
                  <p className="text-[7px] sm:text-[9px] font-mono text-primary/60 uppercase">NODE: {Math.random().toString(36).substring(7).toUpperCase()} / ENCRYPTION: AES-256</p>
                </div>
              </div>
            </div>
          )}

          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-fit bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-primary fill-primary" />
              <span className="text-[8px] sm:text-[10px] font-black text-primary tracking-[0.2em] uppercase">VERIFIED ACCESS</span>
            </div>
            <DialogTitle className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
              SECURE YOUR <span className="gold-gradient-text">MEMBERSHIP</span>
            </DialogTitle>
            <p className="text-white/40 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em]">Select your streaming tier to unlock archives</p>
          </DialogHeader>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 relative items-center">
            {/* Standard Tier */}
            <div className="group relative bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] space-y-6 transition-all duration-500 opacity-60 hover:opacity-100 hover:bg-white/[0.07] order-2 lg:order-1">
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tighter">DIAMOND PREVIEW</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-white">$19.99</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">/ MONTHLY</span>
                </div>
              </div>

              <ul className="space-y-3 sm:space-y-4">
                {[
                  { icon: Zap, text: "Ultra 4K HDR Stream" },
                  { icon: ShieldCheck, text: "Zero Interruption" },
                  { icon: PlayCircle, text: "Unlimited Library" }
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[10px] sm:text-xs font-bold text-white/50">
                    <feature.icon className="h-4 w-4 text-white/20" />
                    <span className="uppercase tracking-tighter">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Button onClick={handlePremiumStart} variant="outline" className="w-full h-12 border-white/10 text-white/40 font-black rounded-xl uppercase tracking-tighter italic">
                Subscribe Now
              </Button>
            </div>

            {/* Sponsored Tier */}
            <div className="relative z-10 bg-primary/5 border-2 border-primary/40 p-8 sm:p-10 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] space-y-6 sm:space-y-8 shadow-2xl lg:scale-110 transition-all duration-500 order-1 lg:order-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-6 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse whitespace-nowrap">
                ⚡ PRIORITY FREE ACCESS
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl sm:text-4xl font-black text-primary uppercase italic tracking-tighter glow-text-primary leading-none">START FOR FREE</h3>
                <p className="text-[9px] sm:text-[11px] font-black text-primary/60 uppercase tracking-[0.2em]">SPONSORED BY PARTNERS</p>
              </div>

              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 sm:p-5 text-center">
                  <p className="text-[10px] sm:text-[12px] font-black text-primary uppercase tracking-widest leading-relaxed">
                    NO CREDIT CARD REQUIRED<br/>
                    INSTANT 24H UNLOCK
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">HURRY: ONLY {spotsLeft} NODES REMAINING</p>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(spotsLeft/10)*100}%` }} />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleFreeStart}
                disabled={isRedirecting}
                className="w-full h-16 sm:h-20 bg-primary hover:bg-primary/90 text-black rounded-2xl font-black text-lg sm:text-xl uppercase tracking-tighter italic glow-primary shadow-[0_10px_40px_rgba(255,215,0,0.3)]"
              >
                {isRedirecting ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  "⚡ START FREE UNLOCK"
                )}
              </Button>
            </div>
          </div>

          <p className="text-center text-[7px] sm:text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
            SYSTEM SECURITY: TLS 1.3 / ENCRYPTED HANDSHAKE REQUIRED
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
