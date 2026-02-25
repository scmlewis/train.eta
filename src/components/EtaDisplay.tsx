import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMTR, fetchLRT, fetchBus } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import EtaTable from './EtaTable';
import type { ETA } from '../types/eta';
import { getStationName, getLineColor } from '../constants/mtrData';
import { BUS_STOP_NAMES } from '../constants/busStopNames';

// Type guards for data structures
const isMTRData = (data: any): data is { up: ETA[], down: ETA[] } => data && 'up' in data && 'down' in data;
const isLRTData = (data: any): data is { platform: string, etas: ETA[] }[] => Array.isArray(data) && data.length > 0 && 'platform' in data[0];

export default function EtaDisplay({ stationId, stationName, line, onUpdateTime, onRegisterRefetch }: { stationId: string, stationName?: string, line?: string, onUpdateTime?: (t: string | null) => void, onRegisterRefetch?: (fn: () => void) => () => void }) {
    const { currentTab, language, selectedStation } = useAppStore();
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

    const queryKey = ['eta', currentTab, stationId, line, language].filter(Boolean) as string[];

    const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery<any, Error>({
        queryKey,
        queryFn: () => {
            if (currentTab === 'MTR' && line) return fetchMTR(line, stationId);
            if (currentTab === 'LRT') return fetchLRT(stationId, language);
            if (currentTab === 'BUS') {
                // Extract route name from bus stop ID (e.g., 'K65-D010' → 'K65')
                const busRoute = line || (stationId ? stationId.split('-')[0] : '');
                return fetchBus(busRoute, language);
            }
            throw new Error('Invalid query params');
        },
        refetchInterval: 30000,
        staleTime: 15000,
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
        if (currentTab !== 'BUS' || !stationId) return undefined;
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
    }, [currentTab, stationId, lang]);

    const resolvedStationName = useMemo(() => {
        // First, try to get the bilingual name from the store's selectedStation
        if (selectedStation && selectedStation.name) {
            return resolveName(selectedStation.name);
        }
        // Fall back to the prop for bus stops or when no selectedStation
        if (currentTab === 'BUS' && stationId) {
            const entry = BUS_STOP_NAMES[stationId];
            if (entry) {
                return lang === 'tc' ? entry.tc : entry.en;
            }
        }
        // Last resort: use the passed-in stationName prop
        return stationName || '';
    }, [selectedStation, currentTab, stationId, lang, stationName]);

    const destinations = useMemo(() => {
        if (!data) return [];
        let allDests: string[] = [];

        if (currentTab === 'MTR' && isMTRData(data)) {
            allDests = [...new Set([...data.up, ...data.down].map(e => getStationName(e.destination, lang)))];
        } else if (currentTab === 'LRT' && isLRTData(data)) {
            allDests = [...new Set(data.flatMap(p => p.etas).map(e => e.destination))];
        } else if (currentTab === 'BUS' && Array.isArray(data)) {
            allDests = [...new Set(data.map(e => e.destination))];
        }

        return allDests.sort();
    }, [data, currentTab, lang]);

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

    useEffect(() => {
        setSelectedFilterIndex(null);
    }, [language]);

    const renderContent = () => {
        if (!data) {
            console.warn('[EtaDisplay] No data received', { currentTab, stationId, line, data });
            return <div style={{ color: 'var(--text-muted)' }}>{t.noData}</div>;
        }

        if (currentTab === 'MTR' && isMTRData(data)) {
            const currentColor = line ? getLineColor(line) : 'var(--mtr-color)';
            const selectedDest = selectedFilterIndex !== null ? destinations[selectedFilterIndex] : null;

            const mapAndFilter = (etas: ETA[]) => etas
                .map(eta => ({ ...eta, destination: getStationName(eta.destination, lang) }))
                .filter(eta => !selectedDest || eta.destination === selectedDest);

            const filteredUp = mapAndFilter(data.up);
            const filteredDown = mapAndFilter(data.down);

            const upDestinations = [...new Set(filteredUp.map(e => e.destination))];
            const downDestinations = [...new Set(filteredDown.map(e => e.destination))];

            const upTitle = upDestinations.length > 0 ? `${t.towards}${upDestinations.join(' / ')}` : null;
            const downTitle = downDestinations.length > 0 ? `${t.towards}${downDestinations.join(' / ')}` : null;

            return (
                <div className="animate-fade-in">
                    {filteredUp.length > 0 && (
                        <EtaTable
                            title={upTitle || ''}
                            etas={filteredUp}
                            trackColor={currentColor}
                        />
                    )}
                    {filteredDown.length > 0 && (
                        <EtaTable
                            title={downTitle || ''}
                            etas={filteredDown}
                            trackColor={currentColor}
                        />
                    )}
                    {filteredUp.length === 0 && filteredDown.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noMatch}</div>
                    )}
                </div>
            );
        }

        if (currentTab === 'LRT' && Array.isArray(data)) {
            if (data.length === 0) return <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noTrains}</div>;
            
            const selectedDest = selectedFilterIndex !== null ? destinations[selectedFilterIndex] : null;

            const filteredData = (data as any[]).map(plat => ({
                ...plat,
                etas: (plat.etas || []).filter((e: any) => !selectedDest || e.destination === selectedDest)
            })).filter(plat => plat.etas.length > 0);

            if (filteredData.length === 0) return <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noMatch}</div>;

            return (
                <div className="animate-fade-in">
                    {filteredData.map((plat) => (
                        <EtaTable key={`plat-${plat.platform}`} title={`${t.platform} ${plat.platform}`} etas={plat.etas} trackColor="var(--lrt-color)" />
                    ))}
                </div>
            );
        }

        if (currentTab === 'BUS' && Array.isArray(data)) {
            if (data.length === 0) return <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noBus}</div>;

            const normalizeStopId = (id?: string) => (String(id || '').replace(/-n(?=[A-Z0-9])/i, '-')).toUpperCase();

            const filteredBusEtas = data
                .filter((eta: any) => normalizeStopId(eta.stopId) === normalizeStopId(stationId))
                .slice(0, 5);

            if (filteredBusEtas.length === 0) return <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>{t.noArrivalsAtStop}</div>;
            const tableTitle = busDirectionLabel
                ? `${lang === 'tc' ? '往 ' : 'To '}${busDirectionLabel}`
                : (resolvedStationName || stationId);
            return <EtaTable title={tableTitle} etas={filteredBusEtas} trackColor="var(--bus-color)" />;
        }

        return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>{lang === 'tc' ? '解析數據中...' : 'Parsing data...'}</div>;
    };

    return (
        <div style={{ marginTop: '0.15rem' }}>
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
