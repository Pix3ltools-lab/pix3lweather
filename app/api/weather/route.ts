import { NextRequest, NextResponse } from 'next/server';
import { fetchCurrentWeather, fetchDailyForecast, fetchHourlyForecast } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lon = parseFloat(searchParams.get('lon') ?? '');

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Missing or invalid lat/lon parameters' }, { status: 400 });
  }

  try {
    const [current, daily, hourly] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchDailyForecast(lat, lon),
      fetchHourlyForecast(lat, lon),
    ]);

    return NextResponse.json(
      { current, daily, hourly },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
