import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMTR, fetchLRT, fetchBus, extractBusRoute } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import EtaTable from './EtaTable';
import type { ETA } from '../types/eta';
import { getStationName, getLineColor } from '../constants/mtrData';
import { BUS_STOP_NAMES } from '../constants/busStopNames';
import { QUERY_CONFIG } from '../constants/config';
import { Search } from 'lucide-react';

// Type guards for data structures
const isMTRData = (data: any): data is { up: ETA[], down: ETA[], offline?: boolean, delayed?: boolean, message?: string } => data && 'up' in data && 'down' in data;
const isLRTData = (data: any): data is { platform: string, etas: ETA[] }[] => Array.isArray(data) && data.length > 0 && 'platform' in data[0];

// Enhanced "no match" empty state shown when the active destination filter has no ETAs
function NoMatchCard({ lang }: { lang: 'en' | 'tc' }) {
    const lines = lang === 'tc'
        ? { title: '找不到符合的班次', hint: '請嘗試選擇其他目的地篩選，或稍後再查看。' }
        : { title: 'No matching departures', hint: 'Try selecting a different destination filter, or check back shortly.' };
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            padding: '1.5rem 1rem', marginTop: '0.5rem',
            background: 'var(--glass-bg, rgba(255,255,255,0.06))',
            borderRadius: '0.75rem', border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            textAlign: 'center',
        }}>
            <Search size={32} style={{ color: 'var(--text-muted)', opacity: 0.7 }} />
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary, inherit)' }}>{lines.title}</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '22rem' }}>{lines.hint}</p>
        </div>
    );
}

