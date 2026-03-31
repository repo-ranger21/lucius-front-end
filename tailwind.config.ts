/**
 * tailwind.config.ts — Lucius Engine V2
 *
 * Single source of truth for the entire design token system.
 * Every color, font, border-radius, and animation used across the
 * platform originates here. Components must ONLY reference these
 * token classes — never raw hex values, never default Tailwind palette.
 *
 * Token Architecture:
 *   bg-*         → Background layers (4 depth levels)
 *   border-*     → Border hierarchy (3 strength levels)
 *   text-*       → Typography hierarchy (4 contrast levels)
 *   accent-*     → Lucius Blue interactive accent scale
 *   severity-*   → CVSS severity classification colors
 *   status-*     → Infrastructure / service status colors
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // Only generate classes for files that use them — keeps bundle lean
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      // ----------------------------------------------------------------
      // COLORS — All tokens. Never reference anything outside this block.
      // ----------------------------------------------------------------
      colors: {
        // Background layers — deepest (base) to highest (overlay)
        // Think of these as floors in a building: base is the basement,
        // overlay is the penthouse.
        bg: {
          base:     "#0D1117", // Page root — the deepest layer
          surface:  "#161B22", // Cards, panels, sidebar
          elevated: "#1C2128", // Dropdowns, hover states
          overlay:  "#22272E", // Modals, tooltips
        },

        // Border hierarchy — subtle → default → strong
        // Used to delineate depth without drop shadows.
        border: {
          subtle:  "#21262D",
          default: "#30363D",
          strong:  "#484F58",
        },

        // Text hierarchy — primary down to disabled
        text: {
          primary:   "#E6EDF3",
          secondary: "#8B949E",
          muted:     "#6E7681",
          disabled:  "#484F58",
        },

        // Lucius Blue — the platform's interactive accent scale.
        // accent-400 / accent-500 are the primary CTA colors.
        // accent-100 is used for subtle tinted backgrounds.
        accent: {
          100: "#1C3A6B", // Tinted background (e.g. selected state bg)
          300: "#5B9BD5", // Hover state for links and subtle actions
          400: "#3B74C5", // Primary interactive (buttons, NavLink active)
          500: "#2E5FA3", // Pressed / darker variant
        },

        // Severity — maps directly to CVSS score bands.
        // These are used for badges, left borders on FindingCards,
        // and chart series colors. Never use for backgrounds at full opacity.
        severity: {
          critical: "#DA3633", // CVSS 9.0–10.0
          high:     "#E36209", // CVSS 7.0–8.9
          medium:   "#D29922", // CVSS 4.0–6.9
          low:      "#388BFD", // CVSS 0.1–3.9
          none:     "#8B949E", // Informational / no score
        },

        // Status — infrastructure and service health indicators.
        // Used in StatusDot, system status strip, and scan state pills.
        status: {
          online:  "#3FB950",
          warning: "#D29922",
          offline: "#DA3633",
          pending: "#8B949E",
        },
      },

      // ----------------------------------------------------------------
      // TYPOGRAPHY
      // ----------------------------------------------------------------
      fontFamily: {
        // UI font — all body text, labels, headings
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        // Monospace — CVE IDs, finding IDs, domains, IPs, ports, timestamps
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },

      // ----------------------------------------------------------------
      // BORDER RADIUS
      // Platform uses a consistent 4px radius. Nothing rounder.
      // ----------------------------------------------------------------
      borderRadius: {
        DEFAULT: "4px",
        sm:      "2px",
        md:      "4px",
        lg:      "6px",  // Reserved for modals / sheets only
        full:    "9999px", // Pills (SeverityBadge, StatusDot ring)
      },

      // ----------------------------------------------------------------
      // TYPOGRAPHY SCALE
      // Hard cap at text-3xl — no exceptions anywhere in the UI.
      // ----------------------------------------------------------------
      fontSize: {
        xs:   ["0.75rem",  { lineHeight: "1rem" }],      // Timestamps, metadata
        sm:   ["0.875rem", { lineHeight: "1.25rem" }],   // Body default
        base: ["1rem",     { lineHeight: "1.5rem" }],    // Comfortable reading
        lg:   ["1.125rem", { lineHeight: "1.75rem" }],   // Card values
        xl:   ["1.25rem",  { lineHeight: "1.75rem" }],   // Sub-headings
        "2xl":["1.5rem",   { lineHeight: "2rem" }],      // Page titles
        "3xl":["1.875rem", { lineHeight: "2.25rem" }],   // MetricCard values — MAX
        // text-4xl and above are intentionally omitted to enforce the cap
      },

      // ----------------------------------------------------------------
      // SPACING — Platform uses a base-4 scale.
      // Key landmarks: p-4 cards, p-6 page containers, gap-4 between cards.
      // ----------------------------------------------------------------
      spacing: {
        px:  "1px",
        0:   "0",
        0.5: "0.125rem",
        1:   "0.25rem",
        1.5: "0.375rem",
        2:   "0.5rem",
        2.5: "0.625rem",
        3:   "0.75rem",
        3.5: "0.875rem",
        4:   "1rem",     // Card internal padding
        5:   "1.25rem",
        6:   "1.5rem",   // Page container padding
        7:   "1.75rem",
        8:   "2rem",
        9:   "2.25rem",
        10:  "2.5rem",
        11:  "2.75rem",
        12:  "3rem",
        14:  "3.5rem",
        16:  "4rem",     // Sidebar collapsed width
        20:  "5rem",
        24:  "6rem",
        28:  "7rem",
        32:  "8rem",
        36:  "9rem",
        40:  "10rem",
        44:  "11rem",
        48:  "12rem",
        52:  "13rem",
        56:  "14rem",
        60:  "15rem",
        64:  "16rem",    // Sidebar expanded width (240px = 60, actual 240px below)
        72:  "18rem",
        80:  "20rem",
        96:  "24rem",
        // Named semantic sizes for sidebar widths
        "sidebar-collapsed": "64px",
        "sidebar-expanded":  "240px",
        "topbar-height":     "56px",
      },

      // ----------------------------------------------------------------
      // TRANSITIONS — All interactive elements use duration-150.
      // Only transition-colors and transition-opacity are permitted.
      // No custom keyframes.
      // ----------------------------------------------------------------
      transitionDuration: {
        DEFAULT: "150ms",
        75:  "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
      },

      transitionTimingFunction: {
        DEFAULT:    "cubic-bezier(0.4, 0, 0.2, 1)",
        linear:     "linear",
        in:         "cubic-bezier(0.4, 0, 1, 1)",
        out:        "cubic-bezier(0, 0, 0.2, 1)",
        "in-out":   "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      // ----------------------------------------------------------------
      // ANIMATIONS — Only the pulse animation for StatusDot online state.
      // All other animations come from shadcn/ui defaults.
      // ----------------------------------------------------------------
      keyframes: {
        // StatusDot online pulse — the expanding ring effect
        "status-pulse": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.4",
            transform: "scale(1.8)",
          },
        },
        // shadcn/ui accordion — required for Sheet / Collapsible components
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },

      animation: {
        "status-pulse":    "status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
      },

      // ----------------------------------------------------------------
      // SCREENS — Minimum supported width is 1280px.
      // No mobile breakpoints — this is a professional ops tool.
      // ----------------------------------------------------------------
      screens: {
        sm:   "640px",
        md:   "768px",
        lg:   "1024px",
        xl:   "1280px",  // Minimum supported layout width
        "2xl":"1536px",
      },

      // ----------------------------------------------------------------
      // BOX SHADOW — Platform uses borders, not shadows, for depth.
      // The one exception: modal / sheet overlay shadow.
      // ----------------------------------------------------------------
      boxShadow: {
        none:    "none",
        // Subtle inner depth for elevated surfaces — replaces drop shadows
        "inner-border": "inset 0 0 0 1px #30363D",
        // Reserved for modals only
        "modal": "0 8px 32px rgba(0, 0, 0, 0.6)",
      },

      // ----------------------------------------------------------------
      // OPACITY — Used for disabled states and severity badge backgrounds.
      // severity badge bg = severity color at 10% opacity (bg-opacity-10).
      // ----------------------------------------------------------------
      opacity: {
        0:   "0",
        5:   "0.05",
        10:  "0.1",   // Severity badge background opacity
        20:  "0.2",
        25:  "0.25",
        30:  "0.3",
        40:  "0.4",   // disabled:opacity-40 for gated controls
        50:  "0.5",
        60:  "0.6",
        70:  "0.7",
        75:  "0.75",
        80:  "0.8",
        90:  "0.9",
        95:  "0.95",
        100: "1",
      },

      // ----------------------------------------------------------------
      // Z-INDEX — Layering system for overlapping UI elements.
      // ----------------------------------------------------------------
      zIndex: {
        auto:    "auto",
        0:       "0",
        10:      "10",   // Sticky table headers
        20:      "20",   // Sidebar
        30:      "30",   // TopBar
        40:      "40",   // Dropdowns, tooltips
        50:      "50",   // Modals, sheets
        overlay: "100",  // Full-screen overlays (auth gate)
      },
    },
  },

  // ----------------------------------------------------------------
  // PLUGINS
  // ----------------------------------------------------------------
  plugins: [
    // Enables the tailwindcss-animate plugin required by shadcn/ui
    // Install: npm install tailwindcss-animate
    require("tailwindcss-animate"),
  ],
};

export default config;
