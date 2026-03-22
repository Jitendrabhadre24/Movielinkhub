"use client";

import { useUser, useFirestore, useMemoFirebase, useCollection, useAuth as useFirebaseAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Bookmark, ShieldCheck, Zap, LayoutGrid, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { collection, query, orderBy } from "firebase/firestore";
import { MovieCard } from "@/components/movies/movie-card";

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const watchlistQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "users", user.uid, "watchlist"),
      orderBy("addedAt", "desc")
    );
  }, [user, firestore]);

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "users", user.uid, "continueWatching"),
      orderBy("lastWatchedAt", "desc")
    );
  }, [user, firestore]);

  const { data: watchlist, isLoading: loadingWatchlist } = useCollection(watchlistQuery);
  const { data: history, isLoading: loadingHistory } = useCollection(historyQuery);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  if (isUserLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0B0B]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-16 max-w-7xl mx-auto pb-32 animate-fade-in">
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 bg-card/40 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-[2rem] bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center border border-primary/20 shadow-2xl">
            <UserIcon className="h-12 w-12 text-primary" />
            <div className="absolute -bottom-2 -right-2 bg-primary text-black p-1.5 rounded-lg shadow-lg">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                {user ? "MASTER PROFILE" : "GUEST MODE"}
              </h1>
              {user && <Zap className="h-5 w-5 text-primary fill-primary animate-pulse" />}
            </div>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">
              {user ? user.email : "Initialize account to sync preferences"}
            </p>
          </div>
        </div>
        {user ? (
          <Button variant="outline" onClick={handleSignOut} className="border-white/10 text-white/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-xl px-8 h-12 uppercase font-black italic tracking-tighter">
            <LogOut className="mr-2 h-4 w-4" /> Termination
          </Button>
        ) : (
          <Button onClick={() => router.push("/auth")} className="bg-primary hover:bg-primary/90 text-black font-black uppercase italic tracking-tighter rounded-xl px-12 h-14 glow-primary">
            Authenticate Now
          </Button>
        )}
      </header>

      {user && (
        <div className="space-y-20">
          {/* Watchlist Section */}
          <section className="space-y-10">
            <div className="flex items-center justify-between border-l-4 border-primary pl-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Bookmark className="h-6 w-6 text-primary fill-primary" />
                  <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">SECURED WATCHLIST</h2>
                </div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">SYNCHRONIZED ARCHIVE</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <span className="text-xs font-black text-primary font-mono uppercase tracking-widest">{watchlist?.length || 0} TITLES</span>
              </div>
            </div>

            {loadingWatchlist ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] skeleton rounded-[1.5rem]" />)}
              </div>
            ) : watchlist && watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {watchlist.map((item: any) => (
                  <MovieCard key={item.id} item={{...item, poster_path: item.poster} as any} type={item.type} className="w-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 border border-dashed border-white/5 rounded-[3rem] bg-card/20 backdrop-blur-sm">
                <Bookmark className="h-16 w-16 text-white/10" />
                <p className="text-xl font-black text-white/30 uppercase italic tracking-tighter">Your archive is currently empty</p>
                <Button onClick={() => router.push("/")} className="bg-white/5 hover:bg-white/10 text-primary font-black uppercase italic tracking-widest rounded-xl px-8 h-12 border border-white/5">
                  Start Browsing
                </Button>
              </div>
            )}
          </section>

          {/* History Section */}
          <section className="space-y-10">
            <div className="flex items-center justify-between border-l-4 border-white/20 pl-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-white/40" />
                  <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">STREAMING HISTORY</h2>
                </div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">RESUME CONTENT</p>
              </div>
            </div>

            {loadingHistory ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] skeleton rounded-[1.5rem]" />)}
              </div>
            ) : history && history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {history.map((item: any) => (
                  <MovieCard key={item.id} item={{...item, poster_path: item.poster} as any} type={item.type} className="w-full" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 opacity-30 uppercase font-black tracking-widest text-xs italic">
                No streaming activity recorded
              </div>
            )}
          </section>
        </div>
      )}

      <Separator className="bg-white/5" />
      <footer className="text-center space-y-2 opacity-30 pb-10">
        <p className="text-[10px] text-white font-black uppercase tracking-[0.5em]">MOVIELINK HUB v2.0.4 PREMIUM</p>
      </footer>
    </div>
  );
}
