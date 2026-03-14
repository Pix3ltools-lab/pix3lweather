# WeatherBoard — Claude Code Prompt

Build a Next.js 14 weather dashboard app with the following specifications.

---

## Stack

- Next.js 14 with App Router
- Tailwind CSS for styling
- Chart.js with react-chartjs-2 for all charts
- next-pwa for PWA support
- next-themes for dark/light mode management
- Deploy-ready for Vercel

---

## Data Source

Use Open-Meteo API only (free, no API key required). Use these endpoints:

- Forecast: `https://api.open-meteo.com/v1/forecast`
- Historical: `https://archive-api.open-meteo.com/v1/archive`
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`

All API calls must go through Next.js API routes (never call Open-Meteo directly from the client) to allow caching and avoid CORS issues.

---

## Configuration

Default location is set via environment variables:

- `NEXT_PUBLIC_DEFAULT_CITY` — display name (e.g. `Milan`)
- `NEXT_PUBLIC_DEFAULT_LAT` — latitude (e.g. `45.4654`)
- `NEXT_PUBLIC_DEFAULT_LON` — longitude (e.g. `9.1859`)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — VAPID public key for push notifications
- `VAPID_PRIVATE_KEY` — VAPID private key for push notifications

Create a `.env.local.example` file with all variables documented with descriptions and example values.

---

## Pages and Layout

Single page app with a clean, modern design. Layout from top to bottom:

1. Top bar with app name, city name, theme toggle
2. Current weather section
3. 7-day forecast cards
4. Hourly temperature chart (next 24h)
5. Historical charts section

Dynamic background that changes based on weather condition and time of day:

- Sunny morning → warm blue-to-orange gradient
- Sunny afternoon → bright blue gradient
- Cloudy → grey-blue gradient
- Rain → dark grey-blue
- Storm → very dark with subtle accent
- Night (any condition) → deep dark blue / near-black gradient

---

## Current Weather Section

Display the following data points:

- Temperature (°C)
- Feels like (°C)
- Weather condition with icon (use emoji or a free SVG weather icon set such as Meteocons)
- Humidity (%)
- Wind speed (km/h)
- Atmospheric pressure (hPa)
- Precipitation (mm)
- UV index
- Sunrise time
- Sunset time

All units metric.

---

## Forecast Section

### 7-day daily forecast

Scrollable row of cards, one per day, showing:

- Day name
- Weather condition icon
- Max / min temperature
- Precipitation probability (%)

### Hourly temperature chart

Line chart showing temperature for the next 24 hours. Use Chart.js. Show precipitation probability as a secondary bar dataset on the same chart with a secondary Y axis.

---

## Historical Charts Section

### Date range picker

Two date inputs (from / to). Default range: last 14 days. Validate that the "from" date is not after the "to" date. Show an "Update" button to reload charts after changing the range.

When the selected range includes future dates, fetch forecast data for those days. When it includes past dates, fetch from the historical archive endpoint. Merge the two datasets transparently when the range spans both past and future.

### Five individual charts (tab switcher)

Each chart is a full-width Chart.js chart. Switch between them using a tab bar:

1. **Temperature** — line chart, show daily max (warm color) and daily min (cool color), fill between
2. **Atmospheric Pressure** — line chart, single dataset (hPa)
3. **Precipitation** — bar chart, daily sum (mm)
4. **Humidity** — line chart, daily mean (%)
5. **Wind Speed** — line chart, daily max (km/h)

Each chart tab includes a summary stats row below the chart with: max, average, and min values for the selected period (or total and rainy days count for precipitation).

### Variable overlay chart

Two dropdowns allowing the user to select any two variables from: Temperature, Pressure, Precipitation, Humidity, Wind Speed. Display both on the same chart with dual Y axes (left and right). Use different colors for each variable. If the same variable is selected in both dropdowns, show a message asking to select two different variables. Calculate and display the Pearson correlation coefficient below the chart with a human-readable label: strong/moderate/weak, positive/negative.

### Year comparison chart

A date range picker (from / to) plus a second year selector dropdown (list of available years from 1940 to current year). Display the selected date range for the current year and the same date range for the selected comparison year on the same line chart, using two distinct colors. Show a legend identifying each year.

---

## Theme (Dark / Light Mode)

Use the `next-themes` library. Implement three modes:

- **System** — follows the OS preference (default)
- **Light** — forces light theme
- **Dark** — forces dark theme

Persist the user's choice in `localStorage`. Show a toggle button in the top-right corner of the app. The button cycles through the three modes and shows the current mode with an icon (sun / moon / monitor).

Use Tailwind CSS `dark:` classes for all color definitions. The dynamic weather background must work correctly in both light and dark mode.

---

## PWA

Configure `next-pwa` with the following manifest:

```json
{
  "name": "WeatherBoard",
  "short_name": "WeatherBoard",
  "description": "A beautiful weather dashboard with historical charts",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0f172a",
  "theme_color": "#0ea5e9",
  "start_url": "/"
}
```

Requirements:

- Generate placeholder icons at 192x192 and 512x512 (simple colored SVG converted to PNG, or solid color placeholders)
- Offline fallback page at `/offline` — show last cached weather data with a visible banner: "You are offline — showing last available data"
- Cache the last successful API response so it is available offline
- Register the service worker only in production (`disable: process.env.NODE_ENV === 'development'` in next-pwa config)

---

## Push Notifications

Implement Web Push Notifications for weather alerts:

- API route `POST /api/push/subscribe` — saves a push subscription
- API route `DELETE /api/push/unsubscribe` — removes a push subscription
- A background check runs every 30 minutes via a service worker or a Vercel Cron Job (if available)
- Send a push notification if rain or storm is predicted within the next 3 hours
- The user can enable or disable notifications with a clearly visible toggle in the UI
- Use VAPID keys from environment variables
- Store subscriptions in memory for simplicity (note in the README that for production a database should be used)

---

## Responsive Design

- Mobile first approach
- Current weather section stacks vertically on small screens
- Charts are readable on mobile: use horizontal scroll wrapper on very small viewports if needed
- Forecast cards scroll horizontally on mobile
- Touch-friendly tap targets (minimum 44px)

---

## Language

All UI text in English.

---

## File Structure

```
app/
  page.tsx
  layout.tsx
  offline/
    page.tsx
  api/
    weather/
      route.ts
    historical/
      route.ts
    push/
      subscribe/
        route.ts
      unsubscribe/
        route.ts
