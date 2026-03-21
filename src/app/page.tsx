"use client";

import { useEffect, useState } from "react";
import { getTrending, Movie, getImageUrl } from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";
import Image from "next/image";
import { Star, Play, Info, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const results = await getTrending();
      if (results && results.length > 0) {
        setTrending(results);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] pb-20">
        <Skeleton className="h-[80vh] w-full bg-white/5" />
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-40 aspect-[2/3] bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const heroMovie = trending[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B] pb-32">
      {/* Hero Section */}
      {!error && heroMovie ? (
        <section className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            {heroMovie.backdrop_path ? (
              <Image
                src={getImageUrl(heroMovie.backdrop_path, "original") || ""}
                alt={heroMovie.title || heroMovie.name || "Hero"}
                fill
                className="object-cover opacity-70"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted/20" />
            )}
          </div>
          <div className="absolute inset-0 hero-gradient-overlay" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-16 space-y-6 max-w-3xl z-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-primary/30">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-black text-primary">{heroMovie.vote_average?.toFixed(1) || "N/A"}</span>
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
              <Button asChild className="rounded-full px-10 h-14 text-lg font-black bg-primary text-black hover:bg-primary/90 transition-transform active:scale-95 border-none">
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
      ) : error && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 space-y-6">
          <div className="p-6 bg-destructive/10 rounded-full">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Connection Error</h2>
            <p className="text-muted-foreground max-w-sm mx-auto font-medium">
              We're having trouble reaching the movie server on your desktop browser. 
              <br/><br/>
              <span className="text-primary font-bold italic">PRO TIP:</span> If you have an <span className="underline">AdBlocker</span> installed, try disabling it for this site.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadData} 
            className="rounded-full px-12 h-14 text-lg font-black border-primary/50 text-primary hover:bg-primary/10"
          >
            <RefreshCcw className="mr-2 h-5 w-5" /> RETRY CONNECTION
          </Button>
        </div>
      )}

      {/* Content Sections */}
      {!error && trending.length > 0 && (
        <div className="relative z-20 mt-[-60px] md:mt-[-100px] space-y-8">
          <MovieRow title="🔥 Trending Now" items={trending} />
        </div>
      )}
    </div>
  );
}
