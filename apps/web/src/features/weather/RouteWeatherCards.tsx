import React from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudFog,
  Wind,
  Droplets,
  Eye,
  AlertTriangle,
  MapPin,
  Clock,
} from 'lucide-react';
import { RouteWeatherSummary, WeatherCondition } from '../../types/train.js';
import { Card } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

export interface RouteWeatherCardsProps {
  weather?: RouteWeatherSummary;
  isLoading?: boolean;
}

const WeatherCardItem: React.FC<{
  title: string;
  data?: WeatherCondition | null;
}> = ({ title, data }) => {
  if (!data) {
    return (
      <Card padding="md" style={{ flex: 1, minWidth: '260px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          {title}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
          Weather data temporarily unavailable for this station.
        </p>
      </Card>
    );
  }

  const cond = (data.condition || 'clear').toLowerCase();
  let WeatherIcon = Sun;
  let iconColor = '#F59E0B';

  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm')) {
    WeatherIcon = CloudRain;
    iconColor = '#3B82F6';
  } else if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
    WeatherIcon = CloudFog;
    iconColor = '#9CA3AF';
  } else if (cond.includes('cloud')) {
    WeatherIcon = Cloud;
    iconColor = '#60A5FA';
  }

  return (
    <Card
      padding="md"
      style={{
        flex: 1,
        minWidth: '260px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div>
        {/* Header role + Station */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              {title}
            </span>
          </div>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--color-surface-subtle)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {data.stationCode}
          </span>
        </div>

        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
          {data.stationName}
        </div>

        {/* Temperature & Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.875rem 0' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
              {data.tempCelsius}°C
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Feels like {data.feelsLikeCelsius}°C • {data.description}
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WeatherIcon size={28} style={{ color: iconColor }} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)' }}>
            <Droplets size={13} style={{ color: '#3B82F6' }} />
            <span>{data.humidityPercent}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)' }}>
            <Wind size={13} style={{ color: '#10B981' }} />
            <span>{data.windSpeedKmph} km/h</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)' }}>
            <Eye size={13} style={{ color: '#8B5CF6' }} />
            <span>{data.visibilityKm} km</span>
          </div>
        </div>
      </div>

      {/* Fog Alert / Rail Impact Pill */}
      {data.fogRisk !== 'NONE' ? (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: data.fogRisk === 'SEVERE' ? 'var(--color-danger-soft)' : 'var(--color-warning-soft)',
            color: data.fogRisk === 'SEVERE' ? 'var(--color-danger)' : 'var(--color-warning)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertTriangle size={12} />
          <span>
            {data.fogRisk === 'SEVERE' ? 'Dense Fog Warning: Speed restricted' : 'Moderate Fog / Haze reported'}
          </span>
        </div>
      ) : (
        <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          Normal atmospheric visibility along track
        </div>
      )}
    </Card>
  );
};

export const RouteWeatherCards: React.FC<RouteWeatherCardsProps> = ({ weather, isLoading }) => {
  return (
    <section aria-label="Route weather conditions" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sun size={20} style={{ color: '#F59E0B' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
            Route & Station Weather
          </h2>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Clock size={12} />
          OpenWeather Live Telemetry
        </span>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <Skeleton height={180} />
          <Skeleton height={180} />
          <Skeleton height={180} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <WeatherCardItem title="Current Position" data={weather?.current} />
          <WeatherCardItem title="Next Stop" data={weather?.next} />
          <WeatherCardItem title="Destination" data={weather?.destination} />
        </div>
      )}
    </section>
  );
};
