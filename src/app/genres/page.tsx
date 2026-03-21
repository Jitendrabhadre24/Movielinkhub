"use client";

import { useEffect, useState } from "react";
import { getGenres } from "@/lib/tmdb";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
    <div className="p-4 md:p-8 space-y-10 min-h-screen">
      <header className="space-y-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter text-white uppercase italic">GENRES</h1>
        <p className="text-muted-foreground">Filter content by your favorite categories</p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            MOVIES <span className="h-1 w-12 bg-primary rounded-full" />
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {movieGenres && movieGenres.length > 0 ? (
              movieGenres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}?name=${genre.name}&type=movie`}
                  className="flex items-center justify-between p-4 bg-card hover:bg-primary/10 border border-primary/10 rounded-lg transition-colors group"
                >
                  <span className="font-medium">{genre.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))
            ) : !loading ? (
              <div className="col-span-2 py-8 text-center text-muted-foreground italic border border-dashed border-primary/20 rounded-lg">
                No movie genres found.
              </div>
            ) : (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-card animate-pulse rounded-lg" />
              ))
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            SERIES <span className="h-1 w-12 bg-primary rounded-full" />
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {tvGenres && tvGenres.length > 0 ? (
              tvGenres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}?name=${genre.name}&type=tv`}
                  className="flex items-center justify-between p-4 bg-card hover:bg-primary/10 border border-primary/10 rounded-lg transition-colors group"
                >
                  <span className="font-medium">{genre.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))
            ) : !loading ? (
              <div className="col-span-2 py-8 text-center text-muted-foreground italic border border-dashed border-primary/20 rounded-lg">
                No series genres found.
              </div>
            ) : (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-card animate-pulse rounded-lg" />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
