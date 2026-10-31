import { WeatherCondition } from '../../domain/types.js';

export class OpenWeatherProvider {
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
  }

  private getApiKey(): string | undefined {
    return process.env.OPENWEATHER_API_KEY || this.apiKey;
  }
  private getBaseUrl(): string {
    return process.env.OPENWEATHER_BASE_URL || this.baseUrl || 'https://api.openweathermap.org/data/2.5';
  }

  async getWeatherForStation(
    stationCode: string,
    stationName: string,
    lat: number,
    lon: number,
    role: 'current' | 'next' | 'destination'
  ): Promise<WeatherCondition | null> {
    const key = this.getApiKey();
    if (!key) {
      console.warn('[OpenWeatherProvider] No OPENWEATHER_API_KEY configured');
      return null;
    }

    try {
      const url = `${this.getBaseUrl()}/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[OpenWeatherProvider] Weather fetch failed for ${stationCode} with status ${res.status}`);
        return null;
      }
      const data = await res.json() as {
        main: { temp: number; feels_like: number; humidity: number };
        weather: Array<{ main: string; description: string }>;
        wind: { speed: number };
        visibility: number;
        dt: number;
      };

      const visibilityKm = Math.round(((data.visibility ?? 10000) / 1000) * 10) / 10;
      const cond = data.weather[0]?.main || 'Clear';

      let fogRisk: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE' = 'NONE';
      if (visibilityKm < 0.8 || cond.toLowerCase().includes('fog')) {
        fogRisk = 'SEVERE';
      } else if (visibilityKm < 2.0 || cond.toLowerCase().includes('mist')) {
        fogRisk = 'MODERATE';
      } else if (visibilityKm < 4.0 || cond.toLowerCase().includes('haze')) {
        fogRisk = 'LOW';
      }

      return {
        stationCode,
        stationName,
        role,
        tempCelsius: Math.round(data.main.temp),
        feelsLikeCelsius: Math.round(data.main.feels_like ?? data.main.temp),
        condition: cond,
        description: data.weather[0]?.description || '',
        humidityPercent: data.main.humidity,
        windSpeedKmph: Math.round((data.wind?.speed || 0) * 3.6),
        visibilityKm,
        fogRisk,
        updatedAt: new Date((data.dt || Date.now() / 1000) * 1000).toISOString(),
      };
    } catch (err) {
      console.error(`[OpenWeatherProvider] Error fetching weather for ${stationCode}:`, err);
      return null;
    }
  }
}

export const openWeatherProvider = new OpenWeatherProvider();
