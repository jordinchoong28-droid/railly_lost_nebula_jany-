export type MRTLineCode =
  | 'NSL'
  | 'EWL'
  | 'NEL'
  | 'CCL'
  | 'DTL'
  | 'TEL'
  | 'BPLRT'
  | 'SKLRT'
  | 'PGLRT';

export type LanguageCode = 'en' | 'zh' | 'ms' | 'ta' | 'my';

export type AppTheme = 'pink' | 'yellow' | 'green' | 'blue';

export type MobileTab = 'route' | 'carriage' | 'map' | 'accessibility' | 'chat';

export type FontSizeScale = 'a' | 'a+' | 'a++' | 'a+++' | 'normal' | 'large' | 'extra-large' | 'huge';

// PS2 Official Personas & Modes:
// 1. Fixed-Schedule Commuter (Rachel): Tampines -> Raffles Place, EWL, single-line interrupt only when it matters
// 2. Multi-Modal & Flexible Start (Arjun): Punggol -> one-north, cycles, buses, crowd avoidance, weather shelter
// 3. Barrier-Free & Healthcare (Mdm Lim): Bedok -> Singapore General Hospital, step-free, lifts, large text, advance lift warning
export type TransportMode =
  | 'fixed-schedule'
  | 'flexible-multimodal'
  | 'barrier-free'
  | 'standard'
  | 'fastest-density'
  | 'low-sensory'
  | 'step-free';

export type PersonaType = TransportMode | 'marcus' | 'priya' | 'mobility' | 'general';

export type ContrastMode = 'standard' | 'high-contrast-dark' | 'high-contrast-light';

export type RoutingPreference = 'fastest' | 'step-free' | 'low-sensory' | 'least-crowded' | 'sheltered-multimodal';

// Crowding (3 signals from LTA DataMall)
export type StationCrowdLevel = 'l' | 'm' | 'h' | 'NA';
export type BusOccupancyLoad = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing

export interface WeatherRegionForecast {
  text: string;
  code: string;
}

export interface SGWeatherForecast {
  date: string;
  updatedTimestamp: string;
  generalForecast: string;
  temperature: { low: number; high: number };
  relativeHumidity: { low: number; high: number };
  wind?: { direction: string; speed: { low: number; high: number } };
  validPeriodText?: string;
  regions: {
    west: WeatherRegionForecast;
    east: WeatherRegionForecast;
    central: WeatherRegionForecast;
    north: WeatherRegionForecast;
    south: WeatherRegionForecast;
  };
  periodText: string;
}

export interface RouteWeatherAdvisory {
  rainRisk: 'low' | 'moderate' | 'high';
  shelteredRatio: number; // percentage 0-100 of route that is underground or sheltered
  advisoryText: string;
  recommendedAction: string;
  isAboveGround: boolean;
}

export interface StationAccessibility {
  liftAccessible: boolean;
  rampExits: string[];
  tactilePaving: boolean;
  wideGantry: boolean;
  quietExits: string[];
  averageDecibels: number; // e.g. 62 dB (quiet) vs 84 dB (loud)
  wheelchairBoardingDoors: number[];
  liftStatus?: 'operational' | 'maintenance' | 'restricted';
  liftMaintenanceNote?: string;
  hearingLoopPSC?: boolean;
  accessibleToilets?: string[];
  babyCareRoom?: boolean;
  heartZone?: string;
  braillePlates?: boolean;
  barrierFreeLiftExits?: string[];
  lightingType?: string;
  calmCarriageRecommendation?: string;
  staffAssistanceHotline?: string;
  emergencyCallPoints?: string[];
}

export interface StationData {
  id: string;
  name: string;
  nameZh: string;
  nameMs: string;
  nameTa: string;
  nameMy: string;
  codes: string[];
  lines: MRTLineCode[];
  x: number; // schematic map coordinate
  y: number;
  lat?: number; // GPS latitude for OpenStreetMap GIS
  lng?: number; // GPS longitude for OpenStreetMap GIS
  groundLevel?: 'UNDERGROUND' | 'ABOVEGROUND';
  accessibility: StationAccessibility;
  currentCrowd?: StationCrowdLevel;
  forecastCrowd30m?: StationCrowdLevel;
}

