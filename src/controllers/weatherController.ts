import type { FastifyRequest, FastifyReply } from "fastify";
import openMeteoService from "../services/openMeteoService.js";
import { resolveOpenMeteoKey } from "../services/openMeteoService.js";
import { StationEntity } from "../entities/stationEntity.js";
import { AppDataSource } from "../data-source.js";
import { parameterService } from "../services/parameterService.js";
import { parameterTypeService } from "../services/parameterTypeService.js";
import type { AlertLogEntity } from "../entities/alertLogEntity.js";
import { alertService } from "../services/alertService.js";

function mapAlertResponse(alert: AlertLogEntity) {
  return {
    id: alert.id,
    parameterId: alert.idParameter.id,
    measurementId: alert.idMeasurement.id,
    measuredValue: Number(alert.triggeredValue),
    occurredAt: alert.triggeredAt,
    description: alert.texto ?? alert.titulo ?? "",
    status: alert.status,
  };
}

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
        return reply.status(404).send({ message: "Estação não encontrada ou sem coordenadas." });
      }

      const stationParameters = await parameterService.findByStation(Number(stationId));

      if (stationParameters.length === 0) {
        return reply.status(200).send({ current: {}, hourly: {} });
      }

      const stationParameterDetails: Array<{
        parameterId: number;
        jsonKey: string;
        resolvedJsonKey: string;
      }> = [];

      for (const param of stationParameters) {
          const type = await parameterTypeService.findById(param.idTypeParam);
          if (type && type.json_key) {
              const resolvedJsonKey = resolveOpenMeteoKey(type.json_key);
              if (!resolvedJsonKey) {
                continue;
              }

              stationParameterDetails.push({
                parameterId: param.id,
                jsonKey: type.json_key,
                resolvedJsonKey,
              });
          }
      }

      if (stationParameterDetails.length === 0) {
        return reply.status(200).send({ current: {}, hourly: {} });
      }

      const jsonKeys = [...new Set(stationParameterDetails.map((item) => item.resolvedJsonKey))];

      const weatherData = await openMeteoService.fetchCurrentWeather(
        station.latitude.toString(),
        station.longitude.toString(),
        jsonKeys
      );

      const currentData = { ...(weatherData.current ?? {}) } as Record<string, unknown>;
      const hourlyData = { ...(weatherData.hourly ?? {}) } as Record<string, unknown>;
      const unitsData = { ...(weatherData.units ?? {}) } as Record<string, unknown>;

      for (const parameter of stationParameterDetails) {
        if (parameter.jsonKey === parameter.resolvedJsonKey) {
          continue;
        }

        if (currentData[parameter.jsonKey] === undefined && currentData[parameter.resolvedJsonKey] !== undefined) {
          currentData[parameter.jsonKey] = currentData[parameter.resolvedJsonKey];
        }

        if (hourlyData[parameter.jsonKey] === undefined && hourlyData[parameter.resolvedJsonKey] !== undefined) {
          hourlyData[parameter.jsonKey] = hourlyData[parameter.resolvedJsonKey];
        }

        if (unitsData[parameter.jsonKey] === undefined && unitsData[parameter.resolvedJsonKey] !== undefined) {
          unitsData[parameter.jsonKey] = unitsData[parameter.resolvedJsonKey];
        }
      }

      const occurredAt = typeof currentData.time === "string"
        ? currentData.time
        : new Date().toISOString();

      const generatedAlerts: AlertLogEntity[] = [];
      for (const parameter of stationParameterDetails) {
        const measured = Number(currentData[parameter.jsonKey] ?? currentData[parameter.resolvedJsonKey]);
        if (Number.isNaN(measured)) {
          continue;
        }

        const alerts = await alertService.evaluateMeasurement({
          parameterId: parameter.parameterId,
          measuredValue: measured,
          occurredAt,
        });

        generatedAlerts.push(...alerts);
      }

      return reply.status(200).send({
        ...weatherData,
        current: currentData,
        hourly: hourlyData,
        units: unitsData,
        generatedAlerts: generatedAlerts.map(mapAlertResponse),
        generatedCount: generatedAlerts.length,
      });
    } catch (error) {
      console.error("Erro no WeatherController:", error);
      return reply.status(500).send({ message: "Erro interno ao buscar dados climáticos." });
    }
  }
}

export default new WeatherController();