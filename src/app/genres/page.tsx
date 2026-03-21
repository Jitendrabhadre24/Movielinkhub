"use client";

import { useEffect, useState } from "react";
import { tmdb } from "@/lib/tmdb";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function GenresPage() {
  const [movieGenres, setMovieGenres] = useState<any[]>([]);
  const [tvGenres, setTvGenres] = useState<any[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [mRes, tRes] = await Promise.all([
          tmdb.getGenres("movie"),
          tmdb.getGenres("tv"),
        ]);
        setMovieGenres(mRes.genres);
        setTvGenres(tRes.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen">
      <header className="space-y-2">
        <h1 className="text-3xl font-black font-headline tracking-tighter text-white">GENRES</h1>
        <p className="text-muted-foreground">Filter content by your favorite categories</p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            MOVIES <span className="h-1 w-12 bg-primary rounded-full" />
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {movieGenres.map((genre) => (
              <Link
                key={genre.id}
                href={`/genre/${genre.id}?name=${genre.name}&type=movie`}
                className="flex items-center justify-between p-4 bg-card hover:bg-primary/10 border border-primary/10 rounded-lg transition-colors group"
              >
                <span className="font-medium">{genre.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            SERIES <span className="h-1 w-12 bg-primary rounded-full" />
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {tvGenres.map((genre) => (
              <Link
                key={genre.id}
                href={`/genre/${genre.id}?name=${genre.name}&type=tv`}
                className="flex items-center justify-between p-4 bg-card hover:bg-primary/10 border border-primary/10 rounded-lg transition-colors group"
              >
                <span className="font-medium">{genre.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}