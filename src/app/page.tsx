"use client";

import { useEffect, useState } from "react";
import { 
  getTrending, 
  getTopRated, 
  getPopularTV, 
  getKidsContent, 
  getAnimationContent, 
  getAnimeContent, 
  getVideos,
  Movie, 
  getImageUrl, 
  getRecommendations,
  TMDBError
} from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";
import Image from "next/image";
import { Star, Play, AlertCircle, RefreshCcw, LayoutGrid, Plus, Check, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useMemoFirebase, useCollection, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const QUICK_GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 16, name: "Animation" },
];

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [kidsContent, setKidsContent] = useState<Movie[]>([]);
  const [animation, setAnimation] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Movie[]>([]);
  
  const [heroIndex, setHeroIndex] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [recSourceTitle, setRecSourceTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: string } | null>(null);

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
  }, []);

  useEffect(() => {
    if (trending.length > 0 && !loading) {
      const timer = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [trending, loading]);

  const heroMovie = trending[heroIndex];

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!heroMovie) return;
      setTrailerKey(null);
      try {
        const videos = await getVideos(heroMovie.id.toString(), heroMovie.media_type || 'movie');
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      } catch (e) {
        console.error("Hero trailer fetch failed", e);
      }
    };
    fetchTrailer();
  }, [heroMovie?.id]);

  useEffect(() => {
    const fetchRecs = async () => {
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

  const isInWatchlist = (id: number) => {
    return watchlistData?.some(item => String(item.contentId) === String(id) || String(item.id) === String(id));
  };

  const handleWatchlistToggle = (movie: Movie) => {
    if (!user || !firestore) {
      router.push("/auth");
      return;
    }
    const id = String(movie.id);
    const docRef = doc(firestore, "users", user.uid, "watchlist", id);
    
    if (isInWatchlist(movie.id)) {
      deleteDocumentNonBlocking(docRef);
      toast({ title: "REMOVED FROM LIST", description: `${movie.title || movie.name} has been archived.` });
    } else {
      setDocumentNonBlocking(docRef, {
        id,
        userId: user.uid,
        contentId: id,
        contentType: movie.media_type || 'movie',
        title: movie.title || movie.name,
        poster: movie.poster_path,
        addedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "ADDED TO LIST", description: `${movie.title || movie.name} is now secured.` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] pb-32">
        <div className="relative h-screen w-full">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
        <div className="mt-8 space-y-12 px-4 md:px-16">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6 overflow-hidden">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="space-y-4 shrink-0 w-40 sm:w-52">
                 <Skeleton className="h-60 sm:h-72 w-full rounded-2xl" />
                 <Skeleton className="h-4 w-3/4" />
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  const videoUrl = trailerKey ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1` : "";

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B] pb-32 animate-fade-in overflow-x-hidden">
      {error ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 space-y-8">
          <div className="p-8 bg-card/40 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl">
            {error.type === 'OFFLINE' ? <WifiOff className="h-12 w-12 text-primary" /> : <AlertCircle className="h-12 w-12 text-destructive" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-black uppercase text-white italic">{error.message}</h2>
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">ERROR CODE: {error.type}</p>
          </div>
          <Button onClick={loadData} className="rounded-full px-12 h-14 bg-primary text-black font-black italic shadow-lg">
            <RefreshCcw className="mr-3 h-5 w-5" /> RETRY LOAD
          </Button>
        </div>
      ) : heroMovie ? (
        <>
          <section className="relative h-screen w-full overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
              {/* Cinematic Background Transitions (Posters) */}
              {trending.slice(0, 5).map((movie, idx) => (
                <div 
                  key={movie.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                    heroIndex === idx ? "opacity-100" : "opacity-0"
                  )}
                >
                  {movie.backdrop_path && (
                    <Image
                      src={getImageUrl(movie.backdrop_path, "original") || ""}
                      alt={movie.title || movie.name || "Hero"}
                      fill
                      className="object-cover animate-slow-zoom brightness-[0.7]"
                      priority={idx === 0}
                    />
                  )}
                </div>
              ))}

              {/* Dynamic YouTube Trailer Embed (Desktop Only) */}
              {trailerKey && (
                <div className="hidden lg:block absolute inset-0 z-10 transition-opacity duration-1000">
                  <iframe
                    src={videoUrl}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    className="hero-video scale-[1.3] opacity-60 pointer-events-none"
                  ></iframe>
                </div>
              )}
            </div>
            
            <div className="hero-overlay" />
            
            <div className="hero-content absolute bottom-0 left-0 w-full max-w-5xl space-y-4 sm:space-y-6 md:space-y-8 pb-16 sm:pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-primary/30">
                  <span className="text-[10px] sm:text-[11px] font-black text-primary tracking-widest uppercase italic">🔥 NOW STREAMING</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary fill-primary" />
                  <span className="text-[11px] sm:text-sm font-black text-white">{heroMovie.vote_average?.toFixed(1) || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase text-white leading-[0.9] italic drop-shadow-2xl gold-gradient-text">
                  {heroMovie.title || heroMovie.name}
                </h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-lg lg:text-xl line-clamp-2 font-medium max-w-2xl leading-relaxed italic drop-shadow-md">
                  {heroMovie.overview}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 sm:pt-6">
                <Button asChild className="w-full sm:w-auto rounded-full px-12 h-16 text-xl font-black bg-primary text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_35px_rgba(255,215,0,0.3)]">
                  <Link href={`/movie/${heroMovie.id}?type=${heroMovie.media_type || 'movie'}`}>
                    <Play className="mr-3 h-7 w-7 fill-current" /> WATCH NOW
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleWatchlistToggle(heroMovie)}
                  className="w-full sm:w-auto rounded-full px-10 h-16 border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 font-black text-white hover:text-primary"
                >
                  {isInWatchlist(heroMovie.id) ? (
                    <><Check className="mr-2 h-6 w-6 text-primary" /> IN LIST</>
                  ) : (
                    <><Plus className="mr-2 h-6 w-6" /> ADD TO LIST</>
                  )}
                </Button>
                <div className="hidden sm:flex gap-3 items-center ml-4">
                   {[...Array(5)].map((_, i) => (
                     <button 
                       key={i}
                       onClick={() => setHeroIndex(i)}
                       className={cn(
                         "h-1.5 transition-all duration-300 rounded-full",
                         heroIndex === i ? "w-10 bg-primary" : "w-3 bg-white/20 hover:bg-white/40"
                       )}
                     />
                   ))}
                </div>
              </div>
            </div>
          </section>

          <div className="relative z-50 mt-[-80px] sm:mt-[-120px] space-y-12 sm:space-y-16 lg:space-y-20">
            <section className="px-4 md:px-12 lg:px-16 space-y-6">
              <div className="flex items-center gap-2 opacity-40 pl-1">
                <LayoutGrid className="h-3 w-3 text-white" />
                <h2 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white">SYSTEM DISCOVERY</h2>
              </div>
              <div className="no-scrollbar flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {QUICK_GENRES.map((genre) => (
                  <Link key={genre.id} href={`/genre/${genre.id}?name=${genre.name}&type=movie`} className="flex-shrink-0 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/5 hover:border-primary/50 hover:bg-white/10 rounded-full text-[11px] sm:text-[12px] font-black transition-all whitespace-nowrap uppercase tracking-[0.2em] text-white/60 hover:text-white snap-start italic">
                    {genre.name}
                  </Link>
                ))}
              </div>
            </section>

            {continueWatching && continueWatching.length > 0 && (
              <MovieRow title="⏱ RESUME ARCHIVE" items={continueWatching as any[]} />
            )}

            {watchlistData && watchlistData.length > 0 && (
              <MovieRow title="⭐ SECURED LIST" items={watchlistData as any[]} />
            )}

            {recommendations.length > 0 && (
              <div className="py-10 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-y border-white/5">
                <MovieRow title={`SIMILAR TO "${recSourceTitle?.toUpperCase()}"`} items={recommendations} />
              </div>
            )}

            <MovieRow title="🔥 WORLDWIDE TRENDS" items={trending} viewAllHref="/genres" />
            <MovieRow title="📺 POPULAR TV SERIES" items={popularTV} type="tv" />
            <MovieRow title="🎬 ANIMATION BLOCKBUSTERS" items={animation} />
            <MovieRow title="🎌 ANIME CORNER" items={anime} />
            <MovieRow title="👶 FOR KIDS & FAMILY" items={kidsContent} />
            <MovieRow title="⭐ CRITICALLY ACCLAIMED" items={topRated} />

            <footer className="py-24 text-center space-y-6 opacity-20">
              <div className="h-px w-32 bg-primary/30 mx-auto" />
              <div className="space-y-2">
                <p className="text-[10px] font-black tracking-[0.6em] text-white uppercase italic">MOVIELINK HUB PREMIUM OTT v4.0</p>
                <p className="text-[8px] font-mono text-white/40 uppercase">ALL RIGHTS RESERVED // ENCRYPTED CONNECTION</p>
              </div>
            </footer>
          </div>
        </>
      ) : null}
    </div>
  );
}
