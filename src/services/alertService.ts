import { AppDataSource } from "../data-source.js";
import { AlertLogEntity, type AlertStatus } from "../entities/alertLogEntity.js";
import { MeasurementEntity } from "../entities/measurementEntity.js";
import { ParameterEntity } from "../entities/parameterEntity.js";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
import { StationEntity } from "../entities/stationEntity.js";
import { Brackets } from "typeorm";

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

export interface AlertListFilters {
    stationId?: number;
    parameterId?: number;
    idTypeParam?: number;
    status?: AlertStatus;
    user?: string;
    q?: string;
    from?: Date;
    to?: Date;
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

    async listAlerts(filters: AlertListFilters = {}): Promise<AlertLogEntity[]> {
        const hasFilters = Boolean(
            filters.stationId ||
            filters.parameterId ||
            filters.idTypeParam ||
            filters.status ||
            filters.user ||
            filters.q ||
            filters.from ||
            filters.to,
        );

        if (!hasFilters) {
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

        const queryBuilder = this.alertRepository
            .createQueryBuilder("alert")
            .leftJoinAndSelect("alert.idParameter", "parameter")
            .leftJoinAndSelect("alert.idMeasurement", "measurement")
            .leftJoin(StationEntity, "station", "station.id = parameter.idStation")
            .leftJoin(parameterTypeEntity, "parameterType", "parameterType.id = parameter.idTypeParam")
            .orderBy("alert.triggeredAt", "DESC");

        if (filters.stationId) {
            queryBuilder.andWhere("parameter.idStation = :stationId", {
                stationId: filters.stationId,
            });
        }

        if (filters.parameterId) {
            queryBuilder.andWhere("parameter.id = :parameterId", {
                parameterId: filters.parameterId,
            });
        }

        if (filters.idTypeParam) {
            queryBuilder.andWhere("parameter.idTypeParam = :idTypeParam", {
                idTypeParam: filters.idTypeParam,
            });
        }

        if (filters.status) {
            queryBuilder.andWhere("alert.status = :status", {
                status: filters.status,
            });
        }

        if (filters.user) {
            const userTerm = `%${filters.user.trim().toLowerCase()}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where("LOWER(station.createdBy) LIKE :userTerm", { userTerm }).orWhere(
                        "LOWER(station.updatedBy) LIKE :userTerm",
                        { userTerm },
                    );
                }),
            );
        }

        if (filters.q) {
            const term = `%${filters.q.trim().toLowerCase()}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where("LOWER(alert.titulo) LIKE :term", { term })
                        .orWhere("LOWER(alert.texto) LIKE :term", { term })
                        .orWhere("CAST(alert.id AS TEXT) LIKE :term", { term })
                        .orWhere("CAST(parameter.id AS TEXT) LIKE :term", { term })
                        .orWhere("LOWER(parameterType.name) LIKE :term", { term })
                        .orWhere("LOWER(parameterType.json_key) LIKE :term", { term })
                        .orWhere("LOWER(station.name) LIKE :term", { term });
                }),
            );
        }

        if (filters.from) {
            queryBuilder.andWhere("alert.triggeredAt >= :from", {
                from: filters.from,
            });
        }

        if (filters.to) {
            queryBuilder.andWhere("alert.triggeredAt <= :to", {
                to: filters.to,
            });
        }

        return queryBuilder.getMany();
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
