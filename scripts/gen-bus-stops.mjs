import { writeFileSync } from 'fs';

function parseCsvLine(line) {
  const fields = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
    } else if (c === ',' && !inQ) {
      fields.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

function normalizeId(id) {
  return String(id).replace(/-n(?=[A-Za-z])/i, '-').toUpperCase();
}

const r = await fetch('https://opendata.mtr.com.hk/data/mtr_bus_stops.csv');
const text = await r.text();
const lines = text.trim().split('\n');

const lookup = {};
for (const line of lines.slice(1)) {
  const parts = parseCsvLine(line);
  const stationId = normalizeId(parts[3]?.trim() ?? '');
  const tc = parts[6]?.trim() ?? '';
  const en = parts[7]?.trim() ?? '';
  if (stationId && en && tc) {
    lookup[stationId] = { en, tc };
  }
}

const entries = Object.entries(lookup)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(v))
  .join(',\n');

const tsContent = `// Auto-generated from https://opendata.mtr.com.hk/data/mtr_bus_stops.csv
// Regenerate: node scripts/gen-bus-stops.mjs
export const BUS_STOP_NAMES: Record<string, { en: string; tc: string }> = {
${entries}
};
`;

writeFileSync('src/constants/busStopNames.ts', tsContent);
console.log('Written', Object.keys(lookup).length, 'stop entries');

// Spot-check K52
const k52 = Object.entries(lookup).filter(([k]) => k.startsWith('K52'));
console.log('K52 stops:', k52.length);
k52.slice(0, 8).forEach(([k, v]) => console.log(' ', k, '->', JSON.stringify(v)));
