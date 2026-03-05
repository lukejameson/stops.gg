export let timetableData = null;
export let allTrips = [];
export let stopIndex = {};
export let allStopNames = [];
export let baseStopMap = new Map();

export async function loadData() {
  const res = await fetch('timetables.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  timetableData = await res.json();
  buildIndex();
}

function buildIndex() {
  allTrips = [];
  const stopNameSet = new Set();

  for (const route of timetableData.routes) {
    for (const cal of route.calendars) {
      for (const trip of cal.trips) {
        const idx = allTrips.length;
        allTrips.push({
          routeNumber: route.lineName,
          routeDesc: route.description,
          direction: cal.direction,
          headsign: trip.headsign,
          serviceDays: cal.serviceDays,
          validFrom: cal.validFrom,
          validTo: cal.validTo,
          additionalDates: cal.additionalDates || [],
          excludedDates: cal.excludedDates || [],
          stopTimes: trip.stopTimes,
        });
        for (const st of trip.stopTimes) {
          stopNameSet.add(st.stopName);
          if (!stopIndex[st.stopName]) stopIndex[st.stopName] = [];
          stopIndex[st.stopName].push(idx);
        }
      }
    }
  }

  const stopGroups = new Map();
  for (const stopName of stopNameSet) {
    if (stopName.toLowerCase().includes('school bus')) continue;
    const baseName = stopName.replace(/,\s*(North|South|East|West)bound$/i, '');
    if (!stopGroups.has(baseName)) {
      stopGroups.set(baseName, []);
    }
    stopGroups.get(baseName).push(stopName);
  }
  baseStopMap = stopGroups;
  allStopNames = [...stopGroups.keys()].sort();
}

export function isTripActiveToday(trip) {
  const today = new Date();
  const dayName = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][today.getDay()];
  const dateStr = today.toISOString().slice(0,10);
  if (trip.excludedDates.includes(dateStr)) return false;
  if (trip.additionalDates.includes(dateStr)) return true;
  const from = new Date(trip.validFrom), to = new Date(trip.validTo);
  today.setHours(0,0,0,0);
  if (today < from || today > to) return false;
  return trip.serviceDays[dayName] === true;
}
