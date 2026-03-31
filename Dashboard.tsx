/**
 * Dashboard.tsx — Lucius Engine V2
 *
 * The platform's primary summary screen. Rendered at route "/".
 * Gives the operator an immediate read on platform health across
 * four dimensions: active clients, open findings, MTTR, and scan queue.
 *
 * Layout (top to bottom):
 *   1. Metric row       — four MetricCards spanning full width
 *   2. Content row      — two columns, 60/40 split
 *      Left:  7-day severity trend area chart (Recharts)
 *      Right: Recent findings list (FindingCard, max 5)
 *   3. Scan queue       — recent / active scans table
 *
 * Data layer:
 *   - All data fetched via TanStack Query useQuery hooks
 *   - Mock data returned from typed placeholder query functions
 *   - Each section handles loading / error / empty independently
 *   - No prop drilling — each section owns its own query
 *
 * Chart:
 *   - AreaChart from Recharts
 *   - Four series: critical, high, medium, low
 *   - Gradient fills at 15% opacity, solid strokes
 *   - Custom tooltip matching design system tokens
 *   - No Recharts default colors — all overridden with severity tokens
 *
 * @module Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import {
  Activity,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { MetricCard } from './MetricCard';
import { FindingCard, type Finding } from './FindingCard';
import { SeverityBadge } from './SeverityBadge';

// ─── Design token values for Recharts (cannot use Tailwind classes in JS) ─────
// These are the only raw hex values permitted in this file.
// They map 1:1 to the design token definitions in tailwind.config.ts.
const CHART_COLORS = {
  critical: '#DA3633',
  high:     '#E36209',
  medium:   '#D29922',
  low:      '#388BFD',
  grid:     '#21262D', // border-subtle
  text:     '#6E7681', // text-muted
  bg:       '#161B22', // bg-surface
  border:   '#30363D', // border-default
} as const;

// ─── Mock data types ───────────────────────────────────────────────────────────

interface TrendDataPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ScanQueueItem {
  id: string;
  target: string;
  status: 'running' | 'queued' | 'completed' | 'failed';
  startedAt: Date | null;
  duration: string | null;
  findingsCount: number | null;
}

interface DashboardMetrics {
  activeClients: number;
  openFindings: number;
  mttrDays: number;
  scansThisWeek: number;
  findingsTrend: { direction: 'up' | 'down'; value: string };
  clientsTrend:  { direction: 'up' | 'down'; value: string };
}

// ─── Mock query functions ──────────────────────────────────────────────────────
// These return typed placeholder data. Replace with real API calls in Stage 4.

function generateTrendData(): TrendDataPoint[] {
  return Array.from({ length: 7 }, (_, i) => ({
    date:     format(subDays(new Date(), 6 - i), 'MMM d'),
    critical: Math.floor(Math.random() * 8)  + 2,
    high:     Math.floor(Math.random() * 15) + 5,
    medium:   Math.floor(Math.random() * 20) + 8,
    low:      Math.floor(Math.random() * 25) + 10,
  }));
}

async function fetchMetrics(): Promise<DashboardMetrics> {
  return {
    activeClients:  12,
    openFindings:   47,
    mttrDays:       3,
    scansThisWeek:  8,
    findingsTrend:  { direction: 'up',   value: '+6 this week' },
    clientsTrend:   { direction: 'up',   value: '+2 this month' },
  };
}

async function fetchTrendData(): Promise<TrendDataPoint[]> {
  return generateTrendData();
}

async function fetchRecentFindings(): Promise<Finding[]> {
  return [
    {
      id: 'LCE-2024-0047',
      title: 'SQL Injection via unsanitized search parameter',
      severity: 'critical',
      cwe: 'CWE-89',
      target: 'api.clientdomain.org',
      discoveredAt: subDays(new Date(), 0),
      status: 'open',
    },
    {
      id: 'LCE-2024-0046',
      title: 'Reflected XSS in login error message',
      severity: 'high',
      cwe: 'CWE-79',
      target: 'auth.clientdomain.org',
      discoveredAt: subDays(new Date(), 1),
      status: 'in-progress',
    },
    {
      id: 'LCE-2024-0045',
      title: 'Outdated TLS 1.0 cipher suite accepted',
      severity: 'medium',
      cwe: 'CWE-326',
      target: 'mail.clientdomain.org',
      discoveredAt: subDays(new Date(), 2),
      status: 'open',
    },
    {
      id: 'LCE-2024-0044',
      title: 'Directory listing enabled on static asset server',
      severity: 'low',
      cwe: 'CWE-548',
      target: 'cdn.clientdomain.org',
      discoveredAt: subDays(new Date(), 3),
      status: 'open',
    },
    {
      id: 'LCE-2024-0043',
      title: 'Missing HSTS header on primary domain',
      severity: 'medium',
      cwe: 'CWE-319',
      target: 'clientdomain.org',
      discoveredAt: subDays(new Date(), 4),
      status: 'resolved',
    },
  ];
}

async function fetchScanQueue(): Promise<ScanQueueItem[]> {
  return [
    {
      id: 'SCN-2024-0031',
      target: 'clientdomain.org',
      status: 'running',
      startedAt: subDays(new Date(), 0),
      duration: null,
      findingsCount: null,
    },
    {
      id: 'SCN-2024-0030',
      target: 'nonprofitorg.net',
      status: 'queued',
      startedAt: null,
      duration: null,
      findingsCount: null,
    },
    {
      id: 'SCN-2024-0029',
      target: 'smbbusiness.com',
      status: 'completed',
      startedAt: subDays(new Date(), 1),
      duration: '14m 32s',
      findingsCount: 7,
    },
    {
      id: 'SCN-2024-0028',
      target: 'charitysite.org',
      status: 'failed',
      startedAt: subDays(new Date(), 1),
      duration: '2m 11s',
      findingsCount: null,
    },
  ];
}

// ─── Scan status config ────────────────────────────────────────────────────────

const SCAN_STATUS_CONFIG: Record<ScanQueueItem['status'], {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}> = {
  running:   { label: 'Running',   icon: Loader2,       color: 'text-accent-300',      bg: 'bg-accent-100'         },
  queued:    { label: 'Queued',    icon: Clock,          color: 'text-text-muted',      bg: 'bg-bg-elevated'        },
  completed: { label: 'Completed', icon: CheckCircle2,   color: 'text-status-online',   bg: 'bg-status-online/10'   },
  failed:    { label: 'Failed',    icon: AlertTriangle,  color: 'text-severity-critical',bg: 'bg-severity-critical/10'},
};

// ─── Custom Recharts tooltip ───────────────────────────────────────────────────

interface CustomTooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>): JSX.Element | null {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="bg-bg-overlay border border-border-default rounded p-3 shadow-modal"
      role="tooltip"
    >
      <p className="text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {(payload as CustomTooltipPayloadEntry[]).map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="text-xs font-mono text-text-secondary capitalize">
                {entry.name}
              </span>
            </div>
            <span className="text-xs font-mono text-text-primary font-semibold">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section components ────────────────────────────────────────────────────────

/**
 * SectionHeader — consistent heading pattern for each dashboard section.
 */
