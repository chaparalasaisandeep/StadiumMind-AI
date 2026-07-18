import React from "react";
import Markdown from "react-markdown";
import { ChatMessage, UserRole } from "../types";
import { 
  Bot, 
  User, 
  Send, 
  Copy, 
  Check, 
  RotateCcw 
} from "lucide-react";

interface AIChatTabProps {
  chatMessages: ChatMessage[];
  inputText: string;
  setInputText: (val: string) => void;
  isChatLoading: boolean;
  currentRole: UserRole;
  copiedMsgId: string | null;
  handleCopyText: (text: string, id: string) => void;
  handleRetryMessage: (id: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const AIChatTab = React.memo(function AIChatTab({
  chatMessages,
  inputText,
  setInputText,
  isChatLoading,
  currentRole,
  copiedMsgId,
  handleCopyText,
  handleRetryMessage,
  handleSendMessage,
  messagesEndRef
}: AIChatTabProps) {
  return (
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
  );
});

export default AIChatTab;
