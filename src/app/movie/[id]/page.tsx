"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { tmdb, Movie } from "@/lib/tmdb";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import { Play, Plus, Check, Star, Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieRow } from "@/components/movies/movie-row";
import { useToast } from "@/hooks/use-toast";

export default function MovieDetail() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "movie" | "tv") || "movie";
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [movie, setMovie] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [details, recs] = await Promise.all([
          tmdb.getDetails(id as string, type),
          tmdb.getRecommendations(id as string, type),
        ]);
        setMovie(details);
        setRecommendations(recs?.results || []);
      } catch (error) {
        console.error("Error loading movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type]);

  useEffect(() => {
    if (!user || !id) return;

    const watchlistRef = doc(db, "users", user.uid, "watchlist", id as string);
    const unsubscribe = onSnapshot(watchlistRef, (doc) => {
      setInWatchlist(doc.exists());
    });

    return () => unsubscribe();
  }, [user, id]);

  const toggleWatchlist = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const ref = doc(db, "users", user.uid, "watchlist", id as string);
    try {
      if (inWatchlist) {
        await deleteDoc(ref);
        toast({ title: "Removed from Watchlist" });
      } else {
        await setDoc(ref, {
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          type,
          addedAt: serverTimestamp(),
        });
        toast({ title: "Added to Watchlist" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

  const handlePlay = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    // Simulate starting to watch
    const ref = doc(db, "users", user.uid, "continueWatching", id as string);
    await setDoc(ref, {
      id: movie.id,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      type,
      updatedAt: serverTimestamp(),
      progress: 0.1, // mock progress
    });
    
    // In a real app, this would redirect to a player
    toast({ title: "Resuming playback..." });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie || (!movie.title && !movie.name)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Content Not Found</h2>
        <p className="text-muted-foreground">We couldn't retrieve the details for this title.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[60vh] md:h-[70vh]">
        <Image
          src={tmdb.getImageUrl(movie.backdrop_path, "original") || ""}
          alt={movie.title || movie.name || "Backdrop"}
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors z-20"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="absolute bottom-0 left-0 p-6 md:p-16 w-full flex flex-col md:flex-row gap-8 items-end">
          <div className="hidden md:block relative w-64 aspect-[2/3] rounded-lg overflow-hidden border-2 border-primary/20 shadow-2xl bg-card">
            {movie.poster_path ? (
              <Image
                src={tmdb.getImageUrl(movie.poster_path) || ""}
                alt={movie.title || movie.name || "Poster"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground text-center p-4">
                No Poster Available
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-white uppercase italic">
              {movie.title || movie.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center text-primary">
                <Star className="h-4 w-4 mr-1 fill-current" />
                {movie.vote_average?.toFixed(1) || "0.0"}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {movie.release_date || movie.first_air_date || "N/A"}
              </div>
              {movie.runtime && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {movie.runtime} min
                </div>
              )}
            </div>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl line-clamp-4">
              {movie.overview || "No overview available for this title."}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button onClick={handlePlay} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 h-12 text-lg">
                <Play className="mr-2 h-6 w-6 fill-current" /> Watch Now
              </Button>
              <Button 
                variant="outline" 
                onClick={toggleWatchlist} 
                className="border-primary/50 text-primary hover:bg-primary/10 h-12"
              >
                {inWatchlist ? (
                  <><Check className="mr-2 h-5 w-5" /> In Watchlist</>
                ) : (
                  <><Plus className="mr-2 h-5 w-5" /> Watchlist</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 md:px-16 space-y-12">
        <MovieRow title="More Like This" items={recommendations} />
      </div>
    </div>
  );
}
