"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Sparkles } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ 
          title: "WELCOME BACK", 
          description: "Accessing your premium hub..." 
        });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ 
          title: "ACCOUNT CREATED", 
          description: "Welcome to the future of cinematic discovery." 
        });
      }
      router.push("/account");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "AUTHENTICATION FAILED", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0B0B] relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center animate-slow-zoom" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/80 to-[#0B0B0B]" />
      
      <div className="relative w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-widest uppercase">PREMIUM ACCESS</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
            MOVIE<span className="text-primary">LINK</span>
          </h1>
          <p className="text-white/60 font-medium text-sm">
            {isLogin ? "Sign in to resume your cinematic journey" : "Create a new profile for ultimate discovery"}
          </p>
        </div>

        <div className="bg-card/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[2rem] shadow-2xl space-y-6">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl focus:border-primary/50 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Secure Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl focus:border-primary/50 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
            </div>

            <Button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-black h-14 text-lg font-black uppercase tracking-tighter italic rounded-xl glow-primary transition-all active:scale-95 mt-4"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                isLogin ? "Enter the Hub" : "Initialize Account"
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-white/5">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/40 hover:text-primary text-[11px] font-black uppercase tracking-widest transition-all italic"
            >
              {isLogin ? "Need an account? Sign up here" : "Already registered? Login now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
