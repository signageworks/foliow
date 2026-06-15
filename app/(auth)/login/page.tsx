"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (params.get("registered") === "1") {
      setSuccess("Profile created! Sign in below.");
    }
    if (params.get("error") === "OAuthAccountNotLinked") {
      setError("This email is already registered with a password. Sign in with email instead.");
    }
  }, [params]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect email or password.");
    } else {
      router.push("/feed");
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/feed" });
  };

  return (
    <>
      {success && (
        <p className="text-sm text-green-400 bg-green-400/10 px-3 py-2 rounded-lg mb-4 text-center">
          {success}
        </p>
      )}

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-2 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {googleLoading ? (
          <span className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.1c-.6 3-2.3 5.5-4.8 7.2v6h7.7c4.5-4.2 7.1-10.3 7.1-17.5z" fill="#4285F4"/>
            <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.5v6.2C6.5 42.6 14.7 48 24 48z" fill="#34A853"/>
            <path d="M10.5 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6v-6.2H2.5A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8-6.2z" fill="#FBBC05"/>
            <path d="M24 9.5c3.6 0 6.8 1.2 9.3 3.6l7-7C36 2.1 30.5 0 24 0 14.7 0 6.5 5.4 2.5 13.2l8 6.2C12.4 13.7 17.7 9.5 24 9.5z" fill="#EA4335"/>
          </svg>
        )}
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="ali@example.com"
            className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Your password"
            className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-2.5 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-muted text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create one free
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Foliow" className="h-72 mx-auto object-contain" />
        </div>

        <h1 className="text-2xl font-bold mb-1 text-center">Welcome back</h1>
        <p className="text-muted text-sm text-center mb-6">
          Sign in to your Foliow profile.
        </p>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
