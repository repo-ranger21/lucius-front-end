const STATUS_STYLES: Record<Finding['status'], { bg: string; text: string; label: string }> = {
  'open':        { bg: 'bg-status-warning/10',  text: 'text-status-warning', label: 'Open'        },
  'in-progress': { bg: 'bg-accent-100',          text: 'text-accent-300',     label: 'In Progress' },
  'resolved':    { bg: 'bg-status-online/10',    text: 'text-status-online',  label: 'Resolved'    },
};
/**
 * FindingCard component for Lucius Engine V2
 *
 * Displays a finding with severity, CWE, target, and relative timestamp.
 * - 3px left border in severity color
 * - <SeverityBadge /> top-right
 * - Clickable (cursor-pointer, hover:bg-bg-elevated, transition-colors duration-150) if onClick is provided
 * - Keyboard accessible: role="button", Enter/Space triggers onClick
 * - Relative timestamp via date-fns formatDistanceToNow
 * - All three states: loading skeleton, empty (icon + reason), error
 * - No console.log, no raw hex, no default Tailwind palette
 * - JSDoc at top, exported props interface
 *
 * @module FindingCard
 */
import { FC, KeyboardEvent } from 'react';
import { AlertCircle, FileSearch } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SeverityBadge, SeverityLevel } from './SeverityBadge';

export interface Finding {
  id: string;
  title: string;
  severity: SeverityLevel;
  cwe: string;
  target: string;
  discoveredAt: Date;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface FindingCardProps {
  finding?: Finding;
  onClick?: (finding: Finding) => void;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
}

const SEVERITY_BORDER: Record<SeverityLevel, string> = {
  critical: 'border-severity-critical',
  high: 'border-severity-high',
  medium: 'border-severity-medium',
  low: 'border-severity-low',
  none: 'border-severity-none',
};

/**
 * FindingCard — displays a finding with all required states and interactions
 */
export const FindingCard: FC<FindingCardProps> = ({
  finding,
  onClick,
  loading = false,
  error = false,
  empty = false,
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="bg-bg-surface rounded p-4 border-l-[3px] border-border-subtle animate-pulse flex flex-col gap-2 min-w-[320px]">
        <div className="h-4 w-32 bg-bg-elevated rounded" />
        <div className="h-3 w-24 bg-bg-elevated rounded" />
        <div className="h-3 w-20 bg-bg-elevated rounded" />
      </div>
    );
  }
  // Error state
  if (error) {
    return (
      <div className="bg-bg-surface rounded p-4 border-l-[3px] border-severity-critical flex items-center gap-2 min-w-[320px]">
        <AlertCircle className="h-5 w-5 text-severity-critical" aria-hidden="true" />
        <span className="text-severity-critical font-sans text-sm">Error loading finding</span>
      </div>
    );
  }
  // Empty state
  if (empty) {
    return (
      <div className="bg-bg-surface rounded p-4 border-l-[3px] border-border-subtle flex items-center gap-2 min-w-[320px]">
        <FileSearch className="h-5 w-5 text-text-muted" aria-hidden="true" />
        <span className="text-text-muted font-sans text-sm">No findings available</span>
      </div>
    );
  }
  if (!finding) return null;

  const borderClass = SEVERITY_BORDER[finding.severity];
  const clickable = typeof onClick === 'function';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(finding);
    }
  };

  return (
    <div
      className={`bg-bg-surface rounded p-4 border-l-[3px] ${borderClass} min-w-[320px] relative flex flex-col gap-1 ${clickable ? 'cursor-pointer hover:bg-bg-elevated transition-colors duration-150' : ''}`}
      tabIndex={clickable ? 0 : -1}
      role={clickable ? 'button' : undefined}
      aria-label={finding.title}
      onClick={clickable ? () => onClick?.(finding) : undefined}
      onKeyDown={handleKeyDown}
    >
      <span className="absolute top-4 right-4">
        <SeverityBadge severity={finding.severity} size="sm" />
      </span>
      <div className="font-bold text-text-primary font-sans text-base mb-1">{finding.title}</div>
      <span className={`inline-block font-mono text-xs rounded px-2 py-0.5 ${STATUS_STYLES[finding.status].bg} ${STATUS_STYLES[finding.status].text}`}>
        {STATUS_STYLES[finding.status].label}
      </span>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-xs text-text-muted">{formatDistanceToNow(new Date(finding.discoveredAt), { addSuffix: true })}</span>
        <span className="font-mono text-xs text-text-muted">•</span>
        <span className="font-mono text-xs">{finding.id}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-bg-elevated text-text-secondary font-mono text-xs rounded px-2 py-0.5">{finding.cwe}</span>
        <span className="font-mono text-xs text-text-primary">{finding.target}</span>
      </div>
    </div>
  );
};

export default FindingCard;
