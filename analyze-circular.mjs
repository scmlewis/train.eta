import busStopNames from './src/constants/busStopNames.ts' assert { type: 'json' };

// Read the busStopNames to analyze routes
const stops = busStopNames;
const routesByCode = {};

for (const [stopId, name] of Object.entries(stops)) {
  const match = stopId.match(/^([A-Z0-9]+)-/);
  if (!match) continue;
  const route = match[1];
  if (!routesByCode[route]) {
    routesByCode[route] = { D: [], U: [] };
  }
  const dirMatch = stopId.match(/-([A-Z])\d/);
  if (dirMatch && routesByCode[route][dirMatch[1]]) {
    routesByCode[route][dirMatch[1]].push(stopId);
  }
}

// Find routes with multiple directions (suggesting circular)
const potentialCircular = [];
for (const [route, dirs] of Object.entries(routesByCode)) {
  if (dirs.D && dirs.D.length > 0 && dirs.U && dirs.U.length > 0) {
    const dFirst = dirs.D[0];
    const dLast = dirs.D[dirs.D.length - 1];
    const uFirst = dirs.U[0];
    const uLast = dirs.U[dirs.U.length - 1];
    
    const dFirstName = stops[dFirst]?.tc || stops[dFirst]?.en || '';
    const dLastName = stops[dLast]?.tc || stops[dLast]?.en || '';
    const uFirstName = stops[uFirst]?.tc || stops[uFirst]?.en || '';
    const uLastName = stops[uLast]?.tc || stops[uLast]?.en || '';
    
    // Check if first/last are same (circular)
    if (dFirstName === uLastName || dLastName === uFirstName) {
      potentialCircular.push({
        route,
        dStops: dirs.D.length,
        uStops: dirs.U.length,
        dFirst: `${dFirst} (${dFirstName})`,
        dLast: `${dLast} (${dLastName})`,
        uFirst: `${uFirst} (${uFirstName})`,
        uLast: `${uLast} (${uLastName})`,
        match: dFirstName === uLastName ? 'D-first matches U-last' : 'D-last matches U-first'
      });
    }
  }
}

console.log('Potential circular routes:');
console.table(potentialCircular);
console.log('\nSuggested circular routes to add:', potentialCircular.map(r => `'${r.route}'`).join(', '));
