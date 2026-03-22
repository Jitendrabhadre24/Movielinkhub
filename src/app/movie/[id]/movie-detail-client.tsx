"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDetails, getCredits, getVideos, getSimilar, getImageUrl, getWatchProviders, Movie, Cast } from "@/lib/tmdb";
import Image from "next/image";
import { Play, Star, ArrowLeft, User, AlertCircle, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieRow } from "@/components/movies/movie-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

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
  const [error, setError] = useState<string | null>(null);

  // Watchlist status via standardized hook
  const watchlistRef = useMemoFirebase(() => {
    if (!user || !firestore || !id) return null;
    return doc(firestore, "users", user.uid, "watchlist", id);
  }, [user, firestore, id]);

  const { data: watchlistItem } = useDoc(watchlistRef);
  const isInWatchlist = !!watchlistItem;

  const fetchData = async () => {
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
        setError("Content not found");
      } else {
        setMovie(details);
        setCast(credits?.slice(0, 10) || []);
        setVideos(videoRes || []);
        setSimilar(similarRes || []);
        setProviders(providerRes || {});
        
        // Save to Recently Viewed (LocalStorage)
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const newItem = {
          id: details.id,
          title: details.title || details.name,
          poster_path: details.poster_path,
          vote_average: details.vote_average,
          release_date: details.release_date || details.first_air_date,
          media_type: type,
          timestamp: Date.now()
        };
        const filtered = recent.filter((item: any) => item.id !== details.id);
        localStorage.setItem('recentlyViewed', JSON.stringify([newItem, ...filtered].slice(0, 20)));

        // Record progress in Firestore (Continue Watching)
        if (user && firestore) {
          const cwRef = doc(firestore, "users", user.uid, "continueWatching", id);
          setDocumentNonBlocking(cwRef, {
            id: Number(id),
            userId: user.uid, // CRITICAL: Security rules require this
            title: details.title || details.name,
            poster: details.poster_path,
            type: type,
            lastWatched: Date.now()
          }, { merge: true });
        }
      }
    } catch (err) {
      setError("Please check your connection");
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
        id: Number(id),
        userId: user.uid, // CRITICAL: Security rules require this
        title: movie.title || movie.name,
        poster: movie.poster_path,
        type: type,
        addedAt: Date.now()
      }, { merge: true });
      toast({ title: "Added to Watchlist" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background space-y-8 pb-32">
        <div className="relative h-[70vh] w-full"><Skeleton className="h-full w-full rounded-none" /></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold uppercase text-white">Content Unavailable</h2>
        <Button variant="outline" onClick={() => router.back()} className="rounded-full px-8">Go Back</Button>
      </div>
    );
  }

  const trailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const releaseYear = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const providersData = providers?.['IN'] || providers?.['US'] || null;
  const flatrate = providersData?.flatrate || [];
  const uniqueProviders = Array.from(new Map(flatrate.map((p: any) => [p.provider_id, p])).values());

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in">
      <div className="relative h-[70vh] w-full">
        {movie.backdrop_path && (
          <Image src={getImageUrl(movie.backdrop_path, "original") || ""} alt={movie.title || movie.name} fill className="object-cover opacity-60" priority />
        )}
        <div className="absolute inset-0 hero-gradient-overlay" />
        <button onClick={() => router.back()} className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white z-30 border border-white/10">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="absolute bottom-0 left-0 p-6 md:p-16 w-full z-20 space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none gold-gradient-text">
            {movie.title || movie.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white/80">
            <div className="flex items-center text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20"><Star className="h-4 w-4 mr-1 fill-current" />{movie.vote_average?.toFixed(1)}</div>
            <span>{releaseYear}</span>
            {movie.runtime && <span>{movie.runtime} min</span>}
          </div>
          <p className="text-sm md:text-lg text-muted-foreground max-w-3xl line-clamp-4 font-medium italic">{movie.overview}</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild className="bg-primary text-black font-black px-10 h-14 rounded-full hover:scale-105 transition-all glow-primary">
              <a href={providersData?.link || "#"} target="_blank" rel="noopener noreferrer"><Play className="mr-2 h-6 w-6 fill-current" /> WATCH NOW</a>
            </Button>
            <Button variant="outline" onClick={toggleWatchlist} className="rounded-full px-8 h-14 border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 font-black">
              {isInWatchlist ? <><Check className="mr-2 h-5 w-5 text-primary" /> IN WATCHLIST</> : <><Plus className="mr-2 h-5 w-5" /> ADD TO WATCHLIST</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-16 mt-12 space-y-20">
        <section className="space-y-8">
          <h2 className="text-2xl font-black uppercase text-white border-l-4 border-primary pl-6">🎬 AVAILABLE ON</h2>
          <div className="no-scrollbar flex gap-8 overflow-x-auto pb-6">
            {uniqueProviders.length > 0 ? uniqueProviders.map((provider: any) => (
              <div key={provider.provider_id} className="flex-shrink-0 flex flex-col items-center gap-4">
                <div className="relative h-20 w-20 rounded-3xl overflow-hidden border border-white/10 bg-card/50">
                  <Image src={getImageUrl(provider.logo_path, "w185") || ""} alt={provider.provider_name} fill className="object-cover" />
                </div>
                <span className="text-[12px] font-black text-white/60 uppercase italic">{provider.provider_name}</span>
              </div>
            )) : <p className="text-white/30 uppercase font-black italic">Check local listings for availability</p>}
          </div>
        </section>

        {trailer && (
          <section className="space-y-8">
            <h2 className="text-xl font-black uppercase text-white border-l-4 border-primary pl-6">OFFICIAL TRAILER</h2>
            <div className="aspect-video w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <iframe src={`https://www.youtube.com/embed/${trailer.key}`} title="Trailer" className="w-full h-full" allowFullScreen />
            </div>
          </section>
        )}

        {cast.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xl font-black uppercase text-white border-l-4 border-primary pl-6">TOP CAST</h2>
            <div className="no-scrollbar flex gap-8 overflow-x-auto pb-4">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-28 md:w-36 text-center space-y-4">
                  <div className="relative aspect-square rounded-full overflow-hidden border-2 border-white/5">
                    {person.profile_path ? <Image src={getImageUrl(person.profile_path, "w185") || ""} alt={person.name} fill className="object-cover" /> : <div className="h-full w-full bg-muted flex items-center justify-center"><User className="h-10 w-10 text-muted-foreground/30" /></div>}
                  </div>
                  <p className="text-sm font-black text-white line-clamp-1 uppercase italic">{person.name}</p>
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
