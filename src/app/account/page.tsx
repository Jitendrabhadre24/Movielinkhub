"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { MovieRow } from "@/components/movies/movie-row";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const watchlistQuery = query(
      collection(db, "users", user.uid, "watchlist"),
      orderBy("addedAt", "desc")
    );
    const continueQuery = query(
      collection(db, "users", user.uid, "continueWatching"),
      orderBy("updatedAt", "desc"),
      limit(10)
    );

    const unsubWatchlist = onSnapshot(watchlistQuery, (snapshot) => {
      setWatchlist(snapshot.docs.map(doc => doc.data()));
    });

    const unsubContinue = onSnapshot(continueQuery, (snapshot) => {
      setContinueWatching(snapshot.docs.map(doc => doc.data()));
    });

    return () => {
      unsubWatchlist();
      unsubContinue();
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 md:p-10 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
            <UserIcon className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-headline tracking-tighter text-white uppercase italic">MY ACCOUNT</h1>
            <p className="text-muted-foreground font-mono text-sm">{user.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive h-12 px-8"
        >
          <LogOut className="mr-2 h-5 w-5" /> Logout
        </Button>
      </header>

      <Separator className="bg-primary/10" />

      <div className="space-y-4">
        <MovieRow 
          title="Continue Watching" 
          items={continueWatching.map(item => ({...item, media_type: item.type}))} 
        />
        {continueWatching.length === 0 && (
          <div className="px-4 text-muted-foreground text-sm italic">
            You haven't started any shows yet.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <MovieRow 
          title="My Watchlist" 
          items={watchlist.map(item => ({...item, media_type: item.type}))} 
        />
        {watchlist.length === 0 && (
          <div className="px-4 text-muted-foreground text-sm italic">
            Your watchlist is empty. Add movies to watch later!
          </div>
        )}
      </div>
    </div>
  );
}