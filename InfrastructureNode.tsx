/**
 * InfrastructureNode.tsx — Lucius Engine V2
 *
 * Renders a single infrastructure asset as a table row.
 * Used in the Threat Ops workspace infrastructure map.
 *
 * Visual contract:
 *   - StatusDot left-aligned for at-a-glance health signal
 *   - Domain and IP in font-mono — technical identifiers, not prose
 *   - Port chips: small rounded badges, bg-bg-elevated, font-mono text-xs
 *   - Protocol labels: uppercase, text-text-muted, font-mono text-xs
 *   - Clickable row when onClick is provided
 *   - All three states: loading skeleton, empty (icon + reason), error
 *
 * Table context: this component renders as a <tr> inside a <tbody>.
 * The parent table must supply matching <thead> column headers.
 * Column order: Status | Domain | IP | Ports | Protocols | (actions)
 *
 * @module InfrastructureNode
 */

import { type KeyboardEvent } from 'react';
import { ServerCrash, Server } from 'lucide-react';
import { StatusDot } from './StatusDot';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeStatus = 'online' | 'offline' | 'warning' | 'pending';

export interface InfraNode {
  /** Unique identifier — font-mono, used as React key */
  id: string;
  /** Fully-qualified domain name — font-mono */
  domain: string;
  /** IPv4 or IPv6 address — font-mono */
  ip: string;
  /** Open port numbers — rendered as individual chips */
  ports: number[];
  /** Protocol identifiers e.g. ['HTTP', 'HTTPS', 'SSH'] — font-mono uppercase */
  protocols: string[];
  /** Current operational status */
  status: NodeStatus;
}

export interface InfrastructureNodeProps {
  /** The infrastructure node to display */
  node?: InfraNode;
  /** Click handler — receives the full node object */
  onClick?: (node: InfraNode) => void;
  /** Loading skeleton state */
  loading?: boolean;
  /** Error state */
  error?: boolean;
  /** Empty state — no node data available */
  empty?: boolean;
  /** Number of columns to span for loading/error/empty states (default: 6) */
  colSpan?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum ports to render as chips before truncating with a "+N more" label. */
const MAX_VISIBLE_PORTS = 4;

/** Maximum protocols to render before truncating. */
const MAX_VISIBLE_PROTOCOLS = 3;

const DEFAULT_COL_SPAN = 6;

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * PortChip — a single port number rendered as a small badge.
 */
function PortChip({ port }: { port: number }): JSX.Element {
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "px-1.5 py-0.5 rounded",
        "bg-bg-elevated border border-border-subtle",
        "font-mono text-xs text-text-secondary",
        "leading-none",
      ].join(" ")}
      aria-label={`Port ${port}`}
    >
      {port}
    </span>
  );
}

/**
 * ProtocolLabel — a single protocol identifier rendered inline.
 */
function ProtocolLabel({ protocol }: { protocol: string }): JSX.Element {
  return (
    <span
      className="font-mono text-xs text-text-muted uppercase tracking-wide"
      aria-label={`Protocol ${protocol}`}
    >
      {protocol}
    </span>
  );
}

/**
 * OverflowChip — "+N more" indicator when ports or protocols are truncated.
 */
function OverflowChip({ count }: { count: number }): JSX.Element {
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "px-1.5 py-0.5 rounded",
        "bg-bg-elevated border border-border-subtle",
        "font-mono text-xs text-text-muted",
        "leading-none",
      ].join(" ")}
      aria-label={`${count} more`}
    >
      +{count}
    </span>
  );
}

// ─── State rows ───────────────────────────────────────────────────────────────

/**
 * Skeleton row — animate-pulse placeholder matching the populated row layout.
 * Rendered as a <tr> with placeholder divs simulating each column's content.
 */
function LoadingRow({ colSpan }: { colSpan: number }): JSX.Element {
  return (
    <tr className="animate-pulse border-b border-border-subtle">
      {/* Status dot placeholder */}
      <td className="px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-bg-elevated" />
      </td>
      {/* Domain placeholder */}
      <td className="px-4 py-3">
        <div className="h-3 w-36 bg-bg-elevated rounded" />
      </td>
      {/* IP placeholder */}
      <td className="px-4 py-3">
        <div className="h-3 w-24 bg-bg-elevated rounded" />
      </td>
      {/* Ports placeholder */}
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <div className="h-5 w-10 bg-bg-elevated rounded" />
          <div className="h-5 w-10 bg-bg-elevated rounded" />
          <div className="h-5 w-10 bg-bg-elevated rounded" />
        </div>
      </td>
      {/* Protocols placeholder */}
      <td className="px-4 py-3" colSpan={colSpan - 4}>
        <div className="flex gap-2">
          <div className="h-3 w-12 bg-bg-elevated rounded" />
          <div className="h-3 w-12 bg-bg-elevated rounded" />
        </div>
      </td>
    </tr>
  );
}

