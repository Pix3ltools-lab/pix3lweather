'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';
import { useTheme } from 'next-themes';
import type { DailyHistorical } from '@/lib/weather';
import { baseLineOptions, baseBarOptions, COLORS } from '@/lib/charts';
import { formatDate, toDateString, subtractDays } from '@/lib/utils';
import OverlayChart from './OverlayChart';
import YearComparison from './YearComparison';

type Tab = 'temperature' | 'pressure' | 'precipitation' | 'humidity' | 'wind' | 'overlay' | 'yearcomparison';

const TABS: { key: Tab; label: string }[] = [
  { key: 'temperature', label: 'Temperature' },
  { key: 'pressure', label: 'Pressure' },
  { key: 'precipitation', label: 'Precipitation' },
  { key: 'humidity', label: 'Humidity' },
  { key: 'wind', label: 'Wind Speed' },
  { key: 'overlay', label: 'Overlay' },
  { key: 'yearcomparison', label: 'Year Compare' },
];

interface StatsRow {
  max: number;
  min: number;
  avg: number;
  total?: number;
  rainyDays?: number;
}

function computeStats(values: number[], isPrecip = false): StatsRow {
  const filtered = values.filter((v) => !isNaN(v));
  const max = Math.max(...filtered);
  const min = Math.min(...filtered);
  const avg = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  if (isPrecip) {
    return { max, min, avg, total: filtered.reduce((a, b) => a + b, 0), rainyDays: filtered.filter((v) => v > 0).length };
  }
  return { max, min, avg };
}

interface ChartPanelProps {
  tab: Tab;
  data: DailyHistorical[];
  isDark: boolean;
  lat: number;
  lon: number;
}

function ChartPanel({ tab, data, isDark, lat, lon }: ChartPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (tab === 'overlay' || tab === 'yearcomparison') return;
    if (!canvasRef.current || data.length === 0) return;

    chartRef.current?.destroy();

    const labels = data.map((d) => formatDate(d.date));
    let config: ChartConfiguration<'line'> | ChartConfiguration<'bar'>;

    if (tab === 'temperature') {
      const maxTemps = data.map((d) => d.maxTemp);
      const minTemps = data.map((d) => d.minTemp);
      const lineConfig: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Max Temp (°C)', data: maxTemps, borderColor: COLORS.warm, backgroundColor: COLORS.warmAlpha, fill: '+1', tension: 0.3 },
            { label: 'Min Temp (°C)', data: minTemps, borderColor: COLORS.cool, backgroundColor: COLORS.coolAlpha, fill: false, tension: 0.3 },
          ],
        },
        options: baseLineOptions(isDark),
      };
      config = lineConfig;
    } else if (tab === 'pressure') {
      const vals = data.map((d) => d.pressure);
      const lineConfig: ChartConfiguration<'line'> = {
        type: 'line',
        data: { labels, datasets: [{ label: 'Pressure (hPa)', data: vals, borderColor: COLORS.purple, backgroundColor: COLORS.purpleAlpha, fill: true, tension: 0.3 }] },
        options: baseLineOptions(isDark),
      };
      config = lineConfig;
    } else if (tab === 'precipitation') {
      const vals = data.map((d) => d.precipitation);
      const barConfig: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Precipitation (mm)', data: vals, backgroundColor: COLORS.blueAlpha, borderColor: COLORS.blue, borderWidth: 1 }] },
        options: baseBarOptions(isDark),
      };
      config = barConfig;
    } else if (tab === 'humidity') {
      const vals = data.map((d) => d.humidity);
      const lineConfig: ChartConfiguration<'line'> = {
        type: 'line',
        data: { labels, datasets: [{ label: 'Humidity (%)', data: vals, borderColor: COLORS.cyan, backgroundColor: COLORS.cyanAlpha, fill: true, tension: 0.3 }] },
        options: baseLineOptions(isDark),
      };
      config = lineConfig;
    } else {
      const vals = data.map((d) => d.windSpeed);
      const lineConfig: ChartConfiguration<'line'> = {
        type: 'line',
        data: { labels, datasets: [{ label: 'Wind Speed (km/h)', data: vals, borderColor: COLORS.green, backgroundColor: COLORS.greenAlpha, fill: true, tension: 0.3 }] },
        options: baseLineOptions(isDark),
      };
      config = lineConfig;
    }

    chartRef.current = new Chart(canvasRef.current, config as ChartConfiguration);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [tab, data, isDark]);

  if (tab === 'overlay') return <OverlayChart data={data} />;
  if (tab === 'yearcomparison') return <YearComparison lat={lat} lon={lon} />;

  const values =
    tab === 'temperature'
      ? data.map((d) => d.maxTemp)
      : tab === 'pressure'
      ? data.map((d) => d.pressure)
      : tab === 'precipitation'
      ? data.map((d) => d.precipitation)
      : tab === 'humidity'
      ? data.map((d) => d.humidity)
      : data.map((d) => d.windSpeed);

  const stats = computeStats(values, tab === 'precipitation');
  const unit = tab === 'temperature' ? '°C' : tab === 'pressure' ? ' hPa' : tab === 'precipitation' ? ' mm' : tab === 'humidity' ? '%' : ' km/h';

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-64 overflow-x-auto">
        <canvas ref={canvasRef} />
      </div>
      <div className="flex flex-wrap gap-3">
        {tab === 'precipitation' ? (
          <>
            <StatBadge label="Total" value={`${stats.total?.toFixed(1)}${unit}`} />
            <StatBadge label="Rainy days" value={`${stats.rainyDays}`} />
            <StatBadge label="Max" value={`${stats.max.toFixed(1)}${unit}`} />
          </>
        ) : (
          <>
            <StatBadge label="Max" value={`${stats.max.toFixed(1)}${unit}`} />
            <StatBadge label="Avg" value={`${stats.avg.toFixed(1)}${unit}`} />
            <StatBadge label="Min" value={`${stats.min.toFixed(1)}${unit}`} />
          </>
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 dark:bg-white/5 rounded-lg px-4 py-2">
      <span className="text-xs text-white/50 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

interface Props {
  lat: number;
  lon: number;
}

export default function HistoricalCharts({ lat, lon }: Props) {
  const today = new Date();
  const defaultFrom = toDateString(subtractDays(today, 14));
  const defaultTo = toDateString(today);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [activeTab, setActiveTab] = useState<Tab>('temperature');
  const [data, setData] = useState<DailyHistorical[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  async function load(from: string, to: string) {
    if (from > to) { setError('"From" date must be before "To" date'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/historical?lat=${lat}&lon=${lon}&start=${from}&end=${to}`);
      if (!res.ok) throw new Error('Failed to load data');
      const json = (await res.json()) as { data: DailyHistorical[] };
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(fromDate, toDate); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const inputClass =
    'bg-white/10 dark:bg-white/5 text-white border border-white/20 rounded-lg px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky-400';

  return (
    <div className="flex flex-col gap-4">
      {/* Date range picker */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/60 uppercase tracking-wide">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
        </div>
        <button
          onClick={() => load(fromDate, toDate)}
          disabled={loading}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-lg text-sm font-medium min-h-[44px] transition-colors"
        >
          {loading ? 'Loading…' : 'Update'}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === t.key
                ? 'bg-sky-500 text-white'
                : 'bg-white/10 dark:bg-white/5 text-white/70 hover:bg-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length > 0 ? (
        <ChartPanel tab={activeTab} data={data} isDark={isDark} lat={lat} lon={lon} />
      ) : (
        <div className="flex items-center justify-center h-32 text-white/40">No data available</div>
      )}
    </div>
  );
}
