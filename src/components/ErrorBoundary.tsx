import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[CRITICAL WORKSPACE EXCEPTION] ErrorBoundary caught an unhandled rendering crash:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div id="unhandled-error-boundary-screen" className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
            <div className="mx-auto w-12 h-12 bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-xl flex items-center justify-center animate-bounce">
              <AlertOctagon className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white tracking-tight">Something Went Wrong</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected exception was intercepted by the system's global error boundary. StadiumMind is ready to soft-restart.
              </p>
              {this.state.error && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-left mt-3 overflow-x-auto">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider">Exception Diagnostic Trace</span>
                  <code className="text-[10px] font-mono text-rose-300 block mt-1 break-words whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </code>
                </div>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Operational Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