components/
  CurrentWeather.tsx
  ForecastCards.tsx
  HourlyChart.tsx
  HistoricalCharts.tsx
  OverlayChart.tsx
  YearComparison.tsx
  NotificationToggle.tsx
  ThemeToggle.tsx
lib/
  weather.ts        (all Open-Meteo API calls and data merging logic)
  charts.ts         (shared Chart.js config, colors, helpers)
  push.ts           (push notification subscription logic)
  utils.ts          (date helpers, unit formatters, Pearson correlation)
public/
  manifest.json
  icons/
    icon-192.png
    icon-512.png
.env.local.example
README.md
```

---

## README

The README must include:

- Project name and one-line description
- Screenshot placeholder (note: add screenshot after first run)
- Features list with emoji bullets
- Quick start:
  1. Clone the repository
  2. Copy `.env.local.example` to `.env.local` and fill in the values
  3. Run `npm install`
  4. Run `npm run dev`
  5. Open `http://localhost:3000`
- Vercel deploy button: `[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)`
- Environment variables table with name, description, required flag, and example value
- Note about generating VAPID keys: `npx web-push generate-vapid-keys`
- License: MIT

---

## Code Quality Requirements

- Use TypeScript throughout (strict mode)
- All API responses must be typed with interfaces
- No `any` types
- Handle loading states for all async operations (show skeleton loaders or spinners)
- Handle error states gracefully (show user-friendly error messages, not raw error objects)
- All Chart.js instances must be properly destroyed on component unmount to avoid memory leaks
- API routes must implement response caching with appropriate Cache-Control headers (weather data: 10 minutes, historical data: 1 hour)

---

## Kanban Board Maintenance

A Kanban board named **"WeatherBoard"** has already been created on the **pix3lboard** MCP server with three lists: `Backlog`, `In Progress`, `Done`. Each task in this prompt has a corresponding card in `Backlog`.

Keep the board in sync throughout development:

- **Before starting a task** → move its card to `In Progress`
- **After completing a task** → move its card to `Done`
- **If a new sub-task emerges** → create a new card in `Backlog` (or `In Progress` if already underway)
- **If a task is blocked** → update the card description with a note about the blocker

Never mark a card as Done unless the corresponding code is fully implemented, typed, and working.
