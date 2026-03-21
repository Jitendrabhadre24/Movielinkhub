"use client";

import { useEffect, useState } from "react";
import { tmdb, Movie } from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Movie[]>([]);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingRes, moviesRes, tvRes, animeRes] = await Promise.all([
          tmdb.getTrending(),
          tmdb.getPopularMovies(),
          tmdb.getPopularTV(),
          tmdb.getAnime(),
        ]);

        setTrending(trendingRes?.results || []);
        setPopularMovies(moviesRes?.results || []);
        setPopularTV(tvRes?.results || []);
        setAnime(animeRes?.results || []);

        if (trendingRes?.results?.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, trendingRes.results.length));
          setHeroMovie(trendingRes.results[randomIndex]);
        }
      } catch (error) {
        console.error("Error loading home data:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      {heroMovie && (
        <div className="relative h-[80vh] w-full lg:h-[90vh]">
          <div className="absolute inset-0">
            {heroMovie.backdrop_path ? (
              <Image
                src={tmdb.getImageUrl(heroMovie.backdrop_path, "original") || ""}
                alt={heroMovie.title || heroMovie.name || "Hero"}
                fill
                className="object-cover opacity-80"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-card to-background" />
            )}
            <div className="absolute inset-0 hero-gradient" />
          </div>

          <div className="absolute bottom-0 left-0 p-6 md:p-16 lg:p-24 space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded uppercase italic tracking-tighter">FEATURED</span>
              <div className="flex items-center text-primary text-sm font-bold">
                <Star className="h-4 w-4 mr-1 fill-current" />
                {heroMovie.vote_average?.toFixed(1)}
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-headline tracking-tighter text-white drop-shadow-2xl uppercase italic leading-[0.9]">
              {heroMovie.title || heroMovie.name}
            </h1>
            
            <p className="text-sm md:text-lg text-muted-foreground line-clamp-3 md:line-clamp-4 max-w-xl font-medium">
              {heroMovie.overview}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-6">
              <Button asChild className="bg-primary hover:bg-primary/90 text-black font-black px-10 h-14 text-lg rounded-full">
                <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || "movie"}`}>
                  <Play className="mr-2 h-6 w-6 fill-current" /> PLAY NOW
                </Link>
              </Button>
              <Button variant="secondary" asChild className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-xl px-10 h-14 text-lg rounded-full">
                <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || "movie"}`}>
                  <Info className="mr-2 h-6 w-6" /> DETAILS
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative z-10 space-y-8 pb-32 pt-12">
        <MovieRow title="🔥 Trending Now" items={trending} />
        <MovieRow title="🎬 Blockbuster Movies" items={popularMovies} type="movie" />
        <MovieRow title="📺 Popular Series" items={popularTV} type="tv" />
        <MovieRow title="🉐 Top Anime" items={anime} type="tv" />
      </div>

      {!trending.length && !heroMovie && (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center p-8 bg-background">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Initializing Cinema...</p>
        </div>
      )}
    </div>
  );
}