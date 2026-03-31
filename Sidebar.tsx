/**
 * Sidebar.tsx — Lucius Engine V2
 *
 * The navigation directory. Fixed-height left column that persists across
 * all screens. Manages its own visual state based on the isCollapsed prop
 * passed down from AppLayout.
 *
 * Five enforced constraints:
 *   1. w-sidebar-collapsed / w-sidebar-expanded — named tokens, never magic numbers
 *   2. end={true} on Dashboard NavLink — exact match for "/" only
 *   3. TooltipContent conditional on isCollapsed — icon-only nav must label on hover
 *   4. transition-all duration-200 ease-in-out — width change always animates
 *   5. shrink-0 on root — sidebar defends its own width in any flex context
 *
 * Navigation structure is static for V2. Dynamic/role-based nav is a V3 concern.
 */

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Users,
  Archive,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidebarProps {
  /** Whether the sidebar is in the 64px collapsed state. */
  isCollapsed: boolean;
  /** Callback to toggle collapsed state — owned by AppLayout. */
  onToggleCollapse: () => void;
}

interface NavItem {
  readonly to: string;
  readonly icon: LucideIcon;
  readonly label: string;
  /** If true, NavLink uses end={true} for exact-match active detection. */
  readonly exact?: boolean;
}

// ─── Static navigation data ───────────────────────────────────────────────────

/**
 * Primary navigation items. Order is intentional — most-used first.
 * Static for V2. Extract to a config or derive from user role in V3.
 */
const NAV_ITEMS: readonly NavItem[] = [
  { to: "/",           icon: LayoutDashboard, label: "Dashboard",     exact: true },
  { to: "/threat-ops", icon: Shield,          label: "Threat Ops"                 },
  { to: "/clients",    icon: Users,           label: "Clients"                    },
  { to: "/evidence",   icon: Archive,         label: "Evidence Vault"             },
  { to: "/reports",    icon: FileText,        label: "Reports"                    },
] as const;

/**
 * Settings lives below the separator — it's configuration, not navigation.
 * Separated visually to signal a different intent to the user.
 */
