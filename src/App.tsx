import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ALL_STATIONS, INITIAL_DISRUPTIONS } from './data/mrtData';
import { calculateRoute } from './utils/router';
import {
  AppTheme,
  CommuterTripRecord,
  ContrastMode,
  Detailed24hWeather,
  DisruptionAlert,
  FontSizeScale,
  LanguageCode,
  LiftMaintenanceItem,
  MobileTab,
  PersonaType,
  PublicFloodAlertItem,
  RoutingPreference,
  StationCrowdDensityItem,
  StructuredDisruptionFeedItem,
  TelegramMrtPost,
  MRTLineCode,
} from './types';
import { Header } from './components/Header';
import { PersonaSelector } from './components/PersonaSelector';
import { RoutePlanner } from './components/RoutePlanner';
import { RouteDiagram } from './components/RouteDiagram';
import { CarriageDensityVisualizer } from './components/CarriageDensityVisualizer';
import { SensoryAndAccessibilityPanel } from './components/SensoryAndAccessibilityPanel';
import { VoiceGuidanceBar } from './components/VoiceGuidanceBar';
import { OfflineMapModal } from './components/OfflineMapModal';
import { AiChatAssistant } from './components/AiChatAssistant';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMapTab } from './components/MobileMapTab';
import { WeatherForecastSection } from './components/WeatherForecastSection';
import { LiveTransitFeedsPanel } from './components/LiveTransitFeedsPanel';
import { TravelHistoryAndRoutineCard } from './components/TravelHistoryAndRoutineCard';
import { ServiceNoticeParserModal } from './components/ServiceNoticeParserModal';
import { SimpleSeniorView } from './components/SimpleSeniorView';
import { FloatingVoiceControl } from './components/FloatingVoiceControl';
import { TelegramLiveFeedModal } from './components/TelegramLiveFeedModal';
import { TelegramDisruptionAlertBanner } from './components/TelegramDisruptionAlertBanner';
import { notificationService } from './services/notificationService';
import { TRANSLATIONS } from './data/translations';

