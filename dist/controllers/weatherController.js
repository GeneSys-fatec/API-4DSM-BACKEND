import openMeteoService from "../services/openMeteoService.js";
import { StationEntity } from "../entities/stationEntity.js";
import { AppDataSource } from "../data-source.js";
import { parameterService } from "../services/parameterService.js";
import { parameterTypeService } from "../services/parameterTypeService.js";
import { alertService } from "../services/alertService.js";
function mapAlertResponse(alert) {
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
    async getCurrentWeather(req, reply) {
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
            const stationParameterDetails = [];
            for (const param of stationParameters) {
                const type = await parameterTypeService.findById(param.idTypeParam);
                if (type && type.json_key) {
                    stationParameterDetails.push({
                        parameterId: param.id,
                        jsonKey: type.json_key,
                    });
                }
            }
            if (stationParameterDetails.length === 0) {
                return reply.status(200).send({ current: {}, hourly: {} });
            }
            const jsonKeys = [...new Set(stationParameterDetails.map((item) => item.jsonKey))];
            const weatherData = await openMeteoService.fetchCurrentWeather(station.latitude.toString(), station.longitude.toString(), jsonKeys);
            const occurredAt = typeof weatherData?.current?.time === "string"
                ? weatherData.current.time
                : new Date().toISOString();
            const generatedAlerts = [];
            for (const parameter of stationParameterDetails) {
                const measured = Number(weatherData?.current?.[parameter.jsonKey]);
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
                generatedAlerts: generatedAlerts.map(mapAlertResponse),
                generatedCount: generatedAlerts.length,
            });
        }
        catch (error) {
            console.error("Erro no WeatherController:", error);
            return reply.status(500).send({ message: "Erro interno ao buscar dados climáticos." });
        }
    }
}
export default new WeatherController();
//# sourceMappingURL=weatherController.js.map