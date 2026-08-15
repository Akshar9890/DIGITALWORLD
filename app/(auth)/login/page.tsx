"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Failed to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="bento-card p-8">
      <div className="mb-6 text-center">
        <h2 className="font-headline-md text-on-surface">Sign In</h2>
        <p className="mt-1 text-body-technical text-slate-gray">
          Access your account to manage orders and quotations.
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
        CONTINUE WITH GOOGLE
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface-charcoal px-3 text-slate-gray">OR</span>
        </div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
              placeholder="Enter your password"
            />
          </div>
          {errors.password && <span className="input-error">{errors.password.message}</span>}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-control bg-error-container/20 border border-status-error/30 px-4 py-3 text-sm text-status-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          SIGN IN
        </Button>
      </form>

      <p className="mt-6 text-center text-body-technical text-slate-gray">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-tertiary hover:underline font-bold">
          Create one
        </Link>
      </p>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="bento-card p-8">
      <div className="flex items-center justify-center py-12">
        <div className="h-10 w-10 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