/**
 * Error row — spans all columns, shows icon + message.
 */
function ErrorRow({ colSpan }: { colSpan: number }): JSX.Element {
  return (
    <tr className="border-b border-border-subtle">
      <td
        colSpan={colSpan}
        className="px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <ServerCrash
            className="h-4 w-4 text-severity-critical shrink-0"
            aria-hidden="true"
          />
          <span className="text-severity-critical font-sans text-sm">
            Error loading infrastructure node
          </span>
        </div>
      </td>
    </tr>
  );
}

/**
 * Empty row — spans all columns, shows icon + reason.
 */
function EmptyRow({ colSpan }: { colSpan: number }): JSX.Element {
  return (
    <tr className="border-b border-border-subtle">
      <td
        colSpan={colSpan}
        className="px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Server
            className="h-4 w-4 text-text-muted shrink-0"
            aria-hidden="true"
          />
          <span className="text-text-muted font-sans text-sm">
            No infrastructure nodes found
          </span>
        </div>
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * InfrastructureNode
 *
 * Renders a single infrastructure asset as a <tr> inside a parent <tbody>.
 * Handles loading, error, and empty states as full-width row spans.
 * Populated state renders StatusDot, domain, IP, port chips, and protocol labels.
 */
export function InfrastructureNode({
  node,
  onClick,
  loading = false,
  error = false,
  empty = false,
  colSpan = DEFAULT_COL_SPAN,
}: InfrastructureNodeProps): JSX.Element {
  if (loading) return <LoadingRow colSpan={colSpan} />;
  if (error)   return <ErrorRow   colSpan={colSpan} />;
  if (empty || !node) return <EmptyRow colSpan={colSpan} />;

  const clickable = typeof onClick === 'function';

  const visiblePorts    = node.ports.slice(0, MAX_VISIBLE_PORTS);
  const overflowPorts   = node.ports.length - MAX_VISIBLE_PORTS;

  const visibleProtocols  = node.protocols.slice(0, MAX_VISIBLE_PROTOCOLS);
  const overflowProtocols = node.protocols.length - MAX_VISIBLE_PROTOCOLS;

  /**
   * Keyboard handler — fires onClick for Enter and Space.
   * Matches the same pattern as FindingCard for consistency.
   */
  function handleKeyDown(e: KeyboardEvent<HTMLTableRowElement>): void {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(node);
    }
  }

  return (
    <tr
      className={[
        "border-b border-border-subtle",
        "transition-colors duration-150",
        clickable
          ? "cursor-pointer hover:bg-bg-elevated"
          : "",
      ].join(" ")}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      aria-label={clickable ? `View details for ${node.domain}` : undefined}
      onClick={clickable ? () => onClick(node) : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* ── Status ─────────────────────────────────────────────────────── */}
      <td className="px-4 py-3 w-10">
        <StatusDot
          status={node.status}
          pulse={node.status === 'online'}
          label={`${node.domain} status: ${node.status}`}
        />
      </td>

      {/* ── Domain ─────────────────────────────────────────────────────── */}
      {/*
       * font-mono: domain is a technical identifier.
       * truncate: long FQDNs don't break table layout.
       * max-w-[200px]: gives domain reasonable space without crowding IP/ports.
       */}
      <td className="px-4 py-3 max-w-[200px]">
        <span
          className="font-mono text-sm text-text-primary truncate block"
          title={node.domain}
        >
          {node.domain}
        </span>
      </td>

      {/* ── IP address ─────────────────────────────────────────────────── */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm text-text-secondary whitespace-nowrap">
          {node.ip}
        </span>
      </td>

      {/* ── Port chips ─────────────────────────────────────────────────── */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {visiblePorts.map((port) => (
            <PortChip key={port} port={port} />
          ))}
          {overflowPorts > 0 && (
            <OverflowChip count={overflowPorts} />
          )}
          {node.ports.length === 0 && (
            <span className="font-mono text-xs text-text-muted">—</span>
          )}
        </div>
      </td>

      {/* ── Protocols ──────────────────────────────────────────────────── */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {visibleProtocols.map((proto) => (
            <ProtocolLabel key={proto} protocol={proto} />
          ))}
          {overflowProtocols > 0 && (
            <OverflowChip count={overflowProtocols} />
          )}
          {node.protocols.length === 0 && (
            <span className="font-mono text-xs text-text-muted">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default InfrastructureNode;
