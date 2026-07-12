import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import BottomNav from './components/Tabs';
import StationPicker from './components/StationPicker';
import About from './components/About';
import FloatingGeoButton from './components/FloatingGeoButton';
import NearbyStationsSheet from './components/NearbyStationsSheet';
import SEO from './components/SEO';
import { TAB_SEO } from './config/seo';
import { useAppStore } from './store/useAppStore';
import './App.css';

const FONT_SIZE_MAP: Record<string, string> = {
  small: '14px',
  default: '16px',
  large: '18px',
};

function App() {
  const { currentTab, fontSize, language } = useAppStore();

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.lang = language === 'TC' ? 'zh-Hant' : 'en';
  }, [language]);

  const tabSeo = TAB_SEO[currentTab] ?? TAB_SEO.MTR;
  const langKey = language === 'TC' ? 'tc' : 'en';

  const renderContent = () => {
    if (currentTab === 'SETTINGS') return <About />;

    return (
      <StationPicker currentTab={currentTab} />
    );
  };

  return (
    <HelmetProvider>
      <SEO title={tabSeo[langKey].title.replace(/ \| Train\.ETA$/, '')} description={tabSeo[langKey].description} />
      <Header />
      <main className="content">
        {renderContent()}
      </main>
      <FloatingGeoButton />
      <NearbyStationsSheet />
      <BottomNav />
    </HelmetProvider>
  )
}

export default App
