"use client";

import { useEffect, useState, use } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getMoviesByGenre, getTVByGenre, Movie } from "@/lib/tmdb";
import { MovieCard } from "@/components/movies/movie-card";
import { ChevronLeft, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GenreDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = params.id as string;
  const name = searchParams.get("name");
  const type = (searchParams.get("type") as "movie" | "tv") || "movie";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = type === "movie" 
          ? await getMoviesByGenre(id, page)
          : await getTVByGenre(id, page);
        
        if (data) {
          setItems(data.results);
          setTotalPages(data.total_pages);
        } else {
          setError("Please disable ad blocker or check connection");
        }
      } catch (err) {
        setError("Failed to fetch content. Check your connection.");
      } finally {
        setLoading(false);
      }
    };
    loadItems();
    
    // Update URL without refreshing to keep state in sync
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    window.history.pushState({}, "", url);
  }, [id, type, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-32">
      <header className="flex flex-col gap-4">
        <button 
          onClick={() => router.push('/genres')}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Genres
        </button>
        <div className="space-y-1 border-l-4 border-primary pl-4">
          <h1 className="text-4xl font-black font-headline tracking-tighter text-white uppercase italic">
            {name || "Category"}
          </h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-tighter">
            {type === "movie" ? "Feature Films" : "Television Series"} • Page {page} of {totalPages}
          </p>
        </div>
      </header>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground max-w-xs">{error}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-card rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {items.map((item) => (
              <MovieCard key={item.id} item={item} type={type} className="w-full" />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={page === 1}
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <div className="text-sm font-mono text-muted-foreground">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground italic border border-dashed border-white/5 rounded-3xl">
          <p>No titles found in this category.</p>
        </div>
      )}
    </div>
  );
}
