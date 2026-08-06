# 🌲 BitTree (Linktree Clone)

BitTree is a premium, high-performance link-in-bio aggregator and dashboard generator built with **Next.js (App Router)**, **MongoDB**, and **Tailwind CSS**. It enables users to authenticate via GitHub, claim custom handles (e.g., `bittree.io/username`), manage a list of dynamic social links with automatic brand logo detection, and publish an optimized public-facing landing page.

---

## 🛠️ Project Architecture

This project is built on Next.js 15+ using the **App Router** layout. It leverages a hybrid model of **React Server Components (RSC)** for fast loading and optimal SEO, and **Client Components** for real-time interactive elements like forms, previews, and toast notifications.

### Directory Structure

```bash
my-app/
├── components/
│   ├── Navbar.js           # Responsive client navigation bar with session detection
│   └── Avatar.js           # Client-side component for avatar rendering with error fallbacks
├── lib/
│   ├── auth.js             # Session verification and cookie retrieval logic
│   └── mongodb.js          # Shared MongoDB client helper with connection caching
├── public/
│   ├── home.png            # Showcase screenshot on landing page
│   └── linktree-logo.webp  # Header logo assets
├── src/
│   └── app/
│       ├── globals.css     # Global styles and Tailwind configurations
│       ├── layout.js       # App-wide context, layout, and font configuration
│       ├── page.js         # Interactive marketing landing page
│       ├── login/          # Login route hosting the sign-in cards
│       ├── generate/       # Dashboard & editor page with real-time phone simulator
│       ├── utils/
│       │   └── socialIcons.js # Centralized icon utility for social media detection
│       ├── [handle]/       # Dynamic public route executing high-performance server rendering
│       └── api/            # Route Handlers (API Endpoints)
│           ├── add/        # Inserts/updates user Linktree configurations (POST)
│           └── auth/       # Custom auth logic (session checking and callback handlers)
├── jsconfig.json           # Path alias settings mapping `@/*` to `./src/*`
└── package.json            # Node project configuration and dependencies
```

---

## 🚀 Key Features

1. **Claim Custom Handles**: Interactive claims check via MongoDB right on the homepage, redirecting directly into the customization suite.
2. **Dynamic Social Logo Detection**: An intelligent engine scans URLs (e.g. `youtube.com`) and names (e.g. `Facebook`) in real-time, displaying custom brand SVGs.
3. **Live Simulator Preview**: A real-time syncing mockup of a mobile device that mirrors exactly how the live link list looks.
4. **Resilient Avatar Handler**: State-driven fallback mechanisms that swap out broken image URLs with stylized user initials to prevent default browser broken image symbols from ruining the UI.
5. **Secure Authentication**: Cookie-based session tracking mapped directly to GitHub profile details stored securely in MongoDB.

---

## 💡 Key Revision Notes & Troubleshooting

### 1. React Server Component (RSC) Event Handler Constraint
* **The Issue**: During rendering of the public profile page (`[handle]/page.js`), adding an `onError={...}` event listener directly to the avatar `<img>` threw a Next.js compilation error. 
* **The Reason**: Server Components are compiled to static JSON/HTML on the server and do not support dynamic JS event handlers (like `onClick` or `onError`).
* **The Fix**: We extracted the avatar rendering into a dedicated Client Component (`components/Avatar.js`) marked with `"use client";`. We pass `pic` and `handle` from the Server Component to this child component, satisfying Next.js rules while retaining full SEO benefits on the main profile page.

### 2. Eliminating Browser Broken Image Icon
* **The Issue**: When a user inputs an invalid, blank, or blocked image URL, the browser shows a broken image placeholder icon inside the circular avatar container.
* **The Reason**: React does not automatically unmount an `<img>` tag when `src` fails to load. Setting `e.target.src = ""` in `onError` still leaves a broken image symbol in the browser.
* **The Fix**: We introduced a state-driven wrapper using `useState(false)` for `imageError`. When an image fails to load, `onError` flips the state to `true`, prompting React to completely unmount the `<img>` tag and replace it with a styled SVG placeholder (on the dashboard) or the user's initials (on the public profile).

---

## 📚 Revision & Reference Documentation

Here are the official documentation links referred to during the design and optimization of this clone:

### Next.js & React App Router
* [Next.js App Router Architecture](https://nextjs.org/docs/app)
* [Server Components (RSC) vs Client Components Guide](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
* [Dynamic Routes & Parameters (`[slug]`)](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
* [Next.js Route Handlers (API Endpoints)](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
* [Cookies & Headers Utility in Server Components](https://nextjs.org/docs/app/api-reference/functions/cookies)

### Database & Storage
* [MongoDB Node.js Driver Documentation](https://www.mongodb.com/docs/drivers/node/current/)
* [MongoDB Connection Pooling Best Practices in Serverless / Next.js](https://github.com/mongodb/developer-templates/blob/master/nextjs/lib/mongodb.ts)

### Web Standards & Brand Guidelines
* [GitHub OAuth App Registration Guide](https://docs.github.com/en/apps/creating-oauth-apps/registering-oauth-apps)
* [SVG Brand Icons Reference (Simple Icons)](https://simpleicons.org/)
* [Tailwind CSS v4 Styling Reference](https://tailwindcss.com/docs)
* [React Toastify API Reference](https://fkhadra.github.io/react-toastify/introduction/)
