import { Search, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Header() {
    const { language, setLanguage, currentTab, setSearchQuery, searchQuery, selectedStation, setSelectedStation } = useAppStore();
    const isTC = language === 'TC';

    const tabTitles: Record<string, string> = {
        MTR: isTC ? '港鐵' : 'MTR',
        LRT: isTC ? '輕鐵' : 'LRT',
        BUS: isTC ? '巴士' : 'Bus',
        FAV: isTC ? '收藏' : 'Fav',
        SETTINGS: isTC ? '設定' : 'Settings'
    };

    const resolveName = (name: any) => {
        if (!name) return '';
        if (typeof name === 'string') return name;
        return isTC ? name.tc : name.en;
    };

    return (
        <header className="app-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selectedStation ? (
                        <button
                            type="button"
                            aria-label={isTC ? '返回' : 'Back'}
                            onClick={() => setSelectedStation(null)}
                            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', padding: '0.45rem 0.8rem 0.45rem 0.6rem', borderRadius: '13px', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'white', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}
                        >
                            <ChevronLeft size={20} />
                            <span>{isTC ? '返回' : 'Back'}</span>
                        </button>
                    ) : (
                        <h1 className="logo-text">Train.ETA</h1>
                    )}
                    <span style={{ height: '1rem', width: '1px', background: 'rgba(255,255,255,0.1)' }}></span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {selectedStation ? resolveName((selectedStation as any).name) : (tabTitles[currentTab] || currentTab)}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        type="button"
                        aria-label={isTC ? 'Switch to English' : '切換到繁體中文'}
                        onClick={() => setLanguage(language === 'EN' ? 'TC' : 'EN')}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', height: '38px', minWidth: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                        {isTC ? '繁' : 'EN'}
                    </button>
                    {/* Near button removed while geolocation is on hold */}
                </div>
            </div>

            {!selectedStation && (currentTab === 'MTR' || currentTab === 'LRT' || currentTab === 'BUS') && (
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder={
                            currentTab === 'MTR' ? (isTC ? '搜尋港鐵車站' : 'Search MTR Station') :
                                currentTab === 'LRT' ? (isTC ? '搜尋輕鐵路綫/車站' : 'Search LRT Route/Station') :
                                    (isTC ? '搜尋巴士路綫' : 'Search Bus Route')
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem 0.75rem 0.45rem 2.22rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>
            )}
        </header>
    );
}
