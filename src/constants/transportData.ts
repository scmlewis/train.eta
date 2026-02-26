import { MTR_STATIONS } from './mtrData';

export interface StationOption {
    id: string;
    name: string | { en: string, tc: string };
    line?: string;
    lines?: { line: string, name: string | { en: string, tc: string }, lineColor: string }[];
    lineColor?: string;
    group?: string;
    desc?: string | { en: string, tc: string };
}

export interface TransportGroup {
    groupName: string | { en: string, tc: string };
    desc?: string | { en: string, tc: string };
    color: string;
    stations: StationOption[];
}

const getMTRName = (id: string) => MTR_STATIONS[id] || { en: id, tc: id };

export const MTR_LINE_GROUPS: TransportGroup[] = [
    {
        groupName: { en: 'Kwun Tong Line', tc: '觀塘綫' },
        color: '#10b981',
        stations: [
            { id: 'WHA', name: getMTRName('WHA'), line: 'KTL' },
            { id: 'HOM', name: getMTRName('HOM'), line: 'KTL' },
            { id: 'YMT', name: getMTRName('YMT'), line: 'KTL' },
            { id: 'MOK', name: getMTRName('MOK'), line: 'KTL' },
            { id: 'PRE', name: getMTRName('PRE'), line: 'KTL' },
            { id: 'SKM', name: getMTRName('SKM'), line: 'KTL' },
            { id: 'KOT', name: getMTRName('KOT'), line: 'KTL' },
            { id: 'LOF', name: getMTRName('LOF'), line: 'KTL' },
            { id: 'DIH', name: getMTRName('DIH'), line: 'KTL' },
            { id: 'CHH', name: getMTRName('CHH'), line: 'KTL' },
            { id: 'KOB', name: getMTRName('KOB'), line: 'KTL' },
            { id: 'NTK', name: getMTRName('NTK'), line: 'KTL' },
            { id: 'KWT', name: getMTRName('KWT'), line: 'KTL' },
            { id: 'LAT', name: getMTRName('LAT'), line: 'KTL' },
            { id: 'YAT', name: getMTRName('YAT'), line: 'KTL' },
            { id: 'TIK', name: getMTRName('TIK'), line: 'KTL' }
        ]
    },
    {
        groupName: { en: 'Tsuen Wan Line', tc: '荃灣綫' },
        color: '#ef4444',
        stations: [
            { id: 'CEN', name: getMTRName('CEN'), line: 'TWL' },
            { id: 'ADM', name: getMTRName('ADM'), line: 'TWL' },
            { id: 'TST', name: getMTRName('TST'), line: 'TWL' },
            { id: 'JOR', name: getMTRName('JOR'), line: 'TWL' },
            { id: 'YMT', name: getMTRName('YMT'), line: 'TWL' },
            { id: 'MOK', name: getMTRName('MOK'), line: 'TWL' },
            { id: 'PRE', name: getMTRName('PRE'), line: 'TWL' },
            { id: 'SSP', name: getMTRName('SSP'), line: 'TWL' },
            { id: 'CSW', name: getMTRName('CSW'), line: 'TWL' },
            { id: 'LCK', name: getMTRName('LCK'), line: 'TWL' },
            { id: 'MEF', name: getMTRName('MEF'), line: 'TWL' },
            { id: 'LAK', name: getMTRName('LAK'), line: 'TWL' },
            { id: 'KWF', name: getMTRName('KWF'), line: 'TWL' },
            { id: 'KWH', name: getMTRName('KWH'), line: 'TWL' },
            { id: 'TWH', name: getMTRName('TWH'), line: 'TWL' },
            { id: 'TSW', name: getMTRName('TSW'), line: 'TWL' }
        ]
    },
    {
        groupName: { en: 'Island Line', tc: '港島綫' },
        color: '#3b82f6',
        stations: [
            { id: 'KET', name: getMTRName('KET'), line: 'ISL' },
            { id: 'HKU', name: getMTRName('HKU'), line: 'ISL' },
            { id: 'SYP', name: getMTRName('SYP'), line: 'ISL' },
            { id: 'SHW', name: getMTRName('SHW'), line: 'ISL' },
            { id: 'CEN', name: getMTRName('CEN'), line: 'ISL' },
            { id: 'ADM', name: getMTRName('ADM'), line: 'ISL' },
            { id: 'WAC', name: getMTRName('WAC'), line: 'ISL' },
            { id: 'CAB', name: getMTRName('CAB'), line: 'ISL' },
            { id: 'TIH', name: getMTRName('TIH'), line: 'ISL' },
            { id: 'FOH', name: getMTRName('FOH'), line: 'ISL' },
            { id: 'NOP', name: getMTRName('NOP'), line: 'ISL' },
            { id: 'QUB', name: getMTRName('QUB'), line: 'ISL' },
            { id: 'TAK', name: getMTRName('TAK'), line: 'ISL' },
            { id: 'SWH', name: getMTRName('SWH'), line: 'ISL' },
            { id: 'SKW', name: getMTRName('SKW'), line: 'ISL' },
            { id: 'HFC', name: getMTRName('HFC'), line: 'ISL' },
            { id: 'CHW', name: getMTRName('CHW'), line: 'ISL' }
        ]
    },
    {
        groupName: { en: 'South Island Line', tc: '南港島綫' },
        color: '#fbbf24',
        stations: [
            { id: 'ADM', name: getMTRName('ADM'), line: 'SIL' },
            { id: 'OCP', name: getMTRName('OCP'), line: 'SIL' },
            { id: 'WCH', name: getMTRName('WCH'), line: 'SIL' },
            { id: 'LET', name: getMTRName('LET'), line: 'SIL' },
            { id: 'SOH', name: getMTRName('SOH'), line: 'SIL' }
        ]
    },
    {
        groupName: { en: 'Tseung Kwan O Line', tc: '將軍澳綫' },
        color: '#a855f7',
        stations: [
            { id: 'NOP', name: getMTRName('NOP'), line: 'TKL' },
            { id: 'QUB', name: getMTRName('QUB'), line: 'TKL' },
            { id: 'YAT', name: getMTRName('YAT'), line: 'TKL' },
            { id: 'TIK', name: getMTRName('TIK'), line: 'TKL' },
            { id: 'TKO', name: getMTRName('TKO'), line: 'TKL' },
            { id: 'LHP', name: getMTRName('LHP'), line: 'TKL' },
            { id: 'HAH', name: getMTRName('HAH'), line: 'TKL' },
            { id: 'POA', name: getMTRName('POA'), line: 'TKL' }
        ]
    },
    {
        groupName: { en: 'Tung Chung Line', tc: '東涌綫' },
        color: '#f59e0b',
        stations: [
            { id: 'HOK', name: getMTRName('HOK'), line: 'TCL' },
            { id: 'KOW', name: getMTRName('KOW'), line: 'TCL' },
            { id: 'OLY', name: getMTRName('OLY'), line: 'TCL' },
            { id: 'NAC', name: getMTRName('NAC'), line: 'TCL' },
            { id: 'LAK', name: getMTRName('LAK'), line: 'TCL' },
            { id: 'TSY', name: getMTRName('TSY'), line: 'TCL' },
            { id: 'SUN', name: getMTRName('SUN'), line: 'TCL' },
            { id: 'TUC', name: getMTRName('TUC'), line: 'TCL' }
        ]
    },
    {
        groupName: { en: 'Airport Express', tc: '機場快綫' },
        color: '#0d9488',
        stations: [
            { id: 'HOK', name: getMTRName('HOK'), line: 'AEL' },
            { id: 'KOW', name: getMTRName('KOW'), line: 'AEL' },
            { id: 'TSY', name: getMTRName('TSY'), line: 'AEL' },
            { id: 'AIR', name: getMTRName('AIR'), line: 'AEL' },
            { id: 'AWE', name: getMTRName('AWE'), line: 'AEL' }
        ]
    },
    {
        groupName: { en: 'East Rail Line', tc: '東鐵綫' },
        color: '#0ea5e9',
        stations: [
            { id: 'ADM', name: getMTRName('ADM'), line: 'EAL' },
            { id: 'EXC', name: getMTRName('EXC'), line: 'EAL' },
            { id: 'HUH', name: getMTRName('HUH'), line: 'EAL' },
            { id: 'MKK', name: getMTRName('MKK'), line: 'EAL' },
            { id: 'KOT', name: getMTRName('KOT'), line: 'EAL' },
            { id: 'TAW', name: getMTRName('TAW'), line: 'EAL' },
            { id: 'SHT', name: getMTRName('SHT'), line: 'EAL' },
            { id: 'FOT', name: getMTRName('FOT'), line: 'EAL' },
            { id: 'RAC', name: getMTRName('RAC'), line: 'EAL' },
            { id: 'UNI', name: getMTRName('UNI'), line: 'EAL' },
            { id: 'TAP', name: getMTRName('TAP'), line: 'EAL' },
            { id: 'TWO', name: getMTRName('TWO'), line: 'EAL' },
            { id: 'FAN', name: getMTRName('FAN'), line: 'EAL' },
            { id: 'SHS', name: getMTRName('SHS'), line: 'EAL' },
            { id: 'LOW', name: getMTRName('LOW'), line: 'EAL' },
            { id: 'LMC', name: getMTRName('LMC'), line: 'EAL' }
        ]
    },
    {
        groupName: { en: 'Tuen Ma Line', tc: '屯馬綫' },
        color: '#92400e',
        stations: [
            { id: 'TUM', name: getMTRName('TUM'), line: 'TML' },
            { id: 'SIH', name: getMTRName('SIH'), line: 'TML' },
            { id: 'TIS', name: getMTRName('TIS'), line: 'TML' },
            { id: 'LUM', name: getMTRName('LUM'), line: 'TML' },
            { id: 'YUL', name: getMTRName('YUL'), line: 'TML' },
            { id: 'KSR', name: getMTRName('KSR'), line: 'TML' },
            { id: 'TWW', name: getMTRName('TWW'), line: 'TML' },
            { id: 'MEF', name: getMTRName('MEF'), line: 'TML' },
            { id: 'NAC', name: getMTRName('NAC'), line: 'TML' },
            { id: 'AUS', name: getMTRName('AUS'), line: 'TML' },
            { id: 'ETS', name: getMTRName('ETS'), line: 'TML' },
            { id: 'HUH', name: getMTRName('HUH'), line: 'TML' },
            { id: 'HOM', name: getMTRName('HOM'), line: 'TML' },
            { id: 'TKW', name: getMTRName('TKW'), line: 'TML' },
            { id: 'KAT', name: getMTRName('KAT'), line: 'TML' },
            { id: 'DIH', name: getMTRName('DIH'), line: 'TML' },
            { id: 'HIK', name: getMTRName('HIK'), line: 'TML' },
            { id: 'TAW', name: getMTRName('TAW'), line: 'TML' },
            { id: 'CKT', name: getMTRName('CKT'), line: 'TML' },
            { id: 'STW', name: getMTRName('STW'), line: 'TML' },
            { id: 'CIO', name: getMTRName('CIO'), line: 'TML' },
            { id: 'SHF', name: getMTRName('SHF'), line: 'TML' },
            { id: 'HEO', name: getMTRName('HEO'), line: 'TML' },
            { id: 'WKS', name: getMTRName('WKS'), line: 'TML' }
        ]
    },
    {
        groupName: { en: 'Disneyland Resort Line', tc: '迪士尼綫' },
        color: '#ec4899',
        stations: [
            { id: 'SUN', name: getMTRName('SUN'), line: 'DRL' },
            { id: 'DIS', name: getMTRName('DIS'), line: 'DRL' }
        ]
    }
];

