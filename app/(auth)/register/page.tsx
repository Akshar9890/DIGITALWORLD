"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Registration failed. Please try again.");
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="bento-card p-8">
      <div className="mb-6 text-center">
        <h2 className="font-headline-md text-on-surface">Create Account</h2>
        <p className="mt-1 text-body-technical text-slate-gray">
          Join DigitalWorld to track orders and request quotations.
        </p>
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleSignIn}
        className="btn-secondary w-full mb-6"
        type="button"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        SIGN UP WITH GOOGLE
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface-charcoal px-3 text-slate-gray">OR</span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label className="input-label">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
            <input
              {...register("name")}
              className={`input-field pl-10 ${errors.name ? "border-status-error" : ""}`}
              placeholder="Your full name"
            />
          </div>
          {errors.name && <span className="input-error">{errors.name.message}</span>}
        </div>

        <div>
          <label className="input-label">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
            <input
              {...register("email")}
              type="email"
              className={`input-field pl-10 ${errors.email ? "border-status-error" : ""}`}
              placeholder="you@company.com"
            />
          </div>
          {errors.email && <span className="input-error">{errors.email.message}</span>}
        </div>

        <div>
          <label className="input-label">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
            <input
              {...register("password")}
              type="password"
              className={`input-field pl-10 ${errors.password ? "border-status-error" : ""}`}
              placeholder="Min. 8 characters"
            />
          </div>
          {errors.password && <span className="input-error">{errors.password.message}</span>}
        </div>

        <div>
          <label className="input-label">Confirm Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray" />
            <input
              {...register("confirmPassword")}
              type="password"
              className={`input-field pl-10 ${errors.confirmPassword ? "border-status-error" : ""}`}
              placeholder="Re-enter your password"
            />
          </div>
          {errors.confirmPassword && (
            <span className="input-error">{errors.confirmPassword.message}</span>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-control bg-error-container/20 border border-status-error/30 px-4 py-3 text-sm text-status-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          CREATE ACCOUNT
        </Button>

        <p className="text-center text-xs text-slate-gray">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-tertiary hover:underline">
            Terms of Service
          </Link>
        </p>
      </form>

      <p className="mt-6 text-center text-body-technical text-slate-gray">
        Already have an account?{" "}
        <Link href="/login" className="text-tertiary hover:underline font-bold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
