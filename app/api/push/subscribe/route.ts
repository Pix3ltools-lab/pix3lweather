import { NextRequest, NextResponse } from 'next/server';
import type { PushSubscription } from 'web-push';
import { addSubscription } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const sub = (await request.json()) as PushSubscription;
    if (!sub?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }
    addSubscription(sub);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
