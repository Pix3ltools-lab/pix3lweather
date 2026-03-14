import { NextRequest, NextResponse } from 'next/server';
import { geocodeCity } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await geocodeCity(q);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Geocoding failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