export const LRT_GROUPS: TransportGroup[] = [
    {
        groupName: '505',
        desc: { en: 'Sam Shing ↔ Siu Hong', tc: '三聖 ↔ 兆康' },
        color: '#ee1d23',
        stations: [
            { id: '920', name: { en: 'Sam Shing', tc: '三聖' } },
            { id: '270', name: { en: 'Siu Lun', tc: '兆麟' } },
            { id: '275', name: { en: 'On Ting', tc: '安定' } },
            { id: '500', name: { en: 'Town Centre', tc: '市中心' } },
            { id: '290', name: { en: 'Tuen Mun', tc: '屯門' } },
            { id: '300', name: { en: 'Pui To', tc: '杯渡' } },
            { id: '310', name: { en: 'Ho Tin', tc: '河田' } },
            { id: '320', name: { en: 'Choy Yee Bridge', tc: '蔡意橋' } },
            { id: '330', name: { en: 'Affluence', tc: '澤豐' } },
            { id: '340', name: { en: 'Tuen Mun Hospital', tc: '屯門醫院' } },
            { id: '100', name: { en: 'Siu Hong', tc: '兆康' } }
        ]
    },
    {
        groupName: '507',
        desc: { en: 'Tuen Mun Ferry Pier ↔ Tin King', tc: '屯門碼頭 ↔ 田景' },
        color: '#00a651',
        stations: [
            { id: '1', name: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } },
            { id: '10', name: { en: 'Siu Hei', tc: '兆禧' } },
            { id: '20', name: { en: 'Tuen Mun Swimming Pool', tc: '屯門泳池' } },
            { id: '30', name: { en: 'Goodview Garden', tc: '豐景園' } },
            { id: '270', name: { en: 'Siu Lun', tc: '兆麟' } },
            { id: '275', name: { en: 'On Ting', tc: '安定' } },
            { id: '500', name: { en: 'Town Centre', tc: '市中心' } },
            { id: '290', name: { en: 'Tuen Mun', tc: '屯門' } },
            { id: '300', name: { en: 'Pui To', tc: '杯渡' } },
            { id: '310', name: { en: 'Ho Tin', tc: '河田' } },
            { id: '320', name: { en: 'Choy Yee Bridge', tc: '蔡意橋' } },
            { id: '330', name: { en: 'Affluence', tc: '澤豐' } },
            { id: '340', name: { en: 'Tuen Mun Hospital', tc: '屯門醫院' } },
            { id: '100', name: { en: 'Siu Hong', tc: '兆康' } },
            { id: '110', name: { en: 'Kei Lun', tc: '麒麟' } },
            { id: '120', name: { en: 'Ching Chung', tc: '青松' } },
            { id: '130', name: { en: 'Kin Sang', tc: '建生' } },
            { id: '140', name: { en: 'Tin King', tc: '田景' } }
        ]
    },
    {
        groupName: '610',
        desc: { en: 'Tuen Mun Ferry Pier ↔ Yuen Long', tc: '屯門碼頭 ↔ 元朗' },
        color: '#934f2d',
        stations: [
            { id: '1', name: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } },
            { id: '15', name: { en: 'Melody Garden', tc: '美樂' } },
            { id: '20', name: { en: 'Butterfly', tc: '蝴蝶' } },
            { id: '30', name: { en: 'Light Rail Depot', tc: '輕鐵車廠' } },
            { id: '40', name: { en: 'Lung Mun', tc: '龍門' } },
            { id: '50', name: { en: 'Ching Yee', tc: '翠寧' } },
            { id: '60', name: { en: 'Shek Pai', tc: '石排' } },
            { id: '70', name: { en: 'Shan King (South)', tc: '山景 (南)' } },
            { id: '80', name: { en: 'Shan King (North)', tc: '山景 (北)' } },
            { id: '100', name: { en: 'Siu Hong', tc: '兆康' } },
            { id: '160', name: { en: 'Lam Tei', tc: '藍地' } },
            { id: '170', name: { en: 'Nai Wai', tc: '泥圍' } },
            { id: '180', name: { en: 'Chung Uk Tsuen', tc: '鍾屋村' } },
            { id: '190', name: { en: 'Hung Shui Kiu', tc: '洪水橋' } },
            { id: '600', name: { en: 'Tong Fong Tsuen', tc: '塘坊村' } },
            { id: '560', name: { en: 'Ping Shan', tc: '屏山' } },
            { id: '570', name: { en: 'Shui Pin Wai', tc: '水邊圍' } },
            { id: '580', name: { en: 'Fung Nin Road', tc: '豐年路' } },
            { id: '590', name: { en: 'Hong Lok Road', tc: '康樂路' } },
            { id: '600', name: { en: 'Tai Tong Road', tc: '大棠路' } },
            { id: '550', name: { en: 'Yuen Long', tc: '元朗' } }
        ]
    },
    {
        groupName: '614',
        desc: { en: 'Tuen Mun Ferry Pier ↔ Yuen Long', tc: '屯門碼頭 ↔ 元朗' },
        color: '#ffd400',
        stations: [
            { id: '1', name: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } },
            { id: '10', name: { en: 'Siu Hei', tc: '兆禧' } },
            { id: '20', name: { en: 'Tuen Mun Swimming Pool', tc: '屯門泳池' } },
            { id: '30', name: { en: 'Goodview Garden', tc: '豐景園' } },
            { id: '270', name: { en: 'Siu Lun', tc: '兆麟' } },
            { id: '275', name: { en: 'On Ting', tc: '安定' } },
            { id: '500', name: { en: 'Town Centre', tc: '市中心' } },
            { id: '300', name: { en: 'Pui To', tc: '杯渡' } },
            { id: '210', name: { en: 'Hoh Fuk Tong', tc: '何福堂' } },
            { id: '220', name: { en: 'San Hui', tc: '新墟' } },
            { id: '240', name: { en: 'Prime View', tc: '景峰' } },
            { id: '270', name: { en: 'Fung Tei', tc: '鳳地' } },
            { id: '100', name: { en: 'Siu Hong', tc: '兆康' } },
            { id: '160', name: { en: 'Lam Tei', tc: '藍地' } },
            { id: '170', name: { en: 'Nai Wai', tc: '泥圍' } },
            { id: '180', name: { en: 'Chung Uk Tsuen', tc: '鍾屋村' } },
            { id: '190', name: { en: 'Hung Shui Kiu', tc: '洪水橋' } },
            { id: '600', name: { en: 'Tong Fong Tsuen', tc: '塘坊村' } },
            { id: '560', name: { en: 'Ping Shan', tc: '屏山' } },
            { id: '570', name: { en: 'Shui Pin Wai', tc: '水邊圍' } },
            { id: '580', name: { en: 'Fung Nin Road', tc: '豐年路' } },
            { id: '590', name: { en: 'Hong Lok Road', tc: '康樂路' } },
            { id: '600', name: { en: 'Tai Tong Road', tc: '大棠路' } },
            { id: '550', name: { en: 'Yuen Long', tc: '元朗' } }
        ]
    },
    {
        groupName: '614P',
        desc: { en: 'Tuen Mun Ferry Pier ↔ Siu Hong', tc: '屯門碼頭 ↔ 兆康' },
        color: '#ffd400',
        stations: [
            { id: '1', name: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } },
            { id: '10', name: { en: 'Siu Hei', tc: '兆禧' } },
            { id: '20', name: { en: 'Tuen Mun Swimming Pool', tc: '屯門泳池' } },
            { id: '30', name: { en: 'Goodview Garden', tc: '豐景園' } },
            { id: '270', name: { en: 'Siu Lun', tc: '兆麟' } },
            { id: '275', name: { en: 'On Ting', tc: '安定' } },
            { id: '500', name: { en: 'Town Centre', tc: '市中心' } },
            { id: '300', name: { en: 'Pui To', tc: '杯渡' } },
            { id: '210', name: { en: 'Hoh Fuk Tong', tc: '何福堂' } },
            { id: '220', name: { en: 'San Hui', tc: '新墟' } },
            { id: '240', name: { en: 'Prime View', tc: '景峰' } },
            { id: '270', name: { en: 'Fung Tei', tc: '鳳地' } },
            { id: '100', name: { en: 'Siu Hong', tc: '兆康' } }
        ]
    },
    {
        groupName: '615',
        desc: { en: 'Tuen Mun Ferry Pier ↔ Yuen Long', tc: '屯門碼頭 ↔ 元朗' },
        color: '#006eb7',
        stations: [
            { id: '1', name: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } },
            { id: '15', name: { en: 'Melody Garden', tc: '美樂' } },
            { id: '20', name: { en: 'Butterfly', tc: '蝴蝶' } },
            { id: '30', name: { en: 'Light Rail Depot', tc: '輕鐵車廠' } },
            { id: '40', name: { en: 'Lung Mun', tc: '龍門' } },
            { id: '120', name: { en: 'Tsing Shan Tsuen', tc: '青山村' } },
            { id: '130', name: { en: 'Tsing Wun', tc: '青雲' } },
            { id: '330', name: { en: 'Ming Kum', tc: '鳴琴' } },
            { id: '60', name: { en: 'Shek Pai', tc: '石排' } },
            { id: '360', name: { en: 'San Wai', tc: '新圍' } },
            { id: '300', name: { en: 'Leung King', tc: '良景' } },
            { id: '310', name: { en: 'Tin King', tc: '田景' } },
            { id: '320', name: { en: 'Kin Sang', tc: '建生' } },
            { id: '60', name: { en: 'Ching Chung', tc: '青松' } },
            { id: '100', name: { en: 'Siu Hong', tc: '兆康' } },
            { id: '550', name: { en: 'Yuen Long', tc: '元朗' } }
        ]
    },
    {
        groupName: '615P',
        desc: { en: 'Tuen Mun Ferry Pier ↔ Siu Hong', tc: '屯門碼頭 ↔ 兆康' },
        color: '#006eb7',
        stations: [
            { id: '1', name: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } },
            { id: '15', name: { en: 'Melody Garden', tc: '美樂' } },
            { id: '20', name: { en: 'Butterfly', tc: '蝴蝶' } },
            { id: '30', name: { en: 'Light Rail Depot', tc: '輕鐵車廠' } },
            { id: '40', name: { en: 'Lung Mun', tc: '龍門' } },
            { id: '120', name: { en: 'Tsing Shan Tsuen', tc: '青山村' } },
            { id: '130', name: { en: 'Tsing Wun', tc: '青雲' } },
            { id: '330', name: { en: 'Ming Kum', tc: '鳴琴' } },
            { id: '60', name: { en: 'Shek Pai', tc: '石排' } },
            { id: '360', name: { en: 'San Wai', tc: '新圍' } },
            { id: '300', name: { en: 'Leung King', tc: '良景' } },
            { id: '310', name: { en: 'Tin King', tc: '田景' } },
            { id: '320', name: { en: 'Kin Sang', tc: '建生' } },
            { id: '60', name: { en: 'Ching Chung', tc: '青松' } },
            { id: '100', name: { en: 'Siu Hong', tc: '兆康' } }
        ]
    },
    {
        groupName: '705',
        desc: { en: 'Tin Shui Wai Circular (Anti-clockwise)', tc: '天水圍循環綫 (逆時針)' },
        color: '#93c01f',
        stations: [
            { id: '150', name: { en: 'Tin Shui Wai', tc: '天水圍' } },
            { id: '100', name: { en: 'Tin Tsz', tc: '天慈' } },
            { id: '510', name: { en: 'Tin Wu', tc: '天湖' } },
            { id: '470', name: { en: 'Ginza', tc: '銀座' } },
            { id: '120', name: { en: 'Tin Wing', tc: '天榮' } },
            { id: '480', name: { en: 'Tin Yuet', tc: '天悅' } },
            { id: '435', name: { en: 'Tin Sau', tc: '天秀' } },
            { id: '550', name: { en: 'Wetland Park', tc: '濕地公園' } },
            { id: '560', name: { en: 'Tin Heng', tc: '天恒' } },
            { id: '160', name: { en: 'Tin Yat', tc: '天逸' } },
            { id: '150', name: { en: 'Tin Fu', tc: '天富' } },
            { id: '140', name: { en: 'Chung Fu', tc: '頌富' } },
            { id: '130', name: { en: 'Tin Shui', tc: '天瑞' } },
            { id: '540', name: { en: 'Locwood', tc: '樂湖' } },
            { id: '530', name: { en: 'Tin Yiu', tc: '天耀' } }
        ]
    },
    {
        groupName: '706',
        desc: { en: 'Tin Shui Wai Circular (Clockwise)', tc: '天水圍循環綫 (順時針)' },
        color: '#b8cc00',
        stations: [
            { id: '150', name: { en: 'Tin Shui Wai', tc: '天水圍' } },
            { id: '530', name: { en: 'Tin Yiu', tc: '天耀' } },
            { id: '540', name: { en: 'Locwood', tc: '樂湖' } },
            { id: '130', name: { en: 'Tin Shui', tc: '天瑞' } },
            { id: '140', name: { en: 'Chung Fu', tc: '頌富' } },
            { id: '150', name: { en: 'Tin Fu', tc: '天富' } },
            { id: '160', name: { en: 'Tin Yat', tc: '天逸' } },
            { id: '560', name: { en: 'Tin Heng', tc: '天恒' } },
            { id: '550', name: { en: 'Wetland Park', tc: '濕地公園' } },
            { id: '435', name: { en: 'Tin Sau', tc: '天秀' } },
            { id: '480', name: { en: 'Tin Yuet', tc: '天悅' } },
            { id: '120', name: { en: 'Tin Wing', tc: '天榮' } },
            { id: '470', name: { en: 'Ginza', tc: '銀座' } },
            { id: '510', name: { en: 'Tin Wu', tc: '天湖' } },
            { id: '100', name: { en: 'Tin Tsz', tc: '天慈' } }
        ]
    },
    {
        groupName: '751',
        desc: { en: 'Tin Yat ↔ Tuen Mun', tc: '天逸 ↔ 屯門' },
        color: '#f38f18',
        stations: [
            { id: '160', name: { en: 'Tin Yat', tc: '天逸' } },
            { id: '150', name: { en: 'Tin Fu', tc: '天富' } },
            { id: '140', name: { en: 'Chung Fu', tc: '頌富' } },
            { id: '130', name: { en: 'Tin Shui', tc: '天瑞' } },
            { id: '125', name: { en: 'Chestwood', tc: '翠湖' } },
            { id: '120', name: { en: 'Tin Wing', tc: '天榮' } },
            { id: '110', name: { en: 'Tin King', tc: '田景' } },
            { id: '100', name: { en: 'Tin Tsz', tc: '天慈' } },
            { id: '100', name: { en: 'Siu Hong', tc: '兆康' } },
            { id: '290', name: { en: 'Tuen Mun', tc: '屯門' } }
        ]
    },
    {
        groupName: '761P',
        desc: { en: 'Tin Yat ↔ Yuen Long', tc: '天逸 ↔ 元朗' },
        color: '#6b3e91',
        stations: [
            { id: '160', name: { en: 'Tin Yat', tc: '天逸' } },
            { id: '150', name: { en: 'Tin Fu', tc: '天富' } },
            { id: '140', name: { en: 'Chung Fu', tc: '頌富' } },
            { id: '130', name: { en: 'Tin Shui', tc: '天瑞' } },
            { id: '540', name: { en: 'Locwood', tc: '樂湖' } },
            { id: '530', name: { en: 'Tin Yiu', tc: '天耀' } },
            { id: '210', name: { en: 'Hang Mei Tsuen', tc: '坑尾村' } },
            { id: '600', name: { en: 'Tong Fong Tsuen', tc: '塘坊村' } },
            { id: '560', name: { en: 'Ping Shan', tc: '屏山' } },
            { id: '570', name: { en: 'Shui Pin Wai', tc: '水邊圍' } },
            { id: '580', name: { en: 'Fung Nin Road', tc: '豐年路' } },
            { id: '590', name: { en: 'Hong Lok Road', tc: '康樂路' } },
            { id: '600', name: { en: 'Tai Tong Road', tc: '大棠路' } },
            { id: '550', name: { en: 'Yuen Long', tc: '元朗' } }
        ]
    }
];