function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {title}
      </h2>
      {action}
    </div>
  );
}

/**
 * MetricRow — four MetricCards in a responsive grid.
 */
function MetricRow(): JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: fetchMetrics,
  });

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        label="Active Clients"
        value={data?.activeClients ?? 0}
        trend={data?.clientsTrend}
        loading={isLoading}
        error={isError}
      />
      <MetricCard
        label="Open Findings"
        value={data?.openFindings ?? 0}
        trend={data?.findingsTrend}
        critical={(data?.openFindings ?? 0) > 20}
        loading={isLoading}
        error={isError}
      />
      <MetricCard
        label="Avg. MTTR (days)"
        value={data?.mttrDays ?? 0}
        loading={isLoading}
        error={isError}
      />
      <MetricCard
        label="Scans This Week"
        value={data?.scansThisWeek ?? 0}
        loading={isLoading}
        error={isError}
      />
    </div>
  );
}

/**
 * TrendChart — 7-day severity area chart.
 * Four overlapping area series with gradient fills and solid stroke lines.
 */
function TrendChart(): JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'trend'],
    queryFn: fetchTrendData,
  });

  return (
    <div className="bg-bg-surface border border-border-subtle rounded p-4 h-full">
      <SectionHeader title="7-Day Severity Trend" />

      {isLoading && (
        <div className="h-56 flex flex-col gap-3 animate-pulse">
          <div className="h-full bg-bg-elevated rounded" />
        </div>
      )}

      {isError && (
        <div className="h-56 flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 text-severity-critical" aria-hidden="true" />
          <span className="text-sm text-severity-critical font-sans">
            Failed to load trend data
          </span>
        </div>
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="h-56 flex items-center justify-center gap-2">
          <Activity className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <span className="text-sm text-text-muted font-sans">No trend data available</span>
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <>
          {/*
           * Gradient defs must live inside the SVG Recharts renders.
           * We inject them via a hidden SVG above the chart — Recharts
           * picks up gradient IDs from the document's SVG defs.
           */}
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <defs>
              {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
                <linearGradient
                  key={sev}
                  id={`gradient-${sev}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="5%"  stopColor={CHART_COLORS[sev]} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS[sev]} stopOpacity={0}    />
                </linearGradient>
              ))}
            </defs>
          </svg>

          <ResponsiveContainer width="100%" height={224}>
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: CHART_COLORS.text, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.text, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomChartTooltip />} />

              {/* Render low → medium → high → critical so critical is on top */}
              {(['low', 'medium', 'high', 'critical'] as const).map((sev) => (
                <Area
                  key={sev}
                  type="monotone"
                  dataKey={sev}
                  stroke={CHART_COLORS[sev]}
                  strokeWidth={1.5}
                  fill={`url(#gradient-${sev})`}
                  dot={false}
                  activeDot={{
                    r: 3,
                    fill: CHART_COLORS[sev],
                    stroke: CHART_COLORS.bg,
                    strokeWidth: 2,
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pl-1">
            {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
              <div key={sev} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[sev] }}
                  aria-hidden="true"
                />
                <span className="text-xs font-mono text-text-muted capitalize">
                  {sev}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * RecentFindings — up to five most recent FindingCards.
 */
function RecentFindings(): JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'findings'],
    queryFn: fetchRecentFindings,
  });

  return (
    <div className="bg-bg-surface border border-border-subtle rounded p-4 h-full">
      <SectionHeader
        title="Recent Findings"
        action={
          data && data.length > 0 ? (
            <span className="text-xs font-mono text-text-muted">
              {data.length} shown
            </span>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <FindingCard key={i} loading />
          ))}
        </div>
      )}

      {isError && (
        <FindingCard error />
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <FindingCard empty />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onClick={(f) => {
                // ⚑ SWAP POINT (Stage 3 — ThreatOps):
                // Navigate to /threat-ops with finding id as search param
                // navigate(`/threat-ops?finding=${f.id}`)
                void f;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ScanQueue — recent and active scans table.
 */
function ScanQueue(): JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'scans'],
    queryFn: fetchScanQueue,
  });

  return (
    <div className="bg-bg-surface border border-border-subtle rounded">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border-subtle">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Scan Queue
        </h2>
        <button
          type="button"
          className={[
            "flex items-center gap-1.5 text-xs font-mono text-text-muted",
            "hover:text-text-primary transition-colors duration-150",
            "outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded",
          ].join(" ")}
          aria-label="Refresh scan queue"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="animate-pulse">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle last:border-0"
            >
              <div className="h-5 w-20 bg-bg-elevated rounded" />
              <div className="h-3 w-36 bg-bg-elevated rounded" />
              <div className="h-3 w-24 bg-bg-elevated rounded ml-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 px-4 py-6">
          <AlertTriangle className="h-4 w-4 text-severity-critical" aria-hidden="true" />
          <span className="text-sm text-severity-critical font-sans">
            Failed to load scan queue
          </span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="flex items-center gap-2 px-4 py-6">
          <Activity className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <span className="text-sm text-text-muted font-sans">No scans in queue</span>
        </div>
      )}

      {/* Populated */}
      {!isLoading && !isError && data && data.length > 0 && (
        <table className="w-full" aria-label="Scan queue">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Scan ID', 'Target', 'Status', 'Started', 'Duration', 'Findings'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
                  scope="col"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((scan) => {
              const cfg = SCAN_STATUS_CONFIG[scan.status];
              const StatusIcon = cfg.icon;
              return (
                <tr
                  key={scan.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated transition-colors duration-150"
                >
                  {/* Scan ID */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-text-secondary">
                      {scan.id}
                    </span>
                  </td>

                  {/* Target */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-text-primary">
                      {scan.target}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs ${cfg.color} ${cfg.bg}`}
                    >
                      <StatusIcon
                        className={`h-3 w-3 shrink-0 ${scan.status === 'running' ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      {cfg.label}
                    </span>
                  </td>

                  {/* Started */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-text-muted">
                      {scan.startedAt
                        ? formatDistanceToNow(scan.startedAt, { addSuffix: true })
                        : '—'}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-text-muted">
                      {scan.duration ?? '—'}
                    </span>
                  </td>

                  {/* Findings count */}
                  <td className="px-4 py-3">
                    {scan.findingsCount !== null ? (
                      <SeverityBadge
                        severity={scan.findingsCount > 5 ? 'high' : scan.findingsCount > 0 ? 'medium' : 'none'}
                        size="sm"
                      />
                    ) : (
                      <span className="font-mono text-xs text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

/**
 * Dashboard
 *
 * Root screen rendered at "/". Composes MetricRow, TrendChart,
 * RecentFindings, and ScanQueue. Each section owns its own
 * TanStack Query hook — loading and error states are independent.
 */
export function Dashboard(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">

      {/* ── Row 1: Metrics ─────────────────────────────────────────────── */}
      <MetricRow />

      {/* ── Row 2: Chart (60%) + Findings (40%) ────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <TrendChart />
        </div>
        <div className="col-span-2">
          <RecentFindings />
        </div>
      </div>

      {/* ── Row 3: Scan queue ───────────────────────────────────────────── */}
      <ScanQueue />

    </div>
  );
}

export default Dashboard;
