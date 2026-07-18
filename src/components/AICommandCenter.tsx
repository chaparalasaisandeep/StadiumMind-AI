import { auth } from "../firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, StadiumState, UserRole } from "../types";
import { 
  BrainCircuit, 
  Bot, 
  Trash2
} from "lucide-react";
import AIChatTab from "./AIChatTab";
import AIAdvisorTab from "./AIAdvisorTab";

interface AICommandCenterProps {
  currentRole: UserRole;
  stadiumState: StadiumState;
  onDispatchIncident: (incidentId: string) => void;
  stadiumName: string;
}

export const AICommandCenter = React.memo(function AICommandCenter({ 
  currentRole, 
  stadiumState, 
  stadiumName 
}: AICommandCenterProps) {
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
    if (activeTab === "assistant") {
      scrollToBottom();
    }
  }, [chatMessages, isChatLoading, activeTab]);

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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` 
        },
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` 
        },
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth?.currentUser ? await auth.currentUser.getIdToken() : ""}` 
        },
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
        <AIChatTab
          chatMessages={chatMessages}
          inputText={inputText}
          setInputText={setInputText}
          isChatLoading={isChatLoading}
          currentRole={currentRole}
          copiedMsgId={copiedMsgId}
          handleCopyText={handleCopyText}
          handleRetryMessage={handleRetryMessage}
          handleSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      )}

      {/* Tab 2: High-Thinking Technical Simulation */}
      {activeTab === "advisor" && (
        <AIAdvisorTab
          advisorQuery={advisorQuery}
          setAdvisorQuery={setAdvisorQuery}
          advisorResult={advisorResult}
          isAdvisorLoading={isAdvisorLoading}
          copiedMsgId={copiedMsgId}
          handleCopyText={handleCopyText}
          handleRunSimulation={handleRunSimulation}
        />
      )}
    </section>
  );
});

export default AICommandCenter;
