import { useState, FormEvent } from "react";
import { 
  Accessibility, 
  Volume2, 
  VolumeX, 
  Compass, 
  HelpCircle, 
  Smartphone, 
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";

interface AccessibilitySuiteProps {
  stadiumName: string;
}

const AccessibilitySuite = React.memo(function AccessibilitySuite({ stadiumName }: AccessibilitySuiteProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [assistanceRequested, setAssistanceRequested] = useState(false);
  const [escortType, setEscortType] = useState("wheelchair");
  const [escortSection, setEscortSection] = useState("102");
  
  // Simulated elevator states
  const elevators = [
    { name: "Elevator E1 (North VIP)", status: "operational", accessibleTo: "All Sections" },
    { name: "Elevator E2 (East Ramp)", status: "operational", accessibleTo: "Lower Concourse" },
    { name: "Elevator E8 (West Upper)", status: "malfunction", accessibleTo: "Upper Level / Suite Lounge" },
    { name: "Elevator E4 (South Ramp)", status: "operational", accessibleTo: "Ramp Level" }
  ];

  // Local Web Speech API synth simulation
  const handleTTSReadAloud = useCallback(() => {
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const text = `Welcome to BC Place Accessibility Support. Elevator E8 is currently experiencing minor service delays. If you require assistance, please tap the request wheelchair escort button to dispatch a volunteer to Section 102 immediately.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } else {
      // Fallback
      setIsPlayingAudio(!isPlayingAudio);
    }
  }, [isPlayingAudio]);

  const handleRequestAssistance = useCallback((e: FormEvent) => {
    e.preventDefault();
    setAssistanceRequested(true);
    setTimeout(() => {
      // Auto reset after 8 seconds
      setAssistanceRequested(false);
    }, 8000);
  }, []);

  return (
    <section aria-labelledby="accessibility-hub-title" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <div>
          <h3 id="accessibility-hub-title" className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Accessibility className="h-5 w-5 text-indigo-400" />
            Universal Accessibility Hub
          </h3>
          <p className="text-[11px] text-slate-400">WCAG AA inclusive tools, elevator monitors, and dedicated escort services.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: TTS Guide & Assistance Request */}
        <div className="space-y-4">
          <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-indigo-400" />
              Interactive Audio Pathfinding Guide
            </h4>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Listen to the current stadium accessibility report, elevator closures, and best accessible routes for spectators.
            </p>
            <button
              id="tts-read-btn"
              aria-pressed={isPlayingAudio}
              aria-label={isPlayingAudio ? "Stop Audio Accessibility Report" : "Play Audio Accessibility Report"}
              onClick={handleTTSReadAloud}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
                isPlayingAudio 
                  ? "bg-rose-950/40 border border-rose-500/30 text-rose-400" 
                  : "bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 text-indigo-400"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  Mute Audio Guide
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 animate-bounce" />
                  Play Audio Accessibility Report
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3">
            <h4 className="text-xs font-semibold text-slate-200 mb-1.5">Request Wheelchair Escort</h4>
            {assistanceRequested ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 text-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1 animate-pulse" />
                <h5 className="text-xs font-semibold text-emerald-400">Escort Unit Dispatched</h5>
                <p className="text-[10px] text-slate-400 mt-1">
                  A volunteer has been assigned to Section {escortSection} to escort you to Gate D. Est: 4 mins.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestAssistance} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 block mb-1">CURRENT SECTION</label>
                    <input
                      type="text"
                      value={escortSection}
                      onChange={(e) => setEscortSection(e.target.value)}
                      placeholder="e.g. 102"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 block mb-1">ASSISTANCE TYPE</label>
                    <select
                      value={escortType}
                      onChange={(e) => setEscortType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                    >
                      <option value="wheelchair">♿ Wheelchair Escort</option>
                      <option value="sight">👁️ Sight Guide</option>
                      <option value="hearing">👂 Sign Language</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  aria-label="Confirm Escort Request"
                  id="request-escort-btn"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 rounded-lg text-xs cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-400 focus-visible:outline-none"
                >
                  Confirm Escort Request
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right column: Elevator States & Ramp Status */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-indigo-400" />
              Elevator and Accessible Ramp Monitor
            </h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1" aria-live="polite" aria-atomic="true">
              {elevators.map((el, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] p-1.5 bg-slate-900/60 rounded border border-slate-850">
                  <div>
                    <div className="font-semibold text-slate-300">{el.name}</div>
                    <div className="text-[9px] text-slate-500">{el.accessibleTo}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${
                    el.status === "operational" 
                      ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/20" 
                      : "text-rose-400 bg-rose-950/30 border-rose-500/20 animate-pulse"
                  }`}>
                    {el.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-2 bg-indigo-950/20 border border-indigo-500/10 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-normal">
              Accessible seating plans and dedicated restrooms are fully mapped. Filter concessions with tactile indicators for easy physical discovery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
export default AccessibilitySuite;
