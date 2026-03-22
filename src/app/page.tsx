
"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  getTrending, 
  getTopRated, 
  getPopularTV, 
  getKidsContent, 
  getAnimationContent, 
  getAnimeContent, 
  Movie, 
  getImageUrl, 
  getRecommendations,
  TMDBError
} from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";
import Image from "next/image";
import { Star, Play, AlertCircle, RefreshCcw, LayoutGrid, Clock, Sparkles, Search, WifiOff, ChevronRight, Bookmark, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const QUICK_GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 16, name: "Animation" },
];

const MIN_LOAD_TIME = 2500; 

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [kidsContent, setKidsContent] = useState<Movie[]>([]);
  const [animation, setAnimation] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Movie[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Movie[]>([]);
  
  const [heroIndex, setHeroIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [recSourceTitle, setRecSourceTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: string } | null>(null);

  // Firestore Queries for Personalized Rows
  const continueWatchingQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "users", user.uid, "continueWatching"),
      orderBy("lastWatchedAt", "desc"),
      limit(10)
    );
  }, [user, firestore]);

  const watchlistQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "users", user.uid, "watchlist"),
      orderBy("addedAt", "desc"),
      limit(15)
    );
  }, [user, firestore]);

  const { data: continueWatching } = useCollection(continueWatchingQuery);
  const { data: watchlistData } = useCollection(watchlistQuery);

  const loadData = async () => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);
    try {
      const [tRes, trRes, pTvRes, kRes, aRes, aniRes] = await Promise.all([
        getTrending(),
        getTopRated(),
        getPopularTV(),
        getKidsContent(),
        getAnimationContent(),
        getAnimeContent()
      ]);

      const elapsed = Date.now() - startTime;
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800));

      setTrending(tRes || []);
      setTopRated(trRes || []);
      setPopularTV(pTvRes || []);
      setKidsContent(kRes || []);
      setAnimation(aRes || []);
      setAnime(aniRes || []);
      
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      const wait = Math.max(0, MIN_LOAD_TIME - elapsed);
      await new Promise(r => setTimeout(r, wait));

      if (err instanceof TMDBError) {
        setError({ message: err.message, type: err.type });
      } else {
        setError({ message: "An unexpected error occurred", type: "SERVER_ERROR" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(recent);
  }, []);

  // Hero Auto-Cycle Logic
  useEffect(() => {
    if (trending.length > 0 && !loading) {
      const timer = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [trending, loading]);

  // Personalized Recommendation Logic
  useEffect(() => {
    const fetchRecs = async () => {
      // Prioritize Continue Watching, then Watchlist
      const source = (continueWatching && continueWatching[0]) || (watchlistData && watchlistData[0]);
      if (source) {
        try {
          const recs = await getRecommendations(source.contentId || source.id.toString(), source.contentType || source.type);
          setRecommendations(recs || []);
          setRecSourceTitle(source.title);
        } catch (e) {
          console.error("Rec fetch failed", e);
        }
      }
    };
    fetchRecs();
  }, [continueWatching, watchlistData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] pb-32">
        <div className="relative h-[85vh] w-full">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute bottom-0 left-0 p-6 md:p-16 space-y-6 w-full max-w-4xl">
            <div className="flex gap-4"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-40" /></div>
            <Skeleton className="h-20 md:h-32 w-full max-w-2xl" />
            <div className="flex gap-4"><Skeleton className="h-14 w-40 rounded-full" /></div>
          </div>
        </div>
        <div className="mt-12 space-y-12 px-6 md:px-16">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6 overflow-hidden">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="space-y-4 shrink-0">
                 <Skeleton className="h-72 w-48 rounded-2xl" />
                 <Skeleton className="h-4 w-32" />
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  const heroMovie = trending[heroIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B] pb-32 animate-fade-in">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-[2px]">
        <div className="flex items-center gap-1 cursor-pointer group" onClick={() => router.push('/')}>
          <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic">MOVIELINK</span>
          <span className="text-xl md:text-2xl font-black bg-primary text-black px-2 py-0.5 rounded-sm tracking-tighter uppercase italic shadow-[0_0_15px_rgba(255,215,0,0.5)]">HUB</span>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/5 backdrop-blur-md text-white hover:text-primary border border-white/5 hover:bg-white/10"
            onClick={() => router.push('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {error ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative p-8 bg-card/40 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl">
              {error.type === 'OFFLINE' ? (
                <WifiOff className="h-16 w-16 text-primary" />
              ) : (
                <AlertCircle className="h-16 w-16 text-destructive" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white italic">{error.message}</h2>
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">Code: {error.type}</p>
          </div>
          <Button 
            onClick={loadData} 
            className="rounded-full px-12 h-16 text-lg font-black bg-primary text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,215,0,0.2)]"
          >
            <RefreshCcw className="mr-3 h-5 w-5" /> RETRY CONNECTION
          </Button>
        </div>
      ) : heroMovie ? (
        <>
          <section className="relative h-[85vh] w-full overflow-hidden">
            {trending.slice(0, 5).map((movie, idx) => (
              <div 
                key={movie.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                  heroIndex === idx ? "opacity-100 z-0" : "opacity-0 z-[-1]"
                )}
              >
                {movie.backdrop_path && (
                  <Image
                    src={getImageUrl(movie.backdrop_path, "original") || ""}
                    alt={movie.title || movie.name || "Hero"}
                    fill
                    className="object-cover animate-slow-zoom"
                    priority={idx === 0}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                  />
                )}
              </div>
            ))}
            
            <div className="absolute inset-0 hero-gradient-overlay z-10" />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-16 space-y-8 max-w-4xl z-20 pb-20 md:pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/30">
                  <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase italic">🔥 TRENDING</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
                  <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                  <span className="text-sm font-black text-white">{heroMovie.vote_average?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-8xl font-black tracking-[-0.05em] uppercase text-white leading-[0.85] italic drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
                  {heroMovie.title || heroMovie.name}
                </h1>
                <p className="text-white/80 text-base md:text-xl line-clamp-3 font-medium max-w-[95%] md:max-w-2xl leading-relaxed italic drop-shadow-md">
                  {heroMovie.overview}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild className="rounded-full px-12 h-14 text-lg font-black bg-primary text-black hover:bg-primary/90 transition-all hover:scale-[1.05] active:scale-[0.97] border-none shadow-[0_0_30px_rgba(255,215,0,0.4)] group">
                  <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`}>
                    <Play className="mr-3 h-7 w-7 fill-current transition-transform group-hover:translate-x-1" /> WATCH NOW
                  </Link>
                </Button>
                <div className="flex gap-2 items-center ml-2">
                   {[...Array(5)].map((_, i) => (
                     <button 
                       key={i}
                       onClick={() => setHeroIndex(i)}
                       className={cn(
                         "h-1 transition-all duration-300 rounded-full",
                         heroIndex === i ? "w-8 bg-primary shadow-[0_0_10px_rgba(255,215,0,0.5)]" : "w-2 bg-white/20"
                       )}
                     />
                   ))}
                </div>
              </div>
            </div>
          </section>

          <div className="relative z-30 mt-[-80px] md:mt-[-120px] space-y-16">
            <section className="px-6 md:px-16 space-y-8">
              <div className="flex items-center gap-2.5 opacity-40 pl-1">
                <LayoutGrid className="h-3 w-3 text-white" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">BROWSE HUB</h2>
              </div>
              <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
                {QUICK_GENRES.map((genre) => (
                  <Link key={genre.id} href={`/genre/${genre.id}?name=${genre.name}&type=movie`} className="flex-shrink-0 px-8 py-3.5 bg-white/5 backdrop-blur-xl border border-white/5 hover:border-primary/50 hover:bg-white/10 rounded-full text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-widest text-white/60 hover:text-white snap-start italic">
                    {genre.name}
                  </Link>
                ))}
              </div>
            </section>

            {/* Personalized: Continue Watching */}
            {continueWatching && continueWatching.length > 0 && (
              <div className="space-y-4">
                <div className="px-6 md:px-16 flex items-center gap-3 text-primary">
                  <Clock className="h-5 w-5 animate-pulse" />
                  <h2 className="text-xl font-black uppercase tracking-tighter italic glow-text-primary">⏱ CONTINUE STREAMING</h2>
                </div>
                <MovieRow title="" items={continueWatching as any[]} />
              </div>
            )}

            {/* Personalized: From Your Watchlist (My List) */}
            {watchlistData && watchlistData.length > 0 && (
              <div className="space-y-4">
                <div className="px-6 md:px-16 flex items-center gap-3 text-white">
                  <Bookmark className="h-5 w-5 text-primary fill-primary" />
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">⭐ FROM YOUR WATCHLIST</h2>
                  <Link href="/account" className="ml-auto text-[10px] font-black text-white/30 hover:text-primary transition-colors uppercase tracking-[0.2em]">MANAGE ALL</Link>
                </div>
                <MovieRow title="" items={watchlistData as any[]} />
              </div>
            )}

            {/* Personalized: Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-6 py-10 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-y border-white/5">
                <div className="px-6 md:px-16 space-y-2">
                  <div className="flex items-center gap-2 text-primary/60">
                    <Sparkles className="h-4 w-4 fill-primary/40" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] italic">AI RECOMMENDATION</h2>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
                    SIMILAR TO <span className="gold-gradient-text">"{recSourceTitle}"</span>
                  </h2>
                </div>
                <MovieRow title="" items={recommendations} />
              </div>
            )}

            {recentlyViewed.length > 0 && (
              <div className="space-y-4">
                <div className="px-6 md:px-16 flex items-center gap-3 text-white/50">
                  <Clock className="h-5 w-5" />
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">🕒 RECENTLY EXPLORED</h2>
                </div>
                <MovieRow title="" items={recentlyViewed} />
              </div>
            )}

            <MovieRow title="🔥 WORLDWIDE TRENDS" items={trending} viewAllHref="/genres" />
            <MovieRow title="📺 POPULAR TV SERIES" items={popularTV} type="tv" />
            <MovieRow title="🎬 ANIMATION BLOCKBUSTERS" items={animation} />
            <MovieRow title="🎌 ANIME CORNER" items={anime} />
            <MovieRow title="👶 FOR KIDS & FAMILY" items={kidsContent} />
            <MovieRow title="⭐ CRITICALLY ACCLAIMED" items={topRated} />

            <footer className="py-24 text-center space-y-4 opacity-20">
              <div className="h-px w-32 bg-primary/30 mx-auto" />
              <p className="text-[9px] font-black tracking-[0.8em] text-white uppercase">MOVIELINK HUB PREMIUM OTT v3.0</p>
            </footer>
          </div>
        </>
      ) : null}
    </div>
  );
}
