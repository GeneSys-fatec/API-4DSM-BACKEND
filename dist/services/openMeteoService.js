const weatherCache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000;
export class OpenMeteoService {
    async fetchCurrentWeather(latitude, longitude, keys) {
        try {
            const lat = parseFloat(latitude);
            const lon = parseFloat(longitude);
            const keysString = keys.length > 0 ? keys.join(",") : "temperature_2m";
            const cacheKey = `${lat},${lon},${keysString}`;
            const now = Date.now();
            if (weatherCache.has(cacheKey)) {
                const cached = weatherCache.get(cacheKey);
                if (now - cached.timestamp < CACHE_DURATION_MS) {
                    console.log(`[CACHE] Dados climáticos carregados da memória para ${lat}, ${lon}`);
                    return cached.data;
                }
            }
            console.log(`[API] Buscando dados novos no Open-Meteo para ${lat}, ${lon}...`);
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${keysString}&hourly=${keysString}&past_days=30`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro na API Open-Meteo: ${response.statusText}`);
            }
            const data = await response.json();
            const result = {
                current: data.current,
                hourly: data.hourly,
                units: data.current_units,
            };
            weatherCache.set(cacheKey, { data: result, timestamp: now });
            return result;
        }
        catch (error) {
            console.error("Erro ao buscar dados climáticos:", error);
            throw new Error("Não foi possível integrar com o serviço de clima.");
        }
    }
}
export default new OpenMeteoService();
//# sourceMappingURL=openMeteoService.js.map