"use client";

import { useState, useEffect } from "react";
import { searchMovies, Movie } from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/movie-card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const results = await searchMovies(query);
      setResults(results.filter((item: any) => item.poster_path));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md pt-4 pb-6">
        <div className="relative max-w-2xl mx-auto">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, series, or anime..."
            className="pl-10 h-12 bg-card border-primary/20 focus:ring-primary focus:border-primary text-lg rounded-full"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 animate-pulse">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-card rounded-md" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {results.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No results found for "{query}"</p>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">Try searching for your favorite titles</p>
          </div>
        )}
      </div>
    </div>
  );
}
