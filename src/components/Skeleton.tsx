interface EtaSkeletonProps {
  title?: string;
}

/**
 * Shimmering placeholder shown on initial ETA load.
 * Mirrors the EtaTable shape so the layout doesn't jump when real data arrives.
 */
export default function EtaSkeleton({ title }: EtaSkeletonProps) {
  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="shimmer" style={{ width: '6px', height: '24px', borderRadius: '4px' }} />
        <div className="shimmer" style={{ width: title ? '40%' : '120px', height: '18px' }} />
      </div>
      <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div className="shimmer" style={{ width: '60%', height: i === 0 ? '20px' : '16px' }} />
            <div className="shimmer" style={{ width: '70%', height: i === 0 ? '18px' : '14px' }} />
            <div className="shimmer" style={{ width: '50%', height: i === 0 ? '20px' : '16px', marginLeft: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
