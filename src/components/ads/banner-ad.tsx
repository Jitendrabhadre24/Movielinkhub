"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface BannerAdProps {
  id: string;
  className?: string;
  isStickyTop?: boolean;
}

export function BannerAd({ id, className, isStickyTop }: BannerAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!isStickyTop) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isStickyTop]);

  return (
    <div 
      className={cn(
        isStickyTop ? "top-ad" : "w-full py-6",
        "transition-all duration-500 ease-in-out overflow-hidden flex items-center justify-center bg-[#0B0B0B]",
        isStickyTop && !isVisible ? "hide h-0" : "h-[60px] md:h-[90px]",
        className
      )}
    >
      <div className="relative w-full max-w-[728px] mx-auto px-4">
        <div className="w-full bg-white/5 border border-white/10 rounded-xl h-[50px] md:h-[75px] flex items-center justify-center group hover:border-primary/40 transition-colors cursor-pointer">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] group-hover:text-primary transition-colors italic">ADVERTISING PARTNER</span>
            <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">{isStickyTop ? "728x90 LEADERBOARD" : "PREMIUM DISPLAY"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
