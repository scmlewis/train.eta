import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RotateCw } from 'lucide-react';
import { MTR_LINE_GROUPS, LRT_GROUPS, BUS_GROUPS } from '../constants/transportData';
import { BUS_STOP_NAMES } from '../constants/busStopNames';
import type { StationOption } from '../constants/transportData';
import { useAppStore } from '../store/useAppStore';
import EtaDisplay from './EtaDisplay';

export default function StationList({ currentTab }: { currentTab: string }) {
    const { language, searchQuery, setSearchQuery, selectedStation, setSelectedStation } = useAppStore();
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [stationLastUpdated, setStationLastUpdated] = useState<string | null>(null);
    const refetchersRef = useRef<Array<() => void>>([]);
    const [dynamicStops, setDynamicStops] = useState<Record<string, { byDir: Record<string, StationOption[]>, directionInfo: Record<string, any> }>>({});
    const [openDirections, setOpenDirections] = useState<Record<string, Set<string>>>({});
    const groupHeaderRefs = useRef<Record<string, HTMLElement | null>>({});
    const directionHeaderRefs = useRef<Record<string, HTMLElement | null>>({});

        const toggleDirection = (routeKey: string, dir: string) => {
            setOpenDirections(prev => {
                const dirs = prev[routeKey] || new Set();
                const updated = new Set(dirs);
                if (searchQuery.trim()) {
                    // search mode: allow multiple directions open/close
                    if (updated.has(dir)) updated.delete(dir); else updated.add(dir);
                    return { ...prev, [routeKey]: updated };
                } else {
                    // normal mode: true accordion
                    if (updated.has(dir)) return { ...prev, [routeKey]: new Set() };
                    return { ...prev, [routeKey]: new Set([dir]) };
                }
            });
            setTimeout(() => {
                const elem = directionHeaderRefs.current[dir];
                if (!elem) return;
                const headerEl = document.querySelector('.app-header') as HTMLElement | null;
                const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
                const top = elem.getBoundingClientRect().top + window.scrollY - headerH - 8;
                window.scrollTo({ top, behavior: 'smooth' });
            }, 50);
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
        if (currentTab === 'BUS') return BUS_GROUPS;
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

        // When search is active we show all matches expanded; only collapse when search cleared
        useEffect(() => {
            if (!searchQuery.trim()) {
                setExpandedGroup(null);
            }
        }, [searchQuery, filteredGroups.length]);

    // When expanding a bus route group, auto-populate full stops from API
    useEffect(() => {
        if (!expandedGroup) return;
        if (currentTab !== 'BUS') return;
        const grp = groups.find((g: any) => resolveName(g.groupName) === expandedGroup);
        if (!grp) return;
        const routeKey = typeof grp.groupName === 'string' ? grp.groupName : (grp.groupName.en || grp.groupName.tc || resolveName(grp.groupName));
        if (dynamicStops[routeKey]) return; // already loaded

        // Build stop list entirely from BUS_STOP_NAMES (static CSV data).
        // This is instantaneous and works for ALL routes including those with no active buses,
        // which caused K74/K58 and others to show nothing when the live API returned empty busStop.
        // Bilingual {en,tc} objects are stored so language switching works at render time.
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

        // Sort each direction by stop ID (IDs are zero-padded so localeCompare is correct)
        Object.values(allByDir).forEach(stops =>
            stops.sort((a, b) => String(a.id).localeCompare(String(b.id)))
        );

        // Endpoint label for each direction = name of the last stop
        for (const [dir, stops] of Object.entries(allByDir)) {
            const lastStop = stops[stops.length - 1];
            const name = lastStop?.name as any;
            dirInfo[dir] = {
                dir,
                endpointEn: typeof name === 'string' ? name : (name?.en ?? `Direction ${dir}`),
                endpointTc: typeof name === 'string' ? name : (name?.tc ?? `方向 ${dir}`),
            };
        }

        setDynamicStops(prev => ({ ...prev, [routeKey]: { byDir: allByDir, directionInfo: dirInfo } }));
    }, [expandedGroup, currentTab, groups, dynamicStops]);

        // reset last-updated when selection changes
        useEffect(() => {
            setStationLastUpdated(null);
        }, [selectedStation]);

        // Scroll to top when a station is selected (page navigation)
        useEffect(() => {
            if (!selectedStation) return;
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 50);
        }, [selectedStation]);

    // clear open directions when route group collapses
    useEffect(() => {
        if (!expandedGroup) {
            setOpenDirections({});
        }
    }, [expandedGroup]);

    // Memoize the refetch registration callback - use ref to avoid triggering re-renders
    const registerRefetch = useCallback((fn: () => void) => {
        refetchersRef.current = [...refetchersRef.current, fn];
        return () => { refetchersRef.current = refetchersRef.current.filter(f => f !== fn); };
    }, []);

    if (selectedStation) {
        const station = selectedStation as any;
        return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', margin: '0.4rem 0' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{resolveName(station.name)}</h2>
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
                {station.lines ? (
                    station.lines.map((lMap: any) => (
                        <div key={lMap.line} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1rem', color: lMap.lineColor, marginBottom: '0.5rem', fontWeight: 700 }}>{resolveName(lMap.name)}</h3>
                            <EtaDisplay stationId={station.id} line={lMap.line} stationName={resolveName(station.name)} onUpdateTime={setStationLastUpdated} onRegisterRefetch={registerRefetch} />
                        </div>
                    ))
                ) : (
                    <EtaDisplay
                        key={`${currentTab}-${station.id}`}
                        stationId={station.id}
                        stationName={resolveName(station.name)}
                        line={station.line || station.group}
                        onUpdateTime={setStationLastUpdated}
                        onRegisterRefetch={registerRefetch}
                    />
                )}
            </div>
        );
    }

    return (
        <div role="listbox" className="accordion-list animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredGroups.length === 0 && searchQuery && (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 2rem' }}>
                    {language === 'TC' ? '找不到相關車站或路線' : 'No matching stations or routes'}
                </div>
            )}

            {filteredGroups.map((group: any) => (
                <div key={resolveName(group.groupName)} className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '0.4rem', border: expandedGroup === resolveName(group.groupName) ? '1px solid rgba(167, 139, 250, 0.2)' : '1px solid transparent' }}>
                    <button
                        className="accordion-header"
                        ref={el => { if (el) groupHeaderRefs.current[resolveName(group.groupName)] = el; }}
                        onClick={() => {
                            const groupName = resolveName(group.groupName);
                            setExpandedGroup(expandedGroup === groupName ? null : groupName);
                            // Smooth scroll to position header under .app-header
                            setTimeout(() => {
                                const elem = groupHeaderRefs.current[groupName];
                                if (!elem) return;
                                const headerEl = document.querySelector('.app-header') as HTMLElement | null;
                                const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
                                const top = elem.getBoundingClientRect().top + window.scrollY - headerH - 8;
                                window.scrollTo({ top, behavior: 'smooth' });
                            }, 50);
                        }}
                        aria-expanded={searchQuery.trim() ? true : expandedGroup === resolveName(group.groupName)}
                        aria-controls={`group-${resolveName(group.groupName)}`}
                        style={{ width: '100%', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: expandedGroup === resolveName(group.groupName) ? 'rgba(255,255,255,0.04)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="line-indicator" style={{ width: '4px', height: '24px', borderRadius: '4px', background: group.color }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{resolveName(group.groupName)}</span>
                                {group.desc && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{resolveName(group.desc)}</span>}
                            </div>
                        </div>
                        {expandedGroup === resolveName(group.groupName) ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </button>
                    {(searchQuery.trim() || expandedGroup === resolveName(group.groupName)) && (
                        <div id={`group-${resolveName(group.groupName)}`} className="accordion-content" style={{ padding: '0.2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                            {(() => {
                                const key = typeof group.groupName === 'string' ? group.groupName : (group.groupName.en || group.groupName.tc || resolveName(group.groupName));
                                const dyn = dynamicStops[key];
                                
                                // For BUS routes: never show static endpoints; wait for dynamic direction blocks
                                if (currentTab === 'BUS') {
                                    if (!dyn) {
                                        return (
                                            <div style={{ padding: '1rem 2.45rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {language === 'TC' ? '正在加載車站...' : 'Loading stops...'}
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
                                    // For MTR/LRT: show static stations if no dynamic data
                                    if (!dyn) return group.stations.map((station: any) => {
                                        const nameStr = typeof station.name === 'string' ? station.name : (language === 'TC' ? station.name.tc : station.name.en);
                                        return (
                                            <button
                                                type="button"
                                                role="option"
                                                aria-label={nameStr}
                                                key={station.id}
                                                className="station-row"
                                                onClick={() => setSelectedStation({ ...station, mode: currentTab })}
                                                style={{ width: '100%', padding: '0.75rem 1.15rem 0.75rem 2.45rem', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left', transition: 'background 0.2s', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }}
                                            >
                                                <div className="line-indicator" style={{ width: '6px', height: '6px', borderRadius: '50%', border: `1.5px solid ${group.color}` }}></div>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{nameStr}</span>
                                            </button>
                                        );
                                    });
                                }

                                // render direction blocks as separate collapsible sub-items (BUS and MTR/LRT with dynamic data)
                                return Object.keys(dyn.byDir).map((d) => {
                                    const dirInfo = dyn.directionInfo?.[d];
                                    // Use bilingual endpoint names from API, fallback to direction code
                                    const endpointLabel = language === 'TC' ? (dirInfo?.endpointTc || `Direction ${d}`) : (dirInfo?.endpointEn || `Direction ${d}`);
                                    const isOpen = searchQuery.trim() ? true : (openDirections[key]?.has(d) || false);

                                    // Detect circular direction: if first & last stop share the same name, bus loops back
                                    const dirStops = dyn.byDir[d];
                                    const firstName = (() => { const n = dirStops[0]?.name as any; return typeof n === 'string' ? n : n?.en; })();
                                    const lastName  = (() => { const n = dirStops[dirStops.length - 1]?.name as any; return typeof n === 'string' ? n : n?.en; })();
                                    const isCircularDir = firstName === lastName;
                                    const terminalStopId = isCircularDir ? null : dirStops[dirStops.length - 1]?.id;

                                    return (
                                        <div key={`dir-${d}`} style={{ margin: 0, overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
                                                                onClick={() => setSelectedStation({ ...station, mode: currentTab })}
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
