'use client';

import { useState, useRef, useEffect } from 'react';
import type { GeocodingResult } from '@/lib/weather';

interface Props {
  city: string;
  onSelect: (city: string, lat: number, lon: number) => void;
}

export default function CitySearch({ city, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const json = (await res.json()) as { results?: GeocodingResult[] };
        setResults(json.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  function select(r: GeocodingResult) {
    const label = r.admin1 ? `${r.name}, ${r.admin1}, ${r.country}` : `${r.name}, ${r.country}`;
    onSelect(label, r.latitude, r.longitude);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.closest('[data-citysearch]')?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" data-citysearch>
      <button
        onClick={() => { setOpen((v) => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium min-h-[44px]"
      >
        <span>📍</span>
        <span className="max-w-[120px] truncate hidden sm:inline">{city}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city…"
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {loading && (
            <div className="px-4 py-3 text-white/40 text-sm">Searching…</div>
          )}

          {!loading && results.length > 0 && (
            <ul className="max-h-56 overflow-y-auto">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => select(r)}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm text-white transition-colors"
                  >
                    <span className="font-medium">{r.name}</span>
                    {r.admin1 && <span className="text-white/50">, {r.admin1}</span>}
                    <span className="text-white/50">, {r.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="px-4 py-3 text-white/40 text-sm">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
