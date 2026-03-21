"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDetails, getCredits, getVideos, getSimilar, getImageUrl, getWatchProviders, Movie, Cast } from "@/lib/tmdb";
import Image from "next/image";
import { Play, Star, Calendar, Clock, ArrowLeft, User, AlertCircle, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieRow } from "@/components/movies/movie-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function MovieDetailClient({ id, initialType }: { id: string, initialType: "movie" | "tv" }) {
  const type = initialType;
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const movieId = id;
    
    try {
      const [details, credits, videoRes, similarRes, providerRes] = await Promise.all([
        getDetails(movieId, type),
        getCredits(movieId, type),
        getVideos(movieId, type),
        getSimilar(movieId, type),
        getWatchProviders(movieId, type)
      ]);

      if (!details) {
        setError("Content not found");
      } else {
        setMovie(details);
        setCast(credits?.slice(0, 10) || []);
        setVideos(videoRes || []);
        setSimilar(similarRes || []);
        setProviders(providerRes || {});
        
        if (user) {
          const cwRef = doc(db, "users", user.uid, "continueWatching", movieId);
          setDoc(cwRef, {
            id: Number(movieId),
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

  useEffect(() => {
    if (!user || !id) return;
    const docRef = doc(db, "users", user.uid, "watchlist", id);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setIsInWatchlist(doc.exists());
    });
    return () => unsubscribe();
  }, [user, id]);

  const toggleWatchlist = () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const docRef = doc(db, "users", user.uid, "watchlist", id);
    if (isInWatchlist) {
      deleteDoc(docRef);
      toast({ title: "Removed from Watchlist" });
    } else {
      setDoc(docRef, {
        id: Number(id),
        title: movie.title || movie.name,
        poster: movie.poster_path,
        type: type,
        addedAt: Date.now()
      });
      toast({ title: "Added to Watchlist" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background space-y-8 pb-32">
        <div className="relative h-[70vh] w-full">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute bottom-0 left-0 p-6 md:p-16 w-full z-20 space-y-6">
            <Skeleton className="h-16 md:h-24 w-full max-w-3xl" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-20 w-full max-w-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold uppercase italic tracking-tighter">Content Unavailable</h2>
        <Button variant="outline" onClick={() => router.back()} className="rounded-full px-8">Go Back</Button>
      </div>
    );
  }

  const trailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const releaseYear = (movie.release_date || movie.first_air_date || "").split("-")[0];
  const regionData = providers?.['IN'] || providers?.['US'] || null;
  const watchLink = regionData?.link;
  const flatrate = regionData?.flatrate || [];
  const rent = regionData?.rent || [];
  const buy = regionData?.buy || [];
  const uniqueProviders = Array.from(new Map([...flatrate, ...rent, ...buy].map(p => [p.provider_id, p])).values());

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in">
      <div className="relative h-[70vh] w-full">
        {movie.backdrop_path ? (
          <Image
            src={getImageUrl(movie.backdrop_path, "original") || ""}
            alt={movie.title || movie.name || "Backdrop"}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-muted/20" />
        )}
        <div className="absolute inset-0 hero-gradient-overlay" />
        
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors z-30 border border-white/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="absolute bottom-0 left-0 p-6 md:p-16 w-full z-20 space-y-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none gold-gradient-text">
              {movie.title || movie.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white/80">
              <div className="flex items-center text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 glow-text-primary">
                <Star className="h-4 w-4 mr-1 fill-current" />
                {movie.vote_average?.toFixed(1) || "N/A"}
              </div>
              <span>{releaseYear || "N/A"}</span>
              {movie.runtime && <span>{movie.runtime} min</span>}
            </div>
          </div>

          <p className="text-sm md:text-lg text-muted-foreground leading-relaxed max-w-3xl line-clamp-4 font-medium italic">
            {movie.overview}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild className="gold-gradient text-black font-black px-10 h-14 rounded-full hover:scale-105 transition-all glow-primary">
              <a href={watchLink || "#"} target={watchLink ? "_blank" : "_self"} rel="noopener noreferrer">
                <Play className="mr-2 h-6 w-6 fill-current" /> WATCH NOW
              </a>
            </Button>
            <Button variant="outline" onClick={toggleWatchlist} className="rounded-full px-8 h-14 border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 font-black">
              {isInWatchlist ? <><Check className="mr-2 h-5 w-5 text-primary" /> IN WATCHLIST</> : <><Plus className="mr-2 h-5 w-5" /> ADD TO WATCHLIST</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-16 mt-12 space-y-20">
        <section className="space-y-8">
          <div className="border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white glow-text-primary">🎬 AVAILABLE ON</h2>
          </div>
          <div className="no-scrollbar flex gap-8 overflow-x-auto pb-6">
            {uniqueProviders.length > 0 ? uniqueProviders.map((provider: any) => (
              <div key={provider.provider_id} className="flex-shrink-0 flex flex-col items-center gap-4 group">
                <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-3xl overflow-hidden border border-white/10 bg-card/50 group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
                  <Image src={getImageUrl(provider.logo_path, "w185") || ""} alt={provider.provider_name} fill className="object-cover" sizes="(max-width: 768px) 80px, 96px" />
                </div>
                <span className="text-[12px] font-black text-white/60 group-hover:text-primary transition-colors uppercase italic">{provider.provider_name}</span>
              </div>
            )) : (
              <div className="p-8 bg-card/30 rounded-[2rem] border border-dashed border-white/5 w-full max-w-2xl text-white/50 font-bold uppercase italic">Availability Pending</div>
            )}
          </div>
        </section>

        {trailer && (
          <section className="space-y-8">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-white border-l-4 border-primary pl-6 glow-text-primary">OFFICIAL TRAILER</h2>
            <div className="aspect-video w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <iframe src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`} title="Trailer" className="w-full h-full" allowFullScreen loading="lazy" />
            </div>
          </section>
        )}

        {cast.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-white border-l-4 border-primary pl-6 glow-text-primary">TOP CAST</h2>
            <div className="no-scrollbar flex gap-8 overflow-x-auto pb-4">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-28 md:w-36 text-center space-y-4 group">
                  <div className="relative aspect-square rounded-full overflow-hidden border-2 border-white/5 group-hover:border-primary transition-all duration-500">
                    {person.profile_path ? <Image src={getImageUrl(person.profile_path, "w185") || ""} alt={person.name} fill className="object-cover" sizes="(max-width: 768px) 112px, 144px" /> : <div className="h-full w-full bg-muted flex items-center justify-center"><User className="h-10 w-10 text-muted-foreground/30" /></div>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white line-clamp-1 uppercase italic">{person.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground line-clamp-1 uppercase">{person.character}</p>
                  </div>
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
