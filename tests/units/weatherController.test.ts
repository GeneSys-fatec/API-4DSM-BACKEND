import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import request from "supertest";
import openMeteoService from "../../src/services/openMeteoService.js";
import { AppDataSource } from "../../src/data-source.js";
import { app } from "../../src/server.js";

// 1. Agora os caminhos do mock estão IDÊNTICOS aos do import lá em cima!
vi.mock("../../src/services/openMeteoService.js");
vi.mock("../../src/data-source.js", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

describe("GET /stations/:stationId/weather", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 404 se a estação não for encontrada no banco", async () => {
    const mockRepo = { findOneBy: vi.fn().mockResolvedValue(null) };
    (AppDataSource.getRepository as any).mockReturnValue(mockRepo);

    const response = await request(app.server).get("/weather/1");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "Estação não encontrada ou sem coordenadas.",
    );
  });

  it("deve retornar 404 se a estação existir, mas não tiver coordenadas", async () => {
    const mockRepo = {
      findOneBy: vi.fn().mockResolvedValue({ id: 1, name: "Estação Quebrada" }),
    };
    (AppDataSource.getRepository as any).mockReturnValue(mockRepo);

    const response = await request(app.server).get("/weather/1");

    expect(response.status).toBe(404);
  });

  it("deve retornar 200 e os dados climáticos com sucesso", async () => {
    const mockStation = { id: 1, latitude: -23.1791, longitude: -45.8872 };
    const mockRepo = { findOneBy: vi.fn().mockResolvedValue(mockStation) };
    (AppDataSource.getRepository as any).mockReturnValue(mockRepo);

    const mockWeatherData = { current: { temperature_2m: 25.5 } };
    (openMeteoService.fetchCurrentWeather as any).mockResolvedValue(
      mockWeatherData,
    );

    const response = await request(app.server).get("/weather/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockWeatherData);

    expect(openMeteoService.fetchCurrentWeather).toHaveBeenCalledWith(
      "-23.1791",
      "-45.8872",
    );
  });

  it("deve retornar 500 se a API externa do Open-Meteo falhar", async () => {
    const mockStation = { id: 1, latitude: -23.1791, longitude: -45.8872 };
    const mockRepo = { findOneBy: vi.fn().mockResolvedValue(mockStation) };
    (AppDataSource.getRepository as any).mockReturnValue(mockRepo);

    (openMeteoService.fetchCurrentWeather as any).mockRejectedValue(
      new Error("Timeout na API"),
    );

    const response = await request(app.server).get("/weather/1");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      "Erro interno ao buscar dados climáticos.",
    );
  });
});
