"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Link as LinkIcon } from "lucide-react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-[70px] w-full flex items-center justify-between px-4 sm:px-6 transition-all duration-500 ease-in-out",
        isScrolled 
          ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" 
          : "bg-transparent border-transparent"
      )}
    >
      <div className="flex items-center gap-8 md:gap-12">
        {/* Modern Dual-Box Logo */}
        <div 
          className="inline-flex items-center gap-[4px] cursor-pointer group select-none active:scale-95 transition-transform"
          onClick={() => router.push('/')}
        >
          <div className="bg-[#FF2D2D] text-white px-[10px] py-[6px] rounded-[8px] font-black text-xs sm:text-sm tracking-tighter shadow-[0_4px_12px_rgba(255,45,45,0.3)]">
            MOVIE
          </div>
          <div className="bg-[#FFD700] text-black px-[8px] py-[6px] rounded-[8px] flex items-center justify-center shadow-[0_4px_12px_rgba(255,215,0,0.3)]">
            <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
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
