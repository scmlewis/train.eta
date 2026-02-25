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
                                const isArriving = eta.tti === '0 min' || eta.time === '0 min' || eta.tti === '0 mins'
                                                || eta.tti === 'Departing / Departed' || eta.tti === '即將開出/已離開';
                                const isTimeString = eta.time?.includes?.('min');
                                const timeToDisplay = eta.time?.includes?.(' ') && !isTimeString ? eta.time.split(' ')[1].substring(0, 5) : (isTimeString ? '-' : eta.time);
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
                                                    {!isBus && eta.platform && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.platform} {eta.platform}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            textAlign: 'right',
                                            fontSize: isFirst ? '1.125rem' : '1rem',
                                            fontWeight: isFirst ? 700 : 600,
                                            color: isArriving ? '#10b981' : '#e2e8f0'
                                        }}>
                                            {isArriving
                                                ? <span style={{ color: '#10b981', fontWeight: 700, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{isTC ? '即將開出/\n已離開' : 'Departing\n/ Departed'}</span>
                                                : (eta.tti || (isTimeString ? eta.time : '...')).replace('minutes', 'min').replace('Minute', 'min').replace('分鐘', isTC ? '分鐘' : 'min').replace('分', isTC ? '分' : 'min').replace('min', isTC ? '分鐘' : 'min')}
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
