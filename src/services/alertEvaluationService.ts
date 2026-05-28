import { AppDataSource } from "../data-source.js";
import { AlertLogEntity } from "../entities/alertLogEntity.js";
import { MeasurementEntity } from "../entities/measurementEntity.js";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";
import { ParameterEntity } from "../entities/parameterEntity.js";
import { StationEntity } from "../entities/stationEntity.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
import { alertNotificationEmitter } from "./alertService.js";

export class AlertEvaluationService {
    private readonly alertRepository = AppDataSource.getRepository(AlertLogEntity);
    private readonly limitsRepository = AppDataSource.getRepository(parameterLimitsEntity);
    private readonly parameterRepository = AppDataSource.getRepository(ParameterEntity);
    private readonly stationRepository = AppDataSource.getRepository(StationEntity);
    private readonly paramTypeRepository = AppDataSource.getRepository(parameterTypeEntity);

    async evaluate(measurement: MeasurementEntity): Promise<void> {
        try {

            const parameterId = typeof measurement.idParameter === "number" 
                ? measurement.idParameter 
                : measurement.idParameter?.id;
                
            if (!parameterId) return;

            const parameter = await this.parameterRepository.findOneBy({ id: parameterId });
            if (!parameter) {
                return;
            }

            const typeParamId = typeof parameter.idTypeParam === 'number' ? parameter.idTypeParam : (parameter.idTypeParam as unknown as { id: number })?.id;

            const limit = await this.limitsRepository.findOne({
                where: { idTypeParam: { id: typeParamId } as unknown as parameterTypeEntity },
                order: { id: "DESC" }
            });

            if (!limit) {
                return;
            }

            const value = Number(measurement.value);
            const min = Number(limit.minExpected);
            const max = Number(limit.maxExpected);

            let violatedLimit: number | null = null;
            let description = "";

            if (value < min) {
                violatedLimit = min;
                description = `Queda detectada: Valor (${value}) está abaixo do mínimo exigido (${min}).`;
            } else if (value > max) {
                violatedLimit = max;
                description = `Pico detectado: Valor (${value}) excedeu o máximo exigido (${max}).`;
            }

            if (violatedLimit !== null) {
                const stationId = typeof parameter.idStation === 'number' ? parameter.idStation : (parameter.idStation as unknown as { id: number })?.id;
                
                const station = await this.stationRepository.findOneBy({ id: stationId });
                const paramType = await this.paramTypeRepository.findOneBy({ id: typeParamId });
                
                const newAlert = this.alertRepository.create({
                    idParameter: { id: parameter.id } as ParameterEntity,
                    idMeasurement: { id: measurement.id } as MeasurementEntity,
                    idStation: { id: stationId } as StationEntity,
                    triggeredValue: value,
                    violatedLimit: violatedLimit,
                    titulo: "Alerta Climático Automático",
                    texto: description,
                    status: "active",
                    isRead: false,
                    triggeredAt: measurement.collectedAt || new Date()
                });

                const savedAlert = await this.alertRepository.save(newAlert);
                
                const ssePayload = {
                    id: savedAlert.id,
                    stationName: station?.name || "Estação Desconhecida",
                    parameterName: paramType?.name || "Parâmetro Desconhecido",
                    measuredValue: value,
                    configuredLimit: violatedLimit,
                    timestamp: savedAlert.triggeredAt,
                    titulo: newAlert.titulo,
                    description: description,
                    isRead: false
                };

                alertNotificationEmitter.emit("alertTriggered", ssePayload);
            }

        } catch (_error) {
        }
    }
}

export const alertEvaluationService = new AlertEvaluationService();