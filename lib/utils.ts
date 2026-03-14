// Date helpers

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateString(new Date());
}

// Unit formatters

export function formatTemp(value: number): string {
  return `${Math.round(value)}°C`;
}

export function formatWind(value: number): string {
  return `${Math.round(value)} km/h`;
}

export function formatPressure(value: number): string {
  return `${Math.round(value)} hPa`;
}

export function formatHumidity(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatPrecipitation(value: number): string {
  return `${value.toFixed(1)} mm`;
}

export function formatUV(value: number): string {
  if (value <= 2) return `${value} (Low)`;
  if (value <= 5) return `${value} (Moderate)`;
  if (value <= 7) return `${value} (High)`;
  if (value <= 10) return `${value} (Very High)`;
  return `${value} (Extreme)`;
}

// Pearson correlation coefficient

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

export function correlationLabel(r: number): string {
  const abs = Math.abs(r);
  const direction = r >= 0 ? 'positive' : 'negative';
  let strength: string;
  if (abs >= 0.7) strength = 'Strong';
  else if (abs >= 0.4) strength = 'Moderate';
  else strength = 'Weak';
  return `${strength} ${direction} correlation (r = ${r.toFixed(2)})`;
}