export default function App() {
  // Mobile Active Bottom Navigation Tab
  const [activeTab, setActiveTab] = useState<MobileTab>('route');

  // App Theme & Customization
  const [theme, setTheme] = useState<AppTheme>('pink');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [contrastMode, setContrastMode] = useState<ContrastMode>('standard');
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isNoticeParserOpen, setIsNoticeParserOpen] = useState<boolean>(false);

  // Simple Senior / Child Friendly Mode
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('railly_simple_mode');
        if (saved !== null) return saved === 'true';
      } catch {
        // ignore
      }
    }
    return false;
  });

  const handleToggleSimpleMode = useCallback(() => {
    setIsSimpleMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('railly_simple_mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Font Size Accessibility State (a, a+, a++, a+++)
  const [fontSize, setFontSize] = useState<FontSizeScale>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('railly_font_size');
        if (saved) return saved as FontSizeScale;
      } catch {
        // ignore
      }
    }
    return 'a';
  });

  // Sync font size attribute with html root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-size', fontSize);
      try {
        localStorage.setItem('railly_font_size', fontSize);
      } catch {
        // ignore
      }
    }
  }, [fontSize]);

  // Active Travel Mode
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('fastest-density');

  // Route Planning State
  const [fromStationId, setFromStationId] = useState<string>('clementi');
  const [toStationId, setToStationId] = useState<string>('outram-park');
  const [preference, setPreference] = useState<RoutingPreference>('fastest');
  const [isLowSensoryActive, setIsLowSensoryActive] = useState<boolean>(false);

  // Active Disruption state
  const [disruptions, setDisruptions] = useState<DisruptionAlert[]>(INITIAL_DISRUPTIONS);

  // --- Real-Time Feeds & Offline Cached State ---
  const [weather, setWeather] = useState<Detailed24hWeather | null>(() => {
    try {
      const cached = localStorage.getItem('railly_weather_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed?.weather || (parsed?.hourly ? parsed : null);
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isWeatherRefreshing, setIsWeatherRefreshing] = useState(false);

  const [structuredDisruptions, setStructuredDisruptions] = useState<StructuredDisruptionFeedItem[]>(() => {
    try {
      const cached = localStorage.getItem('railly_disruptions_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed?.disruptions)) return parsed.disruptions;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [crowdDensities, setCrowdDensities] = useState<StationCrowdDensityItem[]>(() => {
    try {
      const cached = localStorage.getItem('railly_crowd_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed?.crowdDensities)) return parsed.crowdDensities;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [liftMaintenance, setLiftMaintenance] = useState<LiftMaintenanceItem[]>(() => {
    try {
      const cached = localStorage.getItem('railly_lifts_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed?.liftMaintenance)) return parsed.liftMaintenance;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [floodAlerts, setFloodAlerts] = useState<PublicFloodAlertItem[]>(() => {
    try {
      const cached = localStorage.getItem('railly_floods_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed?.floodAlerts)) return parsed.floodAlerts;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Commuter Travel History (for routine inference)
  const [travelHistory, setTravelHistory] = useState<CommuterTripRecord[]>(() => {
    try {
      const cached = localStorage.getItem('railly_trips_history');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'hist-1',
        fromStationId: 'clementi',
        toStationId: 'outram-park',
        timestamp: Date.now() - 86400000,
        dateStr: 'Yesterday',
        linesUsed: ['EWL'],
        timeOfDay: '08:35',
      },
      {
        id: 'hist-2',
        fromStationId: 'outram-park',
        toStationId: 'clementi',
        timestamp: Date.now() - 54000000,
        dateStr: 'Yesterday',
        linesUsed: ['EWL'],
        timeOfDay: '18:15',
      },
      {
        id: 'hist-3',
        fromStationId: 'tampines',
        toStationId: 'raffles-place',
        timestamp: Date.now() - 172800000,
        dateStr: '2 days ago',
        linesUsed: ['EWL'],
        timeOfDay: '08:20',
      },
    ];
  });

  // Persist travel history
  useEffect(() => {
    try {
      localStorage.setItem('railly_trips_history', JSON.stringify(travelHistory));
    } catch {
      // ignore
    }
  }, [travelHistory]);

  // Telegram @sgmrt Live Feeds & Push Notification State
  const [telegramPosts, setTelegramPosts] = useState<TelegramMrtPost[]>(() => {
    try {
      const cached = localStorage.getItem('railly_telegram_posts_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [isTelegramLoading, setIsTelegramLoading] = useState<boolean>(false);
  const [lastTelegramSync, setLastTelegramSync] = useState<string>('Just now');
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Push Notifications Enabled State (User preference)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('railly_mrt_push_alerts');
      if (saved !== null) return saved === 'true';
      return true;
    } catch {
      return true;
    }
  });

  const handleToggleNotifications = useCallback((enabled: boolean) => {
    setNotificationsEnabled(enabled);
    try {
      localStorage.setItem('railly_mrt_push_alerts', String(enabled));
    } catch {
      // ignore
    }
  }, []);

  // Post IDs that have already triggered a notification to avoid repeated alerts
  const [notifiedPostIds, setNotifiedPostIds] = useState<Set<string>>(() => new Set());

  // Fetch Telegram @sgmrt channel feed
  const fetchTelegramPosts = useCallback(async () => {
    if (offlineMode) return;
    setIsTelegramLoading(true);
    try {
      const res = await fetch('/api/telegram/sgmrt');
      if (res.ok) {
        const data = await res.json();
        const posts: TelegramMrtPost[] = Array.isArray(data.posts) ? data.posts : [];
        if (posts.length > 0) {
          setTelegramPosts(posts);
          localStorage.setItem('railly_telegram_posts_cache', JSON.stringify(posts));
          setLastTelegramSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (e) {
      console.warn('Telegram feed fetch error:', e);
    } finally {
      setIsTelegramLoading(false);
    }
  }, [offlineMode]);

  // Fetch Weather
  const fetchWeather = useCallback(async () => {
    if (offlineMode) return;
    setIsWeatherRefreshing(true);
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const data = await res.json();
        const weatherObj = data.weather || (data.hourly ? data : null);
        if (weatherObj) {
          setWeather(weatherObj);
          localStorage.setItem('railly_weather_cache', JSON.stringify(weatherObj));
        }
      }
    } catch (e) {
      console.warn('Using offline weather cache:', e);
    } finally {
      setIsWeatherRefreshing(false);
    }
  }, [offlineMode]);

  // Fetch Structured Disruptions (Ad-Hoc)
  const fetchDisruptions = useCallback(async () => {
    if (offlineMode) return;
    try {
      const res = await fetch('/api/disruptions');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.disruptions || []);
        setStructuredDisruptions(items);
        localStorage.setItem('railly_disruptions_cache', JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Using offline disruptions cache:', e);
    }
  }, [offlineMode]);

  // Fetch Station Crowd Density (3-Min Sync)
  const fetchCrowdDensity = useCallback(async () => {
    if (offlineMode) return;
    try {
      const res = await fetch('/api/crowd-density');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.crowdDensities || []);
        setCrowdDensities(items);
        localStorage.setItem('railly_crowd_cache', JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Using offline crowd density cache:', e);
    }
  }, [offlineMode]);

  // Fetch Lift Maintenance (Ad-Hoc)
  const fetchLiftMaintenance = useCallback(async () => {
    if (offlineMode) return;
    try {
      const res = await fetch('/api/lift-maintenance');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.liftMaintenance || []);
        setLiftMaintenance(items);
        localStorage.setItem('railly_lifts_cache', JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Using offline lift maintenance cache:', e);
    }
  }, [offlineMode]);

  // Fetch Flood Alerts (Ad-Hoc)
  const fetchFloodAlerts = useCallback(async () => {
    if (offlineMode) return;
    try {
      const res = await fetch('/api/flood-alerts');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.floodAlerts || []);
        setFloodAlerts(items);
        localStorage.setItem('railly_floods_cache', JSON.stringify(items));
      }
    } catch (e) {
      console.warn('Using offline flood alerts cache:', e);
    }
  }, [offlineMode]);

  // Initial Load of all feeds and periodic background sync
  useEffect(() => {
    fetchWeather();
    fetchDisruptions();
    fetchCrowdDensity();
    fetchLiftMaintenance();
    fetchFloodAlerts();
    fetchTelegramPosts();

    // Auto-poll Telegram channel every 35 seconds to catch live disruptions
    const telegramPollTimer = setInterval(() => {
      fetchTelegramPosts();
    }, 35000);

    return () => clearInterval(telegramPollTimer);
  }, [fetchWeather, fetchDisruptions, fetchCrowdDensity, fetchLiftMaintenance, fetchFloodAlerts, fetchTelegramPosts]);

  // Sync preference with transport mode
  const handleSelectPersona = (p: PersonaType) => {
    setSelectedPersona(p);
    if (p === 'fastest-density' || p === 'marcus') {
      setPreference('least-crowded');
      setIsLowSensoryActive(false);
    } else if (p === 'low-sensory' || p === 'priya') {
      setPreference('low-sensory');
      setIsLowSensoryActive(true);
    } else if (p === 'step-free' || p === 'mobility') {
      setPreference('step-free');
      setIsLowSensoryActive(false);
    } else {
      setPreference('fastest');
      setIsLowSensoryActive(false);
    }
  };

  const handleSwapStations = () => {
    const temp = fromStationId;
    setFromStationId(toStationId);
    setToStationId(temp);
  };

  // Record journey in travel history on search
  const handleFindRoute = () => {
    const newRecord: CommuterTripRecord = {
      id: `trip-${Date.now()}`,
      fromStationId,
      toStationId,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      linesUsed: ['EWL'],
      timeOfDay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTravelHistory((prev) => [newRecord, ...prev.slice(0, 19)]);
  };

  // Contrast Cycle
  const handleToggleContrast = () => {
    if (contrastMode === 'standard') {
      setContrastMode('high-contrast-dark');
    } else if (contrastMode === 'high-contrast-dark') {
      setContrastMode('high-contrast-light');
    } else {
      setContrastMode('standard');
    }
  };

  // Route calculation
  const calculatedRoute = useMemo(() => {
    const activePref = isLowSensoryActive ? 'low-sensory' : preference;
    return calculateRoute(fromStationId, toStationId, activePref, disruptions);
  }, [fromStationId, toStationId, preference, isLowSensoryActive, disruptions]);

  // Primary active line on route
  const currentLine = calculatedRoute?.steps[0]?.line || 'EWL';
  const currentStation = ALL_STATIONS[fromStationId] || ALL_STATIONS['clementi'];

  // Route station IDs for offline map highlight
  const routeStationIds = useMemo(() => {
    if (!calculatedRoute) return [];
    const ids: string[] = [];
    calculatedRoute.steps.forEach((step, idx) => {
      if (idx === 0) ids.push(step.fromStation.id);
      ids.push(step.toStation.id);
    });
    return ids;
  }, [calculatedRoute]);

  // Route station lowercase names for fuzzy Telegram alert matching
  const routeStationNameList = useMemo(() => {
    return routeStationIds
      .map((id) => ALL_STATIONS[id]?.name?.toLowerCase() || '')
      .filter(Boolean);
  }, [routeStationIds]);

  const routeLinesList = useMemo(() => {
    return calculatedRoute ? calculatedRoute.linesUsed : [];
  }, [calculatedRoute]);

  // Cross-reference Telegram posts with user's active planned route
  const enrichedTelegramPosts = useMemo(() => {
    return telegramPosts.map((post) => {
      // Check if post mentions any line used in route
      const hasLineMatch = post.lines.some((line) => routeLinesList.includes(line as MRTLineCode));
      // Check if post mentions any station along route
      const hasStationMatch = post.stationNames.some((stName) => {
        const lower = stName.toLowerCase();
        return routeStationNameList.some((rSt) => rSt.includes(lower) || lower.includes(rSt));
      });

      const affectsUserRoute = hasLineMatch || hasStationMatch;
      let routeImpactReason = '';
      if (affectsUserRoute) {
        if (post.delayMinutes > 0) {
          routeImpactReason = `Delay of ~${post.delayMinutes} mins reported on your route (${post.lines.join(', ') || 'MRT'})`;
        } else if (post.category === 'suspension') {
          routeImpactReason = `Train service suspension on your route (${post.lines.join(', ') || 'MRT'})`;
        } else {
          routeImpactReason = `Service disruption notice affecting your planned line (${post.lines.join(', ') || 'MRT'})`;
        }
      }

      return {
        ...post,
        affectsUserRoute,
        routeImpactReason,
      };
    });
  }, [telegramPosts, routeLinesList, routeStationNameList]);

  // Trigger real-time alert notifications when disruption affects user's route
  useEffect(() => {
    if (!notificationsEnabled) return;

    const affectingPosts = enrichedTelegramPosts.filter((p) => p.affectsUserRoute);

    affectingPosts.forEach((post) => {
      if (!notifiedPostIds.has(post.id)) {
        const title = `⚠️ MRT Route Disruption Alert: ${post.lines.join(', ') || 'MRT'}`;
        notificationService.sendNotification(title, {
          body: `${post.text.slice(0, 160)}...`,
          tag: `tg-alert-${post.id}`,
        });

        setNotifiedPostIds((prev) => new Set(prev).add(post.id));
      }
    });
  }, [enrichedTelegramPosts, notificationsEnabled, notifiedPostIds]);

  // Active top banner alert for route disruptions (not dismissed)
  const activeRouteAlert = useMemo(() => {
    const affecting = enrichedTelegramPosts.filter(
      (p) => p.affectsUserRoute && !dismissedAlertIds.includes(p.id)
    );
    return affecting.length > 0 ? affecting[0] : null;
  }, [enrichedTelegramPosts, dismissedAlertIds]);

  // Simulate delay for testing route notifications
  const handleSimulateDelay = useCallback(async (line: MRTLineCode, text: string) => {
    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          lines: [line],
          delayMinutes: 15,
          category: 'delay',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          notificationService.sendNotification(`⚠️ MRT Disruption Alert: ${line}`, {
            body: text,
            tag: `sim-${Date.now()}`,
          });
          setTelegramPosts((prev) => [data.post, ...prev]);
        }
      }
    } catch (err) {
      console.error('Simulate delay error:', err);
    }
  }, []);

  // Handle reroute action from disruption banner
  const handleApplyRerouteFromDisruption = useCallback(() => {
    setPreference((prev) => (prev === 'least-crowded' ? 'fewest-transfers' : 'least-crowded'));
    setIsLowSensoryActive(true);
    if (activeRouteAlert) {
      setDismissedAlertIds((prev) => [...prev, activeRouteAlert.id]);
    }
  }, [activeRouteAlert]);

  const t = TRANSLATIONS[language];
  const isYellowBlack = contrastMode === 'high-contrast-light';
  const isHighContrastDark = contrastMode === 'high-contrast-dark';

  return (
    <div
      id="app-root-container"
      className={`min-h-screen transition-colors duration-200 font-sans flex flex-col items-center justify-start ${
        isYellowBlack
          ? 'bg-black text-yellow-400'
          : isHighContrastDark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100/80 text-slate-800'
      }`}
    >
      {/* Mobile Application Canvas Container */}
      <div
        id="mobile-phone-canvas"
        className={`w-full max-w-md min-h-screen flex flex-col relative transition-colors ${
          isYellowBlack
            ? 'bg-black border-yellow-400/40'
            : isHighContrastDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-[#FAFBFD] shadow-xl border-x border-slate-200/70'
        }`}
      >
        {/* Top Mobile Header with simplified font switcher a, a+, a++, a+++ */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          contrastMode={contrastMode}
          onToggleContrast={handleToggleContrast}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          offlineMode={offlineMode}
          onToggleOffline={() => setOfflineMode(!offlineMode)}
          onOpenMap={() => setActiveTab('map')}
          theme={theme}
          onThemeChange={setTheme}
          isSimpleMode={isSimpleMode}
          onToggleSimpleMode={handleToggleSimpleMode}
          onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
          telegramAlertCount={enrichedTelegramPosts.filter((p) => p.affectsUserRoute).length}
        />

        {/* Scrollable Active Screen Content */}
        <main className="flex-1 px-3.5 py-3 space-y-3.5 pb-24 overflow-y-auto">
          {/* Real-time Route Disruption Alert Banner from Telegram @sgmrt */}
          {activeRouteAlert && (
            <TelegramDisruptionAlertBanner
              alert={activeRouteAlert}
              onDismiss={() => setDismissedAlertIds((prev) => [...prev, activeRouteAlert.id])}
              onOpenFeedModal={() => setIsTelegramModalOpen(true)}
              onApplyReroute={handleApplyRerouteFromDisruption}
              contrastMode={contrastMode}
            />
          )}

          {/* TAB 1: ROUTE PLANNER & JOURNEY */}
          {activeTab === 'route' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {isSimpleMode ? (
                /* ACCESSIBLE EASY / SENIOR SIMPLE MODE */
                <SimpleSeniorView
                  fromStationId={fromStationId}
                  toStationId={toStationId}
                  onFromChange={setFromStationId}
                  onToChange={setToStationId}
                  onSwap={handleSwapStations}
                  calculatedRoute={calculatedRoute}
                  language={language}
                  contrastMode={contrastMode}
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
                  theme={theme}
                  onSwitchToDetailed={handleToggleSimpleMode}
                  activeTelegramAlert={activeRouteAlert}
                />
              ) : (
                /* COMPREHENSIVE DETAILED MODE */
                <>
                  {/* Mode Quick Toggle Pill */}
                  <div className="flex items-center justify-between px-1">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {t.planJourneyTitle}
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleSimpleMode}
                      className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 hover:bg-amber-100 transition-all shadow-2xs"
                    >
                      <span>👵</span>
                      <span>{t.simpleMode || 'Easy Senior Mode'}</span>
                    </button>
                  </div>

                  {/* 1. Travel Mode Selector */}
                  <PersonaSelector
                    selectedPersona={selectedPersona}
                    onSelectPersona={handleSelectPersona}
                    language={language}
                    contrastMode={contrastMode}
                    theme={theme}
                  />

                  {/* 2. Route Planner Card */}
                  <RoutePlanner
                    fromStationId={fromStationId}
                    toStationId={toStationId}
                    onFromChange={setFromStationId}
                    onToChange={setToStationId}
                    onSwap={handleSwapStations}
                    preference={preference}
                    onPreferenceChange={(pref) => {
                      setPreference(pref);
                      if (pref === 'low-sensory') setIsLowSensoryActive(true);
                      if (pref !== 'low-sensory') setIsLowSensoryActive(false);
                    }}
                    onFindRoute={handleFindRoute}
                    language={language}
                    contrastMode={contrastMode}
                    theme={theme}
                  />

                  {/* 3. 24-Hour Weather Forecast Section with 4h Timeline & 1h Advance Alerts */}
                  <WeatherForecastSection
                    weather={weather}
                    onRefresh={fetchWeather}
                    isRefreshing={isWeatherRefreshing}
                    onSelectShelteredMode={() => {
                      setPreference('sheltered-multimodal');
                      handleFindRoute();
                    }}
                    onAskAiWeather={() => {
                      setActiveTab('chat');
                    }}
                    contrastMode={contrastMode}
                    theme={theme}
                    language={language}
                  />

                  {/* 4. Real-time Voice Guidance for Hands-free Platform Usage */}
                  {calculatedRoute && (
                    <VoiceGuidanceBar
                      route={calculatedRoute}
                      language={language}
                      contrastMode={contrastMode}
                    />
                  )}

                  {/* 5. Step-by-Step Route Diagram */}
                  {calculatedRoute ? (
                    <RouteDiagram
                      route={calculatedRoute}
                      onSelectStation={(id) => {
                        setFromStationId(id);
                      }}
                      language={language}
                      contrastMode={contrastMode}
                      onApplyAlternative={() => {
                        if (calculatedRoute.alternativeRoute) {
                          setIsLowSensoryActive(true);
                        }
                      }}
                    />
                  ) : (
                    <div className="p-6 rounded-2xl border text-center text-xs text-slate-500">
                      {t.planJourneyTitle}
                    </div>
                  )}

                  {/* 6. Official Structured Live Transit Feeds (Disruptions, Crowd 3m, Lifts, Floods) */}
                  <LiveTransitFeedsPanel
                    disruptions={structuredDisruptions}
                    crowdDensities={crowdDensities}
                    liftMaintenance={liftMaintenance}
                    floodAlerts={floodAlerts}
                    onRefreshDisruptions={fetchDisruptions}
                    onRefreshCrowd={fetchCrowdDensity}
                    onRefreshLifts={fetchLiftMaintenance}
                    onRefreshFloods={fetchFloodAlerts}
                    onSelectStation={(id) => setFromStationId(id)}
                    onOpenNoticeParser={() => setIsNoticeParserOpen(true)}
                    contrastMode={contrastMode}
                    theme={theme}
                    language={language}
                  />

                  {/* 7. Learned Routine & Commuter Travel History */}
                  <TravelHistoryAndRoutineCard
                    travelHistory={travelHistory}
                    onSelectRoutineRoute={(orig, dest) => {
                      setFromStationId(orig);
                      setToStationId(dest);
                      handleFindRoute();
                    }}
                    onClearHistory={() => setTravelHistory([])}
                    activeDisruptions={structuredDisruptions}
                    contrastMode={contrastMode}
                    theme={theme}
                    language={language}
                  />
                </>
              )}
            </div>
          )}

          {/* TAB 2: TRAIN CARRIAGES LOAD */}
          {activeTab === 'carriage' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <CarriageDensityVisualizer
                line={currentLine}
                stationName={currentStation.name}
                language={language}
                contrastMode={contrastMode}
              />

              {/* Quick Carriage Info Tip */}
              <div
                className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                  isYellowBlack
                    ? 'border-yellow-400 bg-black text-yellow-300'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold mb-1">{t.howCarriageWorks}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.howCarriageWorksDesc}
                </p>
              </div>

              {/* Live Crowd Density across lines */}
              <LiveTransitFeedsPanel
                disruptions={structuredDisruptions}
                crowdDensities={crowdDensities}
                liftMaintenance={liftMaintenance}
                floodAlerts={floodAlerts}
                onRefreshDisruptions={fetchDisruptions}
                onRefreshCrowd={fetchCrowdDensity}
                onRefreshLifts={fetchLiftMaintenance}
                onRefreshFloods={fetchFloodAlerts}
                onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
                telegramCount={telegramPosts.length}
                contrastMode={contrastMode}
                theme={theme}
                language={language}
              />
            </div>
          )}

          {/* TAB 3: SINGAPORE MRT MAP */}
          {activeTab === 'map' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <MobileMapTab
                fromStationId={fromStationId}
                toStationId={toStationId}
                onSelectFrom={setFromStationId}
                onSelectTo={setToStationId}
                language={language}
                contrastMode={contrastMode}
                routeStationIds={routeStationIds}
                theme={theme}
                onNavigateToRoute={() => setActiveTab('route')}
              />
            </div>
          )}

          {/* TAB 4: ACCESSIBILITY & SENSORY */}
          {activeTab === 'accessibility' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <SensoryAndAccessibilityPanel
                station={currentStation}
                isLowSensoryActive={isLowSensoryActive}
                onToggleLowSensory={() => setIsLowSensoryActive(!isLowSensoryActive)}
                language={language}
                contrastMode={contrastMode}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                onSelectStation={(id) => setFromStationId(id)}
                liftMaintenance={liftMaintenance}
                theme={theme}
                onContrastModeChange={setContrastMode}
              />
            </div>
          )}

          {/* TAB 5: AI TRAVEL & WEATHER ASSISTANT */}
          {activeTab === 'chat' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <AiChatAssistant
                currentPersona={selectedPersona}
                fromStationName={currentStation.name}
                toStationName={ALL_STATIONS[toStationId]?.name || 'Outram Park'}
                language={language}
                contrastMode={contrastMode}
                theme={theme}
                travelHistory={travelHistory}
                onExecuteAction={(act) => {
                  if (act === 'toggle_sensory') {
                    setIsLowSensoryActive(true);
                    setActiveTab('route');
                  }
                  if (act === 'view_carriages') {
                    setPreference('least-crowded');
                    setActiveTab('carriage');
                  }
                  if (act === 'view_accessibility' || act === 'check_lifts') {
                    setActiveTab('accessibility');
                  }
                  if (act === 'check_weather') {
                    setActiveTab('route');
                  }
                  if (act === 'ask_wait_reroute') {
                    setIsNoticeParserOpen(true);
                  }
                }}
              />

              {/* Service Notice Parser Quick Card */}
              <button
                type="button"
                id="btn-trigger-notice-parser"
                onClick={() => setIsNoticeParserOpen(true)}
                className={`w-full p-3 rounded-2xl border text-xs font-black flex items-center justify-between transition-all ${
                  isYellowBlack
                    ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                    : 'border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-purple-500/10 text-purple-600">⚡</span>
                  <div className="text-left">
                    <div className="font-extrabold">{t.parseNoticeBtn}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {t.parseNoticeSubtitle}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">Open &rarr;</span>
              </button>
            </div>
          )}
        </main>

        {/* Global Floating Voice Pause / Resume Bar across all tabs */}
        <FloatingVoiceControl
          language={language}
          contrastMode={contrastMode}
        />

        {/* Pinned Native Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          language={language}
          contrastMode={contrastMode}
          theme={theme}
        />

        {/* Offline Map Modal for Fullscreen Exploration */}
        <OfflineMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          fromStationId={fromStationId}
          toStationId={toStationId}
          onSelectFrom={(id) => {
            setFromStationId(id);
          }}
          onSelectTo={(id) => {
            setToStationId(id);
            setIsMapModalOpen(false);
          }}
          language={language}
          contrastMode={contrastMode}
          routeStationIds={routeStationIds}
        />

        {/* Interactive Free-Text Service Notice AI Classifier Modal */}
        <ServiceNoticeParserModal
          isOpen={isNoticeParserOpen}
          onClose={() => setIsNoticeParserOpen(false)}
          originStation={currentStation.name}
          destStation={ALL_STATIONS[toStationId]?.name || 'Outram Park'}
          currentPersona={selectedPersona}
          contrastMode={contrastMode}
          theme={theme}
          language={language}
        />

        {/* Live Telegram @sgmrt Broadcast Channel Feed & Alert Settings Modal */}
        <TelegramLiveFeedModal
          isOpen={isTelegramModalOpen}
          onClose={() => setIsTelegramModalOpen(false)}
          posts={enrichedTelegramPosts}
          isLoading={isTelegramLoading}
          onRefresh={fetchTelegramPosts}
          lastRefreshed={lastTelegramSync}
          calculatedRoute={calculatedRoute}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={handleToggleNotifications}
          contrastMode={contrastMode}
          language={language}
          onSimulateDelay={handleSimulateDelay}
        />
      </div>
    </div>
  );
}

