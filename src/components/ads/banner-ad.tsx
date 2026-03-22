"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BannerAdProps {
  id: string;
  className?: string;
  isStickyTop?: boolean;
}

export function BannerAd({ id, className, isStickyTop }: BannerAdProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!isStickyTop) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Smart Visibility: Show on scroll up, hide on scroll down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isStickyTop]);

  return (
    <div 
      className={cn(
        isStickyTop ? "top-ad" : "w-full py-8",
        "transition-all duration-500 ease-in-out overflow-hidden flex items-center justify-center bg-background",
        isStickyTop && !isVisible ? "-translate-y-full opacity-0 h-0" : "translate-y-0 opacity-100 h-[60px] md:h-[90px]",
        className
      )}
    >
      <div className="relative w-full max-w-[728px] mx-auto px-4">
        {/* Adsterra/Generic Banner Placeholder */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl h-[50px] md:h-[70px] flex items-center justify-center group hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] group-hover:text-primary transition-colors italic">ADVERTISING PARTNER</span>
            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{isStickyTop ? "728x90 LEADERBOARD" : "RESPONSIVE DISPLAY"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
