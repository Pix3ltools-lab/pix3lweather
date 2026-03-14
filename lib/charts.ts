import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const COLORS = {
  blue: 'rgb(14, 165, 233)',
  blueAlpha: 'rgba(14, 165, 233, 0.2)',
  orange: 'rgb(249, 115, 22)',
  orangeAlpha: 'rgba(249, 115, 22, 0.2)',
  green: 'rgb(34, 197, 94)',
  greenAlpha: 'rgba(34, 197, 94, 0.2)',
  purple: 'rgb(168, 85, 247)',
  purpleAlpha: 'rgba(168, 85, 247, 0.2)',
  red: 'rgb(239, 68, 68)',
  redAlpha: 'rgba(239, 68, 68, 0.2)',
  cyan: 'rgb(6, 182, 212)',
  cyanAlpha: 'rgba(6, 182, 212, 0.2)',
  warm: 'rgb(251, 146, 60)',
  warmAlpha: 'rgba(251, 146, 60, 0.15)',
  cool: 'rgb(99, 179, 237)',
  coolAlpha: 'rgba(99, 179, 237, 0.15)',
};

export function baseLineOptions(isDark: boolean): ChartOptions<'line'> {
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const tickColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: tickColor, usePointStyle: true, pointStyleWidth: 10 },
      },
      tooltip: { backgroundColor: isDark ? '#1e293b' : '#fff', titleColor: tickColor, bodyColor: tickColor, borderColor: gridColor, borderWidth: 1 },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor, maxRotation: 45 },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor },
      },
    },
  };
}

export function baseBarOptions(isDark: boolean): ChartOptions<'bar'> {
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const tickColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: tickColor, usePointStyle: true },
      },
      tooltip: { backgroundColor: isDark ? '#1e293b' : '#fff', titleColor: tickColor, bodyColor: tickColor },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor, maxRotation: 45 },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor },
      },
    },
  };
}
