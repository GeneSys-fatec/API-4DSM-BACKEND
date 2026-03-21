import type { FastifyRequest, FastifyReply } from "fastify";
import openMeteoService from "../services/openMeteoService.js";
import { StationEntity } from "../entities/stationEntity.js";
import { AppDataSource } from "../data-source.js";

export class WeatherController {
  async getCurrentWeather(
    req: FastifyRequest<{ Params: { stationId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { stationId } = req.params;

      const stationRepository = AppDataSource.getRepository(StationEntity);
      const station = await stationRepository.findOneBy({
        id: Number(stationId),
      });

      if (!station || !station.latitude || !station.longitude) {
        return reply
          .status(404)
          .send({ message: "Estação não encontrada ou sem coordenadas." });
      }

      const weatherData = await openMeteoService.fetchCurrentWeather(
        station.latitude.toString(),
        station.longitude.toString(),
      );

      return reply.status(200).send(weatherData);
    } catch (error) {
      console.error("Erro no WeatherController:", error);
      return reply
        .status(500)
        .send({ message: "Erro interno ao buscar dados climáticos." });
    }
  }
}

export default new WeatherController();
