import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Multi-tag input with add-on-Enter and clickable suggestion chips. */
export function TagInput({ value = [], onChange, suggestions = [], placeholder = 'Type and press Enter', disabled }) {
  const [draft, setDraft] = useState('');

  function addTag(tag) {
    const clean = tag.trim();
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
    setDraft('');
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag));
  }

  const available = suggestions.filter((s) => !value.includes(s));

  return (
    <div className={cn(disabled && 'pointer-events-none opacity-70')}>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-gov border border-gov-border bg-white p-1.5 focus-within:border-saffron-500 focus-within:ring-1 focus-within:ring-saffron-500">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-900">
            {tag}
            {!disabled && (
              <button type="button" onClick={() => removeTag(tag)} className="text-navy-700 hover:text-gov-red" aria-label={`Remove ${tag}`}>
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            className="min-w-[8rem] flex-1 border-0 bg-transparent px-1.5 text-sm outline-none placeholder:text-slate-400"
            value={draft}
            placeholder={value.length ? '' : placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addTag(draft); }
              if (e.key === 'Backspace' && !draft && value.length) removeTag(value[value.length - 1]);
            }}
          />
        )}
      </div>
      {!disabled && available.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {available.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gov-border px-2.5 py-0.5 text-xs font-medium text-gov-muted hover:border-saffron-400 hover:text-saffron-600"
            >
              <Plus className="h-3 w-3" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
