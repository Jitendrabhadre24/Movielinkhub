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
    <div className="p-4 md:p-8 space-y-12 min-h-screen pb-32">
      <header className="space-y-4">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
          <LayoutGrid className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-black font-headline tracking-tighter text-white uppercase italic leading-none">
            EXPLORE CATEGORIES
          </h1>
        </div>
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest pl-1">
          Discover Premium Content Across All Genres
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Movies Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <Film className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">FEATURE FILMS</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-card/50 animate-pulse rounded-2xl border border-white/5" />
              ))
            ) : movieGenres.length > 0 ? (
              movieGenres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}?name=${genre.name}&type=movie`}
                  className="flex items-center justify-between p-6 bg-card/30 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-2xl transition-all group backdrop-blur-sm"
                >
                  <span className="font-black text-white/80 group-hover:text-primary transition-colors uppercase italic tracking-tighter">{genre.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground italic border border-dashed border-white/10 rounded-2xl">
                Unable to load movie genres.
              </div>
            )}
          </div>
        </section>

        {/* Series Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <Tv className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">TELEVISION SERIES</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-card/50 animate-pulse rounded-2xl border border-white/5" />
              ))
            ) : tvGenres.length > 0 ? (
              tvGenres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}?name=${genre.name}&type=tv`}
                  className="flex items-center justify-between p-6 bg-card/30 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-2xl transition-all group backdrop-blur-sm"
                >
                  <span className="font-black text-white/80 group-hover:text-primary transition-colors uppercase italic tracking-tighter">{genre.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground italic border border-dashed border-white/10 rounded-2xl">
                Unable to load series genres.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
