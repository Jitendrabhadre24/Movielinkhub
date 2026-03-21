"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Settings, Bell, CreditCard, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const menuItems = [
    { icon: Settings, label: "App Settings" },
    { icon: Bell, label: "Notifications" },
    { icon: CreditCard, label: "Subscription" },
    { icon: Shield, label: "Privacy & Security" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/50 p-6 md:p-10 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <UserIcon className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
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

      <div className="grid gap-4">
        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            className="flex items-center justify-between p-5 bg-card/30 hover:bg-card/50 rounded-2xl border border-white/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-semibold text-white/80">{item.label}</span>
            </div>
          </button>
        ))}
      </div>

      <Separator className="bg-white/5" />

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">MovieLink Hub v1.0.4</p>
        <p className="text-[10px] text-muted-foreground/50">Made for premium cinematic experiences.</p>
      </div>
    </div>
  );
}