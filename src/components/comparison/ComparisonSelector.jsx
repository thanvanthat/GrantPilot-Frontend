import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SectorBadge } from '@/components/common/SectorBadge';

const MAX = 4;

/** Searchable opportunity picker (2–4 selections). */
export function ComparisonSelector({ rows, selectedIds, onToggle }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q ? rows.filter((r) => `${r.title} ${r.organization} ${r.sector}`.toLowerCase().includes(q)) : rows;
  const atMax = selectedIds.length >= MAX;

  return (
    <div className="rounded-gov border border-gov-border bg-white">
      <div className="border-b border-gov-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search opportunities to compare" className="pl-9" />
        </div>
        <p className="mt-2 text-xs text-gov-muted">{selectedIds.length} selected (min 2, max {MAX})</p>
      </div>
      <ul className="max-h-72 divide-y divide-gov-border overflow-y-auto">
        {filtered.map((r) => {
          const checked = selectedIds.includes(r.id);
          const disabled = !checked && atMax;
          return (
            <li key={r.id}>
              <label className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-gov-bg ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-saffron-500"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(r.id)}
                  aria-label={`Compare ${r.title}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-navy-900">{r.title}</span>
                  <span className="block truncate text-xs text-gov-muted">{r.organization}</span>
                </span>
                <SectorBadge sector={r.sector} />
                <span className="w-16 shrink-0 text-right text-xs font-semibold text-navy-900">{r.analyzed ? `${r.matchScore}%` : '—'}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
