import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, RotateCw, Search, MapPin } from 'lucide-react';
import { MTR_LINE_GROUPS, LRT_GROUPS, BUS_GROUPS } from '../constants/transportData';
import { BUS_STOP_NAMES } from '../constants/busStopNames';
import type { StationOption, TransportGroup } from '../constants/transportData';
import { useAppStore } from '../store/useAppStore';
import EtaDisplay from './EtaDisplay';
import NearbyStations from './NearbyStations';
import { fetchRouteStops } from '../services/busStops';
import { scrollToElement, scrollToTop, setHeaderHeightVar } from '../utils/scroll';

// Routes verified as circular from MTR HK website
// For circular routes, all stops from all directions are merged and shown together
const CIRCULAR_BUS_ROUTES = new Set(['K53', 'K54', 'K68', 'K74', 'K75P', 'K53S', 'K75S', 'K75A', 'K76', '506']);

type BusDisplayGroup = TransportGroup & {
    routeCode?: string;
    directionCode?: string;
    isCircularRoute?: boolean;
};

function buildBusDirectionGroups(baseGroups: TransportGroup[]): BusDisplayGroup[] {
    const sortedBase = [...baseGroups].sort((a, b) => {
        const aa = String(a.groupName);
        const bb = String(b.groupName);
        return aa.localeCompare(bb, undefined, { numeric: true, sensitivity: 'base' });
    });

    const output: BusDisplayGroup[] = [];

    for (const group of sortedBase) {
        const routeCode = String(group.groupName);
        const prefix = `${routeCode}-`;
        const byDir: Record<string, StationOption[]> = {};

        for (const [id, name] of Object.entries(BUS_STOP_NAMES)) {
            if (!id.startsWith(prefix)) continue;
            const dirMatch = id.match(/-([A-Z])\d/);
            if (!dirMatch) continue;
            const dir = dirMatch[1];
            if (!byDir[dir]) byDir[dir] = [];
            byDir[dir].push({ id, name } as StationOption);
        }

        Object.values(byDir).forEach(stops =>
            stops.sort((a, b) => String(a.id).localeCompare(String(b.id)))
        );

        const descText = typeof group.desc === 'string'
            ? group.desc
            : `${group.desc?.en || ''} ${group.desc?.tc || ''}`;
        const isCircularRoute = CIRCULAR_BUS_ROUTES.has(routeCode) || /circular|循環/i.test(descText);

        const dirs = Object.keys(byDir).sort();
        if (dirs.length === 0) {
            output.push({ ...group, routeCode, isCircularRoute });
            continue;
        }

        if (isCircularRoute) {
            // For circular routes, show complete cycle with U direction first when available.
            const primaryDir = Object.keys(byDir).includes('U') ? 'U' : (Object.keys(byDir).includes('D') ? 'D' : Object.keys(byDir)[0]);
            const secondaryDir = Object.keys(byDir).find(d => d !== primaryDir) || primaryDir;
            
            const mergedStopsRaw: StationOption[] = [];

            const getStopName = (stop: StationOption): string => {
                if (typeof stop.name === 'string') return stop.name;
                return stop.name.tc || stop.name.en || '';
            };

            const collapseConsecutiveSameName = (stops: StationOption[]): StationOption[] => {
                const result: StationOption[] = [];
                for (const stop of stops) {
                    const prev = result[result.length - 1];
                    if (!prev || getStopName(prev) !== getStopName(stop)) {
                        result.push(stop);
                    }
                }
                return result;
            };
            
            // Add all stops from primary direction
            if (byDir[primaryDir]) {
                mergedStopsRaw.push(...byDir[primaryDir]);
            }
            
            // Add all stops from secondary direction (no deduplication to show full cycle)
            if (byDir[secondaryDir] && secondaryDir !== primaryDir) {
                mergedStopsRaw.push(...byDir[secondaryDir]);
            }

            const mergedStops = collapseConsecutiveSameName(mergedStopsRaw);
            
            // Close the loop by adding the first stop again (if there are stops)
            if (mergedStops.length > 0) {
                mergedStops.push(mergedStops[0]);
            }
            
            output.push({
                ...group,
                routeCode,
                directionCode: undefined,
                isCircularRoute: true,
                groupName: { en: `${routeCode} · Circular Route`, tc: `${routeCode} · 循環線` },
                desc: undefined,
                stations: mergedStops
            });
            continue;
        }

        for (const dir of dirs) {
            const stops = byDir[dir];
            const endpoint = (stops[stops.length - 1]?.name || { en: `Direction ${dir}`, tc: `方向 ${dir}` }) as any;
            output.push({
                ...group,
                routeCode,
                directionCode: dir,
                isCircularRoute: false,
                groupName: {
                    en: `${routeCode} · To ${endpoint.en || `Direction ${dir}`}`,
                    tc: `${routeCode} · 往 ${endpoint.tc || `方向 ${dir}`}`
                },
                desc: undefined,
                stations: stops
            });
        }
    }

    return output;
}

