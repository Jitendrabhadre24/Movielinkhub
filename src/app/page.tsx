"use client";

import { useEffect, useState } from "react";
import { getTrending, getTopRated, Movie, getImageUrl, getRecommendations } from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";
import Image from "next/image";
import { Star, Play, AlertCircle, RefreshCcw, LayoutGrid, Clock, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/auth-provider";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const QUICK_GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 16, name: "Animation" },
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [recSourceTitle, setRecSourceTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendingRes, topRatedRes] = await Promise.all([
        getTrending(),
        getTopRated()
      ]);

      if (trendingRes && trendingRes.length > 0) {
        setTrending(trendingRes);
        setTopRated(topRatedRes || []);
      } else {
        setError("Please disable ad blocker or check connection");
      }
    } catch (err) {
      setError("Please disable ad blocker or check connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!user) {
      setContinueWatching([]);
      setRecommendations([]);
      setRecSourceTitle(null);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "continueWatching"),
      orderBy("lastWatched", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        poster_path: doc.data().poster
      }));
      setContinueWatching(items);

      if (items.length > 0) {
        const lastWatched = items[0];
        try {
          const recs = await getRecommendations(lastWatched.id.toString(), lastWatched.type);
          setRecommendations(recs || []);
          setRecSourceTitle(lastWatched.title);
        } catch (e) {
          console.warn("Failed to fetch recommendations", e);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] pb-32">
        <div className="relative h-[85vh] w-full">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute bottom-0 left-0 p-6 md:p-16 space-y-6 w-full max-w-4xl">
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-20 md:h-32 w-full max-w-2xl" />
            <Skeleton className="h-12 w-full max-w-md" />
            <div className="flex gap-4">
              <Skeleton className="h-14 w-40 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-12 space-y-16">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 md:px-16 space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, j) => (
                  <Skeleton key={j} className="flex-shrink-0 w-36 sm:w-44 md:w-52 aspect-[2/3] rounded-[14px]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const heroMovie = trending[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B] pb-32 animate-fade-in">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div 
          className="flex items-center gap-1 cursor-pointer group" 
          onClick={() => router.push('/')}
        >
          <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">MOVIELINK</span>
          <span className="text-xl md:text-2xl font-black bg-primary text-black px-2 py-0.5 rounded-sm tracking-tighter uppercase shadow-[0_0_15px_rgba(255,215,0,0.5)]">HUB</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/20 backdrop-blur-md text-white hover:text-primary border border-white/10"
          onClick={() => router.push('/search')}
        >
          <Search className="h-5 w-5" />
        </Button>
      </header>

      {!error && heroMovie ? (
        <section className="relative h-[85vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            {heroMovie.backdrop_path ? (
              <Image
                src={getImageUrl(heroMovie.backdrop_path, "original") || ""}
                alt={heroMovie.title || heroMovie.name || "Hero"}
                fill
                className="object-cover animate-slow-zoom"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted/20" />
            )}
          </div>
          <div className="absolute inset-0 hero-gradient-overlay" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-16 space-y-8 max-w-4xl z-10 pb-20 md:pb-32">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/30">
                <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">🔥 TRENDING NOW</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
                <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                <span className="text-sm font-black text-white">{heroMovie.vote_average?.toFixed(1) || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-8xl font-black tracking-[-0.05em] uppercase text-white leading-[0.85] drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                {heroMovie.title || heroMovie.name}
              </h1>
              
              <p className="text-white/75 text-base md:text-xl line-clamp-3 font-medium max-w-[90%] md:max-w-2xl leading-relaxed">
                {heroMovie.overview}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild className="rounded-full px-12 h-14 text-lg font-black bg-primary text-black hover:bg-primary/90 transition-all hover:scale-[1.05] active:scale-[0.97] border-none shadow-[0_0_20px_rgba(255,215,0,0.4)] group">
                <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`}>
                  <Play className="mr-3 h-7 w-7 fill-current transition-transform group-hover:translate-x-1" /> PLAY NOW
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
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">CONNECTION ERROR</h2>
            <p className="text-muted-foreground max-w-sm mx-auto font-medium">
              {error}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadData} 
            className="rounded-full px-12 h-14 text-lg font-black border-primary/50 text-primary hover:bg-primary/10"
          >
            <RefreshCcw className="mr-2 h-5 w-5" /> RETRY HUB ACCESS
          </Button>
        </div>
      )}

      {!error && trending.length > 0 && (
        <div className="relative z-20 mt-[-80px] md:mt-[-120px] space-y-16">
          <section className="px-6 md:px-16 space-y-6">
            <div className="flex items-center gap-3 text-white/30 pl-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">DISCOVER BY CATEGORY</h2>
            </div>
            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
              {QUICK_GENRES.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}?name=${genre.name}&type=movie`}
                  className="flex-shrink-0 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,215,0,0.1)] rounded-full text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider text-white/80 hover:text-white"
                >
                  {genre.name}
                </Link>
              ))}
              <Link
                href="/genres"
                className="flex-shrink-0 px-8 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full text-xs font-black transition-all whitespace-nowrap text-primary uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.05)]"
              >
                BROWSE ALL
              </Link>
            </div>
          </section>

          {continueWatching.length > 0 && (
            <div className="space-y-4">
              <div className="px-6 md:px-16 flex items-center gap-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic glow-text-primary">⏱ RESUME VIEWING</h2>
              </div>
              <MovieRow title="" items={continueWatching as Movie[]} />
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-6 py-4">
              <div className="px-6 md:px-16 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-accent bg-accent/5 w-fit px-3 py-1 rounded-full border border-accent/20">
                  <Sparkles className="h-3 w-3 fill-accent" />
                  <h2 className="text-[9px] font-black uppercase tracking-[0.4em]">HUB AI INTELLIGENCE</h2>
                </div>
                <div className="border-l-4 border-primary pl-6">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">
                    BECAUSE YOU WATCHED <span className="gold-gradient-text">"{recSourceTitle}"</span>
                  </h2>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Based on your recent cinematic profile</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <MovieRow title="" items={recommendations} />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <MovieRow title="🔥 WORLDWIDE TRENDS" items={trending} />
            <MovieRow title="⭐ CRITICALLY ACCLAIMED" items={topRated} />
          </div>

          <footer className="py-20 text-center space-y-4 opacity-30">
            <div className="h-px w-32 bg-primary/50 mx-auto" />
            <p className="text-[10px] font-black tracking-[0.5em] text-white uppercase">MOVIELINK HUB PREMIUM OTT</p>
            <p className="text-[8px] font-mono text-muted-foreground uppercase">Authorized Archive Access v1.0.8</p>
          </footer>
        </div>
      )}
    </div>
  );
}