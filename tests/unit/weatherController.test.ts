import { describe, it, expect, vi, beforeEach } from "vitest";
import weatherController from "../../src/controllers/weatherController";
import { AppDataSource } from "../../src/data-source";
import { parameterService } from "../../src/services/parameterService";
import { parameterTypeService } from "../../src/services/parameterTypeService";
import openMeteoService from "../../src/services/openMeteoService";
import { alertService } from "../../src/services/alertService";
import type { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../src/data-source", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));
vi.mock("../../src/services/parameterService");
vi.mock("../../src/services/parameterTypeService");
vi.mock("../../src/services/openMeteoService");
vi.mock("../../src/services/alertService");

describe("WeatherController", () => {
  let req: Partial<FastifyRequest<{ Params: { stationId: string } }>>;
  let reply: Partial<FastifyReply>;

  beforeEach(() => {
    req = { params: { stationId: "1" } };
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it("deve retornar 404 se a estação não for encontrada no banco", async () => {
    const mockRepo = { findOneBy: vi.fn().mockResolvedValue(null) };
    (AppDataSource.getRepository as any).mockReturnValue(mockRepo);

    await weatherController.getCurrentWeather(req as any, reply as any);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Estação não encontrada ou sem coordenadas.",
    });
  });

  it("deve retornar 200 com objeto vazio se a estação existir mas não tiver sensores vinculados", async () => {
    const mockStation = { id: 1, latitude: "-23", longitude: "-45" };
    const mockRepo = { findOneBy: vi.fn().mockResolvedValue(mockStation) };
    (AppDataSource.getRepository as any).mockReturnValue(mockRepo);

    (parameterService.findByStation as any).mockResolvedValue([]);

    await weatherController.getCurrentWeather(req as any, reply as any);

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ current: {}, hourly: {} });

    expect(openMeteoService.fetchCurrentWeather).not.toHaveBeenCalled();
  });

  it("deve avaliar limites automaticamente e retornar alertas gerados junto dos dados climáticos", async () => {
    const mockStation = { id: 1, latitude: "-23", longitude: "-45" };
    const mockRepo = { findOneBy: vi.fn().mockResolvedValue(mockStation) };
    (AppDataSource.getRepository as any).mockReturnValue(mockRepo);

    (parameterService.findByStation as any).mockResolvedValue([{ id: 10, idTypeParam: 1 }]);
    (parameterTypeService.findById as any).mockResolvedValue({
      id: 1,
      json_key: "temperature_2m",
      name: "Temperatura",
      unit: "°C",
    });

    (openMeteoService.fetchCurrentWeather as any).mockResolvedValue({
      current: {
        time: "2026-03-31T12:00:00.000Z",
        temperature_2m: 40,
      },
      hourly: {},
      units: { temperature_2m: "°C" },
    });

    (alertService.evaluateMeasurement as any).mockResolvedValue([
      {
        id: 3,
        idParameter: { id: 10 },
        idMeasurement: { id: 15 },
        triggeredValue: 40,
        triggeredAt: new Date("2026-03-31T12:00:00.000Z"),
        texto: "Cuidado! Temperatura muito alta.",
        status: "active",
      },
    ]);

    await weatherController.getCurrentWeather(req as any, reply as any);

    expect(alertService.evaluateMeasurement).toHaveBeenCalledWith({
      parameterId: 10,
      measuredValue: 40,
      occurredAt: "2026-03-31T12:00:00.000Z",
    });

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        generatedCount: 1,
        generatedAlerts: [
          expect.objectContaining({
            parameterId: 10,
            measuredValue: 40,
            description: "Cuidado! Temperatura muito alta.",
            status: "active",
          }),
        ],
      }),
    );
  });
});
