"use client";

import { useState, useEffect, useCallback } from "react";
import { searchMovies, Movie } from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/movie-card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X, Loader2, Film, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_SEARCHES = ["Avengers", "Batman", "Star Wars", "John Wick", "Spider-Man", "Matrix"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchMovies(searchQuery);
      // Filter for premium look: only items with posters
      const filtered = data?.filter((item: any) => item.poster_path) || [];
      setResults(filtered);
    } catch (error) {
      console.warn("Search failed:", error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-primary font-black underline decoration-primary/30 underline-offset-2">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky Premium Search Bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-white/5 px-4 py-6 md:px-8">
        <div className="relative max-w-4xl mx-auto group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <SearchIcon className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            )}
          </div>
          
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for blockbusters, creators, or genres..."
            className="pl-14 pr-14 h-16 bg-card/40 border-white/10 focus:border-primary/40 focus:ring-primary/10 text-xl rounded-2xl transition-all shadow-2xl font-medium placeholder:text-muted-foreground/50"
            autoFocus
          />

          {query && (
            <button 
              onClick={handleClear}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-all text-muted-foreground hover:text-white group/clear"
            >
              <X className="h-5 w-5 group-hover:scale-110" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        {!query && !loading && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                <h2 className="text-sm font-black uppercase tracking-widest italic text-white/90">Popular Searches</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-6 py-2.5 bg-white/5 hover:bg-primary hover:text-black border border-white/10 rounded-full text-sm font-bold transition-all backdrop-blur-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20 pointer-events-none">
              <SearchIcon className="h-32 w-32 mb-2" />
              <p className="text-2xl font-black italic uppercase tracking-[0.2em]">Start Discovering</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-12">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest italic text-primary">Scanning Database...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-card rounded-2xl animate-pulse border border-white/5 shadow-inner" />
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-l-4 border-primary pl-6">
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tight text-white italic">
                  Search Results
                </h2>
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Found {results.length} titles matching "{query}"
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {results.map((item) => (
                <div key={item.id} className="space-y-3 group">
                  <MovieCard item={item} className="w-full" />
                  <div className="px-1">
                    <p className="text-xs font-bold text-white/80 line-clamp-1 group-hover:text-primary transition-colors">
                      {highlightMatch(item.title || item.name || "", query)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : hasSearched && (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative p-8 bg-card border border-white/5 rounded-full shadow-2xl">
                <Film className="h-16 w-16 text-muted-foreground/30" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">No Matches Found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
                We couldn't find anything matching <span className="text-primary italic">"{query}"</span>. 
                Try checking the spelling or use a different keyword.
              </p>
            </div>
            <button 
              onClick={handleClear}
              className="text-primary font-black uppercase text-sm tracking-widest hover:underline underline-offset-8"
            >
              Clear Search & Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
