import { LocateFixed, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getCurrentPosition, findNearestStations } from '../utils/geolocation';

export default function FloatingGeoButton() {
    const {
        language,
        currentTab,
        selectedStation,
        isLocating,
        locationError,
        setIsLocating,
        setNearbyStations,
        setLocationError,
        setIsBottomSheetOpen,
    } = useAppStore();

    const isTC = language === 'TC';

    // Only show on transport tabs when no station is selected
    if (selectedStation || !['MTR', 'LRT', 'BUS'].includes(currentTab)) {
        return null;
    }

    const handleNearby = async () => {
        if (isLocating) return;
        setIsLocating(true);
        try {
            const coords = await getCurrentPosition();
            const results = findNearestStations(coords.latitude, coords.longitude);
            setNearbyStations(results);
            setIsBottomSheetOpen(true);
        } catch (err) {
            setLocationError(typeof err === 'string' ? err : 'Unable to get location.');
        }
    };

    return (
        <button
            type="button"
            aria-label={isTC ? '尋找附近車站' : 'Find nearby stations'}
            onClick={handleNearby}
            disabled={isLocating}
            title={locationError ?? (isTC ? '尋找附近車站' : 'Find nearby stations')}
            style={{
                position: 'fixed',
                bottom: 'calc(6.5rem + env(safe-area-inset-bottom))',
                right: 'calc(1rem + env(safe-area-inset-right))',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: locationError ? 'rgba(239,68,68,0.15)' : 'rgba(99, 102, 241, 0.9)',
                border: `2px solid ${locationError ? 'rgba(239,68,68,0.35)' : 'rgba(99, 102, 241, 1)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: locationError ? '#f87171' : 'white',
                cursor: isLocating ? 'default' : 'pointer',
                opacity: isLocating ? 0.8 : 1,
                transition: 'all 0.2s ease',
                zIndex: 999,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => {
                if (!isLocating && !locationError) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99, 102, 241, 1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(99, 102, 241, 0.4)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isLocating && !locationError) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99, 102, 241, 0.9)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                }
            }}
        >
            {isLocating ? (
                <Loader2 size={24} className="animate-spin" />
            ) : (
                <LocateFixed size={24} />
            )}
        </button>
    );
}
