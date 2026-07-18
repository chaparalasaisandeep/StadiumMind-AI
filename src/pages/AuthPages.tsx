import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

interface AuthPagesProps {
  onAuthSuccess: () => void;
  onBackToLanding: () => void;
}

export default function AuthPages({ onAuthSuccess, onBackToLanding }: AuthPagesProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSuccess = () => {
    onAuthSuccess();
  };

  const handleForgotPasswordSuccess = (msg: string) => {
    setSuccessMessage(msg);
    if (msg) {
      setTimeout(() => setSuccessMessage(""), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative antialiased">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6EB8E1]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-4 relative z-10">
        <button
          onClick={onBackToLanding}
          className="text-xs text-slate-400 hover:text-white mb-2 block cursor-pointer transition-colors"
        >
          ← Back to Landing
        </button>

        <Card className="border border-slate-900 bg-slate-950/80 backdrop-blur-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-bold font-display text-white">StadiumMind AI</CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-1">
              FIFA 2026 Integrated Operations Portal
            </CardDescription>
          </CardHeader>

          {/* Tab Selector */}
          {activeTab !== "forgot" && (
            <div className="flex border-b border-slate-900 mb-4 px-5">
              <button
                onClick={() => { setActiveTab("login"); setErrorMessage(""); setSuccessMessage(""); }}
                className={`flex-1 pb-3 text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === "login" ? "text-sky-400 border-b-2 border-sky-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab("signup"); setErrorMessage(""); setSuccessMessage(""); }}
                className={`flex-1 pb-3 text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === "signup" ? "text-sky-400 border-b-2 border-sky-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Register Account
              </button>
            </div>
          )}

          <CardContent className="px-5">
            {errorMessage && (
              <div className="p-3 mb-4 bg-rose-950/30 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 mb-4 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-center">
                {successMessage}
              </div>
            )}

            {activeTab === "login" && (
              <LoginForm 
                onSuccess={handleSuccess} 
                onError={setErrorMessage} 
                onForgotPasswordClick={() => { setActiveTab("forgot"); setErrorMessage(""); setSuccessMessage(""); }} 
              />
            )}

            {activeTab === "signup" && (
              <SignupForm 
                onSuccess={handleSuccess} 
                onError={setErrorMessage} 
              />
            )}

            {activeTab === "forgot" && (
              <ForgotPasswordForm 
                onSuccess={handleForgotPasswordSuccess} 
                onError={setErrorMessage} 
                onBackToSignInClick={() => { setActiveTab("login"); setErrorMessage(""); setSuccessMessage(""); }} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
