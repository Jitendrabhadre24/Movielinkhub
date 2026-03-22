"use client";

import { useState, useEffect } from "react";
import { searchMovies, Movie } from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/movie-card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X, Loader2, Film, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const POPULAR_SEARCHES = ["AVENGERS", "BATMAN", "STAR WARS", "JOHN WICK", "SPIDER-MAN", "MATRIX"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const data = await searchMovies(searchQuery);
      const filtered = data?.filter((item: any) => item.poster_path) || [];
      setResults(filtered);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in pt-16 sm:pt-20">
      <div className="sticky top-16 sm:top-20 z-30 bg-background/80 backdrop-blur-2xl border-b border-white/5 px-4 py-4 sm:py-6">
        <div className="relative max-w-4xl mx-auto group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <SearchIcon className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />}
          </div>
          
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blockbusters or creators..."
            className="pl-12 pr-12 h-14 sm:h-16 bg-card/40 border-white/10 focus:border-primary/40 focus:ring-primary/10 text-base sm:text-xl rounded-2xl transition-all shadow-2xl font-medium"
            autoFocus
          />

          {query && (
            <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 sm:mt-16">
        {!query && !loading && (
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest italic text-white/90">POPULAR QUERIES</h2>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-5 py-2 sm:px-6 sm:py-2.5 bg-white/5 hover:bg-primary hover:text-black border border-white/10 rounded-full text-[10px] sm:text-xs font-black transition-all backdrop-blur-sm uppercase italic"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid-container">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] skeleton rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-l-4 border-primary pl-4 sm:pl-6">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white italic">MATCHING TITLES</h2>
                <p className="text-[8px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-widest">FOUND {results.length} RESULTS FOR "{query.toUpperCase()}"</p>
              </div>
            </div>
            <div className="grid-container">
              {results.map((item) => (
                <MovieCard key={item.id} item={item} className="w-full" />
              ))}
            </div>
          </div>
        ) : hasSearched && (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-8">
            <Film className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">NO MATCHES FOUND</h3>
            <button onClick={handleClear} className="text-primary font-black uppercase text-xs sm:text-sm tracking-widest hover:underline underline-offset-8 italic">CLEAR ARCHIVE SEARCH</button>
          </div>
        )}
      </div>
    </div>
  );
}