export default function EtaDisplay({ stationId, stationName, line, mode, onUpdateTime, onRegisterRefetch }: { stationId: string, stationName?: string, line?: string, mode?: string, onUpdateTime?: (t: string | null) => void, onRegisterRefetch?: (fn: () => void) => () => void }) {
    const { currentTab, language, selectedStation } = useAppStore();
    // When a nearby station is clicked from a different tab, use its own mode rather than currentTab
    const effectiveTab = (mode as typeof currentTab) ?? currentTab;
    const [selectedFilterIndex, setSelectedFilterIndex] = useState<number | null>(null);
    const lang = language.toLowerCase() as 'en' | 'tc';
    const refetchRef = useRef<(() => void) | null>(null);
    const onUpdateTimeRef = useRef(onUpdateTime);
    const onRegisterRefetchRef = useRef(onRegisterRefetch);
    // Keep refs in sync without causing extra effects
    onUpdateTimeRef.current = onUpdateTime;
    onRegisterRefetchRef.current = onRegisterRefetch;

    // Helper function to resolve bilingual names
    const resolveName = (name: any): string => {
        if (!name) return '';
        if (typeof name === 'string') return name;
        return lang === 'tc' ? (name.tc || name.en || '') : (name.en || name.tc || '');
    };

    // MTR translation is done client-side, so language does not affect the raw API response.
    // Exclude it from the key to avoid re-fetching (and losing filter state) on every language toggle.
    const queryKey = useMemo(() =>
        effectiveTab === 'MTR'
            ? ['eta', 'MTR', stationId, line].filter(Boolean) as string[]
            : ['eta', effectiveTab, stationId, line, language].filter(Boolean) as string[],
    [effectiveTab, stationId, line, language]);

    const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery<any, Error>({
        queryKey,
        queryFn: () => {
            if (effectiveTab === 'MTR' && line) return fetchMTR(line, stationId);
            if (effectiveTab === 'LRT') return fetchLRT(stationId, language);
            if (effectiveTab === 'BUS') {
                // Extract route name from bus stop ID (e.g. 'K65-D010' → 'K65')
                const busRoute = stationId ? extractBusRoute(stationId, line) : '';
                return fetchBus(busRoute, language);
            }
            throw new Error('Invalid query params');
        },
        refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
        staleTime: QUERY_CONFIG.STALE_TIME,
    });

    const lastUpdated = useMemo(() => {
        if (!dataUpdatedAt) return null;
        return new Date(dataUpdatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }, [dataUpdatedAt]);

    // Keep refetch ref up to date
    useEffect(() => {
        refetchRef.current = () => { try { refetch(); } catch (e) { /* ignore */ } };
    }, [refetch]);

    // Notify parent of time updates via ref (stable, no re-registering)
    useEffect(() => {
        if (onUpdateTimeRef.current) onUpdateTimeRef.current(lastUpdated || null);
    }, [lastUpdated]);

    // Register refetch with parent ONCE on mount only
    useEffect(() => {
        const register = onRegisterRefetchRef.current;
        if (!register) return;
        const unregister = register(() => { if (refetchRef.current) refetchRef.current(); });
        return () => { try { unregister(); } catch (e) { /* ignore */ } };
    }, []); // empty deps - intentional, uses refs internally

    const busDirectionLabel = useMemo(() => {
        if (effectiveTab !== 'BUS' || !stationId) return undefined;
        const match = stationId.match(/^([^-]+)-([A-Z])/);
        if (!match) return undefined;
        const [, route, dir] = match;
        const prefix = `${route}-${dir}`;
        const stops = Object.entries(BUS_STOP_NAMES)
            .filter(([k]) => k.startsWith(prefix))
            .sort(([a], [b]) => a.localeCompare(b));
        if (!stops.length) return undefined;
        const lastName = stops[stops.length - 1][1];
        return lang === 'tc' ? lastName.tc : lastName.en;
    }, [effectiveTab, stationId, lang]);

    const resolvedStationName = useMemo(() => {
        // First, try to get the bilingual name from the store's selectedStation
        if (selectedStation && selectedStation.name) {
            return resolveName(selectedStation.name);
        }
        // Fall back to the prop for bus stops or when no selectedStation
        if (effectiveTab === 'BUS' && stationId) {
            const entry = BUS_STOP_NAMES[stationId];
            if (entry) {
                return lang === 'tc' ? entry.tc : entry.en;
            }
        }
        // Last resort: use the passed-in stationName prop
        return stationName || '';
    }, [selectedStation, effectiveTab, stationId, lang, stationName]);

    const destinations = useMemo(() => {
        if (!data) return [];
        let allDests: string[] = [];

        if (effectiveTab === 'MTR' && isMTRData(data)) {
            // Sort by raw station code for stable order across language switches
            const rawCodes = [...new Set([...data.up, ...data.down].map(e => e.destination))].sort();
            allDests = rawCodes.map(code => getStationName(code, lang));
            return allDests; // already in stable order, skip final .sort()
        } else if (effectiveTab === 'LRT' && isLRTData(data)) {
            allDests = [...new Set(data.flatMap(p => p.etas).map(e => e.destination))];
        } else if (effectiveTab === 'BUS' && Array.isArray(data)) {
            allDests = [...new Set(data.map(e => e.destination))];
        }

        return allDests.sort();
    }, [data, effectiveTab, lang]);

    // ⚠️ ALL hooks must be above any early returns (Rules of Hooks)

    const t = {
        loading: lang === 'tc' ? '載入中...' : 'Loading...',
        noData: lang === 'tc' ? '暫無數據' : 'No data',
        noTrains: lang === 'tc' ? '暫無班次' : 'No upcoming trains',
        noBus: lang === 'tc' ? '暫無巴士班次' : 'No bus schedule',
        noMatch: lang === 'tc' ? '無符合篩選' : 'No matches',
        towards: lang === 'tc' ? '往 ' : 'To ',
        platform: lang === 'tc' ? '月台' : 'Platform',
        atStop: lang === 'tc' ? '此站' : 'at stop',
        noArrivalsAtStop: lang === 'tc' ? '此站暫無班次' : 'No arrivals at this stop',
        all: lang === 'tc' ? '全部' : 'All',
        to: lang === 'tc' ? '往 ' : 'To ',
        lastUpdate: lang === 'tc' ? '更新: ' : 'Upd: '
    };

    if (isLoading) return <div className="glass-card animate-fade-in" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>{t.loading}</div>;
    if (isError) return <div className="glass-card animate-fade-in" style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Error loading data</div>
        <div style={{ fontSize: '0.85rem', color: '#ff6b6b' }}>{(error as Error).message}</div>
        {typeof error?.cause === 'string' && <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#ffa8a8' }}>{error.cause}</div>}
    </div>;

    const renderContent = () => {
        if (!data) {
            console.warn('[EtaDisplay] No data received', { effectiveTab, stationId, line, data });
            return <div style={{ color: 'var(--text-muted)' }}>{t.noData}</div>;
        }

        if (effectiveTab === 'MTR' && isMTRData(data)) {
            // Show offline/no-service state more gracefully than a red error card
            if (data.offline) {
                return (
                    <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                            {lang === 'tc' ? '🚇 服務暫停' : '🚇 Service Not Available'}
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                            {lang === 'tc' ? '港鐵服務暫未開始' : 'MTR service is not currently in operation'}
                        </div>
                    </div>
                );
            }
            const currentColor = line ? getLineColor(line) : 'var(--mtr-color)';
            const delayBanner = data.delayed ? (
                <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '8px', padding: '0.5rem 0.85rem', marginBottom: '0.5rem', fontSize: '0.82rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ⚠️ {lang === 'tc' ? '服務延誤' : 'Service delay in progress'}
                </div>
            ) : null;
            const selectedDest = selectedFilterIndex !== null ? destinations[selectedFilterIndex] : null;

            // Translate all ETAs — don't filter yet, so we can keep both blocks in the DOM
            const translateAll = (etas: ETA[]) =>
                etas.map(eta => ({ ...eta, destination: getStationName(eta.destination, lang) }));

            const allUp = translateAll(data.up);
            const allDown = translateAll(data.down);

            const filteredUp = selectedDest ? allUp.filter(e => e.destination === selectedDest) : allUp;
            const filteredDown = selectedDest ? allDown.filter(e => e.destination === selectedDest) : allDown;

            // A section is "shown" when it has data AND passes the filter
            const showUp = allUp.length > 0 && (!selectedDest || filteredUp.length > 0);
            const showDown = allDown.length > 0 && (!selectedDest || filteredDown.length > 0);

            // Titles derived from the full directional set (not the filtered subset)
            const upDests = [...new Set(allUp.map(e => e.destination))];
            const downDests = [...new Set(allDown.map(e => e.destination))];
            const upTitle = upDests.length > 0 ? `${t.towards}${upDests.join(' / ')}` : '';
            const downTitle = downDests.length > 0 ? `${t.towards}${downDests.join(' / ')}` : '';

            const noResults = !showUp && !showDown && selectedDest !== null;
            const noTrainsAtAll = allUp.length === 0 && allDown.length === 0;

            return (
                <div className="animate-fade-in">
                    {delayBanner}
                    {/* Both sections stay in the DOM so CSS max-height transition plays on collapse */}
                    {noTrainsAtAll ? (
                        <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noTrains}</div>
                    ) : (
                        <>
                        <div className={`eta-section ${showUp ? 'expanded' : 'collapsed'}`}>
                            <div className="eta-section-inner">
                                <EtaTable title={upTitle} etas={showUp ? filteredUp : allUp} trackColor={currentColor} />
                            </div>
                        </div>
                        <div className={`eta-section ${showDown ? 'expanded' : 'collapsed'}`}>
                            <div className="eta-section-inner">
                                <EtaTable title={downTitle} etas={showDown ? filteredDown : allDown} trackColor={currentColor} />
                            </div>
                        </div>
                        {noResults && <NoMatchCard lang={lang} />}
                        </>
                    )}
                </div>
            );
        }

        if (effectiveTab === 'LRT' && Array.isArray(data)) {
            if (data.length === 0) return <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noTrains}</div>;
            
            const selectedDest = selectedFilterIndex !== null ? destinations[selectedFilterIndex] : null;

            const filteredData = (data as any[]).map(plat => ({
                ...plat,
                etas: (plat.etas || []).filter((e: any) => !selectedDest || e.destination === selectedDest)
            })).filter(plat => plat.etas.length > 0);

            if (filteredData.length === 0) return <NoMatchCard lang={lang} />;

            return (
                <div className="animate-fade-in">
                    {filteredData.map((plat) => (
                        <EtaTable key={`plat-${plat.platform}`} title={`${t.platform} ${plat.platform}`} etas={plat.etas} trackColor="var(--lrt-color)" />
                    ))}
                </div>
            );
        }

        if (effectiveTab === 'BUS' && Array.isArray(data)) {
            if (data.length === 0) return <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noBus}</div>;

            const normalizeStopId = (id?: string) => (String(id || '').replace(/-n(?=[A-Z0-9])/i, '-')).toUpperCase();

            const filteredBusEtas = data
                .filter((eta: any) => normalizeStopId(eta.stopId) === normalizeStopId(stationId))
                .slice(0, 5);

            if (filteredBusEtas.length === 0) return <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noArrivalsAtStop}</div>;
            const liveDestinations = [...new Set(filteredBusEtas.map((eta: any) => eta.destination).filter(Boolean))];
            const routeCode = (extractBusRoute(stationId, line) || '').trim().toUpperCase();
            const meaningfulLiveDestinations = liveDestinations.filter(dest => String(dest).trim().toUpperCase() !== routeCode);
            const liveDestinationLabel = meaningfulLiveDestinations.length > 0 ? meaningfulLiveDestinations.join(' / ') : undefined;
            const effectiveDestination = liveDestinationLabel || busDirectionLabel;
            const tableTitle = effectiveDestination
                ? `${lang === 'tc' ? '往 ' : 'To '}${effectiveDestination}`
                : (resolvedStationName || stationId);
            return <EtaTable title={tableTitle} etas={filteredBusEtas} trackColor="var(--bus-color)" />;
        }

        return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>{lang === 'tc' ? '解析數據中...' : 'Parsing data...'}</div>;
    };

    return (
        <div style={{ marginTop: '0.15rem' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '0.4rem' }}>
                <div
                    className="filter-container"
                    style={{
                        flex: 1,
                        padding: 0,
                        marginBottom: 0,
                        gap: '0.3rem',
                    }}
                >
                    {destinations.length > 1 && (
                        <>
                            <button
                                className={`filter-pill ${selectedFilterIndex === null ? 'active' : ''}`}
                                onClick={() => setSelectedFilterIndex(null)}
                            >
                                {t.all}
                            </button>
                            {destinations.map((dest, index) => (
                                <button
                                    key={`${index}-${dest}`}
                                    className={`filter-pill ${selectedFilterIndex === index ? 'active' : ''}`}
                                    onClick={() => setSelectedFilterIndex(index)}
                                >
                                    {t.to}{dest}
                                </button>
                            ))}
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    {/* refresh button removed here; station-level refresh exists in header */}
                </div>
            </div>

            {renderContent()}
        </div>
    );
}
