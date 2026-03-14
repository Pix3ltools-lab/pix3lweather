# WeatherBoard — Kanban Board Setup Prompt

You have access to the **pix3lboard** MCP server. Use it to create and maintain a Kanban board for the development of the WeatherBoard app (a Next.js 14 weather dashboard described in `prompt.md`).

## Step 1 — Create the board

1. Call `list_workspaces` to find the available workspace, then use its ID.
2. Create a board named **"WeatherBoard"**.
3. Create the following lists in order:
   - `Backlog`
   - `In Progress`
   - `Done`

## Step 2 — Populate Backlog with cards

Create one card per task in the `Backlog` list. Use the titles and descriptions below:

| Title | Description |
|---|---|
| Project setup | Init Next.js 14 with App Router, Tailwind CSS, TypeScript strict mode, Chart.js, next-pwa, next-themes. Create `.env.local.example`. |
| lib/weather.ts | All Open-Meteo API calls (forecast, historical, geocoding) and transparent merge logic for ranges spanning past and future dates. |
| lib/utils.ts | Date helpers, metric formatters, Pearson correlation coefficient calculator. |
| lib/charts.ts | Shared Chart.js config, color palette, reusable chart helpers. |
| lib/push.ts | Web Push subscription logic, VAPID key handling, in-memory subscription store. |
| API routes | Next.js route handlers: `/api/weather`, `/api/historical`, `/api/push/subscribe`, `/api/push/unsubscribe`. Add Cache-Control headers (10 min weather, 1 h historical). |
| CurrentWeather.tsx | Display temp, feels-like, condition icon, humidity, wind, pressure, precipitation, UV index, sunrise/sunset. Dynamic background gradient based on condition and time of day. |
| ForecastCards.tsx | Horizontally scrollable row of 7-day forecast cards (day name, icon, max/min temp, precipitation probability). |
| HourlyChart.tsx | Line chart (next 24 h temperature) with precipitation probability as secondary bar dataset on a dual Y axis. |
| HistoricalCharts.tsx | Date range picker, tab switcher for 5 charts (Temperature, Pressure, Precipitation, Humidity, Wind Speed), summary stats row per tab. |
| OverlayChart.tsx | Two variable dropdowns, dual Y-axis chart, Pearson correlation display with human-readable label. |
| YearComparison.tsx | Date range picker + comparison year selector, dual-line chart comparing same period across two years. |
| ThemeToggle.tsx | Cycle through System / Light / Dark modes, persist in localStorage, icon reflects current mode. |
| NotificationToggle.tsx | UI toggle to enable/disable push notifications, calls subscribe/unsubscribe API routes. |
| PWA & offline | Configure next-pwa manifest, generate placeholder icons (192×192, 512×512), implement `/offline` page showing last cached data with offline banner. |
| Push notifications | Background check every 30 min, send push alert if rain or storm predicted within 3 hours. |
| Responsive design | Mobile-first pass: vertical stacking on small screens, horizontal scroll for charts, 44 px touch targets. |
| README | Project description, features list, quick start steps, env vars table, VAPID key generation note, Vercel deploy button, MIT license. |

## Step 3 — Maintenance rules (apply throughout development)

Every time a task is started, completed, or blocked, update the board accordingly:

- **Starting a task** → move its card from `Backlog` to `In Progress`.
- **Completing a task** → move its card from `In Progress` to `Done`.
- **Discovering a new sub-task or unexpected work** → create a new card in `Backlog` (or directly in `In Progress` if already being worked on) with a clear title and description.
- **Blocking issue** → update the card description to document the blocker before switching to another task.

Always keep the board in sync with the actual development state. Never mark a card as Done unless the corresponding code is fully implemented, typed, and tested.
