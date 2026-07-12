export const SITE_URL = 'https://scmlewis.github.io/train.eta/';
export const SITE_NAME = 'Train.ETA';

export const DEFAULT_SEO = {
  en: {
    title: 'Train.ETA — Hong Kong MTR, Light Rail & Bus Arrival Times',
    description:
      'Live arrival times for Hong Kong MTR, Light Rail, and MTR Bus. Fast, mobile-friendly ETA display with favorites and nearby stations.',
  },
  tc: {
    title: 'Train.ETA — 港鐵、輕鐵及巴士到站時間',
    description:
      '實時查看香港港鐵、輕鐵及巴士到站時間。快速、手機友善的到站資訊顯示，支援收藏車站及附近車站。',
  },
} as const;

export const TAB_SEO: Record<string, { en: { title: string; description: string }; tc: { title: string; description: string } }> = {
  MTR: {
    en: {
      title: 'MTR Stations — Live Arrival Times | Train.ETA',
      description: 'Browse all MTR stations and check live arrival times for Hong Kong\'s Mass Transit Railway.',
    },
    tc: {
      title: '港鐵車站 — 實時到站時間 | Train.ETA',
      description: '瀏覽所有港鐵車站，實時查看列車到站時間。',
    },
  },
  LRT: {
    en: {
      title: 'Light Rail Stations — Live Arrival Times | Train.ETA',
      description: 'Check Light Rail arrival times for the Northwest New Territories network.',
    },
    tc: {
      title: '輕鐵車站 — 實時到站時間 | Train.ETA',
      description: '查看輕鐵到站時間，覆蓋西北區輕鐵網絡。',
    },
  },
  BUS: {
    en: {
      title: 'MTR Bus Routes — Live Arrival Times | Train.ETA',
      description: 'View MTR Bus route schedules and live arrival times.',
    },
    tc: {
      title: '巴士路線 — 實時到站時間 | Train.ETA',
      description: '查看巴士路線班次及實時到站時間。',
    },
  },
  FAV: {
    en: {
      title: 'Favorite Stations | Train.ETA',
      description: 'Quickly access your saved MTR, Light Rail, and Bus stations.',
    },
    tc: {
      title: '收藏車站 | Train.ETA',
      description: '快速存取你收藏的港鐵、輕鐵及巴士車站。',
    },
  },
  SETTINGS: {
    en: {
      title: 'Settings & About | Train.ETA',
      description: 'Customize Train.ETA settings and learn more about the app.',
    },
    tc: {
      title: '設定與關於 | Train.ETA',
      description: '自訂 Train.ETA 設定及了解更多關於此應用程式的資訊。',
    },
  },
};
