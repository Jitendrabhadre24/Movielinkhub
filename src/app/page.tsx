"use client";

import { useEffect, useState } from "react";
import { tmdb, Movie } from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";
import Image from "next/image";
import Link from "next/link";
import { Play, Info } from "lucide-react";
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

        setTrending(trendingRes.results);
        setPopularMovies(moviesRes.results);
        setPopularTV(tvRes.results);
        setAnime(animeRes.results);

        // Pick a random hero movie from trending
        if (trendingRes.results.length > 0) {
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      {heroMovie && (
        <div className="relative h-[70vh] w-full md:h-[85vh]">
          <div className="absolute inset-0">
            <Image
              src={tmdb.getImageUrl(heroMovie.backdrop_path, "original") || ""}
              alt={heroMovie.title || heroMovie.name || "Hero"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block" />
          </div>

          <div className="absolute bottom-0 left-0 p-6 md:p-16 space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-white drop-shadow-md">
              {heroMovie.title || heroMovie.name}
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground line-clamp-3 md:line-clamp-4 drop-shadow-sm">
              {heroMovie.overview}
            </p>
            <div className="flex gap-3 pt-4">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || "movie"}`}>
                  <Play className="mr-2 h-5 w-5 fill-current" /> Play
                </Link>
              </Button>
              <Button variant="secondary" asChild className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm px-8">
                <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || "movie"}`}>
                  <Info className="mr-2 h-5 w-5" /> More Info
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative -mt-16 z-10 space-y-2 md:space-y-4">
        <MovieRow title="Trending Now" items={trending} />
        <MovieRow title="Popular Movies" items={popularMovies} type="movie" />
        <MovieRow title="Popular TV Shows" items={popularTV} type="tv" />
        <MovieRow title="Top Anime" items={anime} type="tv" />
      </div>

      {!trending.length && !heroMovie && (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center p-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Discovering magic for you...</p>
        </div>
      )}
    </div>
  );
}