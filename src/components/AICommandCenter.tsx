import { auth } from "../firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { ChatMessage, StadiumState, UserRole } from "../types";
import { 
  Send, 
  BrainCircuit, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  FileText, 
  FlameKindling,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  RotateCcw
} from "lucide-react";

interface AICommandCenterProps {
  currentRole: UserRole;
  stadiumState: StadiumState;
  onDispatchIncident: (incidentId: string) => void;
  stadiumName: string;
}


const AICommandCenter = React.memo(function AICommandCenter({ currentRole, stadiumState, onDispatchIncident, stadiumName }: AICommandCenterProps) {
  const [activeTab, setActiveTab] = useState<"assistant" | "advisor">("assistant");
  
  // Ref for automatic scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Copied response tracker
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Conversational state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("stadiummind_chat_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
          }));
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    }
    return [
      {
        id: "welcome",
        sender: "ai",
        text: `Welcome to **StadiumMind AI**. I am your real-time operational assistant at **${stadiumName}**. Feel free to ask me anything about spectator pathways, volunteer tasks, medical units, or gate flow optimization.`,
        timestamp: new Date()
      }
    ];
  });
  
  const [inputText, setInputText] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // High-Thinking Advisor state
  const [advisorQuery, setAdvisorQuery] = useState(() => {
    return localStorage.getItem("stadiummind_advisor_query") || "Synthesize stadium bottlenecks and draft a load-balancing evacuation & spectator redirect strategy.";
  });
  const [advisorResult, setAdvisorResult] = useState<string>(() => {
    return localStorage.getItem("stadiummind_advisor_result") || "";
  });
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);

  // Auto scroll effect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  // Persist chat and advisor state
  useEffect(() => {
    localStorage.setItem("stadiummind_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem("stadiummind_advisor_query", advisorQuery);
  }, [advisorQuery]);

  useEffect(() => {
    localStorage.setItem("stadiummind_advisor_result", advisorResult);
  }, [advisorResult]);

  // Helper to copy message contents to clipboard
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgId(id);
      setTimeout(() => {
        setCopiedMsgId(null);
      }, 2000);
    }).catch((err) => {
      console.error("Failed to copy response:", err);
    });
  };

  // Helper to clear the conversational chat
  const handleClearChat = () => {
    localStorage.removeItem("stadiummind_chat_messages");
    setChatMessages([
      {
        id: "welcome",
        sender: "ai",
        text: `Welcome to **StadiumMind AI**. I am your real-time operational assistant at **${stadiumName}**. Feel free to ask me anything about spectator pathways, volunteer tasks, medical units, or gate flow optimization.`,
        timestamp: new Date()
      }
    ]);
  };

  // Helper to retry a failed operation
  const handleRetryMessage = async (errorMsgId: string) => {
    const errorIdx = chatMessages.findIndex((m) => m.id === errorMsgId);
    if (errorIdx === -1) return;

    let userQuery = "";
    for (let i = errorIdx - 1; i >= 0; i--) {
      if (chatMessages[i].sender === "user") {
        userQuery = chatMessages[i].text;
        break;
      }
    }

    if (!userQuery) return;

    // Remove the error message from history to make it clean
    setChatMessages((prev) => prev.filter((m) => m.id !== errorMsgId));
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json",
"Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` },
        body: JSON.stringify({
          message: userQuery,
          role: currentRole,
          stadiumName
        })
      });

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: data.text || "I apologize, I am unable to connect to StadiumMind core. Please verify your Gemini API key in Secrets.",
        timestamp: new Date()
      };
      
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          sender: "ai",
          text: "⚠️ **System Communication Failure**: Unable to contact local server. Verify that `server.ts` is running and the development gateway is open.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Send message using standard Gemini Conversational API (/api/chat)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: inputText,
      timestamp: new Date()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json",
"Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` },
        body: JSON.stringify({
          message: userMsg.text,
          role: currentRole,
          stadiumName
        })
      });

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: data.text || "I apologize, I am unable to connect to StadiumMind core. Please verify your Gemini API key in Secrets.",
        timestamp: new Date()
      };
      
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          sender: "ai",
          text: "⚠️ **System Communication Failure**: Unable to contact local server. Verify that `server.ts` is running and the development gateway is open.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Run complex high-thinking simulation (/api/advisor/analyze)
  const handleRunSimulation = async () => {
    if (isAdvisorLoading) return;
    setIsAdvisorLoading(true);
    setAdvisorResult("");

    try {
      const response = await fetch("/api/advisor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json",
"Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` },
        body: JSON.stringify({
          stadiumState,
          query: advisorQuery,
          role: currentRole
        })
      });

      const data = await response.json();
      setAdvisorResult(data.text || "Simulation concluded. Unable to compile recommendations. Double-check backend keys.");
    } catch (err) {
      console.error(err);
      setAdvisorResult("⚠️ **Simulation Error**: The High-Thinking core failed to initialize. Please check your `GEMINI_API_KEY` configuration under AI Studio Secrets.");
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  return (
    <section aria-label="AI Command Center" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 pb-3 mb-4 justify-between items-center">
        <div className="flex gap-2">
          <button
            id="ai-tab-assistant"
            onClick={() => setActiveTab("assistant")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "assistant"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-[#6EB8E1]" />
            AI Operations Agent
          </button>
          <button
            id="ai-tab-advisor"
            onClick={() => setActiveTab("advisor")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "advisor"
                ? "bg-gradient-to-r from-purple-900/50 to-indigo-900/50 text-white border border-indigo-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BrainCircuit className="h-3.5 w-3.5 text-[#C8ABE6]" />
            High-Thinking Advisor
            <span className="bg-purple-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full scale-90">
              HIGH
            </span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "assistant" && chatMessages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="text-[10px] font-medium text-slate-400 hover:text-rose-400 flex items-center gap-1.5 cursor-pointer transition-colors bg-slate-800/40 hover:bg-rose-950/20 px-2 py-1 rounded-md border border-slate-700/50"
              title="Clear conversation"
            >
              <Trash2 className="h-3 w-3 text-slate-400 hover:text-rose-400" />
              Clear Chat
            </button>
          )}
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400">GEMINI_3.5_FLASH_ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Tab 1: Assistant Conversational Chat */}
      {activeTab === "assistant" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed max-w-[85%] relative group ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 self-start ${
                  msg.sender === "user" ? "bg-slate-800 text-slate-200" : "bg-slate-950 border border-slate-800"
                }`}>
                  {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-[#6EB8E1]" />}
                </div>
                <div className={`p-3 rounded-2xl relative ${
                  msg.sender === "user" 
                    ? "bg-[#6EB8E1] text-black font-medium rounded-tr-none" 
                    : "bg-slate-950 border border-slate-800/80 text-slate-200 rounded-tl-none pr-8"
                }`}>
                  {msg.sender === "user" ? (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  ) : (
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}

                  {msg.sender === "ai" && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      aria-label="Copy message text"
                      className="absolute top-2 right-2 p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#6EB8E1] focus-visible:outline-none"
                      title="Copy response"
                    >
                      {copiedMsgId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-400 animate-pulse" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}

                  {msg.sender === "ai" && (msg.id.includes("error") || msg.id.includes("fail") || msg.text.includes("⚠️")) && (
                    <div className="mt-2 pt-2 border-t border-red-950/30">
                      <button
                        type="button"
                        onClick={() => handleRetryMessage(msg.id)}
                        className="px-2.5 py-1 bg-rose-950/30 hover:bg-rose-900/40 text-rose-200 border border-rose-800/30 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Retry Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex gap-3 text-xs leading-relaxed max-w-[85%] mr-auto items-start">
                <div className="p-2 rounded-lg flex-shrink-0 bg-slate-950 border border-slate-800">
                  <Bot className="h-4 w-4 text-[#6EB8E1]" />
                </div>
                <div className="bg-slate-950 border border-slate-800/80 text-slate-400 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6EB8E1] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6EB8E1] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6EB8E1] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[11px] font-medium italic text-slate-400 animate-pulse">Gemini is compiling stadium directives...</span>
                </div>
              </div>
            )}
            
            {/* Scroll bottom anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-800 pt-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask Gemini anything about ${currentRole} operations...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#6EB8E1]"
            />
            <button
              type="submit"
              id="ai-send-btn"
              disabled={isChatLoading || !inputText.trim()}
              aria-label="Send message"
              className="bg-[#6EB8E1] text-black font-semibold rounded-xl px-3 hover:bg-sky-400 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-[#6EB8E1] focus-visible:outline-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: High-Thinking Technical Simulation */}
      {activeTab === "advisor" && (
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
      )}
    </section>
  );


});
export default AICommandCenter;
