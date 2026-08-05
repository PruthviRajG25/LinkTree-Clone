"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login"); // "login" or "signup"
  
  // Credentials States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Logged in successfully!");
        router.push("/generate");
        router.refresh();
      } else {
        toast.error(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword || !signupConfirmPassword) {
      toast.error("Please fill in all signup fields.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Account successfully created!");
        router.push("/generate");
        router.refresh();
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Glowing Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            BitTree
          </span>
          <p className="text-slate-400 text-sm">
            Create your unified page and share your link in bio.
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 text-sm font-extrabold rounded-lg transition-all duration-300 cursor-pointer ${
              activeTab === "login"
                ? "bg-slate-800 text-white shadow-md border border-slate-700/50"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2.5 text-sm font-extrabold rounded-lg transition-all duration-300 cursor-pointer ${
              activeTab === "signup"
                ? "bg-slate-800 text-white shadow-md border border-slate-700/50"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Credentials Form */}
        {activeTab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-200 placeholder-slate-650 transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-200 placeholder-slate-650 transition-all text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? "Authenticating..." : "Log In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-200 placeholder-slate-650 transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-200 placeholder-slate-650 transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-200 placeholder-slate-650 transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-200 placeholder-slate-650 transition-all text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>
        )}

        {/* Separator */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Or</span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* GitHub OAuth Button */}
        <div>
          <a
            href="/api/auth/github"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-slate-100 hover:bg-white text-slate-950 font-extrabold rounded-xl transition-all duration-300 shadow-md hover:shadow-emerald-500/5 cursor-pointer transform hover:scale-[1.01] text-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </a>
        </div>
      </div>

      <ToastContainer
        position="bottom-left"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
