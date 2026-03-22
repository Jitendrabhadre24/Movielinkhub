"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "DISCOVER", href: "/genres" },
  { label: "MY ACCOUNT", href: "/account" },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show header after 80px scroll
      setIsHeaderVisible(currentScrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check in case page is already scrolled
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-[60px] w-full flex items-center justify-between px-6 transition-all duration-500 ease-in-out",
        isHeaderVisible 
          ? "translate-y-0 opacity-100 bg-black/80 backdrop-blur-xl border-b border-white/5" 
          : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-8 md:gap-12">
        <div 
          className="flex items-center gap-1 cursor-pointer group select-none"
          onClick={() => router.push('/')}
        >
          <div className="flex items-center font-black tracking-[1px] uppercase text-xl md:text-2xl italic">
            <span className="text-[#FFD700]">ML</span>
            <span className="text-white ml-1">LINK</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[10px] font-black tracking-[0.2em] transition-colors uppercase italic",
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
          className="rounded-full bg-white/5 backdrop-blur-md text-white hover:text-primary border border-white/10 h-10 w-10 shadow-lg transition-transform active:scale-90"
          onClick={() => router.push('/search')}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
