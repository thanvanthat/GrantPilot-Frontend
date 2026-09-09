import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names, resolving conflicting Tailwind utilities. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Initials for the avatar badge, e.g. "Aeroview Systems" -> "AS". */
export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/** Match score buckets drive colour across the whole app. */
export function matchTier(score) {
  if (score >= 80) return { tier: 'strong', label: 'Strong match' };
  if (score >= 60) return { tier: 'partial', label: 'Partial match' };
  return { tier: 'weak', label: 'Weak match' };
}

export function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
