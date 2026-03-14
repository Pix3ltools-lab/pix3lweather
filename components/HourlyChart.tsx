'use client';

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';
import { useTheme } from 'next-themes';
import type { HourlyPoint } from '@/lib/weather';
import { baseLineOptions, COLORS } from '@/lib/charts';

interface Props {
  data: HourlyPoint[];
}

export default function HourlyChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    const labels = data.map((p) => {
      const d = new Date(p.time);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    });

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Temperature (°C)',
            data: data.map((p) => p.temperature),
            borderColor: COLORS.orange,
            backgroundColor: COLORS.orangeAlpha,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            yAxisID: 'yTemp',
            order: 1,
          },
          {
            type: 'bar',
            label: 'Precip. probability (%)',
            data: data.map((p) => p.precipProbability),
            backgroundColor: COLORS.blueAlpha,
            borderColor: COLORS.blue,
            borderWidth: 1,
            yAxisID: 'yPrecip',
            order: 2,
          },
        ],
      },
      options: {
        ...baseLineOptions(isDark),
        scales: {
          x: {
            grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
            ticks: { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', maxRotation: 45 },
          },
          yTemp: {
            type: 'linear',
            position: 'left',
            grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
            ticks: {
              color: COLORS.orange,
              callback: (v: number | string) => `${v}°C`,
            },
            title: { display: true, text: 'Temperature (°C)', color: COLORS.orange },
          },
          yPrecip: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 100,
            grid: { drawOnChartArea: false },
            ticks: {
              color: COLORS.blue,
              callback: (v: number | string) => `${v}%`,
            },
            title: { display: true, text: 'Precip. prob. (%)', color: COLORS.blue },
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, config as ChartConfiguration);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, isDark]);

  return (
    <div className="relative h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}
