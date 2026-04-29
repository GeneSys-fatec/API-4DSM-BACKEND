import { AppDataSource } from "../data-source.js";
import { MeasurementEntity } from "../entities/measurementEntity.js";
import { StationEntity } from "../entities/stationEntity.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";

export interface DashboardQueryDTO {
    stationId?: number;
    parameterId?: number;
    startDate?: string;
    endDate?: string;
    period?: "24h" | "7d" | "30d";
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AggregationResponse {
    parameterId: number;
    parameterName: string;
    unit: string;
    avgValue: number;
    maxValue: number;
    minValue: number;
    count: number;
}

export class DashboardService {
    private readonly measurementRepository = AppDataSource.getRepository(MeasurementEntity);

    private applyFilters(qb: any, filters: DashboardQueryDTO) {
        if (filters.parameterId) {
            qb.andWhere("parameter.id = :parameterId", { parameterId: filters.parameterId });
        }

        if (filters.stationId) {
            qb.andWhere("station.id = :stationId", { stationId: filters.stationId });
        }

        let start = filters.startDate ? new Date(filters.startDate) : null;
        let end = filters.endDate ? new Date(filters.endDate) : new Date();

        if (filters.period) {
            start = new Date();
            if (filters.period === "24h") start.setHours(start.getHours() - 24);
            if (filters.period === "7d") start.setDate(start.getDate() - 7);
            if (filters.period === "30d") start.setDate(start.getDate() - 30);
        }

        if (start) {
            qb.andWhere("measurement.collectedAt >= :start", { start });
        }
        if (end) {
            qb.andWhere("measurement.collectedAt <= :end", { end });
        }
    }

    async getMeasurements(filters: DashboardQueryDTO): Promise<PaginatedResponse<MeasurementEntity>> {
        const page = filters.page || 1;
        const limit = filters.limit || 1000; // Aumentado limite padrão para os gráficos
        const skip = (page - 1) * limit;

        const qb = this.measurementRepository.createQueryBuilder("measurement")
            .leftJoinAndSelect("measurement.idParameter", "parameter")
            // Joins manuais baseados nas colunas de inteiros para evitar falha do TypeORM
            .leftJoinAndMapOne("parameter.idStation", StationEntity, "station", "station.id = parameter.idStation")
            .leftJoinAndMapOne("parameter.idTypeParam", parameterTypeEntity, "typeParam", "typeParam.id = parameter.idTypeParam");

        this.applyFilters(qb, filters);

        qb.orderBy("measurement.collectedAt", "DESC")
          .skip(skip)
          .take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getAggregations(filters: DashboardQueryDTO): Promise<AggregationResponse[]> {
        const qb = this.measurementRepository.createQueryBuilder("measurement")
            .leftJoin("measurement.idParameter", "parameter")
            .leftJoin(StationEntity, "station", "station.id = parameter.idStation")
            .leftJoin(parameterTypeEntity, "typeParam", "typeParam.id = parameter.idTypeParam")
            .select("parameter.id", "parameterId")
            .addSelect("typeParam.name", "parameterName")
            .addSelect("typeParam.unit", "unit")
            .addSelect("ROUND(AVG(measurement.value), 2)", "avgValue")
            .addSelect("MAX(measurement.value)", "maxValue")
            .addSelect("MIN(measurement.value)", "minValue")
            .addSelect("COUNT(measurement.id)", "count");

        this.applyFilters(qb, filters);

        qb.groupBy("parameter.id")
          .addGroupBy("typeParam.name")
          .addGroupBy("typeParam.unit");

        const result = await qb.getRawMany();
        
        return result.map(row => ({
            parameterId: Number(row.parameterId),
            parameterName: row.parameterName,
            unit: row.unit,
            avgValue: Number(row.avgValue),
            maxValue: Number(row.maxValue),
            minValue: Number(row.minValue),
            count: Number(row.count)
        }));
    }
}

export const dashboardService = new DashboardService();