export interface NetworkEdge {
  a: string;
  b: string;
  line: MRTLineCode;
  time: number; // in minutes
  key: string;
}

export interface CarriageLoad {
  carriageNumber: number;
  density: number; // percentage 0-100
  wheelchairBay: boolean;
  prioritySeats: number;
  doorAlignment: string; // e.g., "Doors open on Left", "Direct lift access at Door 3"
}

export interface TrainStatus {
  line: MRTLineCode;
  carriages: CarriageLoad[];
  nextArrivalMins: number;
  crowdLevel: 'Low' | 'Moderate' | 'High' | 'Packed';
  recommendedCar: number;
}

// TrainServiceAlerts official LTA DataMall schema
export interface AffectedSegmentData {
  line: MRTLineCode;
  direction: string;
  stations: string[];
  freePublicBus: string; // "Available island-wide" or specific station corridor
  freeMRTShuttle: string; // Shuttles activated
  mrtShuttleDirection: string;
}

export interface DisruptionAlert {
  id: string;
  line: MRTLineCode;
  lineName: string;
  segment: [string, string];
  stations: [string, string];
  type: string;
  severity: 'minor' | 'moderate' | 'severe';
  extraMinutes: number;
  message: string;
  sensoryImpact: string;
  lowSensoryBypass: string;
  wheelchairNote: string;
  isPlanned?: boolean;
  freePublicBus?: string;
  freeMRTShuttle?: string;
}

export interface PlannedMaintenanceEvent {
  id: string;
  title: string;
  line: MRTLineCode;
  scope: string; // e.g. "Early Closure at 23:00 on Fri & Sat"
  startDate: string;
  endDate: string;
  impactSummary: string;
  actionRecommendation: string;
  isLiftMaintenance?: boolean;
  affectedExit?: string;
}

export interface DoorToDoorLeg {
  type: 'walk' | 'cycle' | 'transit' | 'bus';
  fromName: string;
  toName: string;
  durationMins: number;
  distanceMeters: number;
  isSheltered: boolean;
  instruction: string;
  busService?: string;
  busOccupancy?: BusOccupancyLoad;
}

export interface RouteStep {
  fromStation: StationData;
  toStation: StationData;
  line: MRTLineCode;
  time: number;
  isDisrupted?: boolean;
  disruptionNote?: string;
  doorNote?: string;
  recommendedCar?: number;
  crowdLevel?: StationCrowdLevel;
}

export interface ProactiveDecisionSupport {
  headline: string;
  reason: string;
  recommendedAction: string;
  actionType: 'reroute' | 'wait' | 'shelter' | 'step_free_lift';
  targetDepartureDeltaMins?: number;
  timeSavingsMins?: number;
  bufferBeforeAppointmentMins?: number;
}

export interface CalculatedRoute {
  steps: RouteStep[];
  totalMinutes: number;
  transfers: number;
  transferStations: string[];
  linesUsed: MRTLineCode[];
  isLowSensory: boolean;
  isStepFree: boolean;
  disruptionDelay: number;
  uncertaintyRange: [number, number]; // e.g. [38, 44] mins
  proactiveDecision?: ProactiveDecisionSupport;
  doorToDoorLegs: DoorToDoorLeg[];
  shelteredPercentage: number;
  alternativeRoute?: CalculatedRoute;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
}

export interface HourlyWeatherForecast {
  time: string; // e.g. "15:00", "16:00", "17:00", "18:00"
  label: string; // e.g. "Next 1h", "Next 2h", "Next 3h", "Next 4h"
  temp: number; // e.g. 29
  condition: string; // e.g. "Heavy Thundery Showers", "Passing Showers", "Partly Cloudy"
  icon: 'rain' | 'thunder' | 'cloudy' | 'sunny';
  rainChance: number; // 0 - 100%
  windSpeed: string; // e.g. "14 km/h"
  crowdImpact: string; // e.g. "Elevated viaducts slow down; above-ground transfer concourses packed"
  foreseenDisruption?: string;
  isAlert1h?: boolean;
}

