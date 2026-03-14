'use client';

import { useState, useEffect } from 'react';

export default function NotificationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSupported('Notification' in window && 'serviceWorker' in navigator);
    if (localStorage.getItem('push-enabled') === 'true') setEnabled(true);
  }, []);

  async function toggle() {
    if (!supported) return;
    setLoading(true);
    try {
      if (!enabled) {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;

        const reg = await navigator.serviceWorker.ready;
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) throw new Error('VAPID key not configured');

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        });

        localStorage.setItem('push-enabled', 'true');
        localStorage.setItem('push-endpoint', sub.endpoint);
        setEnabled(true);
      } else {
        const endpoint = localStorage.getItem('push-endpoint');
        if (endpoint) {
          await fetch('/api/push/unsubscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint }),
          });
        }
        localStorage.removeItem('push-enabled');
        localStorage.removeItem('push-endpoint');
        setEnabled(false);
      }
    } catch (err) {
      console.error('Push toggle error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium min-h-[44px] ${
        enabled
          ? 'bg-sky-500 hover:bg-sky-400 text-white'
          : 'bg-white/10 hover:bg-white/20 text-white'
      }`}
      title={enabled ? 'Disable weather alerts' : 'Enable weather alerts'}
    >
      <span className="text-lg">{enabled ? '🔔' : '🔕'}</span>
      <span className="hidden sm:inline">{loading ? '…' : enabled ? 'Alerts on' : 'Alerts off'}</span>
    </button>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}
