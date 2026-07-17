import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserRole } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Lock, Mail, User, ShieldCheck } from "lucide-react";

// Form validation schemas with Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.custom<UserRole>()
});

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.custom<UserRole>()
});

interface AuthPagesProps {
  onAuthSuccess: () => void;
  onBackToLanding: () => void;
}

export default function AuthPages({ onAuthSuccess, onBackToLanding }: AuthPagesProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  const { login, signup, loginWithGoogle, resetPassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    getValues: getLoginValues,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", role: "Fan" as UserRole }
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    getValues: getSignupValues,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting }
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", name: "", password: "", role: "Fan" as UserRole }
  });

  const onLogin = async (data: any) => {
    setErrorMessage("");
    try {
      await login(data.email, data.password, data.role);
      onAuthSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Login authentication failed.");
    }
  };

  const onSignup = async (data: any) => {
    setErrorMessage("");
    try {
      await signup(data.email, data.name, data.password, data.role);
      onAuthSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed.");
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    try {
      const selectedRole = activeTab === "login" 
        ? getLoginValues("role") 
        : getSignupValues("role");
      await loginWithGoogle(selectedRole || "Fan");
      onAuthSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Google Single Sign-On failed.");
    }
  };

  const onForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const emailInput = (e.target as any).elements.email?.value;
    if (!emailInput) return;
    try {
      await resetPassword(emailInput);
      setSuccessMessage("A password recovery link has been dispatched to your email address.");
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to transmit password reset coordinates.");
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
          <div className="flex border-b border-slate-900 mb-4 px-5">
            <button
              onClick={() => { setActiveTab("login"); setErrorMessage(""); }}
              className={`flex-1 pb-3 text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === "login" ? "text-sky-400 border-b-2 border-sky-500" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setErrorMessage(""); }}
              className={`flex-1 pb-3 text-xs font-semibold cursor-pointer transition-colors ${
                activeTab === "signup" ? "text-sky-400 border-b-2 border-sky-500" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Register Account
            </button>
          </div>

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

            {/* TAB 1: LOGIN */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      {...registerLogin("email")}
                      placeholder="name@host.com"
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  {loginErrors.email && (
                    <span className="text-[10px] text-rose-400 mt-1 block">{loginErrors.email.message}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">PASSWORD</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      {...registerLogin("password")}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  {loginErrors.password && (
                    <span className="text-[10px] text-rose-400 mt-1 block">{loginErrors.password.message}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">SYSTEM ASSIGNED ROLE</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <select
                      {...registerLogin("role")}
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Fan">Fan Experience</option>
                      <option value="Volunteer">Volunteer Desk</option>
                      <option value="Organizer">Tournament Organizer</option>
                      <option value="Security">Stadium Security</option>
                      <option value="Medical">Medical / Triage</option>
                      <option value="Transport">Transit & Logistics</option>
                      <option value="Accessibility">Accessibility Suite</option>
                      <option value="Admin">System Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("forgot")}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button type="submit" loading={isLoginSubmitting} className="w-full py-2" variant="primary">
                  Sign In to Terminal
                </Button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-900"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-mono">OR</span>
                  <div className="flex-grow border-t border-slate-900"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Sign In with Google
                </button>
              </form>
            )}

            {/* TAB 2: SIGNUP */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">FULL NAME</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      {...registerSignup("name")}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  {signupErrors.name && (
                    <span className="text-[10px] text-rose-400 mt-1 block">{signupErrors.name.message}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      {...registerSignup("email")}
                      placeholder="name@host.com"
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  {signupErrors.email && (
                    <span className="text-[10px] text-rose-400 mt-1 block">{signupErrors.email.message}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">CHOOSE PASSWORD</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      {...registerSignup("password")}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  {signupErrors.password && (
                    <span className="text-[10px] text-rose-400 mt-1 block">{signupErrors.password.message}</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">REQUEST SYSTEM ROLE</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <select
                      {...registerSignup("role")}
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Fan">Fan Experience</option>
                      <option value="Volunteer">Volunteer Desk</option>
                      <option value="Organizer">Tournament Organizer</option>
                      <option value="Security">Stadium Security</option>
                      <option value="Medical">Medical / Triage</option>
                      <option value="Transport">Transit & Logistics</option>
                      <option value="Accessibility">Accessibility Suite</option>
                      <option value="Admin">System Administrator</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" loading={isSignupSubmitting} className="w-full py-2" variant="primary">
                  Request Authorization
                </Button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-900"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-mono">OR</span>
                  <div className="flex-grow border-t border-slate-900"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Sign Up with Google
                </button>
              </form>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {activeTab === "forgot" && (
              <form onSubmit={onForgotPassword} className="space-y-4">
                <p className="text-[11px] text-slate-400 leading-normal mb-3">
                  Enter your verified authorization email address below. We will transmit emergency recovery parameters shortly.
                </p>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@host.com"
                      className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full py-2" variant="primary">
                  Transmit Reset Coordinates
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
