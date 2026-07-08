# Train.ETA — Hong Kong Transit Companion

A lightweight progressive web app providing near-real-time arrival information for MTR, Light Rail, and selected bus routes in Hong Kong. Built for commuters who need fast, reliable ETAs on the go.

## Features

- **MTR / Light Rail / Bus ETAs** — live arrival times with platform and destination info
- **Destination filtering** — filter trains by direction or destination
- **Favorites** — save frequently used stations for quick access
- **Nearby stations** — find closest stops using device geolocation (computed locally, never uploaded)
- **Bilingual** — toggle between English and Traditional Chinese
- **Adjustable font size** — small / medium / large text options
- **PWA** — installable with offline caching via Workbox
- **Auto-refresh** — background data updates every 30 seconds via React Query

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 7 |
| State | Zustand (persisted to localStorage) |
| Data fetching | TanStack React Query |
| Icons | Lucide React |
| PWA / SW | vite-plugin-pwa + Workbox |
| Testing | Vitest + Testing Library |

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Deployment

The app is deployed to GitHub Pages via GitHub Actions. Pushing to `main` triggers an automatic build and deploy.

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

## Data Sources

ETA data is fetched from the Hong Kong Government open-data APIs:

- MTR: `rt.data.gov.hk/v1/transport/mtr/getSchedule.php`
- Light Rail: `rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule`
- Bus: `rt.data.gov.hk/v1/transport/mtr/bus/getSchedule`

## License

MIT

## Contributing

Open an issue or submit a pull request — contributions welcome.
