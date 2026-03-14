import { NextRequest, NextResponse } from 'next/server';
import { fetchDateRange } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lon = parseFloat(searchParams.get('lon') ?? '');
  const startDate = searchParams.get('start') ?? '';
  const endDate = searchParams.get('end') ?? '';

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Missing or invalid lat/lon parameters' }, { status: 400 });
  }
  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
  }
  if (startDate > endDate) {
    return NextResponse.json({ error: '"start" date must be before "end" date' }, { status: 400 });
  }

  try {
    const data = await fetchDateRange(lat, lon, startDate, endDate);
    return NextResponse.json(
      { data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch historical data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
