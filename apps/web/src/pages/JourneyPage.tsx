import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutGrid,
  Map,
  TrendingUp,
  ListOrdered,
  ShieldCheck,
} from 'lucide-react';
import { useTrainStatus } from '../hooks/useTrainStatus.js';
import { useTrainRoute } from '../hooks/useTrainRoute.js';
import { useTrainWeather } from '../hooks/useTrainWeather.js';
import { useTrainElevation } from '../hooks/useTrainElevation.js';
import { TrainIdentityHeader } from '../features/journey/TrainIdentityHeader.js';
import { JourneySummaryCard } from '../features/journey/JourneySummaryCard.js';
import { StationTimeline, isHaltStop } from '../features/journey/StationTimeline.js';
import { UpcomingStopsCard } from '../features/journey/UpcomingStopsCard.js';
import { PassengerLiveAdvisory } from '../features/journey/PassengerLiveAdvisory.js';
import { JourneyMap } from '../features/map/JourneyMap.js';
import { ImmersiveMapExperience } from '../features/map/ImmersiveMapExperience.js';
import { RouteWeatherCards } from '../features/weather/RouteWeatherCards.js';
import { ElevationProfileChart } from '../features/analytics/ElevationProfileChart.js';
import { TerrainPointsOfInterest } from '../features/analytics/TerrainPointsOfInterest.js';
import { ShareJourneyModal } from '../features/sharing/ShareJourneyModal.js';
import { StaleDataBanner } from '../components/ui/StaleDataBanner.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { ErrorState } from '../components/ui/ErrorState.js';

