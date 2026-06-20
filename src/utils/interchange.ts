import { MTR_LINE_GROUPS } from '../constants/transportData';
import { getLineColor } from '../constants/mtrData';

export interface InterchangeLine {
    lineCode: string;
    lineNameEn: string;
    lineNameTc: string;
    lineColor: string;
}

/**
 * Find all MTR lines that serve a given station code.
 * Returns an array of line info objects sorted by English line name.
 */
export function findInterchangeLines(stationId: string): InterchangeLine[] {
    const lines: InterchangeLine[] = [];
    const seen = new Set<string>();

    for (const group of MTR_LINE_GROUPS) {
        for (const station of group.stations) {
            if (station.id === stationId && station.line && !seen.has(station.line)) {
                seen.add(station.line);
                const groupName = typeof group.groupName === 'string'
                    ? group.groupName
                    : group.groupName;
                lines.push({
                    lineCode: station.line,
                    lineNameEn: typeof groupName === 'string' ? groupName : (groupName.en || station.line),
                    lineNameTc: typeof groupName === 'string' ? groupName : (groupName.tc || station.line),
                    lineColor: getLineColor(station.line),
                });
            }
        }
    }

    return lines.sort((a, b) => a.lineNameEn.localeCompare(b.lineNameEn));
}
