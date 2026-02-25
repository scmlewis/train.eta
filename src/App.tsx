import Header from './components/Header';
import BottomNav from './components/Tabs';
import StationPicker from './components/StationPicker';
import About from './components/About';
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
      <BottomNav />
    </>
  )
}

export default App


