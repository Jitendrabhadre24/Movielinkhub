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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Updated threshold to 100px to sync with ad hiding
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 left-0 right-0 z-[40] flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-500 header",
        isScrolled 
          ? "bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3 shadow-2xl show" 
          : "bg-gradient-to-b from-black/95 via-black/40 to-transparent backdrop-blur-[1px] py-6"
      )}
    >
      <div className="flex items-center gap-10">
        <div 
          className={cn(
            "flex items-center gap-1 cursor-pointer transition-all duration-500 group",
            !isScrolled && pathname === '/' ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
          )} 
          onClick={() => router.push('/')}
        >
          <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">MOVIELINK</span>
          <span className="text-xl md:text-2xl font-black bg-primary text-black px-2 py-0.5 rounded-sm tracking-tighter uppercase italic shadow-[0_0_15px_rgba(255,215,0,0.5)]">HUB</span>
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

      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/5 backdrop-blur-md text-white hover:text-primary border border-white/5 hover:bg-white/10"
          onClick={() => router.push('/search')}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
