export default function AboutIcon({ size = 20, className }: { size?: number; className?: string }) {
    const s = size;
    return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M11.5 11.2h1v5.5h-1z" fill="currentColor" />
        </svg>
    );
}
