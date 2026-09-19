import { SGWeatherForecast, RouteWeatherAdvisory, RouteStep } from '../types';

// Map Singapore MRT station IDs to meteorological zones (West, East, Central, North, South)
export function getStationRegion(stationId: string): 'west' | 'east' | 'central' | 'north' | 'south' {
  const s = stationId.toLowerCase();
  if (
    s.includes('jurong') ||
    s.includes('clementi') ||
    s.includes('boon-lay') ||
    s.includes('pioneer') ||
    s.includes('tuas') ||
    s.includes('lakeside') ||
    s.includes('chinese-garden') ||
    s.includes('buona-vista') ||
    s.includes('beauty-world') ||
    s.includes('bukit-panjang') ||
    s.includes('choa-chu-kang')
  ) {
    return 'west';
  }
  if (
    s.includes('woodlands') ||
    s.includes('yishun') ||
    s.includes('admiralty') ||
    s.includes('sembawang') ||
    s.includes('canberra') ||
    s.includes('khatib') ||
    s.includes('ang-mo-kio') ||
    s.includes('yio-chu-kang') ||
    s.includes('kranji') ||
    s.includes('marsiling')
  ) {
    return 'north';
  }
  if (
    s.includes('tampines') ||
    s.includes('bedok') ||
    s.includes('pasir-ris') ||
    s.includes('expo') ||
    s.includes('changi') ||
    s.includes('simei') ||
    s.includes('tanah-merah') ||
    s.includes('kallang') ||
    s.includes('aljunied') ||
    s.includes('paya-lebar') ||
    s.includes('eunos') ||
    s.includes('kembangan') ||
    s.includes('bayshore')
  ) {
    return 'east';
  }
  if (
    s.includes('harbourfront') ||
    s.includes('marina-bay') ||
    s.includes('tanjong-pagar') ||
    s.includes('outram-park') ||
    s.includes('telok-blangah') ||
    s.includes('shenton') ||
    s.includes('maxwell')
  ) {
    return 'south';
  }
  return 'central';
}

// Stations that have elevated / above-ground viaduct platforms (exposed to wind/blowing rain)
const ABOVE_GROUND_STATIONS = new Set([
  'boon-lay',
  'jurong-east',
  'clementi',
  'buona-vista',
  'aljunied',
  'paya-lebar',
  'bedok',
  'tampines',
  'pasir-ris',
  'expo',
  'choa-chu-kang',
  'woodlands',
  'admiralty',
  'yishun',
  'ang-mo-kio',
  'bukit-panjang'
]);

export function evaluateRouteWeatherAdvisory(
  steps: RouteStep[],
  weather: SGWeatherForecast | null
): RouteWeatherAdvisory {
  if (!weather || steps.length === 0) {
    return {
      rainRisk: 'low',
      shelteredRatio: 85,
      advisoryText: 'Weather conditions normal across Singapore transit network.',
      recommendedAction: 'Standard travel mode active. Underground transfers protected.',
      isAboveGround: false,
    };
  }

  // Check which regions the route passes through
  const regionsCovered = new Set<string>();
  let aboveGroundCount = 0;

  steps.forEach((step) => {
    regionsCovered.add(getStationRegion(step.fromStation.id));
    regionsCovered.add(getStationRegion(step.toStation.id));
    if (ABOVE_GROUND_STATIONS.has(step.fromStation.id) || ABOVE_GROUND_STATIONS.has(step.toStation.id)) {
      aboveGroundCount++;
    }
  });

  const totalSteps = steps.length;
  const isAboveGround = aboveGroundCount > 0;
  const shelteredRatio = Math.max(20, Math.round(((totalSteps * 2 - aboveGroundCount) / (totalSteps * 2)) * 100));

  // Determine highest rain severity in the transit zones
  let hasThunderyShowers = false;
  let hasShowers = false;
  let activeRainRegions: string[] = [];

  regionsCovered.forEach((r) => {
    const regKey = r as keyof typeof weather.regions;
    const regForecast = weather.regions[regKey];
    if (regForecast) {
      const text = regForecast.text.toLowerCase();
      if (text.includes('thundery') || text.includes('heavy')) {
        hasThunderyShowers = true;
        activeRainRegions.push(`${r.toUpperCase()} (${regForecast.text})`);
      } else if (text.includes('shower') || text.includes('rain')) {
        hasShowers = true;
        activeRainRegions.push(`${r.toUpperCase()} (${regForecast.text})`);
      }
    }
  });

  if (hasThunderyShowers) {
    return {
      rainRisk: 'high',
      shelteredRatio,
      advisoryText: `Heavy rain / thundery showers reported in ${activeRainRegions.join(', ')}. ${
        isAboveGround
          ? 'Route includes above-ground viaducts — expect wet platforms and blowing rain.'
          : 'Route is fully underground in air-conditioned tunnels.'
      }`,
      recommendedAction: isAboveGround
        ? 'Carry an umbrella. Use sheltered linkways (e.g. Exit A/B) or consider underground TEL/DTL bypass.'
        : 'Transit is protected underground. Use covered station exits upon arrival.',
      isAboveGround,
    };
  }

  if (hasShowers) {
    return {
      rainRisk: 'moderate',
      shelteredRatio,
      advisoryText: `Passing showers detected in ${activeRainRegions.join(', ')}.`,
      recommendedAction: 'Keep an umbrella handy. All major interchange transfer halls are 100% sheltered.',
      isAboveGround,
    };
  }

  return {
    rainRisk: 'low',
    shelteredRatio,
    advisoryText: `Fair / partly cloudy along your route (${weather.generalForecast}).`,
    recommendedAction: 'Great travel conditions across all MRT lines.',
    isAboveGround,
  };
}
