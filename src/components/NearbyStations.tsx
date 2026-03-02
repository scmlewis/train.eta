import { X, MapPin, Train, TramFront, Bus } from 'lucide-react';
import type { NearbyStation, NearbyStationGroups } from '../utils/geolocation';
import { MTR_LINE_NAMES } from '../utils/geolocation';
import { useAppStore } from '../store/useAppStore';

type Props = {
    stations: NearbyStationGroups;
};

const MODE_ICON: Record<string, React.ReactNode> = {
    MTR: <Train size={14} />,
    LRT: <TramFront size={14} />,
    BUS: <Bus size={14} />,
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

/** Resolve a raw line code or route number to a displayable string. */
function resolveLineLabel(mode: string, line: string | undefined, isTC: boolean): string {
    if (!line) return '';
    if (mode === 'MTR') {
        const names = MTR_LINE_NAMES[line];
        if (names) return isTC ? names.tc : names.en;
    }
    // LRT and BUS: `line` is the route number — display as-is
    return line;
}

interface SectionProps {
    mode: 'MTR' | 'LRT' | 'BUS';
    entries: NearbyStation[];
    isTC: boolean;
    onSelect: (s: NearbyStation) => void;
    isLast: boolean;
}

function ModeSection({ mode, entries, isTC, onSelect, isLast }: SectionProps) {
    if (entries.length === 0) return null;

    const modeLabel = MODE_LABEL[mode][isTC ? 'tc' : 'en'];

    return (
        <div style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
            {/* Mode sub-header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.9rem 0.3rem',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
            }}>
                {MODE_ICON[mode]}
                <span>{modeLabel}</span>
            </div>

            {/* Station rows */}
            {entries.map((station, index) => {
                const displayName = isTC ? (station.nameTc || station.name) : station.name;
                const lineLabel = resolveLineLabel(mode, station.line, isTC);
                const isLastRow = index === entries.length - 1;

                return (
                    <button
                        key={`${station.mode}:${station.id}:${index}`}
                        type="button"
                        onClick={() => onSelect(station)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.55rem 0.9rem 0.55rem 2rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: isLastRow ? 'none' : '1px solid rgba(255,255,255,0.04)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            gap: '0.75rem',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                        {/* Name + line info */}
                        <div style={{ minWidth: 0 }}>
                            <div style={{
                                color: 'var(--text-primary)',
                                fontSize: '0.91rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {displayName}
                            </div>
                            {lineLabel && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.08rem' }}>
                                    {lineLabel}
                                </div>
                            )}
                        </div>

                        {/* Distance badge */}
                        <span style={{
                            flexShrink: 0,
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            padding: '0.18rem 0.5rem',
                            whiteSpace: 'nowrap',
                        }}>
                            {formatDistance(station.distanceKm)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default function NearbyStations({ stations }: Props) {
    const { language, setSelectedStation, clearNearbyStations } = useAppStore();
    const isTC = language === 'TC';

    const activeModes = (['MTR', 'LRT', 'BUS'] as const).filter(m => stations[m].length > 0);
    if (activeModes.length === 0) return null;

    return (
        <div style={{
            margin: '0 0 0.75rem 0',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
        }}>
            {/* Header row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.9rem 0.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                }}>
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

            {/* One section per mode */}
            {activeModes.map((mode, i) => (
                <ModeSection
                    key={mode}
                    mode={mode}
                    entries={stations[mode]}
                    isTC={isTC}
                    onSelect={setSelectedStation}
                    isLast={i === activeModes.length - 1}
                />
            ))}
        </div>
    );
}
