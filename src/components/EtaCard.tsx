import type { ETA } from '../types/eta';
import { useAppStore } from '../store/useAppStore';

interface EtaCardProps {
    eta: ETA;
    label?: string; // Optional label like 'Platform 1'
    trackColor?: string; // Optional track color
}

export default function EtaCard({ eta, label, trackColor = 'var(--primary-color)' }: EtaCardProps) {
    const { language } = useAppStore();
    const isTC = language === 'TC';
    // Parsing the time/status. LRT normalizer sets `ttiMinutes` and `status`.
    const hasTtiMinutes = typeof eta.ttiMinutes === 'number' && eta.ttiMinutes > 0;
    const isDeparting =
        eta.status === 'DEPARTING' ||
        eta.ttiMinutes === 0 ||
        eta.tti === '0 min' || eta.tti === '0 mins' ||
        /departing|departed|即將|已離開/i.test(eta.tti ?? '');

    const toHHMM = (timeStr?: string): string | undefined => {
        if (!timeStr || /min|分/.test(timeStr)) return undefined;
        const m = timeStr.match(/(\d{2}:\d{2})/);
        return m ? m[1] : undefined;
    };
    const formatTti = (raw: string): string => {
        const numMatch = raw.match(/(\d+)/);
        if (!numMatch) return raw;
        const n = parseInt(numMatch[1], 10);
        return isTC ? `${n} 分鐘` : `${n} ${n === 1 ? 'min' : 'mins'}`;
    };
    const displayTime = toHHMM(eta.time);

    return (
        <div className="eta-card" style={{ borderLeftColor: trackColor }}>
            <div className="eta-info">
                <h4 className="eta-dest">{eta.destination}</h4>
                {label && <span className="eta-label">{label}</span>}
                {!label && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {displayTime && <span className="eta-plat" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{displayTime}</span>}
                        {typeof eta.trainLength !== 'undefined' && eta.trainLength !== null && (
                            (() => {
                                const displayCount = Math.min(2, Math.max(1, Number(eta.trainLength || 1)));
                                return (
                                    <span aria-label={`${displayCount} cars`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.04)' }}>
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
            <div className="eta-time-container">
                <div className="eta-time-val">
                    {isDeparting ? (
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
                            <span>{isTC ? '即將開出/\n已離開' : 'Departing\n/ Departed'}</span>
                            {displayTime && <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.75 }}>({displayTime})</span>}
                        </span>
                    ) : hasTtiMinutes ? (
                        `${eta.ttiMinutes} ${isTC ? '分鐘' : (eta.ttiMinutes === 1 ? 'min' : 'mins')}`
                    ) : eta.tti ? (
                        formatTti(eta.tti)
                    ) : displayTime ? (
                        displayTime
                    ) : (
                        '...'
                    )}
                </div>
            </div>
        </div>
    );
}
