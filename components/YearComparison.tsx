'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';
import { useTheme } from 'next-themes';
import type { DailyHistorical } from '@/lib/weather';
import { baseLineOptions, COLORS } from '@/lib/charts';
import { toDateString } from '@/lib/utils';

interface Props {
  lat: number;
  lon: number;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1940 }, (_, i) => CURRENT_YEAR - 1 - i);

export default function YearComparison({ lat, lon }: Props) {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);

  const [fromDate, setFromDate] = useState(toDateString(twoWeeksAgo).slice(5)); // MM-DD
  const [toDate, setToDate] = useState(toDateString(today).slice(5));
  const [compYear, setCompYear] = useState(CURRENT_YEAR - 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  async function fetchYear(year: number): Promise<DailyHistorical[]> {
    const start = `${year}-${fromDate}`;
    const end = `${year}-${toDate}`;
    const res = await fetch(`/api/historical?lat=${lat}&lon=${lon}&start=${start}&end=${end}`);
    if (!res.ok) throw new Error('Failed to fetch comparison data');
    const json = (await res.json()) as { data: DailyHistorical[] };
    return json.data;
  }

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [current, comparison] = await Promise.all([
        fetchYear(CURRENT_YEAR),
        fetchYear(compYear),
      ]);

      chartRef.current?.destroy();
      if (!canvasRef.current) return;

      const labelsA = current.map((d) => d.date.slice(5)); // MM-DD
      const labelsB = comparison.map((d) => d.date.slice(5));
      const labels = Array.from(new Set([...labelsA, ...labelsB])).sort();

      const valA = labels.map((l) => {
        const d = current.find((x) => x.date.slice(5) === l);
        return d ? (d.maxTemp + d.minTemp) / 2 : null;
      });

      const valB = labels.map((l) => {
        const d = comparison.find((x) => x.date.slice(5) === l);
        return d ? (d.maxTemp + d.minTemp) / 2 : null;
      });

      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: `${CURRENT_YEAR}`,
              data: valA as number[],
              borderColor: COLORS.orange,
              backgroundColor: COLORS.orangeAlpha,
              fill: false,
              tension: 0.3,
              spanGaps: true,
            },
            {
              label: `${compYear}`,
              data: valB as number[],
              borderColor: COLORS.blue,
              backgroundColor: COLORS.blueAlpha,
              fill: false,
              tension: 0.3,
              spanGaps: true,
            },
          ],
        },
        options: baseLineOptions(isDark),
      };

      chartRef.current = new Chart(canvasRef.current, config as ChartConfiguration);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClass =
    'bg-white/10 dark:bg-white/5 text-white border border-white/20 rounded-lg px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky-400';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">From (MM-DD)</label>
          <input type="text" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="01-01" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">To (MM-DD)</label>
          <input type="text" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="12-31" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">Compare with year</label>
          <select value={compYear} onChange={(e) => setCompYear(Number(e.target.value))} className={inputClass}>
            {YEARS.map((y) => (
              <option key={y} value={y} className="bg-slate-800">{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-lg text-sm font-medium min-h-[44px] transition-colors"
        >
          {loading ? 'Loading…' : 'Update'}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div className="relative h-64">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-10">
            <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
