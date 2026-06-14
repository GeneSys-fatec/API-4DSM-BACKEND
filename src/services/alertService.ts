import { AppDataSource } from "../data-source.js";
import { AlertLogEntity, type AlertStatus } from "../entities/alertLogEntity.js";
import { MeasurementEntity } from "../entities/measurementEntity.js";
import { ParameterEntity } from "../entities/parameterEntity.js";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
import { StationEntity } from "../entities/stationEntity.js";
import { Brackets } from "typeorm";
import { normalizeSearchTerm, unaccentedSql } from "../utils/textSearch.js";
import { EventEmitter } from "events";

export const alertNotificationEmitter = new EventEmitter();

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
    isRead?: boolean;
    page?: number;
    limit?: number;
}

export interface PaginatedAlertResponse {
    data: AlertLogEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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

    async listAlerts(filters: AlertListFilters = {}): Promise<PaginatedAlertResponse> {
        const searchTerm = normalizeSearchTerm(filters.q ?? "");
        const userSearchTerm = normalizeSearchTerm(filters.user ?? "");

        const page = filters.page || 1;
        const limit = filters.limit || 1000;
        const skip = (page - 1) * limit;

        const hasFilters = Boolean(
            filters.stationId ||
            filters.parameterId ||
            filters.idTypeParam ||
            filters.status ||
            userSearchTerm ||
            searchTerm ||
            filters.from ||
            filters.to ||
            filters.isRead !== undefined
        );

        if (!hasFilters) {
            const [data, total] = await this.alertRepository.findAndCount({
                relations: {
                    idParameter: true,
                    idMeasurement: true,
                },
                order: {
                    triggeredAt: "DESC",
                },
                skip,
                take: limit
            });
            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }

        const queryBuilder = this.alertRepository
            .createQueryBuilder("alert")
            .leftJoinAndSelect("alert.idParameter", "parameter")
            .leftJoinAndSelect("alert.idMeasurement", "measurement")
            .leftJoin(StationEntity, "station", "station.id = parameter.idStation")
            .leftJoin(parameterTypeEntity, "parameterType", "parameterType.id = parameter.idTypeParam")
            .orderBy("alert.triggeredAt", "DESC")
            .skip(skip)
            .take(limit);

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

        if (userSearchTerm) {
            const userTerm = `%${userSearchTerm}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where(`${unaccentedSql("station.createdBy")} LIKE :userTerm`, { userTerm }).orWhere(
                        `${unaccentedSql("station.updatedBy")} LIKE :userTerm`,
                        { userTerm },
                    );
                }),
            );
        }

        if (searchTerm) {
            const term = `%${searchTerm}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where(`${unaccentedSql("alert.titulo")} LIKE :term`, { term })
                        .orWhere(`${unaccentedSql("alert.texto")} LIKE :term`, { term })
                        .orWhere("CAST(alert.id AS TEXT) LIKE :term", { term })
                        .orWhere("CAST(parameter.id AS TEXT) LIKE :term", { term })
                        .orWhere(`${unaccentedSql("parameterType.name")} LIKE :term`, { term })
                        .orWhere(`${unaccentedSql("parameterType.json_key")} LIKE :term`, { term })
                        .orWhere(`${unaccentedSql("station.name")} LIKE :term`, { term });
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

        if (filters.isRead !== undefined) {
            queryBuilder.andWhere("alert.isRead = :isRead", {
                isRead: filters.isRead,
            });
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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

    async markAsRead(id: number): Promise<boolean> {
        const alert = await this.findAlertById(id);
        if (!alert) {
            return false;
        }
        alert.isRead = true;
        alert.readAt = new Date();
        await this.alertRepository.save(alert);
        return true;
    }

    async markAllAsRead(): Promise<number> {
        const result = await this.alertRepository.update(
            { isRead: false },
            { isRead: true, readAt: new Date() }
        );
        return result.affected ?? 0;
    }

    async clearReadAlerts(): Promise<number> {
        const result = await this.alertRepository.delete({ isRead: true });
        return result.affected ?? 0;
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

        const typeParamId = typeof parameter.idTypeParam === "number" ? parameter.idTypeParam : (parameter.idTypeParam as unknown as { id: number })?.id;
        const stationId = typeof parameter.idStation === "number" ? parameter.idStation : (parameter.idStation as unknown as { id: number })?.id;

        const measurement = this.measurementRepository.create({
            idParameter: { id: parameter.id } as ParameterEntity,
            rawValue: data.measuredValue,
            value: data.measuredValue,
            collectedAt: occurredAt,
        });

        const savedMeasurement = await this.measurementRepository.save(measurement);

        let limits = await this.parameterLimitsRepository.findOne({
            where: { idTypeParam: { id: typeParamId } as parameterTypeEntity },
            order: { id: "DESC" }
        });

        if (!limits) {
            const allLimits = await this.parameterLimitsRepository.find({
                where: { idTypeParam: { id: typeParamId } as parameterTypeEntity }
            });
            if (allLimits.length > 0) limits = allLimits[allLimits.length - 1] ?? null;
        }

        if (!limits) {
            return [];
        }

        const measuredValueNum = Number(data.measuredValue);
        const minExpected = Number(limits.minExpected);
        const maxExpected = Number(limits.maxExpected);

        const isBelowMin = measuredValueNum < minExpected;
        const isAboveMax = measuredValueNum > maxExpected;

        if (!isBelowMin && !isAboveMax) {
            return [];
        }

        const parameterType = await this.parameterTypeRepository.findOneBy({ id: typeParamId });
        const appliedLimit = isBelowMin ? minExpected : maxExpected;
        const message = this.buildAutomaticMessage(
            parameterType,
            isBelowMin,
            data.measuredValue,
            appliedLimit,
        );

        const existingAlert = await this.alertRepository.findOne({
            where: {
                idParameter: { id: parameter.id },
                status: "active",
            },
            relations: ["idParameter", "idMeasurement"]
        });

        if (existingAlert) {
            existingAlert.idMeasurement = { id: savedMeasurement.id } as MeasurementEntity;
            existingAlert.triggeredValue = measuredValueNum;
            existingAlert.violatedLimit = appliedLimit;
            existingAlert.triggeredAt = occurredAt;
            existingAlert.titulo = message.title;
            existingAlert.texto = message.description;
            existingAlert.isRead = false;

            const updatedAlert = await this.alertRepository.save(existingAlert);
            
            if (!updatedAlert.isRead) {
                alertNotificationEmitter.emit("alertTriggered", updatedAlert);
            }
            
            return [updatedAlert];
        }

        const alert = this.alertRepository.create({
            idParameter: { id: parameter.id } as ParameterEntity,
            idMeasurement: { id: savedMeasurement.id } as MeasurementEntity,
            idStation: { id: stationId } as StationEntity,
            triggeredValue: measuredValueNum,
            violatedLimit: appliedLimit,
            triggeredAt: occurredAt,
            titulo: message.title,
            texto: message.description,
            status: "active",
            isRead: false,
            resolvedAt: null,
        });

        const createdAlert = await this.alertRepository.save(alert);
        alertNotificationEmitter.emit("alertTriggered", createdAlert);
        return [createdAlert];
    }
}

export const alertService = new AlertService();