export default function StationList({ currentTab }: { currentTab: string }) {
    const { language, searchQuery, setSearchQuery, selectedStation, setSelectedStation, returnAnchorGroupKey, setReturnAnchorGroupKey, nearbyStations } = useAppStore();
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [stationLastUpdated, setStationLastUpdated] = useState<string | null>(null);
    const refetchersRef = useRef<Array<() => void>>([]);
    const [dynamicStops, setDynamicStops] = useState<Record<string, { byDir?: Record<string, StationOption[]>, directionInfo?: Record<string, any>, stations?: StationOption[] }>>({});
    const [openDirections, setOpenDirections] = useState<Record<string, Set<string>>>({});
    const groupHeaderRefs = useRef<Record<string, HTMLElement | null>>({});
    const directionHeaderRefs = useRef<Record<string, HTMLElement | null>>({});
    const cardRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        // ensure CSS var for header height is set and kept in sync on resize
        setHeaderHeightVar();
        window.addEventListener('resize', setHeaderHeightVar);
        return () => { window.removeEventListener('resize', setHeaderHeightVar); };
    }, []);

    const forceScrollTop = useCallback(() => {
        scrollToTop('auto');
    }, []);

    // FEATURE 1: Language-independent key for group state
    // Ensures expanded groups persist when switching languages
    const getGroupKey = (groupName: any): string => {
        if (typeof groupName === 'string') return groupName;
        return JSON.stringify(groupName);
    };

    const toggleDirection = (routeKey: string, dir: string) => {
        setOpenDirections(prev => {
            const dirs = prev[routeKey] || new Set();
            const updated = new Set(dirs);
            if (searchQuery.trim()) {
                if (updated.has(dir)) updated.delete(dir); else updated.add(dir);
                return { ...prev, [routeKey]: updated };
            } else {
                if (updated.has(dir)) return { ...prev, [routeKey]: new Set() };
                return { ...prev, [routeKey]: new Set([dir]) };
            }
        });
        // scroll to the newly toggled direction header (helper will retry if layout isn't ready)
        // wait for expand/collapse animation to complete (0.3s) then scroll
        setTimeout(() => {
            scrollToElement(directionHeaderRefs.current[dir], { behavior: 'smooth' });
        }, 350);
    };

    useEffect(() => {
        setSelectedStation(null);
        setSearchQuery('');
        setExpandedGroup(null);
    }, [currentTab, setSearchQuery, setSelectedStation]);

    const resolveName = (name: any) => {
        if (!name) return '';
        if (typeof name === 'string') return name;
        return language === 'TC' ? name.tc : name.en;
    };

    const getGroups = () => {
        if (currentTab === 'MTR') return MTR_LINE_GROUPS;
        if (currentTab === 'LRT') return LRT_GROUPS;
        if (currentTab === 'BUS') {
            return buildBusDirectionGroups(BUS_GROUPS);
        }
        return [];
    };

    const groups = getGroups();

    const getFilteredGroups = () => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return groups;

        return groups.map((g: any) => {
            return {
                ...g,
                stations: g.stations.filter((s: any) => {
                    const name = s.name;
                    const matchesName = typeof name === 'string'
                        ? name.toLowerCase().includes(query)
                        : (name.en.toLowerCase().includes(query) || (name.tc && name.tc.includes(query)));
                    return matchesName || s.id.toLowerCase().includes(query);
                })
            };
        }).filter((g: any) => g.stations.length > 0);
    };

    const filteredGroups = getFilteredGroups();

    useEffect(() => {
        if (!searchQuery.trim()) {
            setExpandedGroup(null);
        }
    }, [searchQuery, filteredGroups.length]);

    useEffect(() => {
        if (!expandedGroup) return;
        if (currentTab !== 'BUS') return;
        const grp = groups.find((g: any) => getGroupKey(g.groupName) === expandedGroup) as BusDisplayGroup | undefined;
        if (!grp) return;
        const routeKey = grp.routeCode || (typeof grp.groupName === 'string' ? grp.groupName : (grp.groupName.en || grp.groupName.tc || resolveName(grp.groupName)));
        const directionCode = grp.directionCode as string | undefined;
        const isCircularRouteFromGroup = !!grp.isCircularRoute;
        const groupDesc = grp.desc;
        const descText = typeof groupDesc === 'string' ? groupDesc : `${groupDesc?.en || ''} ${groupDesc?.tc || ''}`;
        const isCircularRoute = isCircularRouteFromGroup || CIRCULAR_BUS_ROUTES.has(routeKey) || /circular|循環/i.test(descText);
        const storageKey = `${routeKey}:${directionCode || 'ALL'}`;
        if (dynamicStops[storageKey]) return;

        const buildStaticStops = () => {
            const prefix = routeKey + '-';
            const allByDir: Record<string, StationOption[]> = {};
            const dirInfo: Record<string, any> = {};

            for (const [id, names] of Object.entries(BUS_STOP_NAMES)) {
                if (!id.startsWith(prefix)) continue;
                const dirMatch = id.match(/-([A-Z])\d/);
                if (!dirMatch) continue;
                const dir = dirMatch[1];
                if (!allByDir[dir]) allByDir[dir] = [];
                allByDir[dir].push({ id, name: names } as StationOption);
            }

            Object.values(allByDir).forEach(stops =>
                stops.sort((a, b) => String(a.id).localeCompare(String(b.id)))
            );

            // For circular routes, merge all stops preserving route sequence
            if (isCircularRoute && !directionCode) {
                // Use U direction first for circular readability, then the other direction, then close loop.
                const primaryDir = allByDir.U ? 'U' : (allByDir.D ? 'D' : (Object.keys(allByDir)[0] || 'D'));
                const secondaryDir = Object.keys(allByDir).find(d => d !== primaryDir) || primaryDir;

                const mergedRaw: StationOption[] = [];
                if (allByDir[primaryDir]) mergedRaw.push(...allByDir[primaryDir]);
                if (secondaryDir !== primaryDir && allByDir[secondaryDir]) mergedRaw.push(...allByDir[secondaryDir]);

                const getStopName = (stop: StationOption): string => {
                    if (typeof stop.name === 'string') return stop.name;
                    return stop.name.tc || stop.name.en || '';
                };

                const mergedStops: StationOption[] = [];
                for (const stop of mergedRaw) {
                    const prev = mergedStops[mergedStops.length - 1];
                    if (!prev || getStopName(prev) !== getStopName(stop)) {
                        mergedStops.push(stop);
                    }
                }

                if (mergedStops.length > 0) {
                    mergedStops.push(mergedStops[0]);
                }
                
                Object.keys(allByDir).forEach(k => delete allByDir[k]);
                allByDir['merged'] = mergedStops;
                dirInfo['merged'] = {
                    dir: 'merged',
                    endpointEn: '',
                    endpointTc: ''
                };
            } else {
                for (const [dir, stops] of Object.entries(allByDir)) {
                    const lastStop = stops[stops.length - 1];
                    const name = lastStop?.name as any;
                    dirInfo[dir] = {
                        dir,
                        endpointEn: typeof name === 'string' ? name : (name?.en ?? `Direction ${dir}`),
                        endpointTc: typeof name === 'string' ? name : (name?.tc ?? `方向 ${dir}`),
                    };
                }
            }

            if (directionCode && allByDir[directionCode]) {
                const keep = allByDir[directionCode];
                const keepInfo = dirInfo[directionCode];
                Object.keys(allByDir).forEach(k => delete allByDir[k]);
                Object.keys(dirInfo).forEach(k => delete dirInfo[k]);
                allByDir[directionCode] = keep;
                dirInfo[directionCode] = keepInfo;
            }

            return { byDir: allByDir, directionInfo: dirInfo };
        };

        const staticStops = buildStaticStops();
        
        // For circular routes, the merged stops are already in byDir['merged']
        let staticStations: StationOption[] | undefined = undefined;
        if (isCircularRoute && staticStops.byDir['merged']) {
            staticStations = staticStops.byDir['merged'];
        }
        
        setDynamicStops(prev => ({ ...prev, [storageKey]: { byDir: staticStops.byDir, directionInfo: staticStops.directionInfo, stations: staticStations } }));

        let cancelled = false;
        (async () => {
            try {
                const live = await fetchRouteStops(routeKey, language);
                if (cancelled) return;

                const allByDir: Record<string, StationOption[]> = Object.fromEntries(
                    Object.entries(staticStops.byDir).map(([dir, stops]) => [dir, [...stops]])
                );
                const dirInfo: Record<string, any> = {};

                for (const [dir, payload] of Object.entries(live.byDir || {})) {
                    const mappedStops = (payload.stops || []).map((s: any) => {
                        const name = BUS_STOP_NAMES[s.id] || { en: s.id, tc: s.id };
                        return { id: s.id, name } as StationOption;
                    });
                    if (!mappedStops.length) continue;

                    if (!allByDir[dir]) allByDir[dir] = [];
                    const existingIds = new Set(allByDir[dir].map(s => s.id));
                    for (const stop of mappedStops) {
                        if (!existingIds.has(stop.id)) {
                            allByDir[dir].push(stop);
                            existingIds.add(stop.id);
                        }
                    }

                    allByDir[dir].sort((a, b) => String(a.id).localeCompare(String(b.id)));
                }

                const groupDesc = grp.desc;
                const descText = typeof groupDesc === 'string'
                    ? groupDesc
                    : `${groupDesc?.en || ''} ${groupDesc?.tc || ''}`;
                const isCircularRoute = isCircularRouteFromGroup || CIRCULAR_BUS_ROUTES.has(routeKey) || /circular|循環/i.test(descText);
                
                // For circular routes, merge all directions preserving route sequence
                if (isCircularRoute && !directionCode) {
                    // Determine primary direction - prefer U first for circular route readability.
                    const allLiveByDir = live.byDir || {};
                    const allStaticByDir = staticStops.byDir || {};
                    const allDirs = new Set([...Object.keys(allLiveByDir), ...Object.keys(allStaticByDir)]);
                    const primaryDir = allDirs.has('U') ? 'U' : (allDirs.has('D') ? 'D' : (Array.from(allDirs)[0] || 'D'));
                    const secondaryDir = Array.from(allDirs).find(d => d !== primaryDir) || primaryDir;
                    
                    // Build merged list: show complete cycle (primary + secondary + loop back to start)
                    // For circular routes, no deduplication between directions - show the full path
                    const mergedStopsRaw: StationOption[] = [];

                    const getStopName = (stop: StationOption): string => {
                        if (typeof stop.name === 'string') return stop.name;
                        return stop.name.tc || stop.name.en || '';
                    };

                    const collapseConsecutiveSameName = (stops: StationOption[]): StationOption[] => {
                        const result: StationOption[] = [];
                        for (const stop of stops) {
                            const prev = result[result.length - 1];
                            if (!prev || getStopName(prev) !== getStopName(stop)) {
                                result.push(stop);
                            }
                        }
                        return result;
                    };
                    
                    // Add all stops from primary direction (live takes precedence over static)
                    const primaryLivePayload = allLiveByDir[primaryDir];
                    if (primaryLivePayload?.stops) {
                        for (const s of primaryLivePayload.stops) {
                            const name = BUS_STOP_NAMES[s.id] || { en: s.id, tc: s.id };
                            mergedStopsRaw.push({ id: s.id, name } as StationOption);
                        }
                    } else if (staticStops.byDir[primaryDir]) {
                        mergedStopsRaw.push(...staticStops.byDir[primaryDir]);
                    }
                    
                    // Add all stops from secondary direction (no deduplication to show full cycle)
                    const secondaryLivePayload = allLiveByDir[secondaryDir];
                    if (secondaryDir !== primaryDir) {
                        if (secondaryLivePayload?.stops) {
                            for (const s of secondaryLivePayload.stops) {
                                const name = BUS_STOP_NAMES[s.id] || { en: s.id, tc: s.id };
                                mergedStopsRaw.push({ id: s.id, name } as StationOption);
                            }
                        } else if (staticStops.byDir[secondaryDir]) {
                            mergedStopsRaw.push(...staticStops.byDir[secondaryDir]);
                        }
                    }

                    const mergedStops = collapseConsecutiveSameName(mergedStopsRaw);
                    
                    // Close the loop by adding the first stop again
                    if (mergedStops.length > 0) {
                        mergedStops.push(mergedStops[0]);
                    }
                    
                    // Store as single flat list without direction grouping
                    Object.keys(allByDir).forEach(k => delete allByDir[k]);
                    allByDir['merged'] = mergedStops;
                    Object.keys(dirInfo).forEach(k => delete dirInfo[k]);
                    dirInfo['merged'] = {
                        dir: 'merged',
                        endpointEn: '',
                        endpointTc: ''
                    };
                }

                if (directionCode && allByDir[directionCode]) {
                    const keep = allByDir[directionCode];
                    Object.keys(allByDir).forEach(k => delete allByDir[k]);
                    allByDir[directionCode] = keep;
                }

                for (const [dir, stops] of Object.entries(allByDir)) {
                    const lastStop = stops[stops.length - 1];
                    const name = lastStop?.name as any;
                    dirInfo[dir] = {
                        dir,
                        endpointEn: typeof name === 'string' ? name : (name?.en ?? `Direction ${dir}`),
                        endpointTc: typeof name === 'string' ? name : (name?.tc ?? `方向 ${dir}`),
                    };
                }

                setDynamicStops(prev => ({ ...prev, [storageKey]: { byDir: allByDir, directionInfo: dirInfo, stations: isCircularRoute && allByDir['merged'] ? allByDir['merged'] : undefined } }));
            } catch {
                // keep static stops already shown
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [expandedGroup, currentTab, groups, dynamicStops, language]);

    useEffect(() => {
        setStationLastUpdated(null);
    }, [selectedStation]);

    useEffect(() => {
        if (!selectedStation) return;
        forceScrollTop();
    }, [selectedStation, forceScrollTop]);

    useEffect(() => {
        if (selectedStation) return;
        if (!returnAnchorGroupKey) return;

        setExpandedGroup(returnAnchorGroupKey);
        // allow expansion to render and complete animation, then scroll; helper will retry if needed
        setTimeout(() => {
            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
            const cardEl = cardRefs.current[returnAnchorGroupKey];
            scrollToElement(cardEl, { behavior: 'smooth' }).then(() => {
                setReturnAnchorGroupKey(null);
            });
        }, 360);
    }, [selectedStation, returnAnchorGroupKey, setReturnAnchorGroupKey]);

    useEffect(() => {
        if (!expandedGroup) {
            setOpenDirections({});
        }
    }, [expandedGroup]);

    const registerRefetch = useCallback((fn: () => void) => {
        refetchersRef.current = [...refetchersRef.current, fn];
        return () => { refetchersRef.current = refetchersRef.current.filter(f => f !== fn); };
    }, []);

    // Resolve a station's display name respecting TC and the nameTc field (set by geolocation)
    const resolveStationName = (station: any) => {
        if (language === 'TC' && station.nameTc) return station.nameTc;
        return resolveName(station.name);
    };

    if (selectedStation) {
        const station = selectedStation as any;
        return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', margin: '0.4rem 0' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{resolveStationName(station)}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {stationLastUpdated && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{(language === 'TC' ? '更新: ' : 'Last Updated: ')}{stationLastUpdated}</span>}
                        <button
                            className="refresh-btn"
                            onClick={() => { refetchersRef.current.forEach(fn => { try { fn(); } catch (e) {} }); }}
                            style={{ width: '38px', height: '38px', borderRadius: '12px' }}
                        >
                            <RotateCw size={18} />
                        </button>
                    </div>
                </div>
                <EtaDisplay
                    key={`${station.mode || currentTab}-${station.id}`}
                    stationId={station.id}
                    stationName={resolveStationName(station)}
                    line={station.line || station.group}
                    mode={station.mode}
                    onUpdateTime={setStationLastUpdated}
                    onRegisterRefetch={registerRefetch}
                />
            </div>
        );
    }

    return (
        <div role="listbox" className="accordion-list animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* Nearby stations pinned section — filtered to current tab's mode only */}
            {nearbyStations && !searchQuery.trim() && (() => {
                const isTransportTab = currentTab === 'MTR' || currentTab === 'LRT' || currentTab === 'BUS';
                if (!isTransportTab) return null;
                const modeArr = nearbyStations[currentTab as 'MTR' | 'LRT' | 'BUS'];
                if (modeArr.length > 0) {
                    const filtered = { MTR: [], LRT: [], BUS: [], [currentTab]: modeArr } as typeof nearbyStations;
                    return <NearbyStations stations={filtered} />;
                }
                // Location was found but no stations within threshold for this mode
                return (
                    <div style={{
                        margin: '0 0 0.75rem 0',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                    }}>
                        <MapPin size={14} />
                        <span>{language === 'TC' ? '附近3公里內沒有車站' : 'No stations within 3 km'}</span>
                    </div>
                );
            })()}
            {/* FEATURE 3: Enhanced empty state with icon and helpful suggestions */}
            {filteredGroups.length === 0 && searchQuery && (
                <div className="glass-card" style={{ 
                    textAlign: 'center', 
                    padding: '3rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(99,102,241,0.05))',
                    border: '1px solid rgba(99,102,241,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: 'rgba(99,102,241,0.1)',
                        color: 'rgba(99,102,241,0.6)'
                    }}>
                        <Search size={32} strokeWidth={1.5} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', margin: 0 }}>
                            {language === 'TC' ? '找不到相關車站或路線' : 'No Results Found'}
                        </h3>
                        <p style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--text-muted)', 
                            margin: 0,
                            lineHeight: '1.5',
                            maxWidth: '300px'
                        }}>
                            {language === 'TC' 
                                ? '未能找到符合「' + searchQuery + '」的車站或路線。請嘗試：'
                                : 'No stations or routes match "' + searchQuery + '". Try:'}
                        </p>
                        <ul style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            textAlign: 'left',
                            margin: '0.5rem 0 0 0',
                            paddingLeft: '1.2rem',
                            lineHeight: '1.6'
                        }}>
                            <li>{language === 'TC' ? '檢查拼寫' : 'Check spelling'}</li>
                            <li>{language === 'TC' ? '嘗試不同的關鍵詞' : 'Try different keywords'}</li>
                            <li>{language === 'TC' ? '搜尋英文或中文名稱' : 'Search in English or Chinese'}</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setExpandedGroup(null);
                        }}
                        style={{
                            padding: '0.65rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(99,102,241,0.3)',
                            background: 'rgba(99,102,241,0.15)',
                            color: 'var(--text-color)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            marginTop: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99,102,241,0.25)';
                            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                        }}
                    >
                        {language === 'TC' ? '清除搜尋' : 'Clear Search'}
                    </button>
                </div>
            )}

            {filteredGroups.map((group: any) => (
                <div key={getGroupKey(group.groupName)} className="glass-card" ref={el => { if (el) cardRefs.current[getGroupKey(group.groupName)] = el; }} style={{ padding: 0, overflow: 'hidden', marginBottom: '0.4rem', border: expandedGroup === getGroupKey(group.groupName) ? '1px solid rgba(167, 139, 250, 0.2)' : '1px solid transparent' }}>
                    <button
                        className="accordion-header"
                        ref={el => { if (el) groupHeaderRefs.current[getGroupKey(group.groupName)] = el; }}
                        onClick={() => {
                            const groupKey = getGroupKey(group.groupName);
                            setExpandedGroup(expandedGroup === groupKey ? null : groupKey);
                            // allow DOM updates and accordion animation then scroll the header into view
                            setTimeout(() => {
                                // blur any focused element to avoid browser scrolling it into view later
                                if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                                const cardEl = cardRefs.current[getGroupKey(group.groupName)];
                                scrollToElement(cardEl, { behavior: 'smooth' });
                            }, 350);
                        }}
                        aria-expanded={searchQuery.trim() ? true : expandedGroup === getGroupKey(group.groupName)}
                        aria-controls={`group-${getGroupKey(group.groupName)}`}
                        style={{ width: '100%', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: expandedGroup === getGroupKey(group.groupName) ? 'rgba(255,255,255,0.04)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', transition: 'background 0.2s ease' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="line-indicator" style={{ width: '4px', height: '24px', borderRadius: '4px', background: group.color }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{resolveName(group.groupName)}</span>
                                {group.desc && currentTab !== 'BUS' && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{resolveName(group.desc)}</span>}
                            </div>
                        </div>
                        {expandedGroup === getGroupKey(group.groupName) ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </button>
                    {/* FEATURE 2: Collapse animation with slideDown */}
                    {(searchQuery.trim() || expandedGroup === getGroupKey(group.groupName)) && (
                        <div id={`group-${getGroupKey(group.groupName)}`} className="accordion-content" style={{ padding: '0.2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)', animation: 'slideDown 0.3s ease-out' }}>
                            {(() => {
                                const key = typeof group.groupName === 'string' ? group.groupName : (group.groupName.en || group.groupName.tc || resolveName(group.groupName));
                                const routeKey = (group as any).routeCode || key;
                                const directionCode = (group as any).directionCode as string | undefined;
                                const dynamicKey = currentTab === 'BUS' ? `${routeKey}:${directionCode || 'ALL'}` : key;
                                const dyn = dynamicStops[dynamicKey];
                                
                                if (currentTab === 'BUS') {
                                    if (!dyn) {
                                        return (
                                            <div style={{ padding: '1rem 2.45rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {language === 'TC' ? '正在加載車站...' : 'Loading stops...'}
                                            </div>
                                        );
                                    }
                                    
                                    // For circular routes with merged flat list, render directly
                                    if (dyn.stations && dyn.stations.length > 0) {
                                        return (
                                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0' }}>
                                                {dyn.stations.map((station: any) => {
                                                    const nameStr = typeof station.name === 'string' ? station.name : (language === 'TC' ? station.name.tc : station.name.en);
                                                    return (
                                                        <button
                                                            type="button"
                                                            role="option"
                                                            aria-label={nameStr}
                                                            key={station.id}
                                                            className="station-row"
                                                            onClick={() => {
                                                                setReturnAnchorGroupKey(getGroupKey(group.groupName));
                                                                setSelectedStation({ ...station, mode: currentTab } as any);
                                                            }}
                                                            style={{ width: '100%', padding: '0.6rem 1.15rem 0.6rem 2.45rem', minHeight: '40px', display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left', transition: 'background 0.2s', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }}
                                                        >
                                                            <div className="line-indicator" style={{ width: '5px', height: '5px', borderRadius: '50%', border: `1.5px solid ${group.color}` }}></div>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{nameStr}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }
                                    
                                    if (Object.keys(dyn.byDir).length === 0) {
                                        return (
                                            <div style={{ padding: '1rem 2.45rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {language === 'TC' ? '暫無停靠站資訊' : 'No stop data available'}
                                            </div>
                                        );
                                    }
                                } else {
                                    if (!dyn) return group.stations.map((station: any) => {
                                        const nameStr = typeof station.name === 'string' ? station.name : (language === 'TC' ? station.name.tc : station.name.en);
                                        return (
                                            <button
                                                type="button"
                                                role="option"
                                                aria-label={nameStr}
                                                key={station.id}
                                                className="station-row"
                                                onClick={() => {
                                                    setReturnAnchorGroupKey(getGroupKey(group.groupName));
                                                    setSelectedStation({ ...station, mode: currentTab } as any);
                                                }}
                                                style={{ width: '100%', padding: '0.75rem 1.15rem 0.75rem 2.45rem', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left', transition: 'background 0.2s', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }}
                                            >
                                                <div className="line-indicator" style={{ width: '6px', height: '6px', borderRadius: '50%', border: `1.5px solid ${group.color}` }}></div>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{nameStr}</span>
                                            </button>
                                        );
                                    });
                                }

                                const dirKeys = Object.keys(dyn.byDir);
                                if (currentTab === 'BUS' && dirKeys.length === 1) {
                                    const d = dirKeys[0];
                                    const dirStops = dyn.byDir[d];
                                    const groupDesc = group.desc;
                                    const descText = typeof groupDesc === 'string'
                                        ? groupDesc
                                        : `${groupDesc?.en || ''} ${groupDesc?.tc || ''}`;
                                    const isCircularRoute = !!(group as any).isCircularRoute || CIRCULAR_BUS_ROUTES.has(routeKey) || /circular|循環/i.test(descText);

                                    const firstName = (() => { const n = dirStops[0]?.name as any; return typeof n === 'string' ? n : n?.en; })();
                                    const lastName = (() => { const n = dirStops[dirStops.length - 1]?.name as any; return typeof n === 'string' ? n : n?.en; })();
                                    const isCircularDir = firstName === lastName;
                                    const terminalStopId = (isCircularRoute || isCircularDir) ? null : dirStops[dirStops.length - 1]?.id;

                                    return (
                                        <div key={`${getGroupKey(group.groupName)}-dir-${d}`} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0' }}>
                                            {dirStops.map((station: any) => {
                                                const nameStr = typeof station.name === 'string' ? station.name : (language === 'TC' ? station.name.tc : station.name.en);
                                                const isTerminal = terminalStopId !== null && station.id === terminalStopId;
                                                if (isTerminal) {
                                                    return (
                                                        <div
                                                            key={station.id}
                                                            style={{ width: '100%', padding: '0.6rem 1.15rem 0.6rem 2.45rem', minHeight: '40px', display: 'flex', alignItems: 'center', gap: '0.85rem', opacity: 0.45, cursor: 'default' }}
                                                        >
                                                            <div className="line-indicator" style={{ width: '5px', height: '5px', borderRadius: '50%', border: `1.5px solid ${group.color}` }}></div>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{nameStr}</span>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
                                                                {language === 'TC' ? '（終點站）' : '(Last Stop)'}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        type="button"
                                                        role="option"
                                                        aria-label={nameStr}
                                                        key={station.id}
                                                        className="station-row"
                                                            onClick={() => {
                                                                setReturnAnchorGroupKey(getGroupKey(group.groupName));
                                                                setSelectedStation({ ...station, mode: currentTab } as any);
                                                            }}
                                                        style={{ width: '100%', padding: '0.6rem 1.15rem 0.6rem 2.45rem', minHeight: '40px', display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left', transition: 'background 0.2s', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }}
                                                    >
                                                        <div className="line-indicator" style={{ width: '5px', height: '5px', borderRadius: '50%', border: `1.5px solid ${group.color}` }}></div>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{nameStr}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                return Object.keys(dyn.byDir).map((d) => {
                                    const dirInfo = dyn.directionInfo?.[d];
                                    const endpointLabel = language === 'TC' ? (dirInfo?.endpointTc || `Direction ${d}`) : (dirInfo?.endpointEn || `Direction ${d}`);
                                    const isOpen = searchQuery.trim() ? true : (openDirections[key]?.has(d) || false);

                                    const groupDesc = group.desc;
                                    const descText = typeof groupDesc === 'string'
                                        ? groupDesc
                                        : `${groupDesc?.en || ''} ${groupDesc?.tc || ''}`;
                                    const isCircularRoute = CIRCULAR_BUS_ROUTES.has(key) || /circular|循環/i.test(descText);

                                    const dirStops = dyn.byDir[d];
                                    const firstName = (() => { const n = dirStops[0]?.name as any; return typeof n === 'string' ? n : n?.en; })();
                                    const lastName  = (() => { const n = dirStops[dirStops.length - 1]?.name as any; return typeof n === 'string' ? n : n?.en; })();
                                    const isCircularDir = firstName === lastName;
                                    const terminalStopId = (isCircularRoute || isCircularDir) ? null : dirStops[dirStops.length - 1]?.id;

                                    return (
                                        <div key={`${getGroupKey(group.groupName)}-dir-${d}`} style={{ margin: 0, overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button
                                                type="button"
                                                className="direction-header"
                                                ref={el => { if (el) directionHeaderRefs.current[d] = el; }}
                                                onClick={() => toggleDirection(key, d)}
                                                style={{ width: '100%', padding: '0.65rem 1.15rem 0.65rem 2.45rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }}
                                                aria-expanded={isOpen}
                                                aria-controls={`stops-${key}-${d}`}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                                                    <div className="line-indicator" style={{ width: '4px', height: '18px', borderRadius: '2px', background: group.color, opacity: 0.7 }}></div>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f0f0' }}>{language === 'TC' ? '往 ' : 'To '}{endpointLabel}</span>
                                                </div>
                                                {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                                            </button>
                                            {isOpen && (
                                                <div id={`stops-${key}-${d}`} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0' }}>
                                                    {dirStops.map((station: any) => {
                                                        const nameStr = typeof station.name === 'string' ? station.name : (language === 'TC' ? station.name.tc : station.name.en);
                                                        const isTerminal = terminalStopId !== null && station.id === terminalStopId;
                                                        if (isTerminal) {
                                                            return (
                                                                <div
                                                                    key={station.id}
                                                                    style={{ width: '100%', padding: '0.6rem 1.15rem 0.6rem 3.2rem', minHeight: '40px', display: 'flex', alignItems: 'center', gap: '0.85rem', opacity: 0.45, cursor: 'default' }}
                                                                >
                                                                    <div className="line-indicator" style={{ width: '5px', height: '5px', borderRadius: '50%', border: `1.5px solid ${group.color}` }}></div>
                                                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{nameStr}</span>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
                                                                        {language === 'TC' ? '（終點站）' : '(Last Stop)'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <button
                                                                type="button"
                                                                role="option"
                                                                aria-label={nameStr}
                                                                key={station.id}
                                                                className="station-row"
                                                                onClick={() => {
                                                                    setReturnAnchorGroupKey(getGroupKey(group.groupName));
                                                                    setSelectedStation({ ...station, mode: currentTab } as any);
                                                                }}
                                                                style={{ width: '100%', padding: '0.6rem 1.15rem 0.6rem 3.2rem', minHeight: '40px', display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left', transition: 'background 0.2s', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }}
                                                            >
                                                                <div className="line-indicator" style={{ width: '5px', height: '5px', borderRadius: '50%', border: `1.5px solid ${group.color}` }}></div>
                                                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{nameStr}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
