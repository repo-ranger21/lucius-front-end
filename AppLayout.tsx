/**
 * AppLayout.tsx — Lucius Engine V2
 *
 * The application frame. Rendered once and never re-mounts.
 * Composes the fixed Sidebar, fixed TopBar, and the scrollable
 * <Outlet /> content region. Every screen in the platform renders
 * through the Outlet — only the room changes, never the building.
 *
 * Layout contract:
 *   - Root:    flex row, h-screen, overflow-hidden  → page itself never scrolls
 *   - Sidebar: fixed-height, left column, z-20
 *   - Right:   flex column, flex-1, min-w-0         → prevents wide content overflow
 *     - TopBar:  fixed-height header, z-30, shrink-0
 *     - Main:    flex-1, overflow-y-auto             → only the content area scrolls
 *
 * Sidebar collapse state:
 *   - Persisted to localStorage under key `lucius:sidebar:collapsed`
 *   - Read via initializer function in useState → zero flash on mount
 *   - Passed down as prop; Sidebar owns its own width class via token
 */

import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

// ─── Constants ────────────────────────────────────────────────────────────────

/** localStorage key for sidebar collapsed state persistence. */
const SIDEBAR_STORAGE_KEY = "lucius:sidebar:collapsed" as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppLayoutProps {
  /** Reserved for future use — e.g. tenant context, feature flags. */
  children?: never;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reads the initial collapsed state from localStorage.
 * Used as the useState initializer function so the value is read
 * exactly once on mount — preventing any width flash before hydration.
 */
function readCollapsedState(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === null) return false; // Default: expanded
    return stored === "true";
  } catch {
    // localStorage unavailable (private browsing, SSR, permissions)
    return false;
  }
}

/**
 * Persists the collapsed state to localStorage.
 * Wrapped in try/catch — a storage write failure must never crash the UI.
 */
function writeCollapsedState(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // Silently ignore — UI still works, just won't persist
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AppLayout
 *
 * The outermost shell that wraps every authenticated screen.
 * Manages sidebar collapse state and wires it to localStorage persistence.
 * Does not own any route-specific state — that lives in each screen.
 */
export function AppLayout(_props: AppLayoutProps): JSX.Element {
  // Initialize from localStorage — no flash, no useEffect needed
  const [isCollapsed, setIsCollapsed] = useState<boolean>(readCollapsedState);

  /**
   * Toggles the sidebar and persists the new state immediately.
   * useCallback prevents unnecessary re-renders of Sidebar and TopBar
   * since both receive this as a prop.
   */
  const handleToggleCollapse = useCallback((): void => {
    setIsCollapsed((prev) => {
      const next = !prev;
      writeCollapsedState(next);
      return next;
    });
  }, []);

  return (
    /*
     * Root shell:
     *   flex          → horizontal layout (sidebar | right column)
     *   h-screen      → occupies full viewport height
     *   overflow-hidden → root never scrolls; only <main> does
     *   bg-bg-base    → deepest background layer
     */
    <div className="flex h-screen overflow-hidden bg-bg-base">

      {/* ── Sidebar ── fixed-width left column ──────────────────────────── */}
      {/*
       * z-20 keeps sidebar above main content but below TopBar (z-30)
       * and below modals/dropdowns (z-40+).
       * Height is h-full relative to the flex container (= h-screen).
       */}
      <div className="relative z-20 h-full shrink-0">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/*
       * Right column:
       *   flex flex-col   → stacks TopBar above main vertically
       *   flex-1          → takes all remaining horizontal space
       *   min-w-0         → CRITICAL: prevents wide content (e.g. tables)
       *                     from overflowing the flex container and
       *                     pushing the sidebar off-screen
       *   overflow-hidden → delegates scroll to <main> only
       */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* ── TopBar ── fixed-height header strip ─────────────────────── */}
        {/*
         * shrink-0 prevents TopBar from compressing when content is tall.
         * z-30 keeps it above sidebar (z-20) and below overlays (z-40+).
         */}
        <div className="shrink-0 z-30">
          <TopBar isCollapsed={isCollapsed} />
        </div>

        {/* ── Content region ── the only scrollable area ──────────────── */}
        {/*
         * flex-1         → fills all remaining vertical space below TopBar
         * overflow-y-auto → this is the ONE place vertical scroll happens
         * overflow-x-hidden → wide tables clip here; layout doesn't break
         * bg-bg-base      → consistent page background under all screens
         *
         * The <Outlet /> renders each screen's root element here.
         * Screens must NOT set their own overflow or position:fixed —
         * they are guests inside this container.
         */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-base"
          // Accessibility: landmark role for screen readers
          role="main"
          aria-label="Main content"
        >
          {/*
           * Inner wrapper provides consistent page-level padding.
           * All screens inherit p-6 from here — they don't set their own
           * page padding. Screens may set internal padding for sub-sections.
           *
           * min-h-full ensures empty screens (e.g. ComingSoon placeholders)
           * still fill the viewport so the background is consistent.
           */}
          <div className="min-h-full p-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default AppLayout;
