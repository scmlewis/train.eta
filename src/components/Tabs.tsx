import { Building2, Train, Bus, Settings } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { TabId } from '../store/useAppStore';
import type { TransportMode } from '../types/eta';

export default function Tabs() {
    const { currentTab, setTab, language } = useAppStore();
    const isTC = language === 'TC';

    const tabs: { id: TabId; label: string; icon: any; color: string }[] = [
        { id: 'MTR', label: isTC ? '港鐵' : 'MTR', icon: Building2, color: 'var(--mtr-color)' },
        { id: 'LRT', label: isTC ? '輕鐵' : 'Light Rail', icon: Train, color: 'var(--lrt-color)' },
        { id: 'BUS', label: isTC ? '巴士' : 'MTR Bus', icon: Bus, color: 'var(--bus-color)' },
        { id: 'SETTINGS', label: isTC ? '關於' : 'About', icon: Settings, color: '#94a3b8' },
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
                        <Icon size={20} className="nav-icon" />
                        <span className="nav-label">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
