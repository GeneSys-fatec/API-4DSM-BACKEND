import { AppDataSource } from "../data-source.js";
import { AlertLogEntity } from "../entities/alertLogEntity.js";
import { MeasurementEntity } from "../entities/measurementEntity.js";
import { ParameterEntity } from "../entities/parameterEntity.js";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";

export interface CreateAlertInput {
    parameterId: number;
    measuredValue: number;
    occurredAt: string;
    description: string;
}

export interface UpdateAlertInput {
    parameterId?: number;
    measuredValue?: number;
    occurredAt?: string;
    description?: string;
    status?: "active" | "resolved";
}

export interface EvaluateMeasurementInput {
    parameterId: number;
    measuredValue: number;
    occurredAt: string;
}

export class AlertService {
    private readonly alertRepository = AppDataSource.getRepository(AlertLogEntity);
    private readonly measurementRepository = AppDataSource.getRepository(MeasurementEntity);
    private readonly parameterRepository = AppDataSource.getRepository(ParameterEntity);
    private readonly parameterLimitsRepository = AppDataSource.getRepository(parameterLimitsEntity);
    private readonly parameterTypeRepository = AppDataSource.getRepository(parameterTypeEntity);

    private buildAutomaticMessage(
        parameterType: parameterTypeEntity | null,
        isBelowMin: boolean,
        measuredValue: number,
        limitValue: number,
    ): { title: string; description: string } {
        const key = (parameterType?.json_key ?? "").toLowerCase();
        const name = (parameterType?.name ?? "Parâmetro").toLowerCase();
        const unit = parameterType?.unit ?? "";

        const hasToken = (...tokens: string[]) =>
            tokens.some((token) => key.includes(token) || name.includes(token));

        const directionText = isBelowMin ? "abaixo" : "acima";
        const metricContext = `Valor medido: ${measuredValue}${unit ? ` ${unit}` : ""}. Limite: ${limitValue}${unit ? ` ${unit}` : ""}.`;

        if (hasToken("temp", "temperature", "temperatura")) {
            return {
                title: "Alerta de Temperatura",
                description: isBelowMin
                    ? `Atenção! Temperatura muito baixa. ${metricContext}`
                    : `Cuidado! Temperatura muito alta. ${metricContext}`,
            };
        }

        if (hasToken("precip", "rain", "chuva")) {
            return {
                title: "Alerta de Chuva",
                description: isBelowMin
                    ? `Nível de chuva abaixo do esperado. ${metricContext}`
                    : `Atenção! Chuvas fortes na sua região. ${metricContext}`,
            };
        }

        if (hasToken("wind", "vento", "gust")) {
            return {
                title: "Alerta de Vento",
                description: isBelowMin
                    ? `Velocidade do vento abaixo do limite mínimo configurado. ${metricContext}`
                    : `Atenção! Ventos fortes na sua região. ${metricContext}`,
            };
        }

        if (hasToken("humidity", "umidade")) {
            return {
                title: "Alerta de Umidade",
                description: isBelowMin
                    ? `Atenção! Umidade muito baixa. ${metricContext}`
                    : `Atenção! Umidade muito alta. ${metricContext}`,
            };
        }

        return {
            title: "Alerta Automático",
            description: `${parameterType?.name ?? "Parâmetro"} está ${directionText} do limite configurado. ${metricContext}`,
        };
    }

    private toDate(value: string): Date {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            throw new Error("Invalid occurredAt");
        }

