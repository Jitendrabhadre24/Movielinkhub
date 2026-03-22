"use client";

import { useEffect, useState } from "react";
import { getGenres } from "@/lib/tmdb";
import Link from "next/link";
import { ChevronRight, Film, Tv, LayoutGrid } from "lucide-react";

export default function GenresPage() {
  const [movieGenres, setMovieGenres] = useState<any[]>([]);
  const [tvGenres, setTvGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      const [mRes, tRes] = await Promise.all([
        getGenres("movie"),
        getGenres("tv"),
      ]);
      setMovieGenres(mRes || []);
      setTvGenres(tRes || []);
      setLoading(false);
    };
    fetchGenres();
  }, []);

  return (
    <div className="p-4 sm:p-8 md:p-12 lg:p-20 space-y-12 min-h-screen pb-32 animate-fade-in pt-24 sm:pt-28">
      <header className="space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
          <LayoutGrid className="h-6 w-6 text-primary" />
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-headline tracking-tighter text-white uppercase italic leading-none">
            CONTENT EXPLORER
          </h1>
        </div>
        <p className="text-muted-foreground font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] pl-1">
          DISCOVER PREMIUM BLOCKBUSTERS ACROSS GLOBAL ARCHIVES
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-20 max-w-7xl mx-auto">
        <section className="space-y-8">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <Film className="h-5 w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-black text-white italic tracking-tighter uppercase">FEATURE FILMS</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-card/50 animate-pulse rounded-xl border border-white/5" />
              ))
            ) : movieGenres.map((genre) => (
              <Link
                key={genre.id}
                href={`/genre/${genre.id}?name=${genre.name}&type=movie`}
                className="flex items-center justify-between p-5 sm:p-6 bg-card/30 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-xl transition-all group backdrop-blur-sm"
              >
                <span className="font-black text-xs sm:text-sm text-white/80 group-hover:text-primary transition-colors uppercase italic tracking-tighter">{genre.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <Tv className="h-5 w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-black text-white italic tracking-tighter uppercase">TV & SERIES</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {loading ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-card/50 animate-pulse rounded-xl border border-white/5" />
              ))
            ) : tvGenres.map((genre) => (
              <Link
                key={genre.id}
                href={`/genre/${genre.id}?name=${genre.name}&type=tv`}
                className="flex items-center justify-between p-5 sm:p-6 bg-card/30 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-xl transition-all group backdrop-blur-sm"
              >
                <span className="font-black text-xs sm:text-sm text-white/80 group-hover:text-primary transition-colors uppercase italic tracking-tighter">{genre.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}