export const JourneyPage: React.FC = () => {
  const { trainId } = useParams<{ trainId: string }>();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'analytics' | 'timetable'>('overview');

  const {
    data: statusResponse,
    isLoading: isStatusLoading,
    isError: isStatusError,
    error: statusError,
    refetch: refetchStatus,
    isFetching: isStatusFetching,
  } = useTrainStatus(trainId || '');

  const { data: routeResponse } = useTrainRoute(trainId || '');
  const { data: weatherResponse, isLoading: isWeatherLoading } = useTrainWeather(trainId || '');
  const { data: elevationResponse, isLoading: isElevationLoading } = useTrainElevation(trainId || '');

  if (isStatusLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
        <Skeleton height={40} width={180} />
        <Skeleton height={100} />
        <Skeleton height={180} />
        <Skeleton height={420} />
        <Skeleton height={200} />
      </div>
    );
  }

  if (isStatusError || !statusResponse?.data) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-primary, #2563eb)',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={16} />
          Back to Search
        </Link>
        <ErrorState
          title={`Train ${trainId} Status Unavailable`}
          message={
            (statusError as Error)?.message ||
            'Could not retrieve live running status for this train. Please verify the train number or try again.'
          }
          onRetry={() => refetchStatus()}
          isRetrying={isStatusFetching}
        />
      </div>
    );
  }

  const status = statusResponse.data;
  const meta = statusResponse.meta;
  const route = routeResponse?.data;
  const weather = weatherResponse?.data;
  const elevation = elevationResponse?.data;

  const haltStopsCount = (status.stops || []).filter((s, idx) =>
    isHaltStop(s, idx, status.stops?.length || 0)
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Back to Search Link */}
      <div>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--color-text-secondary, #64748b)',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>All Trains</span>
        </Link>
      </div>

      {/* Stale Data Warning Banner */}
      {meta?.stale && (
        <StaleDataBanner
          lastUpdated={meta.sourceUpdatedAt}
          onRefresh={() => refetchStatus()}
          isRefreshing={isStatusFetching}
        />
      )}

      {/* Train Identity Header matching journey_overview.png */}
      <TrainIdentityHeader
        status={status}
        meta={meta}
        onShare={() => setIsShareOpen(true)}
        onRefresh={() => refetchStatus()}
        isRefreshing={isStatusFetching}
      />

      {/* Tab Navigation matching journey_overview.png */}
      <nav
        aria-label="Journey Sections"
        style={{
          display: 'flex',
          gap: '1.5rem',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
          paddingBottom: '0.25rem',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '8px 4px 12px 4px',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: activeTab === 'overview' ? 800 : 600,
            cursor: 'pointer',
            color: activeTab === 'overview' ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #64748b)',
            borderBottom: activeTab === 'overview' ? '3px solid var(--color-primary, #2563eb)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <LayoutGrid size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          style={{
            padding: '8px 4px 12px 4px',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: activeTab === 'map' ? 800 : 600,
            cursor: 'pointer',
            color: activeTab === 'map' ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #64748b)',
            borderBottom: activeTab === 'map' ? '3px solid var(--color-primary, #2563eb)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <Map size={16} />
          <span>Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '8px 4px 12px 4px',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: activeTab === 'analytics' ? 800 : 600,
            cursor: 'pointer',
            color: activeTab === 'analytics' ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #64748b)',
            borderBottom: activeTab === 'analytics' ? '3px solid var(--color-primary, #2563eb)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <TrendingUp size={16} />
          <span>Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timetable')}
          style={{
            padding: '8px 4px 12px 4px',
            border: 'none',
            background: 'none',
            fontSize: '0.9375rem',
            fontWeight: activeTab === 'timetable' ? 800 : 600,
            cursor: 'pointer',
            color: activeTab === 'timetable' ? 'var(--color-primary, #2563eb)' : 'var(--color-text-secondary, #64748b)',
            borderBottom: activeTab === 'timetable' ? '3px solid var(--color-primary, #2563eb)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <ListOrdered size={16} />
          <span>Along Route ({haltStopsCount} Halts)</span>
        </button>
      </nav>

      {/* Tab 1: Journey Overview (Matching journey_overview.png) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Bento Telemetry Cards + Horizontal Journey Trajectory */}
          <JourneySummaryCard status={status} />

          {/* 2-Column Section from journey_overview.png */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 1fr)',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Interactive Map Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <JourneyMap
                status={status}
                route={route}
                height="440px"
                onExpand={() => setActiveTab('map')}
              />
            </div>

            {/* Right Column: Upcoming Stops & Passenger Live Advisory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <UpcomingStopsCard
                stops={status.stops}
                onViewAll={() => setActiveTab('timetable')}
              />

              <PassengerLiveAdvisory status={status} />
            </div>
          </div>

          {/* Provider Meta Footer from journey_overview.png */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border, #e2e8f0)',
              color: 'var(--color-text-secondary, #64748b)',
              fontSize: '0.8125rem',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))',
            }}
          >
            <ShieldCheck size={16} style={{ color: 'var(--color-primary, #2563eb)' }} />
            <span>
              Provided by <strong>RailRadar</strong> • Live NTES & GPS telemetry feed • Updated 2 min ago
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Immersive Map View (Matching immersive_map.png) */}
      {activeTab === 'map' && (
        <ImmersiveMapExperience
          status={status}
          route={route}
          onClose={() => setActiveTab('overview')}
          onShare={() => setIsShareOpen(true)}
          onRefresh={() => refetchStatus()}
          onViewDetailedHalts={() => setActiveTab('timetable')}
          isRefreshing={isStatusFetching}
        />
      )}

      {/* Tab 3: Analytics & Terrain */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ElevationProfileChart profile={elevation} isLoading={isElevationLoading} />
          <TerrainPointsOfInterest pois={elevation?.pois} isLoading={isElevationLoading} />
          <RouteWeatherCards weather={weather} isLoading={isWeatherLoading} />
        </div>
      )}

      {/* Tab 4: Along Route (Halts Schedule) */}
      {activeTab === 'timetable' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <StationTimeline stops={status.stops} />
        </div>
      )}

      {/* Share Modal */}
      <ShareJourneyModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trainNumber={status.trainNumber}
        trainName={status.trainName}
        date={status.journeyDate}
      />
    </div>
  );
};
