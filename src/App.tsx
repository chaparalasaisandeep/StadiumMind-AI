import React, { useState, useEffect, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { m, AnimatePresence, LazyMotion, domAnimation } from "motion/react";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrainCircuit } from "lucide-react";

// Lazy-loaded route level components
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPages = lazy(() => import("./pages/AuthPages"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

// Clean, immersive loading screen fallback
function PremiumSuspenseLoader() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans animate-fade-in">
      <div className="space-y-4 flex flex-col items-center">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 text-[#6EB8E1] rounded-2xl relative animate-pulse">
          <BrainCircuit className="h-7 w-7 text-[#6EB8E1] animate-spin" style={{ animationDuration: "3s" }} />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#C8ABE6] rounded-full animate-ping"></span>
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest">StadiumMind AI</h4>
          <p className="text-[10px] text-slate-500 font-mono">Initializing Cognitive Layer...</p>
        </div>
      </div>
    </div>
  );
}

function RootNavigationRouter() {
  const { user, loading } = useAuth();
  
  // Start on landing by default; the loading spinner blocks rendering until Auth resolves
  const [route, setRoute] = useState<"landing" | "auth" | "dashboard">("landing");

  // Automatic session synchronization for optimized startup speed and persistence
  useEffect(() => {
    if (!loading) {
      if (user) {
        setRoute("dashboard");
      } else {
        setRoute("landing");
      }
    }
  }, [user, loading]);

  const handleGetStarted = () => {
    if (user) {
      setRoute("dashboard");
    } else {
      setRoute("auth");
    }
  };

  const handleAuthSuccess = () => {
    setRoute("dashboard");
  };

  const handleLogoutSuccess = () => {
    setRoute("landing");
  };

  // Block route rendering and wait for Firebase Auth to finish initializing
  if (loading) {
    return <PremiumSuspenseLoader />;
  }

  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 overflow-hidden">
      <Suspense fallback={<PremiumSuspenseLoader />}>
        <AnimatePresence mode="wait">
          {route === "landing" && (
            <m.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <LandingPage 
                onGetStarted={handleGetStarted} 
                onGoToAuth={() => setRoute("auth")} 
              />
            </m.div>
          )}

          {route === "auth" && (
            <m.div
              key="auth"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <AuthPages 
                onAuthSuccess={handleAuthSuccess} 
                onBackToLanding={() => setRoute("landing")} 
              />
            </m.div>
          )}

          {route === "dashboard" && (
            <m.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <DashboardPage onLogout={handleLogoutSuccess} />
            </m.div>
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LazyMotion features={domAnimation}>
        <AuthProvider>
          <RootNavigationRouter />
        </AuthProvider>
      </LazyMotion>
    </ErrorBoundary>
  );
}
