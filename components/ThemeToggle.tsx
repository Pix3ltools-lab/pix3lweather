'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const MODES = ['system', 'light', 'dark'] as const;
type Mode = (typeof MODES)[number];

const ICONS: Record<Mode, string> = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙',
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-10" />;

  const current = (theme as Mode) ?? 'system';

  function cycle() {
    const idx = MODES.indexOf(current);
    setTheme(MODES[(idx + 1) % MODES.length]);
  }

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium min-h-[44px]"
      title={`Theme: ${current} — click to cycle`}
    >
      <span className="text-lg">{ICONS[current]}</span>
      <span className="capitalize hidden sm:inline">{current}</span>
    </button>
  );
}
