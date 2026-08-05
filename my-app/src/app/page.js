"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleClaim = (e) => {
    e.preventDefault();
    const cleanHandle = handle.trim().toLowerCase();
    
    if (!cleanHandle) {
      setError("Please enter a handle.");
      return;
    }

    const handleRegex = /^[a-zA-Z0-9_-]+$/;
    if (!handleRegex.test(cleanHandle)) {
      setError("Letters, numbers, underscores, and hyphens only.");
      return;
    }

    setError("");
    router.push(`/generate?handle=${encodeURIComponent(cleanHandle)}`);
  };

  return (
    <main className="bg-emerald-950 text-slate-100 min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* Abstract Glowing shapes */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[160px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Info Column */}
        <div className="flex flex-col justify-center space-y-6 lg:pr-8">
          <div className="space-y-3">
            <h1 className="text-yellow-300 font-black text-5xl sm:text-6xl lg:text-7xl leading-tight tracking-tight">
              Everything you
              <span className="block text-white">are. In one,</span>
              <span className="block bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                simple link.
              </span>
            </h1>
          </div>

          <p className="text-emerald-100/80 text-base sm:text-lg max-w-xl leading-relaxed">
            Join millions using BitTree for their link in bio. One simple link to share everything you create, curate, and monetize from your Instagram, TikTok, YouTube, and other social profiles.
          </p>

          <form onSubmit={handleClaim} className="space-y-4 max-w-md w-full">
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 bg-slate-900/40 p-2 border border-emerald-800/40 rounded-3xl backdrop-blur-md">
              <div className="relative flex-1 flex items-center pl-4 py-2">
                <span className="text-emerald-400/60 font-semibold select-none">
                  bittree.io/
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value.replace(/\s+/g, ""));
                    if (error) setError("");
                  }}
                  placeholder="yourname"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-white placeholder-emerald-850 font-semibold pl-1"
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-300 hover:bg-yellow-250 active:bg-yellow-450 text-emerald-950 font-black px-6 py-4 rounded-2xl shadow-lg hover:shadow-yellow-300/10 transition-all text-sm sm:text-base whitespace-nowrap cursor-pointer"
              >
                Claim your BitTree
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-xs font-semibold pl-4 flex items-center gap-1.5 animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Right Image/Mockup Column */}
        <div className="flex items-center justify-center lg:justify-end relative">
          <div className="absolute -inset-4 bg-emerald-500/5 rounded-[40px] blur-2xl -z-10"></div>
          {/* Mockup phone or home.png wrapper */}
          <div className="relative max-w-md w-full border-4 border-emerald-900/30 rounded-[32px] p-2 bg-emerald-950/20 backdrop-blur-sm overflow-hidden shadow-2xl">
            <img
              src="/home.png"
              alt="BitTree Landing Showcase"
              className="w-full h-auto object-cover rounded-[24px]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
