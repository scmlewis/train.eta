/**
 * Static station/stop coordinates for geolocation nearest-station lookups.
 * Coordinates sourced from MTRCL/HKSAR public data, accurate to ~50 m.
 *
 * MTR  → keyed by station ID (globally unique, e.g. "TUC")
 * LRT  → keyed by English stop name (stop IDs are route-local, not globally unique)
 * BUS  → keyed by stop ID (e.g. "K65-D010")
 */

export const MTR_STATION_COORDS: Record<string, { lat: number; lng: number }> = {
    // --- Kwun Tong Line ---
    WHA: { lat: 22.3052, lng: 114.1897 }, // Whampoa
    HOM: { lat: 22.3090, lng: 114.1824 }, // Ho Man Tin
    YMT: { lat: 22.3127, lng: 114.1705 }, // Yau Ma Tei
    MOK: { lat: 22.3192, lng: 114.1693 }, // Mong Kok
    PRE: { lat: 22.3247, lng: 114.1683 }, // Prince Edward
    SKM: { lat: 22.3316, lng: 114.1677 }, // Shek Kip Mei
    KOT: { lat: 22.3365, lng: 114.1762 }, // Kowloon Tong
    LOF: { lat: 22.3387, lng: 114.1872 }, // Lok Fu
    DIH: { lat: 22.3403, lng: 114.2011 }, // Diamond Hill
    CHH: { lat: 22.3356, lng: 114.2128 }, // Choi Hung
    KOB: { lat: 22.3233, lng: 114.2137 }, // Kowloon Bay
    NTK: { lat: 22.3153, lng: 114.2190 }, // Ngau Tau Kok
    KWT: { lat: 22.3124, lng: 114.2266 }, // Kwun Tong
    LAT: { lat: 22.3075, lng: 114.2331 }, // Lam Tin
    YAT: { lat: 22.2977, lng: 114.2363 }, // Yau Tong
    TIK: { lat: 22.3049, lng: 114.2526 }, // Tiu Keng Leng

    // --- Tsuen Wan Line (new entries only) ---
    CEN: { lat: 22.2820, lng: 114.1583 }, // Central
    ADM: { lat: 22.2793, lng: 114.1650 }, // Admiralty
    TST: { lat: 22.2973, lng: 114.1718 }, // Tsim Sha Tsui
    JOR: { lat: 22.3050, lng: 114.1719 }, // Jordan
    SSP: { lat: 22.3308, lng: 114.1627 }, // Sham Shui Po
    CSW: { lat: 22.3354, lng: 114.1561 }, // Cheung Sha Wan
    LCK: { lat: 22.3374, lng: 114.1483 }, // Lai Chi Kok
    MEF: { lat: 22.3385, lng: 114.1396 }, // Mei Foo
    LAK: { lat: 22.3488, lng: 114.1264 }, // Lai King
    KWF: { lat: 22.3573, lng: 114.1309 }, // Kwai Fong
    KWH: { lat: 22.3634, lng: 114.1310 }, // Kwai Hing
    TWH: { lat: 22.3704, lng: 114.1257 }, // Tai Wo Hau
    TSW: { lat: 22.3725, lng: 114.1199 }, // Tsuen Wan

    // --- Island Line (new entries only) ---
    KET: { lat: 22.2811, lng: 114.1280 }, // Kennedy Town
    HKU: { lat: 22.2843, lng: 114.1355 }, // HKU
    SYP: { lat: 22.2858, lng: 114.1424 }, // Sai Ying Pun
    SHW: { lat: 22.2870, lng: 114.1509 }, // Sheung Wan
    WAC: { lat: 22.2783, lng: 114.1729 }, // Wan Chai
    CAB: { lat: 22.2800, lng: 114.1843 }, // Causeway Bay
    TIH: { lat: 22.2834, lng: 114.1908 }, // Tin Hau
    FOH: { lat: 22.2877, lng: 114.1956 }, // Fortress Hill
    NOP: { lat: 22.2909, lng: 114.1993 }, // North Point
    QUB: { lat: 22.2885, lng: 114.2090 }, // Quarry Bay
    TAK: { lat: 22.2842, lng: 114.2159 }, // Tai Koo
    SWH: { lat: 22.2814, lng: 114.2221 }, // Sai Wan Ho
    SKW: { lat: 22.2791, lng: 114.2292 }, // Shau Kei Wan
    HFC: { lat: 22.2757, lng: 114.2395 }, // Heng Fa Chuen
    CHW: { lat: 22.2649, lng: 114.2369 }, // Chai Wan

    // --- South Island Line (new entries only) ---
    OCP: { lat: 22.2487, lng: 114.1753 }, // Ocean Park
    WCH: { lat: 22.2430, lng: 114.1713 }, // Wong Chuk Hang
    LET: { lat: 22.2444, lng: 114.1601 }, // Lei Tung
    SOH: { lat: 22.2418, lng: 114.1436 }, // South Horizons

    // --- Tseung Kwan O Line (new entries only) ---
    TKO: { lat: 22.3075, lng: 114.2603 }, // Tseung Kwan O
    LHP: { lat: 22.2958, lng: 114.2681 }, // LOHAS Park
    HAH: { lat: 22.3155, lng: 114.2700 }, // Hang Hau
    POA: { lat: 22.3213, lng: 114.2620 }, // Po Lam

    // --- Tung Chung Line (new entries only) ---
    HOK: { lat: 22.2850, lng: 114.1580 }, // Hong Kong
    KOW: { lat: 22.3043, lng: 114.1614 }, // Kowloon
    OLY: { lat: 22.3197, lng: 114.1602 }, // Olympic
    NAC: { lat: 22.3267, lng: 114.1546 }, // Nam Cheong
    TSY: { lat: 22.3580, lng: 114.1083 }, // Tsing Yi
    SUN: { lat: 22.3257, lng: 114.0434 }, // Sunny Bay
    TUC: { lat: 22.2858, lng: 113.9433 }, // Tung Chung

    // --- Airport Express (new entries only) ---
    AIR: { lat: 22.3155, lng: 113.9356 }, // Airport
    AWE: { lat: 22.3185, lng: 113.9262 }, // AsiaWorld-Expo

    // --- East Rail Line (new entries only) ---
    EXC: { lat: 22.2833, lng: 114.1757 }, // Exhibition Centre
    HUH: { lat: 22.3026, lng: 114.1821 }, // Hung Hom
    MKK: { lat: 22.3226, lng: 114.1776 }, // Mong Kok East
    TAW: { lat: 22.3730, lng: 114.1780 }, // Tai Wai
    SHT: { lat: 22.3841, lng: 114.1875 }, // Sha Tin
    FOT: { lat: 22.3946, lng: 114.1979 }, // Fo Tan
    RAC: { lat: 22.4026, lng: 114.2006 }, // Racecourse
    UNI: { lat: 22.4133, lng: 114.2098 }, // University
    TAP: { lat: 22.4462, lng: 114.1709 }, // Tai Po Market
    TWO: { lat: 22.4514, lng: 114.1604 }, // Tai Wo
    FAN: { lat: 22.4920, lng: 114.1387 }, // Fanling
    SHS: { lat: 22.5015, lng: 114.1256 }, // Sheung Shui
    LOW: { lat: 22.5277, lng: 114.1148 }, // Lo Wu
    LMC: { lat: 22.5102, lng: 114.0828 }, // Lok Ma Chau

    // --- Tuen Ma Line (new entries only) ---
    TUM: { lat: 22.3949, lng: 113.9758 }, // Tuen Mun
    SIH: { lat: 22.4080, lng: 113.9908 }, // Siu Hong
    TIS: { lat: 22.4473, lng: 114.0028 }, // Tin Shui Wai
    LUM: { lat: 22.4460, lng: 114.0253 }, // Long Ping
    YUL: { lat: 22.4454, lng: 114.0355 }, // Yuen Long
    KSR: { lat: 22.4361, lng: 114.0650 }, // Kam Sheung Road
    TWW: { lat: 22.3666, lng: 114.1096 }, // Tsuen Wan West
    AUS: { lat: 22.3034, lng: 114.1663 }, // Austin
    ETS: { lat: 22.2968, lng: 114.1754 }, // East Tsim Sha Tsui
    TKW: { lat: 22.3184, lng: 114.1874 }, // To Kwa Wan
    KAT: { lat: 22.3312, lng: 114.2082 }, // Kai Tak
    HIK: { lat: 22.3628, lng: 114.1693 }, // Hin Keng
    CKT: { lat: 22.3792, lng: 114.1835 }, // Che Kung Temple
    STW: { lat: 22.3765, lng: 114.1945 }, // Sha Tin Wai
    CIO: { lat: 22.3820, lng: 114.2077 }, // City One
    SHF: { lat: 22.3888, lng: 114.2095 }, // Shek Mun
    HEO: { lat: 22.4118, lng: 114.2161 }, // Heng On
    WKS: { lat: 22.4283, lng: 114.2404 }, // Wu Kai Sha

    // --- Disneyland Resort Line ---
    DIS: { lat: 22.3127, lng: 114.0435 }, // Disneyland Resort
};

