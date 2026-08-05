"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams, useRouter } from "next/navigation";

function GenerateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [authChecking, setAuthChecking] = useState(true);
  const [links, setLinks] = useState([{ link: "", linktext: "" }]);
  const [handle, sethandle] = useState("");
  const [pic, setpic] = useState("");
  const [desc, setdesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (!data.authenticated) {
          toast.error("Please log in to customize your BitTree.");
          router.push("/login");
        } else {
          setAuthChecking(false);
          // If the user already has a saved Linktree
          if (data.linktree) {
            // sethandle(data.linktree.handle || "");
            // setpic(data.linktree.pic || "");
            // setdesc(data.linktree.desc || "");
            sethandle("");
            setpic( "");
            setdesc("");
            if (data.linktree.links && data.linktree.links.length > 0) {
              setLinks(data.linktree.links);
            }
          } else {
            // User is claiming for the first time
            sethandle(searchParams.get("handle") || data.user.username || "");
            setpic(data.user.avatarUrl || "");
            setdesc(`Hi, I'm ${data.user.name || data.user.username}!`);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Failed to verify login status.");
        router.push("/login");
      }
    }
    checkAuth();
  }, [router, searchParams]);

  const handleChange = (index, link, linktext) => {
    setPublishedUrl(""); // Clear published notification when user edits links
    setLinks((initialLinks) => {
      return initialLinks.map((item, i) => {
        if (i === index) {
          return { link, linktext };
        } else {
          return item;
        }
      });
    });
  };

  const addLink = () => {
    setPublishedUrl("");
    setLinks(links.concat([{ link: "", linktext: "" }]));
  };

  const removeLink = (index) => {
    setPublishedUrl("");
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    } else {
      setLinks([{ link: "", linktext: "" }]);
    }
  };

  const submitLinks = async () => {
    if (!handle.trim()) {
      toast.error("Please choose a handle first!");
      return;
    }

    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      links: links,
      handle: handle,
      pic: pic,
      desc: desc,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const r = await fetch("/api/add", requestOptions);
      const result = await r.json();
      if (result.success) {
        toast.success(result.message);
        // Set the active published shareable URL
        const liveUrl = window.location.origin + "/" + handle.trim().toLowerCase();
        setPublishedUrl(liveUrl);
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        <span className="text-slate-400 font-medium">Verifying session...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">
              Customize your BitTree
            </h1>

            {/* Step 1 */}
            <div className="mb-8 p-5 bg-slate-950/40 rounded-2xl border border-slate-800/50">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">1</span>
                Claim / Update your Handle
              </h2>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                  bittree.io/
                </span>
                <input
                  value={handle}
                  onChange={(e) => {
                    sethandle(e.target.value.replace(/\s+/g, ""));
                    setPublishedUrl("");
                  }}
                  className="w-full pl-24 pr-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-200 placeholder-slate-650 transition-all font-medium"
                  type="text"
                  placeholder="choose-a-handle"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-8 p-5 bg-slate-950/40 rounded-2xl border border-slate-800/50">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center justify-center sm:justify-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">2</span>
                Add Links
              </h2>
              <div className="space-y-4 mb-4">
                {links.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800/40"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        value={item.linktext}
                        onChange={(e) =>
                          handleChange(index, item.link, e.target.value)
                        }
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-lg text-slate-300 placeholder-slate-600 text-sm"
                        type="text"
                        placeholder="Link Text (e.g. My Website)"
                      />
                      <input
                        value={item.link}
                        onChange={(e) =>
                          handleChange(index, e.target.value, item.linktext)
                        }
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-lg text-slate-300 placeholder-slate-600 text-sm"
                        type="text"
                        placeholder="Link URL (e.g. https://website.com)"
                      />
                    </div>
                    {links.length > 1 && (
                      <button
                        onClick={() => removeLink(index)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all self-end sm:self-center cursor-pointer"
                        title="Delete Link"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addLink}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-emerald-400 font-bold rounded-xl border border-slate-700/50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Link
              </button>
            </div>

            {/* Step 3 */}
            <div className="mb-6 p-5 bg-slate-950/40 rounded-2xl border border-slate-800/50">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">3</span>
                Customize Profile Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Profile Picture URL
                  </label>
                  <input
                    value={pic}
                    onChange={(e) => {
                      setpic(e.target.value);
                      setPublishedUrl("");
                    }}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-300 placeholder-slate-650 transition-all text-sm"
                    type="text"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Bio / Description
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => {
                      setdesc(e.target.value);
                      setPublishedUrl("");
                    }}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-xl text-slate-300 placeholder-slate-650 transition-all text-sm h-24 resize-none"
                    placeholder="Tell your audience about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Live Link Success Notification */}
            {publishedUrl && (
              <div className="mb-6 p-5 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl animate-fade-in space-y-3.5 shadow-lg shadow-emerald-500/5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
                  <svg className="w-5 h-5 fill-emerald-500/10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Your BitTree is successfully live!</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Your custom profile page is published. Copy the shareable link below to place it in your social bios:
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
                  <input
                    readOnly
                    value={publishedUrl}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-350 text-xs font-mono focus:outline-none select-all"
                  />
                  <div className="flex gap-2 justify-end sm:justify-start">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(publishedUrl);
                        toast.info("Link copied to clipboard!");
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700/50 cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy
                    </button>
                    <a
                      href={publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-extrabold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Live
                    </a>
                  </div>
                </div>
              </div>
            )}

            <button
              disabled={
                loading ||
                !handle.trim() ||
                !links.some((l) => l.link.trim() !== "" && l.linktext.trim() !== "")
              }
              onClick={submitLinks}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer text-base"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save and Publish BitTree"
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 flex justify-center sticky top-28">
          <div className="relative w-[340px] h-[680px] bg-slate-900 border-[12px] border-slate-850 rounded-[50px] shadow-2xl overflow-hidden flex flex-col items-center">
            {/* Phone Notch */}
            <div className="absolute top-0 w-36 h-5 bg-slate-850 rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mb-1"></div>
            </div>

            {/* Simulated Content */}
            <div className="w-full h-full flex flex-col pt-12 pb-8 px-6 bg-gradient-to-b from-indigo-950/70 via-slate-950 to-emerald-950/40 overflow-y-auto scrollbar-none relative">
              {/* Glowing Background Light */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>

              {/* Avatar */}
              <div className="flex flex-col items-center mt-6 mb-6">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800/80 bg-slate-900 shadow-xl overflow-hidden flex items-center justify-center relative group">
                  {pic.trim() ? (
                    <img
                      src={pic}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "";
                      }}
                    />
                  ) : (
                    <div className="text-slate-500 flex flex-col items-center justify-center">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Handle Name */}
                <h3 className="mt-4 text-xl font-bold text-slate-100 flex items-center gap-1.5">
                  {handle.trim() ? `@${handle.trim().toLowerCase()}` : "@yourhandle"}
                  <svg
                    className="w-4 h-4 text-blue-400 fill-blue-400/20"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </h3>

                {/* Description */}
                <p className="mt-2 text-slate-400 text-xs text-center max-w-[240px] min-h-[16px] leading-relaxed break-words">
                  {desc.trim() ? desc.trim() : "Your short bio will appear here."}
                </p>
              </div>

              {/* Links Render */}
              <div className="flex-1 space-y-3.5 w-full">
                {links.some((l) => l.linktext.trim() !== "" || l.link.trim() !== "") ? (
                  links.map(
                    (item, i) =>
                      (item.linktext.trim() || item.link.trim()) && (
                        <a
                          key={i}
                          href={item.link.trim() || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3.5 px-4 bg-slate-900/60 hover:bg-slate-900 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 rounded-2xl text-center text-sm font-semibold text-slate-200 shadow-md hover:shadow-lg transition-all duration-300 scale-[0.98] hover:scale-[1.02] transform pointer-events-none"
                        >
                          {item.linktext.trim() ? item.linktext.trim() : "Untitled Link"}
                        </a>
                      )
                  )
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-slate-800/50 rounded-2xl text-slate-650 text-xs">
                    Links preview will show up here.
                  </div>
                )}
              </div>

              {/* Logo badge at bottom */}
              <div className="mt-8 mb-2 flex items-center justify-center gap-1.5 opacity-60">
                <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500">
                  Powered by
                </span>
                <span className="text-[11px] font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  BitTree
                </span>
              </div>
            </div>
          </div>
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

export default function Generate() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          <span className="text-slate-400 font-medium">Loading Editor...</span>
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
