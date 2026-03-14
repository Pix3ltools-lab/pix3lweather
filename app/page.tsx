'use client';

import { useEffect, useState } from 'react';
import type { CurrentWeather as CW, DailyForecast, HourlyPoint } from '@/lib/weather';
import { weatherBackground } from '@/lib/weather';
import CurrentWeather from '@/components/CurrentWeather';
import ForecastCards from '@/components/ForecastCards';
import HourlyChart from '@/components/HourlyChart';
import HistoricalCharts from '@/components/HistoricalCharts';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationToggle from '@/components/NotificationToggle';
import CitySearch from '@/components/CitySearch';

interface WeatherData {
  current: CW;
  daily: DailyForecast[];
  hourly: HourlyPoint[];
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded-xl ${className ?? ''}`} />;
}

export default function Home() {
  const defaultLat = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? '45.4654');
  const defaultLon = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LON ?? '9.1859');
  const defaultCity = process.env.NEXT_PUBLIC_DEFAULT_CITY ?? 'Milan';

  const [lat, setLat] = useState(() => {
    if (typeof window === 'undefined') return defaultLat;
    return parseFloat(localStorage.getItem('location-lat') ?? String(defaultLat));
  });
  const [lon, setLon] = useState(() => {
    if (typeof window === 'undefined') return defaultLon;
    return parseFloat(localStorage.getItem('location-lon') ?? String(defaultLon));
  });
  const [city, setCity] = useState(() => {
    if (typeof window === 'undefined') return defaultCity;
    return localStorage.getItem('location-city') ?? defaultCity;
  });
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function handleCitySelect(newCity: string, newLat: number, newLon: number) {
    setCity(newCity);
    setLat(newLat);
    setLon(newLon);
    localStorage.setItem('location-city', newCity);
    localStorage.setItem('location-lat', String(newLat));
    localStorage.setItem('location-lon', String(newLon));
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      setData(null);
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error('Failed to fetch weather data');
        const json = (await res.json()) as WeatherData;
        setData(json);
        localStorage.setItem('last-weather', JSON.stringify(json));
      } catch (e) {
        const cached = localStorage.getItem('last-weather');
        if (cached) {
          setData(JSON.parse(cached) as WeatherData);
        } else {
          setError(e instanceof Error ? e.message : 'Could not load weather data');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lat, lon]);

  const bgGradient = data
    ? weatherBackground(data.current.weatherCode, data.current.isDay)
    : 'from-slate-800 via-slate-700 to-slate-800';

  return (
    <main className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-700`}>
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8">

        {/* Top bar */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">⛅ WeatherBoard</span>
          </div>
          <div className="flex items-center gap-2">
            <CitySearch city={city} onSelect={handleCitySelect} />
            <NotificationToggle />
            <ThemeToggle />
          </div>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-white text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Current weather */}
        <section className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5">
          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <Skeleton className="w-24 h-24" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-12 w-40" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="w-24 h-16" />)}
              </div>
            </div>
          ) : data ? (
            <CurrentWeather data={data.current} />
          ) : null}
        </section>

        {/* 7-day forecast */}
        <section className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">7-Day Forecast</h2>
          {loading ? (
            <div className="flex gap-3 overflow-x-hidden">
              {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="min-w-[90px] h-28 flex-shrink-0" />)}
            </div>
          ) : data ? (
            <ForecastCards data={data.daily} />
          ) : null}
        </section>

        {/* Hourly chart */}
        <section className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Next 24 Hours</h2>
          {loading ? (
            <Skeleton className="h-64" />
          ) : data && data.hourly.length > 0 ? (
            <HourlyChart data={data.hourly} />
          ) : (
            <div className="h-32 flex items-center justify-center text-white/40">No hourly data</div>
          )}
        </section>

        {/* Historical charts */}
        <section className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Historical Data</h2>
          <HistoricalCharts lat={lat} lon={lon} />
        </section>

      </div>
    </main>
  );
}