export interface Detailed24hWeather extends SGWeatherForecast {
  hourly: HourlyWeatherForecast[];
  localSingaporeTime?: string;
  localSingaporeDate?: string;
  twoHourForecast?: { area: string; forecast: string }[];
  twoHourValidPeriod?: string;
  periods?: {
    timePeriod: { text: string; start: string; end: string };
    regions: {
      west: WeatherRegionForecast;
      east: WeatherRegionForecast;
      central: WeatherRegionForecast;
      north: WeatherRegionForecast;
      south: WeatherRegionForecast;
    };
  }[];
  activeWeatherAlert?: {
    severity: 'warning' | 'advisory';
    title: string;
    message: string;
    advanceNotice: string; // e.g. "1 hour advance warning (Approaching 16:00)"
    impactedLines: MRTLineCode[];
    impactedStations: string[];
    crowdMitigation: string;
  };
}

export interface StructuredDisruptionFeedItem {
  id: string;
  line: MRTLineCode;
  lineName: string;
  segment: string;
  severity: 'minor' | 'moderate' | 'severe';
  type: string;
  extraMinutes: number;
  escalationProbability: number; // e.g. 78 (%)
  predictedDurationMinutes: number;
  recommendation: 'wait' | 'reroute';
  actionAdvice: string;
  freeBusActive: boolean;
  freeBusCorridor?: string;
  officialNoticeRaw: string;
  lastUpdated: string;
}

export interface StationCrowdDensityItem {
  stationId: string;
  stationName: string;
  line: MRTLineCode;
  crowdLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  percentage: number;
  platformTrend: 'rising' | 'stable' | 'falling';
  nextTrainCarsCrowd: number[];
  weatherImpactCrowd: boolean;
  lastUpdated: string;
}

export interface LiftMaintenanceItem {
  id: string;
  stationId: string;
  stationName: string;
  liftId: string;
  servesExit: string;
  platformServed: string;
  status: 'maintenance' | 'operational' | 'intermittent';
  reason: string;
  expectedRestoration: string;
  alternativeAccessiblePath: string;
  lastRefreshed: string;
}

export interface PublicFloodAlertItem {
  id: string;
  location: string;
  nearbyStations: string[];
  severity: 'Advisory' | 'High Risk' | 'Flash Flood Warning';
  waterLevelPercent: number;
  impactOnCommuters: string;
  agency: 'PUB Singapore' | 'NEA';
  issuedAt: string;
  lastRefreshed: string;
}

export interface CommuterTripRecord {
  id: string;
  fromStationId: string;
  toStationId: string;
  timestamp: number;
  dateStr: string;
  timeOfDay: string;
  linesUsed: MRTLineCode[];
}

export interface LearnedRoutine {
  usualOriginId: string;
  usualDestinationId: string;
  frequentLines: MRTLineCode[];
  peakTravelHours: string[];
  summary: string;
  relevantDisruptionCount: number;
}

export interface StructuredNoticeAnalysis {
  rawNotice: string;
  line: MRTLineCode;
  lineName: string;
  affectedSector: string;
  reportedDelayMins: number;
  predictedDelayMins: number;
  escalationProbability: number;
  advice: 'wait' | 'reroute';
  rationale: string;
  personalizedCommuterAdvice: string;
  freeAlternatives: string[];
}

export interface SavedOfflineSnapshot {
  savedAt: string;
  timestamp: number;
  lastFromStationId: string;
  lastToStationId: string;
  calculatedRoute: CalculatedRoute | null;
  weather: Detailed24hWeather | null;
  disruptions: StructuredDisruptionFeedItem[];
  crowdDensities: StationCrowdDensityItem[];
  liftMaintenance: LiftMaintenanceItem[];
  floodAlerts: PublicFloodAlertItem[];
  travelHistory: CommuterTripRecord[];
}

export interface TelegramMrtPost {
  id: string;
  postId: string;
  url: string;
  datetime: string;
  sgTime: string;
  text: string;
  lines: MRTLineCode[];
  stationNames: string[];
  delayMinutes: number;
  category: 'delay' | 'suspension' | 'resumed' | 'extended_hours' | 'maintenance' | 'general';
  severity: 'critical' | 'moderate' | 'minor' | 'info';
  freeBusAvailable: boolean;
  affectsUserRoute?: boolean;
  routeImpactReason?: string;
  isSimulated?: boolean;
}


