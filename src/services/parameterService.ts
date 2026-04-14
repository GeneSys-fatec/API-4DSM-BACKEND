import { AppDataSource } from "../data-source.js";
import { ParameterEntity } from "../entities/parameterEntity.js";
import { StationEntity } from "../entities/stationEntity.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
import { Brackets } from "typeorm";

export interface CreateParameterInput {
    idStation: number;
    idTypeParam: number;
    isActive?: boolean;
}

export interface ParameterListFilters {
    idStation?: number;
    idTypeParam?: number;
    q?: string;
    from?: Date;
    to?: Date;
}

export class ParameterService {
    private readonly repository = AppDataSource.getRepository(ParameterEntity);

    async findAll(filters: ParameterListFilters = {}): Promise<ParameterEntity[]> {
        const hasFilters = Boolean(
            filters.idStation ||
            filters.idTypeParam ||
            filters.q ||
            filters.from ||
            filters.to,
        );

        if (!hasFilters) {
            return this.repository.find({ order: { id: "ASC" } });
        }

        const queryBuilder = this.repository
            .createQueryBuilder("parameter")
            .orderBy("parameter.id", "ASC");

        if (filters.idStation) {
            queryBuilder.andWhere("parameter.idStation = :idStation", {
                idStation: filters.idStation,
            });
        }

        if (filters.idTypeParam) {
            queryBuilder.andWhere("parameter.idTypeParam = :idTypeParam", {
                idTypeParam: filters.idTypeParam,
            });
        }

        if (filters.q) {
            const term = `%${filters.q.trim().toLowerCase()}%`;
            queryBuilder
                .leftJoin(StationEntity, "station", "station.id = parameter.idStation")
                .leftJoin(parameterTypeEntity, "parameterType", "parameterType.id = parameter.idTypeParam");

            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where("CAST(parameter.id AS TEXT) LIKE :term", { term })
                        .orWhere("CAST(parameter.idStation AS TEXT) LIKE :term", { term })
                        .orWhere("CAST(parameter.idTypeParam AS TEXT) LIKE :term", { term })
                        .orWhere("LOWER(station.name) LIKE :term", { term })
                        .orWhere("LOWER(parameterType.name) LIKE :term", { term })
                        .orWhere("LOWER(parameterType.json_key) LIKE :term", { term });
                }),
            );
        }

        if (filters.from) {
            queryBuilder.andWhere("parameter.createdAt >= :from", {
                from: filters.from,
            });
        }

        if (filters.to) {
            queryBuilder.andWhere("parameter.createdAt <= :to", {
                to: filters.to,
            });
        }

        return queryBuilder.getMany();
    }

    async findById(id: number): Promise<ParameterEntity | null> {
        return this.repository.findOneBy({ id });
    }

    async findByStation(idStation: number, filters: Omit<ParameterListFilters, "idStation"> = {}): Promise<ParameterEntity[]> {
        return this.findAll({
            ...filters,
            idStation,
        });
    }

    async create(data: CreateParameterInput): Promise<ParameterEntity> {
        const parameter = this.repository.create({
            idStation: data.idStation,
            idTypeParam: data.idTypeParam,
        });

        return this.repository.save(parameter);
    }

    async update(id: number, data: Partial<CreateParameterInput>): Promise<ParameterEntity | null> {
        const parameter = await this.findById(id);
        if (!parameter) return null;
        Object.assign(parameter, data, { updatedBy: "system" });
		return this.repository.save(parameter);
    }

    async delete(id: number): Promise<boolean> {
        const parameter = await this.findById(id);
        if (!parameter) return false;
        await this.repository.remove(parameter);
		return true;
    }
}

export const parameterService = new ParameterService();