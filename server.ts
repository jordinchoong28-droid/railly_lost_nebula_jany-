import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ====================================================
// Singapore Local Time (SGT / UTC+8 / Asia/Singapore)
// ====================================================
const SG_TIMEZONE = 'Asia/Singapore';

function getSgHour(): number {
  const hrStr = new Intl.DateTimeFormat('en-US', {
    timeZone: SG_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).format(new Date());
  return parseInt(hrStr, 10);
}

function getSgTimeString(options?: Intl.DateTimeFormatOptions): string {
  return new Date().toLocaleTimeString('en-SG', {
    timeZone: SG_TIMEZONE,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

function getSgDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SG_TIMEZONE });
}

function getSgFullDateString(): string {
  return new Date().toLocaleDateString('en-SG', {
    timeZone: SG_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Live simulated disruption data for Singapore MRT network (Official Structured Feed - Refreshed Ad Hoc)
let LIVE_DISRUPTIONS = [
  {
    id: 'disrupt-ewl-1',
    line: 'EWL',
    lineName: 'East West Line',
    segment: ['tiong-bahru', 'outram-park'],
    stations: ['Tiong Bahru', 'Outram Park'],
    type: 'Track Circuit / Signaling Delay',
    severity: 'moderate',
    extraMinutes: 12,
    escalationProbability: 76, // 76% chance delay escalates past 25 mins
    predictedDurationMinutes: 35,
    recommendation: 'reroute',
    actionAdvice: 'Reroute via Thomson-East Coast Line (TEL) via Havelock or Downtown Line (DTL) via Chinatown — saves 14 mins vs waiting on EWL.',
    freeBusActive: true,
    freeBusCorridor: 'Free public boarding active between Queenstown and City Hall; MRT Shuttle Bus 11 loop running between Tiong Bahru and Havelock (TEL)',
    message: 'Official LTA Alert: Delays of 10-15 mins on EWL towards Pasir Ris between Tiong Bahru and Outram Park due to intermittent track signaling.',
    sensoryImpact: 'Platform crowding at Tiong Bahru and Outram Park. High audio announcements and buzzer volume.',
    lowSensoryBypass: 'Take Thomson-East Coast Line (TEL) via Havelock or Downtown Line (DTL) via Chinatown to bypass the loud EWL sector.',
    wheelchairNote: 'Central transfer lift at Outram Park operating with 4-6 min queue; recommend TEL Havelock barrier-free exit.',
    officialNoticeRaw: '[SMRT Travel Notice 15:42 SGT] East-West Line: Due to a track circuit fault near Outram Park, trains are running at slower speeds. Please add 15 mins travel time. Free regular bus services are available between Queenstown and City Hall.',
    lastUpdated: getSgTimeString({ second: '2-digit' }),
  },
  {
    id: 'disrupt-ccl-1',
    line: 'CCL',
    lineName: 'Circle Line',
    segment: ['harbourfront', 'telok-blangah'],
    stations: ['HarbourFront', 'Telok Blangah'],
    type: 'Platform Screen Door Glitch',
    severity: 'minor',
    extraMinutes: 4,
    escalationProbability: 18, // 18% chance of escalating -> recommend wait
    predictedDurationMinutes: 8,
    recommendation: 'wait',
    actionAdvice: 'Advise WAIT on platform — technicians are resetting door sensor; service will normalize in ~6 mins.',
    freeBusActive: false,
    message: 'Circle Line platform door sensor calibration at HarbourFront. Platform staff metering commuter flow.',
    sensoryImpact: 'Moderate audio chimes. Priority queue open at Exit B for neurodivergent and mobility-impaired commuters.',
    lowSensoryBypass: 'Use Exit C to Vivocity linkway for quieter air-conditioned path.',
    wheelchairNote: 'Lift at Exit B has dedicated mobility steward.',
    officialNoticeRaw: '[SMRT Update 15:50 SGT] Circle Line: Minor dwell time extension at HarbourFront Platform A due to platform screen door calibration. Trains running normally with +4 min interval.',
    lastUpdated: getSgTimeString({ second: '2-digit' }),
  },
  {
    id: 'disrupt-nsl-1',
    line: 'NSL',
    lineName: 'North-South Line',
    segment: ['ang-mo-kio', 'bishan'],
    stations: ['Ang Mo Kio', 'Bishan'],
    type: 'Heavy Weather Speed Restriction',
    severity: 'minor',
    extraMinutes: 5,
    escalationProbability: 35,
    predictedDurationMinutes: 20,
    recommendation: 'wait',
    actionAdvice: 'Heavy rain wet-rail braking protocol in place. Trains moving steadily with +5 min headway.',
    freeBusActive: false,
    message: 'Trains operating under automated wet-weather braking guidelines along elevated viaduct.',
    sensoryImpact: 'Above-ground wind and rain noise on platform.',
    lowSensoryBypass: 'Wait in enclosed air-conditioned concourse level until train arrives.',
    wheelchairNote: 'Lifts fully operational. Station staff available for boarding assistance.',
    officialNoticeRaw: '[LTA Advisory 15:30 SGT] Wet weather precautions active on NSL above-ground stations between Ang Mo Kio and Khatib.',
    lastUpdated: getSgTimeString({ second: '2-digit' }),
  }
];

// Live Station Crowd Density (Refreshed every 3 min)
function generateStationCrowdDensities() {
  const stationsList = [
    { id: 'clementi', name: 'Clementi', line: 'EWL' as const, base: 74, trend: 'rising' as const },
    { id: 'jurong-east', name: 'Jurong East', line: 'EWL' as const, base: 88, trend: 'rising' as const },
    { id: 'outram-park', name: 'Outram Park', line: 'EWL' as const, base: 82, trend: 'stable' as const },
    { id: 'raffles-place', name: 'Raffles Place', line: 'EWL' as const, base: 86, trend: 'stable' as const },
    { id: 'tampines', name: 'Tampines', line: 'EWL' as const, base: 68, trend: 'falling' as const },
    { id: 'bishan', name: 'Bishan', line: 'NSL' as const, base: 84, trend: 'rising' as const },
    { id: 'ang-mo-kio', name: 'Ang Mo Kio', line: 'NSL' as const, base: 72, trend: 'stable' as const },
    { id: 'woodlands', name: 'Woodlands', line: 'NSL' as const, base: 79, trend: 'rising' as const },
    { id: 'dhoby-ghaut', name: 'Dhoby Ghaut', line: 'NEL' as const, base: 75, trend: 'stable' as const },
    { id: 'punggol', name: 'Punggol', line: 'NEL' as const, base: 64, trend: 'falling' as const },
    { id: 'serangoon', name: 'Serangoon', line: 'CCL' as const, base: 80, trend: 'rising' as const },
    { id: 'one-north', name: 'one-north', line: 'CCL' as const, base: 52, trend: 'falling' as const },
    { id: 'bugis', name: 'Bugis', line: 'DTL' as const, base: 71, trend: 'stable' as const },
    { id: 'botanic-gardens', name: 'Botanic Gardens', line: 'DTL' as const, base: 45, trend: 'falling' as const },
    { id: 'maxwell', name: 'Maxwell', line: 'TEL' as const, base: 38, trend: 'stable' as const },
    { id: 'orchard', name: 'Orchard', line: 'TEL' as const, base: 62, trend: 'rising' as const },
  ];

  const timeStr = getSgTimeString();

  return stationsList.map((st) => {
    // Add realistic 3-min minor fluctuations
    const variance = Math.floor(Math.random() * 7) - 3;
    const percentage = Math.min(98, Math.max(20, st.base + variance));
    let crowdLevel: 'Low' | 'Moderate' | 'High' | 'Extreme' = 'Moderate';
    if (percentage >= 85) crowdLevel = 'Extreme';
    else if (percentage >= 70) crowdLevel = 'High';
    else if (percentage >= 45) crowdLevel = 'Moderate';
    else crowdLevel = 'Low';

    return {
      stationId: st.id,
      stationName: st.name,
      line: st.line,
      crowdLevel,
      percentage,
      platformTrend: st.trend,
      nextTrainCarsCrowd: [
        Math.max(20, percentage - 35),
        Math.max(30, percentage - 15),
        Math.min(99, percentage + 8),
        Math.min(99, percentage + 12),
        Math.max(30, percentage - 10),
        Math.max(20, percentage - 30),
      ],
      weatherImpactCrowd: percentage > 75,
      lastUpdated: timeStr,
    };
  });
}

// Live Ad Hoc Lift Maintenance Feed (Down to individual lift and which exit it serves)
const LIVE_LIFT_MAINTENANCE = [
  {
    id: 'lift-outram-02',
    stationId: 'outram-park',
    stationName: 'Outram Park',
    liftId: 'Lift L02',
    servesExit: 'Exit A (towards Outram Rd / SGH Diabetes & Dialysis Polyclinic)',
    platformServed: 'EWL Platform A to Concourse (Street Level)',
    status: 'maintenance' as const,
    reason: 'Scheduled preventative hydraulic motor overhaul',
    expectedRestoration: 'Today, 18:00 SGT (In ~2 hours)',
    alternativeAccessiblePath: 'Use Lift L01 at Exit F — directly connected via level covered bridge to Singapore General Hospital (SGH) with barrier-free ramps.',
    lastRefreshed: getSgTimeString(),
  },
  {
    id: 'lift-clementi-01',
    stationId: 'clementi',
    stationName: 'Clementi',
    liftId: 'Lift L01',
    servesExit: 'Exit B (towards Commonwealth Ave West / 321 Clementi)',
    platformServed: 'EWL Platform 2 (Eastbound) to Concourse Level',
    status: 'maintenance' as const,
    reason: 'Door safety edge sensor replacement',
    expectedRestoration: 'Today, 17:15 SGT',
    alternativeAccessiblePath: 'Use Lift L03 at Exit A (Clementi Mall link bridge). Station staff deployed on platform to assist wheelchair commuters.',
    lastRefreshed: getSgTimeString(),
  },
  {
    id: 'lift-bishan-03',
    stationId: 'bishan',
    stationName: 'Bishan',
    liftId: 'Lift L03',
    servesExit: 'Exit D (Mezzanine Transfer Corridor to Circle Line)',
    platformServed: 'NSL Southbound Platform to Circle Line Concourse',
    status: 'intermittent' as const,
    reason: 'Heavy rush-hour overload reset in progress',
    expectedRestoration: 'Today, 16:20 SGT (Brief 15-min inspection)',
    alternativeAccessiblePath: 'Use Lift L01 at North Concourse or request staff escort for dedicated wide service lift.',
    lastRefreshed: getSgTimeString(),
  },
  {
    id: 'lift-bedok-02',
    stationId: 'bedok',
    stationName: 'Bedok',
    liftId: 'Lift L02',
    servesExit: 'Exit C (Bedok Bus Interchange connection)',
    platformServed: 'EWL Platform to Underground Pedestrian Mall',
    status: 'operational' as const,
    reason: 'Routine inspection completed early',
    expectedRestoration: 'Now Fully Operational',
    alternativeAccessiblePath: 'Lift L02 and Lift L01 both operating normally with level tactile guidance.',
    lastRefreshed: getSgTimeString(),
  }
];

// Live Ad Hoc Public Flash Flood Alerts (PUB Singapore / NEA)
const LIVE_FLOOD_ALERTS = [
  {
    id: 'flood-alexandra-1',
    location: 'Alexandra Canal / Commonwealth Ave near Queenstown & Commonwealth MRT',
    nearbyStations: ['Queenstown', 'Commonwealth'],
    severity: 'Flash Flood Warning' as const,
    waterLevelPercent: 88,
    impactOnCommuters: 'Heavy water pooling near Queenstown Exit C underpass. Pedestrian covered overhead linkway on Level 2 is safe and dry. Commuters advised to avoid street gutters.',
    agency: 'PUB Singapore' as const,
    issuedAt: '15:35 SGT',
    lastRefreshed: getSgTimeString(),
  },
  {
    id: 'flood-tanjongpagar-1',
    location: 'Tanjong Pagar / Maxwell Underpass Linkway (Bernam St junction)',
    nearbyStations: ['Tanjong Pagar', 'Maxwell'],
    severity: 'Advisory' as const,
    waterLevelPercent: 64,
    impactOnCommuters: 'Passing heavy showers causing minor splash risk near Exit C street curb. Underpass flood barriers tested; MRT station entrance 100% dry and protected.',
    agency: 'PUB Singapore' as const,
    issuedAt: '15:10 SGT',
    lastRefreshed: getSgTimeString(),
  },
  {
    id: 'flood-bukittimah-1',
    location: 'Dunearn Road / Bukit Timah Canal near King Albert Park & Beauty World MRT',
    nearbyStations: ['King Albert Park', 'Beauty World'],
    severity: 'High Risk' as const,
    waterLevelPercent: 82,
    impactOnCommuters: 'Canal water level high due to intense rainfall. Bus stops along Dunearn Rd flooded. Recommend commuters remain inside Beauty World (DTL) underground station until 17:00 SGT.',
    agency: 'PUB Singapore' as const,
    issuedAt: '15:45 SGT',
    lastRefreshed: getSgTimeString(),
  }
];

// Cache for 24-hr Singapore weather forecast
let weatherCache: { data: any; timestamp: number } | null = null;
const WEATHER_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

function generate24HourHourlyForecast(currentHour: number) {
  // Generates 24-hour weather timeline with at least 4 hourly forecast blocks (+1h, +2h, +3h, +4h, etc.)
  // and alerts users at least 1h beforehand of rain, crowd surges, and track disruptions.
  const hourly = [];
  const hoursToGenerate = [1, 2, 3, 4, 6, 8, 12, 18, 24];

  for (const delta of hoursToGenerate) {
    const targetH = (currentHour + delta) % 24;
    const timeStr = `${String(targetH).padStart(2, '0')}:00`;
    const label = delta === 1 ? 'Next 1h' : delta === 2 ? 'Next 2h' : delta === 3 ? 'Next 3h' : delta === 4 ? 'Next 4h' : `+${delta}h`;

    if (delta === 1) {
      hourly.push({
        time: timeStr,
        label,
        temp: 28,
        condition: 'Heavy Thundery Showers',
        icon: 'thunder' as const,
        rainChance: 90,
        windSpeed: '22 km/h (Gusty)',
        crowdImpact: '🚨 Severe Crowd Surge: Commuters stranded at outdoor bus stops will surge into MRT concourses. Above-ground viaducts (EWL/NSL) report wet-rail delays.',
        foreseenDisruption: 'Wet-track braking speed reductions between Jurong East & Clementi. High platform crowding.',
        isAlert1h: true,
      });
    } else if (delta === 2) {
      hourly.push({
        time: timeStr,
        label,
        temp: 27,
        condition: 'Thundery Showers & Gusts',
        icon: 'rain' as const,
        rainChance: 85,
        windSpeed: '18 km/h',
        crowdImpact: 'High Crowd Density across interchange stations (Jurong East, Outram Park, Bishan).',
        foreseenDisruption: 'Elevated platform wind spray at Clementi and Tampines.',
        isAlert1h: true,
      });
    } else if (delta === 3) {
      hourly.push({
        time: timeStr,
        label,
        temp: 28,
        condition: 'Moderate Passing Showers',
        icon: 'rain' as const,
        rainChance: 65,
        windSpeed: '14 km/h',
        crowdImpact: 'Moderate crowds; passengers moving through covered linkways.',
        foreseenDisruption: 'Minor platform congestion easing.',
        isAlert1h: false,
      });
    } else if (delta === 4) {
      hourly.push({
        time: timeStr,
        label,
        temp: 29,
        condition: 'Passing Showers / Overcast',
        icon: 'cloudy' as const,
        rainChance: 40,
        windSpeed: '11 km/h',
        crowdImpact: 'Standard post-peak traffic; normal platform clearance.',
        foreseenDisruption: 'Tracks dried; normal automated train operations restored.',
        isAlert1h: false,
      });
    } else if (delta === 6) {
      hourly.push({
        time: timeStr,
        label,
        temp: 28,
        condition: 'Partly Cloudy (Night)',
        icon: 'cloudy' as const,
        rainChance: 25,
        windSpeed: '9 km/h',
        crowdImpact: 'Low crowd density across all lines.',
        isAlert1h: false,
      });
    } else if (delta === 8) {
      hourly.push({
        time: timeStr,
        label,
        temp: 27,
        condition: 'Partly Cloudy (Night)',
        icon: 'cloudy' as const,
        rainChance: 15,
        windSpeed: '8 km/h',
        crowdImpact: 'Night transit mode; minimal waiting times.',
        isAlert1h: false,
      });
    } else if (delta === 12) {
      hourly.push({
        time: timeStr,
        label,
        temp: 26,
        condition: 'Fair & Cool (Late Night)',
        icon: 'cloudy' as const,
        rainChance: 10,
        windSpeed: '7 km/h',
        crowdImpact: 'Quiet night trains.',
        isAlert1h: false,
      });
    } else if (delta === 18) {
      hourly.push({
        time: timeStr,
        label,
        temp: 29,
        condition: 'Thundery Showers (Morning)',
        icon: 'thunder' as const,
        rainChance: 70,
        windSpeed: '15 km/h',
        crowdImpact: 'Morning commuter peak surge into sheltered underground lines.',
        isAlert1h: false,
      });
    } else {
      hourly.push({
        time: timeStr,
        label,
        temp: 31,
        condition: 'Passing Showers',
        icon: 'rain' as const,
        rainChance: 55,
        windSpeed: '14 km/h',
        crowdImpact: 'Afternoon commuter flow; sheltered routes advised.',
        isAlert1h: false,
      });
    }
  }

  return hourly;
}

async function fetchSingaporeWeather() {
  const now = Date.now();
  if (weatherCache && now - weatherCache.timestamp < WEATHER_CACHE_TTL) {
    return weatherCache.data;
  }

  const sgHour = getSgHour();
  const hourly = generate24HourHourlyForecast(sgHour);
  const nextHour = (sgHour + 1) % 24;
  const nextHourStr = `${String(nextHour).padStart(2, '0')}:00 SGT`;

  const activeWeatherAlert = {
    severity: 'warning' as const,
    title: '⚠️ 1-Hour Advance Weather & Crowd Alert',
    message: `Heavy thundery showers approaching West & Central Singapore in the next hour (expected ${nextHourStr}). High wind gusts and heavy rain will impact above-ground MRT viaduct platforms (Jurong East, Clementi, Ang Mo Kio). Expect sudden platform crowding as bus passengers seek shelter.`,
    advanceNotice: `Active: 1-hour advance warning before severe weather impact (${nextHourStr})`,
    impactedLines: ['EWL', 'NSL'] as ('EWL' | 'NSL')[],
    impactedStations: ['Jurong East', 'Clementi', 'Bishan', 'Ang Mo Kio'],
    crowdMitigation: 'Reroute via underground Thomson-East Coast Line (TEL) or Downtown Line (DTL) for 100% weather-sheltered and air-conditioned travel.',
  };

  let twoHourForecast: { area: string; forecast: string }[] = [];
  let twoHourValidPeriod = '2:30 pm to 4:30 pm';

  try {
    const twoHrRes = await fetch('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast', {
      headers: { 'User-Agent': 'aistudio-build' },
    });
    if (twoHrRes.ok) {
      const twoHrJson = await twoHrRes.json();
      const item = twoHrJson?.data?.items?.[0];
      if (item) {
        if (item.valid_period?.text) {
          twoHourValidPeriod = item.valid_period.text;
        }
        if (Array.isArray(item.forecasts)) {
          twoHourForecast = item.forecasts;
        }
      }
    }
  } catch (err) {
    console.warn('2-hr forecast fetch warning:', err);
  }

  // Realistic station areas if twoHourForecast is empty
  if (!twoHourForecast.length) {
    twoHourForecast = [
      { area: 'Jurong East', forecast: 'Showers' },
      { area: 'Clementi', forecast: 'Showers' },
      { area: 'Bukit Batok', forecast: 'Showers' },
      { area: 'Bukit Timah', forecast: 'Showers' },
      { area: 'Queenstown', forecast: 'Showers' },
      { area: 'City', forecast: 'Cloudy' },
      { area: 'Ang Mo Kio', forecast: 'Cloudy' },
      { area: 'Bishan', forecast: 'Cloudy' },
      { area: 'Tampines', forecast: 'Cloudy' },
      { area: 'Bedok', forecast: 'Cloudy' },
      { area: 'Changi', forecast: 'Cloudy' },
      { area: 'Woodlands', forecast: 'Cloudy' },
    ];
  }

  try {
    const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast', {
      headers: { 'User-Agent': 'aistudio-build' },
    });
    if (response.ok) {
      const json = await response.json();
      const record = json?.data?.records?.[0];
      if (record) {
        // Select period matching current Singapore time
        const nowMs = Date.now();
        const activePeriod = record.periods?.find((p: any) => {
          if (!p.timePeriod?.start || !p.timePeriod?.end) return false;
          const s = new Date(p.timePeriod.start).getTime();
          const e = new Date(p.timePeriod.end).getTime();
          return nowMs >= s && nowMs <= e;
        }) || record.periods?.[0];

        const formatted = {
          date: record.date || getSgDateString(),
          updatedTimestamp: record.updatedTimestamp || new Date().toISOString(),
          localSingaporeTime: `${getSgTimeString()} SGT`,
          localSingaporeDate: getSgFullDateString(),
          generalForecast: record.general?.forecast?.text || 'Thundery Showers',
          temperature: {
            low: record.general?.temperature?.low ?? 25,
            high: record.general?.temperature?.high ?? 35,
          },
          relativeHumidity: {
            low: record.general?.relativeHumidity?.low ?? 65,
            high: record.general?.relativeHumidity?.high ?? 90,
          },
          wind: {
            direction: record.general?.wind?.direction || 'S',
            speed: {
              low: record.general?.wind?.speed?.low ?? 10,
              high: record.general?.wind?.speed?.high ?? 20,
            },
          },
          validPeriodText: record.general?.validPeriod?.text || '12 PM 19 Sep to 12 PM 20 Sep',
          regions: activePeriod?.regions || {
            west: { text: 'Thundery Showers', code: 'TL' },
            east: { text: 'Partly Cloudy (Day)', code: 'PC' },
            central: { text: 'Thundery Showers', code: 'TL' },
            north: { text: 'Thundery Showers', code: 'TL' },
            south: { text: 'Partly Cloudy (Day)', code: 'PC' },
          },
          periodText: activePeriod?.timePeriod?.text || 'Midday to 6 pm 19 Sep',
          periods: record.periods || [],
          twoHourForecast,
          twoHourValidPeriod,
          hourly,
          activeWeatherAlert,
        };
        weatherCache = { data: formatted, timestamp: now };
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Weather API fetch failed, using realistic 24-hr fallback:', err);
  }

  // Realistic official NEA Data.gov.sg fallback
  const fallback = {
    date: getSgDateString(),
    updatedTimestamp: new Date().toISOString(),
    localSingaporeTime: `${getSgTimeString()} SGT`,
    localSingaporeDate: getSgFullDateString(),
    generalForecast: 'Thundery Showers',
    temperature: { low: 25, high: 35 },
    relativeHumidity: { low: 65, high: 90 },
    wind: { direction: 'S', speed: { low: 10, high: 20 } },
    validPeriodText: '12 PM 19 Sep to 12 PM 20 Sep',
    regions: {
      west: { text: 'Thundery Showers', code: 'TL' },
      east: { text: 'Partly Cloudy (Day)', code: 'PC' },
      central: { text: 'Thundery Showers', code: 'TL' },
      north: { text: 'Thundery Showers', code: 'TL' },
      south: { text: 'Partly Cloudy (Day)', code: 'PC' },
    },
    periodText: 'Midday to 6 pm 19 Sep',
    periods: [
      {
        timePeriod: { text: 'Midday to 6 pm 19 Sep', start: '2026-09-19T12:00:00+08:00', end: '2026-09-19T18:00:00+08:00' },
        regions: {
          west: { text: 'Thundery Showers', code: 'TL' },
          east: { text: 'Partly Cloudy (Day)', code: 'PC' },
          central: { text: 'Thundery Showers', code: 'TL' },
          north: { text: 'Thundery Showers', code: 'TL' },
          south: { text: 'Partly Cloudy (Day)', code: 'PC' },
        },
      },
      {
        timePeriod: { text: '6 pm 19 Sep to 6 am 20 Sep', start: '2026-09-19T18:00:00+08:00', end: '2026-09-20T06:00:00+08:00' },
        regions: {
          west: { text: 'Partly Cloudy (Night)', code: 'PN' },
          east: { text: 'Partly Cloudy (Night)', code: 'PN' },
          central: { text: 'Partly Cloudy (Night)', code: 'PN' },
          north: { text: 'Partly Cloudy (Night)', code: 'PN' },
          south: { text: 'Partly Cloudy (Night)', code: 'PN' },
        },
      },
      {
        timePeriod: { text: '6 am to Midday 20 Sep', start: '2026-09-20T06:00:00+08:00', end: '2026-09-20T12:00:00+08:00' },
        regions: {
          west: { text: 'Thundery Showers', code: 'TL' },
          east: { text: 'Thundery Showers', code: 'TL' },
          central: { text: 'Thundery Showers', code: 'TL' },
          north: { text: 'Thundery Showers', code: 'TL' },
          south: { text: 'Thundery Showers', code: 'TL' },
        },
      },
    ],
    twoHourForecast,
    twoHourValidPeriod,
    hourly,
    activeWeatherAlert,
  };
  weatherCache = { data: fallback, timestamp: now };
  return fallback;
}

// Weather endpoint for 24-hr Forecast & 4-hr timeline with 1h Advance Alert
app.get('/api/weather', async (_req, res) => {
  const weather = await fetchSingaporeWeather();
  res.json({ weather });
});

// Official structured train disruption feed (Refreshed Ad Hoc)
app.get('/api/disruptions', (_req, res) => {
  // Update timestamp to simulate ad hoc live feed refresh in Singapore time
  const sgTimeNow = getSgTimeString({ second: '2-digit' });
  const refreshedList = LIVE_DISRUPTIONS.map(d => ({
    ...d,
    lastUpdated: sgTimeNow,
  }));
  res.json({
    disruptions: refreshedList,
    refreshedAt: sgTimeNow,
    singaporeTime: `${getSgTimeString()} SGT`,
    source: 'Official LTA DataMall & SMRT Structured Travel Alert Feed',
  });
});

// Station Crowd Density endpoint (Refreshed every 3 min)
app.get('/api/crowd-density', (_req, res) => {
  const crowdDensities = generateStationCrowdDensities();
  res.json({
    crowdDensities,
    refreshedAt: getSgTimeString({ second: '2-digit' }),
    singaporeTime: `${getSgTimeString()} SGT`,
    refreshIntervalSeconds: 180, // 3 minutes
  });
});

// Ad Hoc Lift Maintenance Feed (Down to individual lift & exit)
app.get('/api/lift-maintenance', (_req, res) => {
  res.json({
    liftMaintenance: LIVE_LIFT_MAINTENANCE,
    refreshedAt: getSgTimeString({ second: '2-digit' }),
    singaporeTime: `${getSgTimeString()} SGT`,
    source: 'SMRT & SBS Transit Station Asset Management System',
  });
});

// Public Flash Flood Alerts Feed (Refreshed Ad Hoc)
app.get('/api/flood-alerts', (_req, res) => {
  res.json({
    floodAlerts: LIVE_FLOOD_ALERTS,
    refreshedAt: getSgTimeString({ second: '2-digit' }),
    singaporeTime: `${getSgTimeString()} SGT`,
    source: 'PUB Singapore & NEA Flood Warning Network',
  });
});

// ====================================================
// Telegram @sgmrt Live Channel Scraper & Alert Engine
// Channel URL: https://t.me/s/sgmrt
// ====================================================
interface TelegramScrapedPost {
  id: string;
  postId: string;
  url: string;
  datetime: string;
  sgTime: string;
  text: string;
  lines: string[];
  stationNames: string[];
  delayMinutes: number;
  category: 'delay' | 'suspension' | 'resumed' | 'extended_hours' | 'maintenance' | 'general';
  severity: 'critical' | 'moderate' | 'minor' | 'info';
  freeBusAvailable: boolean;
  isSimulated?: boolean;
}

let telegramCache: {
  posts: TelegramScrapedPost[];
  timestamp: number;
} | null = null;

let userSimulatedTelegramPosts: TelegramScrapedPost[] = [
  {
    id: 'sgmrt-live-recent-1',
    postId: 'sgmrt/live-alert-2580',
    url: 'https://t.me/s/sgmrt',
    datetime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    sgTime: getSgTimeString(),
    text: '[SMRT Travel Notice] East-West Line: Track circuit delay between #TiongBahru and #OutramPark towards Pasir Ris. Please add 12 mins additional travel time. Free regular bus services activated between Queenstown and City Hall.',
    lines: ['EWL'],
    stationNames: ['Tiong Bahru', 'Outram Park', 'Queenstown', 'City Hall'],
    delayMinutes: 12,
    category: 'delay',
    severity: 'moderate',
    freeBusAvailable: true,
  }
];

const KNOWN_STATION_NAMES = [
  'Jurong East', 'Bukit Batok', 'Bukit Gombak', 'Choa Chu Kang', 'Yew Tee', 'Kranji', 'Marsiling',
  'Woodlands', 'Admiralty', 'Sembawang', 'Canberra', 'Yishun', 'Khatib', 'Yio Chu Kang', 'Ang Mo Kio',
  'Bishan', 'Braddell', 'Toa Payoh', 'Novena', 'Newton', 'Orchard', 'Somerset', 'Dhoby Ghaut',
  'City Hall', 'Raffles Place', 'Marina Bay', 'Marina South Pier', 'Pasir Ris', 'Tampines', 'Simei',
  'Tanah Merah', 'Bedok', 'Kembangan', 'Eunos', 'Paya Lebar', 'Aljunied', 'Kallang', 'Lavender',
  'Bugis', 'Tanjong Pagar', 'Outram Park', 'Tiong Bahru', 'Redhill', 'Queenstown', 'Commonwealth',
  'Buona Vista', 'Dover', 'Clementi', 'Chinese Garden', 'Lakeside', 'Boon Lay', 'Pioneer', 'Joo Koon',
  'Gul Circle', 'Tuas Crescent', 'Tuas West Road', 'Tuas Link', 'Expo', 'Changi Airport',
  'HarbourFront', 'Chinatown', 'Clarke Quay', 'Little India', 'Farrer Park', 'Boon Keng', 'Potong Pasir',
  'Woodleigh', 'Serangoon', 'Kovan', 'Hougang', 'Buangkok', 'Sengkang', 'Punggol',
  'Bras Basah', 'Esplanade', 'Promenade', 'Nicoll Highway', 'Stadium', 'Mountbatten', 'Dakota',
  'MacPherson', 'Tai Seng', 'Bartley', 'Lorong Chuan', 'Marymount', 'Caldecott', 'Botanic Gardens',
  'Farrer Road', 'Holland Village', 'one-north', 'Kent Ridge', 'Haw Par Villa', 'Pasir Panjang',
  'Labrador Park', 'Telok Blangah', 'Bayfront',
  'Bukit Panjang', 'Cashew', 'Hillview', 'Beauty World', 'King Albert Park', 'Sixth Avenue',
  'Tan Kah Kee', 'Stevens', 'Rochor', 'Downtown', 'Telok Ayer', 'Fort Canning', 'Bencoolen',
  'Jalan Besar', 'Bendemeer', 'Geylang Bahru', 'Mattar', 'Ubi', 'Kaki Bukit', 'Bedok North',
  'Bedok Reservoir', 'Tampines West', 'Tampines East', 'Upper Changi',
  'Woodlands North', 'Woodlands South', 'Springleaf', 'Lentor', 'Mayflower', 'Bright Hill',
  'Upper Thomson', 'Napier', 'Orchard Boulevard', 'Great World', 'Havelock', 'Maxwell',
  'Shenton Way', 'Gardens by the Bay', 'Tanjong Rhu', 'Katong Park', 'Tanjong Katong', 'Marine Parade',
  'Marine Terrace', 'Siglap', 'Bayshore',
  'Senja', 'Jelapang', 'Fajar', 'Segar', 'Zhengghua', 'Petir', 'Pending', 'Bangkit', 'Keat Hong',
  'Teck Whye', 'Phoenix', 'South View', 'Compassvale', 'Rumbia', 'Bakau', 'Kangkar', 'Cove', 'Meridian'
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function parseTelegramPostBlock(block: string): TelegramScrapedPost | null {
  const dataPostMatch = block.match(/data-post=\"([^\"]+)\"/);
  const postId = dataPostMatch ? dataPostMatch[1] : '';
  if (!postId) return null;

  const timeMatch = block.match(/<time[^>]*datetime=\"([^\"]+)\"[^>]*>([^<]+)<\/time>/);
  const datetime = timeMatch ? timeMatch[1] : new Date().toISOString();

  const textMatch = block.match(/<div class=\"tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
  if (!textMatch) return null;

  let text = textMatch[1]
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
  text = decodeHtmlEntities(text);
  if (!text) return null;

  let sgTime = '';
  try {
    const d = new Date(datetime);
    sgTime = d.toLocaleTimeString('en-SG', {
      timeZone: SG_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' SGT';
  } catch {
    sgTime = getSgTimeString();
  }

  const lower = text.toLowerCase();
  const lines: string[] = [];
  if (lower.includes('north south') || lower.includes('north-south') || lower.includes('nsl') || text.includes('#NS')) lines.push('NSL');
  if (lower.includes('east west') || lower.includes('east-west') || lower.includes('ewl') || text.includes('#EW')) lines.push('EWL');
  if (lower.includes('north east') || lower.includes('north-east') || lower.includes('nel') || text.includes('#NE')) lines.push('NEL');
  if (lower.includes('circle line') || lower.includes('ccl') || text.includes('#CC')) lines.push('CCL');
  if (lower.includes('downtown line') || lower.includes('dtl') || text.includes('#DT')) lines.push('DTL');
  if (lower.includes('thomson') || lower.includes('tel') || text.includes('#TE')) lines.push('TEL');
  if (lower.includes('bukit panjang lrt') || lower.includes('bplrt') || text.includes('#BP')) lines.push('BPLRT');
  if (lower.includes('sengkang lrt') || lower.includes('sklrt') || text.includes('#SK') || lower.includes('splrt')) lines.push('SKLRT');
  if (lower.includes('punggol lrt') || lower.includes('pglrt') || text.includes('#PG')) lines.push('PGLRT');

  const stationNames: string[] = [];
  for (const st of KNOWN_STATION_NAMES) {
    const re = new RegExp(`\\b#?${st.replace(/\s+/g, '\\s*')}\\b`, 'i');
    if (re.test(text) && !stationNames.includes(st)) {
      stationNames.push(st);
    }
  }

  let delayMinutes = 0;
  const delayMatch = text.match(/(\d+)\s*(mins?|minutes?)/i);
  if (delayMatch) {
    delayMinutes = parseInt(delayMatch[1], 10);
  }

  const freeBusAvailable = lower.includes('free regular bus') || lower.includes('free bus') || lower.includes('bridging bus') || lower.includes('shuttle bus');

  let category: TelegramScrapedPost['category'] = 'general';
  if (lower.includes('resumed') || lower.includes('normal train service') || lower.includes('cleared')) {
    category = 'resumed';
  } else if (lower.includes('no train service') || lower.includes('suspended') || lower.includes('disruption')) {
    category = 'suspension';
  } else if (delayMinutes > 0 || lower.includes('delay') || lower.includes('fault') || lower.includes('slow') || lower.includes('longer travel time')) {
    category = 'delay';
  } else if (lower.includes('extended') || lower.includes('operational hours')) {
    category = 'extended_hours';
  } else if (lower.includes('maintenance') || lower.includes('later') || lower.includes('closure')) {
    category = 'maintenance';
  }

  let severity: TelegramScrapedPost['severity'] = 'info';
  if (category === 'suspension') {
    severity = 'critical';
  } else if (category === 'delay') {
    severity = delayMinutes >= 20 ? 'critical' : delayMinutes >= 10 ? 'moderate' : 'minor';
  } else if (category === 'extended_hours' || category === 'resumed') {
    severity = 'info';
  }

  return {
    id: postId.replace(/\//g, '-'),
    postId,
    url: `https://t.me/${postId}`,
    datetime,
    sgTime,
    text,
    lines,
    stationNames,
    delayMinutes,
    category,
    severity,
    freeBusAvailable,
  };
}

async function fetchTelegramSgmrtChannel(): Promise<TelegramScrapedPost[]> {
  const now = Date.now();
  if (telegramCache && now - telegramCache.timestamp < 30000) {
    return [...userSimulatedTelegramPosts, ...telegramCache.posts];
  }

  try {
    const res = await fetch('https://t.me/s/sgmrt', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-SG,en;q=0.9',
      },
    });

    if (res.ok) {
      const html = await res.text();
      const messageBlocks = html.split('<div class="tgme_widget_message_wrap');
      const posts: TelegramScrapedPost[] = [];

      for (let i = 1; i < messageBlocks.length; i++) {
        const parsed = parseTelegramPostBlock(messageBlocks[i]);
        if (parsed) {
          posts.push(parsed);
        }
      }

      // Reverse so latest messages come first
      posts.reverse();
      telegramCache = {
        posts,
        timestamp: now,
      };
      return [...userSimulatedTelegramPosts, ...posts];
    }
  } catch (err) {
    console.warn('Failed to scrape t.me/s/sgmrt directly, using cached/fallback feed:', err);
  }

  // Fallback realistic channel history if network fetch encounters rate limits
  const fallbackPosts: TelegramScrapedPost[] = [
    {
      id: 'sgmrt-2576',
      postId: 'sgmrt/2576',
      url: 'https://t.me/sgmrt/2576',
      datetime: '2026-09-19T02:09:32+08:00',
      sgTime: '10:09 SGT',
      text: 'Operational hours of the DTL, NEL, SPLRT, as well as selected bus services will be extended during major events. Commuters can check the app for connecting last train departure timings.',
      lines: ['DTL', 'NEL', 'SKLRT', 'PGLRT'],
      stationNames: ['Dhoby Ghaut', 'Chinatown', 'Bugis'],
      delayMinutes: 0,
      category: 'extended_hours',
      severity: 'info',
      freeBusAvailable: false,
    },
    {
      id: 'sgmrt-2573',
      postId: 'sgmrt/2573',
      url: 'https://t.me/sgmrt/2573',
      datetime: '2026-09-18T16:30:11+08:00',
      sgTime: '16:30 SGT',
      text: 'TEL - Normal train services have resumed between #BrightHill and #GardensbytheBay. Thank you for your patience.',
      lines: ['TEL'],
      stationNames: ['Bright Hill', 'Gardens by the Bay'],
      delayMinutes: 0,
      category: 'resumed',
      severity: 'info',
      freeBusAvailable: false,
    },
    {
      id: 'sgmrt-2571',
      postId: 'sgmrt/2571',
      url: 'https://t.me/sgmrt/2571',
      datetime: '2026-09-17T05:39:17+08:00',
      sgTime: '05:39 SGT',
      text: 'Planned Track Renewal: Early closures on selected weekends for North South Line (NSL) track circuit upgrades between #Yishun and #AngMoKio. Bridging bus shuttle 8 available.',
      lines: ['NSL'],
      stationNames: ['Yishun', 'Khatib', 'Yio Chu Kang', 'Ang Mo Kio'],
      delayMinutes: 0,
      category: 'maintenance',
      severity: 'info',
      freeBusAvailable: true,
    },
    {
      id: 'sgmrt-2569',
      postId: 'sgmrt/2569',
      url: 'https://t.me/sgmrt/2569',
      datetime: '2026-09-16T08:44:03+08:00',
      sgTime: '08:44 SGT',
      text: 'BPLRT - Train services have resumed between #Senja and #BukitPanjang Stations (both directions). Free bus service has ceased.',
      lines: ['BPLRT'],
      stationNames: ['Senja', 'Bukit Panjang'],
      delayMinutes: 0,
      category: 'resumed',
      severity: 'info',
      freeBusAvailable: false,
    }
  ];

  return [...userSimulatedTelegramPosts, ...fallbackPosts];
}

// Telegram Channel Endpoint
app.get('/api/telegram/sgmrt', async (_req, res) => {
  const posts = await fetchTelegramSgmrtChannel();
  res.json({
    channel: '@sgmrt',
    channelTitle: 'Singapore MRT (SMRT / LTA / SBS Transit Announcements)',
    channelUrl: 'https://t.me/s/sgmrt',
    lastRefreshed: getSgTimeString({ second: '2-digit' }),
    singaporeTime: `${getSgTimeString()} SGT`,
    count: posts.length,
    posts,
  });
});

// Broadcast / Simulate custom Telegram MRT message (for testing real-time disruption alert)
app.post('/api/telegram/simulate', (req, res) => {
  const { text, line, delayMinutes = 15, stationNames = [] } = req.body;
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Valid text is required' });
    return;
  }

  const simulatedId = 'sim-' + Date.now();
  const simulatedPost: TelegramScrapedPost = {
    id: simulatedId,
    postId: `sgmrt/sim-${Math.floor(Math.random() * 9000 + 1000)}`,
    url: 'https://t.me/s/sgmrt',
    datetime: new Date().toISOString(),
    sgTime: `${getSgTimeString()} SGT`,
    text,
    lines: line ? [line] : ['EWL'],
    stationNames: Array.isArray(stationNames) && stationNames.length ? stationNames : ['Clementi', 'Outram Park'],
    delayMinutes: Number(delayMinutes) || 15,
    category: delayMinutes > 0 ? 'delay' : 'general',
    severity: delayMinutes >= 20 ? 'critical' : delayMinutes >= 10 ? 'moderate' : 'minor',
    freeBusAvailable: text.toLowerCase().includes('free bus') || text.toLowerCase().includes('bridging bus'),
    isSimulated: true,
  };

  // Add to top of simulated posts
  userSimulatedTelegramPosts = [simulatedPost, ...userSimulatedTelegramPosts.slice(0, 9)];
  res.json({ success: true, post: simulatedPost });
});

// Clear simulated posts
app.delete('/api/telegram/simulate', (_req, res) => {
  userSimulatedTelegramPosts = [];
  res.json({ success: true, message: 'Simulated posts cleared' });
});

// AI Service Notice Parser Endpoint: Turns free-text service notices into structured, personalised advice
app.post('/api/parse-notice', async (req, res) => {
  try {
    const { noticeText, origin, destination, persona = 'standard', travelHistory = [] } = req.body;
    if (!noticeText || typeof noticeText !== 'string') {
      res.status(400).json({ error: 'Valid raw noticeText string is required' });
      return;
    }

    const ai = getGeminiClient();

    // Fallback smart parser if AI client unavailable
    const runLocalParser = () => {
      const lower = noticeText.toLowerCase();
      let line: any = 'EWL';
      let lineName = 'East-West Line';
      if (lower.includes('north-south') || lower.includes('nsl')) { line = 'NSL'; lineName = 'North-South Line'; }
      else if (lower.includes('circle') || lower.includes('ccl')) { line = 'CCL'; lineName = 'Circle Line'; }
      else if (lower.includes('downtown') || lower.includes('dtl')) { line = 'DTL'; lineName = 'Downtown Line'; }
      else if (lower.includes('thomson') || lower.includes('tel')) { line = 'TEL'; lineName = 'Thomson-East Coast Line'; }
      else if (lower.includes('north east') || lower.includes('nel')) { line = 'NEL'; lineName = 'North East Line'; }

      const delayMatch = noticeText.match(/(\d+)\s*(mins?|minutes?)/i);
      const reportedDelay = delayMatch ? parseInt(delayMatch[1], 10) : 15;
      const escalationProb = reportedDelay >= 15 ? 78 : 25;
      const advice: 'wait' | 'reroute' = escalationProb > 50 ? 'reroute' : 'wait';

      return {
        rawNotice: noticeText,
        line,
        lineName,
        affectedSector: 'Identified sector along ' + lineName,
        reportedDelayMins: reportedDelay,
        predictedDelayMins: reportedDelay + (advice === 'reroute' ? 12 : 3),
        escalationProbability: escalationProb,
        advice,
        rationale: escalationProb > 50
          ? `High probability (${escalationProb}%) that delay extends beyond 30 mins due to track signaling/power constraints. Free buses or parallel lines will be faster.`
          : `Low escalation probability (${escalationProb}%). Normalization expected within 5-8 mins; waiting on platform is optimal.`,
        personalizedCommuterAdvice: advice === 'reroute'
          ? `For your trip (${origin || 'Current station'} to ${destination || 'Destination'}): Avoid ${lineName}. Switch to parallel underground lines (TEL/DTL) or use free bridging buses.`
          : `For your trip: Maintain your current route on ${lineName}. Add ~${reportedDelay}m buffer, but do not switch to overcrowded bus queues.`,
        freeAlternatives: [
          'Free regular public bus boarding activated along disrupted corridor',
          'Parallel underground line connection (TEL/DTL)',
        ]
      };
    };

    if (!ai) {
      res.json(runLocalParser());
      return;
    }

    const systemPrompt = `You are the Singapore MRT Intelligent Incident Classifier and Commuter Decision Engine.
Convert raw free-text train service notices (from SMRT, SBS Transit, or social media) into structured, actionable commuter advice.

Predict the disruption duration and the probability of delay escalation:
- If technical fault (track circuit, power failure, train stall): escalation probability is typically 70-85%, recommend "reroute".
- If minor door glitch, passenger medical hold, or weather caution: escalation probability is typically 15-35%, recommend "wait".

Also personalize the advice for the user given:
- Commuter's travel origin: ${origin || 'Unknown'}
- Commuter's travel destination: ${destination || 'Unknown'}
- Persona / Priority: ${persona} (e.g. wheelchair mobility, low-sensory autism, fastest crowd avoidance)

Output purely valid JSON conforming to this schema:
{
  "line": "EWL" | "NSL" | "NEL" | "CCL" | "DTL" | "TEL",
  "lineName": string,
  "affectedSector": string,
  "reportedDelayMins": number,
  "predictedDelayMins": number,
  "escalationProbability": number (0-100),
  "advice": "wait" | "reroute",
  "rationale": string,
  "personalizedCommuterAdvice": string,
  "freeAlternatives": string[]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: `Analyze this raw service notice:\n"${noticeText}"` }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      rawNotice: noticeText,
      line: parsed.line || 'EWL',
      lineName: parsed.lineName || 'East West Line',
      affectedSector: parsed.affectedSector || 'Affected Sector',
      reportedDelayMins: parsed.reportedDelayMins || 10,
      predictedDelayMins: parsed.predictedDelayMins || 20,
      escalationProbability: parsed.escalationProbability ?? 65,
      advice: parsed.advice || 'reroute',
      rationale: parsed.rationale || 'Analysis based on fault type and historical recovery times.',
      personalizedCommuterAdvice: parsed.personalizedCommuterAdvice || 'Check parallel rail lines or sheltered buses.',
      freeAlternatives: parsed.freeAlternatives || ['Free public bus boarding active between affected stations'],
    });

  } catch (error: any) {
    console.warn('Notice parser error, using local heuristic:', error.message);
    res.status(200).json({
      rawNotice: req.body.noticeText,
      line: 'EWL',
      lineName: 'East-West Line',
      affectedSector: 'Between affected interchange sectors',
      reportedDelayMins: 15,
      predictedDelayMins: 25,
      escalationProbability: 75,
      advice: 'reroute',
      rationale: 'Signal and track circuit incidents typically require 30+ minutes of manual technician track inspection.',
      personalizedCommuterAdvice: 'Advise rerouting via TEL or DTL underground bypass to avoid platform crowding.',
      freeAlternatives: ['Free shuttle buses operating outside gantry'],
    });
  }
});


// Smart Local Fallback Response Engine
function generateSmartMrtReply(
  userQuery: string,
  context: any,
  language: string,
  weather: any
): { reply: string; suggestedActions: { label: string; action: string }[] } {
  const q = userQuery.toLowerCase();
  const origin = context?.origin || 'Clementi';
  const dest = context?.destination || 'Outram Park';

  // 1. Weather / Rain Queries
  if (q.includes('weather') || q.includes('rain') || q.includes('umbrella') || q.includes('shower') || q.includes('storm')) {
    if (language === 'zh') {
      return {
        reply: `新加坡实时天气播报：${weather.generalForecast}。北部（${weather.regions.north?.text}）与西部（${weather.regions.west?.text}）有降雨风险。建议：东西线（EWL）金文泰至裕廊东为高架户外路段，请携带雨伞；市区线（DTL）和汤申-东海岸线（TEL）为全地下隧道，全程不受降雨影响！`,
        suggestedActions: [
          { label: '查看车厢载客量', action: 'view_carriages' },
          { label: '低感官避雨路线', action: 'toggle_sensory' },
        ],
      };
    }
    if (language === 'ms') {
      return {
        reply: `Ramalan Cuaca Singapura: ${weather.generalForecast}. Risiko hujan di kawasan Utara (${weather.regions.north?.text}) dan Barat (${weather.regions.west?.text}). Laluan EWL atas tanah terdedah hujan; Laluan DTL dan TEL 100% bawah tanah dan terlindung dari cuaca!`,
        suggestedActions: [
          { label: 'Kepadatan Gerabak', action: 'view_carriages' },
          { label: 'Laluan Terlindung', action: 'toggle_sensory' },
        ],
      };
    }
    if (language === 'my') {
      return {
        reply: `စင်ကာပူ မိုးလေဝသ အခြေအနေ: ${weather.generalForecast}။ မြောက်ပိုင်းနှင့် အနောက်ပိုင်းတွင် မိုးရွာနိုင်ခြေရှိပါသည်။ မြေပေါ် EWL လိုင်းများအတွက် ထီးဆောင်ထားရန် အကြံပြုပြီး မြေအောက် DTL နှင့် TEL လိုင်းများသည် မိုးမစိုဘဲ အဆင်ပြေစွာ သွားလာနိုင်ပါသည်။`,
        suggestedActions: [
          { label: 'ရထားတွဲ အခြေအနေ', action: 'view_carriages' },
          { label: 'မိုးလုံလမ်းကြောင်း', action: 'toggle_sensory' },
        ],
      };
    }
    return {
      reply: `Singapore Transit Weather Alert: ${weather.generalForecast}. Rain risk in North (${weather.regions.north?.text}) and West (${weather.regions.west?.text}). The East-West Line viaduct is elevated/above-ground, so carry an umbrella. Downtown Line (DTL) and Thomson-East Coast Line (TEL) are 100% underground and weather-sheltered!`,
      suggestedActions: [
        { label: 'Check Carriages', action: 'view_carriages' },
        { label: 'Underground Bypass', action: 'toggle_sensory' },
      ],
    };
  }

  // 2. Carriage Density Queries
  if (q.includes('carriage') || q.includes('car') || q.includes('crowd') || q.includes('packed') || q.includes('sardine') || q.includes('empty')) {
    if (language === 'zh') {
      return {
        reply: `车厢载客量建议：第1节与第6节车厢客流最少（通常低于35%），最适合舒适出行。第3与第4节车厢正对站台手扶电梯，拥挤度超过80%，但设有轮椅停靠专区与直梯通道。`,
        suggestedActions: [
          { label: '查看车厢实时状态', action: 'view_carriages' },
          { label: '无障碍电梯通道', action: 'view_accessibility' },
        ],
      };
    }
    return {
      reply: `Carriage Density Recommendation: Carriages 1 & 6 (the end cars) have the lowest crowd density (typically under 35%), perfect for extra personal space. Carriages 3 & 4 are near platform escalators (75-90% full) but offer direct wheelchair bays and lift access.`,
      suggestedActions: [
        { label: 'View Carriages', action: 'view_carriages' },
        { label: 'Step-Free Lifts', action: 'view_accessibility' },
      ],
    };
  }

  // 3. Accessibility / Lift / Wheelchair Queries
  if (q.includes('lift') || q.includes('wheelchair') || q.includes('step-free') || q.includes('ramp') || q.includes('elevator') || q.includes('barrier')) {
    if (language === 'zh') {
      return {
        reply: `无障碍指南：从 ${origin} 到 ${dest}：全线100%配备无障碍电梯与加宽检票闸机。乘坐第3节车厢2号门（Carriage 3 Door 2）可直达站台无障碍直梯。欧南园（Outram Park）换乘大厅中段设有无障碍专用电梯，平稳衔接东西线与汤申-东海岸线。`,
        suggestedActions: [
          { label: '查看无障碍设施', action: 'view_accessibility' },
          { label: '低感官宁静出口', action: 'toggle_sensory' },
        ],
      };
    }
    return {
      reply: `Step-Free Accessibility Guide: For ${origin} to ${dest}: All MRT stations are equipped with barrier-free lifts and wide faregates. Board Carriage 3, Door 2 for direct elevator alignment at your arrival platform. At Outram Park interchange, the central transfer lift connects EWL, NEL, and TEL with zero stairs.`,
      suggestedActions: [
        { label: 'Step-Free Details', action: 'view_accessibility' },
        { label: 'Quiet Exits', action: 'toggle_sensory' },
      ],
    };
  }

  // 4. Low-Sensory / Quiet Queries
  if (q.includes('quiet') || q.includes('sensory') || q.includes('noise') || q.includes('calm') || q.includes('decibel') || q.includes('loud')) {
    if (language === 'zh') {
      return {
        reply: `低感官安静出行指南：换乘站早晚高峰期噪音平均约78-84分贝。建议选择第1或第6节端部车厢（约62分贝），避开换乘大厅嘈杂广播。在 ${dest}，建议使用静音通道出口避开拥挤人群。`,
        suggestedActions: [
          { label: '切换低感官模式', action: 'toggle_sensory' },
          { label: '查看空闲车厢', action: 'view_carriages' },
        ],
      };
    }
    return {
      reply: `Low-Sensory Travel Guide: Peak transfer stations average 78-84 dB. To avoid auditory overstimulation, board Carriages 1 or 6 (quieter ~62 dB). Use station quiet exits to bypass chaotic concourses and bus bridge queues.`,
      suggestedActions: [
        { label: 'Low-Sensory Route', action: 'toggle_sensory' },
        { label: 'View Quiet Carriages', action: 'view_carriages' },
      ],
    };
  }

  // 5. Disruption & Delay Queries
  if (q.includes('delay') || q.includes('disruption') || q.includes('breakdown') || q.includes('signal') || q.includes('ewl')) {
    return {
      reply: `Active Disruption Advisory: East-West Line (EWL) has a ~7 min signaling delay between Tiong Bahru and Outram Park. Smart Bypass: Switch to TEL via Havelock or DTL via Chinatown to avoid the crowded delay sector completely!`,
      suggestedActions: [
        { label: 'Bypass EWL Delay', action: 'toggle_sensory' },
        { label: 'View Carriages', action: 'view_carriages' },
      ],
    };
  }

  // Default Route Guidance
  if (language === 'zh') {
    return {
      reply: `我是您的SMRT智能出行助手。从 ${origin} 到 ${dest}：第1和第6节车厢最空旷舒适；需要轮椅无障碍请乘坐第3节车厢（直对电梯）。东西线中峇鲁至欧南园有7分钟信号延误，可选择汤申-东海岸线（TEL）绕行避开拥挤。`,
      suggestedActions: [
        { label: '查看车厢载客量', action: 'view_carriages' },
        { label: '无障碍电梯', action: 'view_accessibility' },
        { label: '低感官避拥路线', action: 'toggle_sensory' },
      ],
    };
  }
  if (language === 'ms') {
    return {
      reply: `Saya Pembantu Navigasi Pintar MRT anda. Untuk perjalanan dari ${origin} ke ${dest}: Gerabak 1 & 6 paling selesa dan lengang (kurang 35%). Untuk akses kerusi roda, gunakan Gerabak 3 & 4 (bersebelahan lif). Ambil laluan TEL atau DTL untuk mengelakkan kelewatan EWL.`,
      suggestedActions: [
        { label: 'Kepadatan Gerabak', action: 'view_carriages' },
        { label: 'Kemudahan Lif', action: 'view_accessibility' },
        { label: 'Laluan Alternatif', action: 'toggle_sensory' },
      ],
    };
  }
  if (language === 'my') {
    return {
      reply: `မင်္ဂလာပါ။ သင်၏ SMRT ခရီးသွားအဖော် AI ဖြစ်ပါသည်။ ${origin} မှ ${dest} သို့: ရထားတွဲ (၁) နှင့် (၆) သည် လူနည်းပြီး ဆိတ်ငြိမ်ပါသည် (လူ ၃၅% အောက်)။ ဘီးတပ်ကုလားထိုင် အသုံးပြုသူများအတွက် ရထားတွဲ (၃) နှင့် (၄) သည် ဓာတ်လှေကားနှင့် တိုက်ရိုက်တန်းတူရှိပါသည်။ EWL ကြန့်ကြာမှုကို ရှောင်ရှားရန် TEL သို့မဟုတ် DTL ကို အသုံးပြုနိုင်ပါသည်။`,
      suggestedActions: [
        { label: 'ရထားတွဲ အခြေအနေ', action: 'view_carriages' },
        { label: 'ဓာတ်လှေကား အချက်အလက်', action: 'view_accessibility' },
        { label: 'ဆိတ်ငြိမ်သော လမ်းကြောင်း', action: 'toggle_sensory' },
      ],
    };
  }
  if (language === 'ta') {
    return {
      reply: `வணக்கம்! உங்கள் எஸ்.எம்.ஆர்.டி வழிகாட்டி. ${origin} இலிருந்து ${dest} செல்வதற்கு: பெட்டி 1 மற்றும் 6 குறைந்த கூட்டம் கொண்டது. சக்கர நாற்காலி பயனர்கள் பெட்டி 3 மற்றும் 4 ஐ பயன்படுத்தவும் (மின்தூக்கி அருகில்). கிழக்கு-மேற்கு பாதையில் தாமதத்தை தவிர்க்க TEL அல்லது DTL ஐ பயன்படுத்தவும்.`,
      suggestedActions: [
        { label: 'பெட்டி கூட்டம்', action: 'view_carriages' },
        { label: 'மின்தூக்கி விவரம்', action: 'view_accessibility' },
      ],
    };
  }

  return {
    reply: `I am your Singapore MRT Smart Travel Companion. For your route from ${origin} to ${dest}: Carriages 1 & 6 offer the lowest crowd density (<35%). For wheelchair/step-free access, board Carriage 3 Door 2 directly aligned with the platform lift. Note: ~7 min signal delay between Tiong Bahru and Outram Park on EWL; bypass via TEL or DTL for a faster, weather-protected trip!`,
    suggestedActions: [
      { label: 'Check Carriages', action: 'view_carriages' },
      { label: 'Step-Free Lifts', action: 'view_accessibility' },
      { label: 'Underground Bypass', action: 'toggle_sensory' },
    ],
  };
}

// AI Chatbot Route Recommendation & Accessibility Query
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, persona, context, language = 'en' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Valid prompt message is required' });
      return;
    }

    const weather = await fetchSingaporeWeather();
    const ai = getGeminiClient();

    // If Gemini client not available, run smart local engine
    if (!ai) {
      const smartResult = generateSmartMrtReply(message, context, language, weather);
      res.json(smartResult);
      return;
    }

    const systemPrompt = `You are the Official Singapore MRT Smart Travel Companion AI Guide.
You assist commuters using advanced predictive transit models and real-time transit intelligence:

Core Capabilities:
1. Turn Free-Text Notices into Actionable Decisions:
   - When a disruption or notice is mentioned, analyze the fault type (e.g. track circuit/power = 76% escalation probability -> recommend "Reroute"; door glitch = 18% -> recommend "Wait").
   - Give clear, structured "WAIT vs REROUTE" advice with concrete time savings.
2. Routine Learning from Commuter Travel History:
   - Infer the user's daily habits from their travel history (e.g. Tampines <-> Raffles Place).
   - Filter disruptions: highlight issues on lines they actually commute on; de-prioritize disruptions on lines they don't use.
3. Ranking Alternatives by Persona Preference (NOT just shortest time):
   - Fixed-Schedule: Predicts exact arrival buffers and alerts only when disruption delays their critical window.
   - Flexible Multimodal: Prioritizes rain-sheltered links, bus alternatives, and lowest crowds.
   - Low-Sensory / Calm: Reroutes through quiet underground stations (<68 dB) and avoids crowded interchange transfers, even if it adds 3-5 mins.
   - Wheelchair / Barrier-Free: Strictly enforces working lifts down to specific lift IDs & exits; warns if an exit lift is under maintenance.
4. Voice & Hands-Free Interaction on Platforms:
   - Provide crisp, direct spoken-style answers designed for commuters listening with earphones or holding bags on a platform.
5. Real-Time Feeds & Weather:
   - 24-hr Singapore Weather & 1-Hour Advance Alerts (Rain storms cause outdoor viaduct crowd surges).
   - Station Crowd Density (updated every 3 min): identify high-congestion interchange platforms.
   - Ad-Hoc Station Lift Maintenance: track individual lift numbers and which exits they serve.
   - Public Flood Alerts: PUB canal water levels near station exits (e.g. Alexandra Canal / Commonwealth).

Current Real-Time Status Snapshot (Singapore Time: ${getSgTimeString()} SGT, ${getSgFullDateString()}):
- Weather: ${weather.generalForecast} (Valid: ${weather.periodText || 'Midday to 6 pm 19 Sep'}) - Temperature: ${weather.temperature.low}°C - ${weather.temperature.high}°C, Humidity: ${weather.relativeHumidity.low}% - ${weather.relativeHumidity.high}%
- Regional Rain & Radar: West: ${weather.regions.west?.text}, North: ${weather.regions.north?.text}, Central: ${weather.regions.central?.text}, East: ${weather.regions.east?.text}, South: ${weather.regions.south?.text}
- 1-Hour Advance Weather Alert: Heavy thundery showers approaching West & Central Singapore at ${String((getSgHour() + 1) % 24).padStart(2, '0')}:00 SGT. Above-ground elevated platforms surge +55% with bus commuters seeking shelter.
- EWL Incident: Track circuit delay near Outram Park (+12 mins, 76% escalation risk -> Advise REROUTE via TEL Havelock or DTL Chinatown). Free bridging buses active.
- Circle Line Incident: Platform door glitch at HarbourFront (+4 mins, 18% escalation risk -> Advise WAIT).
- Lift Maintenance: Outram Park Lift L02 (Exit A to SGH Polyclinic) maintenance until 18:00 SGT (Alternative: Lift L01 at Exit F with sheltered ramp).
- Flood Advisory: PUB Warning at Commonwealth Ave near Queenstown MRT Exit C underpass (use Level 2 overhead bridge).

Keep replies under 140 words, highly practical, respectful, and crystal clear.`;

    const chatContents: any[] = [];

    if (context) {
      chatContents.push({
        text: `Commuter Context:
- Mode / Persona: ${context.mode || persona || 'Standard Transit Mode'}
- Origin: ${context.origin || 'Not set'}
- Destination: ${context.destination || 'Not set'}
- Commuter Travel History: ${JSON.stringify(context.travelHistory || [])}
- Learned Routine: ${context.learnedRoutine ? JSON.stringify(context.learnedRoutine) : 'Inferred from history'}
- Hands-Free / Audio Mode: ${context.isVoiceMode ? 'Enabled (optimize for brief verbal playback)' : 'Standard'}
- Language: ${language}
- Regional Rain Forecast: North: ${weather.regions.north?.text}, West: ${weather.regions.west?.text}, East: ${weather.regions.east?.text}`
      });
    }

    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-4)) {
        chatContents.push({
          text: `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`
        });
      }
    }

    chatContents.push({ text: `User Question: ${message}` });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: chatContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3,
          topP: 0.9,
        }
      });

      const replyText = response.text?.trim();
      if (replyText) {
        res.json({
          reply: replyText,
          suggestedActions: [
            { label: 'View Carriage Density', action: 'view_carriages' },
            { label: 'Step-free Lifts', action: 'view_accessibility' },
            { label: 'Low-Sensory Reroute', action: 'toggle_sensory' }
          ]
        });
        return;
      }
    } catch (geminiError: any) {
      console.warn('Gemini generateContent error, falling back to smart reply:', geminiError.message);
    }

    // Fallback to smart local response if Gemini failed or returned empty
    const fallbackSmart = generateSmartMrtReply(message, context, language, weather);
    res.json(fallbackSmart);

  } catch (error: any) {
    console.error('Chat endpoint general error:', error);
    res.status(500).json({
      error: 'Failed to process route query',
      details: error.message || 'Internal error'
    });
  }
});

// Helper to convert raw Linear PCM (16-bit, 24000Hz, mono) from Gemini to standard WAV format
function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // Linear PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Natural Human-Like Text-to-Speech Endpoint
// Provides clear, warm, conversational speech across all age groups and languages
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Valid text is required for audio synthesis' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Gemini speech client is not initialized' });
      return;
    }

    // Clean text directly for TTS synthesis
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{
        parts: [{
          text: text.trim()
        }]
      }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Kore', // 'Kore' is gentle, warm, and highly intelligible
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = candidate?.inlineData?.data;

    if (base64Audio) {
      // Gemini TTS returns raw 24kHz 16-bit mono L16 PCM.
      // Convert to standard WAV so all browsers and mobile audio elements can decode and play it.
      const rawPcm = Buffer.from(base64Audio, 'base64');
      const wavBuffer = pcmToWavBuffer(rawPcm, 24000, 1, 16);

      res.json({
        audioBase64: wavBuffer.toString('base64'),
        mimeType: 'audio/wav',
      });
      return;
    }

    res.status(500).json({ error: 'Model did not return audio data' });
  } catch (error: any) {
    const isQuota =
      error.status === 429 ||
      error.message?.includes('429') ||
      error.message?.includes('quota') ||
      error.message?.includes('RESOURCE_EXHAUSTED');

    if (!isQuota) {
      console.log('TTS service info: falling back to client synthesis');
    }

    res.status(200).json({
      fallbackToLocal: true,
      isQuotaExceeded: isQuota,
      message: 'Local vocalizer recommended'
    });
  }
});

// Setup Vite in Dev or Serve Dist in Production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MRT Route & Accessibility Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
