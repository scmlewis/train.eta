import { X, MapPin, Train, TramFront, Bus } from 'lucide-react';
import type { Station } from '../types/eta';
import { useAppStore } from '../store/useAppStore';

type Props = {
    stations: (Station & { distanceKm: number })[];
};

const MODE_ICON: Record<string, React.ReactNode> = {
    MTR: <Train size={15} />,
    LRT: <TramFront size={15} />,
    BUS: <Bus size={15} />,
};

const MODE_LABEL: Record<string, { en: string; tc: string }> = {
    MTR: { en: 'MTR', tc: '港鐵' },
    LRT: { en: 'LRT', tc: '輕鐵' },
    BUS: { en: 'Bus', tc: '巴士' },
};

function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
}

export default function NearbyStations({ stations }: Props) {
    const { language, setSelectedStation, clearNearbyStations } = useAppStore();
    const isTC = language === 'TC';

    if (stations.length === 0) return null;

    return (
        <div
            style={{
                margin: '0 0 0.75rem 0',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
            }}
        >
            {/* Header row */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem 0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    <MapPin size={13} />
                    <span>{isTC ? '附近車站' : 'Nearby Stations'}</span>
                </div>
                <button
                    type="button"
                    aria-label={isTC ? '關閉附近車站' : 'Dismiss nearby stations'}
                    onClick={clearNearbyStations}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '0.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '6px',
                        lineHeight: 1,
                    }}
                >
                    <X size={15} />
                </button>
            </div>

            {/* Station cards */}
            <div>
                {stations.map((station, index) => {
                    const modeLabel = MODE_LABEL[station.mode]?.[isTC ? 'tc' : 'en'] ?? station.mode;
                    const lineInfo = station.line ? `${modeLabel} · ${station.line}` : modeLabel;
                    const isLast = index === stations.length - 1;

                    return (
                        <button
                            key={`${station.mode}:${station.id}:${index}`}
                            type="button"
                            onClick={() => setSelectedStation(station)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.65rem 0.9rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                gap: '0.75rem',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                            {/* Mode icon + station info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                                    {MODE_ICON[station.mode]}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {station.name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                                        {lineInfo}
                                    </div>
                                </div>
                            </div>

                            {/* Distance badge */}
                            <span style={{
                                flexShrink: 0,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.06)',
                                borderRadius: '8px',
                                padding: '0.2rem 0.55rem',
                                whiteSpace: 'nowrap',
                            }}>
                                {formatDistance(station.distanceKm)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
