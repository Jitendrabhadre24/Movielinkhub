"use client";

import { useEffect, useState } from "react";
import { tmdb, Movie } from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trendingRes = await tmdb.getTrending();
        setTrending(trendingRes?.results || []);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center p-8 bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-[10px]">SYNCING TRENDS...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-12 pb-32">
      <MovieRow title="🔥 Trending Now" items={trending} />
    </div>
  );
}
