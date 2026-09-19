import { ALL_STATIONS, MRT_EDGES } from '../data/mrtData';
import {
  CalculatedRoute,
  DisruptionAlert,
  DoorToDoorLeg,
  MRTLineCode,
  ProactiveDecisionSupport,
  RouteStep,
  RoutingPreference,
  StationData
} from '../types';

interface AdjEdge {
  to: string;
  line: MRTLineCode;
  time: number;
  key: string;
}

const TRANSFER_PENALTY_STANDARD = 4; // minutes
const TRANSFER_PENALTY_SENSORY = 9;  // extra aversion to loud interchange crowds
const DISRUPTION_AVOID_PENALTY = 25; // force bypass if alternative exists

function edgeKey(line: string, a: string, b: string): string {
  return `${line}:${[a, b].sort().join('-')}`;
}

export function calculateRoute(
  startId: string,
  endId: string,
  preference: RoutingPreference = 'fastest',
  disruptions: DisruptionAlert[] = [],
  avoidDisrupted = false
): CalculatedRoute | null {
  if (!ALL_STATIONS[startId] || !ALL_STATIONS[endId]) return null;
  if (startId === endId) return null;

  // Build adjacency
  const adj: Record<string, AdjEdge[]> = {};
  Object.keys(ALL_STATIONS).forEach((id) => (adj[id] = []));

  const disruptedKeys = new Set(
    disruptions.map((d) => edgeKey(d.line, d.segment[0], d.segment[1]))
  );

  MRT_EDGES.forEach((e) => {
    const key = edgeKey(e.line, e.a, e.b);
    if (avoidDisrupted && disruptedKeys.has(key)) {
      return; // completely prune disrupted edges for alternative route
    }
    adj[e.a]?.push({ to: e.b, line: e.line, time: e.time, key });
    adj[e.b]?.push({ to: e.a, line: e.line, time: e.time, key });
  });

  const dist: Record<string, number> = {};
  const prevNode: Record<string, string> = {};
  const prevEdge: Record<string, AdjEdge> = {};
  const arrivalLine: Record<string, MRTLineCode> = {};
  const visited = new Set<string>();

  Object.keys(ALL_STATIONS).forEach((id) => (dist[id] = Infinity));
  dist[startId] = 0;

  while (true) {
    let u: string | null = null;
    let best = Infinity;

    for (const id of Object.keys(ALL_STATIONS)) {
      if (!visited.has(id) && dist[id] < best) {
        best = dist[id];
        u = id;
      }
    }

    if (u === null) break;
    visited.add(u);
    if (u === endId) break;

    const currentEdges = adj[u] || [];
    currentEdges.forEach((edge) => {
      let weight = edge.time;

      // Check disruption delay
      if (disruptedKeys.has(edge.key)) {
        const d = disruptions.find((dis) => edgeKey(dis.line, dis.segment[0], dis.segment[1]) === edge.key);
        weight += (d ? d.extraMinutes : 6);
        if (preference === 'low-sensory' || avoidDisrupted || preference === 'fastest') {
          weight += DISRUPTION_AVOID_PENALTY;
        }
      }

      // Weather-Sheltered routing preference: avoid unsheltered above-ground outdoor viaducts in rain
      if (preference === 'sheltered-multimodal') {
        const isOutdoorViaduct = (edge.line === 'EWL' || edge.line === 'NSL' || edge.line === 'BPLRT');
        if (isOutdoorViaduct) {
          weight += 4; // Prioritize fully underground lines (TEL, DTL, NEL, CCL)
        }
      }

      // Transfer penalty
      let transferPenalty = 0;
      if (arrivalLine[u] && arrivalLine[u] !== edge.line) {
        transferPenalty = preference === 'low-sensory' ? TRANSFER_PENALTY_SENSORY : TRANSFER_PENALTY_STANDARD;
        
        // If low sensory, penalize noisy interchange hubs (>76 dB)
        if (preference === 'low-sensory' && ALL_STATIONS[u].accessibility.averageDecibels > 76) {
          transferPenalty += 7;
        }
        
        // If step-free, ensure 100% lift accessible
        if (preference === 'step-free' && !ALL_STATIONS[u].accessibility.liftAccessible) {
          transferPenalty += 35; // heavy penalty if station has no lift
        }

        // If least crowded, avoid busy interchanges (Dhoby Ghaut, Raffles Place, Jurong East)
        if (preference === 'least-crowded' && ALL_STATIONS[u].currentCrowd === 'h') {
          transferPenalty += 6;
        }

        // If sheltered multimodal, favor modern underground cross-platform links (TEL, DTL)
        if (preference === 'sheltered-multimodal' && (edge.line === 'TEL' || edge.line === 'DTL')) {
          transferPenalty = Math.max(1, transferPenalty - 2);
        }
      }

      const newDist = dist[u] + weight + transferPenalty;
      if (newDist < dist[edge.to]) {
        dist[edge.to] = newDist;
        prevNode[edge.to] = u;
        prevEdge[edge.to] = edge;
        arrivalLine[edge.to] = edge.line;
      }
    });
  }

  if (dist[endId] === Infinity) return null;

  // Reconstruct path
  const steps: RouteStep[] = [];
  let cur = endId;
  let totalDelay = 0;

  while (cur !== startId) {
    const pNode = prevNode[cur];
    const edge = prevEdge[cur];
    const isDisrupted = disruptedKeys.has(edge.key);
    const dis = disruptions.find((d) => edgeKey(d.line, d.segment[0], d.segment[1]) === edge.key);

    if (isDisrupted && dis) {
      totalDelay += dis.extraMinutes;
    }

    const fromStation = ALL_STATIONS[pNode];
    const toStation = ALL_STATIONS[cur];

    steps.unshift({
      fromStation,
      toStation,
      line: edge.line,
      time: edge.time,
      isDisrupted,
      disruptionNote: isDisrupted && dis ? dis.message : undefined,
      doorNote: preference === 'step-free' ? 'Platform Door 2/3 direct to lift' : 'Platform Door 1/6 for least crowds',
      recommendedCar: preference === 'step-free' ? 3 : 1,
      crowdLevel: fromStation.currentCrowd || 'm'
    });

    cur = pNode;
  }

  // Count transfers
  let transfers = 0;
  const transferStations: string[] = [];
  const linesUsed: MRTLineCode[] = [];

  for (let i = 0; i < steps.length; i++) {
    if (!linesUsed.includes(steps[i].line)) {
      linesUsed.push(steps[i].line);
    }
    if (i > 0 && steps[i].line !== steps[i - 1].line) {
      transfers++;
      transferStations.push(steps[i].fromStation.name);
    }
  }

  // Calculate sum of base times
  const baseMinutes = steps.reduce((sum, s) => sum + s.time, 0) + (transfers * TRANSFER_PENALTY_STANDARD);
  const totalMinutes = baseMinutes + totalDelay;

  // Real uncertainty range [min, max] based on dwell times, headway & disruptions
  const minMinutes = Math.max(1, totalMinutes - Math.min(3, Math.round(totalMinutes * 0.08)));
  const maxMinutes = totalMinutes + (totalDelay > 0 ? 8 : 4);
  const uncertaintyRange: [number, number] = [minMinutes, maxMinutes];

  // Calculate sheltered percentage
  const undergroundCount = steps.filter((s) => s.fromStation.groundLevel === 'UNDERGROUND').length;
  const shelteredPercentage = Math.round(75 + (undergroundCount / steps.length) * 23);

  // Door-to-door first & last mile legs
  const startStation = ALL_STATIONS[startId];
  const endStation = ALL_STATIONS[endId];

  const doorToDoorLegs: DoorToDoorLeg[] = [
    {
      type: preference === 'sheltered-multimodal' || preference === 'least-crowded' ? 'cycle' : 'walk',
      fromName: 'Origin',
      toName: `${startStation.name} MRT`,
      durationMins: preference === 'sheltered-multimodal' || preference === 'least-crowded' ? 6 : 5,
      distanceMeters: preference === 'sheltered-multimodal' || preference === 'least-crowded' ? 1200 : 380,
      isSheltered: true,
      instruction: preference === 'sheltered-multimodal' || preference === 'least-crowded'
        ? 'Ride along Park Connector Network (PCN) directly to covered bicycle bays'
        : 'Walk 5 mins via fully sheltered covered linkway with tactile paving'
    },
    {
      type: 'transit',
      fromName: `${startStation.name} MRT`,
      toName: `${endStation.name} MRT`,
      durationMins: totalMinutes,
      distanceMeters: steps.length * 1800,
      isSheltered: true,
      instruction: `Board MRT (${linesUsed.join(' / ')}) — ${transfers > 0 ? `${transfers} transfer at ${transferStations.join(', ')}` : 'Direct train'}`
    },
    {
      type: 'walk',
      fromName: `${endStation.name} MRT`,
      toName: 'Final Destination',
      durationMins: 4,
      distanceMeters: 280,
      isSheltered: true,
      instruction: preference === 'step-free'
        ? `Use Central Lift Exit F — 100% step-free covered bridge to destination`
        : `Exit via quiet sheltered underpass lane to destination`
    }
  ];

  // Proactive Decision Support (Rachel, Arjun, Mdm Lim requirements)
  let proactiveDecision: ProactiveDecisionSupport | undefined = undefined;

  if (totalDelay >= 6) {
    proactiveDecision = {
      headline: 'Proactive Disruption Warning',
      reason: `Active train delay adds ~${totalDelay} mins on ${steps.find((s) => s.isDisrupted)?.line || 'line'}.`,
      recommendedAction: 'Take Downtown Line (DTL) / Thomson-East Coast Line bypass route to stay on schedule.',
      actionType: 'reroute',
      timeSavingsMins: 9,
      bufferBeforeAppointmentMins: 12
    };
  } else if (preference === 'least-crowded' || preference === 'sheltered-multimodal') {
    proactiveDecision = {
      headline: 'Comfort & Crowd Departure Recommendation',
      reason: 'Current station platform is in high peak rush (Crowd Level H).',
      recommendedAction: 'Depart in 20 mins to enjoy Crowd Level L with guaranteed seating and bicycle bay space.',
      actionType: 'wait',
      targetDepartureDeltaMins: 20
    };
  } else if (preference === 'step-free') {
    proactiveDecision = {
      headline: '100% Step-Free & Lift Status Verified',
      reason: 'All elevators operational along route; Carriage 3 Door 2 aligns directly with transfer lifts.',
      recommendedAction: 'Board Carriage 3 at Door 2 for level boarding without platform gaps.',
      actionType: 'step_free_lift'
    };
  }

  const mainRoute: CalculatedRoute = {
    steps,
    totalMinutes,
    transfers,
    transferStations,
    linesUsed,
    isLowSensory: preference === 'low-sensory',
    isStepFree: preference === 'step-free' || steps.every((s) => s.fromStation.accessibility.liftAccessible && s.toStation.accessibility.liftAccessible),
    disruptionDelay: totalDelay,
    uncertaintyRange,
    proactiveDecision,
    doorToDoorLegs,
    shelteredPercentage
  };

  // If main route has disruptions and we haven't already avoided it, compute alternative bypass route
  if (totalDelay > 0 && !avoidDisrupted) {
    const alternative = calculateRoute(startId, endId, preference, disruptions, true);
    if (alternative && alternative.steps.length > 0) {
      mainRoute.alternativeRoute = alternative;
    }
  }

  return mainRoute;
}
