import { describe, it, expect, vi, beforeEach } from "vitest";
import openMeteoService from "../../src/services/openMeteoService";

global.fetch = vi.fn();

describe("OpenMeteoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve buscar dados na API com a URL correta (past_days=30)", async () => {
    const mockResponse = {
      current: { temperature_2m: 25 },
      hourly: {},
      current_units: {},
    };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const lat = "-23.17";
    const lon = "-45.88";
    const keys = ["temperature_2m", "relative_humidity_2m"];

    const result = await openMeteoService.fetchCurrentWeather(lat, lon, keys);

    const expectedUrl = `https://api.open-meteo.com/v1/forecast?latitude=-23.17&longitude=-45.88&current=temperature_2m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m&past_days=30`;

    expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
    expect(result.current.temperature_2m).toBe(25);
  });

  it('deve usar o fallback "temperature_2m" se nenhuma chave for enviada', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ current: {}, hourly: {} }),
    });

    await openMeteoService.fetchCurrentWeather("0", "0", []);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("current=temperature_2m"),
    );
  });

  it("deve normalizar chave custom de temperatura para temperatura_2m", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ current: {}, hourly: {} }),
    });

    await openMeteoService.fetchCurrentWeather("1", "1", ["temp_e2e_custom"]);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("current=temperature_2m"),
    );
  });

  it("deve ignorar chaves inválidas e manter as válidas", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ current: {}, hourly: {} }),
    });

    await openMeteoService.fetchCurrentWeather("0", "0", ["invalida_total", "wind_speed_10m"]);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("current=wind_speed_10m"),
    );
  });

  it("deve utilizar o cache na segunda chamada e não acionar o fetch novamente", async () => {
    const mockResponse = {
      current: { test: 123 },
      hourly: {},
      current_units: {},
    };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await openMeteoService.fetchCurrentWeather("10", "20", ["wind_speed_10m"]);

    const resultFromCache = await openMeteoService.fetchCurrentWeather(
      "10",
      "20",
      ["wind_speed_10m"],
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(resultFromCache.current.test).toBe(123);
  });
});
