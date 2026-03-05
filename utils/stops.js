import { baseStopMap, allStopNames } from '../data/loader.js';

export function getStopVariants(baseName) {
  return baseStopMap.get(baseName) || [baseName];
}

export function fuzzyMatchStops(query, names) {
  const q = query.toLowerCase().trim();
  const regularNames = names.filter(s => !s.toLowerCase().includes('school bus'));
  
  const exact = regularNames.filter(s => s.toLowerCase() === q);
  if (exact.length) return exact;
  const contains = regularNames.filter(s => s.toLowerCase().includes(q));
  if (contains.length) return contains;
  const words = q.split(/\s+/);
  const multi = regularNames.filter(s => words.every(w => s.toLowerCase().includes(w)));
  if (multi.length) return multi;
  const scored = regularNames.map(s => {
    let score = 0;
    for (const w of words) if (s.toLowerCase().includes(w)) score += w.length;
    return { s, score };
  }).filter(x => x.score > 2).sort((a, b) => b.score - a.score);
  return scored.map(x => x.s);
}

export function extractStops(text) {
  const lower = text.toLowerCase();
  const isAirport = /\b(airport|flight|fly|plane)\b/i.test(text);
  let originCandidates = [];
  let destCandidates = [];

  const fromMatch = text.match(/\bfrom\s+([A-Za-z0-9''\s]+?)(?:\s+(?:for|at|to|by|before|on)\b|$)/i);
  const toMatch = text.match(/\bto\s+(?:the\s+)?([A-Za-z0-9''\s]+?)(?:\s+(?:from|for|at|by|before|on)\b|$)/i);

  if (fromMatch) originCandidates = fuzzyMatchStops(fromMatch[1].trim(), allStopNames);
  if (toMatch && !isAirport) destCandidates = fuzzyMatchStops(toMatch[1].trim(), allStopNames);
  if (isAirport) destCandidates = allStopNames.filter(s => s.toLowerCase().includes('airport'));

  if (!originCandidates.length || !destCandidates.length) {
    const prefixless = text.match(/^([A-Za-z0-9''\s]+?)\s+to\s+(?:the\s+)?([A-Za-z0-9''\s]+?)(?:\s+(?:for|at|by|before|on)\b|\s+\d|$)/i);
    if (prefixless) {
      const left = fuzzyMatchStops(prefixless[1].trim(), allStopNames);
      const right = isAirport
        ? allStopNames.filter(s => s.toLowerCase().includes('airport'))
        : fuzzyMatchStops(prefixless[2].trim(), allStopNames);
      if (!originCandidates.length && left.length) originCandidates = left;
      if (!destCandidates.length && right.length) destCandidates = right;
    }
    
    if (isAirport && !originCandidates.length) {
      const flightPattern = text.match(/^([A-Za-z0-9''\s]+?)(?:\s+(?:flight|fly|at|for)\b|\s+\d)/i);
      if (flightPattern) {
        const origin = fuzzyMatchStops(flightPattern[1].trim(), allStopNames);
        if (origin.length) originCandidates = origin;
      }
    }
  }

  return { origin: originCandidates[0] || null, destination: destCandidates[0] || null, originCandidates, destCandidates };
}