export const BUS_GROUPS: TransportGroup[] = [
    {
        groupName: '506',
        desc: { en: 'Tuen Mun Ferry Pier - Siu Lun', tc: '屯門碼頭 - 兆麟' },
        color: 'var(--bus-color)',
        stations: [
            { id: '506-D010', name: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } },
            { id: '506-D020', name: { en: 'Siu Hei', tc: '兆禧' } },
            { id: '506-D030', name: { en: 'Tuen Mun Swimming Pool', tc: '屯門泳池' } },
            { id: '506-D040', name: { en: 'Goodview Garden', tc: '豐景園' } },
            { id: '506-D130', name: { en: 'Tuen Mun Station', tc: '屯門站' } }
        ]
    },
    {
        groupName: 'K12',
        desc: { en: 'MTR Tai Po Market Station - Eightland Gardens', tc: '港鐵大埔墟站 - 八號花園' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K12-D010', name: { en: 'Eightland Garden', tc: '八號花園' } },
            { id: 'K12-D040', name: { en: 'Tai Po Market Station', tc: '大埔墟站' } }
        ]
    },
    {
        groupName: 'K14',
        desc: { en: 'Tai Po Centre to MTR Tai Po Market Station (One Way)', tc: '大埔中心往港鐵大埔墟站（單向）' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K14-D010', name: { en: 'Tai Po Mega Mall', tc: '大埔超級城' } },
            { id: 'K14-D030', name: { en: 'Tai Po Market Station', tc: '大埔墟站' } }
        ]
    },
    {
        groupName: 'K17',
        desc: { en: 'MTR Tai Po Market Station - Fu Shin', tc: '港鐵大埔墟站 - 富善' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K17-D010', name: { en: 'Fu Shin', tc: '富善' } },
            { id: 'K17-D030', name: { en: 'Tai Po Market Station', tc: '大埔墟站' } }
        ]
    },
    {
        groupName: 'K18',
        desc: { en: 'MTR Tai Po Market Station - Kwong Fuk', tc: '港鐵大埔墟站 - 廣福' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K18-D010', name: { en: 'Kwong Fuk', tc: '廣福' } },
            { id: 'K18-D030', name: { en: 'Tai Po Market Station', tc: '大埔墟站' } }
        ]
    },
    {
        groupName: 'K51',
        desc: { en: 'Fu Tai - Tai Lam', tc: '富泰 - 大欖' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K51-D010', name: { en: 'Fu Tai', tc: '富泰' } },
            { id: 'K51-D180', name: { en: 'Tuen Mun Ferry Pier', tc: '屯門碼頭' } }
        ]
    },
    {
        groupName: 'K52',
        desc: { en: 'Tuen Mun Station ↔ Lung Kwu Tan', tc: '屯門站 ↔ 龍鼓灘' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K52-D010', name: { en: 'Tuen Mun Station', tc: '屯門站' } },
            { id: 'K52-D200', name: { en: 'Lung Kwu Tan', tc: '龍鼓灘' } }
        ]
    },
    {
        groupName: 'K53',
        desc: { en: 'MTR Tuen Mun Station - So Kwun Wat (Circular)', tc: '港鐵屯門站 - 掃管笏（循環線）' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K53-D010', name: { en: 'Tuen Mun Station', tc: '屯門站' } },
            { id: 'K53-D100', name: { en: 'So Kwun Wat', tc: '掃管笏' } }
        ]
    },
    {
        groupName: 'K54',
        desc: { en: 'Wo Tin Estate - MTR Tuen Mun Station (Circular)', tc: '和田邨 - 港鐵屯門站（循環線）' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K54-D010', name: { en: 'Tuen Mun Town Plaza', tc: '屯門市廣場' } },
            { id: 'K54-D070', name: { en: 'Wo Tin Estate', tc: '和田邨' } }
        ]
    },
    {
        groupName: 'K58',
        desc: { en: 'Fu Tai - Castle Peak Bay', tc: '富泰 - 青山灣' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K58-D001', name: { en: 'So Kwun Wat Tsuen', tc: '掃管笏村' } },
            { id: 'K58-D210', name: { en: 'Fu Tai', tc: '富泰' } }
        ]
    },
    {
        groupName: 'K65',
        desc: { en: 'MTR Yuen Long Station - Lau Fau Shan', tc: '港鐵元朗站 - 流浮山' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K65-D010', name: { en: 'Lau Fau Shan', tc: '流浮山' } },
            { id: 'K65-D020', name: { en: 'Hang Hau Tsuen', tc: '坑口村' } },
            { id: 'K65-D040', name: { en: 'Sha Kong Hui', tc: '沙江圍' } },
            { id: 'K65-D060', name: { en: 'Shing Uk Tsuen', tc: '盛屋村' } },
            { id: 'K65-D150', name: { en: 'Yuen Long (East)', tc: '元朗 (東)' } }
        ]
    },
    {
        groupName: 'K66',
        desc: { en: 'Long Ping - Tai Tong Wong Nai Tun Tsuen', tc: '朗屏 - 大棠黃泥墩村' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K66-D010', name: { en: 'Tai Tong', tc: '大棠' } },
            { id: 'K66-D160', name: { en: 'Long Ping', tc: '朗屏' } }
        ]
    },
    {
        groupName: 'K68',
        desc: { en: 'Yuen Long Industrial Estate - Yuen Long Park (Circular)', tc: '元朗工業邨 - 元朗公園（循環線）' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K68-D010', name: { en: 'Yuen Long Industrial Estate', tc: '元朗工業邨' } },
            { id: 'K68-D100', name: { en: 'Yuen Long Town', tc: '元朗市' } }
        ]
    },
    {
        groupName: 'K73',
        desc: { en: 'Tin Heng - Yuen Long West', tc: '天恆 - 元朗西' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K73-D010', name: { en: 'Tin Heng', tc: '天恆' } },
            { id: 'K73-D150', name: { en: 'Yuen Long Town', tc: '元朗市' } }
        ]
    },
    {
        groupName: 'K74',
        desc: { en: 'Tin Shui Wai Town Centre - Au Tau (Circular)', tc: '天水圍市中心 - 凹頭（循環線）' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K74-D010', name: { en: 'Tin Shui', tc: '天瑞' } },
            { id: 'K74-D100', name: { en: 'Yuen Long Town', tc: '元朗市' } }
        ]
    },
    {
        groupName: 'K75P',
        desc: { en: 'Tin Shui - Hung Shui Kiu (Circular)', tc: '天水 - 洪水橋（循環線）' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K75P-D010', name: { en: 'Tin Shui', tc: '天瑞' } },
            { id: 'K75P-D080', name: { en: 'Hung Shui Kiu', tc: '洪水橋' } }
        ]
    },
    {
        groupName: 'K76',
        desc: { en: 'Tin Heng - MTR Tin Shui Wai Station', tc: '天恆 - 港鐵天水圍站' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K76-D010', name: { en: 'Tin Shui Wai Station', tc: '天水圍站' } },
            { id: 'K76-D020', name: { en: 'Tin Yan Estate', tc: '天恩邨' } },
            { id: 'K76-D040', name: { en: 'Tin Heng', tc: '天恆' } }
        ]
    },
    {
        groupName: 'K51A',
        desc: { en: 'Fu Tai - So Kwun Wat', tc: '富泰 - 掃管笏' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K51A-D010', name: { en: 'So Kwun Wat Tsuen', tc: '掃管笏村' } }
        ]
    },
    {
        groupName: 'K52A',
        desc: { en: 'MTR Tuen Mun Station - Tsang Tsui', tc: '港鐵屯門站 - 曾咀' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K52A-D010', name: { en: 'Tsang Tsui Columbarium', tc: '曾咀靈灰安置所' } }
        ]
    },
    {
        groupName: 'K52P',
        desc: { en: 'Lung Kwu Tan → Tuen Mun Station', tc: '龍鼓灘 → 屯門站' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K52P-D010', name: { en: 'Lung Kwu Tan', tc: '龍鼓灘' } },
            { id: 'K52P-D250', name: { en: 'Tuen Mun Station', tc: '屯門站' } }
        ]
    },
    {
        groupName: 'K53S',
        desc: { en: 'Tuen Mun Station ↺', tc: '屯門站 ↺' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K53S-U010', name: { en: 'Tuen Mun Station', tc: '屯門站' } }
        ]
    },
    {
        groupName: 'K54A',
        desc: { en: 'Wo Tin Estate - MTR Siu Hong Station', tc: '和田邨 - 港鐵兆康站' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K54A-D010', name: { en: 'MTR Siu Hong Station (North)', tc: '港鐵兆康站 (北)' } }
        ]
    },
    {
        groupName: 'K65A',
        desc: { en: 'MTR Tin Shui Wai Station - Lau Fau Shan', tc: '港鐵天水圍站 - 流浮山' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K65A-D010', name: { en: 'Lau Fau Shan', tc: '流浮山' } },
            { id: 'K65A-D110', name: { en: 'Tin Shui Wai Station', tc: '天水圍站' } }
        ]
    },
    {
        groupName: 'K75A',
        desc: { en: 'Tin Shui Wai Station - Hung Shui Kiu', tc: '天水圍站 - 洪水橋' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K75A-D010', name: { en: 'LR Hung Shui Kiu Stop', tc: '輕鐵洪水橋站' } },
            { id: 'K75A-U030', name: { en: 'Shek Po Tsuen', tc: '石埗村' } }
        ]
    },
    {
        groupName: 'K75S',
        desc: { en: 'Hung Fuk Estate ↔ Hung Shui Kiu Bus Depot', tc: '洪福邨 ↔ 洪水橋巴士廠' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K75S-D010', name: { en: 'Hung Fuk Estate', tc: '洪福邨' } },
            { id: 'K75S-U040', name: { en: 'Hung Shui Kiu Bus Depot', tc: '洪水橋巴士廠' } }
        ]
    },
    {
        groupName: 'K76S',
        desc: { en: 'Tin Shui Wai Station ↔ Tin Shing Court', tc: '天水圍站 ↔ 天盛苑' },
        color: 'var(--bus-color)',
        stations: [
            { id: 'K76S-D010', name: { en: 'Tin Shui Wai Station', tc: '天水圍站' } },
            { id: 'K76S-U040', name: { en: 'Tin Shing Court', tc: '天盛苑' } }
        ]
    }
];


