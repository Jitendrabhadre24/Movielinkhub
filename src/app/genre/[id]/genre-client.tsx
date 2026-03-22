
"use client";

import { useEffect, useState, useCallback } from "react";
import { discoverContent, Movie, DiscoverFilters, TMDBError } from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/movie-card";
import { ChevronLeft, ChevronRight, AlertCircle, ArrowLeft, Filter, X, RefreshCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const RATINGS = [
  { label: "7+ ⭐", value: "7" },
  { label: "8+ ⭐", value: "8" },
];

const YEARS = [
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
  { label: "2020+", value: "2020+" },
];

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Korean", value: "ko" },
  { label: "Japanese", value: "ja" },
];

const SORT_OPTIONS = [
  { label: "Popular", value: "popularity.desc" },
  { label: "Top Rated", value: "vote_average.desc" },
  { label: "Latest", value: "primary_release_date.desc" },
];

const MIN_LOAD_TIME = 2000;

export default function GenreClient({ id, name, type, initialPage }: GenreClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: string } | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  
  const [activeFilters, setActiveFilters] = useState<DiscoverFilters>({
    sortBy: "popularity.desc"
  });

  const loadItems = useCallback(async () => {
    const startTime = Date.now();
    setLoading(true);
    setError(null);
    try {
      const data = await discoverContent(type, id, page, activeFilters);
      if (data) {
        setItems(data.results);
        setTotalPages(data.total_pages);
      } else {
        throw new TMDBError('SERVER_ERROR', 'Unable to fetch items');
      }
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      const wait = Math.max(0, MIN_LOAD_TIME - elapsed);
      await new Promise(r => setTimeout(r, wait));

      if (err instanceof TMDBError) {
        setError({ message: err.message, type: err.type });
      } else {
        setError({ message: "Network failure", type: "OFFLINE" });
      }
    } finally {
      setLoading(false);
    }
  }, [id, type, page, activeFilters]);

  useEffect(() => {
    loadItems();
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    window.history.pushState({}, "", url);
  }, [loadItems, page]);

  const handleFilterToggle = (key: keyof DiscoverFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({ sortBy: "popularity.desc" });
    setPage(1);
  };

  const hasActiveFilters = activeFilters.rating || activeFilters.year || activeFilters.language || activeFilters.sortBy !== "popularity.desc";

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-32 max-w-7xl mx-auto animate-fade-in">
      <header className="flex flex-col gap-6">
        <button 
          onClick={() => router.push('/genres')}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs font-black uppercase tracking-widest italic"
        >
          <ArrowLeft className="h-4 w-4" /> BACK TO DISCOVERY
        </button>
        <div className="space-y-2 border-l-4 border-primary pl-6">
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-white uppercase italic leading-none">
            {name || "Category"}
          </h1>
        </div>
      </header>

      <section className="sticky top-0 z-40 space-y-4 bg-background/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/5 shadow-2xl transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-white/80">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest italic">REFINE SEARCH</h2>
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              <X className="h-3 w-3" /> CLEAR ALL
            </button>
          )}
        </div>

        <div className="no-scrollbar flex flex-wrap gap-6 overflow-x-auto">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">RATING</span>
            <div className="flex gap-2">
              {RATINGS.map(f => (
                <FilterChip 
                  key={f.value} 
                  label={f.label} 
                  active={activeFilters.rating === f.value} 
                  onClick={() => handleFilterToggle('rating', f.value)} 
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">YEAR</span>
            <div className="flex gap-2">
              {YEARS.map(f => (
                <FilterChip 
                  key={f.value} 
                  label={f.label} 
                  active={activeFilters.year === f.value} 
                  onClick={() => handleFilterToggle('year', f.value)} 
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">LANG</span>
            <div className="flex gap-2">
              {LANGUAGES.map(f => (
                <FilterChip 
                  key={f.value} 
                  label={f.label} 
                  active={activeFilters.language === f.value} 
                  onClick={() => handleFilterToggle('language', f.value)} 
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">SORT</span>
            <div className="flex gap-2">
              {SORT_OPTIONS.map(f => (
                <FilterChip 
                  key={f.value} 
                  label={f.label} 
                  active={activeFilters.sortBy === f.value} 
                  onClick={() => handleFilterToggle('sortBy', f.value)} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-in fade-in zoom-in">
          <div className="p-8 bg-card border border-white/5 rounded-full">
            {error.type === 'OFFLINE' ? <WifiOff className="h-12 w-12 text-primary" /> : <AlertCircle className="h-12 w-12 text-primary" />}
          </div>
          <div className="space-y-2">
             <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{error.message}</h3>
             <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">{error.type}</p>
          </div>
          <Button onClick={loadItems} className="rounded-full px-12 h-14 bg-primary text-black font-black italic"><RefreshCcw className="mr-2 h-4 w-4" /> RETRY LOAD</Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {items.map((item) => (
              <MovieCard key={item.id} item={item} type={type} className="w-full" />
            ))}
          </div>

          <div className="flex items-center justify-center gap-8 pt-8">
            <Button
              variant="outline"
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-black tracking-widest h-12 px-8 uppercase italic"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> PREV
            </Button>
            <div className="text-xs font-black text-primary font-mono tracking-widest uppercase italic">
              PAGE {page} OF {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === totalPages}
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-black tracking-widest h-12 px-8 uppercase italic"
            >
              NEXT <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-card/10 space-y-4">
          <h3 className="text-xl font-black text-white/50 uppercase italic tracking-tighter">NO TITLES FOUND</h3>
          <Button onClick={clearFilters} variant="link" className="text-primary font-black uppercase italic tracking-widest">Reset All Filters</Button>
        </div>
      )}
    </div>
  );
}

interface GenreClientProps {
  id: string;
  name: string;
  type: "movie" | "tv";
  initialPage: number;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 italic",
        active 
          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(255,215,0,0.3)]" 
          : "bg-white/5 text-white/40 border-white/10 hover:border-white/30 hover:bg-white/10 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}
