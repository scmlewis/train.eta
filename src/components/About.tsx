import { useAppStore } from '../store/useAppStore';

export default function About() {
    const { language } = useAppStore();
    const isTC = language === 'TC';

    return (
        <div className="glass-card" style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{isTC ? '關於此應用程式' : 'About This App'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {isTC ? 'Train.ETA 是一個即時列車與巴士到站時間查詢應用，提供路線 ETA、目的地篩選與快速刷新功能。' : 'Train.ETA provides near real-time train and bus arrival information, destination filters, and quick refresh.'}
            </p>

            <h3 style={{ marginBottom: '0.4rem' }}>{isTC ? '使用條款' : 'Terms and Conditions'}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {isTC ? '本應用僅提供參考資訊，並不保證資料的即時性或完整性。使用者應以車站現場資訊為準。' : 'Information is provided for reference only and is not guaranteed to be complete or real-time. Always follow on-site station information.'}
            </p>

            <h3 style={{ marginBottom: '0.4rem' }}>{isTC ? '私隱政策' : 'Privacy Policy'}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {isTC ? '本應用不會收集任何個人資料，除非使用者主動提供。若有第三方服務需提供資料，將另行說明。' : 'This app does not collect personal data unless explicitly provided by the user. Third-party services will be disclosed.'}
            </p>

            <h3 style={{ marginBottom: '0.4rem' }}>{isTC ? '免責聲明' : 'Disclaimer'}</h3>
            <p style={{ color: 'var(--text-muted)' }}>
                {isTC ? '開發者不對任何因使用本應用而導致的損失或延誤負責。使用本服務即表示接受上述條款。' : 'The developer is not liable for any loss or delay arising from use of this service. Use indicates acceptance of these terms.'}
            </p>
        </div>
    );
}
