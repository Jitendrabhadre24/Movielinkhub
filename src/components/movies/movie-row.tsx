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
    <section className="space-y-6 py-6">
      {title && (
        <div className="px-4 md:px-8">
          <div className="border-l-4 border-primary pl-4">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
              {title}
            </h2>
          </div>
        </div>
      )}
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
