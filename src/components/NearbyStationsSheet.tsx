import { X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import NearbyStations from './NearbyStations';

export default function NearbyStationsSheet() {
    const { isBottomSheetOpen, setIsBottomSheetOpen, nearbyStations, clearNearbyStations } = useAppStore();
    const isTC = useAppStore((state) => state.language === 'TC');

    if (!isBottomSheetOpen || !nearbyStations) {
        return null;
    }

    const handleClose = () => {
        setIsBottomSheetOpen(false);
        clearNearbyStations();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleBackdropClick}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease',
                    zIndex: 1000,
                }}
            />

            {/* Bottom Sheet */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(11, 15, 26, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px 20px 0 0',
                    zIndex: 1001,
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                {/* Drag Handle & Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    {/* Drag Handle */}
                    <div
                        style={{
                            width: '40px',
                            height: '4px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '2px',
                            margin: '0 auto',
                        }}
                    />
                    <button
                        type="button"
                        aria-label={isTC ? '關閉' : 'Close'}
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '6px',
                            lineHeight: 1,
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div
                    style={{
                        overflowY: 'auto',
                        padding: '0 1rem 2rem 1rem',
                        flex: 1,
                    }}
                >
                    <NearbyStations stations={nearbyStations} />
                </div>
            </div>

            {/* Animations */}
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes slideUp {
                        from {
                            transform: translateY(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }

                    /* Smooth scroll in sheet */
                    div[style*="overflow: auto"] {
                        scroll-behavior: smooth;
                    }
                `}
            </style>
        </>
    );
}
