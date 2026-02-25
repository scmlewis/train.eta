import type { ETA } from '../types/eta';

interface EtaCardProps {
    eta: ETA;
    label?: string; // Optional label like 'Platform 1'
    trackColor?: string; // Optional track color
}

export default function EtaCard({ eta, label, trackColor = 'var(--primary-color)' }: EtaCardProps) {
    // Parsing the time. MTR/Bus usually give explicit time, Light Rail gives "3 mins"
    const isTimeString = eta.time.includes('min');

    return (
        <div className="eta-card" style={{ borderLeftColor: trackColor }}>
            <div className="eta-info">
                <h4 className="eta-dest">{eta.destination}</h4>
                {label && <span className="eta-label">{label}</span>}
                {eta.platform && !label && <span className="eta-plat">Plat {eta.platform}</span>}
            </div>
            <div className="eta-time-container">
                <div className="eta-time-val">{eta.tti || (isTimeString ? eta.time : '...')}</div>
            </div>
        </div>
    );
}
