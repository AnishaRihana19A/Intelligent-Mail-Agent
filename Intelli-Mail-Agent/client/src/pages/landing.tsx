import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Sparkles, Zap, Shield, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null; // Prevent flash before redirect

  return (
    <div className="flex min-h-screen w-full bg-zinc-950 text-zinc-50 font-sans">
      {/* Left Panel - Branding/Hero */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-zinc-950 border-r border-white/5">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30 shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            Donut's Mailer
          </span>
        </motion.div>

        <div className="relative z-10 my-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
          >
            The Intelligent <br />
            <span className="text-gradient-primary">Cold Calling Agent</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-zinc-400 max-w-md mb-12 leading-relaxed"
          >
            Automate your outreach with AI. Generate highly personalized emails based on target company profiles and smart templates.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="flex flex-col gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-zinc-200">AI-Powered</h3>
              <p className="text-sm text-zinc-500">Context-aware email generation that sounds human.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-zinc-200">Smart Templates</h3>
              <p className="text-sm text-zinc-500">Easily switch between formal and casual tones.</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative z-10 text-sm text-zinc-500 flex justify-between items-center"
        >
          <span>© {new Date().getFullYear()} Donut's Mailer. All rights reserved.</span>
          <div className="flex items-center gap-1 text-zinc-400">
            <Shield className="h-4 w-4" /> Secure & Enterprise Ready
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Auth */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-zinc-950 lg:bg-zinc-900/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10"
        >
          {/* Mobile Branding */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">
              Donut's Mailer
            </span>
          </div>

          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white mb-3">
              Welcome back
            </h2>
            <p className="text-zinc-400 text-sm">
              Log in with your enterprise account to access your automated campaigns.
            </p>
          </div>

          <Button 
            className="w-full h-12 text-base font-semibold rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 hover:-translate-y-0.5 transition-all duration-200 shadow-xl shadow-white/10"
            onClick={() => window.location.href = "/api/login"}
          >
            Log in with Replit <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-500">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
