"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDetails, getCredits, getVideos, getSimilar, getImageUrl, getWatchProviders, Movie, Cast, TMDBError } from "@/lib/tmdb";
import Image from "next/image";
import { Play, Star, ArrowLeft, User, AlertCircle, Plus, Check, RefreshCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieRow } from "@/components/movies/movie-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionModal } from "@/components/subscription/subscription-modal";
import { triggerAdsterraPopunder } from "@/lib/ad-service";

export default function MovieDetailClient({ id, initialType }: { id: string, initialType: "movie" | "tv" }) {
  const type = initialType;
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: string } | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const watchlistRef = useMemoFirebase(() => {
    if (!user || !firestore || !id) return null;
    return doc(firestore, "users", user.uid, "watchlist", id);
  }, [user, firestore, id]);

  const { data: watchlistItem } = useDoc(watchlistRef);
  const isInWatchlist = !!watchlistItem;

  const fetchData = async () => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);
    try {
      const [details, credits, videoRes, similarRes, providerRes] = await Promise.all([
        getDetails(id, type),
        getCredits(id, type),
        getVideos(id, type),
        getSimilar(id, type),
        getWatchProviders(id, type)
      ]);

      if (!details) {
        throw new TMDBError('SERVER_ERROR', 'Content not found');
      } else {
        setMovie(details);
        setCast(credits?.slice(0, 10) || []);
        setVideos(videoRes || []);
        setSimilar(similarRes || []);
        setProviders(providerRes || {});
        
        if (user && firestore) {
          const cwRef = doc(firestore, "users", user.uid, "continueWatching", id);
          setDocumentNonBlocking(cwRef, {
            id: String(id),
            userId: user.uid,
            contentId: String(id),
            contentType: type,
            title: details.title || details.name,
            poster: details.poster_path,
            lastWatchedAt: new Date().toISOString(),
            progressSeconds: 0,
            totalSeconds: details.runtime ? details.runtime * 60 : 0
          }, { merge: true });
        }
      }
    } catch (err: any) {
      if (err instanceof TMDBError) {
        setError({ message: err.message, type: err.type });
      } else {
        setError({ message: "Unable to reach archives", type: "SERVER_ERROR" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, type, user]);

  const toggleWatchlist = () => {
    if (!user || !firestore) {
      router.push("/auth");
      return;
    }

    const docRef = doc(firestore, "users", user.uid, "watchlist", id);
    if (isInWatchlist) {
      deleteDocumentNonBlocking(docRef);
      toast({ title: "Removed from Watchlist" });
    } else {
      setDocumentNonBlocking(docRef, {
        id: String(id),
        userId: user.uid,
        contentId: String(id),
        contentType: type,
        title: movie.title || movie.name,
        poster: movie.poster_path,
        addedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Added to Watchlist" });
    }
  };

  const handleWatchNow = () => {
    setIsSubModalOpen(true);
    triggerAdsterraPopunder();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background space-y-8 pb-32">
        <div className="relative h-screen w-full"><Skeleton className="h-full w-full rounded-none" /></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-8 bg-background">
        <div className="p-8 bg-card border border-white/5 rounded-full">
           {error?.type === 'OFFLINE' ? <WifiOff className="h-12 w-12 text-primary" /> : <AlertCircle className="h-12 w-12 text-primary" />}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase text-white tracking-tighter">{error?.message || "Content Unavailable"}</h2>
          <p className="text-white/30 font-mono text-[10px] uppercase tracking-widest">{error?.type || '404'}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button variant="outline" onClick={() => router.back()} className="w-full h-12 rounded-full font-black italic">BACK</Button>
          <Button onClick={fetchData} className="w-full h-12 bg-primary text-black font-black italic shadow-lg"><RefreshCcw className="mr-2 h-4 w-4" /> RETRY</Button>
        </div>
      </div>
    );
  }

  const trailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const releaseYear = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const providersData = providers?.['IN'] || providers?.['US'] || null;

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in overflow-x-hidden">
      <SubscriptionModal isOpen={isSubModalOpen} onOpenChange={setIsSubModalOpen} />
      
      <div className="relative min-h-screen w-full pt-20">
        {movie.backdrop_path && (
          <Image src={getImageUrl(movie.backdrop_path, "original") || ""} alt={movie.title || movie.name} fill className="object-cover opacity-60" priority />
        )}
        <div className="absolute inset-0 hero-gradient-overlay" />
        <button onClick={() => router.back()} className="absolute top-24 left-6 p-2 sm:p-3 bg-black/40 backdrop-blur-md rounded-full text-white z-30 border border-white/10 hover:bg-primary hover:text-black transition-all">
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <div className="absolute bottom-0 left-0 p-6 sm:p-12 md:p-16 lg:p-24 w-full z-20 space-y-4 sm:space-y-6 pb-16 sm:pb-32">
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white uppercase italic leading-none gold-gradient-text">
            {movie.title || movie.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-sm font-bold text-white/80">
            <div className="flex items-center text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20"><Star className="h-3.5 w-3.5 mr-1 fill-current" />{movie.vote_average?.toFixed(1)}</div>
            <span>{releaseYear}</span>
            {movie.runtime && <span>{movie.runtime} MIN</span>}
            <span className="border border-white/10 px-1.5 py-0.5 rounded text-[8px] uppercase">{movie.vote_average > 7 ? '4K ULTRA' : 'HD'}</span>
          </div>
          <p className="text-xs sm:text-base md:text-lg text-muted-foreground max-w-3xl line-clamp-4 font-medium italic leading-relaxed">{movie.overview}</p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-6">
            <Button 
              onClick={handleWatchNow}
              className="w-full sm:w-auto bg-primary text-black font-black px-12 h-14 rounded-full hover:scale-105 active:scale-95 transition-all glow-primary"
            >
              <Play className="mr-3 h-6 w-6 fill-current" /> WATCH NOW
            </Button>
            <Button variant="outline" onClick={toggleWatchlist} className="w-full sm:w-auto rounded-full px-10 h-14 border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 font-black">
              {isInWatchlist ? <><Check className="mr-2 h-5 w-5 text-primary" /> IN LIST</> : <><Plus className="mr-2 h-5 w-5" /> ADD TO LIST</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-16 mt-12 space-y-16 sm:space-y-24">
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-lg sm:text-2xl font-black uppercase text-white border-l-4 border-primary pl-4 sm:pl-6">🎬 AVAILABLE ON</h2>
          <div className="no-scrollbar flex gap-6 sm:gap-10 overflow-x-auto pb-4">
            {(providersData?.flatrate || []).length > 0 ? (providersData.flatrate as any[]).map((provider: any) => (
              <div key={provider.provider_id} className="flex-shrink-0 flex flex-col items-center gap-3 sm:gap-4">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-card/50 shadow-xl">
                  <Image src={getImageUrl(provider.logo_path, "w185") || ""} alt={provider.provider_name} fill className="object-cover" />
                </div>
                <span className="text-[10px] sm:text-[12px] font-black text-white/60 uppercase italic">{provider.provider_name}</span>
              </div>
            )) : <p className="text-white/30 uppercase font-black italic text-xs sm:text-sm">CHECK LOCAL LISTINGS FOR AVAILABILITY</p>}
          </div>
        </section>

        {trailer && (
          <section className="space-y-6 sm:space-y-8">
            <h2 className="text-lg sm:text-2xl font-black uppercase text-white border-l-4 border-primary pl-4 sm:pl-6">OFFICIAL TRAILER</h2>
            <div className="aspect-video w-full max-w-5xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <iframe src={`https://www.youtube.com/embed/${trailer.key}`} title="Trailer" className="w-full h-full" allowFullScreen />
            </div>
          </section>
        )}

        {cast.length > 0 && (
          <section className="space-y-6 sm:space-y-8">
            <h2 className="text-lg sm:text-2xl font-black uppercase text-white border-l-4 border-primary pl-4 sm:pl-6">TOP CAST</h2>
            <div className="no-scrollbar flex gap-6 sm:gap-10 overflow-x-auto pb-4">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-24 sm:w-36 text-center space-y-3 sm:space-y-4">
                  <div className="relative aspect-square rounded-full overflow-hidden border-2 border-white/5 shadow-lg">
                    {person.profile_path ? <Image src={getImageUrl(person.profile_path, "w185") || ""} alt={person.name} fill className="object-cover" /> : <div className="h-full w-full bg-muted flex items-center justify-center"><User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/30" /></div>}
                  </div>
                  <p className="text-[10px] sm:text-sm font-black text-white line-clamp-1 uppercase italic">{person.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && <MovieRow title="YOU MAY ALSO LIKE" items={similar} type={type} />}
      </div>
    </div>
  );
}
