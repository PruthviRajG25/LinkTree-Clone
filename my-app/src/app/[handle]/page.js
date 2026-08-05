import React from "react";
import clientPromise from "../../../lib/mongodb";
import Link from "next/link";

function getSocialIcon(url) {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes("github.com")) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    );
  }
  if (lowercaseUrl.includes("youtube.com") || lowercaseUrl.includes("youtu.be")) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (lowercaseUrl.includes("twitter.com") || lowercaseUrl.includes("x.com")) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (lowercaseUrl.includes("instagram.com")) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

export default async function HandlePage(props) {
  const params = await props.params;
  const handle = params.handle;
  const normalizedHandle = handle.toLowerCase();

  let record = null;
  try {
    const client = await clientPromise;
    const db = client.db("linktree");
    record = await db.collection("links").findOne({ handle: normalizedHandle });
  } catch (error) {
    console.error("Failed to query MongoDB:", error);
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="text-center max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <h1 className="text-2xl font-black text-slate-100">Handle Not Claimed</h1>
          <p className="text-slate-400 text-sm">
            @{handle} is available. Claim it right now.
          </p>
          <Link
            href={`/generate?handle=${encodeURIComponent(handle)}`}
            className="block w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/10 text-center text-sm cursor-pointer"
          >
            Claim @{handle} Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center pt-28 pb-16 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] -z-10"></div>
      <div className="w-full max-w-xl flex flex-col items-center">
        
        <div className="flex flex-col items-center text-center space-y-4 mb-10 w-full">
          <div className="relative w-28 h-28 rounded-full border-[3px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden flex items-center justify-center">
            {record.pic ? (
              <img src={record.pic} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-500 text-xl font-bold">
                {record.handle.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center justify-center gap-1.5">
              @{record.handle}
            </h1>
            {record.desc && (
              <p className="text-slate-400 text-sm max-w-sm mx-auto break-words">
                {record.desc}
              </p>
            )}
          </div>
        </div>

        <div className="w-full space-y-4 px-2">
          {record.links && record.links.length > 0 ? (
            record.links.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-full py-4 px-6 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-2xl font-bold text-slate-100 transition-all duration-300 transform scale-[0.98] hover:scale-[1.02] cursor-pointer"
              >
                <div className="absolute left-5 text-slate-400 group-hover:text-emerald-400">
                  {getSocialIcon(item.link)}
                </div>
                <span className="text-base">{item.linktext}</span>
              </a>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl text-slate-500 text-sm">
              No links available.
            </div>
          )}
        </div>

        <div className="mt-16">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-slate-400 cursor-pointer"
          >
            Create your own <span className="text-emerald-400 font-extrabold">BitTree</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
