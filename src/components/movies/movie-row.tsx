"use client";

import { Movie } from "@/lib/tmdb";
import { MovieCard } from "./movie-card";

interface MovieRowProps {
  title: string;
  items: Movie[];
  type?: "movie" | "tv";
}

export function MovieRow({ title, items, type }: MovieRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4 py-4">
      <h2 className="px-4 text-lg font-bold text-foreground md:px-8 md:text-xl">
        {title}
      </h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 md:px-8">
        {items.map((item) => (
          <MovieCard key={item.id} item={item} type={type} />
        ))}
        {/* Spacer for horizontal scroll end padding */}
        <div className="min-w-[1px] h-1" />
      </div>
    </section>
  );
}