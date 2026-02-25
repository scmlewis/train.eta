import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // For GitHub Pages: use '/train.eta/' for this project repo
  // or '/' if deploying to a user/org page
  base: process.env.VITE_BASE_URL || '/train.eta/',
  server: {
    proxy: {
      '/api/bus': {
        target: 'https://rt.data.gov.hk/v1/transport/mtr/bus/getSchedule',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bus/, '')
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MTR ETA App',
        short_name: 'TrainETA',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        scope: '/train.eta/',
        start_url: '/train.eta/',
        icons: []
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/rt\.data\.gov\.hk\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-eta-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes max to prevent stale data
              },
              networkTimeoutSeconds: 5,
            }
          }
        ]
      }
    })
  ],
})
