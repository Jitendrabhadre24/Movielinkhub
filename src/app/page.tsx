"use client";

import { useEffect, useState } from "react";
import { tmdb, Movie } from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";
import Image from "next/image";
import { Star, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await tmdb.getTrending();
        setTrending(res?.results || []);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Syncing Stream...</p>
      </div>
    );
  }

  const heroMovie = trending[0];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* Hero Section */}
      {heroMovie && (
        <section className="relative h-[80vh] w-full overflow-hidden">
          <Image
            src={tmdb.getImageUrl(heroMovie.backdrop_path, "original") || ""}
            alt={heroMovie.title || heroMovie.name || "Featured Title"}
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 hero-gradient-overlay" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-16 space-y-6 max-w-3xl z-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-primary/30">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-black text-primary">{heroMovie.vote_average?.toFixed(1)}</span>
              </div>
              <span className="text-white/60 text-sm font-bold tracking-widest uppercase">Featured Today</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic text-white leading-[0.85]">
              {heroMovie.title || heroMovie.name}
            </h1>
            
            <p className="text-muted-foreground text-base md:text-lg line-clamp-3 font-medium max-w-2xl leading-relaxed">
              {heroMovie.overview}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild className="rounded-full px-10 h-14 text-lg font-black bg-primary text-black hover:bg-primary/90 transition-transform active:scale-95">
                <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`}>
                  <Play className="mr-2 h-6 w-6 fill-current" /> PLAY NOW
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full px-10 h-14 text-lg font-black border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 transition-transform active:scale-95">
                <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`}>
                  <Info className="mr-2 h-6 w-6" /> INFO
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="relative z-20 mt-[-60px] md:mt-[-100px] space-y-8">
        <MovieRow title="🔥 Trending Now" items={trending} />
      </div>
    </div>
  );
}