import { AppDataSource } from "../data-source.js";
import { ParameterEntity } from "../entities/parameterEntity.js";
import type { StationEntity } from "../entities/stationEntity.js";

export interface CreateParameterInput {
    name: string;
    city: string;
    isActive?: boolean;
}

export class ParameterService {
    private readonly repository = AppDataSource.getRepository(ParameterEntity);

    async findAll(): Promise<ParameterEntity[]> {
        return this.repository.find({
            order: {
                id: "ASC",
            },
        });
    }

    async findById(id: number): Promise<ParameterEntity | null> {
        return this.repository.findOneBy({ id });
    }

    async create(data: CreateParameterInput): Promise<ParameterEntity> {
        const parameter = this.repository.create({
            name: data.name,
            city: data.city,
            isActive: data.isActive ?? true,
        });

        return this.repository.save(parameter);
    }
}

export const parameterService = new ParameterService();
