import { useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/Tabs';
import StationPicker from './components/StationPicker';
import About from './components/About';
import FloatingGeoButton from './components/FloatingGeoButton';
import NearbyStationsSheet from './components/NearbyStationsSheet';
import { useAppStore } from './store/useAppStore';
import './App.css';

const FONT_SIZE_MAP: Record<string, string> = {
  small: '14px',
  default: '16px',
  large: '18px',
};

function App() {
  const { currentTab, fontSize } = useAppStore();

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize];
  }, [fontSize]);

  const renderContent = () => {
    if (currentTab === 'SETTINGS') return <About />;

    return (
      <StationPicker currentTab={currentTab} />
    );
  };

  return (
    <>
      <Header />
      <main className="content">
        {renderContent()}
      </main>
      <FloatingGeoButton />
      <NearbyStationsSheet />
      <BottomNav />
    </>
  )
}

export default App


