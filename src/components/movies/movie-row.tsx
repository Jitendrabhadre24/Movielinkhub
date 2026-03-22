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
    <section className="space-y-4 sm:space-y-6 py-4 sm:py-6 overflow-hidden">
      <div className="px-4 md:px-12 lg:px-16 flex items-center justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter">
            {title}
          </h2>
        </div>
        {viewAllHref && (
          <Link 
            href={viewAllHref}
            className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            VIEW ALL <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto px-4 md:px-12 lg:px-16 snap-x snap-mandatory scroll-smooth pb-4">
        {items.map((item) => (
          <div key={item.id} className="snap-start shrink-0 w-[180px] md:w-[220px]">
            <MovieCard item={item} type={type} />
          </div>
        ))}
        <div className="min-w-[20px] sm:min-w-[40px] h-1 shrink-0" />
      </div>
    </section>
  );
}
