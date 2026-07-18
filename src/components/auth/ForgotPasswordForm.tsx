import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { Mail } from "lucide-react";

interface ForgotPasswordFormProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onBackToSignInClick: () => void;
}

export default function ForgotPasswordForm({ onSuccess, onError, onBackToSignInClick }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");
    onSuccess("");
    const emailInput = (e.target as any).elements.email?.value;
    if (!emailInput) return;
    try {
      await resetPassword(emailInput);
      onSuccess("A password recovery link has been dispatched to your email address.");
    } catch (err: any) {
      onError(err.message || "Failed to transmit password reset coordinates.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          onClick={onBackToSignInClick}
          className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
        >
          Back to Sign In
        </button>
      </div>
    </form>
  );
}
