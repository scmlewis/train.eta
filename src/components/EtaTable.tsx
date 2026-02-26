import type { ETA } from '../types/eta';
import { getLineColor } from '../constants/mtrData';
import { useAppStore } from '../store/useAppStore';

interface EtaTableProps {
    title: string;
    etas: ETA[];
    trackColor?: string;
}

export default function EtaTable({ title, etas, trackColor = 'var(--primary-color)' }: EtaTableProps) {
    const { language } = useAppStore();
    const isTC = language === 'TC';

    if (etas.length === 0) return null;

    /** Extract a clean HH:MM from an ISO datetime or plain HH:MM string. Returns undefined for relative strings. */
    const toHHMM = (timeStr?: string): string | undefined => {
        if (!timeStr || /min|分/.test(timeStr)) return undefined;
        const m = timeStr.match(/(\d{2}:\d{2})/);
        return m ? m[1] : undefined;
    };

    /** Format a raw tti to the current language (e.g. "3 min" → "3 分鐘" in TC). */
    const formatTti = (raw: string): string => {
        const numMatch = raw.match(/(\d+)/);
        if (!numMatch) return raw;
        const n = parseInt(numMatch[1], 10);
        return isTC ? `${n} 分鐘` : `${n} ${n === 1 ? 'min' : 'mins'}`;
    };

    const t = {
        line: isTC ? '路線' : 'Line',
        arrival: isTC ? '到達' : 'Arrival',
        status: isTC ? '狀態' : 'Status',
        destination: isTC ? '終點站' : 'Destination',
        nextBus: isTC ? '下班巴士' : 'Next Bus',
        nextTrain: isTC ? '下班列車' : 'Next Train',
        scheduled: isTC ? '預定班次' : 'Scheduled',
        realtime: isTC ? '實時班次' : 'Real-time',
        arriving: isTC ? '即將抵達' : 'Arriving',
        platform: isTC ? '月台' : 'Platform',
        expectedNotice: isTC ? '# 預計到達時間 (基於班次表)' : '# Expected Arrival Time (Based on Schedule)'
    };

    return (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: '6px', height: '24px', borderRadius: '4px', background: trackColor }}></div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{title}</h3>
            </div>

            <div style={{ padding: '0.5rem 1rem' }}>
                {(() => {
                    const isBusTable = etas[0]?.platform?.includes('-D') || etas[0]?.id.startsWith('bus-');
                    const gridLayout = isBusTable ? '1fr 1fr 1fr' : '1.2fr 1.8fr 1fr';

                    return (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: gridLayout, gap: '1rem', padding: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>{etas[0]?.routeNo ? t.line : t.arrival}</div>
                                <div>{isBusTable ? t.status : t.destination}</div>
                                <div style={{ textAlign: 'right' }}>{isBusTable ? t.nextBus : t.nextTrain}</div>
                            </div>

                            {etas.map((eta, index) => {
                                // Treat as departing when: normalizer set status, ttiMinutes=0, tti is '0 min'/'0 mins',
                                // or tti contains a departure keyword (covers MTR which doesn't set status/ttiMinutes)
                                const isDeparting =
                                    eta.status === 'DEPARTING' ||
                                    eta.ttiMinutes === 0 ||
                                    eta.tti === '0 min' || eta.tti === '0 mins' ||
                                    /departing|departed|即將|已離開/i.test(eta.tti ?? '');
                                const hasTtiMinutes = typeof eta.ttiMinutes === 'number' && eta.ttiMinutes > 0;
                                // Truncate MTR full datetimes to HH:MM; undefined for relative strings
                                const displayTime = toHHMM(eta.time);
                                const timeToDisplay = displayTime ?? (hasTtiMinutes ? '-' : '--:--');
                                const routeColor = eta.routeNo ? getLineColor(eta.routeNo) : 'var(--text-color)';
                                const isBus = eta.platform?.includes?.('-D') || eta.id?.startsWith?.('bus-');
                                const isFirst = index === 0;

                                return (
                                    <div
                                        key={eta.id}
                                        className={isFirst ? 'eta-row-highlight' : ''}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: gridLayout,
                                            gap: '1rem',
                                            padding: isFirst ? '1rem 0.5rem' : '0.75rem 0',
                                            margin: isFirst ? '0.5rem -0.5rem' : '0',
                                            alignItems: 'center',
                                            borderBottom: isFirst ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                            background: isFirst ? 'rgba(255,255,255,0.03)' : 'transparent',
                                            borderRadius: isFirst ? '12px' : '0',
                                            border: isFirst ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                            boxShadow: isFirst ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: isFirst ? '1.25rem' : '1.125rem',
                                            fontWeight: isFirst ? 800 : 600,
                                            color: routeColor,
                                            textShadow: isFirst ? `0 0 20px ${routeColor}44` : 'none'
                                        }}>
                                            {isBus ? (timeToDisplay === '-' ? '--:--' : timeToDisplay) : (eta.routeNo || timeToDisplay)}
                                        </div>
                                        <div>
                                            {isBus ? (
                                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: eta.isScheduled ? '#e2e8f0' : '#10b981', background: eta.isScheduled ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                                    {eta.isScheduled ? t.scheduled : t.realtime}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <span style={{ fontSize: isFirst ? '1.1rem' : '1rem', fontWeight: isFirst ? 600 : 500 }}>{eta.destination}</span>
                                                    {!isBus && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {/* If column 1 shows a routeNo (LRT), the time caption is useful.
                                                                If column 1 already shows the time (MTR, no routeNo), show platform instead. */}
                                                            {eta.routeNo
                                                                ? (displayTime && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{displayTime}</span>)
                                                                : (eta.platform && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isTC ? `月台 ${eta.platform}` : `Plat. ${eta.platform}`}</span>)
                                                            }
                                                            {typeof eta.trainLength !== 'undefined' && eta.trainLength !== null && (
                                                                (() => {
                                                                    const displayCount = Math.min(2, Math.max(1, Number(eta.trainLength || 1)));
                                                                    return (
                                                                        <span aria-label={`${displayCount} cars`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
                                                                                <rect x="3" y="5" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                                                                <rect x="6" y="7.5" width="4" height="3" rx="0.4" fill="currentColor" />
                                                                                <rect x="14" y="7.5" width="4" height="3" rx="0.4" fill="currentColor" />
                                                                                <circle cx="8.5" cy="17" r="1.5" fill="currentColor" />
                                                                                <circle cx="15.5" cy="17" r="1.5" fill="currentColor" />
                                                                            </svg>
                                                                            <span style={{ lineHeight: 1 }}>{displayCount}</span>
                                                                        </span>
                                                                    );
                                                                })()
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            textAlign: 'right',
                                            fontSize: isFirst ? '1.125rem' : '1rem',
                                            fontWeight: isFirst ? 700 : 600,
                                            color: isDeparting ? '#10b981' : '#e2e8f0'
                                        }}>
                                            {isDeparting ? (
                                                // Option B: Departing label + clock time (HH:MM) when available
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
                                                    <span style={{ color: '#10b981', fontWeight: 700, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{isTC ? '即將開出/\n已離開' : 'Departing\n/ Departed'}</span>
                                                    {displayTime && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#10b981', opacity: 0.75 }}>({displayTime})</span>}
                                                </div>
                                            ) : hasTtiMinutes ? (
                                                // LRT: show relative minutes (from ttiMinutes)
                                                `${eta.ttiMinutes} ${isTC ? '分鐘' : (eta.ttiMinutes === 1 ? 'min' : 'mins')}`
                                            ) : eta.tti ? (
                                                // MTR / Bus: use raw tti text, normalized to current language
                                                formatTti(eta.tti)
                                            ) : displayTime ? (
                                                displayTime
                                            ) : (
                                                '...'
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    );
                })()}
            </div>
            {etas.some(e => e.isScheduled) && (
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', fontStyle: 'italic' }}>
                    {t.expectedNotice}
                </div>
            )}
        </div>
    );
}
