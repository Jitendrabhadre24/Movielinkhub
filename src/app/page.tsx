"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  getTrending, 
  getTopRated, 
  getPopularTV, 
  getAnimeContent, 
  Movie, 
  getImageUrl, 
  TMDBError
} from "@/lib/tmdb";
import { MovieRow } from "@/components/movies/movie-row";
import Image from "next/image";
import { Star, Play, AlertCircle, RefreshCcw, Plus, Check, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useMemoFirebase, useCollection, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { triggerAdsterraPopunder } from "@/lib/ad-service";
import { BannerAd } from "@/components/ads/banner-ad";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Movie[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: string } | null>(null);

  const watchlistQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "users", user.uid, "watchlist"),
      orderBy("addedAt", "desc"),
      limit(20)
    );
  }, [user, firestore]);

  const { data: watchlistData } = useCollection(watchlistQuery);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, trRes, pTvRes, aniRes] = await Promise.all([
        getTrending(),
        getTopRated(),
        getPopularTV(),
        getAnimeContent()
      ]);

      setTrending(tRes || []);
      setTopRated(trRes || []);
      setPopularTV(pTvRes || []);
      setAnime(aniRes || []);
    } catch (err: any) {
      if (err instanceof TMDBError) {
        setError({ message: err.message, type: err.type });
      } else {
        setError({ message: "Sync failure", type: "SERVER_ERROR" });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      toast({ title: "REMOVED FROM LIST" });
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
      toast({ title: "ADDED TO WATCHLIST" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] pb-32">
        <Skeleton className="h-[70vh] w-full rounded-none" />
        <div className="mt-8 space-y-12 px-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4 overflow-hidden">
             {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-44 shrink-0 rounded-2xl" />)}
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
            <RefreshCcw className="mr-3 h-5 w-5" /> RETRY
          </Button>
        </div>
      ) : trending.length > 0 ? (
        <>
          <section className="relative w-full pt-20 md:pt-24 px-0">
            <Swiper
              modules={[Autoplay]}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={1.3}
              spaceBetween={10}
              loop={true}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                768: { slidesPerView: 2.5, spaceBetween: 20 }
              }}
              className="hero-swiper-container w-full"
            >
              {trending.slice(0, 10).map((movie) => (
                <SwiperSlide key={movie.id}>
                  {({ isActive }) => (
                    <div className="poster-card shadow-2xl">
                      <Image
                        src={getImageUrl(movie.poster_path, "original") || ""}
                        alt={movie.title || movie.name || "Poster"}
                        fill
                        className="object-cover transition-transform duration-1000"
                        priority
                      />
                      <div className="poster-overlay">
                        <div className={`space-y-1 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-primary fill-primary" />
                            <span className="text-[10px] font-black text-white">{movie.vote_average?.toFixed(1)}</span>
                          </div>
                          <h1 className="text-lg md:text-2xl font-black text-white uppercase italic tracking-tighter leading-none line-clamp-1">
                            {movie.title || movie.name}
                          </h1>
                          <p className="text-[8px] md:text-[10px] font-black text-white/50 uppercase tracking-widest italic">
                            {(movie.release_date || movie.first_air_date || "").split("-")[0]} • PREMIUM • HD
                          </p>
                        </div>
                      </div>

                      {/* Floating Action Matrix (Right Side) */}
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                        <Button 
                          size="icon"
                          onClick={() => handleWatchlistToggle(movie)}
                          className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-primary hover:text-black transition-all shadow-xl"
                        >
                          {isInWatchlist(movie.id) ? <Check className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5" />}
                        </Button>
                        <Button 
                          size="icon"
                          onClick={() => handleWatchNow(movie)}
                          className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary text-black hover:scale-110 transition-all glow-primary shadow-2xl"
                        >
                          <Play className="h-6 w-6 fill-current" />
                        </Button>
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          <BannerAd id="mid-banner" className="mid-ad" />

          <div className="relative z-50 space-y-12">
            <MovieRow title="🔥 TRENDING NOW" items={trending} viewAllHref="/genres" />
            <MovieRow title="📺 POPULAR SERIES" items={popularTV} type="tv" />
            
            <BannerAd id="interstitial-banner" className="bg-white/5 mx-6 rounded-2xl border border-white/5" />

            <MovieRow title="🎌 ANIME MASTERPIECES" items={anime} />
            <MovieRow title="🎬 TOP RATED FILMS" items={topRated} />

            <footer className="py-24 text-center space-y-6 opacity-30">
              <p className="text-[10px] font-black tracking-[0.6em] text-white uppercase italic">MOVIELINK HUB PRESTIGE</p>
              <div className="flex justify-center gap-8 text-[8px] font-mono text-white/40 uppercase tracking-widest">
                <span>PRIVACY PIPELINE</span>
                <span>SECURE ACCESS</span>
                <span>DMCA ARCHIVE</span>
              </div>
            </footer>
          </div>
        </>
      ) : null}
    </div>
  );
}