        return parsed;
    }

    private async findParameterById(parameterId: number): Promise<ParameterEntity> {
        const parameter = await this.parameterRepository.findOneBy({ id: parameterId });
        if (!parameter) {
            throw new Error("Parameter not found");
        }

        return parameter;
    }

    async listAlerts(): Promise<AlertLogEntity[]> {
        return this.alertRepository.find({
            relations: {
                idParameter: true,
                idMeasurement: true,
            },
            order: {
                triggeredAt: "DESC",
            },
        });
    }

    async findAlertById(id: number): Promise<AlertLogEntity | null> {
        return this.alertRepository.findOne({
            where: { id },
            relations: {
                idParameter: true,
                idMeasurement: true,
            },
        });
    }

    async createAlert(data: CreateAlertInput): Promise<AlertLogEntity> {
        const parameter = await this.findParameterById(data.parameterId);
        const occurredAt = this.toDate(data.occurredAt);

        const measurement = this.measurementRepository.create({
            idParameter: parameter,
            rawValue: data.measuredValue,
            value: data.measuredValue,
            collectedAt: occurredAt,
        });

        const savedMeasurement = await this.measurementRepository.save(measurement);

        const alert = this.alertRepository.create({
            idParameter: parameter,
            idMeasurement: savedMeasurement,
            triggeredValue: data.measuredValue,
            triggeredAt: occurredAt,
            titulo: "Alerta manual",
            texto: data.description,
            status: "active",
            resolvedAt: null,
        });

        return this.alertRepository.save(alert);
    }

    async updateAlert(id: number, data: UpdateAlertInput): Promise<AlertLogEntity | null> {
        const alert = await this.findAlertById(id);
        if (!alert) {
            return null;
        }

        if (data.parameterId !== undefined) {
            const parameter = await this.findParameterById(data.parameterId);
            alert.idParameter = parameter;
            alert.idMeasurement.idParameter = parameter;
        }

        if (data.occurredAt !== undefined) {
            const occurredAt = this.toDate(data.occurredAt);
            alert.triggeredAt = occurredAt;
            alert.idMeasurement.collectedAt = occurredAt;
        }

        if (data.measuredValue !== undefined) {
            alert.triggeredValue = data.measuredValue;
            alert.idMeasurement.rawValue = data.measuredValue;
            alert.idMeasurement.value = data.measuredValue;
        }

        if (data.description !== undefined) {
            alert.texto = data.description;
        }

        if (data.status !== undefined) {
            alert.status = data.status;
            alert.resolvedAt = data.status === "resolved" ? new Date() : null;
        }

        await this.measurementRepository.save(alert.idMeasurement);
        return this.alertRepository.save(alert);
    }

    async deleteAlert(id: number): Promise<boolean> {
        const alert = await this.findAlertById(id);
        if (!alert) {
            return false;
        }

        await this.alertRepository.remove(alert);
        return true;
    }

    async evaluateMeasurement(data: EvaluateMeasurementInput): Promise<AlertLogEntity[]> {
        const parameter = await this.findParameterById(data.parameterId);
        const occurredAt = this.toDate(data.occurredAt);

        const measurement = this.measurementRepository.create({
            idParameter: parameter,
            rawValue: data.measuredValue,
            value: data.measuredValue,
            collectedAt: occurredAt,
        });

        const savedMeasurement = await this.measurementRepository.save(measurement);

        const limits = await this.parameterLimitsRepository.findOneBy({
            idTypeParam: { id: parameter.idTypeParam } as parameterTypeEntity,
        });

        if (!limits) {
            return [];
        }

        const isBelowMin = data.measuredValue < Number(limits.minExpected);
        const isAboveMax = data.measuredValue > Number(limits.maxExpected);

        if (!isBelowMin && !isAboveMax) {
            return [];
        }

        const parameterType = await this.parameterTypeRepository.findOneBy({ id: parameter.idTypeParam });
        const appliedLimit = isBelowMin ? Number(limits.minExpected) : Number(limits.maxExpected);
        const message = this.buildAutomaticMessage(
            parameterType,
            isBelowMin,
            data.measuredValue,
            appliedLimit,
        );

        const alert = this.alertRepository.create({
            idParameter: parameter,
            idMeasurement: savedMeasurement,
            triggeredValue: data.measuredValue,
            triggeredAt: occurredAt,
            titulo: message.title,
            texto: message.description,
            status: "active",
            resolvedAt: null,
        });

        const createdAlert = await this.alertRepository.save(alert);
        return [createdAlert];
    }
}

export const alertService = new AlertService();
