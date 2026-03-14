'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';
import { useTheme } from 'next-themes';
import type { DailyHistorical } from '@/lib/weather';
import { baseLineOptions, COLORS } from '@/lib/charts';
import { pearsonCorrelation, correlationLabel, formatDate } from '@/lib/utils';

type Variable = 'temperature' | 'pressure' | 'precipitation' | 'humidity' | 'wind';

const VARIABLE_LABELS: Record<Variable, string> = {
  temperature: 'Temperature (°C)',
  pressure: 'Pressure (hPa)',
  precipitation: 'Precipitation (mm)',
  humidity: 'Humidity (%)',
  wind: 'Wind Speed (km/h)',
};

const VARIABLE_COLORS: Record<Variable, string> = {
  temperature: COLORS.orange,
  pressure: COLORS.purple,
  precipitation: COLORS.blue,
  humidity: COLORS.cyan,
  wind: COLORS.green,
};

function getValues(data: DailyHistorical[], v: Variable): number[] {
  switch (v) {
    case 'temperature': return data.map((d) => (d.maxTemp + d.minTemp) / 2);
    case 'pressure': return data.map((d) => d.pressure);
    case 'precipitation': return data.map((d) => d.precipitation);
    case 'humidity': return data.map((d) => d.humidity);
    case 'wind': return data.map((d) => d.windSpeed);
  }
}

interface Props {
  data: DailyHistorical[];
}

export default function OverlayChart({ data }: Props) {
  const [varA, setVarA] = useState<Variable>('temperature');
  const [varB, setVarB] = useState<Variable>('humidity');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const same = varA === varB;
  const valuesA = same ? [] : getValues(data, varA);
  const valuesB = same ? [] : getValues(data, varB);
  const r = same ? 0 : pearsonCorrelation(valuesA, valuesB);

  useEffect(() => {
    if (!canvasRef.current || same) return;

    chartRef.current?.destroy();

    const labels = data.map((d) => formatDate(d.date));
    const colorA = VARIABLE_COLORS[varA];
    const colorB = VARIABLE_COLORS[varB];
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tickColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: VARIABLE_LABELS[varA],
            data: valuesA,
            borderColor: colorA,
            backgroundColor: colorA.replace('rgb', 'rgba').replace(')', ', 0.15)'),
            fill: false,
            tension: 0.3,
            yAxisID: 'yA',
          },
          {
            label: VARIABLE_LABELS[varB],
            data: valuesB,
            borderColor: colorB,
            backgroundColor: colorB.replace('rgb', 'rgba').replace(')', ', 0.15)'),
            fill: false,
            tension: 0.3,
            yAxisID: 'yB',
          },
        ],
      },
      options: {
        ...baseLineOptions(isDark),
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, maxRotation: 45 },
          },
          yA: {
            type: 'linear',
            position: 'left',
            grid: { color: gridColor },
            ticks: { color: colorA },
            title: { display: true, text: VARIABLE_LABELS[varA], color: colorA },
          },
          yB: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: colorB },
            title: { display: true, text: VARIABLE_LABELS[varB], color: colorB },
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, config);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, varA, varB, isDark, same, valuesA, valuesB]);

  const variables = Object.keys(VARIABLE_LABELS) as Variable[];
  const selectClass =
    'bg-white/10 dark:bg-white/5 text-white border border-white/20 rounded-lg px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-sky-400';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select value={varA} onChange={(e) => setVarA(e.target.value as Variable)} className={selectClass}>
          {variables.map((v) => (
            <option key={v} value={v} className="bg-slate-800">{VARIABLE_LABELS[v]}</option>
          ))}
        </select>
        <span className="text-white/50">vs</span>
        <select value={varB} onChange={(e) => setVarB(e.target.value as Variable)} className={selectClass}>
          {variables.map((v) => (
            <option key={v} value={v} className="bg-slate-800">{VARIABLE_LABELS[v]}</option>
          ))}
        </select>
      </div>

      {same ? (
        <div className="flex items-center justify-center h-32 text-white/50 text-sm">
          Please select two different variables.
        </div>
      ) : (
        <>
          <div className="relative h-64">
            <canvas ref={canvasRef} />
          </div>
          <div className="text-sm text-white/70 bg-white/10 dark:bg-white/5 rounded-lg px-4 py-2">
            📊 {correlationLabel(r)}
          </div>
        </>
      )}
    </div>
  );
}