/**
 * LRT stop coordinates keyed by English stop name.
 * Where the same name appears in different geographic areas, the more
 * common/major location is used.  All stops are in the Tuen Mun /
 * Yuen Long / Tin Shui Wai district of NT West.
 */
export const LRT_STOP_COORDS: Record<string, { lat: number; lng: number }> = {
    // --- Tuen Mun area ---
    'Sam Shing':            { lat: 22.3785, lng: 113.9596 },
    'Tuen Mun Ferry Pier':  { lat: 22.3708, lng: 113.9666 },
    'Melody Garden':        { lat: 22.3745, lng: 113.9719 },
    'Butterfly':            { lat: 22.3757, lng: 113.9686 },
    'Light Rail Depot':     { lat: 22.3765, lng: 113.9693 },
    'Lung Mun':             { lat: 22.3741, lng: 113.9684 },
    'Ching Yee':            { lat: 22.3730, lng: 113.9709 },
    'Shek Pai':             { lat: 22.3800, lng: 113.9750 },
    'Shan King (South)':    { lat: 22.3898, lng: 113.9717 },
    'Shan King (North)':    { lat: 22.3920, lng: 113.9703 },
    'Siu Hei':              { lat: 22.3890, lng: 113.9613 },
    'Tuen Mun Swimming Pool': { lat: 22.3858, lng: 113.9617 },
    'Goodview Garden':      { lat: 22.3820, lng: 113.9640 },
    'Siu Lun':              { lat: 22.3983, lng: 113.9783 },
    'On Ting':              { lat: 22.3966, lng: 113.9717 },
    'Town Centre':          { lat: 22.3923, lng: 113.9771 },
    'Tuen Mun':             { lat: 22.3949, lng: 113.9758 },
    'Pui To':               { lat: 22.3899, lng: 113.9730 },
    'Ho Tin':               { lat: 22.3840, lng: 113.9763 },
    'Choy Yee Bridge':      { lat: 22.3784, lng: 113.9764 },
    'Affluence':            { lat: 22.3738, lng: 113.9769 },
    'Tuen Mun Hospital':    { lat: 22.3680, lng: 113.9737 },
    'Hoh Fuk Tong':         { lat: 22.3971, lng: 113.9820 },
    'San Hui':              { lat: 22.4050, lng: 113.9840 },
    'Prime View':           { lat: 22.4064, lng: 113.9870 },
    'Fung Tei':             { lat: 22.4076, lng: 113.9886 },
    'Tsing Shan Tsuen':     { lat: 22.3765, lng: 113.9702 },
    'Tsing Wun':            { lat: 22.3782, lng: 113.9708 },
    'Ming Kum':             { lat: 22.3792, lng: 113.9722 },
    'San Wai':              { lat: 22.3812, lng: 113.9742 },
    'Leung King':           { lat: 22.3855, lng: 113.9762 },
    // --- Siu Hong / Tin Shui Wai transition ---
    'Siu Hong':             { lat: 22.4080, lng: 113.9908 },
    'Kei Lun':              { lat: 22.4128, lng: 113.9919 },
    'Ching Chung':          { lat: 22.4155, lng: 113.9897 },
    'Kin Sang':             { lat: 22.4204, lng: 113.9882 },
    'Tin King':             { lat: 22.4253, lng: 113.9935 },
    'Lam Tei':              { lat: 22.4299, lng: 113.9950 },
    'Nai Wai':              { lat: 22.4349, lng: 113.9975 },
    'Chung Uk Tsuen':       { lat: 22.4349, lng: 113.9975 },
    'Hung Shui Kiu':        { lat: 22.4385, lng: 114.0003 },
    // --- Yuen Long area ---
    'Tong Fong Tsuen':      { lat: 22.4463, lng: 114.0280 },
    'Ping Shan':            { lat: 22.4416, lng: 114.0475 },
    'Shui Pin Wai':         { lat: 22.4452, lng: 114.0481 },
    'Fung Nin Road':        { lat: 22.4441, lng: 114.0415 },
    'Hong Lok Road':        { lat: 22.4452, lng: 114.0390 },
    'Tai Tong Road':        { lat: 22.4460, lng: 114.0365 },
    'Yuen Long':            { lat: 22.4454, lng: 114.0355 },
    // --- Tin Shui Wai area ---
    'Tin Shui Wai':         { lat: 22.4590, lng: 114.0040 },
    'Tin Tsz':              { lat: 22.4580, lng: 113.9975 },
    'Tin Wu':               { lat: 22.4602, lng: 114.0055 },
    'Ginza':                { lat: 22.4560, lng: 114.0060 },
    'Tin Wing':             { lat: 22.4527, lng: 114.0020 },
    'Tin Yuet':             { lat: 22.4540, lng: 114.0040 },
    'Tin Sau':              { lat: 22.4510, lng: 114.0038 },
    'Wetland Park':         { lat: 22.4665, lng: 114.0055 },
    'Tin Heng':             { lat: 22.4520, lng: 114.0075 },
    'Tin Yat':              { lat: 22.4565, lng: 114.0008 },
    'Tin Fu':               { lat: 22.4547, lng: 113.9993 },
    'Chung Fu':             { lat: 22.4535, lng: 113.9975 },
    'Tin Shui':             { lat: 22.4590, lng: 114.0040 },
    'Locwood':              { lat: 22.4556, lng: 114.0083 },
    'Tin Yiu':              { lat: 22.4578, lng: 114.0103 },
    'Chestwood':            { lat: 22.4510, lng: 113.9928 },
    'Hang Mei Tsuen':       { lat: 22.4470, lng: 114.0140 },
};

