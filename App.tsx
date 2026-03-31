/**
 * App.tsx — Lucius Engine V2
 *
 * Application entry point and route configuration.
 * Uses createBrowserRouter (v6.4+ data router API) for forward-compatible
 * architecture — loaders, actions, and error boundaries are available
 * per-route when needed in V3, at zero cost today.
 *
 * Route structure:
 *   /              → AppLayout (frame — never re-mounts)
 *   ├── index      → Dashboard (ComingSoon placeholder)
 *   ├── threat-ops → Threat Ops (ComingSoon placeholder)
 *   ├── clients    → Clients (ComingSoon placeholder)
 *   ├── evidence   → Evidence Vault (ComingSoon placeholder)
 *   ├── reports    → Reports (ComingSoon placeholder)
 *   ├── settings   → Settings (ComingSoon placeholder)
 *   └── *          → Navigate to / (replace — bad URL never enters history)
 *
 * Stage 3 migration: replace each <ComingSoon /> with the real screen import.
 * No structural change to the router required — one line per route.
 */

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";

// ─── ComingSoon placeholder ───────────────────────────────────────────────────

/**
 * ComingSoon
 *
 * Typed placeholder rendered through <Outlet /> for every unbuilt screen.
 * Named component — not an anonymous inline arrow function — so React's
 * reconciler can identify and diff it correctly across renders.
 *
 * h-full fills the available main content area provided by AppLayout.
 * font-mono for the screen name: it's a technical identifier, not a heading.
 *
 * ⚑ SWAP POINT (Stage 3): replace <ComingSoon name="X" /> with the real
 *   screen import. Router structure and AppLayout stay untouched.
 */
interface ComingSoonProps {
  name: string;
}

function ComingSoon({ name }: ComingSoonProps): JSX.Element {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-3"
      role="main"
      aria-label={`${name} screen — coming soon`}
    >
      {/* Subtle placeholder container — not a real empty state, just a stand-in */}
      <div className="flex flex-col items-center gap-2 px-6 py-8 rounded border border-border-subtle bg-bg-surface">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Coming Soon
        </p>
        {/*
         * font-mono: screen name is a technical route identifier.
         * This mirrors the convention used for all system identifiers
         * across the platform — domains, CVE IDs, route names.
         */}
        <p className="text-sm font-mono text-text-secondary">
          {name}
        </p>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

/**
 * createBrowserRouter — v6.4+ data router.
 *
 * AppLayout is the parent route element. It renders once and stays mounted.
 * <Outlet /> inside AppLayout renders the matched child route — only the
 * room changes, never the building.
 *
 * index: true on Dashboard — renders when parent path "/" matches exactly
 * and no child path matches. Semantically correct; avoids the ambiguous
 * path: "/" on a child inside a parent already at path: "/".
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        // index: true — Dashboard is the default view at "/"
        // Never use path: "/" here — it creates an ambiguous double-match
        index: true,
        element: <ComingSoon name="Dashboard" />,
      },
      {
        path: "threat-ops",
        element: <ComingSoon name="Threat Ops" />,
      },
      {
        path: "clients",
        element: <ComingSoon name="Clients" />,
      },
      {
        path: "evidence",
        element: <ComingSoon name="Evidence Vault" />,
      },
      {
        path: "reports",
        element: <ComingSoon name="Reports" />,
      },
      {
        path: "settings",
        element: <ComingSoon name="Settings" />,
      },
      {
        /*
         * Catch-all: any unknown path redirects to "/".
         * replace={true} — the bad URL is replaced in browser history,
         * not pushed. Navigating Back from "/" does not return to the
         * broken route. Unknown paths disappear from history cleanly.
         *
         * V2 has no 404 screen. Unknown routes go home.
         */
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

// ─── App ──────────────────────────────────────────────────────────────────────

/**
 * App
 *
 * Root component. Mounts the router. Nothing else lives here.
 * All layout, state, and context providers compose inside the route tree —
 * keeping this file as a clean, single-responsibility entry point.
 */
export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
