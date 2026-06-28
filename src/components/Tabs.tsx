import { Train, Bus, Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { TabId } from '../store/useAppStore';
import type { TransportMode } from '../types/eta';
import type { IconComp } from '../types/ui';
import MtrIcon from './icons/MtrIcon';
import AboutIcon from './icons/AboutIcon';

export default function Tabs() {
    const { currentTab, setTab, language, favoriteStations } = useAppStore();
    const isTC = language === 'TC';

    const tabs: { id: TabId; label: string; icon: IconComp; color: string }[] = [
        { id: 'MTR', label: isTC ? '港鐵' : 'MTR', icon: MtrIcon, color: 'var(--mtr-color)' },
        { id: 'LRT', label: isTC ? '輕鐵' : 'Light Rail', icon: Train, color: 'var(--lrt-color)' },
        { id: 'BUS', label: isTC ? '巴士' : 'MTR Bus', icon: Bus, color: 'var(--bus-color)' },
        { id: 'FAV', label: isTC ? '收藏' : 'Fav', icon: Star, color: '#f59e0b' },
        { id: 'SETTINGS', label: isTC ? '更多' : 'More', icon: AboutIcon, color: 'var(--text-muted)' },
    ];

    return (
        <nav className="bottom-nav">
            {tabs.map(tab => {
                const isActive = currentTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        className={`nav-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setTab(tab.id as TransportMode)}
                        style={{
                            color: isActive ? tab.color : 'var(--text-muted)'
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Icon size={20} className="nav-icon" />
                            {tab.id === 'FAV' && favoriteStations.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-4px', right: '-6px',
                                    fontSize: '0.6rem', fontWeight: 700, lineHeight: 1,
                                    background: tab.color, color: '#000', borderRadius: '50%',
                                    width: '14px', height: '14px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {favoriteStations.length}
                                </span>
                            )}
                        </div>
                        <span className="nav-label">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
