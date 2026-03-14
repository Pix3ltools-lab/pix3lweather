// Types

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  precipitation: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  isDay: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipProbability: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  precipProbability: number;
}

export interface DailyHistorical {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

// Weather code to condition mapping

export function weatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 9) return 'Overcast';
  if (code <= 19) return 'Foggy';
  if (code <= 29) return 'Drizzle';
  if (code <= 39) return 'Rain';
  if (code <= 49) return 'Snow';
  if (code <= 59) return 'Rain showers';
  if (code <= 69) return 'Snow showers';
  if (code <= 79) return 'Thunderstorm';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function weatherEmoji(code: number, isDay = 1): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '🌤️';
  if (code === 3) return '☁️';
  if (code <= 9) return '🌫️';
  if (code <= 19) return '🌫️';
  if (code <= 39) return '🌧️';
  if (code <= 49) return '❄️';
  if (code <= 59) return '🌧️';
  if (code <= 69) return '🌨️';
  if (code <= 79) return '⛈️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

// Dynamic background based on weather code and time of day

export function weatherBackground(code: number, isDay: number): string {
  if (!isDay) return 'from-slate-900 via-blue-950 to-slate-900';
  if (code >= 70 && code <= 99) return 'from-slate-800 via-slate-700 to-slate-800'; // storm
  if (code >= 50 && code <= 69) return 'from-slate-700 via-blue-900 to-slate-700'; // rain
  if (code >= 10 && code <= 49) return 'from-slate-600 via-blue-800 to-slate-700'; // cloudy
  if (code <= 3) {
    const hour = new Date().getHours();
    if (hour < 10) return 'from-blue-600 via-orange-400 to-amber-300'; // sunny morning
    return 'from-sky-400 via-blue-500 to-blue-600'; // sunny afternoon
  }
  return 'from-sky-500 via-blue-600 to-blue-700';
}

// Fetch helpers

const BASE_FORECAST = 'https://api.open-meteo.com/v1/forecast';
const BASE_ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

// Current weather

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const url =
    `${BASE_FORECAST}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,uv_index,is_day` +
    `&daily=sunrise,sunset&timezone=auto&forecast_days=1`;

  interface RawCurrent {
    current: {
      temperature_2m: number;
      apparent_temperature: number;
      weather_code: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
      surface_pressure: number;
      precipitation: number;
      uv_index: number;
      is_day: number;
    };
    daily: { sunrise: string[]; sunset: string[] };
  }

  const data = await fetchJson<RawCurrent>(url);
  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    weatherCode: data.current.weather_code,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    pressure: data.current.surface_pressure,
    precipitation: data.current.precipitation,
    uvIndex: data.current.uv_index,
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
    isDay: data.current.is_day,
  };
}

// 7-day daily forecast

export async function fetchDailyForecast(lat: number, lon: number): Promise<DailyForecast[]> {
  const url =
    `${BASE_FORECAST}?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +
    `&timezone=auto&forecast_days=7`;

  interface RawDaily {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: number[];
      sunrise: string[];
      sunset: string[];
    };
  }

  const data = await fetchJson<RawDaily>(url);
  return data.daily.time.map((date, i) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    maxTemp: data.daily.temperature_2m_max[i],
    minTemp: data.daily.temperature_2m_min[i],
    precipProbability: data.daily.precipitation_probability_max[i] ?? 0,
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
  }));
}

// Hourly forecast (next 24h)

export async function fetchHourlyForecast(lat: number, lon: number): Promise<HourlyPoint[]> {
  const url =
    `${BASE_FORECAST}?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,precipitation_probability` +
    `&timezone=auto&forecast_days=2`;

  interface RawHourly {
    hourly: {
      time: string[];
      temperature_2m: number[];
      precipitation_probability: number[];
    };
  }

  const data = await fetchJson<RawHourly>(url);
  const now = new Date();
  const next24 = data.hourly.time
    .map((t, i) => ({
      time: t,
      temperature: data.hourly.temperature_2m[i],
      precipProbability: data.hourly.precipitation_probability[i] ?? 0,
    }))
    .filter((p) => {
      const d = new Date(p.time);
      return d >= now && d <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
    });
  return next24;
}

// Historical / archive data

export async function fetchHistorical(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<DailyHistorical[]> {
  const url =
    `${BASE_ARCHIVE}?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,surface_pressure_mean` +
    `&start_date=${startDate}&end_date=${endDate}&timezone=auto`;

  interface RawArchive {
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
      relative_humidity_2m_mean: number[];
      wind_speed_10m_max: number[];
      surface_pressure_mean: number[];
    };
  }

  const data = await fetchJson<RawArchive>(url);
  return data.daily.time.map((date, i) => ({
    date,
    maxTemp: data.daily.temperature_2m_max[i] ?? 0,
    minTemp: data.daily.temperature_2m_min[i] ?? 0,
    precipitation: data.daily.precipitation_sum[i] ?? 0,
    humidity: data.daily.relative_humidity_2m_mean[i] ?? 0,
    windSpeed: data.daily.wind_speed_10m_max[i] ?? 0,
    pressure: data.daily.surface_pressure_mean[i] ?? 0,
  }));
}

// Forecast-based daily data (same shape as historical, for future dates)

export async function fetchForecastDaily(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<DailyHistorical[]> {
  const url =
    `${BASE_FORECAST}?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,surface_pressure_mean` +
    `&start_date=${startDate}&end_date=${endDate}&timezone=auto`;

  interface RawForecastDaily {
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
      relative_humidity_2m_mean: number[];
      wind_speed_10m_max: number[];
      surface_pressure_mean: number[];
    };
  }

  const data = await fetchJson<RawForecastDaily>(url);
  return data.daily.time.map((date, i) => ({
    date,
    maxTemp: data.daily.temperature_2m_max[i] ?? 0,
    minTemp: data.daily.temperature_2m_min[i] ?? 0,
    precipitation: data.daily.precipitation_sum[i] ?? 0,
    humidity: data.daily.relative_humidity_2m_mean[i] ?? 0,
    windSpeed: data.daily.wind_speed_10m_max[i] ?? 0,
    pressure: data.daily.surface_pressure_mean[i] ?? 0,
  }));
}

// Merged range — transparently combines historical + forecast

export async function fetchDateRange(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<DailyHistorical[]> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const pastEnd = endDate < today ? endDate : yesterday;
  const futureStart = startDate >= today ? startDate : today;

  const results: DailyHistorical[] = [];

  if (startDate <= yesterday) {
    const pastData = await fetchHistorical(lat, lon, startDate, pastEnd < startDate ? startDate : pastEnd);
    results.push(...pastData);
  }

  if (endDate >= today) {
    const futureData = await fetchForecastDaily(lat, lon, futureStart, endDate);
    results.push(...futureData);
  }

  // Deduplicate and sort
  const map = new Map<string, DailyHistorical>();
  for (const item of results) map.set(item.date, item);
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Geocoding

export async function geocodeCity(query: string): Promise<GeocodingResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;

  interface RawGeo {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      country: string;
      admin1?: string;
    }>;
  }

  const data = await fetchJson<RawGeo>(url);
  return (data.results ?? []).map((r) => ({
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

// Rain/storm check for push notifications

export async function checkRainAlert(lat: number, lon: number): Promise<boolean> {
  const points = await fetchHourlyForecast(lat, lon);
  const next3h = points.slice(0, 3);
  return next3h.some((p) => p.precipProbability >= 70);
}
