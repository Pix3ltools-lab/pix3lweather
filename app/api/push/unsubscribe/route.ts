import { NextRequest, NextResponse } from 'next/server';
import { removeSubscription } from '@/lib/push';

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = (await request.json()) as { endpoint: string };
    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }
    removeSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
