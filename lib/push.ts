import webpush from 'web-push';
import type { PushSubscription } from 'web-push';

// In-memory subscription store.
// NOTE: For production, replace with a database.
const subscriptions: PushSubscription[] = [];

export function initVapid(): void {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (publicKey && privateKey) {
    webpush.setVapidDetails('mailto:admin@weatherboard.app', publicKey, privateKey);
  }
}

export function addSubscription(sub: PushSubscription): void {
  const exists = subscriptions.some((s) => s.endpoint === sub.endpoint);
  if (!exists) subscriptions.push(sub);
}

export function removeSubscription(endpoint: string): void {
  const idx = subscriptions.findIndex((s) => s.endpoint === endpoint);
  if (idx !== -1) subscriptions.splice(idx, 1);
}

export async function sendPushToAll(title: string, body: string): Promise<void> {
  initVapid();
  const payload = JSON.stringify({ title, body });
  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).catch(() => removeSubscription(sub.endpoint))
    )
  );
}

export function getSubscriptionCount(): number {
  return subscriptions.length;
}
