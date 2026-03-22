export class OpenMeteoService {
  async fetchCurrentWeather(latitude: string, longitude: string) {
    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&past_days=30`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro na API Open-Meteo: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        current: data.current,
        hourly: data.hourly,
      };
    } catch (error) {
      console.error("Erro ao buscar dados climáticos:", error);
      throw new Error("Não foi possível integrar com o serviço de clima.");
    }
  }
}

export default new OpenMeteoService();
