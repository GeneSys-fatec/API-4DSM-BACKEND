import { describe, it, expect, vi, beforeEach } from "vitest";
import weatherController from "../../src/controllers/weatherController";
import { AppDataSource } from "../../src/data-source";
import { parameterService } from "../../src/services/parameterService";
import openMeteoService from "../../src/services/openMeteoService";
import type { FastifyRequest, FastifyReply } from "fastify";

vi.mock("../../src/data-source", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));
vi.mock("../../src/services/parameterService");
vi.mock("../../src/services/parameterTypeService");
vi.mock("../../src/services/openMeteoService");

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
});
