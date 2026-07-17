import React, { useState } from "react";
import { 
  Tv2, 
  ChevronRight, 
  ShieldAlert, 
  Users, 
  MapPin, 
  BrainCircuit, 
  Accessibility, 
  Compass, 
  TrendingUp, 
  Award,
  Zap,
  Leaf,
  Layers
} from "lucide-react";
import { Button } from "../components/ui/Button";

interface LandingPageProps {
  onGetStarted: () => void;
  onGoToAuth: () => void;
}

export default function LandingPage({ onGetStarted, onGoToAuth }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<"fans" | "staff" | "security">("fans");

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden antialiased">
      {/* Dynamic Header / Navigation */}
      <nav className="border-b border-slate-900 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6EB8E1]/10 border border-[#6EB8E1]/30 rounded-xl">
              <Tv2 className="h-5.5 w-5.5 text-[#6EB8E1]" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white font-display">StadiumMind AI</h2>
              <span className="text-[10px] font-mono text-slate-400">FIFA 2026 OFFICIAL SUITE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGoToAuth}
              className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Sign In
            </button>
            <Button 
              onClick={onGetStarted}
              variant="primary" 
              size="sm"
            >
              Launch Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden border-b border-slate-900/50">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-[#C8ABE6]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero text */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-950/40 border border-sky-500/20 text-sky-400 rounded-full text-xs font-semibold tracking-wide">
              <Award className="h-3.5 w-3.5" />
              Hack2Skill PromptWars Challenge Entry
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-display">
              The AI Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-[#6EB8E1] to-[#C8ABE6]">FIFA World Cup 2026</span> Stadiums.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              StadiumMind AI coordinates gate loads, medical dispatch, transport schedules, accessibility routes, and high-thinking tactical evacuations across host venues in USA, Canada, and Mexico.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button 
                onClick={onGetStarted}
                variant="primary" 
                size="lg" 
                className="group flex items-center gap-2"
              >
                Launch Enterprise Suite
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button 
                onClick={onGoToAuth}
                variant="outline" 
                size="lg"
              >
                Setup Authority Profile
              </Button>
            </div>
          </div>

          {/* Animated Stadium CSS/SVG Mockup */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-[480px] bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-slate-500 bg-slate-900/40 border-b border-l border-slate-900 rounded-bl-xl">
                SYSTEM_MODEL // ACTIVE
              </div>

              {/* Graphical CSS Mockup of Stadium pitch and seats */}
              <div className="relative border border-slate-800 rounded-2xl p-4 bg-[#020617] h-[260px] flex flex-col justify-between overflow-hidden">
                {/* Outermost seats */}
                <div className="border border-sky-500/20 rounded-xl h-full w-full p-2 flex flex-col justify-between relative">
                  
                  {/* Seating tiers mockup */}
                  <div className="absolute inset-x-4 top-2 h-4 border-b border-sky-500/10 flex justify-between">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 bg-[#6EB8E1]/40 rounded-full" />
                    ))}
                  </div>

                  <div className="absolute inset-x-4 bottom-2 h-4 border-t border-sky-500/10 flex justify-between">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 bg-[#C8ABE6]/40 rounded-full animate-pulse" />
                    ))}
                  </div>

                  {/* Inner Soccer Pitch */}
                  <div className="border border-[#6EB8E1]/20 rounded-lg flex-1 m-4 flex items-center justify-center relative bg-emerald-950/20">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-4 border-y border-r border-[#6EB8E1]/30" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-4 border-y border-l border-[#6EB8E1]/30" />
                    <div className="h-full w-[1px] bg-[#6EB8E1]/30 absolute left-1/2" />
                    <div className="h-10 w-10 rounded-full border border-[#6EB8E1]/30 flex items-center justify-center">
                      <div className="h-1 w-1 bg-[#6EB8E1] rounded-full" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Status overlay */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-slate-900/60 border border-slate-850 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Gate Ingress</span>
                  <span className="text-xs font-bold text-white mt-1 block">82,450 / Min</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Heat Balance</span>
                  <span className="text-xs font-bold text-emerald-400 mt-1 block">94% Safe</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Dispatch ETA</span>
                  <span className="text-xs font-bold text-[#C8ABE6] mt-1 block">3.4 Mins</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Statistics Section */}
      <section className="py-12 bg-slate-950 border-y border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h4 className="text-3xl font-extrabold text-white">16</h4>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">Host Venues Prepared</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-[#6EB8E1]">100%</h4>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">WCAG AA Accessible</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-[#C8ABE6]">2.4s</h4>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">AI Route Recalculation</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-emerald-400">98%</h4>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">Sustainability Index</p>
          </div>
        </div>
      </section>

      {/* Role Tabs Feature Cards Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Enterprise Operations, Multiplied.</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            One dynamic system partition containing specialized interfaces for every core tournament stakeholder.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 hover:shadow-2xl transition-all duration-300">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl w-fit mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Spectator Navigation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides real-time gate pressures, crowd congestion advice, and accessible pathways tailored to guests with restricted mobility.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 hover:shadow-2xl transition-all duration-300">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl w-fit mb-4">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Volunteer Mission Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dispatches task routes, assigns wheelchair escort duties, tracks sector hydration needs, and maintains rapid operational log transparency.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 hover:shadow-2xl transition-all duration-300">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl w-fit mb-4">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Tactical Defense & Medical</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies stadium crowd density spikes, logs emergency medical triage entries, handles sector hazard reports, and triggers alarm coordinates.
            </p>
          </div>
        </div>
      </section>

      {/* Complete Technology Stack Showcase */}
      <section className="py-16 bg-slate-950/60 border-t border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Enterprise Architecture Stack</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 text-center items-center">
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
              <div className="font-bold text-white text-sm">Next.js 15</div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">App Router Framework</span>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
              <div className="font-bold text-[#6EB8E1] text-sm">Gemini AI</div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Pro Reasoning Agent</span>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
              <div className="font-bold text-white text-sm">Leaflet & OSM</div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Perimeter Geofence</span>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
              <div className="font-bold text-[#C8ABE6] text-sm">Firebase</div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Durable Storage & Auth</span>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
              <div className="font-bold text-emerald-400 text-sm">Tailwind CSS</div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Fluid Utility Styling</span>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
              <div className="font-bold text-indigo-400 text-sm">TypeScript</div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Strict Type Safety</span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Roadmap */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900/30">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white font-display">Development Roadmap</h2>
          <p className="text-xs text-slate-400 mt-1">Our phased execution model for the global Hack2Skill tournament challenge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-[#6EB8E1]/30 relative">
            <span className="absolute top-3 right-3 text-[10px] font-mono font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded-full border border-sky-500/20">
              ACTIVE
            </span>
            <span className="text-slate-500 font-mono text-xs">PHASE 1</span>
            <h4 className="text-sm font-bold text-white mt-1">Platform Foundation</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Design complete layout structure, strict TypeScript databases, Auth systems, global theme metrics and core landing pages.
            </p>
          </div>

          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
            <span className="text-slate-500 font-mono text-xs">PHASE 2</span>
            <h4 className="text-sm font-bold text-white mt-1">AI & Maps Linkage</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Incorporate interactive Leaflet and OpenStreetMap, localized routing, and Gemini reasoning endpoints onto Node server.
            </p>
          </div>

          <div className="bg-[#020617] p-5 rounded-2xl border border-slate-900/50">
            <span className="text-slate-500 font-mono text-xs">PHASE 3</span>
            <h4 className="text-sm font-bold text-white mt-1">Vertex Integration</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Configure advanced prediction models to automate dispatch loads, transit delay alerts, and sustainability logs.
            </p>
          </div>

          <div className="bg-[#020617] p-5 rounded-2xl border border-slate-900/50">
            <span className="text-slate-500 font-mono text-xs">PHASE 4</span>
            <h4 className="text-sm font-bold text-white mt-1">Live Deployment</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Release production builds, audit Firestore rules, satisfy WCAG compliance checkpoints, and scale for 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Global Sponsors Mockup */}
      <section className="py-12 bg-slate-950 text-center border-t border-slate-900/50">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-4">Tournament Technology Coalition</span>
        <div className="flex flex-wrap justify-center gap-10 items-center opacity-40">
          <span className="text-xs font-bold font-mono tracking-widest text-white">UNITED_STADIUMS_26</span>
          <span className="text-xs font-bold font-mono tracking-widest text-white">MEX_ARENAS_FEDERAL</span>
          <span className="text-xs font-bold font-mono tracking-widest text-white">CAN_SOCIETY_TRANSIT</span>
          <span className="text-xs font-bold font-mono tracking-widest text-white">AI_COALITION_WORLD</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Tv2 className="h-4 w-4 text-[#6EB8E1]" />
            <span className="font-bold text-white">StadiumMind AI</span>
          </div>
          <p>© 2026 StadiumMind AI // Hack2Skill PromptWars Challenge. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
