'use client';

import type { DailyForecast } from '@/lib/weather';
import { weatherEmoji } from '@/lib/weather';
import { formatDay, formatTemp } from '@/lib/utils';

interface Props {
  data: DailyForecast[];
}

export default function ForecastCards({ data }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {data.map((day) => (
        <div
          key={day.date}
          className="flex flex-col items-center gap-2 bg-white/10 dark:bg-white/5 rounded-xl p-4 min-w-[90px] flex-shrink-0"
        >
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
            {formatDay(day.date)}
          </span>
          <span className="text-3xl">{weatherEmoji(day.weatherCode)}</span>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">{formatTemp(day.maxTemp)}</span>
            <span className="text-xs text-white/50">{formatTemp(day.minTemp)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs">🌧️</span>
            <span className="text-xs text-white/60">{day.precipProbability}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
