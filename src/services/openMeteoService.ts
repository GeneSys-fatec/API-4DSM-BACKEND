const weatherCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000;

const SUPPORTED_OPEN_METEO_KEYS = new Set<string>([
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "rain",
  "showers",
  "snowfall",
  "surface_pressure",
  "pressure_msl",
  "cloud_cover",
  "cloud_cover_low",
  "cloud_cover_mid",
  "cloud_cover_high",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
]);

const OPEN_METEO_FALLBACK_KEY = "temperature_2m";

interface WeatherRangeOptions {
  from?: string;
  to?: string;
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function resolveOpenMeteoKey(rawKey: string): string | null {
  const normalized = rawKey.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (SUPPORTED_OPEN_METEO_KEYS.has(normalized)) {
    return normalized;
  }

  if (normalized.includes("temp")) {
    return "temperature_2m";
  }
  if (normalized.includes("humid") || normalized.includes("umid")) {
    return "relative_humidity_2m";
  }
  if (normalized.includes("rain") || normalized.includes("chuva") || normalized.includes("precip")) {
    return "precipitation";
  }
  if (normalized.includes("wind") || normalized.includes("vento")) {
    return "wind_speed_10m";
  }
  if (normalized.includes("press")) {
    return "surface_pressure";
  }

  return null;
}

export class OpenMeteoService {
  async fetchCurrentWeather(
    latitude: string,
    longitude: string,
    keys: string[],
    range?: WeatherRangeOptions,
  ) {
    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      const resolvedKeys = [...new Set(keys
        .map((key) => resolveOpenMeteoKey(key))
        .filter((key): key is string => Boolean(key)))];

      const keysString = resolvedKeys.length > 0
        ? resolvedKeys.join(",")
        : OPEN_METEO_FALLBACK_KEY;

      const hasCustomRange = Boolean(
        range?.from &&
        range?.to &&
        isIsoDate(range.from) &&
        isIsoDate(range.to) &&
        range.from <= range.to,
      );

      const normalizedRange = hasCustomRange
        ? { from: range!.from!, to: range!.to! }
        : null;

      const cacheKey = `${lat},${lon},${keysString},${normalizedRange?.from ?? ""},${normalizedRange?.to ?? ""}`;
      const now = Date.now();

      if (weatherCache.has(cacheKey)) {
        const cached = weatherCache.get(cacheKey)!;
        if (now - cached.timestamp < CACHE_DURATION_MS) {
          console.log(
            `[CACHE] Dados climáticos carregados da memória para ${lat}, ${lon}`,
          );
          return cached.data;
        }
      }

      console.log(
        `[API] Buscando dados novos no Open-Meteo para ${lat}, ${lon}...`,
      );
      const defaultUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${keysString}&hourly=${keysString}&past_days=30`;
      const customRangeUrl = normalizedRange
        ? `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${keysString}&hourly=${keysString}&start_date=${normalizedRange.from}&end_date=${normalizedRange.to}`
        : null;

      let data: any;

      if (customRangeUrl) {
        const customRangeResponse = await fetch(customRangeUrl);

        if (customRangeResponse.ok) {
          data = await customRangeResponse.json();
        } else {
          console.warn(
            `[API] Faixa personalizada não suportada (${normalizedRange.from} até ${normalizedRange.to}). Aplicando fallback para últimos 30 dias.`,
          );
        }
      }

      if (!data) {
        const fallbackResponse = await fetch(defaultUrl);

        if (!fallbackResponse.ok) {
          throw new Error(`Erro na API Open-Meteo: ${fallbackResponse.statusText}`);
        }

        data = await fallbackResponse.json();
      }

      const result = {
        current: data.current,
        hourly: data.hourly,
        units: data.current_units,
      };

      weatherCache.set(cacheKey, { data: result, timestamp: now });

      return result;
    } catch (error) {
      console.error("Erro ao buscar dados climáticos:", error);
      throw new Error("Não foi possível integrar com o serviço de clima.");
    }
  }
}

export default new OpenMeteoService();
