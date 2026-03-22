"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Star, Play, AlertCircle, RefreshCcw, LayoutGrid, Plus, Check, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useMemoFirebase, useCollection, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { triggerAdsterraPopunder } from "@/lib/ad-service";
import { BannerAd } from "@/components/ads/banner-ad";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

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
  const isMobile = useIsMobile();
  
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [kidsContent, setKidsContent] = useState<Movie[]>([]);
  const [animation, setAnimation] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Movie[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: string } | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [recSourceTitle, setRecSourceTitle] = useState<string | null>(null);

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

  const loadData = useCallback(async () => {
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
        setError({ message: "Network synchronization failed", type: "SERVER_ERROR" });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleWatchNow = (movie: Movie) => {
    triggerAdsterraPopunder();
    setTimeout(() => {
      router.push(`/movie/${movie.id}?type=${movie.media_type || 'movie'}`);
    }, 1000);
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
      toast({ title: "REMOVED FROM ARCHIVE" });
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
      toast({ title: "SECURED IN WATCHLIST" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] pb-32">
        <Skeleton className="h-[80vh] w-full rounded-none" />
        <div className="mt-8 space-y-12 px-4 md:px-16">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6">
             {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 w-52 shrink-0 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B] pb-32 animate-fade-in overflow-x-hidden">
      <BannerAd id="top-banner" isStickyTop />

      {error ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 space-y-8 pt-32">
          <div className="p-8 bg-card/40 backdrop-blur-2xl border border-white/5 rounded-full">
            {error.type === 'OFFLINE' ? <WifiOff className="h-12 w-12 text-primary" /> : <AlertCircle className="h-12 w-12 text-destructive" />}
          </div>
          <h2 className="text-2xl font-black uppercase text-white italic">{error.message}</h2>
          <Button onClick={loadData} className="rounded-full px-12 h-14 bg-primary text-black font-black italic">
            <RefreshCcw className="mr-3 h-5 w-5" /> RETRY LOAD
          </Button>
        </div>
      ) : trending.length > 0 ? (
        <>
          <section className="relative w-full pt-16 md:pt-0">
            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              spaceBetween={0}
              slidesPerView={1}
              effect="fade"
              loop={true}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="w-full h-[75vh] md:h-screen"
            >
              {trending.slice(0, 8).map((movie, idx) => (
                <SwiperSlide key={movie.id}>
                  <div className="relative w-full h-full group">
                    <div className="absolute inset-0 z-0">
                      {movie.backdrop_path && (
                        <Image
                          src={getImageUrl(movie.backdrop_path, "original") || ""}
                          alt={movie.title || movie.name || "Hero"}
                          fill
                          className="object-cover brightness-[0.6] transition-transform duration-[10s] group-hover:scale-110"
                          priority={idx === 0}
                          loading={idx === 0 ? "eager" : "lazy"}
                        />
                      )}
                      <div className="absolute inset-0 hero-gradient-overlay" />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 w-full max-w-6xl space-y-4 md:space-y-8 px-6 md:px-16 pb-24 md:pb-32 z-20">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 backdrop-blur-xl px-3 py-1.5 rounded-full border border-primary/30">
                          <span className="text-[10px] font-black text-primary tracking-widest uppercase italic">⚡ FEATURED PREMIERE</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                          <span className="text-sm font-black text-white">{movie.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="space-y-2 md:space-y-4">
                        <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none italic drop-shadow-2xl gold-gradient-text animate-fade-in">
                          {movie.title || movie.name}
                        </h1>
                        <p className="text-white/60 text-xs md:text-lg font-medium max-w-2xl line-clamp-2 italic leading-relaxed">
                          {movie.overview}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 md:pt-8">
                        <Button 
                          onClick={() => handleWatchNow(movie)}
                          className="w-full sm:w-auto rounded-full px-12 h-16 text-xl font-black bg-primary text-black hover:scale-105 active:scale-95 transition-all glow-primary italic"
                        >
                          <Play className="mr-3 h-7 w-7 fill-current" /> PLAY NOW
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleWatchlistToggle(movie)}
                          className="w-full sm:w-auto rounded-full px-10 h-16 border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 font-black text-white italic"
                        >
                          {isInWatchlist(movie.id) ? <Check className="mr-2 h-6 w-6 text-primary" /> : <Plus className="mr-2 h-6 w-6" />}
                          {isInWatchlist(movie.id) ? "IN ARCHIVE" : "ADD TO LIST"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <style jsx global>{`
              .swiper-pagination-bullet {
                background: white !important;
                opacity: 0.3;
              }
              .swiper-pagination-bullet-active {
                background: hsl(var(--primary)) !important;
                opacity: 1;
                width: 24px !important;
                border-radius: 4px !important;
              }
            `}</style>
          </section>

          <BannerAd id="mid-banner" className="bg-gradient-to-b from-transparent to-background" />

          <div className="relative z-50 space-y-12 md:space-y-24 mt-[-40px]">
            <section className="px-6 md:px-16 space-y-6">
              <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4 snap-x">
                {QUICK_GENRES.map((genre) => (
                  <Link 
                    key={genre.id} 
                    href={`/genre/${genre.id}?name=${genre.name}&type=movie`} 
                    className="flex-shrink-0 px-8 py-4 bg-white/5 backdrop-blur-2xl border border-white/5 hover:border-primary/40 hover:bg-primary/10 rounded-full text-xs font-black transition-all uppercase tracking-widest text-white/50 hover:text-primary snap-start italic"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </section>

            {continueWatching && continueWatching.length > 0 && (
              <MovieRow title="⏱ RESUME WATCHING" items={continueWatching as any[]} />
            )}

            {watchlistData && watchlistData.length > 0 && (
              <MovieRow title="⭐ SECURED IN LIST" items={watchlistData as any[]} />
            )}

            {recommendations.length > 0 && (
              <div className="py-12 bg-primary/5 border-y border-white/5 backdrop-blur-sm">
                <MovieRow title={`INSPIRED BY "${recSourceTitle?.toUpperCase()}"`} items={recommendations} />
              </div>
            )}

            <MovieRow title="🔥 TRENDING WORLDWIDE" items={trending} viewAllHref="/genres" />
            
            <BannerAd id="bottom-banner" />

            <MovieRow title="📺 TOP RATED TV SERIES" items={popularTV} type="tv" />
            <MovieRow title="🎌 GLOBAL ANIME HITS" items={anime} />
            <MovieRow title="🎬 MASTERPIECE CINEMA" items={topRated} />
            <MovieRow title="👶 FAMILY ARCHIVES" items={kidsContent} />

            <footer className="py-32 text-center space-y-8 opacity-20">
              <div className="h-px w-48 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto" />
              <div className="space-y-3">
                <p className="text-[10px] font-black tracking-[0.8em] text-white uppercase italic">MOVIELINK HUB PREMIUM v4.2.0</p>
                <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest leading-loose">
                  SECURE END-TO-END STREAMING // CLOUD INFRASTRUCTURE ACTIVE<br/>
                  ALL ARCHIVAL CONTENT VERIFIED BY GLOBAL PARTNERS
                </p>
              </div>
            </footer>
          </div>
        </>
      ) : null}
    </div>
  );
}
