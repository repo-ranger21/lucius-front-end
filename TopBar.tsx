/**
 * TopBar.tsx — Lucius Engine V2
 *
 * The fixed header strip rendered above every screen. Four responsibilities:
 *
 *   1. Page title — derived from useLocation() via ROUTE_LABELS static map.
 *      No prop drilling. Fallback to 'Lucius Engine' for unmapped routes.
 *
 *   2. System status pill — animate-ping pulse on bg-status-online dot.
 *      Currently hardcoded to "online". Marked for clean swap to
 *      <StatusDot status="online" pulse /> when StatusDot.tsx is built.
 *
 *   3. Search + notification icon buttons — accessible placeholders.
 *      aria-labels set. No onClick handlers until Stage 3 screens are built.
 *
 *   4. Avatar — initials circle, no colored background, no image.
 *      Placeholder "CP" until auth context is wired in Stage 4.
 *
 * Height locked to h-14 (56px). Must stay matched with the sidebar wordmark
 * strip height — together they form one visual top band across the layout.
 */

import { useLocation } from "react-router-dom";
import { Search, Bell } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopBarProps {
  /**
   * Received from AppLayout. Not used to render anything in TopBar directly —
   * included so TopBar can be aware of layout state for future responsive
   * adjustments (e.g. title truncation at narrow widths when sidebar expands).
   */
  isCollapsed: boolean;
}

// ─── Static route label map ───────────────────────────────────────────────────

/**
 * Maps route pathnames to human-readable page titles.
 *
 * Static for V2. If routes become role-based or tenant-specific in V3,
 * extract this to a shared route config and derive titles there.
 * The lookup pattern (one line + fallback) stays identical regardless.
 */
const ROUTE_LABELS: Record<string, string> = {
  "/":           "Dashboard",
  "/threat-ops": "Threat Ops",
  "/clients":    "Clients",
  "/evidence":   "Evidence Vault",
  "/reports":    "Reports",
  "/settings":   "Settings",
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * SystemStatusPill
 *
 * Inline status indicator showing platform health at a glance.
 * Uses animate-ping on an absolutely-positioned sibling — pure Tailwind,
 * no custom keyframes, no tailwindcss-animate dependency.
 *
 * ⚑ SWAP POINT (Stage 2):
 *   Replace this entire component usage with:
 *   <StatusDot status="online" pulse />
 *   once StatusDot.tsx is built. No structural change to TopBar required.
 */
function SystemStatusPill(): JSX.Element {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-elevated border border-border-subtle"
      role="status"
      aria-label="System status: online"
    >
      {/*
       * animate-ping pattern — two layered spans:
       *   Outer: absolute, animates scale + opacity (the expanding ring)
       *   Inner: relative, the solid dot that stays in place
       * Pure Tailwind animate-ping — no custom keyframes needed.
       */}
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-online opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-status-online" />
      </span>

      <span className="text-xs font-mono text-text-secondary tracking-wider">
        ONLINE
      </span>
    </div>
  );
}

/**
 * IconButton
 *
 * Reusable accessible icon button. Used for Search and Notifications.
 * No onClick in Stage 1 — handlers wired when target screens are built.
 */
interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function IconButton({ icon, label, onClick }: IconButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex items-center justify-center",
        "h-8 w-8 rounded",
        "text-text-muted hover:text-text-primary",
        "hover:bg-bg-elevated",
        "transition-colors duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent-400",
      ].join(" ")}
    >
      {icon}
    </button>
  );
}

/**
 * Avatar
 *
 * Initials-based avatar circle. No image, no colored background.
 * Placeholder "CP" until auth context provides real user data (Stage 4).
 * Rendered as a button to support future dropdown menu on click.
 */
function Avatar(): JSX.Element {
  // ⚑ SWAP POINT (Stage 4): replace hardcoded initials with user context
  const initials = "CP";

  return (
    <button
      type="button"
      aria-label="User menu"
      className={[
        "flex items-center justify-center",
        "h-8 w-8 rounded-full shrink-0",
        "bg-bg-elevated border border-border-default",
        "text-xs font-semibold text-text-secondary",
        "hover:border-border-strong hover:text-text-primary",
        "transition-colors duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent-400",
        "cursor-pointer select-none",
      ].join(" ")}
    >
      {initials}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * TopBar
 *
 * Fixed header rendered above every screen. Derives the page title
 * from the current pathname — no props, no context, no drilling.
 * Height h-14 (56px) must stay matched with sidebar wordmark strip.
 */
export function TopBar({ isCollapsed: _isCollapsed }: TopBarProps): JSX.Element {
  const { pathname } = useLocation();

  /*
   * Single-line title derivation.
   * ROUTE_LABELS[pathname] covers all mapped routes.
   * ?? 'Lucius Engine' is the catch-all — never renders a blank title,
   * even for future routes added before their label is registered.
   */
  const pageTitle = ROUTE_LABELS[pathname] ?? "Lucius Engine";

  return (
    /*
     * h-14 = 56px. Matches sidebar wordmark strip height exactly.
     * bg-bg-surface + border-b = visually unified top band with the sidebar.
     * Both components share these two classes — they must never drift.
     *
     * z-30: above sidebar (z-20), below dropdowns and modals (z-40+).
     */
    <header
      className={[
        "flex items-center justify-between",
        "h-14 px-6",
        "bg-bg-surface border-b border-border-subtle",
        "z-30",
        // Prevents TopBar from compressing under any layout condition
        "shrink-0",
      ].join(" ")}
      role="banner"
    >

      {/* ── Left: Page title ─────────────────────────────────────────────── */}
      {/*
       * text-2xl font-semibold matches the design system page title spec.
       * min-w-0 + truncate prevents long titles from overflowing into the
       * right action cluster on narrow viewports or expanded sidebar.
       */}
      <div className="flex items-center min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-text-primary truncate">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right: status + actions + avatar ─────────────────────────────── */}
      {/*
       * gap-2 between tightly related items (icons).
       * gap-4 before the avatar — visual separation of identity from actions.
       * items-center ensures vertical alignment across different element heights.
       */}
      <div className="flex items-center gap-2 shrink-0 ml-4">

        {/* System status pill — hardcoded online for Stage 1 */}
        <SystemStatusPill />

        {/* Divider between status and icon actions */}
        <div
          className="h-5 w-px bg-border-subtle mx-1"
          aria-hidden="true"
        />

        {/* Search — no handler until Stage 3 */}
        <IconButton
          icon={<Search className="h-4 w-4" aria-hidden="true" />}
          label="Search"
        />

        {/* Notifications — no handler until Stage 3 */}
        <IconButton
          icon={<Bell className="h-4 w-4" aria-hidden="true" />}
          label="Notifications"
        />

        {/* Divider between actions and identity */}
        <div
          className="h-5 w-px bg-border-subtle mx-1"
          aria-hidden="true"
        />

        {/* Avatar — placeholder initials until auth is wired */}
        <Avatar />

      </div>
    </header>
  );
}

export default TopBar;
