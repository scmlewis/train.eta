import { Github } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { FontSize } from '../store/useAppStore';

export default function About() {
    const { language, fontSize, setFontSize } = useAppStore();
    const isTC = language === 'TC';

    const fontSizeOptions: { value: FontSize; label: string; preview: string }[] = [
        { value: 'small', label: isTC ? '細' : 'S', preview: '14px' },
        { value: 'default', label: isTC ? '中' : 'M', preview: '16px' },
        { value: 'large', label: isTC ? '大' : 'L', preview: '18px' },
    ];

    return (
        <div className="glass-card" style={{ padding: '1.25rem 1.25rem 1.5rem', lineHeight: 1.5 }}>
            <h2 style={{ marginBottom: '0.6rem', fontSize: '1.15rem' }}>{isTC ? '設定' : 'Settings'}</h2>

            {/* Font Size Setting */}
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {isTC ? '字體大小' : 'Font Size'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {fontSizeOptions.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFontSize(opt.value)}
                            style={{
                                flex: 1,
                                padding: '0.6rem 0.5rem',
                                borderRadius: '10px',
                                border: fontSize === opt.value
                                    ? '1.5px solid var(--primary-color)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                background: fontSize === opt.value
                                    ? 'rgba(59, 130, 246, 0.1)'
                                    : 'rgba(255,255,255,0.03)',
                                color: fontSize === opt.value ? 'var(--text-color)' : 'var(--text-muted)',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.15rem',
                            }}
                        >
                            <span style={{ fontSize: opt.value === 'small' ? '0.8rem' : opt.value === 'large' ? '1.1rem' : '0.95rem', fontWeight: 700 }}>
                                {opt.label}
                            </span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{opt.preview}</span>
                        </button>
                    ))}
                </div>
            </div>

            <h3 style={{ marginBottom: '0.4rem' }}>{isTC ? '關於' : 'About'}</h3>

            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {isTC ? (
                    <>
                        Train.ETA 為一個輕量的即時車站到站資訊工具，提供港鐵、輕鐵與巴士的到站 ETA、目的地篩選、以及快速手動或自動刷新。
                    </>
                ) : (
                    <>
                        Train.ETA is a lightweight near-real-time transit companion providing MTR, Light Rail and selected bus arrival ETAs, destination filters, and quick manual or auto-refresh.
                    </>
                )}
            </p>

            <h3 style={{ marginBottom: '0.4rem' }}>{isTC ? '主要功能' : 'Key Features'}</h3>
            <ul style={{ color: 'var(--text-muted)', marginBottom: '1rem', paddingLeft: '1.15rem' }}>
                <li>{isTC ? '即時列車/巴士到站時間' : 'Near-real-time train / bus arrival times'}</li>
                <li>{isTC ? '依方向或目的地篩選' : 'Filter by direction or destination'}</li>
                <li>{isTC ? '最近車站（基於裝置定位）' : 'Nearby stations (based on device location)'}</li>
                <li>{isTC ? '可收藏常用車站並快速查詢' : 'Save favorite stations for quick access'}</li>
            </ul>

            <h3 style={{ marginBottom: '0.4rem' }}>{isTC ? '私隱與定位資料' : 'Privacy & Location'}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {isTC ? (
                    <>
                        使用「附近車站」功能時，本應用會在您的瀏覽器要求並使用裝置定位資料以計算附近站點，但<strong>定位資料不會被送出或儲存在伺服器或應用後端</strong>。所有定位計算均在用戶端執行，定位結果僅以暫時狀態保存在本地記憶，以便顯示最近車站；您可以隨時關閉或清除附近車站列表。
                    </>
                ) : (
                    <>
                        When you use the "Nearby Stations" feature the app requests device location from your browser to compute nearby stops. <strong>Location data is never uploaded or stored on any server</strong> — all computations happen locally on your device and results are kept only in ephemeral local state. You can clear the nearby stations or disable location access at any time.
                    </>
                )}
            </p>

            <h3 style={{ marginBottom: '0.4rem' }}>{isTC ? '使用條款與免責' : 'Terms & Disclaimer'}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {isTC ? '本應用所提供資訊僅供參考，可能因資料來源延遲或變更而導致差異。開發者不對因使用本應用而產生的任何損失負責。' : 'Information provided is for reference only and may be affected by source delays or changes. The developer is not liable for any loss arising from use of this app.'}
            </p>

            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
            }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isTC ? '開發者' : 'Developed by'} <strong style={{ color: 'var(--text-color)' }}>scmlewis</strong>
                </span>
                <a
                    href="https://github.com/scmlewis/train.eta"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                    }}
                >
                    <Github size={16} />
                    <span>GitHub</span>
                </a>
            </div>
        </div>
    );
}
