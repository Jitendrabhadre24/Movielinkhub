"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getDetails, getCredits, getVideos, getSimilar, getImageUrl, Movie, Cast } from "@/lib/tmdb";
import Image from "next/image";
import { Play, Star, Calendar, Clock, ArrowLeft, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieRow } from "@/components/movies/movie-row";
import { Skeleton } from "@/components/ui/skeleton";

export default function MovieDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "movie" | "tv") || "movie";
  const router = useRouter();

  const [movie, setMovie] = useState<any>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const movieId = id as string;
    
    try {
      const [details, credits, videoRes, similarRes] = await Promise.all([
        getDetails(movieId, type),
        getCredits(movieId, type),
        getVideos(movieId, type),
        getSimilar(movieId, type),
      ]);

      if (!details) {
        setError("Please disable ad blocker or check connection");
      } else {
        setMovie(details);
        setCast(credits?.slice(0, 10) || []);
        setVideos(videoRes || []);
        setSimilar(similarRes || []);
      }
    } catch (err) {
      console.error("Blocked or failed:", err);
      setError("Please disable ad blocker or check connection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background space-y-8 pb-20">
        <Skeleton className="h-[60vh] w-full" />
        <div className="px-6 md:px-16 space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6">
        <div className="p-4 bg-muted rounded-full">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Content Unavailable</h2>
          <p className="text-muted-foreground max-w-sm">
            {error || "We couldn't retrieve the details for this title."}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-full hover:bg-white/5 transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={fetchData} 
            className="px-6 py-2 bg-primary text-black font-bold rounded-full hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const trailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const releaseYear = (movie.release_date || movie.first_air_date || "").split("-")[0];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full">
        {movie.backdrop_path ? (
          <Image
            src={getImageUrl(movie.backdrop_path, "original") || ""}
            alt={movie.title || movie.name || "Backdrop"}
            fill
            className="object-cover opacity-60"
            priority
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
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
              {movie.title || movie.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white/80">
              <div className="flex items-center text-primary">
                <Star className="h-4 w-4 mr-1 fill-current" />
                {movie.vote_average?.toFixed(1) || "N/A"}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 opacity-60" />
                {releaseYear || "N/A"}
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 opacity-60" />
                  {movie.runtime} min
                </div>
              )}
              {movie.genres && (
                <div className="flex gap-2">
                  {movie.genres.slice(0, 2).map((g: any) => (
                    <span key={g.id} className="bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-sm md:text-lg text-muted-foreground leading-relaxed max-w-3xl line-clamp-4 font-medium">
            {movie.overview || "No overview available."}
          </p>

          <div className="flex justify-start pt-2">
            <Button className="gold-gradient text-black font-black px-8 h-12 rounded-full hover:scale-105 transition-transform active:scale-95 border-none shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              <Play className="mr-2 h-5 w-5 fill-current" /> WATCH NOW
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-16 mt-12 space-y-16">
        {/* Trailer Section */}
        {trailer && (
          <section className="space-y-6">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <span className="h-6 w-1 bg-primary rounded-full" />
              OFFICIAL TRAILER
            </h2>
            <div className="aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`}
                title="Trailer"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <span className="h-6 w-1 bg-primary rounded-full" />
              TOP CAST
            </h2>
            <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-24 md:w-32 text-center space-y-3 group">
                  <div className="relative aspect-square rounded-full overflow-hidden border-2 border-white/5 group-hover:border-primary transition-colors">
                    {person.profile_path ? (
                      <Image
                        src={getImageUrl(person.profile_path, "w185") || ""}
                        alt={person.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs md:text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{person.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <MovieRow title="YOU MAY ALSO LIKE" items={similar} type={type} />
        )}
      </div>
    </div>
  );
}
