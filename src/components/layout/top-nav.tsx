"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "DISCOVER", href: "/genres" },
  { label: "MY ACCOUNT", href: "/account" },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mobile logic: Reappear on scroll up, hide on scroll down
      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setIsScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Always show on subpages or if at top
    if (pathname !== '/' || window.scrollY < 100) {
      setIsVisible(true);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header 
      className={cn(
        "header",
        isVisible && "show",
        isScrolled && "scrolled"
      )}
    >
      <div className="flex items-center gap-6 md:gap-10">
        <div 
          className="flex items-center gap-1 cursor-pointer group"
          onClick={() => router.push('/')}
        >
          <span className="text-lg md:text-2xl font-black text-white tracking-tighter uppercase italic">MOVIE<span className="text-primary">LINK</span></span>
          <span className="hidden sm:inline-flex text-lg md:text-2xl font-black bg-primary text-black px-2 py-0.5 rounded-sm tracking-tighter uppercase italic shadow-[0_0_15px_rgba(255,193,7,0.5)]">HUB</span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xs font-black tracking-widest transition-colors uppercase italic",
                pathname === item.href ? "text-primary" : "text-white/60 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/5 backdrop-blur-md text-white hover:text-primary border border-white/5 h-10 w-10"
          onClick={() => router.push('/search')}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
