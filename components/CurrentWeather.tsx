'use client';

import type { CurrentWeather as CW } from '@/lib/weather';
import {
  weatherDescription,
  weatherEmoji,
} from '@/lib/weather';
import {
  formatTemp,
  formatWind,
  formatPressure,
  formatHumidity,
  formatPrecipitation,
  formatUV,
  formatTime,
} from '@/lib/utils';

interface Props {
  data: CW;
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/10 dark:bg-white/5 rounded-xl p-3 min-w-[90px]">
      <span className="text-xl">{icon}</span>
      <span className="text-xs text-white/60 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function CurrentWeather({ data }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Main temp */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="text-8xl leading-none">{weatherEmoji(data.weatherCode, data.isDay)}</div>
        <div className="flex flex-col items-center sm:items-start">
          <div className="text-6xl font-bold text-white">{formatTemp(data.temperature)}</div>
          <div className="text-white/70 text-lg mt-1">{weatherDescription(data.weatherCode)}</div>
          <div className="text-white/50 text-sm mt-0.5">Feels like {formatTemp(data.feelsLike)}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        <Stat label="Humidity" value={formatHumidity(data.humidity)} icon="💧" />
        <Stat label="Wind" value={formatWind(data.windSpeed)} icon="💨" />
        <Stat label="Pressure" value={formatPressure(data.pressure)} icon="🌡️" />
        <Stat label="Precipitation" value={formatPrecipitation(data.precipitation)} icon="🌧️" />
        <Stat label="UV Index" value={formatUV(data.uvIndex)} icon="☀️" />
        <Stat label="Sunrise" value={formatTime(data.sunrise)} icon="🌅" />
        <Stat label="Sunset" value={formatTime(data.sunset)} icon="🌇" />
      </div>
    </div>
  );
}
