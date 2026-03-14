'use client';

import { useEffect, useState } from 'react';
import type { CurrentWeather as CW } from '@/lib/weather';
import { weatherEmoji, weatherDescription } from '@/lib/weather';
import { formatTemp } from '@/lib/utils';

interface CachedWeather {
  current: CW;
}

export default function OfflinePage() {
  const [cached, setCached] = useState<CachedWeather | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('last-weather');
    if (raw) setCached(JSON.parse(raw) as CachedWeather);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex flex-col items-center justify-center gap-6 p-6">
      <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl px-5 py-3 text-white text-sm text-center max-w-md w-full">
        📡 You are offline — showing last available data
      </div>

      {cached ? (
        <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 max-w-sm w-full">
          <div className="text-6xl">{weatherEmoji(cached.current.weatherCode, cached.current.isDay)}</div>
          <div className="text-5xl font-bold text-white">{formatTemp(cached.current.temperature)}</div>
          <div className="text-white/70">{weatherDescription(cached.current.weatherCode)}</div>
        </div>
      ) : (
        <div className="text-white/50 text-sm">No cached data available.</div>
      )}

      <a href="/" className="text-sky-400 hover:text-sky-300 text-sm underline">
        Try again
      </a>
    </main>
  );
}
