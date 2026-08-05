"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hide Navbar on dynamic profile pages and API endpoints
  const isProfilePage =
    pathname !== "/" && pathname !== "/generate" && pathname !== "/login" && !pathname.startsWith("/api");

  useEffect(() => {
    // Skip checking session if it's a profile page where Navbar isn't rendered anyway
    if (isProfilePage) return;

    async function getSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.authenticated) {
          setSession(data.user);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        setLoading(false);
      }
    }
    getSession();
  }, [pathname, isProfilePage]);

  if (isProfilePage) return null;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-6xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-lg flex justify-between items-center rounded-full px-6 py-4 shadow-xl z-55">
      <div className="logo flex gap-6 items-center">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <img
            src="/linktree-logo.webp"
            alt="BitTree Logo"
            className="h-7 w-auto invert opacity-90 hover:opacity-100 transition-opacity"
          />
          <span className="text-white font-extrabold text-lg tracking-tight hidden sm:inline">
            BitTree
          </span>
        </Link>

        <div className="hidden md:block">
          <ul className="flex gap-6 text-slate-400 font-semibold text-sm">
            <li className="hover:text-emerald-400 transition-colors">
              <a href="#">Products</a>
            </li>
            <li className="hover:text-emerald-400 transition-colors">
              <a href="#">Templates</a>
            </li>
            <li className="hover:text-emerald-400 transition-colors">
              <a href="#">Learn</a>
            </li>
            <li className="hover:text-emerald-400 transition-colors">
              <a href="#">Pricing</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        {loading ? (
          <div className="w-20 h-8 bg-slate-800 animate-pulse rounded-full"></div>
        ) : session ? (
          // Logged In navbar controls
          <div className="flex items-center gap-4">
            <Link
              href="/generate"
              className="text-slate-350 hover:text-emerald-400 text-sm font-bold transition-all cursor-pointer hidden sm:inline"
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 rounded-full pl-2 pr-3 py-1 shadow-inner select-none">
              <img
                src={session.avatarUrl}
                alt={session.username}
                className="w-6 h-6 rounded-full object-cover border border-slate-850"
              />
              <span className="text-slate-200 text-xs font-semibold max-w-[100px] truncate">
                {session.handle ? `@${session.handle}` : session.username}
              </span>
            </div>
            <a
              href="/api/auth/logout"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border border-slate-700/50"
            >
              Log Out
            </a>
          </div>
        ) : (
          // Logged Out navbar controls
          <>
            <Link
              href="/login"
              className="text-slate-350 hover:text-white px-4 py-2 text-sm font-bold transition-all cursor-pointer"
            >
              Log In
            </Link>
            <Link
              href="/generate"
              className="bg-emerald-500 hover:bg-emerald-450 active:bg-emerald-600 text-slate-950 px-5 py-2.5 rounded-full text-sm font-extrabold shadow-md hover:shadow-emerald-500/10 transition-all cursor-pointer"
            >
              Create your BitTree
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
