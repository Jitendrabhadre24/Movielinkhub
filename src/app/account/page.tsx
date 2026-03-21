
"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Star, Bookmark, History } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { MovieCard } from "@/components/movies/movie-card";
import { Movie } from "@/lib/tmdb";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "watchlist"),
      orderBy("addedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        poster_path: doc.data().poster
      }));
      setWatchlist(items);
      setLoadingWatchlist(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/50 p-6 md:p-10 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <UserIcon className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
              {user ? "PROFILE" : "GUEST MODE"}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              {user ? user.email : "Sign in to sync your watchlist"}
            </p>
          </div>
        </div>
        {user ? (
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        ) : (
          <Button 
            onClick={() => router.push("/auth")}
            className="bg-primary hover:bg-primary/90 text-black font-bold rounded-full px-8"
          >
            Sign In
          </Button>
        )}
      </header>

      {user && (
        <section className="space-y-8">
          <div className="flex items-center justify-between border-l-4 border-primary pl-4">
            <div className="flex items-center gap-3">
              <Bookmark className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">MY WATCHLIST</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground uppercase">{watchlist.length} TITLES</span>
          </div>

          {loadingWatchlist ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-card animate-pulse rounded-2xl border border-white/5" />
              ))}
            </div>
          ) : watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {watchlist.map((item) => (
                <MovieCard key={item.id} item={item as Movie} type={item.type} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-white/5 rounded-3xl bg-card/20">
              <Bookmark className="h-12 w-12 text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-lg font-bold text-white/50">Your watchlist is empty</p>
                <p className="text-sm text-muted-foreground">Add movies you want to watch later.</p>
              </div>
              <Button onClick={() => router.push("/")} variant="link" className="text-primary font-bold">Browse Content</Button>
            </div>
          )}
        </section>
      )}

      <Separator className="bg-white/5" />

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">MovieLink Hub v1.0.8</p>
        <p className="text-[10px] text-muted-foreground/50">Premium Watchlist & Viewing History Enabled.</p>
      </div>
    </div>
  );
}
