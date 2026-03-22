"use client";

import { Movie } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface MovieRowProps {
  title: string;
  items: Movie[];
  type?: "movie" | "tv";
  viewAllHref?: string;
}

export function MovieRow({ title, items, type, viewAllHref }: MovieRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-6 py-6 overflow-hidden">
      <div className="px-6 md:px-12 lg:px-16 flex items-center justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link 
            href={viewAllHref}
            className="flex items-center gap-1 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest italic"
          >
            VIEW ALL <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div 
        className="no-scrollbar flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 px-6 md:px-12 lg:px-16 pb-6"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="snap-start shrink-0 w-[140px] sm:w-[180px] md:w-[220px] transition-transform duration-300"
          >
            <MovieCard item={item} type={type} className="w-full" />
          </div>
        ))}
        {/* End-of-row spacer for consistent padding */}
        <div className="shrink-0 w-6 md:w-16" />
      </div>
    </section>
  );
}
