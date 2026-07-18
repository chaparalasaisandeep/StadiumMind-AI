import React from "react";
import Markdown from "react-markdown";
import { 
  Bot, 
  BrainCircuit, 
  Sparkles, 
  Loader2, 
  FileText, 
  Check, 
  Copy 
} from "lucide-react";

interface AIAdvisorTabProps {
  advisorQuery: string;
  setAdvisorQuery: (val: string) => void;
  advisorResult: string;
  isAdvisorLoading: boolean;
  copiedMsgId: string | null;
  handleCopyText: (text: string, id: string) => void;
  handleRunSimulation: () => void;
}

export const AIAdvisorTab = React.memo(function AIAdvisorTab({
  advisorQuery,
  setAdvisorQuery,
  advisorResult,
  isAdvisorLoading,
  copiedMsgId,
  handleCopyText,
  handleRunSimulation
}: AIAdvisorTabProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-[#C8ABE6]" />
          <h4 className="text-xs font-semibold text-white">System Simulation Parameter Set</h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          This triggers a <strong>gemini-3.1-pro-preview</strong> instance running with <strong>HIGH</strong> thinking mode enabled. It ingests all live security incidents, gate congestion rates, and queue profiles to devise an optimal dispatch strategy.
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto mb-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">SIMULATION GOAL / STRATEGY FOCUS</label>
          <textarea
            value={advisorQuery}
            onChange={(e) => setAdvisorQuery(e.target.value)}
            placeholder="E.g. Analyze concession line imbalances and draft re-allocation routes..."
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-2">
          <button
            id="run-simulation-btn"
            onClick={handleRunSimulation}
            disabled={isAdvisorLoading}
            aria-busy={isAdvisorLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-900/30 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-indigo-400 focus-visible:outline-none"
          >
            {isAdvisorLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Simulating Multi-Agent Tactical Solutions...
              </>
            ) : (
              <>
                <BrainCircuit className="h-4 w-4" />
                Launch High-Thinking Simulation Run
              </>
            )}
          </button>
        </div>

        {/* Results Output Block */}
        <div className="mt-4 flex-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              TACTICAL_ADVISORY_REPORT
            </span>
            <div className="flex items-center gap-2">
              {advisorResult && (
                <button
                  type="button"
                  onClick={() => handleCopyText(advisorResult, "advisor-res")}
                  className="px-2 py-0.5 text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedMsgId === "advisor-res" ? (
                    <>
                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-2.5 w-2.5" />
                      Copy Report
                    </>
                  )}
                </button>
              )}
              {advisorResult && (
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/30">
                  CONCLUDED
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-200 min-h-[140px] font-sans leading-relaxed overflow-y-auto">
            {isAdvisorLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-6 gap-2">
                <Loader2 className="h-8 w-8 text-[#C8ABE6] animate-spin" />
                <span className="text-[11px] animate-pulse text-indigo-300">Running advanced crowd planning metrics...</span>
              </div>
            ) : advisorResult ? (
              <div className="markdown-body">
                <Markdown>{advisorResult}</Markdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-6 text-center">
                <Bot className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-[11px]">Click "Launch High-Thinking Simulation Run" above to compile deep logistical planning vectors.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AIAdvisorTab;
