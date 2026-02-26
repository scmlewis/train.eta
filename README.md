# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    **Train ETA — Production-ready Web App**

    Train ETA is a lightweight, fast web application built with React, TypeScript, and Vite that provides real-time estimated time-of-arrival (ETA) information for trains and buses. This repository contains the frontend application, utilities, and test suite used to display station coverage, pick stations, and present ETA cards and tables.

    **Repository**: c:\Github\(Web app)\Train_ETA

    **Demo / Preview**
    - Open `index.html` or run the dev server (see Quickstart) to view the app locally.

    **Key Features**
    - Real-time ETA display for transit lines (trains & buses).
    - Interactive station picker and station coverage overview.
    - Accessible UI components (`EtaDisplay`, `StationPicker`, `EtaCard`, etc.).
    - Unit tests with Vitest and type-safe store/hooks.

    Tech stack
    - React 18 + TypeScript
    - Vite for fast development & production builds
    - Vitest for unit tests

    Quickstart (Development)

    Prerequisites
    - Node.js 18+ and npm or yarn

    Install dependencies

    ```powershell
    npm install
    ```

    Run dev server

    ```powershell
    npm run dev
    ```

    Open the development URL printed by Vite (typically http://localhost:5173).

    Building for production

    ```powershell
    npm run build
    ```

    Serve production build locally

    ```powershell
    npm run preview
    ```

    Project Structure (Highlights)
    - `src/` — application source code
      - `components/` — React components (`EtaDisplay.tsx`, `StationPicker.tsx`, `EtaCard.tsx`, etc.)
      - `services/` — API wrappers and data utilities (`api.ts`, `busStops.ts`)
      - `store/` — application state hook (`useAppStore.ts`)
      - `types/` — TypeScript type definitions
    - `public/` — static assets
    - `scripts/` — helper scripts for generating data and tests

    Configuration & Data
    - Static datasets (e.g., `bus.json`, `bus_utf8.json`, `lrt.json`) are included at project root for development and local testing.
    - API integrations and environment-specific endpoints can be adjusted in `src/constants/config.ts`.

    Testing

    Run unit tests

    ```powershell
    npm test
    ```

    Or run vitest in watch mode

    ```powershell
    npm run test:watch
    ```

    Production Considerations
    - Use a CDN or static hosting (Netlify, Vercel, GitHub Pages) for assets.
    - Configure environment variables for production API endpoints and API keys.
    - Enable HTTP caching and service workers if you need offline support.

    Contributing
    - Fork the repository, create a feature branch, and open a pull request.
    - Run linting and tests before opening the PR.

    Maintainer Notes
    - The app is structured for clarity and testability. Keep UI components stateless where possible and move logic to services or hooks.

    License
    - See `LICENSE` in the repository root (if present); otherwise assume default project license.

    Contact
    - For questions or support, open an issue in this repository.

    ---

    If you'd like, I can also:
    - Add a screenshot and badges (build/test coverage) to the top of the README.
    - Add deployment instructions for a specific host (Vercel, Netlify, GitHub Pages).
