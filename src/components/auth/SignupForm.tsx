import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types";
import { Button } from "../ui/Button";
import { Lock, Mail, User, ShieldCheck } from "lucide-react";

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.custom<UserRole>()
});

type SignupFields = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function SignupForm({ onSuccess, onError }: SignupFormProps) {
  const { signup, loginWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", name: "", password: "", role: "Fan" as UserRole }
  });

  const onSubmit = async (data: SignupFields) => {
    onError("");
    try {
      await signup(data.email, data.name, data.password, data.role);
      onSuccess();
    } catch (err: any) {
      onError(err.message || "Registration failed.");
    }
  };

  const handleGoogleSignIn = async () => {
    onError("");
    try {
      const selectedRole = getValues("role");
      await loginWithGoogle(selectedRole || "Fan");
      onSuccess();
    } catch (err: any) {
      onError(err.message || "Google Single Sign-On failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">FULL NAME</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            {...register("name")}
            placeholder="Jane Doe"
            className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        {errors.name && (
          <span className="text-[10px] text-rose-400 mt-1 block">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">EMAIL ADDRESS</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="email"
            {...register("email")}
            placeholder="name@host.com"
            className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        {errors.email && (
          <span className="text-[10px] text-rose-400 mt-1 block">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">CHOOSE PASSWORD</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="password"
            {...register("password")}
            placeholder="••••••••"
            className="w-full bg-slate-900/60 border border-slate-850 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        {errors.password && (
          <span className="text-[10px] text-rose-400 mt-1 block">{errors.password.message}</span>
        )}
      </div>

      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">REQUEST SYSTEM ROLE</label>
        <div className="relative">
          <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <select
            {...register("role")}
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

      <Button type="submit" loading={isSubmitting} className="w-full py-2" variant="primary">
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
  );
}
