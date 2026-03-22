"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BannerAdProps {
  id: string;
  className?: string;
  isStickyTop?: boolean;
}

export function BannerAd({ id, className, isStickyTop }: BannerAdProps) {
  const [isAdHidden, setIsAdHidden] = useState(false);

  useEffect(() => {
    if (!isStickyTop) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide ad when scrolled past 100px
      if (currentScrollY > 100) {
        setIsAdHidden(true);
      } else {
        setIsAdHidden(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isStickyTop]);

  return (
    <div 
      className={cn(
        isStickyTop ? "top-ad" : "w-full px-6 md:px-12 lg:px-16",
        "transition-all duration-500 ease-in-out overflow-hidden flex items-center justify-center bg-[#0B0B0B]",
        isStickyTop && isAdHidden ? "hide h-0" : "h-[80px] md:h-[100px]",
        className
      )}
    >
      <div className="relative w-full max-w-7xl mx-auto h-full flex items-center">
        <div className={cn(
          "w-full bg-gradient-to-br border rounded-[16px] h-full flex items-center justify-between px-6 sm:px-8 group hover:border-primary/40 transition-all cursor-pointer shadow-lg overflow-hidden relative",
          isStickyTop 
            ? "from-white/5 to-white/[0.02] border-white/10" 
            : "from-primary/10 via-white/[0.03] to-primary/10 border-white/5"
        )}>
          {/* Animated Glow Effect */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -left-20 top-0 w-40 h-full bg-primary/10 blur-[60px] transform -skew-x-12 animate-pulse" />
          <div className="absolute -right-20 bottom-0 w-40 h-full bg-primary/10 blur-[60px] transform -skew-x-12 animate-pulse delay-700" />

          <div className="flex flex-col justify-center relative z-10">
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] italic mb-0.5">
              {isStickyTop ? "SPONSORED CONTENT" : "SPONSORED"}
            </span>
            <span className="text-xs sm:text-base font-black text-white/90 uppercase italic tracking-tighter leading-tight">
              {isStickyTop ? "DISCOVER THE NEW ERA OF CINEMA" : "DISCOVER PREMIUM CONTENT"}
            </span>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">PROMOTION</span>
              <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[8px] font-black text-primary group-hover:bg-primary group-hover:text-black transition-all">
                LEARN MORE
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          </div>
        </div>
      </div>
    </div>
  );
}