/**
 * Bus stop coordinates keyed by stop ID (e.g. "K65-D010").
 * Covers the representative terminal / key stops that appear in BUS_GROUPS.
 */
export const BUS_STOP_COORDS: Record<string, { lat: number; lng: number }> = {
    // Route 506
    '506-D010': { lat: 22.3708, lng: 113.9666 }, // Tuen Mun Ferry Pier
    '506-D020': { lat: 22.3890, lng: 113.9613 }, // Siu Hei
    '506-D030': { lat: 22.3858, lng: 113.9617 }, // Tuen Mun Swimming Pool
    '506-D040': { lat: 22.3820, lng: 113.9640 }, // Goodview Garden
    '506-D130': { lat: 22.3949, lng: 113.9758 }, // Tuen Mun Station
    // Route K12
    'K12-D010': { lat: 22.4483, lng: 114.1620 }, // Eightland Garden
    'K12-D040': { lat: 22.4462, lng: 114.1709 }, // Tai Po Market Station
    // Route K14
    'K14-D010': { lat: 22.4505, lng: 114.1711 }, // Tai Po Mega Mall
    'K14-D030': { lat: 22.4462, lng: 114.1709 }, // Tai Po Market Station
    // Route K17
    'K17-D010': { lat: 22.4587, lng: 114.1744 }, // Fu Shin
    'K17-D030': { lat: 22.4462, lng: 114.1709 }, // Tai Po Market Station
    // Route K18
    'K18-D010': { lat: 22.4524, lng: 114.1660 }, // Kwong Fuk
    'K18-D030': { lat: 22.4462, lng: 114.1709 }, // Tai Po Market Station
    // Route K51
    'K51-D010': { lat: 22.3960, lng: 113.9806 }, // Fu Tai
    'K51-D180': { lat: 22.3708, lng: 113.9666 }, // Tuen Mun Ferry Pier
    // Route K52
    'K52-D010': { lat: 22.3949, lng: 113.9758 }, // Tuen Mun Station
    'K52-D200': { lat: 22.4007, lng: 113.9387 }, // Lung Kwu Tan
    // Route K53
    'K53-D010': { lat: 22.3949, lng: 113.9758 }, // Tuen Mun Station
    'K53-D100': { lat: 22.3899, lng: 113.9506 }, // So Kwun Wat
    // Route K54
    'K54-D010': { lat: 22.3936, lng: 113.9747 }, // Tuen Mun Town Plaza
    'K54-D070': { lat: 22.4025, lng: 113.9637 }, // Wo Tin Estate
    // Route K58
    'K58-D001': { lat: 22.3899, lng: 113.9506 }, // So Kwun Wat Tsuen
    'K58-D210': { lat: 22.3960, lng: 113.9806 }, // Fu Tai
    // Route K65
    'K65-D010': { lat: 22.4683, lng: 113.9917 }, // Lau Fau Shan
    'K65-D020': { lat: 22.4698, lng: 113.9981 }, // Hang Hau Tsuen
    'K65-D040': { lat: 22.4672, lng: 114.0123 }, // Sha Kong Hui
    'K65-D060': { lat: 22.4688, lng: 114.0185 }, // Shing Uk Tsuen
    'K65-D150': { lat: 22.4454, lng: 114.0355 }, // Yuen Long (East)
    // Route K66
    'K66-D010': { lat: 22.4400, lng: 114.0655 }, // Tai Tong
    'K66-D160': { lat: 22.4460, lng: 114.0253 }, // Long Ping
    // Route K68
    'K68-D010': { lat: 22.4379, lng: 113.9952 }, // Yuen Long Industrial Estate
    'K68-D100': { lat: 22.4454, lng: 114.0355 }, // Yuen Long Town
    // Route K73
    'K73-D010': { lat: 22.4520, lng: 114.0075 }, // Tin Heng
    'K73-D150': { lat: 22.4454, lng: 114.0355 }, // Yuen Long Town
    // Route K74
    'K74-D010': { lat: 22.4590, lng: 114.0040 }, // Tin Shui
    'K74-D100': { lat: 22.4454, lng: 114.0355 }, // Yuen Long Town
    // Route K75P
    'K75P-D010': { lat: 22.4590, lng: 114.0040 }, // Tin Shui
    'K75P-D080': { lat: 22.4385, lng: 114.0003 }, // Hung Shui Kiu
    // Route K76
    'K76-D010': { lat: 22.4590, lng: 114.0040 }, // Tin Shui Wai Station
    'K76-D020': { lat: 22.4600, lng: 114.0058 }, // Tin Yan Estate
    'K76-D040': { lat: 22.4520, lng: 114.0075 }, // Tin Heng
    // Route K51A
    'K51A-D010': { lat: 22.3899, lng: 113.9506 }, // So Kwun Wat Tsuen
    // Route K52A
    'K52A-D010': { lat: 22.3850, lng: 113.9380 }, // Tsang Tsui Columbarium
    // Route K52P
    'K52P-D010': { lat: 22.4007, lng: 113.9387 }, // Lung Kwu Tan
    'K52P-D250': { lat: 22.3949, lng: 113.9758 }, // Tuen Mun Station
    // Route K53S
    'K53S-U010': { lat: 22.3949, lng: 113.9758 }, // Tuen Mun Station
    // Route K54A
    'K54A-D010': { lat: 22.4080, lng: 113.9908 }, // MTR Siu Hong Station (North)
    // Route K65A
    'K65A-D010': { lat: 22.4683, lng: 113.9917 }, // Lau Fau Shan
    'K65A-D110': { lat: 22.4590, lng: 114.0040 }, // Tin Shui Wai Station
    // Route K75A
    'K75A-D010': { lat: 22.4385, lng: 114.0003 }, // LR Hung Shui Kiu Stop
    'K75A-U030': { lat: 22.4365, lng: 114.0032 }, // Shek Po Tsuen
    // Route K75S
    'K75S-D010': { lat: 22.4518, lng: 113.9966 }, // Hung Fuk Estate
    'K75S-U040': { lat: 22.4388, lng: 113.9964 }, // Hung Shui Kiu Bus Depot
    // Route K76S
    'K76S-D010': { lat: 22.4590, lng: 114.0040 }, // Tin Shui Wai Station
    'K76S-U040': { lat: 22.4617, lng: 114.0080 }, // Tin Shing Court
};
