import Header from './components/Header';
import BottomNav from './components/Tabs';
import StationPicker from './components/StationPicker';
import About from './components/About';
import FloatingGeoButton from './components/FloatingGeoButton';
import NearbyStationsSheet from './components/NearbyStationsSheet';
import { useAppStore } from './store/useAppStore';
import './App.css';

function App() {
  const { currentTab } = useAppStore();

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


