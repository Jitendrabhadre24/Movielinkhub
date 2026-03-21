"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getMoviesByGenre, getTVByGenre, Movie } from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/movie-card";

export default function GenreDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const type = (searchParams.get("type") as "movie" | "tv") || "movie";

  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      const genreId = id as string;
      const results = type === "movie" 
        ? await getMoviesByGenre(genreId)
        : await getTVByGenre(genreId);
      setItems(results);
      setLoading(false);
    };
    loadItems();
  }, [id, type]);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      <header className="space-y-2 border-l-4 border-primary pl-4">
        <h1 className="text-4xl font-black font-headline tracking-tighter text-white uppercase italic">
          {name || "Genre"}
        </h1>
        <p className="text-muted-foreground font-medium">{type === "movie" ? "Movies" : "Series"}</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-card rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <MovieCard key={item.id} item={item} type={type} />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>No titles found in this category.</p>
        </div>
      )}
    </div>
  );
}