const SETTINGS_ITEM: NavItem = {
  to: "/settings",
  icon: Settings,
  label: "Settings",
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavItemButtonProps {
  item: NavItem;
  isCollapsed: boolean;
}

/**
 * A single navigation row — icon + label in expanded mode, icon-only
 * with tooltip in collapsed mode. Handles NavLink active state styling.
 */
function NavItemButton({ item, isCollapsed }: NavItemButtonProps): JSX.Element {
  const Icon = item.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/*
         * NavLink injects isActive into the className callback.
         * end={true} on Dashboard prevents "/" matching every route.
         * Without `end`, NavLink considers "/" active for "/threat-ops",
         * "/clients", etc. — because every path starts with "/".
         */}
        <NavLink
          to={item.to}
          end={item.exact === true}
          className={({ isActive }) =>
            [
              // Base styles — all nav items share these
              "group flex items-center gap-3 rounded",
              "text-sm font-medium",
              "transition-colors duration-150",
              "outline-none focus-visible:ring-2 focus-visible:ring-accent-400",
              // Collapsed: center icon; Expanded: left-align with padding
              isCollapsed ? "justify-center p-2" : "px-3 py-2",
              // Active state: accent background + primary text
              isActive
                ? "bg-accent-100 text-text-primary"
                : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
            ].join(" ")
          }
          aria-label={item.label}
        >
          {({ isActive }) => (
            <>
              <Icon
                className={[
                  "shrink-0",
                  // Active icon inherits accent color; inactive dims slightly
                  isActive ? "text-accent-300" : "text-text-secondary group-hover:text-text-primary",
                  "transition-colors duration-150",
                  // Consistent icon size regardless of collapse state
                  "h-[18px] w-[18px]",
                ].join(" ")}
                aria-hidden="true"
              />
              {/*
               * Label: visible only in expanded mode.
               * Using opacity + width approach so the transition
               * looks smooth rather than abruptly clipping text.
               */}
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </>
          )}
        </NavLink>
      </TooltipTrigger>

      {/*
       * Constraint 3: TooltipContent only renders when collapsed.
       * In expanded mode, the label text is visible — tooltip is redundant
       * and would create a confusing double-label on hover.
       * side="right" positions the tooltip outside the sidebar edge.
       */}
      {isCollapsed && (
        <TooltipContent
          side="right"
          sideOffset={8}
          className="bg-bg-overlay border border-border-default text-text-primary text-sm font-medium"
        >
          {item.label}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Sidebar
 *
 * Platform navigation directory. Renders the Lucius Engine wordmark,
 * primary nav items, Settings below a separator, system status strip,
 * and the collapse toggle pinned to the bottom.
 */
export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps): JSX.Element {
  const CollapseIcon = isCollapsed ? ChevronRight : ChevronLeft;

  return (
    /*
     * TooltipProvider must wrap all Tooltip usage.
     * delayDuration={0} — tooltips appear immediately in collapsed mode
     * since the user is hovering over navigation, not passive content.
     */
    <TooltipProvider delayDuration={0}>
      {/*
       * Root element — the sidebar column itself.
       *
       * Constraint 1: w-sidebar-collapsed / w-sidebar-expanded
       *   Named tokens from tailwind.config.ts. One config edit propagates.
       *
       * Constraint 4: transition-all duration-200 ease-in-out
       *   Animates the width change so the layout shift reads as intentional,
       *   not as a jump. 200ms: fast enough to feel snappy, slow enough to see.
       *
       * Constraint 5: shrink-0
       *   Sidebar defends its own width regardless of the parent flex context.
       *   The parent (AppLayout) also applies shrink-0, but this is a belt-and-
       *   suspenders guarantee — if the outer wrapper ever changes, this holds.
       */}
      <aside
        className={[
          "flex flex-col h-full shrink-0",
          "bg-bg-surface border-r border-border-subtle",
          "transition-all duration-200 ease-in-out",
          // Constraint 1: named tokens, not w-16 / w-60
          isCollapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded",
          "overflow-hidden", // Clips label text during collapse animation
        ].join(" ")}
        aria-label="Primary navigation"
        // Communicate collapse state to assistive technology
        aria-expanded={!isCollapsed}
      >

        {/* ── Wordmark / logo strip ──────────────────────────────────────── */}
        <div
          className={[
            "flex items-center shrink-0",
            "h-topbar-height border-b border-border-subtle",
            // Align with TopBar height so horizontal rule is continuous
            isCollapsed ? "justify-center px-0" : "px-4 gap-2",
          ].join(" ")}
        >
          {/* Icon mark — always visible */}
          <div
            className="flex items-center justify-center h-8 w-8 rounded bg-accent-500 shrink-0"
            aria-hidden="true"
          >
            <Zap className="h-4 w-4 text-text-primary" aria-hidden="true" />
          </div>

          {/* Wordmark — hidden in collapsed mode */}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-text-primary leading-tight tracking-tight">
                Lucius Engine
              </span>
              <span className="text-xs text-text-muted leading-tight font-mono">
                v2.0
              </span>
            </div>
          )}
        </div>

        {/* ── Primary navigation ────────────────────────────────────────── */}
        <nav
          className={[
            "flex flex-col flex-1 gap-1 overflow-y-auto overflow-x-hidden",
            "py-3",
            isCollapsed ? "px-2" : "px-3",
          ].join(" ")}
          aria-label="Main navigation"
        >
          {/* Section label — only visible in expanded mode */}
          {!isCollapsed && (
            <span className="px-3 pb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Navigation
            </span>
          )}

          {NAV_ITEMS.map((item) => (
            <NavItemButton
              key={item.to}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}

          {/* ── Separator — visually separates config from navigation ── */}
          <div className={["py-2", isCollapsed ? "px-1" : "px-0"].join(" ")}>
            <Separator className="bg-border-subtle" />
          </div>

          {/* Section label for settings — expanded mode only */}
          {!isCollapsed && (
            <span className="px-3 pb-1 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Configuration
            </span>
          )}

          <NavItemButton item={SETTINGS_ITEM} isCollapsed={isCollapsed} />
        </nav>

        {/* ── System status strip ───────────────────────────────────────── */}
        {/*
         * Shows operational health of the platform at a glance.
         * Hidden text in collapsed mode — status dot remains visible
         * as a compact signal. Full label in expanded mode.
         */}
        <div className={[
          "shrink-0 border-t border-border-subtle",
          "flex items-center gap-2",
          isCollapsed ? "justify-center p-3" : "px-4 py-3",
        ].join(" ")}>
          {/* Pulsing online dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-status-online animate-status-pulse opacity-75"
              aria-hidden="true"
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full bg-status-online"
              aria-hidden="true"
            />
          </span>

          {!isCollapsed && (
            <span className="text-xs text-text-muted font-mono truncate">
              All systems operational
            </span>
          )}
        </div>

        {/* ── Collapse toggle ───────────────────────────────────────────── */}
        {/*
         * Pinned to the bottom. Always visible regardless of collapse state.
         * ChevronLeft = "I can be collapsed". ChevronRight = "I can be expanded".
         * Clear directional affordance — no ambiguity about what the button does.
         */}
        <div className="shrink-0 border-t border-border-subtle p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggleCollapse}
                className={[
                  "flex items-center w-full rounded",
                  "text-text-muted hover:text-text-primary hover:bg-bg-elevated",
                  "transition-colors duration-150",
                  "outline-none focus-visible:ring-2 focus-visible:ring-accent-400",
                  isCollapsed ? "justify-center p-2" : "gap-2 px-3 py-2",
                ].join(" ")}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <CollapseIcon
                  className="h-4 w-4 shrink-0 transition-transform duration-200"
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span className="text-xs font-medium">Collapse</span>
                )}
              </button>
            </TooltipTrigger>

            {/* Tooltip only in collapsed state — same rule as nav items */}
            {isCollapsed && (
              <TooltipContent
                side="right"
                sideOffset={8}
                className="bg-bg-overlay border border-border-default text-text-primary text-sm font-medium"
              >
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>

      </aside>
    </TooltipProvider>
  );
}

export default Sidebar;
