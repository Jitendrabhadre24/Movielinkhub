"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AdsterraBannerProps {
  className?: string;
  id: string;
}

export function AdsterraBanner({ className, id }: AdsterraBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent multiple injections
    if (adContainerRef.current && !adContainerRef.current.querySelector('iframe')) {
      try {
        const atOptions = {
          key: '73e1f57989d34360e20e88417c463f15', // Use actual key here
          format: 'iframe',
          height: 50,
          width: 320,
          params: {},
        };

        const scriptConfig = document.createElement('script');
        scriptConfig.type = 'text/javascript';
        scriptConfig.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;

        const scriptInvoke = document.createElement('script');
        scriptInvoke.type = 'text/javascript';
        scriptInvoke.src = `//www.highperformanceformat.com/${atOptions.key}/invoke.js`;

        adContainerRef.current.appendChild(scriptConfig);
        adContainerRef.current.appendChild(scriptInvoke);
        setIsLoaded(true);
      } catch (error) {
        console.error('AD_SYSTEM: Injection failure', error);
      }
    }
  }, []);

  return (
    <div className={cn("w-full flex justify-center items-center py-4 px-4 bg-background", className)}>
      <div 
        id={id}
        className="relative w-full max-w-[320px] min-h-[50px] bg-card/20 rounded-xl overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center"
      >
        <div ref={adContainerRef} className="z-10" />
        
        {/* Fallback/Loading State */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/40 backdrop-blur-sm">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] italic animate-pulse">
              Initializing Pipeline...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
