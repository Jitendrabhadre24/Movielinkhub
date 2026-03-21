"use client";

import { useState, useEffect } from "react";
import { searchMovies, Movie } from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/movie-card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X, Loader2, Film } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchMovies(query);
        // Filter out items without posters for a cleaner UI
        setResults(results.filter((item: any) => item.poster_path));
      } catch (error) {
        console.warn("Search failed:", error);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-6">
        <div className="relative max-w-3xl mx-auto group">
          <SearchIcon className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
            loading ? "text-primary animate-pulse" : "text-muted-foreground group-focus-within:text-primary"
          )} />
          
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, series, or actors..."
            className="pl-12 pr-12 h-14 bg-card/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-lg rounded-2xl transition-all shadow-2xl"
            autoFocus
          />

          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {loading ? (
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-bold uppercase tracking-widest italic">Searching database...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-card rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest italic text-white/60">
                Top Results for "{query}"
              </h2>
              <span className="text-xs font-mono text-muted-foreground">{results.length} found</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {results.map((item) => (
                <MovieCard key={item.id} item={item} className="w-full" />
              ))}
            </div>
          </div>
        ) : hasSearched ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-white/5 rounded-full">
              <Film className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">No matches found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                We couldn't find anything for "{query}". Try a different title or keyword.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 text-muted-foreground/40">
            <SearchIcon className="h-16 w-16 mb-2" />
            <p className="text-lg font-medium italic">Discover your next favorite story...</p>
          </div>
        )}
      </div>
    </div>
  );
}
